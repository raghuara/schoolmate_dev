// UAT Link
const baseApiurl = `https://schoolcommunicationwebapimsmsuat-dredbbfmhzergfhw.canadacentral-01.azurewebsites.net/api/`;






//----------------------------------- Chat Hub ----------------------------------
//----------------------------------- xxxxxxxx ----------------------------------

const chatHubBaseUrl = `https://schoolcommunicationwebapimsmsuat-dredbbfmhzergfhw.canadacentral-01.azurewebsites.net`;

const chathub = `${chatHubBaseUrl}/chathub`;

const creategroup = `${chatHubBaseUrl}/api/chat/creategroup`;
const fetchgroups = `${chatHubBaseUrl}/api/chat/fetchgroups`;
const fetchmedia = `${chatHubBaseUrl}/api/chat/fetchmedia`;
const fetchgroupinfo = `${chatHubBaseUrl}/api/chat/fetchgroupinfo`;
const sendmessage = `${chatHubBaseUrl}/api/chat/sendmessage`;
const fetchmessages = `${chatHubBaseUrl}/api/chat/fetchmessages`;
const searchusers = `${chatHubBaseUrl}/api/chat/searchusers`;
const getchatusers = `${chatHubBaseUrl}/api/chat/getchatusers`;
const updatememberrole = `${chatHubBaseUrl}/api/chat/updatememberrole`;
const leavegroup = `${chatHubBaseUrl}/api/chat/leavegroup`;
const deletegroup = `${chatHubBaseUrl}/api/chat/deletegroup`;
const clearchat = `${chatHubBaseUrl}/api/chat/clearchat`;
const editmessage = `${chatHubBaseUrl}/api/chat/editmessage`;
const markread = `${chatHubBaseUrl}/api/chat/markread`;
const pinmessage = `${chatHubBaseUrl}/api/chat/pinmessage`;
const deletemessage = `${chatHubBaseUrl}/api/chat/deletemessage`;
const updategroup = `${chatHubBaseUrl}/api/chat/updategroup`;
const updategroupmembers = `${chatHubBaseUrl}/api/chat/updategroupmembers`;
const mutegroup = `${chatHubBaseUrl}/api/chat/mutegroup`;
const uploadfile = `${chatHubBaseUrl}/api/uploadfile`;
const reactmessage = `${chatHubBaseUrl}/api/chat/reactmessage`;
const messagereadinfo = `${chatHubBaseUrl}/api/chat/messagereadinfo`;
const searchmessages = `${chatHubBaseUrl}/api/chat/searchmessages`;

//-----------------------------------xxxxxxxx----------------------------------




const Login = `${baseApiurl}Login`;

const getSchoolConfig = `${baseApiurl}schoolconfig/getSchoolConfig`;

// Common Apis 
const sectionsDropdown = `${baseApiurl}attendance/sectionsDropdown`;
const GettingGradesData = `${baseApiurl}GradeValueFetch/GettingGrades`;
const GettingGrades02 = `${baseApiurl}GradeValueFetch/GettingGrades02`;
const VersionFetch = `${baseApiurl}version/fetch`;
const VersionUpdate = `${baseApiurl}version/update`;
const updateLoginPassword = `${baseApiurl}Login/updateLoginPassword`;

// Dashboard 
const Dashboard = `${baseApiurl}Dashboard/`;
const GettingGrades = `${Dashboard}GettingGrades`;
const DashboardUsers = `${Dashboard}DashboardUsers`;
const DashboardManagement = `${Dashboard}DashboardManagement`;
const DashboardNews = `${Dashboard}DashboardNews&Circular`;
const DashboardBirthday = `${Dashboard}DashboardBirthday`;
const BirthdayInstagramPost = `${baseApiurl}instagram/birthday`;
const DashboardStudentsAttendance = `${Dashboard}DashboardStudentsAttendance`;
const DashboardTeachersAttendance = `${Dashboard}DashboardTeachersAttendance`;
const postDashboardSliders = `${baseApiurl}dashboardSliders/postDashboardSliders`;
const getDashboardSliders = `${baseApiurl}dashboardSliders/getDashboardSliders`;
const deleteDashboardSlider = `${baseApiurl}dashboardSliders/deleteDashboardSlider`;
const UsersPassword = `${baseApiurl}Dashboard/UsersPassword`;
const updateUserPassword = `${baseApiurl}Dashboard/UpdateUserPassword`;
const DashboardBirthdayUpdated = `${baseApiurl}Dashboard/DashboardBirthdayUpdated`;

const PostTeachersManualAttendance = `${baseApiurl}teachersattendance/PostTeachersManualAttendance`;
const GetTeachersAttendanceAudit = `${baseApiurl}teachersattendance/GetTeachersAttendanceAudit`;
const GetTeachersAttendance = `${baseApiurl}teachersattendance/GetTeachersAttendance`;


// Communication 
const fetchDashboard = `${baseApiurl}communicationActivityDashboard/fetchDashboard`;
const viewTracking = `${baseApiurl}communicationActivityDashboard/viewTracking`;
const viewTrackingStatus = `${baseApiurl}communicationActivityDashboard/viewTrackingStatus`;





// Contact Details
const getContactDetails = `${baseApiurl}communicationActivityDashboard/getContactDetails`;
const postContactDetails = `${baseApiurl}communicationActivityDashboard/postContactDetails`;
const updateContactDetailsById = `${baseApiurl}communicationActivityDashboard/updateContactDetailsById`;
const deleteContactDetailsById = `${baseApiurl}communicationActivityDashboard/deleteContactDetailsById`;

// News
const News = `${baseApiurl}news/`;
const postNews = `${News}postNews`;
const ApprovalStatusNewsFetch = `${News}ApprovalStatusNewsFetch`;
const NewsFetch = `${News}NewsFetch`;
const NewsFetchDraft = `${News}NewsFetchDraft`;
const DeleteNewsApi = `${baseApiurl}changeNews/DeleteNews`;
const FindNews = `${baseApiurl}changeNews/FindNews`;
const updateNews = `${baseApiurl}changeNews/updateNews`;
const DeleteAllDraft = `${baseApiurl}changeNews/DeleteAllDraft`;
const updateNewsApprovalAction = `${baseApiurl}changeNews/updateNewsApprovalAction`;
const BulkDeleteNews = `${baseApiurl}changeNews/BulkDeleteNews`;

// Messages 
const Message = `${baseApiurl}Message/`;
const postMessage = `${Message}postMessage`;
const MessageFetch = `${Message}MessageFetch`;
const ApprovalStatusMessageFetch = `${Message}ApprovalStatusMessageFetch`;
const MessageFetchDraft = `${baseApiurl}message/MessageFetchDraft`;
const DeleteMessage = `${baseApiurl}changeMessage/DeleteMessage`;
const FindMessage = `${baseApiurl}changeMessage/FindMessage`;
const updateMessage = `${baseApiurl}changeMessage/updateMessage`;
const updateMessageApprovalAction = `${baseApiurl}changeMessage/updateMessageApprovalAction`;
const BulkDeleteMessage = `${baseApiurl}changeMessage/BulkDeleteMessage`;

// Circulars 
const circular = `${baseApiurl}circular/`;
const CircularFetch = `${circular}CircularFetch`;
const postCircular = `${circular}postCircular`;
const ApprovalStatusCircularFetch = `${circular}ApprovalStatusCircularFetch`;
const CircularFetchDraft = `${circular}CircularFetchDraft`;
const DeleteCircular = `${baseApiurl}changeCircular/DeleteCircular`;
const FindCircular = `${baseApiurl}changeCircular/FindCircular`;
const updateCircular = `${baseApiurl}changeCircular/updateCircular`;
const updateCircularApprovalAction = `${baseApiurl}changeCircular/updateCircularApprovalAction`;
const BulkDeleteCircular = `${baseApiurl}changeCircular/BulkDeleteCircular`;

// Consent Forms
const ConsentForm = `${baseApiurl}ConsentForm/`;
const postConsentForm = `${ConsentForm}postConsentForm`;
const ConsentFetchFetch = `${baseApiurl}/Consent/ConsentFetchFetch`;
const ConsentFetchFetchDradt = `${baseApiurl}/Consent/ConsentFetchFetchDradt`;
const DeleteConsentForm = `${baseApiurl}/Consent/DeleteConsentForm`;
const ConsentFormFetchAll = `${baseApiurl}/ConsentAll/ConsentFormFetchAll`;
const updateConsentForm = `${baseApiurl}/ConsentForm/updateConsentForm`;
const GetConsentFormById = `${baseApiurl}/feedBack/GetConsentFormById`;

// Time Tables
const timeTable = `${baseApiurl}timeTable/`;
const TimeTableFetch = `${timeTable}TimeTableFetch`;
const postTimeTable = `${timeTable}postTimeTable`;
const DeleteTimeTable = `${baseApiurl}changeTimetable/DeleteTimeTable`;
const FindTimeTable = `${baseApiurl}changeTimetable/FindTimeTable`;
const updateTimeTable = `${baseApiurl}changeTimetable/updateTimeTable`;
const fetchTeachersTimeTable = `${baseApiurl}teachersTimeTable/fetchTeachersTimeTable`;
const postTeachersTimeTable = `${baseApiurl}teachersTimeTable/postTeachersTimeTable`;
const updateTeachersTimeTable = `${baseApiurl}teachersTimeTable/updateTeachersTimeTable`;
const deleteTeachersTimeTable = `${baseApiurl}teachersTimeTable/deleteTeachersTimeTable`;

// Homework 
const homeWork = `${baseApiurl}homeWork/`;
const postHomeWork = `${homeWork}postHomeWork`;
const HomeWorkFetch = `${homeWork}HomeWorkFetch`;
const HomeWorkFetch01 = `${homeWork}HomeWorkFetch01`;
const FindHomeWork = `${baseApiurl}changeHomeWork/FindHomeWork`;
const DeleteHomeWork = `${baseApiurl}changeHomeWork/DeleteHomeWork`;
const updateHomeWork = `${baseApiurl}changeHomeWork/updateHomeWork`;
const ApprovalStatusHomeWorkFetch = `${homeWork}ApprovalStatusHomeWorkFetch`;
const updateHomeWorkApprovalAction = `${homeWork}updateHomeWorkApprovalAction`;
const fetchHomeworkStatus = `${baseApiurl}changeHomeWork/fetchHomeworkStatus`;
const postHomeworkStatus = `${baseApiurl}changeHomeWork/postHomeworkStatus`;
const updateHomeworkStatus = `${baseApiurl}changeHomeWork/updateHomeworkStatus`;
const homeworkStatusReport = `${baseApiurl}changeHomeWork/homeworkStatusReport`;

// Exam Time Tables 
const examtimetable = `${baseApiurl}examtimetable/`;
const postexamtimetable = `${examtimetable}postexamtimetable`;
const ExamTimeTableFetch = `${baseApiurl}ExamtimeTable/ExamTimeTableFetch`;
const FindExamTimeTable = `${baseApiurl}changeExamTimetable/FindExamTimeTable`;
const DeleteExamTimeTable = `${baseApiurl}changeExamTimetable/DeleteExamTimeTable`;
const updateExamTimeTable = `${baseApiurl}changeExamTimetable/updateExamTimeTable`;

// Study Materials
const studyMaterial = `${baseApiurl}studyMaterial/`;
const studyMaterialFolder = `${baseApiurl}studyMaterialFolder/`;
const getStudyMaterialFoldersByGrade = `${studyMaterialFolder}getStudyMaterialFoldersByGrade`;
const getStudyMaterialFolderById = `${studyMaterialFolder}getStudyMaterialFolderById`;
const deleteStudyMaterialFolder = `${studyMaterialFolder}deleteStudyMaterialFolder`;
const updateStudyMaterialFolder = `${studyMaterialFolder}updateStudyMaterialFolder`;
const postStudyMaterialFolder = `${baseApiurl}studyMaterialFolder/postStudyMaterialFolder`;
const poststudyMaterial = `${studyMaterial}poststudyMaterial`;
const StudyMaterialFetch = `${studyMaterial}StudyMaterialFetch`;
const FindStudyMaterial = `${baseApiurl}changeStudyMaterial/FindStudyMaterial`;
const DeleteStudyMaterial = `${baseApiurl}changeStudyMaterial/DeleteStudyMaterial`;
const updateStudyMaterial = `${baseApiurl}changeStudyMaterial/updateStudyMaterial`;

// Marks 
const marksStudent = `${baseApiurl}marksStudent/`;
const postMarks = `${baseApiurl}postMarks`;
const MarksStudentsFetch = `${marksStudent}MarksStudentsFetch`;
const fetchAllMarksStudents = `${baseApiurl}fetchAllMarksStudents`;
const fetchAllMarksStudents02 = `${baseApiurl}fetchAllMarksStudents/fetchAllMarksStudents02?`;

// School Calendar
const schoolCalender = `${baseApiurl}schoolCalender/`;
const postSchoolCalender = `${schoolCalender}postSchoolCalender`;
const FindSchoolCalender = `${baseApiurl}changeSchoolCalender/FindSchoolCalender`;
const DeleteSchoolCalender = `${baseApiurl}changeSchoolCalender/DeleteSchoolCalender`;
const updateSchoolCalender = `${baseApiurl}changeSchoolCalender/updateSchoolCalender`;
const FetchAllSchoolCalenderEvents = `${baseApiurl}changeSchoolCalender/FetchAllSchoolCalenderEvents`;

// Event
const eventCalender = `${baseApiurl}eventCalender/`;
const postEventCalender = `${eventCalender}postEventCalender`;
const FindEventCalender = `${baseApiurl}changeEventCalender/FindEventCalender`;
const DeleteEventCalender = `${baseApiurl}changeEventCalender/DeleteEventCalender`;
const updateEventCalender = `${baseApiurl}changeEventCalender/updateEventCalender`;
const FetchAllCalenderEvent = `${baseApiurl}changeEventCalender/FetchAllSchoolCalenderEvents`;

// Feedback
const feedBack = `${baseApiurl}feedBack/`;
const FeedBackFetchFetchDraft = `${feedBack}FeedBackFetchFetchDraft`;
const parentsFeedBackFetchAll = `${baseApiurl}parentsFeedBack/parentsFeedBackFetchAll`;
const updateFeedBack = `${baseApiurl}FeedBack/updateFeedBack`;
const GetFeedBackDetailByID = `${baseApiurl}feedBack/GetFeedBackDetailByID`;
const parentsFeedbackAdminUpdate = `${baseApiurl}parentsFeedBack/parentsFeedbackAdminUpdate`;
const findingGradeWithSubject = `${baseApiurl}GradeValueFetch/findingGradeWithSubject`;
const postNewFeedback = `${baseApiurl}newFeedBackAll/postNewFeedback`;
const deleteNewFeedbackByTitleId = `${baseApiurl}newFeedBackAll/deleteNewFeedbackByTitleId`;
const updateNewFeedbackQuestions = `${baseApiurl}newFeedBackAll/updateNewFeedbackQuestions`;
const fetchNewFeedbackAdminResponses = `${baseApiurl}newFeedBackAll/fetchNewFeedbackAdminResponses`;


// Attendance 
const Attendance = `${baseApiurl}attendance/`;
const barchart = `${Attendance}barchart`;
const piechart = `${Attendance}piechart`;
const attendanceSpecific = `${Attendance}attendanceSpecific`;
const attendanceTable = `${Attendance}attendanceTable`;
const irregularAttendees = `${Attendance}irregularAttendees`;
const fetchAttendance = `${Attendance}fetchAttendance`;
const postAttendance = `${Attendance}postAttendance`;
const updateAttendance = `${Attendance}updateAttendance`;
const postAttendanceMessage = `${Attendance}postAttendanceMessage`;
const attendanceReport = `${Attendance}attendanceReport`;
const postDairyStatus = `${baseApiurl}changeHomeWork/postDairyStatus`;
const postDresscodeStatus = `${baseApiurl}changeHomeWork/postDresscodeStatus`;
const fetchDairyStatus = `${baseApiurl}changeHomeWork/fetchDairyStatus`;
const fetchDressCodeStatus = `${baseApiurl}changeHomeWork/fetchDressCodeStatus`;
const updateDairyStatus = `${baseApiurl}changeHomeWork/updateDairyStatus`;
const updateDressCodeStatus = `${baseApiurl}changeHomeWork/updateDressCodeStatus`;
const dairyStatusReport = `${baseApiurl}changeHomeWork/dairyStatusReport`;
const dresscodeStatusReport = `${baseApiurl}changeHomeWork/dresscodeStatusReport`;

// Notification 
const notification = `${baseApiurl}notification/`;
const postNotification = `${notification}postNotification`;

// Profile Management
// Student Infomation
const studentManagement = `${baseApiurl}studentManagement/`;
const postStudentAcademicInformation = `${studentManagement}postStudentAcademicInformation`;
const updateStudentAcademicInformation = `${studentManagement}updateStudentAcademicInformation`;
const postStudentInformation = `${studentManagement}postStudentInformation`;
const updateStudentInformation = `${studentManagement}updateStudentInformation`;
const postStudentFamilyInformation = `${studentManagement}postStudentFamilyInformation`;
const updateStudentFamilyInformation = `${studentManagement}updateStudentFamilyInformation`;
const postStudentGuardianInformation = `${studentManagement}postStudentGuardianInformation`;
const updateStudentGuardianInformation = `${studentManagement}updateStudentGuardianInformation`;
const postStudentSiblingInformation = `${studentManagement}postStudentSiblingInformation`;
const updateStudentSibilingInformation = `${studentManagement}updateStudentSibilingInformation`;
const postStudentDocumentInformation = `${studentManagement}postStudentDocumentInformation`;
const updateStudentDocumentInformation = `${studentManagement}updateStudentDocumentInformation`;
const postStudentgeneralhealthInformation = `${studentManagement}postStudentgeneralhealthInformation`;
const updateStudentgeneralhealthInformation = `${studentManagement}updateStudentgeneralhealthInformation`;
const FindStudentManagementDetails = `${studentManagement}FindStudentManagementDetails`;
const GetStudentsInformation = `${studentManagement}GetStudentsInformation`;
const postSiblingMapping = `${baseApiurl}GradeValueFetch/postSiblingMapping`;
const PostPromoteStudents = `${baseApiurl}studentPromotion/PostPromoteStudents`;
const FetchPromotableStudents = `${baseApiurl}studentPromotion/FetchPromotableStudents`;
const FetchPromotedStudents = `${baseApiurl}studentPromotion/FetchPromotedStudents`;
const UpdatePromotedStudents = `${baseApiurl}studentPromotion/UpdatePromotedStudents`;
const IssueStudentTC = `${baseApiurl}studentPromotion/IssueStudentTC`;
const DiscontinueStudent = `${baseApiurl}studentPromotion/DiscontinueStudent`;

const GetOverallLeaveDetails = `${baseApiurl}studentLeave/GetOverallLeaveDetails`;
const StudentsOnLeaveToday = `${baseApiurl}studentLeave/StudentsOnLeaveToday`;
const LeaveApproval = `${baseApiurl}studentLeave/LeaveApproval`;

// Staff Information
const staffManagement = `${baseApiurl}staffManagement/`;
const GetStaffInformation = `${staffManagement}GetStaffInformation`;
const postStaffInformation = `${staffManagement}postStaffInformation`;
const updateStaffInformation = `${staffManagement}updateStaffInformation`;
const postStaffStudentInformation = `${staffManagement}postStaffStudentInformation`;
const updateStaffStudentInformation = `${staffManagement}updateStaffStudentInformation`;
const FindStaffManagementDetails = `${staffManagement}FindStaffManagementDetails`;

//Fee & Finance
const schoolFee = `${baseApiurl}schoolFee/`;
const getFees = `${schoolFee}getFees`;
const getBillingUser = `${baseApiurl}schoolFeesBilling/getBillingUser`;

const ecaFee = `${baseApiurl}ecaFee`;
const ecaFeeFetch = `${baseApiurl}ecaFeeFetch`;
const ecaFeeFetchID = `${baseApiurl}ecaFeeFetchID`;
const ecaActivityFetch = `${schoolFee}ecaActivityFetch`;
const ecaFeeStudentAdd = `${baseApiurl}ecaFeeStudentAdd`;
const ecaFeeStudentFetch = `${baseApiurl}ecaFeeStudentFetch`;
const ECAupdateSchoolFee = `${baseApiurl}ecaFee/ECAupdateSchoolFee`;
const approvalStatusCheckEca = `${baseApiurl}ecaFee/approvalStatusCheckEca`;
const deleteEcaFeesStructure = `${baseApiurl}ecaFee/deleteEcaFeesStructure`;
const updateEcaFeesApprovalAction = `${baseApiurl}ecaFee/updateEcaFeesApprovalAction`;
const updateSchoolFee = `${schoolFee}updateSchoolFee`;
const deleteSchoolFeesStructure = `${schoolFee}deleteSchoolFeesStructure`;
const getEligibleEcaStudents = `${baseApiurl}getEligibleEcaStudents`;

const additionalFees = `${baseApiurl}additionalFees/`;
const postAdditionalFee = `${additionalFees}postAdditionalFee`;
const additionalFeeFetch = `${additionalFees}additionalFeeFetch`;
const additionalFeeFetchID = `${additionalFees}additionalFeeFetchID`;
const additionalFeeNameFetch = `${additionalFees}additionalFeeNameFetch`;
const additionalFeeStudentAdd = `${additionalFees}additionalFeeStudentAdd`;
const updateAdditionalFeesApprovalAction = `${additionalFees}updateAdditionalFeesApprovalAction`;
const additionalParentsFetch = `${additionalFees}additionalParentsFetch`;
const approvalStatusCheckAdditional = `${additionalFees}approvalStatusCheckAdditional`;
const updateAdditionalFee = `${additionalFees}updateAdditionalFee`;
const deleteAdditionalFeesStructure = `${additionalFees}deleteAdditionalFeesStructure`;
const getUsersByUserType = `${additionalFees}getUsersByUserType`;


const schoolFeesBilling = `${baseApiurl}schoolFeesBilling/`;
const findStudents = `${schoolFeesBilling}findStudents`;
const findStudentSchoolFeesBilling = `${schoolFeesBilling}findStudentSchoolFeesBilling`;
const postPaymentMethod = `${schoolFeesBilling}postPaymentMethod`;
const findStudentEcaFeesBilling = `${schoolFeesBilling}findStudentEcaFeesBilling`;
const schoolFeesRecordGet = `${schoolFeesBilling}schoolFeesRecordGet`;
const postEcaPaymentMethod = `${schoolFeesBilling}postEcaPaymentMethod`;
const ecaFeesRecordGet = `${schoolFeesBilling}ecaFeesRecordGet`;
const findStudentAdditionalFeesBilling = `${schoolFeesBilling}findStudentAdditionalFeesBilling`;
const postAdditionalPaymentMethod = `${schoolFeesBilling}postAdditionalPaymentMethod`;
const additionalFeesRecordGet = `${schoolFeesBilling}additionalFeesRecordGet`;
const findStudentTransportFeesBilling = `${schoolFeesBilling}findStudentTransportFeesBilling`;
const postTransportPaymentMethod = `${schoolFeesBilling}postTransportPaymentMethod`;
const transportFeesRecordGet = `${schoolFeesBilling}transportFeesRecordGet`;

const schoolFeesSplConcession = `${baseApiurl}schoolFeesSplConcession/`;
const postSchoolFeeConcession = `${schoolFeesSplConcession}postSchoolFeeConcession`;
const postEcaFeeConcession = `${schoolFeesSplConcession}postEcaFeeConcession`;
const postAdditionalFeeConcession = `${schoolFeesSplConcession}postAdditionalFeeConcession`;
const postTransportFeeConcession = `${schoolFeesSplConcession}postTransportFeeConcession`;


const approvalStatusCheck = `${schoolFee}approvalStatusCheck`;
const updateSchoolFeesApprovalAction = `${schoolFee}updateSchoolFeesApprovalAction`;
const getFeesById = `${schoolFee}getFeesById`;

const GetConcessionLog = `${baseApiurl}schoolFeesBilling/GetConcessionLog`;
const getUserConcessionDetails = `${baseApiurl}schoolFeesBilling/getUserConcessionDetails`;

const teamManagementGet = `${baseApiurl}teamManagementGet`;
const moveToAccounts = `${baseApiurl}moveToAccounts`;
const moveToBilling = `${baseApiurl}moveToBilling`;
const paymentApprovalsGet = `${baseApiurl}paymentApprovalsGet`;
const paymentApprovalUpdate = `${baseApiurl}paymentApprovalUpdate`;


// Finance Dashboard 
const finance = `${baseApiurl}finance/`;
const overView = `${finance}overView`;
const todaysCollection = `${finance}todaysCollection`;
const cashCollection = `${finance}cashCollection`;
const classWiseCollection = `${finance}classWiseCollection`;
const defaulters = `${finance}defaulters`;
const feeReport = `${finance}feeReport`;
const sendFeeReminder = `${baseApiurl}finance/sendFeeReminder/`;
const getLastFeeReminder = `${baseApiurl}finance/getLastFeeReminder/`;
const monthlyCollectionByCategory = `${baseApiurl}finance/monthlyCollectionByCategory/`;

// Expense 
const postFund = `${baseApiurl}postFund`;
const fundApprovalStatusCheck = `${baseApiurl}fundApprovalStatusCheck`;
const updateAddFundApprovalAction = `${baseApiurl}updateAddFundApprovalAction`;
const getAddedFund = `${baseApiurl}getAddedFund`;
const getAddedFundById = `${baseApiurl}getAddedFundById`;
const updateFundById = `${baseApiurl}updateFundById`;
const myExpenceRequests = `${baseApiurl}myExpenceRequests`;
const myFundRequests = `${baseApiurl}myFundRequests`;



const postExpence = `${baseApiurl}postExpence`;
const expenceApprovalStatusCheck = `${baseApiurl}expenceApprovalStatusCheck`;
const updateAddexpenceApprovalAction = `${baseApiurl}updateAddexpenceApprovalAction`;
const getAddedExpence = `${baseApiurl}getAddedExpence`;
const getAddedExpenceById = `${baseApiurl}getAddedExpenceById`;
const updateExpenceById = `${baseApiurl}updateExpenceById`;
const expenceDashboard = `${baseApiurl}expenceDashboard`;


// Leave & Attendance 

// Biomatric 
const biometrics = `${baseApiurl}biometrics/`;
const SyncStatus = `${biometrics}SyncStatus/`;
const TriggerManualSync = `${biometrics}TriggerManualSync/`;
const GetBiometricMappings = `${biometrics}GetBiometricMappings/`;
const PostBiometricMappings = `${biometrics}PostBiometricMappings/`;
const UpdateBiometricMappings = `${biometrics}UpdateBiometricMappings/`;
const GetBiometricAttendanceLogs = `${biometrics}GetBiometricAttendanceLogs/`;
const RebuildFromRecords = `${biometrics}RebuildFromRecords/`;
const SyncSummary = `${biometrics}SyncSummary/`;

const attendance = `${baseApiurl}attendance/`;
const postAttendanceTeachers = `${attendance}postAttendanceTeachers`;
const GetAttendanceTeacherBefore = `${baseApiurl}teachersattendance/GetAttendanceTeacherBefore`;
const updateTeachersAttendance = `${attendance}updateTeachersAttendance`;
const getAttendanceDashboard = `${attendance}getAttendanceDashboard`;
const getStaffAttendanceOverview = `${baseApiurl}teachersattendance/getStaffAttendanceOverview`;
const GetMyAttendanceStatus = `${baseApiurl}teachersattendance/GetMyAttendanceStatus`;
const reportsLeaveManagement = `${baseApiurl}reports/reportsLeaveManagement`;
const reportsLeaveManagementFullReport = `${baseApiurl}reports/reportsLeaveManagementFullReport`;


const leave = `${baseApiurl}leave/`;
const postLeaveRequest = `${leave}postLeaveRequest`;
const leaveApprovalStatusCheck = `${baseApiurl}leaveApprovalStatusCheck`;
const updateLeaveApprovalAction = `${baseApiurl}updateLeaveApprovalAction`;
const getLeaveDashboard = `${leave}getLeaveDashboard`;
const getLeaveApprovalDashboard = `${leave}getLeaveApprovalDashboard`;
const GetUserAttendanceLeaveSummary = `${leave}GetUserAttendanceLeaveSummary`;
const getLeaveConfig = `${leave}getLeaveConfig`;
const saveLeaveConfig = `${leave}saveLeaveConfig`;

const payRoll = `${baseApiurl}payRoll/`;
const postSalaryStructure = `${payRoll}postSalaryStructure`;
const getEmployees = `${payRoll}getEmployees`;
const getEmployeesWithoutSalaryStructure = `${payRoll}getEmployeesWithoutSalaryStructure`;
const getEmployeesWithoutBankDetails = `${payRoll}getEmployeesWithoutBankDetails`;
const updateSalaryStructureByRollnumber = `${payRoll}updateSalaryStructureByRollnumber`;
const deleteSalaryStructureByRollnumber = `${payRoll}deleteSalaryStructureByRollnumber`;
const salaryStructureDashboard = `${payRoll}salaryStructureDashboard`;

// Leave policy master 
const leavePolicy = `${baseApiurl}leavePolicy/`;
const postleavepolicy = `${leavePolicy}postleavepolicy`;
const GetLeavePolicy = `${leavePolicy}GetLeavePolicy`;
const postleavetypes = `${leavePolicy}postleavetypes`;
const GetleaveTypes = `${leavePolicy}GetleaveTypes`;
const postworkingcalendar = `${leavePolicy}postworkingcalendar`;
const GetWorkingcalendar = `${leavePolicy}GetWorkingcalendar`;
const UpdateleaveTypeByID = `${leavePolicy}UpdateleaveTypeByID`;
const DeleteleaveTypeByID = `${leavePolicy}DeleteleaveTypeByID`;
const GetEmployeeLeaveBalance = `${leavePolicy}GetEmployeeLeaveBalance`;
const GetunassignedStaff = `${leavePolicy}GetunassignedStaff`;
const GetShiftAssignedStaffs = `${leavePolicy}GetShiftAssignedStaffs`;
const assignStaffToShift = `${leavePolicy}assignStaffToShift`;
const UpdateAssignedStaff = `${leavePolicy}UpdateAssignedStaff`;
const unassignStaff = `${leavePolicy}unassignStaff`;


const postPFConfiguration = `${payRoll}postPFConfiguration`;
const postESIConfiguration = `${payRoll}postESIConfiguration`;
const postProfessionalTaxConfiguration = `${payRoll}postProfessionalTaxConfiguration`;
const postTDSConfiguration = `${payRoll}postTDSConfiguration`;
const getDeductionsAndCompliance = `${payRoll}getDeductionsAndCompliance`;
const employeeComplianceDashboard = `${payRoll}employeeComplianceDashboard`;
const updateEmployeeComplianceByRollnumber = `${payRoll}updateEmployeeComplianceByRollnumber`;

const employeeBankDetailsDashboard = `${payRoll}employeeBankDetailsDashboard`;
const updateEmployeeBankDetailsByRollnumber = `${payRoll}updateEmployeeBankDetailsByRollnumber`;
const salaryRegisterDashboard = `${payRoll}salaryRegisterDashboard`;

/* Payroll & attendance coverage — which users count as employees.
   NOT BUILT YET: both routes answer 404 today. StaffCoveragePage keeps a local
   draft so the screen stays usable, and switches over the moment these ship.
   See staffCoverageApi.js for the payload the screen sends. */
/* Leave approval settings — per leave category, which user types may approve.
   Root-level route, not under api/leave/.
   Shape: data.categories[] { leaveCategory: "Student"|"Staff", label, hasApprover,
   userTypes[] { userTypeID, userType, isSelected } }. */
const getLeaveApprovalSettings = `${baseApiurl}leaveApprovalSettings/Get`;

const getPayrollCoverage = `${payRoll}getPayrollCoverage`;
const savePayrollCoverage = `${payRoll}savePayrollCoverage`;

const leavePolicyDashboard = `${payRoll}leavePolicyDashboard`;
const getPayrollPayslipByRollNumber = `${payRoll}getPayrollPayslipByRollNumber`;
const postLeaveType = `${payRoll}postLeaveType`;
const updateLeaveTypeById = `${payRoll}updateLeaveTypeById`;
const approvePayrollPayslipsDashboard = `${payRoll}approvePayrollPayslipsDashboard`;

// Payroll cycle 
const payrollCycle = `${baseApiurl}payroll/`;
const getPayrollCycle = `${payrollCycle}cycle`;
const payrollCycleLockAttendance = `${payrollCycle}lockattendance`;
const payrollCycleCalculate = `${payrollCycle}calculate`;
const payrollCycleApprove = `${payrollCycle}approve`;
const payrollCycleMarkCredited = `${payrollCycle}markcredited`;
const payrollCycleRollback = `${payrollCycle}rollback`;
const getPayrollRegister = `${payrollCycle}register`;
const getPayrollPayslip = `${payrollCycle}payslip`;
const getMyPayrollPayslip = `${payrollCycle}mypayslip`;

// Transport 
const vehicle = `${baseApiurl}vehicle/`;

const getAllVehicleDetails = `${vehicle}getAllVehicleDetails`;
const postVehicle = `${vehicle}postVehicle`;
const updateVehicleDetails = `${vehicle}updateVehicleDetails`;
const getVehicleDetailById = `${vehicle}getVehicleDetailById`;
const deleteVehicleById = `${vehicle}deleteVehicleById`;

const transportManagement = `${baseApiurl}transportManagement/`;
const generateVehicleAssetId = `${transportManagement}generateVehicleAssetId`;
const postVehicleAcquisitionDetail = `${transportManagement}postVehicleAcquisitionDetail`;
const postVehicleSpecification = `${transportManagement}postVehicleSpecification`;
const postVehicleRegistrationOwnership = `${transportManagement}postVehicleRegistrationOwnership`;
const postVehicleInsuranceCompliance = `${transportManagement}postVehicleInsuranceCompliance`;
const postVehicleWarrantyServiceClaim = `${transportManagement}postVehicleWarrantyServiceClaim`;
const postVehicleDocuments = `${transportManagement}postVehicleDocuments`;
const findVehicleManagementDetails = `${transportManagement}findVehicleManagementDetails`;
const findVehicleSafetyComplianceInstallationDetail = `${transportManagement}findVehicleSafetyComplianceInstallationDetail`;
const getAllVehicles = `${transportManagement}getAllVehicles`;

const updateVehicleAcquisitionDetail = `${transportManagement}updateVehicleAcquisitionDetail`;
const updateVehicleSpecification = `${transportManagement}updateVehicleSpecification`;
const updateVehicleRegistrationOwnership = `${transportManagement}updateVehicleRegistrationOwnership`;
const updateVehicleInsuranceCompliance = `${transportManagement}updateVehicleInsuranceCompliance`;
const updateVehicleWarrantyServiceClaim = `${transportManagement}updateVehicleWarrantyServiceClaim`;
const updateVehicleDocuments = `${transportManagement}updateVehicleDocuments`;


const postStudentRouteMapping = `${transportManagement}postStudentRouteMapping`;
const getEligibleTransportStudents = `${transportManagement}getEligibleTransportStudents`;
const getRouteFullDetailsById = `${transportManagement}getRouteFullDetailsById`;
const getAllStudentMappingCards = `${transportManagement}getAllStudentMappingCards`;

const postNewRoute = `${transportManagement}postNewRoute`;
const updateNewRoute = `${transportManagement}updateNewRoute`;
const getAllRoutes = `${transportManagement}getAllRoutes`;
const getRouteById = `${transportManagement}getRouteById`;
const deleteRouteById = `${transportManagement}deleteRouteById`;


const getAllTrip = `${transportManagement}getAllTrip`;
const postTranspoartFee = `${baseApiurl}postTranspoartFee`;
const transpoartFeeFetch = `${baseApiurl}transpoartFeeFetch`;
const transpoartFeeFetchID = `${baseApiurl}transpoartFeeFetchID`;
const transpoartFeeFetchByRouteId = `${baseApiurl}transpoartFeeFetchByRouteId`;
const transpoartActivityFetch = `${baseApiurl}transpoartActivityFetch`;

const transpoartFee = `${baseApiurl}transpoartFee/`;
const updateTranspoartFeesApprovalAction = `${transpoartFee}updateTranspoartFeesApprovalAction`;
const approvalStatusCheckTranspoart = `${transpoartFee}approvalStatusCheckTranspoart`;
const updateTranspoartSchoolFee = `${transpoartFee}updateTranspoartSchoolFee`;
const deleteTranspoartFeesStructure = `${transpoartFee}deleteTranspoartFeesStructure`;

// Worl Done 
const GetWorkdoneClassWise = `${baseApiurl}WorkDoneReport/GetWorkdoneClassWise`;
const GetWorkdoneTeacherWise = `${baseApiurl}WorkDoneReport/GetWorkdoneTeacherWise`;
const GetIndividualTeacherWorkDone = `${baseApiurl}WorkDoneReport/GetIndividualTeacherWorkDone`;
const PostWorkdoneReport = `${baseApiurl}WorkDoneReport/PostWorkdoneReport`;

const GetWorkdonePeriods = `${baseApiurl}WorkDoneSettings/GetWorkdonePeriods`;
const PostWorkdonePeriods = `${baseApiurl}WorkDoneSettings/PostWorkdonePeriods`;
const GetCustomWorkdoneSubjects = `${baseApiurl}WorkDoneSettings/GetCustomWorkdoneSubjects`;
const SaveCustomWorkdoneSubjects = `${baseApiurl}WorkDoneSettings/SaveCustomWorkdoneSubjects`;
const GetWorkdoneSettings = `${baseApiurl}WorkDoneSettings/GetWorkdoneSettings`;
const SaveWorkdoneSettings = `${baseApiurl}WorkDoneSettings/SaveWorkdoneSettings`;


// Vehicle Safety & Compliance APIs
const postVehicleFCDetail = `${transportManagement}postVehicleFCDetail`;
const updateVehicleFCDetail = `${transportManagement}updateVehicleFCDetail`;
const postVehiclePermitDetail = `${transportManagement}postVehiclePermitDetail`;
const updateVehiclePermitDetail = `${transportManagement}updateVehiclePermitDetail`;
const postVehiclePUCDetail = `${transportManagement}postVehiclePUCDetail`;
const updateVehiclePUCDetail = `${transportManagement}updateVehiclePUCDetail`;
const postVehicleRoadTransportTax = `${transportManagement}postVehicleRoadTransportTax`;
const updateVehicleRoadTransportTax = `${transportManagement}updateVehicleRoadTransportTax`;
const postVehicleCctvCameraInstallation = `${transportManagement}postVehicleCctvCameraInstallation`;
const updateVehicleCctvCameraInstallation = `${transportManagement}updateVehicleCctvCameraInstallation`;
const postVehicleBusBrandingVisualIdentity = `${transportManagement}postVehicleBusBrandingVisualIdentity`;
const updateVehicleBusBrandingVisualIdentity = `${transportManagement}updateVehicleBusBrandingVisualIdentity`;
const findVehicleSafetyComplianceDetails = `${transportManagement}findVehicleSafetyComplianceDetails`;

// Access control
const GetUsersBaseDetails = `${baseApiurl}Dashboard/GetUsersBaseDetails`;
const LoginList = `${baseApiurl}Dashboard/LoginList`;
const getAllExams = `${baseApiurl}GradeValueFetch/getAllExams`;

const PostStudentExit = `${baseApiurl}studentExit/PostStudentExit`;
const FetchExitHistory = `${baseApiurl}studentExit/FetchExitHistory`;
const PostAcademicYearConfig = `${baseApiurl}academicyear/PostAcademicYearConfig`;
const GetAcademicYearConfig = `${baseApiurl}academicyear/GetAcademicYearConfig`;
const GetExitFeesSummary = `${baseApiurl}studentExit/GetExitFeesSummary`;

// Role based access 
const UserTypes = `${baseApiurl}/UserTypes/`;
const AddUserType = `${UserTypes}/AddUserType`;
const GetAllUserTypes = `${UserTypes}/GetAllUserTypes`;
const UpdateUsersUserType = `${UserTypes}/UpdateUsersUserType`;
const GetNonStudentUsers = `${UserTypes}/GetNonStudentUsers`;
const GetUserTypePermissions = `${UserTypes}/GetUserTypePermissions`;
const UpdateUserTypePermissions = `${UserTypes}/UpdateUserTypePermissions`;
const GetAllApprovalMatrix = `${UserTypes}/GetAllApprovalMatrix`;
const UpdateApprovalMatrix = `${UserTypes}/UpdateApprovalMatrix`;

// Leave approvers live outside the approval matrix - one call carries both
// categories (Student and Staff) as a set of user type ids each.
const LeaveApprovalSettings = `${baseApiurl}leaveApprovalSettings/`;
const GetLeaveApprovalSettings = `${LeaveApprovalSettings}Get`;
const UpdateLeaveApprovalSettings = `${LeaveApprovalSettings}Update`;


// Class & Section Management
const postGrade = `${baseApiurl}GradeValueFetch/postGrade`;
const postSection = `${baseApiurl}GradeValueFetch/postSection`;
const deleteSection = `${baseApiurl}GradeValueFetch/deleteSection`;
const getExamsByGradeId = `${baseApiurl}GradeValueFetch/getExamsByGradeId`;
const updateExamsByGradeId = `${baseApiurl}GradeValueFetch/updateExamsByGradeId`;
const fetchAllSubjects = `${baseApiurl}GradeValueFetch/fetchAllSubjects`;
const fetchSubjectsByID = `${baseApiurl}GradeValueFetch/fetchSubjectsByID`;
const updatePrimaryAndSecondarySubjects = `${baseApiurl}GradeValueFetch/updatePrimaryAndSecondarySubjects`;
const AddClass = `${baseApiurl}GradeValueFetch/AddClass`;
const AddClassSection = `${baseApiurl}GradeValueFetch/AddClassSection`;

//----------------------------------- Online Quiz ----------------------------------
//----------------------------------- xxxxxxxx ----------------------------------

const QuizLimits = `${baseApiurl}qtest/limits`;
const GenerateQuizQuestions = `${baseApiurl}qtest/generateQuestions`;
const PostQuizQuestions = `${baseApiurl}qtest/postQuzeQuestions`;
const GetQuizApprovalRequests = `${baseApiurl}qtest/getQuzeApprovalRequests`;
const GetQuizById = `${baseApiurl}qtest/getQuzeById`;
const UpdateQuizApproval = `${baseApiurl}qtest/updateQuzeApproval`;
const GetQuizDashboard = `${baseApiurl}qtest/getQuzeDashboard`;
const GetAllQuizzesForAdmin = `${baseApiurl}qtest/getAllQuzesForAdmin`;
const GetQuizSingleAnalytics = `${baseApiurl}qtest/getQuzeSingleAnalytics`;
const GetStudentQuizWarningCount = `${baseApiurl}qtest/getStudentQuzeResultReviewWarningCount`;

//----------------------------------- xxxxxxxx ----------------------------------

//----------------------------------- New Dashboard ----------------------------------
//----------------------------------- xxxxxxxx ----------------------------------

// Master Overview - the three sections are independent, fire them together.
const MasterDashboardHeadline = `${baseApiurl}masterDashboard/overview/headline`;
const MasterDashboardAttendanceSection = `${baseApiurl}masterDashboard/overview/attendanceSection`;
const MasterDashboardAcademicsSection = `${baseApiurl}masterDashboard/overview/academicsSection`;

// Common Dashboard - the logged-in staff member's own day, no permission gate.
const CommonDashboardHeadline = `${baseApiurl}commonDashboard/headline`;
const CommonDashboardAttendanceLeave = `${baseApiurl}commonDashboard/attendanceLeave`;
const CommonDashboardWork = `${baseApiurl}commonDashboard/work`;
const CommonDashboardForMe = `${baseApiurl}commonDashboard/forMe`;

//----------------------------------- xxxxxxxx ----------------------------------

//----------------------------------- Books & Chapters ----------------------------------
//----------------------------------- xxxxxxxx ----------------------------------

/* questionpapergeneration > bookupload. view for the two GETs, create for the
   upload, edit for confirm/update. UAT only - not on Live yet. */
const UploadBook = `${baseApiurl}questionpapergeneration/uploadBook`;
const GetBookStatus = `${baseApiurl}questionpapergeneration/getBookStatus`;
const ListBooks = `${baseApiurl}questionpapergeneration/listBooks`;
const ConfirmBookChapters = `${baseApiurl}questionpapergeneration/confirmChapters`;
const UpdateBookMetadata = `${baseApiurl}questionpapergeneration/updateBookMetadata`;
const DeleteBook = `${baseApiurl}questionpapergeneration/deleteBook`;

/* questionpapergeneration > pattern. Patterns are scoped to grade + subject and
   are NOT tied to an academic year or a book - the same one is reused every
   year. UAT only, not on Live yet. */
const CreatePattern = `${baseApiurl}questionpapergeneration/createPattern`;
const UpdatePattern = `${baseApiurl}questionpapergeneration/updatePattern`;
const GetPattern = `${baseApiurl}questionpapergeneration/getPattern`;
const ListPatterns = `${baseApiurl}questionpapergeneration/listPatterns`;
const DeletePattern = `${baseApiurl}questionpapergeneration/deletePattern`;

//----------------------------------- xxxxxxxx ----------------------------------

//----------------------------------- Question Paper Generation ----------------------------------
//----------------------------------- xxxxxxxx ----------------------------------

const GetQuestionPaperPatterns = `${baseApiurl}qpaper/getPatterns`;
const PostQuestionPaperPattern = `${baseApiurl}qpaper/postPattern`;
const UpdateQuestionPaperPattern = `${baseApiurl}qpaper/updatePattern`;
const DeleteQuestionPaperPattern = `${baseApiurl}qpaper/deletePattern`;
const GenerateQuestionPaperQuestions = `${baseApiurl}qpaper/generateQuestions`;
const CheckQuestionPaperDuplicates = `${baseApiurl}qpaper/checkDuplicates`;
const SaveQuestionPaper = `${baseApiurl}qpaper/save`;
const GetAllQuestionPapers = `${baseApiurl}qpaper/getAll`;
const GetQuestionPaperById = `${baseApiurl}qpaper/getById`;
const GetQuestionPaperDashboard = `${baseApiurl}qpaper/getDashboard`;
const GetQuestionPaperApprovalRequests = `${baseApiurl}qpaper/getApprovalRequests`;
const UpdateQuestionPaperApproval = `${baseApiurl}qpaper/updateApproval`;
const PublishQuestionPaper = `${baseApiurl}qpaper/publish`;

//----------------------------------- Complaints ----------------------------------
//----------------------------------- xxxxxxxx ----------------------------------

// Both take multipart/form-data. The parent endpoint serves four flows, told
// apart by RegistrationMode (ParentDirect | StaffOnBehalf) and
// SubmissionPlatform (Mobile | Website) — see the backend's screen/API mapping.
const PostParentComplaint = `${baseApiurl}complaints/parent`;
const PostStaffConcern = `${baseApiurl}complaints/staff-concern`;

/* Complaints Configuration Hub — 18 body-only routes.
   Every one is a POST or PUT with a JSON body; even the reads take no query string, so a
   GET here answers 405. Parent and Staff Concern share one set of endpoints and are told
   apart by `moduleType`, and the actor field is `actorRollNumber` — NOT the
   requestedByRollNumber / creatorRollNumber pair the rest of the app sends. */
const complaintsConfig = `${baseApiurl}complaints/configuration/`;

const GetComplaintCategories = `${complaintsConfig}categories/get`;
const CreateComplaintCategory = `${complaintsConfig}categories/create`;
const UpdateComplaintCategory = `${complaintsConfig}categories/update`;
const SetComplaintCategoryStatus = `${complaintsConfig}categories/status`;

const GetComplaintAssignmentMappings = `${complaintsConfig}assignment-mappings/get`;
const CreateComplaintAssignmentMapping = `${complaintsConfig}assignment-mappings/create`;
const UpdateComplaintAssignmentMapping = `${complaintsConfig}assignment-mappings/update`;

const GetComplaintPermissions = `${complaintsConfig}permissions/get`;
const SaveComplaintPermissions = `${complaintsConfig}permissions/save`;

const GetComplaintSla = `${complaintsConfig}sla/get`;
const SaveComplaintSla = `${complaintsConfig}sla/save`;

const GetComplaintEscalation = `${complaintsConfig}escalation/get`;
const SaveComplaintEscalation = `${complaintsConfig}escalation/save`;

const GetComplaintNotificationTemplates = `${complaintsConfig}notification-templates/get`;
const SaveComplaintNotificationTemplate = `${complaintsConfig}notification-templates/save`;

const GetComplaintDashboardWidgets = `${complaintsConfig}dashboard-widgets/get`;
const SaveComplaintDashboardWidgets = `${complaintsConfig}dashboard-widgets/save`;

const GetComplaintConfigAuditLog = `${complaintsConfig}audit-log/get`;

/* Shared lookups and complaint detail — conventional GETs with a query string, unlike the
   Configuration Hub's body-only POSTs above. The actor rides in the query as
   `actorRollNumber`. */
const GetComplaintLookupCategories = `${baseApiurl}complaints/categories`;
const SearchComplaintStudents = `${baseApiurl}complaints/students/search`;
/* Detail and timeline have been served in BOTH shapes on this API and have swapped over
   at least twice mid-development: `complaints/detail?complaintToken=` (what module 04
   documents) and `complaints/{token}` (what modules 06/07 introduced). Whichever is not
   deployed answers 404, so both are defined and the wrapper falls back — see
   fetchComplaintDetail. Delete the unused pair once the backend settles on one. */
const GetComplaintDetail = `${baseApiurl}complaints/detail`;
const GetComplaintTimeline = `${baseApiurl}complaints/timeline`;
const GetComplaintDetailByPath = (complaintToken) =>
    `${baseApiurl}complaints/${encodeURIComponent(complaintToken)}`;
const GetComplaintTimelineByPath = (complaintToken) =>
    `${baseApiurl}complaints/${encodeURIComponent(complaintToken)}/timeline`;
const DownloadComplaintAttachment = `${baseApiurl}complaints/attachments/download`;
const GetComplaintNotifications = `${baseApiurl}complaints/notifications`;

/* Complaint actions (modules 06 and 07). All JSON POSTs except /resolution, which is
   multipart because it carries evidence attachments. Every one takes actorRollNumber and
   complaintToken, and every one changes the complaint's state — reload the detail after. */
const PostComplaintAcknowledge = `${baseApiurl}complaints/acknowledge`;
const PostComplaintStatus = `${baseApiurl}complaints/status`;
const PostComplaintNote = `${baseApiurl}complaints/notes`;
const PostComplaintRequestInformation = `${baseApiurl}complaints/request-information`;
const PostComplaintAssign = `${baseApiurl}complaints/management/assign`;
const PostComplaintEscalate = `${baseApiurl}complaints/management/escalate`;
const PostComplaintManagementReopen = `${baseApiurl}complaints/management/reopen`;
const PostComplaintReviewResolution = `${baseApiurl}complaints/management/review-resolution`;
const PostComplaintClose = `${baseApiurl}complaints/management/close`;
const PostComplaintDuplicate = `${baseApiurl}complaints/management/duplicate`;
const PostComplaintParticipants = `${baseApiurl}complaints/management/participants`;

/* Staff My Work and Complaints Management (modules 06 and 07).
   These are the list endpoints the workspace, the My Work queue and the dashboards read.
   All are GET + query string, and every one requires actorRollNumber. */
const GetComplaintsManagementAll = `${baseApiurl}complaints/management/all`;
const GetComplaintsStatusCounts = `${baseApiurl}complaints/management/status-counts`;
const GetComplaintsManagementDashboard = `${baseApiurl}complaints/management/dashboard`;
const GetStaffMyWork = `${baseApiurl}complaints/staff/my-work`;


//----------------------------------- xxxxxxxx ----------------------------------

export {
    getSchoolConfig,
    poststudyMaterial,
    deleteDashboardSlider,
    LoginList,
    postDairyStatus,
    postSiblingMapping,
    fetchSubjectsByID,
    postDresscodeStatus,
    fetchAllSubjects,
    attendanceReport,
    updatePrimaryAndSecondarySubjects,
    postHomeworkStatus,
    fetchHomeworkStatus,
    GettingGrades02,
    VersionFetch,
    VersionUpdate,
    updateHomeworkStatus,
    fetchDairyStatus,
    updateDairyStatus,
    fetchDressCodeStatus,
    updateDressCodeStatus,
    homeworkStatusReport,
    dairyStatusReport,
    dresscodeStatusReport,
    ApprovalStatusHomeWorkFetch,
    updateHomeWorkApprovalAction,
    UsersPassword,
    getExamsByGradeId,
    GetUsersBaseDetails,
    getAllExams,
    BulkDeleteCircular,
    BulkDeleteNews,
    BulkDeleteMessage,
    postNotification,
    getDashboardSliders,
    postDashboardSliders,
    updateStudyMaterialFolder,
    getStudyMaterialFolderById,
    postStudyMaterialFolder,
    getStudyMaterialFoldersByGrade,
    deleteStudyMaterialFolder,
    parentsFeedbackAdminUpdate,
    GetFeedBackDetailByID,
    updateConsentForm,
    GetConsentFormById,
    postAttendanceMessage,
    NewsFetchDraft,
    updateFeedBack,
    MessageFetchDraft,
    CircularFetchDraft,
    DeleteAllDraft,
    ConsentFetchFetchDradt,
    postStudentSiblingInformation,
    FeedBackFetchFetchDraft,
    updateStudentSibilingInformation,
    updateStudentAcademicInformation,
    GetStudentsInformation,
    GetStaffInformation,
    FindStudentManagementDetails,
    updateStudentgeneralhealthInformation,
    postStudentDocumentInformation,
    updateExamsByGradeId,
    updateStudentDocumentInformation,
    updateStudentGuardianInformation,
    postStudentgeneralhealthInformation,
    postStudentFamilyInformation,
    updateStudentInformation,
    postStudentInformation,
    updateStudentFamilyInformation,
    postStudentGuardianInformation,
    postTeachersTimeTable,
    deleteTeachersTimeTable,
    updateTeachersTimeTable,
    postMarks,
    updateEventCalender,
    fetchTeachersTimeTable,
    FetchAllCalenderEvent,
    fetchAllMarksStudents,
    fetchAllMarksStudents02,
    FindEventCalender,
    postEventCalender,
    DeleteEventCalender,
    postSchoolCalender,
    parentsFeedBackFetchAll,
    FindSchoolCalender,
    DeleteSchoolCalender,
    StudyMaterialFetch,
    updateStudyMaterial,
    DeleteStudyMaterial,
    FindStudyMaterial,
    Login,
    Dashboard,
    DashboardUsers,
    DashboardManagement,
    DashboardNews,
    DashboardBirthday,
    BirthdayInstagramPost,
    DashboardTeachersAttendance,
    DashboardStudentsAttendance,
    updateSchoolCalender,
    barchart, piechart,
    sectionsDropdown,
    attendanceSpecific,
    attendanceTable,
    irregularAttendees,
    fetchAttendance,
    postAttendance,
    updateAttendance,
    postNews,
    NewsFetch,
    DeleteNewsApi,
    FindNews,
    updateNews,
    GettingGrades,
    postMessage,
    MessageFetch,
    DeleteMessage,
    FindMessage,
    updateMessage,
    CircularFetch,
    DeleteCircular,
    postCircular,
    FindCircular,
    updateCircular,
    TimeTableFetch,
    DeleteTimeTable,
    postTimeTable,
    FindTimeTable,
    updateTimeTable,
    postHomeWork,
    FindHomeWork,
    DeleteHomeWork,
    HomeWorkFetch,
    HomeWorkFetch01,
    updateHomeWork,
    GettingGradesData,
    postexamtimetable,
    FindExamTimeTable,
    DeleteExamTimeTable,
    updateExamTimeTable,
    ExamTimeTableFetch,
    postConsentForm,
    ConsentFetchFetch,
    ConsentFormFetchAll,
    DeleteConsentForm,
    MarksStudentsFetch,
    FetchAllSchoolCalenderEvents,
    ApprovalStatusNewsFetch,
    updateNewsApprovalAction,
    ApprovalStatusMessageFetch,
    updateMessageApprovalAction,
    ApprovalStatusCircularFetch,
    updateCircularApprovalAction,
    postStudentAcademicInformation,
    schoolFee,
    getFees,
    ecaFee,
    ecaFeeFetch,
    ecaFeeFetchID,
    ecaActivityFetch,
    ecaFeeStudentAdd,
    ecaFeeStudentFetch,
    updateEcaFeesApprovalAction,
    ECAupdateSchoolFee,
    approvalStatusCheckEca,
    deleteEcaFeesStructure,
    postStaffInformation,
    updateStaffInformation,
    postStaffStudentInformation,
    updateStaffStudentInformation,
    FindStaffManagementDetails,
    approvalStatusCheck,
    updateSchoolFeesApprovalAction,
    getFeesById,
    updateSchoolFee,
    deleteSchoolFeesStructure,
    getAllVehicleDetails,
    postVehicle,
    updateVehicleDetails,
    getVehicleDetailById,
    deleteVehicleById,
    postAdditionalFee,
    additionalFeeFetch,
    additionalFeeFetchID,
    additionalFeeNameFetch,
    additionalFeeStudentAdd,
    updateAdditionalFeesApprovalAction,
    additionalParentsFetch,
    approvalStatusCheckAdditional,
    updateAdditionalFee,
    deleteAdditionalFeesStructure,
    findStudentSchoolFeesBilling,
    findStudents,
    generateVehicleAssetId,
    postVehicleAcquisitionDetail,
    postVehicleSpecification,
    postVehicleRegistrationOwnership,
    postVehicleInsuranceCompliance,
    postVehicleWarrantyServiceClaim,
    postVehicleDocuments,
    findVehicleManagementDetails,
    getAllVehicles,
    postVehicleFCDetail,
    updateVehicleFCDetail,
    postVehiclePermitDetail,
    updateVehiclePermitDetail,
    postVehiclePUCDetail,
    updateVehiclePUCDetail,
    postVehicleRoadTransportTax,
    updateVehicleRoadTransportTax,
    postVehicleCctvCameraInstallation,
    updateVehicleCctvCameraInstallation,
    postVehicleBusBrandingVisualIdentity,
    updateVehicleBusBrandingVisualIdentity,
    findVehicleSafetyComplianceDetails,
    updateVehicleAcquisitionDetail,
    updateVehicleSpecification,
    updateVehicleRegistrationOwnership,
    updateVehicleInsuranceCompliance,
    updateVehicleWarrantyServiceClaim,
    updateVehicleDocuments,
    findVehicleSafetyComplianceInstallationDetail,
    postPaymentMethod,
    findStudentEcaFeesBilling,
    schoolFeesRecordGet,
    postEcaPaymentMethod,
    ecaFeesRecordGet,
    findStudentAdditionalFeesBilling,
    postAdditionalPaymentMethod,
    additionalFeesRecordGet,
    findStudentTransportFeesBilling,
    postTransportPaymentMethod,
    transportFeesRecordGet,
    postNewRoute,
    updateNewRoute,
    getAllRoutes,
    getRouteById,
    deleteRouteById,
    postStudentRouteMapping,
    getRouteFullDetailsById,
    getAllStudentMappingCards,
    getAllTrip,
    postTranspoartFee,
    transpoartFeeFetch,
    transpoartFeeFetchID,
    transpoartFeeFetchByRouteId,
    transpoartActivityFetch,
    updateTranspoartFeesApprovalAction,
    approvalStatusCheckTranspoart,
    updateTranspoartSchoolFee,
    deleteTranspoartFeesStructure,
    postSchoolFeeConcession,
    postEcaFeeConcession,
    postAdditionalFeeConcession,
    postTransportFeeConcession,
    fundApprovalStatusCheck,
    updateAddFundApprovalAction,
    getAddedFund,
    getAddedFundById,
    updateFundById,
    postFund,
    postExpence,
    expenceApprovalStatusCheck,
    updateAddexpenceApprovalAction,
    getAddedExpence,
    getAddedExpenceById,
    updateExpenceById,
    expenceDashboard,
    overView,
    todaysCollection,
    cashCollection,
    classWiseCollection,
    defaulters,
    feeReport,
    postAttendanceTeachers,
    GetAttendanceTeacherBefore,
    updateTeachersAttendance,
    postLeaveRequest,
    leaveApprovalStatusCheck,
    updateLeaveApprovalAction,
    getLeaveDashboard,
    getLeaveApprovalDashboard,
    GetUserAttendanceLeaveSummary,
    getLeaveConfig,
    saveLeaveConfig,
    getAttendanceDashboard,
    getStaffAttendanceOverview,
    reportsLeaveManagement,
    reportsLeaveManagementFullReport,
    postSalaryStructure,
    getEmployees,
    getEmployeesWithoutSalaryStructure,
    getEmployeesWithoutBankDetails,
    updateSalaryStructureByRollnumber,
    deleteSalaryStructureByRollnumber,
    salaryStructureDashboard,
    postPFConfiguration,
    postESIConfiguration,
    postProfessionalTaxConfiguration,
    postTDSConfiguration,
    getDeductionsAndCompliance,
    employeeComplianceDashboard,
    updateEmployeeComplianceByRollnumber,
    employeeBankDetailsDashboard,
    updateEmployeeBankDetailsByRollnumber,
    salaryRegisterDashboard,
    getLeaveApprovalSettings,
    getPayrollCoverage,
    savePayrollCoverage,
    leavePolicyDashboard,
    postLeaveType,
    updateLeaveTypeById,
    getPayrollPayslipByRollNumber,
    approvePayrollPayslipsDashboard,
    getPayrollCycle,
    payrollCycleLockAttendance,
    payrollCycleCalculate,
    payrollCycleApprove,
    payrollCycleMarkCredited,
    payrollCycleRollback,
    getPayrollRegister,
    getPayrollPayslip,
    getMyPayrollPayslip,
    postGrade,
    postSection,
    deleteSection,
    updateUserPassword,
    updateLoginPassword,
    getBillingUser,
    getEligibleEcaStudents,
    getEligibleTransportStudents,
    getUsersByUserType,
    myExpenceRequests,
    myFundRequests,
    AddClass,
    AddClassSection,
    GetConcessionLog,
    getUserConcessionDetails,
    sendFeeReminder,
    getLastFeeReminder,
    monthlyCollectionByCategory,
    findingGradeWithSubject,
    postNewFeedback,
    deleteNewFeedbackByTitleId,
    updateNewFeedbackQuestions,
    fetchNewFeedbackAdminResponses,
    postleavepolicy,
    GetLeavePolicy,
    postleavetypes,
    GetleaveTypes,
    postworkingcalendar,
    GetWorkingcalendar,
    UpdateleaveTypeByID,
    DeleteleaveTypeByID,
    GetEmployeeLeaveBalance,
    GetunassignedStaff,
    GetShiftAssignedStaffs,
    assignStaffToShift,
    UpdateAssignedStaff,
    unassignStaff,
    PostPromoteStudents,
    FetchPromotableStudents,
    FetchPromotedStudents,
    UpdatePromotedStudents,
    IssueStudentTC,
    DiscontinueStudent,
    PostStudentExit,
    FetchExitHistory,
    SyncStatus,
    TriggerManualSync,
    GetBiometricMappings,
    fetchDashboard,
    viewTracking,
    viewTrackingStatus,
    PostBiometricMappings,
    UpdateBiometricMappings,
    GetBiometricAttendanceLogs,
    RebuildFromRecords,
    SyncSummary,
    PostTeachersManualAttendance,
    GetTeachersAttendance,
    GetTeachersAttendanceAudit,
    GetMyAttendanceStatus,
    PostAcademicYearConfig,
    GetAcademicYearConfig,
    GetExitFeesSummary,
    GetWorkdoneClassWise,
    GetWorkdoneTeacherWise,
    GetIndividualTeacherWorkDone,
    PostWorkdoneReport,
    GetWorkdonePeriods,
    PostWorkdonePeriods,
    GetCustomWorkdoneSubjects,
    SaveCustomWorkdoneSubjects,
    GetWorkdoneSettings,
    SaveWorkdoneSettings,
    getContactDetails,
    postContactDetails,
    updateContactDetailsById,
    deleteContactDetailsById,
    teamManagementGet,
    moveToAccounts,
    moveToBilling,
    paymentApprovalsGet,
    paymentApprovalUpdate,
    GetOverallLeaveDetails,
    StudentsOnLeaveToday,
    LeaveApproval,
    creategroup,
    fetchgroups,
    fetchgroupinfo,
    sendmessage,
    fetchmessages,
    searchusers,
    getchatusers,
    updatememberrole,
    leavegroup,
    deletegroup,
    clearchat,
    editmessage,
    markread,
    pinmessage,
    deletemessage,
    updategroup,
    updategroupmembers,
    mutegroup,
    uploadfile,
    chathub,
    reactmessage,
    messagereadinfo,
    searchmessages,
    fetchmedia,
    AddUserType,
    GetAllUserTypes,
    GetAllApprovalMatrix,
    UpdateApprovalMatrix,
    GetLeaveApprovalSettings,
    UpdateLeaveApprovalSettings,
    UpdateUsersUserType,
    GetNonStudentUsers,
    GetUserTypePermissions,
    UpdateUserTypePermissions,
    DashboardBirthdayUpdated,
    QuizLimits,
    GenerateQuizQuestions,
    PostQuizQuestions,
    GetQuizApprovalRequests,
    GetQuizById,
    UpdateQuizApproval,
    GetQuizDashboard,
    GetAllQuizzesForAdmin,
    GetQuizSingleAnalytics,
    GetStudentQuizWarningCount,
    MasterDashboardHeadline,
    MasterDashboardAttendanceSection,
    MasterDashboardAcademicsSection,
    CommonDashboardHeadline,
    CommonDashboardAttendanceLeave,
    CommonDashboardWork,
    CommonDashboardForMe,
    UploadBook,
    DeleteBook,
    CreatePattern,
    UpdatePattern,
    GetPattern,
    ListPatterns,
    DeletePattern,
    GetBookStatus,
    ListBooks,
    ConfirmBookChapters,
    UpdateBookMetadata,
    GetQuestionPaperPatterns,
    PostQuestionPaperPattern,
    UpdateQuestionPaperPattern,
    DeleteQuestionPaperPattern,
    GenerateQuestionPaperQuestions,
    CheckQuestionPaperDuplicates,
    SaveQuestionPaper,
    GetAllQuestionPapers,
    GetQuestionPaperById,
    GetQuestionPaperDashboard,
    GetQuestionPaperApprovalRequests,
    UpdateQuestionPaperApproval,
    PublishQuestionPaper,
    PostParentComplaint,
    PostStaffConcern,
    GetComplaintCategories,
    CreateComplaintCategory,
    UpdateComplaintCategory,
    SetComplaintCategoryStatus,
    GetComplaintAssignmentMappings,
    CreateComplaintAssignmentMapping,
    UpdateComplaintAssignmentMapping,
    GetComplaintPermissions,
    SaveComplaintPermissions,
    GetComplaintSla,
    SaveComplaintSla,
    GetComplaintEscalation,
    SaveComplaintEscalation,
    GetComplaintNotificationTemplates,
    SaveComplaintNotificationTemplate,
    GetComplaintDashboardWidgets,
    SaveComplaintDashboardWidgets,
    GetComplaintConfigAuditLog,
    GetComplaintLookupCategories,
    SearchComplaintStudents,
    GetComplaintDetail,
    GetComplaintDetailByPath,
    GetComplaintTimeline,
    GetComplaintTimelineByPath,
    DownloadComplaintAttachment,
    GetComplaintNotifications,
    PostComplaintAcknowledge,
    PostComplaintStatus,
    PostComplaintNote,
    PostComplaintRequestInformation,
    PostComplaintAssign,
    PostComplaintEscalate,
    PostComplaintManagementReopen,
    PostComplaintReviewResolution,
    PostComplaintClose,
    PostComplaintDuplicate,
    PostComplaintParticipants,
    GetComplaintsManagementAll,
    GetComplaintsStatusCounts,
    GetComplaintsManagementDashboard,
    GetStaffMyWork
}