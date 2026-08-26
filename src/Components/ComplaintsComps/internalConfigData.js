// Configuration tiles for the Internal Complaints tab of the Configurations screen.
// Values mirror the dev-Figma comp 1:1. `route` is where each tile should navigate
// once its screen exists — left null until then.

import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

// { title, description, icon, badge?, route? }
// Figma drew flat squares for most icons — these are the closest MUI equivalents.
export const INTERNAL_CONFIG_CARDS = [
    {
        title: "Entry & Category Configuration",
        description: "Manage Internal Excellence entry types and categories.",
        icon: CategoryOutlinedIcon,
        badge: "6 Types",
        route: "/dashboardmenu/complaints/configuration/internal-categories",
    },
    {
        title: "Department & Ownership Mapping",
        description:
            "Configure department routing, ownership and default responsibility for Internal Excellence actions.",
        icon: AccountTreeOutlinedIcon,
        route: "/dashboardmenu/complaints/configuration/internal-assignment-mapping",
    },
    {
        title: "Role & Permission Configuration",
        description: "Control which authorised roles can access and perform Internal Excellence actions.",
        icon: AdminPanelSettingsOutlinedIcon,
        badge: "System",
        route: "/dashboardmenu/complaints/configuration/internal-permissions",
    },
    {
        title: "SLA Configuration",
        description: "Configure target response, action and completion timelines for internal actions.",
        icon: TimerOutlinedIcon,
        route: "/dashboardmenu/complaints/configuration/internal-sla",
    },
    {
        title: "Escalation Configuration",
        description:
            "Define escalation triggers and escalation levels for overdue, repeated or unresolved internal actions.",
        icon: TrendingUpOutlinedIcon,
        // The escalation comp is identical on both sides — same hierarchy, same five
        // triggers — and its Level 1 copy already reads "School Operations actions",
        // so both tiles open the one screen. Split this into an internal variant if
        // the two ever diverge.
        route: "/dashboardmenu/complaints/configuration/escalation",
    },
    {
        title: "Notification Configuration",
        description: "Manage Internal Excellence notifications, reminders and workflow messages.",
        icon: NotificationsNoneOutlinedIcon,
        route: "/dashboardmenu/complaints/configuration/internal-notification-templates",
    },
    {
        title: "Dashboard Configuration",
        description:
            "Configure which Internal Excellence metrics and widgets are visible in the management dashboard.",
        icon: DashboardOutlinedIcon,
        route: "/dashboardmenu/complaints/configuration/internal-dashboard",
    },
    {
        title: "Audit Log",
        description:
            "View and track Internal Excellence system activity, configuration changes, assignments, status changes, evidence updates, escalations and closures.",
        icon: HistoryOutlinedIcon,
        badge: "Logs",
        route: "/dashboardmenu/complaints/configuration/internal-audit-log",
    },
];
