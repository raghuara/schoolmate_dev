import axios from "axios";

import { withActor } from "./apiActor";
import { getPayrollCoverage } from "../../Api/Api";

/**
 * The excluded set — people the school has taken off payroll and attendance.
 *
 * WHY IT LIVES HERE
 * Coverage is decided once on the Payroll & Attendance Coverage screen, but it has to be
 * honoured everywhere a staff list appears: the attendance roster, the overview, reports,
 * shift assignment, and the payroll tabs. Filtering in each screen would mean the same
 * rule written a dozen times, drifting apart the moment one of them is edited — so the
 * list is fetched once here and the wrappers apply it as the rows are normalised.
 *
 * FAIL OPEN, DELIBERATELY
 * If the coverage call fails, nothing is filtered. A failure that HID staff would look
 * exactly like "these people were excluded" — an admin would see a short roster and no
 * error, and might mark attendance for a school whose staff had silently vanished from the
 * list. Showing someone who should have been excluded is the recoverable mistake; hiding
 * someone who should be there is not.
 *
 * NOT A SUBSTITUTE FOR THE SERVER
 * This trims lists the API still returns in full, so server-computed totals (payroll
 * payouts, salaryStructureDashboard's employee count) continue to include excluded people
 * until the API filters them too. The screens read correctly; the arithmetic behind them
 * is the backend's to fix.
 */

const API_TOKEN = "123";

const client = withActor(axios.create({ headers: { Authorization: `Bearer ${API_TOKEN}` } }));

/* One fetch per session, shared by every caller. `inflight` collapses the burst of
   parallel calls a screen makes on mount into a single request. */
let cache = null;
let inflight = null;

const readExcluded = async () => {
    const res = await client.get(getPayrollCoverage);
    if (res?.data?.error) throw new Error(res.data.message || "coverage unavailable");
    const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
    return new Set(
        rows.filter((row) => row.isExcluded === true).map((row) => String(row.rollNumber ?? "")),
    );
};

/**
 * The excluded roll numbers. Resolves to an EMPTY set when coverage cannot be read, so a
 * caller filtering on it removes nobody.
 */
export const loadExcluded = async ({ force = false } = {}) => {
    if (cache && !force) return cache;
    if (!inflight || force) {
        inflight = readExcluded()
            .then((set) => {
                cache = set;
                return set;
            })
            .catch(() => new Set())
            .finally(() => {
                inflight = null;
            });
    }
    return inflight;
};

/* Call after saving coverage so the next list reflects the change. */
export const refreshExcluded = () => loadExcluded({ force: true });

/* Synchronous check, for code that already has the set or can tolerate "not yet loaded". */
export const isExcludedNow = (rollNumber) => Boolean(cache?.has(String(rollNumber ?? "")));

/**
 * Drop excluded people from a list of rows.
 *
 * `pick` reads the roll number, because the field is spelled differently across responses
 * (`rollNumber`, `RollNumber`, `employeeId` on the biometric rows).
 */
export const withoutExcluded = async (rows, pick = (row) => row.rollNumber) => {
    if (!Array.isArray(rows) || rows.length === 0) return rows;
    const excluded = await loadExcluded();
    if (excluded.size === 0) return rows;
    return rows.filter((row) => !excluded.has(String(pick(row) ?? "")));
};

/** True when this person is off payroll and attendance. */
export const isExcluded = async (rollNumber) => {
    const excluded = await loadExcluded();
    return excluded.has(String(rollNumber ?? ""));
};
