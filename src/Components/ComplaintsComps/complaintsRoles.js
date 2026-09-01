import { initialsOf } from "./auditLogDetailData";

/**
 * The school's real roles and the people in them, for the two permissions screens.
 *
 * WHY THIS REPLACED A HARDCODED LIST
 * Both screens used to rail off a fixed four — Super Admin, Admin, Office Staff, Teacher —
 * with invented users under each. The live directory has no "Office Staff" at all, and the
 * roles it does have (Staff, and whatever a school adds later) were missing. Worse, the
 * rail is not decoration: the selected role's NAME is the `subjectKey` sent to the
 * permissions API, so a role that does not exist saves permissions against nothing.
 *
 * The list comes from the userTypes store, which Router.js populates on load, so a role
 * added in Access Control appears here without an edit.
 */

/* Students are not permission subjects on a staff configuration screen. */
const EXCLUDED = new Set(["student"]);

/** → [{ id, name, userCount }] in store order. `id` is the userTypeID as a string. */
export const rolesFromUserTypes = (userTypes) =>
    (userTypes || [])
        .filter((type) => type?.userType && !EXCLUDED.has(String(type.userType).toLowerCase()))
        .map((type) => ({
            id: String(type.userTypeID),
            name: type.userType,
            userCount: type.userCount ?? (type.users || []).length,
        }));

/**
 * → [{ id, name, title, initials }] for one role.
 *
 * The directory carries only a roll number and a name — there are no job titles, so `title`
 * shows the roll number, which is real and identifies the person unambiguously when two
 * share a name.
 */
export const usersForRole = (userTypes, roleId) => {
    const match = (userTypes || []).find((type) => String(type.userTypeID) === String(roleId));
    return (match?.users || []).map((user) => ({
        id: String(user.rollNumber ?? ""),
        name: user.name || "",
        title: String(user.rollNumber ?? ""),
        initials: initialsOf(user.name || ""),
    }));
};

/**
 * The same list addressed by role NAME rather than id, for screens that hold a role name
 * in their form state (the assignment-mapping drawer stores the name, because that is what
 * the mapping API records).
 */
export const usersForRoleName = (userTypes, roleName) => {
    const match = (userTypes || []).find(
        (type) => String(type?.userType || "").toLowerCase() === String(roleName || "").toLowerCase(),
    );
    return usersForRole(userTypes, match?.userTypeID);
};
