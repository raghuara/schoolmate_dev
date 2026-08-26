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

// { id, name, badge }  — userCount is derived from ROLE_USERS below so the rail
// can never disagree with the list it opens.
export const INTERNAL_ROLES = [
    { id: "superadmin", name: "Super Admin", badge: "Authorized" },
    { id: "admin", name: "Admin", badge: "Authorized" },
    { id: "officestaff", name: "Office Staff", badge: "Authorized" },
    { id: "teacher", name: "Teacher", badge: "Authorized" },
];

// { id, name, title, initials }
// The comp draws four Admin users plus a "+ view 1 more" link, so the Admin list
// holds five — the fifth is invented to make that affordance real. Only the four
// named in the comp are from the design. Other roles are placeholders sized to
// the comp's rail counts (1 / 5 / 32).
export const INTERNAL_ROLE_USERS = {
    superadmin: [{ id: "isa1", name: "Tamil Selvan", title: "Principal", initials: "TS" }],
    admin: [
        { id: "iad1", name: "Rajesh Kumar", title: "Vice Principal", initials: "RK" },
        { id: "iad2", name: "Adithu Devi", title: "Head of Academics", initials: "AD" },
        { id: "iad3", name: "Meena Kumar", title: "Admin Officer", initials: "MK" },
        { id: "iad4", name: "Karthik", title: "Sports Administrator", initials: "K" },
        { id: "iad5", name: "Priya Raman", title: "Operations Lead", initials: "PR" },
    ],
    officestaff: [
        { id: "ios1", name: "Suresh Babu", title: "Office Superintendent", initials: "SB" },
        { id: "ios2", name: "Lakshmi Narayan", title: "Front Desk", initials: "LN" },
        { id: "ios3", name: "Divya Shree", title: "Records Clerk", initials: "DS" },
        { id: "ios4", name: "Anand Raj", title: "Stores Clerk", initials: "AR" },
        { id: "ios5", name: "Nithya S", title: "Reception", initials: "NS" },
    ],
    teacher: [
        { id: "ite1", name: "Vignesh Rao", title: "Class Teacher", initials: "VR" },
        { id: "ite2", name: "Sangeetha M", title: "Subject Teacher", initials: "SM" },
        { id: "ite3", name: "Arun Prasad", title: "Sports Coordinator", initials: "AP" },
        { id: "ite4", name: "Kavitha R", title: "Lab Incharge", initials: "KR" },
    ],
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
