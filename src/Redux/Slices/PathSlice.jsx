import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    communicationActivePaths: [
        '/dashboardmenu/news',
        '/dashboardmenu/messages',
        '/dashboardmenu/circulars',
        '/dashboardmenu/consentforms',
        '/dashboardmenu/timetables',
        '/dashboardmenu/homework',
        '/dashboardmenu/examtimetables',
        '/dashboardmenu/studymaterials',
        '/dashboardmenu/marks',
        '/dashboardmenu/schoolcalendar',
        '/dashboardmenu/events',
        '/dashboardmenu/feedback',
        '/dashboardmenu/attendance',
        '/dashboardmenu/attendance/export',
        '/dashboardmenu/notification',
        '/dashboardmenu/attendance/addattendance',
        '/dashboardmenu/attendance/irregular',
        '/dashboardmenu/news/create',
        '/dashboardmenu/news/edit',
        '/dashboardmenu/messages/create',
        '/dashboardmenu/messages/edit',
        '/dashboardmenu/circulars/create',
        '/dashboardmenu/circulars/edit',
        '/dashboardmenu/consentforms/create',
        '/dashboardmenu/consentforms/edit',
        '/dashboardmenu/consentforms/responses',
        '/dashboardmenu/marks/addmarks',
        '/dashboardmenu/marks/view',
        '/dashboardmenu/timetables/create',
        '/dashboardmenu/timetables/teachercreate',
        '/dashboardmenu/timetables/edit',
        '/dashboardmenu/homework/create',
        '/dashboardmenu/homework/edit',
        '/dashboardmenu/examtimetables/create',
        '/dashboardmenu/examtimetables/edit',
        '/dashboardmenu/studymaterials/main',
        '/dashboardmenu/studymaterials/folder',
        '/dashboardmenu/studymaterials/create',
        '/dashboardmenu/studymaterials/edit',
        '/dashboardmenu/feedback/create',
        '/dashboardmenu/feedback/responses',
        '/dashboardmenu/feedback/questions',
    ],
    myProjectsActivePaths: [
        '/dashboardmenu/myprojects',
        '/dashboardmenu/status',
        '/dashboardmenu/draft',
    ],
    
    ERPActivePaths: [
        '/dashboardmenu/news',
        '/dashboardmenu/messages',
        '/dashboardmenu/circulars',
        '/dashboardmenu/consentforms',
        '/dashboardmenu/timetables',
        '/dashboardmenu/homework',
        '/dashboardmenu/examtimetables',
        '/dashboardmenu/studymaterials',
        '/dashboardmenu/marks',
        '/dashboardmenu/schoolcalendar',
        '/dashboardmenu/events',
        '/dashboardmenu/feedback',
        '/dashboardmenu/attendance'
    ]
};

const pathsSlice = createSlice({
    name: 'paths',
    initialState,
    reducers: {}
});

export const selectCommunicationActivePaths = (state) => state.paths.communicationActivePaths;
export const selectMyProjectsActivePaths = (state) => state.paths.myProjectsActivePaths;
export const selectERPActivePaths = (state) => state.paths.ERPActivePaths;

export default pathsSlice.reducer;
