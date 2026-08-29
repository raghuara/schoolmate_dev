import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Select, MenuItem, Tooltip,
    InputAdornment, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import {
    MOCK_PATTERNS, patternBalanced, patternQuestionCount,
    patternTotal, sectionHeading, sectionMarks, sectionMarksLabel, typeMeta,
} from "./questionPaperApi";
import { Pill, fieldSx, outlineBtnSx, primaryBtnSx } from "./questionPaperTheme";

const classRange = (grades, gradeIds) => {
    if (!gradeIds?.length) return "Any class";
    const signs = gradeIds
        .map((id) => (grades || []).find((g) => String(g.id) === String(id))?.sign)
        .filter(Boolean);
    if (!signs.length) return `${gradeIds.length} classes`;
    if (signs.length <= 3) return signs.join(", ");
    return `${signs[0]} - ${signs[signs.length - 1]}`;
};

const PatternCard = ({ pattern, grades, onEdit, onClone, onDelete, onUse }) => {
    const total = patternTotal(pattern);
    const balanced = patternBalanced(pattern);

    return (
        <Box
            sx={{
                bgcolor: "#fff",
                border: `1px solid ${DASH.line}`,
                borderLeft: `3px solid ${balanced ? DASH.violet : DASH.red}`,
                borderRadius: RADIUS,
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "box-shadow .2s ease, transform .2s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 22px rgba(17,24,39,0.10)",
                    ".patternActions": { opacity: 1 },
                },
            }}
        >
            <Box sx={{ p: 1.8, flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink, lineHeight: 1.35 }}>
                            {pattern.name}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.3 }}>
                            {pattern.exam || "Any exam"} - {classRange(grades, pattern.gradeIds)}
                        </Typography>
                    </Box>

                    <Box className="patternActions" sx={{ display: "flex", gap: 0.1, opacity: { xs: 1, md: 0 }, transition: "opacity .2s ease", flexShrink: 0 }}>
                        <Tooltip title="Edit" arrow>
                            <IconButton size="small" onClick={() => onEdit(pattern)} sx={{ width: 26, height: 26 }}>
                                <EditOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate" arrow>
                            <IconButton size="small" onClick={() => onClone(pattern)} sx={{ width: 26, height: 26 }}>
                                <ContentCopyOutlinedIcon sx={{ fontSize: 14, color: DASH.muted }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <IconButton size="small" onClick={() => onDelete(pattern)} sx={{ width: 26, height: 26 }}>
                                <DeleteOutlineIcon sx={{ fontSize: 15, color: DASH.red }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 1.3 }}>
                    <Pill
                        label={`${total} marks`}
                        color={balanced ? DASH.ink : DASH.red}
                        bg={balanced ? DASH.primaryLight : DASH.redLight}
                        border={balanced ? DASH.primaryBorder : "#FECACA"}
                    />
                    <Pill label={`${pattern.sections.length} sections`} color={DASH.muted} bg={DASH.lineSoft} />
                    <Pill label={`${patternQuestionCount(pattern)} questions`} color={DASH.muted} bg={DASH.lineSoft} />
                </Box>

                <Box
                    sx={{
                        mt: 1.5, border: `1px solid ${DASH.lineSoft}`, borderRadius: RADIUS,
                        overflow: "hidden",
                    }}
                >
                    {pattern.sections.map((section, i) => {
                        const meta = typeMeta(section.type);
                        return (
                            <Box
                                key={section.id}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1,
                                    px: 1.2, py: 0.8,
                                    borderBottom: i < pattern.sections.length - 1 ? `1px solid ${DASH.lineSoft}` : "none",
                                    bgcolor: i % 2 === 0 ? "#fff" : "#FCFCFD",
                                }}
                            >
                                <Typography sx={{ fontSize: "10.5px", fontWeight: 800, color: DASH.ink, width: 58, flexShrink: 0 }}>
                                    {(sectionHeading(section) || section.groupName || "").replace("PART - ", "").replace("SECTION ", "")}
                                </Typography>
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: meta.color, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: "11px", color: DASH.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {meta.short}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, flexShrink: 0 }}>
                                    {sectionMarksLabel(section) || `${sectionMarks(section)}`}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, mt: 1.4, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <TimerOutlinedIcon sx={{ fontSize: 13, color: DASH.faint }} />
                        <Typography sx={{ fontSize: "11px", color: DASH.muted }}>{pattern.durationMinutes} min</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        {balanced
                            ? <CheckCircleIcon sx={{ fontSize: 13, color: DASH.green }} />
                            : <ErrorOutlineIcon sx={{ fontSize: 13, color: DASH.red }} />}
                        <Typography sx={{ fontSize: "11px", color: balanced ? DASH.green : DASH.red, fontWeight: 600 }}>
                            {balanced ? "Marks balanced" : `Sections add to ${total}, not ${pattern.totalMarks}`}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                    px: 1.8, py: 1.1, borderTop: `1px solid ${DASH.lineSoft}`, bgcolor: "#FCFCFD",
                }}
            >
                <Typography sx={{ fontSize: "11px", color: DASH.muted }}>
                    Used in {pattern.usedCount || 0} paper{(pattern.usedCount || 0) === 1 ? "" : "s"}
                </Typography>
                <Button
                    onClick={() => onUse(pattern)}
                    endIcon={<RocketLaunchOutlinedIcon sx={{ fontSize: 14 }} />}
                    sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px" }}
                >
                    Use pattern
                </Button>
            </Box>
        </Box>
    );
};

export default function PatternListPage() {
    const navigate = useNavigate();
    const grades = useSelector(selectGrades) || [];

    const [patterns, setPatterns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [gradeFilter, setGradeFilter] = useState("all");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    /* Mock source. Replace with axios.get(GetQuestionPaperPatterns) +
       normalizePatternList. */
    const load = useCallback(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setPatterns(MOCK_PATTERNS);
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => { load(); }, [load]);

    const examFilterOptions = useMemo(
        () => Array.from(new Set(patterns.map((p) => p.exam).filter(Boolean))).sort(),
        [patterns]
    );

    const filtered = useMemo(() => patterns.filter((p) => {
        if (categoryFilter !== "all" && p.exam !== categoryFilter) return false;
        if (gradeFilter !== "all" && !p.gradeIds.map(String).includes(String(gradeFilter))) return false;
        if (search.trim()) {
            const t = search.trim().toLowerCase();
            if (!`${p.name} ${p.exam} ${p.createdBy}`.toLowerCase().includes(t)) return false;
        }
        return true;
    }), [patterns, search, categoryFilter, gradeFilter]);

    const editPattern = (pattern) =>
        navigate(`/dashboardmenu/assessment/question-paper/patterns/${pattern.id}`, { state: { pattern } });

    const clonePattern = (pattern) =>
        navigate("/dashboardmenu/assessment/question-paper/patterns/create", {
            state: { pattern: { ...pattern, id: null, name: `${pattern.name} (Copy)`, usedCount: 0 } },
        });

    const usePattern = (pattern) =>
        navigate("/dashboardmenu/assessment/question-paper/create", { state: { presetPattern: pattern } });

    const confirmDelete = () => {
        const target = deleteTarget;
        setDeleteTarget(null);
        if (!target) return;
        setPatterns((prev) => prev.filter((p) => p.id !== target.id));
        notify(`"${target.name}" deleted`, true);
    };

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

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
                            Question Paper Patterns
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            A pattern decides the sections, the marks per question and how much choice a student gets.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/create")}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        sx={primaryBtnSx}
                    >
                        Create Pattern
                    </Button>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center",
                    bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
                    px: 2, py: 1.5, mb: 2,
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search patterns"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ ...fieldSx, flex: 1, minWidth: 220 }}
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
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    sx={{ ...fieldSx, minWidth: 160, fontSize: "13px" }}
                >
                    <MenuItem value="all" sx={{ fontSize: "13px" }}>All Exams</MenuItem>
                    {examFilterOptions.map((c) => (
                        <MenuItem key={c} value={c} sx={{ fontSize: "13px" }}>{c}</MenuItem>
                    ))}
                </Select>
                <Select
                    size="small"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    sx={{ ...fieldSx, minWidth: 130, fontSize: "13px" }}
                >
                    <MenuItem value="all" sx={{ fontSize: "13px" }}>All Classes</MenuItem>
                    {grades.map((g) => (
                        <MenuItem key={g.id} value={String(g.id)} sx={{ fontSize: "13px" }}>{g.sign}</MenuItem>
                    ))}
                </Select>
            </Box>

            {filtered.length === 0 ? (
                <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 7, px: 3, textAlign: "center" }}>
                    <DashboardCustomizeOutlinedIcon sx={{ fontSize: 42, color: DASH.line }} />
                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                        No patterns match this view
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5, mb: 2 }}>
                        Build one once - every paper of that exam type reuses it.
                    </Typography>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/create")}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        sx={primaryBtnSx}
                    >
                        Create Pattern
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={1.8}>
                    {filtered.map((pattern) => (
                        <Grid key={pattern.id} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <PatternCard
                                pattern={pattern}
                                grades={grades}
                                onEdit={editPattern}
                                onClone={clonePattern}
                                onDelete={setDeleteTarget}
                                onUse={usePattern}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                slotProps={{ paper: { sx: { borderRadius: RADIUS, width: 400 } } }}
            >
                <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>Delete this pattern?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: "13px", color: DASH.muted }}>
                        "{deleteTarget?.name}" will no longer be available when creating a paper.
                        {deleteTarget?.usedCount > 0
                            ? ` Papers already built from it (${deleteTarget.usedCount}) keep their sections.`
                            : ""}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} sx={outlineBtnSx}>Cancel</Button>
                    <Button onClick={confirmDelete} sx={{ ...primaryBtnSx, bgcolor: DASH.red, "&:hover": { bgcolor: "#DC2626" } }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
