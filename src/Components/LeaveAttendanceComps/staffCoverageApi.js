import axios from "axios";

import { withActor, currentRollNumber } from "./apiActor";
import {
    getLeaveApprovalSettings,
    getPayrollCoverage,
    savePayrollCoverage,
} from "../../Api/Api";

/**
 * Payroll & Attendance coverage — who counts as an employee.
 *
 * WHY IT EXISTS
 * Payroll treats every non-student user as an employee: salaryStructureDashboard reports
 * 165, exactly Super Admin (1) + Admin (5) + Teacher (112) + Staff (47). That sweeps in
 * people who are never paid through the system and never mark attendance — a
 * correspondent, a trustee. Excluding them keeps the login they still sign in with and
 * takes them out of payroll, attendance, bank details and the salary register.
 *
 * ONE CALL, NOT TWO
 * getPayrollCoverage returns the roster AND its coverage state together, with the counts
 * already totalled server-side, so there is no separate roster read to keep in step.
 */

const API_TOKEN = "123";

const client = withActor(axios.create({ headers: { Authorization: `Bearer ${API_TOKEN}` } }));

const messageOf = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data?.message) return data.message;
    return error?.message || fallback;
};

/* What being excluded actually turns off. Shown on the screen so the person making the
   call sees the consequences before saving. */
export const EXCLUSION_EFFECTS = [
    "Payroll runs and salary structures",
    "Attendance marking and login times",
    "Bank details and salary register",
    "Statutory compliance (PF, ESI, PT, TDS)",
];

/* One row → the shape the table renders. `excludedOn` / `excludedByRollNumber` are the
   server's audit trail, read-only here. */
export const coverageRowFromApi = (row = {}) => ({
    rollNumber: String(row.rollNumber ?? ""),
    name: row.name || "",
    role: row.role || "",
    included: row.isExcluded !== true,
    reason: row.reason || "",
    excludedOn: row.excludedOn || null,
    excludedByRollNumber: row.excludedByRollNumber || null,
});

/**
 * The whole roster with its coverage state.
 * → { ok, rows, roles, counts: { total, included, excluded } }
 */
export const fetchCoverage = async () => {
    try {
        const res = await client.get(getPayrollCoverage);
        if (res?.data?.error) {
            return { ok: false, message: res.data.message || "Could not load coverage" };
        }
        const body = res?.data ?? {};
        const rows = (Array.isArray(body.data) ? body.data : []).map(coverageRowFromApi);
        return {
            ok: true,
            rows,
            roles: [...new Set(rows.map((r) => r.role).filter(Boolean))].sort(),
            /* Totals come from the response, never from array length — they must stay right
               once the list is filtered. */
            counts: {
                total: body.totalCount ?? rows.length,
                included: body.includedCount ?? rows.filter((r) => r.included).length,
                excluded: body.excludedCount ?? rows.filter((r) => !r.included).length,
            },
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load coverage") };
    }
};

/**
 * Persist the edits.
 *
 * `changes` carries only the rows whose coverage actually moved, in either direction —
 * re-including someone is `isExcluded: false`, which is why the API takes a change list
 * rather than a list of the excluded.
 */
export const saveCoverage = async ({ changes }) => {
    if (!changes.length) return { ok: true, message: "Nothing to save", saved: 0 };
    try {
        const res = await client.post(savePayrollCoverage, {
            savedByRollNumber: currentRollNumber(),
            changes: changes.map((item) => ({
                rollNumber: item.rollNumber,
                isExcluded: !item.included,
                reason: item.included ? "" : (item.reason || "").trim(),
            })),
        });
        if (res?.data?.error) {
            return { ok: false, message: res.data.message || "Could not save coverage" };
        }
        return {
            ok: true,
            message: res?.data?.message || `Coverage updated for ${changes.length} staff`,
            saved: changes.length,
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not save coverage") };
    }
};

/* ─────────────── Who may open this screen ───────────────

   Two gates, in this order:
     1. the user's own payrollcoverage.view permission — the hard gate;
     2. the staff leave approver list — the narrowing rule.

   Order matters. leaveApprovalSettings/Get is itself gated on
   leaveandattendanceleavemanagement.view, so when that submenu loses `view` the settings
   answer 403 and the approver list becomes unreadable. Hiding Coverage on that basis took
   the screen away from a Super Admin holding payrollcoverage view/edit, so an unreadable
   list falls back to the permission (reported as `degraded`) rather than denying. */

export const COVERAGE_MAIN_MENU = "leaveandpayroll";
export const COVERAGE_SUB_MENU = "payrollcoverage";
export const STAFF_LEAVE_CATEGORY = "Staff";

/* userTypeIDs marked isSelected for one leave category. */
export const approverTypeIdsFor = (data, category = STAFF_LEAVE_CATEGORY) => {
    const categories = data?.categories || data?.data?.categories || [];
    const match = categories.find(
        (item) => String(item.leaveCategory || "").toLowerCase() === String(category).toLowerCase(),
    );
    if (!match) return [];
    return (match.userTypes || [])
        .filter((type) => type.isSelected === true)
        .map((type) => Number(type.userTypeID))
        .filter((id) => Number.isFinite(id));
};

export const fetchLeaveApprovalSettings = async () => {
    try {
        const res = await client.get(getLeaveApprovalSettings);
        if (res?.data?.error) {
            return { ok: false, message: res.data.message || "Could not read the approval settings" };
        }
        return { ok: true, data: res?.data?.data ?? res?.data ?? {} };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not read the approval settings") };
    }
};

/**
 * → { state: "allowed" | "denied" | "unavailable", allowedTypes, message, degraded }
 *
 * Only an explicit "N" refuses. An ABSENT permission means the signed-in session predates
 * the payrollcoverage submenu — permissions are persisted from login and not refetched —
 * and reading "not in my payload" as "denied" locks out a user who holds the right.
 */
export const resolveCoverageAccess = async (userTypeID, { coverageView, payrollEdit } = {}) => {
    if (coverageView === "N") {
        return { state: "denied", allowedTypes: [], message: "", degraded: false };
    }

    const entitled = coverageView === "Y" || payrollEdit === true;

    const result = await fetchLeaveApprovalSettings();
    if (!result.ok) {
        return entitled
            ? { state: "allowed", allowedTypes: [], message: "", degraded: true }
            : { state: "unavailable", allowedTypes: [], message: result.message, degraded: false };
    }

    const allowedTypes = approverTypeIdsFor(result.data, STAFF_LEAVE_CATEGORY);
    if (allowedTypes.length === 0) {
        return entitled
            ? { state: "allowed", allowedTypes, message: "", degraded: true }
            : {
                  state: "unavailable",
                  allowedTypes,
                  message: "No user type is set as a staff leave approver yet.",
                  degraded: false,
              };
    }
    return {
        state: allowedTypes.includes(Number(userTypeID)) ? "allowed" : "denied",
        allowedTypes,
        message: "",
        degraded: false,
    };
};
