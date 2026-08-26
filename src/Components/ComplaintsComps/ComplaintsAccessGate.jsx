import React from "react";
import { Navigate } from "react-router-dom";
import useComplaintsPermissions from "./useComplaintsPermissions";

// Route-level role gate for Complaints screens, mirroring how the rest of the app
// guards routes with <RequirePermission> (see Router.js / AccessControlComps).
//
//   <Route path="…/internal-sla" element={
//       <ComplaintsAccessGate screen="internalSla"><InternalSlaPage /></ComplaintsAccessGate>
//   } />
//
// `screen` is a key from complaintsAccess.js. Until the backend returns a
// `complaints` mainMenu this always allows — so wiring it up now costs nothing
// and enforcement switches on by itself once permissions ship, with no edits here
// or in the pages.
export default function ComplaintsAccessGate({
    screen,
    action = "view",
    redirectTo = "/dashboardmenu/dashboard",
    children,
}) {
    const { can } = useComplaintsPermissions(screen);
    if (!can(action)) return <Navigate to={redirectTo} replace />;
    return children;
}
