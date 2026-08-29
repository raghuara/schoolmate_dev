import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box,
    Typography,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    MenuItem,
    Menu,
    Chip,
    Avatar,
    Grid,
    Switch,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogContent,
    DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import AddIcon from "@mui/icons-material/Add";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FreeBreakfastOutlinedIcon from "@mui/icons-material/FreeBreakfastOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import GroupsIcon from "@mui/icons-material/Groups";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import BoltIcon from "@mui/icons-material/Bolt";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import SubjectIcon from "@mui/icons-material/Subject";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ApplyLeavePage from "./ApplyLeavePage";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ManageHistoryOutlinedIcon from "@mui/icons-material/ManageHistoryOutlined";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSubMenuPermissions } from "../../Redux/Slices/AuthSlice";

import SnackBar from "../SnackBar";
import { fetchLeaveTypes } from "./leavePolicyApi";
import {
    fetchApprovalDashboard,
    fetchMyLeaveStatus,
    updateLeaveAction,
    fetchAttendanceOverview,
    fetchTeachersAttendance,
    fetchAttendanceRoster,
    postManualAttendance,
    fetchLeaveReport,
    fetchMyAttendanceStatus,
    fetchLeaveFullReport,
    fetchAttendanceAudit,
    fetchAttendanceLeaveSummary,
    REPORT_CATEGORIES,
    REPORT_ATTENDANCE_STATUSES,
} from "./leaveAttendanceApi";

/* ───────────────────────── Theme tokens ───────────────────────── */
export const GREEN = { main: "#059669", dark: "#047857", bg: "#ECFDF5", border: "#A7F3D0" };
export const RED = { main: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
export const AMBER = { main: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
export const BLUE = { main: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" };
export const INDIGO = { main: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE" };
const PURPLE = { main: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
/* Deliberately grey. "Not marked" is the absence of a judgement, not a bad outcome, so it
   must not read like the red ABSENT card sitting next to it. */
const SLATE_TONE = { main: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" };

const PAGE_BG = "#F7F9F9";

/* Status chip styling shared by the attendance tables */
const STATUS_STYLE = {
    Present: { color: GREEN.main, bg: GREEN.bg, border: GREEN.border },
    Late: { color: AMBER.main, bg: AMBER.bg, border: AMBER.border },
    Absent: { color: RED.main, bg: RED.bg, border: RED.border },
    "On Leave": { color: BLUE.main, bg: BLUE.bg, border: BLUE.border },
};

const ACADEMIC_YEARS = ["2026-2027", "2025-2026", "2024-2025"];

// "needs" names the permission key from the leaveandattendanceattendanceaccess
// sub menu. Today's Attendance rides along with Add Attendance - whoever marks
// attendance has to be able to see what was marked. Leave Management has no
// "needs" because everyone can reach it; its inner views are gated separately.
const TABS = [
    { key: "dashboard", label: "Dashboard", icon: SpaceDashboardOutlinedIcon, needs: "allowdashboardview" },
    { key: "add", label: "Add Attendance", icon: PersonAddAltIcon, needs: "allowaddattendance" },
    { key: "today", label: "Today's Attendance", icon: CalendarMonthOutlinedIcon, needs: "allowaddattendance" },
    { key: "overview", label: "Overview", icon: VisibilityOutlinedIcon, needs: "allowoverview" },
    { key: "leave", label: "Leave Management", icon: ListAltOutlinedIcon },
    { key: "reports", label: "Reports", icon: BarChartOutlinedIcon, needs: "allowreports" },
];


const TOTAL_STAFF = 32;

/* ── Staff directory used by the manual-entry screen ──
   Expected from API: GetStaffList. Generated deterministically so the list is
   stable across renders — no random ids. */
export const ROLE_STYLE = {
    "Teaching Staff": { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    "Non Teaching Staff": { color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" },
};

const ROLE_FILTERS = ["All Roles", "Teacher", "Non Teaching", "Support Staff"];

const FIRST_NAMES = [
    "Sneha", "Karthik", "Meera", "Arjun", "Divya", "Rahul", "Lakshmi", "Vikram",
    "Anita", "Suresh", "Pooja", "Imran", "Kavya", "Manoj", "Deepa", "Faisal",
    "Harini", "Gopal", "Rekha", "Vinod",
];
const LAST_NAMES = [
    "Reddy", "Verma", "Nair", "Iyer", "Sharma", "Menon", "Rao", "Gupta",
    "Pillai", "Shetty", "Desai", "Joshi", "Kumar", "George", "Bhat",
];

const buildStaffDirectory = () => {
    const list = [{ id: 1, name: "Sneha Reddy", empId: "102733", category: "Teacher" }];
    // 112 teachers in total, then support categories — 165 staff overall
    for (let i = 1; i < 165; i += 1) {
        const category = i < 112 ? "Teacher" : i < 142 ? "Non Teaching" : "Support Staff";
        list.push({
            id: i + 1,
            name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 7) % LAST_NAMES.length]}`,
            empId: String(100000 + ((i * 3697) % 899999)),
            category,
        });
    }
    return list;
};

export const STAFF_DIRECTORY = buildStaffDirectory();

/* The roster route returns userType capitalised ("Teacher"); the request that fetches
   it uses lowercase ("teacher"). Comparing case-sensitively against either one is how
   every Teacher ended up chipped "Non Teaching Staff", so this folds the case. */
export const roleLabelOf = (category) =>
    String(category || "").trim().toLowerCase() === "teacher" ? "Teaching Staff" : "Non Teaching Staff";

const ATTENDANCE_STATUSES = ["Present", "Late", "Absent", "On Leave"];

/* One-click break presets offered on the Break In / Break Out panel */
const BREAK_PRESETS = [
    { label: "Morning Tea", out: "10:30", in: "10:45" },
    { label: "Lunch", out: "13:00", in: "13:45" },
    { label: "Evening Tea", out: "15:30", in: "15:45" },
];

/* Avatar tint is per person, so a long staff list stays scannable */
const AVATAR_COLORS = [
    { color: "#7C3AED", bg: "#F5F3FF" },
    { color: "#059669", bg: "#ECFDF5" },
    { color: "#EA580C", bg: "#FFF7ED" },
    { color: "#2563EB", bg: "#EFF6FF" },
    { color: "#DB2777", bg: "#FDF2F8" },
    { color: "#0891B2", bg: "#ECFEFF" },
];
/* Ids may be numbers or roll-number strings like "MAMS-550", so hash rather than
   modulo — a string would give NaN and index off the end of the palette. */
export const avatarToneOf = (staffId) => {
    const key = String(staffId ?? "");
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 100000;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const minutesBetween = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    return Number.isNaN(diff) || diff <= 0 ? 0 : diff;
};

const formatMinutes = (minutes) =>
    minutes >= 60 ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m` : `${minutes}m`;

const totalBreakMinutes = (breaks) =>
    (breaks || []).reduce((sum, item) => sum + minutesBetween(item.out, item.in), 0);

/* "09:15" + "17:45" → "8h 30m" */
const workingHoursBetween = (start, end) => {
    if (!start || !end) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    if (Number.isNaN(minutes) || minutes <= 0) return "";
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
};

const toTimeValue = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const toDateValue = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/* Leave rows come from getLeaveApprovalDashboard / leaveApprovalStatusCheck.
   Approver rows: { leaveApplicationId, forRollNumber, name, leaveType, fromDate, toDate,
   days, reason, appliedOn, status, rejectReason } — dates already dd-MM-yyyy.
   Leave types come from GetleaveTypes, plus "Loss of Pay" as a fixed extra option. */

/* Signed-in user — My Requests is filtered to them */
/* The signed-in user now comes from state.auth, not a constant */

// "All Requests" lists every staff member's application, so it needs
// allowleavedetails. Apply Leave and My Requests are personal - always available.
const LEAVE_VIEWS = [
    { key: "applications", label: "All Requests", icon: ListAltOutlinedIcon, needs: "allowleavedetails" },
    { key: "apply", label: "Apply Leave", icon: EventAvailableOutlinedIcon },
    { key: "my", label: "My Requests", icon: HistoryToggleOffIcon },
];

/* Leave dates arrive already formatted dd-MM-yyyy, so no client formatting is needed */

const LEAVE_STATUS_STYLE = {
    Pending: { color: AMBER.main, bg: AMBER.bg, border: AMBER.border },
    Approved: { color: GREEN.main, bg: GREEN.bg, border: GREEN.border },
    Rejected: { color: RED.main, bg: RED.bg, border: RED.border },
};

/* Cell marks keyed by the status strings the overview returns. An empty status means
   the day has no record and renders as a dash. `weekend` comes from the saved working
   calendar, not from Sat/Sun. */
const OVERVIEW_MARK = {
    present: { label: "P", color: GREEN.main, bg: GREEN.bg, border: GREEN.border },
    late: { label: "L", color: AMBER.main, bg: AMBER.bg, border: AMBER.border },
    absent: { label: "A", color: RED.main, bg: RED.bg, border: RED.border },
    onleave: { label: "LV", color: BLUE.main, bg: BLUE.bg, border: BLUE.border },
    on_leave: { label: "LV", color: BLUE.main, bg: BLUE.bg, border: BLUE.border },
    onduty: { label: "OD", color: INDIGO.main, bg: INDIGO.bg, border: INDIGO.border },
    halfday: { label: "HD", color: PURPLE.main, bg: PURPLE.bg, border: PURPLE.border },
    weekend: { label: "W", color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB" },
    unmarked: { label: "—", color: "#D1D5DB", bg: "#FFFFFF", border: "#F3F4F6" },
};

/* "18-08-2026" → "Tue" */
const weekdayOfApiDate = (value) => {
    const [day, month, year] = String(value || "").split("-");
    if (!day || !month || !year) return "";
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? "" : SHORT_WEEKDAYS[date.getDay()];
};

const USER_TYPES = ["All User Types", "Teacher", "Non Teaching", "Support Staff"];

/* The log grid uses one avatar colour for the whole list */
const LOG_AVATAR = "#3B4FE0";
/* Category now comes straight from the overview response */

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const addDays = (date, amount) => {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
};


/* Report date-range presets — each resolves to a concrete from/to pair */
const REPORT_PRESETS = ["Today", "Yesterday", "Last 7 Days", "This Month", "Last 30 Days", "Last Month"];

/* Cell colours for the full report's calendar block and daily log. Keys are the
   lowercased status strings the reports API returns. */
const REPORT_DAY_STYLE = {
    present: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    late: { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
    absent: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    leave: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    onleave: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    "on leave": { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    halfday: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    onduty: { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
    holiday: { color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
    weekend: { color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
    unmarked: { color: "#9CA3AF", bg: "#fff", border: "#E5E7EB" },
    notmarked: { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
    "not marked": { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
};
const reportDayStyle = (status) =>
    REPORT_DAY_STYLE[String(status || "").toLowerCase()] || REPORT_DAY_STYLE.unmarked;

const ddmmyyyy = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
};

/* 23415 → "06:30:15" */
const formatHms = (totalSeconds) => {
    const s = Math.max(0, Math.floor(totalSeconds || 0));
    const pad2 = (n) => String(n).padStart(2, "0");
    return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
};

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const formatLongDate = (date) =>
    `${WEEKDAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

export const initialsOf = (name) =>
    String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

export const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13.5px", bgcolor: "#fff" },
};

/* ───────────────────────── Building blocks ───────────────────────── */

/* White panel with a title row */
function Panel({ title, icon: Icon, tone, action, children, dense }) {
    return (
        <Box
            sx={{
                bgcolor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                p: dense ? 1.8 : 2.2,
                height: "100%",
                boxSizing: "border-box",
            }}
        >
            {title && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        flexWrap: "wrap",
                        mb: 1.8,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                        {Icon && (
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "8px",
                                    bgcolor: tone?.bg || GREEN.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Icon sx={{ fontSize: "18px", color: tone?.main || GREEN.main }} />
                            </Box>
                        )}
                        <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>{title}</Typography>
                    </Box>
                    {action}
                </Box>
            )}
            {children}
        </Box>
    );
}

/* Small labelled figure used in the session strip */
function MiniStat({ icon: Icon, label, value, tone }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                px: 1.8,
                py: 1.4,
                borderRadius: "10px",
                bgcolor: tone.bg,
                border: `1px solid ${tone.border}`,
                flex: 1,
                minWidth: "180px",
                boxSizing: "border-box",
            }}
        >
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ fontSize: "18px", color: tone.main }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    sx={{ fontSize: "10.5px", fontWeight: "700", color: tone.main, letterSpacing: "0.6px" }}
                >
                    {label}
                </Typography>
                <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

/* Status pill shared by both attendance tables */
function StatusChip({ status }) {
    const cfg = STATUS_STYLE[status] || STATUS_STYLE.Present;
    return (
        <Chip
            label={status}
            size="small"
            sx={{
                bgcolor: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                fontWeight: "700",
                fontSize: "11px",
            }}
        />
    );
}

/* ───────────────────────── Page ───────────────────────── */

export default function LeaveAttendancePage() {
    const navigate = useNavigate();
    const [today] = useState(() => new Date());
    const [tab, setTab] = useState("dashboard");
    const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0]);
    const [search, setSearch] = useState("");
    const [todayRole, setTodayRole] = useState("All Roles");
    const [todayStatus, setTodayStatus] = useState("All Status");
    // ─── Overview tab ───
    const [overviewSearch, setOverviewSearch] = useState("");
    const [overviewType, setOverviewType] = useState("All User Types");
    const [overviewRange, setOverviewRange] = useState("7");
    const [overviewFrom, setOverviewFrom] = useState("");
    const [overviewTo, setOverviewTo] = useState("");
    // Server-built matrix: headers, per-staff day cells and the summary cards
    const [overview, setOverview] = useState({ cards: null, dateHeaders: [], details: [] });
    const [loadingOverview, setLoadingOverview] = useState(false);
    // ─── Leave Management tab ───
    const [leaveView, setLeaveView] = useState("applications");

    const [leaveFilter, setLeaveFilter] = useState("All Leaves");
    const [leaveSearch, setLeaveSearch] = useState("");
    const [leaveType, setLeaveType] = useState("All Types");
    // Filled from getLeaveApprovalDashboard
    const [leaveRequests, setLeaveRequests] = useState([]);
    // ─── Reports tab ───
    const [reportPreset, setReportPreset] = useState("Today");
    const [reportFrom, setReportFrom] = useState(() => toDateValue(new Date()));
    const [reportTo, setReportTo] = useState(() => toDateValue(new Date()));
    const [reportSearch, setReportSearch] = useState("");
    // Both hold API values, not labels: "All" | teaching | nonteaching | supporting,
    // and "" | present | late | absent | leave.
    const [reportCategory, setReportCategory] = useState("All");
    const [reportStatus, setReportStatus] = useState("");
    // Range cards + one summary row per staff member, straight from reportsLeaveManagement
    const [report, setReport] = useState({ cards: null, summary: [], totals: null });


    const [loadingReport, setLoadingReport] = useState(false);
    // The summary row whose "View" was clicked, and the per-person report it loads
    const [reportViewStaff, setReportViewStaff] = useState(null);
    const [fullReport, setFullReport] = useState(null);
    const [loadingFullReport, setLoadingFullReport] = useState(false);
    // GetUserAttendanceLeaveSummary for the same person and range, shown beside it
    const [personSummary, setPersonSummary] = useState(null);

    // ─── Attendance audit trail ───
    // { rollNumber, name, date } while open; entries come from GetTeachersAttendanceAudit
    const [auditFor, setAuditFor] = useState(null);
    const [auditEntries, setAuditEntries] = useState([]);
    const [auditNote, setAuditNote] = useState("");
    const [loadingAudit, setLoadingAudit] = useState(false);

    const applyReportPreset = (preset) => {
        const end = new Date(today);
        let start = new Date(today);
        if (preset === "Yesterday") {
            start = addDays(today, -1);
            end.setDate(end.getDate() - 1);
        } else if (preset === "Last 7 Days") {
            start = addDays(today, -6);
        } else if (preset === "This Month") {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (preset === "Last 30 Days") {
            start = addDays(today, -29);
        } else if (preset === "Last Month") {
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
            end.setTime(lastDay.getTime());
        }
        setReportPreset(preset);
        setReportFrom(toDateValue(start));
        setReportTo(toDateValue(end));
    };

    // ─── Leave ↔ api/leave ───
    // academicYear comes from the header select, so the calls follow whatever is chosen there
    const authUser = useSelector((state) => state.auth);

    // ── RBAC ──────────────────────────────────────────────────────────────────
    const attendancePerms = useSelector(selectSubMenuPermissions("leaveandpayroll", "leaveandattendanceattendanceaccess"));
    const leaveMgmtPerms = useSelector(selectSubMenuPermissions("leaveandpayroll", "leaveandattendanceleavemanagement"));

    const canAddAttendance = attendancePerms?.allowaddattendance === "Y";

    const visibleTabs = useMemo(
        () => TABS.filter((t) => !t.needs || attendancePerms?.[t.needs] === "Y"),
        [attendancePerms]
    );
    const visibleLeaveViews = useMemo(
        () => LEAVE_VIEWS.filter((v) => !v.needs || leaveMgmtPerms?.[v.needs] === "Y"),
        [leaveMgmtPerms]
    );

    // Permissions come from the login response, so the default may only become
    // invalid once they resolve - fall back instead of rendering a blank pane.
    useEffect(() => {
        if (visibleTabs.length && !visibleTabs.some((t) => t.key === tab)) {
            setTab(visibleTabs[0].key);
        }
    }, [visibleTabs, tab]);

    useEffect(() => {
        if (visibleLeaveViews.length && !visibleLeaveViews.some((v) => v.key === leaveView)) {
            setLeaveView(visibleLeaveViews[0].key);
        }
    }, [visibleLeaveViews, leaveView]);

    /* The signed-in person's own status for today, behind the dashboard strip. */
    const [myStatus, setMyStatus] = useState(null);
    /* Seconds elapsed since the last successful fetch, so an open punch keeps counting
       between polls rather than freezing for a minute at a time. */
    const [tickSeconds, setTickSeconds] = useState(0);

    /* Server minutes plus the seconds ticked since that reading, so an open punch keeps
       moving between the 60s polls. null when nothing was ever punched — the strip renders
       a dash for that rather than a zero. */
    /* A half-day leave keeps the tiles: they worked half the day, so the figures mean
       something. A full day of approved leave usually has no attendance row at all. */
    const onFullDayLeave =
        Boolean(myStatus?.isOnApprovedLeave) && myStatus?.approvedLeaveIsHalfDay !== true;
    const hideMyTiles = onFullDayLeave;

    const myStatusLabel = myStatus?.isOnApprovedLeave
        ? myStatus.approvedLeaveIsHalfDay
            ? "Half Day Leave"
            : "On Leave"
        : myStatus?.status || "Not Marked";

    const myStatusTone = reportDayStyle(String(myStatusLabel).toLowerCase().replace(/\s+/g, ""));

    const todayLabel = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const myWorked =
        myStatus && myStatus.loginTime
            ? myStatus.workedMinutes * 60 + (myStatus.isClockedIn ? tickSeconds : 0)
            : null;

    const loadMyStatus = useCallback(async () => {
        if (!authUser?.rollNumber) return;
        const result = await fetchMyAttendanceStatus({ rollNumber: authUser.rollNumber });
        // A failure here should not shout — the strip simply falls back to dashes
        setMyStatus(result.ok ? result : null);
        setTickSeconds(0);
    }, [authUser?.rollNumber]);

    useEffect(() => {
        loadMyStatus();
        /* Polled because workedMinutes counts up to NOW for an open punch. Paused while the
           tab is hidden so a backgrounded dashboard is not calling all day. */
        const poll = setInterval(() => {
            if (document.visibilityState === "visible") loadMyStatus();
        }, 60000);
        return () => clearInterval(poll);
    }, [loadMyStatus]);

    useEffect(() => {
        if (!myStatus?.isClockedIn) return undefined;
        const tick = setInterval(() => setTickSeconds((s) => s + 1), 1000);
        return () => clearInterval(tick);
    }, [myStatus?.isClockedIn]);

    const [snack, setSnack] = useState({ open: false, message: "", ok: true });
    const showSnack = (message, ok = true) => setSnack({ open: true, message, ok });

    // cards carry the full counts even when a filter narrows the lists
    const [leaveCards, setLeaveCards] = useState({ pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
    const [loadingLeave, setLoadingLeave] = useState(false);
    const [actioningId, setActioningId] = useState(null);
    const [declineFor, setDeclineFor] = useState(null);
    const [declineReason, setDeclineReason] = useState("");
    // { id, name } pairs — LeaveTypeId and LeaveType must agree on apply
    const [availableTypes, setAvailableTypes] = useState([]);

    const loadLeaveTypesForApply = useCallback(async () => {
        const result = await fetchLeaveTypes(academicYear);
        if (result.ok) setAvailableTypes(result.items);
    }, [academicYear]);

    const loadApprovalQueue = useCallback(async () => {
        if (!authUser?.rollNumber) return;
        setLoadingLeave(true);
        const status = leaveFilter === "All Leaves" ? undefined : leaveFilter.toLowerCase();
        const result = await fetchApprovalDashboard({
            rollNumber: authUser.rollNumber,
            academicYear,
            status,
        });
        if (!result.ok) {
            showSnack(result.message, false);
        } else {
            setLeaveCards(result.cards);
            // Status comes from which list the row arrived in, not a field
            setLeaveRequests([
                ...result.pending.map((row) => ({ ...row, status: "Pending" })),
                ...result.approved.map((row) => ({ ...row, status: "Approved" })),
                ...result.rejected.map((row) => ({ ...row, status: "Rejected" })),
            ]);
        }
        setLoadingLeave(false);
    }, [authUser?.rollNumber, academicYear, leaveFilter]);

    const loadMyRequests = useCallback(async () => {
        if (!authUser?.rollNumber) return;
        setLoadingLeave(true);
        const result = await fetchMyLeaveStatus({ rollNumber: authUser.rollNumber, academicYear });
        if (!result.ok) showSnack(result.message, false);
        else setMyLeaves(result.leaves);
        setLoadingLeave(false);
    }, [authUser?.rollNumber, academicYear]);

    const [myLeaves, setMyLeaves] = useState([]);

    useEffect(() => {
        if (tab !== "leave") return;
        loadLeaveTypesForApply();
        if (leaveView === "my") loadMyRequests();
        else loadApprovalQueue();
    }, [tab, leaveView, loadLeaveTypesForApply, loadMyRequests, loadApprovalQueue]);

    // ─── Today's Attendance ↔ GetTeachersAttendance ───
    const [loadingRecords, setLoadingRecords] = useState(false);

    const loadTodayAttendance = useCallback(async () => {
        const day = toDateValue(today);
        setLoadingRecords(true);
        const result = await fetchTeachersAttendance({ academicYear, fromDate: day, toDate: day });
        if (!result.ok) {
            /* Clear rather than leave the previous day's rows standing under today's date —
               stale data reads as current, which is worse than an empty state. */
            setRecords([]);
            showSnack(result.message, false);
        } else {
            setRecords(result.rows);
        }
        setLoadingRecords(false);
    }, [academicYear, today]);

    useEffect(() => {
        if (tab === "today" || tab === "dashboard") loadTodayAttendance();
    }, [tab, loadTodayAttendance]);


    // ─── Overview ↔ api/teachersattendance ───
    const overviewWindow = useCallback(() => {
        if (overviewRange === "custom" && overviewFrom && overviewTo) {
            return { from: overviewFrom, to: overviewTo };
        }
        const length = overviewRange === "15" ? 15 : 7;
        return { from: toDateValue(addDays(today, -(length - 1))), to: toDateValue(today) };
    }, [overviewRange, overviewFrom, overviewTo, today]);

    const loadOverview = useCallback(async () => {
        const { from, to } = overviewWindow();
        if (!from || !to) return;
        setLoadingOverview(true);
        const result = await fetchAttendanceOverview({
            academicYear,
            fromDate: from,
            toDate: to,
            // "All User Types" means send nothing rather than a literal
            userType: overviewType === "All User Types" ? undefined : overviewType.toLowerCase(),
        });
        if (!result.ok) showSnack(result.message, false);
        else setOverview({ cards: result.cards, dateHeaders: result.dateHeaders, details: result.details });
        setLoadingOverview(false);
    }, [academicYear, overviewType, overviewWindow]);

    useEffect(() => {
        if (tab === "overview") loadOverview();
    }, [tab, loadOverview]);

    // ─── Reports ↔ api/reports ───
    const loadReport = useCallback(async () => {
        if (!reportFrom || !reportTo) return;
        setLoadingReport(true);
        const result = await fetchLeaveReport({
            fromDate: reportFrom,
            toDate: reportTo,
            category: reportCategory,
            attendanceStatus: reportStatus,
            // clamps the range into the year's window and reports when it did
            academicYear,
        });
        if (!result.ok) {
            showSnack(result.message, false);
            setReport({ cards: null, summary: [], totals: null });
        } else {
            setReport({
                cards: result.cards,
                summary: result.summary,
                /* Per the working calendar, not the calendar span — and elapsed vs upcoming,
                   because days that have not happened are no longer counted as absences. */
                totals: {
                    workingDays: result.workingDays,
                    holidayDays: result.holidayDays,
                    elapsedWorkingDays: result.elapsedWorkingDays,
                    upcomingDays: result.upcomingDays,
                    clamped: result.clampedToAcademicYear,
                    academicYear: result.academicYear,
                },
            });
        }
        setLoadingReport(false);
    }, [reportFrom, reportTo, reportCategory, reportStatus, academicYear]);

    useEffect(() => {
        if (tab === "reports") loadReport();
    }, [tab, loadReport]);

    /* The per-person view pulls two independent reads for the same window: the full
       report (calendar + daily log) and the attendance/leave summary. The summary is
       best-effort — it needs the roll number to exist in `users`, which a register row
       does not guarantee, so a failure there leaves the panel out instead of erroring. */
    const openFullReport = async (row) => {
        setReportViewStaff(row);
        setFullReport(null);
        setPersonSummary(null);
        setLoadingFullReport(true);

        const [detail, summary] = await Promise.all([
            fetchLeaveFullReport({ rollNumber: row.rollNumber, fromDate: reportFrom, toDate: reportTo }),
            fetchAttendanceLeaveSummary({
                rollNumber: row.rollNumber,
                academicYear,
                fromDate: reportFrom,
                toDate: reportTo,
            }),
        ]);

        if (detail.ok) setFullReport(detail);
        else showSnack(detail.message, false);
        if (summary.ok) setPersonSummary(summary);
        setLoadingFullReport(false);
    };

    /* Downloads exactly what the register returned — every column the API sends,
       including the ones the table abbreviates. */
    const exportReportCsv = () => {
        const headers = [
            "S.No", "Staff Member", "Roll Number", "Biometric ID", "Category",
            "Working Days", "Present", "Late", "Absent", "Leave", "Attendance %",
        ];
        const escape = (value) => {
            const text = String(value ?? "");
            return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        };
        const lines = [
            headers.join(","),
            ...report.summary.map((row) =>
                [
                    row.sNo, row.staffMember, row.rollNumber, row.biometricId ?? "", row.category,
                    row.workingDays, row.present, row.late, row.absent, row.leave, row.attendancePercent,
                ]
                    .map(escape)
                    .join(",")
            ),
        ];
        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `attendance-report-${reportFrom}-to-${reportTo}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // ─── Audit trail ↔ GetTeachersAttendanceAudit ───
    /* A day nobody has edited answers 404, which the api layer turns into an empty list
       plus the server's own wording — shown as a note rather than as an error. */
    const openAudit = async ({ rollNumber, name, date }) => {
        setAuditFor({ rollNumber, name, date });
        setAuditEntries([]);
        setAuditNote("");
        setLoadingAudit(true);
        const result = await fetchAttendanceAudit({ rollNumber, date });
        if (!result.ok) {
            showSnack(result.message, false);
            setAuditFor(null);
        } else {
            setAuditEntries(result.entries);
            setAuditNote(result.entries.length ? "" : result.message || "No changes recorded for this day.");
        }
        setLoadingAudit(false);
    };

    const actOnLeave = async (row, action, reason = "") => {
        setActioningId(row.leaveApplicationId);
        const result = await updateLeaveAction({
            leaveApplicationId: row.leaveApplicationId,
            rollNumber: authUser.rollNumber,
            action,
            reason,
            academicYear,
        });
        showSnack(result.message, result.ok);
        setActioningId(null);
        if (result.ok) {
            setDeclineFor(null);
            setDeclineReason("");
            loadApprovalQueue();
        }
    };
    const [records, setRecords] = useState([]);

    // ─── Manual entry (Add Attendance tab) ───
    const [entryDate, setEntryDate] = useState(() => toDateValue(new Date()));
    const [entryRole, setEntryRole] = useState("Teacher");
    const [entrySearch, setEntrySearch] = useState("");
    const [entryPanel, setEntryPanel] = useState("punch"); // punch | break
    // Recorded on every audit row the save creates
    const [entryReason, setEntryReason] = useState("");

    // ─── Add Attendance ↔ roster + manual post ───
    const [roster, setRoster] = useState([]);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    // The roster route needs a concrete UserType, so the role filter maps onto it
    const rosterUserType = entryRole === "Teacher" ? "teacher" : entryRole === "Support Staff" ? "admin" : "staff";

    const loadRoster = useCallback(async () => {
        setLoadingRoster(true);
        const result = await fetchAttendanceRoster({ academicYear, userType: rosterUserType });
        if (!result.ok) showSnack(result.message, false);
        else setRoster(result.staff);
        setLoadingRoster(false);
    }, [academicYear, rosterUserType]);

    useEffect(() => {
        if (tab === "add") loadRoster();
    }, [tab, loadRoster]);

    /* Who already has attendance on the chosen date.
       GetAttendanceTeacherBefore is a roster, not a status read — it returns `status` and
       `dateTime` blank for everyone — so the roster alone cannot tell a marked person from
       an unmarked one and offers to mark them again. Saving over them does not duplicate
       (the API upserts on roll number + date) but it silently overwrites, so the day's
       records are read separately and those rows are flagged. */
    const [markedOnDate, setMarkedOnDate] = useState({});

    const loadMarkedOnDate = useCallback(async () => {
        if (!entryDate) return;
        const result = await fetchTeachersAttendance({
            academicYear,
            fromDate: entryDate,
            toDate: entryDate,
        });
        // A failure here must not block marking — the flag is an aid, not a gate
        if (!result.ok) {
            setMarkedOnDate({});
            return;
        }
        const map = {};
        (result.rows || []).forEach((row) => {
            if (row.rollNumber) map[row.rollNumber] = row;
        });
        setMarkedOnDate(map);
    }, [academicYear, entryDate]);

    useEffect(() => {
        if (tab === "add") loadMarkedOnDate();
    }, [tab, loadMarkedOnDate]);
    const [sameTimeForAll, setSameTimeForAll] = useState(false);
    const [sharedTimes, setSharedTimes] = useState({ checkIn: "", checkOut: "" });
    const [bulkAnchor, setBulkAnchor] = useState(null);
    const [noteFor, setNoteFor] = useState(null);
    // Keyed by staff id — only rows the user has touched appear here
    const [entries, setEntries] = useState({});

    const entryOf = (staffId) =>
        entries[staffId] || { status: "", checkIn: "", checkOut: "", breaks: [], note: "" };

    const patchEntry = (staffId, patch) =>
        setEntries((prev) => ({ ...prev, [staffId]: { ...entryOf(staffId), ...patch } }));

    // ─── Break helpers ───
    const addBreak = (staffId, preset) => {
        const list = entryOf(staffId).breaks;
        const nextId = list.length ? Math.max(...list.map((b) => b.id)) + 1 : 1;
        patchEntry(staffId, {
            breaks: [...list, { id: nextId, out: preset?.out || "", in: preset?.in || "" }],
        });
    };

    const updateBreak = (staffId, breakId, field, value) =>
        patchEntry(staffId, {
            breaks: entryOf(staffId).breaks.map((item) =>
                item.id === breakId ? { ...item, [field]: value } : item
            ),
        });

    const removeBreak = (staffId, breakId) =>
        patchEntry(staffId, { breaks: entryOf(staffId).breaks.filter((item) => item.id !== breakId) });

    // The roster is already scoped by UserType server-side; search filters what came back.
    // `id` keys the local edit state and is the roll number, since that is what the API keys on.
    const entryStaff = roster
        .map((row) => ({
            id: row.rollNumber,
            rollNumber: row.rollNumber,
            name: row.name,
            employeeId: row.biometricId || row.BiometricId || "",
            category: row.userType || row.UserType || "",
        }))
        .filter((row) => {
            const term = entrySearch.trim().toLowerCase();
            if (!term) return true;
            return row.name.toLowerCase().includes(term) || String(row.rollNumber).toLowerCase().includes(term);
        });

    const entryCountOf = (status) =>
        entryStaff.filter((row) => entryOf(row.id).status === status).length;

    const punchedCount = entryStaff.filter((row) => {
        const value = entryOf(row.id);
        return Boolean(value.checkIn || value.checkOut);
    }).length;

    const breakCount = entryStaff.filter((row) => entryOf(row.id).breaks.length > 0).length;

    const applyBulkStatus = (status) => {
        setEntries((prev) => {
            const updated = { ...prev };
            entryStaff.forEach((row) => {
                updated[row.id] = { ...entryOf(row.id), status };
            });
            return updated;
        });
        setBulkAnchor(null);
    };

    const clearAllEntries = () => {
        setEntries({});
        setSharedTimes({ checkIn: "", checkOut: "" });
        setBulkAnchor(null);
    };

    const useCurrentTime = () => {
        const now = toTimeValue(new Date());
        if (sameTimeForAll) {
            setSharedTimes((prev) => ({ ...prev, checkIn: now }));
            return;
        }
        setEntries((prev) => {
            const updated = { ...prev };
            entryStaff.forEach((row) => {
                const current = entryOf(row.id);
                if (current.status === "Absent" || current.status === "On Leave") return;
                updated[row.id] = { ...current, checkIn: now };
            });
            return updated;
        });
    };

    // With "same time for all" on, every row reads from the shared fields
    const resolvedTime = (staffId, field) => (sameTimeForAll ? sharedTimes[field] : entryOf(staffId)[field]);

    const setResolvedTime = (staffId, field, value) => {
        if (sameTimeForAll) setSharedTimes((prev) => ({ ...prev, [field]: value }));
        else patchEntry(staffId, { [field]: value });
    };

    const saveManualAttendance = async () => {
        // A row with only a time and no status is still valid — the server keeps the
        // existing status when Status is omitted
        const touched = entryStaff.filter((row) => {
            const value = entryOf(row.id);
            return value.status || value.checkIn || value.checkOut || value.breaks?.length;
        });
        if (!touched.length) return;
        if (!authUser?.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }

        setSavingAttendance(true);
        const result = await postManualAttendance({
            editorRollNumber: authUser.rollNumber,
            date: entryDate,
            academicYear,
            reason: entryReason,
            items: touched.map((row) => {
                const value = entryOf(row.id);
                return {
                    rollNumber: row.rollNumber,
                    employeeId: row.employeeId,
                    status: value.status,
                    loginTime: resolvedTime(row.id, "checkIn"),
                    logoutTime: resolvedTime(row.id, "checkOut"),
                    breaks: value.breaks,
                };
            }),
        });

        if (result.ok) {
            // The response is per-item, so name anything the server skipped
            const failed = (result.results || []).filter((item) => item.ok === false);
            showSnack(
                failed.length
                    ? `${result.saved} saved, ${failed.length} skipped — ${failed[0].rollNumber}: ${failed[0].message}`
                    : result.message,
                !failed.length
            );
            if (!failed.length) {
                setEntries({});
                setTab("today");
            }
        } else {
            // Unassigned shift and payroll-locked months both land here, and both name
            // the fix in the message
            showSnack(result.message, false);
        }
        setSavingAttendance(false);
    };

    // KPI figures are derived from the records so they never drift apart
    const countOf = (status) => records.filter((r) => r.status === status).length;
    const kpis = [
        { label: "PRESENT", value: countOf("Present"), total: TOTAL_STAFF, icon: CheckCircleIcon, tone: GREEN },
        { label: "ABSENT", value: countOf("Absent"), icon: CancelIcon, tone: RED },
        { label: "LATE", value: countOf("Late"), icon: AccessTimeIcon, tone: AMBER },
        { label: "ON LEAVE", value: countOf("On Leave"), icon: EventAvailableIcon, tone: BLUE },
    ];

    const query = search.trim().toLowerCase();
    const filteredRecords = records.filter((row) =>
        !query
            ? true
            : [row.name, row.role, row.source, row.status].some((value) =>
                  String(value).toLowerCase().includes(query)
              )
    );

    // Shortcuts must never point at a tab this user cannot open.
    const quickNav = [
        { title: "Today's Attendance", desc: "Logins of all staff today", tone: BLUE, icon: CalendarMonthOutlinedIcon, target: "today" },
        { title: "Overview", desc: "Monthly attendance trends", tone: PURPLE, icon: VisibilityOutlinedIcon, target: "overview" },
        { title: "Leave Management", desc: "Requests waiting for approval", tone: GREEN, icon: ListAltOutlinedIcon, target: "leave" },
        { title: "Reports", desc: "Download attendance reports", tone: AMBER, icon: BarChartOutlinedIcon, target: "reports" },
    ].filter((c) => visibleTabs.some((t) => t.key === c.target));

    /* ─────────────── Attendance table (shared) ─────────────── */
    const renderAttendanceTable = () => (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: GREEN.bg }}>
                        {["S.NO", "STAFF MEMBER", "ROLE", "SOURCE", "CHECK-IN", "CHECK-OUT", "STATUS", "HISTORY"].map((head) => (
                            <TableCell
                                key={head}
                                sx={{
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    color: "#374151",
                                    letterSpacing: "0.5px",
                                    borderBottom: `1px solid ${GREEN.border}`,
                                    py: 1.4,
                                }}
                            >
                                {head}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredRecords.map((row, index) => (
                        <TableRow
                            key={row.id}
                            hover
                            sx={{ "&:nth-of-type(even)": { bgcolor: "#F9FAFB" } }}
                        >
                            <TableCell sx={{ fontSize: "13px", color: "#9CA3AF", py: 1.3 }}>{index + 1}</TableCell>
                            <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: BLUE.bg, color: BLUE.main }}>
                                        <PersonIcon sx={{ fontSize: "18px" }} />
                                    </Avatar>
                                    <Typography sx={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                                        {row.name}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={row.role}
                                    size="small"
                                    sx={{
                                        bgcolor: "#F0FDFA",
                                        color: "#0D9488",
                                        border: "1px solid #99F6E4",
                                        fontWeight: "600",
                                        fontSize: "11px",
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    icon={
                                        row.source === "Biometric" ? (
                                            <FingerprintIcon sx={{ fontSize: "14px !important", color: `${INDIGO.main} !important` }} />
                                        ) : undefined
                                    }
                                    label={row.source}
                                    size="small"
                                    sx={{
                                        bgcolor: INDIGO.bg,
                                        color: INDIGO.main,
                                        border: `1px solid ${INDIGO.border}`,
                                        fontWeight: "600",
                                        fontSize: "11px",
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                                {row.checkIn || "—"}
                            </TableCell>
                            <TableCell sx={{ fontSize: "13px", color: "#9CA3AF" }}>{row.checkOut || "—"}</TableCell>
                            <TableCell>
                                <StatusChip status={row.status} />
                            </TableCell>
                            <TableCell>
                                {/* Who changed this person-day, and what it was before */}
                                <Tooltip title="View change history" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            openAudit({
                                                rollNumber: row.rollNumber,
                                                name: row.name,
                                                date: row.date || toDateValue(today),
                                            })
                                        }
                                    >
                                        <ManageHistoryOutlinedIcon sx={{ fontSize: "17px", color: "#9CA3AF" }} />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {filteredRecords.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: "13px" }}>
                                {loadingRecords ? "Loading attendance…" : "No attendance records match your search"}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const searchAndExport = (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
            <TextField
                size="small"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                    ...inputSx,
                    minWidth: "220px",
                    "& .MuiOutlinedInput-root": { borderRadius: "50px", fontSize: "13.5px", bgcolor: "#fff" },
                }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                            </InputAdornment>
                        ),
                    },
                }}
            />
            <Button
                startIcon={<FileDownloadOutlinedIcon />}
                sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "600",
                    px: 2,
                    "&:hover": { bgcolor: "#F9FAFB" },
                }}
            >
                Export
            </Button>
        </Box>
    );

    /* ─────────────── Dashboard tab ─────────────── */
    const renderDashboard = () => (
        <>
            {/* ── Live session strip ── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    flexWrap: "wrap",
                    p: 2,
                    mb: 2,
                    borderRadius: "12px",
                    bgcolor: GREEN.bg,
                    border: `1px solid ${GREEN.border}`,
                }}
            >
                {/* Status + date, above everything else on the strip. */}
                <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
                    <Chip
                        size="small"
                        label={myStatusLabel}
                        sx={{
                            height: 24,
                            bgcolor: myStatusTone.bg,
                            color: myStatusTone.color,
                            border: `1px solid ${myStatusTone.border}`,
                            fontWeight: "700",
                            fontSize: "11.5px",
                        }}
                    />
                    <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                        {todayLabel}
                    </Typography>
                </Box>
                <Box sx={{ position: "relative" }}>
                    <Box
                        sx={{
                            width: 58,
                            height: 58,
                            borderRadius: "50%",
                            bgcolor: "#fff",
                            border: `2px solid ${GREEN.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography sx={{ fontSize: "17px", fontWeight: "700", color: GREEN.main }}>
                            {initialsOf(myStatus?.name || authUser?.name) || "—"}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            position: "absolute",
                            right: 2,
                            bottom: 2,
                            width: 13,
                            height: 13,
                            borderRadius: "50%",
                            // green only while actually clocked in; grey otherwise
                            bgcolor: myStatus?.isClockedIn ? GREEN.main : "#D1D5DB",
                            border: "2px solid #fff",
                        }}
                    />
                </Box>

                <Box sx={{ minWidth: "200px" }}>
                    <Typography
                        sx={{ fontSize: "11px", fontWeight: "700", color: GREEN.main, letterSpacing: "0.7px" }}
                    >
                        LOGGED IN FOR
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "27px",
                            fontWeight: "700",
                            color: myWorked === null ? "#D1D5DB" : "#111827",
                            fontFamily: "monospace",
                            lineHeight: 1.2,
                        }}
                    >
                        {/* An em dash, never 00:00:00, when nothing was ever punched. Zero
                            reads as "worked nothing"; a dash reads as "no data" — the truth. */}
                        {myWorked === null ? "—" : formatHms(myWorked)}
                    </Typography>
                    <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                        {myStatus?.loginTime
                            ? `Since ${myStatus.loginTime}${myStatus.loginSource ? ` · ${myStatus.loginSource}` : ""}`
                            : "No punch recorded today"}
                    </Typography>
                </Box>

                {hideMyTiles ? (
                    <Box sx={{ flex: 1, minWidth: "220px" }}>
                        <Typography sx={{ fontSize: "13px", color: "#374151" }}>
                            On approved leave today — no attendance is expected.
                        </Typography>
                    </Box>
                ) : (
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", flex: 1 }}>
                    <MiniStat
                        icon={CheckCircleIcon}
                        label="LOGIN"
                        value={myStatus?.loginTime || "—"}
                        tone={GREEN}
                    />
                    <MiniStat
                        icon={FreeBreakfastOutlinedIcon}
                        label="BREAK TIME"
                        // completed breaks only — an open break would otherwise eat net hours as it ran
                        value={myStatus?.loginTime ? formatMinutes(myStatus.breakMinutes) : "—"}
                        tone={AMBER}
                    />
                    <MiniStat
                        icon={TimerOutlinedIcon}
                        label="NET HOURS"
                        value={myStatus?.loginTime ? formatMinutes(myStatus.netMinutes) : "—"}
                        tone={INDIGO}
                    />
                </Box>
                )}
            </Box>

            <Grid container spacing={2}>
                {/* ── Left: KPIs + today's table ── */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8.5 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {kpis.map((kpi) => {
                            const KpiIcon = kpi.icon;
                            return (
                                <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 1,
                                            p: 2,
                                            height: "100%",
                                            boxSizing: "border-box",
                                            borderRadius: "12px",
                                            bgcolor: kpi.tone.bg,
                                            border: `1px solid ${kpi.tone.border}`,
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: "11.5px",
                                                    fontWeight: "700",
                                                    color: kpi.tone.main,
                                                    letterSpacing: "0.6px",
                                                }}
                                            >
                                                {kpi.label}
                                            </Typography>
                                            <Typography
                                                sx={{ fontSize: "30px", fontWeight: "700", color: "#111827", lineHeight: 1.25 }}
                                            >
                                                {kpi.value}
                                                {kpi.total !== undefined && (
                                                    <Box
                                                        component="span"
                                                        sx={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}
                                                    >
                                                        /{kpi.total}
                                                    </Box>
                                                )}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: "9px",
                                                bgcolor: "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <KpiIcon sx={{ fontSize: "22px", color: kpi.tone.main }} />
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Panel>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1.5,
                                flexWrap: "wrap",
                                mb: 1.8,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                                    Today's Attendance
                                </Typography>
                                <Chip
                                    label={`${filteredRecords.length} records`}
                                    size="small"
                                    sx={{ bgcolor: "#F3F4F6", color: "#6B7280", fontWeight: "600", fontSize: "11.5px" }}
                                />
                            </Box>
                            {searchAndExport}
                        </Box>
                        {renderAttendanceTable()}
                    </Panel>
                </Grid>

                {/* ── Right: leave centre + quick nav ── */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 3.5 }}>
                    <Box sx={{ mb: 2 }}>
                        <Panel title="Leave Center" icon={EventNoteIcon} tone={GREEN}>
                            <Box
                                sx={{
                                    p: 1.8,
                                    borderRadius: "10px",
                                    bgcolor: GREEN.bg,
                                    border: `1px solid ${GREEN.border}`,
                                }}
                            >
                                <Typography sx={{ fontSize: "14px", fontWeight: "700", color: GREEN.dark }}>
                                    Apply for Leave
                                </Typography>
                                <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 0.4, mb: 1.8, lineHeight: 1.6 }}>
                                    Submit a new leave request with dates and reason.
                                </Typography>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => navigate("/dashboardmenu/apply-leave", { state: { value: "Y" } })}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        fontSize: "13.5px",
                                        fontWeight: "700",
                                        py: 1.1,
                                        bgcolor: GREEN.dark,
                                        "&:hover": { bgcolor: "#065F46" },
                                    }}
                                >
                                    Go to Apply Leave
                                </Button>
                            </Box>
                        </Panel>
                    </Box>

                    <Panel title="Quick Navigation" icon={SpaceDashboardOutlinedIcon} tone={INDIGO}>
                        {quickNav.map((item, index) => {
                            const NavIcon = item.icon;
                            return (
                                <Box
                                    key={item.title}
                                    onClick={() => setTab(item.target)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.3,
                                        p: 1.4,
                                        mb: index === quickNav.length - 1 ? 0 : 1.2,
                                        borderRadius: "10px",
                                        border: "1px solid #E5E7EB",
                                        cursor: "pointer",
                                        transition: "0.2s",
                                        "&:hover": { borderColor: item.tone.main, bgcolor: item.tone.bg },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: "8px",
                                            bgcolor: item.tone.bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <NavIcon sx={{ fontSize: "19px", color: item.tone.main }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}>
                                            {item.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>{item.desc}</Typography>
                                    </Box>
                                    <ArrowForwardIosIcon sx={{ fontSize: "13px", color: "#D1D5DB" }} />
                                </Box>
                            );
                        })}
                    </Panel>
                </Grid>
            </Grid>
        </>
    );

    /* ─────────────── Add Attendance tab ─────────────── */
    const renderAddAttendance = () => {
        const entryKpis = [
            { label: "PRESENT", value: entryCountOf("Present"), icon: CheckCircleIcon, tone: GREEN },
            { label: "LATE", value: entryCountOf("Late"), icon: AccessTimeIcon, tone: AMBER },
            { label: "ABSENT", value: entryCountOf("Absent"), icon: SubjectIcon, tone: RED },
            { label: "ON LEAVE", value: entryCountOf("On Leave"), icon: EventAvailableIcon, tone: BLUE },
        ];

        const isBreakPanel = entryPanel === "break";
        const columns = isBreakPanel
            ? ["#", "STAFF MEMBER", "BREAKS (OUT → IN)", "TOTAL BREAK", "BREAKS COUNT"]
            : ["#", "STAFF MEMBER", "ROLE", "STATUS", "CHECK-IN", "CHECK-OUT", "WORKING HRS", "NOTES"];

        /* Name + staff id cell, shared by both panels */
        const staffCell = (row) => {
            const tone = avatarToneOf(row.id);
            return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Avatar
                        sx={{
                            width: 34,
                            height: 34,
                            bgcolor: tone.bg,
                            color: tone.color,
                            fontSize: "12px",
                            fontWeight: "700",
                        }}
                    >
                        {initialsOf(row.name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}>
                            {row.name}
                        </Typography>
                        <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>{row.rollNumber}</Typography>
                    </Box>
                </Box>
            );
        };

        const markedCount = entryStaff.filter((row) => entryOf(row.id).status).length;

        return (
            <>
                {/* ── Screen header + date ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                        p: 2,
                        mb: 2,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                bgcolor: GREEN.bg,
                                border: `1px solid ${GREEN.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <GroupsIcon sx={{ fontSize: "21px", color: GREEN.main }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827", lineHeight: 1.25 }}>
                                Mark Staff Attendance
                            </Typography>
                            <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>Manual entry · Today</Typography>
                        </Box>
                    </Box>

                    <TextField
                        size="small"
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        sx={{ ...inputSx, minWidth: "215px" }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarMonthOutlinedIcon sx={{ fontSize: "18px", color: GREEN.main }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                {/* ── Manual entry notice ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        p: 2,
                        mb: 2,
                        borderRadius: "12px",
                        bgcolor: BLUE.bg,
                        border: `1px solid ${BLUE.border}`,
                    }}
                >
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "9px",
                            bgcolor: INDIGO.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <FingerprintIcon sx={{ fontSize: "19px", color: INDIGO.main }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: INDIGO.main }}>
                            Manual Entry Mode · Biometric Fallback
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#374151", lineHeight: 1.7, mt: 0.3 }}>
                            Use this screen{" "}
                            <strong>only when the biometric device is offline or to correct existing punches</strong>.
                            All check-in / check-out and break records are tagged{" "}
                            <Box
                                component="span"
                                sx={{
                                    px: 0.8,
                                    py: 0.2,
                                    mx: 0.3,
                                    borderRadius: "4px",
                                    bgcolor: "#DBEAFE",
                                    color: INDIGO.main,
                                    fontFamily: "monospace",
                                    fontSize: "11.5px",
                                    fontWeight: 700,
                                }}
                            >
                                source: manual
                            </Box>{" "}
                            {/* The editor is whoever is signed in — this is the roll number the
                                save sends as EditorRollNumber and every audit row is filed under */}
                            and audit-logged against <strong>{authUser?.rollNumber || "the signed-in user"}</strong>.
                        </Typography>
                    </Box>
                </Box>

                {/* ── Live counts ── */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {entryKpis.map((kpi) => {
                        const KpiIcon = kpi.icon;
                        return (
                            <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        p: 2,
                                        height: "100%",
                                        boxSizing: "border-box",
                                        borderRadius: "12px",
                                        bgcolor: kpi.tone.bg,
                                        border: `1px solid ${kpi.tone.border}`,
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                fontSize: "11.5px",
                                                fontWeight: "700",
                                                color: kpi.tone.main,
                                                letterSpacing: "0.6px",
                                            }}
                                        >
                                            {kpi.label}
                                        </Typography>
                                        <Typography
                                            sx={{ fontSize: "30px", fontWeight: "700", color: "#111827", lineHeight: 1.25 }}
                                        >
                                            {kpi.value}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: "9px",
                                            bgcolor: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <KpiIcon sx={{ fontSize: "21px", color: kpi.tone.main }} />
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* ── Filters ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                        mb: 1.5,
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search staff name or ID..."
                        value={entrySearch}
                        onChange={(e) => setEntrySearch(e.target.value)}
                        sx={{
                            minWidth: "260px",
                            "& .MuiOutlinedInput-root": { borderRadius: "50px", fontSize: "13.5px", bgcolor: "#fff" },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <TextField
                        select
                        size="small"
                        value={entryRole}
                        onChange={(e) => setEntryRole(e.target.value)}
                        sx={{
                            minWidth: "180px",
                            "& .MuiOutlinedInput-root": { borderRadius: "50px", fontSize: "13.5px", bgcolor: "#fff" },
                        }}
                    >
                        {ROLE_FILTERS.map((role) => (
                            <MenuItem key={role} value={role} sx={{ fontSize: "13.5px" }}>
                                {role}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        startIcon={<DoneAllIcon />}
                        endIcon={<MoreHorizIcon />}
                        onClick={(e) => setBulkAnchor(e.currentTarget)}
                        sx={{
                            textTransform: "none",
                            borderRadius: "50px",
                            border: "1px solid #E5E7EB",
                            bgcolor: "#fff",
                            color: "#374151",
                            fontSize: "13.5px",
                            fontWeight: "600",
                            px: 2.2,
                            py: 0.9,
                            "&:hover": { bgcolor: "#F9FAFB" },
                        }}
                    >
                        Bulk Actions
                    </Button>

                    <Menu anchorEl={bulkAnchor} open={Boolean(bulkAnchor)} onClose={() => setBulkAnchor(null)}>
                        {ATTENDANCE_STATUSES.map((status) => (
                            <MenuItem key={status} onClick={() => applyBulkStatus(status)} sx={{ fontSize: "13.5px" }}>
                                Mark all as {status}
                            </MenuItem>
                        ))}
                        <MenuItem onClick={clearAllEntries} sx={{ fontSize: "13.5px", color: RED.main }}>
                            Clear all
                        </MenuItem>
                    </Menu>

                    <Box sx={{ flex: 1 }} />

                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                        {entryStaff.length} members
                    </Typography>
                </Box>

                {/* ── Shared time controls ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        flexWrap: "wrap",
                        px: 2,
                        py: 1.2,
                        mb: 2,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Switch
                            checked={sameTimeForAll}
                            onChange={(e) => setSameTimeForAll(e.target.checked)}
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: GREEN.main },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                    backgroundColor: GREEN.main,
                                    opacity: 1,
                                },
                            }}
                        />
                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}>
                            Same time for all
                        </Typography>
                        <Tooltip title="Applies one check-in / check-out time to every listed staff member">
                            <InfoOutlinedIcon sx={{ fontSize: "16px", color: "#9CA3AF" }} />
                        </Tooltip>

                        {sameTimeForAll && (
                            <Box sx={{ display: "flex", gap: 1, ml: 1.5, flexWrap: "wrap" }}>
                                <TextField
                                    size="small"
                                    type="time"
                                    value={sharedTimes.checkIn}
                                    onChange={(e) => setSharedTimes((prev) => ({ ...prev, checkIn: e.target.value }))}
                                    sx={{ ...inputSx, width: "130px" }}
                                />
                                <TextField
                                    size="small"
                                    type="time"
                                    value={sharedTimes.checkOut}
                                    onChange={(e) => setSharedTimes((prev) => ({ ...prev, checkOut: e.target.value }))}
                                    sx={{ ...inputSx, width: "130px" }}
                                />
                            </Box>
                        )}
                    </Box>

                    <Button
                        startIcon={<BoltIcon />}
                        onClick={useCurrentTime}
                        sx={{
                            textTransform: "none",
                            fontSize: "13.5px",
                            fontWeight: "700",
                            color: GREEN.main,
                            "&:hover": { bgcolor: GREEN.bg },
                        }}
                    >
                        Use Current Time
                    </Button>
                </Box>

                {/* ── Punch / break table ── */}
                <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                    <Box sx={{ display: "flex", gap: 0.5, px: 2, borderBottom: "1px solid #E5E7EB" }}>
                        {[
                            {
                                key: "punch",
                                label: "Check In / Check Out",
                                icon: AccessTimeIcon,
                                count: punchedCount,
                                chipBg: GREEN.bg,
                                chipColor: GREEN.main,
                            },
                            {
                                key: "break",
                                label: "Break In / Break Out",
                                icon: FreeBreakfastOutlinedIcon,
                                count: breakCount,
                                chipBg: "#FEF3C7",
                                chipColor: AMBER.main,
                            },
                        ].map((panel) => {
                            const PanelIcon = panel.icon;
                            const active = entryPanel === panel.key;
                            return (
                                <Box
                                    key={panel.key}
                                    onClick={() => setEntryPanel(panel.key)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        px: 1.5,
                                        py: 1.6,
                                        cursor: "pointer",
                                        userSelect: "none",
                                        whiteSpace: "nowrap",
                                        borderBottom: `3px solid ${active ? GREEN.main : "transparent"}`,
                                        color: active ? GREEN.main : "#6B7280",
                                        transition: "0.2s",
                                    }}
                                >
                                    <PanelIcon sx={{ fontSize: "18px" }} />
                                    <Typography sx={{ fontSize: "14px", fontWeight: active ? "700" : "600", color: "inherit" }}>
                                        {panel.label}
                                    </Typography>
                                    <Chip
                                        label={panel.count}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            bgcolor: active ? panel.chipBg : "#F3F4F6",
                                            color: active ? panel.chipColor : "#6B7280",
                                            fontWeight: "700",
                                            fontSize: "11px",
                                        }}
                                    />
                                </Box>
                            );
                        })}
                    </Box>

                    {/* How break entry works */}
                    {isBreakPanel && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1.2,
                                px: 2,
                                py: 1.4,
                                bgcolor: "#FFFBEB",
                                borderBottom: "1px solid #FDE68A",
                            }}
                        >
                            <WarningAmberIcon sx={{ fontSize: "18px", color: AMBER.main, mt: "1px", flexShrink: 0 }} />
                            <Typography sx={{ fontSize: "12.5px", color: "#78350F", lineHeight: 1.6 }}>
                                Record break-out → break-in pairs for each staff. Use the preset chips (
                                <strong>Morning Tea</strong>, <strong>Lunch</strong>, <strong>Evening Tea</strong>) for
                                one-click entry, or <strong>Add Break</strong> to enter custom times. Breaks apply only
                                to <strong>Present / Late</strong> staff.
                            </Typography>
                        </Box>
                    )}

                    <TableContainer sx={{ maxHeight: "58vh" }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {columns.map((head) => (
                                        <TableCell
                                            key={head}
                                            sx={{
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                color: "#374151",
                                                letterSpacing: "0.5px",
                                                bgcolor: GREEN.bg,
                                                borderBottom: `1px solid ${GREEN.border}`,
                                                py: 1.4,
                                            }}
                                        >
                                            {head}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isBreakPanel &&
                                    entryStaff.map((row, index) => {
                                        const value = entryOf(row.id);
                                        /* Breaks only make sense for staff who actually attended. The status can
                                           come from either side: what is being marked right now, or what was
                                           already saved for this date. Reading only the unsaved entry made the
                                           whole tab say "not applicable" whenever someone came back later to add
                                           breaks to a day they had already marked. */
                                        const effectiveStatus = value.status || markedOnDate[row.rollNumber]?.status || "";
                                        const applicable = effectiveStatus === "Present" || effectiveStatus === "Late";
                                        const totalMinutes = totalBreakMinutes(value.breaks);
                                        return (
                                            <TableRow key={row.id} hover>
                                                <TableCell sx={{ fontSize: "13px", color: "#9CA3AF", verticalAlign: "top", pt: 2 }}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell sx={{ verticalAlign: "top", pt: 1.6 }}>{staffCell(row)}</TableCell>
                                                <TableCell sx={{ verticalAlign: "top", pt: 1.6 }}>
                                                    {!applicable ? (
                                                        <Typography
                                                            sx={{ fontSize: "12.5px", color: "#9CA3AF", fontStyle: "italic" }}
                                                        >
                                                            Breaks not applicable
                                                        </Typography>
                                                    ) : (
                                                        <Box>
                                                            {value.breaks.map((item) => (
                                                                <Box
                                                                    key={item.id}
                                                                    sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                                                                >
                                                                    <TextField
                                                                        size="small"
                                                                        type="time"
                                                                        value={item.out}
                                                                        onChange={(e) =>
                                                                            updateBreak(row.id, item.id, "out", e.target.value)
                                                                        }
                                                                        sx={{ ...inputSx, width: "120px" }}
                                                                    />
                                                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>→</Typography>
                                                                    <TextField
                                                                        size="small"
                                                                        type="time"
                                                                        value={item.in}
                                                                        onChange={(e) =>
                                                                            updateBreak(row.id, item.id, "in", e.target.value)
                                                                        }
                                                                        sx={{ ...inputSx, width: "120px" }}
                                                                    />
                                                                    <Typography
                                                                        sx={{ fontSize: "12px", fontWeight: "700", color: AMBER.main, minWidth: "50px" }}
                                                                    >
                                                                        {minutesBetween(item.out, item.in)
                                                                            ? formatMinutes(minutesBetween(item.out, item.in))
                                                                            : ""}
                                                                    </Typography>
                                                                    <IconButton size="small" onClick={() => removeBreak(row.id, item.id)}>
                                                                        <CloseIcon sx={{ fontSize: "16px", color: "#9CA3AF" }} />
                                                                    </IconButton>
                                                                </Box>
                                                            ))}

                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                                                                {BREAK_PRESETS.map((preset) => (
                                                                    <Box
                                                                        key={preset.label}
                                                                        onClick={() => addBreak(row.id, preset)}
                                                                        sx={{
                                                                            px: 1.3,
                                                                            py: 0.4,
                                                                            borderRadius: "50px",
                                                                            cursor: "pointer",
                                                                            userSelect: "none",
                                                                            whiteSpace: "nowrap",
                                                                            fontSize: "11.5px",
                                                                            fontWeight: "600",
                                                                            color: AMBER.main,
                                                                            bgcolor: AMBER.bg,
                                                                            border: `1px solid ${AMBER.border}`,
                                                                            "&:hover": { bgcolor: "#FEF3C7" },
                                                                        }}
                                                                    >
                                                                        {preset.label}
                                                                    </Box>
                                                                ))}
                                                                <Button
                                                                    size="small"
                                                                    startIcon={<AddIcon />}
                                                                    onClick={() => addBreak(row.id)}
                                                                    sx={{
                                                                        textTransform: "none",
                                                                        borderRadius: "50px",
                                                                        fontSize: "11.5px",
                                                                        fontWeight: "700",
                                                                        color: GREEN.main,
                                                                        "&:hover": { bgcolor: GREEN.bg },
                                                                    }}
                                                                >
                                                                    Add Break
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        fontSize: "13px",
                                                        fontWeight: "700",
                                                        color: totalMinutes ? "#111827" : "#9CA3AF",
                                                        verticalAlign: "top",
                                                        pt: 2,
                                                    }}
                                                >
                                                    {totalMinutes ? formatMinutes(totalMinutes) : "—"}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        fontSize: "13px",
                                                        color: value.breaks.length ? "#111827" : "#9CA3AF",
                                                        verticalAlign: "top",
                                                        pt: 2,
                                                    }}
                                                >
                                                    {value.breaks.length || "—"}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                {!isBreakPanel &&
                                    entryStaff.map((row, index) => {
                                    const value = entryOf(row.id);
                                    const roleLabel = roleLabelOf(row.category);
                                    const roleCfg = ROLE_STYLE[roleLabel];
                                    const timesDisabled = !value.status || value.status === "Absent" || value.status === "On Leave";
                                    const inValue = sameTimeForAll ? sharedTimes.checkIn : value.checkIn;
                                    const outValue = sameTimeForAll ? sharedTimes.checkOut : value.checkOut;
                                    // Already has a record on this date — marking again overwrites it
                                    const marked = markedOnDate[row.rollNumber];
                                    const markedTimes = marked
                                        ? [marked.checkIn, marked.checkOut].filter(Boolean).join(" - ")
                                        : "";
                                    return (
                                        <TableRow
                                            key={row.id}
                                            hover
                                            sx={{ bgcolor: marked ? "#FFFBEB" : undefined }}
                                        >
                                            <TableCell sx={{ fontSize: "13px", color: "#9CA3AF" }}>{index + 1}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                                    {staffCell(row)}
                                                    {marked && (
                                                        <Chip
                                                            size="small"
                                                            label={`Already marked${marked.status ? ` · ${marked.status}` : ""}${markedTimes ? ` · ${markedTimes}` : ""}`}
                                                            sx={{
                                                                alignSelf: "flex-start",
                                                                height: 20,
                                                                fontSize: "10.5px",
                                                                fontWeight: 700,
                                                                bgcolor: AMBER.bg,
                                                                color: AMBER.main,
                                                                border: `1px solid ${AMBER.border}`,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={roleLabel}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: roleCfg.bg,
                                                        color: roleCfg.color,
                                                        border: `1px solid ${roleCfg.border}`,
                                                        fontWeight: "700",
                                                        fontSize: "11px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap" }}>
                                                    {ATTENDANCE_STATUSES.map((status) => {
                                                        const cfg = STATUS_STYLE[status];
                                                        const selected = value.status === status;
                                                        return (
                                                            <Box
                                                                key={status}
                                                                onClick={() =>
                                                                    patchEntry(row.id, { status: selected ? "" : status })
                                                                }
                                                                sx={{
                                                                    px: 1.4,
                                                                    py: 0.5,
                                                                    borderRadius: "50px",
                                                                    cursor: "pointer",
                                                                    userSelect: "none",
                                                                    whiteSpace: "nowrap",
                                                                    fontSize: "12px",
                                                                    fontWeight: selected ? "700" : "600",
                                                                    color: selected ? cfg.color : "#6B7280",
                                                                    bgcolor: selected ? cfg.bg : "#fff",
                                                                    border: `1px solid ${selected ? cfg.border : "#E5E7EB"}`,
                                                                    transition: "0.15s",
                                                                    "&:hover": { borderColor: cfg.border, color: cfg.color },
                                                                }}
                                                            >
                                                                {status}
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ width: "130px" }}>
                                                {timesDisabled ? (
                                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>—</Typography>
                                                ) : (
                                                    <TextField
                                                        size="small"
                                                        type="time"
                                                        value={inValue || ""}
                                                        onChange={(e) => setResolvedTime(row.id, "checkIn", e.target.value)}
                                                        sx={{ ...inputSx, width: "120px" }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ width: "130px" }}>
                                                {timesDisabled ? (
                                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>—</Typography>
                                                ) : (
                                                    <TextField
                                                        size="small"
                                                        type="time"
                                                        value={outValue || ""}
                                                        onChange={(e) => setResolvedTime(row.id, "checkOut", e.target.value)}
                                                        sx={{ ...inputSx, width: "120px" }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                                                {workingHoursBetween(inValue, outValue) || (
                                                    <Box component="span" sx={{ color: "#9CA3AF", fontWeight: 400 }}>
                                                        —
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => setNoteFor(row)}>
                                                    <StickyNote2OutlinedIcon
                                                        sx={{ fontSize: "18px", color: value.note ? GREEN.main : "#9CA3AF" }}
                                                    />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {entryStaff.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: "13px" }}
                                        >
                                            {loadingRoster ? "Loading the roster…" : "No staff match your search"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            flexWrap: "wrap",
                            px: 2,
                            py: 1.5,
                            borderTop: "1px solid #E5E7EB",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                                {markedCount} of {entryStaff.length} marked
                            </Typography>
                            {/* Recorded against every audit row this save creates */}
                            <TextField
                                size="small"
                                placeholder="Reason for the manual entry (optional)"
                                value={entryReason}
                                onChange={(e) => setEntryReason(e.target.value)}
                                sx={{ ...inputSx, minWidth: "290px" }}
                            />
                        </Box>
                        <Box sx={{ display: "flex", gap: 1.5 }}>
                            <Button
                                onClick={clearAllEntries}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    border: "1px solid #D1D5DB",
                                    color: "#374151",
                                    fontSize: "13.5px",
                                    fontWeight: "600",
                                    px: 3,
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="contained"
                                onClick={saveManualAttendance}
                                disabled={!markedCount || savingAttendance}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    px: 3,
                                    bgcolor: GREEN.dark,
                                    "&:hover": { bgcolor: "#065F46" },
                                }}
                            >
                                {savingAttendance ? "Saving…" : "Save Attendance"}
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* ── Per-row note ── */}
                <Dialog
                    open={Boolean(noteFor)}
                    onClose={() => setNoteFor(null)}
                    maxWidth="xs"
                    fullWidth
                    slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
                >
                    {noteFor && (
                        <>
                            <Box sx={{ px: 2.5, py: 2, bgcolor: GREEN.bg, borderBottom: `1px solid ${GREEN.border}` }}>
                                <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>
                                    Note · {noteFor.name}
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                                    Saved against this attendance entry
                                </Typography>
                            </Box>
                            <DialogContent sx={{ p: 2.5 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    size="small"
                                    placeholder="Reason for the manual entry or correction"
                                    value={entryOf(noteFor.id).note}
                                    onChange={(e) => patchEntry(noteFor.id, { note: e.target.value })}
                                    sx={inputSx}
                                />
                            </DialogContent>
                            <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB" }}>
                                <Button
                                    onClick={() => setNoteFor(null)}
                                    variant="contained"
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "50px",
                                        fontSize: "13.5px",
                                        fontWeight: "700",
                                        px: 3,
                                        bgcolor: GREEN.dark,
                                        "&:hover": { bgcolor: "#065F46" },
                                    }}
                                >
                                    Done
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </>
        );
    };

    /* ─────────────── Today's Attendance tab ─────────────── */
    const renderToday = () => {
        const summaryChips = [
            { label: "TOTAL", value: records.length, color: "#374151", bg: "#F9FAFB", border: "#E5E7EB" },
            { label: "PRESENT", value: countOf("Present"), color: GREEN.main, bg: GREEN.bg, border: GREEN.border },
            { label: "LATE", value: countOf("Late"), color: AMBER.main, bg: AMBER.bg, border: AMBER.border },
            { label: "ON LEAVE", value: countOf("On Leave"), color: BLUE.main, bg: BLUE.bg, border: BLUE.border },
            { label: "ABSENT", value: countOf("Absent"), color: RED.main, bg: RED.bg, border: RED.border },
        ];

        // Search + role + status all narrow the same list
        const todayRows = filteredRecords
            .filter((row) => todayRole === "All Roles" || row.role === todayRole)
            .filter((row) => todayStatus === "All Status" || row.status === todayStatus);

        const statusDot =
            todayStatus === "All Status" ? "#9CA3AF" : (STATUS_STYLE[todayStatus] || STATUS_STYLE.Present).color;

        return (
            <>
                {/* ── Header + counts ── */}
                <Box
                    sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: "12px",
                        background: "linear-gradient(90deg, #ECFDF5 0%, #F0FDFA 60%, #FFFFFF 100%)",
                        border: `1px solid ${GREEN.border}`,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, minWidth: 0 }}>
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: "10px",
                                    bgcolor: "#fff",
                                    border: `1px solid ${GREEN.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <CalendarMonthOutlinedIcon sx={{ fontSize: "22px", color: GREEN.main }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: "19px", fontWeight: "700", color: "#111827", lineHeight: 1.25 }}>
                                    Today's Staff Attendance
                                </Typography>
                                <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                                    {formatLongDate(today)} · Login times for each staff member
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            startIcon={<FileDownloadOutlinedIcon />}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                bgcolor: "#fff",
                                border: `1px solid ${GREEN.border}`,
                                color: GREEN.dark,
                                fontSize: "13.5px",
                                fontWeight: "700",
                                px: 2.5,
                                py: 1,
                                "&:hover": { bgcolor: GREEN.bg },
                            }}
                        >
                            Export
                        </Button>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", mt: 2 }}>
                        {summaryChips.map((chip) => (
                            <Box
                                key={chip.label}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.9,
                                    px: 1.8,
                                    py: 0.8,
                                    borderRadius: "50px",
                                    bgcolor: chip.bg,
                                    border: `1px solid ${chip.border}`,
                                }}
                            >
                                <Typography
                                    sx={{ fontSize: "11.5px", fontWeight: "700", color: chip.color, letterSpacing: "0.5px" }}
                                >
                                    {chip.label}
                                </Typography>
                                <Typography sx={{ fontSize: "14px", fontWeight: "700", color: chip.color }}>
                                    {chip.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* ── Filters ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                        p: 1.4,
                        mb: 2,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search by name or roll no..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            minWidth: "300px",
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "50px",
                                fontSize: "13.5px",
                                bgcolor: "#F9FAFB",
                                "& fieldset": { border: "none" },
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Box sx={{ width: "1px", height: 28, bgcolor: "#E5E7EB" }} />

                    <TextField
                        select
                        size="small"
                        value={todayRole}
                        onChange={(e) => setTodayRole(e.target.value)}
                        sx={{
                            minWidth: "170px",
                            "& .MuiOutlinedInput-root": { borderRadius: "50px", fontSize: "13.5px", fontWeight: 600 },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <GroupsIcon sx={{ fontSize: "19px", color: "#6B7280" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    >
                        {["All Roles", "Teaching Staff", "Non Teaching Staff"].map((role) => (
                            <MenuItem key={role} value={role} sx={{ fontSize: "13.5px" }}>
                                {role === "All Roles" ? "Role" : role}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        value={todayStatus}
                        onChange={(e) => setTodayStatus(e.target.value)}
                        sx={{
                            minWidth: "160px",
                            "& .MuiOutlinedInput-root": { borderRadius: "50px", fontSize: "13.5px", fontWeight: 600 },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Box
                                            sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: statusDot, flexShrink: 0 }}
                                        />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    >
                        {["All Status", ...ATTENDANCE_STATUSES].map((status) => (
                            <MenuItem key={status} value={status} sx={{ fontSize: "13.5px" }}>
                                {status === "All Status" ? "Status" : status}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ flex: 1 }} />

                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                        Showing{" "}
                        <Box component="span" sx={{ fontWeight: 700, color: "#374151" }}>
                            {todayRows.length}
                        </Box>{" "}
                        of {records.length} records
                    </Typography>
                </Box>

                {/* ── Login table ── */}
                <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: GREEN.bg }}>
                                    {[
                                        "S.NO",
                                        "STAFF MEMBER",
                                        "ROLE",
                                        "SOURCE",
                                        "LOGIN TIME",
                                        "LOGOUT TIME",
                                        "HOURS",
                                        "STATUS",
                                    ].map((head) => (
                                        <TableCell
                                            key={head}
                                            sx={{
                                                fontSize: "11.5px",
                                                fontWeight: "700",
                                                color: "#374151",
                                                letterSpacing: "0.5px",
                                                borderBottom: `1px solid ${GREEN.border}`,
                                                py: 1.8,
                                            }}
                                        >
                                            {head}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {todayRows.map((row, index) => {
                                    // Still on the clock when there is a login but no logout
                                    const active = Boolean(row.checkIn) && !row.checkOut;
                                    const hours = workingHoursBetween(row.checkIn, row.checkOut);
                                    return (
                                        <TableRow key={row.id} hover>
                                            <TableCell sx={{ fontSize: "13px", color: "#9CA3AF", py: 1.5 }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <Avatar sx={{ width: 34, height: 34, bgcolor: BLUE.bg, color: BLUE.main }}>
                                                        <PersonIcon sx={{ fontSize: "19px" }} />
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: "13.5px", fontWeight: "600", color: "#111827" }}>
                                                        {row.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.role}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#F0FDFA",
                                                        color: "#0D9488",
                                                        border: "1px solid #99F6E4",
                                                        fontWeight: "600",
                                                        fontSize: "11px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={
                                                        row.source === "Biometric" ? (
                                                            <FingerprintIcon
                                                                sx={{ fontSize: "14px !important", color: `${INDIGO.main} !important` }}
                                                            />
                                                        ) : undefined
                                                    }
                                                    label={row.source}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: INDIGO.bg,
                                                        color: INDIGO.main,
                                                        border: `1px solid ${INDIGO.border}`,
                                                        fontWeight: "600",
                                                        fontSize: "11px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {row.checkIn ? (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                                                        <AccessTimeIcon sx={{ fontSize: "15px", color: GREEN.main }} />
                                                        <Typography
                                                            sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}
                                                        >
                                                            {row.checkIn}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {row.checkOut ? (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                                                        <AccessTimeIcon sx={{ fontSize: "15px", color: "#6B7280" }} />
                                                        <Typography
                                                            sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}
                                                        >
                                                            {row.checkOut}
                                                        </Typography>
                                                    </Box>
                                                ) : active ? (
                                                    <Chip
                                                        label="Active"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: GREEN.bg,
                                                            color: GREEN.main,
                                                            border: `1px solid ${GREEN.border}`,
                                                            fontWeight: "700",
                                                            fontSize: "11px",
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                                                {hours || (
                                                    <Box component="span" sx={{ color: "#9CA3AF", fontWeight: 400 }}>
                                                        —
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip status={row.status} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {todayRows.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: "13px" }}
                                        >
                                            No attendance records match your filters
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </>
        );
    };

    /* ─────────────── Overview tab ─────────────── */
    const renderOverview = () => {
        const term = overviewSearch.trim().toLowerCase();
        // Search is client-side; the user-type filter is applied by the server
        const overviewStaff = overview.details.filter((row) =>
            !term
                ? true
                : String(row.name).toLowerCase().includes(term) || String(row.rollNumber).toLowerCase().includes(term)
        );

        // Columns are the server's dateHeaders — days[] aligns to them positionally
        const rangeDays = overview.dateHeaders;
        const rangeLabel = `${rangeDays.length} Days`;

        const cards = overview.cards || { totalPresent: 0, totalLate: 0, totalLeave: 0, totalAbsent: 0 };
        const summaryCards = [
            { label: "Total Present", value: cards.totalPresent, icon: CheckCircleIcon, tone: GREEN, bg: "#F0FDF4" },
            { label: "Total Late", value: cards.totalLate, icon: AccessTimeIcon, tone: AMBER, bg: "#FFF7ED" },
            { label: "Total Leave", value: cards.totalLeave, icon: EventBusyOutlinedIcon, tone: BLUE, bg: "#EFF6FF" },
            { label: "Total Absent", value: cards.totalAbsent, icon: CancelIcon, tone: RED, bg: "#FEF2F2" },
        ];

        return (
            <>
                {/* ── Staff filters ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                        p: 1.4,
                        mb: 2,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search staff name or ID"
                        value={overviewSearch}
                        onChange={(e) => setOverviewSearch(e.target.value)}
                        sx={{
                            minWidth: "280px",
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                fontSize: "13.5px",
                                bgcolor: "#F9FAFB",
                                "& fieldset": { border: "none" },
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <TextField
                        select
                        size="small"
                        value={overviewType}
                        onChange={(e) => setOverviewType(e.target.value)}
                        sx={{ ...inputSx, minWidth: "190px" }}
                    >
                        {USER_TYPES.map((type) => (
                            <MenuItem key={type} value={type} sx={{ fontSize: "13.5px" }}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ flex: 1 }} />

                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                        {overviewStaff.length} of {overview.details.length} staff members
                    </Typography>
                </Box>

                {/* ── Range picker ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        flexWrap: "wrap",
                        p: 1.4,
                        mb: 2,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <CalendarMonthOutlinedIcon sx={{ fontSize: "20px", color: BLUE.main }} />
                    <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827", mr: 0.5 }}>
                        View By:
                    </Typography>

                    {[
                        { key: "7", label: "7 Days" },
                        { key: "15", label: "15 Days" },
                        { key: "custom", label: "From - To" },
                    ].map((option) => {
                        const active = overviewRange === option.key;
                        return (
                            <Box
                                key={option.key}
                                onClick={() => setOverviewRange(option.key)}
                                sx={{
                                    px: 2.2,
                                    py: 0.8,
                                    borderRadius: "50px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    whiteSpace: "nowrap",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    color: active ? "#fff" : "#374151",
                                    bgcolor: active ? "#2563EB" : "#fff",
                                    border: `1px solid ${active ? "#2563EB" : "#E5E7EB"}`,
                                    transition: "0.2s",
                                    "&:hover": { borderColor: "#2563EB" },
                                }}
                            >
                                {option.label}
                            </Box>
                        );
                    })}

                    {overviewRange === "custom" && (
                        <Box sx={{ display: "flex", gap: 1, ml: 0.5, flexWrap: "wrap" }}>
                            <TextField
                                size="small"
                                type="date"
                                value={overviewFrom}
                                onChange={(e) => setOverviewFrom(e.target.value)}
                                sx={{ ...inputSx, width: "165px" }}
                            />
                            <TextField
                                size="small"
                                type="date"
                                value={overviewTo}
                                onChange={(e) => setOverviewTo(e.target.value)}
                                sx={{ ...inputSx, width: "165px" }}
                            />
                        </Box>
                    )}
                </Box>

                {/* ── Range totals ── */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {summaryCards.map((card) => {
                        const CardIcon = card.icon;
                        return (
                            <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        p: 2,
                                        height: "100%",
                                        boxSizing: "border-box",
                                        borderRadius: "12px",
                                        bgcolor: card.bg,
                                        border: `1px solid ${card.tone.main}55`,
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: "13.5px", color: "#374151" }}>{card.label}</Typography>
                                        <Typography
                                            sx={{ fontSize: "30px", fontWeight: "700", color: "#111827", lineHeight: 1.4 }}
                                        >
                                            {card.value}
                                        </Typography>
                                        <Typography sx={{ fontSize: "12px", fontWeight: "700", color: card.tone.main }}>
                                            {overviewRange === "custom" ? `${rangeDays.length} days` : `Last ${rangeLabel.toLowerCase()}`}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "9px",
                                            bgcolor: "#fff",
                                            border: `1px solid ${card.tone.main}55`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <CardIcon sx={{ fontSize: "22px", color: card.tone.main }} />
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* ── Day-by-day log ── */}
                <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            flexWrap: "wrap",
                            px: 2.2,
                            py: 1.8,
                        }}
                    >
                        <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                            Detailed Attendance Log
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                                px: 1.5,
                                py: 0.7,
                                borderRadius: "8px",
                                bgcolor: BLUE.bg,
                            }}
                        >
                            <CalendarMonthOutlinedIcon sx={{ fontSize: "16px", color: BLUE.main }} />
                            <Typography sx={{ fontSize: "12.5px", fontWeight: "700", color: BLUE.main }}>
                                {overviewStaff.length} Staff · {rangeLabel}
                            </Typography>
                        </Box>
                    </Box>

                    <TableContainer sx={{ maxHeight: "55vh" }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            fontSize: "11.5px",
                                            fontWeight: "700",
                                            color: "#6B7280",
                                            letterSpacing: "0.5px",
                                            bgcolor: "#F9FAFB",
                                            borderBottom: "1px solid #E5E7EB",
                                            borderRight: "1px solid #E5E7EB",
                                            minWidth: "260px",
                                            py: 1.6,
                                            // Keeps the name column in view while the days scroll
                                            position: "sticky",
                                            left: 0,
                                            zIndex: 3,
                                        }}
                                    >
                                        STAFF MEMBER
                                    </TableCell>
                                    {rangeDays.map((header) => (
                                        <TableCell
                                            key={header}
                                            align="center"
                                            sx={{
                                                bgcolor: "#F9FAFB",
                                                borderBottom: "1px solid #E5E7EB",
                                                borderLeft: "1px solid #F3F4F6",
                                                minWidth: "84px",
                                                py: 1.2,
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#374151" }}>
                                                {header.slice(0, 2)}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                                                {weekdayOfApiDate(header)}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {overviewStaff.map((row) => {
                                    return (
                                        <TableRow
                                            key={row.rollNumber}
                                            hover
                                            sx={{ "&:nth-of-type(even)": { bgcolor: "#F9FAFB" } }}
                                        >
                                            <TableCell
                                                sx={{
                                                    py: 1.2,
                                                    // Sticky column keeps its own white background over the stripes
                                                    position: "sticky",
                                                    left: 0,
                                                    zIndex: 1,
                                                    bgcolor: "#fff",
                                                    borderRight: "1px solid #E5E7EB",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 38,
                                                            height: 38,
                                                            bgcolor: LOG_AVATAR,
                                                            color: "#fff",
                                                            fontSize: "13px",
                                                            fontWeight: "700",
                                                        }}
                                                    >
                                                        {initialsOf(row.name)}
                                                    </Avatar>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            sx={{ fontSize: "14px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}
                                                        >
                                                            {row.name}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>
                                                            {row.rollNumber} · {row.category || row.userType}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            {/* days[] is positionally aligned to dateHeaders — index, never re-sort */}
                                            {rangeDays.map((header, index) => {
                                                const mark = OVERVIEW_MARK[row.days?.[index]?.status] || null;
                                                return (
                                                    <TableCell
                                                        key={header}
                                                        align="center"
                                                        sx={{ borderLeft: "1px solid #F3F4F6" }}
                                                    >
                                                        {mark ? (
                                                            <Box
                                                                sx={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    minWidth: 30,
                                                                    px: 0.8,
                                                                    py: 0.3,
                                                                    borderRadius: "6px",
                                                                    bgcolor: mark.bg,
                                                                    border: `1px solid ${mark.border}`,
                                                                    color: mark.color,
                                                                    fontSize: "11.5px",
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {mark.label}
                                                            </Box>
                                                        ) : (
                                                            <Typography sx={{ fontSize: "13px", color: "#D1D5DB" }}>—</Typography>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                                {overviewStaff.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={rangeDays.length + 1}
                                            sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: "13px" }}
                                        >
                                            {loadingOverview ? "Loading attendance…" : "No staff match your search"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </>
        );
    };

    /* ─────────────── Leave Management tab ─────────────── */
    const renderLeave = () => {
        // Counts come from `cards`, which stays complete even when a filter narrows the lists
        const pending = leaveCards.pendingCount || 0;
        const approved = leaveCards.approvedCount || 0;
        const rejected = leaveCards.rejectedCount || 0;
        const total = pending + approved + rejected;
        const approvedPercent = total ? Math.round((approved / total) * 100) : 0;

        const leaveKpis = [
            { label: "TOTAL LEAVES", value: total, caption: "This Month", icon: CalendarMonthOutlinedIcon, tone: BLUE },
            { label: "APPROVED", value: approved, caption: `${approvedPercent}% of total`, icon: CheckCircleIcon, tone: GREEN },
            { label: "PENDING", value: pending, caption: "Needs Review", icon: MoreHorizIcon, tone: AMBER },
            { label: "REJECTED", value: rejected, caption: "Declined", icon: CancelIcon, tone: RED },
        ];

        const statusFilters = [
            { key: "All Leaves", label: "All Leaves", icon: null, count: total },
            { key: "Pending", label: "Pending", icon: MoreHorizIcon, count: pending },
            { key: "Approved", label: "Approved", icon: CheckCircleIcon, count: approved },
            { key: "Rejected", label: "Rejected", icon: CancelIcon, count: rejected },
        ];

        const term = leaveSearch.trim().toLowerCase();
        const visibleRequests = leaveRequests
            .filter((row) => leaveType === "All Types" || row.leaveType === leaveType)
            .filter((row) =>
                !term
                    ? true
                    : [row.name, row.forRollNumber, row.reason].some((value) =>
                          String(value).toLowerCase().includes(term)
                      )
            );

        const myRequests = myLeaves;

        /* Shared request table */
        const requestTable = (rows, emptyTitle, emptyHint, showActions = false) => (
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: GREEN.bg }}>
                            {["STAFF MEMBER", "LEAVE TYPE", "DURATION", "DAYS", "REASON", "STATUS", ...(showActions ? ["ACTIONS"] : [])].map((head) => (
                                <TableCell
                                    key={head}
                                    sx={{
                                        fontSize: "11.5px",
                                        fontWeight: "700",
                                        color: "#374151",
                                        letterSpacing: "0.5px",
                                        borderBottom: `1px solid ${GREEN.border}`,
                                        py: 1.8,
                                    }}
                                >
                                    {head}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => {
                            const cfg = LEAVE_STATUS_STYLE[row.status];
                            return (
                                <TableRow key={row.leaveApplicationId} hover sx={{ "&:nth-of-type(even)": { bgcolor: "#F9FAFB" } }}>
                                    <TableCell sx={{ py: 1.4 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                            <Avatar
                                                sx={{
                                                    width: 34,
                                                    height: 34,
                                                    bgcolor: LOG_AVATAR,
                                                    color: "#fff",
                                                    fontSize: "12px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {initialsOf(row.name)}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}
                                                >
                                                    {row.name}
                                                </Typography>
                                                <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>
                                                    {row.forRollNumber}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.leaveType}
                                            size="small"
                                            sx={{
                                                bgcolor: "#F0FDFA",
                                                color: "#0D9488",
                                                border: "1px solid #99F6E4",
                                                fontWeight: "600",
                                                fontSize: "11px",
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "13px", color: "#374151" }}>
                                        {row.fromDate} – {row.toDate}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                                        {row.days}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "13px", color: "#6B7280", maxWidth: "230px" }}>
                                        {row.reason || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.status}
                                            size="small"
                                            sx={{
                                                bgcolor: cfg.bg,
                                                color: cfg.color,
                                                border: `1px solid ${cfg.border}`,
                                                fontWeight: "700",
                                                fontSize: "11px",
                                            }}
                                        />
                                        {/* Only populated on a declined row */}
                                        {row.rejectReason ? (
                                            <Typography sx={{ fontSize: "11px", color: RED.main, mt: 0.5 }}>
                                                {row.rejectReason}
                                            </Typography>
                                        ) : null}
                                    </TableCell>
                                    {showActions && (
                                        <TableCell>
                                            {row.status === "Pending" ? (
                                                <Box sx={{ display: "flex", gap: 0.8 }}>
                                                    <Button
                                                        size="small"
                                                        disabled={actioningId === row.leaveApplicationId}
                                                        onClick={() => actOnLeave(row, "accept")}
                                                        sx={{
                                                            textTransform: "none",
                                                            borderRadius: "8px",
                                                            bgcolor: GREEN.bg,
                                                            border: `1px solid ${GREEN.border}`,
                                                            color: GREEN.dark,
                                                            fontSize: "12.5px",
                                                            fontWeight: "700",
                                                            px: 1.6,
                                                        }}
                                                    >
                                                        Accept
                                                    </Button>
                                                    {/* Declining requires a reason, so it opens a prompt */}
                                                    <Button
                                                        size="small"
                                                        disabled={actioningId === row.leaveApplicationId}
                                                        onClick={() => {
                                                            setDeclineReason("");
                                                            setDeclineFor(row);
                                                        }}
                                                        sx={{
                                                            textTransform: "none",
                                                            borderRadius: "8px",
                                                            bgcolor: RED.bg,
                                                            border: `1px solid ${RED.border}`,
                                                            color: RED.main,
                                                            fontSize: "12.5px",
                                                            fontWeight: "700",
                                                            px: 1.6,
                                                        }}
                                                    >
                                                        Decline
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Typography sx={{ fontSize: "12.5px", color: "#D1D5DB" }}>—</Typography>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={showActions ? 7 : 6} sx={{ textAlign: "center", py: 6, border: "none" }}>
                                    <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#9CA3AF" }}>
                                        {emptyTitle}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12.5px", color: "#D1D5DB", mt: 0.6 }}>
                                        {emptyHint}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );

        /* Right-hand sidebar */
        const leaveSidebar = (
            <>
                <Box sx={{ mb: 2 }}>
                    <Panel
                        title="Available Leave Types"
                        icon={CalendarMonthOutlinedIcon}
                        tone={GREEN}
                        action={
                            <Box
                                sx={{
                                    minWidth: 28,
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: "50px",
                                    textAlign: "center",
                                    bgcolor: GREEN.bg,
                                    color: GREEN.main,
                                    border: `1px solid ${GREEN.border}`,
                                    fontSize: "12px",
                                    fontWeight: "700",
                                }}
                            >
                                {availableTypes.length}
                            </Box>
                        }
                    >
                        <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mt: -1.2, mb: 1.5 }}>
                            Configured in Leave Master
                        </Typography>
                        {availableTypes.map((type, index) => (
                            <Box
                                key={type.code}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.3,
                                    p: 1.3,
                                    mb: index === availableTypes.length - 1 ? 0 : 1.2,
                                    borderRadius: "10px",
                                    border: "1px solid #E5E7EB",
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 34,
                                        borderRadius: "8px",
                                        bgcolor: type.bg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "12px", fontWeight: "700", color: type.color }}>
                                        {type.code}
                                    </Typography>
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}>
                                        {type.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", fontWeight: "600", color: "#9CA3AF" }}>
                                        {type.allocation}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Panel>
                </Box>

{/* Hidden on the Apply Leave tab — the form is right there. */}
                {leaveView !== "apply" && (
                    <Panel title="Quick Actions" icon={AddIcon} tone={INDIGO}>
                        <Box
                            sx={{
                                p: 1.8,
                                borderRadius: "10px",
                                bgcolor: GREEN.bg,
                                border: `1px solid ${GREEN.border}`,
                            }}
                        >
                            <Typography sx={{ fontSize: "14px", fontWeight: "700", color: GREEN.dark }}>
                                Apply for Leave
                            </Typography>
                            <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 0.4, mb: 1.8, lineHeight: 1.6 }}>
                                Submit a new leave request with dates and reason.
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => setLeaveView("apply")}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    py: 1.1,
                                    bgcolor: GREEN.dark,
                                    "&:hover": { bgcolor: "#065F46" },
                                }}
                            >
                                Apply for Leave
                            </Button>
                        </Box>
                    </Panel>
                )}
            </>
        );

        return (
            <>
                {/* ── Sub-view switcher ── */}
                <Box
                    sx={{
                        display: "inline-flex",
                        gap: 0.5,
                        p: 0.6,
                        mb: 2,
                        borderRadius: "12px",
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        flexWrap: "wrap",
                    }}
                >
                    {visibleLeaveViews.map((view) => {
                        const ViewIcon = view.icon;
                        const active = leaveView === view.key;
                        return (
                            <Box
                                key={view.key}
                                onClick={() => setLeaveView(view.key)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    px: 2,
                                    py: 1,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    whiteSpace: "nowrap",
                                    color: active ? GREEN.main : "#6B7280",
                                    bgcolor: active ? "#fff" : "transparent",
                                    border: `1px solid ${active ? "#E5E7EB" : "transparent"}`,
                                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                                    transition: "0.2s",
                                    "&:hover": { color: active ? GREEN.main : "#374151" },
                                }}
                            >
                                <ViewIcon sx={{ fontSize: "18px" }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "inherit" }}>
                                    {view.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                <Grid container spacing={2}>
                    {/* ── Left: content by sub-view ── */}
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8.5 }}>
                        {leaveView === "applications" && (
                            <>
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    {leaveKpis.map((kpi) => {
                                        const KpiIcon = kpi.icon;
                                        return (
                                            <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        justifyContent: "space-between",
                                                        gap: 1,
                                                        p: 2,
                                                        height: "100%",
                                                        boxSizing: "border-box",
                                                        borderRadius: "12px",
                                                        bgcolor: kpi.tone.bg,
                                                        border: `1px solid ${kpi.tone.border}`,
                                                    }}
                                                >
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            sx={{
                                                                fontSize: "11.5px",
                                                                fontWeight: "700",
                                                                color: kpi.tone.main,
                                                                letterSpacing: "0.6px",
                                                            }}
                                                        >
                                                            {kpi.label}
                                                        </Typography>
                                                        <Typography
                                                            sx={{ fontSize: "30px", fontWeight: "700", color: "#111827", lineHeight: 1.35 }}
                                                        >
                                                            {kpi.value}
                                                        </Typography>
                                                        <Typography
                                                            sx={{ fontSize: "12px", fontWeight: "700", color: kpi.tone.main }}
                                                        >
                                                            {kpi.caption}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            width: 38,
                                                            height: 38,
                                                            borderRadius: "9px",
                                                            bgcolor: "#fff",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <KpiIcon sx={{ fontSize: "21px", color: kpi.tone.main }} />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>

                                <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", p: 2.2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.8 }}>
                                        <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                                            Leave Applications
                                        </Typography>
                                        <Chip
                                            label={`${total} total`}
                                            size="small"
                                            sx={{ bgcolor: "#F3F4F6", color: "#6B7280", fontWeight: "600", fontSize: "11.5px" }}
                                        />
                                    </Box>

                                    {/* Status filter pills */}
                                    <Box
                                        sx={{
                                            display: "inline-flex",
                                            gap: 0.5,
                                            p: 0.5,
                                            mb: 1.8,
                                            borderRadius: "10px",
                                            bgcolor: "#F9FAFB",
                                            border: "1px solid #E5E7EB",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {statusFilters.map((filter) => {
                                            const FilterIcon = filter.icon;
                                            const active = leaveFilter === filter.key;
                                            return (
                                                <Box
                                                    key={filter.key}
                                                    onClick={() => setLeaveFilter(filter.key)}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.8,
                                                        px: 1.6,
                                                        py: 0.8,
                                                        borderRadius: "8px",
                                                        cursor: "pointer",
                                                        userSelect: "none",
                                                        whiteSpace: "nowrap",
                                                        bgcolor: active ? "#fff" : "transparent",
                                                        color: active ? "#111827" : "#6B7280",
                                                        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                                                        transition: "0.2s",
                                                    }}
                                                >
                                                    {FilterIcon && <FilterIcon sx={{ fontSize: "16px" }} />}
                                                    <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "inherit" }}>
                                                        {filter.label}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            minWidth: 22,
                                                            px: 0.7,
                                                            borderRadius: "50px",
                                                            textAlign: "center",
                                                            bgcolor: "#F3F4F6",
                                                            color: "#6B7280",
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                        }}
                                                    >
                                                        {filter.count}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>

                                    {/* Search + type filter */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            flexWrap: "wrap",
                                            p: 1.2,
                                            mb: 2,
                                            borderRadius: "10px",
                                            bgcolor: "#F9FAFB",
                                            border: "1px solid #E5E7EB",
                                        }}
                                    >
                                        <TextField
                                            size="small"
                                            placeholder="Search name, roll no, or reason..."
                                            value={leaveSearch}
                                            onChange={(e) => setLeaveSearch(e.target.value)}
                                            sx={{
                                                minWidth: "280px",
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "8px",
                                                    fontSize: "13.5px",
                                                    bgcolor: "#fff",
                                                },
                                            }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                        <TextField
                                            select
                                            size="small"
                                            value={leaveType}
                                            onChange={(e) => setLeaveType(e.target.value)}
                                            sx={{
                                                minWidth: "180px",
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "8px",
                                                    fontSize: "13.5px",
                                                    fontWeight: 700,
                                                    bgcolor: "#fff",
                                                },
                                            }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <FilterAltOutlinedIcon sx={{ fontSize: "18px", color: "#6B7280" }} />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        >
                                            <MenuItem value="All Types" sx={{ fontSize: "13.5px" }}>
                                                Leave Type
                                            </MenuItem>
                                            {availableTypes.map((type) => (
                                                <MenuItem key={type.id} value={type.name} sx={{ fontSize: "13.5px" }}>
                                                    {type.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <Box sx={{ flex: 1 }} />

                                        <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                                            Showing{" "}
                                            <Box component="span" sx={{ fontWeight: 700, color: "#374151" }}>
                                                {visibleRequests.length}
                                            </Box>{" "}
                                            of {total}
                                        </Typography>
                                    </Box>

                                    {requestTable(
                                        visibleRequests,
                                        loadingLeave ? "Loading applications…" : "No leave applications found",
                                        loadingLeave ? "" : "When applications are submitted, they will appear here.",
                                        true
                                    )}
                                </Box>
                            </>
                        )}

                        {/* The same component the /dashboardmenu/apply-leave route renders,
                            without its page header. Kept as one component so the two entry
                            points cannot drift apart. */}
                        {leaveView === "apply" && <ApplyLeavePage embedded />}

                        {leaveView === "my" && (
                            <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", p: 2.2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.8 }}>
                                    <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                                        My Requests
                                    </Typography>
                                    <Chip
                                        label={`${myRequests.length} total`}
                                        size="small"
                                        sx={{ bgcolor: "#F3F4F6", color: "#6B7280", fontWeight: "600", fontSize: "11.5px" }}
                                    />
                                </Box>
                                {requestTable(
                                    myRequests,
                                    "You have not applied for leave yet",
                                    "Your submitted requests and their status will show up here."
                                )}
                            </Box>
                        )}
                    </Grid>

                    {/* ── Right: leave types + quick actions ── */}
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 3.5 }}>{leaveSidebar}</Grid>
                </Grid>
            </>
        );
    };

    /* ─────────────── Reports tab ─────────────── */
    const renderReports = () => {
        /* Category and AttendanceStatus are applied server-side, so the only local
           narrowing is the free-text search over the rows that came back. */
        const term = reportSearch.trim().toLowerCase();
        const rows = report.summary.filter((row) => {
            if (!term) return true;
            return (
                row.staffMember.toLowerCase().includes(term) ||
                row.rollNumber.toLowerCase().includes(term) ||
                String(row.biometricId || "").toLowerCase().includes(term)
            );
        });

        const cards = report.cards;
        const reportKpis = [
            { label: "TOTAL STAFF", value: cards?.totalStaff ?? 0, caption: "In scope", icon: PersonIcon, tone: BLUE, bg: "#EFF6FF" },
            { label: "PRESENT DAYS", value: cards?.presentDays ?? 0, caption: "Marked present", icon: CheckCircleIcon, tone: GREEN, bg: "#F0FDF4" },
            { label: "LATE ARRIVALS", value: cards?.lateArrivals ?? 0, caption: "Crossed grace", icon: AccessTimeIcon, tone: AMBER, bg: "#FEFCE8" },
            { label: "ABSENT DAYS", value: cards?.absentDays ?? 0, caption: "No-show", icon: CancelIcon, tone: RED, bg: "#FEF2F2" },
            { label: "LEAVE DAYS", value: cards?.leaveDays ?? 0, caption: "Approved leave", icon: EventBusyOutlinedIcon, tone: PURPLE, bg: "#F5F3FF" },
            // A neutral tone: not-marked is the absence of a judgement, not a bad outcome,
            // so it must not read like the red ABSENT card next to it.
            {
                label: "NOT MARKED",
                value: cards?.notMarkedDays ?? 0,
                caption: "Today onwards",
                icon: MoreHorizIcon,
                tone: SLATE_TONE,
                bg: "#F8FAFC",
            },
        ];

        const totals = report.totals;

        const statusDot = reportStatus ? reportDayStyle(reportStatus).color : "#9CA3AF";

        /* Shown together so a 20-day range with a denominator of 16 explains itself, and so
           "not marked" is not mistaken for absence. */
        const rangeExplainer = totals
            ? [
                  `${totals.workingDays} working ${totals.workingDays === 1 ? "day" : "days"}`,
                  totals.holidayDays ? `${totals.holidayDays} holidays excluded` : "",
                  totals.upcomingDays ? `${totals.upcomingDays} still to come` : "",
              ]
                  .filter(Boolean)
                  .join(" · ")
            : "";

        /* Grey when nothing recorded, so the real numbers stand out */
        const countCell = (value, color) => (
            <Typography sx={{ fontSize: "13.5px", fontWeight: value ? "700" : "400", color: value ? color : "#D1D5DB" }}>
                {value}
            </Typography>
        );

        return (
            <>
                {/* The range asked for reached outside the academic year and was trimmed.
                    Without saying so, "Last 30 Days" near a year boundary quietly returns
                    fewer days than requested and the reader cannot tell why. */}
                {totals?.clamped && (
                    <Box sx={{ p: 1.5, mb: 2, borderRadius: "10px", bgcolor: AMBER.bg, border: `1px solid ${AMBER.border}` }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "#92400E" }}>
                            Range trimmed to {totals.academicYear}
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#92400E", mt: 0.3 }}>
                            Part of the dates you picked fall outside the selected academic year, so the
                            report covers {report.cards ? "the overlapping days only" : "a shorter range"}.
                        </Typography>
                    </Box>
                )}

                {/* ── Range + filters ── */}
                <Box sx={{ p: 1.8, mb: 2, bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap", mb: 1.8 }}>
                        <CalendarMonthOutlinedIcon sx={{ fontSize: "20px", color: GREEN.main }} />
                        <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827", mr: 0.5 }}>
                            Date Range:
                        </Typography>

                        {REPORT_PRESETS.map((preset) => {
                            const active = reportPreset === preset;
                            return (
                                <Box
                                    key={preset}
                                    onClick={() => applyReportPreset(preset)}
                                    sx={{
                                        px: 2,
                                        py: 0.8,
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        userSelect: "none",
                                        whiteSpace: "nowrap",
                                        fontSize: "13.5px",
                                        fontWeight: "700",
                                        color: active ? "#fff" : "#374151",
                                        bgcolor: active ? GREEN.dark : "#fff",
                                        border: `1px solid ${active ? GREEN.dark : "#E5E7EB"}`,
                                        transition: "0.2s",
                                        "&:hover": { borderColor: GREEN.main },
                                    }}
                                >
                                    {preset}
                                </Box>
                            );
                        })}

                        <Box sx={{ flex: 1 }} />

                        <TextField
                            label="From"
                            size="small"
                            type="date"
                            value={reportFrom}
                            onChange={(e) => {
                                setReportFrom(e.target.value);
                                setReportPreset("");
                            }}
                            sx={{ ...inputSx, width: "185px" }}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            label="To"
                            size="small"
                            type="date"
                            value={reportTo}
                            onChange={(e) => {
                                setReportTo(e.target.value);
                                setReportPreset("");
                            }}
                            sx={{ ...inputSx, width: "185px" }}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <TextField
                            size="small"
                            placeholder="Search by name, roll number or biometric ID..."
                            value={reportSearch}
                            onChange={(e) => setReportSearch(e.target.value)}
                            sx={{
                                minWidth: "300px",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    fontSize: "13.5px",
                                    bgcolor: "#F9FAFB",
                                    "& fieldset": { border: "none" },
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            select
                            size="small"
                            value={reportCategory}
                            onChange={(e) => setReportCategory(e.target.value)}
                            sx={{ minWidth: "185px", "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13.5px", fontWeight: 700 } }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <GroupsIcon sx={{ fontSize: "19px", color: "#6B7280" }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        >
                            {REPORT_CATEGORIES.map((option) => (
                                <MenuItem key={option.value} value={option.value} sx={{ fontSize: "13.5px" }}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            size="small"
                            value={reportStatus}
                            onChange={(e) => setReportStatus(e.target.value)}
                            sx={{ minWidth: "165px", "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "13.5px", fontWeight: 700 } }}
                            slotProps={{
                                // "All Status" is the empty value; without displayEmpty the select
                                // renders blank instead of its label
                                select: { displayEmpty: true },
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: statusDot, flexShrink: 0 }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        >
                            {REPORT_ATTENDANCE_STATUSES.map((option) => (
                                <MenuItem key={option.value || "all"} value={option.value} sx={{ fontSize: "13.5px" }}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ flex: 1 }} />

                        <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                            Showing{" "}
                            <Box component="span" sx={{ fontWeight: 700, color: "#374151" }}>
                                {rows.length}
                            </Box>{" "}
                            of {report.summary.length} staff
                        </Typography>
                    </Box>
                </Box>

                {/* ── Totals ── */}
                {rangeExplainer && (
                    <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mb: 1 }}>
                        {rangeExplainer}
                    </Typography>
                )}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {reportKpis.map((kpi) => {
                        const KpiIcon = kpi.icon;
                        return (
                            <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        p: 2,
                                        height: "100%",
                                        boxSizing: "border-box",
                                        borderRadius: "12px",
                                        bgcolor: kpi.bg,
                                        border: `1px solid ${kpi.tone.main}33`,
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: "11.5px", fontWeight: "700", color: kpi.tone.main, letterSpacing: "0.6px" }}>
                                            {kpi.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: "30px", fontWeight: "700", color: "#111827", lineHeight: 1.35 }}>
                                            {kpi.value}
                                        </Typography>
                                        <Typography sx={{ fontSize: "12px", fontWeight: "700", color: kpi.tone.main }}>
                                            {kpi.caption}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: "9px",
                                            bgcolor: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <KpiIcon sx={{ fontSize: "21px", color: kpi.tone.main }} />
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* ── Per-staff summary ── */}
                <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            flexWrap: "wrap",
                            px: 2.2,
                            py: 1.8,
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                                    Staff Attendance Summary
                                </Typography>
                                <Chip
                                    label={`${rows.length} staff`}
                                    size="small"
                                    sx={{ bgcolor: "#F3F4F6", color: "#6B7280", fontWeight: "600", fontSize: "11.5px" }}
                                />
                            </Box>
                            <Typography sx={{ fontSize: "12.5px", color: "#9CA3AF", mt: 0.3 }}>
                                {ddmmyyyy(reportFrom)} → {ddmmyyyy(reportTo)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                            <Button
                                onClick={loadReport}
                                disabled={loadingReport}
                                startIcon={<HistoryToggleOffIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    px: 2,
                                    color: "#374151",
                                    border: "1px solid #E5E7EB",
                                }}
                            >
                                {loadingReport ? "Loading…" : "Refresh"}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={exportReportCsv}
                                disabled={rows.length === 0}
                                startIcon={<FileDownloadOutlinedIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    px: 3,
                                    py: 1,
                                    bgcolor: GREEN.dark,
                                    "&:hover": { bgcolor: "#065F46" },
                                }}
                            >
                                Export CSV
                            </Button>
                        </Box>
                    </Box>

                    <TableContainer sx={{ maxHeight: "55vh" }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {[
                                        "S.NO",
                                        "STAFF MEMBER",
                                        "ROLL NUMBER",
                                        "BIOMETRIC ID",
                                        "CATEGORY",
                                        "WORKING",
                                        "PRESENT",
                                        "LATE",
                                        "ABSENT",
                                        "LEAVE",
                                        "NOT MARKED",
                                        "ATTENDANCE %",
                                        "ACTION",
                                    ].map((head) => (
                                        <TableCell
                                            key={head}
                                            sx={{
                                                fontSize: "11.5px",
                                                fontWeight: "700",
                                                color: "#374151",
                                                letterSpacing: "0.5px",
                                                bgcolor: GREEN.bg,
                                                borderBottom: `1px solid ${GREEN.border}`,
                                                py: 1.8,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {head}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => {
                                    const tone = avatarToneOf(row.rollNumber);
                                    const percent = Math.round(row.attendancePercent || 0);
                                    const percentColor = percent >= 75 ? GREEN.main : percent >= 50 ? AMBER.main : RED.main;
                                    return (
                                        <TableRow key={`${row.rollNumber}-${row.sNo}`} hover>
                                            <TableCell sx={{ fontSize: "13px", color: "#9CA3AF", py: 1.3 }}>{row.sNo}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            bgcolor: tone.bg,
                                                            color: tone.color,
                                                            fontSize: "12px",
                                                            fontWeight: "700",
                                                        }}
                                                    >
                                                        {initialsOf(row.staffMember)}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}>
                                                        {row.staffMember}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>
                                                {row.rollNumber}
                                            </TableCell>
                                            <TableCell>
                                                {/* null for everyone without a device enrolment */}
                                                {row.biometricId ? (
                                                    <Chip
                                                        icon={<FingerprintIcon sx={{ fontSize: "14px !important" }} />}
                                                        label={row.biometricId}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "#EEF2FF",
                                                            color: INDIGO.main,
                                                            border: "1px solid #C7D2FE",
                                                            fontWeight: "700",
                                                            fontSize: "11px",
                                                            "& .MuiChip-icon": { color: INDIGO.main },
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography sx={{ fontSize: "12.5px", color: "#D1D5DB" }}>Not enrolled</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.category || "—"}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#F3F4F6",
                                                        color: "#374151",
                                                        border: "1px solid #E5E7EB",
                                                        fontWeight: "700",
                                                        fontSize: "11px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}>
                                                {row.workingDays}
                                            </TableCell>
                                            <TableCell>{countCell(row.present, GREEN.main)}</TableCell>
                                            <TableCell>{countCell(row.late, AMBER.main)}</TableCell>
                                            <TableCell>{countCell(row.absent, RED.main)}</TableCell>
                                            <TableCell>{countCell(row.leave, BLUE.main)}</TableCell>
                                            <TableCell>{countCell(row.notMarked, SLATE_TONE.main)}</TableCell>
                                            <TableCell sx={{ minWidth: "130px" }}>
                                                <Typography sx={{ fontSize: "13px", fontWeight: "700", color: percentColor }}>
                                                    {row.attendancePercent}%
                                                </Typography>
                                                {row.scoredDays > 0 && row.scoredDays !== row.workingDays && (
                                                    <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF" }}>
                                                        of {row.scoredDays} scored
                                                    </Typography>
                                                )}
                                                <Box sx={{ mt: 0.6, width: "100%", height: 5, borderRadius: "50px", bgcolor: "#F3F4F6", overflow: "hidden" }}>
                                                    <Box
                                                        sx={{
                                                            width: `${Math.min(percent, 100)}%`,
                                                            height: "100%",
                                                            bgcolor: percentColor,
                                                            transition: "width 0.3s",
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    startIcon={<VisibilityOutlinedIcon />}
                                                    onClick={() => openFullReport(row)}
                                                    sx={{
                                                        textTransform: "none",
                                                        borderRadius: "8px",
                                                        bgcolor: GREEN.bg,
                                                        border: `1px solid ${GREEN.border}`,
                                                        color: GREEN.dark,
                                                        fontSize: "12.5px",
                                                        fontWeight: "700",
                                                        px: 1.6,
                                                        whiteSpace: "nowrap",
                                                        "&:hover": { bgcolor: "#D1FAE5" },
                                                    }}
                                                >
                                                    {/* The API sends the link label itself */}
                                                    {row.fullReport || "View"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {rows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={12} sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: "13px" }}>
                                            {loadingReport ? "Loading the register…" : "No staff match your filters"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* ── Per-person full report ── */}
                <Dialog
                    open={Boolean(reportViewStaff)}
                    onClose={() => setReportViewStaff(null)}
                    maxWidth="md"
                    fullWidth
                    slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
                >
                    {reportViewStaff && (
                        <>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    px: 2.5,
                                    py: 2,
                                    bgcolor: GREEN.bg,
                                    borderBottom: `1px solid ${GREEN.border}`,
                                }}
                            >
                                <Avatar sx={{ width: 42, height: 42, bgcolor: "#fff", color: GREEN.main, fontSize: "14px", fontWeight: "700" }}>
                                    {initialsOf(fullReport?.name || reportViewStaff.staffMember)}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                                        {fullReport?.name || reportViewStaff.staffMember}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                                        {reportViewStaff.rollNumber}
                                        {fullReport?.department ? ` · ${fullReport.department}` : ""}
                                        {fullReport?.category ? ` · ${fullReport.category}` : ""}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>
                                        {fullReport?.reportFromDate || ddmmyyyy(reportFrom)} → {fullReport?.reportToDate || ddmmyyyy(reportTo)}
                                        {fullReport?.biometricId ? ` · Biometric ${fullReport.biometricId}` : " · Not enrolled"}
                                    </Typography>
                                </Box>
                                <IconButton size="small" onClick={() => setReportViewStaff(null)}>
                                    <CloseIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
                                </IconButton>
                            </Box>

                            <DialogContent sx={{ p: 2.5 }}>
                                {loadingFullReport && (
                                    <Typography sx={{ textAlign: "center", py: 4, color: "#9CA3AF", fontSize: "13px" }}>
                                        Loading the full report…
                                    </Typography>
                                )}

                                {!loadingFullReport && fullReport && (
                                    <>
                                        {/* Range counts */}
                                        <Grid container spacing={1.2} sx={{ mb: 2.2 }}>
                                            {[
                                                { label: "Working", value: fullReport.workingDays, tone: "#374151", bg: "#F9FAFB" },
                                                { label: "Present", value: fullReport.present, tone: GREEN.main, bg: "#F0FDF4" },
                                                { label: "Late", value: fullReport.late, tone: AMBER.main, bg: "#FEFCE8" },
                                                { label: "Absent", value: fullReport.absent, tone: RED.main, bg: "#FEF2F2" },
                                                { label: "Leave", value: fullReport.leave, tone: BLUE.main, bg: "#EFF6FF" },
                                                { label: "Attendance", value: `${fullReport.attendancePercent}%`, tone: PURPLE.main, bg: "#F5F3FF" },
                                            ].map((stat) => (
                                                <Grid key={stat.label} size={{ xs: 6, sm: 4, md: 2 }}>
                                                    <Box sx={{ p: 1.3, borderRadius: "10px", bgcolor: stat.bg, border: `1px solid ${stat.tone}22` }}>
                                                        <Typography sx={{ fontSize: "10.5px", fontWeight: "700", color: "#6B7280", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                                                            {stat.label}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "20px", fontWeight: "700", color: stat.tone, lineHeight: 1.2 }}>
                                                            {stat.value}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>

                                        {/* Leave side of the same window, when the roll number resolves in users */}
                                        {personSummary && (
                                            <Box sx={{ mb: 2.2, p: 1.6, borderRadius: "10px", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                                                <Typography sx={{ fontSize: "12px", fontWeight: "700", color: "#374151", mb: 1 }}>
                                                    Leave applications in this window
                                                </Typography>
                                                <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
                                                    {[
                                                        { label: "Total taken", value: personSummary.leave.totalLeaveTaken, tone: "#374151" },
                                                        { label: "Approved", value: personSummary.leave.approvedLeave, tone: GREEN.main },
                                                        { label: "Pending", value: personSummary.leave.pendingLeave, tone: AMBER.main },
                                                        { label: "Rejected", value: personSummary.leave.rejectedLeave, tone: RED.main },
                                                    ].map((item) => (
                                                        <Box key={item.label}>
                                                            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{item.label}</Typography>
                                                            <Typography sx={{ fontSize: "16px", fontWeight: "700", color: item.tone }}>
                                                                {item.value}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Calendar block — one cell per working day in the range */}
                                        {fullReport.calendar.length > 0 && (
                                            <Box sx={{ mb: 2.2 }}>
                                                <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "#111827", mb: 1 }}>
                                                    Calendar
                                                </Typography>
                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                                                    {fullReport.calendar.map((cell, index) => {
                                                        const style = reportDayStyle(cell.status);
                                                        return (
                                                            <Tooltip key={`${cell.dayNumber}-${index}`} title={cell.status || "unmarked"} arrow>
                                                                <Box
                                                                    sx={{
                                                                        width: 46,
                                                                        py: 0.7,
                                                                        borderRadius: "8px",
                                                                        textAlign: "center",
                                                                        bgcolor: style.bg,
                                                                        border: `1px solid ${style.border}`,
                                                                    }}
                                                                >
                                                                    <Typography sx={{ fontSize: "14px", fontWeight: "700", color: style.color, lineHeight: 1.2 }}>
                                                                        {cell.dayNumber}
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: "9.5px", color: "#9CA3AF" }}>{cell.dayName}</Typography>
                                                                </Box>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Daily log */}
                                        <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "#111827", mb: 1 }}>
                                            Daily Log
                                        </Typography>
                                        <TableContainer sx={{ maxHeight: "38vh", border: "1px solid #E5E7EB", borderRadius: "10px" }}>
                                            <Table size="small" stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        {["DATE", "DAY", "STATUS", "LOGIN TIME", "LOGOUT TIME", ""].map((head, index) => (
                                                            <TableCell
                                                                key={head || index}
                                                                sx={{
                                                                    fontSize: "11px",
                                                                    fontWeight: "700",
                                                                    color: "#374151",
                                                                    bgcolor: "#F9FAFB",
                                                                    borderBottom: "1px solid #E5E7EB",
                                                                }}
                                                            >
                                                                {head}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {fullReport.dailyLog.map((entry, index) => {
                                                        const style = reportDayStyle(entry.status);
                                                        // logged in with no logout yet — today's normal state
                                                        const stillIn =
                                                            entry.loginTime &&
                                                            entry.loginTime !== "-" &&
                                                            (!entry.logoutTime || entry.logoutTime === "-");
                                                        return (
                                                            <TableRow key={`${entry.date}-${index}`} hover>
                                                                <TableCell sx={{ fontSize: "12.5px", color: "#111827", whiteSpace: "nowrap" }}>
                                                                    {entry.date}
                                                                </TableCell>
                                                                <TableCell sx={{ fontSize: "12.5px", color: "#6B7280" }}>{entry.day}</TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={entry.status}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: style.bg,
                                                                            color: style.color,
                                                                            border: `1px solid ${style.border}`,
                                                                            fontWeight: "700",
                                                                            fontSize: "11px",
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell sx={{ fontSize: "12.5px", color: entry.loginTime === "-" ? "#D1D5DB" : "#111827" }}>
                                                                    {entry.loginTime || "-"}
                                                                </TableCell>
                                                                <TableCell sx={{ fontSize: "12.5px", whiteSpace: "nowrap" }}>
                                                                    {stillIn ? (
                                                                        <Typography
                                                                            component="span"
                                                                            sx={{ fontSize: "12px", fontWeight: "700", color: GREEN.main }}
                                                                        >
                                                                            Still in
                                                                        </Typography>
                                                                    ) : (
                                                                        <Typography
                                                                            component="span"
                                                                            sx={{
                                                                                fontSize: "12.5px",
                                                                                color: entry.logoutTime === "-" || !entry.logoutTime ? "#D1D5DB" : "#111827",
                                                                            }}
                                                                        >
                                                                            {entry.logoutTime || "-"}
                                                                        </Typography>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {/* Jumps to the change trail for this person-day */}
                                                                    <Tooltip title="View change history" arrow>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                openAudit({
                                                                                    rollNumber: fullReport.rollNumber,
                                                                                    name: fullReport.name,
                                                                                    date: entry.date,
                                                                                })
                                                                            }
                                                                        >
                                                                            <ManageHistoryOutlinedIcon sx={{ fontSize: "17px", color: "#9CA3AF" }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                    {fullReport.dailyLog.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#9CA3AF", fontSize: "13px" }}>
                                                                No days recorded in this range
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </>
                                )}
                            </DialogContent>

                            <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB" }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setReportViewStaff(null)}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "50px",
                                        fontSize: "13.5px",
                                        fontWeight: "700",
                                        px: 3,
                                        bgcolor: GREEN.dark,
                                        "&:hover": { bgcolor: "#065F46" },
                                    }}
                                >
                                    Close
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </>
        );
    };

    const renderTabContent = () => {
        switch (tab) {
            case "add":
                return renderAddAttendance();
            case "today":
                return renderToday();
            case "overview":
                return renderOverview();
            case "leave":
                return renderLeave();
            case "reports":
                return renderReports();
            default:
                return renderDashboard();
        }
    };

    return (
        <Box
            sx={{
                height: "calc(100vh - 76px)",
                display: "flex",
                flexDirection: "column",
                bgcolor: PAGE_BG,
                overflow: "hidden",
            }}
        >
            {/* ─── Header ─── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                    px: 2,
                    py: 1.5,
                    bgcolor: "#fff",
                    borderBottom: "1px solid #E5E7EB",
                    flexShrink: 0,
                }}
            >
                <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                    <ArrowBackIcon sx={{ fontSize: "18px", color: "#111827" }} />
                </IconButton>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: GREEN.bg,
                        border: `1px solid ${GREEN.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <EventNoteIcon sx={{ fontSize: "21px", color: GREEN.main }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                        Leave &amp; Attendance
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>{formatLongDate(today)}</Typography>
                </Box>

                <Box sx={{ flex: 1 }} />

                <Button
                    startIcon={<FingerprintIcon />}
                    onClick={() => navigate("biometric-mapping", { state: { value: "Y" } })}
                    sx={{
                        textTransform: "none",
                        borderRadius: "50px",
                        border: `1px solid ${GREEN.border}`,
                        color: GREEN.dark,
                        fontSize: "13.5px",
                        fontWeight: "700",
                        px: 2.5,
                        py: 0.9,
                        "&:hover": { bgcolor: GREEN.bg },
                    }}
                >
                    Biometric Mapping
                </Button>
                {canAddAttendance && <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setTab("add")}
                    sx={{
                        textTransform: "none",
                        borderRadius: "50px",
                        fontSize: "13.5px",
                        fontWeight: "700",
                        px: 3,
                        py: 0.9,
                        bgcolor: GREEN.dark,
                        boxShadow: `0 2px 8px ${GREEN.dark}40`,
                        "&:hover": { bgcolor: "#065F46" },
                    }}
                >
                    Mark Attendance
                </Button>}
                <TextField
                    select
                    size="small"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    sx={{ ...inputSx, minWidth: "150px" }}
                >
                    {ACADEMIC_YEARS.map((year) => (
                        <MenuItem key={year} value={year} sx={{ fontSize: "13.5px" }}>
                            {year}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {/* ─── Tab strip ─── */}
            <Box
                sx={{
                    display: "flex",
                    gap: 0.5,
                    px: 2,
                    bgcolor: "#fff",
                    borderBottom: "1px solid #E5E7EB",
                    overflowX: "auto",
                    flexShrink: 0,
                }}
            >
                {visibleTabs.map((item) => {
                    const TabIcon = item.icon;
                    const active = tab === item.key;
                    return (
                        <Box
                            key={item.key}
                            onClick={() => setTab(item.key)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 2,
                                py: 1.6,
                                cursor: "pointer",
                                userSelect: "none",
                                whiteSpace: "nowrap",
                                borderBottom: `3px solid ${active ? GREEN.main : "transparent"}`,
                                color: active ? GREEN.main : "#6B7280",
                                transition: "0.2s",
                                "&:hover": { color: active ? GREEN.main : "#374151" },
                            }}
                        >
                            <TabIcon sx={{ fontSize: "19px" }} />
                            <Typography sx={{ fontSize: "14px", fontWeight: active ? "700" : "600", color: "inherit" }}>
                                {item.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* ─── Scrollable body ─── */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, pb: 3.5 }}>{renderTabContent()}</Box>

            {/* ─── Change trail for one person-day ─── */}
            <Dialog
                open={Boolean(auditFor)}
                onClose={() => setAuditFor(null)}
                maxWidth="md"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
            >
                {auditFor && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                px: 2.5,
                                py: 2,
                                bgcolor: INDIGO.bg,
                                borderBottom: `1px solid ${INDIGO.border}`,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: "10px",
                                    bgcolor: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <ManageHistoryOutlinedIcon sx={{ fontSize: "20px", color: INDIGO.main }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                                    Attendance Change History
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                                    {auditFor.name || auditFor.rollNumber} · {auditFor.rollNumber} · {auditFor.date}
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setAuditFor(null)}>
                                <CloseIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ p: 2.5 }}>
                            {loadingAudit && (
                                <Typography sx={{ textAlign: "center", py: 4, color: "#9CA3AF", fontSize: "13px" }}>
                                    Loading the change trail…
                                </Typography>
                            )}

                            {/* A day nobody edited answers 404 — the server's own wording is shown */}
                            {!loadingAudit && auditEntries.length === 0 && (
                                <Box sx={{ textAlign: "center", py: 5 }}>
                                    <HistoryToggleOffIcon sx={{ fontSize: "38px", color: "#D1D5DB" }} />
                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 1 }}>{auditNote}</Typography>
                                </Box>
                            )}

                            {!loadingAudit && auditEntries.length > 0 && (
                                <TableContainer sx={{ maxHeight: "52vh", border: "1px solid #E5E7EB", borderRadius: "10px" }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                {["WHEN", "FIELD", "FROM", "TO", "ACTION", "BY", "REASON"].map((head) => (
                                                    <TableCell
                                                        key={head}
                                                        sx={{
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                            color: "#374151",
                                                            bgcolor: "#F9FAFB",
                                                            borderBottom: "1px solid #E5E7EB",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {head}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {auditEntries.map((entry) => (
                                                <TableRow key={entry.id} hover>
                                                    <TableCell sx={{ fontSize: "12.5px", color: "#111827", whiteSpace: "nowrap" }}>
                                                        {entry.changedOn || "—"}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", fontWeight: 700, color: "#374151" }}>
                                                        {entry.field || "—"}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: RED.main }}>
                                                        {entry.oldValue === "" ? "—" : String(entry.oldValue)}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: GREEN.main, fontWeight: 700 }}>
                                                        {entry.newValue === "" ? "—" : String(entry.newValue)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {entry.action || entry.source ? (
                                                            <Chip
                                                                label={entry.action || entry.source}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: "#F3F4F6",
                                                                    color: "#374151",
                                                                    fontWeight: "700",
                                                                    fontSize: "10.5px",
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography sx={{ fontSize: "12.5px", color: "#D1D5DB" }}>—</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: "#374151", whiteSpace: "nowrap" }}>
                                                        {entry.changedBy || "—"}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: "#6B7280", maxWidth: 220 }}>
                                                        {entry.reason || "—"}
                                                        {/* Anything the mapper did not recognise is still shown rather than dropped */}
                                                        {entry.extra.map((item) => (
                                                            <Typography key={item.key} sx={{ fontSize: "10.5px", color: "#9CA3AF" }}>
                                                                {item.key}: {item.value}
                                                            </Typography>
                                                        ))}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB" }}>
                            <Button
                                variant="contained"
                                onClick={() => setAuditFor(null)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "50px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    px: 3,
                                    bgcolor: INDIGO.main,
                                    "&:hover": { bgcolor: "#4338CA" },
                                }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* ─── Decline needs a reason, so it is collected before the call ─── */}
            <Dialog
                open={Boolean(declineFor)}
                onClose={() => setDeclineFor(null)}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
            >
                {declineFor && (
                    <>
                        <Box sx={{ px: 2.5, py: 2, bgcolor: RED.bg, borderBottom: `1px solid ${RED.border}` }}>
                            <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>
                                Decline leave request
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                                {declineFor.name} · {declineFor.leaveType} · {declineFor.fromDate} –{" "}
                                {declineFor.toDate}
                            </Typography>
                        </Box>
                        <DialogContent sx={{ p: 2.5 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                autoFocus
                                placeholder="Why is this being declined?"
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                sx={inputSx}
                            />
                            <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mt: 0.8 }}>
                                The reason is shown to the applicant and is required.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB" }}>
                            <Button
                                onClick={() => setDeclineFor(null)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "50px",
                                    border: "1px solid #D1D5DB",
                                    color: "#374151",
                                    fontSize: "13.5px",
                                    fontWeight: "600",
                                    px: 3,
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                disabled={!declineReason.trim() || actioningId === declineFor.leaveApplicationId}
                                onClick={() => actOnLeave(declineFor, "decline", declineReason)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "50px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    px: 3,
                                    bgcolor: RED.main,
                                    "&:hover": { bgcolor: "#B91C1C" },
                                }}
                            >
                                Decline
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <SnackBar
                open={snack.open}
                setOpen={(open) => setSnack((prev) => ({ ...prev, open }))}
                status={snack.ok}
                color={snack.ok}
                message={snack.message}
            />
        </Box>
    );
}
