import React, { useCallback, useEffect, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Tabs, Tab, TextField, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import { DASH, RADIUS, KPI_TONES, SolidStatCard } from "../../DashBoardComps/dashboardTheme";
import { GetQuestionPaperApprovalDashboard, DecideQuestionPaper, GetQuestionPaperApprovalHistory } from "../../../Api/Api";
import { apiFailed } from "../../AcademicsComps/BooksChaptersComps/bookApi";
import { fmtDate } from "./questionPaperApi";
import { normalizeApprovalDashboard, normalizeApprovalHistory, fmtDateTime } from "./paperWizardApi";
import { StatusPill, Pill, fieldSx, outlineBtnSx, primaryBtnSx } from "./questionPaperTheme";
import { ApprovalHistory } from "./WizardSteps/ApprovalStep";

const token = "123";
const auth = { headers: { Authorization: `Bearer ${token}` } };

const TABS = [
    { key: "Pending", label: "Pending" },
    { key: "Approved", label: "Approved" },
    { key: "SentBack", label: "Sent Back" },
    { key: "Rejected", label: "Rejected" },
];

const EDGE_COLOR = {
    Pending: DASH.primary,
    Approved: DASH.green,
    SentBack: DASH.amber,
    Rejected: DASH.red,
};

const DECISIONS = {
    Approve: {
        title: "Approve this paper",
        blurb: "is signed off. This is final - no further decision can change it.",
        field: "Note for the teacher (optional)",
        confirm: "Approve",
        color: DASH.green,
        hover: "#059669",
        needsReason: false,
    },
    SentBack: {
        title: "Send this paper back",
        blurb: "goes back to the teacher to correct and submit again.",
        field: "What needs to change",
        confirm: "Send back",
        color: DASH.amber,
        hover: "#D97706",
        needsReason: true,
    },
    Reject: {
        title: "Reject this paper",
        blurb: "is closed for good. It cannot be submitted again - a new paper has to be built.",
        field: "Why it is being rejected",
        confirm: "Reject paper",
        color: DASH.red,
        hover: "#DC2626",
        needsReason: true,
    },
};

const Meta = ({ icon: Icon, label }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
        <Icon sx={{ fontSize: 13, color: DASH.faint }} />
        <Typography sx={{ fontSize: "11px", color: DASH.muted, whiteSpace: "nowrap" }}>{label}</Typography>
    </Box>
);

export default function QuestionPaperApprovalPage() {
    const navigate = useNavigate();
    const rollNumber = useSelector((state) => state.auth?.rollNumber);

    const [tab, setTab] = useState(0);
    const [papers, setPapers] = useState([]);
    const [counts, setCounts] = useState({ Pending: 0, Approved: 0, SentBack: 0, Rejected: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [denied, setDenied] = useState("");

    const [decision, setDecision] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [deciding, setDeciding] = useState(false);

    const [historyFor, setHistoryFor] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    const activeKey = TABS[tab].key;

    const load = useCallback((quiet = false) => {
        if (!quiet) setIsLoading(true);
        axios
            .get(GetQuestionPaperApprovalDashboard, { params: { status: activeKey, requestedByRollNumber: rollNumber }, ...auth })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { setDenied(rejected); setPapers([]); return; }
                setDenied("");
                const parsed = normalizeApprovalDashboard(res.data);
                setCounts(parsed.counts);
                setPapers(parsed.papers);
            })
            .catch((error) => {
                setPapers([]);
                const detail = error?.response?.data?.message || "";
                if (error?.response?.status === 400 || error?.response?.status === 403) setDenied(detail || "You are not set as an approver for question papers.");
                else notify(detail || "The approval queue could not be loaded");
            })
            .finally(() => setIsLoading(false));
    }, [activeKey, rollNumber]);

    useEffect(() => { load(); }, [load]);

    const openDecision = (paper, key) => { setDecision({ paper, key }); setRemarks(""); };
    const outcome = decision ? DECISIONS[decision.key] : null;

    const confirmDecision = () => {
        if (!decision) return;
        if (outcome.needsReason && !remarks.trim()) {
            notify(decision.key === "Reject" ? "Give a reason for rejecting" : "Tell the teacher what to fix");
            return;
        }
        setDeciding(true);
        axios
            .put(DecideQuestionPaper, {
                questionPaperId: decision.paper.id,
                action: decision.key,
                note: decision.key === "Approve" ? remarks.trim() : "",
                reason: decision.key === "Approve" ? "" : remarks.trim(),
                decidedByRollNumber: rollNumber,
            }, auth)
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify(
                    decision.key === "Approve" ? `"${decision.paper.name}" approved`
                        : decision.key === "SentBack" ? `"${decision.paper.name}" sent back to the teacher`
                            : `"${decision.paper.name}" rejected`,
                    true
                );
                setDecision(null);
                setRemarks("");
                load(true);
            })
            .catch((error) => notify(error?.response?.data?.message || "That decision could not be saved"))
            .finally(() => setDeciding(false));
    };

    const openHistory = (paper) => {
        setHistoryFor(paper);
        setHistory([]);
        setHistoryLoading(true);
        axios
            .get(GetQuestionPaperApprovalHistory, { params: { questionPaperId: paper.id, requestedByRollNumber: rollNumber }, ...auth })
            .then((res) => { if (!apiFailed(res.data)) setHistory(normalizeApprovalHistory(res.data)); })
            .catch(() => setHistory([]))
            .finally(() => setHistoryLoading(false));
    };

    const readPaper = (paper) => navigate(`/dashboardmenu/assessment/question-paper/${paper.id}`, { state: { review: true } });

    const tabLabel = (key) => TABS.find((t) => t.key === key)?.label || key;

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

            <Box
                sx={{
                    display: "flex", alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between", flexDirection: { xs: "column", md: "row" },
                    gap: 1.5, mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, minWidth: 0 }}>
                    <IconButton onClick={() => navigate("/dashboardmenu/approvals", { state: { tabId: "academics" } })} sx={{ mt: -0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                            Question Paper Approvals
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Read the paper before you sign it off. Send it back for changes, or reject it to close it for good.
                        </Typography>
                    </Box>
                </Box>

                <Tooltip title="Reload" arrow>
                    <IconButton
                        onClick={() => load()}
                        sx={{
                            border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff", ml: { xs: 5, md: 0 },
                            "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                        }}
                    >
                        <RefreshIcon sx={{ fontSize: 18, color: DASH.text }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {denied ? (
                <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 7, px: 3, textAlign: "center" }}>
                    <LockOutlinedIcon sx={{ fontSize: 42, color: DASH.line }} />
                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                        You are not an approver for question papers
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5, maxWidth: 520, mx: "auto", lineHeight: 1.7 }}>
                        {denied} Approvers are set under Access Control - Approval Flows - Question Paper.
                    </Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <SolidStatCard icon={PendingActionsOutlinedIcon} label="Waiting on you" value={counts.Pending} note="Papers to review" tone={KPI_TONES.orange} onClick={() => setTab(0)} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <SolidStatCard icon={CheckCircleOutlineIcon} label="Approved" value={counts.Approved} note="Signed off" tone={KPI_TONES.green} onClick={() => setTab(1)} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <SolidStatCard icon={ReplayOutlinedIcon} label="Sent back" value={counts.SentBack} note="Waiting on the teacher" tone={KPI_TONES.violet} onClick={() => setTab(2)} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <SolidStatCard icon={CancelOutlinedIcon} label="Rejected" value={counts.Rejected} note="Closed, not reworked" tone={KPI_TONES.pink} onClick={() => setTab(3)} />
                        </Grid>
                    </Grid>

                    <Box sx={{ bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, mb: 2, px: 1 }}>
                        <Tabs
                            value={tab}
                            onChange={(e, v) => setTab(v)}
                            variant="scrollable"
                            sx={{
                                minHeight: 44,
                                "& .MuiTab-root": {
                                    textTransform: "none", fontSize: "12.5px", fontWeight: 600,
                                    minHeight: 44, color: DASH.muted, px: 1.6,
                                    "&.Mui-selected": { color: DASH.ink },
                                },
                                "& .MuiTabs-indicator": { backgroundColor: DASH.primary, height: 2.5 },
                            }}
                        >
                            {TABS.map((t) => (
                                <Tab
                                    key={t.key}
                                    label={
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                            {t.label}
                                            <Box sx={{ minWidth: 20, px: 0.6, py: 0.1, borderRadius: RADIUS, bgcolor: DASH.lineSoft, color: DASH.muted, fontSize: "10.5px", fontWeight: 700 }}>
                                                {counts[t.key]}
                                            </Box>
                                        </Box>
                                    }
                                />
                            ))}
                        </Tabs>
                    </Box>

                    {papers.length === 0 ? (
                        <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 7, px: 3, textAlign: "center" }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 42, color: DASH.line }} />
                            <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                                Nothing in {tabLabel(activeKey).toLowerCase()}
                            </Typography>
                            <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5 }}>
                                {activeKey === "Pending" ? "Papers land here as soon as a teacher sends one for approval." : "No paper has reached this state yet."}
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={1.8}>
                            {papers.map((paper) => {
                                const own = paper.submittedByRollNumber && String(paper.submittedByRollNumber) === String(rollNumber);
                                const note = paper.reason || paper.note;
                                return (
                                    <Grid key={paper.id} size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                                        <Box
                                            sx={{
                                                bgcolor: "#fff", border: `1px solid ${DASH.line}`,
                                                borderLeft: `3px solid ${EDGE_COLOR[paper.approvalStatus || activeKey] || DASH.line}`,
                                                borderRadius: RADIUS, height: "100%", boxSizing: "border-box",
                                                display: "flex", flexDirection: "column", overflow: "hidden",
                                                transition: "box-shadow .2s ease",
                                                "&:hover": { boxShadow: "0 8px 22px rgba(17,24,39,0.10)" },
                                            }}
                                        >
                                            <Box sx={{ p: 1.8, flex: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink, lineHeight: 1.35 }}>
                                                            {paper.name}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.3 }}>
                                                            {paper.academicYear}{paper.qpCode ? ` - Q.P. ${paper.qpCode}` : ""}
                                                        </Typography>
                                                    </Box>
                                                    <StatusPill status={tabLabel(paper.approvalStatus || activeKey)} />
                                                </Box>

                                                <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 1.3 }}>
                                                    <Pill label={paper.grade} color={DASH.text} bg={DASH.lineSoft} />
                                                    <Pill label={paper.subject} color={DASH.blue} bg={DASH.blueLight} border="#BFDBFE" />
                                                    {paper.totalMarks > 0 && <Pill label={`${paper.totalMarks} marks`} color={DASH.ink} bg={DASH.primaryLight} border={DASH.primaryBorder} />}
                                                    {paper.medium && <Pill label={paper.medium} color={DASH.muted} bg={DASH.lineSoft} />}
                                                    {paper.sentBackCount > 0 && <Pill label={`Sent back ${paper.sentBackCount}x`} color="#B45309" bg={DASH.amberLight} border="#FDE68A" />}
                                                    {own && <Pill label="Your own paper" color={DASH.violet} bg={DASH.violetLight} border="#DDD6FE" />}
                                                </Box>

                                                <Box sx={{ display: "flex", gap: 1.4, flexWrap: "wrap", mt: 1.3 }}>
                                                    {paper.submittedBy && <Meta icon={PersonOutlineOutlinedIcon} label={paper.submittedBy} />}
                                                    {paper.submittedOn && <Meta icon={EventOutlinedIcon} label={`Sent ${fmtDateTime(paper.submittedOn)}`} />}
                                                    {!paper.submittedOn && paper.examDate && <Meta icon={EventOutlinedIcon} label={fmtDate(paper.examDate)} />}
                                                    {paper.durationMinutes > 0 && <Meta icon={TimerOutlinedIcon} label={`${paper.durationMinutes} min`} />}
                                                    {paper.patternName && <Meta icon={DashboardCustomizeOutlinedIcon} label={paper.patternName} />}
                                                </Box>

                                                {note && activeKey !== "Pending" && (
                                                    <Box
                                                        sx={{
                                                            mt: 1.3, px: 1.2, py: 0.9, borderRadius: RADIUS,
                                                            bgcolor: activeKey === "SentBack" ? DASH.amberLight : activeKey === "Rejected" ? DASH.redLight : DASH.greenLight,
                                                            border: `1px solid ${activeKey === "SentBack" ? "#FDE68A" : activeKey === "Rejected" ? "#FECACA" : "#BBF7D0"}`,
                                                        }}
                                                    >
                                                        <Typography sx={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: activeKey === "SentBack" ? "#B45309" : activeKey === "Rejected" ? "#991B1B" : "#065F46", mb: 0.3 }}>
                                                            {activeKey === "SentBack" ? "TO FIX" : activeKey === "Rejected" ? "REASON" : "NOTE"}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "11.5px", lineHeight: 1.55, color: activeKey === "SentBack" ? "#92400E" : activeKey === "Rejected" ? "#991B1B" : "#065F46" }}>
                                                            {note}
                                                        </Typography>
                                                        {paper.decidedBy && (
                                                            <Typography sx={{ fontSize: "10.5px", color: DASH.muted, mt: 0.4 }}>
                                                                - {paper.decidedBy}{paper.decidedOn ? `, ${fmtDateTime(paper.decidedOn)}` : ""}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap", px: 1.8, py: 1.2, borderTop: `1px solid ${DASH.lineSoft}`, bgcolor: "#FCFCFD" }}>
                                                <Tooltip title="Read paper" arrow>
                                                    <IconButton
                                                        onClick={() => readPaper(paper)}
                                                        sx={{ width: 30, height: 30, borderRadius: RADIUS, flexShrink: 0, border: `1px solid ${DASH.line}`, bgcolor: "#fff", "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder } }}
                                                    >
                                                        <VisibilityOutlinedIcon sx={{ fontSize: 16, color: DASH.text }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Approval history" arrow>
                                                    <IconButton
                                                        onClick={() => openHistory(paper)}
                                                        sx={{ width: 30, height: 30, borderRadius: RADIUS, flexShrink: 0, border: `1px solid ${DASH.line}`, bgcolor: "#fff", "&:hover": { bgcolor: DASH.violetLight, borderColor: "#DDD6FE" } }}
                                                    >
                                                        <HistoryOutlinedIcon sx={{ fontSize: 16, color: DASH.violet }} />
                                                    </IconButton>
                                                </Tooltip>

                                                {activeKey === "Pending" && (
                                                    own ? (
                                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, ml: "auto" }}>
                                                            Someone else has to approve your own paper
                                                        </Typography>
                                                    ) : (
                                                        <>
                                                            <Tooltip title="Back to the teacher to correct and resubmit" arrow>
                                                                <Button
                                                                    onClick={() => openDecision(paper, "SentBack")}
                                                                    startIcon={<ReplayOutlinedIcon sx={{ fontSize: 15 }} />}
                                                                    sx={{ ...outlineBtnSx, height: 30, py: 0, fontSize: "11.5px", color: "#B45309", borderColor: "#FDE68A" }}
                                                                >
                                                                    Send back
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip title="Close this paper - it cannot be resubmitted" arrow>
                                                                <Button
                                                                    onClick={() => openDecision(paper, "Reject")}
                                                                    startIcon={<CancelOutlinedIcon sx={{ fontSize: 15 }} />}
                                                                    sx={{ ...outlineBtnSx, height: 30, py: 0, fontSize: "11.5px", color: DASH.red, borderColor: "#FECACA" }}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </Tooltip>
                                                            <Button
                                                                onClick={() => openDecision(paper, "Approve")}
                                                                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />}
                                                                sx={{ ...primaryBtnSx, height: 30, py: 0, fontSize: "11.5px", ml: "auto", bgcolor: DASH.green, "&:hover": { bgcolor: "#059669" } }}
                                                            >
                                                                Approve
                                                            </Button>
                                                        </>
                                                    )
                                                )}
                                            </Box>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </>
            )}

            <Dialog open={Boolean(decision)} onClose={() => !deciding && setDecision(null)} slotProps={{ paper: { sx: { borderRadius: RADIUS, width: 460 } } }}>
                <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>{outcome?.title}</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mb: 1.6, lineHeight: 1.6 }}>
                        "{decision?.paper?.name}" {outcome?.blurb}
                        {decision?.key === "SentBack" && decision?.paper?.submittedBy ? ` ${decision.paper.submittedBy} sees your note on the paper.` : ""}
                    </Typography>
                    <TextField
                        fullWidth multiline minRows={3} size="small"
                        label={outcome?.field}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        sx={fieldSx}
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

            <Dialog open={Boolean(historyFor)} onClose={() => setHistoryFor(null)} slotProps={{ paper: { sx: { borderRadius: RADIUS, width: 520 } } }}>
                <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>
                    Approval history - {historyFor?.name}
                </DialogTitle>
                <DialogContent>
                    <ApprovalHistory history={history} loading={historyLoading} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setHistoryFor(null)} sx={outlineBtnSx}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
