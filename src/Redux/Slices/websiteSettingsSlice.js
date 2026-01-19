import { createSlice } from '@reduxjs/toolkit';
import LogoImage from '../../Images/Login/MSMSLogo.png';

const initialState = {
  logo: LogoImage,
  title: "MORNING STAR MATRICULATION SCHOOL",
  darkColor: "#EEA200",
  mainColor: "#FCBE3A",
  lightColor: "#FFF7E5",
  textColor: "#000000",
  backgroundColor: "#fef8eb",
};

const websiteSettingsSlice = createSlice({
  name: 'websiteSettings',
  initialState,
  reducers: {
    setWebsiteSettings: (state, action) => {
      state.logo = action.payload.logo;
      state.title = action.payload.title;
      state.darkColor = action.payload.darkColor;
      state.mainColor = action.payload.mainColor;
      state.lightColor = action.payload.lightColor;
      state.textColor = action.payload.textColor;
      state.backgroundColor = action.payload.backgroundColor;
    },
  },
});

export const { setWebsiteSettings } = websiteSettingsSlice.actions;
export const selectWebsiteSettings = (state) => state.websiteSettings;

export default websiteSettingsSlice.reducer;
