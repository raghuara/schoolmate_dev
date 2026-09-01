// "My Work" detail — what a staff member sees when they open one of their
// assigned items. Two variants share one screen:
//
//   parent   — a complaint about a student. Subject block is the student, the
//              lifecycle runs Under Review → In Progress → Awaiting Parent → Resolved.
//   internal — a school-operations observation. Subject block is the place, the
//              lifecycle is the shorter In Progress → Action Required → Completed,
//              and the rail carries a "Mark as Completed" shortcut.
//
// Both mirror their dev-Figma comp 1:1. Everything that differs between them is
// data here, so the page stays one component.


// Status chip on the header card. Same palette as the queue's status column.
export const DETAIL_STATUS_TONES = {
    // What the intake API returns on creation, before anyone picks it up
    Open: { bg: "#FEF3C7", color: "#F59E0B" },
    "Action Required": { bg: "#FEF3C7", color: "#F59E0B" },
    "Under Review": { bg: "#DBEAFE", color: "#3B82F6" },
    "In Progress": { bg: "#CCFBF1", color: "#0D9488" },
    Resolved: { bg: "#CCFBF1", color: "#0D9488" },
    Completed: { bg: "#CCFBF1", color: "#0D9488" },
    Closed: { bg: "#E2E8F0", color: "#64748B" },
};

// Priority reads red once it is above normal.
export const PRIORITY_LABELS = {
    "HIGH PRIORITY": { label: "High Priority", tone: "red" },
    CRITICAL: { label: "Critical", tone: "red" },
    NORMAL: { label: "Normal" },
    LOW: { label: "Low" },
};

// The statuses each stream can move to, with the dot colour its comp gives them
// and the tint that fills the row while it is selected.
const PARENT_STATUSES = [
    { key: "underReview", label: "Under Review", color: "#0D9488", tint: "#F0FDFA" },
    { key: "inProgress", label: "Action in Progress", color: "#F59E0B", tint: "#FFFBEB" },
    { key: "awaitingParent", label: "Awaiting Parent Information", color: "#3B82F6", tint: "#EFF6FF" },
    { key: "resolved", label: "Resolved", color: "#10B981", tint: "#ECFDF5" },
];

const INTERNAL_STATUSES = [
    { key: "inProgress", label: "In Progress", color: "#0D9488", tint: "#CCFBF1" },
    { key: "actionRequired", label: "Action Required", color: "#F59E0B", tint: "#FEF3C7" },
    { key: "completed", label: "Completed", color: "#10B981", tint: "#D1FAE5" },
];

// The two comps draw the status list slightly differently — the operations one
// sits on a softer radius with larger rows and no shadow.
export const VARIANTS = {
    parent: {
        backLabel: "Back to Complaints",
        subjectTitle: "Student Information",
        notesTitle: "Internal Notes",
        statuses: PARENT_STATUSES,
        completeAction: null,
        listStyle: {
            radius: "8px",
            rowPadding: 1.5,
            radioSize: 20,
            radioDot: 10,
            idleBorder: "#E2E8F0",
            shadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        },
    },
    internal: {
        backLabel: "Back to Operations",
        subjectTitle: "Location Details",
        notesTitle: "Internal Maintenance Notes",
        statuses: INTERNAL_STATUSES,
        // The operations comp adds a one-tap close beneath Submit Update.
        completeAction: { label: "Mark as Completed", status: "completed" },
        listStyle: {
            radius: "12px",
            rowPadding: "14px",
            radioSize: 16,
            radioDot: 0, // filled solid rather than a ring + dot
            idleBorder: "#94A3B8",
            shadow: "none",
        },
    },
};

// { variant, description, subject, attachments, notes, timeline, currentStatus }
// `subject.kind` picks the avatar treatment: a grey circle for a student, an
// amber pin chip for a place.
/* Per-item detail payloads were invented for queue rows that did not exist. There is
   no My Work endpoint, so there is nothing to key on. */
const DETAILS = {};

// Every queue row, flattened, so a detail can be composed for the ones the comps
// do not spell out.
/* The queue this looked rows up in was invented and has been removed; there is no
   My Work endpoint yet, so there is nothing to find. */
const QUEUE_ROWS = [];

// Operations references carry -OBS-/-ACT-; complaints carry -CMP-.
const variantOf = (id) => (id.includes("-CMP-") ? "parent" : "internal");

export function getMyWorkDetail(id) {
    const row = QUEUE_ROWS.find((r) => r.id === id);
    if (!row) return null;

    const detail = DETAILS[id];
    if (detail) return { ...row, ...detail, config: VARIANTS[detail.variant] };

    // Fallback: the queue entry carries the header fields already, so the rest is
    // composed rather than invented. Replace as each comp arrives.
    const variant = variantOf(row.id);
    const priority = PRIORITY_LABELS[row.priority] || { label: row.priority };
    const isInternal = variant === "internal";

    return {
        ...row,
        variant,
        config: VARIANTS[variant],
        description: `${row.title}. Full description arrives with the complaints API.`,
        subject: {
            kind: isInternal ? "location" : "student",
            name: row.student,
            meta: row.grade,
            contactLabel: isInternal ? "Reported By" : "Parent Contact",
            contact: isInternal ? "Staff Observational Log · Admin Portal" : "Contact on file",
        },
        attachments: [],
        notes: [],
        timeline: [
            { label: "Priority", value: priority.label, tone: priority.tone },
            { label: isInternal ? "Opened Date" : "Assigned Date", value: "—" },
            {
                label: isInternal ? "Target Resolution" : "SLA Expected",
                value: row.due.replace(/^Due:\s*/, ""),
                tone: row.dueUrgent ? "red" : "amber",
            },
        ],
        currentStatus: VARIANTS[variant].statuses[0].key,
    };
}
