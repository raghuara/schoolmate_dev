// Mock data for the Escalation Configuration screen.
// Values mirror the dev-Figma comp 1:1. Replace with the escalation config API.

// Escalation ladder, lowest level first.
// NOTE: `role` must come from GetAllUserTypes (userTypesSlice) once wired — the
// ladder is school-configurable, so these are seed labels, not a fixed list.
export const ESCALATION_LEVELS = [
    {
        level: "Level 1",
        role: "Teacher / Office Staff",
        description: "First-level owner for assigned School Operations actions.",
    },
    {
        level: "Level 2",
        role: "Admin",
        description: "Receives escalations for overdue, blocked or unresolved actions.",
    },
    {
        level: "Level 3",
        role: "Super Admin",
        description: "Final escalation authority for critical or unresolved actions.",
    },
];

// { key, title, description, enabled } — `enabled` seeds the toggle state.
export const ESCALATION_TRIGGERS = [
    {
        key: "slaBreached",
        title: "SLA Breached",
        description: "Escalate to the next level when the configured SLA is breached.",
        enabled: true,
    },
    {
        key: "criticalAction",
        title: "Critical Action",
        description: "Escalate critical actions to Admin / Super Admin.",
        enabled: true,
    },
    {
        key: "actionReopened",
        title: "Action Reopened",
        description: "Escalate reopened actions for management review.",
        enabled: true,
    },
    {
        key: "noAcknowledgement",
        title: "No Acknowledgement",
        description: "Escalate when the assigned staff member does not acknowledge the action.",
        enabled: true,
    },
    {
        key: "noProgress",
        title: "No Progress",
        description: "Escalate when no progress is recorded within the configured timeframe.",
        enabled: false,
    },
];
