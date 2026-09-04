import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Select, MenuItem, Tooltip,
    InputAdornment, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { gradeSign } from "../../AcademicsComps/academicMeta";
import { ListPatterns, DeletePattern } from "../../../Api/Api";
import { apiFailed } from "../../AcademicsComps/BooksChaptersComps/bookApi";
import {
    normalizePatternList, patternBalanced, patternQuestionCount, patternSpread,
    patternTotal, durationLabel,
} from "./questionPaperApi";
import { fieldSx, outlineBtnSx, createBtnSx, primaryBtnSx } from "./questionPaperTheme";

const token = "123";

/* Every card is the same height. The section count varies from three to eight
   across the blueprints, so the spread is drawn as one bar of fixed height
   rather than a list that grows with the pattern. */
const CARD_H = 236;
// A paper-white card on a grey page reads as a form field. A light violet wash
// separates the sheet from the canvas and ties it to the module accent.
const SHEET_BG = "#FAF9FF";
// A shade deeper than the sheet - enough to read as a header band, nowhere near
// a dark bar.
const SHEET_HEAD_BG = "#F3EEFF";
const SHEET_LINE = `${DASH.violet}1F`;
// Room for the paper name on two lines without pushing the rest down.
const NAME_H = 38;

const classRange = (grades, gradeIds) => {
    if (!gradeIds?.length) return "Any class";
    const signs = gradeIds
        .map((id) => (grades || []).find((g) => String(g.id) === String(id))?.sign)
        .filter(Boolean);
    if (!signs.length) return `${gradeIds.length} classes`;
    if (signs.length <= 3) return signs.join(", ");
    return `${signs[0]} - ${signs[signs.length - 1]}`;
};

/* The card reads as a mark sheet: a ruled head with the total, one bar showing
   where the marks sit, and the section letters underneath it. */
const PatternSheetCard = ({ pattern, grades, onOpen, onEdit, onClone, onDelete, canEdit, canClone, canDelete }) => {
    const total = patternTotal(pattern);
    const balanced = patternBalanced(pattern);
    const spread = patternSpread(pattern);

    return (
        <Box
            onClick={() => onOpen(pattern)}
            sx={{
                position: "relative",
                height: CARD_H,
                boxSizing: "border-box",
                bgcolor: SHEET_BG,
                border: `1px solid ${DASH.violet}26`,
                borderRadius: RADIUS,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                cursor: "pointer",
                transition: "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: `${DASH.violet}55`,
                    boxShadow: "0 8px 22px rgba(17,24,39,0.10)",
                    ".patternActions": { opacity: 1 },
                },
                /* The punched edge of a paper - two ruled lines down the left,
                   the detail that makes the card read as a sheet. */
                "&::before": {
                    content: '""',
                    position: "absolute", top: 0, bottom: 0, left: 10,
                    borderLeft: `1px solid ${SHEET_LINE}`,
                    borderRight: `1px solid ${SHEET_LINE}`,
                    width: 3,
                    pointerEvents: "none",
                },
            }}
        >
            {/* The title band. A light wash marks it as the head of the sheet
                without turning it into a dark bar. */}
            <Box
                sx={{
                    pl: 3, pr: 1.6, pt: 1.3, pb: 1.1,
                    bgcolor: SHEET_HEAD_BG,
                    borderBottom: `1px solid ${SHEET_LINE}`,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            sx={{
                                fontSize: "13.5px", fontWeight: 700, color: DASH.ink, lineHeight: 1.35,
                                height: NAME_H, display: "-webkit-box", WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}
                        >
                            {pattern.name}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "11px", color: DASH.faint, mt: 0.2,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                        >
                            {pattern.subject || "Any subject"} - {classRange(grades, pattern.gradeIds)}
                        </Typography>
                    </Box>

                    <Box
                        className="patternActions"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ display: "flex", gap: 0.1, opacity: { xs: 1, md: 0 }, transition: "opacity .2s ease", flexShrink: 0 }}
                    >
                        {canEdit && (
                            <Tooltip title="Edit" arrow>
                                <IconButton size="small" onClick={() => onEdit(pattern)} sx={{ width: 26, height: 26 }}>
                                    <EditOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {/* Duplicate writes a new pattern, so it is a create, not an edit. */}
                        {canClone && (
                            <Tooltip title="Duplicate" arrow>
                                <IconButton size="small" onClick={() => onClone(pattern)} sx={{ width: 26, height: 26 }}>
                                    <ContentCopyOutlinedIcon sx={{ fontSize: 14, color: DASH.muted }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canDelete && (
                            <Tooltip title="Delete" arrow>
                                <IconButton size="small" onClick={() => onDelete(pattern)} sx={{ width: 26, height: 26 }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 15, color: DASH.red }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            </Box>

            <Box sx={{ pl: 3, pr: 1.6, pb: 1.2, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                {/* The mark head, printed the way it sits on a real paper. */}
                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 1.4,
                        borderBottom: `1px solid ${SHEET_LINE}`,
                        py: 0.9,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, flexShrink: 0 }}>
                        <Typography sx={{ fontSize: "22px", fontWeight: 800, color: balanced ? DASH.ink : DASH.red, lineHeight: 1 }}>
                            {total}
                        </Typography>
                        <Typography sx={{ fontSize: "10px", fontWeight: 700, color: DASH.faint, letterSpacing: "0.06em" }}>
                            MARKS
                        </Typography>
                    </Box>
                    <Box sx={{ width: "1px", height: 22, bgcolor: SHEET_LINE, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: DASH.text, whiteSpace: "nowrap" }}>
                            {spread.length} sections - {patternQuestionCount(pattern)} questions
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.2 }}>
                            <TimerOutlinedIcon sx={{ fontSize: 12, color: DASH.faint }} />
                            <Typography sx={{ fontSize: "11px", color: DASH.muted }}>
                                {durationLabel(pattern.durationMinutes)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Where the marks sit. One bar, so eight sections take exactly as
                    much room as three. */}
                <Box sx={{ mt: "auto" }}>
                    <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: DASH.faint, letterSpacing: "0.08em", mb: 0.6 }}>
                        MARK SPREAD
                    </Typography>
                    <Box sx={{ display: "flex", height: 8, borderRadius: RADIUS, overflow: "hidden", bgcolor: "#fff" }}>
                        {spread.map((part) => (
                            <Tooltip key={part.key} title={`${part.label} - ${part.marks} marks`} arrow>
                                <Box sx={{ width: `${part.share}%`, bgcolor: part.color, borderRight: `1px solid ${SHEET_BG}` }} />
                            </Tooltip>
                        ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.9, mt: 0.7, height: 15, overflow: "hidden" }}>
                        {spread.map((part) => (
                            <Box key={part.key} sx={{ display: "flex", alignItems: "center", gap: 0.35, flexShrink: 0 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: "2px", bgcolor: part.color }} />
                                <Typography sx={{ fontSize: "10.5px", color: DASH.muted, whiteSpace: "nowrap" }}>
                                    {part.short} <span style={{ fontWeight: 700, color: DASH.text }}>{part.marks}</span>
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                    pl: 3, pr: 1.6, py: 0.9, borderTop: `1px solid ${SHEET_LINE}`, bgcolor: `${DASH.violet}0F`,
                }}
            >
                {balanced ? (
                    <Typography sx={{ fontSize: "10.5px", color: DASH.muted, whiteSpace: "nowrap" }}>
                        Used in {pattern.usedCount || 0} paper{(pattern.usedCount || 0) === 1 ? "" : "s"}
                    </Typography>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, minWidth: 0 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 12, color: DASH.red, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: DASH.red, whiteSpace: "nowrap" }}>
                            Adds to {total}, not {pattern.totalMarks}
                        </Typography>
                    </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, color: DASH.violet, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>View</Typography>
                    <ArrowForwardIcon sx={{ fontSize: 13 }} />
                </Box>
            </Box>
        </Box>
    );
};

export default function PatternListPage() {
    const navigate = useNavigate();
    /* `|| []` builds a new array on every render, which would make every memo
       below it change identity and refetch. Held steady here instead. */
    const gradeList = useSelector(selectGrades);
    const grades = useMemo(() => gradeList || [], [gradeList]);
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;

    /* questionpapergeneration > pattern. Only an explicit "N" refuses: a session
       whose stored login payload predates the submenu has no key to read, and
       treating "not in my payload" as denied would lock out someone who holds
       the right. Once the key is there it decides on its own. */
    const patternPerms = findSubMenuPermissions(user?.permissions, "questionpapergeneration", "pattern");
    const may = (key) => !patternPerms || patternPerms[key] === "Y";
    const canCreate = may("create");
    const canEditPattern = may("edit");
    const canDeletePattern = may("delete");

    /* A pattern stores the class as its sign ("II"); the filters work in ids.
       Declared once so the list, the view and the builder all resolve alike. */
    const gradeIdOf = useCallback(
        (sign) => grades.find((g) => String(g.sign) === String(sign))?.id || "",
        [grades]
    );

    const [patterns, setPatterns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [gradeFilter, setGradeFilter] = useState("all");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    /* Patterns are scoped to grade + subject, not to an academic year, so the
       list is fetched once and the class filter is applied server-side when one
       is chosen - the search box stays local, it reads the same rows. */
    const load = useCallback(() => {
        setIsLoading(true);
        axios
            .get(ListPatterns, {
                params: {
                    grade: gradeFilter !== "all" ? gradeSign(grades, gradeFilter) || undefined : undefined,
                    requestedByRollNumber: rollNumber,
                },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) { setPatterns([]); return; }
                setPatterns(normalizePatternList(res.data, { gradeIdOf }));
            })
            .catch((error) => {
                setPatterns([]);
                notify(error?.response?.data?.message || "The patterns could not be loaded");
            })
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gradeFilter, grades, rollNumber]);

    useEffect(() => { load(); }, [load]);

    const subjectFilterOptions = useMemo(
        () => Array.from(new Set(patterns.map((p) => p.subject).filter(Boolean))).sort(),
        [patterns]
    );

    const filtered = useMemo(() => patterns.filter((p) => {
        if (categoryFilter !== "all" && p.subject !== categoryFilter) return false;
        if (gradeFilter !== "all" && !p.gradeIds.map(String).includes(String(gradeFilter))) return false;
        if (search.trim()) {
            const t = search.trim().toLowerCase();
            if (!`${p.name} ${p.subject} ${p.createdBy}`.toLowerCase().includes(t)) return false;
        }
        return true;
    }), [patterns, search, categoryFilter, gradeFilter]);

    const openPattern = (pattern) =>
        navigate(`/dashboardmenu/assessment/question-paper/patterns/view/${pattern.id}`, { state: { pattern } });

    const editPattern = (pattern) =>
        navigate(`/dashboardmenu/assessment/question-paper/patterns/${pattern.id}`, { state: { pattern } });

    const clonePattern = (pattern) =>
        navigate("/dashboardmenu/assessment/question-paper/patterns/create", {
            state: { pattern: { ...pattern, id: null, name: `${pattern.name} (Copy)`, usedCount: 0 } },
        });

    const confirmDelete = () => {
        const target = deleteTarget;
        setDeleteTarget(null);
        if (!target?.id) return;

        setDeleting(true);
        axios
            .delete(DeletePattern, {
                params: { patternId: target.id, deletedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify(`"${target.name}" deleted`, true);
                load();
            })
            .catch((error) => notify(error?.response?.data?.message || "The pattern could not be deleted"))
            .finally(() => setDeleting(false));
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    {canCreate && (
                        <Button
                            onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/create")}
                            variant="contained"
                            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                            sx={createBtnSx}
                        >
                            Create Pattern
                        </Button>
                    )}
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
                    <MenuItem value="all" sx={{ fontSize: "13px" }}>All Subjects</MenuItem>
                    {subjectFilterOptions.map((c) => (
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
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5, mb: canCreate ? 2 : 0 }}>
                        {canCreate
                            ? "Build one once - every paper of that exam type reuses it."
                            : "Patterns are built by a role that holds create access for them."}
                    </Typography>
                    {canCreate && (
                        <Button
                            onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/create")}
                            variant="contained"
                            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                            sx={createBtnSx}
                        >
                            Create Pattern
                        </Button>
                    )}
                </Box>
            ) : (
                <Grid container spacing={1.8}>
                    {filtered.map((pattern) => (
                        <Grid key={pattern.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <PatternSheetCard
                                pattern={pattern}
                                grades={grades}
                                onOpen={openPattern}
                                onEdit={editPattern}
                                onClone={clonePattern}
                                onDelete={setDeleteTarget}
                                canEdit={canEditPattern}
                                canClone={canCreate}
                                canDelete={canDeletePattern}
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
                    <Button
                        onClick={confirmDelete}
                        disabled={deleting}
                        sx={{ ...primaryBtnSx, bgcolor: DASH.red, "&:hover": { bgcolor: "#DC2626" } }}
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
