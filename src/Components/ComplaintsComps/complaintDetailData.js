// Complaint Details — mock record mirroring the dev-Figma comp 1:1.
// Reached from "View" on a row in the Complaints Management workspace.
//
// Keyed by the complaint reference, which is what WORKSPACE_ITEMS uses as its id,
// so the route param resolves straight to a record. Replace COMPLAINT_DETAILS
// with a fetch by reference.

// Timeline step states: "done" | "active" | "pending".
export const TIMELINE_STATE = { DONE: "done", ACTIVE: "active", PENDING: "pending" };

const CMP_00124 = {
    ref: "MSMS-CMP-2026-000124",
    stream: "Parent Complaints",
    category: "Teacher-Related",
    priority: "High Priority",
    status: "Under Review",
    title: "Concern regarding teacher feedback",
    registeredAt: "14 Aug 2026, 09:15 AM",
    slaDue: "18 Aug 2026 (2 days remaining)",

    student: [
        { label: "Student Name", value: "Aarav Kumar" },
        { label: "Class & Section", value: "Grade VIII-B" },
        { label: "Admission No", value: "STU/2024/0089" },
    ],
    parent: [
        { label: "Parent Name", value: "Rajesh Kumar" },
        { label: "Contact Number", value: "+91 98765 12345" },
        { label: "Registered By", value: "Admin Tamil (On behalf of parent)" },
    ],

    description:
        "The parent has raised a concern regarding the feedback approach used during the recent " +
        "parent-teacher meeting. They felt the communication was overly critical without constructive " +
        "suggestions for improvement. The parent requests a follow-up discussion with the class teacher " +
        "to better understand their child's progress and areas where support can be provided at home.",

    attachments: [{ id: "a1", name: "PTM_feedback_notes.pdf", url: null }],

    internalNotes: [
        {
            id: "n1",
            text:
                '"Spoke with class teacher Mrs. Sharma. She acknowledges the feedback style could be ' +
                'improved. Willing to schedule a follow-up meeting."',
            author: "Admin Tamil",
            at: "15 Aug 2026, 10:30 AM",
        },
        {
            id: "n2",
            text:
                '"Parent is cooperative and open to discussion. Recommend scheduling within 2 days."',
            author: "Priya Sharma",
            at: "15 Aug 2026, 02:15 PM",
        },
    ],

    // null until the complaint is resolved — the comp shows the empty state.
    resolution: null,

    assignment: [
        { label: "Assigned To", value: "Priya Sharma" },
        { label: "Role", value: "Academic Coordinator" },
        { label: "Assigned On", value: "14 Aug 2026, 11:30 AM" },
        { label: "Assigned By", value: "Admin Tamil" },
    ],

    timeline: [
        { label: "Registered", at: "14 Aug 2026, 09:15 AM", state: TIMELINE_STATE.DONE },
        { label: "Acknowledged", at: "14 Aug 2026, 10:00 AM", state: TIMELINE_STATE.DONE },
        { label: "Assigned", at: "14 Aug 2026, 11:30 AM", state: TIMELINE_STATE.DONE },
        { label: "Under Review", at: "Active - 15 Aug 2026", state: TIMELINE_STATE.ACTIVE },
        { label: "Action in Progress", state: TIMELINE_STATE.PENDING },
        { label: "Resolved", state: TIMELINE_STATE.PENDING },
        { label: "Parent Confirmation", state: TIMELINE_STATE.PENDING },
        { label: "Closed", state: TIMELINE_STATE.PENDING },
    ],
};

export const COMPLAINT_DETAILS = {
    [CMP_00124.ref]: CMP_00124,
};

// Any reference the mock does not carry falls back to the one the comp draws, so
// opening another workspace row shows a populated screen rather than a blank one.
export const getComplaintDetail = (ref) => COMPLAINT_DETAILS[ref] || CMP_00124;

// Header chip palettes.
export const DETAIL_CATEGORY_TONE = { bg: "rgba(59, 130, 246, 0.10)", color: "#3B82F6" };
export const DETAIL_PRIORITY_TONES = {
    "High Priority": { bg: "#FFFBEB", color: "#D97706" },
    "Critical Priority": { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
    "Normal Priority": { bg: "#F1F5F9", color: "#64748B" },
    "Low Priority": { bg: "#F1F5F9", color: "#64748B" },
};
export const DETAIL_STATUS_TONES = {
    "Under Review": { bg: "rgba(59, 130, 246, 0.10)", color: "#3B82F6" },
    "Action Required": { bg: "rgba(239, 68, 68, 0.10)", color: "#EF4444" },
    // What the intake API returns on creation, before anyone picks it up
    Open: { bg: "#F1F5F9", color: "#64748B" },
    Registered: { bg: "#F1F5F9", color: "#64748B" },
    Resolved: { bg: "rgba(34, 197, 94, 0.10)", color: "#22C55E" },
    Closed: { bg: "#F1F5F9", color: "#64748B" },
};

// ── Status transitions ──────────────────────────────────────────────────────
// "Move to" options in the Update Status drawer. Note that Escalated and On Hold
// are NOT timeline steps — they are side states the complaint can sit in — so
// moving to one changes the status without advancing the timeline.
export const STATUS_OPTIONS = ["Action in Progress", "Resolved", "Escalated", "On Hold"];

export const activeStep = (timeline = []) =>
    timeline.find((s) => s.state === TIMELINE_STATE.ACTIVE) || null;

export const nextPendingStep = (timeline = []) =>
    timeline.find((s) => s.state === TIMELINE_STATE.PENDING) || null;

// "Next" on the control panel: the active step completes and the following
// pending step becomes active. Returns the same timeline when there is nothing
// left to advance to, so the caller can no-op safely.
export const advanceTimeline = (timeline = [], stampedAt) => {
    const activeIndex = timeline.findIndex((s) => s.state === TIMELINE_STATE.ACTIVE);
    const nextIndex = timeline.findIndex(
        (s, i) => i > activeIndex && s.state === TIMELINE_STATE.PENDING,
    );
    if (activeIndex === -1 || nextIndex === -1) return timeline;

    return timeline.map((s, i) => {
        if (i === activeIndex) return { ...s, state: TIMELINE_STATE.DONE, at: s.at || stampedAt };
        if (i === nextIndex) return { ...s, state: TIMELINE_STATE.ACTIVE, at: `Active - ${stampedAt}` };
        return s;
    });
};

// Jump straight to a named step — every step before it completes, every step
// after it resets to pending. Used when the drawer picks a target status that
// corresponds to a timeline step.
export const moveTimelineTo = (timeline = [], label, stampedAt) => {
    const targetIndex = timeline.findIndex((s) => s.label === label);
    if (targetIndex === -1) return timeline;

    return timeline.map((s, i) => {
        if (i < targetIndex) return { ...s, state: TIMELINE_STATE.DONE, at: s.at || stampedAt };
        if (i === targetIndex) return { ...s, state: TIMELINE_STATE.ACTIVE, at: `Active - ${stampedAt}` };
        return { ...s, state: TIMELINE_STATE.PENDING, at: undefined };
    });
};

// Control-panel actions. `variant` picks the accent-filled vs outlined treatment;
// `permission` is the action key each button will be gated on once the backend
// returns complaint permissions.
export const CONTROL_ACTIONS = [
    { key: "next", label: "Next", variant: "primary", permission: "updatestatus" },
    { key: "updateStatus", label: "Update Status", variant: "primary", permission: "updatestatus" },
    // Label reads "Escalate Escalation" in the comp — kept verbatim; likely a slip.
    { key: "escalate", label: "Escalate Escalation", variant: "outlined", permission: "escalate" },
    { key: "requestInfo", label: "Request Information", variant: "outlined", permission: "requestinfo" },
    { key: "addNote", label: "Add Internal Note", variant: "outlined", permission: "internalnotes" },
];
