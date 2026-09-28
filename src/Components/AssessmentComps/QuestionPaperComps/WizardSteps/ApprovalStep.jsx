import React from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import { DASH, RADIUS, Panel, EmptyNote } from "../../../DashBoardComps/dashboardTheme";
import { sectionMarks } from "../questionPaperApi";
import { PAPER_TEMPLATES } from "../paperTemplates";
import { Pill } from "../questionPaperTheme";
import { fmtDateTime } from "../paperWizardApi";

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
            <Typography sx={{ fontSize: "12.5px", color: ok ? DASH.text : color, lineHeight: 1.55 }}>{text}</Typography>
        </Box>
    );
};

export const APPROVAL_META = {
    "": {
        label: "Not sent yet",
        icon: SendOutlinedIcon,
        color: DASH.muted, bg: DASH.lineSoft, border: DASH.line,
        title: "Ready to send for approval",
        body: "Once the checks pass, send the paper. It goes to the approvers configured under Approval Flows, and you are told here the moment they decide.",
    },
    Pending: {
        label: "Waiting for approval",
        icon: HourglassEmptyOutlinedIcon,
        color: "#B45309", bg: DASH.primaryLight, border: DASH.primaryBorder,
        title: "Sent - waiting on the approver",
        body: "The paper is in the approval queue. Nothing here can be edited until an approver approves it, sends it back or rejects it.",
    },
    Approved: {
        label: "Approved",
        icon: VerifiedOutlinedIcon,
        color: DASH.green, bg: DASH.greenLight, border: "#BBF7D0",
        title: "Approved",
        body: "The approver signed this paper off. It is final - print it or download it from the preview.",
    },
    SentBack: {
        label: "Sent back",
        icon: ReplayOutlinedIcon,
        color: "#B45309", bg: DASH.amberLight, border: "#FDE68A",
        title: "Sent back for changes",
        body: "The approver wants changes - read the note below, fix the questions on the Questions step, then resubmit.",
    },
    Rejected: {
        label: "Rejected",
        icon: CancelOutlinedIcon,
        color: DASH.red, bg: DASH.redLight, border: "#FECACA",
        title: "Rejected - this paper is closed",
        body: "A rejected paper cannot be resubmitted. Build a new paper if one is still needed.",
    },
};

export const approvalMeta = (status) => APPROVAL_META[status] || APPROVAL_META[""];

const EVENT_TONES = {
    Submitted: { color: DASH.blue, bg: DASH.blueLight },
    Approved: { color: DASH.green, bg: DASH.greenLight },
    "Sent Back": { color: "#B45309", bg: DASH.amberLight },
    Rejected: { color: DASH.red, bg: DASH.redLight },
};

export const ApprovalHistory = ({ history, loading }) => {
    if (loading) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2, justifyContent: "center" }}>
                <CircularProgress size={16} thickness={4} sx={{ color: DASH.primary }} />
                <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Reading the history</Typography>
            </Box>
        );
    }
    if (!history.length) return <EmptyNote text="No decision has been made on this paper yet." />;

    return (
        <Box>
            {history.map((event, i) => {
                const tone = EVENT_TONES[event.action] || { color: DASH.muted, bg: DASH.lineSoft };
                return (
                    <Box key={event.id} sx={{ display: "flex", gap: 1.2, pb: i < history.length - 1 ? 1.6 : 0 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: tone.color, mt: 0.5 }} />
                            {i < history.length - 1 && <Box sx={{ width: "2px", flex: 1, bgcolor: DASH.lineSoft, mt: 0.4 }} />}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                                <Pill label={event.action} color={tone.color} bg={tone.bg} />
                                {event.round > 0 && <Pill label={`Round ${event.round}`} color={DASH.muted} bg={DASH.lineSoft} />}
                                <Typography sx={{ fontSize: "11px", color: DASH.faint }}>{fmtDateTime(event.on)}</Typography>
                            </Box>
                            {event.by && (
                                <Typography sx={{ fontSize: "12px", color: DASH.text, mt: 0.4 }}>by {event.by}</Typography>
                            )}
                            {event.note && (
                                <Typography sx={{ fontSize: "12px", color: DASH.text, mt: 0.4, lineHeight: 1.6, fontStyle: "italic" }}>
                                    "{event.note}"
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default function ApprovalStep({
    form,
    pattern,
    questions,
    chapters,
    templateId,
    checks,
    approval,
    history,
    historyLoading,
    approvers,
}) {
    const template = PAPER_TEMPLATES.find((t) => t.id === templateId) || PAPER_TEMPLATES[0];
    const sectionsTotal = (pattern?.sections || []).reduce((sum, s) => sum + sectionMarks(s), 0);
    const meta = approvalMeta(approval.status);
    const StatusIcon = meta.icon;
    const latest = history.length ? history[history.length - 1] : null;
    const showChecks = !approval.status || approval.status === "SentBack";
    const approverNames = (approvers?.userTypes || []).filter((u) => u.isSelected).map((u) => u.userType);

    return (
        <Grid container spacing={1.8}>
            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                <Panel title="Paper Summary" subtitle="What the approver sees" accent={DASH.primary} sx={{ mb: 1.8 }}>
                    <SummaryRow label="Paper name" value={form.name} />
                    <SummaryRow label="Class" value={form.gradeSign} />
                    <SummaryRow label="Subject" value={form.subject} />
                    <SummaryRow label="Academic year" value={form.academicYear} />
                    <SummaryRow label="Medium" value={form.medium} />
                    <SummaryRow label="Duration" value={form.durationMinutes ? `${form.durationMinutes} minutes` : ""} />
                    <SummaryRow label="Maximum marks" value={form.totalMarks ? `${form.totalMarks}` : ""} />
                    <SummaryRow label="Pattern" value={pattern?.name} />
                    <SummaryRow label="Sections" value={`${pattern?.sections?.length || 0} - ${sectionsTotal} marks`} />
                    <SummaryRow label="Chapters" value={`${chapters.length} selected`} />
                    <SummaryRow label="Questions printed" value={`${questions.length}`} />
                    <SummaryRow label="Print template" value={template.name} />
                </Panel>

                <Panel title="Who Approves" subtitle="Set under Access Control - Approval Flows" accent={DASH.green}>
                    {approvers === null ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                            <CircularProgress size={14} thickness={4} sx={{ color: DASH.green }} />
                            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>Checking the approvers</Typography>
                        </Box>
                    ) : approvers.unknown ? (
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, lineHeight: 1.6 }}>
                            The approvers for question papers are set by an administrator under Access Control - Approval Flows.
                            Any one of them can approve, send back or reject this paper.
                        </Typography>
                    ) : approverNames.length === 0 ? (
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                            <WarningAmberOutlinedIcon sx={{ fontSize: 17, color: DASH.amber, mt: 0.1 }} />
                            <Typography sx={{ fontSize: "12.5px", color: "#92400E", lineHeight: 1.6 }}>
                                No approver is set for question papers yet. Ask an administrator to pick one under
                                Access Control - Approval Flows - Question Paper before sending.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                                <GroupsOutlinedIcon sx={{ fontSize: 16, color: DASH.faint }} />
                                <Typography sx={{ fontSize: "12px", color: DASH.text }}>
                                    Any one of these user types can decide:
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap" }}>
                                {approverNames.map((name) => (
                                    <Pill key={name} label={name} color={DASH.green} bg={DASH.greenLight} border="#BBF7D0" />
                                ))}
                            </Box>
                        </>
                    )}
                </Panel>
            </Grid>

            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                <Box
                    sx={{
                        display: "flex", alignItems: "flex-start", gap: 1.6,
                        bgcolor: meta.bg, border: `1px solid ${meta.border}`, borderRadius: RADIUS,
                        px: 2, py: 1.8, mb: 1.8,
                    }}
                >
                    <Box
                        sx={{
                            width: 44, height: 44, borderRadius: RADIUS, flexShrink: 0,
                            bgcolor: "#fff", border: `1px solid ${meta.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <StatusIcon sx={{ fontSize: 22, color: meta.color }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: meta.color }}>{meta.title}</Typography>
                            {approval.sentBackCount > 0 && (
                                <Pill label={`Sent back ${approval.sentBackCount} time${approval.sentBackCount > 1 ? "s" : ""}`} color="#B45309" bg="#fff" border="#FDE68A" />
                            )}
                        </Box>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.text, mt: 0.5, lineHeight: 1.7 }}>{meta.body}</Typography>
                        {latest && (approval.status === "SentBack" || approval.status === "Rejected") && latest.note && (
                            <Box sx={{ mt: 1.2, px: 1.4, py: 1, borderRadius: RADIUS, bgcolor: "#fff", border: `1px solid ${meta.border}` }}>
                                <Typography sx={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: meta.color, mb: 0.3 }}>
                                    {approval.status === "SentBack" ? "WHAT TO FIX" : "REASON"}
                                </Typography>
                                <Typography sx={{ fontSize: "12.5px", color: DASH.ink, lineHeight: 1.6 }}>{latest.note}</Typography>
                                {latest.by && <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.4 }}>- {latest.by}, {fmtDateTime(latest.on)}</Typography>}
                            </Box>
                        )}
                    </Box>
                </Box>

                {showChecks && (
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
                        </Box>
                        {checks.map((check) => (
                            <CheckRow key={check.text} ok={check.ok} warn={check.warn} text={check.text} />
                        ))}
                    </Panel>
                )}

                <Panel
                    title="Approval History"
                    subtitle="Every decision on this paper, oldest first"
                    accent={DASH.violet}
                    right={<HistoryOutlinedIcon sx={{ fontSize: 18, color: DASH.faint }} />}
                >
                    <ApprovalHistory history={history} loading={historyLoading} />
                </Panel>
            </Grid>
        </Grid>
    );
}
