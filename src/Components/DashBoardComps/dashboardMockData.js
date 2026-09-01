/* Placeholder data for the dashboard bands that still have no endpoint.

   The bands that DO have one - master KPIs, needs-attention, attendance and
   academics, plus the common dashboard's headline, attendance/leave, work and
   forMe - read from masterDashboard/* and commonDashboard/* through
   dashboardApi.js, and their placeholders have been deleted. Everything left
   here renders behind a "Sample" tag so nobody mistakes it for live data;
   delete each export as its endpoint lands. */

export const MOCK_MARKS_ENTRY = [
    { exam: "Unit Test 1", entered: 18, total: 22 },
    { exam: "Mid Term", entered: 9, total: 22 },
    { exam: "Practical", entered: 21, total: 22 },
];

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

export const MOCK_MY_SCHEDULE = [
    { id: 1, period: "1", time: "09:00 - 09:45", grade: "Grade 9-C", subject: "Mathematics", room: "Room 12", attendanceMarked: true },
    { id: 2, period: "2", time: "09:45 - 10:30", grade: "Grade 8-B", subject: "Mathematics", room: "Room 08", attendanceMarked: true },
    { id: 3, period: "4", time: "11:30 - 12:15", grade: "Grade 10-A", subject: "Mathematics", room: "Room 15", attendanceMarked: false, current: true },
    { id: 4, period: "6", time: "13:45 - 14:30", grade: "Grade 7-A", subject: "Mathematics", room: "Room 04", attendanceMarked: false },
    { id: 5, period: "7", time: "14:30 - 15:15", grade: "Grade 9-C", subject: "Remedial", room: "Lab 2", attendanceMarked: false },
];
