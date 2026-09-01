import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, Checkbox,
    Drawer, InputAdornment, Tooltip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import InventoryOutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { DASH, RADIUS, EmptyNote } from "../../DashBoardComps/dashboardTheme";
import {
    BANK_USAGE_FILTERS, DIFFICULTY_LEVELS, QUESTION_TYPES,
    filterBank, timesUsed, typeMeta, usageHint,
} from "./questionPaperApi";
import { Pill, TypeChip, DifficultyChip, fieldSx, outlineBtnSx, primaryBtnSx } from "./questionPaperTheme";

// Wide enough to read a full question without leaving the paper behind it.
const DRAWER_W = { xs: "100%", sm: 520, md: 600 };

const BANK_PAGE = "/dashboardmenu/assessment/question-paper/bank";

/* The bank is browsed by class, subject and chapter - never by exam. Which exam
   a question came from is only ever shown as a hint on the row, so a teacher can
   avoid repeating last term's paper without the exam becoming a filter. */
const BankRow = ({ entry, checked, added, replacing, onToggle, onQuickAdd }) => {
    const meta = typeMeta(entry.type);
    const used = timesUsed(entry);

    return (
        <Box
            onClick={() => !added && onToggle(entry.id)}
            sx={{
                border: `1px solid ${added ? "#BBF7D0" : checked ? DASH.primary : DASH.line}`,
                bgcolor: added ? DASH.greenLight : checked ? DASH.primaryLight : "#fff",
                borderRadius: RADIUS, p: 1.3, mb: 1,
                cursor: added ? "default" : "pointer",
                transition: "border-color .15s ease, background-color .15s ease",
                "&:hover": added ? {} : { borderColor: DASH.primaryBorder },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                {!added && (
                    <Checkbox
                        checked={checked}
                        size="small"
                        sx={{ p: 0.3, mt: 0.1, "&.Mui-checked": { color: DASH.primary } }}
                    />
                )}

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
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.35, minWidth: 0 }}>
                            <MenuBookOutlinedIcon sx={{ fontSize: 12, color: DASH.faint, flexShrink: 0 }} />
                            <Typography
                                sx={{
                                    fontSize: "10.5px", color: DASH.muted, minWidth: 0,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}
                            >
                                {entry.chapterName}
                            </Typography>
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

                {/* One question, one click. The tick boxes are still there for
                    picking a batch, but the common case is adding this one. */}
                <Box sx={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    {added ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, px: 0.8, height: 28 }}>
                            <CheckIcon sx={{ fontSize: 15, color: DASH.green }} />
                            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#065F46" }}>
                                Added
                            </Typography>
                        </Box>
                    ) : (
                        <Button
                            onClick={() => onQuickAdd(entry)}
                            startIcon={replacing
                                ? <SwapHorizIcon sx={{ fontSize: 15 }} />
                                : <AddIcon sx={{ fontSize: 15 }} />}
                            sx={{ ...outlineBtnSx, height: 28, py: 0, fontSize: "11.5px", px: 1.2 }}
                        >
                            {replacing ? "Use" : "Add"}
                        </Button>
                    )}
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
    // Ids added during this visit, so the row can stay put and say so.
    const [addedIds, setAddedIds] = useState([]);
    /* The questions already in the paper when the panel opened. Filtering on the
       live list instead would make a row vanish the moment it is added, which
       reads as the click having gone wrong. */
    const [baseExisting, setBaseExisting] = useState([]);

    // Open on the section's own question type - that is what the teacher needs.
    useEffect(() => {
        if (!open) return;
        setType(section?.type || "all");
        setChapterId("all");
        setDifficulty("all");
        setUsage("all");
        setSearch("");
        setPicked([]);
        setAddedIds([]);
        setBaseExisting(existingText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        excludeText: baseExisting,
    }), [bank, gradeId, subject, chapterIds, chapterId, type, difficulty, usage, search, baseExisting]);

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

    // Replacing swaps one question, so it finishes the job and closes.
    const quickAdd = (entry) => {
        onAdd([entry]);
        if (replacing) { onClose(); return; }
        setAddedIds((prev) => [...prev, entry.id]);
        setPicked((prev) => prev.filter((id) => id !== entry.id));
    };

    const addPicked = () => {
        const chosen = results.filter((r) => picked.includes(r.id) && !addedIds.includes(r.id));
        if (!chosen.length) return;
        onAdd(chosen);
        onClose();
    };

    const pickedCount = picked.filter((id) => !addedIds.includes(id)).length;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: { width: DRAWER_W, maxWidth: "100%", display: "flex", flexDirection: "column" },
                },
            }}
        >
            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: 1.2,
                    px: 2, py: 1.5, borderBottom: `1px solid ${DASH.line}`, flexShrink: 0,
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
                    <Typography
                        sx={{
                            fontSize: "11.5px", color: DASH.muted,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                    >
                        {[gradeLabel, subject].filter(Boolean).join(" - ")}
                        {section ? ` - ${replacing ? "replacing in" : "adding to"} ${section.label || "this section"}` : ""}
                    </Typography>
                </Box>
                {/* The full page, for browsing beyond this paper. Opened in its own
                    tab so the half-built paper behind this panel survives. */}
                <Tooltip title="Open the full Question Bank" arrow>
                    <IconButton
                        onClick={() => window.open(BANK_PAGE, "_blank", "noopener")}
                        sx={{ width: 32, height: 32 }}
                    >
                        <OpenInNewIcon sx={{ fontSize: 16, color: DASH.muted }} />
                    </IconButton>
                </Tooltip>
                <IconButton onClick={onClose} sx={{ width: 32, height: 32 }}>
                    <CloseIcon sx={{ fontSize: 18, color: DASH.muted }} />
                </IconButton>
            </Box>

            <Box sx={{ px: 2, py: 1.4, borderBottom: `1px solid ${DASH.lineSoft}`, bgcolor: "#FCFCFD", flexShrink: 0 }}>
                <Grid container spacing={1.2}>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
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
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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
                    <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
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
                    <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
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

            <Box sx={{ px: 2, py: 1.5, bgcolor: DASH.canvas, flex: 1, minHeight: 0, overflowY: "auto" }}>
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
                            added={addedIds.includes(entry.id)}
                            replacing={replacing}
                            onToggle={toggle}
                            onQuickAdd={quickAdd}
                        />
                    ))
                )}
            </Box>

            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 1.5, px: 2, py: 1.4, borderTop: `1px solid ${DASH.line}`, bgcolor: "#fff", flexShrink: 0,
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: pickedCount ? DASH.ink : DASH.faint }}>
                        {replacing
                            ? "Pick the replacement"
                            : `${pickedCount} selected`}
                    </Typography>
                    {addedIds.length > 0 && (
                        <Typography sx={{ fontSize: "11px", color: DASH.green, fontWeight: 600 }}>
                            {addedIds.length} added to the paper
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                    <Button onClick={onClose} sx={outlineBtnSx}>
                        {addedIds.length > 0 ? "Done" : "Cancel"}
                    </Button>
                    {!replacing && (
                        <Button onClick={addPicked} disabled={pickedCount === 0} sx={primaryBtnSx}>
                            Add {pickedCount || ""} selected
                        </Button>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}
