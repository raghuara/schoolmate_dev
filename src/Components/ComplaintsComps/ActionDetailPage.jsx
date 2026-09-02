import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Snackbar, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
import {
    ACTION_CATEGORY_TONES,
    ACTION_PRIORITY_TONES,
    ACTION_STATUS_TONES,
    ACTION_CONTROL_ACTIONS,
    ACTION_STATUS_OPTIONS,
    ACTION_LINK_COLOR,
} from "./actionDetailData";
import UpdateStatusDrawer from "./UpdateStatusDrawer";
import ComplaintActionDialog from "./ComplaintActionDialog";
import { updateComplaintStatus } from "./complaintsActionsApi";
import { toneFor } from "./complaintsManagementData";
import {
    actionDetailForScreen,
    attachmentDownloadUrl,
    fetchComplaintDetail,
    fetchComplaintTimeline,
} from "./complaintsDetailApi";

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

    /* The route param is the token — MSMS-IES-2026-000042. One detail endpoint serves both
       streams; only the presentation differs from ComplaintDetailPage. */
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusOpen, setStatusOpen] = useState(false);

    /* Which action dialog is open, if any. */
    const [actionKind, setActionKind] = useState(null);
    const [toast, setToast] = useState("");

    /* Pulled out of the effect so an action can re-read the record once it has written.
       The action endpoints do not return the updated record, and the timeline entry they
       write only appears on a re-read. */
    const loadDetail = useCallback(async () => {
        const result = await fetchComplaintDetail({ complaintToken: id });
        if (result.ok) {
            setError("");
            setDetail(actionDetailForScreen(result));
        }
        return result;
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchComplaintDetail({ complaintToken: id }).then((result) => {
            if (cancelled) return;
            if (!result.ok) {
                setError(
                    result.routeMissing
                        ? "The complaints service is not responding — this is a server-side outage, not this action."
                        : result.notFound
                          ? `Action ${id} was not found on the server.`
                          : result.message,
                );
                setDetail(null);
            } else {
                setError("");
                setDetail(actionDetailForScreen(result));
            }
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [id]);


    /* The detail response already carries the timeline, so this is a refresh of just that
       section — useful because a complaint moves while someone has it open (the automation
       escalates, a parent replies) and re-reading the whole record to see one new event is
       wasteful. */
    const [refreshingTimeline, setRefreshingTimeline] = useState(false);

    const refreshTimeline = async () => {
        setRefreshingTimeline(true);
        const result = await fetchComplaintTimeline({ complaintToken: id });
        if (result.ok) {
            setDetail((prev) =>
                prev
                    ? {
                          ...prev,
                          timeline: result.events.map((event) => ({
                              label: event.eventType,
                              at: `${
                                  event.at
                                      ? new Date(event.at).toLocaleString(undefined, {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                      : ""
                              }${event.actorName ? ` · ${event.actorName}` : ""}`,
                              note: event.message,
                              state: "done",
                          })),
                      }
                    : prev,
            );
        }
        setRefreshingTimeline(false);
    };

    if (loading) {
        return (
            <Box sx={{ p: "28px" }}>
                <Typography sx={{ fontSize: "14px", color: C.textMuted }}>Loading action…</Typography>
            </Box>
        );
    }

    if (error || !detail) {
        return (
            <Box sx={{ p: "28px" }}>
                <Typography sx={{ fontSize: "14px", color: C.red }}>
                    {error || "That action could not be found."}
                </Typography>
            </Box>
        );
    }

    const categoryTone = ACTION_CATEGORY_TONES[detail.category] || ACTION_CATEGORY_TONES.Maintenance;
    const priorityTone = ACTION_PRIORITY_TONES[detail.priority] || ACTION_PRIORITY_TONES.Normal;
    const statusTone = toneFor(ACTION_STATUS_TONES, detail.status) || { bg: C.track, color: C.textMuted };


    /* This screen's own status wording mapped onto what the endpoint accepts —
       PascalCase, no spaces. Anything unmapped is sent through unchanged so a new option
       fails loudly server-side rather than silently doing nothing. */
    const STATUS_TO_API = {
        "In Progress": "InProgress",
        "Action Required": "ActionRequired",
    };

    /**
     * Send the status change, then re-read.
     *
     * The drawer's note goes to `staffResponse` — the internal record. `parentMessage` is
     * left empty: the drawer never asks for parent-facing wording, and an internal note is
     * not something to publish by default.
     */
    const handleStatusSubmit = async ({ status, note }) => {
        const result = await updateComplaintStatus({
            complaintToken: id,
            status: STATUS_TO_API[status] || status,
            staffResponse: note || "",
        });
        setStatusOpen(false);
        if (!result.ok) {
            setToast(result.message || "Could not update the status");
            return;
        }
        setToast(result.message || "Status updated");
        loadDetail();
    };

    const CONTROL_HANDLER = {
        updateStatus: () => setStatusOpen(true),
        reassign: () => setActionKind("assign"),
        requestClarification: () => setActionKind("requestInfo"),
        escalate: () => setActionKind("escalate"),
        addNote: () => setActionKind("addNote"),
    };

    /* The two inline affordances outside the Control Panel (the assignment header and the
       note shortcut) open the same dialogs. */
    const runAction = () => setActionKind("addNote");
    const openReassign = () => setActionKind("assign");

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
                                            {/* The endpoint answers with the file and a
                                                Content-Disposition filename, so the browser is
                                                handed the URL. New tab, so a failed download
                                                cannot replace the detail screen. */}
                                            <Typography
                                                component="a"
                                                href={attachmentDownloadUrl({
                                                    complaintToken: detail.ref,
                                                    attachmentId: a.id,
                                                })}
                                                target="_blank"
                                                rel="noopener noreferrer"
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
                        {detail.resolution.length > 0 ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                                {detail.resolution.map((line) => (
                                    <Box key={line.label}>
                                        <Typography
                                            sx={{ fontSize: "12px", fontWeight: 600, color: C.labelText }}
                                        >
                                            {line.label}
                                        </Typography>
                                        <Typography
                                            sx={{ fontSize: "14px", fontWeight: 400, color: C.textMuted }}
                                        >
                                            {line.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
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
                                onClick={openReassign}
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
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography sx={sectionTitleSx}>Action Timeline</Typography>
                            <Typography
                                onClick={refreshingTimeline ? undefined : refreshTimeline}
                                sx={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: refreshingTimeline ? C.textFaint : ACTION_LINK_COLOR,
                                    cursor: refreshingTimeline ? "default" : "pointer",
                                }}
                            >
                                {refreshingTimeline ? "Refreshing…" : "Refresh"}
                            </Typography>
                        </Box>
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

            <ComplaintActionDialog
                open={Boolean(actionKind)}
                kind={actionKind}
                complaintToken={id}
                onClose={() => setActionKind(null)}
                onDone={(message) => {
                    setActionKind(null);
                    setToast(message);
                    loadDetail();
                }}
            />

            <Snackbar
                open={Boolean(toast)}
                autoHideDuration={4000}
                onClose={() => setToast("")}
                message={toast}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </Box>
    );
}
