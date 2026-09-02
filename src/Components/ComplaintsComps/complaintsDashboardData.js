// Tile definitions for the Complaints management dashboard.
//
// Each entry pairs a label and its Figma icon/colour with the `key` it reads out of the
// /complaints/management/dashboard `counts` object. Every tile here is backed by a real
// field — the earlier set opened with Today / This Week / This Month, which the endpoint
// does not return, so those tiles could only ever have shown invented numbers.

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";

import { C, TINT } from "./complaintsTokens";

// Row 1 — volume. { key, label, icon, iconColor, iconBg, valueColor? }
export const VOLUME_STAT_DEFS = [
    { key: "total", label: "Total", icon: AssignmentOutlinedIcon, iconColor: C.textMuted, iconBg: TINT.neutral },
    { key: "open", label: "Open", icon: InboxOutlinedIcon, iconColor: C.blue, iconBg: TINT.blue },
    { key: "actionRequired", label: "Action Required", icon: PendingActionsOutlinedIcon, iconColor: C.amber, iconBg: TINT.amber },
    { key: "resolved", label: "Resolved", icon: CheckCircleOutlineOutlinedIcon, iconColor: C.green, iconBg: TINT.green },
    { key: "closed", label: "Closed", icon: CheckCircleOutlineOutlinedIcon, iconColor: C.textMuted, iconBg: TINT.neutral },
];

// Row 2 — attention. These carry a coloured value.
export const ATTENTION_STAT_DEFS = [
    { key: "overdue", label: "Overdue", icon: WarningAmberOutlinedIcon, iconColor: C.red, iconBg: TINT.red, valueColor: C.red },
    { key: "critical", label: "Critical", icon: WarningAmberOutlinedIcon, iconColor: C.redDark, iconBg: TINT.redDark, valueColor: C.redDark },
    { key: "high", label: "High Priority", icon: OutlinedFlagIcon, iconColor: C.amber, iconBg: TINT.amber, valueColor: C.amber },
    { key: "unassigned", label: "Unassigned", icon: PersonOutlineOutlinedIcon, iconColor: C.textMuted, iconBg: TINT.neutral },
    { key: "reopened", label: "Reopened", icon: RefreshOutlinedIcon, iconColor: C.textMuted, iconBg: TINT.neutral },
];

/**
 * Fill a tile row from the dashboard `counts`.
 *
 * Before the response lands the value is an em dash, not 0 — "0 overdue" is a claim, and
 * showing it while still loading would state something the screen does not yet know.
 */
export const statsFrom = (defs, counts) =>
    defs.map((def) => ({
        ...def,
        label: def.label,
        value: counts ? String(counts[def.key] ?? 0) : "—",
    }));

/* The SLA card reads three scalars rather than a list. `pct` drives the bar; the
   percentage is its own gauge, the two averages are shown as hours with no bar, because a
   duration has no natural maximum to scale against. */
export const slaMetricsFrom = (averages) => {
    if (!averages) return [];
    return [
        {
            label: "Avg. Acknowledgement Time",
            chip: `${averages.acknowledgementHours} hrs`,
            pct: 0,
            color: C.green,
        },
        {
            label: "Avg. Resolution Time",
            chip: `${averages.resolutionHours} hrs`,
            pct: 0,
            color: C.amber,
        },
        {
            label: "SLA Compliance",
            chip: `${averages.slaCompliancePercent}%`,
            pct: Number(averages.slaCompliancePercent) || 0,
            color: C.amber,
        },
    ];
};

/* Sections the dashboard endpoint does not return. Listed here rather than left as blank
   cards so it is clear the gap is the API's, not a loading state:
     - by class            (no class breakdown in the response)
     - by reported role    (byOwner is the assignee, not the reporter's role)
     - by source           (App / Walk-in / Phone / Email is not counted)
     - frequently involved (repeatedIssues counts subjects, not people or departments) */
export const NOT_IN_DASHBOARD_API = "Not returned by the dashboard API.";
