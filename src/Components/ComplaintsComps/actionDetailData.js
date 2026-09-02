// Action Details — the Internal Excellence counterpart of complaintDetailData.
// Mirrors the dev-Figma comp 1:1. Reached from "View" on an internal action row
// in the Complaints Management workspace.
//
// The timeline state machine and its helpers (advanceTimeline / moveTimelineTo)
// are shared with the parent complaint flow — only the steps differ.

import { TIMELINE_STATE } from "./complaintDetailData";

/* The sample action record that used to sit here has been removed — the detail screen
   reads the live endpoint through complaintsDetailApi. */

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
/* Only what POST /complaints/status accepts for a staff concern — the mapping says
   "Staff: InProgress/ActionRequired". Evidence Submitted and Completed are resolution
   states filed through /resolution, which staff submit on mobile; Escalated goes
   through /management/escalate, which is the Escalate button in the Control Panel. */
export const ACTION_STATUS_OPTIONS = ["In Progress", "Action Required"];

// Control panel. The comp gives Update Status the accent fill and Reassign a
// darker label than the three below it.
export const ACTION_CONTROL_ACTIONS = [
    { key: "updateStatus", label: "Update Status", variant: "primary", permission: "updatestatus" },
    { key: "reassign", label: "Reassign", variant: "outlined", strong: true, permission: "reassign" },
    { key: "requestClarification", label: "Request Clarification", variant: "outlined", permission: "requestinfo" },
    { key: "escalate", label: "Escalate", variant: "outlined", permission: "escalate" },
    { key: "addNote", label: "Add Internal Note", variant: "outlined", permission: "internalnotes" },
];
