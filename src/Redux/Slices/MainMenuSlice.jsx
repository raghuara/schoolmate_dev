import { createSlice } from '@reduxjs/toolkit';

const mainMenuSlice = createSlice({
  name: 'mainMenu',
  initialState: {
    isMainMenuOpen: false,
  },
  reducers: {
    openMainMenu: (state) => {
      state.isMainMenuOpen = true;
    },
    closeMainMenu: (state) => {
      state.isMainMenuOpen = false;
    },
    toggleMainMenu: (state) => {
      state.isMainMenuOpen = !state.isMainMenuOpen;
    },
  },
});

export const { openMainMenu, closeMainMenu, toggleMainMenu } = mainMenuSlice.actions;

export default mainMenuSlice.reducer;
