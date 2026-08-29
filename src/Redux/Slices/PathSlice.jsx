import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    communicationActivePaths: [
        '/dashboardmenu/com-dashboard',
        '/dashboardmenu/news',
        '/dashboardmenu/news/create',
        '/dashboardmenu/news/edit',
        '/dashboardmenu/messages',
        '/dashboardmenu/messages/create',
        '/dashboardmenu/messages/edit',
        '/dashboardmenu/circulars',
        '/dashboardmenu/circulars/create',
        '/dashboardmenu/circulars/edit',
        '/dashboardmenu/consentforms',
        '/dashboardmenu/consentforms/create',
        '/dashboardmenu/consentforms/edit',
        '/dashboardmenu/consentforms/responses',
        '/dashboardmenu/contact',
        '/dashboardmenu/schoolcalendar',
        '/dashboardmenu/events',
        '/dashboardmenu/birthday-post',
        '/dashboardmenu/feedback',
        '/dashboardmenu/feedback/create',
        '/dashboardmenu/feedback/responses',
        '/dashboardmenu/feedback/questions',
        '/dashboardmenu/notification',
        '/dashboardmenu/chats',
    ],
    academicsActivePaths: [
        '/dashboardmenu/timetables',
        '/dashboardmenu/timetables/create',
        '/dashboardmenu/timetables/teachercreate',
        '/dashboardmenu/timetables/edit',
        '/dashboardmenu/homework',
        '/dashboardmenu/homework/create',
        '/dashboardmenu/homework/edit',
        '/dashboardmenu/examtimetables',
        '/dashboardmenu/examtimetables/create',
        '/dashboardmenu/examtimetables/edit',
        '/dashboardmenu/studymaterials',
        '/dashboardmenu/studymaterials/main',
        '/dashboardmenu/studymaterials/folder',
        '/dashboardmenu/studymaterials/create',
        '/dashboardmenu/studymaterials/edit',
        '/dashboardmenu/marks',
        '/dashboardmenu/marks/addmarks',
        '/dashboardmenu/marks/view',
        '/dashboardmenu/attendance',
        '/dashboardmenu/attendance/export',
        '/dashboardmenu/attendance/addattendance',
        '/dashboardmenu/attendance/irregular',
        '/dashboardmenu/assessment/online-quiz',
        '/dashboardmenu/assessment/online-quiz/create',
        '/dashboardmenu/assessment/online-quiz/analysis',
        '/dashboardmenu/assessment/online-quiz/all',
        '/dashboardmenu/assessment/online-quiz/approvals',
        '/dashboardmenu/books',
        '/dashboardmenu/books/upload',
        '/dashboardmenu/assessment/question-paper',
        '/dashboardmenu/assessment/question-paper/all',
        '/dashboardmenu/assessment/question-paper/create',
        '/dashboardmenu/assessment/question-paper/bank',
        '/dashboardmenu/assessment/question-paper/patterns',
        '/dashboardmenu/assessment/question-paper/patterns/create',
    ],
    myProjectsActivePaths: [
        '/dashboardmenu/myprojects',
        '/dashboardmenu/status',
        '/dashboardmenu/draft',
        '/dashboardmenu/workdone',
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
export const selectAcademicsActivePaths = (state) => state.paths.academicsActivePaths;
export const selectMyProjectsActivePaths = (state) => state.paths.myProjectsActivePaths;
export const selectERPActivePaths = (state) => state.paths.ERPActivePaths;

export default pathsSlice.reducer;
