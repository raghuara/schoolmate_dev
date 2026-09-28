import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { findSubMenuPermissions, hasMainMenuAccess, selectUserTypeID } from "../../Redux/Slices/AuthSlice";
import { isSuperAdminId } from "../../Redux/userTypeIds";

/* Super Admin is locked on everywhere in Feature Permissions, so it is never
   turned away here either. For everyone else a screen whose keys the backend
   has not published yet (subMenu absent, or present with no keys) stays open -
   that is the state every screen was in before it had a key, and the moment
   real Y/N values arrive they decide. */
export default function RequirePermission({ mainMenu = "profilemanagement", subMenu, anyOf = [], redirectTo = "/dashboardmenu/dashboard", children }) {
    const permissions = useSelector((state) => state.auth.permissions);
    const userTypeID = useSelector(selectUserTypeID);

    if (isSuperAdminId(userTypeID)) return children;

    if (!subMenu) {
        const menu = (permissions?.mainMenus || []).find((m) => m.mainMenu === mainMenu);
        const configured = (menu?.subMenus || []).some((s) => s?.permissions && Object.keys(s.permissions).length > 0);
        if (configured && !hasMainMenuAccess(permissions, mainMenu)) return <Navigate to={redirectTo} replace />;
        return children;
    }

    const perms = findSubMenuPermissions(permissions, mainMenu, subMenu);
    if (!perms) return children;
    if (!anyOf.some((k) => perms[k] === "Y")) return <Navigate to={redirectTo} replace />;
    return children;
}
