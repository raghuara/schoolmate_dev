// Mock data for the Complaints management dashboard.
// Values mirror the dev-Figma comp 1:1 so the built screen matches the mockup.
// Replace each export with the corresponding API response — the shapes below are
// what the components expect.

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { C, TINT } from "./complaintsTokens";

// Row 1 — volume KPIs. { label, value, icon, iconColor, iconBg, valueColor? }
export const VOLUME_STATS = [
    { label: "Today", value: "8", icon: CalendarTodayOutlinedIcon, iconColor: C.textMuted, iconBg: TINT.neutral },
    { label: "This Week", value: "34", icon: CalendarTodayOutlinedIcon, iconColor: C.textMuted, iconBg: TINT.neutral },
    { label: "This Month", value: "142", icon: CalendarTodayOutlinedIcon, iconColor: C.textMuted, iconBg: TINT.neutral },
    { label: "Open", value: "24", icon: InboxOutlinedIcon, iconColor: C.blue, iconBg: TINT.blue },
    { label: "Closed", value: "118", icon: CheckCircleOutlineOutlinedIcon, iconColor: C.green, iconBg: TINT.green },
];

// Row 2 — attention KPIs. These carry a coloured value.
export const ATTENTION_STATS = [
    { label: "Overdue", value: "05", icon: WarningAmberOutlinedIcon, iconColor: C.red, iconBg: TINT.red, valueColor: C.red },
    { label: "Critical", value: "02", icon: WarningAmberOutlinedIcon, iconColor: C.redDark, iconBg: TINT.redDark, valueColor: C.redDark },
    { label: "High Priority", value: "07", icon: OutlinedFlagIcon, iconColor: C.amber, iconBg: TINT.amber, valueColor: C.amber },
    { label: "Unassigned", value: "03", icon: PersonOutlineOutlinedIcon, iconColor: C.textMuted, iconBg: TINT.neutral },
    { label: "Reopened", value: "04", icon: RefreshOutlinedIcon, iconColor: C.textMuted, iconBg: TINT.neutral },
];

// { label, value }
export const BY_CATEGORY = [
    { label: "Academics", value: 42 },
    { label: "Transport", value: 28 },
    { label: "Teacher-Related", value: 22 },
    { label: "Fee & Account", value: 18 },
    { label: "Sports", value: 14 },
    { label: "Infrastructure", value: 12 },
    { label: "Homework", value: 6 },
];

export const BY_CLASS = [
    { label: "Class 10", value: 24 },
    { label: "Class 9", value: 20 },
    { label: "Class 8", value: 18 },
    { label: "Class 7", value: 16 },
    { label: "Class 6", value: 14 },
    { label: "Class 5", value: 12 },
    { label: "Others", value: 38 },
];

export const BY_ROLE = [
    { label: "Admin", value: 38 },
    { label: "Office Staff", value: 18 },
    { label: "Teachers", value: 14 },
];

// { label, caption, value }
export const BY_EMPLOYEE = [
    { label: "Ms. Anjali Sen", caption: "Coordinator", value: 14 },
    { label: "Mr. Raj Kumar", caption: "Transport Head", value: 12 },
    { label: "VP Singh", caption: "Vice Principal", value: 9 },
    { label: "Ms. Rita Paul", caption: "Accounts", value: 8 },
    { label: "Mr. Sharma", caption: "Facility Mgr", value: 7 },
];

// { label, pct, color }
export const BY_SOURCE = [
    { label: "App", pct: 62, color: C.green },
    { label: "Walk-in", pct: 18, color: C.amber },
    { label: "Phone", pct: 12, color: C.textMuted },
    { label: "Email", pct: 8, color: C.textFaint },
];

// `pct` drives the bar; `chip` is the badge text. Time-based rows use pct as a
// relative gauge, percentage rows use their own number.
export const SLA_METRICS = [
    { label: "Avg. Acknowledgement Time", chip: "1.2 hrs", pct: 52, color: C.green },
    { label: "Avg. Resolution Time", chip: "5.4 days", pct: 66, color: C.amber },
    { label: "SLA Compliance", chip: "78%", pct: 78, color: C.amber },
    { label: "Parent Satisfaction", chip: "80%", pct: 80, color: C.green },
];

// { label, value }  — value already includes its unit
export const FREQUENT_COMPLAINTS = [
    { label: "Classroom Cleanliness", value: "8 times" },
    { label: "Transport Delay", value: "6 times" },
    { label: "Teacher Communication", value: "5 times" },
    { label: "Canteen Quality", value: "4 times" },
    { label: "Lab Equipment", value: "3 times" },
];

export const FREQUENTLY_INVOLVED = [
    { label: "Transport Dept", value: "6 repeated" },
    { label: "Mr. Raj Kumar", value: "4 repeated" },
    { label: "Facilities", value: "3 repeated" },
];

// Recharts donut. `headline` is the number rendered in the middle.
export const PARENT_SATISFACTION = {
    headline: 80,
    slices: [
        { name: "Satisfied", value: 80, color: C.green },
        { name: "Partially Satisfied", value: 11, color: C.amber },
        { name: "Not Satisfied", value: 9, color: C.red },
    ],
};
