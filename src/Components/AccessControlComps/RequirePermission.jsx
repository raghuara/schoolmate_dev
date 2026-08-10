import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { findSubMenuPermissions, hasMainMenuAccess } from "../../Redux/Slices/AuthSlice";

export default function RequirePermission({ mainMenu = "profilemanagement", subMenu, anyOf = [], redirectTo = "/dashboardmenu/dashboard", children }) {
    const permissions = useSelector((state) => state.auth.permissions);

    // No subMenu given -> landing page for a module: allow when the user has
    // any permission under that mainMenu.
    if (!subMenu) {
        if (!hasMainMenuAccess(permissions, mainMenu)) return <Navigate to={redirectTo} replace />;
        return children;
    }

    const perms = findSubMenuPermissions(permissions, mainMenu, subMenu);
    const allowed = !!perms && anyOf.some((k) => perms[k] === "Y");
    if (!allowed) return <Navigate to={redirectTo} replace />;
    return children;
}
