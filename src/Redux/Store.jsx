import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import mainMenuReducer from './Slices/MainMenuSlice';
import submenuReducer from './Slices/SubMenuController';
import pathsReducer from './Slices/PathSlice';
import dialogsReducer from './Slices/AttendanceDialogueReducers';
import websiteSettingsReducer from './Slices/websiteSettingsSlice';
import gradesReducer from './Slices/DropdownController';
import authReducer from './Slices/AuthSlice';
import sidebarReducer from './Slices/sidebarSlice';
import versionReducer from './Slices/versionSlice';
import academicYearReducer from './Slices/academicYearSlice';
import chatReducer from './Slices/chatSlice';
import userTypesReducer from './Slices/userTypesSlice';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['name', 'rollNumber', 'userType', 'grade', 'section', 'isAuthenticated', 'userTypeID', 'permissions'],
};

const gradesPersistConfig = {
  key: 'grades',
  storage,
};

const sidebarPersistConfig = {
  key: 'sidebar',
  storage,
  whitelist: ['isExpanded'],
};

const versionPersistConfig = {
  key: 'version',
  storage,
  whitelist: ['LITE', 'PRO', 'PLUS', 'FULL_360'],
};

const academicYearPersistConfig = {
  key: 'academicYear',
  storage,
  whitelist: ['selectedYear', 'currentYear'],
};

const userTypesPersistConfig = {
  key: 'userTypes',
  storage,
  whitelist: ['list', 'lastFetched'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedGradesReducer = persistReducer(gradesPersistConfig, gradesReducer);
const persistedSidebarReducer = persistReducer(sidebarPersistConfig, sidebarReducer);
const persistedVersionReducer = persistReducer(versionPersistConfig, versionReducer);
const persistedAcademicYearReducer = persistReducer(academicYearPersistConfig, academicYearReducer);
const persistedUserTypesReducer = persistReducer(userTypesPersistConfig, userTypesReducer);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    menu: mainMenuReducer,
    submenu: submenuReducer,
    paths: pathsReducer,
    dialogs: dialogsReducer,
    websiteSettings: websiteSettingsReducer,
    grades: persistedGradesReducer,
    sidebar: persistedSidebarReducer,
    version: persistedVersionReducer,
    academicYear: persistedAcademicYearReducer,
    chat: chatReducer,
    userTypes: persistedUserTypesReducer,
  },
});

export const persistor = persistStore(store);

export default store;
