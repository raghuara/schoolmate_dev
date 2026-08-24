import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Select, MenuItem, Tooltip,
    InputAdornment, TextField, LinearProgress, Tabs, Tab, Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";

import SnackBar from "../../SnackBar";
import { QuizGridSkeleton } from "../../InnerLoader";
import Loader from "../../Loader";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { GetAllQuizzesForAdmin } from "../../../Api/Api";
import { normalizeQuizList, fmtDate, parseApiDate, QUIZ_STATUSES } from "./quizApi";


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

const STATUS_TONES = {
    Pending: { bg: DASH.primaryLight, color: DASH.primary, bar: DASH.primary },
    Approved: { bg: DASH.cyanLight, color: DASH.cyan, bar: DASH.cyan },
    Scheduled: { bg: DASH.blueLight, color: DASH.blue, bar: DASH.blue },
    Published: { bg: DASH.greenLight, color: DASH.green, bar: DASH.green },
    Completed: { bg: DASH.violetLight, color: DASH.violet, bar: DASH.violet },
    Rejected: { bg: DASH.redLight, color: DASH.red, bar: DASH.red },
};
const NEUTRAL_TONE = { bg: DASH.lineSoft, color: DASH.muted, bar: DASH.faint };
const statusTone = (s) => STATUS_TONES[s] || NEUTRAL_TONE;

const STATUS_TABS = ["All", ...QUIZ_STATUSES];

const SORT_OPTIONS = [
    { key: "newest", label: "Newest first" },
    { key: "oldest", label: "Oldest first" },
    { key: "score", label: "Highest score" },
    { key: "attempts", label: "Most attempted" },
    { key: "name", label: "Name A - Z" },
];

const PER_PAGE = 9;

const selectSx = {
    fontSize: "12.5px",
    height: 34,
    borderRadius: RADIUS,
    bgcolor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: DASH.line },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: DASH.primaryBorder },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: DASH.primary },
};

const Stat = ({ value, label, color }) => (
    <Box sx={{ flex: 1, minWidth: 0, textAlign: "center" }}>
        <Typography sx={{ fontSize: "17px", fontWeight: 700, color: color || DASH.ink, lineHeight: 1.2 }}>
            {value}
        </Typography>
        <Typography sx={{ fontSize: "10px", color: DASH.faint, letterSpacing: "0.03em", textTransform: "uppercase", mt: 0.2 }}>
            {label}
        </Typography>
    </Box>
);

const QuizCard = ({ quiz, onOpen }) => {
    const tone = subjectTone(quiz.subject);
    const st = statusTone(quiz.status);
    const attemptPct = quiz.totalStudents ? Math.round((quiz.attempts / quiz.totalStudents) * 100) : 0;
    const hasResults = quiz.attempts > 0;

    return (
        <Box
            onClick={() => onOpen(quiz)}
            sx={{
                position: "relative",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#fff",
                border: `1px solid ${DASH.line}`,
                borderRadius: RADIUS,
                cursor: "pointer",
                overflow: "hidden",
                transition: "box-shadow 0.18s, transform 0.18s, border-color 0.18s",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 24px rgba(17,24,39,0.10)",
                    borderColor: tone.color,
                },
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, pb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4 }}>
                    <Box
                        sx={{
                            width: 42, height: 42, borderRadius: RADIUS, flexShrink: 0, bgcolor: tone.bg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <Typography sx={{ fontSize: "13px", fontWeight: 800, color: tone.color }}>
                            {String(quiz.subject || "Q").slice(0, 2).toUpperCase()}
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: "14px", fontWeight: 700, color: DASH.ink, lineHeight: 1.35,
                                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {quiz.name}
                        </Typography>
                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.4 }}>
                            <span style={{ color: tone.color, fontWeight: 600 }}>{quiz.subject}</span>
                            {[quiz.grade, quiz.sections].filter(Boolean).map((part) => ` · ${part}`).join("")}
                        </Typography>
                    </Box>

                    <Tooltip title="View analysis" arrow>
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); onOpen(quiz); }}
                            sx={{ color: DASH.faint, mt: -0.5, mr: -0.8, "&:hover": { color: DASH.primary } }}
                        >
                            <InsightsOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Status */}
                <Box
                    sx={{
                        display: "inline-flex", alignItems: "center", gap: 0.6, mt: 1.4,
                        px: 1, py: 0.35, borderRadius: RADIUS, bgcolor: st.bg,
                    }}
                >
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: st.bar }} />
                    <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: st.color }}>
                        {quiz.status}
                    </Typography>
                </Box>
            </Box>

            {/* Stats */}
            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: 1,
                    px: 1.5, py: 1.6, mx: 2, mb: 1.6,
                    bgcolor: DASH.surface, borderRadius: RADIUS,
                }}
            >
                <Stat value={quiz.questions} label="Questions" />
                <Box sx={{ width: "1px", alignSelf: "stretch", bgcolor: DASH.line }} />
                <Stat
                    value={hasResults ? `${attemptPct}%` : "—"}
                    label="Attempted"
                    color={hasResults ? DASH.cyan : DASH.faint}
                />
                <Box sx={{ width: "1px", alignSelf: "stretch", bgcolor: DASH.line }} />
                <Stat
                    value={quiz.avgScore == null ? "—" : `${quiz.avgScore}%`}
                    label="Avg Score"
                    color={quiz.avgScore == null ? DASH.faint : scoreColor(quiz.avgScore)}
                />
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Progress line */}
            <Box sx={{ px: 2, pb: 1.6 }}>
                {hasResults ? (
                    <>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography sx={{ fontSize: "10.5px", color: DASH.muted }}>
                                {quiz.attempts} of {quiz.totalStudents} students
                            </Typography>
                            <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: DASH.cyan }}>
                                {quiz.duration} min
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={attemptPct}
                            sx={{
                                height: 5, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                                "& .MuiLinearProgress-bar": { borderRadius: RADIUS, bgcolor: DASH.cyan },
                            }}
                        />
                    </>
                ) : (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "10.5px", color: DASH.faint }}>
                            {quiz.totalStudents ? `Starts soon · ${quiz.totalStudents} students` : "No attempts yet"}
                        </Typography>
                        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: DASH.faint }}>
                            {quiz.duration} min
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                    px: 2, py: 1.2, borderTop: `1px solid ${DASH.lineSoft}`,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            bgcolor: tone.bg, color: tone.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "9.5px", fontWeight: 800,
                        }}
                    >
                        {String(quiz.createdBy || "-").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </Box>
                    <Typography sx={{ fontSize: "11px", color: DASH.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {quiz.createdBy}
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: "10.5px", color: DASH.faint, flexShrink: 0 }}>
                    {fmtDate(quiz.createdDate)}
                </Typography>
            </Box>
        </Box>
    );
};

export default function AllQuizzesPage() {
    const navigate = useNavigate();
    const academicYear = useSelector(selectAcademicYear);
    const gradeOptions = useSelector(selectGrades) || [];
    const token = "123";

    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [sortKey, setSortKey] = useState("newest");
    const [page, setPage] = useState(1);

    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg) => { setMessage(msg); setColor(false); setStatus(false); setOpen(true); };

    // Grade is a real query parameter, so changing it refetches. Subject and the
    // search box filter what has already been loaded.
    const loadQuizzes = useCallback(async () => {
        if (!academicYear) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ academicYear });
            if (gradeFilter !== "all") params.append("gradeId", gradeFilter);

            const res = await axios.get(`${GetAllQuizzesForAdmin}?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res?.data?.error) {
                notify(res.data.message || "Could not load quizzes");
                setQuizzes([]);
                return;
            }
            const rows = normalizeQuizList(res?.data, gradeOptions);
            if (!rows.length) console.warn("getAllQuzesForAdmin returned no rows", res?.data);
            setQuizzes(rows);
        } catch (error) {
            console.error(error);
            notify(error?.response?.data?.message || "Could not load quizzes");
            setQuizzes([]);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear, gradeFilter, gradeOptions.length]);

    useEffect(() => { loadQuizzes(); }, [loadQuizzes]);

    const subjects = useMemo(
        () => Array.from(new Set(quizzes.map((q) => q.subject).filter(Boolean))),
        [quizzes]
    );

    const statusCounts = useMemo(() => {
        const counts = { All: quizzes.length };
        STATUS_TABS.slice(1).forEach((s) => {
            counts[s] = quizzes.filter((q) => q.status === s).length;
        });
        return counts;
    }, [quizzes]);

    const activeFilterCount =
        (search.trim() ? 1 : 0) + (gradeFilter !== "all" ? 1 : 0) + (subjectFilter !== "all" ? 1 : 0);

    const filtered = useMemo(() => {
        const tabStatus = STATUS_TABS[tab];
        const time = (row) => parseApiDate(row.createdDate)?.getTime() ?? 0;

        return quizzes
            .filter((q) => {
                if (tabStatus !== "All" && q.status !== tabStatus) return false;
                if (subjectFilter !== "all" && q.subject !== subjectFilter) return false;
                if (search.trim()) {
                    const t = search.trim().toLowerCase();
                    const name = String(q.name || "").toLowerCase();
                    const creator = String(q.createdBy || "").toLowerCase();
                    if (!name.includes(t) && !creator.includes(t)) return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortKey === "newest") return time(b) - time(a);
                if (sortKey === "oldest") return time(a) - time(b);
                if (sortKey === "score") return (b.avgScore ?? -1) - (a.avgScore ?? -1);
                if (sortKey === "attempts") return b.attempts - a.attempts;
                return String(a.name).localeCompare(String(b.name));
            });
    }, [quizzes, tab, search, subjectFilter, sortKey]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(page, pageCount);
    const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

    const resetFilters = () => {
        setSearch(""); setGradeFilter("all"); setSubjectFilter("all"); setPage(1);
    };

    const openAnalysis = (quiz) =>
        navigate("/dashboardmenu/assessment/online-quiz/analysis", { state: { quiz } });

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
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                            All Quizzes
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Every quiz created for this academic year.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    <Tooltip title="Reload quizzes" arrow>
                        <IconButton
                            onClick={loadQuizzes}
                            sx={{
                                border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff",
                                "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                            }}
                        >
                            <RefreshIcon sx={{ fontSize: 18, color: DASH.text }} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: "none", fontSize: "12.5px", fontWeight: 600, color: DASH.text,
                            bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.6,
                            "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                        }}
                    >
                        Export
                    </Button>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/online-quiz/create")}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: "none", fontSize: "12.5px", fontWeight: 700, color: "#fff",
                            bgcolor: DASH.primary, borderRadius: RADIUS, px: 2, boxShadow: "none",
                            "&:hover": { bgcolor: "#D89400" },
                        }}
                    >
                        Create Quiz
                    </Button>
                </Box>
            </Box>

            {/* Toolbar */}
            <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, mb: 2 }}>
                <Box sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, px: 1 }}>
                    <Tabs
                        value={tab}
                        onChange={(e, v) => { setTab(v); setPage(1); }}
                        variant="scrollable"
                        sx={{
                            minHeight: 44,
                            "& .MuiTab-root": {
                                textTransform: "none", fontSize: "12.5px", fontWeight: 600,
                                minHeight: 44, color: DASH.muted, px: 1.6,
                                "&.Mui-selected": { color: DASH.ink },
                            },
                            "& .MuiTabs-indicator": { backgroundColor: DASH.primary, height: 2.5 },
                        }}
                    >
                        {STATUS_TABS.map((s) => (
                            <Tab
                                key={s}
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                        {s}
                                        <Box
                                            sx={{
                                                minWidth: 20, px: 0.6, py: 0.1, borderRadius: RADIUS,
                                                bgcolor: DASH.lineSoft, color: DASH.muted,
                                                fontSize: "10.5px", fontWeight: 700,
                                            }}
                                        >
                                            {statusCounts[s]}
                                        </Box>
                                    </Box>
                                }
                            />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", px: 2, py: 1.5 }}>
                    <TextField
                        size="small"
                        placeholder="Search by quiz name or creator"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ width: { xs: "100%", sm: 250 }, "& .MuiOutlinedInput-root": { ...selectSx } }}
                    />
                    <Select size="small" value={gradeFilter} onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }} sx={selectSx}>
                        <MenuItem value="all" sx={{ fontSize: "12.5px" }}>All Grades</MenuItem>
                        {gradeOptions.map((g) => (
                            <MenuItem key={g.id} value={g.id} sx={{ fontSize: "12.5px" }}>{g.sign}</MenuItem>
                        ))}
                    </Select>
                    <Select size="small" value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }} sx={selectSx}>
                        <MenuItem value="all" sx={{ fontSize: "12.5px" }}>All Subjects</MenuItem>
                        {subjects.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: "12.5px" }}>{s}</MenuItem>)}
                    </Select>

                    <Box sx={{ flex: 1 }} />

                    <Typography sx={{ fontSize: "12px", color: DASH.muted, mr: 0.5 }}>
                        {filtered.length} result{filtered.length === 1 ? "" : "s"}
                    </Typography>
                    <Select size="small" value={sortKey} onChange={(e) => { setSortKey(e.target.value); setPage(1); }} sx={selectSx}>
                        {SORT_OPTIONS.map((o) => (
                            <MenuItem key={o.key} value={o.key} sx={{ fontSize: "12.5px" }}>{o.label}</MenuItem>
                        ))}
                    </Select>
                    {activeFilterCount > 0 && (
                        <Tooltip title="Clear filters" arrow>
                            <IconButton onClick={resetFilters} size="small" sx={{ color: DASH.red }}>
                                <FilterAltOffOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            {/* Card grid */}
            {isLoading ? (
                <QuizGridSkeleton count={6} />
            ) : paged.length === 0 ? (
                <Box
                    sx={{
                        bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS,
                        py: 8, textAlign: "center",
                    }}
                >
                    <QuizOutlinedIcon sx={{ fontSize: 44, color: DASH.line }} />
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASH.muted, mt: 1 }}>
                        No quizzes found
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.faint, mt: 0.4 }}>
                        Try a different status tab, grade, or clear the filters.
                    </Typography>
                    {activeFilterCount > 0 && (
                        <Button
                            onClick={resetFilters}
                            sx={{ textTransform: "none", fontSize: "12.5px", fontWeight: 700, color: DASH.primary, mt: 1.2 }}
                        >
                            Clear filters
                        </Button>
                    )}
                </Box>
            ) : (
                <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                    {paged.map((q) => (
                        <Grid key={q.id ?? q.name} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <QuizCard quiz={q} onOpen={openAnalysis} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {pageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                        count={pageCount}
                        page={safePage}
                        onChange={(e, p) => setPage(p)}
                        shape="rounded"
                        sx={{
                            "& .MuiPaginationItem-root": {
                                fontSize: "12.5px", borderRadius: RADIUS, color: DASH.text,
                            },
                            "& .Mui-selected": {
                                bgcolor: `${DASH.primary} !important`, color: "#fff", fontWeight: 700,
                            },
                        }}
                    />
                </Box>
            )}

            <SnackBar open={open} message={message} setOpen={setOpen} status={status} color={color} />
        </Box>
    );
}
