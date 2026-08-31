import axios from "axios";

import { withActor } from "./apiActor";
import { withoutExcluded } from "./coverageScope";

import {
    getEmployees,
    getEmployeesWithoutSalaryStructure,
    getEmployeesWithoutBankDetails,
    postSalaryStructure,
    updateSalaryStructureByRollnumber,
    deleteSalaryStructureByRollnumber,
    salaryStructureDashboard,
    postPFConfiguration,
    postESIConfiguration,
    postProfessionalTaxConfiguration,
    getDeductionsAndCompliance,
    employeeComplianceDashboard,
    updateEmployeeComplianceByRollnumber,
    employeeBankDetailsDashboard,
    updateEmployeeBankDetailsByRollnumber,
    salaryRegisterDashboard,
    approvePayrollPayslipsDashboard,
    getPayrollPayslipByRollNumber,
    getPayrollCycle,
    payrollCycleLockAttendance,
    payrollCycleCalculate,
    payrollCycleApprove,
    payrollCycleMarkCredited,
    payrollCycleRollback,
    getPayrollRegister,
    getPayrollPayslip,
    getMyPayrollPayslip,
} from "../../Api/Api";

/**
 * Payroll — two controllers, deliberately different casing.
 *
 *   api/payRoll  (capital R)  setup:  salary structures, statutory config, bank details,
 *                                     registers. 18 endpoints.
 *   api/payroll  (lowercase)  cycle:  the monthly run and its stage machine. 9 endpoints.
 *
 * They are separate controllers, not a typo on either side. Using the wrong casing returns
 * a 404 that reads like a missing route, so every URL is imported from Api.jsx rather than
 * assembled here.
 *
 * Auth has two layers, both required:
 *   1. `Authorization: Bearer 123` on every request. The gate runs BEFORE routing, so a
 *      missing header turns even a bad URL into a 401. That 401 body is PLAIN TEXT — every
 *      other error here is a JSON envelope.
 *   2. The actor's roll number in the payload (actionByRollNumber / updatedByRollNumber),
 *      resolved against `users`. Permission failures are 400 with a readable message,
 *      never 403.
 *
 * 401 = bad or missing token. 400 = good token, wrong person.
 *
 * PAYROLL RUNS IN ARREARS. payoutMonth M pays for attendance month M-1: sending "2026-07"
 * processes June 2026 work. Label every screen by payout month and show the attendance
 * month as context — never ask the user for both. The server derives and returns both.
 *
 * TDS was switched off 19 Aug 2026. postTDSConfiguration and PUT payroll/payslip/tds now
 * 404, and the response fields are gone. Nothing in this file references them.
 */
const API_TOKEN = "123";

/* withActor attaches requestedByRollNumber to every request — the permission layer the
   API gained on 25 Aug. See apiActor.js for why it goes on all of them. */
const client = withActor(
    axios.create({
        headers: { Authorization: `Bearer ${API_TOKEN}` },
    })
);

/* Errors are written to be read by a user, but arrive in three different shapes:
   a plain-text 401, a JSON envelope, or an RFC-9110 problem document. Unwrap all three. */
const messageOf = (error, fallback) => {
    const data = error?.response?.data;
    if (error?.response?.status === 401) {
        return typeof data === "string" && data.trim()
            ? data.trim()
            : "Unauthorized access: invalid token.";
    }
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data?.message) return data.message;
    const validation = data?.errors && Object.values(data.errors).flat().filter(Boolean);
    if (validation?.length) return validation.join(" ");
    /* An empty-bodied 404 otherwise surfaces as axios's "Request failed with status code
       404", which tells a user nothing. Several routes here are new and not deployed
       everywhere, so name that as the likely cause instead of the status code. */
    if (error?.response?.status === 404) {
        return `${fallback} The endpoint was not found (404) — it may not be deployed yet.`;
    }
    return error?.message || fallback;
};

/**
 * The API answers { error, message, data }. Two things to get right:
 *
 *   - a 200 with error:true is still a failure, so it throws rather than returning;
 *   - data may legitimately be NULL on success. These tables were created 18 Aug 2026 and
 *     start empty, so "no statutory config row yet" is a success with no data. Returning
 *     the envelope in that case would hand { error, message, data } to a normaliser, which
 *     reads every field off it as undefined instead of showing an empty state.
 */
const unwrap = (response, fallback) => {
    const body = response?.data;
    if (body?.error === true) throw new Error(body?.message || fallback);
    // an envelope always carries `error`; anything else is already the payload
    if (body && typeof body === "object" && "error" in body) return body.data ?? null;
    return body;
};

/* ─────────────── Money ───────────────

   Allowance fields are varchar on purpose — the screens accept "1600", "₹1,000" or "N/A".
   Before 19 Aug the structure screen and the payroll engine parsed them differently, so
   "₹1,000" was worth 1000 in one place and 0 in the other. Both now strip symbols and
   separators identically; this mirrors that so the client-side preview agrees. */
export const parseMoney = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const cleaned = String(value).replace(/[₹,\s]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
};

/* ₹35,000 */
export const rupees = (value) => `₹${Math.round(parseMoney(value)).toLocaleString("en-IN")}`;

/* pf / esi / pt are free text and accept an opt-out. Anything reading as nil, zero or N/A
   means the deduction does not apply to that person — don't force a numeric input. */
export const isNilRate = (value) => {
    const text = String(value ?? "").trim();
    if (!text) return true;
    if (/^(n\/?a|nil|none|no|-|--)$/i.test(text)) return true;
    return parseMoney(text) === 0;
};

/* "12%" → 12 */
export const parseRate = (value) => parseMoney(String(value ?? "").replace(/%/g, ""));

/**
 * Gross, computed exactly as the server computes it.
 *
 * Since 19 Aug the server derives gross and IGNORES a TotalEarnings sent on the request.
 * This function exists only to drive the live preview in the Create/Edit modal — treat it
 * as an estimate. After a save, re-read grossSalary from the response and display that.
 * If the two ever disagree, the server is right and this has a bug.
 *
 * hra and da are PERCENTAGES OF BASIC, not rupee amounts.
 */
export const computeGross = ({
    basicSalary,
    hra,
    da,
    conveyanceAllowance,
    specialAllowance,
    incentive,
    addSalary,
}) => {
    const basic = parseMoney(basicSalary);
    return Math.round(
        basic +
            (basic * parseRate(hra)) / 100 +
            (basic * parseRate(da)) / 100 +
            parseMoney(conveyanceAllowance) +
            parseMoney(specialAllowance) +
            parseMoney(incentive) +
            parseMoney(addSalary)
    );
};

/* ─────────────── Months ───────────────

   Two different month formats are in play and they are genuinely different routes:
     cycle endpoints (api/payroll)          "YYYY-MM"   e.g. 2026-07
     getPayrollPayslipByRollNumber          "MM-yyyy"   e.g. 07-2026
   Don't share a formatter between them. */

const pad = (value) => String(value).padStart(2, "0");

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/* Date | "2026-07-01" | "2026-07" → "2026-07" */
export const toPayoutMonth = (value) => {
    if (!value) return "";
    if (value instanceof Date) return `${value.getFullYear()}-${pad(value.getMonth() + 1)}`;
    const text = String(value).trim();
    const match = text.match(/^(\d{4})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}` : text;
};

/* "2026-07" → "07-2026", for getPayrollPayslipByRollNumber only */
export const toMonthYear = (value) => {
    const [year, month] = toPayoutMonth(value).split("-");
    return year && month ? `${month}-${year}` : "";
};

/* "2026-07" → "July 2026" */
export const monthLabel = (value) => {
    const [year, month] = toPayoutMonth(value).split("-");
    const index = Number(month) - 1;
    return MONTH_NAMES[index] ? `${MONTH_NAMES[index]} ${year}` : String(value ?? "");
};

/* Arrears: the payout month pays for the month before it. The server derives this itself
   and returns attendanceMonthRaw — this is only for labelling before a cycle exists. */
export const attendanceMonthOf = (payoutMonth) => {
    const [year, month] = toPayoutMonth(payoutMonth).split("-").map(Number);
    if (!year || !month) return "";
    return month === 1 ? `${year - 1}-12` : `${year}-${pad(month - 1)}`;
};

/* ─────────────── Normalisers ─────────────── */

const asNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

/* Distinguishes "field absent" from "value is 0". Absent must not render as a real zero. */
const asNullableNumber = (value) => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

/**
 * One salary structure row.
 *
 * `hasStaffRecord: false` marks an ORPHAN — a structure whose owner was deleted or
 * converted to a student after it was created. Those rows still list and still count
 * toward the totals, which is why "Covered Staff" can read 102%. Payroll will never pay
 * them. Surface them rather than letting the percentage look like a bug.
 *
 * `deductions` is written by the payroll run, not by the structure screen. Read-only.
 */
export const structureFromApi = (item = {}) => ({
    rollNumber: String(item.rollNumber ?? ""),
    name: item.name ?? "",
    grade: item.grade ?? "",
    section: item.section ?? "",
    basicSalary: asNumber(item.basicSalary),
    // percentages of basic, NOT rupee amounts
    hra: asNumber(item.hra),
    da: asNumber(item.da),
    conveyanceAllowance: item.conveyanceAllowance ?? "",
    specialAllowance: item.specialAllowance ?? "",
    incentive: asNumber(item.incentive),
    addSalary: asNumber(item.addSalary),
    // free text: a rate ("12%") or an opt-out ("N/A")
    pf: item.pf ?? "",
    esi: item.esi ?? "",
    pt: item.pt ?? "",
    bankName: item.bankName ?? "",
    accountNumber: item.accountNumber ?? "",
    ifsc: item.ifsc ?? "",
    branch: item.branch ?? "",
    // server-computed since 19 Aug; used to always come back null
    grossSalary: asNumber(item.grossSalary),
    deductions: asNumber(item.deductions),
    // absent on older payloads — assume the staff member exists rather than flagging
    // every row as an orphan if the backend has not been migrated yet
    hasStaffRecord: item.hasStaffRecord !== false,
    extra: item,
});

/* A staff member in one of the two setup pickers. missingFields is populated on the bank
   list only; it is always [] on the salary-structure list. */
export const pickerEmployeeFromApi = (item = {}) => ({
    rollNumber: String(item.rollNumber ?? ""),
    name: item.name ?? "",
    gender: item.gender ?? "",
    userType: item.userType ?? "",
    department: item.department ?? "",
    missingFields: Array.isArray(item.missingFields) ? item.missingFields : [],
});

/* One payslip line. earnings[], deductions[] and employerContributions[] all share it.
   `formula` is the server's explanation of how the number was reached ("10% of Basic") —
   render it as secondary text so the FE never has to reproduce payroll maths. */
const payslipLineFromApi = (line = {}) => ({
    category: line.category ?? "",
    description: line.description ?? "",
    formula: line.formula ?? "",
    amount: asNumber(line.amount),
});

/**
 * A full payslip.
 *
 * employerContributions[] is what the SCHOOL pays on top of salary — employer PF, employer
 * ESI, PF admin charges. It is NOT part of totalDeductions, grossSalary or netSalary, and
 * it must never be rendered inside the deductions table: doing so reads as money taken
 * from the employee. Keep it in its own labelled block, or omit it from the staff-facing
 * payslip entirely and use it only on the admin cost view.
 *
 * All three lists are zero-suppressed by the API, so a line with amount 0 is simply
 * absent. Render by looping — never against a fixed hardcoded row list.
 */
export const payslipFromApi = (data = {}) => ({
    employee: {
        rollNumber: String(data.employee?.rollNumber ?? ""),
        name: data.employee?.name ?? "",
        department: data.employee?.department ?? "—",
        bankName: data.employee?.bankName ?? "",
        accountNumber: data.employee?.accountNumber ?? "",
        ifsc: data.employee?.ifsc ?? "",
        branch: data.employee?.branch ?? "",
    },
    cycle: {
        academicYear: data.cycle?.academicYear ?? "",
        payoutMonth: data.cycle?.payoutMonth ?? "",
        attendanceMonth: data.cycle?.attendanceMonth ?? "",
        status: data.cycle?.status ?? "",
        paymentDate: data.cycle?.paymentDate ?? "",
    },
    /* Explains WHY the pay is what it is — surface it next to the totals so a query about
       a short payslip answers itself. */
    attendance: {
        workingDays: asNumber(data.attendance?.workingDays),
        present: asNumber(data.attendance?.present),
        halfDay: asNumber(data.attendance?.halfDay),
        late: asNumber(data.attendance?.late),
        totalLateMinutes: asNumber(data.attendance?.totalLateMinutes),
        absent: asNumber(data.attendance?.absent),
        paidLeave: asNumber(data.attendance?.paidLeave),
        lop: asNumber(data.attendance?.lop),
        permissionMinutes: asNumber(data.attendance?.permissionMinutes),
        informedLeaveDays: asNumber(data.attendance?.informedLeaveDays),
        shiftName: data.attendance?.shiftName ?? "",
        shiftStart: data.attendance?.shiftStart ?? "",
        shiftEnd: data.attendance?.shiftEnd ?? "",
    },
    earnings: (data.earnings || []).map(payslipLineFromApi),
    deductions: (data.deductions || []).map(payslipLineFromApi),
    // added 19 Aug — comes back empty while the employer percentages are still at 0
    employerContributions: (data.employerContributions || []).map(payslipLineFromApi),
    totals: {
        totalEarnings: asNumber(data.totals?.totalEarnings),
        totalDeductions: asNumber(data.totals?.totalDeductions),
        grossSalary: asNumber(data.totals?.grossSalary),
        netSalary: asNumber(data.totals?.netSalary),
    },
    /* The working, if you want to show it. When the policy defers the charge, `accrued`
       and `charged` belong to different months. */
    paidLeave: {
        days: asNumber(data.paidLeaveDeductionDays),
        accrued: asNumber(data.paidLeaveDeductionAccrued),
        charged: asNumber(data.paidLeaveDeduction),
    },
    extra: data,
});

/* ─────────────── Salary structures ─────────────── */

/** GET api/payRoll/getEmployees — every non-student staff member. Use for the EDIT flow;
    for CREATE use fetchEmployeesWithoutSalaryStructure so the "already exists" error
    becomes unreachable through the UI. */
export const fetchEmployees = async () => {
    try {
        const data = unwrap(await client.get(getEmployees), "Could not load employees.");
        const list = Array.isArray(data) ? data : data?.employees || [];
        // Excluded staff are not employees for payroll purposes — keep them out of the picker
        return (await withoutExcluded(list)).map(pickerEmployeeFromApi);
    } catch (error) {
        throw new Error(messageOf(error, "Could not load employees."));
    }
};

/**
 * The two setup pickers — GET, no parameters, one shared response shape.
 *
 * `pending === 0` is worth handling: disable Create and say "All 165 staff have a salary
 * structure" rather than opening an empty picker. completed/totalEmployees drives a
 * "158 of 165 set up" line for free.
 */
const fetchPicker = async (url, fallback) => {
    try {
        const data = unwrap(await client.get(url), fallback);
        return {
            totalEmployees: asNumber(data?.totalEmployees),
            completed: asNumber(data?.completed),
            pending: asNumber(data?.pending),
            employees: (data?.employees || []).map(pickerEmployeeFromApi),
        };
    } catch (error) {
        throw new Error(messageOf(error, fallback));
    }
};

export const fetchEmployeesWithoutSalaryStructure = () =>
    fetchPicker(getEmployeesWithoutSalaryStructure, "Could not load staff awaiting a salary structure.");

/* Built from salaryStructure joined to Users, so anyone without a structure is already
   excluded — there is nowhere to store their bank details. No client-side filter needed. */
export const fetchEmployeesWithoutBankDetails = () =>
    fetchPicker(getEmployeesWithoutBankDetails, "Could not load staff awaiting bank details.");

/**
 * GET api/payRoll/salaryStructureDashboard — the list view.
 *
 * The three summary figures used to be computed client-side by summing the row list, which
 * works at 168 rows and breaks silently the day anyone paginates. They are returned now.
 * Covered Staff % stays an FE calculation: totalStructures / totalEmployees.
 */
export const fetchSalaryStructureDashboard = async () => {
    try {
        const data = unwrap(await client.get(salaryStructureDashboard), "Could not load salary structures.");
        return {
            totalStructures: asNumber(data?.totalStructures),
            totalEmployees: asNumber(data?.totalEmployees),
            // null until the server that computes these is deployed — the caller falls back
            averageGrossSalary: asNullableNumber(data?.averageGrossSalary),
            monthlyPayout: asNullableNumber(data?.monthlyPayout),
            // count of rows whose owner no longer exists as active non-student staff
            orphanedStructures: asNullableNumber(data?.orphanedStructures),
            /* Rows only. totalStructures / totalEmployees are the server's own arithmetic and
               still count excluded staff — that has to be fixed API-side, not papered over
               with a different number here. */
            structures: (await withoutExcluded(data?.salaryStructures || [])).map(structureFromApi),
        };
    } catch (error) {
        throw new Error(messageOf(error, "Could not load salary structures."));
    }
};

/**
 * Builds the create/update body.
 *
 * TotalEarnings is deliberately NOT sent. The server derives gross itself and discards it —
 * sending it would look meaningful and do nothing.
 *
 * On UPDATE, omitting a field leaves the stored value alone. That matters for incentive and
 * addSalary because the Employee Compliance screen can also write them, and a save here must
 * not silently wipe what was set there. To clear one, send 0 explicitly — never null.
 */
const structureToApi = (draft = {}, { partial = false } = {}) => {
    const body = {
        RollNumber: draft.rollNumber,
        BasicSalary: parseMoney(draft.basicSalary),
        HRA: parseRate(draft.hra),
        DA: parseRate(draft.da),
        ConveyanceAllowance: String(draft.conveyanceAllowance ?? ""),
        SpecialAllowance: String(draft.specialAllowance ?? ""),
        PF: String(draft.pf ?? ""),
        ESI: String(draft.esi ?? ""),
        PT: String(draft.pt ?? ""),
        BankName: String(draft.bankName ?? ""),
        AccountNumber: String(draft.accountNumber ?? ""),
        IFSC: String(draft.ifsc ?? ""),
        Branch: String(draft.branch ?? ""),
    };

    /* Paid every month by the engine but previously only reachable from the Employee
       Compliance tab, which left this screen's gross understated against actual pay. */
    const send = (key, value) => {
        if (partial && (value === undefined || value === null || value === "")) return;
        body[key] = parseMoney(value);
    };
    send("Incentive", draft.incentive);
    send("AddSalary", draft.addSalary);

    return body;
};

export const createSalaryStructure = async (draft) => {
    try {
        const response = await client.post(postSalaryStructure, structureToApi(draft));
        const data = unwrap(response, "Could not create the salary structure.");
        // grossSalary is populated on the response now — display THAT, not the preview
        return structureFromApi(data?.salaryStructure || data || {});
    } catch (error) {
        throw new Error(messageOf(error, "Could not create the salary structure."));
    }
};

export const updateSalaryStructure = async (draft) => {
    try {
        const response = await client.put(
            updateSalaryStructureByRollnumber,
            structureToApi(draft, { partial: true })
        );
        const data = unwrap(response, "Could not update the salary structure.");
        return structureFromApi(data?.salaryStructure || data || {});
    } catch (error) {
        throw new Error(messageOf(error, "Could not update the salary structure."));
    }
};

export const deleteSalaryStructure = async (rollNumber) => {
    try {
        const response = await client.delete(deleteSalaryStructureByRollnumber, {
            params: { rollNumber },
        });
        unwrap(response, "Could not delete the salary structure.");
        return true;
    } catch (error) {
        throw new Error(messageOf(error, "Could not delete the salary structure."));
    }
};

/* ─────────────── Statutory config ───────────────

   This is ONE app-wide, single-row config split across three POST screens. The three POSTs
   write different column groups of the same deductionsandcompliance row and the GET returns
   all of it — treat it as one settings page with three tabs, not three records.

   TDS was the fourth tab. It is switched off: standardDeduction, section80cLimit,
   section80DLimit and hraExemption are gone from the response. */

export const complianceConfigFromApi = (data = {}) => ({
    pf: {
        // Omitting the enable flag on a save is treated as TRUE server-side, so an FE that
        // never sends it keeps today's behaviour rather than silently switching PF off.
        enabled: data.pfEnabled !== false,
        employeeContribution: data.pfEmployeeContribution ?? "",
        employerContribution: data.pfEmployerContribution ?? "",
        // spelling is the server's
        wageCeiling: data.pfWageCellingLimite ?? "",
        adminCharges: data.pfAdminCharges ?? "",
    },
    esi: {
        enabled: data.esiEnabled !== false,
        employeeContribution: data.esiEmployeeContribution ?? "",
        employerContribution: data.esiEmployerContribution ?? "",
        wageCeiling: data.esiWageCellingLimite ?? "",
    },
    pt: {
        enabled: data.ptEnabled !== false,
        monthly: data.monthlyPTDeduction ?? "",
        annual: data.annualPTDeduction ?? "",
        // belongs to PT despite sitting next to the dropped TDS columns
        applicableFrom: data.applicationFromSalary ?? "",
    },
    extra: data,
});

export const fetchComplianceConfig = async () => {
    try {
        const data = unwrap(await client.get(getDeductionsAndCompliance), "Could not load the statutory configuration.");
        return complianceConfigFromApi(data || {});
    } catch (error) {
        throw new Error(messageOf(error, "Could not load the statutory configuration."));
    }
};

const postConfig = async (url, body, fallback) => {
    try {
        const data = unwrap(await client.post(url, body), fallback);
        // every statutory POST returns the same whole-config object the GET returns
        return complianceConfigFromApi(data || {});
    } catch (error) {
        throw new Error(messageOf(error, fallback));
    }
};

/* PF is calculated on Basic + DA since 19 Aug, capped at the wage ceiling. The ceiling is a
   cap on the BASE, not an eligibility test — someone earning well above it still pays PF,
   calculated on the ceiling. That is the opposite of how the ESI ceiling behaves, which is
   why the two hints must be worded differently. */
export const savePFConfiguration = ({ enabled, employeeContribution, employerContribution, wageCeiling, adminCharges, updatedByRollNumber }) =>
    postConfig(
        postPFConfiguration,
        {
            PFEnabled: Boolean(enabled),
            PFEmployeeContribution: String(employeeContribution ?? ""),
            PFEmployerContribution: String(employerContribution ?? ""),
            PFWageCellingLimite: String(wageCeiling ?? ""),
            PFAdminCharges: String(adminCharges ?? ""),
            UpdatedByRollNumber: updatedByRollNumber,
        },
        "Could not save the PF configuration."
    );

/* ESI eligibility is tested on CONTRACTED gross, not the pro-rated month, so coverage no
   longer flickers month to month with attendance. At exactly the ceiling ESI applies. */
export const saveESIConfiguration = ({ enabled, employeeContribution, employerContribution, wageCeiling, updatedByRollNumber }) =>
    postConfig(
        postESIConfiguration,
        {
            ESIEnabled: Boolean(enabled),
            ESIEmployeeContribution: String(employeeContribution ?? ""),
            ESIEmployerContribution: String(employerContribution ?? ""),
            ESIWageCellingLimite: String(wageCeiling ?? ""),
            UpdatedByRollNumber: updatedByRollNumber,
        },
        "Could not save the ESI configuration."
    );

/* Applicable From Salary is enforced now — PT applies only when contracted gross is AT OR
   ABOVE it. Annual PT is a real ceiling, so the last chargeable month of the year may show
   a part-month amount. A threshold or annual cap left at 0 means "not configured". */
export const savePTConfiguration = ({ enabled, monthly, annual, applicableFrom, updatedByRollNumber }) =>
    postConfig(
        postProfessionalTaxConfiguration,
        {
            PTEnabled: Boolean(enabled),
            MonthlyPTDeduction: String(monthly ?? ""),
            AnnualPTDeduction: String(annual ?? ""),
            ApplicationFromSalary: String(applicableFrom ?? ""),
            UpdatedByRollNumber: updatedByRollNumber,
        },
        "Could not save the Professional Tax configuration."
    );

/* Which staff each deduction actually applies to. The `tds` field is gone from every row. */
export const fetchEmployeeCompliance = async () => {
    try {
        const data = unwrap(await client.get(employeeComplianceDashboard), "Could not load employee compliance.");
        const list = Array.isArray(data) ? data : data?.employees || data?.employeeCompliance || [];
        return (await withoutExcluded(list)).map((item = {}) => ({
            rollNumber: String(item.rollNumber ?? ""),
            name: item.name ?? "",
            grade: item.grade ?? "",
            section: item.section ?? "",
            department: item.department ?? "",
            basicSalary: asNumber(item.basicSalary),
            grossSalary: asNumber(item.grossSalary),
            pf: item.pf ?? "",
            esi: item.esi ?? "",
            pt: item.pt ?? "",
            incentive: asNumber(item.incentive),
            addSalary: asNumber(item.addSalary),
            extra: item,
        }));
    } catch (error) {
        throw new Error(messageOf(error, "Could not load employee compliance."));
    }
};

/* Writes back to that person's salaryStructure PF/ESI/PT text fields. `tds` is no longer
   accepted — the server ignores unknown fields, so sending it would silently do nothing. */
export const updateEmployeeCompliance = async ({ rollNumber, pf, esi, pt, incentive, addSalary, updatedByRollNumber }) => {
    const body = {
        RollNumber: rollNumber,
        PF: String(pf ?? ""),
        ESI: String(esi ?? ""),
        PT: String(pt ?? ""),
        UpdatedByRollNumber: updatedByRollNumber,
    };
    // same preserve-on-omit rule as the structure screen
    if (incentive !== undefined && incentive !== null && incentive !== "") body.Incentive = parseMoney(incentive);
    if (addSalary !== undefined && addSalary !== null && addSalary !== "") body.AddSalary = parseMoney(addSalary);

    try {
        const data = unwrap(await client.put(updateEmployeeComplianceByRollnumber, body), "Could not update compliance.");
        return data;
    } catch (error) {
        throw new Error(messageOf(error, "Could not update compliance."));
    }
};

/* ─────────────── Bank details ───────────────

   Bank details are COLUMNS ON THE salaryStructure ROW — BankName, AccountNumber, IFSC,
   Branch. There is no separate bank table, so a staff member without a salary structure
   has nowhere for them to be stored. That is a hard data dependency, not a UX rule.

   They are snapshotted onto the payslip when a cycle reaches Credited, so edits after that
   point do not retroactively change historic payslips. */

export const fetchBankDetails = async () => {
    try {
        const data = unwrap(await client.get(employeeBankDetailsDashboard), "Could not load bank details.");
        const list = Array.isArray(data) ? data : data?.employees || data?.bankDetails || [];
        return (await withoutExcluded(list)).map((item = {}) => ({
            rollNumber: String(item.rollNumber ?? ""),
            name: item.name ?? "",
            department: item.department ?? "",
            grade: item.grade ?? "",
            section: item.section ?? "",
            bankName: item.bankName ?? "",
            accountNumber: item.accountNumber ?? "",
            ifsc: item.ifsc ?? "",
            branch: item.branch ?? "",
            netSalary: asNumber(item.netSalary ?? item.grossSalary),
            extra: item,
        }));
    } catch (error) {
        throw new Error(messageOf(error, "Could not load bank details."));
    }
};

export const updateBankDetails = async ({ rollNumber, bankName, accountNumber, ifsc, branch, updatedByRollNumber }) => {
    try {
        const data = unwrap(
            await client.put(updateEmployeeBankDetailsByRollnumber, {
                RollNumber: rollNumber,
                BankName: String(bankName ?? ""),
                AccountNumber: String(accountNumber ?? ""),
                IFSC: String(ifsc ?? ""),
                Branch: String(branch ?? ""),
                UpdatedByRollNumber: updatedByRollNumber,
            }),
            "Could not update the bank details."
        );
        return data;
    } catch (error) {
        throw new Error(messageOf(error, "Could not update the bank details."));
    }
};

/* ─────────────── Registers & payslip history (api/payRoll) ─────────────── */

export const fetchSalaryRegisterDashboard = async () => {
    try {
        const data = unwrap(await client.get(salaryRegisterDashboard), "Could not load the salary register.");
        return data;
    } catch (error) {
        throw new Error(messageOf(error, "Could not load the salary register."));
    }
};

/* The approval queue. The payslip deductions block no longer carries tdsLabel/tdsAmount;
   totalDeductions is now PF + ESI + PT + payroll-rule deductions. If anything recomputes
   that total client-side, TDS must come out of the sum or it will disagree with the server. */
export const fetchApprovalPayslips = async () => {
    try {
        const data = unwrap(await client.get(approvePayrollPayslipsDashboard), "Could not load the approval queue.");
        return data;
    } catch (error) {
        throw new Error(messageOf(error, "Could not load the approval queue."));
    }
};

/* NOTE the month format here is MM-yyyy — NOT the YYYY-MM the cycle endpoints use. */
export const fetchPayslipHistory = async ({ rollNumber, fromMonth, toMonth }) => {
    try {
        const data = unwrap(
            await client.get(getPayrollPayslipByRollNumber, {
                params: {
                    RollNumber: rollNumber,
                    FromMonth: toMonthYear(fromMonth),
                    ToMonth: toMonthYear(toMonth),
                },
            }),
            "Could not load the payslip history."
        );
        return data;
    } catch (error) {
        throw new Error(messageOf(error, "Could not load the payslip history."));
    }
};

/* ─────────────── The monthly cycle (api/payroll) ─────────────── */

/** The stage machine, in order. Credited is TERMINAL — there is no rollback from it by
    design; corrections go into the next cycle as an adjustment. Don't offer the button. */
export const PAYROLL_STAGE_ORDER = ["None", "AttendanceLocked", "Calculated", "Approved", "Credited"];

export const cycleFromApi = (data = {}) => ({
    academicYear: data.academicYear ?? "",
    // both forms are returned: display the human one, send back the raw one
    payoutMonth: data.payoutMonth ?? "",
    payoutMonthRaw: data.payoutMonthRaw ?? "",
    attendanceMonth: data.attendanceMonth ?? "",
    attendanceMonthRaw: data.attendanceMonthRaw ?? "",
    status: data.status ?? "None",
    stages: {
        attendanceLocked: data.attendanceLocked || { done: false, on: null, byRollNumber: null },
        calculated: data.calculated || { done: false, on: null, byRollNumber: null },
        approved: data.approved || { done: false, on: null, byRollNumber: null },
        credited: data.credited || { done: false, on: null, byRollNumber: null },
    },
    totalEmployees: asNumber(data.totalEmployees),
    totalGross: asNumber(data.totalGross),
    totalDeductions: asNumber(data.totalDeductions),
    totalNet: asNumber(data.totalNet),
    extra: data,
});

/**
 * GET api/payroll/cycle?payoutMonth=2026-07 — drive the whole stepper from this.
 *
 * It returns a done/on/byRollNumber block per stage. Render the stepper and decide which
 * single action button to enable from the response, not from client-side state.
 */
export const fetchPayrollCycle = async ({ payoutMonth, academicYear }) => {
    try {
        const params = { payoutMonth: toPayoutMonth(payoutMonth) };
        if (academicYear) params.academicYear = academicYear;
        const data = unwrap(await client.get(getPayrollCycle, { params }), "Could not load the payroll cycle.");
        return cycleFromApi(data || {});
    } catch (error) {
        throw new Error(messageOf(error, "Could not load the payroll cycle."));
    }
};

/**
 * Every stage POST takes the identical body.
 *
 * `calculate` is the one that fails loudly on missing setup, with a structured error naming
 * exactly who is missing what. Those two arrays are actionable lists, not decoration — the
 * caller gets them attached to the thrown error so the screen can deep-link to the fixing
 * screens. A generic "calculation failed" wastes the admin's time; this is the single most
 * common payroll failure.
 */
const postStage = async (url, { academicYear, payoutMonth, actionByRollNumber, actionByUserType }, fallback) => {
    try {
        const data = unwrap(
            await client.post(url, {
                academicYear,
                payoutMonth: toPayoutMonth(payoutMonth),
                actionByRollNumber,
                actionByUserType,
            }),
            fallback
        );
        return cycleFromApi(data || {});
    } catch (error) {
        const body = error?.response?.data;
        const failure = new Error(messageOf(error, fallback));
        failure.missingSalaryStructure = body?.missingSalaryStructure || [];
        failure.missingShiftAssignment = body?.missingShiftAssignment || [];
        throw failure;
    }
};

/* Stage 1 — freezes the attendance month. Once a cycle leaves None, manual attendance for
   that month is rejected with a 400 naming the stage: fixing a punch needs a rollback
   first, so offer that action rather than leaving the admin at a dead end. */
export const lockAttendance = (payload) =>
    postStage(payrollCycleLockAttendance, payload, "Could not lock attendance.");

/* Stage 2 — runs the engine and writes one payslip per staff member.
   400 "Attendance must be locked first before calculation." if stage 1 was skipped. */
export const calculatePayroll = (payload) =>
    postStage(payrollCycleCalculate, payload, "Could not calculate payroll.");

/* Stage 3 — locks the numbers. */
export const approvePayroll = (payload) =>
    postStage(payrollCycleApprove, payload, "Could not approve payroll.");

/* Stage 4 — records payment. Terminal. */
export const markPayrollCredited = (payload) =>
    postStage(payrollCycleMarkCredited, payload, "Could not mark payroll as credited.");

/* Steps back exactly one stage. 400 on a credited cycle:
   "Cannot roll back — issue an adjustment in the next cycle." */
export const rollbackPayrollCycle = (payload) =>
    postStage(payrollCycleRollback, payload, "Could not roll back the cycle.");

/**
 * GET api/payroll/register?payoutMonth=2026-07 — 400 "Payroll not yet calculated for this
 * month." before stage 2.
 *
 * Row `status` is Draft / Approved / Paid — the payslip's own state, distinct from the
 * cycle's stage. `basicSalary` comes from the LIVE salary structure while grossSalary
 * onward are FROZEN at calculation, so they can legitimately disagree if someone edited a
 * structure after calculating. That is expected, not a bug.
 */
export const fetchPayrollRegister = async ({ payoutMonth }) => {
    try {
        const data = unwrap(
            await client.get(getPayrollRegister, { params: { payoutMonth: toPayoutMonth(payoutMonth) } }),
            "Could not load the payroll register."
        );
        return {
            academicYear: data?.academicYear ?? "",
            payoutMonth: data?.payoutMonth ?? "",
            payoutMonthRaw: data?.payoutMonthRaw ?? "",
            status: data?.status ?? "",
            count: asNumber(data?.count),
            totalGross: asNumber(data?.totalGross),
            totalDeductions: asNumber(data?.totalDeductions),
            totalNet: asNumber(data?.totalNet),
            rows: (data?.rows || []).map((row = {}) => ({
                sno: asNumber(row.sno),
                rollNumber: String(row.rollNumber ?? ""),
                name: row.name ?? "",
                // derived from Users.SubUserType, falls back to "—"
                department: row.department ?? "—",
                basicSalary: asNumber(row.basicSalary),
                grossSalary: asNumber(row.grossSalary),
                deductions: asNumber(row.deductions),
                netSalary: asNumber(row.netSalary),
                paymentDate: row.paymentDate ?? "",
                status: row.status ?? "Draft",
                extra: row,
            })),
            extra: data,
        };
    } catch (error) {
        throw new Error(messageOf(error, "Could not load the payroll register."));
    }
};

/* Admin view. 400 "No payslip for '…' in this cycle." for an unknown roll number. */
export const fetchPayslip = async ({ payoutMonth, rollNumber }) => {
    try {
        const data = unwrap(
            await client.get(getPayrollPayslip, {
                params: { payoutMonth: toPayoutMonth(payoutMonth), rollNumber },
            }),
            "Could not load the payslip."
        );
        return payslipFromApi(data || {});
    } catch (error) {
        throw new Error(messageOf(error, "Could not load the payslip."));
    }
};

/* Self-service view — identical shape to fetchPayslip. */
export const fetchMyPayslip = async ({ payoutMonth, rollNumber }) => {
    try {
        const data = unwrap(
            await client.get(getMyPayrollPayslip, {
                params: { payoutMonth: toPayoutMonth(payoutMonth), rollNumber },
            }),
            "Could not load your payslip."
        );
        return payslipFromApi(data || {});
    } catch (error) {
        throw new Error(messageOf(error, "Could not load your payslip."));
    }
};
