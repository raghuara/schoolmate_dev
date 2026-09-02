// Internal Complaints Permissions — roles rail, per-role users, and the
// operations permission list. Replace each export with the API response.

// Amber-on-light text tones unique to this comp (the Parent permissions screen
// uses a blue badge and grey counts).
export const AMBER = {
    crumb: "#99660D",      // current breadcrumb crumb
    count: "#8C5900",      // user count on the selected role
    badgeText: "#B28200",  // "Authorized" tag
    badgeBg: "rgba(252, 190, 58, 0.13)",
    activeRow: "#FFFCF5",
};

// How many users the panel lists before the "+ view N more" link.
export const USERS_PREVIEW_COUNT = 4;

export const OPERATIONS_PERMISSIONS = [
    { key: "viewOperations", label: "View School Operations" },
    { key: "createEntry", label: "Create Entry" },
    { key: "assignEntry", label: "Assign Entry" },
    { key: "reassignEntry", label: "Reassign Entry" },
    { key: "updateStatus", label: "Update Status" },
    { key: "internalNotes", label: "Add Internal Notes" },
    { key: "addReviewer", label: "Add Reviewer" },
    { key: "approveEntry", label: "Approve Entry" },
    { key: "resolveEntry", label: "Resolve Entry" },
    { key: "reopenEntry", label: "Reopen Entry" },
    { key: "escalateEntry", label: "Escalate Entry" },
    { key: "viewReports", label: "View Reports" },
    { key: "viewDashboard", label: "View Dashboard" },
    { key: "manageCategories", label: "Manage Categories" },
    { key: "manageAssignment", label: "Manage Assignment Mapping" },
    { key: "manageSla", label: "Manage SLA Configuration" },
    { key: "manageEscalation", label: "Manage Escalation Configuration" },
    { key: "manageNotifications", label: "Manage Notifications" },
    { key: "viewAuditLog", label: "View Audit Log" },
];

// The comp draws Admin with the first thirteen ticked and the six "Manage…" /
// audit rows unticked.
const ADMIN_GRANTED = new Set([
    "viewOperations",
    "createEntry",
    "assignEntry",
    "reassignEntry",
    "updateStatus",
    "internalNotes",
    "addReviewer",
    "approveEntry",
    "resolveEntry",
    "reopenEntry",
    "escalateEntry",
    "viewReports",
    "viewDashboard",
]);

const grantAll = () =>
    Object.fromEntries(OPERATIONS_PERMISSIONS.map((p) => [p.key, true]));

const grantNone = () =>
    Object.fromEntries(OPERATIONS_PERMISSIONS.map((p) => [p.key, false]));

// Only Admin comes from the comp; the rest are sensible starting points.
export const DEFAULT_INTERNAL_PERMISSIONS = {
    superadmin: grantAll(),
    admin: Object.fromEntries(
        OPERATIONS_PERMISSIONS.map((p) => [p.key, ADMIN_GRANTED.has(p.key)]),
    ),
    officestaff: {
        ...grantNone(),
        viewOperations: true,
        createEntry: true,
        updateStatus: true,
        internalNotes: true,
        viewDashboard: true,
    },
    teacher: {
        ...grantNone(),
        viewOperations: true,
        createEntry: true,
        internalNotes: true,
    },
};
