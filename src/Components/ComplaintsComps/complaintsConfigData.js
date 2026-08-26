// Configuration tiles for the Complaints module, matching the dev-Figma comp.
//
// `badge` is optional (only three tiles carry one). `path` is the sub-screen each
// tile should open — none of those screens are designed yet, so the tiles are
// wired to a no-op until the routes exist.
//
// Figma exports icons as empty <div>s, so the icons below are inferred from each
// glyph's bounding box plus the tile's meaning. Swap any that read wrong.

import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

export const CONFIG_ITEMS = [
    {
        key: "category",
        title: "Category Configuration",
        description: "Manage complaint categories and default handling rules.",
        icon: CategoryOutlinedIcon,
        badge: "Core",
        path: "/dashboardmenu/complaints/configuration/categories",
    },
    {
        key: "assignment",
        title: "Assignment Mapping",
        description: "Configure complaint routing and ownership mapping.",
        icon: AccountTreeOutlinedIcon,
        path: "/dashboardmenu/complaints/configuration/assignment-mapping",
    },
    {
        key: "roles",
        title: "Role & Permission Configuration",
        description: "Control which authorised roles can access complaint actions.",
        icon: LockOutlinedIcon,
        path: "/dashboardmenu/complaints/configuration/permissions",
    },
    {
        key: "sla",
        title: "SLA Configuration",
        description: "Configure complaint response and resolution deadlines.",
        icon: ScheduleOutlinedIcon,
        badge: "System",
        path: "/dashboardmenu/complaints/configuration/sla",
    },
    {
        key: "escalation",
        title: "Escalation Configuration",
        description: "Define escalation triggers and escalation levels.",
        icon: WarningAmberOutlinedIcon,
        path: "/dashboardmenu/complaints/configuration/escalation",
    },
    {
        key: "notification",
        title: "Notification Template Configuration",
        description: "Manage complaint-related notification messages.",
        icon: EmailOutlinedIcon,
        path: "/dashboardmenu/complaints/configuration/notification-templates",
    },
    {
        key: "dashboard",
        title: "Dashboard Configuration",
        description: "Configure which complaint metrics are available in dashboards.",
        icon: DashboardOutlinedIcon,
        path: "/dashboardmenu/complaints/configuration/dashboard",
    },
    {
        key: "audit",
        title: "Audit Log",
        description: "View and track complaint system activity and configuration changes.",
        icon: HistoryOutlinedIcon,
        badge: "Logs",
        path: "/dashboardmenu/complaints/configuration/audit-log",
    },
];
