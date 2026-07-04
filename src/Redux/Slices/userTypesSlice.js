import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { GetAllUserTypes } from '../../Api/Api';

const token = '123';

// Frontend-owned defaults — always present, never change, never come from the backend.
// (Backend still returns id 1 & 2 for now; it will drop them and start from id 3 later.)
export const DEFAULT_USER_TYPES = [
    { userTypeID: 1, userType: 'Super Admin', isDefault: true },
    { userTypeID: 2, userType: 'Student', isDefault: true },
];

const DEFAULT_IDS = new Set(DEFAULT_USER_TYPES.map((u) => u.userTypeID));
const DEFAULT_NAME_KEYS = new Set(
    DEFAULT_USER_TYPES.map((u) => u.userType.toLowerCase().replace(/\s/g, '')),
);

const nameKey = (v) => String(v || '').toLowerCase().replace(/\s/g, '');

// Always: [ ...two frontend defaults, ...backend items that are NOT a default ].
// Dedupe by id OR normalized name so we never show Super Admin / Student twice.
// While the backend still returns id 1 & 2, borrow their userCount/users/createdDate
// onto the defaults — but the frontend id + userType always win. Once the backend
// stops sending id 1 & 2, the defaults simply have no count/members.
const mergeWithDefaults = (apiList) => {
    const api = Array.isArray(apiList) ? apiList : [];
    const defaults = DEFAULT_USER_TYPES.map((d) => {
        const match = api.find(
            (u) => u && (u.userTypeID === d.userTypeID || nameKey(u.userType) === nameKey(d.userType)),
        );
        return match ? { ...match, ...d } : d;
    });
    const extras = api
        .filter((u) => u && u.userTypeID != null)
        .filter((u) => !DEFAULT_IDS.has(u.userTypeID))
        .filter((u) => !DEFAULT_NAME_KEYS.has(nameKey(u.userType)));
    return [...defaults, ...extras];
};

export const fetchUserTypes = createAsyncThunk(
    'userTypes/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(GetAllUserTypes, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const body = res?.data;
            if (!body || body.error) {
                return rejectWithValue(body?.message || 'Failed to load user types');
            }
            return body.data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err.message);
        }
    },
);

const initialState = {
    list: DEFAULT_USER_TYPES,
    loading: false,
    error: null,
    lastFetched: null,
};

const userTypesSlice = createSlice({
    name: 'userTypes',
    initialState,
    reducers: {

        setUserTypes: (state, action) => {
            state.list = mergeWithDefaults(action.payload);
        },
        resetUserTypes: (state) => {
            state.list = DEFAULT_USER_TYPES;
            state.error = null;
            state.lastFetched = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchUserTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.list = mergeWithDefaults(action.payload);
                state.lastFetched = new Date().toISOString();
            })
            .addCase(fetchUserTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Never leave the store without the two defaults.
                if (!Array.isArray(state.list) || state.list.length === 0) {
                    state.list = DEFAULT_USER_TYPES;
                }
            });
    },
});

export const { setUserTypes, resetUserTypes } = userTypesSlice.actions;

export const selectUserTypes = (state) => state.userTypes.list;
export const selectUserTypesLoading = (state) => state.userTypes.loading;
export const selectUserTypesError = (state) => state.userTypes.error;
export const selectUserTypeById = (id) => (state) =>
    (state.userTypes.list || []).find((u) => u.userTypeID === id) || null;

export default userTypesSlice.reducer;
