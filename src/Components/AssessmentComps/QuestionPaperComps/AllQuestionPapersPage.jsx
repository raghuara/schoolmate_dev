import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Select, MenuItem, Tooltip,
    InputAdornment, TextField, Tabs, Tab, Pagination,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";

import Loader from "../../Loader";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { MOCK_PAPERS, PAPER_STATUSES, fmtDate, parseApiDate } from "./questionPaperApi";
import { StatusPill, Pill, fieldSx, outlineBtnSx, primaryBtnSx } from "./questionPaperTheme";

const STATUS_TABS = ["All", ...PAPER_STATUSES];
const PER_PAGE = 9;

const SORT_OPTIONS = [
    { key: "newest", label: "Newest first" },
    { key: "oldest", label: "Oldest first" },
    { key: "marks", label: "Highest marks" },
    { key: "name", label: "Name A - Z" },
];

const SUBJECT_TONES = {
    Mathematics: { color: "#1F73C2", bg: "#EEF3F9" },
    Science: { color: "#0891B2", bg: "#E0F7FA" },
    Physics: { color: "#7C3AED", bg: "#F5F3FF" },
    English: { color: "#E10052", bg: "#FBEBF1" },
    Tamil: { color: "#C2701F", bg: "#FBF4EF" },
    "Social Science": { color: "#C2701F", bg: "#FBF4EF" },
    EVS: { color: "#10B981", bg: "#ECFDF5" },
};
const subjectTone = (s) => SUBJECT_TONES[s] || { color: DASH.muted, bg: DASH.lineSoft };

const Meta = ({ icon: Icon, label }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, minWidth: 0 }}>
        <Icon sx={{ fontSize: 13, color: DASH.faint, flexShrink: 0 }} />
        <Typography sx={{ fontSize: "11px", color: DASH.muted, whiteSpace: "nowrap" }}>{label}</Typography>
    </Box>
);

const PaperCard = ({ paper, onOpen, onClone }) => {
    const tone = subjectTone(paper.subject);
    return (
        <Box
            onClick={() => onOpen(paper)}
            sx={{
                bgcolor: "#fff",
                border: `1px solid ${DASH.line}`,
                borderTop: `3px solid ${tone.color}`,
                borderRadius: RADIUS,
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                overflow: "hidden",
                transition: "box-shadow .2s ease, transform .2s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 22px rgba(17,24,39,0.10)",
                    ".paperActions": { opacity: 1 },
                },
            }}
        >
            <Box sx={{ p: 1.8, flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            sx={{
                                fontSize: "13.5px", fontWeight: 700, color: DASH.ink, lineHeight: 1.35,
                                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}
                        >
                            {paper.name}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.3 }}>
                            {paper.examName}
                        </Typography>
                    </Box>
                    <StatusPill status={paper.status} />
                </Box>

                <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 1.4 }}>
                    <Pill label={paper.grade} color={DASH.text} bg={DASH.lineSoft} />
                    <Pill label={paper.subject} color={tone.color} bg={tone.bg} border={`${tone.color}33`} />
                    <Pill label={`${paper.totalMarks} marks`} color={DASH.ink} bg={DASH.primaryLight} border={DASH.primaryBorder} />
                </Box>

                <Box sx={{ display: "flex", gap: 1.4, flexWrap: "wrap", mt: 1.4 }}>
                    <Meta icon={HelpOutlineOutlinedIcon} label={`${paper.questionCount} questions`} />
                    <Meta icon={TimerOutlinedIcon} label={`${paper.durationMinutes} min`} />
                    <Meta icon={EventOutlinedIcon} label={fmtDate(paper.examDate)} />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.4 }}>
                    <DashboardCustomizeOutlinedIcon sx={{ fontSize: 13, color: DASH.faint }} />
                    <Typography sx={{ fontSize: "11px", color: DASH.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {paper.patternName}
                    </Typography>
                </Box>

                {paper.status === "Rejected" && paper.rejectReason && (
                    <Typography sx={{ fontSize: "11px", color: DASH.red, mt: 1, lineHeight: 1.5 }}>
                        {paper.rejectReason}
                    </Typography>
                )}
            </Box>

            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                    px: 1.8, py: 1.1, borderTop: `1px solid ${DASH.lineSoft}`, bgcolor: "#FCFCFD",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 21, height: 21, borderRadius: "50%", flexShrink: 0,
                            bgcolor: tone.bg, color: tone.color, display: "flex",
                            alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800,
                        }}
                    >
                        {String(paper.createdBy || "-").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </Box>
                    <Typography sx={{ fontSize: "11px", color: DASH.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {paper.createdBy}
                    </Typography>
                </Box>

                <Box className="paperActions" sx={{ display: "flex", gap: 0.2, opacity: { xs: 1, md: 0 }, transition: "opacity .2s ease" }}>
                    <Tooltip title="Open paper" arrow>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onOpen(paper); }} sx={{ width: 26, height: 26 }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate" arrow>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onClone(paper); }} sx={{ width: 26, height: 26 }}>
                            <ContentCopyOutlinedIcon sx={{ fontSize: 14, color: DASH.muted }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
};

export default function AllQuestionPapersPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const academicYear = useSelector(selectAcademicYear);
    const gradeOptions = useSelector(selectGrades) || [];

    const [papers, setPapers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // The dashboard chip can land here on a given status tab.
    const [tab, setTab] = useState(() => {
        const wanted = STATUS_TABS.indexOf(location.state?.status);
        return wanted > 0 ? wanted : 0;
    });
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [sortKey, setSortKey] = useState("newest");
    const [page, setPage] = useState(1);


    /* Mock source. Replace with axios.get(GetAllQuestionPapers, {
       params: { academicYear, gradeId } }) + normalizePaperList. */
    const load = useCallback(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setPapers(MOCK_PAPERS);
            setIsLoading(false);
        }, 350);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => { load(); }, [load]);

    const subjects = useMemo(
        () => Array.from(new Set(papers.map((p) => p.subject).filter(Boolean))).sort(),
        [papers]
    );

    const statusCounts = useMemo(() => {
        const counts = { All: papers.length };
        PAPER_STATUSES.forEach((s) => { counts[s] = papers.filter((p) => p.status === s).length; });
        return counts;
    }, [papers]);

    const activeFilterCount =
        (search.trim() ? 1 : 0) + (gradeFilter !== "all" ? 1 : 0) + (subjectFilter !== "all" ? 1 : 0);

    const filtered = useMemo(() => {
        const tabStatus = STATUS_TABS[tab];
        const time = (row) => parseApiDate(row.createdDate)?.getTime() ?? 0;

        return papers
            .filter((p) => {
                if (tabStatus !== "All" && p.status !== tabStatus) return false;
                if (gradeFilter !== "all" && String(p.gradeId) !== String(gradeFilter)) return false;
                if (subjectFilter !== "all" && p.subject !== subjectFilter) return false;
                if (search.trim()) {
                    const t = search.trim().toLowerCase();
                    const haystack = `${p.name} ${p.examName} ${p.createdBy} ${p.patternName}`.toLowerCase();
                    if (!haystack.includes(t)) return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortKey === "newest") return time(b) - time(a);
                if (sortKey === "oldest") return time(a) - time(b);
                if (sortKey === "marks") return b.totalMarks - a.totalMarks;
                return String(a.name).localeCompare(String(b.name));
            });
    }, [papers, tab, search, gradeFilter, subjectFilter, sortKey]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(page, pageCount);
    const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

    const resetFilters = () => {
        setSearch(""); setGradeFilter("all"); setSubjectFilter("all"); setPage(1);
    };

    const openPaper = (paper) =>
        navigate(`/dashboardmenu/assessment/question-paper/${paper.id}`, { state: { paper } });

    const clonePaper = (paper) =>
        navigate("/dashboardmenu/assessment/question-paper/create", { state: { clonePaper: paper } });

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            {isLoading && <Loader />}

            <Box
                sx={{
                    display: "flex", alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between", flexDirection: { xs: "column", md: "row" },
                    gap: 1.5, mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, minWidth: 0 }}>
                    <IconButton onClick={() => navigate("/dashboardmenu/assessment/question-paper")} sx={{ mt: -0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                            All Question Papers
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Every paper created{academicYear ? ` in ${academicYear}` : ""}, with its approval status.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    <Tooltip title="Reload" arrow>
                        <IconButton
                            onClick={load}
                            sx={{
                                border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff",
                                "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                            }}
                        >
                            <RefreshIcon sx={{ fontSize: 18, color: DASH.text }} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/create")}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        sx={primaryBtnSx}
                    >
                        Create Paper
                    </Button>
                </Box>
            </Box>

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
                                            {statusCounts[s] ?? 0}
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
                        placeholder="Search by paper, exam, pattern or creator"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        sx={{ ...fieldSx, flex: 1, minWidth: 230 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Select
                        size="small"
                        value={gradeFilter}
                        onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}
                        sx={{ ...fieldSx, minWidth: 130, fontSize: "13px" }}
                    >
                        <MenuItem value="all" sx={{ fontSize: "13px" }}>All Classes</MenuItem>
                        {gradeOptions.map((g) => (
                            <MenuItem key={g.id} value={String(g.id)} sx={{ fontSize: "13px" }}>{g.sign}</MenuItem>
                        ))}
                    </Select>

                    <Select
                        size="small"
                        value={subjectFilter}
                        onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
                        sx={{ ...fieldSx, minWidth: 150, fontSize: "13px" }}
                    >
                        <MenuItem value="all" sx={{ fontSize: "13px" }}>All Subjects</MenuItem>
                        {subjects.map((s) => (
                            <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>{s}</MenuItem>
                        ))}
                    </Select>

                    <Select
                        size="small"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                        sx={{ ...fieldSx, minWidth: 145, fontSize: "13px" }}
                    >
                        {SORT_OPTIONS.map((o) => (
                            <MenuItem key={o.key} value={o.key} sx={{ fontSize: "13px" }}>{o.label}</MenuItem>
                        ))}
                    </Select>

                    {activeFilterCount > 0 && (
                        <Button
                            onClick={resetFilters}
                            startIcon={<FilterAltOffOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={{ ...outlineBtnSx, color: DASH.red, borderColor: "#FECACA", "&:hover": { bgcolor: DASH.redLight } }}
                        >
                            Clear ({activeFilterCount})
                        </Button>
                    )}
                </Box>
            </Box>

            {paged.length === 0 ? (
                <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 7, px: 3, textAlign: "center" }}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 42, color: DASH.line }} />
                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                        No papers match this view
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5, mb: 2 }}>
                        Change the filters, or build a new question paper from a saved pattern.
                    </Typography>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/create")}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        sx={primaryBtnSx}
                    >
                        Create Paper
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={1.8}>
                    {paged.map((paper) => (
                        <Grid key={paper.id} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <PaperCard paper={paper} onOpen={openPaper} onClone={clonePaper} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {pageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
                    <Pagination
                        count={pageCount}
                        page={safePage}
                        onChange={(e, v) => setPage(v)}
                        size="small"
                        sx={{
                            "& .MuiPaginationItem-root": { fontSize: "12.5px", borderRadius: RADIUS },
                            "& .Mui-selected": { bgcolor: `${DASH.primary} !important`, color: "#fff" },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
