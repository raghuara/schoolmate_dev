import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, Checkbox,
    Dialog, DialogContent, InputAdornment, Tooltip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import InventoryOutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";

import { DASH, RADIUS, EmptyNote } from "../../DashBoardComps/dashboardTheme";
import {
    BANK_USAGE_FILTERS, DIFFICULTY_LEVELS, QUESTION_TYPES,
    filterBank, timesUsed, typeMeta, usageHint,
} from "./questionPaperApi";
import { Pill, TypeChip, DifficultyChip, fieldSx, outlineBtnSx, primaryBtnSx } from "./questionPaperTheme";

/* The bank is browsed by class, subject and chapter - never by exam. Which exam
   a question came from is only ever shown as a hint on the row, so a teacher can
   avoid repeating last term's paper without the exam becoming a filter. */
const BankRow = ({ entry, checked, onToggle }) => {
    const meta = typeMeta(entry.type);
    const used = timesUsed(entry);

    return (
        <Box
            onClick={() => onToggle(entry.id)}
            sx={{
                display: "flex", alignItems: "flex-start", gap: 1.2,
                border: `1px solid ${checked ? DASH.primary : DASH.line}`,
                bgcolor: checked ? DASH.primaryLight : "#fff",
                borderRadius: RADIUS, p: 1.3, mb: 1, cursor: "pointer",
                transition: "border-color .15s ease, background-color .15s ease",
                "&:hover": { borderColor: DASH.primaryBorder },
            }}
        >
            <Checkbox
                checked={checked}
                size="small"
                sx={{ p: 0.3, mt: 0.1, "&.Mui-checked": { color: DASH.primary } }}
            />

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: "12.5px", color: DASH.ink, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {entry.text}
                </Typography>

                {meta.hasOptions && entry.options?.length > 0 && (
                    <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.5 }}>
                        {entry.options.map((o) => `${o.id}) ${o.text}`).join("   ")}
                    </Typography>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap", mt: 0.9 }}>
                    <TypeChip type={entry.type} />
                    <DifficultyChip level={entry.difficulty} />
                    <Pill label={`${entry.marks} mark${entry.marks > 1 ? "s" : ""}`} color={DASH.ink} bg={DASH.lineSoft} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.35 }}>
                        <MenuBookOutlinedIcon sx={{ fontSize: 12, color: DASH.faint }} />
                        <Typography sx={{ fontSize: "10.5px", color: DASH.muted }}>{entry.chapterName}</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.7 }}>
                    <HistoryOutlinedIcon sx={{ fontSize: 13, color: used > 1 ? "#B45309" : DASH.faint }} />
                    <Typography
                        sx={{
                            fontSize: "11px",
                            fontWeight: used > 1 ? 700 : 500,
                            color: used > 1 ? "#B45309" : DASH.faint,
                        }}
                    >
                        {usageHint(entry)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default function QuestionBankDialog({
    open,
    onClose,
    bank,
    section,
    gradeId,
    gradeLabel,
    subject,
    chapters = [],
    existingText = [],
    onAdd,
    /* "add" appends everything ticked to the section; "replace" swaps the one
       question the teacher opened this from, so picking a second replaces the
       first rather than adding to a list. */
    mode = "add",
}) {
    const [chapterId, setChapterId] = useState("all");
    const [type, setType] = useState("all");
    const [difficulty, setDifficulty] = useState("all");
    const [usage, setUsage] = useState("all");
    const [search, setSearch] = useState("");
    const [picked, setPicked] = useState([]);

    // Open on the section's own question type - that is what the teacher needs.
    useEffect(() => {
        if (!open) return;
        setType(section?.type || "all");
        setChapterId("all");
        setDifficulty("all");
        setUsage("all");
        setSearch("");
        setPicked([]);
    }, [open, section?.type]);

    const chapterIds = chapters.map((c) => c.id);

    const results = useMemo(() => filterBank(bank, {
        gradeId,
        subject,
        chapterIds: chapterId === "all" ? chapterIds : [chapterId],
        type,
        difficulty,
        usage,
        search,
        excludeText: existingText,
    }), [bank, gradeId, subject, chapterIds, chapterId, type, difficulty, usage, search, existingText]);

    const replacing = mode === "replace";

    const toggle = (id) =>
        setPicked((prev) => {
            if (replacing) return prev.includes(id) ? [] : [id];
            return prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
        });

    const activeFilters =
        (chapterId !== "all" ? 1 : 0) + (type !== "all" ? 1 : 0) +
        (difficulty !== "all" ? 1 : 0) + (usage !== "all" ? 1 : 0) + (search.trim() ? 1 : 0);

    const reset = () => {
        setChapterId("all"); setType("all"); setDifficulty("all"); setUsage("all"); setSearch("");
    };

    const add = () => {
        const chosen = results.filter((r) => picked.includes(r.id));
        onAdd(chosen);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: "10px", height: "88vh" } } }}
        >
            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: 1.2,
                    px: 2.2, py: 1.6, borderBottom: `1px solid ${DASH.line}`,
                }}
            >
                <Box
                    sx={{
                        width: 34, height: 34, borderRadius: RADIUS, flexShrink: 0,
                        bgcolor: DASH.cyanLight, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <InventoryOutlinedIcon sx={{ fontSize: 19, color: DASH.cyan }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>
                        {replacing ? "Replace from Question Bank" : "Question Bank"}
                    </Typography>
                    <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                        {[gradeLabel, subject].filter(Boolean).join(" - ")}
                        {section ? ` - ${replacing ? "replacing a question in" : "adding to"} ${section.label || "this section"}` : ""}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ width: 32, height: 32 }}>
                    <CloseIcon sx={{ fontSize: 18, color: DASH.muted }} />
                </IconButton>
            </Box>

            <Box sx={{ px: 2.2, py: 1.5, borderBottom: `1px solid ${DASH.lineSoft}`, bgcolor: "#FCFCFD" }}>
                <Grid container spacing={1.2}>
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                        <TextField
                            fullWidth size="small" placeholder="Search the question text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={fieldSx}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 16, color: DASH.faint }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                        <TextField
                            select fullWidth size="small" label="Chapter"
                            value={chapterId}
                            onChange={(e) => setChapterId(e.target.value)}
                            sx={fieldSx}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>All selected chapters</MenuItem>
                            {chapters.map((c) => (
                                <MenuItem key={c.id} value={c.id} sx={{ fontSize: "13px" }}>
                                    {c.number ? `${c.number}. ` : ""}{c.title}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 2, lg: 2 }}>
                        <TextField
                            select fullWidth size="small" label="Type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            sx={fieldSx}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>Any type</MenuItem>
                            {QUESTION_TYPES.map((t) => (
                                <MenuItem key={t.key} value={t.key} sx={{ fontSize: "13px" }}>{t.short}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 1.5, lg: 1.5 }}>
                        <TextField
                            select fullWidth size="small" label="Level"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            sx={fieldSx}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>Any</MenuItem>
                            {DIFFICULTY_LEVELS.map((d) => (
                                <MenuItem key={d.key} value={d.key} sx={{ fontSize: "13px" }}>{d.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 1.5, lg: 1.5 }}>
                        <TextField
                            select fullWidth size="small" label="Usage"
                            value={usage}
                            onChange={(e) => setUsage(e.target.value)}
                            sx={fieldSx}
                        >
                            {BANK_USAGE_FILTERS.map((u) => (
                                <MenuItem key={u.key} value={u.key} sx={{ fontSize: "13px" }}>{u.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.2, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                        {results.length} question{results.length === 1 ? "" : "s"} in the bank
                    </Typography>
                    {activeFilters > 0 && (
                        <Button
                            onClick={reset}
                            startIcon={<FilterAltOffOutlinedIcon sx={{ fontSize: 14 }} />}
                            sx={{ ...outlineBtnSx, py: 0.2, fontSize: "11px", color: DASH.red, borderColor: "#FECACA" }}
                        >
                            Clear ({activeFilters})
                        </Button>
                    )}
                    <Tooltip arrow title="Questions already in this paper are hidden">
                        <Typography sx={{ fontSize: "11px", color: DASH.faint, ml: "auto" }}>
                            Already-used questions hidden
                        </Typography>
                    </Tooltip>
                </Box>
            </Box>

            <DialogContent sx={{ px: 2.2, py: 1.6, bgcolor: DASH.canvas }}>
                {results.length === 0 ? (
                    <EmptyNote
                        text={
                            chapterIds.length === 0
                                ? "Pick chapters on step 2 first - the bank is browsed chapter by chapter."
                                : "No question in the bank matches these filters yet."
                        }
                    />
                ) : (
                    results.map((entry) => (
                        <BankRow
                            key={entry.id}
                            entry={entry}
                            checked={picked.includes(entry.id)}
                            onToggle={toggle}
                        />
                    ))
                )}
            </DialogContent>

            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 1.5, px: 2.2, py: 1.5, borderTop: `1px solid ${DASH.line}`, bgcolor: "#fff",
                }}
            >
                <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: picked.length ? DASH.ink : DASH.faint }}>
                    {replacing
                        ? (picked.length ? "1 chosen" : "Pick the replacement")
                        : `${picked.length} selected`}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button onClick={onClose} sx={outlineBtnSx}>Cancel</Button>
                    <Button onClick={add} disabled={picked.length === 0} sx={primaryBtnSx}>
                        {replacing
                            ? "Replace question"
                            : `Add ${picked.length || ""} question${picked.length === 1 ? "" : "s"}`}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
