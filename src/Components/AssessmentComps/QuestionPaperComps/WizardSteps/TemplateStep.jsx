import React from "react";
import {
    Box, Grid, Typography, Button, Switch, FormControlLabel, Tooltip, IconButton,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";

import { DASH, RADIUS, Panel } from "../../../DashBoardComps/dashboardTheme";
import PaperDocument, { PAPER_TEMPLATES } from "../paperTemplates";
import { outlineBtnSx, Banner } from "../questionPaperTheme";

const TemplateOption = ({ template, active, onPick }) => (
    <Box
        onClick={() => onPick(template.id)}
        sx={{
            position: "relative",
            border: `1px solid ${active ? DASH.primary : DASH.line}`,
            borderLeft: `3px solid ${template.accent}`,
            bgcolor: active ? DASH.primaryLight : "#fff",
            borderRadius: RADIUS,
            p: 1.4,
            mb: 1.1,
            cursor: "pointer",
            transition: "border-color .2s ease, background-color .2s ease",
            "&:hover": { borderColor: DASH.primaryBorder },
        }}
    >
        {active && (
            <CheckCircleIcon sx={{ position: "absolute", top: 10, right: 10, fontSize: 17, color: DASH.primary }} />
        )}
        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink, pr: 3 }}>
            {template.name}
        </Typography>
        <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.4, lineHeight: 1.55 }}>
            {template.description}
        </Typography>
    </Box>
);

export default function TemplateStep({
    templateId,
    onPick,
    paper,
    pattern,
    questions,
    school,
    showAnswers,
    onToggleAnswers,
    zoom,
    onZoom,
    onDownload,
    onPrint,
}) {
    return (
        <>
            <Banner tone="info" icon={PaletteOutlinedIcon} title="Choose how it prints">
                The preview on the right is the real paper - what you see here is exactly what the PDF will contain.
            </Banner>

            <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <Panel title="Templates" subtitle={`${PAPER_TEMPLATES.length} print layouts`} accent={DASH.violet} bodySx={{ p: 1.4 }}>
                        {PAPER_TEMPLATES.map((template) => (
                            <TemplateOption
                                key={template.id}
                                template={template}
                                active={template.id === templateId}
                                onPick={onPick}
                            />
                        ))}
                    </Panel>

                    <Box
                        sx={{
                            mt: 1.8, bgcolor: "#fff", border: `1px solid ${DASH.line}`,
                            borderRadius: RADIUS, px: 1.8, py: 1.4,
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={showAnswers}
                                    onChange={(e) => onToggleAnswers(e.target.checked)}
                                    sx={{
                                        "& .Mui-checked": { color: DASH.green },
                                        "& .Mui-checked + .MuiSwitch-track": { backgroundColor: DASH.green },
                                    }}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: "12.5px", color: DASH.text }}>
                                    Show the answer key
                                </Typography>
                            }
                        />
                        <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.4, lineHeight: 1.6 }}>
                            Answers print in green under each question. Turn this off before printing the student copy.
                        </Typography>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                    <Panel
                        title="Paper Preview"
                        subtitle="A4 - actual print layout"
                        accent={DASH.primary}
                        right={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                <Tooltip title="Zoom out" arrow>
                                    <span>
                                        <IconButton
                                            size="small"
                                            disabled={zoom <= 0.5}
                                            onClick={() => onZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))}
                                            sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, width: 28, height: 28 }}
                                        >
                                            <ZoomOutIcon sx={{ fontSize: 16, color: DASH.text }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.muted, width: 38, textAlign: "center" }}>
                                    {Math.round(zoom * 100)}%
                                </Typography>
                                <Tooltip title="Zoom in" arrow>
                                    <span>
                                        <IconButton
                                            size="small"
                                            disabled={zoom >= 1.2}
                                            onClick={() => onZoom(Math.min(1.2, Math.round((zoom + 0.1) * 10) / 10))}
                                            sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, width: 28, height: 28 }}
                                        >
                                            <ZoomInIcon sx={{ fontSize: 16, color: DASH.text }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Button onClick={onPrint} startIcon={<PrintOutlinedIcon sx={{ fontSize: 15 }} />} sx={outlineBtnSx}>
                                    Print
                                </Button>
                                <Button onClick={onDownload} startIcon={<DownloadOutlinedIcon sx={{ fontSize: 15 }} />} sx={outlineBtnSx}>
                                    PDF
                                </Button>
                            </Box>
                        }
                        bodySx={{ p: 0 }}
                    >
                        <Box
                            sx={{
                                bgcolor: "#EEF0F4",
                                p: { xs: 1.5, md: 3 },
                                maxHeight: "70vh",
                                overflow: "auto",
                            }}
                        >
                            <Box
                                sx={{
                                    zoom,
                                    width: 794,
                                    mx: "auto",
                                    boxShadow: "0 8px 30px rgba(17,24,39,0.18)",
                                }}
                            >
                                <PaperDocument
                                    paper={paper}
                                    pattern={pattern}
                                    questions={questions}
                                    templateId={templateId}
                                    school={school}
                                    showAnswers={showAnswers}
                                    answerSpace
                                />
                            </Box>
                        </Box>
                    </Panel>
                </Grid>
            </Grid>
        </>
    );
}
