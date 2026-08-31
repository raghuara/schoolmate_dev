// Audit Log — mock entries mirroring the dev-Figma comp 1:1.
// Replace AUDIT_ROWS with the audit-log API response.

// Every module pill is the same neutral tone in the comp, so it is passed to
// TableChip as `tone` rather than looked up per label.
export const MODULE_TONE = { bg: "#F4F6FA", color: "#64748B" };

// Column widths from the comp. Reference takes the remaining space.
export const AUDIT_COLS = {
    date: 160,
    user: 140,
    role: 120,
    action: 200,
    module: 120,
    details: 70,
    gap: 2,
    minWidth: 1060,
};

// The comp's footer reads "Showing 1-7 of 128 entries" across 3 pages. Those are
// mock totals — real paging arrives with the API, at which point `totalEntries`
// and the page count come from the response instead of here.
export const AUDIT_PAGINATION = { pageSize: 7, totalEntries: 128, pageCount: 3 };

// { id, dateTime, user, role, action, module, reference }
export const AUDIT_ROWS = [
    {
        id: 1,
        dateTime: "18 Aug 2026, 10:45 AM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "Category Created",
        module: "Categories",
        reference: "Academics",
    },
    {
        id: 2,
        dateTime: "18 Aug 2026, 09:30 AM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "SLA Changed",
        module: "SLA Config",
        reference: "Critical Priority",
    },
    {
        id: 3,
        dateTime: "17 Aug 2026, 04:15 PM",
        user: "VP Singh",
        role: "Vice Principal",
        action: "Complaint Reassigned",
        module: "Complaints",
        reference: "MSMS-CMP-2026-000124",
    },
    {
        id: 4,
        dateTime: "17 Aug 2026, 02:00 PM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "Escalation Rule Changed",
        module: "Escalation",
        reference: "SLA Breach Rule",
    },
    {
        id: 5,
        dateTime: "17 Aug 2026, 11:30 AM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "Permission Changed",
        module: "Permissions",
        reference: "Coordinator Role",
    },
    {
        id: 6,
        dateTime: "16 Aug 2026, 03:45 PM",
        user: "Coord. Meera",
        role: "Coordinator",
        action: "Confidential Complaint Viewed",
        module: "Complaints",
        reference: "MSMS-CMP-2026-000115",
    },
    {
        id: 7,
        dateTime: "16 Aug 2026, 01:00 PM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "Notification Template Updated",
        module: "Notifications",
        reference: "Complaint Resolved",
    },
];

// Filter dropdown options are derived from the rows rather than hardcoded, so
// they stay correct once real data replaces the mock.
const distinct = (key) => [...new Set(AUDIT_ROWS.map((r) => r[key]))].sort();

export const AUDIT_FILTER_OPTIONS = {
    user: distinct("user"),
    action: distinct("action"),
    module: distinct("module"),
};
