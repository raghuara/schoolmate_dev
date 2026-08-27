import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { GetAllApprovalMatrix } from '../../Api/Api';

const token = '123';

// Every module that can carry an approval flow, and the subMenu the matrix is
// stored against. This is the single list - the settings screen renders from it
// and the create screens look themselves up in it, so the two can never drift.
export const APPROVAL_MODULES = [
    { key: 'news', label: 'News', group: 'Communication' },
    { key: 'message', label: 'Messages', group: 'Communication' },
    { key: 'circular', label: 'Circular', group: 'Communication' },
    { key: 'homework', label: 'Homework', group: 'Communication' },
    { key: 'createfeesstructure', label: 'Create Fee Structure', group: 'Fee & Finance' },
    // Leave approvals are single-approver, not multi-level: one user type either
    // approves that kind of leave or nobody does. singleApprover drives the UI.
    { key: 'studentleave', label: 'Student Leave', group: 'Leave & Attendance', singleApprover: true },
    { key: 'staffleave', label: 'Staff Leave', group: 'Leave & Attendance', singleApprover: true },
];

// Named keys for call sites. Always use these instead of typing the string -
// "message" and "createfeesstructure" do not match their screen names, and a
// typo silently turns approval off rather than on.
export const APPROVAL_SUBMENUS = {
    NEWS: 'news',
    MESSAGE: 'message',
    CIRCULAR: 'circular',
    HOMEWORK: 'homework',
    FEE_STRUCTURE: 'createfeesstructure',
    STUDENT_LEAVE: 'studentleave',
    STAFF_LEAVE: 'staffleave',
};

export const fetchApprovalMatrix = createAsyncThunk(
    'approvalMatrix/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(GetAllApprovalMatrix, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const body = res?.data;
            if (!body || body.error) {
                return rejectWithValue(body?.message || 'Failed to load approval flows');
            }
            return body.data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err.message);
        }
    },
);

const initialState = {
    list: [],
    loading: false,
    error: null,
    lastFetched: null,
};

const approvalMatrixSlice = createSlice({
    name: 'approvalMatrix',
    initialState,
    reducers: {
        // Used right after a save so the screens pick up the new flow without a
        // second round trip.
        setApprovalMatrix: (state, action) => {
            state.list = Array.isArray(action.payload) ? action.payload : [];
            state.lastFetched = new Date().toISOString();
        },
        resetApprovalMatrix: (state) => {
            state.list = [];
            state.error = null;
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchApprovalMatrix.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApprovalMatrix.fulfilled, (state, action) => {
                state.loading = false;
                state.list = Array.isArray(action.payload) ? action.payload : [];
                state.lastFetched = new Date().toISOString();
            })
            .addCase(fetchApprovalMatrix.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setApprovalMatrix, resetApprovalMatrix } = approvalMatrixSlice.actions;

export const selectApprovalMatrix = (state) => state.approvalMatrix.list;
export const selectApprovalMatrixLoading = (state) => state.approvalMatrix.loading;
export const selectApprovalMatrixError = (state) => state.approvalMatrix.error;
// False until the matrix has actually been fetched once. Screens use this so
// they do not bounce an approver out while the flow is still loading.
export const selectApprovalMatrixReady = (state) => Boolean(state.approvalMatrix.lastFetched);

/* ── Reading the flow ──────────────────────────────────────────────────────
   Level 1 is the final approver and posts without a request. Every level below
   sends its work upward one level at a time. A level approves every level under
   it, plus Others. "Others" means a user type that can use the module but holds
   no level - they can only request, never approve. When approvalWithinSameLevel
   is "Y", peers on the same level can clear each other, and only each other.
--------------------------------------------------------------------------- */

export const findApprovalFlow = (matrix, subMenu) =>
    (matrix || []).find((row) => row?.subMenu === subMenu) || null;

// Configured levels as user type ids, top level first.
export const approvalLevelIds = (flow) =>
    [flow?.level1, flow?.level2, flow?.level3]
        .map((lvl) => lvl?.userTypeID)
        .filter((id) => id !== null && id !== undefined);

// Approval only applies once a Level 1 exists.
export const isApprovalRequired = (matrix, subMenu) =>
    approvalLevelIds(findApprovalFlow(matrix, subMenu)).length > 0;

// 1 / 2 / 3 for a configured approver, 0 for everyone else ("Others").
export const approvalLevelOf = (matrix, subMenu, userTypeID) => {
    const ids = approvalLevelIds(findApprovalFlow(matrix, subMenu));
    const index = ids.findIndex((id) => String(id) === String(userTypeID));
    return index === -1 ? 0 : index + 1;
};

// True when this user posts straight to live: either the module has no approval
// flow at all, or they are Level 1.
export const canPublishDirect = (matrix, subMenu, userTypeID) => {
    if (!isApprovalRequired(matrix, subMenu)) return true;
    return approvalLevelOf(matrix, subMenu, userTypeID) === 1;
};

// The mirror of the above - drives the "Request Approval" button.
export const mustRequestApproval = (matrix, subMenu, userTypeID) =>
    !canPublishDirect(matrix, subMenu, userTypeID);

// True when this user sits on any level of this module's chain, so they have
// an approval queue worth showing. Level 0 ("Others") only ever requests.
export const isApproverFor = (matrix, subMenu, userTypeID) =>
    approvalLevelOf(matrix, subMenu, userTypeID) > 0;

// Levels this user's item travels through, nearest approver first.
// Level 3 -> [2, 1]; Level 2 -> [1]; Others -> every level, bottom up.
export const approvalChainFor = (matrix, subMenu, userTypeID) => {
    const count = approvalLevelIds(findApprovalFlow(matrix, subMenu)).length;
    if (!count) return [];
    const level = approvalLevelOf(matrix, subMenu, userTypeID);
    if (level === 1) return [];
    const highest = level === 0 ? count : level - 1;
    return Array.from({ length: highest }, (_, i) => highest - i);
};

// Can this approver act on an item raised by that person?
export const canApproveItemOf = (matrix, subMenu, approverTypeID, requesterTypeID) => {
    const flow = findApprovalFlow(matrix, subMenu);
    if (!flow) return false;

    const approverLevel = approvalLevelOf(matrix, subMenu, approverTypeID);
    if (approverLevel === 0) return false; // Others never approve.

    const requesterLevel = approvalLevelOf(matrix, subMenu, requesterTypeID);
    if (requesterLevel === 0) return true; // Anyone with a level clears Others.

    if (approverLevel < requesterLevel) return true; // A level above always can.
    if (approverLevel === requesterLevel) return flow.approvalWithinSameLevel === 'Y';
    return false;
};

// One call for a screen that needs the whole picture.
export const approvalRoleFor = (matrix, subMenu, userTypeID) => {
    const flow = findApprovalFlow(matrix, subMenu);
    const levels = approvalLevelIds(flow);
    const level = approvalLevelOf(matrix, subMenu, userTypeID);
    return {
        flow,
        required: levels.length > 0,
        level,                                   // 0 = Others
        isOthers: levels.length > 0 && level === 0,
        canPublishDirect: canPublishDirect(matrix, subMenu, userTypeID),
        mustRequest: mustRequestApproval(matrix, subMenu, userTypeID),
        chain: approvalChainFor(matrix, subMenu, userTypeID),
        sameLevelAllowed: flow?.approvalWithinSameLevel === 'Y',
        totalLevels: levels.length,
    };
};

export default approvalMatrixSlice.reducer;
