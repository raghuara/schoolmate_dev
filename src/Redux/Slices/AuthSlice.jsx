import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    name: '',
    rollNumber: '',
    userType: '',
    grade: '',
    section: '',
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
            const { name, rollNumber, userType, grade, section, sessionId, userTypeID, permissions } = action.payload;
            state.name = name;
            state.rollNumber = rollNumber;
            state.userType = userType;
            state.grade = grade;
            state.section = section;
            state.sessionId = sessionId;
            state.userTypeID = userTypeID ?? permissions?.userTypeID ?? null;
            state.permissions = permissions ?? null;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.name = '';
            state.rollNumber = '';
            state.userType = '';
            state.grade = '';
            state.section = '';
            state.sessionId = '';
            state.userTypeID = null;
            state.permissions = null;
            state.isAuthenticated = false;
            localStorage.removeItem("sessionId");
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;

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

// Selectors
export const selectAuth = (state) => state.auth;
export const selectPermissions = (state) => state.auth.permissions;
export const selectUserTypeID = (state) => state.auth.userTypeID;
// Curried selector: useSelector(selectHasPermission('feeandfinance', 'billingscreen', 'allowbilling'))
export const selectHasPermission = (mainMenu, subMenu, action = 'view') => (state) =>
    hasPermission(state.auth.permissions, mainMenu, subMenu, action);

export default authSlice.reducer;
