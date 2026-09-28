import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Switch, FormControlLabel, Tooltip, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, MenuItem,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import SubjectOutlinedIcon from "@mui/icons-material/SubjectOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import { DASH, RADIUS, SOFT, Panel } from "../../DashBoardComps/dashboardTheme";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { GetQuestionPaper, GetGeneratedQuestions, GetQuestionPaperApprovalHistory, DecideQuestionPaper } from "../../../Api/Api";
import { apiFailed } from "../../AcademicsComps/BooksChaptersComps/bookApi";
import { fmtDate, withSectionDefaults } from "./questionPaperApi";
import { normalizePaperDetail, normalizeGeneratedPaper, normalizeApprovalHistory, statusFromHistory, fmtDateTime } from "./paperWizardApi";
import PaperDocument, {
    PAPER_TEMPLATES, templateById, PAPER_COLORS, PAPER_SIZES, DEFAULT_PAPER_COLOR, DEFAULT_PAPER_SIZE,
    paperSizeOf, printPaperNode, exportPaperPdf, printedSheetHex,
} from "./paperTemplates";
import { outlineBtnSx, softBtnSx, primaryBtnSx, fieldSx, Pill } from "./questionPaperTheme";
import { ApprovalHistory, approvalMeta } from "./WizardSteps/ApprovalStep";

const token = "123";
const auth = { headers: { Authorization: `Bearer ${token}` } };

const DECISIONS = {
    Approve: { title: "Approve this paper", field: "Note for the teacher (optional)", confirm: "Approve", color: DASH.green, hover: "#059669", needsReason: false },
    SentBack: { title: "Send this paper back", field: "What needs to change", confirm: "Send back", color: DASH.amber, hover: "#D97706", needsReason: true },
    Reject: { title: "Reject this paper", field: "Why it is being rejected", confirm: "Reject paper", color: DASH.red, hover: "#DC2626", needsReason: true },
};

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
    const rollNumber = useSelector((state) => state.auth?.rollNumber);
    const reviewMode = Boolean(location.state?.review);

    const [paper, setPaper] = useState(null);
    const [pattern, setPattern] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [missing, setMissing] = useState("");

    const [templateId, setTemplateId] = useState("cbse");
    const [showAnswers, setShowAnswers] = useState(false);
    const [zoom, setZoom] = useState(0.8);
    const [paperColor, setPaperColor] = useState(DEFAULT_PAPER_COLOR);
    const [paperSize, setPaperSize] = useState(DEFAULT_PAPER_SIZE);
    const [printColor, setPrintColor] = useState(false);
    const [answerSpace, setAnswerSpace] = useState(false);
    const [pages, setPages] = useState(1);
    const size = paperSizeOf(paperSize);
    const printHex = printedSheetHex(paperColor, printColor);

    const [decision, setDecision] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [deciding, setDeciding] = useState(false);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const printRef = useRef(null);

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    const loadHistory = useCallback(() => {
        setHistoryLoading(true);
        axios
            .get(GetQuestionPaperApprovalHistory, { params: { questionPaperId: paperId, requestedByRollNumber: rollNumber }, ...auth })
            .then((res) => { if (!apiFailed(res.data)) setHistory(normalizeApprovalHistory(res.data)); })
            .catch(() => setHistory([]))
            .finally(() => setHistoryLoading(false));
    }, [paperId, rollNumber]);

    const load = useCallback(() => {
        setIsLoading(true);
        setMissing("");
        Promise.all([
            axios.get(GetQuestionPaper, { params: { questionPaperId: paperId, requestedByRollNumber: rollNumber }, ...auth }),
            axios
                .get(GetGeneratedQuestions, { params: { questionPaperId: paperId, requestedByRollNumber: rollNumber }, ...auth })
                .catch(() => null),
        ])
            .then(([paperRes, questionRes]) => {
                const rejected = apiFailed(paperRes.data);
                if (rejected) { setMissing(rejected); return; }
                const detail = normalizePaperDetail(paperRes.data);
                setPaper(detail);

                if (questionRes && !apiFailed(questionRes.data)) {
                    const parsed = normalizeGeneratedPaper(questionRes.data);
                    setPattern({
                        id: detail.id,
                        name: detail.patternName,
                        subject: detail.subject,
                        totalMarks: detail.totalMarks,
                        durationMinutes: detail.durationMinutes,
                        sections: parsed.sections.map(withSectionDefaults),
                    });
                    setQuestions(parsed.questions);
                } else {
                    setPattern(null);
                    setQuestions([]);
                }
            })
            .catch((error) => setMissing(error?.response?.data?.message || "This paper could not be found."))
            .finally(() => setIsLoading(false));
        loadHistory();
    }, [paperId, rollNumber, loadHistory]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (!paper || paper.approvalStatus || !history.length) return;
        const derived = statusFromHistory(history);
        if (derived) setPaper((prev) => ({ ...prev, approvalStatus: derived }));
    }, [paper, history]);

    const paperMeta = useMemo(() => (paper ? {
        name: paper.paperName,
        grade: paper.grade,
        subject: paper.subject,
        examName: "",
        examDate: paper.examDate,
        academicYear: paper.academicYear,
        durationMinutes: paper.durationMinutes,
        totalMarks: paper.totalMarks,
        medium: paper.medium,
        paperCode: paper.qpCode,
        notes: paper.notes,
        questionCount: questions.length,
    } : null), [paper, questions.length]);

    const school = { name: paper?.schoolName || websiteSettings?.title, address: "", logo: paper?.schoolLogo };

    const downloadPdf = () => {
        if (!printRef.current) return;
        exportPaperPdf(printRef.current, {
            filename: `${paper?.paperName || "question-paper"}${showAnswers ? "-answer-key" : ""}.pdf`,
            sizeKey: paperSize,
            sheetHex: printHex,
        });
        notify("Preparing the PDF", true);
    };

    const printPaper = () => {
        if (!printPaperNode(printRef.current, paper?.paperName, { sheetHex: printHex, sizeKey: paperSize })) {
            notify("Allow pop-ups to print the paper");
        }
    };

    const outcome = decision ? DECISIONS[decision] : null;

    const confirmDecision = () => {
        if (!decision) return;
        if (outcome.needsReason && !remarks.trim()) {
            notify(decision === "Reject" ? "Give a reason for rejecting" : "Tell the teacher what to fix");
            return;
        }
        setDeciding(true);
        axios
            .put(DecideQuestionPaper, {
                questionPaperId: paper.id,
                action: decision,
                note: decision === "Approve" ? remarks.trim() : "",
                reason: decision === "Approve" ? "" : remarks.trim(),
                decidedByRollNumber: rollNumber,
            }, auth)
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify(decision === "Approve" ? "Paper approved" : decision === "SentBack" ? "Sent back to the teacher" : "Paper rejected", true);
                setDecision(null);
                setRemarks("");
                load();
            })
            .catch((error) => notify(error?.response?.data?.message || "That decision could not be saved"))
            .finally(() => setDeciding(false));
    };

    if (isLoading) return <Loader />;

    if (!paper) {
        return (
            <Box sx={{ p: 3, bgcolor: DASH.canvas, minHeight: "100%" }}>
                <Typography sx={{ fontSize: "14px", color: DASH.muted }}>
                    {missing || "This paper could not be found."}
                    <Button onClick={() => navigate("/dashboardmenu/assessment/question-paper/all")} sx={{ ...outlineBtnSx, ml: 1 }}>
                        Back to all papers
                    </Button>
                </Typography>
            </Box>
        );
    }

    const template = templateById(templateId);
    const meta = approvalMeta(paper.approvalStatus);
    const editable = !["Pending", "Approved", "Rejected"].includes(paper.approvalStatus);
    const canDecide = reviewMode && paper.approvalStatus === "Pending" && String(paper.createdByRollNumber) !== String(rollNumber);
    const latest = history.length ? history[history.length - 1] : null;

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
                                {paper.paperName}
                            </Typography>
                            <Pill label={paper.approvalStatus ? meta.label : paper.status} color={meta.color} bg={meta.bg} border={meta.border} />
                        </Box>
                        <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.2 }}>
                            {paper.grade} · {paper.subject} · {paper.academicYear}{paper.medium ? ` · ${paper.medium} medium` : ""}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 }, flexWrap: "wrap" }}>
                    {editable && (
                        <Button
                            onClick={() => navigate(`/dashboardmenu/assessment/question-paper/create/${paper.id}`, { state: { paperId: paper.id } })}
                            startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={softBtnSx(SOFT.purple)}
                        >
                            Open in the builder
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

            {canDecide && (
                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap",
                        bgcolor: DASH.primaryLight, border: `1px solid ${DASH.primaryBorder}`, borderRadius: RADIUS,
                        px: 2, py: 1.3, mb: 2,
                    }}
                >
                    <Typography sx={{ fontSize: "12.5px", color: "#92400E", flex: 1, minWidth: 200 }}>
                        <strong>Waiting on your decision.</strong> Read the paper below, then approve it, send it back with a note, or reject it.
                    </Typography>
                    <Button onClick={() => { setDecision("SentBack"); setRemarks(""); }} startIcon={<ReplayOutlinedIcon sx={{ fontSize: 15 }} />} sx={{ ...outlineBtnSx, color: "#B45309", borderColor: "#FDE68A", bgcolor: "#fff" }}>
                        Send back
                    </Button>
                    <Button onClick={() => { setDecision("Reject"); setRemarks(""); }} startIcon={<CancelOutlinedIcon sx={{ fontSize: 15 }} />} sx={{ ...outlineBtnSx, color: DASH.red, borderColor: "#FECACA", bgcolor: "#fff" }}>
                        Reject
                    </Button>
                    <Button onClick={() => { setDecision("Approve"); setRemarks(""); }} startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />} sx={{ ...primaryBtnSx, bgcolor: DASH.green, "&:hover": { bgcolor: "#059669" } }}>
                        Approve
                    </Button>
                </Box>
            )}

            <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <Panel title="Paper Details" subtitle="Saved with this paper" accent={DASH.primary} sx={{ mb: 1.8 }}>
                        <InfoRow label="Class" value={paper.grade} />
                        <InfoRow label="Subject" value={paper.subject} />
                        <InfoRow label="Sections" value={(paper.sections || []).length ? paper.sections.join(", ") : "All"} />
                        <InfoRow label="Exam date" value={paper.examDate ? fmtDate(paper.examDate) : ""} />
                        <InfoRow label="Academic year" value={paper.academicYear} />
                        <InfoRow label="Medium" value={paper.medium} />
                        <InfoRow label="Duration" value={paper.durationMinutes ? `${paper.durationMinutes} minutes` : ""} />
                        <InfoRow label="Maximum marks" value={paper.totalMarks ? `${paper.totalMarks}` : ""} />
                        <InfoRow label="Questions" value={`${questions.length}`} />
                        <InfoRow label="Pattern" value={paper.patternName} />
                        <InfoRow label="Q.P. code" value={paper.qpCode} />
                        <InfoRow label="Created by" value={paper.createdByName || paper.createdByRollNumber} />
                        <InfoRow label="Created on" value={fmtDateTime(paper.createdOn)} />
                        {paper.sentBackCount > 0 && <InfoRow label="Sent back" value={`${paper.sentBackCount} time${paper.sentBackCount > 1 ? "s" : ""}`} />}
                    </Panel>

                    {latest && (paper.approvalStatus === "SentBack" || paper.approvalStatus === "Rejected") && latest.note && (
                        <Box sx={{ bgcolor: meta.bg, border: `1px solid ${meta.border}`, borderRadius: RADIUS, px: 1.8, py: 1.4, mb: 1.8 }}>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: meta.color }}>
                                {meta.label}{latest.by ? ` by ${latest.by}` : ""}
                            </Typography>
                            <Typography sx={{ fontSize: "12px", mt: 0.4, lineHeight: 1.6, color: DASH.ink }}>{latest.note}</Typography>
                            {paper.approvalStatus === "Rejected" && (
                                <Typography sx={{ fontSize: "11.5px", color: "#991B1B", mt: 0.8, fontWeight: 600 }}>
                                    This paper is closed. Build a new one to try again.
                                </Typography>
                            )}
                        </Box>
                    )}

                    <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.8, py: 1.4, mb: 1.8 }}>
                        <TextField
                            select fullWidth size="small" label="Print template"
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            sx={{ ...fieldSx, mb: 1.2 }}
                        >
                            {PAPER_TEMPLATES.map((t) => (
                                <MenuItem key={t.id} value={t.id} sx={{ fontSize: "13px" }}>{t.name}</MenuItem>
                            ))}
                        </TextField>
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={showAnswers}
                                    onChange={(e) => setShowAnswers(e.target.checked)}
                                    sx={{ "& .Mui-checked": { color: DASH.green }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: DASH.green } }}
                                />
                            }
                            label={<Typography sx={{ fontSize: "12.5px", color: DASH.text }}>Show the answer key</Typography>}
                        />
                        <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.4, lineHeight: 1.6 }}>
                            Download with this on to get the staff copy.
                        </Typography>
                    </Box>

                    <Panel title="Approval History" subtitle="Oldest first" accent={DASH.violet} right={<HistoryOutlinedIcon sx={{ fontSize: 18, color: DASH.faint }} />}>
                        <ApprovalHistory history={history} loading={historyLoading} />
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                    <Panel
                        title="Question Paper"
                        subtitle={`${template.name} - ${size.label} - ${pages} page${pages === 1 ? "" : "s"}`}
                        accent={DASH.blue}
                        right={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <Tooltip arrow title={answerSpace ? "Ruled lines and work boxes are printed under each question" : "Questions only - students write on the answer booklet"}>
                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={() => setAnswerSpace((v) => !v)}
                                        aria-pressed={answerSpace}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 0.7, height: 28, px: 1.2, cursor: "pointer",
                                            borderRadius: RADIUS, bgcolor: answerSpace ? DASH.blueLight : "#fff",
                                            border: `1px solid ${answerSpace ? DASH.blue : DASH.line}`,
                                            "&:hover": { borderColor: DASH.blue },
                                        }}
                                    >
                                        {answerSpace
                                            ? <NotesOutlinedIcon sx={{ fontSize: 15, color: DASH.blue }} />
                                            : <SubjectOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />}
                                        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, whiteSpace: "nowrap", color: answerSpace ? DASH.blue : DASH.text }}>
                                            {answerSpace ? "With answer space" : "Questions only"}
                                        </Typography>
                                    </Box>
                                </Tooltip>

                                <Box sx={{ width: "1px", height: 20, bgcolor: DASH.line, mx: 0.4 }} />

                                <TextField
                                    select
                                    size="small"
                                    value={paperSize}
                                    onChange={(e) => setPaperSize(e.target.value)}
                                    sx={{ width: 96, "& .MuiInputBase-root": { height: 28, fontSize: "11.5px", fontWeight: 700 } }}
                                >
                                    {PAPER_SIZES.map((s) => (
                                        <MenuItem key={s.key} value={s.key} sx={{ fontSize: "12px" }}>{s.label} - {s.hint}</MenuItem>
                                    ))}
                                </TextField>
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, mr: 0.2 }}>Paper</Typography>
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
                                                    width: 22, height: 22, p: 0, cursor: "pointer", borderRadius: RADIUS, bgcolor: c.hex,
                                                    border: active ? `2px solid ${DASH.blue}` : `1px solid ${DASH.faint}`,
                                                    boxShadow: active ? `0 0 0 2px ${DASH.blueLight}` : "none",
                                                }}
                                            />
                                        </Tooltip>
                                    );
                                })}
                                {paperColor !== "white" && (
                                    <Tooltip
                                        arrow
                                        title={printColor
                                            ? "The tint is printed on white paper - uses a lot of toner"
                                            : "Preview only - load coloured paper; the printout stays ink-free"}
                                    >
                                        <FormControlLabel
                                            sx={{ m: 0, ml: 0.4 }}
                                            control={<Switch size="small" checked={printColor} onChange={(e) => setPrintColor(e.target.checked)} />}
                                            label={<Typography sx={{ fontSize: "11px", fontWeight: 700, color: DASH.muted, whiteSpace: "nowrap" }}>Print colour</Typography>}
                                        />
                                    </Tooltip>
                                )}
                                <Box sx={{ width: "1px", height: 20, bgcolor: DASH.line, mx: 0.6 }} />
                                <Tooltip title="Zoom out" arrow>
                                    <span>
                                        <IconButton size="small" disabled={zoom <= 0.5} onClick={() => setZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))} sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, width: 28, height: 28 }}>
                                            <ZoomOutIcon sx={{ fontSize: 16, color: DASH.text }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: DASH.muted, width: 38, textAlign: "center" }}>
                                    {Math.round(zoom * 100)}%
                                </Typography>
                                <Tooltip title="Zoom in" arrow>
                                    <span>
                                        <IconButton size="small" disabled={zoom >= 1.2} onClick={() => setZoom(Math.min(1.2, Math.round((zoom + 0.1) * 10) / 10))} sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, width: 28, height: 28 }}>
                                            <ZoomInIcon sx={{ fontSize: 16, color: DASH.text }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                        }
                        bodySx={{ p: 0 }}
                    >
                        {!pattern || questions.length === 0 ? (
                            <Box sx={{ py: 7, px: 3, textAlign: "center" }}>
                                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASH.ink }}>No questions yet</Typography>
                                <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5 }}>
                                    This paper is still at step {paper.currentStep} of the builder. The preview appears once the questions are generated.
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ bgcolor: "#EEF0F4", p: { xs: 1.5, md: 3 }, maxHeight: "74vh", overflow: "auto" }}>
                                <Box sx={{ zoom, width: size.width, mx: "auto", boxShadow: "0 8px 30px rgba(17,24,39,0.18)" }}>
                                    <PaperDocument
                                        paper={paperMeta}
                                        pattern={pattern}
                                        questions={questions}
                                        templateId={templateId}
                                        school={school}
                                        showAnswers={showAnswers}
                                        paperColor={paperColor}
                                        paperSize={paperSize}
                                        pageGuides
                                        onPages={setPages}
                                        answerSpace={answerSpace}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Panel>
                </Grid>
            </Grid>

            <Box sx={{ position: "fixed", left: -10000, top: 0, width: size.width }} aria-hidden>
                <PaperDocument
                    ref={printRef}
                    paper={paperMeta}
                    pattern={pattern}
                    questions={questions}
                    templateId={templateId}
                    school={school}
                    showAnswers={showAnswers}
                    paperColor={printColor ? paperColor : "white"}
                    paperSize={paperSize}
                    answerSpace={answerSpace}
                />
            </Box>

            <Dialog open={Boolean(decision)} onClose={() => !deciding && setDecision(null)} slotProps={{ paper: { sx: { borderRadius: RADIUS, width: 460 } } }}>
                <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>{outcome?.title}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth multiline minRows={3} size="small"
                        label={outcome?.field}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        sx={{ ...fieldSx, mt: 0.5 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDecision(null)} disabled={deciding} sx={outlineBtnSx}>Cancel</Button>
                    <Button
                        onClick={confirmDecision}
                        disabled={deciding}
                        startIcon={deciding ? <CircularProgress size={13} sx={{ color: "#fff" }} /> : null}
                        sx={{ ...primaryBtnSx, bgcolor: outcome?.color, "&:hover": { bgcolor: outcome?.hover } }}
                    >
                        {deciding ? "Saving..." : outcome?.confirm}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
