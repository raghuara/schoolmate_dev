import React, { useMemo } from "react";
import { Box, Grid, Typography, TextField, MenuItem, LinearProgress } from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

import { DASH, RADIUS, Panel, MeterRow, EmptyNote } from "../../../DashBoardComps/dashboardTheme";
import { DIFFICULTY_LEVELS, sectionMarks } from "../questionPaperApi";
import { PAPER_TEMPLATES } from "../paperTemplates";
import { Pill, fieldSx } from "../questionPaperTheme";

const SummaryRow = ({ label, value }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, py: 0.7, borderBottom: `1px solid ${DASH.lineSoft}` }}>
        <Typography sx={{ fontSize: "12px", color: DASH.muted, flexShrink: 0 }}>{label}</Typography>
        <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink, textAlign: "right", minWidth: 0 }}>
            {value || "-"}
        </Typography>
    </Box>
);

const CheckRow = ({ ok, warn, text }) => {
    const Icon = ok ? CheckCircleIcon : warn ? WarningAmberOutlinedIcon : CancelOutlinedIcon;
    const color = ok ? DASH.green : warn ? DASH.primary : DASH.red;
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, py: 0.6 }}>
            <Icon sx={{ fontSize: 16, color, flexShrink: 0, mt: 0.15 }} />
            <Typography sx={{ fontSize: "12.5px", color: ok ? DASH.text : color, lineHeight: 1.55 }}>
                {text}
            </Typography>
        </Box>
    );
};

export default function PublishStep({
    form,
    pattern,
    questions,
    chapters,
    duplicates,
    templateId,
    approver,
    onApproverChange,
    approvers,
    note,
    onNoteChange,
    checks,
}) {
    const template = PAPER_TEMPLATES.find((t) => t.id === templateId) || PAPER_TEMPLATES[0];

    const chapterCoverage = useMemo(() => {
        const map = {};
        questions.forEach((q) => {
            const key = q.chapterName || "Unassigned";
            map[key] = (map[key] || 0) + (Number(q.marks) || 0);
        });
        const totalMarks = Object.values(map).reduce((sum, v) => sum + v, 0) || 1;
        return Object.entries(map)
            .map(([name, marks]) => ({ name, marks, percent: Math.round((marks / totalMarks) * 100) }))
            .sort((a, b) => b.marks - a.marks);
    }, [questions]);

    const difficultyMix = useMemo(() => {
        const counts = { easy: 0, medium: 0, hard: 0 };
        questions.forEach((q) => { counts[q.difficulty] = (counts[q.difficulty] || 0) + 1; });
        const total = questions.length || 1;
        return DIFFICULTY_LEVELS.map((level) => ({
            ...level,
            count: counts[level.key] || 0,
            percent: Math.round(((counts[level.key] || 0) / total) * 100),
        }));
    }, [questions]);

    const sectionsTotal = (pattern?.sections || []).reduce((sum, s) => sum + sectionMarks(s), 0);

    return (
        <Grid container spacing={1.8}>
            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                <Panel title="Paper Summary" subtitle="What gets saved" accent={DASH.primary} sx={{ mb: 1.8 }}>
                    <SummaryRow label="Paper name" value={form.name} />
                    <SummaryRow label="Class" value={form.gradeSign} />
                    <SummaryRow label="Subject" value={form.subject} />
                    <SummaryRow label="Exam" value={form.examName} />
                    <SummaryRow label="Academic year" value={form.academicYear} />
                    <SummaryRow label="Duration" value={`${form.durationMinutes} minutes`} />
                    <SummaryRow label="Maximum marks" value={`${form.totalMarks}`} />
                    <SummaryRow label="Pattern" value={pattern?.name} />
                    <SummaryRow label="Sections" value={`${pattern?.sections?.length || 0} - ${sectionsTotal} marks`} />
                    <SummaryRow label="Chapters" value={`${chapters.length} selected`} />
                    <SummaryRow label="Questions printed" value={`${questions.length}`} />
                    <SummaryRow label="Print template" value={template.name} />
                </Panel>

                <Panel title="Send for Approval" subtitle="Who signs this paper off" accent={DASH.green}>
                    <TextField
                        select fullWidth size="small" label="Approver"
                        value={approver}
                        onChange={(e) => onApproverChange(e.target.value)}
                        helperText="They see the paper before it can be published."
                        sx={fieldSx}
                    >
                        {approvers.map((a) => (
                            <MenuItem key={a} value={a} sx={{ fontSize: "13px" }}>{a}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth multiline minRows={3} size="small"
                        label="Note for the approver (optional)"
                        placeholder="Anything they should know - portion covered, changes from last term."
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value)}
                        sx={{ ...fieldSx, mt: 1.6 }}
                    />
                </Panel>
            </Grid>

            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                <Panel
                    title="Before You Send"
                    subtitle="Everything the paper is checked against"
                    accent={checks.every((c) => c.ok || c.warn) ? DASH.green : DASH.red}
                    sx={{ mb: 1.8 }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                        <FactCheckOutlinedIcon sx={{ fontSize: 17, color: DASH.muted }} />
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>
                            {checks.filter((c) => c.ok).length} of {checks.length} checks passed
                        </Typography>
                        {duplicates.duplicateCount > 0 && (
                            <Pill label={`${duplicates.duplicateCount} duplicates`} color={DASH.red} bg={DASH.redLight} border="#FECACA" />
                        )}
                    </Box>
                    {checks.map((check) => (
                        <CheckRow key={check.text} ok={check.ok} warn={check.warn} text={check.text} />
                    ))}
                </Panel>

                <Grid container spacing={1.8}>
                    <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7 }}>
                        <Panel title="Chapter Coverage" subtitle="Marks drawn from each chapter" accent={DASH.cyan}>
                            {chapterCoverage.length === 0 ? (
                                <EmptyNote text="No questions to measure yet." />
                            ) : (
                                chapterCoverage.map((row) => (
                                    <MeterRow
                                        key={row.name}
                                        label={row.name.length > 16 ? `${row.name.slice(0, 15)}...` : row.name}
                                        value={row.percent}
                                        color={DASH.cyan}
                                        right={`${row.marks} m`}
                                    />
                                ))
                            )}
                        </Panel>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5 }}>
                        <Panel title="Difficulty Mix" subtitle="Across every question" accent={DASH.violet}>
                            {difficultyMix.map((level) => (
                                <Box key={level.key} sx={{ mb: 1.4 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: level.color }} />
                                            <Typography sx={{ fontSize: "12px", color: DASH.text }}>{level.label}</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink }}>
                                            {level.count} ({level.percent}%)
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={level.percent}
                                        sx={{
                                            height: 6, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                                            "& .MuiLinearProgress-bar": { bgcolor: level.color, borderRadius: RADIUS },
                                        }}
                                    />
                                </Box>
                            ))}
                        </Panel>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}
