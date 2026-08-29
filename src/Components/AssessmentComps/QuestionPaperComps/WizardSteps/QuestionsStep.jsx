import React, { useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, Tooltip,
    Radio, Menu,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import { DASH, RADIUS } from "../../../DashBoardComps/dashboardTheme";
import {
    BLOOM_LEVELS, DIFFICULTY_LEVELS, groupMarks, groupSections,
    sectionHeading, sectionInstruction, sectionMarks, sectionMarksLabel, typeMeta,
} from "../questionPaperApi";
import { Pill, TypeChip, DifficultyChip, fieldSx, outlineBtnSx, primaryBtnSx, Banner } from "../questionPaperTheme";

const DUP_TONES = {
    duplicate: { color: DASH.red, bg: DASH.redLight, border: "#FECACA", icon: ErrorOutlineIcon, label: "Duplicate" },
    similar: { color: "#B45309", bg: DASH.primaryLight, border: DASH.primaryBorder, icon: WarningAmberOutlinedIcon, label: "Similar" },
    reused: { color: DASH.muted, bg: DASH.lineSoft, border: DASH.line, icon: HistoryOutlinedIcon, label: "Used before" },
};

const QuestionCard = ({
    question,
    number,
    index,
    total,
    sections,
    chapters,
    duplicate,
    editing,
    onEdit,
    onChange,
    onRemove,
    onMove,
    onMoveToSection,
    onRegenerate,
    onSwapFromBank,
}) => {
    const meta = typeMeta(question.type);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const tone = duplicate ? DUP_TONES[duplicate.level] : null;
    const DupIcon = tone?.icon;

    const setOption = (optionId, text) =>
        onChange({ ...question, options: question.options.map((o) => (o.id === optionId ? { ...o, text } : o)) });

    const addOption = () => {
        const nextId = String.fromCharCode(97 + question.options.length);
        onChange({ ...question, options: [...question.options, { id: nextId, text: "" }] });
    };

    const removeOption = (optionId) => {
        const options = question.options
            .filter((o) => o.id !== optionId)
            .map((o, i) => ({ ...o, id: String.fromCharCode(97 + i) }));
        onChange({
            ...question,
            options,
            answerKey: options.some((o) => o.id === question.answerKey) ? question.answerKey : "",
        });
    };

    const setPair = (index, side, value) =>
        onChange({
            ...question,
            pairs: (question.pairs || []).map((p, i) => (i === index ? { ...p, [side]: value } : p)),
        });

    const addPair = () => onChange({ ...question, pairs: [...(question.pairs || []), { left: "", right: "" }] });

    const removePair = (index) =>
        onChange({ ...question, pairs: (question.pairs || []).filter((_, i) => i !== index) });

    const setBullet = (index, value) =>
        onChange({ ...question, bullets: (question.bullets || []).map((b, i) => (i === index ? value : b)) });

    const addBullet = () => onChange({ ...question, bullets: [...(question.bullets || []), ""] });

    const removeBullet = (index) =>
        onChange({ ...question, bullets: (question.bullets || []).filter((_, i) => i !== index) });

    return (
        <Box
            id={`question-${question.id}`}
            sx={{
                border: `1px solid ${tone ? tone.border : DASH.line}`,
                borderLeft: `3px solid ${tone ? tone.color : meta.color}`,
                bgcolor: tone && duplicate.level === "duplicate" ? tone.bg : "#fff",
                borderRadius: RADIUS,
                mb: 1.2,
                overflow: "hidden",
                transition: "border-color .2s ease",
                "&:hover": { ".qActions": { opacity: 1 } },
            }}
        >
            <Box sx={{ p: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box
                        sx={{
                            width: 24, height: 24, borderRadius: RADIUS, flexShrink: 0,
                            bgcolor: meta.bg, display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <Typography sx={{ fontSize: "10.5px", fontWeight: 800, color: meta.color }}>{number}</Typography>
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        {editing ? (
                            <TextField
                                fullWidth multiline minRows={2} size="small"
                                value={question.text}
                                onChange={(e) => onChange({ ...question, text: e.target.value })}
                                placeholder="Type the question"
                                sx={fieldSx}
                            />
                        ) : (
                            <Typography sx={{ fontSize: "13px", color: DASH.ink, lineHeight: 1.6 }}>
                                {question.text || <span style={{ color: DASH.faint, fontStyle: "italic" }}>Empty question</span>}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0 }}>
                        <Pill label={`${question.marks} mark${question.marks > 1 ? "s" : ""}`} color={DASH.ink} bg={DASH.lineSoft} />
                        <Box className="qActions" sx={{ display: "flex", gap: 0.1, opacity: { xs: 1, md: 0 }, transition: "opacity .2s ease" }}>
                            <Tooltip title={editing ? "Done" : "Edit"} arrow>
                                <IconButton size="small" onClick={() => onEdit(editing ? null : question.id)} sx={{ width: 26, height: 26 }}>
                                    {editing
                                        ? <CheckCircleIcon sx={{ fontSize: 15, color: DASH.green }} />
                                        : <EditOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Move up" arrow>
                                <span>
                                    <IconButton size="small" disabled={index === 0} onClick={() => onMove(question, -1)} sx={{ width: 26, height: 26 }}>
                                        <ArrowUpwardIcon sx={{ fontSize: 14, color: DASH.muted }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Move down" arrow>
                                <span>
                                    <IconButton size="small" disabled={index === total - 1} onClick={() => onMove(question, 1)} sx={{ width: 26, height: 26 }}>
                                        <ArrowDownwardIcon sx={{ fontSize: 14, color: DASH.muted }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Move to another section" arrow>
                                <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ width: 26, height: 26 }}>
                                    <SwapHorizOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Regenerate this question" arrow>
                                <IconButton size="small" onClick={() => onRegenerate(question)} sx={{ width: 26, height: 26 }}>
                                    <AutorenewIcon sx={{ fontSize: 15, color: DASH.violet }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Replace from the question bank" arrow>
                                <IconButton size="small" onClick={() => onSwapFromBank(question)} sx={{ width: 26, height: 26 }}>
                                    <InventoryOutlinedIcon sx={{ fontSize: 15, color: DASH.cyan }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove" arrow>
                                <IconButton size="small" onClick={() => onRemove(question)} sx={{ width: 26, height: 26 }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 15, color: DASH.red }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>

                {meta.hasPassage && (
                    <Box sx={{ mt: 1.2, pl: 4 }}>
                        {editing ? (
                            <TextField
                                fullWidth multiline minRows={3} size="small"
                                label="Extract / passage printed above this question"
                                value={question.passage || ""}
                                onChange={(e) => onChange({ ...question, passage: e.target.value })}
                                sx={fieldSx}
                            />
                        ) : question.passage ? (
                            <Box sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 1.2, bgcolor: "#FCFCFD" }}>
                                <Typography sx={{ fontSize: "11.5px", color: DASH.text, lineHeight: 1.7 }}>
                                    {question.passage}
                                </Typography>
                            </Box>
                        ) : null}
                    </Box>
                )}

                {meta.hasPairs && (
                    <Box sx={{ mt: 1.2, pl: 4 }}>
                        {(question.pairs || []).map((pair, i) => (
                            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.7 }}>
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, width: 16, flexShrink: 0 }}>
                                    {i + 1}.
                                </Typography>
                                {editing ? (
                                    <>
                                        <TextField
                                            size="small" placeholder="Column A"
                                            value={pair.left}
                                            onChange={(e) => setPair(i, "left", e.target.value)}
                                            sx={{ ...fieldSx, flex: 1, "& input": { py: 0.5, fontSize: "12.5px" } }}
                                        />
                                        <TextField
                                            size="small" placeholder="Column B"
                                            value={pair.right}
                                            onChange={(e) => setPair(i, "right", e.target.value)}
                                            sx={{ ...fieldSx, flex: 1, "& input": { py: 0.5, fontSize: "12.5px" } }}
                                        />
                                        <IconButton size="small" onClick={() => removePair(i)} sx={{ width: 24, height: 24 }}>
                                            <DeleteOutlineIcon sx={{ fontSize: 13, color: DASH.red }} />
                                        </IconButton>
                                    </>
                                ) : (
                                    <Typography sx={{ fontSize: "12px", color: DASH.text }}>
                                        {pair.left} <span style={{ color: DASH.faint }}>&mdash;</span> {pair.right}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                        {editing && (
                            <Button onClick={addPair} startIcon={<AddIcon sx={{ fontSize: 14 }} />} sx={{ ...outlineBtnSx, py: 0.2, fontSize: "11.5px" }}>
                                Add pair
                            </Button>
                        )}
                    </Box>
                )}

                {meta.hasBullets && (
                    <Box sx={{ mt: 1.2, pl: 4 }}>
                        {(question.bullets || []).map((point, i) => (
                            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.6 }}>
                                <Typography sx={{ fontSize: "12px", color: DASH.faint, flexShrink: 0 }}>&mdash;</Typography>
                                {editing ? (
                                    <>
                                        <TextField
                                            size="small" placeholder="Point for the student"
                                            value={point}
                                            onChange={(e) => setBullet(i, e.target.value)}
                                            sx={{ ...fieldSx, flex: 1, "& input": { py: 0.5, fontSize: "12.5px" } }}
                                        />
                                        <IconButton size="small" onClick={() => removeBullet(i)} sx={{ width: 24, height: 24 }}>
                                            <DeleteOutlineIcon sx={{ fontSize: 13, color: DASH.red }} />
                                        </IconButton>
                                    </>
                                ) : (
                                    <Typography sx={{ fontSize: "12px", color: DASH.text }}>{point}</Typography>
                                )}
                            </Box>
                        ))}
                        {editing && (
                            <Button onClick={addBullet} startIcon={<AddIcon sx={{ fontSize: 14 }} />} sx={{ ...outlineBtnSx, py: 0.2, fontSize: "11.5px" }}>
                                Add point
                            </Button>
                        )}
                    </Box>
                )}

                {meta.hasOptions && (
                    <Box sx={{ mt: 1.2, pl: 4 }}>
                        <Grid container spacing={1}>
                            {question.options.map((option) => {
                                const isAnswer = question.answerKey === option.id;
                                return (
                                    <Grid key={option.id} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <Box
                                            sx={{
                                                display: "flex", alignItems: "center", gap: 0.6,
                                                border: `1px solid ${isAnswer ? DASH.green : DASH.line}`,
                                                bgcolor: isAnswer ? DASH.greenLight : "#fff",
                                                borderRadius: RADIUS, px: 0.8, py: 0.4,
                                            }}
                                        >
                                            <Radio
                                                size="small"
                                                checked={isAnswer}
                                                onChange={() => onChange({ ...question, answerKey: option.id })}
                                                sx={{ p: 0.3, "&.Mui-checked": { color: DASH.green } }}
                                            />
                                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.muted, flexShrink: 0 }}>
                                                {option.id})
                                            </Typography>
                                            {editing ? (
                                                <TextField
                                                    fullWidth size="small" variant="standard"
                                                    value={option.text}
                                                    onChange={(e) => setOption(option.id, e.target.value)}
                                                    slotProps={{ input: { disableUnderline: true, sx: { fontSize: "12.5px" } } }}
                                                />
                                            ) : (
                                                <Typography sx={{ fontSize: "12.5px", color: DASH.text, flex: 1, minWidth: 0 }}>
                                                    {option.text || <span style={{ color: DASH.faint }}>-</span>}
                                                </Typography>
                                            )}
                                            {editing && question.options.length > 2 && (
                                                <IconButton size="small" onClick={() => removeOption(option.id)} sx={{ width: 22, height: 22 }}>
                                                    <DeleteOutlineIcon sx={{ fontSize: 13, color: DASH.red }} />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {editing && question.options.length < 6 && (
                            <Button onClick={addOption} startIcon={<AddIcon sx={{ fontSize: 14 }} />} sx={{ ...outlineBtnSx, mt: 1, py: 0.2, fontSize: "11.5px" }}>
                                Add option
                            </Button>
                        )}
                    </Box>
                )}

                {!meta.hasOptions && (
                    <Box sx={{ mt: 1.2, pl: 4 }}>
                        {editing ? (
                            <TextField
                                fullWidth size="small" label="Model answer"
                                value={question.answerKey}
                                onChange={(e) => onChange({ ...question, answerKey: e.target.value })}
                                sx={fieldSx}
                            />
                        ) : (
                            <Typography sx={{ fontSize: "12px", color: DASH.green, fontWeight: 600 }}>
                                Ans: {question.answerKey || <span style={{ color: DASH.faint, fontWeight: 400 }}>not set</span>}
                            </Typography>
                        )}
                    </Box>
                )}

                {editing && (
                    <Grid container spacing={1.2} sx={{ mt: 0.6, pl: 4 }}>
                        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <TextField
                                select fullWidth size="small" label="Difficulty"
                                value={question.difficulty}
                                onChange={(e) => onChange({ ...question, difficulty: e.target.value })}
                                sx={fieldSx}
                            >
                                {DIFFICULTY_LEVELS.map((d) => (
                                    <MenuItem key={d.key} value={d.key} sx={{ fontSize: "13px" }}>{d.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <TextField
                                select fullWidth size="small" label="Bloom level"
                                value={question.bloom}
                                onChange={(e) => onChange({ ...question, bloom: e.target.value })}
                                sx={fieldSx}
                            >
                                {BLOOM_LEVELS.map((b) => (
                                    <MenuItem key={b} value={b} sx={{ fontSize: "13px" }}>{b}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <TextField
                                select fullWidth size="small" label="From chapter"
                                value={question.chapterId || ""}
                                onChange={(e) => {
                                    const chapter = chapters.find((c) => c.id === e.target.value);
                                    onChange({ ...question, chapterId: e.target.value, chapterName: chapter?.title || "" });
                                }}
                                sx={fieldSx}
                            >
                                {chapters.map((c) => (
                                    <MenuItem key={c.id} value={c.id} sx={{ fontSize: "13px" }}>{c.number}. {c.title}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3, md: 2, lg: 2 }}>
                            <TextField
                                fullWidth size="small" label="Marks"
                                value={question.marks}
                                onChange={(e) => onChange({ ...question, marks: Number(e.target.value.replace(/[^0-9]/g, "")) || 1 })}
                                sx={fieldSx}
                            />
                        </Grid>
                    </Grid>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap", mt: 1.2, pl: 4 }}>
                    <TypeChip type={question.type} />
                    <DifficultyChip level={question.difficulty} />
                    <Pill label={question.bloom} color={DASH.violet} bg={DASH.violetLight} border="#DDD6FE" />
                    {question.chapterName && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.35 }}>
                            <MenuBookOutlinedIcon sx={{ fontSize: 12, color: DASH.faint }} />
                            <Typography sx={{ fontSize: "10.5px", color: DASH.muted }}>{question.chapterName}</Typography>
                        </Box>
                    )}
                    {question.source === "manual" && <Pill label="Added manually" color={DASH.blue} bg={DASH.blueLight} border="#BFDBFE" />}
                </Box>

                {duplicate && (
                    <Box
                        sx={{
                            display: "flex", alignItems: "center", gap: 0.8, mt: 1.2, ml: 4,
                            px: 1.2, py: 0.7, borderRadius: RADIUS,
                            bgcolor: tone.bg, border: `1px solid ${tone.border}`,
                        }}
                    >
                        <DupIcon sx={{ fontSize: 15, color: tone.color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "11.5px", color: tone.color, fontWeight: 600 }}>
                            {duplicate.level === "duplicate" && "Same as another question in this paper - remove or rewrite it."}
                            {duplicate.level === "similar" && `Very close to question ${duplicate.matchIndex + 1} (${Math.round(duplicate.score * 100)}% match).`}
                            {duplicate.level === "reused" && `This question already appeared in ${duplicate.papers} published paper(s).`}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                slotProps={{ paper: { sx: { borderRadius: RADIUS } } }}
            >
                {sections.map((section) => (
                    <MenuItem
                        key={section.id}
                        disabled={section.id === question.sectionId}
                        onClick={() => { onMoveToSection(question, section); setMenuAnchor(null); }}
                        sx={{ fontSize: "13px" }}
                    >
                        {section.label} - {typeMeta(section.type).short}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default function QuestionsStep({
    pattern,
    questions,
    chapters,
    duplicates,
    onChangeQuestion,
    onRemoveQuestion,
    onMoveQuestion,
    onMoveToSection,
    onAddQuestion,
    onPickFromBank,
    onRegenerateOne,
    onSwapFromBank,
    onRegenerateAll,
}) {
    const [editingId, setEditingId] = useState(null);
    // Memoised so the three useMemos below actually memoise.
    const sections = useMemo(() => pattern?.sections || [], [pattern]);

    const grouped = useMemo(
        () => sections.map((section) => ({
            section,
            items: questions.filter((q) => q.sectionId === section.id),
        })),
        [sections, questions]
    );

    const totals = useMemo(() => {
        const marks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
        const answered = sections.reduce((sum, s) => sum + sectionMarks(s), 0);
        return { marks, answered };
    }, [questions, sections]);

    // The first section of every named group carries that group's heading.
    const groupStarts = useMemo(() => {
        const map = {};
        groupSections(sections).forEach((group) => {
            if (group.name) map[group.sections[0].id] = { name: group.name, marks: groupMarks(group) };
        });
        return map;
    }, [sections]);

    const jumpTo = (id) => {
        const node = document.getElementById(`question-${id}`);
        if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const firstFlagged = Object.entries(duplicates.map || {})
        .filter(([, d]) => d.level === "duplicate" || d.level === "similar")
        .map(([id]) => id)[0];

    let running = 0;

    return (
        <>
            {duplicates.duplicateCount > 0 ? (
                <Banner
                    tone="error"
                    icon={ErrorOutlineIcon}
                    title={`${duplicates.duplicateCount} duplicate question${duplicates.duplicateCount > 1 ? "s" : ""} in this paper`}
                    right={
                        firstFlagged && (
                            <Button onClick={() => jumpTo(firstFlagged)} sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px", flexShrink: 0 }}>
                                Jump to it
                            </Button>
                        )
                    }
                >
                    The same question is printed more than once. Remove or rewrite it before sending the paper for approval.
                    {duplicates.similarCount > 0 && ` ${duplicates.similarCount} more look very similar.`}
                </Banner>
            ) : duplicates.similarCount > 0 ? (
                <Banner
                    tone="warn"
                    icon={WarningAmberOutlinedIcon}
                    title={`${duplicates.similarCount} question${duplicates.similarCount > 1 ? "s" : ""} look similar`}
                    right={
                        firstFlagged && (
                            <Button onClick={() => jumpTo(firstFlagged)} sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px", flexShrink: 0 }}>
                                Jump to it
                            </Button>
                        )
                    }
                >
                    They are not exact repeats, so you can keep them - just check they are testing different things.
                </Banner>
            ) : (
                <Banner tone="ok" icon={DoneAllIcon} title="No repeated questions">
                    Every question in this paper is unique.
                    {duplicates.reusedCount > 0 && ` ${duplicates.reusedCount} appeared in an earlier published paper - marked below.`}
                </Banner>
            )}

            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 1.5, flexWrap: "wrap", mb: 1.8,
                    bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 2, py: 1.2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.text }}>
                        <strong>{questions.length}</strong> questions printed - the student answers{" "}
                        <strong>{totals.answered}</strong> marks worth
                    </Typography>
                    <Pill label={`${pattern?.totalMarks || 0} marks paper`} color={DASH.ink} bg={DASH.primaryLight} border={DASH.primaryBorder} />
                </Box>
                <Button onClick={onRegenerateAll} startIcon={<AutorenewIcon sx={{ fontSize: 16 }} />} sx={outlineBtnSx}>
                    Regenerate all
                </Button>
            </Box>

            {grouped.map(({ section, items }) => {
                const shortfall = items.length < section.questionsToPrint;
                const groupStart = groupStarts[section.id];
                return (
                    <React.Fragment key={section.id}>
                    {groupStart && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mt: 2.4, mb: 1.2 }}>
                            <Typography
                                sx={{
                                    fontSize: "12px", fontWeight: 800, letterSpacing: "0.1em",
                                    textTransform: "uppercase", color: DASH.ink, flexShrink: 0,
                                }}
                            >
                                {groupStart.name}
                            </Typography>
                            <Pill label={`${groupStart.marks} marks`} color={DASH.muted} bg={DASH.lineSoft} />
                            <Box sx={{ flex: 1, height: "2px", bgcolor: DASH.line }} />
                        </Box>
                    )}
                    <Box
                        sx={{
                            bgcolor: "#fff", border: `1px solid ${DASH.line}`,
                            borderRadius: RADIUS, mb: 1.8, overflow: "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                gap: 1, flexWrap: "wrap",
                                px: 2, py: 1.3, bgcolor: typeMeta(section.type).bg,
                                borderBottom: `1px solid ${DASH.lineSoft}`,
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: "13.5px", fontWeight: 800, color: DASH.ink }}>
                                    {sectionHeading(section) || typeMeta(section.type).label}
                                    {section.title ? ` - ${section.title}` : ""}
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2, fontStyle: "italic" }}>
                                    {sectionInstruction(section)}
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                                <Pill
                                    label={`${items.length} / ${section.questionsToPrint} questions`}
                                    color={shortfall ? DASH.red : DASH.green}
                                    bg={shortfall ? DASH.redLight : DASH.greenLight}
                                    border={shortfall ? "#FECACA" : "#BBF7D0"}
                                />
                                <Pill label={sectionMarksLabel(section) || `${sectionMarks(section)}`} color={DASH.ink} bg="#fff" border={DASH.line} />
                                <Button
                                    onClick={() => onPickFromBank(section)}
                                    startIcon={<InventoryOutlinedIcon sx={{ fontSize: 14 }} />}
                                    sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px", color: DASH.cyan, borderColor: "#A5F3FC" }}
                                >
                                    Question Bank
                                </Button>
                                <Button
                                    onClick={() => onAddQuestion(section)}
                                    startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                                    sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px" }}
                                >
                                    Add question
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ p: 1.6 }}>
                            {items.length === 0 ? (
                                <Box sx={{ textAlign: "center", py: 3 }}>
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.faint, mb: 1.4 }}>
                                        No questions in this section yet.
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                        <Button
                                            onClick={() => onPickFromBank(section)}
                                            startIcon={<InventoryOutlinedIcon sx={{ fontSize: 15 }} />}
                                            sx={outlineBtnSx}
                                        >
                                            Pick from the bank
                                        </Button>
                                        <Button
                                            onClick={() => onAddQuestion(section)}
                                            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                                            sx={primaryBtnSx}
                                        >
                                            Write one
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                items.map((question, index) => {
                                    running += 1;
                                    return (
                                        <QuestionCard
                                            key={question.id}
                                            question={question}
                                            number={running}
                                            index={index}
                                            total={items.length}
                                            sections={sections}
                                            chapters={chapters}
                                            duplicate={duplicates.map?.[question.id]}
                                            editing={editingId === question.id}
                                            onEdit={setEditingId}
                                            onChange={onChangeQuestion}
                                            onRemove={onRemoveQuestion}
                                            onMove={onMoveQuestion}
                                            onMoveToSection={onMoveToSection}
                                            onRegenerate={onRegenerateOne}
                                            onSwapFromBank={onSwapFromBank}
                                        />
                                    );
                                })
                            )}
                        </Box>
                    </Box>
                    </React.Fragment>
                );
            })}
        </>
    );
}

