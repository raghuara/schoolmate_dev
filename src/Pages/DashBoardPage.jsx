import React, { useMemo } from "react";
import {
    Box, Grid, Typography, Button, Chip, Divider, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Line,
    XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend,
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

import { findSubMenuPermissions, hasMainMenuAccess } from "../Redux/Slices/AuthSlice";
import { selectAcademicYear } from "../Redux/Slices/academicYearSlice";
import {
    DASH, RADIUS, KPI_TONES, SOFT, Panel, SolidStatCard, AlertCard, MeterRow, ChartTooltip, EmptyNote,
} from "../Components/DashBoardComps/dashboardTheme";
import {
    MOCK_ALERTS, MOCK_KPIS, MOCK_ATTENDANCE_TREND, MOCK_GRADE_ATTENDANCE,
    MOCK_UNMARKED_CLASSES, MOCK_STAFF_ON_LEAVE, MOCK_UPCOMING_EXAMS, MOCK_MARKS_ENTRY,
    MOCK_ACADEMIC_SUMMARY, MOCK_FEE_TREND, MOCK_FEE_SPLIT, MOCK_GRADE_COLLECTION,
    MOCK_TRANSACTIONS, MOCK_PAYROLL, MOCK_LEAVE_REQUESTS, MOCK_TRANSPORT,
    MOCK_DOC_EXPIRY, MOCK_APPROVAL_QUEUE, MOCK_MY_WORK, MOCK_EVENTS, MOCK_BIRTHDAYS,
    MOCK_NEWS, MOCK_MY_ACTIONS,
} from "../Components/DashBoardComps/dashboardMockData";

// Permission keys. "communication", "transport" and "accesscontrol" are confirmed
// against the login response; the rest are the expected names and may need
// correcting once the backend publishes them.
const MODULE_KEYS = {
    fee: "feemanagement",
    payroll: "leaveandpayroll",
    transport: "transport",
    approvals: "approvals",
};

const FEE_COLORS = [DASH.primary, DASH.blue, DASH.violet, DASH.green];

const severityIcon = (severity) =>
    severity === "critical" ? ErrorOutlineRoundedIcon : severity === "info" ? InfoOutlinedIcon : WarningAmberRoundedIcon;

const statusChipSx = (status) => ({
    height: 20,
    fontSize: "10.5px",
    fontWeight: 700,
    bgcolor: status === "Completed" ? DASH.greenLight : status === "Pending" ? DASH.amberLight : DASH.redLight,
    color: status === "Completed" ? DASH.green : status === "Pending" ? DASH.amber : DASH.red,
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
        return hasMainMenuAccess(permissions, key);
    };
    const canViewComm = (sub) =>
        (findSubMenuPermissions(permissions, "communication", sub) || {}).view === "Y";

    // The "dashboard > overview" key does not exist yet. Until it does, treat a
    // missing key as full access so nobody loses the dashboard.
    const dashPerms = findSubMenuPermissions(permissions, "dashboard", "overview");
    const isFullDashboard = !dashPerms || dashPerms.view === "Y";

    const showAcademics = canViewComm("homework") || canViewComm("marks") || canViewComm("examtimetable") || canViewComm("attendance");
    const showFinance = hasModule(MODULE_KEYS.fee);
    const showPayroll = hasModule(MODULE_KEYS.payroll);
    const showTransport = hasModule(MODULE_KEYS.transport);
    const showOperations = hasModule(MODULE_KEYS.approvals);

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
    );

    // ---------------------------------------------------------------- Tier 1
    if (!isFullDashboard) {
        return (
            <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "calc(100vh - 60px)" }}>
                {header}
                <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <Panel title="My Pending Actions" subtitle="Items assigned to you" sx={{ height: "100%" }}>
                            {MOCK_MY_ACTIONS.length === 0 && <EmptyNote text="Nothing pending. You are all caught up." />}
                            {MOCK_MY_ACTIONS.map((a) => {
                                const Icon = severityIcon(a.severity);
                                return (
                                    <Box
                                        key={a.id}
                                        onClick={() => navigate(a.path)}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 1.2, p: 1.2, mb: 1,
                                            border: `1px solid ${DASH.lineSoft}`, borderRadius: RADIUS, cursor: "pointer",
                                            "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 18, color: a.severity === "critical" ? DASH.red : a.severity === "info" ? DASH.blue : DASH.amber, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: "13px", color: DASH.ink, flex: 1, minWidth: 0 }}>{a.label}</Typography>
                                        <Chip label={a.due} size="small" sx={{ height: 20, fontSize: "10.5px", fontWeight: 700, bgcolor: DASH.lineSoft, color: DASH.muted }} />
                                    </Box>
                                );
                            })}
                        </Panel>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <Panel title="News & Circulars" sx={{ height: "100%" }}>
                            {MOCK_NEWS.map((n) => (
                                <Box key={n.id} sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 1, borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" } }}>
                                    <CampaignOutlinedIcon sx={{ fontSize: 17, color: DASH.primary, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: "13px", color: DASH.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</Typography>
                                        <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{n.kind} • {n.posted}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Panel>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <Panel title="Today's Birthdays" sx={{ height: "100%" }}>
                            {MOCK_BIRTHDAYS.map((b) => (
                                <Box key={b.id} sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 0.9 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: DASH.pinkLight, color: DASH.pink }}>
                                        <CakeOutlinedIcon sx={{ fontSize: 17 }} />
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.ink }}>{b.name}</Typography>
                                        <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{b.detail}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Panel>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <Panel title="Upcoming Events" sx={{ height: "100%" }}>
                            {MOCK_EVENTS.map((e) => (
                                <Box key={e.id} sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 1, borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" } }}>
                                    <CalendarMonthOutlinedIcon sx={{ fontSize: 17, color: DASH.blue, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "13px", color: DASH.ink, flex: 1, minWidth: 0 }}>{e.name}</Typography>
                                    <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.muted }}>{e.date}</Typography>
                                </Box>
                            ))}
                        </Panel>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // ---------------------------------------------------------------- Tier 2
    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "calc(100vh - 60px)" }}>
            {header}

            {/* Band 1 - KPI strip: 3 across on desktop, 2 on tablet, 1 on mobile */}
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SolidStatCard icon={GroupsOutlinedIcon} label="Students"
                        value={MOCK_KPIS.students.toLocaleString("en-IN")}
                        note={`+${MOCK_KPIS.studentsTrend}`} tone={KPI_TONES.orange}
                        onClick={() => navigate("/dashboardmenu/profile/student")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SolidStatCard icon={BadgeOutlinedIcon} label="Staff" value={MOCK_KPIS.staff}
                        note={MOCK_KPIS.staffSplit} tone={KPI_TONES.violet}
                        onClick={() => navigate("/dashboardmenu/profile/staff")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SolidStatCard icon={HowToRegOutlinedIcon} label="Student Attendance"
                        value={`${MOCK_KPIS.studentAttendance}%`}
                        note={`+${MOCK_KPIS.studentAttendanceTrend}`} tone={KPI_TONES.pink}
                        onClick={() => navigate("/dashboardmenu/attendance")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SolidStatCard icon={EventAvailableOutlinedIcon} label="Staff Attendance"
                        value={`${MOCK_KPIS.staffAttendance}%`}
                        note={MOCK_KPIS.staffAttendanceNote} tone={KPI_TONES.cyan} />
                </Grid>
                {showFinance && (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <SolidStatCard icon={PaymentsOutlinedIcon} label="Fee This Month"
                            value={`₹${MOCK_KPIS.feeCollected}`}
                            note={MOCK_KPIS.feeOutstanding} tone={KPI_TONES.blue}
                            onClick={() => navigate("/dashboardmenu/fee")} />
                    </Grid>
                )}
                {showOperations && (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <SolidStatCard icon={FactCheckOutlinedIcon} label="Pending Approvals"
                            value={MOCK_KPIS.pendingApprovals}
                            note={MOCK_KPIS.approvalsNote} tone={KPI_TONES.green}
                            onClick={() => navigate("/dashboardmenu/approvals")} />
                    </Grid>
                )}
            </Grid>

            {/* Band 0 - Needs Attention */}
            {MOCK_ALERTS.length > 0 && (
                <Box
                    sx={{
                        bgcolor: "#fff",
                        border: `1px solid ${DASH.line}`,
                        borderRadius: RADIUS,
                        p: 1.5,
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.4 }}>
                        <WarningAmberRoundedIcon sx={{ fontSize: 18, color: DASH.amber }} />
                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                            Needs Attention
                        </Typography>
                        <Chip
                            label={`${MOCK_ALERTS.length} items`}
                            size="small"
                            sx={{ height: 20, fontSize: "10.5px", fontWeight: 700, bgcolor: DASH.lineSoft, color: DASH.muted }}
                        />
                        <Box sx={{ flex: 1, height: "1px", bgcolor: DASH.lineSoft, ml: 0.5 }} />
                    </Box>
                    <Grid container spacing={1.5} sx={{ alignItems: "stretch" }}>
                        {MOCK_ALERTS.map((a) => (
                            <Grid key={a.key} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                                <AlertCard
                                    icon={severityIcon(a.severity)}
                                    count={a.count}
                                    label={a.label}
                                    severity={a.severity}
                                    onClick={() => navigate(a.path)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Band 2 - Attendance */}
            <SectionTitle icon={HowToRegOutlinedIcon}>Attendance</SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                    <Panel title="Attendance Trend" subtitle="Last 6 working days" sx={{ height: "100%" }}>
                        <Box sx={{ height: 230 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_ATTENDANCE_TREND}>
                                    <defs>
                                        <linearGradient id="dashStudentFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={DASH.green} stopOpacity={0.6} />
                                            <stop offset="95%" stopColor={DASH.green} stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                    <ReTooltip content={<ChartTooltip suffix="%" />} />
                                    <Legend wrapperStyle={{ fontSize: "11.5px" }} />
                                    <Area type="monotone" dataKey="students" name="Students" stroke={DASH.green} strokeWidth={2.5} fill="url(#dashStudentFill)" />
                                    <Line type="monotone" dataKey="staff" name="Staff" stroke={DASH.cyan} strokeWidth={2} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel title="Grade-wise Today" sx={{ height: "100%" }}>
                        {MOCK_GRADE_ATTENDANCE.map((g) => (
                            <MeterRow key={g.grade} label={g.grade} value={g.present}
                                color={g.present >= 95 ? DASH.green : g.present >= 90 ? DASH.primary : DASH.red} />
                        ))}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Panel
                        title="Not Marked Yet"
                        subtitle={`${MOCK_UNMARKED_CLASSES.length} classes pending`}
                        sx={{ height: "100%" }}
                    >
                        {MOCK_UNMARKED_CLASSES.length === 0 && <EmptyNote text="All classes marked." />}
                        {MOCK_UNMARKED_CLASSES.map((c) => (
                            <Box
                                key={c.id}
                                onClick={() => navigate("/dashboardmenu/attendance")}
                                sx={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                                    py: 0.8, borderBottom: `1px solid ${DASH.lineSoft}`, cursor: "pointer",
                                    "&:last-of-type": { borderBottom: "none" },
                                    "&:hover": { bgcolor: DASH.redLight },
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }}>
                                        {c.grade} - {c.section}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{c.teacher}</Typography>
                                </Box>
                                <ErrorOutlineRoundedIcon sx={{ fontSize: 16, color: DASH.red, flexShrink: 0 }} />
                            </Box>
                        ))}
                    </Panel>
                </Grid>
            </Grid>

            {/* Band 3 - Academics */}
            {showAcademics && (
                <>
                    <SectionTitle icon={AutoStoriesOutlinedIcon}>Academics</SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Panel title="At a Glance" sx={{ height: "100%" }}>
                                {[
                                    ["Homework assigned today", MOCK_ACADEMIC_SUMMARY.homeworkToday],
                                    ["Pending correction", MOCK_ACADEMIC_SUMMARY.homeworkPending],
                                    ["Materials this week", MOCK_ACADEMIC_SUMMARY.materialsThisWeek],
                                    ["Quizzes active", MOCK_ACADEMIC_SUMMARY.quizzesActive],
                                    ["Quiz average", `${MOCK_ACADEMIC_SUMMARY.quizAverage}%`],
                                ].map(([k, v]) => (
                                    <Box key={k} sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 0.8, borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" } }}>
                                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>{k}</Typography>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>{v}</Typography>
                                    </Box>
                                ))}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <Panel title="Upcoming Exams" subtitle="Next 7 days" sx={{ height: "100%" }}>
                                {MOCK_UPCOMING_EXAMS.length === 0 && <EmptyNote text="No exams scheduled." />}
                                {MOCK_UPCOMING_EXAMS.map((e) => (
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
                            <Panel title="Marks Entry Status" subtitle="Subjects entered vs total" sx={{ height: "100%" }}>
                                {MOCK_MARKS_ENTRY.map((m) => (
                                    <MeterRow
                                        key={m.exam}
                                        label={m.exam}
                                        value={m.entered}
                                        max={m.total}
                                        right={`${m.entered}/${m.total}`}
                                        color={m.entered === m.total ? DASH.green : m.entered / m.total > 0.6 ? DASH.primary : DASH.red}
                                    />
                                ))}
                            </Panel>
                        </Grid>
                    </Grid>
                </>
            )}

            {/* Band 4 - Fee & Finance */}
            {showFinance && (
                <>
                    <SectionTitle icon={PaymentsOutlinedIcon}>Fee &amp; Finance</SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 12, md: 7, lg: 5 }}>
                            <Panel title="Collection vs Target" subtitle="In lakhs" sx={{ height: "100%" }}>
                                <Box sx={{ height: 230 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={MOCK_FEE_TREND} barGap={4}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                            <ReTooltip content={<ChartTooltip suffix="L" />} cursor={{ fill: DASH.primaryLight }} />
                                            <Legend wrapperStyle={{ fontSize: "11.5px" }} />
                                            <Bar dataKey="target" name="Target" fill={DASH.lineSoft} radius={[5, 5, 0, 0]} />
                                            <Bar dataKey="collected" name="Collected" fill={DASH.primary} radius={[5, 5, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 5, lg: 3 }}>
                            <Panel title="Fee Split" sx={{ height: "100%" }}>
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
                            <Panel title="Grade-wise Collection" sx={{ height: "100%" }}>
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
                                    <Button
                                        onClick={() => navigate("/dashboardmenu/fee")}
                                        endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                                        sx={{ textTransform: "none", fontSize: "12px", fontWeight: 700, color: DASH.blue }}
                                    >
                                        View All
                                    </Button>
                                }
                            >
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                {["Student", "Grade", "Amount", "Mode", "Status", "Time"].map((h) => (
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
                    <SectionTitle icon={BadgeOutlinedIcon}>Staff &amp; Payroll</SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <Panel title="Payroll Status" subtitle={MOCK_PAYROLL.month} sx={{ height: "100%" }}>
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
                            <Panel title="Pending Leave Requests" sx={{ height: "100%" }}>
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
                            <Panel title="On Leave Today" sx={{ height: "100%" }}>
                                {MOCK_STAFF_ON_LEAVE.length === 0 && <EmptyNote text="Full attendance today." />}
                                {MOCK_STAFF_ON_LEAVE.map((s) => (
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
                    <SectionTitle icon={DirectionsBusFilledOutlinedIcon}>Transport</SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <Panel title="Fleet Today" sx={{ height: "100%" }}>
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
                            <Panel title="Documents Expiring" subtitle="Next 30 days" sx={{ height: "100%" }}>
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
            <SectionTitle icon={FactCheckOutlinedIcon}>Operations &amp; Communication</SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                {showOperations && (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Panel title="Approval Queue" sx={{ height: "100%" }}>
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

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Panel title="My Work" sx={{ height: "100%" }}>
                        {[
                            ["Drafts", MOCK_MY_WORK.drafts, "/dashboardmenu/draft"],
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

                <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                    <Panel title="News & Circulars" sx={{ height: "100%" }}>
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
                    <Panel title="Events & Birthdays" sx={{ height: "100%" }}>
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
                    <Panel title="Quick Actions">
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
        </Box>
    );
}
