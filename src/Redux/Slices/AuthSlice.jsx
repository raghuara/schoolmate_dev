import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    name: '',
    rollNumber: '',
    userType: '',
    grade: '',
    section: '',
    sessionId: '',
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const { name, rollNumber, userType, grade, section, sessionId } = action.payload;
            state.name = name;
            state.rollNumber = rollNumber;
            state.userType = userType;
            state.grade = grade;
            state.section = section;
            state.sessionId = sessionId;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.name = '';
            state.rollNumber = '';
            state.userType = '';
            state.grade = '';
            state.section = '';
            state.sessionId = '';
            state.isAuthenticated = false;
            localStorage.removeItem("sessionId");
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
