// Every export here is placeholder data for the dashboard bands.
// Replace with GET /Dashboard/Overview - see DASHBOARD_API_CONTRACT at the bottom.

export const MOCK_ALERTS = [
    { key: "attendance", count: 6, label: "classes without attendance today", severity: "critical", path: "/dashboardmenu/attendance" },
    { key: "approvals", count: 4, label: "approvals waiting over 3 days", severity: "warning", path: "/dashboardmenu/approvals" },
    { key: "fee", count: 23, label: "fee defaulters past 60 days", severity: "critical", path: "/dashboardmenu/fee" },
    { key: "transport", count: 3, label: "vehicle documents expiring in 30 days", severity: "warning", path: "/dashboardmenu/transport" },
    { key: "mapping", count: 11, label: "students without a transport route", severity: "info", path: "/dashboardmenu/transport" },
];

export const MOCK_KPIS = {
    students: 1284,
    studentsTrend: "18 this month",
    studentsSpark: [1240, 1248, 1255, 1261, 1268, 1274, 1284],

    staff: 96,
    staffSplit: "72 teaching / 24 support",
    staffSpark: [92, 93, 93, 94, 95, 95, 96],

    studentAttendance: 94,
    studentAttendanceTrend: "1.2% vs yesterday",
    studentAttendanceSpark: [92, 95, 91, 96, 93, 92.8, 94],

    staffAttendance: 97,
    staffAttendanceNote: "3 on leave today",
    staffAttendanceSpark: [96, 98, 95, 97, 99, 94, 97],

    feeCollected: "12.4L",
    feeOutstanding: "3.1L outstanding",
    feeSpark: [9.2, 10.8, 8.4, 11.6, 10.1, 11.9, 12.4],

    pendingApprovals: 9,
    approvalsNote: "awaiting your action",
    approvalsSpark: [4, 6, 5, 8, 7, 11, 9],
};

export const MOCK_ATTENDANCE_TREND = [
    { day: "Mon", students: 92, staff: 96 },
    { day: "Tue", students: 95, staff: 98 },
    { day: "Wed", students: 91, staff: 95 },
    { day: "Thu", students: 96, staff: 97 },
    { day: "Fri", students: 94, staff: 99 },
    { day: "Sat", students: 88, staff: 94 },
];

export const MOCK_GRADE_ATTENDANCE = [
    { grade: "Grade 6", present: 96 },
    { grade: "Grade 7", present: 92 },
    { grade: "Grade 8", present: 89 },
    { grade: "Grade 9", present: 95 },
    { grade: "Grade 10", present: 93 },
];

// Total class-sections expected to mark attendance each day. The dashboard
// gauge shows how many of these are done, so the pending list has a denominator.
export const MOCK_TOTAL_CLASSES = 46;

export const MOCK_UNMARKED_CLASSES = [
    { id: 1, grade: "Grade 7", section: "B", teacher: "Priya Menon" },
    { id: 2, grade: "Grade 8", section: "A", teacher: "Rahul Nair" },
    { id: 3, grade: "Grade 9", section: "C", teacher: "Anitha R" },
    { id: 4, grade: "Grade 10", section: "B", teacher: "Suresh Kumar" },
];

export const MOCK_STAFF_ON_LEAVE = [
    { id: 1, name: "Deepa Iyer", role: "Mathematics", type: "Casual Leave" },
    { id: 2, name: "Vikram Shah", role: "Physical Education", type: "Sick Leave" },
    { id: 3, name: "Latha Raman", role: "Science", type: "Casual Leave" },
];

export const MOCK_UPCOMING_EXAMS = [
    { id: 1, name: "Unit Test 2 - Mathematics", grade: "Grade 9", date: "Aug 14, 2026" },
    { id: 2, name: "Unit Test 2 - Science", grade: "Grade 9", date: "Aug 16, 2026" },
    { id: 3, name: "Mid Term - English", grade: "Grade 7", date: "Aug 18, 2026" },
];

export const MOCK_MARKS_ENTRY = [
    { exam: "Unit Test 1", entered: 18, total: 22 },
    { exam: "Mid Term", entered: 9, total: 22 },
    { exam: "Practical", entered: 21, total: 22 },
];

export const MOCK_ACADEMIC_SUMMARY = {
    homeworkToday: 14,
    homeworkThisWeek: 62,
    materialsThisWeek: 9,
    quizzesActive: 3,
    quizAverage: 78,
};

export const MOCK_FEE_TREND = [
    { month: "Mar", collected: 9.2 },
    { month: "Apr", collected: 10.8 },
    { month: "May", collected: 8.4 },
    { month: "Jun", collected: 11.6 },
    { month: "Jul", collected: 10.1 },
    { month: "Aug", collected: 12.4 },
];

export const MOCK_FEE_SPLIT = [
    { name: "School Fee", value: 62 },
    { name: "Transport", value: 18 },
    { name: "ECA", value: 12 },
    { name: "Additional", value: 8 },
];

export const MOCK_GRADE_COLLECTION = [
    { grade: "Grade 6", collected: 88 },
    { grade: "Grade 7", collected: 76 },
    { grade: "Grade 8", collected: 91 },
    { grade: "Grade 9", collected: 69 },
    { grade: "Grade 10", collected: 83 },
];

export const MOCK_TRANSACTIONS = [
    { id: 1, student: "Aarav Kumar", grade: "10-A", amount: "12,500", mode: "UPI", status: "Approved", time: "10 min ago" },
    { id: 2, student: "Diya Sharma", grade: "8-B", amount: "9,800", mode: "Card", status: "Approved", time: "42 min ago" },
    { id: 3, student: "Ishaan Verma", grade: "7-A", amount: "15,000", mode: "Net Banking", status: "Pending", time: "1 hour ago" },
    { id: 4, student: "Meera Nair", grade: "9-C", amount: "7,200", mode: "Cheque", status: "Approved", time: "2 hours ago" },
    { id: 5, student: "Rohan Iyer", grade: "6-B", amount: "11,400", mode: "UPI", status: "Rejected", time: "3 hours ago" },
];

export const MOCK_PAYROLL = {
    processed: 74,
    pending: 22,
    credited: 74,
    total: 96,
    month: "August 2026",
};

export const MOCK_LEAVE_REQUESTS = [
    { id: 1, name: "Kavya Suresh", role: "English", days: 2, from: "Aug 12" },
    { id: 2, name: "Manoj Pillai", role: "Chemistry", days: 1, from: "Aug 13" },
    { id: 3, name: "Sneha Das", role: "Admin", days: 3, from: "Aug 14" },
];

export const MOCK_TRANSPORT = {
    vehiclesRunning: 14,
    vehiclesTotal: 16,
    routesActive: 12,
    studentsMapped: 486,
    studentsTotal: 497,
    docsExpiring: 3,
    routesNoDriver: 1,
};

export const MOCK_DOC_EXPIRY = [
    { id: 1, vehicle: "KL-07-AB-1234", doc: "Insurance", days: 8 },
    { id: 2, vehicle: "KL-07-CD-5678", doc: "Fitness Certificate", days: 19 },
    { id: 3, vehicle: "KL-07-EF-9012", doc: "Permit", days: 27 },
];

export const MOCK_APPROVAL_QUEUE = [
    { type: "News", count: 2, color: "#A749CC" },
    { type: "Circulars", count: 3, color: "#7DC353" },
    { type: "Messages", count: 1, color: "#ED9146" },
    { type: "Homework", count: 2, color: "#E10052" },
    { type: "Student Leave", count: 1, color: "#3457D5" },
];

export const MOCK_MY_WORK = {
    drafts: 5,
    awaitingApproval: 3,
    workDone: 28,
};

export const MOCK_EVENTS = [
    { id: 1, name: "Independence Day Celebration", date: "Aug 15", tag: "Holiday" },
    { id: 2, name: "Parent Teacher Meeting", date: "Aug 22", tag: "Meeting" },
    { id: 3, name: "Science Exhibition", date: "Aug 28", tag: "Event" },
];

export const MOCK_BIRTHDAYS = [
    { id: 1, name: "Ananya Reddy", detail: "Grade 8-B", type: "Student" },
    { id: 2, name: "Kabir Menon", detail: "Grade 6-A", type: "Student" },
    { id: 3, name: "Latha Raman", detail: "Science Teacher", type: "Staff" },
];

export const MOCK_NEWS = [
    { id: 1, title: "Annual Sports Day announced", posted: "2 hours ago", kind: "News" },
    { id: 2, title: "Revised bus timings from Monday", posted: "Yesterday", kind: "Circular" },
    { id: 3, title: "Term 2 fee window is now open", posted: "2 days ago", kind: "Circular" },
    { id: 4, title: "Science exhibition registrations", posted: "3 days ago", kind: "News" },
];

export const MOCK_MY_ACTIONS = [
    { id: 1, label: "Mark attendance for Grade 9-C", due: "Today", severity: "critical", path: "/dashboardmenu/attendance" },
    { id: 2, label: "Marks entry pending for Mid Term", due: "Today", severity: "warning", path: "/dashboardmenu/marks" },
    { id: 3, label: "2 circulars awaiting your approval", due: "2 days left", severity: "info", path: "/dashboardmenu/approvals" },
];

/*
DASHBOARD_API_CONTRACT

GET /Dashboard/Overview?academicYear=&rollNumber=&userType=

The server should return only the blocks the caller has permission for, so
access is enforced once on the server instead of in every widget:

{
  alerts:      [{ key, count, label, severity }],
  kpis:        { students, staff, studentAttendance, staffAttendance,
                 feeCollected, feeOutstanding, pendingApprovals },
  attendance:  { trend[], gradeWise[], unmarkedClasses[], staffOnLeave[] },
  academics:   { upcomingExams[], marksEntry[], homeworkToday,
                 homeworkPending, materialsThisWeek, quizzesActive, quizAverage },
  finance:     { trend[], split[], gradeCollection[], transactions[] },
  staff:       { payroll{}, leaveRequests[] },
  transport:   { summary{}, docExpiry[] },
  operations:  { approvalQueue[], myWork{} },
  communication: { news[], events[], birthdays[] },
  myActions:   [{ label, due, severity, path }]
}
*/

export const MOCK_MY_SCHEDULE = [
    { id: 1, period: "1", time: "09:00 - 09:45", grade: "Grade 9-C", subject: "Mathematics", room: "Room 12", attendanceMarked: true },
    { id: 2, period: "2", time: "09:45 - 10:30", grade: "Grade 8-B", subject: "Mathematics", room: "Room 08", attendanceMarked: true },
    { id: 3, period: "4", time: "11:30 - 12:15", grade: "Grade 10-A", subject: "Mathematics", room: "Room 15", attendanceMarked: false, current: true },
    { id: 4, period: "6", time: "13:45 - 14:30", grade: "Grade 7-A", subject: "Mathematics", room: "Room 04", attendanceMarked: false },
    { id: 5, period: "7", time: "14:30 - 15:15", grade: "Grade 9-C", subject: "Remedial", room: "Lab 2", attendanceMarked: false },
];

export const MOCK_MY_ATTENDANCE = {
    month: "August 2026",
    workingDays: 22,
    present: 18,
    absent: 1,
    late: 2,
    halfDay: 1,
    percent: 91,
};

export const MOCK_MY_LEAVE_BALANCE = [
    { type: "Casual Leave", used: 6, total: 12 },
    { type: "Sick Leave", used: 4, total: 8 },
    { type: "Earned Leave", used: 2, total: 5 },
];

export const MOCK_MY_LEAVE_REQUESTS = [
    { id: 1, type: "Casual Leave", from: "28 Aug", to: "29 Aug", days: 2, status: "Pending", applied: "2 days ago" },
    { id: 2, type: "Sick Leave", from: "12 Aug", to: "12 Aug", days: 1, status: "Approved", applied: "12 days ago" },
    { id: 3, type: "Casual Leave", from: "02 Aug", to: "03 Aug", days: 2, status: "Rejected", applied: "22 days ago" },
];

export const MOCK_MY_SUBMISSIONS = [
    { id: 1, title: "Grade 10 revision timetable", kind: "Circular", status: "Pending", when: "Today" },
    { id: 2, title: "Maths olympiad results", kind: "News", status: "Approved", when: "Yesterday" },
    { id: 3, title: "Unit Test 2 question paper", kind: "Study Material", status: "Rejected", when: "3 days ago" },
];

export const MOCK_MY_HOMEWORK = {
    assignedToday: 3,
    thisWeek: 11,
    dueTomorrow: 2,
    classesCovered: 4,
};

export const MOCK_MY_PAYSLIP = {
    month: "July 2026",
    net: "48,600",
    status: "Credited",
    creditedOn: "31 Jul 2026",
};
