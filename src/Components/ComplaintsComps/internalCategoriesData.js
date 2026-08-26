// Internal Complaints > Categories — mock rows mirroring the dev-Figma comp 1:1.
// Replace INTERNAL_CATEGORY_ROWS with the internal-categories API response.
//
// Priority and status chips reuse PRIORITY_STYLE / STATUS_STYLE from
// complaintCategoriesData.js — the two comps use the identical palettes.

// Column widths from the comp, with one deliberate change: the comp lets Default
// Owner flex, but its values are the shortest in the table ("IT Team",
// "Coordinator"), so on a wide content area that column absorbed all the slack and
// stranded a few hundred pixels of gap before Status. Category Name flexes instead
// — it holds the longest text ("Technology & Digital Systems") — and Owner is
// pinned. Same reasoning as the Notification Templates table.
//
// Note this table has no Description column and its priority chip is 90px wide,
// where the Parent Categories table uses 100px.
export const INTERNAL_CATEGORY_COLS = {
    name: 220,      // minimum width for the flexing Category Name cell
    priority: 120,
    owner: 200,
    status: 100,
    actions: 110,
    gap: "25px",
    minWidth: 860,
    priorityChipWidth: 90,
};

// { id, name, priority, owner, status }
export const INTERNAL_CATEGORY_ROWS = [
    { id: 1, name: "Academic & Teaching", priority: "NORMAL", owner: "Academic Coordinator", status: "ACTIVE" },
    { id: 2, name: "Classroom & Students", priority: "NORMAL", owner: "Class Coordinator", status: "ACTIVE" },
    { id: 3, name: "Staff & Professional Conduct", priority: "HIGH", owner: "Department Head", status: "ACTIVE" },
    { id: 4, name: "Facilities & Maintenance", priority: "HIGH", owner: "Facility Team", status: "ACTIVE" },
    { id: 5, name: "Cleanliness & Hygiene", priority: "NORMAL", owner: "Housekeeping", status: "ACTIVE" },
    { id: 6, name: "Administration & Records", priority: "NORMAL", owner: "Admin Team", status: "ACTIVE" },
    { id: 7, name: "Communication & Coordination", priority: "NORMAL", owner: "Coordinator", status: "ACTIVE" },
    { id: 8, name: "Transport & Security", priority: "HIGH", owner: "Operations Team", status: "ACTIVE" },
    { id: 9, name: "Events & Scheduling", priority: "NORMAL", owner: "Coordinator", status: "ACTIVE" },
    { id: 10, name: "Technology & Digital Systems", priority: "HIGH", owner: "IT Team", status: "ACTIVE" },
    { id: 11, name: "Safety & Compliance", priority: "CRITICAL", owner: "School Administrator", status: "ACTIVE" },
    { id: 12, name: "Improvement & Recognition", priority: "LOW", owner: "Coordinator", status: "ACTIVE" },
];

export const INTERNAL_STATUS_FILTER = ["All Status", "ACTIVE", "INACTIVE"];

// Create Category dialog options.
export const PRIORITY_OPTIONS = ["Critical", "High", "Normal", "Low"];

// Only "3 Days" appears in the comp; the rest are a plausible spread so the
// select is usable. Replace with the real SLA options when they are specified.
export const SLA_OPTIONS = ["1 Day", "2 Days", "3 Days", "5 Days", "7 Days", "14 Days"];

// The existing rows carry no department field — the owner values read as
// departments ("Facility Team", "IT Team", "Housekeeping"), so they stand in as
// the department list until the API supplies a real one. Categories created
// through the dialog do store a proper `department`.
export const DEPARTMENT_OPTIONS = [
    ...new Set(INTERNAL_CATEGORY_ROWS.map((r) => r.owner)),
].sort();
