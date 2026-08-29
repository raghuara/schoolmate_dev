import { seedRowsFor, STAFF_MODULE } from "./complaintCategorySeed";

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

// Owners already configured for these categories; the seed carries none.
const STAFF_OWNERS = {
    ACADEMIC_TEACHING: "Academic Coordinator",
    CLASSROOM_STUDENTS: "Class Coordinator",
    STAFF_PROFESSIONAL_CONDUCT: "Department Head",
    FACILITIES_MAINTENANCE: "Facility Team",
    CLEANLINESS_HYGIENE: "Housekeeping",
    ADMINISTRATION_RECORDS: "Admin Team",
    COMMUNICATION_COORDINATION: "Coordinator",
    TRANSPORT_SECURITY: "Operations Team",
    EVENTS_SCHEDULING: "Coordinator",
    TECHNOLOGY_DIGITAL: "IT Team",
    SAFETY_COMPLIANCE: "School Administrator",
    IMPROVEMENT_RECOGNITION: "Coordinator",
};

// The 12 seeded StaffConcern categories. NOTE: the seed rates Technology &
// Digital Systems NORMAL, where the mock had it HIGH — the seed wins.
export const INTERNAL_CATEGORY_ROWS = seedRowsFor(STAFF_MODULE, STAFF_OWNERS);

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
