import axios from "axios";

import { withActor } from "./apiActor";
import { withoutExcluded } from "./coverageScope";

import {
    postleavepolicy,
    GetLeavePolicy,
    postleavetypes,
    GetleaveTypes,
    UpdateleaveTypeByID,
    DeleteleaveTypeByID,
    postworkingcalendar,
    GetWorkingcalendar,
    GetunassignedStaff,
    GetShiftAssignedStaffs,
    assignStaffToShift,
    UpdateAssignedStaff,
    unassignStaff,
    GetEmployeeLeaveBalance,
} from "../../Api/Api";

/**
 * Leave Policy module — api/leavePolicy.
 *
 * Auth: the gateway requires an Authorization header and returns 401 without one.
 * The whole app sends the same static token (see LoginPage / DashBoardPage), so
 * these calls go through one client that carries it.
 *
 * Authorisation is separate: the actor's roll number travels in the payload as
 * `updatedByRollNumber` (or assignedBy… / movedBy… / unassignedBy…) and must
 * resolve to a superadmin. That failure is a 400 with a readable `message`.
 */
const API_TOKEN = "123";

/* withActor attaches requestedByRollNumber to every request — the permission layer the
   API gained on 25 Aug. See apiActor.js for why it goes on all of them. */
const client = withActor(
    axios.create({
        headers: { Authorization: `Bearer ${API_TOKEN}` },
    })
);

/* ─────────────── Enum maps ───────────────
   The UI shows readable labels; the API takes PascalCase enums. */

export const ALLOCATION_PERIOD_TO_API = {
    Monthly: "Monthly",
    Quarterly: "Quarterly",
    "Half-Yearly": "HalfYearly",
    Yearly: "Yearly",
};

export const UNUSED_ACTION_TO_API = {
    Encash: "Encash",
    "Carry Forward": "CarryForward",
    Lapse: "Lapse",
};

export const CREDIT_FREQUENCY_TO_API = {
    Monthly: "Monthly",
    Quarterly: "Quarterly",
    "Half-Yearly": "HalfYearly",
    Yearly: "Yearly",
};

/* Salary register the deduction / credit-back lands in.
   "Month After Next" was originally a UI-only label wrongly mapped onto Quarterly; the
   payroll handover of 19 Aug 2026 made MonthAfterNext a real enum value, so it maps to
   itself now. Six values in total. */
export const REGISTER_TO_API = {
    "Same Month": "SameMonth",
    "Next Month": "NextMonth",
    "Month After Next": "MonthAfterNext",
    Quarterly: "Quarterly",
    "Half-Yearly": "HalfYearly",
    Yearly: "Yearly",
};

export const DEDUCTION_FORMULA_TO_API = {
    working: "GrossWorkingDays",
    calendar: "GrossCalendarDays",
    fixed: "GrossFixed30",
};

/**
 * Encashment settings on a leave type — added backend-side 19 Aug 2026.
 *
 * Both are REQUIRED when unusedAction is Encash and REJECTED with a 400 when it is
 * CarryForward or Lapse, so they must be sent only for an encashing type. Switching a
 * type away from Encash nulls them server-side.
 *
 * The formula reuses the same three values as leaveSalaryDeduction.formula.
 */
export const ENCASH_CREDITED_WHEN_TO_API = {
    "End of Period": "EndOfPeriod",
    "End of Academic Year": "EndOfAcademicYear",
    Monthly: "Monthly",
};

export const ENCASH_FORMULA_TO_API = {
    "Gross / Working Days": "GrossWorkingDays",
    "Gross / Calendar Days": "GrossCalendarDays",
    "Gross / Fixed 30 Days": "GrossFixed30",
};

/* Hint shown under each formula choice */
export const ENCASH_FORMULA_HINT = {
    "Gross / Working Days": "Salary ÷ working days of the month",
    "Gross / Calendar Days": "Salary ÷ calendar days of the month",
    "Gross / Fixed 30 Days": "Salary ÷ 30 (fixed)",
};

/* The six late-penalty deduct types (three added 18 Aug 2026) */
export const LATE_DEDUCT_TO_API = {
    "Fixed Amount": "FixedAmount",
    "% of Day's Salary": "PercentPerDay",
    "Slab Time Salary": "SlabTimeSalary",
    "Per-Hour Salary": "PerHourSalary",
    "Half-Day Salary": "HalfDaySalary",
    "Full-Day Salary": "FullDaySalary",
};

/* Only these three carry a deductAmount; the rest derive from salary */
const DEDUCT_TYPES_WITH_AMOUNT = ["FixedAmount", "PercentPerDay", "PerHourSalary"];

/* Bonuses accept only the original three amount types */
export const BONUS_AMOUNT_TYPES = ["FixedAmount", "HalfDaySalary", "FullDaySalary"];

const invert = (map) =>
    Object.entries(map).reduce((acc, [label, apiValue]) => ({ ...acc, [apiValue]: label }), {});

export const API_TO_REGISTER = invert(REGISTER_TO_API);
export const API_TO_ENCASH_CREDITED_WHEN = invert(ENCASH_CREDITED_WHEN_TO_API);
export const API_TO_ENCASH_FORMULA = invert(ENCASH_FORMULA_TO_API);
export const API_TO_DEDUCTION_FORMULA = invert(DEDUCTION_FORMULA_TO_API);
export const API_TO_LATE_DEDUCT = invert(LATE_DEDUCT_TO_API);
export const API_TO_CREDIT_FREQUENCY = invert(CREDIT_FREQUENCY_TO_API);

const num = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

/* "08:00" and "16:00" → 480 / 960. Used to turn break clock times into durations. */
const minutesOfDay = (value) => {
    const [hours, mins] = String(value || "").split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
    return hours * 60 + mins;
};

/* Break span in minutes, wrapping past midnight if the end is earlier */
export const breakMinutesBetween = (start, end) => {
    const from = minutesOfDay(start);
    const to = minutesOfDay(end);
    if (from === null || to === null) return 0;
    const span = to - from;
    return span >= 0 ? span : span + 1440;
};

/* ─────────────── Outbound mapping ─────────────── */

/* The UI holds one lunch break per shift; overall (tea etc.) defaults to nil. */
const shiftToApi = (shift, index) => ({
    shiftName: String(shift.name || "").slice(0, 60),
    startTime: shift.startTime,
    endTime: shift.endTime,
    lunchBreakMinutes: breakMinutesBetween(shift.breakStart, shift.breakEnd),
    overallBreakMinutes: num(shift.overallBreakMinutes, 0),
    displayOrder: index,
});

/* UI slabs carry a single "more than N minutes" threshold. The API wants
   non-overlapping ascending bands, so each slab's upper bound is the next
   slab's threshold and the final band is left open. */
const slabsToApi = (slabs) => {
    const ordered = [...(slabs || [])].sort((a, b) => num(a.afterMin) - num(b.afterMin));
    return ordered.map((slab, index) => {
        const next = ordered[index + 1];
        const toMinutes = next ? num(next.afterMin) : null;
        let deductType = LATE_DEDUCT_TO_API[slab.deductType] || "FixedAmount";

        /* SlabTimeSalary bills the band's UPPER minute, so the server rejects it when
           toMinutes is null. The picker no longer offers it on the final band, but older
           saved policies can still hold that combination — degrade to FullDaySalary rather
           than let one tier 400 the entire policy save. */
        if (deductType === "SlabTimeSalary" && toMinutes === null) deductType = "FullDaySalary";

        const band = {
            fromMinutes: num(slab.afterMin) + 1,
            toMinutes,
            deductType,
            displayOrder: index,
        };
        // only these three carry an amount; the rest derive the figure from salary
        if (DEDUCT_TYPES_WITH_AMOUNT.includes(deductType)) band.deductAmount = num(slab.amount);
        return band;
    });
};

/**
 * Build the postleavepolicy body from the Policy Setup screen.
 *
 * `shifts` and `latePenalty.slabs` are tri-state on the server:
 *   omitted → left untouched · [] → all rows deleted · [...] → wiped and re-inserted.
 * Pass `includeShifts` / `includeSlabs` as false when a save must not touch them.
 */
export const buildPolicyPayload = ({
    academicYear,
    config,
    shifts,
    lateSlabs,
    rollNumber,
    includeShifts = true,
    includeSlabs = true,
}) => {
    const payload = {
        academicYear,
        autoRenew: Boolean(config.autoRenew),
        gracePeriodMinutes: num(config.gracePeriodMinutes),
        attendanceBonus: {
            enabled: Boolean(config.attendanceBonusEnabled),
            amountType: config.attendanceBonusType || "FixedAmount",
            amount: config.attendanceBonusType === "FixedAmount" ? num(config.attendanceBonusAmount) : 0,
            minWorkingDays: num(config.minWorkingDays, 1),
            mustJoinFirstDay: Boolean(config.newJoinerFirstDay),
            mandatoryDayRequired: Boolean(config.mandatoryDayRequired),
        },
        punctuality: {
            enabled: Boolean(config.punctualityBonusEnabled),
            bonusAmountType: config.punctualityBonusType || "FixedAmount",
            bonusAmount:
                config.punctualityBonusType === "FixedAmount" ? num(config.punctualityBonusAmount) : 0,
            latesAllowed: num(config.latesAllowed),
            informedLeavesAllowed: num(config.informedLeavesAllowed),
        },
        permissionDeduction: {
            enabled: Boolean(config.permissionDeduction),
            freeHoursPerMonth: num(config.permissionFreeHours),
            amountPerHour: num(config.permissionRate),
        },
        leaveSalaryDeduction: {
            appliesToPaidLeave: Boolean(config.appliesToPaidLeave),
            deductionAppliedWhen: REGISTER_TO_API[config.deductIn] || "SameMonth",
            creditBackEnabled: Boolean(config.creditBack),
            creditBackWhen: REGISTER_TO_API[config.creditBackIn] || "NextMonth",
            formula: DEDUCTION_FORMULA_TO_API[config.formula] || "GrossWorkingDays",
        },
        bonusPayout: {
            creditFrequency: CREDIT_FREQUENCY_TO_API[config.payoutSchedule] || "Monthly",
        },
        updatedByRollNumber: rollNumber,
    };

    if (includeShifts) payload.shifts = (shifts || []).map(shiftToApi);

    payload.latePenalty = { enabled: Boolean(config.lateArrivalPenalty) };
    if (includeSlabs) payload.latePenalty.slabs = slabsToApi(lateSlabs);

    return payload;
};

/* ─────────────── Inbound mapping ─────────────── */

/* Minutes past midnight → "HH:mm" */
const clockOf = (minutes) => {
    const wrapped = ((num(minutes) % 1440) + 1440) % 1440;
    return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
};

const SHIFT_COLORS = ["#0891B2", "#7C3AED", "#F97316", "#059669", "#DB2777"];

/* API shift → the shape the Policy Setup editor holds */
export const shiftFromApi = (shift, index) => {
    const start = minutesOfDay(shift.startTime);
    const lunch = num(shift.lunchBreakMinutes);
    // Park lunch in the middle of the shift so the editor has sensible clock times
    const total = num(shift.totalShiftMinutes, 480);
    const breakStartMinutes = start === null ? null : start + Math.max(0, Math.floor((total - lunch) / 2));
    return {
        id: index + 1,
        // The server's own id — shift assignment calls need this, not the row index
        shiftId: shift.id ?? shift.shiftId ?? null,
        name: shift.shiftName,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakStart: breakStartMinutes === null ? "" : clockOf(breakStartMinutes),
        breakEnd: breakStartMinutes === null ? "" : clockOf(breakStartMinutes + lunch),
        overallBreakMinutes: num(shift.overallBreakMinutes),
        color: SHIFT_COLORS[index % SHIFT_COLORS.length],
        // Server-derived — display these rather than recomputing
        totalShiftMinutes: shift.totalShiftMinutes ?? null,
        totalBreakMinutes: shift.totalBreakMinutes ?? null,
        effectiveLoginMinutes: shift.effectiveLoginMinutes ?? null,
    };
};

/* API slab band → the editor's "more than N minutes" row */
export const slabFromApi = (slab, index) => ({
    id: index + 1,
    afterMin: Math.max(num(slab.fromMinutes) - 1, 0),
    deductType: API_TO_LATE_DEDUCT[slab.deductType] || "Fixed Amount",
    amount: slab.deductAmount ?? "",
});

/* Whole policy response → { config, shifts, lateSlabs } for the screen */
export const policyFromApi = (data) => {
    const bonus = data?.attendanceBonus || {};
    const punctuality = data?.punctuality || {};
    const penalty = data?.latePenalty || {};
    const permission = data?.permissionDeduction || {};
    const leaveDeduction = data?.leaveSalaryDeduction || {};

    return {
        config: {
            autoRenew: Boolean(data?.autoRenew),
            gracePeriodMinutes: num(data?.gracePeriodMinutes),
            attendanceBonusEnabled: Boolean(bonus.enabled),
            attendanceBonusType: bonus.amountType || "FixedAmount",
            attendanceBonusAmount: bonus.amount ?? "",
            minWorkingDays: bonus.minWorkingDays ?? "",
            newJoinerFirstDay: Boolean(bonus.mustJoinFirstDay),
            mandatoryDayRequired: Boolean(bonus.mandatoryDayRequired),
            punctualityBonusEnabled: Boolean(punctuality.enabled),
            punctualityBonusType: punctuality.bonusAmountType || "FixedAmount",
            punctualityBonusAmount: punctuality.bonusAmount ?? "",
            latesAllowed: punctuality.latesAllowed ?? "",
            informedLeavesAllowed: punctuality.informedLeavesAllowed ?? "",
            lateArrivalPenalty: Boolean(penalty.enabled),
            permissionDeduction: Boolean(permission.enabled),
            permissionFreeHours: permission.freeHoursPerMonth ?? 0,
            permissionRate: permission.amountPerHour ?? 0,
            payoutSchedule: API_TO_CREDIT_FREQUENCY[data?.bonusPayout?.creditFrequency] || "Monthly",
            appliesToPaidLeave: Boolean(leaveDeduction.appliesToPaidLeave),
            deductIn: API_TO_REGISTER[leaveDeduction.deductionAppliedWhen] || "Same Month",
            creditBack: Boolean(leaveDeduction.creditBackEnabled),
            creditBackIn: API_TO_REGISTER[leaveDeduction.creditBackWhen] || "Next Month",
            formula: API_TO_DEDUCTION_FORMULA[leaveDeduction.formula] || "working",
        },
        shifts: (data?.shifts || []).map(shiftFromApi),
        lateSlabs: (penalty.slabs || []).map(slabFromApi),
    };
};

/* ─────────────── Calls ─────────────── */

/* Errors are 400 with a message written to be shown to the user — except a 401, whose
   body is plain text because the token gate runs before routing and before JSON. */
const messageOf = (error, fallback) => {
    const data = error?.response?.data;
    if (error?.response?.status === 401) {
        return typeof data === "string" && data.trim() ? data.trim() : "Unauthorized access: invalid token.";
    }
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data?.message) return data.message;
    const validation = data?.errors && Object.values(data.errors).flat().filter(Boolean);
    if (validation?.length) return validation.join(" ");
    return error?.message || fallback;
};

export const fetchLeavePolicy = async (academicYear) => {
    try {
        const res = await client.get(GetLeavePolicy, { params: { academicYear } });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load the policy" };
        return { ok: true, data: res?.data?.data ?? res?.data ?? null };
    } catch (error) {
        // A year with no policy yet is a normal first-run state, not a failure
        if (error?.response?.status === 404) return { ok: true, data: null };
        return { ok: false, message: messageOf(error, "Could not load the policy") };
    }
};

/* ─────────────── Leave types ─────────────── */

export const API_TO_ALLOCATION_PERIOD = invert(ALLOCATION_PERIOD_TO_API);
export const API_TO_UNUSED_ACTION = invert(UNUSED_ACTION_TO_API);

/**
 * Leave type draft → request body.
 *
 * `academicYear` is required on create and ignored on update (the year is immutable).
 * `BlockContinuousLeave` is the one capital-B field in an otherwise camelCase API —
 * confirmed against a live response, which returns it exactly that way. The
 * `standaloneOnly` name in the Postman collection is stale and is not sent.
 */
export const leaveTypeToApi = (draft, { academicYear, rollNumber, isUpdate = false } = {}) => {
    const blockContinuous = Boolean(draft.continuousBlocked);
    const body = {
        name: String(draft.name || "").slice(0, 60),
        shortCode: String(draft.code || "").toUpperCase().slice(0, 5),
        colorTag: String(draft.color || "").slice(0, 20),
        description: String(draft.description || "").slice(0, 250),
        allocationPeriod: ALLOCATION_PERIOD_TO_API[draft.period] || "Monthly",
        // Total for the chosen period, not per year. 0 = unlimited / on-demand
        numberOfDays: num(draft.days),
        // 0 / null means no monthly sub-cap
        maxDaysPerMonth: Math.min(num(draft.maxPerMonth), 31),
        unusedAction: UNUSED_ACTION_TO_API[draft.endOfPeriod] || "Lapse",
        BlockContinuousLeave: blockContinuous,
        requireSupportingDocument: Boolean(draft.documentRequired),
        updatedByRollNumber: rollNumber,
    };

    /* Encashment scheduling — required when the type encashes, rejected with a 400 when
       it carries forward or lapses. Sending them on a non-encashing type is an error, not
       a no-op, so they are attached only for Encash. */
    if (body.unusedAction === "Encash") {
        body.encashmentCreditedWhen =
            ENCASH_CREDITED_WHEN_TO_API[draft.encashCreditedWhen] || "EndOfPeriod";
        body.encashmentFormula = ENCASH_FORMULA_TO_API[draft.encashFormula] || "GrossWorkingDays";
    }

    if (!isUpdate) body.academicYear = academicYear;
    return body;
};

/* Response item → the shape the Leave Types tab renders */
export const leaveTypeFromApi = (item, index) => ({
    id: item.id ?? index + 1,
    code: item.shortCode || "",
    name: item.name || "",
    description: item.description || "",
    days: item.numberOfDays ?? 0,
    period: API_TO_ALLOCATION_PERIOD[item.allocationPeriod] || "Monthly",
    endOfPeriod: API_TO_UNUSED_ACTION[item.unusedAction] || "Lapse",
    // null unless the type encashes — the server clears them otherwise
    encashCreditedWhen: API_TO_ENCASH_CREDITED_WHEN[item.encashmentCreditedWhen] || "End of Period",
    encashFormula: API_TO_ENCASH_FORMULA[item.encashmentFormula] || "Gross / Working Days",
    maxPerMonth: item.maxDaysPerMonth ?? "",
    documentRequired: Boolean(item.requireSupportingDocument),
    // Whichever name the server uses for the back-to-back rule
    continuousBlocked: Boolean(item.BlockContinuousLeave),
    color: item.colorTag || "#3457D5",
    // Server-derived — show it rather than recomputing
    monthlyEquivalent: item.monthlyEquivalent ?? null,
    isActive: item.isActive !== false,
    // The year the type belongs to, echoed back on every row
    academicYear: item.academicYear || "",
    // Audit trail. Timestamps arrive as "dd-MM-yyyy HH:mm" and are shown as sent.
    createdBy: item.createdBy || "",
    createdOn: item.createdOn || "",
    updatedBy: item.updatedBy || "",
    updatedOn: item.updatedOn || "",
    // The doc says allocation freezes once staff have consumed the type, but neither
    // GetleaveTypes nor GetleaveTypeByID returns a usage flag — so the lock below stays
    // off until backend exposes one. Delete is still refused server-side either way.
    inUse: Boolean(item.inUse),
    accruesMonthly: Boolean(item.accruesMonthly),
});

export const fetchLeaveTypes = async (academicYear) => {
    try {
        const res = await client.get(GetleaveTypes, { params: { academicYear } });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load leave types" };
        const data = res?.data?.data ?? {};
        const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
        return { ok: true, items: items.map(leaveTypeFromApi), summary: data.summary || null };
    } catch (error) {
        if (error?.response?.status === 404) return { ok: true, items: [], summary: null };
        return { ok: false, message: messageOf(error, "Could not load leave types") };
    }
};

export const createLeaveType = async (draft, context) => {
    try {
        const res = await client.post(postleavetypes, leaveTypeToApi(draft, context));
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not save the leave type" };
        return {
            ok: true,
            message: res?.data?.message || "Leave type created",
            // Tells you how many balance rows the save cascaded into
            cascade: res?.data?.data?.cascade || null,
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not save the leave type") };
    }
};

export const updateLeaveType = async (id, draft, context) => {
    try {
        const res = await client.put(
            `${UpdateleaveTypeByID}/${id}`,
            leaveTypeToApi(draft, { ...context, isUpdate: true })
        );
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not update the leave type" };
        return {
            ok: true,
            message: res?.data?.message || "Leave type updated",
            cascade: res?.data?.data?.cascade || null,
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not update the leave type") };
    }
};

export const deleteLeaveType = async (id, rollNumber) => {
    try {
        const res = await client.delete(`${DeleteleaveTypeByID}/${id}`, {
            params: { updatedByRollNumber: rollNumber },
        });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not delete the leave type" };
        return { ok: true, message: res?.data?.message || "Leave type deleted" };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not delete the leave type") };
    }
};

/* ─────────────── Working calendar ─────────────── */

/* Index 0 = Sunday, matching both the grid and the weekPattern keys */
export const WEEK_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_TYPE_TO_API = { working: "Working", holiday: "Holiday", mandatory: "Mandatory" };
const API_TO_DAY_TYPE = { Working: "working", Holiday: "holiday", Mandatory: "mandatory" };

const pad = (value) => String(value).padStart(2, "0");

/**
 * Build the postworkingcalendar body for one month.
 *
 * `month` is 1-based here — the grid holds a 0-based month index, so callers pass
 * `viewDate.month + 1`. Do NOT send `academicYear`: the server derives it from
 * (year, month) against academic_year_config and echoes it back.
 */
export const buildCalendarPayload = ({ year, month, workingDays, dayOverrides, rollNumber }) => {
    const weekPattern = WEEK_KEYS.reduce(
        (acc, key, index) => ({ ...acc, [key]: workingDays.includes(index) ? "Working" : "Holiday" }),
        {}
    );

    // Grid overrides are keyed `year-monthIndex-day`; keep only this month's
    const prefix = `${year}-${month - 1}-`;
    const overrides = Object.entries(dayOverrides || {})
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, status]) => ({
            dayDate: `${year}-${pad(month)}-${pad(key.slice(prefix.length))}`,
            dayType: DAY_TYPE_TO_API[status] || "Working",
        }))
        .sort((a, b) => a.dayDate.localeCompare(b.dayDate));

    return { year, month, weekPattern, overrides, updatedByRollNumber: rollNumber };
};

/* Response → the grid's weekly pattern, per-date overrides and month counts */
export const calendarFromApi = (data, { year, month }) => {
    const pattern = data?.weekPattern || {};
    const workingDays = WEEK_KEYS.reduce(
        (acc, key, index) => (String(pattern[key]).toLowerCase() === "holiday" ? acc : acc.concat(index)),
        []
    );

    const overrides = (data?.overrides || []).reduce((acc, item) => {
        const day = Number(String(item.dayDate).slice(-2));
        if (!day) return acc;
        return { ...acc, [`${year}-${month - 1}-${day}`]: API_TO_DAY_TYPE[item.dayType] || "working" };
    }, {});

    return {
        workingDays,
        overrides,
        // Server-computed totals — use these rather than counting client-side
        counts: {
            working: data?.workingDays ?? null,
            holiday: data?.holidayDays ?? null,
            mandatory: data?.mandatoryDays ?? null,
        },
    };
};

/* `found: false` means the month has no row — the server silently falls back to
   Mon–Fri working, which is why unconfigured months show holidays as absences. */
export const fetchWorkingCalendar = async (year, month) => {
    try {
        const res = await client.get(GetWorkingcalendar, { params: { year, month } });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load the calendar" };
        const data = res?.data?.data ?? res?.data ?? null;
        if (!data || !data.weekPattern) return { ok: true, found: false, data: null };
        return { ok: true, found: true, data };
    } catch (error) {
        if (error?.response?.status === 404) return { ok: true, found: false, data: null };
        return { ok: false, message: messageOf(error, "Could not load the calendar") };
    }
};

export const saveWorkingCalendar = async (payload) => {
    try {
        const res = await client.post(postworkingcalendar, payload);
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not save the calendar" };
        return { ok: true, message: res?.data?.message || "Working calendar saved" };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not save the calendar") };
    }
};

/* ─────────────── Shift assignment ─────────────── */

/* StaffCard rows come back the same shape from both GETs */
export const staffCardFromApi = (card) => ({
    rollNumber: String(card.rollNumber ?? ""),
    name: card.name || "",
    role: card.role || "",
    profilePath: card.profilePath || null,
    shiftId: card.shiftId ?? null,
    shiftName: card.shiftName || null,
    assignedOn: card.assignedOn || null,
});

/* Both GETs wrap as { error, message, count, data: [ … ] } */
const staffListFrom = (res) => {
    const data = res?.data?.data;
    return Array.isArray(data) ? data.map(staffCardFromApi) : [];
};

export const fetchUnassignedStaff = async (academicYear, search = "") => {
    try {
        const res = await client.get(GetunassignedStaff, { params: { academicYear, search } });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load staff" };
        return { ok: true, staff: await withoutExcluded(staffListFrom(res)) };
    } catch (error) {
        if (error?.response?.status === 404) return { ok: true, staff: [] };
        return { ok: false, message: messageOf(error, "Could not load staff") };
    }
};

export const fetchShiftStaff = async (academicYear, shiftId, search = "") => {
    try {
        const res = await client.get(GetShiftAssignedStaffs, { params: { academicYear, shiftId, search } });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not load staff" };
        return { ok: true, staff: await withoutExcluded(staffListFrom(res)) };
    } catch (error) {
        if (error?.response?.status === 404) return { ok: true, staff: [] };
        return { ok: false, message: messageOf(error, "Could not load staff") };
    }
};

/**
 * Bulk assign — all-or-nothing. One bad roll number rejects the whole batch and
 * nothing is written, so the 400 `message` (which names the offending roll) is
 * worth showing verbatim rather than a generic failure.
 */
export const assignStaff = async ({ academicYear, shiftId, rollNumbers, rollNumber, userType }) => {
    try {
        const res = await client.post(assignStaffToShift, {
            academicYear,
            shiftId,
            rollNumbers,
            assignedByRollNumber: rollNumber,
            assignedByUserType: userType,
        });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not assign staff" };
        return { ok: true, message: res?.data?.message || `${rollNumbers.length} staff assigned` };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not assign staff") };
    }
};

/* A move, not an edit — the old row is soft-deleted so the trail survives */
export const moveStaffToShift = async ({ academicYear, rollNumber, newShiftId, movedBy, userType }) => {
    try {
        const res = await client.put(UpdateAssignedStaff, {
            academicYear,
            rollNumber,
            newShiftId,
            movedByRollNumber: movedBy,
            movedByUserType: userType,
        });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not move the staff member" };
        return { ok: true, message: res?.data?.message || "Shift updated" };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not move the staff member") };
    }
};

export const unassignStaffFromShift = async ({ academicYear, rollNumbers, rollNumber, userType }) => {
    try {
        // DELETE with a body needs the axios `data` key
        const res = await client.delete(unassignStaff, {
            data: {
                academicYear,
                rollNumbers,
                unassignedByRollNumber: rollNumber,
                unassignedByUserType: userType,
            },
        });
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not unassign staff" };
        return { ok: true, message: res?.data?.message || `${rollNumbers.length} staff unassigned` };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not unassign staff") };
    }
};

export const saveLeavePolicy = async (payload) => {
    try {
        const res = await client.post(postleavepolicy, payload);
        if (res?.data?.error) return { ok: false, message: res.data.message || "Could not save the policy" };
        return { ok: true, data: res?.data?.data ?? null, message: res?.data?.message || "Policy saved" };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not save the policy") };
    }
};

/* ─────────────── Leave balance ─────────────── */

/**
 * Timestamps on this route come back as raw ISO ("2026-08-18T10:42:33"), not the
 * "dd-MM-yyyy HH:mm" the rest of the module returns — so they need normalising before
 * display or the balance card reads differently from every other audit line.
 * Anything already in the house format is passed through untouched.
 */
export const formatApiTimestamp = (value) => {
    if (!value) return "";
    const text = String(value).trim();
    if (/^\d{2}-\d{2}-\d{4}/.test(text)) return text;
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return text;
    const p = (n) => String(n).padStart(2, "0");
    return `${p(parsed.getDate())}-${p(parsed.getMonth() + 1)}-${parsed.getFullYear()} ${p(parsed.getHours())}:${p(parsed.getMinutes())}`;
};

/**
 * One period bucket inside an allocation.
 *
 * `cap` is what the period grants, `approved` and `pending` are what has been drawn
 * against it, and `remaining` is what is left. A period that has closed with balance
 * still on it is flagged `lapsed`, which is why remaining can be non-zero on a past
 * period without meaning it is still spendable.
 */
const balancePeriodFromApi = (period = {}, index = 0) => ({
    index: period.index ?? index,
    label: period.label || "",
    cap: period.cap ?? 0,
    approved: period.approved ?? 0,
    pending: period.pending ?? 0,
    remaining: period.remaining ?? 0,
    isCurrentPeriod: Boolean(period.isCurrentPeriod),
    isPastPeriod: Boolean(period.isPastPeriod),
    lapsed: Boolean(period.lapsed),
});

/**
 * One leave type's allocation for one employee.
 *
 * `remaining` on the row is the whole-year figure. `perPeriod` breaks the same
 * allocation down the way the policy grants it — `data` has one entry per period
 * (12 for a monthly allocation), so a monthly-capped type shows where the balance
 * actually sits rather than one lump sum.
 */
export const leaveBalanceFromApi = (row = {}) => ({
    id: row.id,
    academicYear: row.academicYear || "",
    rollNumber: String(row.employeeRollNumber || ""),
    employeeName: row.employeeName || "",
    leaveTypeId: row.leaveTypeId ?? null,
    leaveTypeName: row.leaveTypeName || "",
    remaining: row.remaining ?? 0,
    isActive: row.isActive !== false,
    createdBy: row.createdBy || "",
    createdOn: formatApiTimestamp(row.createdOn),
    updatedBy: row.updatedBy || "",
    updatedOn: formatApiTimestamp(row.updatedOn),
    allocationPeriod: row.allocationPeriod || row.perPeriod?.allocationPeriod || "",
    perPeriod: {
        allocationPeriod: row.perPeriod?.allocationPeriod || "",
        cap: row.perPeriod?.cap ?? 0,
        monthlyCap: row.perPeriod?.monthlyCap ?? 0,
        academicYearStartMonth: row.perPeriod?.academicYearStartMonth ?? 0,
        data: (row.perPeriod?.data || []).map(balancePeriodFromApi),
    },
});

/**
 * An employee's allocations — GET api/leavePolicy/GetEmployeeLeaveBalance.
 *
 * Both params are required. A roll number that is not in `users` is a 400 naming it
 * verbatim; an employee with no allocations yet answers 404, which is an empty result
 * rather than a failure.
 */
export const fetchEmployeeLeaveBalance = async ({ academicYear, rollNumber }) => {
    try {
        const res = await client.get(GetEmployeeLeaveBalance, { params: { academicYear, rollNumber } });
        const data = res?.data ?? {};
        if (data.error) return { ok: false, message: data.message || "Could not load the leave balance" };
        const rows = data.leaves ?? data.data ?? (Array.isArray(data) ? data : []);
        return {
            ok: true,
            count: data.count ?? (Array.isArray(rows) ? rows.length : 0),
            balances: Array.isArray(rows) ? rows.map(leaveBalanceFromApi) : [],
            message: data.message || "",
        };
    } catch (error) {
        if (error?.response?.status === 404) {
            return { ok: true, count: 0, balances: [], message: error?.response?.data?.message || "" };
        }
        return { ok: false, message: messageOf(error, "Could not load the leave balance") };
    }
};
