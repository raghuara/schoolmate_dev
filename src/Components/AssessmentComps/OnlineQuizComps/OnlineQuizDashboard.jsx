import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Select, MenuItem, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Tooltip, InputAdornment, TextField, Chip,
    LinearProgress, TableSortLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip as ReTooltip, LineChart, Line,
} from "recharts";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SearchIcon from "@mui/icons-material/Search";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DonutLargeOutlinedIcon from "@mui/icons-material/DonutLargeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import {
    DASH, RADIUS, SOFT, KPI_TONES, Panel, SolidStatCard, MeterRow, ChartTooltip, EmptyNote,
} from "../../DashBoardComps/dashboardTheme";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { GetQuizDashboard, GetAllQuizzesForAdmin } from "../../../Api/Api";
import { normalizeQuizList, fmtDate, parseApiDate, QUIZ_STATUSES } from "./quizApi";

const EMPTY_DASHBOARD = {
    totalQuizzes: 0,
    publishedQuizzes: 0,
    scheduledQuizzes: 0,
    pendingQuizzes: 0,
    averageScore: 0,
    overallCompletion: 0,
    gradeWisePerformance: {},
    averageScoreByGrade: {},
    upcomingQuizzes: [],
    participationThisWeek: [],
};

/* ---------------------------------------------------------------
   TEMPORARY DEMO DATA - delete this block and the USE_DEMO_DATA
   flag once the backend returns real numbers. Nothing else in the
   file depends on it; real data always wins over these values.
---------------------------------------------------------------- */
const USE_DEMO_DATA = true;

const DEMO_DASHBOARD = {
    totalQuizzes: 42,
    publishedQuizzes: 26,
    scheduledQuizzes: 8,
    pendingQuizzes: 6,
    averageScore: 74.5,
    overallCompletion: 98,
    gradeWisePerformance: {
        PREKG: 0, LKG: 0, UKG: 0,
        I: 62, II: 71, III: 66, IV: 78, V: 74,
        VI: 82, VII: 69, VIII: 88, IX: 73, X: 80,
    },
    averageScoreByGrade: {
        PREKG: 0, LKG: 0, UKG: 0,
        I: 58, II: 67, III: 63, IV: 76, V: 71,
        VI: 84, VII: 66, VIII: 90, IX: 70, X: 82,
    },
    upcomingQuizzes: [
        { quzeId: 21, subject: "Physics", grade: "X", scheduledDateAndTime: "16-08-2026 10:00", status: "Scheduled" },
        { quzeId: 22, subject: "Mathematics", grade: "VIII", scheduledDateAndTime: "18-08-2026 09:30", status: "Scheduled" },
        { quzeId: 23, subject: "Social", grade: "VI", scheduledDateAndTime: "20-08-2026 11:00", status: "Scheduled" },
    ],
    participationThisWeek: [
        { date: "07-08-2026", day: "Fri", assigned: 210, attempted: 186 },
        { date: "08-08-2026", day: "Sat", assigned: 120, attempted: 94 },
        { date: "09-08-2026", day: "Sun", assigned: 0, attempted: 0 },
        { date: "10-08-2026", day: "Mon", assigned: 176, attempted: 148 },
        { date: "11-08-2026", day: "Tue", assigned: 352, attempted: 289 },
        { date: "12-08-2026", day: "Wed", assigned: 264, attempted: 231 },
        { date: "13-08-2026", day: "Thu", assigned: 198, attempted: 172 },
    ],
};

/* --------------------- end of demo data ---------------------- */

const num = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
};

const gradeRows = (source) =>
    Object.entries(source || {}).map(([grade, value]) => ({ grade, score: num(value) }));

const pick = (row, keys, fallback = "") => {
    for (const key of keys) {
        const found = row?.[key];
        if (found !== undefined && found !== null && found !== "") return found;
    }
    return fallback;
};


const RECENT_LIMIT = 5;

const GRADE_VIEWS = [
    { key: "all", label: "All Grades" },
    { key: "active", label: "With Activity" },
];

// Red - amber - green by performance. A grade with no activity stays grey:
// zero here means "nobody has attempted yet", not "the class did badly".
const GRADE_BANDS = [
    { key: "low", label: "Below 50%", color: DASH.red },
    { key: "mid", label: "50 - 74%", color: DASH.primary },
    { key: "high", label: "75% and above", color: DASH.green },
];

const gradeBarColor = (score) => {
    if (score >= 75) return DASH.green;
    if (score >= 50) return DASH.primary;
    if (score > 0) return DASH.red;
    return DASH.line;
};

// Every panel gets a soft wash of its own accent colour so each card reads as
// part of what it shows, instead of five identical white boxes.
const PANEL_TINTS = {
    amber: { main: DASH.primary, bg: DASH.primaryLight, border: DASH.primaryBorder },
    blue: { main: DASH.blue, bg: DASH.blueLight, border: "#BFDBFE" },
    cyan: { main: DASH.cyan, bg: DASH.cyanLight, border: "#A5F3FC" },
    violet: { main: DASH.violet, bg: DASH.violetLight, border: "#DDD6FE" },
};

// fade = where the tint has fully turned to white. Lower it on tall panels so
// the wash stays a hint behind the header instead of colouring the whole card.
const tintedPanel = (tone, fade = 60) => ({
    height: "100%",
    borderColor: tone.border,
    background: `linear-gradient(160deg, ${tone.bg} 0%, #FFFFFF ${fade}%)`,
    "&:hover": { borderColor: tone.main },
});

// The completion card borrows the same bands as the bars, so the ring, the card
// tint and the caption all move together as the number changes.
const completionTone = (score) => {
    if (score >= 75) return { main: DASH.green, soft: "#6EE7B7", bg: DASH.greenLight, border: "#BBF7D0" };
    if (score >= 50) return { main: DASH.primary, soft: "#F5C451", bg: DASH.primaryLight, border: DASH.primaryBorder };
    if (score > 0) return { main: DASH.red, soft: "#FCA5A5", bg: DASH.redLight, border: "#FECACA" };
    return { main: DASH.faint, soft: DASH.line, bg: DASH.surface, border: DASH.line };
};

const selectSx = {
    fontSize: "12.5px",
    height: 32,
    borderRadius: RADIUS,
    bgcolor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: DASH.line },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: DASH.primaryBorder },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: DASH.primary },
};

// Same treatment as the quick-action buttons on the main dashboard:
// coloured label on a soft tint of its own hue, with a matching border.
const softButtonSx = (tone) => ({
    textTransform: "none",
    fontSize: "12.5px",
    fontWeight: 600,
    color: tone.color,
    bgcolor: tone.bg,
    border: `1px solid ${tone.border}`,
    borderRadius: RADIUS,
    px: 1.8,
    py: 0.7,
    "&:hover": { bgcolor: tone.hover, borderColor: tone.color },
});

const primaryButtonSx = {
    textTransform: "none",
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#fff",
    bgcolor: DASH.primary,
    borderRadius: RADIUS,
    px: 2,
    py: 0.7,
    boxShadow: "none",
    "&:hover": { bgcolor: "#D89400", boxShadow: "none" },
};

const STATUS_TONES = {
    Pending: { bg: DASH.primaryLight, color: DASH.primary, border: DASH.primaryBorder },
    Approved: { bg: DASH.cyanLight, color: DASH.cyan, border: "#A5F3FC" },
    Scheduled: { bg: DASH.blueLight, color: DASH.blue, border: "#BFDBFE" },
    Published: { bg: DASH.greenLight, color: DASH.green, border: "#BBF7D0" },
    Completed: { bg: DASH.violetLight, color: DASH.violet, border: "#DDD6FE" },
    Rejected: { bg: DASH.redLight, color: DASH.red, border: "#FECACA" },
};
const NEUTRAL_STATUS = { bg: DASH.lineSoft, color: DASH.muted, border: DASH.line };

const StatusChip = ({ status }) => {
    const tone = STATUS_TONES[status] || NEUTRAL_STATUS;
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.7,
                px: 1,
                py: 0.4,
                borderRadius: RADIUS,
                bgcolor: tone.bg,
                border: `1px solid ${tone.border}`,
                whiteSpace: "nowrap",
            }}
        >
            <Box
                sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: tone.color,
                    flexShrink: 0,
                    boxShadow: `0 0 0 2px ${tone.color}22`,
                }}
            />
            <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: tone.color, letterSpacing: "0.02em" }}>
                {status}
            </Typography>
        </Box>
    );
};

// Each subject gets a stable colour so the tile acts as a visual key.
const SUBJECT_TONES = {
    Physics: { color: "#7C3AED", bg: "#F5F3FF" },
    Mathematics: { color: "#1F73C2", bg: "#EEF3F9" },
    Science: { color: "#0891B2", bg: "#E0F7FA" },
    English: { color: "#E10052", bg: "#FBEBF1" },
    Biology: { color: "#5E9E38", bg: "#F2F8EE" },
    History: { color: "#C2701F", bg: "#FBF4EF" },
};
const subjectTone = (s) => SUBJECT_TONES[s] || { color: DASH.muted, bg: DASH.lineSoft };

const scoreColor = (score) =>
    score >= 85 ? DASH.green : score >= 70 ? DASH.primary : DASH.red;

const TABLE_COLUMNS = [
    { id: "name", label: "Quiz", sortable: true },
    { id: "grade", label: "Grade", sortable: true },
    { id: "questions", label: "Questions", sortable: true, align: "center" },
    { id: "avgScore", label: "Avg Score", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "action", label: "", sortable: false, align: "right" },
];

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

export default function OnlineQuizDashboard() {
    const navigate = useNavigate();
    const academicYear = useSelector(selectAcademicYear);
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;
    const token = "123";

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const gradeOptionList = useSelector(selectGrades) || [];
    const [recentQuizzes, setRecentQuizzes] = useState([]);

    const [dashboard, setDashboard] = useState(
        USE_DEMO_DATA ? { ...EMPTY_DASHBOARD, ...DEMO_DASHBOARD } : EMPTY_DASHBOARD
    );
    const usingDemo = USE_DEMO_DATA;

    useEffect(() => {
        if (!rollNumber || !academicYear) return undefined;
        let alive = true;

        const notify = (msg) => {
            setMessage(msg); setColor(false); setStatus(false); setOpen(true);
        };

        const load = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(
                    `${GetQuizDashboard}?rollNumber=${rollNumber}&academicYear=${academicYear}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!alive) return;
                if (res?.data?.error) {
                    notify(res.data.message || "Could not load the quiz dashboard");
                    return;
                }
                // Demo mode keeps the sample numbers on screen. The request still
                // runs so the wiring stays exercised - flip USE_DEMO_DATA to false
                // and the real payload below takes over.
                if (USE_DEMO_DATA) return;

                setDashboard({ ...EMPTY_DASHBOARD, ...(res?.data?.data || res?.data || {}) });
            } catch (error) {
                if (!alive) return;
                console.error(error);
                notify(error?.response?.data?.message || "Could not load the quiz dashboard");
            } finally {
                if (alive) setIsLoading(false);
            }
        };

        load();
        return () => { alive = false; };
    }, [rollNumber, academicYear]);

    // Recent Quizzes runs off its own endpoint - the dashboard summary does not
    // carry the per-quiz rows.
    useEffect(() => {
        if (!academicYear) return undefined;
        let alive = true;

        const loadQuizzes = async () => {
            try {
                const res = await axios.get(
                    `${GetAllQuizzesForAdmin}?academicYear=${academicYear}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!alive) return;
                if (res?.data?.error) {
                    console.warn("getAllQuzesForAdmin:", res.data.message);
                    setRecentQuizzes([]);
                    return;
                }
                setRecentQuizzes(normalizeQuizList(res?.data, gradeOptionList));
            } catch (error) {
                if (!alive) return;
                console.error(error);
                setRecentQuizzes([]);
            }
        };

        loadQuizzes();
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear, gradeOptionList.length]);

    const [rangeKey, setRangeKey] = useState("all");
    const [gradeFilter, setGradeFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdDate");
    const [sortDir, setSortDir] = useState("desc");

    const toggleSort = (id) => {
        if (sortBy === id) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortBy(id); setSortDir("asc"); }
    };

    const scoreByGrade = useMemo(
        () => gradeRows(dashboard.averageScoreByGrade),
        [dashboard.averageScoreByGrade]
    );

    const gradePerformance = useMemo(() => {
        const rows = gradeRows(dashboard.gradeWisePerformance);
        return rangeKey === "active" ? rows.filter((g) => g.score > 0) : rows;
    }, [dashboard.gradeWisePerformance, rangeKey]);

    const participation = useMemo(
        () =>
            (dashboard.participationThisWeek || []).map((row, i) => ({
                label: pick(row, ["day", "date"], `D${i + 1}`),
                assigned: Number(row?.assigned) || 0,
                attempted: Number(row?.attempted) || 0,
            })),
        [dashboard.participationThisWeek]
    );

    const upcoming = useMemo(
        () =>
            (dashboard.upcomingQuizzes || []).map((row, i) => ({
                id: pick(row, ["quzeId", "quizId", "id"], i),
                name: pick(row, ["subject", "name", "quizName", "title"], "Quiz"),
                grade: pick(row, ["grade", "gradeName", "gradeSection"], ""),
                when: pick(row, ["scheduledDateAndTime", "postedDateAndTime", "date"], ""),
                starts: pick(row, ["startsIn", "status"], "Scheduled"),
            })),
        [dashboard.upcomingQuizzes]
    );

    const subjects = useMemo(
        () => Array.from(new Set(recentQuizzes.map((q) => q.subject).filter(Boolean))),
        [recentQuizzes]
    );
    const gradeOptions = useMemo(
        () => Array.from(new Set(recentQuizzes.map((q) => q.grade).filter(Boolean))),
        [recentQuizzes]
    );

    // The dashboard shows the five most recent only - "View All" opens the full list.
    const matchingQuizzes = useMemo(
        () =>
            recentQuizzes.filter((q) => {
                if (gradeFilter !== "all" && q.grade !== gradeFilter) return false;
                if (subjectFilter !== "all" && q.subject !== subjectFilter) return false;
                if (statusFilter !== "all" && q.status !== statusFilter) return false;
                if (search.trim() && !String(q.name).toLowerCase().includes(search.trim().toLowerCase())) return false;
                return true;
            }).sort((a, b) => {
                const dir = sortDir === "asc" ? 1 : -1;
                if (sortBy === "createdDate") {
                    const at = parseApiDate(a.createdDate)?.getTime() ?? 0;
                    const bt = parseApiDate(b.createdDate)?.getTime() ?? 0;
                    return (at - bt) * dir;
                }
                const av = a[sortBy] ?? -1;
                const bv = b[sortBy] ?? -1;
                if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
                return String(av).localeCompare(String(bv)) * dir;
            }),
        [recentQuizzes, gradeFilter, subjectFilter, statusFilter, search, sortBy, sortDir]
    );

    const filteredQuizzes = useMemo(() => matchingQuizzes.slice(0, RECENT_LIMIT), [matchingQuizzes]);

    const completion = num(dashboard.overallCompletion);
    const completionColors = completionTone(completion);
    const donutData = [
        { name: "Completed", value: completion },
        { name: "Remaining", value: Math.max(0, 100 - completion) },
    ];

    const openAnalysis = (quiz) => {
        navigate("/dashboardmenu/assessment/online-quiz/analysis", { state: { quiz } });
    };

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "calc(100vh - 60px)" }}>
            {isLoading && <Loader />}

            {/* Header */}
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
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, minWidth: 0 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mt: -0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                                AI Quiz Generator
                            </Typography>
                            {usingDemo && (
                                <Chip
                                    label="Sample data"
                                    size="small"
                                    sx={{
                                        height: 21, fontSize: "10.5px", fontWeight: 700,
                                        bgcolor: DASH.amberLight, color: DASH.amber,
                                    }}
                                />
                            )}
                        </Box>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            {usingDemo
                                ? "Showing sample numbers until the backend has quiz activity for this academic year."
                                : "Manage AI-generated quizzes, monitor participation, and track performance."}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    <Tooltip title="Download this dashboard as a report">
                        <Button
                            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                            sx={softButtonSx(SOFT.blue)}
                        >
                            Export Report
                        </Button>
                    </Tooltip>

                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/online-quiz/approvals")}
                        startIcon={<FactCheckOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={softButtonSx(SOFT.purple)}
                    >
                        Approvals
                        {dashboard.pendingQuizzes > 0 && (
                            <Box
                                component="span"
                                sx={{
                                    ml: 0.9, minWidth: 18, px: 0.6, borderRadius: "9px",
                                    bgcolor: SOFT.purple.color, color: "#fff",
                                    fontSize: "10px", fontWeight: 700, lineHeight: "18px", textAlign: "center",
                                }}
                            >
                                {dashboard.pendingQuizzes}
                            </Box>
                        )}
                    </Button>

                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/online-quiz/create")}
                        startIcon={<AddIcon sx={{ fontSize: 17 }} />}
                        sx={primaryButtonSx}
                    >
                        Create Quiz
                    </Button>
                </Box>
            </Box>

            {/* KPI strip */}
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={QuizOutlinedIcon} label="Total Quizzes"
                        value={dashboard.totalQuizzes} note={`Academic year ${academicYear || "-"}`} tone={KPI_TONES.violet} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={CheckCircleOutlineIcon} label="Published Quizzes"
                        value={dashboard.publishedQuizzes} note="Live for students" tone={KPI_TONES.green} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={EventAvailableOutlinedIcon} label="Scheduled Quizzes"
                        value={dashboard.scheduledQuizzes}
                        note={upcoming.length ? `Next: ${upcoming[0].when || upcoming[0].name}` : "Nothing queued"}
                        tone={KPI_TONES.blue} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={PendingActionsOutlinedIcon} label="Pending Approval"
                        value={dashboard.pendingQuizzes} note="Open the approvals screen"
                        tone={KPI_TONES.orange}
                        onClick={() => navigate("/dashboardmenu/assessment/online-quiz/approvals")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={ShowChartIcon} label="Average Score"
                        value={`${num(dashboard.averageScore)}%`} note={`${completion}% completion`} tone={KPI_TONES.pink} />
                </Grid>
            </Grid>

            {/* Performance */}
            <SectionTitle icon={DonutLargeOutlinedIcon}>Performance</SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                    <Panel
                        title="Overall Completion"
                        subtitle="Across all published quizzes"
                        sx={tintedPanel(completionColors)}
                        bodySx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <Box
                            sx={{
                                display: "flex", flexDirection: "column", alignItems: "center",
                                width: "100%", gap: 1.8,
                            }}
                        >
                            <Box sx={{ position: "relative", width: 152, height: 152, flexShrink: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            <linearGradient id="quizCompletionFill" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor={completionColors.soft} />
                                                <stop offset="100%" stopColor={completionColors.main} />
                                            </linearGradient>
                                        </defs>
                                        <Pie
                                            data={donutData}
                                            dataKey="value"
                                            innerRadius={53}
                                            outerRadius={74}
                                            startAngle={90}
                                            endAngle={-270}
                                            stroke="none"
                                            paddingAngle={2}
                                            cornerRadius={6}
                                        >
                                            <Cell fill="url(#quizCompletionFill)" />
                                            <Cell fill={DASH.lineSoft} />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <Box
                                    sx={{
                                        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", lineHeight: 1,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "27px", fontWeight: 800, color: DASH.ink }}>
                                        {completion}%
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: "9px", fontWeight: 700, letterSpacing: "0.09em",
                                            textTransform: "uppercase", color: DASH.faint, mt: 0.4,
                                        }}
                                    >
                                        Done
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ width: "100%", textAlign: "center" }}>
                                <Typography
                                    sx={{
                                        fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.07em",
                                        textTransform: "uppercase", color: DASH.faint,
                                    }}
                                >
                                    Completion rate
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: "13px", fontWeight: 700, mt: 0.5, color: completionColors.main,
                                    }}
                                >
                                    {completion >= 75
                                        ? "Good standing across all sections"
                                        : completion > 0
                                            ? "Some sections still to finish"
                                            : "No attempts recorded yet"}
                                </Typography>

                                <Box
                                    sx={{
                                        mt: 1.6, pt: 1.4, mx: "auto", maxWidth: 230,
                                        borderTop: `1px solid ${DASH.lineSoft}`,
                                    }}
                                >
                                    {[
                                        { label: "Completed", value: completion, fill: `linear-gradient(135deg, ${completionColors.soft}, ${completionColors.main})` },
                                        { label: "Remaining", value: Math.max(0, 100 - completion), fill: DASH.lineSoft },
                                    ].map((row) => (
                                        <Box key={row.label} sx={{ display: "flex", alignItems: "center", gap: 0.9, py: 0.45 }}>
                                            <Box sx={{ width: 9, height: 9, borderRadius: "2px", background: row.fill, flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: "12px", color: DASH.muted, flex: 1, minWidth: 0, textAlign: "left" }}>
                                                {row.label}
                                            </Typography>
                                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink }}>
                                                {row.value}%
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 8, lg: 5 }}>
                    <Panel
                        title="Grade-wise Performance"
                        sx={tintedPanel(PANEL_TINTS.amber, 18)}
                        right={
                            <Select size="small" value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} sx={selectSx}>
                                {GRADE_VIEWS.map((r) => (
                                    <MenuItem key={r.key} value={r.key} sx={{ fontSize: "12.5px" }}>{r.label}</MenuItem>
                                ))}
                            </Select>
                        }
                    >
                        <Box sx={{ maxHeight: 250, overflowY: "auto", pr: 0.4 }}>
                            {gradePerformance.length === 0 && <EmptyNote text="No grade performance yet." />}
                            {gradePerformance.map((g) => (
                                <MeterRow
                                    key={g.grade}
                                    label={g.grade}
                                    value={g.score}
                                    color={gradeBarColor(g.score)}
                                />
                            ))}
                        </Box>

                        {gradePerformance.length > 0 && (
                            <Box
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.6, flexWrap: "wrap",
                                    borderTop: `1px solid ${DASH.lineSoft}`, pt: 1.1, mt: 1,
                                }}
                            >
                                {GRADE_BANDS.map((band) => (
                                    <Box key={band.key} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                        <Box sx={{ width: 9, height: 9, borderRadius: "2px", bgcolor: band.color, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: "10.5px", color: DASH.muted }}>{band.label}</Typography>
                                    </Box>
                                ))}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                    <Box sx={{ width: 9, height: 9, borderRadius: "2px", bgcolor: DASH.line, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "10.5px", color: DASH.faint }}>No activity</Typography>
                                </Box>
                            </Box>
                        )}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                    <Panel title="Upcoming Quizzes" subtitle={`${upcoming.length} scheduled`} sx={tintedPanel(PANEL_TINTS.blue)}>
                        {upcoming.length === 0 && <EmptyNote text="Nothing scheduled." />}
                        {upcoming.map((u) => (
                            <Box
                                key={u.id}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.2, py: 1, cursor: "pointer",
                                    borderBottom: `1px solid ${DASH.lineSoft}`, "&:last-of-type": { borderBottom: "none" },
                                    "&:hover": { bgcolor: DASH.surface },
                                }}
                            >
                                <CalendarMonthOutlinedIcon sx={{ fontSize: 17, color: DASH.blue, flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {u.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: DASH.faint }}>
                                        {[u.grade, u.when].filter(Boolean).join(" • ")}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={u.starts}
                                    size="small"
                                    sx={{ height: 21, fontSize: "10.5px", fontWeight: 700, bgcolor: DASH.violetLight, color: DASH.violet, flexShrink: 0 }}
                                />
                            </Box>
                        ))}
                    </Panel>
                </Grid>
            </Grid>

            {/* Engagement */}
            <SectionTitle icon={GroupsOutlinedIcon}>Engagement</SectionTitle>
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Panel title="Participation This Week" subtitle="Attempted vs assigned" sx={tintedPanel(PANEL_TINTS.cyan)}>
                        {participation.length === 0 && <EmptyNote text="No participation recorded this week." />}
                        <Box sx={{ height: participation.length ? 230 : 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={participation} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                    <ReTooltip content={<ChartTooltip />} cursor={{ fill: DASH.cyanLight }} />
                                    <Bar dataKey="assigned" name="Assigned" fill="#DDEFF3" radius={[5, 5, 0, 0]} />
                                    <Bar dataKey="attempted" name="Attempted" fill={DASH.cyan} radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Panel>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Panel title="Average Score by Grade" subtitle="Rolling average across published quizzes" sx={tintedPanel(PANEL_TINTS.violet)}>
                        <Box sx={{ height: 230 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={scoreByGrade}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                    <XAxis dataKey="grade" tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                    <ReTooltip content={<ChartTooltip suffix="%" />} />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        name="Average"
                                        stroke={DASH.violet}
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: "#fff", stroke: DASH.violet, strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: DASH.violet, stroke: "#fff", strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Panel>
                </Grid>
            </Grid>

            {/* Quizzes */}
            <SectionTitle icon={QuizOutlinedIcon}>All Quizzes</SectionTitle>
            <Panel
                title="Recent Quizzes"
                subtitle={`Showing ${filteredQuizzes.length} of ${matchingQuizzes.length}`}
                right={
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                        <TextField
                            size="small"
                            placeholder="Search quiz"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{ width: 170, "& .MuiOutlinedInput-root": { ...selectSx } }}
                        />
                        <Select size="small" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} sx={selectSx}>
                            <MenuItem value="all" sx={{ fontSize: "12.5px" }}>All Grades</MenuItem>
                            {gradeOptions.map((g) => (
                                <MenuItem key={g} value={g} sx={{ fontSize: "12.5px" }}>{g}</MenuItem>
                            ))}
                        </Select>
                        <Select size="small" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} sx={selectSx}>
                            <MenuItem value="all" sx={{ fontSize: "12.5px" }}>All Subjects</MenuItem>
                            {subjects.map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontSize: "12.5px" }}>{s}</MenuItem>
                            ))}
                        </Select>
                        <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={selectSx}>
                            <MenuItem value="all" sx={{ fontSize: "12.5px" }}>All Status</MenuItem>
                            {QUIZ_STATUSES.map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontSize: "12.5px" }}>{s}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                }
            >
                <TableContainer sx={{ maxHeight: 420 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {TABLE_COLUMNS.map((c) => (
                                    <TableCell
                                        key={c.id}
                                        align={c.align || "left"}
                                        sortDirection={sortBy === c.id ? sortDir : false}
                                        sx={{
                                            fontSize: "10.5px",
                                            fontWeight: 700,
                                            letterSpacing: "0.05em",
                                            textTransform: "uppercase",
                                            color: DASH.muted,
                                            bgcolor: DASH.surface,
                                            borderBottom: `1px solid ${DASH.line}`,
                                            whiteSpace: "nowrap",
                                            py: 1.2,
                                        }}
                                    >
                                        {c.sortable ? (
                                            <TableSortLabel
                                                active={sortBy === c.id}
                                                direction={sortBy === c.id ? sortDir : "asc"}
                                                onClick={() => toggleSort(c.id)}
                                                sx={{
                                                    "&.Mui-active": { color: DASH.ink },
                                                    "& .MuiTableSortLabel-icon": { fontSize: 15 },
                                                }}
                                            >
                                                {c.label}
                                            </TableSortLabel>
                                        ) : c.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredQuizzes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={TABLE_COLUMNS.length} sx={{ border: "none", py: 5 }}>
                                        <Box sx={{ textAlign: "center" }}>
                                            <QuizOutlinedIcon sx={{ fontSize: 34, color: DASH.line }} />
                                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.muted, mt: 0.5 }}>
                                                No quizzes found
                                            </Typography>
                                            <Typography sx={{ fontSize: "11.5px", color: DASH.faint }}>
                                                Try clearing the search or filters.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredQuizzes.map((q) => {
                                const tone = subjectTone(q.subject);
                                return (
                                    <TableRow
                                        key={q.id}
                                        onClick={() => openAnalysis(q)}
                                        sx={{
                                            cursor: "pointer",
                                            transition: "background-color 0.15s",
                                            "&:hover": { bgcolor: DASH.primaryLight },
                                            "&:hover .rowGo": { opacity: 1, transform: "translateX(0)" },
                                        }}
                                    >
                                        {/* Quiz - tile + name + subject/date */}
                                        <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1.2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.3, minWidth: 0 }}>
                                                <Box
                                                    sx={{
                                                        width: 34, height: 34, borderRadius: RADIUS, flexShrink: 0,
                                                        bgcolor: tone.bg, display: "flex", alignItems: "center", justifyContent: "center",
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: "12px", fontWeight: 800, color: tone.color }}>
                                                        {String(q.subject || "Q").slice(0, 2).toUpperCase()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.ink, lineHeight: 1.3 }}>
                                                        {q.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: DASH.faint, lineHeight: 1.4 }}>
                                                        <span style={{ color: tone.color, fontWeight: 600 }}>{q.subject}</span>
                                                        {" • "}{fmtDate(q.createdDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {/* Grade */}
                                        <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                            <Chip
                                                label={q.grade || "-"}
                                                size="small"
                                                sx={{ height: 22, fontSize: "11px", fontWeight: 700, bgcolor: DASH.blueLight, color: DASH.blue }}
                                            />
                                        </TableCell>

                                        {/* Questions */}
                                        <TableCell align="center" sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                                {q.questions}
                                            </Typography>
                                            <Typography sx={{ fontSize: "10px", color: DASH.faint }}>questions</Typography>
                                        </TableCell>

                                        {/* Avg score - bar + value */}
                                        <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, minWidth: 140 }}>
                                            {q.avgScore == null ? (
                                                <Typography sx={{ fontSize: "12px", color: DASH.faint }}>Not attempted</Typography>
                                            ) : (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={q.avgScore}
                                                        sx={{
                                                            flex: 1, height: 6, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                                                            "& .MuiLinearProgress-bar": { borderRadius: RADIUS, bgcolor: scoreColor(q.avgScore) },
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: scoreColor(q.avgScore), width: 34, textAlign: "right" }}>
                                                        {q.avgScore}%
                                                    </Typography>
                                                </Box>
                                            )}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                            <StatusChip status={q.status} />
                                        </TableCell>

                                        {/* Action - appears on hover */}
                                        <TableCell align="right" sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                            <Tooltip title="View analysis" arrow>
                                                <IconButton
                                                    className="rowGo"
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); openAnalysis(q); }}
                                                    sx={{
                                                        opacity: 0,
                                                        transform: "translateX(-4px)",
                                                        transition: "opacity 0.18s, transform 0.18s",
                                                        color: DASH.primary,
                                                    }}
                                                >
                                                    <InsightsOutlinedIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1.2 }}>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/online-quiz/all")}
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                        sx={{ textTransform: "none", fontSize: "12px", fontWeight: 700, color: DASH.blue }}
                    >
                        View All
                    </Button>
                </Box>
            </Panel>

            <SnackBar open={open} message={message} setOpen={setOpen} status={status} color={color} />
        </Box>
    );
}
