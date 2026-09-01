import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, Typography, Button, IconButton, Divider } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import Loader from "../../Loader";
import { DASH, RADIUS, SOFT, KPI_TONES, Panel, MeterRow, SolidStatCard } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import {
    MOCK_PATTERNS, choiceHint, durationLabel, groupMarks, groupSections,
    patternBalanced, patternQuestionCount, patternSpread, patternTotal, patternTypeSpread,
    sectionEquation, sectionHeading, sectionInstruction, sectionMarks, typeMeta,
} from "./questionPaperApi";
import { Pill, TypeChip, outlineBtnSx, softBtnSx, primaryBtnSx, headerActionSx } from "./questionPaperTheme";

const DIFFICULTY_BANDS = [
    { key: "easy", label: "Easy", color: DASH.green },
    { key: "medium", label: "Medium", color: DASH.amber },
    { key: "hard", label: "Hard", color: DASH.red },
];

/* The three difficulty bands as one thin bar, so a section's balance reads
   without a legend on every row. */
const DifficultyBar = ({ difficulty }) => {
    const total = DIFFICULTY_BANDS.reduce((sum, b) => sum + (Number(difficulty?.[b.key]) || 0), 0) || 1;
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", height: 5, width: 96, borderRadius: RADIUS, overflow: "hidden", bgcolor: DASH.lineSoft, flexShrink: 0 }}>
                {DIFFICULTY_BANDS.map((band) => (
                    <Box
                        key={band.key}
                        sx={{ width: `${((Number(difficulty?.[band.key]) || 0) / total) * 100}%`, bgcolor: band.color }}
                    />
                ))}
            </Box>
            <Typography sx={{ fontSize: "10.5px", color: DASH.faint, whiteSpace: "nowrap" }}>
                {DIFFICULTY_BANDS.map((b) => `${b.label[0]} ${Number(difficulty?.[b.key]) || 0}`).join(" / ")}
            </Typography>
        </Box>
    );
};

export default function PatternViewPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { patternId } = useParams();
    const grades = useSelector(selectGrades) || [];

    const [pattern, setPattern] = useState(location.state?.pattern || null);
    const [isLoading, setIsLoading] = useState(!location.state?.pattern);

    /* Mock read. Replace with axios.get(GetQuestionPaperPatternById, { params:
       { patternId } }) + normalizePattern. */
    useEffect(() => {
        if (pattern) return;
        setIsLoading(true);
        const timer = setTimeout(() => {
            setPattern(MOCK_PATTERNS.find((p) => String(p.id) === String(patternId)) || null);
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [pattern, patternId]);

    const groups = useMemo(() => groupSections(pattern?.sections || []), [pattern]);
    const spread = useMemo(() => patternSpread(pattern), [pattern]);
    const typeSpread = useMemo(() => patternTypeSpread(pattern), [pattern]);

    if (isLoading) return <Loader />;

    if (!pattern) {
        return (
            <Box sx={{ p: 3, bgcolor: DASH.canvas, minHeight: "100%" }}>
                <Typography sx={{ fontSize: "14px", color: DASH.muted }}>
                    This pattern could not be found.{" "}
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns")}
                        sx={{ ...outlineBtnSx, ml: 1 }}
                    >
                        Back to patterns
                    </Button>
                </Typography>
            </Box>
        );
    }

    const total = patternTotal(pattern);
    const balanced = patternBalanced(pattern);
    const answerCount = (pattern.sections || []).reduce((sum, s) => sum + (Number(s.questionsToAnswer) || 0), 0);
    const printCount = patternQuestionCount(pattern);
    const classLabel = (pattern.gradeIds || [])
        .map((id) => grades.find((g) => String(g.id) === String(id))?.sign)
        .filter(Boolean)
        .join(", ");
    const instructionLines = String(pattern.instructions || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <Box
                sx={{
                    display: "flex", alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between", flexDirection: { xs: "column", md: "row" },
                    gap: 1.5, mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, minWidth: 0 }}>
                    <IconButton
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns")}
                        sx={{ mt: -0.5 }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink, lineHeight: 1.3 }}>
                            {pattern.name}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 0.6 }}>
                            <Pill label={pattern.exam || "Any exam"} color={DASH.violet} bg={DASH.violetLight} border={`${DASH.violet}33`} />
                            <Pill label={classLabel || "Any class"} color={DASH.text} bg={DASH.lineSoft} />
                            <Pill label={pattern.subject || "Any subject"} color={DASH.muted} bg={DASH.lineSoft} />
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 }, flexWrap: "wrap" }}>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/create", {
                            state: { pattern: { ...pattern, id: null, name: `${pattern.name} (Copy)`, usedCount: 0 } },
                        })}
                        startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{ ...softBtnSx(SOFT.cyan), ...headerActionSx }}
                    >
                        Duplicate
                    </Button>
                    <Button
                        onClick={() => navigate(`/dashboardmenu/assessment/question-paper/patterns/${pattern.id}`, { state: { pattern } })}
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{ ...softBtnSx(SOFT.purple), ...headerActionSx }}
                    >
                        Edit pattern
                    </Button>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/create", { state: { presetPattern: pattern } })}
                        startIcon={<RocketLaunchOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            ...primaryBtnSx,
                            ...headerActionSx,
                            // The one action the teacher came for, so it carries the
                            // same solid weight as the submit button on a book.
                            boxShadow: "0 2px 10px rgba(238,162,0,0.35)",
                            "&:hover": { bgcolor: "#D89400", boxShadow: "0 4px 14px rgba(238,162,0,0.45)" },
                        }}
                    >
                        Use this pattern
                    </Button>
                </Box>
            </Box>

            {!balanced && (
                <Box
                    sx={{
                        display: "flex", gap: 1.2, alignItems: "flex-start",
                        bgcolor: DASH.redLight, border: "1px solid #FECACA",
                        borderRadius: RADIUS, px: 1.8, py: 1.3, mb: 2,
                    }}
                >
                    <ErrorOutlineIcon sx={{ fontSize: 17, color: DASH.red, flexShrink: 0, mt: 0.1 }} />
                    <Typography sx={{ fontSize: "12.5px", color: "#991B1B", lineHeight: 1.55 }}>
                        The sections add up to <strong>{total}</strong> marks, but this pattern is set to{" "}
                        <strong>{pattern.totalMarks}</strong>. Edit the pattern before a paper is built from it.
                    </Typography>
                </Box>
            )}

            <Grid container spacing={1.4} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                    <SolidStatCard
                        tone={balanced ? KPI_TONES.orange : KPI_TONES.pink}
                        label="Total marks"
                        value={total}
                        note={balanced ? "Sections add up" : `Pattern is set to ${pattern.totalMarks}`}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                    <SolidStatCard
                        tone={KPI_TONES.violet}
                        label="Sections"
                        value={spread.length}
                        note={`${pattern.sections.length} question blocks`}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                    <SolidStatCard
                        tone={KPI_TONES.blue}
                        label="Questions printed"
                        value={printCount}
                        note={`${answerCount} to be answered`}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                    <SolidStatCard
                        tone={KPI_TONES.cyan}
                        label="Duration"
                        value={durationLabel(pattern.durationMinutes)}
                        note={pattern.readingTimeMinutes ? `+ ${pattern.readingTimeMinutes} min reading time` : "No reading time"}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 8, md: 2.4 }}>
                    <SolidStatCard
                        tone={KPI_TONES.green}
                        label="Used in"
                        value={`${pattern.usedCount || 0} paper${(pattern.usedCount || 0) === 1 ? "" : "s"}`}
                        note={pattern.createdBy || "-"}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Panel
                        title="Paper blueprint"
                        subtitle="Printed in this order, with the marks each section carries"
                        accent={DASH.violet}
                        right={(
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <TimerOutlinedIcon sx={{ fontSize: 14, color: DASH.faint }} />
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                    {durationLabel(pattern.durationMinutes)}
                                </Typography>
                            </Box>
                        )}
                        bodySx={{ p: 0 }}
                    >
                        {groups.map((group, gi) => (
                            <Box key={`${group.name}-${gi}`}>
                                {group.name && (
                                    <Box
                                        sx={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                                            px: 2, py: 0.9, bgcolor: DASH.violetLight,
                                            borderTop: gi === 0 ? "none" : `1px solid ${DASH.line}`,
                                            borderBottom: `1px solid ${DASH.violet}22`,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "11.5px", fontWeight: 800, color: DASH.violet, letterSpacing: "0.06em" }}>
                                            {group.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.violet }}>
                                            {groupMarks(group)} marks
                                        </Typography>
                                    </Box>
                                )}

                                {group.sections.map((section, si) => {
                                    const meta = typeMeta(section.type);
                                    const hint = choiceHint(section);
                                    return (
                                        <Box
                                            key={section.id}
                                            sx={{
                                                display: "flex", gap: 1.4, px: 2, py: 1.4,
                                                borderBottom: `1px solid ${DASH.lineSoft}`,
                                                borderLeft: `3px solid ${meta.color}`,
                                                bgcolor: si % 2 === 0 ? "#fff" : "#FCFCFD",
                                            }}
                                        >
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                                                    {sectionHeading(section) && (
                                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 800, color: DASH.ink }}>
                                                            {sectionHeading(section)}
                                                        </Typography>
                                                    )}
                                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.text }}>
                                                        {section.title || meta.label}
                                                    </Typography>
                                                    <TypeChip type={section.type} />
                                                    {hint && <Pill label={hint} color={DASH.amber} bg={DASH.amberLight} border={`${DASH.amber}33`} />}
                                                </Box>

                                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.5, lineHeight: 1.5 }}>
                                                    {sectionInstruction(section)}
                                                </Typography>

                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, mt: 0.8, flexWrap: "wrap" }}>
                                                    <Typography sx={{ fontSize: "11px", color: DASH.faint }}>
                                                        {section.questionsToPrint} printed - {section.questionsToAnswer} answered
                                                        {meta.hasOptions ? ` - ${section.optionCount} options` : ""}
                                                    </Typography>
                                                    <DifficultyBar difficulty={section.difficulty} />
                                                </Box>
                                            </Box>

                                            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                                                <Typography sx={{ fontSize: "15px", fontWeight: 800, color: DASH.ink, lineHeight: 1.2 }}>
                                                    {sectionMarks(section)}
                                                </Typography>
                                                <Typography sx={{ fontSize: "10.5px", color: DASH.faint, whiteSpace: "nowrap" }}>
                                                    {sectionEquation(section)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        ))}

                        <Box
                            sx={{
                                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                                px: 2, py: 1.3, bgcolor: "#FCFCFD",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                {balanced
                                    ? <CheckCircleIcon sx={{ fontSize: 15, color: DASH.green }} />
                                    : <ErrorOutlineIcon sx={{ fontSize: 15, color: DASH.red }} />}
                                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: balanced ? DASH.green : DASH.red }}>
                                    {balanced ? "Sections add up to the pattern total" : `Sections add to ${total}, not ${pattern.totalMarks}`}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "13px", fontWeight: 800, color: DASH.ink }}>
                                TOTAL - {total} marks
                            </Typography>
                        </Box>
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
                        <Panel title="Where the marks sit" subtitle="Share of the total by section" accent={DASH.blue}>
                            {spread.map((part) => (
                                <MeterRow
                                    key={part.key}
                                    label={part.short}
                                    value={part.marks}
                                    max={total || 1}
                                    color={part.color}
                                    right={`${part.marks} / ${total}`}
                                />
                            ))}
                        </Panel>

                        <Panel title="By question type" subtitle="What the student is actually asked to do" accent={DASH.cyan}>
                            {typeSpread.map((entry) => (
                                <Box key={entry.key} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: entry.color, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.text, flex: 1, minWidth: 0 }}>
                                        {entry.label}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", color: DASH.faint, flexShrink: 0 }}>
                                        {entry.questions} q
                                    </Typography>
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink, width: 58, textAlign: "right", flexShrink: 0 }}>
                                        {entry.marks} marks
                                    </Typography>
                                </Box>
                            ))}
                        </Panel>

                        <Panel title="General instructions" subtitle="Printed above the first question" accent={DASH.amber}>
                            {instructionLines.length === 0 ? (
                                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 15, color: DASH.faint, mt: 0.2 }} />
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>
                                        No general instructions are set on this pattern.
                                    </Typography>
                                </Box>
                            ) : (
                                instructionLines.map((line, i) => (
                                    <Box key={line} sx={{ display: "flex", gap: 1, alignItems: "flex-start", py: 0.4 }}>
                                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.amber, width: 16, flexShrink: 0 }}>
                                            {i + 1}.
                                        </Typography>
                                        <Typography sx={{ fontSize: "12px", color: DASH.text, lineHeight: 1.55 }}>
                                            {line}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </Panel>

                        <Panel title="Pattern details" accent={DASH.muted}>
                            {[
                                { icon: ArticleOutlinedIcon, label: "Created by", value: pattern.createdBy || "-" },
                                { icon: RuleOutlinedIcon, label: "Created on", value: pattern.createdDate || "-" },
                                { icon: PieChartOutlineIcon, label: "Marks per paper", value: `${pattern.totalMarks}` },
                                { icon: TimerOutlinedIcon, label: "Reading time", value: pattern.readingTimeMinutes ? `${pattern.readingTimeMinutes} min` : "Not set" },
                            ].map((row, i, list) => {
                                const RowIcon = row.icon;
                                return (
                                    <Box key={row.label}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.8 }}>
                                            <RowIcon sx={{ fontSize: 15, color: DASH.faint, flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: "12.5px", color: DASH.muted, flex: 1 }}>
                                                {row.label}
                                            </Typography>
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }}>
                                                {row.value}
                                            </Typography>
                                        </Box>
                                        {i < list.length - 1 && <Divider sx={{ borderColor: DASH.lineSoft }} />}
                                    </Box>
                                );
                            })}
                        </Panel>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
