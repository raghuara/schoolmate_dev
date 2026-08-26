import { useSelector } from "react-redux";
import { selectPermissions, findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import {
    COMPLAINTS_MENU,
    CONFIG_SUBMENU,
    resolveComplaintsScreen,
} from "./complaintsAccess";

// Access for the Complaints module. Configurations is an admin-side screen, but the
// role that may reach it is decided by GetUserTypePermissions — never by comparing
// against a userType string here. Same reasoning as the note on the sidebar's
// Complaints tab (SideBar.jsx): a hardcoded "Super Admin" check breaks the moment a
// school defines its own admin role.
//
// Pass a screen key from complaintsAccess.js to check that specific screen —
// `useComplaintsPermissions("internalSla")`. Calling it with no argument keeps the
// old module-level "configurations" behaviour, so existing callers are unaffected.
export { COMPLAINTS_MENU, CONFIG_SUBMENU };

export default function useComplaintsPermissions(screenKey = CONFIG_SUBMENU) {
    const permissions = useSelector(selectPermissions);

    // The backend does not return a `complaints` mainMenu yet. While it is absent we
    // cannot deny anyone — that would lock the module out for every role, including
    // the ones meant to have it. Once the menu ships, `menuPresent` flips to true and
    // the real permissions below take over with no further code change.
    const menuPresent = (permissions?.mainMenus || []).some((m) => m.mainMenu === COMPLAINTS_MENU);

    const { subMenu, viewAction = "view", editAction = "edit" } = resolveComplaintsScreen(screenKey);
    const screenPerms = findSubMenuPermissions(permissions, COMPLAINTS_MENU, subMenu);

    // Permissive until the backend owns this menu; strict the moment it does.
    const can = (action) => (menuPresent ? screenPerms?.[action] === "Y" : true);

    return {
        // True once the backend is the source of truth for this module.
        permissionsReady: menuPresent,
        // The subMenu this call resolved to — handy when debugging a denied screen.
        subMenu,
        can,
        canView: can(viewAction),
        canEdit: can(editAction),
        // Names used by the callers written before per-screen keys existed.
        canViewConfig: can(viewAction),
        canEditConfig: can(editAction),
    };
}
