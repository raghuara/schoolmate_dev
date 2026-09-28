import React, { useMemo, useState } from "react";
import { Box, Grid, Typography, Button, IconButton, TextField, Tooltip, Radio, CircularProgress } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";

import { DASH, RADIUS } from "../../../DashBoardComps/dashboardTheme";
import { sectionHeading, sectionInstruction, sectionMarks, sectionMarksLabel, typeMeta } from "../questionPaperApi";
import { Pill, TypeChip, fieldSx, outlineBtnSx, primaryBtnSx, Banner } from "../questionPaperTheme";

const DUP_TONES = {
    duplicate: { color: DASH.red, bg: DASH.redLight, border: "#FECACA", icon: ErrorOutlineIcon },
    similar: { color: "#B45309", bg: DASH.primaryLight, border: DASH.primaryBorder, icon: WarningAmberOutlinedIcon },
};

const optionLetter = (index) => String.fromCharCode(97 + index);

const QuestionCard = ({
    question, number, duplicate, saving, canRegenerate, busy, onSave, onRegenerate,
}) => {
    const meta = typeMeta(question.type);
    const [draft, setDraft] = useState(null);
    const editing = Boolean(draft);
    const shown = draft || question;
    const tone = duplicate ? DUP_TONES[duplicate.level] : null;
    const DupIcon = tone?.icon;
    const failed = question.status === "Failed";
    const needsText = question.needsAuthoring && !String(question.text || "").trim();

    const startEdit = () => setDraft(JSON.parse(JSON.stringify(question)));
    const cancelEdit = () => setDraft(null);
    const save = () => {
        if (!String(shown.text || "").trim()) return;
        Promise.resolve(onSave(draft)).then((ok) => { if (ok !== false) setDraft(null); });
    };

    const setOption = (optionId, text) =>
        setDraft({ ...draft, options: draft.options.map((o) => (o.id === optionId ? { ...o, text } : o)) });

    const addOption = () =>
        setDraft({ ...draft, options: [...draft.options, { id: optionLetter(draft.options.length), text: "", isCorrect: false }] });

    const removeOption = (optionId) => {
        const options = draft.options.filter((o) => o.id !== optionId).map((o, i) => ({ ...o, id: optionLetter(i) }));
        setDraft({ ...draft, options, answerKey: options.some((o) => o.id === draft.answerKey) ? draft.answerKey : "" });
    };

    const setPair = (index, side, value) =>
        setDraft({ ...draft, pairs: (draft.pairs || []).map((p, i) => (i === index ? { ...p, [side]: value } : p)) });

    const addPair = () => setDraft({ ...draft, pairs: [...(draft.pairs || []), { left: "", right: "" }] });

    const removePair = (index) => setDraft({ ...draft, pairs: (draft.pairs || []).filter((_, i) => i !== index) });

    const edgeColor = failed ? DASH.red : needsText ? DASH.amber : tone ? tone.color : meta.color;

    return (
        <Box
            id={`question-${question.id}`}
            sx={{
                border: `1px solid ${editing ? DASH.primary : tone ? tone.border : DASH.line}`,
                borderLeft: `3px solid ${edgeColor}`,
                bgcolor: editing ? "#FFFDF7" : tone && duplicate.level === "duplicate" ? tone.bg : "#fff",
                borderRadius: RADIUS,
                mb: 1.2,
                overflow: "hidden",
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
                                value={draft.text}
                                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                                placeholder="Type the question"
                                sx={fieldSx}
                            />
                        ) : (
                            <Typography sx={{ fontSize: "13px", color: DASH.ink, lineHeight: 1.6 }}>
                                {question.text || (
                                    <span style={{ color: DASH.faint, fontStyle: "italic" }}>
                                        {question.needsAuthoring ? "Write this question by hand - the AI cannot draw a picture or a map." : "Empty question"}
                                    </span>
                                )}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0 }}>
                        <Pill label={`${shown.marks} mark${Number(shown.marks) > 1 ? "s" : ""}`} color={DASH.ink} bg={DASH.lineSoft} />
                        {!editing && (
                            <Box className="qActions" sx={{ display: "flex", gap: 0.1, opacity: { xs: 1, md: 0 }, transition: "opacity .2s ease" }}>
                                <Tooltip title="Edit" arrow>
                                    <span>
                                        <IconButton size="small" disabled={busy || saving} onClick={startEdit} sx={{ width: 26, height: 26 }}>
                                            <EditOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                {canRegenerate && !question.needsAuthoring && (
                                    <Tooltip title="Rewrite this question with AI" arrow>
                                        <span>
                                            <IconButton size="small" disabled={busy || saving} onClick={() => onRegenerate(question)} sx={{ width: 26, height: 26 }}>
                                                <AutorenewIcon sx={{ fontSize: 15, color: DASH.violet }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>

                {meta.hasPairs && (
                    <Box sx={{ mt: 1.2, pl: 4 }}>
                        {(shown.pairs || []).map((pair, i) => (
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

                {meta.hasOptions && (
                    <Box sx={{ mt: 1.2, pl: 4 }}>
                        <Grid container spacing={1}>
                            {(shown.options || []).map((option) => {
                                const isAnswer = shown.answerKey === option.id;
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
                                                disabled={!editing}
                                                onChange={() => setDraft({ ...draft, answerKey: option.id })}
                                                sx={{ p: 0.3, "&.Mui-checked": { color: DASH.green } }}
                                            />
                                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.muted, flexShrink: 0 }}>
                                                {option.id})
                                            </Typography>
                                            {editing ? (
                                                <TextField
                                                    fullWidth size="small" variant="standard"
                                                    value={option.text}
                                                    placeholder="Option text"
                                                    onChange={(e) => setOption(option.id, e.target.value)}
                                                    slotProps={{ input: { disableUnderline: true, sx: { fontSize: "12.5px" } } }}
                                                />
                                            ) : (
                                                <Typography sx={{ fontSize: "12.5px", color: DASH.text, flex: 1, minWidth: 0 }}>
                                                    {option.text || <span style={{ color: DASH.faint }}>-</span>}
                                                </Typography>
                                            )}
                                            {editing && shown.options.length > 2 && (
                                                <IconButton size="small" onClick={() => removeOption(option.id)} sx={{ width: 22, height: 22 }}>
                                                    <DeleteOutlineIcon sx={{ fontSize: 13, color: DASH.red }} />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                        {editing && shown.options.length < 6 && (
                            <Button onClick={addOption} startIcon={<AddIcon sx={{ fontSize: 14 }} />} sx={{ ...outlineBtnSx, mt: 1, py: 0.2, fontSize: "11.5px" }}>
                                Add option
                            </Button>
                        )}
                        {!editing && !shown.answerKey && (
                            <Typography sx={{ fontSize: "11px", color: DASH.amber, fontWeight: 600, mt: 0.8 }}>
                                No correct option marked yet
                            </Typography>
                        )}
                    </Box>
                )}

                {!meta.hasOptions && !meta.hasPairs && (
                    <Box sx={{ mt: 1.2, pl: 4 }}>
                        {editing ? (
                            <TextField
                                fullWidth size="small" multiline label="Model answer"
                                value={draft.answerKey || ""}
                                onChange={(e) => setDraft({ ...draft, answerKey: e.target.value })}
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 1.4, pl: 4 }}>
                        <TextField
                            size="small" label="Marks"
                            value={draft.marks}
                            onChange={(e) => setDraft({ ...draft, marks: e.target.value.replace(/[^0-9.]/g, "") })}
                            sx={{ ...fieldSx, width: 90 }}
                        />
                        <Box sx={{ flex: 1 }} />
                        <Button onClick={cancelEdit} disabled={saving} startIcon={<CloseIcon sx={{ fontSize: 15 }} />} sx={outlineBtnSx}>
                            Cancel
                        </Button>
                        <Button
                            onClick={save}
                            disabled={saving || !String(draft.text || "").trim()}
                            startIcon={saving ? <CircularProgress size={13} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={primaryBtnSx}
                        >
                            {saving ? "Saving..." : "Save question"}
                        </Button>
                    </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap", mt: 1.2, pl: 4 }}>
                    <TypeChip type={question.type} />
                    {failed && <Pill label="Failed - rewrite or edit" color={DASH.red} bg={DASH.redLight} border="#FECACA" />}
                    {question.needsAuthoring && <Pill label="Write by hand" color="#B45309" bg={DASH.amberLight} border="#FDE68A" />}
                    {question.regeneratedOn && <Pill label="Rewritten by AI" color={DASH.violet} bg={DASH.violetLight} border="#DDD6FE" />}
                    {saving && <Pill label="Saving" color={DASH.muted} bg={DASH.lineSoft} />}
                </Box>

                {failed && question.failureReason && (
                    <Typography sx={{ fontSize: "11.5px", color: DASH.red, mt: 0.8, pl: 4 }}>
                        {question.failureReason}
                    </Typography>
                )}

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
                            {duplicate.level === "duplicate"
                                ? "Same as another question in this paper - rewrite or edit it."
                                : `Very close to question ${duplicate.matchIndex + 1} (${Math.round(duplicate.score * 100)}% match).`}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default function QuestionsStep({
    pattern,
    questions,
    duplicates,
    savingIds = [],
    onSaveQuestion,
    onRegenerateOne,
    canRegenerate = false,
    busy = false,
}) {
    const sections = useMemo(() => pattern?.sections || [], [pattern]);

    const grouped = useMemo(
        () => sections.map((section) => ({ section, items: questions.filter((q) => q.sectionId === section.id) })),
        [sections, questions]
    );

    const answered = useMemo(() => sections.reduce((sum, s) => sum + sectionMarks(s), 0), [sections]);
    const failedCount = questions.filter((q) => q.status === "Failed").length;
    const manualCount = questions.filter((q) => q.needsAuthoring && !String(q.text || "").trim()).length;

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
                    right={firstFlagged && (
                        <Button onClick={() => jumpTo(firstFlagged)} sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px", flexShrink: 0 }}>
                            Jump to it
                        </Button>
                    )}
                >
                    The same question is printed more than once. Rewrite or edit it before confirming the paper.
                </Banner>
            ) : duplicates.similarCount > 0 ? (
                <Banner
                    tone="warn"
                    icon={WarningAmberOutlinedIcon}
                    title={`${duplicates.similarCount} question${duplicates.similarCount > 1 ? "s" : ""} look similar`}
                    right={firstFlagged && (
                        <Button onClick={() => jumpTo(firstFlagged)} sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px", flexShrink: 0 }}>
                            Jump to it
                        </Button>
                    )}
                >
                    They are not exact repeats, so you can keep them - just check they are testing different things.
                </Banner>
            ) : (
                <Banner tone="ok" icon={DoneAllIcon} title="No repeated questions">
                    Every question in this paper is unique. Open any question with the pencil to change it, then save it.
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
                    <EditNoteOutlinedIcon sx={{ fontSize: 18, color: DASH.muted }} />
                    <Typography sx={{ fontSize: "12.5px", color: DASH.text }}>
                        <strong>{questions.length}</strong> questions printed - the student answers <strong>{answered}</strong> marks worth
                    </Typography>
                    <Pill label={`${pattern?.totalMarks || answered} marks paper`} color={DASH.ink} bg={DASH.primaryLight} border={DASH.primaryBorder} />
                    {failedCount > 0 && <Pill label={`${failedCount} failed`} color={DASH.red} bg={DASH.redLight} border="#FECACA" />}
                    {manualCount > 0 && <Pill label={`${manualCount} to write by hand`} color="#B45309" bg={DASH.amberLight} border="#FDE68A" />}
                </Box>
            </Box>

            {grouped.map(({ section, items }) => {
                const shortfall = items.length < section.questionsToPrint;
                return (
                    <Box
                        key={section.id}
                        sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, mb: 1.8, overflow: "hidden" }}
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
                                    {section.questionType ? ` - ${section.questionType}` : ""}
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
                            </Box>
                        </Box>

                        <Box sx={{ p: 1.6 }}>
                            {items.length === 0 ? (
                                <Typography sx={{ fontSize: "12.5px", color: DASH.faint, textAlign: "center", py: 3 }}>
                                    No questions in this part yet.
                                </Typography>
                            ) : (
                                items.map((question) => {
                                    running += 1;
                                    return (
                                        <QuestionCard
                                            key={question.id}
                                            question={question}
                                            number={running}
                                            duplicate={duplicates.map?.[question.id]}
                                            saving={savingIds.includes(question.id)}
                                            canRegenerate={canRegenerate}
                                            busy={busy}
                                            onSave={onSaveQuestion}
                                            onRegenerate={onRegenerateOne}
                                        />
                                    );
                                })
                            )}
                        </Box>
                    </Box>
                );
            })}
        </>
    );
}
