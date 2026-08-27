/**
 * Super Admin is identified by userTypeID === 1 from the login response
 * (userTypePermissions.userTypeID), never by matching the userType string.
 *
 * The string form is unreliable: the login sends the display value
 * "Super Admin", while this module's literals use the API/roster form
 * "superadmin" (see the USER_TYPE maps in AddStaffAttendancePage). A direct
 * === between the two never matched, which silently disabled several screens.
 *
 * NOTE: this is only for the genuine role rule that has no permission key —
 * Super Admin leave is auto-approved, so they raise no leave requests.
 * Anything that is an ACCESS decision must come from the login response
 * permissions via selectSubMenuPermissions, not from here.
 */
export const SUPER_ADMIN_USER_TYPE_ID = 1;

export const isSuperAdminId = (userTypeID) =>
    Number(userTypeID) === SUPER_ADMIN_USER_TYPE_ID;
