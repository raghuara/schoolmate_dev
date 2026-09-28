import React from "react";
import { Box, Grid, Typography, Button, CircularProgress } from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import { DASH, RADIUS } from "../../../DashBoardComps/dashboardTheme";
import {
    patternQuestionCount, patternTotal, sectionHeading, sectionMarks, sectionMarksLabel, typeMeta,
} from "../questionPaperApi";
import { Pill, outlineBtnSx, primaryBtnSx, Banner } from "../questionPaperTheme";

const PatternOption = ({ pattern, active, onPick }) => {
    const total = patternTotal(pattern) || pattern.totalMarks || 0;
    const sections = pattern.sections || [];

    return (
        <Box
            onClick={() => onPick(pattern)}
            sx={{
                position: "relative",
                bgcolor: "#fff",
                border: `1px solid ${active ? DASH.primary : DASH.line}`,
                borderLeft: `3px solid ${active ? DASH.primary : DASH.violet}`,
                borderRadius: RADIUS,
                height: "100%",
                boxSizing: "border-box",
                cursor: "pointer",
                overflow: "hidden",
                boxShadow: active ? "0 6px 20px rgba(238,162,0,0.18)" : "none",
                transition: "box-shadow .2s ease, border-color .2s ease, transform .2s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 22px rgba(17,24,39,0.10)" },
            }}
        >
            {active && (
                <CheckCircleIcon sx={{ position: "absolute", top: 10, right: 10, fontSize: 19, color: DASH.primary }} />
            )}

            <Box sx={{ p: 1.8 }}>
                <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink, pr: 3 }}>
                    {pattern.name}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.3 }}>
                    {[pattern.grade, pattern.subject].filter(Boolean).join(" - ")}
                </Typography>

                <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 1.2 }}>
                    <Pill label={`${total} marks`} color={DASH.ink} bg={DASH.primaryLight} border={DASH.primaryBorder} />
                    <Pill label={`${sections.length || pattern.sectionCount || 0} sections`} color={DASH.muted} bg={DASH.lineSoft} />
                    {sections.length > 0 && (
                        <Pill label={`${patternQuestionCount(pattern)} questions`} color={DASH.muted} bg={DASH.lineSoft} />
                    )}
                </Box>

                {sections.length > 0 && (
                    <Box sx={{ mt: 1.4, border: `1px solid ${DASH.lineSoft}`, borderRadius: RADIUS, overflow: "hidden" }}>
                        {sections.map((section, i) => {
                            const meta = typeMeta(section.type);
                            return (
                                <Box
                                    key={section.id}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1, px: 1.2, py: 0.75,
                                        borderBottom: i < sections.length - 1 ? `1px solid ${DASH.lineSoft}` : "none",
                                        bgcolor: i % 2 === 0 ? "#fff" : "#FCFCFD",
                                    }}
                                >
                                    <Typography sx={{ fontSize: "10.5px", fontWeight: 800, color: DASH.ink, width: 54, flexShrink: 0 }}>
                                        {(sectionHeading(section) || section.groupName || "").replace("PART - ", "").replace("SECTION ", "")}
                                    </Typography>
                                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: meta.color, flexShrink: 0 }} />
                                    <Typography
                                        sx={{
                                            fontSize: "11px", color: DASH.text, flex: 1, minWidth: 0,
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}
                                    >
                                        {section.customLabel || meta.short}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, flexShrink: 0 }}>
                                        {sectionMarksLabel(section) || `${sectionMarks(section)}`}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 1.3 }}>
                    <TimerOutlinedIcon sx={{ fontSize: 13, color: DASH.faint }} />
                    <Typography sx={{ fontSize: "11px", color: DASH.muted }}>{pattern.durationMinutes} min</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default function PatternStep({
    patterns, gradeLabel, subject, selectedPattern, onPick, loading = false, emptyMessage = "", onReload,
}) {
    const portion = [gradeLabel, subject].filter(Boolean).join(" - ");

    if (loading) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, py: 5, justifyContent: "center" }}>
                <CircularProgress size={20} thickness={4} sx={{ color: DASH.violet }} />
                <Typography sx={{ fontSize: "13px", color: DASH.muted }}>Loading the patterns{portion ? ` for ${portion}` : ""}</Typography>
            </Box>
        );
    }

    if (!patterns.length) {
        return (
            <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 6, px: 3, textAlign: "center" }}>
                <DashboardCustomizeOutlinedIcon sx={{ fontSize: 42, color: DASH.line }} />
                <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                    No pattern{portion ? ` for ${portion}` : " for this class and subject"} yet
                </Typography>
                <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5, mb: 2, maxWidth: 520, mx: "auto", lineHeight: 1.7 }}>
                    {emptyMessage || "A paper can only use a pattern built for its own class and subject. Once one is saved under Patterns, check again and pick it here."}
                </Typography>
                <Button onClick={onReload} startIcon={<RefreshIcon sx={{ fontSize: 16 }} />} sx={primaryBtnSx}>
                    Check again
                </Button>
            </Box>
        );
    }

    return (
        <>
            {selectedPattern ? (
                <Banner tone="ok" icon={CheckCircleIcon} title={`${selectedPattern.name} sets this paper`}>
                    <Typography sx={{ fontSize: "12.5px", color: "#065F46", mt: 0.4 }}>
                        Maximum marks <strong>{patternTotal(selectedPattern) || selectedPattern.totalMarks}</strong>
                        {" · "}Duration <strong>{selectedPattern.durationMinutes} minutes</strong>
                        {" · "}{(selectedPattern.sections || []).length || selectedPattern.sectionCount} sections
                        {(selectedPattern.sections || []).length > 0 ? ` · ${patternQuestionCount(selectedPattern)} questions printed` : ""}
                    </Typography>
                </Banner>
            ) : (
                <Banner tone="info" icon={DashboardCustomizeOutlinedIcon} title="Pick the blueprint">
                    The pattern decides how many questions print in each part, the marks each carries and how much
                    choice the student gets. <strong>It also sets the paper's maximum marks and duration.</strong>
                </Banner>
            )}

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", mb: 1.8 }}>
                <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>
                    {patterns.length} pattern{patterns.length === 1 ? "" : "s"} built for {portion || "this class and subject"}
                </Typography>
                <Button onClick={onReload} startIcon={<RefreshIcon sx={{ fontSize: 15 }} />} sx={outlineBtnSx}>
                    Refresh
                </Button>
            </Box>

            <Grid container spacing={1.8}>
                {patterns.map((pattern) => (
                    <Grid key={pattern.id} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                        <PatternOption
                            pattern={pattern}
                            active={String(selectedPattern?.id) === String(pattern.id)}
                            onPick={onPick}
                        />
                    </Grid>
                ))}
            </Grid>
        </>
    );
}
