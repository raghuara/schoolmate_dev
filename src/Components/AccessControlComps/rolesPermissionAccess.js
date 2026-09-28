import { useSelector } from "react-redux";
import { findSubMenuPermissions, selectPermissions, selectUserTypeID } from "../../Redux/Slices/AuthSlice";
import { isSuperAdminId } from "../../Redux/userTypeIds";

export const ROLES_MAIN_MENU = "accesscontrol";
export const ROLES_SUB_MENU = "rolesandpermission";

export const ROLES_KEYS = {
    userTypes: "manageusertypes",
    featurePermissions: "managefeaturepermissions",
    approvalFlows: "manageapprovalflows",
};

export const ROLES_KEY_LIST = Object.values(ROLES_KEYS);

/* Super Admin always holds every key, whatever the payload says - this is the
   permission that grants permissions, so it must never be able to lock itself
   out. Everyone else needs the key, and only once the backend actually publishes
   one: the subMenu ships today as `permissions: {}`, and reading an empty
   object as "denied" would take the screen away from roles that had it. */
export const rolesPermissionAccess = (permissions, userTypeID) => {
    const perms = findSubMenuPermissions(permissions, ROLES_MAIN_MENU, ROLES_SUB_MENU);
    const published = !!perms && Object.keys(perms).length > 0;
    const superAdmin = isSuperAdminId(userTypeID);
    const may = (key) => superAdmin || (published && perms[key] === "Y");

    const canUserTypes = may(ROLES_KEYS.userTypes);
    const canFeaturePermissions = may(ROLES_KEYS.featurePermissions);
    const canApprovalFlows = may(ROLES_KEYS.approvalFlows);

    return {
        published,
        superAdmin,
        canUserTypes,
        canFeaturePermissions,
        canApprovalFlows,
        canAny: canUserTypes || canFeaturePermissions || canApprovalFlows,
    };
};

export default function useRolesPermissionAccess() {
    const permissions = useSelector(selectPermissions);
    const userTypeID = useSelector(selectUserTypeID);
    return rolesPermissionAccess(permissions, userTypeID);
}
