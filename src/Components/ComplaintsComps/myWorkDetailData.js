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

import { MY_WORK_ITEMS } from "./myWorkData";

// Status chip on the header card. Same palette as the queue's status column.
export const DETAIL_STATUS_TONES = {
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
const DETAILS = {
    "MSMS-CMP-2026-00124": {
        variant: "parent",
        description:
            "Parent noted discrepancies in feedback provided on English midterm assignments, requesting clarification on scoring criteria and written remarks.",
        subject: {
            kind: "student",
            name: "Aarav Kumar",
            meta: "Grade VIII-B · Roll #14",
            contactLabel: "Parent Contact",
            contact: "Rajesh Kumar (+91 98765 43210)",
        },
        attachments: [{ name: "Midterm_English_Rubric.pdf", size: "2.4 MB" }],
        notes: [
            {
                author: "System Admin (Auto-route)",
                at: "17 Aug, 10:15 AM",
                body: "Complaint auto-routed to Academic Supervisor for Class VIII based on parent selection.",
            },
        ],
        timeline: [
            { label: "Priority", value: "High Priority", tone: "red" },
            { label: "Assigned Date", value: "17 Aug 2026" },
            { label: "SLA Expected", value: "18 Aug 2026", tone: "amber" },
        ],
        currentStatus: "underReview",
    },

    "MSMS-OBS-2026-00042": {
        variant: "internal",
        description:
            "Severe crack on the third step of the primary staircase in Block-B. Structural integrity compromised, posing immediate trip and fall hazard during class transition periods.",
        subject: {
            kind: "location",
            name: "West Wing Staircase 2",
            meta: "Connecting Ground Floor to Level 1",
            contactLabel: "Reported By",
            contact: "Staff Observational Log · Admin Portal",
        },
        attachments: [{ name: "Stair_Crack_Observation.png", size: "4.1 MB" }],
        notes: [
            {
                author: "Operations Supervisor",
                at: "18 Aug, 08:30 AM",
                body: "Caution tape deployed around the staircase. Maintenance crew dispatched to replace tread.",
            },
        ],
        timeline: [
            { label: "Priority", value: "Immediate SLA", tone: "red" },
            { label: "Opened Date", value: "18 Aug 2026" },
            { label: "Target Resolution", value: "Within 4 Hours", tone: "red" },
        ],
        currentStatus: "inProgress",
    },
};

// Every queue row, flattened, so a detail can be composed for the ones the comps
// do not spell out.
const QUEUE_ROWS = Object.values(MY_WORK_ITEMS).flat();

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
