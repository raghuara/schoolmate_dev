// Mock data for the Internal Complaints tab of the Management Dashboard.
// Values mirror the dev-Figma comp 1:1. Replace each export with the matching
// API response — the shapes below are what the components expect.

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { C, TINT } from "./complaintsTokens";

// KPI row. { label, value, icon, iconColor, iconBg, valueColor? }
export const INTERNAL_STATS = [
    { label: "Total Open Actions", value: "24", icon: AssignmentOutlinedIcon, iconColor: C.blue, iconBg: TINT.blue },
    { label: "Overdue Actions", value: "06", icon: WarningAmberOutlinedIcon, iconColor: C.red, iconBg: TINT.red, valueColor: C.red },
    { label: "High Priority", value: "11", icon: OutlinedFlagIcon, iconColor: C.amber, iconBg: TINT.amber },
    { label: "Critical", value: "03", icon: ReportGmailerrorredOutlinedIcon, iconColor: C.red, iconBg: TINT.red, valueColor: C.red },
    { label: "Reopened Actions", value: "02", icon: RefreshOutlinedIcon, iconColor: C.amber, iconBg: TINT.amber },
];

// { label, value } — value already carries its unit.
export const ACTIONS_BY_CATEGORY = [
    { label: "Maintenance", value: "5 actions" },
    { label: "Audit", value: "4 actions" },
    { label: "Training", value: "3 actions" },
    { label: "Safety", value: "3 actions" },
    { label: "Hygiene", value: "2 actions" },
];

// { label, value, color } — the bar is scaled against the largest count at render time,
// since Figma's fixed pixel widths do not survive a fluid layout.
export const ACTIONS_BY_PRIORITY = [
    { label: "Critical", value: 1, color: C.red },
    { label: "High", value: 8, color: C.amber },
    { label: "Normal", value: 6, color: C.blue },
    { label: "Low", value: 2, color: C.textMuted },
];

export const RESOLUTION_TIME = {
    title: "Average Resolution Time",
    subtitle: "Ticket lifetime from log to verify",
    value: "4.2",
    unit: "Hours",
    delta: "↑ 17% Faster than Term 1",
    deltaColor: C.green,
};

export const ON_TIME_COMPLETION = {
    title: "On-Time Completion",
    subtitle: "SLA compliance window performance",
    pct: 88,
    caption: "SLA Healthy (Green Zone)",
    color: C.green,
};

export const REOPENED_ACTIONS = {
    title: "Reopened Actions",
    subtitle: "Failed initial resolution checks",
    value: "02",
    unit: "Actions",
    valueColor: C.red,
    delta: "↓ 91% Reduction",
    deltaColor: C.green,
};

// { label, caption, chip, color }
export const STAFF_ACTIONS = [
    { label: "Dr. Aruna (Academic Ch.)", caption: "Critical Tasks", chip: "6 Active", color: C.red },
    { label: "S. V. Sharma (Facility Lead)", caption: "Maintenance", chip: "5 Active", color: C.amber },
    { label: "Priya Sundaram (Admin)", caption: "SLA Compliances", chip: "3 Active", color: C.blue },
    { label: "Rajesh Kumar (Transport)", caption: "Daily Fleet Audit", chip: "2 Active", color: C.green },
];

// Two row flavours: count + "N Total" pill, or percentage + mini progress track.
export const COMPLIANCE_OVERVIEW = [
    { label: "Facility Issues", caption: "Open actions", value: "08", chip: "10 Total", chipColor: C.amber },
    { label: "Cleanliness Issues", caption: "Open actions", value: "12", chip: "22 Total", chipColor: C.red },
    { label: "Academic Compliance", caption: "Syllabus sync", value: "94%", valueColor: C.green, pct: 94, barColor: C.green },
    { label: "Portion Completion Status", caption: "Term 2", value: "82%", pct: 82, barColor: C.tabActiveBorder },
    { label: "Notebook Completion Status", caption: "Teacher sign-offs", value: "76%", pct: 76, barColor: C.blue },
    { label: "Circular Acknowledgement", caption: "Parent App reads", value: "91%", valueColor: C.green, pct: 91, barColor: C.green },
];

// { label, chip, color }
export const REPEATED_ISSUES = [
    { label: "Lab Equipment Defect", chip: "3x this month", color: C.amber },
    { label: "Classroom A/C Overheating", chip: "2x this month", color: C.red },
    { label: "ID Pass Delays", chip: "2x this month", color: C.blue },
];

// Bottom feed cards. { title, badge, badgeColor, items: [{ label, caption, dotColor? }] }
export const FEED_CARDS = [
    {
        title: "Suggestions Received",
        badge: "19",
        badgeColor: C.blue,
        items: [
            { label: "Interactive board calibration", caption: "Faculty Dept - 2 hrs ago" },
            { label: "Staggered lunch timings pilot", caption: "Admin Team - 1 day ago" },
        ],
    },
    {
        title: "Appreciations Issued",
        badge: "08",
        badgeColor: C.green,
        items: [
            { label: "Perfect Bus Audit Log", caption: "To Rajesh Kumar - Jan 20" },
            { label: "Syllabus Target Achievers", caption: "To English Faculty - Jan 18" },
        ],
    },
    {
        title: "Attention Required",
        badge: "3 Flares",
        badgeColor: C.red,
        items: [
            { label: "Anil Mehta (Science Coordinator)", caption: "Portion delay: Lab supplies bottleneck", dotColor: C.red },
            { label: "Jyoti Sen (Primary Head)", caption: "Audit backlog: 5 open actions", dotColor: C.amber },
        ],
    },
];

// TODO: the Figma export was cut off partway through "SLA Performance (Internal)" —
// these rows are placeholders that match the card's layout, not the mockup's values.
// Re-paste that card and swap them in.
export const INTERNAL_SLA_METRICS = [
    { label: "Avg. Acknowledgement Time", chip: "0.8 hrs", pct: 62, color: C.green },
    { label: "Avg. Resolution Time", chip: "4.2 hrs", pct: 74, color: C.green },
    { label: "SLA Compliance", chip: "88%", pct: 88, color: C.green },
    { label: "Escalation Rate", chip: "6%", pct: 6, color: C.amber },
];
