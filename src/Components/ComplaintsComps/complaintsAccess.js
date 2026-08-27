// Single source of truth for Complaints permission keys.
//
// WHY THIS FILE EXISTS
// Every Complaints screen is role-gated, and the Parent and Internal tabs are
// separate permissions even where they share a page component. Rather than
// scatter subMenu strings across ~20 routes and pages, each screen is named once
// here. When the backend starts returning a `complaints` mainMenu from
// GetUserTypePermissions, the ONLY thing that has to change is the `subMenu`
// strings below — no page, route or component edits.
//
// The permission shape from login is:
//   { mainMenu: "complaints", subMenus: [{ subMenu, permissions: { view:'Y', edit:'Y', ... } }] }
//
// `viewAction` / `editAction` default to "view" / "edit" but can be overridden
// per screen, because the existing modules in this app use custom action keys
// too (e.g. "allowbilling", "allowuseractivity") — see AuthSlice.

export const COMPLAINTS_MENU = "complaints";

// Kept for the callers written before per-screen keys existed.
export const CONFIG_SUBMENU = "configurations";

export const COMPLAINTS_SCREENS = {
    // ── Module level ─────────────────────────────────────────────────────────
    dashboard: { subMenu: "dashboard" },
    // The unified workspace listing parent complaints and internal actions. Its own
    // key, not the dashboard's — a role may work the queue without seeing the
    // management dashboard, or the reverse.
    manage: { subMenu: "manage" },
    // The staff-facing queue. Distinct from `manage`: a staff member works only
    // what is assigned to them and has no business in the admin workspace, while
    // an admin may have the workspace without a personal queue. Grant this
    // subMenu to the staff role(s) — do NOT gate the screen on a userType string.
    myWork: { subMenu: "mywork" },
    // Front-desk intake: registering a complaint on a parent's behalf. Separate
    // from `manage` — an office user may take complaints in without being able to
    // work the admin queue.
    registerComplaint: { subMenu: "registercomplaint" },
    // Staff-side intake: reporting a school operations issue. Its own key for the
    // same reason — the two streams are separately permissioned throughout.
    addIssue: { subMenu: "addissue" },
    configurations: { subMenu: "configurations" },

    // ── Parent Complaints configuration ──────────────────────────────────────
    categories: { subMenu: "categories" },
    rolePermissions: { subMenu: "rolepermissions" },
    sla: { subMenu: "sla" },
    escalation: { subMenu: "escalation" },
    notificationTemplates: { subMenu: "notificationtemplates" },
    assignmentMapping: { subMenu: "assignmentmapping" },
    dashboardConfig: { subMenu: "dashboardconfig" },
    auditLog: { subMenu: "auditlog" },

    // ── Internal Complaints configuration ────────────────────────────────────
    // Deliberately distinct keys: a role may administer Parent complaints without
    // administering internal operations, and vice versa.
    internalCategories: { subMenu: "internalcategories" },
    internalRolePermissions: { subMenu: "internalrolepermissions" },
    internalSla: { subMenu: "internalsla" },
    internalEscalation: { subMenu: "internalescalation" },
    internalNotificationTemplates: { subMenu: "internalnotificationtemplates" },
    internalAssignmentMapping: { subMenu: "internalassignmentmapping" },
    internalDashboardConfig: { subMenu: "internaldashboardconfig" },
    internalAuditLog: { subMenu: "internalauditlog" },
};

// Unknown keys fall back to the module-level configurations permission rather
// than throwing, so a typo degrades to "same as today" instead of a blank screen.
export const resolveComplaintsScreen = (key) =>
    COMPLAINTS_SCREENS[key] || COMPLAINTS_SCREENS[CONFIG_SUBMENU] || { subMenu: CONFIG_SUBMENU };
