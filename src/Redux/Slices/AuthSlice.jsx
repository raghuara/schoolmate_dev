import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { GetUserTypePermissions } from '../../Api/Api';

const initialState = {
    name: '',
    rollNumber: '',
    userType: '',
    financeUserType: null,
    position: '',
    grade: null,
    gradeID: null,
    section: null,
    bloodGroup: null,
    studentPermanentNumber: null,
    fatherNameInEnglish: null,
    fatherMobileNumber: null,
    motherNameInEnglish: null,
    motherMobileNumber: null,
    guardianNameInEnglish: null,
    guardianMobileNumber: null,
    siblingCount: null,
    siblingDetails: [],
    sessionId: '',
    isAuthenticated: false,
    userTypeID: null,
    permissions: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const {
                name,
                rollNumber,
                userType,
                financeUserType,
                position,
                grade,
                gradeID,
                section,
                bloodGroup,
                studentPermanentNumber,
                fatherNameInEnglish,
                fatherMobileNumber,
                motherNameInEnglish,
                motherMobileNumber,
                guardianNameInEnglish,
                guardianMobileNumber,
                siblingCount,
                siblingDetails,
                sessionId,
                userTypeID,
                permissions,
            } = action.payload;

            state.name = name ?? '';
            state.rollNumber = rollNumber ?? '';
            state.userType = userType ?? '';
            state.financeUserType = financeUserType ?? null;
            state.position = position ?? '';
            state.grade = grade ?? null;
            state.gradeID = gradeID ?? null;
            state.section = section ?? null;
            state.bloodGroup = bloodGroup ?? null;
            state.studentPermanentNumber = studentPermanentNumber ?? null;
            state.fatherNameInEnglish = fatherNameInEnglish ?? null;
            state.fatherMobileNumber = fatherMobileNumber ?? null;
            state.motherNameInEnglish = motherNameInEnglish ?? null;
            state.motherMobileNumber = motherMobileNumber ?? null;
            state.guardianNameInEnglish = guardianNameInEnglish ?? null;
            state.guardianMobileNumber = guardianMobileNumber ?? null;
            state.siblingCount = siblingCount ?? null;
            state.siblingDetails = Array.isArray(siblingDetails) ? siblingDetails : [];
            state.sessionId = sessionId ?? '';
            state.userTypeID = userTypeID ?? permissions?.userTypeID ?? null;
            state.permissions = permissions ?? null;
            state.isAuthenticated = true;
        },
        /* Permissions are captured at login and then persisted, so a session that
           has been open since before a permission key existed never sees it - the
           screen still hides, and the route guard still redirects, however many
           times an admin sets it to "Y". This lets the app re-read the tree
           without forcing everyone to log out and back in. */
        setPermissions: (state, action) => {
            const permissions = action.payload;
            if (!permissions?.mainMenus?.length) return; // never blank a working session
            state.permissions = permissions;
            state.userTypeID = permissions.userTypeID ?? state.userTypeID;
        },

        logout: () => {
            localStorage.removeItem("sessionId");
            return { ...initialState };
        },
    },
});

export const { loginSuccess, setPermissions, logout } = authSlice.actions;

/* Re-reads this user type's permissions from the server. Fired once on app load;
   a failure is silent because the persisted tree is still perfectly usable. */
export const refreshPermissions = () => async (dispatch, getState) => {
    const { userTypeID, userType } = getState().auth || {};
    if (userTypeID === null || userTypeID === undefined || !userType) return;
    try {
        const res = await axios.post(
            GetUserTypePermissions,
            { userTypeID, userType },
            { headers: { Authorization: "Bearer 123" } },
        );
        const data = res?.data?.data;
        if (data?.mainMenus?.length) dispatch(setPermissions(data));
    } catch {
        // keep what login stored
    }
};

// ── Permission helpers ──────────────────────────────────────────────────────
// The login response's `userTypePermissions` shape:
//   { userTypeID, userType, mainMenus: [ { mainMenu, subMenus: [ { subMenu, permissions: { view:'Y', create:'Y', ... } } ] } ] }
export const findSubMenuPermissions = (permissions, mainMenu, subMenu) => {
    const menus = permissions?.mainMenus || [];
    const mm = menus.find((m) => m.mainMenu === mainMenu);
    if (!mm) return null;
    const sm = (mm.subMenus || []).find((s) => s.subMenu === subMenu);
    return sm?.permissions || null;
};

// True when the given action ('view' | 'create' | 'edit' | 'delete' | any custom key) is 'Y'.
export const hasPermission = (permissions, mainMenu, subMenu, action = 'view') => {
    const p = findSubMenuPermissions(permissions, mainMenu, subMenu);
    return !!p && p[action] === 'Y';
};

// True when the sub menu grants at least one action.
export const hasAnyPermission = (permissions, mainMenu, subMenu) => {
    const p = findSubMenuPermissions(permissions, mainMenu, subMenu);
    return !!p && Object.values(p).some((v) => v === 'Y');
};

// True when the main menu grants at least one action across any of its sub menus.
export const hasMainMenuAccess = (permissions, mainMenu) => {
    const mm = (permissions?.mainMenus || []).find((m) => m.mainMenu === mainMenu);
    if (!mm) return false;
    return (mm.subMenus || []).some((s) => Object.values(s.permissions || {}).some((v) => v === 'Y'));
};

// Selectors
export const selectAuth = (state) => state.auth;
export const selectPermissions = (state) => state.auth.permissions;
export const selectUserTypeID = (state) => state.auth.userTypeID;
export const selectUserType = (state) => state.auth.userType;
export const selectFinanceUserType = (state) => state.auth.financeUserType;
export const selectPosition = (state) => state.auth.position;
export const selectSiblingDetails = (state) => state.auth.siblingDetails;
export const selectSubMenuPermissions = (mainMenu, subMenu) => (state) =>
    findSubMenuPermissions(state.auth.permissions, mainMenu, subMenu);
export const selectHasAnyPermission = (mainMenu, subMenu) => (state) =>
    hasAnyPermission(state.auth.permissions, mainMenu, subMenu);
export const selectHasMainMenuAccess = (mainMenu) => (state) =>
    hasMainMenuAccess(state.auth.permissions, mainMenu);
// Curried selector: useSelector(selectHasPermission('feeandfinance', 'billingscreen', 'allowbilling'))
export const selectHasPermission = (mainMenu, subMenu, action = 'view') => (state) =>
    hasPermission(state.auth.permissions, mainMenu, subMenu, action);

export default authSlice.reducer;
