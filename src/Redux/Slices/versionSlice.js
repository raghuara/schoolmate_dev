import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    LITE: false,
    PRO: false,
    PLUS: false,
    FULL_360: false,
};

const versionSlice = createSlice({
    name: 'version',
    initialState,
    reducers: {
        setVersion: (state, action) => {
            state.LITE = action.payload.LITE;
            state.PRO = action.payload.PRO;
            state.PLUS = action.payload.PLUS;
            state.FULL_360 = action.payload.FULL_360;
        },
    },
});

export const { setVersion } = versionSlice.actions;
export const selectVersion = (state) => state.version;

export default versionSlice.reducer;
