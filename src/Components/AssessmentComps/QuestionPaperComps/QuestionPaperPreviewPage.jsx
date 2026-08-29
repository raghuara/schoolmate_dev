import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Switch, FormControlLabel, Tooltip,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import html2pdf from "html2pdf.js";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import SubjectOutlinedIcon from "@mui/icons-material/SubjectOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import { DASH, RADIUS, SOFT, Panel } from "../../DashBoardComps/dashboardTheme";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { MOCK_PAPERS, MOCK_PATTERNS, buildMockQuestions, fmtDate } from "./questionPaperApi";
import PaperDocument, { templateById, PAPER_COLORS, DEFAULT_PAPER_COLOR, paperColorHex, printPaperNode, padToWholePages } from "./paperTemplates";
import { StatusPill, outlineBtnSx, softBtnSx, primaryBtnSx } from "./questionPaperTheme";

const InfoRow = ({ label, value }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, py: 0.7, borderBottom: `1px solid ${DASH.lineSoft}` }}>
        <Typography sx={{ fontSize: "12px", color: DASH.muted, flexShrink: 0 }}>{label}</Typography>
        <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink, textAlign: "right", minWidth: 0 }}>
            {value || "-"}
        </Typography>
    </Box>
);

export default function QuestionPaperPreviewPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { paperId } = useParams();
    const websiteSettings = useSelector(selectWebsiteSettings);

    const [paper, setPaper] = useState(location.state?.paper || null);
    const [isLoading, setIsLoading] = useState(!location.state?.paper);
    const [showAnswers, setShowAnswers] = useState(false);
    const [zoom, setZoom] = useState(0.8);
    const [paperColor, setPaperColor] = useState(DEFAULT_PAPER_COLOR);
    const [answerSpace, setAnswerSpace] = useState(false);
    const sheetHex = paperColorHex(paperColor);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const printRef = useRef(null);

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    /* Mock read. Replace with GET qpaper/getById - the response should carry the
       pattern and the questions along with the paper header. */
    useEffect(() => {
        if (paper) return;
        setIsLoading(true);
        const timer = setTimeout(() => {
            setPaper(MOCK_PAPERS.find((p) => String(p.id) === String(paperId)) || null);
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [paper, paperId]);

    const pattern = useMemo(
        () => MOCK_PATTERNS.find((p) => p.name === paper?.patternName) || MOCK_PATTERNS[0],
        [paper]
    );

    const questions = useMemo(
        () => (pattern ? buildMockQuestions(pattern, [{ id: "ch-1", title: paper?.subject || "General" }]) : []),
        [pattern, paper]
    );

    const school = { name: websiteSettings?.title, address: "" };

    const downloadPdf = () => {
        if (!printRef.current) return;
        // Same reason as printing - without this the sheet colour stops where
        // the questions stop and the rest of the last page comes out white.
        const undoPad = padToWholePages(printRef.current);
        html2pdf()
            .set({
                margin: 0,
                filename: `${paper?.name || "question-paper"}${showAnswers ? "-answer-key" : ""}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: sheetHex },
                jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["css", "legacy"] },
            })
            .from(printRef.current)
            .save()
            .then(undoPad, undoPad);
        notify("Preparing the PDF", true);
    };

    const printPaper = () => {
        if (!printPaperNode(printRef.current, paper?.name, sheetHex)) {
            notify("Allow pop-ups to print the paper");
        }
    };

    if (isLoading) return <Loader />;

    if (!paper) {
        return (
            <Box sx={{ p: 3, bgcolor: DASH.canvas, minHeight: "100%" }}>
                <Typography sx={{ fontSize: "14px", color: DASH.muted }}>
                    This paper could not be found.
                    <Button onClick={() => navigate("/dashboardmenu/assessment/question-paper/all")} sx={{ ...outlineBtnSx, ml: 1 }}>
                        Back to all papers
                    </Button>
                </Typography>
            </Box>
        );
    }

    const template = templateById(paper.templateId);

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

            <Box
                sx={{
                    display: "flex", alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between", flexDirection: { xs: "column", md: "row" },
                    gap: 1.5, mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, minWidth: 0 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 30, height: 30, mt: -0.2 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                {paper.name}
                            </Typography>
                            <StatusPill status={paper.status} />
                        </Box>
                        <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.2 }}>
                            {paper.grade} · {paper.subject} · {paper.examName}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 }, flexWrap: "wrap" }}>
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/create", { state: { clonePaper: paper } })}
                        startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={softBtnSx(SOFT.cyan)}
                    >
                        Duplicate
                    </Button>
                    {paper.status !== "Published" && (
                        <Button
                            onClick={() => navigate("/dashboardmenu/assessment/question-paper/create", { state: { clonePaper: paper } })}
                            startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={softBtnSx(SOFT.purple)}
                        >
                            Edit
                        </Button>
                    )}
                    <Button onClick={printPaper} startIcon={<PrintOutlinedIcon sx={{ fontSize: 15 }} />} sx={softBtnSx(SOFT.blue)}>
                        Print
                    </Button>
                    <Button onClick={downloadPdf} startIcon={<DownloadOutlinedIcon sx={{ fontSize: 15 }} />} sx={primaryBtnSx}>
                        Download PDF
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <Panel title="Paper Details" subtitle="Saved with this paper" accent={DASH.primary} sx={{ mb: 1.8 }}>
                        <InfoRow label="Class" value={paper.grade} />
                        <InfoRow label="Subject" value={paper.subject} />
                        <InfoRow label="Exam" value={paper.examName} />
                        <InfoRow label="Exam date" value={fmtDate(paper.examDate)} />
                        <InfoRow label="Academic year" value={paper.academicYear} />
                        <InfoRow label="Duration" value={`${paper.durationMinutes} minutes`} />
                        <InfoRow label="Maximum marks" value={`${paper.totalMarks}`} />
                        <InfoRow label="Questions" value={`${paper.questionCount}`} />
                        <InfoRow label="Pattern" value={paper.patternName} />
                        <InfoRow label="Template" value={template.name} />
                        <InfoRow label="Created by" value={paper.createdBy} />
                        <InfoRow label="Created on" value={fmtDate(paper.createdDate)} />
                        {paper.approver && <InfoRow label="Approver" value={paper.approver} />}
                    </Panel>

                    {paper.status === "Rejected" && paper.rejectReason && (
                        <Box
                            sx={{
                                bgcolor: DASH.redLight, border: "1px solid #FECACA",
                                borderRadius: RADIUS, px: 1.8, py: 1.4, mb: 1.8,
                            }}
                        >
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#991B1B" }}>
                                Sent back by {paper.approver}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", color: "#991B1B", mt: 0.4, lineHeight: 1.6 }}>
                                {paper.rejectReason}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.8, py: 1.4, mb: 1.8 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={showAnswers}
                                    onChange={(e) => setShowAnswers(e.target.checked)}
                                    sx={{
                                        "& .Mui-checked": { color: DASH.green },
                                        "& .Mui-checked + .MuiSwitch-track": { backgroundColor: DASH.green },
                                    }}
                                />
                            }
                            label={<Typography sx={{ fontSize: "12.5px", color: DASH.text }}>Show the answer key</Typography>}
                        />
                        <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.4, lineHeight: 1.6 }}>
                            Download with this on to get the staff copy.
                        </Typography>
                    </Box>

                    {/* A sent-back paper is the only one that still needs to enter
                        the queue - everything else is already in it or past it. */}
                    {paper.status === "Rejected" && (
                        <Button
                            fullWidth
                            onClick={() => {
                                setPaper({ ...paper, status: "Pending", rejectReason: "" });
                                notify("Sent back for approval", true);
                            }}
                            startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
                            sx={primaryBtnSx}
                        >
                            Resubmit for Approval
                        </Button>
                    )}
                    {paper.status === "Approved" && (
                        <Button
                            fullWidth
                            onClick={() => { setPaper({ ...paper, status: "Published" }); notify("Question paper published", true); }}
                            startIcon={<RocketLaunchOutlinedIcon sx={{ fontSize: 16 }} />}
                            sx={{ ...primaryBtnSx, bgcolor: DASH.green, "&:hover": { bgcolor: "#059669" } }}
                        >
                            Publish
                        </Button>
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                    <Panel
                        title="Question Paper"
                        subtitle={`${template.name} - A4`}
                        accent={DASH.blue}
                        right={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <Tooltip
                                    arrow
                                    title={answerSpace
                                        ? "Ruled lines and work boxes are printed under each question"
                                        : "Questions only - students write on the answer booklet"}
                                >
                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={() => setAnswerSpace((v) => !v)}
                                        aria-pressed={answerSpace}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.7,
                                            height: 28,
                                            px: 1.2,
                                            cursor: "pointer",
                                            borderRadius: RADIUS,
                                            bgcolor: answerSpace ? DASH.blueLight : "#fff",
                                            border: `1px solid ${answerSpace ? DASH.blue : DASH.line}`,
                                            transition: "background-color 0.15s ease, border-color 0.15s ease",
                                            "&:hover": { borderColor: DASH.blue },
                                        }}
                                    >
                                        {answerSpace
                                            ? <NotesOutlinedIcon sx={{ fontSize: 15, color: DASH.blue }} />
                                            : <SubjectOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />}
                                        <Typography sx={{
                                            fontSize: "11.5px",
                                            fontWeight: 700,
                                            whiteSpace: "nowrap",
                                            color: answerSpace ? DASH.blue : DASH.text,
                                        }}>
                                            {answerSpace ? "With answer space" : "Questions only"}
                                        </Typography>
                                    </Box>
                                </Tooltip>

                                <Box sx={{ width: "1px", height: 20, bgcolor: DASH.line, mx: 0.4 }} />

                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, mr: 0.2 }}>
                                    Paper
                                </Typography>
                                {PAPER_COLORS.map((c) => {
                                    const active = paperColor === c.key;
                                    return (
                                        <Tooltip key={c.key} title={`${c.label} sheet`} arrow>
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() => setPaperColor(c.key)}
                                                aria-label={`${c.label} paper`}
                                                aria-pressed={active}
                                                sx={{
                                                    width: 22,
                                                    height: 22,
                                                    p: 0,
                                                    cursor: "pointer",
                                                    borderRadius: RADIUS,
                                                    bgcolor: c.hex,
                                                    border: active ? `2px solid ${DASH.blue}` : `1px solid ${DASH.faint}`,
                                                    boxShadow: active ? `0 0 0 2px ${DASH.blueLight}` : "none",
                                                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                                                }}
                                            />
                                        </Tooltip>
                                    );
                                })}
                                <Box sx={{ width: "1px", height: 20, bgcolor: DASH.line, mx: 0.6 }} />
                                <Tooltip title="Zoom out" arrow>
                                    <span>
                                        <IconButton
                                            size="small"
                                            disabled={zoom <= 0.5}
                                            onClick={() => setZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))}
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
                                            onClick={() => setZoom(Math.min(1.2, Math.round((zoom + 0.1) * 10) / 10))}
                                            sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, width: 28, height: 28 }}
                                        >
                                            <ZoomInIcon sx={{ fontSize: 16, color: DASH.text }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                        }
                        bodySx={{ p: 0 }}
                    >
                        <Box sx={{ bgcolor: "#EEF0F4", p: { xs: 1.5, md: 3 }, maxHeight: "74vh", overflow: "auto" }}>
                            <Box sx={{ zoom, width: 794, mx: "auto", boxShadow: "0 8px 30px rgba(17,24,39,0.18)" }}>
                                <PaperDocument
                                    paper={paper}
                                    pattern={pattern}
                                    questions={questions}
                                    templateId={paper.templateId}
                                    school={school}
                                    showAnswers={showAnswers}
                                    paperColor={paperColor}
                                    answerSpace={answerSpace}
                                />
                            </Box>
                        </Box>
                    </Panel>
                </Grid>
            </Grid>

            <Box sx={{ position: "fixed", left: -10000, top: 0, width: 794 }} aria-hidden>
                <PaperDocument
                    ref={printRef}
                    paper={paper}
                    pattern={pattern}
                    questions={questions}
                    templateId={paper.templateId}
                    school={school}
                    showAnswers={showAnswers}
                    paperColor={paperColor}
                    answerSpace={answerSpace}
                />
            </Box>
        </Box>
    );
}
