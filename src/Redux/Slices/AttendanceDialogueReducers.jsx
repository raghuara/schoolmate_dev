import { createSlice } from '@reduxjs/toolkit';

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState: {
    isDialog1Open: false,
    isDialog2Open: false,
    isDialog3Open: false,
    isDialog4Open: false,
    isDialog5Open: false,
  },
  reducers: {
    openDialog1: (state) => {
      state.isDialog1Open = true;
    },
    closeDialog1: (state) => {
      state.isDialog1Open = false;
    },
    
    openDialog2: (state) => {
      state.isDialog2Open = true;
    },
    closeDialog2: (state) => {
      state.isDialog2Open = false;
    },
   
    
    openDialog3: (state) => {
      state.isDialog3Open = true;
    },
    closeDialog3: (state) => {
      state.isDialog3Open = false;
    },
   
    
    openDialog4: (state) => {
      state.isDialog4Open = true;
    },
    closeDialog4: (state) => {
      state.isDialog4Open = false;
    },
  

    openDialog5: (state) => {
      state.isDialog5Open = true;
    },
    closeDialog5: (state) => {
      state.isDialog5Open = false;
    },
   
  },
});

export const {
  openDialog1, closeDialog1,
  openDialog2, closeDialog2,
  openDialog3, closeDialog3,
  openDialog4, closeDialog4,
  openDialog5, closeDialog5,
} = dialogsSlice.actions;

export default dialogsSlice.reducer;
