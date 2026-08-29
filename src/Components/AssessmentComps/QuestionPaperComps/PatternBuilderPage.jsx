import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, Tooltip,
    Select, OutlinedInput, Checkbox, ListItemText, Divider, Autocomplete,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS, Panel } from "../../DashBoardComps/dashboardTheme";
import { useGradeSubjects } from "../../AcademicsComps/academicMeta";
import {
    CHOICE_MODES, MARK_DISPLAYS, MOCK_PATTERNS, QUESTION_TYPES, DIFFICULTY_LEVELS,
    emptyPattern, newSection, patternTotal, sectionEquation, sectionHeading, sectionInstruction,
    sectionMarks, sectionMarksLabel, typeMeta, withSectionDefaults,
} from "./questionPaperApi";
import { Pill, fieldSx, outlineBtnSx, primaryBtnSx, Banner } from "./questionPaperTheme";

const clampNumber = (raw, min, max, decimal = false) => {
    const cleaned = decimal
        ? String(raw).replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
        : String(raw).replace(/[^0-9]/g, "");
    if (cleaned === "" || cleaned === ".") return min;
    const parsed = Number(cleaned);
    if (Number.isNaN(parsed)) return min;
    return Math.min(max, Math.max(min, parsed));
};

const NumberField = ({ label, value, onChange, min = 0, max = 999, helper, error, decimal = false, sx }) => (
    <TextField
        fullWidth size="small" label={label}
        value={value}
        onChange={(e) => onChange(clampNumber(e.target.value, min, max, decimal))}
        error={Boolean(error)}
        helperText={error || helper || " "}
        sx={{ ...fieldSx, ...sx }}
    />
);

const SectionCard = ({ section, index, total, onChange, onRemove, onMove, onDuplicate }) => {
    const meta = typeMeta(section.type);
    const marks = sectionMarks(section);
    const answerOverPrint = section.questionsToAnswer > section.questionsToPrint;
    const mix = section.difficulty || { easy: 0, medium: 0, hard: 0 };
    const mixTotal = (mix.easy || 0) + (mix.medium || 0) + (mix.hard || 0);

    const set = (key, value) => onChange({ ...section, [key]: value });

    const setType = (type) => {
        const next = typeMeta(type);
        onChange({
            ...section,
            type,
            marksPerQuestion: next.defaultMarks,
            optionCount: type === "truefalse" ? 2 : next.hasOptions ? (section.optionCount || 4) : 0,
        });
    };

    const setMix = (key, value) => {
        const capped = clampNumber(value, 0, 100);
        onChange({ ...section, difficulty: { ...mix, [key]: capped } });
    };

    return (
        <Box
            sx={{
                border: `1px solid ${DASH.line}`,
                borderLeft: `3px solid ${meta.color}`,
                borderRadius: RADIUS,
                bgcolor: "#fff",
                mb: 1.6,
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap",
                    px: 1.8, py: 1.2, bgcolor: meta.bg, borderBottom: `1px solid ${DASH.lineSoft}`,
                }}
            >
                <Box
                    sx={{
                        width: 26, height: 26, borderRadius: RADIUS, bgcolor: "#fff",
                        border: `1px solid ${meta.color}44`, display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                >
                    <Typography sx={{ fontSize: "11px", fontWeight: 800, color: meta.color }}>
                        {String.fromCharCode(65 + index)}
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 120 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink }}>
                        {sectionHeading(section) || meta.label}
                        {section.title ? ` - ${section.title}` : ""}
                    </Typography>
                    {section.groupName && (
                        <Typography
                            sx={{
                                fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.06em",
                                color: meta.color, textTransform: "uppercase", mt: 0.2,
                            }}
                        >
                            {section.groupName}
                        </Typography>
                    )}
                </Box>

                <Pill
                    label={sectionMarksLabel(section) || `${marks} marks`}
                    color={meta.color}
                    bg="#fff"
                    border={`${meta.color}44`}
                />

                <Box sx={{ display: "flex", gap: 0.2, flexShrink: 0 }}>
                    <Tooltip title="Move up" arrow>
                        <span>
                            <IconButton size="small" disabled={index === 0} onClick={() => onMove(index, -1)} sx={{ width: 26, height: 26 }}>
                                <ArrowUpwardIcon sx={{ fontSize: 14, color: DASH.muted }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Move down" arrow>
                        <span>
                            <IconButton size="small" disabled={index === total - 1} onClick={() => onMove(index, 1)} sx={{ width: 26, height: 26 }}>
                                <ArrowDownwardIcon sx={{ fontSize: 14, color: DASH.muted }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Duplicate section" arrow>
                        <IconButton size="small" onClick={() => onDuplicate(index)} sx={{ width: 26, height: 26 }}>
                            <ContentCopyOutlinedIcon sx={{ fontSize: 13, color: DASH.muted }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove section" arrow>
                        <span>
                            <IconButton size="small" disabled={total === 1} onClick={() => onRemove(index)} sx={{ width: 26, height: 26 }}>
                                <DeleteOutlineIcon sx={{ fontSize: 15, color: DASH.red }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ p: 1.8 }}>
                <Grid container spacing={1.4}>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <TextField
                            fullWidth size="small" label="Group / Part heading"
                            placeholder="SECTION A  or  GEOGRAPHY"
                            value={section.groupName}
                            onChange={(e) => set("groupName", e.target.value)}
                            helperText="Sections sharing this print under one heading"
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 2, lg: 2 }}>
                        <TextField
                            fullWidth size="small" label="Question label"
                            placeholder="Q.1"
                            value={section.label}
                            onChange={(e) => set("label", e.target.value)}
                            helperText=" "
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3, md: 1, lg: 1 }}>
                        <TextField
                            fullWidth size="small" label="Sub"
                            placeholder="(A)"
                            value={section.subLabel}
                            onChange={(e) => set("subLabel", e.target.value)}
                            helperText=" "
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <TextField
                            fullWidth size="small" label="Section title (printed)"
                            placeholder="Choose the best answer"
                            value={section.title}
                            onChange={(e) => set("title", e.target.value)}
                            helperText=" "
                            sx={fieldSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <TextField
                            select fullWidth size="small" label="Question type"
                            value={section.type}
                            onChange={(e) => setType(e.target.value)}
                            helperText=" "
                            sx={fieldSx}
                        >
                            {QUESTION_TYPES.map((t) => (
                                <MenuItem key={t.key} value={t.key} sx={{ fontSize: "13px" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: t.color }} />
                                        {t.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <TextField
                            select fullWidth size="small" label="Choice"
                            value={section.choiceMode}
                            onChange={(e) => {
                                const mode = e.target.value;
                                onChange({
                                    ...section,
                                    choiceMode: mode,
                                    questionsToAnswer: mode === "any" ? section.questionsToAnswer : section.questionsToPrint,
                                });
                            }}
                            helperText={CHOICE_MODES.find((c) => c.key === section.choiceMode)?.hint || " "}
                            sx={fieldSx}
                        >
                            {CHOICE_MODES.map((c) => (
                                <MenuItem key={c.key} value={c.key} sx={{ fontSize: "13px" }}>{c.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                        <NumberField
                            label="Marks / question"
                            value={section.marksPerQuestion}
                            onChange={(v) => set("marksPerQuestion", v)}
                            min={0.5} max={50}
                            decimal
                            helper="Half marks allowed"
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                        <NumberField
                            label="Questions printed"
                            value={section.questionsToPrint}
                            onChange={(v) => onChange({
                                ...section,
                                questionsToPrint: v,
                                questionsToAnswer: section.choiceMode === "any"
                                    ? Math.min(section.questionsToAnswer, v)
                                    : v,
                            })}
                            min={1} max={99}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                        <NumberField
                            label="To be answered"
                            value={section.questionsToAnswer}
                            onChange={(v) => set("questionsToAnswer", v)}
                            min={1} max={99}
                            error={answerOverPrint ? "More than printed" : ""}
                        />
                    </Grid>
                    {meta.hasOptions && (
                        <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                            <NumberField
                                label="Options"
                                value={section.optionCount}
                                onChange={(v) => set("optionCount", v)}
                                min={2} max={6}
                            />
                        </Grid>
                    )}
                    {section.choiceMode === "internal" && (
                        <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                            <NumberField
                                label="With OR choice"
                                value={section.internalChoiceCount}
                                onChange={(v) => set("internalChoiceCount", v)}
                                min={0} max={section.questionsToPrint}
                                helper="Questions carrying (a) / (b)"
                            />
                        </Grid>
                    )}

                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                        <TextField
                            select fullWidth size="small" label="Marks shown as"
                            value={section.marksDisplay}
                            onChange={(e) => set("marksDisplay", e.target.value)}
                            helperText={MARK_DISPLAYS.find((m) => m.key === section.marksDisplay)?.hint || " "}
                            sx={fieldSx}
                        >
                            {MARK_DISPLAYS.map((m) => (
                                <MenuItem key={m.key} value={m.key} sx={{ fontSize: "13px" }}>{m.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                        <NumberField
                            label="Ruled answer lines"
                            value={section.answerLines}
                            onChange={(v) => set("answerLines", v)}
                            min={0} max={20}
                            helper="0 = no writing lines"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                        <TextField
                            fullWidth size="small" label="Extra instruction (optional)"
                            placeholder={sectionInstruction(section)}
                            value={section.instruction}
                            onChange={(e) => set("instruction", e.target.value)}
                            helperText=" "
                            sx={fieldSx}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 1.2, borderColor: DASH.lineSoft }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Difficulty mix
                    </Typography>
                    {DIFFICULTY_LEVELS.map((level) => (
                        <Box key={level.key} sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: level.color }} />
                            <TextField
                                size="small"
                                value={mix[level.key] ?? 0}
                                onChange={(e) => setMix(level.key, e.target.value)}
                                sx={{ ...fieldSx, width: 74, "& input": { py: 0.5, fontSize: "12.5px", textAlign: "center" } }}
                            />
                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>{level.label}</Typography>
                        </Box>
                    ))}
                    <Typography
                        sx={{
                            fontSize: "11.5px", fontWeight: 700,
                            color: mixTotal === 100 ? DASH.green : DASH.red, ml: "auto",
                        }}
                    >
                        {mixTotal}%
                    </Typography>
                </Box>

                <Box
                    sx={{
                        mt: 1.4, px: 1.4, py: 1, borderRadius: RADIUS,
                        bgcolor: DASH.lineSoft, display: "flex",
                        alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap",
                    }}
                >
                    <Typography sx={{ fontSize: "11.5px", color: DASH.muted, fontStyle: "italic" }}>
                        Prints as: {sectionInstruction(section)}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 800, color: DASH.ink }}>
                        ({sectionEquation(section)}) = {marks} marks
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default function PatternBuilderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { patternId } = useParams();
    const { grades, examsForGrades } = useGradeSubjects();

    const incoming = location.state?.pattern;
    // Patterns saved before a field existed still open cleanly.
    const hydrate = (source) => ({
        ...emptyPattern(),
        ...source,
        sections: (source?.sections || []).map(withSectionDefaults),
    });
    const [pattern, setPattern] = useState(() => (incoming ? hydrate(incoming) : emptyPattern()));
    const [errors, setErrors] = useState({});

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    /* Mock read for a direct link. Replace with GET qpaper/patterns/:id. */
    useEffect(() => {
        if (incoming || !patternId || patternId === "create") return;
        const found = MOCK_PATTERNS.find((p) => String(p.id) === String(patternId));
        if (found) setPattern(hydrate(found));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [incoming, patternId]);

    const sectionsTotal = patternTotal(pattern);
    const balanced = sectionsTotal === Number(pattern.totalMarks);
    const isEdit = Boolean(pattern.id);

    // Exams the selected classes actually have, from fetchAllSubjects. An exam
    // that only some of them offer is still selectable, just flagged.
    const examOptions = useMemo(
        () => examsForGrades(pattern.gradeIds || []),
        [examsForGrades, pattern.gradeIds]
    );
    const examHelper = (() => {
        if (!pattern.gradeIds?.length) return "Pick the classes first";
        if (!examOptions.length) return "No exams mapped to these classes yet - type one";
        const picked = examOptions.find((e) => e.exam === pattern.exam);
        if (picked?.missingIn?.length) {
            const names = picked.missingIn
                .map((id) => grades.find((g) => String(g.id) === String(id))?.sign || id)
                .join(", ");
            return `Not mapped to ${names}`;
        }
        return " ";
    })();

    const questionsPrinted = useMemo(
        () => pattern.sections.reduce((sum, s) => sum + (Number(s.questionsToPrint) || 0), 0),
        [pattern.sections]
    );

    // What the totals bar says, in words rather than a raw sum.
    const marksGap = Math.round((Number(pattern.totalMarks) - sectionsTotal) * 100) / 100;
    const totalsMessage = balanced
        ? "Balanced - ready to save"
        : marksGap > 0
            ? `${marksGap} mark${marksGap === 1 ? "" : "s"} short of the total`
            : `${Math.abs(marksGap)} mark${Math.abs(marksGap) === 1 ? "" : "s"} over the total`;
    const totalsTone = balanced
        ? { color: DASH.green, bg: DASH.greenLight, border: "#BBF7D0" }
        : { color: DASH.red, bg: DASH.redLight, border: "#FECACA" };
    const progressPercent = Math.min(100, (sectionsTotal / Math.max(1, Number(pattern.totalMarks))) * 100);

    const setField = (key, value) => {
        setPattern((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const updateSection = (index, next) =>
        setPattern((prev) => ({
            ...prev,
            sections: prev.sections.map((s, i) => (i === index ? next : s)),
        }));

    const addSection = () =>
        setPattern((prev) => ({ ...prev, sections: [...prev.sections, newSection(prev.sections.length)] }));

    const duplicateSection = (index) =>
        setPattern((prev) => {
            const copy = { ...prev.sections[index], id: `sec-${Date.now()}`, label: `PART - ${String.fromCharCode(65 + prev.sections.length)}` };
            const next = [...prev.sections];
            next.splice(index + 1, 0, copy);
            return { ...prev, sections: next };
        });

    const removeSection = (index) =>
        setPattern((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));

    const moveSection = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= pattern.sections.length) return;
        setPattern((prev) => {
            const next = [...prev.sections];
            [next[index], next[target]] = [next[target], next[index]];
            return { ...prev, sections: next };
        });
    };

    const validate = () => {
        const next = {};
        if (!pattern.name.trim()) next.name = "Give the pattern a name";
        if (!pattern.exam.trim()) next.exam = "Pick or type the exam";
        if (!pattern.totalMarks) next.totalMarks = "Set the total marks";
        if (!pattern.durationMinutes) next.durationMinutes = "Set the duration";
        setErrors(next);

        if (Object.keys(next).length) {
            notify("Fill the highlighted fields");
            return false;
        }
        if (!balanced) {
            notify(`Sections add up to ${sectionsTotal}, but the paper is ${pattern.totalMarks} marks`);
            return false;
        }
        const badSection = pattern.sections.find((s) => s.questionsToAnswer > s.questionsToPrint);
        if (badSection) {
            notify(`${badSection.label} asks for more answers than it prints`);
            return false;
        }
        return true;
    };

    /* Replace with POST / PUT qpaper/patterns. */
    const savePattern = () => {
        if (!validate()) return;
        notify(isEdit ? "Pattern updated" : "Pattern created", true);
        setTimeout(() => navigate("/dashboardmenu/assessment/question-paper/patterns"), 700);
    };

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 12, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 2 }}>
                <IconButton onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns")} sx={{ mt: -0.5 }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                </IconButton>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                        {isEdit ? "Edit Pattern" : "Create Pattern"}
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                        Name the pattern, then add one section per part of the paper. The totals bar keeps the marks honest.
                    </Typography>
                </Box>
            </Box>

            <Panel title="Pattern Details" subtitle="Applies to every paper built from it" accent={DASH.violet} sx={{ mb: 1.8 }}>
                <Grid container spacing={1.6}>
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                        <TextField
                            fullWidth size="small" label="Pattern name"
                            placeholder="e.g. Term 1 - Half Yearly"
                            value={pattern.name}
                            onChange={(e) => setField("name", e.target.value)}
                            error={Boolean(errors.name)} helperText={errors.name || " "}
                            sx={fieldSx}
                        />
                    </Grid>
                    {/* Classes come first - the exam list below is built from them. */}
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <Typography sx={{ fontSize: "11px", color: DASH.muted, mb: 0.4 }}>Applies to classes</Typography>
                        <Select
                            multiple
                            size="small"
                            fullWidth
                            displayEmpty
                            value={pattern.gradeIds}
                            onChange={(e) => setField("gradeIds", e.target.value)}
                            input={<OutlinedInput />}
                            renderValue={(selected) => (
                                selected.length === 0
                                    ? "Any class"
                                    : selected
                                        .map((id) => grades.find((g) => String(g.id) === String(id))?.sign || id)
                                        .join(", ")
                            )}
                            sx={{ ...fieldSx, fontSize: "13px" }}
                        >
                            {grades.map((g) => (
                                <MenuItem key={g.id} value={String(g.id)} sx={{ fontSize: "13px", py: 0.4 }}>
                                    <Checkbox
                                        size="small"
                                        checked={pattern.gradeIds.map(String).includes(String(g.id))}
                                        sx={{ p: 0.5, "&.Mui-checked": { color: DASH.primary } }}
                                    />
                                    <ListItemText primary={g.sign} slotProps={{ primary: { fontSize: "13px" } }} />
                                </MenuItem>
                            ))}
                        </Select>
                        <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.5 }}>
                            Sections are chosen on the paper, not here.
                        </Typography>
                    </Grid>

                    {/* Real exams mapped to those classes, not a made-up category. */}
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <Autocomplete
                            freeSolo
                            size="small"
                            options={examOptions.map((e) => e.exam)}
                            value={pattern.exam}
                            onChange={(e, value) => setField("exam", value || "")}
                            onInputChange={(e, value) => setField("exam", value)}
                            disabled={pattern.gradeIds.length === 0}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Exam"
                                    placeholder="Half Yearly Examination"
                                    error={Boolean(errors.exam)}
                                    helperText={errors.exam || examHelper}
                                    sx={fieldSx}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                        <NumberField
                            label="Total marks"
                            value={pattern.totalMarks}
                            onChange={(v) => setField("totalMarks", v)}
                            min={1} max={500}
                            error={errors.totalMarks}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                        <NumberField
                            label="Duration (min)"
                            value={pattern.durationMinutes}
                            onChange={(v) => setField("durationMinutes", v)}
                            min={10} max={360}
                            error={errors.durationMinutes}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                        <NumberField
                            label="Reading time (min)"
                            value={pattern.readingTimeMinutes || 0}
                            onChange={(v) => setField("readingTimeMinutes", v)}
                            min={0} max={30}
                            helper="0 = not printed"
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                        <TextField
                            select fullWidth size="small" label="Q.P. Code"
                            value={pattern.showPaperCode ? "Y" : "N"}
                            onChange={(e) => setField("showPaperCode", e.target.value === "Y")}
                            helperText="Prints the code box on the paper"
                            sx={fieldSx}
                        >
                            <MenuItem value="N" sx={{ fontSize: "13px" }}>Not printed</MenuItem>
                            <MenuItem value="Y" sx={{ fontSize: "13px" }}>Printed on the paper</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                        <TextField
                            fullWidth multiline minRows={2} size="small"
                            label="General instructions (one per line)"
                            value={pattern.instructions}
                            onChange={(e) => setField("instructions", e.target.value)}
                            helperText="Printed under the paper header, numbered automatically."
                            sx={fieldSx}
                        />
                    </Grid>
                </Grid>
            </Panel>

            {!balanced && (
                <Banner tone="error" icon={ErrorOutlineIcon} title="Marks do not add up">
                    The sections currently total <strong>{sectionsTotal}</strong> marks, but the paper is set to{" "}
                    <strong>{pattern.totalMarks}</strong>. Adjust a section, or change the total.
                </Banner>
            )}

            <Panel
                title={`Sections (${pattern.sections.length})`}
                subtitle="One card per part of the printed paper"
                accent={DASH.primary}
                right={
                    <Button onClick={addSection} startIcon={<AddIcon sx={{ fontSize: 15 }} />} sx={outlineBtnSx}>
                        Add Section
                    </Button>
                }
                bodySx={{ p: 1.6 }}
            >
                {pattern.sections.map((section, index) => (
                    <SectionCard
                        key={section.id}
                        section={section}
                        index={index}
                        total={pattern.sections.length}
                        onChange={(next) => updateSection(index, next)}
                        onRemove={removeSection}
                        onMove={moveSection}
                        onDuplicate={duplicateSection}
                    />
                ))}
            </Panel>

            {/* Totals bar. Sticks to the bottom of the viewport so the running
                total stays visible while sections are being edited. */}
            <Box
                sx={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 5,
                    mt: 3,
                    mx: { xs: -1.5, md: -2 },
                    px: { xs: 1.5, md: 2 },
                    pb: 1.5,
                    pt: 1,
                    background: `linear-gradient(180deg, ${DASH.canvas}00 0%, ${DASH.canvas} 45%)`,
                }}
            >
                <Box
                    sx={{
                        bgcolor: "#fff",
                        border: `1px solid ${DASH.line}`,
                        borderRadius: "10px",
                        boxShadow: "0 6px 24px rgba(17,24,39,0.12)",
                        overflow: "hidden",
                    }}
                >
                    {/* Progress reads as the top edge of the bar, not a strip under it */}
                    <Box sx={{ height: 3, bgcolor: DASH.lineSoft }}>
                        <Box
                            sx={{
                                height: "100%",
                                width: `${progressPercent}%`,
                                bgcolor: totalsTone.color,
                                transition: "width .35s ease, background-color .25s ease",
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 1.5, md: 2 },
                            px: { xs: 1.6, md: 2 },
                            py: 1.4,
                            flexWrap: { xs: "wrap", md: "nowrap" },
                        }}
                    >
                        {/* Where the marks stand */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.3, flexShrink: 0 }}>
                            <Box
                                sx={{
                                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                                    bgcolor: totalsTone.bg, border: `1px solid ${totalsTone.border}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                            >
                                {balanced
                                    ? <CheckCircleIcon sx={{ fontSize: 19, color: totalsTone.color }} />
                                    : <ErrorOutlineIcon sx={{ fontSize: 19, color: totalsTone.color }} />}
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
                                    <Typography sx={{ fontSize: "19px", fontWeight: 800, color: totalsTone.color, lineHeight: 1 }}>
                                        {sectionsTotal}
                                    </Typography>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.muted, lineHeight: 1 }}>
                                        / {pattern.totalMarks} marks
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: totalsTone.color, mt: 0.5 }}>
                                    {totalsMessage}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ display: { xs: "none", md: "block" }, borderColor: DASH.lineSoft, my: 0.4 }}
                        />

                        {/* One chip per section, so the sum is readable at a glance */}
                        <Box
                            sx={{
                                display: { xs: "none", md: "flex" },
                                alignItems: "center",
                                gap: 0.7,
                                flex: 1,
                                minWidth: 0,
                                overflowX: "auto",
                                scrollbarWidth: "none",
                                "&::-webkit-scrollbar": { display: "none" },
                            }}
                        >
                            {pattern.sections.map((s, i) => {
                                const meta = typeMeta(s.type);
                                const label = (sectionHeading(s) || s.groupName || `S${i + 1}`)
                                    .replace("PART - ", "")
                                    .replace("SECTION ", "");
                                return (
                                    <Box
                                        key={s.id}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0,
                                            border: `1px solid ${DASH.line}`, borderRadius: "20px",
                                            pl: 0.8, pr: 1, py: 0.35, bgcolor: "#fff",
                                        }}
                                    >
                                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: meta.color, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, whiteSpace: "nowrap" }}>
                                            {label}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", fontWeight: 800, color: DASH.ink }}>
                                            {sectionMarks(s)}
                                        </Typography>
                                    </Box>
                                );
                            })}

                            <Typography sx={{ fontSize: "11.5px", color: DASH.faint, whiteSpace: "nowrap", ml: 0.6, flexShrink: 0 }}>
                                {questionsPrinted} questions printed
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, flexShrink: 0, ml: { xs: "auto", md: 0 } }}>
                            <Button onClick={() => navigate(-1)} sx={outlineBtnSx}>Cancel</Button>
                            <Button
                                onClick={savePattern}
                                startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                                sx={primaryBtnSx}
                            >
                                {isEdit ? "Update Pattern" : "Save Pattern"}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
