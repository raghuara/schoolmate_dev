// Internal Complaints > Dashboard Configuration — the operations widget list.
// Values mirror the dev-Figma comp 1:1. Rendered by DashboardConfigPage, which
// is shared with the Parent variant; only the copy and this list differ.
//
// `enabled` is what the save call should send back per widget key.

// { key, title, description, enabled }
export const INTERNAL_DASHBOARD_WIDGETS = [
    {
        key: "openActions",
        title: "Open Actions",
        description: "Show current open School Operations actions",
        enabled: true,
    },
    {
        key: "actionRequired",
        title: "Action Required",
        description: "Highlight actions that require immediate attention",
        enabled: true,
    },
    {
        key: "overdueActions",
        title: "Overdue Actions",
        description: "Show actions that have exceeded their configured SLA",
        enabled: true,
    },
    {
        key: "criticalActions",
        title: "Critical Actions",
        description: "Show critical-priority operational actions",
        enabled: true,
    },
    {
        key: "inProgress",
        title: "In Progress",
        description: "Show currently active actions being worked on",
        enabled: true,
    },
    {
        key: "awaitingReview",
        title: "Awaiting Review",
        description: "Show actions waiting for review or verification",
        enabled: true,
    },
    {
        key: "completedActions",
        title: "Completed Actions",
        description: "Show successfully completed actions",
        enabled: true,
    },
    {
        key: "reopenedActions",
        title: "Reopened Actions",
        description: "Show actions that were completed but reopened",
        enabled: true,
    },
    {
        key: "slaPerformance",
        title: "SLA Performance",
        description: "Show response and resolution SLA performance",
        enabled: true,
    },
    // The comp draws the last two toggles off.
    {
        key: "repeatedIssues",
        title: "Repeated Issues",
        description: "Show recurring operational issues",
        enabled: false,
    },
    {
        key: "staffActions",
        title: "Staff Actions",
        description: "Show action workload and performance assigned to staff",
        enabled: false,
    },
];

export const INTERNAL_DASHBOARD_COPY = {
    crumbLabel: "Dashboard Configuration",
    title: "Dashboard Configuration",
    subtitle: "Configure which operations metrics and widgets are visible to Management.",
};
