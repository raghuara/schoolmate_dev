// Complaint Permissions screen — roles rail, per-role users, and the permission list.
// Replace each export with the corresponding API response.

// Left rail. `badge` is the tag shown beside the permissions panel heading.
export const PERMISSION_ROLES = [
    { id: "superadmin", name: "Super Admin", userCount: 2, badge: "Authorized" },
    { id: "admin", name: "Admin", userCount: 4, badge: "Authorized" },
    { id: "officestaff", name: "Office Staff", userCount: 8, badge: "Authorized" },
    { id: "teacher", name: "Teacher", userCount: 32, badge: "Authorized" },
];

// { id, name, title, initials }
// Only the Admin list appears in the comp. The other three are placeholders so
// switching roles does not land on an empty panel — swap them for the real
// GetNonStudentUsers response.
export const ROLE_USERS = {
    superadmin: [
        { id: "sa1", name: "Tamil Selvan", title: "Principal", initials: "TS" },
        { id: "sa2", name: "Priya Raman", title: "Correspondent", initials: "PR" },
    ],
    admin: [
        { id: "ad1", name: "Rajesh Kumar", title: "School Administrator", initials: "RK" },
        { id: "ad2", name: "Anitha Devi", title: "Administrative Officer", initials: "AD" },
        { id: "ad3", name: "Meena Kumar", title: "Admin Officer", initials: "MK" },
        { id: "ad4", name: "Karthik", title: "Operations Administrator", initials: "K" },
    ],
    officestaff: [
        { id: "os1", name: "Suresh Babu", title: "Office Superintendent", initials: "SB" },
        { id: "os2", name: "Lakshmi Narayan", title: "Front Desk", initials: "LN" },
        { id: "os3", name: "Divya Shree", title: "Records Clerk", initials: "DS" },
    ],
    teacher: [
        { id: "te1", name: "Vignesh Rao", title: "Class Teacher", initials: "VR" },
        { id: "te2", name: "Sangeetha M", title: "Subject Teacher", initials: "SM" },
        { id: "te3", name: "Arun Prasad", title: "Sports Coordinator", initials: "AP" },
    ],
};

// The comp shows the Admin role with every box ticked.
export const COMPLAINT_PERMISSIONS = [
    { key: "view", label: "View Complaints" },
    { key: "register", label: "Register Complaint" },
    { key: "assign", label: "Assign Complaint" },
    { key: "reassign", label: "Reassign Complaint" },
    { key: "updateStatus", label: "Update Status" },
    { key: "internalNotes", label: "Add Internal Notes" },
    { key: "requestInfo", label: "Request Information" },
    { key: "resolve", label: "Resolve Complaint" },
    { key: "escalate", label: "Escalate Complaint" },
    { key: "confidential", label: "View Confidential Complaints" },
    { key: "close", label: "Close Complaint" },
];

const allOn = () =>
    Object.fromEntries(COMPLAINT_PERMISSIONS.map((p) => [p.key, true]));

// Defaults per role. Admin is fully ticked as drawn; the rest are sensible
// starting points until the API supplies the real grants.
export const DEFAULT_ROLE_PERMISSIONS = {
    superadmin: allOn(),
    admin: allOn(),
    officestaff: {
        ...allOn(),
        confidential: false,
        escalate: false,
        close: false,
    },
    teacher: {
        ...Object.fromEntries(COMPLAINT_PERMISSIONS.map((p) => [p.key, false])),
        view: true,
        register: true,
        updateStatus: true,
        internalNotes: true,
    },
};
