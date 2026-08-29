import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Tabs, Tab, TextField, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import { DASH, RADIUS, KPI_TONES, SolidStatCard } from "../../DashBoardComps/dashboardTheme";
import { MOCK_PAPERS, fmtDate } from "./questionPaperApi";
import { StatusPill, Pill, fieldSx, outlineBtnSx, primaryBtnSx } from "./questionPaperTheme";

const TABS = ["Pending", "Approved", "Rejected"];

const Meta = ({ icon: Icon, label }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
        <Icon sx={{ fontSize: 13, color: DASH.faint }} />
        <Typography sx={{ fontSize: "11px", color: DASH.muted, whiteSpace: "nowrap" }}>{label}</Typography>
    </Box>
);

export default function QuestionPaperApprovalPage() {
    const navigate = useNavigate();

    const [papers, setPapers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState(0);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    /* Mock source. Replace with GET qpaper/approvalRequests. */
    const load = useCallback(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setPapers(MOCK_PAPERS.filter((p) => ["Pending", "Approved", "Rejected"].includes(p.status)));
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => { load(); }, [load]);

    const counts = useMemo(() => ({
        Pending: papers.filter((p) => p.status === "Pending").length,
        Approved: papers.filter((p) => p.status === "Approved").length,
        Rejected: papers.filter((p) => p.status === "Rejected").length,
    }), [papers]);

    const filtered = useMemo(
        () => papers.filter((p) => p.status === TABS[tab]),
        [papers, tab]
    );

    /* Replace with POST qpaper/updateApproval { paperId, status, remarks }. */
    const setPaperStatus = (paper, next, remarks = "") => {
        setPapers((prev) => prev.map((p) => (
            p.id === paper.id ? { ...p, status: next, rejectReason: remarks } : p
        )));
    };

    const approve = (paper) => {
        setPaperStatus(paper, "Approved");
        notify(`"${paper.name}" approved`, true);
    };

    const publish = (paper) => {
        setPaperStatus(paper, "Published");
        setPapers((prev) => prev.filter((p) => p.id !== paper.id));
        notify(`"${paper.name}" published`, true);
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) { notify("Tell the teacher what to fix"); return; }
        setPaperStatus(rejectTarget, "Rejected", rejectReason.trim());
        notify(`"${rejectTarget.name}" sent back`, true);
        setRejectTarget(null);
        setRejectReason("");
    };

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
                    <IconButton
                        onClick={() => navigate("/dashboardmenu/approvals", { state: { tabId: "academics" } })}
                        sx={{ mt: -0.5 }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                            Question Paper Approvals
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Read the paper before you sign it off. Approved papers can then be published.
                        </Typography>
                    </Box>
                </Box>

                <Tooltip title="Reload" arrow>
                    <IconButton
                        onClick={load}
                        sx={{
                            border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff", ml: { xs: 5, md: 0 },
                            "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                        }}
                    >
                        <RefreshIcon sx={{ fontSize: 18, color: DASH.text }} />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                    <SolidStatCard
                        icon={PendingActionsOutlinedIcon}
                        label="Waiting on you"
                        value={counts.Pending}
                        note="Papers to review"
                        tone={KPI_TONES.orange}
                        onClick={() => setTab(0)}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                    <SolidStatCard
                        icon={CheckCircleOutlineIcon}
                        label="Approved"
                        value={counts.Approved}
                        note="Ready to publish"
                        tone={KPI_TONES.green}
                        onClick={() => setTab(1)}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                    <SolidStatCard
                        icon={CancelOutlinedIcon}
                        label="Sent back"
                        value={counts.Rejected}
                        note="Waiting on the teacher"
                        tone={KPI_TONES.pink}
                        onClick={() => setTab(2)}
                    />
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
                            key={t}
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                    {t}
                                    <Box
                                        sx={{
                                            minWidth: 20, px: 0.6, py: 0.1, borderRadius: RADIUS,
                                            bgcolor: DASH.lineSoft, color: DASH.muted, fontSize: "10.5px", fontWeight: 700,
                                        }}
                                    >
                                        {counts[t]}
                                    </Box>
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Box>

            {filtered.length === 0 ? (
                <Box sx={{ bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS, py: 7, px: 3, textAlign: "center" }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 42, color: DASH.line }} />
                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                        Nothing in {TABS[tab].toLowerCase()}
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5 }}>
                        Papers land here as soon as a teacher requests approval.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={1.8}>
                    {filtered.map((paper) => (
                        <Grid key={paper.id} size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                            <Box
                                sx={{
                                    bgcolor: "#fff", border: `1px solid ${DASH.line}`,
                                    borderLeft: `3px solid ${paper.status === "Pending" ? DASH.primary : paper.status === "Approved" ? DASH.green : DASH.red}`,
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
                                                {paper.examName} - by {paper.createdBy}
                                            </Typography>
                                        </Box>
                                        <StatusPill status={paper.status} />
                                    </Box>

                                    <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 1.3 }}>
                                        <Pill label={paper.grade} color={DASH.text} bg={DASH.lineSoft} />
                                        <Pill label={paper.subject} color={DASH.blue} bg={DASH.blueLight} border="#BFDBFE" />
                                        <Pill label={`${paper.totalMarks} marks`} color={DASH.ink} bg={DASH.primaryLight} border={DASH.primaryBorder} />
                                    </Box>

                                    <Box sx={{ display: "flex", gap: 1.4, flexWrap: "wrap", mt: 1.3 }}>
                                        <Meta icon={HelpOutlineOutlinedIcon} label={`${paper.questionCount} questions`} />
                                        <Meta icon={EventOutlinedIcon} label={fmtDate(paper.examDate)} />
                                        <Meta icon={DashboardCustomizeOutlinedIcon} label={paper.patternName} />
                                    </Box>

                                    {paper.status === "Rejected" && paper.rejectReason && (
                                        <Box sx={{ mt: 1.3, px: 1.2, py: 0.9, borderRadius: RADIUS, bgcolor: DASH.redLight, border: "1px solid #FECACA" }}>
                                            <Typography sx={{ fontSize: "11.5px", color: "#991B1B", lineHeight: 1.55 }}>
                                                {paper.rejectReason}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap",
                                        px: 1.8, py: 1.2, borderTop: `1px solid ${DASH.lineSoft}`, bgcolor: "#FCFCFD",
                                    }}
                                >
                                    <Button
                                        onClick={() => navigate(`/dashboardmenu/assessment/question-paper/${paper.id}`, { state: { paper } })}
                                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                                        sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px" }}
                                    >
                                        Read paper
                                    </Button>

                                    {paper.status === "Pending" && (
                                        <>
                                            <Button
                                                onClick={() => { setRejectTarget(paper); setRejectReason(""); }}
                                                startIcon={<CancelOutlinedIcon sx={{ fontSize: 15 }} />}
                                                sx={{ ...outlineBtnSx, py: 0.3, fontSize: "11.5px", color: DASH.red, borderColor: "#FECACA" }}
                                            >
                                                Send back
                                            </Button>
                                            <Button
                                                onClick={() => approve(paper)}
                                                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />}
                                                sx={{ ...primaryBtnSx, py: 0.3, fontSize: "11.5px", ml: "auto" }}
                                            >
                                                Approve
                                            </Button>
                                        </>
                                    )}

                                    {paper.status === "Approved" && (
                                        <Button
                                            onClick={() => publish(paper)}
                                            startIcon={<RocketLaunchOutlinedIcon sx={{ fontSize: 15 }} />}
                                            sx={{ ...primaryBtnSx, py: 0.3, fontSize: "11.5px", ml: "auto", bgcolor: DASH.green, "&:hover": { bgcolor: "#059669" } }}
                                        >
                                            Publish
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog
                open={Boolean(rejectTarget)}
                onClose={() => setRejectTarget(null)}
                slotProps={{ paper: { sx: { borderRadius: RADIUS, width: 440 } } }}
            >
                <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>
                    Send this paper back
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mb: 1.6 }}>
                        "{rejectTarget?.name}" goes back to {rejectTarget?.createdBy} with your note.
                    </Typography>
                    <TextField
                        fullWidth multiline minRows={3} size="small"
                        label="What needs to change"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        sx={fieldSx}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRejectTarget(null)} sx={outlineBtnSx}>Cancel</Button>
                    <Button onClick={confirmReject} sx={{ ...primaryBtnSx, bgcolor: DASH.red, "&:hover": { bgcolor: "#DC2626" } }}>
                        Send back
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
