// Tile definitions for the Internal Complaints tab of the Management Dashboard.
//
// Same endpoint as the parent dashboard — /complaints/management/dashboard with
// moduleType=StaffConcern — so the tiles read the same `counts` object. Only the labels
// differ, because an internal record is an "action" rather than a complaint.

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { C, TINT } from "./complaintsTokens";

// { key, label, icon, iconColor, iconBg, valueColor? } — `key` indexes into `counts`.
export const INTERNAL_STAT_DEFS = [
    { key: "open", label: "Total Open Actions", icon: AssignmentOutlinedIcon, iconColor: C.blue, iconBg: TINT.blue },
    { key: "overdue", label: "Overdue Actions", icon: WarningAmberOutlinedIcon, iconColor: C.red, iconBg: TINT.red, valueColor: C.red },
    { key: "high", label: "High Priority", icon: OutlinedFlagIcon, iconColor: C.amber, iconBg: TINT.amber },
    { key: "critical", label: "Critical", icon: ReportGmailerrorredOutlinedIcon, iconColor: C.red, iconBg: TINT.red, valueColor: C.red },
    { key: "reopened", label: "Reopened Actions", icon: RefreshOutlinedIcon, iconColor: C.amber, iconBg: TINT.amber },
];

/* Cards the dashboard endpoint has no field for. Objects, not arrays — the screen
   destructures these into MetricCard props, so an array would silently yield undefined
   for every one of them:
     - average resolution time as a card (the scalar exists; this card also wants a trend)
     - on-time completion rate
     - reopened-actions trend
     - the compliance overview (facility / cleanliness / portion / notebook / circular)
     - the suggestion, appreciation and attention feed */
export const RESOLUTION_TIME = {};
export const ON_TIME_COMPLETION = {};
export const REOPENED_ACTIONS = {};
export const COMPLIANCE_OVERVIEW = [];
export const FEED_CARDS = [];

export const NOT_IN_DASHBOARD_API = "Not returned by the dashboard API.";
