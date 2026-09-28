import React from "react";
import { Navigate } from "react-router-dom";
import useRolesPermissionAccess from "./rolesPermissionAccess";

export default function RequireSuperAdmin({ need = "canAny", redirectTo = "/dashboardmenu/dashboard", children }) {
    const access = useRolesPermissionAccess();
    if (!access[need]) return <Navigate to={redirectTo} replace />;
    return children;
}
