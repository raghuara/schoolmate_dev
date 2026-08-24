import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Tabs, Tab, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, InputAdornment, Select, MenuItem,
    Chip, LinearProgress, Tooltip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as ReTooltip, ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PhonelinkEraseOutlinedIcon from "@mui/icons-material/PhonelinkEraseOutlined";
import GppGoodOutlinedIcon from "@mui/icons-material/GppGoodOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import {
    DASH, RADIUS, KPI_TONES, Panel, SolidStatCard, MeterRow, ChartTooltip, EmptyNote,
} from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { GetQuizSingleAnalytics, GetStudentQuizWarningCount } from "../../../Api/Api";
import { val, unwrap, readGradeSections, fmtDate } from "./quizApi";

const PASS_MARK = 50;

// How many app exits the quiz allowed before it auto-submits. Falls back to 3,
// which is what the create screen defaults to.
const DEFAULT_WARNING_ALLOWANCE = 3;

// The warning endpoint answers for one student at a time, so a class means one
// call each. Sent in small batches to keep the browser from opening 40 sockets.
const WARNING_BATCH_SIZE = 6;

const readWarningCount = (payload) => {
    const root = unwrap(payload);
    const direct = val(root, ["warningCount", "warnings", "exitCount", "count"], null);
    if (direct !== null) return Number(direct) || 0;
    const rows = Array.isArray(root) ? root : null;
    if (rows) return rows.length;
    return 0;
};

// Sample spread used only when the backend has no attempt activity yet, so the
// screen can still be reviewed. Deterministic per roll number - no randomness,
// so the same student always shows the same sample figure.
const demoWarningFor = (rollNumber, allowance) => {
    const text = String(rollNumber || "");
    let sum = 0;
    for (let i = 0; i < text.length; i += 1) sum += text.charCodeAt(i);
    const bucket = sum % 10;
    if (bucket < 6) return 0;                       // most students stay in the app
    if (bucket < 9) return (sum % allowance) || 1;  // a few get warned
    return allowance + 1;                           // one or two auto-submit
};

const formatTime = (seconds) =>
    seconds ? `${Math.floor(seconds / 60)}m ${String(Math.round(seconds % 60)).padStart(2, "0")}s` : "-";

// Accepts 930, "930", or "15m 30s".
const secondsFrom = (value) => {
    if (value === undefined || value === null || value === "") return 0;
    const text = String(value).trim();
    const plain = Number(text);
    if (Number.isFinite(plain)) return Math.max(0, Math.round(plain));
    const parts = text.match(/(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/i);
    if (!parts) return 0;
    return Number(parts[1] || 0) * 60 + Number(parts[2] || 0);
};

// First array whose key name mentions one of the given words.
const arrayByKey = (root, matches) => {
    if (!root || typeof root !== "object") return null;
    for (const [key, value] of Object.entries(root)) {
        const flat = key.toLowerCase().replace(/[^a-z]/g, "");
        if (Array.isArray(value) && matches.some((m) => flat.includes(m))) return value;
    }
    return null;
};

const isYes = (value) => /^(y|yes|true|1|attempted|present|completed|submitted)$/i.test(String(value ?? ""));

// One student row, in the shape the tables and summaries below already read.
const readStudents = (root, totalQuestions, gradeText) => {
    const rows = arrayByKey(root, ["student", "result", "attendee", "mark"]) || [];
    return rows
        .filter((row) => row && typeof row === "object")
        .map((row, index) => {
            const total = Number(val(row, ["totalMarks", "totalQuestions", "outOf", "maxMark"], totalQuestions)) || totalQuestions;
            const marks = Number(val(row, ["marksScored", "marks", "score", "correctAnswers", "correct"], 0)) || 0;
            const correct = Number(val(row, ["correctAnswers", "correct", "rightAnswers"], marks)) || 0;
            const skipped = Number(val(row, ["skipped", "notAnswered", "unanswered"], 0)) || 0;
            const attemptFlag = val(row, ["attended", "attempted", "isAttempted", "attemptStatus"], null);
            const percentage = val(row, ["percentage", "scorePercentage", "percent"], null);

            return {
                id: val(row, ["rollNumber", "studentRollNumber", "id"], `row-${index}`),
                rollNumber: String(val(row, ["rollNumber", "studentRollNumber", "rollNo"], "-")),
                name: val(row, ["studentName", "name", "fullName"], "-"),
                grade: val(row, ["grade", "gradeName"], gradeText),
                section: String(val(row, ["section", "sectionName"], "-")),
                attempted: attemptFlag === null ? marks > 0 : isYes(attemptFlag),
                marks,
                total,
                correct,
                wrong: Number(val(row, ["wrongAnswers", "wrong", "incorrect"], Math.max(0, total - correct - skipped))) || 0,
                skipped,
                score: percentage !== null
                    ? Math.round(Number(percentage))
                    : (total ? Math.round((marks / total) * 100) : 0),
                seconds: secondsFrom(val(row, ["timeTakenSeconds", "timeTaken", "durationSeconds", "seconds", "timeSpent"], 0)),
            };
        });
};

// Per-question accuracy and average time, when the API sends them.
const readQuestionStats = (root) => {
    const rows = arrayByKey(root, ["question"]) || [];
    return rows
        .filter((row) => row && typeof row === "object")
        .map((row, index) => ({
            q: `Q${val(row, ["questionNumber", "questionNo", "number", "index"], index + 1)}`,
            accuracy: Math.round(Number(val(row, ["accuracy", "correctPercentage", "percentage", "correctPercent"], 0)) || 0),
            seconds: secondsFrom(val(row, ["averageTimeSeconds", "averageTime", "avgTime", "timeTaken"], 0)),
        }));
};

const TYPE_DEFS = [
    { key: "mcq", name: "Choose the Best Option", color: DASH.violet, keys: ["chooseTheBestAnswerAccuracy", "mcqAccuracy", "chooseTheBestAnswer"] },
    { key: "truefalse", name: "True / False", color: DASH.cyan, keys: ["trueOrFalseAccuracy", "trueFalseAccuracy", "trueOrFalse"] },
    { key: "fillblank", name: "Fill in the Blanks", color: DASH.pink, keys: ["fillingTheBlanksAccuracy", "fillBlankAccuracy", "fillingTheBlanks"] },
];

const readTypeAccuracy = (root) =>
    TYPE_DEFS
        .map((def) => ({ ...def, value: Math.round(Number(val(root, def.keys, 0)) || 0) }))
        .filter((row) => row.value > 0);



const selectSx = {
    fontSize: "12.5px",
    height: 34,
    borderRadius: RADIUS,
    bgcolor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: DASH.line },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: DASH.primaryBorder },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: DASH.primary },
};

const statusChipSx = (status) => {
    const map = {
        Pending: [DASH.primaryLight, DASH.primary],
        Approved: [DASH.cyanLight, DASH.cyan],
        Scheduled: [DASH.blueLight, DASH.blue],
        Published: [DASH.greenLight, DASH.green],
        Completed: [DASH.violetLight, DASH.violet],
        Rejected: [DASH.redLight, DASH.red],
    };
    const [bg, color] = map[status] || [DASH.lineSoft, DASH.muted];
    return { height: 22, fontSize: "11px", fontWeight: 700, bgcolor: bg, color };
};

const scoreColor = (score) => {
    if (score >= 80) return DASH.green;
    if (score >= PASS_MARK) return DASH.primary;
    return DASH.red;
};

const initials = (name) =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const SectionTitle = ({ children, icon: Icon }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.2, mt: 1 }}>
        {Icon && <Icon sx={{ fontSize: 16, color: DASH.primary }} />}
        <Typography
            sx={{
                fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color: DASH.muted, flexShrink: 0,
            }}
        >
            {children}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: DASH.line }} />
    </Box>
);

export default function QuizAnalysisPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const gradeList = useSelector(selectGrades) || [];
    const token = "123";

    const quiz = useMemo(() => location.state?.quiz || {}, [location.state]);
    const totalQuestions = Number(quiz.questions) || 0;

    // Only the grade-sections this quiz was assigned to. If the row carried no
    // grade at all, fall back to every grade so the page still has something to
    // ask the analytics endpoint for.
    const assignment = useMemo(() => {
        if (Array.isArray(quiz.gradeSections) && quiz.gradeSections.length) return quiz.gradeSections;

        const fromQuiz = readGradeSections(quiz, gradeList);
        if (fromQuiz.length) return fromQuiz;

        return (gradeList || []).map((g) => ({
            gradeId: g.id,
            grade: g.sign,
            sections: g.sections || [],
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quiz, gradeList.length]);

    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState(null);
    const [sectionFilter, setSectionFilter] = useState("all");
    const [resultFilter, setResultFilter] = useState("all");

    const [roster, setRoster] = useState([]);
    const [warnings, setWarnings] = useState({});
    const [warningsLoading, setWarningsLoading] = useState(false);
    const [warningsTried, setWarningsTried] = useState(false);
    const [warningsAreDemo, setWarningsAreDemo] = useState(false);
    const [questionStats, setQuestionStats] = useState([]);
    const [typeAccuracy, setTypeAccuracy] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg) => { setMessage(msg); setColor(false); setStatus(false); setOpen(true); };

    // First assigned grade becomes the default scope.
    useEffect(() => {
        if (gradeFilter === null && assignment.length) setGradeFilter(assignment[0].gradeId);
    }, [assignment, gradeFilter]);

    useEffect(() => {
        setSectionFilter("all");
    }, [gradeFilter]);

    const activeGrade = useMemo(
        () => assignment.find((entry) => String(entry.gradeId) === String(gradeFilter)) || assignment[0] || {},
        [assignment, gradeFilter]
    );
    const gradeText = activeGrade.grade || "";
    const sections = activeGrade.sections || [];

    // getQuzeSingleAnalytics is scoped to one grade, so the grade select refetches.
    const loadAnalytics = useCallback(async () => {
        if (!quiz.id) {
            console.warn("QuizAnalysisPage: opened without a quiz id", location.state);
            return;
        }
        if (!gradeFilter) return;
        setIsLoading(true);
        try {
            const res = await axios.get(
                `${GetQuizSingleAnalytics}?quzeId=${quiz.id}&gradeId=${gradeFilter}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res?.data?.error) {
                notify(res.data.message || "Could not load the quiz analysis");
                setRoster([]); setQuestionStats([]); setTypeAccuracy([]);
                return;
            }
            const root = unwrap(res?.data);
            const students = readStudents(root, totalQuestions, gradeText);
            if (!students.length) console.warn("getQuzeSingleAnalytics: no student rows parsed", res?.data);
            setRoster(students);
            setQuestionStats(readQuestionStats(root));
            setTypeAccuracy(readTypeAccuracy(root));
        } catch (error) {
            console.error(error);
            notify(error?.response?.data?.message || "Could not load the quiz analysis");
            setRoster([]); setQuestionStats([]); setTypeAccuracy([]);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quiz.id, gradeFilter, totalQuestions, gradeText]);

    useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

    // A different grade means a different roster, so the counts have to be refetched.
    useEffect(() => {
        setWarnings({});
        setWarningsTried(false);
        setWarningsAreDemo(false);
    }, [quiz.id, gradeFilter]);

    const warningAllowance = Number(quiz.warningCount) > 0
        ? Number(quiz.warningCount)
        : DEFAULT_WARNING_ALLOWANCE;

    // Only students who actually sat the quiz can have exits against them.
    const attemptedRoster = useMemo(() => roster.filter((r) => r.attempted), [roster]);

    const loadWarnings = useCallback(async () => {
        if (!quiz.id || !attemptedRoster.length) return;
        setWarningsLoading(true);
        const next = {};
        let answered = 0;
        try {
            for (let i = 0; i < attemptedRoster.length; i += WARNING_BATCH_SIZE) {
                const batch = attemptedRoster.slice(i, i + WARNING_BATCH_SIZE);
                // eslint-disable-next-line no-await-in-loop
                const results = await Promise.all(batch.map(async (student) => {
                    try {
                        const res = await axios.get(
                            `${GetStudentQuizWarningCount}?quzeId=${quiz.id}&rollNumber=${encodeURIComponent(student.rollNumber)}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (res?.data?.error) return null;
                        return { rollNumber: student.rollNumber, count: readWarningCount(res?.data) };
                    } catch (error) {
                        return null;
                    }
                }));
                results.forEach((row) => {
                    if (!row) return;
                    answered += 1;
                    next[row.rollNumber] = row.count;
                });
            }

            if (answered === 0) {
                // Nothing came back for anyone - fall back to sample figures so the
                // screen is still reviewable, and say so in the header.
                const demo = {};
                attemptedRoster.forEach((student) => {
                    demo[student.rollNumber] = demoWarningFor(student.rollNumber, warningAllowance);
                });
                setWarnings(demo);
                setWarningsAreDemo(true);
            } else {
                setWarnings(next);
                setWarningsAreDemo(false);
            }
        } finally {
            setWarningsLoading(false);
            setWarningsTried(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quiz.id, attemptedRoster, warningAllowance]);

    // Fetched only when the Integrity tab is opened - it is one request per student.
    useEffect(() => {
        if (tab !== 3 || warningsTried || warningsLoading) return;
        loadWarnings();
    }, [tab, warningsTried, warningsLoading, loadWarnings]);

    // The API already returns one grade, so only the section needs filtering here.
    const scoped = useMemo(
        () => roster.filter((s) => sectionFilter === "all" || s.section === sectionFilter),
        [roster, sectionFilter]
    );

    // One row per student who sat the quiz, worst offenders first.
    const integrityRows = useMemo(() => {
        const rows = scoped
            .filter((s) => s.attempted)
            .map((s) => {
                const exits = Number(warnings[s.rollNumber] || 0);
                const autoSubmitted = exits > warningAllowance;
                return {
                    ...s,
                    exits,
                    autoSubmitted,
                    state: autoSubmitted ? "submitted" : exits > 0 ? "warned" : "clean",
                };
            });
        return rows.sort((a, b) => b.exits - a.exits || a.name.localeCompare(b.name));
    }, [scoped, warnings, warningAllowance]);

    const integrityFiltered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return integrityRows;
        return integrityRows.filter(
            (r) => String(r.name).toLowerCase().includes(q) || String(r.rollNumber).toLowerCase().includes(q)
        );
    }, [integrityRows, search]);

    const integritySummary = useMemo(() => ({
        clean: integrityRows.filter((r) => r.state === "clean").length,
        warned: integrityRows.filter((r) => r.state === "warned").length,
        submitted: integrityRows.filter((r) => r.state === "submitted").length,
        totalExits: integrityRows.reduce((sum, r) => sum + r.exits, 0),
    }), [integrityRows]);

    const ranked = useMemo(() => {
        const order = [...scoped]
            .filter((s) => s.attempted)
            .sort((a, b) => b.score - a.score || a.seconds - b.seconds);
        const rankMap = new Map(order.map((s, i) => [s.id, i + 1]));
        return scoped
            .map((s) => ({ ...s, rank: rankMap.get(s.id) ?? null }))
            .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
    }, [scoped]);

    const summary = useMemo(() => {
        const attempted = scoped.filter((s) => s.attempted);
        const scores = attempted.map((s) => s.score);
        const top = [...attempted].sort((a, b) => b.score - a.score)[0] || null;
        const avg = (list, pick) =>
            list.length ? list.reduce((sum, item) => sum + pick(item), 0) / list.length : 0;
        return {
            totalStudents: scoped.length,
            attempted: attempted.length,
            averageScore: Math.round(avg(attempted, (s) => s.score)),
            averageMarks: Math.round(avg(attempted, (s) => s.marks) * 10) / 10,
            highest: scores.length ? Math.max(...scores) : 0,
            lowest: scores.length ? Math.min(...scores) : 0,
            passRate: attempted.length
                ? Math.round((attempted.filter((s) => s.score >= PASS_MARK).length / attempted.length) * 100)
                : 0,
            averageTime: formatTime(Math.round(avg(attempted, (s) => s.seconds))),
            topper: top,
        };
    }, [scoped]);

    const distribution = useMemo(() => {
        const buckets = [["0-20", 0, 20], ["21-40", 21, 40], ["41-60", 41, 60], ["61-80", 61, 80], ["81-100", 81, 100]];
        return buckets.map(([bucket, low, high]) => ({
            bucket,
            students: scoped.filter((s) => s.attempted && s.score >= low && s.score <= high).length,
        }));
    }, [scoped]);

    const sectionRows = useMemo(() => {
        const groups = new Map();
        roster.forEach((s) => {
            if (!groups.has(s.section)) groups.set(s.section, []);
            groups.get(s.section).push(s);
        });
        return Array.from(groups.entries()).map(([section, rows]) => {
            const attempted = rows.filter((s) => s.attempted);
            const scores = attempted.map((s) => s.score);
            return {
                grade: gradeText,
                section,
                students: rows.length,
                attempted: attempted.length,
                average: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
                averageMarks: attempted.length
                    ? Math.round((attempted.reduce((a, b) => a + b.marks, 0) / attempted.length) * 10) / 10
                    : 0,
                passRate: attempted.length
                    ? Math.round((attempted.filter((s) => s.score >= PASS_MARK).length / attempted.length) * 100)
                    : 0,
                highest: scores.length ? Math.max(...scores) : 0,
                lowest: scores.length ? Math.min(...scores) : 0,
            };
        });
    }, [roster, gradeText]);

    const students = useMemo(
        () =>
            ranked.filter((s) => {
                if (resultFilter === "passed" && (!s.attempted || s.score < PASS_MARK)) return false;
                if (resultFilter === "failed" && (!s.attempted || s.score >= PASS_MARK)) return false;
                if (resultFilter === "absent" && s.attempted) return false;
                if (search.trim()) {
                    const q = search.trim().toLowerCase();
                    if (!String(s.name).toLowerCase().includes(q) && !String(s.rollNumber).toLowerCase().includes(q)) return false;
                }
                return true;
            }),
        [ranked, search, resultFilter]
    );

    // Chart rows carry a short label; a single section must not stretch to fill
    // the whole plot, so the bar width is capped below.
    const sectionChartRows = useMemo(
        () =>
            sectionRows.map((row) => ({
                ...row,
                label: [row.grade, row.section].filter((part) => part && part !== "-").join(" - ") || "Section",
            })),
        [sectionRows]
    );

    const scopeLabel = `${gradeText || "-"}${sectionFilter === "all" ? " · All sections" : ` · Section ${sectionFilter}`}`;

    const hardestQuestions = useMemo(
        () => [...questionStats].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5),
        [questionStats]
    );

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas }}>
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
                                {quiz.name}
                            </Typography>
                            <Chip label={quiz.status} size="small" sx={statusChipSx(quiz.status)} />
                        </Box>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            {[
                                quiz.subject,
                                gradeText || quiz.grade,
                                totalQuestions ? `${totalQuestions} questions` : null,
                                quiz.createdDate ? `Created ${fmtDate(quiz.createdDate)}` : null,
                            ].filter(Boolean).join(" • ")}
                        </Typography>
                    </Box>
                </Box>

                <Button
                    startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                        textTransform: "none", fontSize: "12.5px", fontWeight: 600, color: DASH.text,
                        bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.6,
                        flexShrink: 0, ml: { xs: 5, md: 0 },
                        "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                    }}
                >
                    Export Result
                </Button>
            </Box>

            {/* Class scope */}
            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap",
                    bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
                    px: 1.6, py: 1.2, mb: 2,
                }}
            >
                <ClassOutlinedIcon sx={{ fontSize: 16, color: DASH.primary }} />
                <Typography
                    sx={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: DASH.muted }}
                >
                    Class
                </Typography>

                <Select size="small" value={gradeFilter ?? ""} onChange={(e) => setGradeFilter(e.target.value)} sx={{ ...selectSx, minWidth: 130 }}>
                    {assignment.length === 0 && (
                        <MenuItem value="" sx={{ fontSize: "12.5px" }}>No class assigned</MenuItem>
                    )}
                    {assignment.map((entry) => (
                        <MenuItem key={entry.gradeId} value={entry.gradeId} sx={{ fontSize: "12.5px" }}>
                            {entry.grade}
                        </MenuItem>
                    ))}
                </Select>

                <Tooltip title="Reload analysis" arrow>
                    <IconButton onClick={loadAnalytics} size="small" sx={{ color: DASH.muted }}>
                        <RefreshIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                </Tooltip>

                <Select size="small" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} sx={{ ...selectSx, minWidth: 140 }}>
                    <MenuItem value="all" sx={{ fontSize: "12.5px" }}>All sections</MenuItem>
                    {sections.map((s) => (
                        <MenuItem key={s} value={s} sx={{ fontSize: "12.5px" }}>Section {s}</MenuItem>
                    ))}
                </Select>

                <Chip
                    label="Assigned classes only"
                    size="small"
                    sx={{ height: 21, fontSize: "10.5px", fontWeight: 600, bgcolor: DASH.primaryLight, color: DASH.primary }}
                />

                <Box sx={{ flex: 1, minWidth: 12 }} />

                <Typography sx={{ fontSize: "12px", color: DASH.muted }}>
                    <strong style={{ color: DASH.ink }}>{summary.attempted}</strong> of{" "}
                    <strong style={{ color: DASH.ink }}>{summary.totalStudents}</strong> students attempted this quiz
                </Typography>
            </Box>

            {/* KPI strip */}
            <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={GroupsOutlinedIcon} label="Attempted"
                        value={`${summary.attempted}/${summary.totalStudents}`}
                        note={`${summary.totalStudents - summary.attempted} did not attend`}
                        tone={KPI_TONES.blue} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={ShowChartIcon} label="Average Marks"
                        value={`${summary.averageMarks}/${totalQuestions}`}
                        note={`${summary.averageScore}% · avg time ${summary.averageTime}`}
                        tone={KPI_TONES.orange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={EmojiEventsOutlinedIcon} label="Highest Score"
                        value={`${summary.highest}%`}
                        note={summary.topper ? `${summary.topper.name} • ${summary.topper.section}` : "No attempts yet"}
                        tone={KPI_TONES.green} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={TrendingDownIcon} label="Lowest Score"
                        value={`${summary.lowest}%`}
                        note="Needs follow-up"
                        tone={KPI_TONES.pink} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <SolidStatCard icon={TaskAltIcon} label="Pass Rate"
                        value={`${summary.passRate}%`}
                        note={`Pass mark ${PASS_MARK}%`}
                        tone={KPI_TONES.violet} />
                </Grid>
            </Grid>

            {/* Tabs */}
            <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, mb: 2, px: 1 }}>
                <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    variant="scrollable"
                    sx={{
                        minHeight: 44,
                        "& .MuiTab-root": {
                            textTransform: "none", fontSize: "12.5px", fontWeight: 600,
                            minHeight: 44, color: DASH.muted, px: 1.8,
                            "&.Mui-selected": { color: DASH.ink },
                        },
                        "& .MuiTabs-indicator": { backgroundColor: DASH.primary, height: 2.5 },
                    }}
                >
                    <Tab label="Overview" />
                    <Tab label="Grade & Section" />
                    <Tab label={`Students (${scoped.length})`} />
                    <Tab label="Integrity" />
                </Tabs>
            </Box>

            {/* ------------------------------------------------------ Overview */}
            {tab === 0 && (
                <>
                    <SectionTitle icon={InsightsOutlinedIcon}>Score Breakdown</SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 12, md: 7, lg: 8 }}>
                            <Panel title="Score Distribution" subtitle={`Students in each score band · ${scopeLabel}`} sx={{ height: "100%" }}>
                                <Box sx={{ height: 240 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={distribution}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                            <ReTooltip content={<ChartTooltip />} cursor={{ fill: DASH.primaryLight }} />
                                            <Bar dataKey="students" name="Students" radius={[5, 5, 0, 0]}>
                                                {distribution.map((d, i) => (
                                                    <Cell key={d.bucket} fill={i < 2 ? DASH.red : i === 2 ? DASH.primary : DASH.green} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 4 }}>
                            <Panel title="Accuracy by Question Type" subtitle="Percentage answered correctly" sx={{ height: "100%" }}>
                                <Box sx={{ height: 175 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={typeAccuracy} dataKey="value" nameKey="name"
                                                innerRadius={46} outerRadius={68} paddingAngle={3} stroke="none">
                                                {typeAccuracy.map((t) => <Cell key={t.key} fill={t.color} />)}
                                            </Pie>
                                            <ReTooltip content={<ChartTooltip suffix="%" />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Box sx={{ mt: 0.5 }}>
                                    {typeAccuracy.length === 0 && <EmptyNote text="No type breakdown yet." />}
                                    {typeAccuracy.map((t) => (
                                        <Box key={t.key} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.4 }}>
                                            <Box sx={{ width: 9, height: 9, borderRadius: "2px", bgcolor: t.color, flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: "11.5px", color: DASH.text, flex: 1, minWidth: 0 }}>
                                                {t.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.ink }}>
                                                {t.value}%
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Panel>
                        </Grid>
                    </Grid>

                    <SectionTitle icon={ShowChartIcon}>Question Analysis</SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8 }}>
                            <Panel title="Question-wise Accuracy" subtitle="Dips show where the class struggled" sx={{ height: "100%" }}>
                                <Box sx={{ height: 240 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={questionStats}>
                                            <defs>
                                                <linearGradient id="quizAccuracyFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={DASH.primary} stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor={DASH.primary} stopOpacity={0.04} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                            <XAxis dataKey="q" tick={{ fontSize: 10, fill: DASH.muted }} axisLine={false} tickLine={false} interval={0} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                            <ReTooltip content={<ChartTooltip suffix="%" />} />
                                            <Area type="monotone" dataKey="accuracy" name="Correct"
                                                stroke={DASH.primary} strokeWidth={2.5} fill="url(#quizAccuracyFill)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                            <Panel title="Hardest Questions" subtitle="Lowest accuracy - worth reteaching" sx={{ height: "100%" }}>
                                {hardestQuestions.map((h) => (
                                    <MeterRow key={h.q} label={h.q} value={h.accuracy} color={DASH.red} />
                                ))}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Panel title="Average Time per Question" subtitle="Seconds spent - spikes flag confusing wording">
                                <Box sx={{ height: 220 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={questionStats}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                            <XAxis dataKey="q" tick={{ fontSize: 10, fill: DASH.muted }} axisLine={false} tickLine={false} interval={0} />
                                            <YAxis tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                            <ReTooltip content={<ChartTooltip suffix="s" />} />
                                            <Legend wrapperStyle={{ fontSize: "11.5px" }} />
                                            <Line type="monotone" dataKey="seconds" name="Seconds"
                                                stroke={DASH.cyan} strokeWidth={2.5}
                                                dot={{ r: 3, fill: "#fff", stroke: DASH.cyan, strokeWidth: 2 }}
                                                activeDot={{ r: 6, fill: DASH.cyan, stroke: "#fff", strokeWidth: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Panel>
                        </Grid>
                    </Grid>
                </>
            )}

            {/* ----------------------------------------------- Grade & Section */}
            {tab === 1 && (
                <>
                    <SectionTitle icon={ClassOutlinedIcon}>Section Comparison</SectionTitle>
                    <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 7 }}>
                            <Panel title="Average vs Pass Rate" subtitle="By section" sx={{ height: "100%" }}>
                                {sectionChartRows.length === 0 ? (
                                    <EmptyNote text="No section results yet." />
                                ) : (
                                    <Box sx={{ height: 250 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={sectionChartRows} barGap={6} barCategoryGap="30%">
                                                <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: DASH.muted }} axisLine={false} tickLine={false} />
                                                <ReTooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: DASH.primaryLight }} />
                                                <Legend wrapperStyle={{ fontSize: "11.5px" }} />
                                                <Bar dataKey="average" name="Average" fill={DASH.primary} radius={[5, 5, 0, 0]} maxBarSize={34} />
                                                <Bar dataKey="passRate" name="Pass Rate" fill={DASH.cyan} radius={[5, 5, 0, 0]} maxBarSize={34} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                )}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 5 }}>
                            <Panel title="Attendance by Section" subtitle="Attempted against total students" sx={{ height: "100%" }}>
                                {sectionRows.length === 0 && <EmptyNote text="No sections to compare yet." />}
                                {sectionChartRows.map((s) => {
                                    const pct = s.students ? Math.round((s.attempted / s.students) * 100) : 0;
                                    return (
                                        <MeterRow
                                            key={s.label}
                                            label={s.label}
                                            value={s.attempted}
                                            max={s.students}
                                            right={`${s.attempted}/${s.students}`}
                                            color={pct >= 90 ? DASH.green : pct >= 75 ? DASH.primary : DASH.red}
                                        />
                                    );
                                })}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Panel title="Grade & Section Breakdown">
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                {["Grade", "Section", "Students", "Attempted", "Avg Marks", "Average", "Pass Rate", "Highest", "Lowest"].map((h) => (
                                                    <TableCell
                                                        key={h}
                                                        sx={{
                                                            fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em",
                                                            textTransform: "uppercase", color: DASH.muted, bgcolor: DASH.surface,
                                                            borderBottom: `1px solid ${DASH.line}`, whiteSpace: "nowrap", py: 1.2,
                                                        }}
                                                    >
                                                        {h}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sectionRows.map((s) => (
                                                <TableRow key={`${s.grade}-${s.section}`} hover>
                                                    <TableCell sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                        {s.grade}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                        <Chip label={s.section} size="small"
                                                            sx={{ height: 22, fontSize: "11px", fontWeight: 700, bgcolor: DASH.blueLight, color: DASH.blue }} />
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: DASH.text, borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.students}</TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: DASH.text, borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.attempted}</TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink, borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.averageMarks}/{totalQuestions}</TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", fontWeight: 700, color: scoreColor(s.average), borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.average}%</TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: DASH.text, borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.passRate}%</TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: DASH.green, fontWeight: 600, borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.highest}%</TableCell>
                                                    <TableCell sx={{ fontSize: "12.5px", color: DASH.red, fontWeight: 600, borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.lowest}%</TableCell>
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

            {/* ------------------------------------------------------ Students */}
            {tab === 2 && (
                <Panel
                    title="Student Results"
                    subtitle={`${scopeLabel} · ${students.length} of ${scoped.length} students shown`}
                    right={
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                            <TextField
                                size="small"
                                placeholder="Name or roll number"
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
                                sx={{ width: 200, "& .MuiOutlinedInput-root": { ...selectSx } }}
                            />
                            <Select size="small" value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} sx={selectSx}>
                                <MenuItem value="all" sx={{ fontSize: "12.5px" }}>All Results</MenuItem>
                                <MenuItem value="passed" sx={{ fontSize: "12.5px" }}>Passed</MenuItem>
                                <MenuItem value="failed" sx={{ fontSize: "12.5px" }}>Failed</MenuItem>
                                <MenuItem value="absent" sx={{ fontSize: "12.5px" }}>Not Attempted</MenuItem>
                            </Select>
                        </Box>
                    }
                >
                    <TableContainer sx={{ maxHeight: 480 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {["Rank", "Student", "Class", "Marks", "Score", "Correct", "Wrong", "Skipped", "Time", "Result"].map((h) => (
                                        <TableCell
                                            key={h}
                                            sx={{
                                                fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em",
                                                textTransform: "uppercase", color: DASH.muted, bgcolor: DASH.surface,
                                                borderBottom: `1px solid ${DASH.line}`, whiteSpace: "nowrap", py: 1.2,
                                            }}
                                        >
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} sx={{ border: "none", py: 5 }}>
                                            <EmptyNote text="No students match these filters." />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {students.map((s) => {
                                    const absent = !s.attempted;
                                    const passed = !absent && s.score >= PASS_MARK;
                                    return (
                                        <TableRow key={s.id} hover sx={{ "&:hover": { bgcolor: DASH.primaryLight } }}>
                                            <TableCell sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.faint, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                {absent ? "-" : `#${s.rank}`}
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <Box
                                                        sx={{
                                                            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                                                            bgcolor: DASH.primaryLight, color: DASH.primary,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontSize: "11px", fontWeight: 800,
                                                        }}
                                                    >
                                                        {initials(s.name)}
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }}>{s.name}</Typography>
                                                        <Typography sx={{ fontSize: "10.5px", color: DASH.faint }}>{s.rollNumber}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "12.5px", color: DASH.text, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                {s.grade.replace("Grade ", "")}-{s.section}
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, whiteSpace: "nowrap" }}>
                                                <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: absent ? DASH.faint : DASH.ink }}>
                                                    {absent ? "-" : `${s.marks} / ${s.total}`}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, minWidth: 130 }}>
                                                {absent ? (
                                                    <Typography sx={{ fontSize: "12.5px", color: DASH.faint }}>-</Typography>
                                                ) : (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={s.score}
                                                            sx={{
                                                                flex: 1, height: 6, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                                                                "& .MuiLinearProgress-bar": { borderRadius: RADIUS, bgcolor: scoreColor(s.score) },
                                                            }}
                                                        />
                                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: scoreColor(s.score), width: 34, textAlign: "right" }}>
                                                            {s.score}%
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "12.5px", color: DASH.green, fontWeight: 600, borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.correct}</TableCell>
                                            <TableCell sx={{ fontSize: "12.5px", color: DASH.red, fontWeight: 600, borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.wrong}</TableCell>
                                            <TableCell sx={{ fontSize: "12.5px", color: DASH.faint, borderBottom: `1px solid ${DASH.lineSoft}` }}>{s.skipped}</TableCell>
                                            <TableCell sx={{ fontSize: "12px", color: DASH.text, whiteSpace: "nowrap", borderBottom: `1px solid ${DASH.lineSoft}` }}>{formatTime(s.seconds)}</TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                <Chip
                                                    label={absent ? "Not Attempted" : passed ? "Passed" : "Failed"}
                                                    size="small"
                                                    sx={{
                                                        height: 22, fontSize: "10.5px", fontWeight: 700,
                                                        bgcolor: absent ? DASH.lineSoft : passed ? DASH.greenLight : DASH.redLight,
                                                        color: absent ? DASH.muted : passed ? DASH.green : DASH.red,
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Panel>
            )}

            {tab === 3 && (
                <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap", mb: 0.9, mt: 0.3 }}>
                        <ShieldOutlinedIcon sx={{ fontSize: 15, color: DASH.primary }} />
                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASH.ink }}>
                            Exam Integrity
                        </Typography>
                        {warningsAreDemo && (
                            <Chip
                                label="Sample data"
                                size="small"
                                sx={{
                                    height: 21, fontSize: "10.5px", fontWeight: 700,
                                    bgcolor: DASH.amberLight, color: DASH.amber,
                                }}
                            />
                        )}
                        <Box sx={{ flex: 1 }} />
                        <Tooltip title="Re-check every student">
                            <span>
                                <Button
                                    size="small"
                                    onClick={() => { setWarningsTried(false); }}
                                    disabled={warningsLoading || !attemptedRoster.length}
                                    startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        textTransform: "none", fontSize: "12px", fontWeight: 600,
                                        color: DASH.text, border: `1px solid ${DASH.line}`,
                                        borderRadius: RADIUS, px: 1.6,
                                        "&:hover": { bgcolor: DASH.surface },
                                    }}
                                >
                                    Refresh
                                </Button>
                            </span>
                        </Tooltip>
                    </Box>

                    <Typography sx={{ fontSize: "12px", color: DASH.muted, mb: 1.6, lineHeight: 1.6 }}>
                        {warningsAreDemo
                            ? "Showing sample numbers until the backend has attempt activity for this quiz."
                            : `Counts how many times each student left the app mid-quiz. This quiz allowed ${warningAllowance} ${warningAllowance === 1 ? "exit" : "exits"} before auto-submitting.`}
                    </Typography>

                    {warningsLoading && (
                        <Box sx={{ mb: 1.6 }}>
                            <LinearProgress sx={{ height: 4, borderRadius: 4 }} />
                            <Typography sx={{ fontSize: "11.5px", color: DASH.faint, mt: 0.6 }}>
                                Checking {attemptedRoster.length} students...
                            </Typography>
                        </Box>
                    )}

                    <Grid container spacing={1.4} sx={{ alignItems: "stretch", mb: 1.8 }}>
                        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                            <SolidStatCard
                                icon={GppGoodOutlinedIcon}
                                label="Stayed in the app"
                                value={integritySummary.clean}
                                note="No app exits recorded"
                                tone={KPI_TONES.green}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                            <SolidStatCard
                                icon={WarningAmberOutlinedIcon}
                                label="Warned"
                                value={integritySummary.warned}
                                note="Exited, but within the allowance"
                                tone={KPI_TONES.orange}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                            <SolidStatCard
                                icon={ReportGmailerrorredOutlinedIcon}
                                label="Auto-submitted"
                                value={integritySummary.submitted}
                                note="Ran out of warnings"
                                tone={KPI_TONES.pink}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                            <SolidStatCard
                                icon={PhonelinkEraseOutlinedIcon}
                                label="Total exits"
                                value={integritySummary.totalExits}
                                note="Across every attempt"
                                tone={KPI_TONES.violet}
                            />
                        </Grid>
                    </Grid>

                    <Panel
                        title="Who left the app"
                        subtitle={`${integrityFiltered.length} of ${integrityRows.length} students who sat this quiz - most exits first`}
                        right={
                            <TextField
                                size="small"
                                placeholder="Search student or roll no"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 16, color: DASH.faint }} />
                                            </InputAdornment>
                                        ),
                                        sx: { fontSize: "12.5px", borderRadius: RADIUS, height: 32 },
                                    },
                                }}
                                sx={{ width: { xs: 150, sm: 220 } }}
                            />
                        }
                    >
                        {!integrityRows.length ? (
                            <EmptyNote text={
                                warningsTried
                                    ? "Nobody has sat this quiz yet, so there is nothing to check."
                                    : "Open this tab to check every student who sat the quiz."
                            } />
                        ) : (
                            <TableContainer sx={{ maxHeight: "48vh" }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            {["Student", "Roll No", "Section", "Exits", "", "Status"].map((head, i) => (
                                                <TableCell
                                                    key={head || `col-${i}`}
                                                    align={i === 3 ? "center" : "left"}
                                                    sx={{
                                                        fontSize: "11.5px", fontWeight: 700, color: DASH.muted,
                                                        bgcolor: DASH.surface, borderBottom: `1px solid ${DASH.line}`,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {head}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {integrityFiltered.map((row) => {
                                            const tone = row.state === "submitted"
                                                ? { color: DASH.red, bg: DASH.redLight, label: "Auto-submitted" }
                                                : row.state === "warned"
                                                    ? { color: DASH.amber, bg: DASH.amberLight, label: "Warned" }
                                                    : { color: DASH.green, bg: DASH.greenLight, label: "Clean" };
                                            const pct = Math.min(100, Math.round((row.exits / Math.max(1, warningAllowance + 1)) * 100));
                                            return (
                                                <TableRow key={row.id} hover>
                                                    <TableCell sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }}>
                                                        {row.name}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "12px", color: DASH.muted }}>
                                                        {row.rollNumber}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "12px", color: DASH.muted }}>
                                                        {row.grade} {row.section}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography sx={{
                                                            fontSize: "14px", fontWeight: 800,
                                                            color: row.exits ? tone.color : DASH.faint,
                                                        }}>
                                                            {row.exits}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ width: 130 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={pct}
                                                            sx={{
                                                                height: 6, borderRadius: 4, bgcolor: DASH.lineSoft,
                                                                "& .MuiLinearProgress-bar": { bgcolor: tone.color, borderRadius: 4 },
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={tone.label}
                                                            sx={{
                                                                height: 21, fontSize: "10.5px", fontWeight: 700,
                                                                borderRadius: "6px", bgcolor: tone.bg, color: tone.color,
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Panel>
                </>
            )}
            <SnackBar open={open} message={message} setOpen={setOpen} status={status} color={color} />
        </Box>
    );
}
