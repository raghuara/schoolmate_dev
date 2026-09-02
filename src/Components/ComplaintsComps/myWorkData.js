// "My Work" — the staff-facing queue. A staff member sees only the complaints and
// internal actions assigned to them, so this list is scoped by the signed-in user
// on the server, not filtered client-side.
//
// Mirrors the dev-Figma comp 1:1. This screen uses a slightly different palette
// from the admin screens (Tailwind-ish #FEE2E2 / #FEF3C7 / #DBEAFE / #CCFBF1
// chips), kept local here rather than pushed into the shared tokens.

export const MY_WORK_TABS = ["Parent Complaints", "Internal Complaints"];

// Priority pill on the ID column.
export const MY_WORK_PRIORITY_TONES = {
    "HIGH PRIORITY": { bg: "#FEE2E2", color: "#EF4444" },
    CRITICAL: { bg: "#FEE2E2", color: "#EF4444" },
    NORMAL: { bg: "#E2E8F0", color: "#64748B" },
    LOW: { bg: "#E2E8F0", color: "#64748B" },
};

export const MY_WORK_STATUS_TONES = {
    // What the intake API returns on creation, before anyone picks it up
    Open: { bg: "#FEF3C7", color: "#F59E0B" },
    "Action Required": { bg: "#FEF3C7", color: "#F59E0B" },
    "Under Review": { bg: "#DBEAFE", color: "#3B82F6" },
    "In Progress": { bg: "#CCFBF1", color: "#0D9488" },
    Resolved: { bg: "#CCFBF1", color: "#0D9488" },
    Closed: { bg: "#E2E8F0", color: "#64748B" },
};

// Column widths from the comp; Title / Category takes the remaining space.
export const MY_WORK_COLS = {
    id: 180,
    student: 180,
    status: 140,
    due: 140,
    gap: 2.5,
    minWidth: 940,
};

export const ALL_PRIORITIES = "All Priorities";
export const ALL_STATUSES = "All Statuses";

// Filter options are derived from the rows so they stay right when real data lands.
export const myWorkFilterOptions = (rows = []) => ({
    priority: [ALL_PRIORITIES, ...new Set(rows.map((r) => r.priority))],
    status: [ALL_STATUSES, ...new Set(rows.map((r) => r.status))],
});
