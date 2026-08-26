import axios from "axios";

import { withActor } from "./apiActor";

import {
    postLeaveRequest,
    leaveApprovalStatusCheck,
    getLeaveApprovalDashboard,
    updateLeaveApprovalAction,
    GetUserAttendanceLeaveSummary,
    getLeaveConfig,
    saveLeaveConfig,
    reportsLeaveManagement,
    reportsLeaveManagementFullReport,
    PostTeachersManualAttendance,
    GetTeachersAttendance,
    GetMyAttendanceStatus,
    GetTeachersAttendanceAudit,
    getStaffAttendanceOverview,
    GetAttendanceTeacherBefore,
    GetBiometricMappings,
    PostBiometricMappings,
    UpdateBiometricMappings,
    GetBiometricAttendanceLogs,
    RebuildFromRecords,
    SyncSummary,
} from "../../Api/Api";

/**
 * Leave & Attendance — api/leave, api/reports, api/teachersattendance, api/biometrics.
 *
 * Auth has two layers:
 *   1. `Authorization: Bearer 123` on every request. The gate runs BEFORE routing, so a
 *      missing header turns even a bad URL into a 401 rather than a 404. The 401 body is
 *      PLAIN TEXT, not JSON — see messageOf below.
 *   2. The actor's roll number in the body/query, resolved against `users`. Permission
 *      failures are 400 with a readable JSON message, never 403.
 *
 * 401 = bad or missing token. 400 = good token, wrong person.
 */
const API_TOKEN = "123";

/* withActor attaches requestedByRollNumber to every request — the permission layer the
   API gained on 25 Aug. See apiActor.js for why it goes on all of them. */
const client = withActor(
    axios.create({
        headers: { Authorization: `Bearer ${API_TOKEN}` },
    })
);

/* Three root-level routes don't sit under api/leave/ — they're imported already resolved. */

/* Errors are written to be shown to a user, but a 401 arrives as plain text and a
   validation failure as an RFC-9110 problem document, so unwrap all three shapes. */
const messageOf = (error, fallback) => {
    const data = error?.response?.data;
    if (error?.response?.status === 401) {
        return typeof data === "string" && data.trim()
            ? data.trim()
            : "Unauthorized access: invalid token.";
    }
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data?.message) return data.message;
    // ASP.NET model validation: { errors: { toDate: ["The toDate field is required."] } }
    const validation = data?.errors && Object.values(data.errors).flat().filter(Boolean);
    if (validation?.length) return validation.join(" ");
    return error?.message || fallback;
};

/* ─────────────── Dates ───────────────
   Dates out of the API are dd-MM-yyyy; dates in accept dd-MM-yyyy, yyyy-MM-dd or MM/dd/yyyy.
   The pickers hold yyyy-MM-dd, so convert on the way out and back on the way in. */

const pad = (value) => String(value).padStart(2, "0");

/* "2026-08-18" → "18-08-2026" */
export const toApiDate = (value) => {
    if (!value) return "";
    const [year, month, day] = String(value).split("-");
    if (!year || !month || !day) return value;
    return `${pad(day)}-${pad(month)}-${year}`;
};

/* "18-08-2026" → "2026-08-18" */
export const fromApiDate = (value) => {
    if (!value) return "";
    const [day, month, year] = String(value).split("-");
    if (!year || !month || !day) return value;
    return `${year}-${pad(month)}-${pad(day)}`;
};

/**
 * Normalises any date the app holds into ISO.
 *
 * Two routes are ISO-only and 400 on dd-MM-yyyy: GetBiometricAttendanceLogs and the
 * biometric SyncSummary. A third — GetTeachersAttendanceAudit — takes either, but
 * rejects anything else with "date must be in 'dd-MM-yyyy' or 'yyyy-MM-dd' format".
 *
 * The long-form branch matters because the reports API sends its daily-log dates as
 * display strings ("May 21, 2026"), and those rows link straight into the audit trail.
 * Local-time getters are used so the calendar day cannot shift across a timezone.
 */
export const toIsoDate = (value) => {
    if (!value) return "";
    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    if (/^\d{2}-\d{2}-\d{4}$/.test(text)) return fromApiDate(text);
    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
    }
    return text;
};

/**
 * One person's own attendance for a day — GET api/teachersattendance/GetMyAttendanceStatus.
 *
 * Replaces pulling the whole day's roster and filtering to self on the client. Durations
 * are minutes computed server-side, so every device agrees.
 *
 * Three behaviours worth knowing:
 *   - Only COMPLETED breaks count toward breakMinutes; a break still running would
 *     otherwise eat into net hours as it ran.
 *   - A stale open punch from an earlier day reports 0 worked minutes rather than counting
 *     days of elapsed time. Only today counts up.
 *   - This route answers 200 with error:true on failure, not a 4xx — check the flag.
 *
 * KNOWN BACKEND DEFECT (flagged by the backend team, unfixed as of 21 Aug 2026): "today" is
 * resolved with DateTime.Now rather than IstTimeHelper. The server runs in UTC, so between
 * 00:00 and 05:29 IST this returns YESTERDAY, and workedMinutes for an open punch compares
 * a UTC clock against an IST login time and reads 0. Do not present these figures as
 * authoritative for early-morning staff until that is fixed.
 */
export const fetchMyAttendanceStatus = async ({ rollNumber, date }) => {
    try {
        const params = { rollNumber };
        if (date) params.date = toApiDate(date);
        const res = await client.get(GetMyAttendanceStatus, { params });
        const data = res?.data ?? {};
        if (data.error) return { ok: false, message: data.message || "Could not load your attendance" };
        return {
            ok: true,
            rollNumber: String(data.rollNumber || rollNumber),
            name: data.name || "",
            date: data.date || "",
            // Present | Late | Absent | Half Day | On Leave | Not Marked
            status: data.status || "Not Marked",
            /* null when they have never punched. Rendered as an em dash rather than 0h 0m:
               zero reads as "worked nothing", a dash reads as "no data", which is the truth. */
            loginTime: data.loginTime || null,
            logoutTime: data.logoutTime || null,
            loginSource: data.loginSource || null,
            logoutSource: data.logoutSource || null,
            breakMinutes: data.breakMinutes ?? 0,
            workedMinutes: data.workedMinutes ?? 0,
            netMinutes: data.netMinutes ?? 0,
            // counting up to now — this is why the strip needs a poll
            isClockedIn: Boolean(data.isClockedIn),
            isOnApprovedLeave: Boolean(data.isOnApprovedLeave),
            // true = worked half the day, so the tiles stay meaningful
            approvedLeaveIsHalfDay: data.approvedLeaveIsHalfDay ?? null,
            breaks: data.breaks || [],
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load your attendance") };
    }
};

/* ─────────────── Same-day leave cut-off ───────────────

   An admin sets a clock time; a leave that STARTS TODAY must be submitted before it.
   Future-dated leave is never affected, and backdated ranges are deliberately left alone
   so admins can still record past absences.

   This rule is enforced on every postLeaveRequest. It lived in the deleted staffLeave
   controller and kept being enforced from leave_config while nothing could read or write
   it, so a UI that stored the value locally would disagree with the server silently. */

/**
 * GET api/leave/getLeaveConfig — no parameters, open to any authenticated caller.
 *
 * `sameDayApplyAllowedNow` is already computed against the server's IST clock. Use it to
 * disable today in a date picker rather than comparing times in the browser: staff devices
 * sit in other timezones and with skewed clocks, and the rule is judged in IST server-side.
 */
export const fetchLeaveConfig = async () => {
    try {
        const res = await client.get(getLeaveConfig);
        const data = res?.data ?? {};
        if (data.success === false) return { ok: false, message: data.message || "Could not load leave settings" };
        return {
            ok: true,
            message: data.message || "",
            // canonical 24-hour HH:mm; null when no cut-off is set
            cutoffTime: data.sameDayCutoffTime || "",
            cutoffDisplay: data.sameDayCutoffTimeDisplay || "",
            // the clock the rule is judged against — never use the browser's
            serverTimeIst: data.serverTimeIst || "",
            allowedNow: data.sameDayApplyAllowedNow !== false,
            updatedByRollNumber: data.updatedByRollNumber || "",
            updatedOn: data.updatedOn || "",
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load leave settings") };
    }
};

/**
 * POST api/leave/saveLeaveConfig — admin / superadmin only.
 *
 * Send a blank cutoffTime to CLEAR the rule; empty is the off switch, there is no separate
 * disable flag. Time must be 24-hour HH:mm or the server 400s with the format spelled out.
 * The response is the same shape as the GET, so the caller can rebind straight from it.
 */
export const saveLeaveSettings = async ({ rollNumber, userType, cutoffTime }) => {
    try {
        const res = await client.post(saveLeaveConfig, {
            RollNumber: rollNumber,
            UserType: userType,
            // "" clears the cut-off
            SameDayCutoffTime: cutoffTime || "",
        });
        const data = res?.data ?? {};
        if (data.success === false) return { ok: false, message: data.message || "Could not save leave settings" };
        return {
            ok: true,
            message: data.message || "Saved.",
            cutoffTime: data.sameDayCutoffTime || "",
            cutoffDisplay: data.sameDayCutoffTimeDisplay || "",
            serverTimeIst: data.serverTimeIst || "",
            allowedNow: data.sameDayApplyAllowedNow !== false,
            updatedByRollNumber: data.updatedByRollNumber || "",
            updatedOn: data.updatedOn || "",
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not save leave settings") };
    }
};

/* ─────────────── Leave ─────────────── */

/* "Loss of Pay" is a hardcoded name, not a row in LeaveType. Sent with NO LeaveTypeId,
   which makes the server skip FK resolution, balance enforcement and per-period caps. */
export const LOSS_OF_PAY = "Loss of Pay";

export const LEAVE_STATUS_FILTERS = ["pending", "approved", "rejected"];

/**
 * Apply — POST api/leave/postLeaveRequest.
 *
 * multipart/form-data, not JSON, because a supporting document may be attached.
 * Every field goes in as a form field even when there is no file.
 */
export const submitLeaveRequest = async ({
    forRollNumber,
    academicYear,
    leaveTypeId,
    leaveType,
    fromDate,
    toDate,
    reason,
    isHalfDay = false,
    contact = "",
    emergencyContact = "",
    remarks = "",
    file = null,
}) => {
    const form = new FormData();
    form.append("ForRollNumber", forRollNumber);
    form.append("AcademicYear", academicYear);
    form.append("LeaveType", leaveType);
    // Loss of Pay must go without an id, or the server tries to resolve the FK
    if (leaveType !== LOSS_OF_PAY && leaveTypeId) form.append("LeaveTypeId", leaveTypeId);
    form.append("FromDate", toApiDate(fromDate));
    form.append("ToDate", toApiDate(toDate));
    form.append("Reason", reason);
    // Half day is only valid on a single-date request
    form.append("IsHalfDay", String(Boolean(isHalfDay) && fromDate === toDate));
    form.append("Contact", contact);
    form.append("EmergencyContact", emergencyContact);
    form.append("Remarks", remarks);
    if (file) form.append("SupportingDocumentFile", file);

    try {
        const res = await client.post(postLeaveRequest, form);
        const data = res?.data;
        if (data?.success === false || data?.error) {
            return { ok: false, message: data.message || "Could not submit the request" };
        }
        return {
            ok: true,
            message: data?.message || "Leave request submitted",
            // workingDays is calendar days MINUS holidays, halved when half-day —
            // never derive the length from the date span
            workingDays: data?.workingDays ?? null,
            holidayDatesSkipped: data?.holidayDatesSkipped || [],
            salaryDeductDays: data?.salaryDeductDays ?? null,
            leaveApplicationId: data?.leaveApplicationId ?? null,
        };
    } catch (error) {
        // A type/id mismatch names the valid pairs for the year — hand them back so the
        // dropdown can be rebuilt from the error rather than guessed at
        const available = error?.response?.data?.availableLeaveTypes || null;
        return { ok: false, message: messageOf(error, "Could not submit the request"), availableLeaveTypes: available };
    }
};

/**
 * Approver queue — GET api/leave/getLeaveApprovalDashboard.
 *
 * With no `status` all three lists are filled; with one, only the matching list is.
 * `cards` always carries the full counts, so badges must come from cards, never
 * from array lengths.
 */
export const fetchApprovalDashboard = async ({ rollNumber, academicYear, status, month }) => {
    try {
        const params = { RollNumber: rollNumber, AcademicYear: academicYear };
        if (status) params.Status = status;
        /* Optional "YYYY-MM". Narrows BOTH the cards and the three lists; omit it for the
           whole academic year. An application counts toward a month when it OVERLAPS it,
           not only when it starts in it — so a leave running 30 Aug → 2 Sep appears in
           both months, deliberately. */
        if (month) params.Month = month;
        const res = await client.get(getLeaveApprovalDashboard, { params });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load the queue" };
        const data = res?.data || {};
        return {
            ok: true,
            // totalCount added 21 Aug — the card behind it had nothing to bind to before
            cards: data.cards || { totalCount: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 },
            pending: data.pending || [],
            approved: data.approved || [],
            rejected: data.rejected || [],
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load the queue") };
    }
};

/* One person's own applications — GET api/leaveApprovalStatusCheck (root level) */
export const fetchMyLeaveStatus = async ({ rollNumber, academicYear }) => {
    try {
        const res = await client.get(leaveApprovalStatusCheck, {
            params: { AcademicYear: academicYear, RollNumber: rollNumber },
        });
        const data = res?.data || {};
        if (data.success === false && !Array.isArray(data.leaves)) {
            return { ok: false, message: data.message || "Could not load your requests" };
        }
        // Items carry forUser / createdBy / approvedBy already formatted roll-name-usertype
        return { ok: true, leaves: data.leaves || [], message: data.message };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load your requests") };
    }
};

/* Accept / decline — PUT api/updateLeaveApprovalAction (root level).
   Approver must be admin or superadmin; a decline requires a reason. */
export const updateLeaveAction = async ({ leaveApplicationId, rollNumber, action, reason = "", academicYear }) => {
    if (action === "decline" && !String(reason).trim()) {
        return { ok: false, message: "A reason is required when declining." };
    }
    try {
        const res = await client.put(updateLeaveApprovalAction, {
            leaveApplicationId,
            RollNumber: rollNumber,
            Action: action,
            Reason: reason,
            AcademicYear: academicYear,
        });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not update the request" };
        return {
            ok: true,
            message: res?.data?.message || `Leave ${res?.data?.status || "updated"}`,
            status: res?.data?.status || null,
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not update the request") };
    }
};

/**
 * Attendance and leave side by side — GET api/leave/GetUserAttendanceLeaveSummary.
 *
 * FromDate / ToDate are both required; omitting them is a 400 listing them by name.
 * This route answers with `success` rather than the `error` flag the rest of the
 * module uses, and an unknown roll number is a 400 `{ success: false, message }`.
 */
export const fetchAttendanceLeaveSummary = async ({ rollNumber, academicYear, fromDate, toDate }) => {
    try {
        const res = await client.get(GetUserAttendanceLeaveSummary, {
            params: {
                RollNumber: rollNumber,
                AcademicYear: academicYear,
                FromDate: toApiDate(fromDate),
                ToDate: toApiDate(toDate),
            },
        });
        const data = res?.data ?? {};
        if (data.error || data.success === false) {
            return { ok: false, message: data.message || "Could not load the summary" };
        }
        return {
            ok: true,
            rollNumber: data.rollNumber || rollNumber,
            name: data.name || "",
            fromDate: data.fromDate || "",
            toDate: data.toDate || "",
            attendance: {
                totalWorkingDays: data.attendanceSummary?.totalWorkingDays ?? 0,
                present: data.attendanceSummary?.present ?? 0,
                absent: data.attendanceSummary?.absent ?? 0,
                late: data.attendanceSummary?.late ?? 0,
                leave: data.attendanceSummary?.leave ?? 0,
            },
            leave: {
                totalLeaveTaken: data.leaveSummary?.totalLeaveTaken ?? 0,
                approvedLeave: data.leaveSummary?.approvedLeave ?? 0,
                pendingLeave: data.leaveSummary?.pendingLeave ?? 0,
                rejectedLeave: data.leaveSummary?.rejectedLeave ?? 0,
            },
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load the summary") };
    }
};

/* ─────────────── Staff attendance ─────────────── */

/* The four statuses a manual entry can set */
export const ATTENDANCE_STATUS_TO_API = {
    Present: "present",
    Late: "late",
    Absent: "absent",
    "On Leave": "on_leave",
};
export const API_TO_ATTENDANCE_STATUS = {
    present: "Present",
    late: "Late",
    absent: "Absent",
    on_leave: "On Leave",
    onleave: "On Leave",
    onduty: "On Duty",
    halfday: "Half Day",
    weekend: "Weekend",
    unmarked: "Unmarked",
};

/* Time inputs give "08:02"; the API wants "08:02:00" */
const toApiTime = (value) => {
    if (!value) return null;
    const parts = String(value).split(":");
    return parts.length === 2 ? `${value}:00` : value;
};

/* "08:02:00" → "08:02" for the pickers */
export const fromApiTime = (value) => (value ? String(value).slice(0, 5) : "");

/**
 * Mark a day for many staff at once — POST api/teachersattendance/PostTeachersManualAttendance.
 *
 * Rules the caller doesn't have to remember:
 *  - Omit `Status` to edit only a time; the existing status is then left alone.
 *  - Breaks upsert by (RollNumber, Date, BreakNo). An EMPTY Breaks list preserves
 *    existing breaks — it does not clear them — so it is omitted entirely when empty.
 *  - `EmployeeId` is only sent when present, and must belong to that same roll number.
 *  - Times must read forward: login ≤ breakOut ≤ breakIn ≤ logout, or the whole batch
 *    is rejected and nothing is saved.
 */
export const postManualAttendance = async ({ editorRollNumber, date, academicYear, reason = "", items }) => {
    const payload = {
        EditorRollNumber: editorRollNumber,
        Date: toApiDate(date),
        AcademicYear: academicYear,
        Reason: reason,
        Items: items.map((item) => {
            const row = { RollNumber: item.rollNumber };
            if (item.employeeId) row.EmployeeId = item.employeeId;
            // A blank status means "leave the existing one alone"
            if (item.status) row.Status = ATTENDANCE_STATUS_TO_API[item.status] || item.status;
            if (item.loginTime) row.LoginTime = toApiTime(item.loginTime);
            if (item.logoutTime) row.LogoutTime = toApiTime(item.logoutTime);
            const breaks = (item.breaks || []).filter((b) => b.out || b.in);
            if (breaks.length) {
                row.Breaks = breaks.map((b, index) => ({
                    BreakNo: b.breakNo ?? index + 1,
                    BreakOutTime: toApiTime(b.out),
                    BreakInTime: toApiTime(b.in),
                }));
            }
            return row;
        }),
    };

    try {
        const res = await client.post(PostTeachersManualAttendance, payload);
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not save attendance" };
        const data = res?.data || {};
        return {
            ok: true,
            message: data.message || `${data.saved ?? 0} of ${data.totalReceived ?? 0} saved`,
            totalReceived: data.totalReceived ?? 0,
            saved: data.saved ?? 0,
            skipped: data.skipped ?? 0,
            // Per-item, so a partial UI update is possible
            results: data.results || [],
        };
    } catch (error) {
        // Two hard blocks arrive here: unassigned shift, and a payroll-locked month.
        // Both name the fix in `message`, so it is surfaced verbatim.
        return { ok: false, message: messageOf(error, "Could not save attendance") };
    }
};

/**
 * One day row → the shape the attendance tables render.
 *
 * Field names are read defensively: the endpoint had no data to inspect when this was
 * written, and the sibling roster route returns camelCase where the doc shows Pascal.
 * `source` is derived server-side from the audit trail and is null on legacy rows.
 */
export const attendanceRowFromApi = (row, index) => {
    const pick = (...keys) => keys.map((k) => row[k]).find((v) => v !== undefined && v !== null && v !== "");
    const status = String(pick("status", "Status") || "").toLowerCase();
    return {
        id: pick("id", "Id") ?? index + 1,
        rollNumber: String(pick("rollNumber", "RollNumber") || ""),
        name: pick("name", "Name") || "",
        role: pick("category", "Category", "userType", "UserType") || "",
        employeeId: pick("employeeId", "EmployeeId", "biometricId", "BiometricId") || "",
        date: pick("date", "Date") || "",
        checkIn: fromApiTime(pick("loginTime", "LoginTime")),
        checkOut: fromApiTime(pick("logoutTime", "LogoutTime")),
        // "biometric" | "manual" | null on legacy rows with no audit history
        source: pick("source", "Source") || null,
        status: API_TO_ATTENDANCE_STATUS[status] || (status ? status : "Unmarked"),
        breaks: (pick("breaks", "Breaks") || []).map((b, i) => ({
            breakNo: b.breakNo ?? b.BreakNo ?? i + 1,
            out: fromApiTime(b.breakOutTime ?? b.BreakOutTime),
            in: fromApiTime(b.breakInTime ?? b.BreakInTime),
        })),
    };
};

/* Day rows with breaks, punch source and an on_leave overlay —
   GET api/teachersattendance/GetTeachersAttendance */
export const fetchTeachersAttendance = async ({ academicYear, fromDate, toDate }) => {
    try {
        const res = await client.get(GetTeachersAttendance, {
            params: { academicYear, fromDate: toApiDate(fromDate), toDate: toApiDate(toDate) },
        });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load attendance" };
        const data = res?.data ?? {};
        const rows = data.data ?? data.details ?? data.Details ?? data.items ?? [];
        return {
            ok: true,
            rows: Array.isArray(rows) ? rows.map(attendanceRowFromApi) : [],
            raw: data,
        };
    } catch (error) {
        if (error?.response?.status === 404) return { ok: true, rows: [], raw: null };
        return { ok: false, message: messageOf(error, "Could not load attendance") };
    }
};

/**
 * The change trail for one person-day — GET GetTeachersAttendanceAudit.
 *
 * A day with no recorded change answers 404 "No attendance audit events found for this
 * employee on this date." That is an empty result, not a failure, so it resolves to an
 * empty list. The route accepts either date format; ISO is sent to match the collection.
 *
 * The live table held no audit rows when this was written, so each event is normalised
 * across the plausible field names rather than one fixed shape, and anything unmapped is
 * carried through in `extra` so the dialog can still show it.
 */
const AUDIT_KNOWN_KEYS = new Set([
    "id", "auditid", "rollnumber", "employeeid", "biometricid", "date", "attendancedate",
    "field", "fieldname", "column", "columnname", "changedfield",
    "oldvalue", "previousvalue", "fromvalue", "newvalue", "currentvalue", "tovalue",
    "changedby", "editorrollnumber", "updatedby", "createdby", "changedbyname", "editorname",
    "changedon", "changedat", "updatedon", "createdon", "timestamp", "actiondatetime",
    "reason", "remarks", "note", "source", "action", "actiontype", "changetype",
]);

export const auditEntryFromApi = (row = {}, index = 0) => {
    const pick = (...keys) => keys.map((k) => row[k]).find((v) => v !== undefined && v !== null && v !== "");
    const extra = Object.entries(row)
        .filter(([k, v]) => !AUDIT_KNOWN_KEYS.has(k.toLowerCase()) && v !== null && v !== "" && typeof v !== "object")
        .map(([k, v]) => ({ key: k, value: String(v) }));
    return {
        id: pick("id", "Id", "auditId", "AuditId") ?? index + 1,
        rollNumber: String(pick("rollNumber", "RollNumber") || ""),
        employeeId: pick("employeeId", "EmployeeId", "biometricId", "BiometricId") || "",
        date: pick("date", "Date", "attendanceDate", "AttendanceDate") || "",
        field: pick("field", "Field", "fieldName", "FieldName", "column", "Column", "columnName", "ColumnName", "changedField", "ChangedField") || "",
        oldValue: pick("oldValue", "OldValue", "previousValue", "PreviousValue", "fromValue", "FromValue") ?? "",
        newValue: pick("newValue", "NewValue", "currentValue", "CurrentValue", "toValue", "ToValue") ?? "",
        changedBy: pick("changedByName", "ChangedByName", "editorName", "EditorName", "changedBy", "ChangedBy", "editorRollNumber", "EditorRollNumber", "updatedBy", "UpdatedBy", "createdBy", "CreatedBy") || "",
        changedOn: pick("changedOn", "ChangedOn", "changedAt", "ChangedAt", "updatedOn", "UpdatedOn", "createdOn", "CreatedOn", "timestamp", "Timestamp", "actionDateTime", "ActionDateTime") || "",
        action: pick("action", "Action", "actionType", "ActionType", "changeType", "ChangeType") || "",
        source: pick("source", "Source") || "",
        reason: pick("reason", "Reason", "remarks", "Remarks", "note", "Note") || "",
        extra,
    };
};

export const fetchAttendanceAudit = async ({ rollNumber, date }) => {
    try {
        const res = await client.get(GetTeachersAttendanceAudit, {
            params: { rollNumber, date: toIsoDate(date) },
        });
        const data = res?.data ?? {};
        if (data.error) return { ok: false, message: data.message || "Could not load the audit trail" };
        const rows =
            data.events ?? data.Events ?? data.audit ?? data.Audit ?? data.auditEvents ??
            data.data ?? data.details ?? data.Details ?? data.items ?? (Array.isArray(data) ? data : []);
        return {
            ok: true,
            entries: Array.isArray(rows) ? rows.map(auditEntryFromApi) : [],
            message: data.message || "",
        };
    } catch (error) {
        // 404 here means "nothing was ever changed on this day", which is a normal result
        if (error?.response?.status === 404) {
            return { ok: true, entries: [], message: error?.response?.data?.message || "" };
        }
        return { ok: false, message: messageOf(error, "Could not load the audit trail") };
    }
};

/**
 * The month matrix — GET api/teachersattendance/GetStaffAttendanceOverview.
 *
 * `details[].days` is positionally aligned to `dateHeaders`: one cell per header in
 * order. Render off dateHeaders and index into days; never re-sort either list.
 */
export const fetchAttendanceOverview = async ({ academicYear, fromDate, toDate, userType, category }) => {
    try {
        const params = {
            AcademicYear: academicYear,
            FromDate: toApiDate(fromDate),
            ToDate: toApiDate(toDate),
        };
        if (userType) params.UserType = userType;
        if (category) params.Category = category;
        const res = await client.get(getStaffAttendanceOverview, { params });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load the overview" };
        const data = res?.data || {};
        return {
            ok: true,
            cards: data.cards || { totalPresent: 0, totalLate: 0, totalLeave: 0, totalAbsent: 0 },
            dateHeaders: data.dateHeaders || [],
            details: data.details || [],
            totalDays: data.totalDays ?? 0,
            staffCount: data.staffCount ?? 0,
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load the overview") };
    }
};

/* The roster to mark against — GET api/teachersattendance/GetAttendanceTeacherBefore.
   AcademicYear and UserType are BOTH mandatory. `Status` and `DateTime` come back blank
   by design: this is a roster, not a status read. */
export const fetchAttendanceRoster = async ({ academicYear, userType, biometricId }) => {
    try {
        const params = { AcademicYear: academicYear, UserType: userType };
        if (biometricId) params.BiometricId = biometricId;
        const res = await client.get(GetAttendanceTeacherBefore, { params });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load the roster" };
        return { ok: true, staff: res?.data?.Details || res?.data?.details || [] };
    } catch (error) {
        if (error?.response?.status === 404) return { ok: true, staff: [] };
        return { ok: false, message: messageOf(error, "Could not load the roster") };
    }
};

/* ─────────────── Biometrics ───────────────
   Only relevant where a device is installed — manual attendance works on roll number
   alone. A separate push app writes raw punches into staff_attendance_logs; this API
   only ever reads that table. */

/* One mapping row → the shape the mapping page renders */
export const biometricMappingFromApi = (item) => ({
    rollNumber: String(item.rollNumber ?? ""),
    name: item.name || "",
    userType: item.userType || "",
    biometricId: item.biometricEmployeeId ?? "",
    // "Mapped" | "Unmapped", decided server-side
    status: item.status || (item.biometricEmployeeId ? "Mapped" : "Unmapped"),
    createdOn: item.createdOn || null,
});

export const fetchBiometricMappings = async (academicYear) => {
    try {
        const res = await client.get(GetBiometricMappings, { params: { academicYear } });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load mappings" };
        const data = res?.data?.data || {};
        return {
            ok: true,
            items: (data.items || []).map(biometricMappingFromApi),
            // { totalStaff, mapped, unmapped } — use rather than counting client-side
            summary: data.summary || null,
        };
    } catch (error) {
        if (error?.response?.status === 404) return { ok: true, items: [], summary: null };
        return { ok: false, message: messageOf(error, "Could not load mappings") };
    }
};

/**
 * Enrol or re-map staff against device ids — bulk.
 *
 * `isUpdate` picks PUT over POST: POST enrols rows that have no mapping yet, PUT
 * re-maps existing ones. Both return a per-item result block plus a summary, so a
 * partial failure can be reported row by row rather than as one blanket error.
 */
export const saveBiometricMappings = async ({ academicYear, rollNumber, items, isUpdate = false }) => {
    const payload = {
        academicYear,
        updatedByRollNumber: rollNumber,
        items: items.map((item) => ({
            rollNumber: item.rollNumber,
            userType: item.userType,
            biometricEmployeeId: String(item.biometricId ?? ""),
        })),
    };
    try {
        const res = isUpdate
            ? await client.put(UpdateBiometricMappings, payload)
            : await client.post(PostBiometricMappings, payload);
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not save mappings" };
        const data = res?.data?.data ?? res?.data ?? {};
        const results = data.items || data.results || [];
        const failed = results.filter((row) => row.success === false || row.ok === false || row.error);
        return {
            ok: true,
            message: res?.data?.message || `${items.length} mapping(s) saved`,
            results,
            failed,
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not save mappings") };
    }
};

/**
 * The raw punch feed straight from the device — GET GetBiometricAttendanceLogs.
 *
 * ISO dates only. dd-MM-yyyy is rejected with a 400 model-binding error here, unlike the
 * attendance and report routes which take either, so dates are normalised on the way out.
 * An empty window answers 404 "No data found for the given filters", which is a normal
 * empty result rather than a failure.
 *
 * `staff_attendance_logs` was empty on every window sampled while this was written, so
 * rows are normalised across the plausible field names and unmapped scalars are carried
 * through in `extra` rather than being dropped.
 */
const LOG_KNOWN_KEYS = new Set([
    "id", "logid", "rollnumber", "employeeid", "biometricid", "empid", "name", "employeename",
    "staffname", "usertype", "category", "punchtime", "logdatetime", "datetime", "logtime",
    "punchdatetime", "attendancedatetime", "date", "logdate", "attendancedate", "time",
    "direction", "punchtype", "inout", "iotype", "type", "mode", "verifymode",
    "deviceid", "devicename", "device", "serialnumber", "machineid", "location",
]);

export const biometricLogFromApi = (row = {}, index = 0) => {
    const pick = (...keys) => keys.map((k) => row[k]).find((v) => v !== undefined && v !== null && v !== "");
    const extra = Object.entries(row)
        .filter(([k, v]) => !LOG_KNOWN_KEYS.has(k.toLowerCase()) && v !== null && v !== "" && typeof v !== "object")
        .map(([k, v]) => ({ key: k, value: String(v) }));
    return {
        id: pick("id", "Id", "logId", "LogId") ?? index + 1,
        employeeId: String(pick("employeeId", "EmployeeId", "biometricId", "BiometricId", "empId", "EmpId") || ""),
        rollNumber: String(pick("rollNumber", "RollNumber") || ""),
        name: pick("name", "Name", "employeeName", "EmployeeName", "staffName", "StaffName") || "",
        userType: pick("userType", "UserType", "category", "Category") || "",
        punchTime: pick("eventTime", "EventTime", "punchTime", "PunchTime", "logDateTime", "LogDateTime", "punchDateTime", "PunchDateTime", "attendanceDateTime", "AttendanceDateTime", "dateTime", "DateTime", "logTime", "LogTime", "time", "Time") || "",
        date: pick("date", "Date", "logDate", "LogDate", "attendanceDate", "AttendanceDate") || "",
        // the device's own in/out marker
        direction: pick("attendanceStatus", "AttendanceStatus", "direction", "Direction", "punchType", "PunchType", "inOut", "InOut", "ioType", "IOType", "type", "Type", "mode", "Mode", "verifyMode", "VerifyMode") || "",
        device: pick("deviceName", "DeviceName", "deviceId", "DeviceId", "device", "Device", "machineId", "MachineId", "location", "Location") || "",
        // kept for reference; it is a per-punch counter, NOT a device id
        serialNo: pick("serialNo", "SerialNo", "serialNumber", "SerialNumber") || "",
        // null rollNumber = the punch belongs to an UNENROLLED device id
        staffName: pick("staffName", "StaffName") || "",
        extra,
    };
};

export const fetchBiometricLogs = async ({ fromDate, toDate }) => {
    try {
        const res = await client.get(GetBiometricAttendanceLogs, {
            params: { fromDate: toIsoDate(fromDate), toDate: toIsoDate(toDate) },
        });
        const body = res?.data ?? {};
        if (body.error) return { ok: false, message: body.message || "Could not load punch logs" };
        const data = body.data ?? body;
        const rows =
            data.logs ?? data.Logs ?? data.items ?? data.Items ?? data.details ?? data.Details ??
            data.records ?? (Array.isArray(data) ? data : []);
        return {
            ok: true,
            logs: Array.isArray(rows) ? rows.map(biometricLogFromApi) : [],
            message: body.message || "",
        };
    } catch (error) {
        if (error?.response?.status === 404) {
            return { ok: true, logs: [], message: error?.response?.data?.message || "" };
        }
        return { ok: false, message: messageOf(error, "Could not load punch logs") };
    }
};

/**
 * Recompute daily attendance from the raw punch feed.
 *
 * Safe to offer without a scary confirmation: every daily row carries
 * LoginTimeManualOverride / LogoutTimeManualOverride / StatusManualOverride, so a
 * rebuild leaves hand-corrected values alone.
 */
export const rebuildFromRecords = async (items) => {
    try {
        const res = await client.post(RebuildFromRecords, { items });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not rebuild attendance" };
        return { ok: true, message: res?.data?.message || "Attendance rebuilt from device records" };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not rebuild attendance") };
    }
};

/* Row counts confirming device data reached the cloud. Defaults to today (IST) when
   no dates are given — use it for a "synced ✓ / N rows today" indicator. */
export const fetchSyncSummary = async ({ fromDate, toDate } = {}) => {
    try {
        const params = {};
        if (fromDate) params.fromDate = toIsoDate(fromDate);
        if (toDate) params.toDate = toIsoDate(toDate);
        const res = await client.get(SyncSummary, { params });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not read the sync summary" };
        const data = res?.data || {};
        return {
            ok: true,
            fromDate: data.fromDate,
            toDate: data.toDate,
            cloudLogsCount: data.cloudLogsCount ?? 0,
            cloudDailyCount: data.cloudDailyCount ?? 0,
            uniqueEmployees: data.uniqueEmployees ?? 0,
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not read the sync summary") };
    }
};

/* ─────────────── Reports ─────────────── */

/* The four values the API's Category filter accepts, with the label each gets on screen */
export const REPORT_CATEGORIES = [
    { value: "All", label: "All Categories" },
    { value: "teaching", label: "Teaching" },
    { value: "nonteaching", label: "Non Teaching" },
    { value: "supporting", label: "Supporting" },
];

/* AttendanceStatus narrows the summary rows to people who have at least one such day.
   Blank means no filter. */
export const REPORT_ATTENDANCE_STATUSES = [
    { value: "", label: "All Status" },
    { value: "present", label: "Present" },
    { value: "late", label: "Late" },
    { value: "absent", label: "Absent" },
    { value: "leave", label: "On Leave" },
    // Added 21 Aug: days from today onwards no longer fall through to "absent"
    { value: "notmarked", label: "Not Marked" },
];

/**
 * The register — GET api/reports/reportsLeaveManagement.
 *
 * FromDate / ToDate are mandatory. Category is teaching | nonteaching | supporting | All
 * (blank behaves as All). Returns range cards plus one summary row per staff member.
 */
export const fetchLeaveReport = async ({
    fromDate,
    toDate,
    category = "All",
    attendanceStatus = "",
    academicYear = "",
}) => {
    try {
        const params = { FromDate: toApiDate(fromDate), ToDate: toApiDate(toDate), Category: category || "All" };
        if (attendanceStatus) params.AttendanceStatus = attendanceStatus;
        /* Optional. When sent, the server CLAMPS the range into that year's window and
           says so via clampedToAcademicYear — surface that, or "Last 30 Days" near a year
           boundary silently returns fewer days than asked for. */
        if (academicYear) params.AcademicYear = academicYear;
        const res = await client.get(reportsLeaveManagement, { params });
        const data = res?.data ?? {};
        if (data.error) return { ok: false, message: data.message || "Could not load the report" };
        return {
            ok: true,
            message: data.message || "",
            fromDate: data.fromDate || "",
            toDate: data.toDate || "",
            academicYear: data.academicYear || "",
            // true = the requested range reached outside the year and was trimmed
            clampedToAcademicYear: Boolean(data.clampedToAcademicYear),
            /* Per the WORKING CALENDAR, not the calendar span. Before 21 Aug both reports
               assumed Mon–Fri and ignored the calendar entirely, so a working Saturday was
               dropped from the denominator and a declared holiday was counted as an
               absence for every staff member. */
            workingDays: data.workingDays ?? 0,
            holidayDays: data.holidayDays ?? 0,
            // working days that are actually over — today counts as unfinished
            elapsedWorkingDays: data.elapsedWorkingDays ?? 0,
            upcomingDays: data.upcomingDays ?? 0,
            cards: {
                totalStaff: data.cards?.totalStaff ?? 0,
                presentDays: data.cards?.presentDays ?? 0,
                lateArrivals: data.cards?.lateArrivals ?? 0,
                absentDays: data.cards?.absentDays ?? 0,
                leaveDays: data.cards?.leaveDays ?? 0,
                notMarkedDays: data.cards?.notMarkedDays ?? 0,
            },
            summary: (data.summary || []).map((row, index) => ({
                sNo: row.sNo ?? index + 1,
                staffMember: row.staffMember || "",
                rollNumber: String(row.rollNumber || ""),
                // null on everyone without a device enrolment
                biometricId: row.biometricId ?? null,
                category: row.category || "",
                workingDays: row.workingDays ?? 0,
                present: row.present ?? 0,
                late: row.late ?? 0,
                absent: row.absent ?? 0,
                leave: row.leave ?? 0,
                // today or later with no record yet — NOT an absence
                notMarked: row.notMarked ?? 0,
                // workingDays - notMarked; the denominator the percentage actually uses
                scoredDays: row.scoredDays ?? 0,
                /* (present + late) / scoredDays. If this is ever recomputed client-side,
                   use scoredDays — dividing by workingDays disagrees with the server. */
                attendancePercent: row.attendancePercent ?? 0,
                // The API sends the literal string "View" — it is a link label, not a URL
                fullReport: row.fullReport || "",
            })),
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load the report") };
    }
};

/**
 * One person in detail — GET api/reports/reportsLeaveManagementFullReport.
 *
 * Adds a `calendar` block (one cell per working day) and a `dailyLog` (one row per day)
 * on top of the same counts the register shows. An unknown roll number still answers
 * HTTP 200, with `error: true` and zeroed counts, so the flag is what decides here.
 */
export const fetchLeaveFullReport = async ({ rollNumber, fromDate, toDate }) => {
    try {
        const res = await client.get(reportsLeaveManagementFullReport, {
            params: { RollNumber: rollNumber, FromDate: toApiDate(fromDate), ToDate: toApiDate(toDate) },
        });
        const data = res?.data ?? {};
        if (data.error) return { ok: false, message: data.message || "Could not load the report" };
        return {
            ok: true,
            message: data.message || "",
            rollNumber: String(data.rollNumber || rollNumber),
            biometricId: data.biometricId ?? null,
            name: data.name || "",
            department: data.department || "",
            category: data.category || "",
            reportFromDate: data.reportFromDate || "",
            reportToDate: data.reportToDate || "",
            attendancePercent: data.attendancePercent ?? 0,
            workingDays: data.workingDays ?? 0,
            holidayDays: data.holidayDays ?? 0,
            elapsedWorkingDays: data.elapsedWorkingDays ?? 0,
            upcomingDays: data.upcomingDays ?? 0,
            present: data.present ?? 0,
            late: data.late ?? 0,
            absent: data.absent ?? 0,
            leave: data.leave ?? 0,
            notMarked: data.notMarked ?? 0,
            scoredDays: data.scoredDays ?? 0,
            /* Now covers EVERY date in the range, not just Mon–Fri. Holidays used to be
               missing from the grid entirely and a working Saturday showed as an absence. */
            calendar: (data.calendar || []).map((cell) => ({
                dayNumber: String(cell.dayNumber ?? ""),
                dayName: cell.dayName || "",
                date: cell.date || "",
                // working | holiday | mandatory
                dayType: String(cell.dayType || "").toLowerCase(),
                // present | late | absent | leave | holiday | notmarked
                status: String(cell.status || "").toLowerCase(),
            })),
            dailyLog: (data.dailyLog || []).map((row) => ({
                date: row.date || "",
                day: row.day || "",
                dayType: String(row.dayType || "").toLowerCase(),
                status: row.status || "",
                /* "-" covers two different situations: no attendance row at all (both
                   times "-"), or clocked in but not out yet (login set, logout "-").
                   Nothing is inferred to fill a missing logout — guessing one would
                   invent hours nobody worked. */
                loginTime: row.loginTime || "",
                logoutTime: row.logoutTime || "",
            })),
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load the report") };
    }
};

export { messageOf, client };
