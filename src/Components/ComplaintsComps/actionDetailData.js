// Action Details — the Internal Excellence counterpart of complaintDetailData.
// Mirrors the dev-Figma comp 1:1. Reached from "View" on an internal action row
// in the Complaints Management workspace.
//
// The timeline state machine and its helpers (advanceTimeline / moveTimelineTo)
// are shared with the parent complaint flow — only the steps differ.

import { TIMELINE_STATE } from "./complaintDetailData";

const ACT_0042 = {
    ref: "MSMS-ACT-2026-0042",
    stream: "Manage Actions",
    category: "Maintenance",
    priority: "Normal",
    status: "Action Required",
    title: "Classroom maintenance follow-up",
    owner: "Rajesh Kumar",
    createdAt: "14 Aug 2026, 09:15 AM",
    slaDue: "18 Aug 2026",
    slaRemaining: "(2 days remaining)",

    // Left column then right column, as drawn — the right column holds one field.
    infoPrimary: [
        { label: "Action Type", value: "Maintenance" },
        { label: "Created By", value: "Admin Tamil" },
        { label: "Category", value: "Facility & Infrastructure" },
        { label: "Assigned By", value: "Admin Tamil" },
        { label: "Owner", value: "Rajesh Kumar" },
    ],
    infoSecondary: [{ label: "Assigned Date", value: "14 Aug 2026, 11:30 AM" }],

    description:
        "Classroom maintenance follow-up required. Check the classroom fan, lighting and furniture " +
        "condition and submit completion evidence after the required work is completed. Building A, " +
        "Floor 2, Room 7B - inspect all ceiling fans, tube lights and student desks. Replace any " +
        "non-functional items and submit before/after photographic evidence.",

    attachments: [{ id: "a1", name: "maintenance_checklist.pdf", url: null }],

    internalNotes: [
        {
            id: "n1",
            text: '"Vendor confirmed availability for 18 Aug. Quote received for Rs. 12,500 for all repairs."',
            author: "Rajesh Kumar",
            at: "16 Aug 2026, 10:30 AM",
        },
        {
            id: "n2",
            text: '"Approved budget allocation from maintenance fund."',
            author: "Admin Tamil",
            at: "17 Aug 2026",
        },
    ],

    resolution: null,

    // The assignee card shows a person rather than a stacked field list.
    assignee: {
        name: "Rajesh Kumar",
        initials: "RK",
        role: "Office Staff (Maintenance)",
    },
    assignmentMeta: [
        { label: "Assigned On", value: "14 Aug 2026, 11:30 AM" },
        { label: "Assigned By", value: "Admin Tamil" },
    ],

    timeline: [
        { label: "Created", at: "14 Aug 2026, 09:15 AM", state: TIMELINE_STATE.DONE },
        { label: "Assigned", at: "14 Aug 2026, 11:30 AM", state: TIMELINE_STATE.DONE },
        { label: "Acknowledged", at: "14 Aug 2026, 02:00 PM", state: TIMELINE_STATE.DONE },
        { label: "In Progress", at: "Active · 15 Aug 2026", state: TIMELINE_STATE.ACTIVE },
        { label: "Evidence Submitted", state: TIMELINE_STATE.PENDING },
        { label: "Under Review", state: TIMELINE_STATE.PENDING },
        { label: "Completed", state: TIMELINE_STATE.PENDING },
        { label: "Closed", state: TIMELINE_STATE.PENDING },
    ],
};

export const ACTION_DETAILS = { [ACT_0042.ref]: ACT_0042 };

export const getActionDetail = (ref) => ACTION_DETAILS[ref] || ACT_0042;

// Internal actions use a different blue from the parent-complaint screens.
export const ACTION_CATEGORY_TONES = {
    Maintenance: { bg: "rgba(21, 112, 239, 0.10)", color: "#1570EF" },
    Audit: { bg: "rgba(139, 92, 246, 0.10)", color: "#8B5CF6" },
    Training: { bg: "rgba(13, 148, 136, 0.10)", color: "#0D9488" },
    Safety: { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
    Hygiene: { bg: "rgba(34, 197, 94, 0.10)", color: "#22C55E" },
};
export const ACTION_LINK_COLOR = "#1570EF";

export const ACTION_PRIORITY_TONES = {
    Normal: { bg: "#F1F5F9", color: "#64748B" },
    Low: { bg: "#F1F5F9", color: "#64748B" },
    High: { bg: "rgba(245, 166, 35, 0.10)", color: "#F5A623" },
    Critical: { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
};

export const ACTION_STATUS_TONES = {
    "Action Required": { bg: "#FFFBEB", color: "#D97706" },
    Open: { bg: "#F1F5F9", color: "#64748B" },
    "In Progress": { bg: "#FFFBEB", color: "#D97706" }, // amber in the action flow, not the workspace blue
    "Awaiting Review": { bg: "#FFF7ED", color: "#D97706" },
    Completed: { bg: "rgba(34, 197, 94, 0.10)", color: "#22C55E" },
    Closed: { bg: "#F1F5F9", color: "#64748B" },
};

// "Move to" options for the Update Status drawer on this screen.
export const ACTION_STATUS_OPTIONS = [
    "Evidence Submitted",
    "Under Review",
    "Completed",
    "On Hold",
    "Escalated",
];

// Control panel. The comp gives Update Status the accent fill and Reassign a
// darker label than the three below it.
export const ACTION_CONTROL_ACTIONS = [
    { key: "updateStatus", label: "Update Status", variant: "primary", permission: "updatestatus" },
    { key: "reassign", label: "Reassign", variant: "outlined", strong: true, permission: "reassign" },
    { key: "requestClarification", label: "Request Clarification", variant: "outlined", permission: "requestinfo" },
    { key: "escalate", label: "Escalate", variant: "outlined", permission: "escalate" },
    { key: "addNote", label: "Add Internal Note", variant: "outlined", permission: "internalnotes" },
];
