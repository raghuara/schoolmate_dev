import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { GettingGrades02, GettingGradesData } from '../../Api/Api';

export const fetchGradesData = createAsyncThunk(
  'grades/fetchGradesData',
  async (_, { rejectWithValue }) => {
    const token = "123"; 
    try {
      const response = await axios.get(GettingGrades02, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const gradesSlice = createSlice({
  name: 'grades',
  initialState: {
    data: [], 
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGradesData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGradesData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchGradesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectGrades = (state) => state.grades.data;
export const selectGradesLoading = (state) => state.grades.loading;
export const selectGradesError = (state) => state.grades.error;

export default gradesSlice.reducer;