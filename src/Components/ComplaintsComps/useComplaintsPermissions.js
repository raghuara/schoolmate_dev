import { useSelector } from "react-redux";
import { selectPermissions, selectUserTypeID, findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import { isSuperAdminId } from "../../Redux/userTypeIds";
import {
    COMPLAINTS_MENU,
    CONFIG_SUBMENU,
    FLOW_SUBMENU,
    FLOW_KEYS,
    resolveComplaintsScreen,
} from "./complaintsAccess";

export { COMPLAINTS_MENU, CONFIG_SUBMENU };

/* Access for the Complaints module, decided by the flow the role holds - see
   FLOW_SUBMENU in complaintsAccess.js. Until the backend publishes that key the
   module stays open, as every screen was before it had one. */
export default function useComplaintsPermissions(screenKey = CONFIG_SUBMENU) {
    const permissions = useSelector(selectPermissions);
    const userTypeID = useSelector(selectUserTypeID);

    const screen = resolveComplaintsScreen(screenKey);
    const flowPerms = findSubMenuPermissions(permissions, COMPLAINTS_MENU, FLOW_SUBMENU);
    const permissionsReady = !!flowPerms;

    const flowGranted = permissionsReady
        ? flowPerms[FLOW_KEYS[screen.flow] || FLOW_KEYS.management] === "Y"
        : true;
    const allowed = isSuperAdminId(userTypeID) || flowGranted;
    const can = () => allowed;

    return {
        permissionsReady,
        subMenu: screen.subMenu,
        flow: screen.flow,
        can,
        canView: allowed,
        canEdit: allowed,
        canViewConfig: allowed,
        canEditConfig: allowed,
    };
}
