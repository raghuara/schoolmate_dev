import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Snackbar, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C } from "./complaintsTokens";
import {
    DETAIL_CATEGORY_TONE,
    DETAIL_PRIORITY_TONES,
    DETAIL_STATUS_TONES,
    CONTROL_ACTIONS,
    nextPendingStep,
} from "./complaintDetailData";
import ComplaintTimeline from "./ComplaintTimeline";
import UpdateStatusDrawer from "./UpdateStatusDrawer";
import ComplaintActionDialog from "./ComplaintActionDialog";
import { updateComplaintStatus } from "./complaintsActionsApi";
import { toneFor } from "./complaintsManagementData";
import {
    attachmentDownloadUrl,
    detailForScreen,
    fetchComplaintDetail,
    fetchComplaintTimeline,
} from "./complaintsDetailApi";

// Reached from "View" on a row in the Complaints Management workspace.
//
// The Figma frame includes the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this page starts
// at the breadcrumb.

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

/* Stacked label over value — used by the info and assignment panels. */
const Field = ({ label, value }) => (
    <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "4px" }}>
        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>{label}</Typography>
        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{value}</Typography>
    </Box>
);

/* "Registered: 14 Aug 2026" — muted label, bold value. */
const InlineFact = ({ label, value, valueColor }) => (
    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
        {label}{" "}
        <Box component="span" sx={{ fontWeight: 600, color: valueColor || C.text }}>
            {value}
        </Box>
    </Typography>
);

const CONTROL_ICON = {
    next: ArrowForwardOutlinedIcon,
    updateStatus: AutorenewOutlinedIcon,
    escalate: ArrowUpwardOutlinedIcon,
    requestInfo: HelpOutlineOutlinedIcon,
    addNote: AddOutlinedIcon,
};

export default function ComplaintDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    /* The route param IS the complaint token — MSMS-CMP-2026-000005 — which is what the
       detail endpoint addresses. */
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusOpen, setStatusOpen] = useState(false);

    /* Which action dialog is open, if any. */
    const [actionKind, setActionKind] = useState(null);
    const [toast, setToast] = useState("");

    /* Pulled out of the effect so an action can re-read the record once it has written.
       None of the action endpoints return the updated complaint, and the timeline entry
       they write only appears on a re-read. */
    const loadDetail = useCallback(async () => {
        const result = await fetchComplaintDetail({ complaintToken: id });
        if (result.ok) {
            setError("");
            setDetail(detailForScreen(result));
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
                        ? "The complaints service is not responding — this is a server-side outage, not this complaint."
                        : result.notFound
                          ? `Complaint ${id} was not found on the server.`
                          : result.message,
                );
                setDetail(null);
            } else {
                setError("");
                setDetail(detailForScreen(result));
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
                <Typography sx={{ fontSize: "14px", color: C.textMuted }}>Loading complaint…</Typography>
            </Box>
        );
    }

    if (error || !detail) {
        return (
            <Box sx={{ p: "28px" }}>
                <Typography sx={{ fontSize: "14px", color: C.red }}>
                    {error || "That complaint could not be found."}
                </Typography>
            </Box>
        );
    }

    const priorityTone = DETAIL_PRIORITY_TONES[detail.priority] || DETAIL_PRIORITY_TONES["Normal Priority"];
    const statusTone = toneFor(DETAIL_STATUS_TONES, detail.status) || { bg: C.track, color: C.textMuted };


    /* "Next" names the step the complaint would move to, but moving it is a status
       change like any other, so the button opens the same drawer. It used to advance the
       timeline in local state only, which showed progress the server did not have. */
    const upcoming = nextPendingStep(detail.timeline);

    /**
     * Send the status change, then re-read.
     *
     * The drawer's note is the INTERNAL record; `parentMessage` is left empty because the
     * drawer does not ask for parent-facing wording, and publishing an internal note to a
     * parent is not a default worth taking.
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
        next: () => setStatusOpen(true),
        updateStatus: () => setStatusOpen(true),
        escalate: () => setActionKind("escalate"),
        requestInfo: () => setActionKind("requestInfo"),
        addNote: () => setActionKind("addNote"),
        assign: () => setActionKind("assign"),
    };

    /* What the SERVER says this user may do to this complaint. The comps' CONTROL_ACTIONS
       list is what the design drew; allowedActions is what is actually permitted, so a
       button is offered only when it appears in both. */
    const API_ACTION = {
        escalate: "Escalate",
        requestInfo: "RequestParentInformation",
        assign: "Assign",
    };
    const permitted = (key) => !API_ACTION[key] || detail.allowedActions.includes(API_ACTION[key]);

    /* The status endpoint takes PascalCase without spaces, while the drawer offers the
       comps' wording. Anything unmapped is sent through as-is rather than silently dropped,
       so a new option surfaces as a server-side rejection rather than a no-op. */
    const STATUS_TO_API = {
        "Under Review": "UnderReview",
        "Action in Progress": "ActionInProgress",
        "Action Required": "ActionRequired",
    };

    const crumbSx = (current) => ({
        fontSize: "13px",
        fontWeight: 500,
        color: current ? C.text : C.textMuted,
        cursor: current ? "default" : "pointer",
        "&:hover": current ? undefined : { textDecoration: "underline" },
    });

    // No endpoints yet — each of these becomes its own call at integration.
    /* The two inline affordances outside the Control Panel — the "Add Note" shortcut under
       Internal Notes and the "Reassign" chip in the Assignment Details header — open the
       same dialogs as their panel buttons. They were wired to an empty function, so they
       hovered and clicked and did nothing. */
    const runAction = () => setActionKind("addNote");
    const openReassign = () => setActionKind("assign");

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Breadcrumb + title */}
            <Box sx={{ px: "28px", pt: 2.5, pb: 1.25, display: "flex", flexDirection: "column", gap: "6px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                    <Typography
                        onClick={() => navigate("/dashboardmenu/complaints")}
                        sx={crumbSx(false)}
                    >
                        Complaints
                    </Typography>
                    <ChevronRightOutlinedIcon sx={{ fontSize: "12px", color: C.textFaint }} />
                    <Typography
                        onClick={() => navigate("/dashboardmenu/complaints/manage")}
                        sx={crumbSx(false)}
                    >
                        Management
                    </Typography>
                    <ChevronRightOutlinedIcon sx={{ fontSize: "12px", color: C.textFaint }} />
                    <Typography
                        onClick={() => navigate("/dashboardmenu/complaints/manage")}
                        sx={crumbSx(false)}
                    >
                        {detail.stream}
                    </Typography>
                    <ChevronRightOutlinedIcon sx={{ fontSize: "12px", color: C.textFaint }} />
                    <Typography sx={crumbSx(true)}>{detail.ref}</Typography>
                </Box>

                <Box sx={{ pt: 0.5, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: C.text }}>
                        Complaint Details
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Review specific parent feedback, logs, internal actions, and resolution statuses.
                    </Typography>
                </Box>
            </Box>

            {/* Two columns; the 400px rail drops under the main column when narrow. */}
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
                            <Chip label={detail.category} tone={DETAIL_CATEGORY_TONE} />
                            <Chip label={detail.priority} tone={priorityTone} />
                            <Chip label={detail.status} tone={statusTone} />
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
                                {detail.title}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                <InlineFact label="Registered:" value={detail.registeredAt} />
                                <Typography sx={{ fontSize: "13px", color: C.textFaint }}>|</Typography>
                                <InlineFact label="SLA Due:" value={detail.slaDue} valueColor="#D97706" />
                            </Box>
                        </Box>
                    </Box>

                    {/* Student & parent */}
                    <Box sx={cardSx}>
                        <Typography sx={sectionTitleSx}>Student &amp; Parent Information</Typography>
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
                                {detail.student.map((f) => (
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
                                {detail.parent.map((f) => (
                                    <Field key={f.label} {...f} />
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* Description + attachments */}
                    <Box sx={cardSx}>
                        <Typography sx={sectionTitleSx}>Description</Typography>
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
                                <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                                    {detail.attachments.map((a) => (
                                        <Box
                                            key={a.id}
                                            sx={{
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
                                                {/* The endpoint answers with the file itself and a
                                                    Content-Disposition filename, so the browser is handed
                                                    the URL rather than the bytes being pulled through axios
                                                    and re-wrapped into a blob. Opened in a new tab so a
                                                    failed download cannot replace the detail screen. */}
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
                                                        color: C.blue,
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
                            </Box>
                        )}
                    </Box>

                    {/* Internal notes — the comp drops the outline here and marks the
                        card with a 4px accent edge instead. */}
                    <Box
                        sx={{
                            ...cardSx,
                            border: "none",
                            borderLeft: `4px solid ${accent}`,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={sectionTitleSx}>Internal Notes</Typography>
                            <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textFaint }}>
                                (Not visible to parent)
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
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                alignSelf: "flex-start",
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
                        <Typography sx={sectionTitleSx}>Resolution</Typography>
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
                                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: "36px", color: C.textFaint }} />
                                <Typography
                                    sx={{
                                        fontSize: "13px",
                                        fontWeight: 400,
                                        color: C.textMuted,
                                        textAlign: "center",
                                    }}
                                >
                                    No resolution recorded yet. This section will be updated when the complaint
                                    is resolved.
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
                    {/* Assignment */}
                    <Box sx={cardSx}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                            }}
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
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {detail.assignment.map((f) => (
                                <Field key={f.label} {...f} />
                            ))}
                        </Box>
                    </Box>

                    {/* Timeline */}
                    <Box sx={cardSx}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography sx={sectionTitleSx}>Complaint Timeline</Typography>
                            <Typography
                                onClick={refreshingTimeline ? undefined : refreshTimeline}
                                sx={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: refreshingTimeline ? C.textFaint : C.blue,
                                    cursor: refreshingTimeline ? "default" : "pointer",
                                }}
                            >
                                {refreshingTimeline ? "Refreshing…" : "Refresh"}
                            </Typography>
                        </Box>
                        <Divider />
                        <ComplaintTimeline steps={detail.timeline} accent={accent} />
                    </Box>

                    {/* Control panel */}
                    <Box sx={cardSx}>
                        <Typography sx={sectionTitleSx}>Control Panel</Typography>
                        <Divider />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                            {CONTROL_ACTIONS.map((a) => {
                                const Icon = CONTROL_ICON[a.key];
                                const primary = a.variant === "primary";
                                // Next is dead once the timeline has nothing left to advance to.
                                const disabled =
                                    !permitted(a.key) || (a.key === "next" && !upcoming);
                                return (
                                    <Button
                                        key={a.key}
                                        onClick={CONTROL_HANDLER[a.key] || runAction}
                                        disabled={disabled}
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
                                            color: C.text,
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            textTransform: "none",
                                            "&:hover": {
                                                bgcolor: primary ? websiteSettings.darkColor : "#F8FAFC",
                                                border: primary ? "none" : `1px solid ${C.border}`,
                                            },
                                            "&.Mui-disabled": { bgcolor: C.track, color: C.textFaint },
                                        }}
                                    >
                                        {a.key === "next" && upcoming ? `Next: ${upcoming.label}` : a.label}
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
