// Complaint Permissions screen — roles rail, per-role users, and the permission list.
// Replace each export with the corresponding API response.

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
