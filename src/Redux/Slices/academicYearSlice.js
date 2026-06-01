import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { GetAcademicYearConfig } from '../../Api/Api';

const token = '123';

const parseYearRange = (ayString) => {
  if (!ayString) return null;
  const parts = String(ayString).split('-').map((s) => Number(s.trim()));
  if (parts.length === 1 && Number.isFinite(parts[0])) {
    return { start: parts[0], isCalendarYear: true };
  }
  if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
    return { start: parts[0], isCalendarYear: false };
  }
  return null;
};

const buildOptions = (currentAY) => {
  const parsed = parseYearRange(currentAY);
  if (!parsed) return [];
  const { start, isCalendarYear } = parsed;
  const out = [];
  for (let offset = 2; offset >= 0; offset -= 1) {
    const s = start - offset;
    out.push(isCalendarYear ? `${s}` : `${s}-${s + 1}`);
  }
  return out;
};

const deriveCurrentAY = (startMonth1Indexed) => {
  if (!Number.isInteger(startMonth1Indexed)) return null;
  const now = new Date();
  const cm = now.getMonth() + 1;
  const cy = now.getFullYear();
  if (startMonth1Indexed === 1) return `${cy}`;
  if (cm >= startMonth1Indexed) return `${cy}-${cy + 1}`;
  return `${cy - 1}-${cy}`;
};

export const fetchAcademicYearConfig = createAsyncThunk(
  'academicYear/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(GetAcademicYearConfig, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = res?.data;
      if (!body || body.error) {
        return rejectWithValue(body?.message || 'Academic year not configured');
      }
      return body;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  selectedYear: null,
  currentYear: null,
  options: [],
  startMonth: null,
  endMonth: null,
  startMonthName: null,
  endMonthName: null,
  isLocked: false,
  isConfigured: false,
  loading: false,
  error: null,
};

const academicYearSlice = createSlice({
  name: 'academicYear',
  initialState,
  reducers: {
    setSelectedAcademicYear: (state, action) => {
      state.selectedYear = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAcademicYearConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAcademicYearConfig.fulfilled, (state, action) => {
        const body = action.payload;
        const currentAY = body.currentAcademicYear || deriveCurrentAY(body.startMonth);
        state.loading = false;
        state.isConfigured = true;
        state.startMonth = body.startMonth ?? null;
        state.endMonth = body.endMonth ?? null;
        state.startMonthName = body.startMonthName ?? null;
        state.endMonthName = body.endMonthName ?? null;
        state.isLocked = !!body.isLocked;
        state.currentYear = currentAY;
        state.options = buildOptions(currentAY);
        if (!state.selectedYear || !state.options.includes(state.selectedYear)) {
          state.selectedYear = currentAY;
        }
      })
      .addCase(fetchAcademicYearConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isConfigured = false;
      });
  },
});

export const { setSelectedAcademicYear } = academicYearSlice.actions;

export const selectAcademicYear = (state) => state.academicYear.selectedYear;
export const selectAcademicYearOptions = (state) => state.academicYear.options;
export const selectAcademicYearCurrent = (state) => state.academicYear.currentYear;
export const selectAcademicYearMeta = (state) => state.academicYear;

export default academicYearSlice.reducer;
