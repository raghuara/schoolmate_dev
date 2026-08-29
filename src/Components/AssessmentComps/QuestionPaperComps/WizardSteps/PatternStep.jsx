import React, { useMemo, useState } from "react";
import { Box, Grid, Typography, Button, Switch, FormControlLabel, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import AddIcon from "@mui/icons-material/Add";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";

import { DASH, RADIUS } from "../../../DashBoardComps/dashboardTheme";
import {
    patternQuestionCount, patternTotal, sectionHeading, sectionMarks, sectionMarksLabel, typeMeta,
} from "../questionPaperApi";
import { Pill, fieldSx, outlineBtnSx, primaryBtnSx, Banner } from "../questionPaperTheme";

const PatternOption = ({ pattern, active, matches, onPick }) => {
    const total = patternTotal(pattern);

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
                <CheckCircleIcon
                    sx={{ position: "absolute", top: 10, right: 10, fontSize: 19, color: DASH.primary }}
                />
            )}

            <Box sx={{ p: 1.8 }}>
                <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink, pr: 3 }}>
                    {pattern.name}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.3 }}>
                    {pattern.exam || "Any exam"}
                </Typography>

                <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 1.2 }}>
                    <Pill
                        label={`${total} marks`}
                        color={matches ? DASH.ink : DASH.red}
                        bg={matches ? DASH.primaryLight : DASH.redLight}
                        border={matches ? DASH.primaryBorder : "#FECACA"}
                    />
                    <Pill label={`${pattern.sections.length} sections`} color={DASH.muted} bg={DASH.lineSoft} />
                    <Pill label={`${patternQuestionCount(pattern)} questions`} color={DASH.muted} bg={DASH.lineSoft} />
                </Box>

                <Box sx={{ mt: 1.4, border: `1px solid ${DASH.lineSoft}`, borderRadius: RADIUS, overflow: "hidden" }}>
                    {pattern.sections.map((section, i) => {
                        const meta = typeMeta(section.type);
                        return (
                            <Box
                                key={section.id}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1, px: 1.2, py: 0.75,
                                    borderBottom: i < pattern.sections.length - 1 ? `1px solid ${DASH.lineSoft}` : "none",
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
                                    {meta.short}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, flexShrink: 0 }}>
                                    {sectionMarksLabel(section) || `${sectionMarks(section)}`}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, mt: 1.3, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <TimerOutlinedIcon sx={{ fontSize: 13, color: DASH.faint }} />
                        <Typography sx={{ fontSize: "11px", color: DASH.muted }}>{pattern.durationMinutes} min</Typography>
                    </Box>
                    {!matches && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                            <ErrorOutlineIcon sx={{ fontSize: 13, color: DASH.red }} />
                            <Typography sx={{ fontSize: "11px", color: DASH.red, fontWeight: 600 }}>
                                For a different exam
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default function PatternStep({
    patterns, gradeId, exam, selectedPattern, onPick, durationMinutes, onDurationChange,
}) {
    const navigate = useNavigate();
    const [onlyMatching, setOnlyMatching] = useState(true);

    const list = useMemo(() => {
        const wanted = String(exam || "").trim().toLowerCase();
        const scored = patterns.map((pattern) => ({
            pattern,
            matches: !wanted || String(pattern.exam || "").trim().toLowerCase() === wanted,
            forClass: !pattern.gradeIds?.length || pattern.gradeIds.map(String).includes(String(gradeId)),
        }));

        const filtered = onlyMatching
            ? scored.filter((row) => row.matches && row.forClass)
            : scored;

        return filtered.sort((a, b) => {
            if (a.forClass !== b.forClass) return a.forClass ? -1 : 1;
            if (a.matches !== b.matches) return a.matches ? -1 : 1;
            return 0;
        });
    }, [patterns, gradeId, exam, onlyMatching]);

    return (
        <>
            {selectedPattern ? (
                <Banner tone="ok" icon={CheckCircleIcon} title={`${selectedPattern.name} sets this paper`}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mt: 0.6 }}>
                        <Typography sx={{ fontSize: "12.5px", color: "#065F46" }}>
                            Maximum marks <strong>{patternTotal(selectedPattern)}</strong>
                            {" · "}{selectedPattern.sections.length} sections
                            {" · "}{patternQuestionCount(selectedPattern)} questions printed
                        </Typography>

                        {/* The pattern's duration is the default; this paper may sit shorter. */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Typography sx={{ fontSize: "12.5px", color: "#065F46" }}>Duration</Typography>
                            <TextField
                                size="small"
                                value={durationMinutes}
                                onChange={(e) => onDurationChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
                                sx={{
                                    ...fieldSx, width: 92,
                                    "& input": { py: 0.4, fontSize: "12.5px", textAlign: "center", fontWeight: 700 },
                                }}
                            />
                            <Typography sx={{ fontSize: "12.5px", color: "#065F46" }}>minutes</Typography>
                        </Box>
                    </Box>
                </Banner>
            ) : (
                <Banner tone="info" icon={DashboardCustomizeOutlinedIcon} title="Pick the blueprint">
                    The pattern decides how many questions print in each part, the marks each carries and how much
                    choice the student gets. <strong>It also sets the paper's maximum marks and duration</strong> -
                    that is why you were not asked for them earlier.
                </Banner>
            )}

            <Box
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 1.5, flexWrap: "wrap", mb: 1.8,
                }}
            >
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            checked={onlyMatching}
                            onChange={(e) => setOnlyMatching(e.target.checked)}
                            sx={{
                                "& .Mui-checked": { color: DASH.primary },
                                "& .Mui-checked + .MuiSwitch-track": { backgroundColor: DASH.primary },
                            }}
                        />
                    }
                    label={
                        <Typography sx={{ fontSize: "12.5px", color: DASH.text }}>
                            Only show patterns for this class and exam
                        </Typography>
                    }
                />

                <Button
                    onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/create")}
                    startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                    sx={outlineBtnSx}
                >
                    Create new pattern
                </Button>
            </Box>

            {list.length === 0 ? (
                <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 6, px: 3, textAlign: "center" }}>
                    <DashboardCustomizeOutlinedIcon sx={{ fontSize: 42, color: DASH.line }} />
                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                        No pattern for this class and exam yet
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5, mb: 2 }}>
                        Turn off the filter to see every pattern, or build one for this exam.
                    </Typography>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/create")}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        sx={primaryBtnSx}
                    >
                        Create Pattern
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={1.8}>
                    {list.map(({ pattern, matches }) => (
                        <Grid key={pattern.id} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <PatternOption
                                pattern={pattern}
                                matches={matches}
                                active={String(selectedPattern?.id) === String(pattern.id)}
                                onPick={onPick}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </>
    );
}
