// Internal Complaints > Audit Log — mock entries mirroring the dev-Figma comp 1:1.
// Rendered by AuditLogPage, which is shared with the Parent variant; only the
// copy, rows and totals differ.

// { id, dateTime, user, role, action, module, reference }
export const INTERNAL_AUDIT_ROWS = [
    {
        id: 1,
        dateTime: "18 Aug 2026, 10:45 AM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "Category Created",
        module: "Operations Config",
        reference: "Academics",
    },
    {
        id: 2,
        dateTime: "18 Aug 2026, 09:30 AM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "SLA Changed",
        module: "Operations SLA",
        reference: "High Priority",
    },
    {
        id: 3,
        dateTime: "17 Aug 2026, 04:15 PM",
        user: "VP Singh",
        role: "Vice Principal",
        action: "Action Assigned",
        module: "Academics",
        reference: "Class XI-B Timetable",
    },
    {
        id: 4,
        dateTime: "17 Aug 2026, 02:00 PM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "Escalation Rule Changed",
        module: "Escalations",
        reference: "Admin SLA Breach",
    },
    {
        id: 5,
        dateTime: "17 Aug 2026, 11:30 AM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "Permission Changed",
        module: "User Roles",
        reference: "Coordinator Role",
    },
    {
        id: 6,
        dateTime: "16 Aug 2026, 03:45 PM",
        user: "Coord. Meera",
        role: "Coordinator",
        action: "Evidence Uploaded",
        module: "Facilities",
        reference: "Safety Audit Report",
    },
    {
        id: 7,
        dateTime: "16 Aug 2026, 01:00 PM",
        user: "Admin Tamil",
        role: "Super Admin",
        action: "Status Changed",
        module: "Sports",
        reference: "Equipment Inventory",
    },
    {
        id: 8,
        dateTime: "15 Aug 2026, 10:30 AM",
        user: "VP Singh",
        role: "Vice Principal",
        action: "Action Reviewed",
        module: "Exams",
        reference: "Term 1 Grading",
    },
];

// The comp's footer reads "Showing 1-8 of 156 entries" across 3 pages — mock
// totals until the API paginates.
export const INTERNAL_AUDIT_PAGINATION = { pageSize: 8, totalEntries: 156, pageCount: 3 };

export const INTERNAL_AUDIT_COPY = {
    crumbLabel: "School Operations Configuration",
    subtitle: "Track school operations activity and configuration changes.",
};
