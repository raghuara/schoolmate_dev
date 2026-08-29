import axios from "axios";

import { withActor, currentRollNumber } from "./apiActor";
import { GetAllUserTypes, getPayrollCoverage, savePayrollCoverage } from "../../Api/Api";

/**
 * Payroll & attendance coverage — who counts as an employee.
 *
 * WHY THIS EXISTS
 * Payroll currently treats every non-student user as an employee: salaryStructureDashboard
 * reports 165, which is exactly Super Admin (1) + Admin (5) + Teacher (112) + Staff (47).
 * That sweeps in people who are never paid through the system and never mark attendance —
 * the correspondent, the principal, a trustee. Excluding them here keeps them out of
 * payroll runs, the attendance roster, bank details and the salary register without
 * deleting the user account they still sign in with.
 *
 * WHERE THE ROSTER COMES FROM
 * GetAllUserTypes, because it is the only route that returns Super Admins. The staff and
 * payroll routes both omit them, which is why they were invisible to this problem.
 * Students are dropped — this screen is about employees, and there are ~1,945 of them.
 */

const API_TOKEN = "123";

const client = withActor(axios.create({ headers: { Authorization: `Bearer ${API_TOKEN}` } }));

const messageOf = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data?.message) return data.message;
    return error?.message || fallback;
};

/* Students are users, but they are not employees — this screen never lists them. */
export const STUDENT_USER_TYPE = "Student";

/* What being excluded actually turns off. Shown on the screen so the person
   making the call can see the consequences before saving. */
export const EXCLUSION_EFFECTS = [
    "Payroll runs and salary structures",
    "Attendance marking and login times",
    "Bank details and salary register",
    "Statutory compliance (PF, ESI, PT, TDS)",
];

/* Roles whose members are usually excluded. Only used to explain the default on an
   empty roster — nothing is auto-excluded, the choice stays explicit. */
export const TYPICALLY_EXCLUDED_ROLES = ["Super Admin"];

/**
 * Every employee-eligible user, flattened out of the user-type tree.
 *
 * GetAllUserTypes answers { data: [{ userTypeID, userType, userCount, users: [...] }] }.
 * Roles with no users (leftover test roles) fall away on their own.
 */
export const fetchCoverageRoster = async () => {
    try {
        const res = await client.get(GetAllUserTypes);
        if (res?.data?.error) {
            return { ok: false, message: res.data.message || "Could not load the user list" };
        }
        const types = Array.isArray(res?.data?.data) ? res.data.data : [];
        const rows = [];
        types.forEach((type) => {
            if (type.userType === STUDENT_USER_TYPE) return;
            (type.users || []).forEach((user) => {
                rows.push({
                    rollNumber: String(user.rollNumber ?? ""),
                    name: user.name || "",
                    userType: type.userType || "",
                    userTypeID: type.userTypeID ?? null,
                });
            });
        });
        rows.sort(
            (a, b) => a.userType.localeCompare(b.userType) || a.name.localeCompare(b.name),
        );
        return {
            ok: true,
            rows,
            // Kept so the filter can offer a role that currently has no members
            roles: types
                .filter((t) => t.userType !== STUDENT_USER_TYPE)
                .map((t) => t.userType)
                .filter(Boolean),
        };
    } catch (error) {
        return { ok: false, message: messageOf(error, "Could not load the user list") };
    }
};

/* ─────────────── Coverage decisions ───────────────

   The two routes below do not exist yet (they 404). Until they ship the decisions are
   held in a local draft so the screen is usable and nothing is silently lost; every
   read prefers the API and only falls back when the route is genuinely absent.
   Delete `readDraft` / `writeDraft` and the `pending` flags once the API lands — no
   change to StaffCoveragePage is needed. */

const DRAFT_KEY = "payrollCoverageDraft";

/* Local storage throws in a private window or with site data blocked, so every access
   is guarded — a missing draft is a valid state, not an error. */
const readDraft = () => {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        return null;
    }
};

const writeDraft = (map) => {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(map));
        return true;
    } catch {
        return false;
    }
};

/* A 404 means "route not built"; anything else is a real failure worth showing. */
const isMissingRoute = (error) => error?.response?.status === 404 || !error?.response;

/**
 * Current decisions as { [rollNumber]: { included: boolean, reason: string } }.
 *
 * Anyone absent from the map is included — that is the safe default, since leaving a
 * real employee off payroll is worse than carrying an extra row someone can exclude.
 */
export const fetchCoverage = async (academicYear) => {
    try {
        const res = await client.get(getPayrollCoverage, { params: { academicYear } });
        if (res?.data?.error) {
            return { ok: false, message: res.data.message || "Could not load coverage" };
        }
        const items = res?.data?.data?.items ?? res?.data?.items ?? [];
        const map = {};
        items.forEach((item) => {
            const roll = String(item.rollNumber ?? "");
            if (!roll) return;
            map[roll] = {
                included: item.included !== false,
                reason: item.reason || "",
            };
        });
        return { ok: true, map, pending: false };
    } catch (error) {
        if (isMissingRoute(error)) {
            return { ok: true, map: readDraft() || {}, pending: true };
        }
        return { ok: false, message: messageOf(error, "Could not load coverage") };
    }
};

/**
 * Persist the decisions.
 *
 * Sends only the excluded people plus their reason — the included set is everyone else,
 * so the payload stays small and adding a new member of staff does not need a save here.
 */
export const saveCoverage = async ({ academicYear, map }) => {
    const excluded = Object.entries(map)
        .filter(([, value]) => value && value.included === false)
        .map(([rollNumber, value]) => ({ rollNumber, reason: (value.reason || "").trim() }));

    try {
        const res = await client.post(savePayrollCoverage, {
            academicYear,
            updatedByRollNumber: currentRollNumber(),
            excluded,
        });
        if (res?.data?.error) {
            return { ok: false, message: res.data.message || "Could not save coverage" };
        }
        writeDraft(map);
        return { ok: true, message: res?.data?.message || "Coverage saved", pending: false };
    } catch (error) {
        if (isMissingRoute(error)) {
            const stored = writeDraft(map);
            return stored
                ? {
                      ok: true,
                      pending: true,
                      message: `Saved on this device — ${excluded.length} excluded. The coverage API is not live yet, so this has not reached the server.`,
                  }
                : {
                      ok: false,
                      message: "Could not save: the coverage API is not live and this browser is blocking local storage.",
                  };
        }
        return { ok: false, message: messageOf(error, "Could not save coverage") };
    }
};
