import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, Tooltip,
    InputAdornment, Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import InventoryOutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Loader from "../../Loader";
import { DASH, RADIUS, KPI_TONES, SolidStatCard } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import {
    BANK_USAGE_FILTERS, DIFFICULTY_LEVELS, MOCK_QUESTION_BANK, QUESTION_TYPES,
    filterBank, timesUsed, typeMeta, usageHint,
} from "./questionPaperApi";
import { Pill, TypeChip, DifficultyChip, fieldSx, outlineBtnSx } from "./questionPaperTheme";

/* A question reads as a question, not as a tile: full text, its options under it,
   and the facts a teacher picks on - type, level, marks and how often it has been
   set before - on one line to the right. Cards truncated the text at three lines,
   which is the one thing you cannot skim a bank by. */
const BankQuestionRow = ({ entry, index }) => {
    const meta = typeMeta(entry.type);
    const used = timesUsed(entry);
    const options = entry.options || [];

    return (
        <Box
            sx={{
                display: "flex",
                gap: 1.2,
                px: 1.8,
                py: 1.4,
                borderBottom: `1px solid ${DASH.lineSoft}`,
                "&:last-of-type": { borderBottom: "none" },
                "&:hover": { bgcolor: DASH.surface },
            }}
        >
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.faint, width: 26, flexShrink: 0, pt: 0.2 }}>
                {index + 1}.
            </Typography>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: "13px", color: DASH.ink, lineHeight: 1.65, whiteSpace: "pre-line" }}>
                    {entry.text}
                </Typography>

                {options.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: 0.8 }}>
                        {options.map((o, i) => (
                            <Typography
                                key={o.id || i}
                                sx={{
                                    fontSize: "12px",
                                    color: o.id === entry.answerKey ? DASH.green : DASH.text,
                                    fontWeight: o.id === entry.answerKey ? 700 : 400,
                                    bgcolor: o.id === entry.answerKey ? DASH.greenLight : DASH.surface,
                                    border: `1px solid ${o.id === entry.answerKey ? "#BBF7D0" : DASH.lineSoft}`,
                                    borderRadius: RADIUS,
                                    px: 0.9,
                                    py: 0.3,
                                }}
                            >
                                {String.fromCharCode(97 + i)}) {o.text}
                            </Typography>
                        ))}
                    </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.9, flexWrap: "wrap" }}>
                    <HistoryOutlinedIcon sx={{ fontSize: 13, color: used > 1 ? "#B45309" : DASH.faint }} />
                    <Tooltip arrow title={(entry.usedIn || []).map((u) => `${u.examName} (${u.academicYear})`).join(", ")}>
                        <Typography sx={{ fontSize: "11px", fontWeight: used > 1 ? 700 : 500, color: used > 1 ? "#B45309" : DASH.faint }}>
                            {usageHint(entry)}
                        </Typography>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 260 }}>
                <TypeChip type={entry.type} />
                <DifficultyChip level={entry.difficulty} />
                <Pill label={`${entry.marks} mark${entry.marks > 1 ? "s" : ""}`} color={DASH.ink} bg={DASH.lineSoft} />
                <Pill label={entry.grade} color={meta.color} bg={DASH.surface} />
            </Box>
        </Box>
    );
};

export default function QuestionBankPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const grades = useSelector(selectGrades) || [];

    const [bank, setBank] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [gradeId, setGradeId] = useState("all");
    const [subject, setSubject] = useState("all");
    const [chapterId, setChapterId] = useState("all");
    const [type, setType] = useState("all");
    const [difficulty, setDifficulty] = useState("all");
    // The dashboard chip can land here already filtered.
    const [usage, setUsage] = useState(location.state?.usage || "all");
    const [search, setSearch] = useState("");
    const [openChapters, setOpenChapters] = useState([]);


    /* Mock source. Replace with GET qbank/getAll - the bank is filled server
       side when a paper is approved, so nothing is written from here. */
    const load = useCallback(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setBank(MOCK_QUESTION_BANK);
            setIsLoading(false);
        }, 350);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => { load(); }, [load]);

    // Subject and chapter lists narrow as the class above them is chosen.
    const subjects = useMemo(() => {
        const pool = gradeId === "all" ? bank : bank.filter((e) => String(e.gradeId) === String(gradeId));
        return Array.from(new Set(pool.map((e) => e.subject).filter(Boolean))).sort();
    }, [bank, gradeId]);

    const chapters = useMemo(() => {
        const pool = bank.filter((e) =>
            (gradeId === "all" || String(e.gradeId) === String(gradeId)) &&
            (subject === "all" || e.subject === subject));
        const seen = new Map();
        pool.forEach((e) => { if (e.chapterId && !seen.has(e.chapterId)) seen.set(e.chapterId, e.chapterName); });
        return Array.from(seen, ([id, title]) => ({ id, title }));
    }, [bank, gradeId, subject]);

    const results = useMemo(() => filterBank(bank, {
        gradeId: gradeId === "all" ? null : gradeId,
        subject: subject === "all" ? null : subject,
        chapterIds: chapterId === "all" ? null : [chapterId],
        type, difficulty, usage, search,
    }), [bank, gradeId, subject, chapterId, type, difficulty, usage, search]);

    const stats = useMemo(() => ({
        total: bank.length,
        chapters: new Set(bank.map((e) => `${e.gradeId}-${e.subject}-${e.chapterId}`)).size,
        repeated: bank.filter((e) => timesUsed(e) > 1).length,
        fresh: bank.filter((e) => timesUsed(e) === 0).length,
    }), [bank]);

    /* The bank is browsed chapter by chapter, so the results are filed that way
       rather than paged - a teacher looking for a replacement knows the chapter,
       not the page number. Order follows the chapter list, with anything whose
       chapter is missing collected at the end. */
    const byChapter = useMemo(() => {
        const groups = new Map();
        results.forEach((entry) => {
            const id = entry.chapterId || "unfiled";
            if (!groups.has(id)) {
                groups.set(id, { id, title: entry.chapterName || "Unfiled", subject: entry.subject, items: [] });
            }
            groups.get(id).items.push(entry);
        });
        return Array.from(groups.values());
    }, [results]);

    /* Opening the first chapter shows the shape of the results without a click;
       the rest stay shut so a wide bank does not become a wall of text. */
    useEffect(() => {
        setOpenChapters(byChapter.length ? [byChapter[0].id] : []);
    }, [byChapter]);

    const toggleChapter = (id) =>
        setOpenChapters((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

    const allOpen = byChapter.length > 0 && openChapters.length === byChapter.length;

    const activeFilters =
        (gradeId !== "all" ? 1 : 0) + (subject !== "all" ? 1 : 0) + (chapterId !== "all" ? 1 : 0) +
        (type !== "all" ? 1 : 0) + (difficulty !== "all" ? 1 : 0) + (usage !== "all" ? 1 : 0) +
        (search.trim() ? 1 : 0);

    const reset = () => {
        setGradeId("all"); setSubject("all"); setChapterId("all");
        setType("all"); setDifficulty("all"); setUsage("all"); setSearch(""); };

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
                            Question Bank
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Every question from an approved paper, filed by class, subject and chapter.
                        </Typography>
                    </Box>
                </Box>

                <Tooltip title="Reload" arrow>
                    <IconButton
                        onClick={load}
                        sx={{
                            border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff", ml: { xs: 5, md: 0 },
                            "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                        }}
                    >
                        <RefreshIcon sx={{ fontSize: 18, color: DASH.text }} />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={InventoryOutlinedIcon}
                        label="Questions Banked"
                        value={stats.total}
                        note="From approved papers"
                        tone={KPI_TONES.cyan}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={LayersOutlinedIcon}
                        label="Chapters Covered"
                        value={stats.chapters}
                        note="Across every class"
                        tone={KPI_TONES.violet}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={ReplayOutlinedIcon}
                        label="Repeated"
                        value={stats.repeated}
                        note="Used in more than one paper"
                        tone={KPI_TONES.orange}
                        onClick={() => { setUsage("repeated"); }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard
                        icon={NewReleasesOutlinedIcon}
                        label="Never Used"
                        value={stats.fresh}
                        note="Safe for the next paper"
                        tone={KPI_TONES.green}
                        onClick={() => { setUsage("unused"); }}
                    />
                </Grid>
            </Grid>

            {/* Class, subject and chapter first - the bank is browsed that way. */}
            <Box
                sx={{
                    bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
                    px: 2, py: 1.6, mb: 2,
                }}
            >
                <Grid container spacing={1.2}>
                    <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                        <TextField
                            select fullWidth size="small" label="Class"
                            value={gradeId}
                            onChange={(e) => { setGradeId(e.target.value); setSubject("all"); setChapterId("all"); }}
                            sx={fieldSx}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>All classes</MenuItem>
                            {grades.map((g) => (
                                <MenuItem key={g.id} value={String(g.id)} sx={{ fontSize: "13px" }}>{g.sign}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                        <TextField
                            select fullWidth size="small" label="Subject"
                            value={subject}
                            onChange={(e) => { setSubject(e.target.value); setChapterId("all"); }}
                            sx={fieldSx}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>All subjects</MenuItem>
                            {subjects.map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>{s}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <TextField
                            select fullWidth size="small" label="Chapter"
                            value={chapterId}
                            onChange={(e) => { setChapterId(e.target.value); }}
                            sx={fieldSx}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>All chapters</MenuItem>
                            {chapters.map((c) => (
                                <MenuItem key={c.id} value={c.id} sx={{ fontSize: "13px" }}>{c.title}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 1.5, lg: 1.5 }}>
                        <TextField
                            select fullWidth size="small" label="Type"
                            value={type}
                            onChange={(e) => { setType(e.target.value); }}
                            sx={fieldSx}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>Any</MenuItem>
                            {QUESTION_TYPES.map((t) => (
                                <MenuItem key={t.key} value={t.key} sx={{ fontSize: "13px" }}>{t.short}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 1.5, lg: 1.5 }}>
                        <TextField
                            select fullWidth size="small" label="Level"
                            value={difficulty}
                            onChange={(e) => { setDifficulty(e.target.value); }}
                            sx={fieldSx}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>Any</MenuItem>
                            {DIFFICULTY_LEVELS.map((d) => (
                                <MenuItem key={d.key} value={d.key} sx={{ fontSize: "13px" }}>{d.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                        <TextField
                            select fullWidth size="small" label="Usage"
                            value={usage}
                            onChange={(e) => { setUsage(e.target.value); }}
                            sx={fieldSx}
                        >
                            {BANK_USAGE_FILTERS.map((u) => (
                                <MenuItem key={u.key} value={u.key} sx={{ fontSize: "13px" }}>{u.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.2, flexWrap: "wrap" }}>
                    <TextField
                        size="small"
                        placeholder="Search the question text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); }}
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
                    <Typography sx={{ fontSize: "12px", color: DASH.muted, flexShrink: 0 }}>
                        {results.length} of {bank.length}
                    </Typography>
                    {activeFilters > 0 && (
                        <Button
                            onClick={reset}
                            startIcon={<FilterAltOffOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={{ ...outlineBtnSx, color: DASH.red, borderColor: "#FECACA", "&:hover": { bgcolor: DASH.redLight } }}
                        >
                            Clear ({activeFilters})
                        </Button>
                    )}
                </Box>
            </Box>

            {results.length === 0 ? (
                <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 7, px: 3, textAlign: "center" }}>
                    <InventoryOutlinedIcon sx={{ fontSize: 42, color: DASH.line }} />
                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                        {bank.length === 0 ? "The bank is empty" : "Nothing matches these filters"}
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5, maxWidth: 460, mx: "auto", lineHeight: 1.7 }}>
                        {bank.length === 0
                            ? "Questions are banked automatically once a question paper is approved. Approve a paper and its questions land here."
                            : "Widen the class, subject or chapter and try again."}
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: DASH.muted }}>
                            {byChapter.length} chapter{byChapter.length === 1 ? "" : "s"} · {results.length} question{results.length === 1 ? "" : "s"}
                        </Typography>
                        <Button
                            onClick={() => setOpenChapters(allOpen ? [] : byChapter.map((c) => c.id))}
                            sx={{ ...outlineBtnSx, height: 28 }}
                        >
                            {allOpen ? "Collapse all" : "Expand all"}
                        </Button>
                    </Box>

                    {byChapter.map((chapter) => (
                        <Accordion
                            key={chapter.id}
                            expanded={openChapters.includes(chapter.id)}
                            onChange={() => toggleChapter(chapter.id)}
                            disableGutters
                            elevation={0}
                            slotProps={{ transition: { unmountOnExit: true } }}
                            sx={{
                                mb: 1.2,
                                bgcolor: "#fff",
                                border: `1px solid ${DASH.line}`,
                                borderRadius: `${RADIUS} !important`,
                                overflow: "hidden",
                                "&:before": { display: "none" },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ fontSize: 20, color: DASH.muted }} />}
                                sx={{ px: 1.8, minHeight: 52, "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.2, my: 1 } }}
                            >
                                <MenuBookOutlinedIcon sx={{ fontSize: 17, color: DASH.primary, flexShrink: 0 }} />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                                        {chapter.title}
                                    </Typography>
                                    {chapter.subject && (
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.1 }}>
                                            {chapter.subject}
                                        </Typography>
                                    )}
                                </Box>
                                <Pill
                                    label={`${chapter.items.length} question${chapter.items.length === 1 ? "" : "s"}`}
                                    color={DASH.primary}
                                    bg={DASH.primaryLight}
                                />
                            </AccordionSummary>

                            <AccordionDetails sx={{ p: 0, borderTop: `1px solid ${DASH.lineSoft}` }}>
                                {chapter.items.map((entry, i) => (
                                    <BankQuestionRow key={entry.id} entry={entry} index={i} />
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </>
            )}

        </Box>
    );
}
