import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, Tooltip,
    Select, OutlinedInput, Checkbox, ListItemText, Divider,
    FormControl, InputLabel, FormHelperText,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

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
import { useGradeSubjects, gradeSign } from "../../AcademicsComps/academicMeta";
import { CreatePattern, UpdatePattern, GetPattern } from "../../../Api/Api";
import { apiFailed } from "../../AcademicsComps/BooksChaptersComps/bookApi";
import {
    CHOICE_MODES, MARK_DISPLAYS, patternToApi, patternFromApi, QUESTION_TYPES, DIFFICULTY_LEVELS,
    PRINT_LANGUAGES, suggestedPrompt, effectiveTypeKey,
    emptyPattern, newSection, patternTotal, sectionEquation, sectionHeading, sectionInstruction,
    sectionMarks, sectionMarksLabel, typeMeta, withSectionDefaults,
} from "./questionPaperApi";
import { Pill, fieldSx, outlineBtnSx, primaryBtnSx, Banner } from "./questionPaperTheme";

// Strips anything that is not part of a number, without deciding a value.
const digitsOnly = (raw, decimal = false) => (decimal
    ? String(raw).replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
    : String(raw).replace(/[^0-9]/g, ""));

const clampNumber = (raw, min, max, decimal = false) => {
    const cleaned = digitsOnly(raw, decimal);
    if (cleaned === "" || cleaned === ".") return min;
    const parsed = Number(cleaned);
    if (Number.isNaN(parsed)) return min;
    return Math.min(max, Math.max(min, parsed));
};

const isBlank = (value) => value === "" || value === null || value === undefined;

/* Clearing the field used to snap it straight back to the minimum, so replacing
   5 with 6 left 16 behind. The field now holds whatever was typed - including
   nothing - and only clamps to the range when it loses focus. An empty required
   field says so instead of quietly inventing a number. */
const NumberField = ({
    label, value, onChange, min = 0, max = 999, helper, error,
    decimal = false, required = true, disabled = false, sx,
}) => {
    const text = isBlank(value) ? "" : String(value);
    const missing = required && text.trim() === "";
    return (
        <TextField
            fullWidth size="small" label={label}
            value={text}
            disabled={disabled}
            onChange={(e) => onChange(digitsOnly(e.target.value, decimal))}
            onBlur={() => { if (text.trim() !== "") onChange(clampNumber(text, min, max, decimal)); }}
            error={Boolean(error) || missing}
            helperText={error || (missing ? "Required" : helper || " ")}
            sx={{ ...fieldSx, ...sx }}
        />
    );
};

const SectionCard = ({ section, index, total, onChange, onRemove, onMove, onDuplicate }) => {
    const meta = typeMeta(effectiveTypeKey(section));
    const marks = sectionMarks(section);
    // The counts are text while they are being typed, so compare as numbers.
    const printCount = Number(section.questionsToPrint) || 0;
    const answerCount = Number(section.questionsToAnswer) || 0;
    const answerOverPrint = answerCount > printCount;
    // True or False has exactly two options; nothing else is a valid paper.
    const optionsLocked = section.type === "truefalse";
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
                    {/* Hidden for now, at the FE request - the value it was bound to
                        is untouched, so restoring the block brings the field back. */}
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
                    {section.type === "custom" && (
                        <>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <TextField
                                    fullWidth size="small" label="Type name"
                                    placeholder="Mind Map"
                                    value={section.customLabel || ""}
                                    onChange={(e) => set("customLabel", e.target.value)}
                                    helperText="Printed and stored as this"
                                    sx={fieldSx}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <TextField
                                    select fullWidth size="small" label="Behaves like"
                                    value={section.baseType || "long"}
                                    onChange={(e) => set("baseType", e.target.value)}
                                    helperText="Decides options and answer space"
                                    sx={fieldSx}
                                >
                                    {QUESTION_TYPES.filter((t) => !t.isCustom).map((t) => (
                                        <MenuItem key={t.key} value={t.key} sx={{ fontSize: "13px" }}>{t.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </>
                    )}
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
                                    ? String(Math.min(answerCount, Number(v) || 0))
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
                                value={optionsLocked ? 2 : section.optionCount}
                                onChange={(v) => set("optionCount", v)}
                                min={2} max={6}
                                disabled={optionsLocked}
                                helper={optionsLocked ? "True and False only" : "Between 2 and 6"}
                            />
                        </Grid>
                    )}
                    {section.choiceMode === "internal" && (
                        <Grid size={{ xs: 6, sm: 4, md: 2, lg: 2 }}>
                            <NumberField
                                label="With OR choice"
                                value={section.internalChoiceCount}
                                onChange={(v) => set("internalChoiceCount", v)}
                                min={0} max={printCount || 99}
                                required={false}
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

                    {/* Hidden for now, at the FE request - the value it was bound to
                        is untouched, so restoring the block brings the field back. */}

                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                        <TextField
                            fullWidth size="small" label="Section direction (printed)"
                            placeholder={sectionInstruction(section)}
                            value={section.instruction}
                            onChange={(e) => set("instruction", e.target.value)}
                            helperText="Prints under the part heading, above the questions. Suggestions cover English, Tamil and Hindi - any other language can be typed in."
                            sx={fieldSx}
                        />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.6, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "11px", color: DASH.faint }}>Suggest:</Typography>
                            {PRINT_LANGUAGES.map((lang) => (
                                <Button
                                    key={lang.key}
                                    onClick={() => set("instruction", suggestedPrompt(section, lang.key))}
                                    sx={{ ...outlineBtnSx, py: 0.15, px: 1.1, fontSize: "11px", minWidth: 0 }}
                                >
                                    {lang.label}
                                </Button>
                            ))}
                            {section.instruction ? (
                                <Button
                                    onClick={() => set("instruction", "")}
                                    sx={{ ...outlineBtnSx, py: 0.15, px: 1.1, fontSize: "11px", minWidth: 0, color: DASH.muted }}
                                >
                                    Clear
                                </Button>
                            ) : null}
                        </Box>
                    </Grid>
                </Grid>

                {/* Difficulty mix hidden for now, at the FE request. The mix is still
                    carried on the section, so nothing downstream changes. */}
                {false && (
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
                )}

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

const token = "123";

export default function PatternBuilderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { patternId } = useParams();
    const { grades, subjectsForGrades } = useGradeSubjects();
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;

    const incoming = location.state?.pattern;
    // Patterns saved before a field existed still open cleanly.
    const hydrate = (source) => ({
        ...emptyPattern(),
        ...source,
        sections: (source?.sections || []).map(withSectionDefaults),
    });
    const [pattern, setPattern] = useState(() => (incoming ? hydrate(incoming) : emptyPattern()));
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    /* Opened by id - from the list, or a direct link. The row the list carries
       has no sections, so the pattern is always read in full before editing. */
    useEffect(() => {
        if (!patternId || patternId === "create") return;
        setLoading(true);
        axios
            .get(GetPattern, {
                params: { patternId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) return;
                const found = patternFromApi(res.data?.data ?? res.data, {
                    gradeIdOf: (sign) => grades.find((g) => String(g.sign) === String(sign))?.id || "",
                });
                if (found) setPattern(hydrate(found));
            })
            .catch((error) => notify(error?.response?.data?.message || "The pattern could not be loaded"))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patternId, rollNumber, grades]);

    const sectionsTotal = patternTotal(pattern);
    const balanced = sectionsTotal === Number(pattern.totalMarks);
    const isEdit = Boolean(pattern.id);

    const subjectOptions = useMemo(
        () => subjectsForGrades(pattern.gradeIds || []),
        [subjectsForGrades, pattern.gradeIds]
    );
    const subjectHelper = (() => {
        if (!pattern.gradeIds?.length) return "Pick the classes first";
        if (!subjectOptions.length) return "No subjects mapped to these classes yet";
        const picked = subjectOptions.find((s) => s.subject === pattern.subject);
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
        if (!String(pattern.subject || "").trim()) next.subject = "Pick the subject";
        if (!pattern.totalMarks) next.totalMarks = "Set the total marks";
        if (!pattern.durationMinutes) next.durationMinutes = "Set the duration";
        setErrors(next);

        if (Object.keys(next).length) {
            notify("Fill the highlighted fields");
            return false;
        }
        /* A number left blank is not a zero - the section is simply unfinished,
           and saving it would print a section that asks for nothing. */
        const blankSection = pattern.sections.find((s) => (
            isBlank(s.marksPerQuestion) || isBlank(s.questionsToPrint) || isBlank(s.questionsToAnswer)
        ));
        if (blankSection) {
            notify(`${sectionHeading(blankSection) || blankSection.label} has an empty required field`);
            return false;
        }
        if (!balanced) {
            notify(`Sections add up to ${sectionsTotal}, but the paper is ${pattern.totalMarks} marks`);
            return false;
        }
        const badSection = pattern.sections.find(
            (s) => (Number(s.questionsToAnswer) || 0) > (Number(s.questionsToPrint) || 0)
        );
        if (badSection) {
            notify(`${badSection.label} asks for more answers than it prints`);
            return false;
        }
        return true;
    };

    /* Replace with POST / PUT qpaper/patterns. */
    const savePattern = () => {
        if (!validate()) return;

        const body = patternToApi(pattern, {
            gradeSignOf: (id) => gradeSign(grades, id),
            rollNumber,
            patternId: isEdit ? pattern.id : null,
        });

        setSaving(true);
        const request = isEdit
            ? axios.put(UpdatePattern, body, { headers: { Authorization: `Bearer ${token}` } })
            : axios.post(CreatePattern, body, { headers: { Authorization: `Bearer ${token}` } });

        request
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify(isEdit ? "Pattern updated" : "Pattern created", true);
                setTimeout(() => navigate("/dashboardmenu/assessment/question-paper/patterns"), 700);
            })
            .catch((error) => notify(error?.response?.data?.message || "The pattern could not be saved"))
            .finally(() => setSaving(false));
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
                    {/* Classes come first - the subject list below is built from them. */}
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        {/* The label sits in the notch like every other field on
                            this row - a caption above the control left it taller
                            than its neighbours and broke the row alignment. */}
                        <FormControl fullWidth size="small" sx={fieldSx}>
                            <InputLabel shrink sx={{ fontSize: "13px" }}>Applies to classes</InputLabel>
                            <Select
                                multiple
                                displayEmpty
                                value={pattern.gradeIds}
                                onChange={(e) => setField("gradeIds", e.target.value)}
                                input={<OutlinedInput notched label="Applies to classes" />}
                                renderValue={(selected) => (
                                    selected.length === 0
                                        ? "Any class"
                                        : selected
                                            .map((id) => grades.find((g) => String(g.id) === String(id))?.sign || id)
                                            .join(", ")
                                )}
                                sx={{ fontSize: "13px" }}
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
                            <FormHelperText sx={{ fontSize: "11px", color: DASH.muted, ml: 0, mt: 0.5 }}>
                                Sections are chosen on the paper, not here.
                            </FormHelperText>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <TextField
                            select fullWidth size="small" label="Subject"
                            value={pattern.subject}
                            onChange={(e) => setField("subject", e.target.value)}
                            disabled={pattern.gradeIds.length === 0}
                            error={Boolean(errors.subject)}
                            helperText={errors.subject || subjectHelper}
                            sx={fieldSx}
                        >
                            {subjectOptions.map((s) => (
                                <MenuItem key={s.subject} value={s.subject} sx={{ fontSize: "13px" }}>
                                    {s.subject}
                                    {s.missingIn.length > 0 ? ` - not in ${s.missingIn.length} of the picked classes` : ""}
                                </MenuItem>
                            ))}
                        </TextField>
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
                    {/* Hidden for now, at the FE request - the value it was bound to
                        is untouched, so restoring the block brings the field back. */}
                    {/* No Q.P. Code control here. Whether the code box prints is
                        decided by the template chosen on the paper, and the code
                        itself is typed per paper - the pattern had no say in
                        either, so the field only looked like a setting. */}
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
                                const meta = typeMeta(effectiveTypeKey(s));
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
                                disabled={saving || loading}
                                startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                                sx={primaryBtnSx}
                            >
                                {saving ? "Saving..." : isEdit ? "Update Pattern" : "Save Pattern"}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
