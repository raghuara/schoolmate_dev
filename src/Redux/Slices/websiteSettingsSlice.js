import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getSchoolConfig } from '../../Api/Api';
import LogoImage from '../../Images/Login/SchoolMate Logo.png';

const token = '123';

const initialState = {
  logo: LogoImage,
  title: '',
  darkColor: "#EEA200",
  mainColor: "#FCBE3A",
  lightColor: "#FFF7E5",
  textColor: "#000000",
  backgroundColor: "#fef8eb",
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchWebsiteSettings = createAsyncThunk(
  'websiteSettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(getSchoolConfig, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = res?.data;
      if (!body || body.error) {
        return rejectWithValue(body?.message || 'Failed to load school config');
      }
      return {
        logo: body.logo || '',
        title: body.schoolName || '',
      };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  },
);

const websiteSettingsSlice = createSlice({
  name: 'websiteSettings',
  initialState,
  reducers: {
    setWebsiteSettings: (state, action) => {
      const payload = action.payload || {};
      Object.keys(payload).forEach((key) => {
        if (payload[key] !== undefined) state[key] = payload[key];
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebsiteSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebsiteSettings.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.logo) state.logo = action.payload.logo;
        state.title = action.payload.title;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchWebsiteSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setWebsiteSettings } = websiteSettingsSlice.actions;

export const selectWebsiteSettings = (state) => state.websiteSettings;
export const selectSchoolLogo = (state) => state.websiteSettings.logo;
export const selectSchoolName = (state) => state.websiteSettings.title;
export const selectWebsiteSettingsLoading = (state) => state.websiteSettings.loading;

export default websiteSettingsSlice.reducer;
