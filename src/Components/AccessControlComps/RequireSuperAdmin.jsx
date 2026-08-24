import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUserTypeID } from "../../Redux/Slices/AuthSlice";

// Roles & Permissions decides what every other screen may do - including the
// screen that grants permissions - so it cannot itself be a grantable
// permission without letting a role widen its own access. It is reserved for
// the Super Admin user type instead.
//
// userTypeID is the numeric id from the login response, not the display name,
// so this does not repeat the "superadmin" vs "Super Admin" string problem.
export const SUPER_ADMIN_USER_TYPE_ID = 1;

export default function RequireSuperAdmin({ redirectTo = "/dashboardmenu/dashboard", children }) {
    const userTypeID = useSelector(selectUserTypeID);
    if (Number(userTypeID) !== SUPER_ADMIN_USER_TYPE_ID) return <Navigate to={redirectTo} replace />;
    return children;
}
