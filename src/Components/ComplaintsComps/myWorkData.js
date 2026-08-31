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

// { id, ref, priority, category, title, student, grade, status, due, dueUrgent }
// `dueUrgent` drives the red treatment on the due cell.
export const MY_WORK_ITEMS = {
    "Parent Complaints": [
        {
            id: "MSMS-CMP-2026-000124",
            ref: "MSMS-CMP-2026-000124",
            priority: "HIGH PRIORITY",
            category: "Teacher-Related Concern",
            title: "Concern regarding teacher feedback",
            student: "Aarav Kumar",
            grade: "Grade VIII-B",
            status: "Action Required",
            due: "Due: Tomorrow",
            dueUrgent: true,
        },
        {
            id: "MSMS-CMP-2026-000095",
            ref: "MSMS-CMP-2026-000095",
            priority: "NORMAL",
            category: "Classroom Behavior",
            title: "Disturbance during Mathematics session",
            student: "Rohan Sharma",
            grade: "Grade IX-A",
            status: "Under Review",
            due: "Due: 20 Aug 2026",
            dueUrgent: false,
        },
        {
            id: "MSMS-CMP-2026-000088",
            ref: "MSMS-CMP-2026-000088",
            priority: "HIGH PRIORITY",
            category: "Academic Integrity",
            title: "Unapproved material during mid-term exam",
            student: "Priya Patel",
            grade: "Grade X-C",
            status: "In Progress",
            due: "Due: 19 Aug 2026",
            dueUrgent: false,
        },
    ],
    // The comp's tab badge reads 4 but only draws the Parent rows. These four are
    // placeholders so the tab is not empty — replace with the assigned-actions API.
    "Internal Complaints": [
        {
            id: "MSMS-OBS-2026-00042",
            ref: "MSMS-OBS-2026-00042",
            priority: "HIGH PRIORITY",
            category: "Safety & Compliance",
            title: "Broken stair tread in Block-B staircase",
            student: "West Wing Staircase 2",
            grade: "Block-B",
            status: "Action Required",
            due: "Due: 18 Aug 2026",
            dueUrgent: true,
        },
        {
            id: "MSMS-IES-2026-000041",
            ref: "MSMS-IES-2026-000041",
            priority: "NORMAL",
            category: "Audit",
            title: "Library inventory audit Q3",
            student: "Library",
            grade: "Main Block",
            status: "In Progress",
            due: "Due: 22 Aug 2026",
            dueUrgent: false,
        },
        {
            id: "MSMS-IES-2026-000040",
            ref: "MSMS-IES-2026-000040",
            priority: "HIGH PRIORITY",
            category: "Training",
            title: "Staff training attendance tracking",
            student: "Staff Room",
            grade: "Admin Block",
            status: "Under Review",
            due: "Due: 19 Aug 2026",
            dueUrgent: false,
        },
        {
            id: "MSMS-IES-2026-000039",
            ref: "MSMS-IES-2026-000039",
            priority: "HIGH PRIORITY",
            category: "Safety",
            title: "Fire drill compliance check",
            student: "Whole Campus",
            grade: "All Blocks",
            status: "Action Required",
            due: "Due: 25 Aug 2026",
            dueUrgent: false,
        },
    ],
};

export const ALL_PRIORITIES = "All Priorities";
export const ALL_STATUSES = "All Statuses";

// Filter options are derived from the rows so they stay right when real data lands.
export const myWorkFilterOptions = (rows = []) => ({
    priority: [ALL_PRIORITIES, ...new Set(rows.map((r) => r.priority))],
    status: [ALL_STATUSES, ...new Set(rows.map((r) => r.status))],
});
