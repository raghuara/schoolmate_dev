// Mock data for the Dashboard Configuration screen.
// Values mirror the dev-Figma comp 1:1. Replace with the dashboard config API —
// `enabled` is what the save call should send back per widget key.

// { key, title, description, enabled }
export const DASHBOARD_WIDGETS = [
    {
        key: "openComplaints",
        title: "Open Complaints",
        description: "Show count and trends of currently open parent complaints",
        enabled: true,
    },
    {
        key: "actionRequired",
        title: "Action Required",
        description: "Highlight complaints that require immediate coordinator response",
        enabled: true,
    },
    {
        key: "overdue",
        title: "Overdue",
        description: "Display count of complaints that have breached their configured SLA",
        enabled: true,
    },
    {
        key: "critical",
        title: "Critical",
        description: "Isolate high-severity issues like safety or child protection reports",
        enabled: true,
    },
    {
        key: "reopened",
        title: "Reopened",
        description: "Show complaints that were resolved but subsequently reopened by parents",
        enabled: true,
    },
    {
        key: "slaPerformance",
        title: "SLA Performance",
        description: "Graphical trend of average response and resolution SLA compliance",
        enabled: true,
    },
    {
        key: "parentSatisfaction",
        title: "Parent Satisfaction",
        description: "CSAT score breakdown gathered from parent resolution feedback",
        enabled: true,
    },
    {
        key: "complaintActivity",
        title: "Complaint Activity",
        description: "Bar charts showing hourly/daily incoming versus closed volumes",
        enabled: true,
    },
    {
        key: "repeatedIssues",
        title: "Repeated Issues",
        description: "Identify recurring complaint categories or structural problem areas",
        enabled: true,
    },
    {
        key: "departmentBreakdown",
        title: "Department Breakdown",
        description: "Pie chart breaking down open issues across mapped departments",
        enabled: false,
    },
    {
        key: "staffPerformance",
        title: "Staff Performance",
        description: "Roster performance index comparing handler speeds and resolutions",
        enabled: false,
    },
];
