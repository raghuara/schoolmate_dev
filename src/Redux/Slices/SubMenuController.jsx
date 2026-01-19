import { createSlice } from '@reduxjs/toolkit';

const submenuSlice = createSlice({
  name: 'submenu', 
  initialState: {
    isSubmenuOpen: false, 
  },
  reducers: {
    
    openSubmenu: (state) => {
      state.isSubmenuOpen = true;
    },
    
    closeSubmenu: (state) => {
      state.isSubmenuOpen = false;
    },
   
  },
});

export const { openSubmenu, closeSubmenu } = submenuSlice.actions;
export default submenuSlice.reducer;
