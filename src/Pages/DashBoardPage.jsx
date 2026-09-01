import React, { useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, Chip, Divider, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Avatar, Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DirectionsBusFilledOutlinedIcon from "@mui/icons-material/DirectionsBusFilledOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";

import { findSubMenuPermissions, hasMainMenuAccess } from "../Redux/Slices/AuthSlice";
import CommonDashboard from "../Components/DashBoardComps/CommonDashboard";
import MasterDashboardSkeleton from "../Components/DashBoardComps/MasterDashboardSkeleton";
import { selectAcademicYear } from "../Redux/Slices/academicYearSlice";
import {
    DASH, RADIUS, KPI_TONES, SOFT, Panel, SolidStatCard, AlertCard, MeterRow, ChartTooltip, EmptyNote,
} from "../Components/DashBoardComps/dashboardTheme";
import {
    MOCK_FEE_TREND, MOCK_FEE_SPLIT, MOCK_GRADE_COLLECTION,
    MOCK_TRANSACTIONS, MOCK_PAYROLL, MOCK_LEAVE_REQUESTS, MOCK_TRANSPORT,
    MOCK_DOC_EXPIRY, MOCK_APPROVAL_QUEUE, MOCK_MY_WORK, MOCK_EVENTS, MOCK_BIRTHDAYS,
    MOCK_NEWS,
} from "../Components/DashBoardComps/dashboardMockData";
import { useMasterDashboard } from "../Components/DashBoardComps/dashboardApi";

// masterDashboard/overview serves three sections only - headline, attendance and
// academics. Finance, Staff, Transport, Operations and Communication have no
// endpoint in the collection yet, so those bands still read the placeholder
// data and are marked "Sample" on screen.
// masterDashboard covers the headline, attendance and academics sections only.
// The bands below have no endpoint in that collection yet, so their figures are
// placeholders and each one says so rather than reading as live data.
const SAMPLE_TAG = (
    <Chip
        label="Sample"
        size="small"
        sx={{ height: 20, fontSize: "10px", fontWeight: 700, bgcolor: DASH.amberLight, color: DASH.amber }}
    />
);

const EMPTY_KPIS = {
    students: 0, studentsTrend: "", studentsSpark: [],
    staff: 0, staffSplit: "", staffSpark: [],
    studentAttendance: 0, studentAttendanceTrend: "", studentAttendanceSpark: [],
    staffAttendance: 0, staffAttendanceNote: "", staffAttendanceSpark: [],
    feeCollected: "", feeOutstanding: "", feeSpark: [],
    pendingApprovals: 0, approvalsNote: "", approvalsSpark: [],
};

/* One exam's marks-entry progress. MeterRow's fixed 78px label truncates exam
   names like "1StMidTermExam" to nothing useful, so this row gives the name the
   free space and keeps the bar and count at a fixed width. */
const MarksRow = ({ exam, entered, total }) => {
    const pct = total > 0 ? Math.min(100, (entered / total) * 100) : 0;
    const color = total > 0 && entered >= total
        ? DASH.green
        : entered > 0
            ? DASH.primary
            : DASH.line;

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 0.65 }}>
            <Tooltip title={exam} arrow placement="top">
                <Typography
                    sx={{
                        fontSize: "12px",
                        color: DASH.text,
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {exam}
                </Typography>
            </Tooltip>
            <Box sx={{ width: 72, height: 5, borderRadius: RADIUS, bgcolor: DASH.lineSoft, flexShrink: 0, overflow: "hidden" }}>
                <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: color, borderRadius: RADIUS }} />
            </Box>
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: entered ? DASH.ink : DASH.faint, width: 58, textAlign: "right", flexShrink: 0 }}>
                {entered}/{total}
            </Typography>
        </Box>
    );
};

const SEVERITY_ICON = {
    critical: ErrorOutlineRoundedIcon,
    warning: WarningAmberRoundedIcon,
    info: InfoOutlinedIcon,
};

// A span, not a Chip - it sits inside the SectionTitle Typography.
const SampleChip = () => (
    <Box
        component="span"
        sx={{
            display: "inline-block", ml: 1, px: 0.7, borderRadius: "20px",
            bgcolor: DASH.lineSoft, color: DASH.faint,
            fontSize: "9px", fontWeight: 800, lineHeight: "15px", verticalAlign: "middle",
        }}
    >
        Sample
    </Box>
);

// Permission keys. "communication", "transport" and "accesscontrol" are confirmed
// against the login response; the rest are the expected names and may need
// correcting once the backend publishes them.
const MODULE_KEYS = {
    fee: "feeandfinance",
    payroll: "leaveandpayroll",
    transport: "transport",
    approvals: "approvals",
};

const FEE_COLORS = [DASH.primary, DASH.blue, DASH.violet, DASH.green];


const statusChipSx = (status) => ({
    height: 20,
    fontSize: "10.5px",
    fontWeight: 700,
    bgcolor: status === "Approved" ? DASH.greenLight : status === "Pending" ? DASH.amberLight : DASH.redLight,
    color: status === "Approved" ? DASH.green : status === "Pending" ? DASH.amber : DASH.red,
});

const SectionTitle = ({ children, icon: Icon }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.2, mt: 1 }}>
        {Icon && <Icon sx={{ fontSize: 16, color: DASH.primary }} />}
        <Typography
            sx={{
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: DASH.muted,
                flexShrink: 0,
            }}
        >
            {children}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: DASH.line }} />
    </Box>
);

export default function DashBoardPage() {
    const navigate = useNavigate();
    const auth = useSelector((state) => state.auth);
    const academicYear = useSelector(selectAcademicYear);
    const permissions = auth.permissions;

    // No RBAC tree at all -> show everything. A tree that exists but lacks the
    // key means the user genuinely has no access to that module.
    const hasModule = (key) => {
        const menus = permissions?.mainMenus;
        if (!Array.isArray(menus) || menus.length === 0) return true;
        // Key absent entirely -> the backend has not published this module yet.
        // Only hide the band when it is published and explicitly grants nothing.
        if (!menus.some((m) => m.mainMenu === key)) return true;
        return hasMainMenuAccess(permissions, key);
    };
    const canViewComm = (sub) =>
        (findSubMenuPermissions(permissions, "communication", sub) || {}).view === "Y";

    /* Which dashboard this role lands on after login is set in Access Control
       (Feature Permissions > Dashboard View) and arrives on the login response as
       newdashboard > newdashboard, where the two flags are meant to be exclusive:

         { defaultdashboardcommon: "N", defaultdashboardmaster: "Y" }

       Common only wins when it is the one explicitly set. Master covers every
       other case - the key missing from an older login response, master chosen,
       neither flag set, or both set by bad data. Master is the safe default
       because its endpoints answer for any role, while every commonDashboard/*
       endpoint refuses a caller who does not hold the common flag. */
    const dashPerms = findSubMenuPermissions(permissions, "newdashboard", "newdashboard");
    const landsOnCommon =
        dashPerms?.defaultdashboardcommon === "Y" && dashPerms?.defaultdashboardmaster !== "Y";
    const showMasterDashboard = !landsOnCommon;

    const showAcademics = canViewComm("homework") || canViewComm("marks") || canViewComm("examtimetable") || canViewComm("attendance");
    const showFinance = hasModule(MODULE_KEYS.fee);
    const showPayroll = hasModule(MODULE_KEYS.payroll);
    const showTransport = hasModule(MODULE_KEYS.transport);
    const showOperations = hasModule(MODULE_KEYS.approvals);

    // The three master sections load in parallel; each one keeps its own error so
    // a single failing endpoint only blanks its own band.
    const { data: master, errors: masterErrors, loading: masterLoading, reload: reloadMaster } = useMasterDashboard({
        rollNumber: auth.rollNumber,
        academicYear,
        workingDays: 6,
    });

    // The first load has nothing to show yet; later refreshes keep the data on
    // screen so the page does not blank out under the user.
    const showSkeleton = masterLoading && !master;

    const kpis = master?.headline?.kpis || EMPTY_KPIS;
    const alerts = master?.headline?.alerts || [];
    const attendanceTrend = master?.attendance?.trend || [];
    const gradeAttendance = master?.attendance?.gradeWise || [];
    const unmarkedClasses = master?.attendance?.unmarkedClasses || [];
    const staffOnLeave = master?.attendance?.staffOnLeave || [];
    const totalClasses = master?.attendance?.totalClasses || 0;
    const markedClasses = master?.attendance?.markedClasses || 0;
    const academicSummary = master?.academics?.summary || {
        homeworkToday: 0, homeworkThisWeek: 0, materialsThisWeek: 0, quizzesActive: 0, quizAverage: 0,
    };
    const upcomingExams = master?.academics?.upcomingExams || [];

    const SECTION_LABELS = { headline: "headline", attendance: "attendance", academics: "academics" };
    const failedSections = Object.keys(masterErrors || {})
        .filter((k) => masterErrors[k])
        .map((k) => SECTION_LABELS[k] || k);

    // Today's marking as two slices, shaped like MOCK_FEE_SPLIT so the card can
    // reuse the Fee Split treatment. Percent is carried per slice for the legend.
    /* 19 exams is a scroll, not a dashboard. The card leads with the totals and
       lists only what still needs work; the rest sits behind the toggle. */
    const [showAllMarks, setShowAllMarks] = useState(false);
    const MARKS_VISIBLE = 6;

    const marksStats = useMemo(() => {
        const rows = (master?.academics?.marksEntry || []).filter((m) => m.total > 0);
        const entered = rows.reduce((sum, m) => sum + m.entered, 0);
        const total = rows.reduce((sum, m) => sum + m.total, 0);
        const done = rows.filter((m) => m.entered >= m.total).length;
        const started = rows.filter((m) => m.entered > 0 && m.entered < m.total).length;
        // Part-entered exams first - those are the ones somebody has to finish.
        // Untouched next, biggest first. Completed exams need no action, so last.
        const rank = (m) => (m.entered >= m.total ? 2 : m.entered > 0 ? 0 : 1);
        const ordered = [...rows].sort((a, b) => rank(a) - rank(b) || b.total - a.total);
        return {
            rows: ordered,
            entered,
            total,
            percent: total ? Math.round((entered / total) * 1000) / 10 : 0,
            done,
            started,
            notStarted: rows.length - done - started,
        };
    }, [master]);

    const attendanceSplit = useMemo(() => {
        if (!totalClasses) return [];
        const done = markedClasses;
        const pending = Math.max(0, totalClasses - done);
        const pct = (n) => Math.round((n / totalClasses) * 100);
        return [
            { name: "Marked", value: done, percent: pct(done), color: DASH.green },
            { name: "Pending", value: pending, percent: pct(pending), color: DASH.red },
        ];
    }, [totalClasses, markedClasses]);

    const feeCollectedAvg = useMemo(() => {
        if (!MOCK_FEE_TREND.length) return 0;
        const total = MOCK_FEE_TREND.reduce((sum, m) => sum + m.collected, 0);
        return Math.round((total / MOCK_FEE_TREND.length) * 10) / 10;
    }, []);

    const greeting = useMemo(() => {
        const hour = dayjs().hour();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    }, []);

    const quickActions = [
        { label: "Create News", path: "/dashboardmenu/news/create", icon: CampaignOutlinedIcon, tone: SOFT.purple, show: canViewComm("news") },
        { label: "Send Circular", path: "/dashboardmenu/circulars/create", icon: ReceiptLongOutlinedIcon, tone: SOFT.green, show: canViewComm("circular") },
        { label: "Add Homework", path: "/dashboardmenu/homework/create", icon: AutoStoriesOutlinedIcon, tone: SOFT.pink, show: canViewComm("homework") },
        { label: "Mark Attendance", path: "/dashboardmenu/attendance", icon: HowToRegOutlinedIcon, tone: SOFT.blue, show: canViewComm("attendance") },
        { label: "Create Quiz", path: "/dashboardmenu/assessment/online-quiz/create", icon: FactCheckOutlinedIcon, tone: SOFT.orange, show: true },
        { label: "Collect Fee", path: "/dashboardmenu/fee", icon: PaymentsOutlinedIcon, tone: SOFT.cyan, show: showFinance },
    ].filter((a) => a.show);

    const header = (
        <Box
            sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                flexDirection: { xs: "column", md: "row" },
                gap: 1.5,
                mb: 2,
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                    {greeting}, {auth.name || "there"}
                </Typography>
                <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                    {dayjs().format("dddd, DD MMMM YYYY")}
                    {academicYear ? ` • Academic Year ${academicYear}` : ""}
                    {auth.userType ? ` • ${auth.userType}` : ""}
                </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            {quickActions.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {quickActions.slice(0, 4).map((a) => (
                        <Button
                            key={a.label}
                            onClick={() => navigate(a.path)}
                            startIcon={<a.icon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: "none",
                                fontSize: "12.5px",
                                fontWeight: 600,
                                color: a.tone.color,
                                bgcolor: a.tone.bg,
                                border: `1px solid ${a.tone.border}`,
                                borderRadius: RADIUS,
                                px: 1.6,
                                "&:hover": { bgcolor: a.tone.hover, borderColor: a.tone.color },
                            }}
                        >
                            {a.label}
                        </Button>
                    ))}
                </Box>
            )}
            </Box>
        </Box>
    );

    // ---------------------------------------------------------------- Tier 1
    if (!showMasterDashboard) {
        return <CommonDashboard header={header} />;
    }

    // ---------------------------------------------------------------- Tier 2
    return (
        <Box sx={{ px: { xs: 1.5, md: 3 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas }}>
            {header}

            {/* Live-data strip: refresh plus whichever sections failed to load */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                <Button
                    onClick={reloadMaster}
                    disabled={masterLoading}
                    startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
                    sx={{
                        textTransform: "none", fontSize: "12px", fontWeight: 600, color: DASH.text,
                        bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.4, py: 0.3,
                        "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                    }}
                >
                    {masterLoading ? "Refreshing..." : "Refresh"}
                </Button>
                {failedSections.length > 0 && (
                    <Typography sx={{ fontSize: "11.5px", color: DASH.red }}>
                        Could not load: {failedSections.join(", ")}
                    </Typography>
                )}
            </Box>

            {showSkeleton ? <MasterDashboardSkeleton /> : (
            <>

            {/* Band 1 - KPI strip: 3 across on desktop, 2 on tablet, 1 on mobile */}
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SolidStatCard icon={GroupsOutlinedIcon} label="Students"
                        value={kpis.students.toLocaleString("en-IN")}
                        note={kpis.studentsTrend} tone={KPI_TONES.orange}
                        onClick={() => navigate("/dashboardmenu/profile/student")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SolidStatCard icon={BadgeOutlinedIcon} label="Staff" value={kpis.staff}
                        note={kpis.staffSplit} tone={KPI_TONES.violet}
                        onClick={() => navigate("/dashboardmenu/profile/staff")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SolidStatCard icon={HowToRegOutlinedIcon} label="Student Attendance"
                        value={`${kpis.studentAttendance}%`}
                        note={kpis.studentAttendanceTrend} tone={KPI_TONES.pink}
                        onClick={() => navigate("/dashboardmenu/attendance")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SolidStatCard icon={EventAvailableOutlinedIcon} label="Staff Attendance"
                        value={`${kpis.staffAttendance}%`}
                        note={kpis.staffAttendanceNote} tone={KPI_TONES.cyan} />
                </Grid>
            </Grid>

            {/* Band 0 - Needs Attention */}
            <Box
                sx={{
                    bgcolor: "#FFFFFF",
                    border: `1px solid ${DASH.line}`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    mb: 2,
                }}
            >
                {/* ================= HEADER ================= */}
                <Box
                    sx={{
                        minHeight: 40,
                        px: 1.8,

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",

                        borderBottom: `1px solid ${DASH.lineSoft}`,
                    }}
                >
                    {/* Left side */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                        }}
                    >
                        <WarningAmberRoundedIcon
                            sx={{
                                fontSize: 18,
                                color: DASH.amber,
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: "13.5px",
                                fontWeight: 700,
                                color: DASH.ink,
                            }}
                        >
                            Needs Attention
                        </Typography>

                        {/* 5 items badge */}
                        <Box
                            sx={{
                                px: 0.9,
                                py: 0.25,
                                borderRadius: "10px",
                                bgcolor: DASH.amberLight,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    color: DASH.amber,
                                }}
                            >
                                {alerts.length} item{alerts.length === 1 ? "" : "s"}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right side */}
                    <Button
                        size="small"
                        sx={{
                            minWidth: 0,
                            p: 0.5,

                            textTransform: "none",
                            fontSize: "11px",
                            fontWeight: 700,

                            color: DASH.blue,

                            "&:hover": {
                                bgcolor: DASH.blueLight,
                            },
                        }}
                    >
                        View All →
                    </Button>
                </Box>

                {/* ================= ALERT CARDS ================= */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                            lg: `repeat(${Math.min(5, Math.max(1, alerts.length))}, minmax(0, 1fr))`,
                        },
                        gap: 1.2,
                        p: 1.2,
                    }}
                >
                    {alerts.length === 0 && (
                        <EmptyNote text={masterErrors.headline || "Nothing needs attention right now."} />
                    )}
                    {alerts.map((a) => (
                        <AlertCard
                            key={a.key}
                            icon={SEVERITY_ICON[a.severity] || InfoOutlinedIcon}
                            count={a.count}
                            label={a.label}
                            severity={a.severity}
                            onClick={a.path ? () => navigate(a.path) : undefined}
                        />
                    ))}
                </Box>
            </Box>

            {/* Band 2 - Attendance */}
            <SectionTitle icon={HowToRegOutlinedIcon}>Attendance</SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                    <Panel title="Attendance Trend" subtitle="Last 6 working days" accent={DASH.green} sx={{ height: "100%" }}>
                        {attendanceTrend.length === 0 ? (
                            <EmptyNote text={masterErrors.attendance || (masterLoading ? "Loading..." : "No attendance recorded yet.")} />
                        ) : (
                        <Box sx={{ height: 230 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={attendanceTrend}>
                                    <defs>
                                        <linearGradient id="dashStudentFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={DASH.green} stopOpacity={0.32} />
                                            <stop offset="100%" stopColor={DASH.green} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dashStaffFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={DASH.cyan} stopOpacity={0.22} />
                                            <stop offset="100%" stopColor={DASH.cyan} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke={DASH.lineSoft} vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} dy={4} />
                                    <YAxis domain={[80, 100]} ticks={[80, 85, 90, 95, 100]} tickFormatter={(v) => `${v}%`}
                                        tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} width={38} />
                                    <ReTooltip content={<ChartTooltip suffix="%" />} cursor={{ stroke: DASH.line, strokeWidth: 1 }} />
                                    <Legend wrapperStyle={{ fontSize: "11.5px", paddingTop: 6 }} iconType="circle" iconSize={8} />
                                    <Area type="monotone" dataKey="students" name="Students" stroke={DASH.green}
                                        strokeWidth={2.4} strokeLinecap="round" fill="url(#dashStudentFill)"
                                        dot={{ r: 3, fill: "#fff", stroke: DASH.green, strokeWidth: 2 }}
                                        activeDot={{ r: 5, strokeWidth: 2 }} />
                                    <Area type="monotone" dataKey="staff" name="Staff" stroke={DASH.cyan}
                                        strokeWidth={2.4} strokeLinecap="round" fill="url(#dashStaffFill)"
                                        dot={{ r: 3, fill: "#fff", stroke: DASH.cyan, strokeWidth: 2 }}
                                        activeDot={{ r: 5, strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                        )}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel title="Grade-wise Today" accent={DASH.green} sx={{ height: "100%" }}>
                        {gradeAttendance.length === 0 && (
                            <EmptyNote text={masterErrors.attendance || (masterLoading ? "Loading..." : "No class marked yet today.")} />
                        )}
                        {gradeAttendance.map((g) => (
                            <MeterRow key={g.grade} label={g.grade} value={g.present}
                                color={g.present >= 95 ? DASH.green : g.present >= 90 ? DASH.primary : DASH.red} />
                        ))}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel
                        title="Attendance Marked"
                        accent={DASH.green}
                        subtitle={totalClasses ? `${markedClasses} of ${totalClasses} classes done` : ""}
                        sx={{ height: "100%" }}
                    >
                        {attendanceSplit.length === 0 ? (
                            <EmptyNote text={masterErrors.attendance || (masterLoading ? "Loading..." : "No class list for today.")} />
                        ) : (
                        <>
                        <Box sx={{ height: 150 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={attendanceSplit} dataKey="value" nameKey="name"
                                        innerRadius={38} outerRadius={60} paddingAngle={3} stroke="none">
                                        {attendanceSplit.map((s2) => (
                                            <Cell key={s2.name} fill={s2.color} />
                                        ))}
                                    </Pie>
                                    <ReTooltip content={<ChartTooltip suffix=" classes" />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>

                        <Box sx={{ mt: 0.5 }}>
                            {attendanceSplit.map((s2) => (
                                <Box key={s2.name} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.3 }}>
                                    <Box sx={{ width: 9, height: 9, borderRadius: "2px", bgcolor: s2.color, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "11.5px", color: DASH.text, flex: 1, minWidth: 0 }}>{s2.name}</Typography>
                                    <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.ink }}>{s2.percent}%</Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Still actionable - the classes behind the red slice */}
                        {unmarkedClasses.length > 0 && (
                            <Typography
                                onClick={() => navigate("/dashboardmenu/attendance")}
                                sx={{ fontSize: "11px", fontWeight: 700, color: DASH.primary, cursor: "pointer", pt: 0.9 }}
                            >
                                View {unmarkedClasses.length} pending
                            </Typography>
                        )}
                        </>
                        )}
                    </Panel>
                </Grid>
            </Grid>

            {/* Band 3 - Academics */}
            {showAcademics && (
                <>
                    <SectionTitle icon={AutoStoriesOutlinedIcon}>Academics</SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Panel title="At a Glance" accent={DASH.violet} sx={{ height: "100%" }}>
                                {[
                                    ["Homework assigned today", academicSummary.homeworkToday],
                                    ["Homework this week", academicSummary.homeworkThisWeek],
                                    ["Materials this week", academicSummary.materialsThisWeek],
                                    ["Quizzes active", academicSummary.quizzesActive],
                                    ["Quiz average", `${academicSummary.quizAverage}%`],
                                ].map(([k, v]) => (
                                    <Box key={k} sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 0.8, borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" } }}>
                                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>{k}</Typography>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>{v}</Typography>
                                    </Box>
                                ))}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <Panel title="Upcoming Exams" subtitle="Next 7 days" accent={DASH.violet} sx={{ height: "100%" }}>
                                {upcomingExams.length === 0 && <EmptyNote text="No exams scheduled." />}
                                {upcomingExams.map((e) => (
                                    <Box key={e.id} sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 1, borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" } }}>
                                        <AutoStoriesOutlinedIcon sx={{ fontSize: 17, color: DASH.violet, flexShrink: 0 }} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</Typography>
                                            <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{e.grade}</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.muted, flexShrink: 0 }}>{e.date}</Typography>
                                    </Box>
                                ))}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 5 }}>
                            <Panel
                                title="Marks Entry Status"
                                subtitle={marksStats.rows.length
                                    ? `${marksStats.entered} of ${marksStats.total} subjects entered`
                                    : "Subjects entered vs total"}
                                accent={DASH.violet}
                                sx={{ height: "100%" }}
                                right={marksStats.rows.length > MARKS_VISIBLE && (
                                    <Button
                                        onClick={() => setShowAllMarks((v) => !v)}
                                        sx={{
                                            textTransform: "none",
                                            fontSize: "11.5px",
                                            fontWeight: 700,
                                            minWidth: 0,
                                            px: 1,
                                            height: 26,
                                            borderRadius: RADIUS,
                                            color: DASH.violet,
                                            "&:hover": { bgcolor: DASH.violetLight },
                                        }}
                                    >
                                        {showAllMarks ? "Show less" : `All ${marksStats.rows.length}`}
                                    </Button>
                                )}
                            >
                                {marksStats.rows.length === 0 ? (
                                    <EmptyNote text={masterErrors.academics || (masterLoading ? "Loading..." : "No marks entry in progress.")} />
                                ) : (
                                    <>
                                        {/* Overall progress first - the individual exams are the detail */}
                                        <Box sx={{ mb: 1.4 }}>
                                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.7 }}>
                                                <Typography sx={{ fontSize: "22px", fontWeight: 700, color: DASH.ink, lineHeight: 1 }}>
                                                    {marksStats.percent}%
                                                </Typography>
                                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                                    of all subjects entered
                                                </Typography>
                                            </Box>
                                            <Box sx={{ height: 6, borderRadius: RADIUS, bgcolor: DASH.lineSoft, overflow: "hidden" }}>
                                                <Box sx={{ width: `${marksStats.percent}%`, height: "100%", bgcolor: DASH.violet, borderRadius: RADIUS }} />
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap", mb: 1.2 }}>
                                            {[
                                                { label: "In progress", value: marksStats.started, color: DASH.primary, bg: DASH.primaryLight },
                                                { label: "Not started", value: marksStats.notStarted, color: DASH.muted, bg: DASH.lineSoft },
                                                { label: "Complete", value: marksStats.done, color: DASH.green, bg: DASH.greenLight },
                                            ].map((chip) => (
                                                <Chip
                                                    key={chip.label}
                                                    size="small"
                                                    label={`${chip.value} ${chip.label}`}
                                                    sx={{ height: 21, fontSize: "10.5px", fontWeight: 700, borderRadius: RADIUS, bgcolor: chip.bg, color: chip.color }}
                                                />
                                            ))}
                                        </Box>

                                        {/* Capped so this card can never outgrow the two beside it */}
                                        <Box sx={{ maxHeight: showAllMarks ? 208 : "none", overflowY: showAllMarks ? "auto" : "visible", pr: showAllMarks ? 0.5 : 0 }}>
                                            {(showAllMarks ? marksStats.rows : marksStats.rows.slice(0, MARKS_VISIBLE)).map((m) => (
                                                <MarksRow key={m.exam} exam={m.exam} entered={m.entered} total={m.total} />
                                            ))}
                                        </Box>

                                        {!showAllMarks && marksStats.rows.length > MARKS_VISIBLE && (
                                            <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.8 }}>
                                                +{marksStats.rows.length - MARKS_VISIBLE} more exams
                                            </Typography>
                                        )}
                                    </>
                                )}
                            </Panel>
                        </Grid>
                    </Grid>
                </>
            )}

            {/* Band 4 - Fee & Finance */}
            {showFinance && (
                <>
                    <SectionTitle icon={PaymentsOutlinedIcon}>Fee &amp; Finance <SampleChip /></SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 12, md: 7, lg: 5 }}>
                            <Panel title="Monthly Collection" subtitle="In lakhs - last 6 months" accent={DASH.amber} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                                <Box sx={{ height: 230 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={MOCK_FEE_TREND} barGap={4}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                            <ReTooltip content={<ChartTooltip suffix="L" />} cursor={{ fill: DASH.primaryLight }} />
                                            <ReferenceLine
                                                y={feeCollectedAvg}
                                                stroke={DASH.muted}
                                                strokeDasharray="4 4"
                                                label={{
                                                    value: `Avg ${feeCollectedAvg}L`,
                                                    position: "insideTopRight",
                                                    fill: DASH.muted,
                                                    fontSize: 10.5,
                                                }}
                                            />
                                            <Bar dataKey="collected" name="Collected" fill={DASH.primary} radius={[5, 5, 0, 0]} maxBarSize={38} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 5, lg: 3 }}>
                            <Panel title="Fee Split" accent={DASH.amber} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                                <Box sx={{ height: 150 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={MOCK_FEE_SPLIT} dataKey="value" nameKey="name" innerRadius={38} outerRadius={60} paddingAngle={3} stroke="none">
                                                {MOCK_FEE_SPLIT.map((s, i) => (
                                                    <Cell key={s.name} fill={FEE_COLORS[i % FEE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ReTooltip content={<ChartTooltip suffix="%" />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Box sx={{ mt: 0.5 }}>
                                    {MOCK_FEE_SPLIT.map((s, i) => (
                                        <Box key={s.name} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.3 }}>
                                            <Box sx={{ width: 9, height: 9, borderRadius: "2px", bgcolor: FEE_COLORS[i % FEE_COLORS.length], flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: "11.5px", color: DASH.text, flex: 1, minWidth: 0 }}>{s.name}</Typography>
                                            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.ink }}>{s.value}%</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 12, lg: 4 }}>
                            <Panel title="Grade-wise Collection" accent={DASH.amber} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                                {MOCK_GRADE_COLLECTION.map((g) => (
                                    <MeterRow key={g.grade} label={g.grade} value={g.collected}
                                        color={g.collected >= 85 ? DASH.green : g.collected >= 70 ? DASH.primary : DASH.red} />
                                ))}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Panel
                                title="Recent Transactions"
                                right={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {SAMPLE_TAG}
                                    <Button
                                        onClick={() => navigate("/dashboardmenu/fee")}
                                        endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                                        sx={{ textTransform: "none", fontSize: "12px", fontWeight: 700, color: DASH.blue }}
                                    >
                                        View All
                                    </Button>
                                    </Box>
                                }
                            >
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                {["Student", "Grade", "Amount", "Mode", "Approval", "Time"].map((h) => (
                                                    <TableCell key={h} sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, bgcolor: DASH.surface, borderBottom: `1px solid ${DASH.line}`, whiteSpace: "nowrap" }}>
                                                        {h}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {MOCK_TRANSACTIONS.map((t) => (
                                                <TableRow key={t.id} hover>
                                                    <TableCell sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink, borderBottom: `1px solid ${DASH.lineSoft}` }}>{t.student}</TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: DASH.text, borderBottom: `1px solid ${DASH.lineSoft}` }}>{t.grade}</TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink, borderBottom: `1px solid ${DASH.lineSoft}` }}>₹{t.amount}</TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: DASH.text, borderBottom: `1px solid ${DASH.lineSoft}` }}>{t.mode}</TableCell>
                                                    <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                        <Chip label={t.status} size="small" sx={statusChipSx(t.status)} />
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "11.5px", color: DASH.faint, whiteSpace: "nowrap", borderBottom: `1px solid ${DASH.lineSoft}` }}>{t.time}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Panel>
                        </Grid>
                    </Grid>
                </>
            )}

            {/* Band 5 - Staff & Payroll */}
            {showPayroll && (
                <>
                    <SectionTitle icon={BadgeOutlinedIcon}>Staff &amp; Payroll <SampleChip /></SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <Panel title="Payroll Status" subtitle={MOCK_PAYROLL.month} accent={DASH.cyan} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                                <MeterRow label="Processed" value={MOCK_PAYROLL.processed} max={MOCK_PAYROLL.total} right={`${MOCK_PAYROLL.processed}/${MOCK_PAYROLL.total}`} color={DASH.green} />
                                <MeterRow label="Pending" value={MOCK_PAYROLL.pending} max={MOCK_PAYROLL.total} right={`${MOCK_PAYROLL.pending}/${MOCK_PAYROLL.total}`} color={DASH.amber} />
                                <MeterRow label="Credited" value={MOCK_PAYROLL.credited} max={MOCK_PAYROLL.total} right={`${MOCK_PAYROLL.credited}/${MOCK_PAYROLL.total}`} color={DASH.blue} />
                                <Divider sx={{ my: 1.2 }} />
                                <Button
                                    onClick={() => navigate("/dashboardmenu/Leave/payroll")}
                                    sx={{ textTransform: "none", fontSize: "12.5px", fontWeight: 700, color: DASH.blue, p: 0 }}
                                >
                                    Open Payroll
                                </Button>
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <Panel title="Pending Leave Requests" accent={DASH.cyan} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                                {MOCK_LEAVE_REQUESTS.length === 0 && <EmptyNote text="No pending requests." />}
                                {MOCK_LEAVE_REQUESTS.map((l) => (
                                    <Box key={l.id} sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 0.9, borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" } }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }}>{l.name}</Typography>
                                            <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{l.role} • from {l.from}</Typography>
                                        </Box>
                                        <Chip label={`${l.days}d`} size="small" sx={{ height: 20, fontSize: "10.5px", fontWeight: 700, bgcolor: DASH.amberLight, color: DASH.amber }} />
                                    </Box>
                                ))}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                            <Panel title="On Leave Today" accent={DASH.cyan} sx={{ height: "100%" }}>
                                {staffOnLeave.length === 0 && <EmptyNote text="Full attendance today." />}
                                {staffOnLeave.map((s) => (
                                    <Box key={s.id} sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 0.9 }}>
                                        <Avatar sx={{ width: 30, height: 30, fontSize: "11px", fontWeight: 700, bgcolor: DASH.violetLight, color: DASH.violet }}>
                                            {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }}>{s.name}</Typography>
                                            <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{s.role}</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: "11px", color: DASH.muted, flexShrink: 0 }}>{s.type}</Typography>
                                    </Box>
                                ))}
                            </Panel>
                        </Grid>
                    </Grid>
                </>
            )}

            {/* Band 6 - Transport */}
            {showTransport && (
                <>
                    <SectionTitle icon={DirectionsBusFilledOutlinedIcon}>Transport <SampleChip /></SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <Panel title="Fleet Today" accent={DASH.blue} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                                <MeterRow label="Vehicles" value={MOCK_TRANSPORT.vehiclesRunning} max={MOCK_TRANSPORT.vehiclesTotal}
                                    right={`${MOCK_TRANSPORT.vehiclesRunning}/${MOCK_TRANSPORT.vehiclesTotal}`} color={DASH.green} />
                                <MeterRow label="Students" value={MOCK_TRANSPORT.studentsMapped} max={MOCK_TRANSPORT.studentsTotal}
                                    right={`${MOCK_TRANSPORT.studentsMapped}/${MOCK_TRANSPORT.studentsTotal}`} color={DASH.blue} />
                                <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                                    <Chip label={`${MOCK_TRANSPORT.routesActive} routes active`} size="small" sx={{ height: 22, fontSize: "11px", fontWeight: 700, bgcolor: DASH.blueLight, color: DASH.blue }} />
                                    {MOCK_TRANSPORT.routesNoDriver > 0 && (
                                        <Chip label={`${MOCK_TRANSPORT.routesNoDriver} route without driver`} size="small" sx={{ height: 22, fontSize: "11px", fontWeight: 700, bgcolor: DASH.redLight, color: DASH.red }} />
                                    )}
                                </Box>
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 8, lg: 8 }}>
                            <Panel title="Documents Expiring" subtitle="Next 30 days" accent={DASH.red} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                                {MOCK_DOC_EXPIRY.length === 0 && <EmptyNote text="No documents expiring soon." />}
                                {MOCK_DOC_EXPIRY.map((d) => (
                                    <Box
                                        key={d.id}
                                        onClick={() => navigate("/dashboardmenu/transport")}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 1.2, py: 1, cursor: "pointer",
                                            borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" },
                                            "&:hover": { bgcolor: DASH.amberLight },
                                        }}
                                    >
                                        <DirectionsBusFilledOutlinedIcon sx={{ fontSize: 18, color: DASH.amber, flexShrink: 0 }} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }}>{d.vehicle}</Typography>
                                            <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{d.doc}</Typography>
                                        </Box>
                                        <Chip
                                            label={`${d.days} days`}
                                            size="small"
                                            sx={{ height: 21, fontSize: "10.5px", fontWeight: 700, bgcolor: d.days <= 10 ? DASH.redLight : DASH.amberLight, color: d.days <= 10 ? DASH.red : DASH.amber }}
                                        />
                                    </Box>
                                ))}
                            </Panel>
                        </Grid>
                    </Grid>
                </>
            )}

            {/* Band 7 + 8 - Operations and Communication */}
            <SectionTitle icon={FactCheckOutlinedIcon}>Operations &amp; Communication <SampleChip /></SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                {showOperations && (
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                        <Panel title="Approval Queue" accent={DASH.primary} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                            {MOCK_APPROVAL_QUEUE.map((a) => (
                                <Box
                                    key={a.type}
                                    onClick={() => navigate("/dashboardmenu/approvals")}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1.2, py: 0.8, cursor: "pointer",
                                        borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" },
                                        "&:hover": { bgcolor: DASH.surface },
                                    }}
                                >
                                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: a.color, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.text, flex: 1, minWidth: 0 }}>{a.type}</Typography>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink }}>{a.count}</Typography>
                                </Box>
                            ))}
                        </Panel>
                    </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel title="My Work" accent={DASH.primary} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                        {[
                            // Drafts row is off with the draft routes - it would navigate nowhere.
                            // ["Drafts", MOCK_MY_WORK.drafts, "/dashboardmenu/draft"],
                            ["Awaiting approval", MOCK_MY_WORK.awaitingApproval, "/dashboardmenu/status"],
                            ["Work done", MOCK_MY_WORK.workDone, "/dashboardmenu/workdone"],
                        ].map(([label, count, path]) => (
                            <Box
                                key={label}
                                onClick={() => navigate(path)}
                                sx={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, py: 1,
                                    cursor: "pointer", borderBottom: `1px solid ${DASH.lineSoft}`,
                                    "&:last-of-type": { borderBottom: "none" }, "&:hover": { bgcolor: DASH.surface },
                                }}
                            >
                                <Typography sx={{ fontSize: "12.5px", color: DASH.text }}>{label}</Typography>
                                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>{count}</Typography>
                            </Box>
                        ))}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel title="News & Circulars" accent={DASH.blue} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                        {MOCK_NEWS.map((n) => (
                            <Box key={n.id} sx={{ display: "flex", alignItems: "flex-start", gap: 1.1, py: 0.9, borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" } }}>
                                <CampaignOutlinedIcon sx={{ fontSize: 16, color: DASH.primary, flexShrink: 0, mt: 0.2 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</Typography>
                                    <Typography sx={{ fontSize: "10.5px", color: DASH.faint }}>{n.kind} • {n.posted}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel title="Events & Birthdays" accent={DASH.pink} right={SAMPLE_TAG} sx={{ height: "100%" }}>
                        {MOCK_EVENTS.slice(0, 2).map((e) => (
                            <Box key={e.id} sx={{ display: "flex", alignItems: "center", gap: 1.1, py: 0.8 }}>
                                <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: DASH.blue, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: "12.5px", color: DASH.ink, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</Typography>
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, flexShrink: 0 }}>{e.date}</Typography>
                            </Box>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        {MOCK_BIRTHDAYS.map((b) => (
                            <Box key={b.id} sx={{ display: "flex", alignItems: "center", gap: 1.1, py: 0.7 }}>
                                <CakeOutlinedIcon sx={{ fontSize: 16, color: DASH.pink, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: "12.5px", color: DASH.ink, flex: 1, minWidth: 0 }}>{b.name}</Typography>
                                <Typography sx={{ fontSize: "10.5px", color: DASH.faint, flexShrink: 0 }}>{b.detail}</Typography>
                            </Box>
                        ))}
                    </Panel>
                </Grid>
            </Grid>

            {/* Band 9 - Quick actions */}
            {quickActions.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Panel title="Quick Actions" accent={DASH.primary}>
                        <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                            {quickActions.map((a) => (
                                <Button
                                    key={a.label}
                                    onClick={() => navigate(a.path)}
                                    startIcon={<a.icon sx={{ fontSize: 17 }} />}
                                    sx={{
                                        textTransform: "none",
                                        fontSize: "12.5px",
                                        fontWeight: 600,
                                        color: a.tone.color,
                                        bgcolor: a.tone.bg,
                                        border: `1px solid ${a.tone.border}`,
                                        borderRadius: RADIUS,
                                        px: 1.8,
                                        py: 0.7,
                                        "&:hover": { bgcolor: a.tone.hover, borderColor: a.tone.color },
                                    }}
                                >
                                    {a.label}
                                </Button>
                            ))}
                        </Box>
                    </Panel>
                </Box>
            )}

            </>
            )}
        </Box>
    );
}
