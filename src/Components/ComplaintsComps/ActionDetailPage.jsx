import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C } from "./complaintsTokens";
import { UserAvatar } from "./ComplaintsCheckBox";
import ComplaintTimeline from "./ComplaintTimeline";
import { advanceTimeline, moveTimelineTo, nextPendingStep, activeStep } from "./complaintDetailData";
import {
    getActionDetail,
    ACTION_CATEGORY_TONES,
    ACTION_PRIORITY_TONES,
    ACTION_STATUS_TONES,
    ACTION_CONTROL_ACTIONS,
    ACTION_STATUS_OPTIONS,
    ACTION_LINK_COLOR,
} from "./actionDetailData";
import UpdateStatusDrawer from "./UpdateStatusDrawer";

// Internal Excellence counterpart of ComplaintDetailPage. Built as its own screen
// rather than a variant of that one: the info grid, the assignment panel (a person
// card, not stacked fields) and the control actions all differ structurally. The
// timeline and the status transitions are shared.

const cardSx = {
    alignSelf: "stretch",
    p: 2.5,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    gap: 2,
};

const sectionTitleSx = { fontSize: "15px", fontWeight: 700, color: C.text };

const Divider = () => <Box sx={{ alignSelf: "stretch", height: 0, borderTop: `1px solid ${C.border}` }} />;

const Chip = ({ label, tone }) => (
    <Box sx={{ px: "10px", py: "4px", borderRadius: "6px", bgcolor: tone.bg, flexShrink: 0 }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: tone.color, whiteSpace: "nowrap" }}>
            {label}
        </Typography>
    </Box>
);

/* Section heading with a leading glyph — this comp icons its Description and
   Resolution headings where the complaint comp does not. */
const IconTitle = ({ icon: Icon, children }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Icon sx={{ fontSize: "16px", color: C.text }} />
        <Typography sx={sectionTitleSx}>{children}</Typography>
    </Box>
);

const Field = ({ label, value }) => (
    <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "4px" }}>
        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>{label}</Typography>
        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{value}</Typography>
    </Box>
);

/* label ......... value, on one line — used by the assignment meta rows. */
const MetaRow = ({ label, value }) => (
    <Box sx={{ alignSelf: "stretch", display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>{label}</Typography>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{value}</Typography>
    </Box>
);

const CONTROL_ICON = {
    updateStatus: AutorenewOutlinedIcon,
    reassign: SwapHorizOutlinedIcon,
    requestClarification: HelpOutlineOutlinedIcon,
    escalate: ArrowUpwardOutlinedIcon,
    addNote: AddOutlinedIcon,
};

export default function ActionDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const [detail, setDetail] = useState(() => getActionDetail(id));
    const [statusOpen, setStatusOpen] = useState(false);

    useEffect(() => {
        setDetail(getActionDetail(id));
    }, [id]);

    const categoryTone = ACTION_CATEGORY_TONES[detail.category] || ACTION_CATEGORY_TONES.Maintenance;
    const priorityTone = ACTION_PRIORITY_TONES[detail.priority] || ACTION_PRIORITY_TONES.Normal;
    const statusTone = ACTION_STATUS_TONES[detail.status] || { bg: C.track, color: C.textMuted };

    const stamp = () => dayjs().format("DD MMM YYYY");
    const upcoming = nextPendingStep(detail.timeline);

    // Same transition rules as the complaint flow: a target that is a timeline
    // step moves the timeline, one that is not (Escalated, On Hold) only changes
    // the status.
    const handleStatusSubmit = ({ status, note }) => {
        setDetail((d) => {
            const timeline = moveTimelineTo(d.timeline, status, stamp());
            const internalNotes = note
                ? [
                      ...d.internalNotes,
                      {
                          id: `n${d.internalNotes.length + 1}`,
                          text: `"${note}"`,
                          author: "Admin Tamil",
                          at: dayjs().format("DD MMM YYYY, hh:mm A"),
                      },
                  ]
                : d.internalNotes;
            return { ...d, status, timeline, internalNotes };
        });
        setStatusOpen(false);
    };

    // Kept for parity with the complaint screen even though this comp has no
    // "Next" button — advancing is available through Update Status.
    const handleAdvance = () => {
        if (!upcoming) return;
        const timeline = advanceTimeline(detail.timeline, stamp());
        setDetail((d) => ({ ...d, timeline, status: activeStep(timeline)?.label || d.status }));
    };

    const CONTROL_HANDLER = { updateStatus: () => setStatusOpen(true) };
    const runAction = () => {};

    const crumbSx = (current) => ({
        fontSize: "13px",
        fontWeight: 500,
        color: current ? C.text : C.textMuted,
        cursor: current ? "default" : "pointer",
        "&:hover": current ? undefined : { textDecoration: "underline" },
    });

    const toManage = () => navigate("/dashboardmenu/complaints/manage");

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Breadcrumb + title */}
            <Box sx={{ px: "28px", pt: 2.5, pb: 1.25, display: "flex", flexDirection: "column", gap: "6px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                    <Typography onClick={() => navigate("/dashboardmenu/complaints")} sx={crumbSx(false)}>
                        School Operations
                    </Typography>
                    <ChevronRightOutlinedIcon sx={{ fontSize: "12px", color: C.textFaint }} />
                    <Typography onClick={toManage} sx={crumbSx(false)}>
                        Manage Actions
                    </Typography>
                    <ChevronRightOutlinedIcon sx={{ fontSize: "12px", color: C.textFaint }} />
                    <Typography onClick={toManage} sx={crumbSx(false)}>
                        Action Details
                    </Typography>
                    <ChevronRightOutlinedIcon sx={{ fontSize: "12px", color: C.textFaint }} />
                    <Typography sx={crumbSx(true)}>{detail.ref}</Typography>
                </Box>

                <Box sx={{ pt: 0.5, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: C.text }}>
                        Action Details
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Review action details, assignment, progress, evidence and resolution status.
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    px: "28px",
                    pb: 5,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2.5,
                    flexWrap: "wrap",
                }}
            >
                {/* ── Main column ─────────────────────────────────────────────── */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: { xs: "100%", lg: 460 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                    }}
                >
                    {/* Summary */}
                    <Box sx={cardSx}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: C.textMuted }}>
                                {detail.ref}
                            </Typography>
                            <Box sx={{ width: "1px", height: 12, bgcolor: C.border }} />
                            <Chip label={detail.category} tone={categoryTone} />
                            <Chip label={detail.priority} tone={priorityTone} />
                            <Chip label={detail.status} tone={statusTone} />
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
                                {detail.title}
                            </Typography>
                            <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                                Owner:{" "}
                                <Box component="span" sx={{ fontWeight: 600, color: C.text }}>
                                    {detail.owner}
                                </Box>
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                                    Created:{" "}
                                    <Box component="span" sx={{ fontWeight: 600, color: C.text }}>
                                        {detail.createdAt}
                                    </Box>
                                </Typography>
                                <Typography sx={{ fontSize: "13px", color: C.textFaint }}>|</Typography>
                                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                                    SLA Due:{" "}
                                    <Box component="span" sx={{ fontWeight: 600, color: C.text }}>
                                        {detail.slaDue}
                                    </Box>{" "}
                                    <Box component="span" sx={{ fontWeight: 600, color: "#D97706" }}>
                                        {detail.slaRemaining}
                                    </Box>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Action information */}
                    <Box sx={cardSx}>
                        <Typography sx={sectionTitleSx}>Action Information</Typography>
                        <Divider />
                        <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
                            <Box
                                sx={{
                                    flex: "1 1 0",
                                    minWidth: 220,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "14px",
                                }}
                            >
                                {detail.infoPrimary.map((f) => (
                                    <Field key={f.label} {...f} />
                                ))}
                            </Box>
                            <Box
                                sx={{
                                    flex: "1 1 0",
                                    minWidth: 220,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "14px",
                                }}
                            >
                                {detail.infoSecondary.map((f) => (
                                    <Field key={f.label} {...f} />
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* Description + attachments */}
                    <Box sx={cardSx}>
                        <IconTitle icon={DescriptionOutlinedIcon}>Description</IconTitle>
                        <Divider />
                        <Typography
                            sx={{ fontSize: "14px", fontWeight: 400, lineHeight: "22px", color: C.textMuted }}
                        >
                            {detail.description}
                        </Typography>

                        {detail.attachments?.length > 0 && (
                            <Box sx={{ pt: 0.75, display: "flex", flexDirection: "column", gap: 1.25 }}>
                                <Typography
                                    sx={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        color: C.textMuted,
                                    }}
                                >
                                    Attachments ({detail.attachments.length})
                                </Typography>
                                {detail.attachments.map((a) => (
                                    <Box
                                        key={a.id}
                                        sx={{
                                            alignSelf: "stretch",
                                            px: "14px",
                                            py: "10px",
                                            boxSizing: "border-box",
                                            bgcolor: "#F4F6FA",
                                            borderRadius: "8px",
                                            border: `1px solid ${C.border}`,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.25,
                                        }}
                                    >
                                        <DescriptionOutlinedIcon sx={{ fontSize: "14px", color: C.textMuted }} />
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
                                            {a.name}
                                        </Typography>
                                        <Box sx={{ pl: 1 }}>
                                            <Typography
                                                onClick={runAction}
                                                sx={{
                                                    fontSize: "12px",
                                                    fontWeight: 700,
                                                    color: ACTION_LINK_COLOR,
                                                    textDecoration: "underline",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Download
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Internal notes — no outline, accent left edge instead. */}
                    <Box sx={{ ...cardSx, border: "none", borderLeft: `4px solid ${accent}` }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={sectionTitleSx}>Internal Notes</Typography>
                            <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textFaint }}>
                                (Not visible to staff)
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {detail.internalNotes.map((n) => (
                                <Box
                                    key={n.id}
                                    sx={{
                                        p: 1.5,
                                        bgcolor: "#F4F6FA",
                                        borderRadius: "8px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                    }}
                                >
                                    <Typography
                                        sx={{ fontSize: "13px", fontWeight: 400, lineHeight: "18px", color: C.text }}
                                    >
                                        {n.text}
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                                        <Typography sx={{ fontSize: "11px", fontWeight: 600, color: C.textMuted }}>
                                            By {n.author}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textFaint }}>
                                            {n.at}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Box
                            onClick={runAction}
                            sx={{
                                pt: 0.5,
                                alignSelf: "flex-start",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                cursor: "pointer",
                                "&:hover .add-note-label": { textDecoration: "underline" },
                            }}
                        >
                            <AddOutlinedIcon sx={{ fontSize: "14px", color: "#D97706" }} />
                            <Typography
                                className="add-note-label"
                                sx={{ fontSize: "13px", fontWeight: 700, color: "#D97706" }}
                            >
                                Add Internal Note
                            </Typography>
                        </Box>
                    </Box>

                    {/* Resolution */}
                    <Box sx={cardSx}>
                        <IconTitle icon={AssignmentOutlinedIcon}>Resolution</IconTitle>
                        <Divider />
                        {detail.resolution ? (
                            <Typography sx={{ fontSize: "14px", fontWeight: 400, color: C.textMuted }}>
                                {detail.resolution}
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    alignSelf: "stretch",
                                    py: 2.5,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                {/* This comp sits the glyph in a grey disc. */}
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: "50%",
                                        bgcolor: C.divider,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <AssignmentOutlinedIcon sx={{ fontSize: "16px", color: C.textFaint }} />
                                </Box>
                                <Typography
                                    sx={{
                                        fontSize: "13px",
                                        fontWeight: 400,
                                        color: C.textMuted,
                                        textAlign: "center",
                                    }}
                                >
                                    No resolution recorded yet. This section will be updated when the action is
                                    resolved.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* ── Right rail ──────────────────────────────────────────────── */}
                <Box
                    sx={{
                        width: { xs: "100%", lg: 400 },
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                    }}
                >
                    {/* Assignment — a person card, not stacked fields */}
                    <Box sx={cardSx}>
                        <Box
                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}
                        >
                            <Typography sx={sectionTitleSx}>Assignment Details</Typography>
                            <Box
                                onClick={runAction}
                                sx={{
                                    px: "10px",
                                    py: "4px",
                                    borderRadius: "6px",
                                    border: `1px solid ${C.border}`,
                                    boxSizing: "border-box",
                                    cursor: "pointer",
                                    flexShrink: 0,
                                    "&:hover": { bgcolor: "#F8FAFC" },
                                }}
                            >
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: C.text }}>
                                    Reassign
                                </Typography>
                            </Box>
                        </Box>
                        <Divider />

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <UserAvatar initials={detail.assignee.initials} accent={accent} size={40} />
                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
                                    {detail.assignee.name}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>
                                    {detail.assignee.role}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {detail.assignmentMeta.map((m) => (
                                <MetaRow key={m.label} {...m} />
                            ))}
                        </Box>
                    </Box>

                    {/* Timeline */}
                    <Box sx={cardSx}>
                        <Typography sx={sectionTitleSx}>Action Timeline</Typography>
                        <Divider />
                        <ComplaintTimeline
                            steps={detail.timeline}
                            accent={accent}
                            labelSize="13px"
                            pendingLabelColor={C.textFaint}
                            pendingLabelWeight={600}
                            pendingCaption="Planned step"
                            finalCaption="Final step"
                            activeCaptionColor="#D97706"
                            activeMarkerRing
                        />
                    </Box>

                    {/* Control panel */}
                    <Box sx={cardSx}>
                        <Typography sx={sectionTitleSx}>Control Panel</Typography>
                        <Divider />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                            {ACTION_CONTROL_ACTIONS.map((a) => {
                                const Icon = CONTROL_ICON[a.key];
                                const primary = a.variant === "primary";
                                // The comp gives Reassign a darker, heavier label than
                                // the three actions below it.
                                const strong = primary || a.strong;
                                return (
                                    <Button
                                        key={a.key}
                                        onClick={CONTROL_HANDLER[a.key] || runAction}
                                        startIcon={
                                            Icon ? (
                                                <Icon
                                                    sx={{
                                                        fontSize: "14px",
                                                        color: primary ? C.text : C.textMuted,
                                                    }}
                                                />
                                            ) : null
                                        }
                                        sx={{
                                            px: 2,
                                            py: 1.25,
                                            boxSizing: "border-box",
                                            borderRadius: "8px",
                                            bgcolor: primary ? accent : C.surface,
                                            border: primary ? "none" : `1px solid ${C.border}`,
                                            color: strong ? C.text : C.textMuted,
                                            fontSize: "13px",
                                            fontWeight: strong ? 700 : 600,
                                            textTransform: "none",
                                            "&:hover": {
                                                bgcolor: primary ? websiteSettings.darkColor : "#F8FAFC",
                                                border: primary ? "none" : `1px solid ${C.border}`,
                                            },
                                        }}
                                    >
                                        {a.label}
                                    </Button>
                                );
                            })}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <UpdateStatusDrawer
                open={statusOpen}
                complaint={detail}
                statusOptions={ACTION_STATUS_OPTIONS}
                statusTones={ACTION_STATUS_TONES}
                title="Update Action Status"
                notifyLabel="Notify action owner"
                notifyHelper="Owner will receive an SMS and app notification about this status change."
                dateLabel="Target Completion Date"
                onClose={() => setStatusOpen(false)}
                onSubmit={handleStatusSubmit}
            />
        </Box>
    );
}
