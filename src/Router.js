import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import DashBoardLayout from "./Components/DashBoard/DashBoardLayout";
import RequirePermission from "./Components/AccessControlComps/RequirePermission";
import RequireSuperAdmin from "./Components/AccessControlComps/RequireSuperAdmin";
import ScrollToTop from "./Components/ScrollToTop";
import DashBoardPage from "./Pages/DashBoardPage";
import NewsPage from "./Components/CommunicationComps/NewsPage";
import MessagesPage from "./Components/CommunicationComps/MessagesPage";
import CircularsPage from "./Components/CommunicationComps/CircularsPage";
import ConsentFormsPage from "./Components/CommunicationComps/ConsentFormsPage";
import TimeTablePage from "./Components/CommunicationComps/TimeTablesPage";
import HomeWorkPage from "./Components/CommunicationComps/HomeWorkPage";
import ExamTimeTablesPage from "./Components/CommunicationComps/ExamTimeTablesPage";
import StudyMaterialsPage from "./Components/CommunicationComps/StudyMaterialsPage";
import MarksResultsPage from "./Components/CommunicationComps/MarksResultsPage";
import BirthdayPostPage from "./Components/CommunicationComps/BirthdayPostPage";
import FeedBackPage from "./Components/CommunicationComps/FeedBackPage";
import AttendancePage from "./Components/CommunicationComps/AttendancePage";
import SchoolCalenderPage from "./Components/CommunicationComps/SchoolCalenderPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import AddAttendancePage from "./Components/CommunicationComps/AttendanceComps/AddAttendancePage";
import IrregularAttendeesPage from "./Components/CommunicationComps/AttendanceComps/IrregularAttendeese";
import CreateNewsPage from "./Components/CommunicationComps/NewsComps/CreateNewsPage";
import EditNewsPage from "./Components/CommunicationComps/NewsComps/EditNewsPage";
import CreateMessagePage from "./Components/CommunicationComps/MessageComps/CreateMessagePage";
import EditMessagePage from "./Components/CommunicationComps/MessageComps/EditMessagePage";
import TransportPage from "./Components/TransportComps/TransportPage";
import ERPPage from "./Pages/ERPPage";
import CreateCircularsPage from "./Components/CommunicationComps/CircularsComps/CreateCircularsPage";
import EditCircularsPage from "./Components/CommunicationComps/CircularsComps/EditCircularsPage";
import CreateConsentFormsPage from "./Components/CommunicationComps/ConsentFormComps/CreateConsentFormsPage";
import EditConsentFormsPage from "./Components/CommunicationComps/ConsentFormComps/EditConsentFormsPage";
import ResponsesPage from "./Components/CommunicationComps/ConsentFormComps/ResponsesPage";
import AddMarksPage from "./Components/CommunicationComps/MarksComps/AddMarksPage";
import CreateTimeTablesPage from "./Components/CommunicationComps/TimeTablesComps/CreateTimeTable";
import EditTimeTablesPage from "./Components/CommunicationComps/TimeTablesComps/EditTimeTable";
import CreateHomeWorkPage from "./Components/CommunicationComps/HomeworkComps/CreateHomeWorkPage";
import EditHomeWorkPage from "./Components/CommunicationComps/HomeworkComps/EditHomeWorkPage";
import { fetchGradesData, selectGrades, selectGradesError, selectGradesLoading } from "./Redux/Slices/DropdownController";
import { fetchUserTypes } from "./Redux/Slices/userTypesSlice";
import { fetchApprovalMatrix } from "./Redux/Slices/approvalMatrixSlice";
import { useDispatch, useSelector } from "react-redux";
import Loader from "./Components/Loader";
import CreateExamTimeTablesPage from "./Components/CommunicationComps/ExamTimeTablesComps/CreateExamTimeTables";
import EditExamTimeTablesPage from "./Components/CommunicationComps/ExamTimeTablesComps/EditExamTimeTables";
import CreateStudyMaterialsPage from "./Components/CommunicationComps/StudyMaterialsComps/CreateStudyMaterials";
import EditStudyMaterialsPage from "./Components/CommunicationComps/StudyMaterialsComps/EditStudyMaterials";
import ViewMarksPage from "./Components/CommunicationComps/MarksComps/ViewMarksPage";
import ResponsesFeedBackPage from "./Components/CommunicationComps/FeedBackComps/ResponsesFeedBackPage";
import CreateFeedBackPage from "./Components/CommunicationComps/FeedBackComps/CreateFeedBackPage";
import QuestionsFeedBackPage from "./Components/CommunicationComps/FeedBackComps/QuestionsFeedBack";
import CreateTeacherTimeTablesPage from "./Components/CommunicationComps/TimeTablesComps/CreateTecherTimeTable";
import MyProjectPage from "./Components/MyProjects/MyProjects";
import WorkDonePage from "./Components/WorkDoneComps/WorkDonePage";
import WorkDoneSettings from "./Components/WorkDoneComps/WorkDoneSettings";
import SchedulePage from "./Components/MyProjects/SchedulePage";
// import DraftPage from "./Components/MyProjects/DraftPage";   // draft feature is off
import ApprovalPage from "./Components/Approvals/ApprovalPage";
import StudentLeaveApprovalPage from "./Components/Approvals/ApprovalPages/StudentLeaveApprovalPage";
import OnLeaveStudentsPage from "./Components/Approvals/ApprovalPages/OnLeaveStudentsPage";
import NewsApprovalPage from "./Components/Approvals/ApprovalPages/NewsApprovalPage";
import ApprovalStatusPage from "./Components/MyProjects/ApprovalStatusComps/ApprovalStatusPage";
import ApprovalStatusNewsPage from "./Components/MyProjects/ApprovalStatusComps/CommunicationStatusComps/ApprovalStatusNews";
import ApprovalStatusMessagesPage from "./Components/MyProjects/ApprovalStatusComps/CommunicationStatusComps/ApprovalStatusMessages";
import ApprovalStatusCircularsPage from "./Components/MyProjects/ApprovalStatusComps/CommunicationStatusComps/ApprovalStatusCirculars";
import MessagesApprovalPage from "./Components/Approvals/ApprovalPages/MessagesApprovalPage";
import CircularsApprovalPage from "./Components/Approvals/ApprovalPages/CircularsApprovalPage";
import StudentPage from "./Pages/StudentPage";
import StudentInformationPage from "./Components/StudentComps/StudentsInformationPage";
import StudentInfoPage from "./Components/StudentComps/StudentInformationComps/StudentInfoPage";
import CreateStudentInfoPage from "./Components/StudentComps/StudentInformationComps/CreateStudentInfoPage";
import EditStudentInfoPage from "./Components/StudentComps/StudentInformationComps/EditStudentInfo";
import NewsApprovalEditPage from "./Components/Approvals/ApprovalPages/EditPages/NewsApprovalEditPage";
import MessagesApprovalEditPage from "./Components/Approvals/ApprovalPages/EditPages/MessagesApprovalEditPage";
import CircularsApprovalEditPage from "./Components/Approvals/ApprovalPages/EditPages/CircularApprovalEditPage";
// import NewsDraftPage from "./Components/MyProjects/DraftComps/NewsComps/NewsDraftPage";   // draft feature is off
// import NewsDraftEditPage from "./Components/MyProjects/DraftComps/NewsComps/NewsDraftEditPage";   // draft feature is off
// import MessagesDraftPage from "./Components/MyProjects/DraftComps/MessagesComps/MessagesDraftPage";   // draft feature is off
// import MessagesDraftEditPage from "./Components/MyProjects/DraftComps/MessagesComps/MessagesDraftEditPage";   // draft feature is off
// import CircularsDraftPage from "./Components/MyProjects/DraftComps/CircularsComps/CircularsDraftPage";   // draft feature is off
// import CircularsDraftEditPage from "./Components/MyProjects/DraftComps/CircularsComps/CircularsDraftEditPage";   // draft feature is off
// import ConsentFormsDraftEditPage from "./Components/MyProjects/DraftComps/ConsentFormComps/ConsenFormDraftEditPage";   // draft feature is off
// import ConsentFormDraftPage from "./Components/MyProjects/DraftComps/ConsentFormComps/ConsentFormDraftPage";   // draft feature is off
// import ConsentFormDraftEditPage from "./Components/MyProjects/DraftComps/ConsentFormComps/ConsenFormDraftEditPage";   // draft feature is off
// import MarksDraftPage from "./Components/MyProjects/DraftComps/MarksComps/MarksDraftPage";   // draft feature is off
// import FeedBackDraftPage from "./Components/MyProjects/DraftComps/FeedBackComps/FeedBackDraftPage";   // draft feature is off
// import FeedBackDraftEditPage from "./Components/MyProjects/DraftComps/FeedBackComps/FeedBackDraftEditPage";   // draft feature is off
import SoonPage from "./Components/Soon";
import FolderStudyMaterialsPage from "./Components/CommunicationComps/StudyMaterialsComps/FolderStudyMaterials";
import MainStudyMaterialsPage from "./Components/CommunicationComps/StudyMaterialsComps/MainStudyMaterials";
import ManagementPage from "./Components/DashBoard/ManagementPage";
import NotificationPage from "./Components/CommunicationComps/NotificationPage";
import DashboardCreatePage from "./Components/DashBoard/DashboardCreatePage";
import ExportAttendancePage from "./Components/CommunicationComps/AttendanceComps/ExportAttendancePage";
import HomeworkApprovalPage from "./Components/Approvals/ApprovalPages/HomeworkApprovalPage";
import ApprovalStatusHomeworkPage from "./Components/MyProjects/ApprovalStatusComps/CommunicationStatusComps/ApprovalStatusHomework";
import AccessControlPage from "./Components/AccessControlComps/AccessControlPage";
import RolesPermissionsPage from "./Components/AccessControlComps/RolesPermissionsPage";
import FeaturePermissionsPage from "./Components/AccessControlComps/FeaturePermissionsPage";
import ProfileConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/ProfileConfigPage";
import CommunicationConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/CommunicationConfigPage";
import FinanceConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/FinanceConfigPage";
import LeaveConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/LeaveConfigPage";
import TransportConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/TransportConfigPage";
import InventoryConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/InventoryConfigPage";
import PurchaseConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/PurchaseConfigPage";
import ApprovalsConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/ApprovalsConfigPage";
import AccessConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/AccessConfigPage";
import MyProjectsConfigPage from "./Components/AccessControlComps/ModuleAccessConfigure/MyProjectsConfigPage";
import StudentPromotionPage from "./Components/AccessControlComps/StudentPromotionPage";
import IssueTcPage from "./Components/AccessControlComps/IssueTcPage";
import UsersPage from "./Components/AccessControlComps/UsersPage";
import UserActivityPage from "./Components/AccessControlComps/UsersComps/UserActivityPage";
import PasswordManagementPage from "./Components/AccessControlComps/UsersComps/PasswordManagementPage";
import FeeFinancePage from "./Components/StudentComps/FeeFinanceComps/FeeFinancePage";
import MergeSiblingsPage from "./Components/StudentComps/StudentInformationComps/MergeSiblingsPage";
import AcademicsPage from "./Components/AccessControlComps/AcademicsPage";
import AcademicYearSetupPage from "./Components/AccessControlComps/AcademicYearSetupPage";
import ExamManagementPage from "./Components/AccessControlComps/AcademicsComps/ExamManagementPage";
import SubjectMangementPage from "./Components/AccessControlComps/AcademicsComps/SubjectMangementPage";
import SubjectCreatePage from "./Components/AccessControlComps/AcademicsComps/SubjectCreatePage";
import ClassSectionManagementPage from "./Components/AccessControlComps/AcademicsComps/ClassSectionManagementPage";
import SchoolFeeStructure from "./Components/StudentComps/FeeFinanceComps/FeesStructure/SchoolFeeStructure";
import TransportFeeStructure from "./Components/StudentComps/FeeFinanceComps/FeesStructure/TransportFeeStructure";
import CreatedTransportFees from "./Components/StudentComps/FeeFinanceComps/FeesStructure/CreatedTransportFees";
import ExtraFeeStructure from "./Components/StudentComps/FeeFinanceComps/FeesStructure/ExtraFeeStructure";
import ExtraCurricularFeeStructure from "./Components/StudentComps/FeeFinanceComps/FeesStructure/ExtraCurricularFeeStructure";
import PayStudentFeePage from "./Components/StudentComps/FeeFinanceComps/PayStudentFees/PayStudentFeesPage";
import BillingScreen from "./Components/StudentComps/FeeFinanceComps/PayStudentFees/BillingScreen";
import TransactionHistory from "./Components/StudentComps/FeeFinanceComps/PayStudentFees/TransactionHistory";
// import FeesReportPage from "./Components/StudentComps/FeeFinanceComps/FeesReport/FeesReportPage";   // route commented out - unbuilt stub
import SpecialConcession from "./Components/StudentComps/FeeFinanceComps/PayStudentFees/SpecialConcession";
// import CreateConcessionPage from "./Components/StudentComps/FeeFinanceComps/Concession/CreateConcessionPage";   // route commented out - unreachable
// import ConcessionPage from "./Components/StudentComps/FeeFinanceComps/Concession/ConcessionPage";   // route commented out - unreachable
import ProfileManagement from "./Components/ProfileManagementComps/ProfileManagement";
import LeaveAttendanceMainPage from "./Components/LeaveAttendanceComps/LeaveAttendanceMainPage";
import InventoryPage from "./Components/InventoryComps/InventoryPage";
import StaffPage from "./Components/ProfileManagementComps/StaffComps/StaffPage";
import EcaStudents from "./Components/StudentComps/FeeFinanceComps/EcaCreationComps/EcaStudents";
import TransferredStudents from "./Components/StudentComps/FeeFinanceComps/EcaCreationComps/TransferredStudents";
import AddStaffDetails from "./Components/ProfileManagementComps/StaffComps/AddStaffDetails";
import ViewStaffDetails from "./Components/ProfileManagementComps/StaffComps/ViewStaffDetails";
import EditStaffDetails from "./Components/ProfileManagementComps/StaffComps/EditStaffDetails";
import SchoolFeeApprovalStatus from "./Components/MyProjects/ApprovalStatusComps/FeeStatusComps/SchoolFeeApprovalStatus";
import TransportFeeApprovalStatus from "./Components/MyProjects/ApprovalStatusComps/FeeStatusComps/TransportFeeApprovalStatus";
import ExtraCurricularFeeApprovalStatus from "./Components/MyProjects/ApprovalStatusComps/FeeStatusComps/ExtraCurricularFeeApprovalStatus";
import SchoolFeeApprovalPage from "./Components/Approvals/ApprovalPages/FeeApprovalComps/SchoolFeeApprovalPage";
import AssetsPage from "./Components/AssetsComps/AssetsPage";
import ExtraCurricularManage from "./Components/StudentComps/FeeFinanceComps/EcaCreationComps/ExtraCurricularManage";
import AdditionalFeeApprovalPage from "./Components/Approvals/ApprovalPages/FeeApprovalComps/AdditionalFeeApprovalPage";
import PaymentApprovalsPage from "./Components/Approvals/ApprovalPages/FeeApprovalComps/PaymentApprovalsPage";
import AdditionalFeeApprovalStatus from "./Components/MyProjects/ApprovalStatusComps/FeeStatusComps/AdditionalFeeApprovalStatus";
import EcaFeeApprovalPage from "./Components/Approvals/ApprovalPages/FeeApprovalComps/EcaFeeApprovalPage";
import AdditionalFeeManage from "./Components/StudentComps/FeeFinanceComps/AdditionalFeeComps/AdditionalFeeManage";
import FeeStudentMappingPage from "./Components/StudentComps/FeeFinanceComps/FeeStudentMappingPage";
import FinanceDashboard from "./Components/StudentComps/FeeFinanceComps/FinanceDashboardComps/FinanceDashboard";
import ExpensePage from "./Components/StudentComps/FeeFinanceComps/ExpenseComps/ExpensePage";
import ConcessionLog from "./Components/StudentComps/FeeFinanceComps/ConcessionLogComps/ConcessionLog";
import FinanceTeamsPage from "./Components/StudentComps/FeeFinanceComps/FinanceTeamComps/FinanceTeamsPage";
import TransportFeeApprovalPage from "./Components/Approvals/ApprovalPages/FeeApprovalComps/TransportFeeApprovalPage";
import AddEditPayroll from "./Components/LeaveAttendanceComps/PayrollComps/AddEditPayroll";
import PayrollOverview from "./Components/LeaveAttendanceComps/PayrollComps/PayrollOverview";
import SalaryStructures from "./Components/LeaveAttendanceComps/PayrollComps/SalaryStructures";
import ComplianceSettings from "./Components/LeaveAttendanceComps/PayrollComps/ComplianceSettings";
import ApprovePayroll from "./Components/LeaveAttendanceComps/PayrollComps/ApprovePayroll";
import BankReports from "./Components/LeaveAttendanceComps/PayrollComps/BankReports";
import SalaryRegister from "./Components/LeaveAttendanceComps/PayrollComps/SalaryRegister";
import MarkSalaryCreditedPage from "./Components/LeaveAttendanceComps/PayrollComps/MarkSalaryCreditedPage";
import LeavePolicy from "./Components/LeaveAttendanceComps/PayrollComps/LeavePolicy";
import LeaveMasterScreen from "./Components/LeaveAttendanceComps/PayrollComps/LeaveMasterScreen";
import LeaveAttendancePage from "./Components/LeaveAttendanceComps/LeaveAttendancePage";
import BiometricStaffMappingPage from "./Components/LeaveAttendanceComps/BiometricStaffMappingPage";
import VehicleDetailsPage from "./Components/TransportComps/TransportAssetComps/VehicleDetailsComps/VehicleDetailsPage";
import EditVehicleDetails from "./Components/TransportComps/TransportAssetComps/VehicleDetailsComps/EditVehicleDetails";
import VehicleManagementPage from "./Components/TransportComps/TransportAssetComps/VehicleDetailsComps/VehicleManagePage";
import ViewVehicleDetails from "./Components/TransportComps/TransportAssetComps/VehicleDetailsComps/ViewVehicleDetails";
import RouteManagement from "./Components/TransportComps/TransportAssetComps/RouteManagementComps/RouteManagement";
import StudentMapping from "./Components/TransportComps/TransportAssetComps/StudentMappingComps/StudentMapping";
import QuestionPaperGeneratorPage from "./Components/QuestionPaperGenerator/QuestionPaperGeneratorPage";
import CreateOnlineQuizPage from "./Components/AssessmentComps/OnlineQuizComps/CreateOnlineQuizPage";
import OnlineQuizDashboard from "./Components/AssessmentComps/OnlineQuizComps/OnlineQuizDashboard";
import QuizAnalysisPage from "./Components/AssessmentComps/OnlineQuizComps/QuizAnalysisPage";
import AllQuizzesPage from "./Components/AssessmentComps/OnlineQuizComps/AllQuizzesPage";
import QuizApprovalPage from "./Components/AssessmentComps/OnlineQuizComps/QuizApprovalPage";
import ViewProfilePage from "./Components/DashBoard/ViewProfilePage";
import CreatedEcaFees from "./Components/StudentComps/FeeFinanceComps/FeesStructure/CreatedEcaFees";
import CreatedExtraFees from "./Components/StudentComps/FeeFinanceComps/FeesStructure/CreatedExtraFees";
import CommunicationDashboard from "./Components/CommunicationComps/CommunicationDashboard";
import ContactDetails from "./Components/CommunicationComps/ContactDetails";
import ChatPage from "./Components/CommunicationComps/ChatComps/ChatPage";


export default function RouterPage() {
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const loading = useSelector(selectGradesLoading);
    const error = useSelector(selectGradesError);

    useEffect(() => {
        dispatch(fetchGradesData());
        dispatch(fetchUserTypes());
        dispatch(fetchApprovalMatrix());
    }, [dispatch]);

    // if (loading) return <div> <Loader /> </div>;
    // if (error) return <div> <Loader /> </div>;

    const startUrl = '/';
    return (
        <>
        <ScrollToTop />
        <Routes>
            <Route path={startUrl} element={<LoginPage />}></Route>
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="dashboardmenu" element={<DashBoardLayout />}>
                <Route path="soon" element={<SoonPage />} />

                {/*Main Pages */}
                <Route path="dashboard" element={<DashBoardPage />} />
                <Route path="transport" element={<RequirePermission mainMenu="transport"><TransportPage /></RequirePermission>} />
                <Route path="erp" element={<ERPPage />} />
                <Route path="dashboard/page" element={<ManagementPage />} />

                {/* --------------------------------------------------------------------------------------------------- */}

                {/* Profile Management */}
                <Route path="profile" element={<RequirePermission><ProfileManagement /></RequirePermission>} />

                <Route path="profile/student" element={<RequirePermission subMenu="studentmanagement" anyOf={["view", "create", "edit", "siblingapproval"]}><StudentPage /></RequirePermission>} />
                <Route path="profile/student/information" element={<RequirePermission subMenu="studentmanagement" anyOf={["view", "create", "edit", "siblingapproval"]}><StudentInformationPage /></RequirePermission>} />
                <Route path="profile/student/information/viewinfo" element={<RequirePermission subMenu="studentmanagement" anyOf={["view", "edit"]}><StudentInfoPage /></RequirePermission>} />
                <Route path="profile/student/information/create" element={<RequirePermission subMenu="studentmanagement" anyOf={["create"]}><CreateStudentInfoPage /></RequirePermission>} />
                <Route path="profile/student/information/edit" element={<RequirePermission subMenu="studentmanagement" anyOf={["edit"]}><EditStudentInfoPage /></RequirePermission>} />
                <Route path="profile/student/information/merge-sibling" element={<RequirePermission subMenu="studentmanagement" anyOf={["siblingapproval"]}><MergeSiblingsPage /></RequirePermission>} />

                <Route path="profile/staff" element={<RequirePermission subMenu="staffmanagement" anyOf={["view", "create", "edit"]}><StaffPage /></RequirePermission>} />
                <Route path="profile/staff/create" element={<RequirePermission subMenu="staffmanagement" anyOf={["create"]}><AddStaffDetails /></RequirePermission>} />
                <Route path="profile/staff/view" element={<RequirePermission subMenu="staffmanagement" anyOf={["view", "edit"]}><ViewStaffDetails /></RequirePermission>} />
                <Route path="profile/staff/edit" element={<RequirePermission subMenu="staffmanagement" anyOf={["edit"]}><EditStaffDetails /></RequirePermission>} />

                {/* --------------------------------------------------------------------------------------------------- */}

                {/* Communication */}
                <Route path="com-dashboard" element={<RequirePermission mainMenu="communication" subMenu="dashboard" anyOf={["view"]}><CommunicationDashboard /></RequirePermission>} />
                <Route path="chats" element={<ChatPage embedded />} />
                <Route path="news" element={<RequirePermission mainMenu="communication" subMenu="news" anyOf={["view"]}><NewsPage /></RequirePermission>} />
                <Route path="messages" element={<RequirePermission mainMenu="communication" subMenu="message" anyOf={["view"]}><MessagesPage /></RequirePermission>} />
                <Route path="circulars" element={<RequirePermission mainMenu="communication" subMenu="circular" anyOf={["view"]}><CircularsPage /></RequirePermission>} />
                <Route path="consentforms" element={<ConsentFormsPage />} />
                <Route path="contact" element={<RequirePermission mainMenu="communication" subMenu="contactdetails" anyOf={["view"]}><ContactDetails /></RequirePermission>} />
                <Route path="timetables" element={<RequirePermission mainMenu="communication" subMenu="timetable" anyOf={["view"]}><TimeTablePage /></RequirePermission>} />
                <Route path="homework" element={<RequirePermission mainMenu="communication" subMenu="homework" anyOf={["view"]}><HomeWorkPage /></RequirePermission>} />
                <Route path="examtimetables" element={<RequirePermission mainMenu="communication" subMenu="examtimetable" anyOf={["view"]}><ExamTimeTablesPage /></RequirePermission>} />
                <Route path="studymaterials" element={<RequirePermission mainMenu="communication" subMenu="studymaterial" anyOf={["view"]}><StudyMaterialsPage /></RequirePermission>} />
                <Route path="workdone" element={<RequirePermission mainMenu="myprojects" subMenu="workdone" anyOf={["allowdailyentry", "allowteacherwise", "allowclasswise", "allowperiodsettings"]}><WorkDonePage /></RequirePermission>} />
                <Route path="workdone/settings" element={<RequirePermission mainMenu="myprojects" subMenu="workdone" anyOf={["allowperiodsettings"]}><WorkDoneSettings /></RequirePermission>} />
                <Route path="marks" element={<RequirePermission mainMenu="communication" subMenu="marks" anyOf={["view"]}><MarksResultsPage /></RequirePermission>} />
                <Route path="schoolcalendar" element={<RequirePermission mainMenu="communication" subMenu="schoolcalender" anyOf={["view"]}><SchoolCalenderPage /></RequirePermission>} />
                {/* Important Events is now a tab inside School Calendar - old links still land somewhere sensible. */}
                <Route path="events" element={<Navigate to="/dashboardmenu/schoolcalendar" replace />} />
                <Route path="birthday-post" element={<RequirePermission mainMenu="communication" subMenu="birthdaypost" anyOf={["view"]}><BirthdayPostPage /></RequirePermission>} />
                <Route path="feedback" element={<RequirePermission mainMenu="communication" subMenu="feedback" anyOf={["view"]}><FeedBackPage /></RequirePermission>} />
                <Route path="attendance" element={<RequirePermission mainMenu="communication" subMenu="attendance" anyOf={["view"]}><AttendancePage /></RequirePermission>} />
                <Route path="notification" element={<RequirePermission mainMenu="communication" subMenu="notification" anyOf={["create"]}><NotificationPage /></RequirePermission>} />


                {/* Communication Branches*/}

                <Route path="dashboard/create" element={<DashboardCreatePage />} />

                <Route path="news/create" element={<RequirePermission mainMenu="communication" subMenu="news" anyOf={["create"]}><CreateNewsPage /></RequirePermission>} />
                <Route path="news/edit" element={<RequirePermission mainMenu="communication" subMenu="news" anyOf={["edit"]}><EditNewsPage /></RequirePermission>} />

                <Route path="messages/create" element={<RequirePermission mainMenu="communication" subMenu="message" anyOf={["create"]}><CreateMessagePage /></RequirePermission>} />
                <Route path="messages/edit" element={<RequirePermission mainMenu="communication" subMenu="message" anyOf={["edit"]}><EditMessagePage /></RequirePermission>} />

                <Route path="circulars/create" element={<RequirePermission mainMenu="communication" subMenu="circular" anyOf={["create"]}><CreateCircularsPage /></RequirePermission>} />
                <Route path="circulars/edit" element={<RequirePermission mainMenu="communication" subMenu="circular" anyOf={["edit"]}><EditCircularsPage /></RequirePermission>} />

                <Route path="consentforms/create" element={<CreateConsentFormsPage />} />
                {/* <Route path="consentforms/edit" element={<EditConsentFormsPage />} /> */}
                <Route path="consentforms/responses" element={<ResponsesPage />} />

                <Route path="timetables/create" element={<RequirePermission mainMenu="communication" subMenu="timetable" anyOf={["create"]}><CreateTimeTablesPage /></RequirePermission>} />
                <Route path="timetables/teachercreate" element={<RequirePermission mainMenu="communication" subMenu="timetable" anyOf={["create"]}><CreateTeacherTimeTablesPage /></RequirePermission>} />
                <Route path="timetables/edit" element={<RequirePermission mainMenu="communication" subMenu="timetable" anyOf={["edit"]}><EditTimeTablesPage /></RequirePermission>} />

                <Route path="homework/create" element={<RequirePermission mainMenu="communication" subMenu="homework" anyOf={["create"]}><CreateHomeWorkPage /></RequirePermission>} />
                <Route path="homework/edit" element={<RequirePermission mainMenu="communication" subMenu="homework" anyOf={["edit"]}><EditHomeWorkPage /></RequirePermission>} />

                <Route path="examtimetables/create" element={<RequirePermission mainMenu="communication" subMenu="examtimetable" anyOf={["create"]}><CreateExamTimeTablesPage /></RequirePermission>} />
                <Route path="examtimetables/edit" element={<RequirePermission mainMenu="communication" subMenu="examtimetable" anyOf={["edit"]}><EditExamTimeTablesPage /></RequirePermission>} />

                <Route path="studymaterials/main" element={<RequirePermission mainMenu="communication" subMenu="studymaterial" anyOf={["view"]}><MainStudyMaterialsPage /></RequirePermission>} />
                <Route path="studymaterials/folder" element={<RequirePermission mainMenu="communication" subMenu="studymaterial" anyOf={["view"]}><FolderStudyMaterialsPage /></RequirePermission>} />
                <Route path="studymaterials/create" element={<RequirePermission mainMenu="communication" subMenu="studymaterial" anyOf={["create"]}><CreateStudyMaterialsPage /></RequirePermission>} />
                <Route path="studymaterials/edit" element={<RequirePermission mainMenu="communication" subMenu="studymaterial" anyOf={["edit"]}><EditStudyMaterialsPage /></RequirePermission>} />

                <Route path="marks/addmarks" element={<RequirePermission mainMenu="communication" subMenu="marks" anyOf={["create", "edit"]}><AddMarksPage /></RequirePermission>} />
                <Route path="marks/view" element={<RequirePermission mainMenu="communication" subMenu="marks" anyOf={["view"]}><ViewMarksPage /></RequirePermission>} />

                <Route path="feedback/create" element={<RequirePermission mainMenu="communication" subMenu="feedback" anyOf={["create"]}><CreateFeedBackPage /></RequirePermission>} />
                <Route path="feedback/responses" element={<RequirePermission mainMenu="communication" subMenu="feedback" anyOf={["view"]}><ResponsesFeedBackPage /></RequirePermission>} />
                <Route path="feedback/questions" element={<RequirePermission mainMenu="communication" subMenu="feedback" anyOf={["view"]}><QuestionsFeedBackPage /></RequirePermission>} />

                <Route path="attendance/addattendance" element={<RequirePermission mainMenu="communication" subMenu="attendance" anyOf={["view"]}><AddAttendancePage /></RequirePermission>} />
                <Route path="attendance/irregular" element={<RequirePermission mainMenu="communication" subMenu="attendance" anyOf={["view"]}><IrregularAttendeesPage /></RequirePermission>} />
                <Route path="attendance/export" element={<RequirePermission mainMenu="communication" subMenu="attendance" anyOf={["view"]}><ExportAttendancePage /></RequirePermission>} />

                {/* --------------------------------------------------------------------------------------------------- */}

                {/* Fee & Finance */}
                <Route path="fee" element={<FeeFinancePage />} />

                {/* The "Manage / Create Concession" button on FeeFinancePage is
                    commented out, so nothing reaches these. Concession Log is the
                    live screen. */}
                {/* <Route path="fee/concession" element={<ConcessionPage />} /> */}
                {/* <Route path="fee/concession/create" element={<CreateConcessionPage />} /> */}

                <Route path="fee/school" element={<RequirePermission mainMenu="feeandfinance" subMenu="createfeesstructure" anyOf={["create", "edit"]}><SchoolFeeStructure /></RequirePermission>} />
                <Route path="fee/transport" element={<RequirePermission mainMenu="feeandfinance" subMenu="createfeesstructure" anyOf={["create", "edit"]}><TransportFeeStructure /></RequirePermission>} />
                <Route path="fee/transport/created-fees" element={<RequirePermission mainMenu="feeandfinance" subMenu="createfeesstructure" anyOf={["view", "create", "edit"]}><CreatedTransportFees /></RequirePermission>} />
                <Route path="fee/extra-curricular" element={<RequirePermission mainMenu="feeandfinance" subMenu="createfeesstructure" anyOf={["create", "edit"]}><ExtraCurricularFeeStructure /></RequirePermission>} />
                <Route path="fee/extra-curricular/created-fees" element={<RequirePermission mainMenu="feeandfinance" subMenu="createfeesstructure" anyOf={["view", "create", "edit"]}><CreatedEcaFees /></RequirePermission>} />
                <Route path="fee/extra" element={<RequirePermission mainMenu="feeandfinance" subMenu="createfeesstructure" anyOf={["create", "edit"]}><ExtraFeeStructure /></RequirePermission>} />
                <Route path="fee/extra/created-fees" element={<RequirePermission mainMenu="feeandfinance" subMenu="createfeesstructure" anyOf={["view", "create", "edit"]}><CreatedExtraFees /></RequirePermission>} />

                <Route path="fee/pay-fees" element={<RequirePermission mainMenu="feeandfinance" subMenu="billingscreen" anyOf={["allowbilling"]}><PayStudentFeePage /></RequirePermission>} />
                <Route path="fee/billing" element={<RequirePermission mainMenu="feeandfinance" subMenu="billingscreen" anyOf={["allowbilling"]}><BillingScreen /></RequirePermission>} />
                <Route path="fee/transaction-history" element={<RequirePermission mainMenu="feeandfinance" subMenu="billingscreen" anyOf={["allowbilling"]}><TransactionHistory /></RequirePermission>} />
                <Route path="fee/dashboard" element={<RequirePermission mainMenu="feeandfinance" subMenu="financedashboard" anyOf={["view"]}><FinanceDashboard /></RequirePermission>} />
                <Route path="fee/special" element={<RequirePermission mainMenu="feeandfinance" subMenu="billingscreen" anyOf={["allowconcession"]}><SpecialConcession /></RequirePermission>} />

                {/* fee/report is an empty placeholder - no content, no API calls, and
                    nothing links to it. The working report is the dashboard's Fee
                    Report tab, gated on financedashboard.allowreporttab. */}
                {/* <Route path="fee/report" element={<FeesReportPage />} /> */}
                <Route path="fee/expense" element={<RequirePermission mainMenu="feeandfinance" subMenu="expense" anyOf={["viewdashboard", "viewhistory", "allowaddbudget", "allowaddexpense"]}><ExpensePage /></RequirePermission>} />
                <Route path="fee/concession-log" element={<RequirePermission mainMenu="feeandfinance" subMenu="concessionlog" anyOf={["view"]}><ConcessionLog /></RequirePermission>} />
                <Route path="fee/teams" element={<FinanceTeamsPage />} />

                {/* Landing page for the two student-mapping screens. It has no
                    RequirePermission of its own - it lists whichever of the two the
                    role can reach, and each of those routes still guards itself. */}
                <Route path="fee/student-mapping" element={<FeeStudentMappingPage />} />
                <Route path="fee/eca-manage" element={<RequirePermission mainMenu="feeandfinance" subMenu="ecamanagement" anyOf={["allowmapstudent", "editstudent"]}><ExtraCurricularManage /></RequirePermission>} />
                <Route path="fee/additional-manage" element={<RequirePermission mainMenu="feeandfinance" subMenu="additionalfeemanagement" anyOf={["allowmapstudent", "editstudent"]}><AdditionalFeeManage /></RequirePermission>} />
                <Route path="fee/eca/eca-students" element={<RequirePermission mainMenu="feeandfinance" subMenu="ecamanagement" anyOf={["allowmapstudent", "editstudent"]}><EcaStudents /></RequirePermission>} />
                <Route path="fee/eca/removed-students" element={<RequirePermission mainMenu="feeandfinance" subMenu="ecamanagement" anyOf={["allowmapstudent", "editstudent"]}><TransferredStudents /></RequirePermission>} />


                {/* --------------------------------------------------------------------------------------------------- */}

                {/*Leave & payroll - Single Page with Tabs*/}
                <Route path="Leave" element={<LeaveAttendanceMainPage />} />
                <Route path="Leave/leave-attendance" element={<LeaveAttendancePage />} />
                <Route path="Leave/leave-attendance/biometric-mapping" element={<BiometricStaffMappingPage />} />
                <Route path="Leave/payroll" element={<PayrollOverview />} />
                <Route path="Leave/payroll/payroll-form" element={<AddEditPayroll />} />
                <Route path="Leave/payroll/salary-structures" element={<SalaryStructures />} />
                <Route path="Leave/payroll/compliance" element={<ComplianceSettings />} />
                <Route path="Leave/payroll/approve-payroll" element={<ApprovePayroll />} />
                <Route path="Leave/payroll/bank-reports" element={<BankReports />} />
                <Route path="Leave/payroll/salary-register" element={<SalaryRegister />} />
                <Route path="Leave/payroll/salary-credit" element={<MarkSalaryCreditedPage />} />
                <Route path="Leave/payroll/leave-policy" element={<LeavePolicy />} />
                <Route path="Leave/payroll/leave-policy/leave-master" element={<LeaveMasterScreen />} />

                {/* --------------------------------------------------------------------------------------------------- */}

                {/* Transport */}
                {/* duplicate of the transport route declared earlier - only the
                    first ever matches, so this one is dead. */}
                {/* <Route path="transport" element={<RequirePermission mainMenu="transport"><TransportPage /></RequirePermission>} /> */}

                {/* --------------------------------------------------------------------------------------------------- */}

                {/* Inventory */}
                <Route path="inventory" element={<InventoryPage />} />

                {/* --------------------------------------------------------------------------------------------------- */}

                {/* Assets */}
                <Route path="asset" element={<AssetsPage />} />

                <Route path="transport/details" element={<RequirePermission mainMenu="transport" subMenu="vehicledetails" anyOf={["view", "create", "edit", "delete"]}><VehicleDetailsPage /></RequirePermission>} />
                <Route path="transport/details/add" element={<RequirePermission mainMenu="transport" subMenu="vehicledetails" anyOf={["create"]}><VehicleManagementPage /></RequirePermission>} />
                <Route path="transport/details/edit" element={<RequirePermission mainMenu="transport" subMenu="vehicledetails" anyOf={["edit"]}><EditVehicleDetails /></RequirePermission>} />
                <Route path="transport/details/view" element={<RequirePermission mainMenu="transport" subMenu="vehicledetails" anyOf={["view", "edit", "delete"]}><ViewVehicleDetails /></RequirePermission>} />
                <Route path="transport/route" element={<RequirePermission mainMenu="transport" subMenu="routemanagement" anyOf={["view", "create", "edit", "delete"]}><RouteManagement /></RequirePermission>} />
                <Route path="transport/student-map" element={<RequirePermission mainMenu="transport" subMenu="studentmapping" anyOf={["allowstudentmapping", "allowediting"]}><StudentMapping /></RequirePermission>} />
                {/* <Route path="asset/transport/safety-compliance" element={<VehicleSafetyCompliancePage />} /> */}



                {/* --------------------------------------------------------------------------------------------------- */}

                {/* My Projects */}
                <Route path="myprojects" element={<MyProjectPage />} />

                <Route path="schedule" element={<SchedulePage />} />
                <Route path="status" element={<ApprovalStatusPage />} />
                {/* Draft is off - Save as Draft is commented out of every create
                    screen, so these lists can only ever be empty. */}
                {/* <Route path="draft" element={<DraftPage />} /> */}

                {/* Approval Status  */}
                <Route path="status/news" element={<ApprovalStatusNewsPage />} />
                <Route path="status/messages" element={<ApprovalStatusMessagesPage />} />
                <Route path="status/circulars" element={<ApprovalStatusCircularsPage />} />
                <Route path="status/homework" element={<ApprovalStatusHomeworkPage />} />

                <Route path="status/school" element={<SchoolFeeApprovalStatus />} />
                <Route path="status/transport" element={<TransportFeeApprovalStatus />} />
                <Route path="status/extracurricular" element={<ExtraCurricularFeeApprovalStatus />} />
                <Route path="status/additional" element={<AdditionalFeeApprovalStatus />} />

                {/* Draft  */}
                {/* <Route path="draft/news" element={<NewsDraftPage />} /> */}
                {/* <Route path="draft/news/edit" element={<NewsDraftEditPage />} /> */}

                {/* <Route path="draft/messages" element={<MessagesDraftPage />} /> */}
                {/* <Route path="draft/messages/edit" element={<MessagesDraftEditPage />} /> */}

                {/* <Route path="draft/circulars" element={<CircularsDraftPage />} /> */}
                {/* <Route path="draft/circulars/edit" element={<CircularsDraftEditPage />} /> */}

                {/* <Route path="draft/consentforms" element={<ConsentFormDraftPage />} /> */}
                {/* <Route path="draft/consentforms/edit" element={<ConsentFormDraftEditPage />} /> */}

                {/* <Route path="draft/feedback" element={<FeedBackDraftPage />} /> */}
                {/* <Route path="draft/feedback/edit" element={<FeedBackDraftEditPage />} /> */}

                {/* --------------------------------------------------------------------------------------------------- */}

                {/* Approvals */}
                <Route path="approvals" element={<ApprovalPage />} />

                {/* Communication Approval Pages  */}
                <Route path="approvals/news" element={<NewsApprovalPage />} />
                <Route path="approvals/messages" element={<MessagesApprovalPage />} />
                <Route path="approvals/circulars" element={<CircularsApprovalPage />} />
                <Route path="approvals/homework" element={<HomeworkApprovalPage />} />
                
                <Route path="approvals/student-leave" element={<RequirePermission mainMenu="approvals"><StudentLeaveApprovalPage /></RequirePermission>} />
                <Route path="approvals/on-leave" element={<OnLeaveStudentsPage />} />

                <Route path="approvals/news/edit" element={<NewsApprovalEditPage />} />
                <Route path="approvals/messages/edit" element={<MessagesApprovalEditPage />} />
                <Route path="approvals/circulars/edit" element={<CircularsApprovalEditPage />} />

                {/* Fee Approval Pages  */}
                <Route path="approvals/school" element={<SchoolFeeApprovalPage />} />
                <Route path="approvals/transport" element={<TransportFeeApprovalPage />} />
                <Route path="approvals/eca" element={<EcaFeeApprovalPage />} />
                <Route path="approvals/additional" element={<AdditionalFeeApprovalPage />} />
                <Route path="approvals/payments" element={<PaymentApprovalsPage />} />

                {/* --------------------------------------------------------------------------------------------------- */}

                {/* Access Control */}
                <Route path="access" element={<RequirePermission mainMenu="accesscontrol"><AccessControlPage /></RequirePermission>} />
                <Route path="access/roles-permissions" element={<RequireSuperAdmin><RolesPermissionsPage /></RequireSuperAdmin>} />
                <Route path="access/feature-permissions" element={<FeaturePermissionsPage />} />
                <Route path="access/config/profile" element={<ProfileConfigPage />} />
                <Route path="access/config/communication" element={<CommunicationConfigPage />} />
                <Route path="access/config/finance" element={<FinanceConfigPage />} />
                <Route path="access/config/leave" element={<LeaveConfigPage />} />
                <Route path="access/config/transport" element={<TransportConfigPage />} />
                <Route path="access/config/inventory" element={<InventoryConfigPage />} />
                <Route path="access/config/purchase" element={<PurchaseConfigPage />} />
                <Route path="access/config/approvals" element={<ApprovalsConfigPage />} />
                <Route path="access/config/access" element={<AccessConfigPage />} />
                <Route path="access/config/myprojects" element={<MyProjectsConfigPage />} />

                <Route path="access/users" element={<RequirePermission mainMenu="accesscontrol" subMenu="users" anyOf={["allowuseractivity", "allowpasswordmanagementstudent", "allowpasswordmanagementstaff"]}><UsersPage /></RequirePermission>} />
                <Route path="access/useractivity" element={<RequirePermission mainMenu="accesscontrol" subMenu="users" anyOf={["allowuseractivity"]}><UserActivityPage /></RequirePermission>} />
                <Route path="access/password" element={<RequirePermission mainMenu="accesscontrol" subMenu="users" anyOf={["allowpasswordmanagementstudent", "allowpasswordmanagementstaff"]}><PasswordManagementPage /></RequirePermission>} />

                <Route path="access/student-promotion" element={<RequirePermission mainMenu="accesscontrol" subMenu="studentpromotion" anyOf={["allowstudentpromotion", "alloweditpromotedstudents"]}><StudentPromotionPage /></RequirePermission>} />
                <Route path="access/issue-tc" element={<RequirePermission mainMenu="accesscontrol" subMenu="issuetc" anyOf={["allowissuetc", "allowdiscontinue"]}><IssueTcPage /></RequirePermission>} />

                <Route path="access/academics" element={<RequirePermission mainMenu="accesscontrol" subMenu="academics" anyOf={["allowacademicyear", "allowclasssectionmanagement", "allowexammanagement", "allowsubjectmanagement"]}><AcademicsPage /></RequirePermission>} />
                <Route path="access/academics/academic-year" element={<RequirePermission mainMenu="accesscontrol" subMenu="academics" anyOf={["allowacademicyear"]}><AcademicYearSetupPage /></RequirePermission>} />
                <Route path="access/class-section" element={<RequirePermission mainMenu="accesscontrol" subMenu="academics" anyOf={["allowclasssectionmanagement"]}><ClassSectionManagementPage /></RequirePermission>} />
                <Route path="access/exam" element={<RequirePermission mainMenu="accesscontrol" subMenu="academics" anyOf={["allowexammanagement"]}><ExamManagementPage /></RequirePermission>} />
                <Route path="access/subject" element={<RequirePermission mainMenu="accesscontrol" subMenu="academics" anyOf={["allowsubjectmanagement"]}><SubjectMangementPage /></RequirePermission>} />
                <Route path="access/subject/create" element={<RequirePermission mainMenu="accesscontrol" subMenu="academics" anyOf={["allowsubjectmanagement"]}><SubjectCreatePage /></RequirePermission>} />

                {/* --------------------------------------------------------------------------------------------------- */}
                {/* Assessment */}
                <Route path="assessment/online-quiz" element={<OnlineQuizDashboard />} />
                <Route path="assessment/online-quiz/create" element={<CreateOnlineQuizPage />} />
                <Route path="assessment/online-quiz/analysis" element={<QuizAnalysisPage />} />
                <Route path="assessment/online-quiz/all" element={<AllQuizzesPage />} />
                <Route path="assessment/online-quiz/approvals" element={<QuizApprovalPage />} />

                {/* Question Paper Generator */}
                <Route path="dashboard/question" element={<QuestionPaperGeneratorPage />} />

                {/* View Profile */}
                <Route path="view-profile" element={<ViewProfilePage />} />
            </Route>
        </Routes>
        </>
    );
}