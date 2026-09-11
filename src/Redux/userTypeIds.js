/* The fixed user type ids the backend guarantees on every environment. Match on
   these, never on the userType string - the name arrives as "Super Admin",
   "superadmin" or "SuperAdmin" depending on the server and the endpoint. */
export const USER_TYPE_IDS = {
    SUPER_ADMIN: 1,
    STUDENT: 2,
    ADMIN: 3,
    TEACHER: 4,
};

const is = (userTypeID, wanted) => Number(userTypeID) === wanted;

export const isSuperAdminId = (userTypeID) => is(userTypeID, USER_TYPE_IDS.SUPER_ADMIN);
export const isStudentId = (userTypeID) => is(userTypeID, USER_TYPE_IDS.STUDENT);
export const isAdminId = (userTypeID) => is(userTypeID, USER_TYPE_IDS.ADMIN);
export const isTeacherId = (userTypeID) => is(userTypeID, USER_TYPE_IDS.TEACHER);

export const isAnyOfIds = (userTypeID, ids) => ids.some((id) => is(userTypeID, id));
