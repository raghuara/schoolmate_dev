import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import { DASH } from "../../DashBoardComps/dashboardTheme";

/* Every subMenu key below MUST match complaintsAccess.js, which is what the
   screens and route gates read. */

export const COMPLAINTS_MAIN_MENU = "complaints";
export const FLOW_SUBMENU = "flow";

export const MANAGEMENT_PAGES = [
    "Complaints Dashboard",
    "Manage Complaints",
    "Register Complaint",
    "Configuration Home",
    "Categories",
    "Role Permissions",
    "SLA Configuration",
    "Escalation",
    "Notification Templates",
    "Assignment Mapping",
    "Dashboard Configuration",
    "Audit Log",
    "Internal Categories",
    "Internal Role Permissions",
    "Internal SLA",
    "Internal Escalation",
    "Internal Notification Templates",
    "Internal Assignment Mapping",
    "Internal Dashboard Configuration",
    "Internal Audit Log",
];

export const STAFF_PAGES = [
    "My Work",
    "Add Issue",
];

export const PAGE_OVERRIDES = {
    "Complaints Dashboard": { subMenu: "dashboard", opsKeys: ["view"] },
    "Manage Complaints": { subMenu: "manage", opsKeys: ["view", "edit"] },
    "Register Complaint": { subMenu: "registercomplaint", opsKeys: ["view", "edit"] },
    "Configuration Home": { subMenu: "configurations", opsKeys: ["view", "edit"] },
    "Categories": { subMenu: "categories", opsKeys: ["view", "edit"] },
    "Role Permissions": { subMenu: "rolepermissions", opsKeys: ["view", "edit"] },
    "SLA Configuration": { subMenu: "sla", opsKeys: ["view", "edit"] },
    "Escalation": { subMenu: "escalation", opsKeys: ["view", "edit"] },
    "Notification Templates": { subMenu: "notificationtemplates", opsKeys: ["view", "edit"] },
    "Assignment Mapping": { subMenu: "assignmentmapping", opsKeys: ["view", "edit"] },
    "Dashboard Configuration": { subMenu: "dashboardconfig", opsKeys: ["view", "edit"] },
    "Audit Log": { subMenu: "auditlog", opsKeys: ["view"] },
    "Internal Categories": { subMenu: "internalcategories", opsKeys: ["view", "edit"] },
    "Internal Role Permissions": { subMenu: "internalrolepermissions", opsKeys: ["view", "edit"] },
    "Internal SLA": { subMenu: "internalsla", opsKeys: ["view", "edit"] },
    "Internal Escalation": { subMenu: "internalescalation", opsKeys: ["view", "edit"] },
    "Internal Notification Templates": { subMenu: "internalnotificationtemplates", opsKeys: ["view", "edit"] },
    "Internal Assignment Mapping": { subMenu: "internalassignmentmapping", opsKeys: ["view", "edit"] },
    "Internal Dashboard Configuration": { subMenu: "internaldashboardconfig", opsKeys: ["view", "edit"] },
    "Internal Audit Log": { subMenu: "internalauditlog", opsKeys: ["view"] },

    "My Work": { subMenu: "mywork", opsKeys: ["view", "edit"] },
    "Add Issue": { subMenu: "addissue", opsKeys: ["view", "edit"] },
};

export const COMPLAINTS_FLOWS = [
    {
        key: "management",
        name: "Management Flow",
        caption: "Dashboard, the full queue and every configuration screen",
        desc: "For the people who run the module - they see every complaint, assign and resolve it, and set the categories, SLA and escalation rules.",
        permKey: "managementflow",
        icon: SpaceDashboardOutlinedIcon,
        color: DASH.violet,
        pages: MANAGEMENT_PAGES,
    },
    {
        key: "staff",
        name: "Staff Flow",
        caption: "My Work queue and reporting an issue",
        desc: "For the people the work is assigned to - they act on what lands in their queue and raise a school operations issue. No configuration.",
        permKey: "staffflow",
        icon: AssignmentIndOutlinedIcon,
        color: DASH.cyan,
        pages: STAFF_PAGES,
    },
];

export const DEFAULT_FLOW = "management";

const subMenusFor = (pages) => pages.map((page) => PAGE_OVERRIDES[page].subMenu);

export const flowByKey = (key) => COMPLAINTS_FLOWS.find((f) => f.key === key) || COMPLAINTS_FLOWS[0];

export const ALL_FLOW_SUBMENUS = COMPLAINTS_FLOWS.flatMap((f) => subMenusFor(f.pages));

export const flowPermissions = (key) =>
    Object.fromEntries(COMPLAINTS_FLOWS.map((f) => [f.permKey, f.key === key ? "Y" : "N"]));

export const readFlow = (permissions) => {
    const menu = (permissions?.mainMenus || []).find((m) => m.mainMenu === COMPLAINTS_MAIN_MENU);
    const stored = (menu?.subMenus || []).find((s) => s.subMenu === FLOW_SUBMENU)?.permissions;
    return COMPLAINTS_FLOWS.find((f) => stored?.[f.permKey] === "Y")?.key || DEFAULT_FLOW;
};
