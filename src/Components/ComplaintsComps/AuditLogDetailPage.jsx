import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import ComplaintsBreadcrumb from "./ComplaintsBreadcrumb";
import useComplaintsPermissions from "./useComplaintsPermissions";
import { getAuditEntry, STATUS_TONES, initialsOf } from "./auditLogDetailData";

// The Figma frame includes the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this page starts
// at the breadcrumb.

const AUDIT_LOG_PATH = "/dashboardmenu/complaints/configuration/audit-log";

const cardSx = {
    alignSelf: "stretch",
    p: 3,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "16px",
    border: `1px solid ${C.border}`,
    boxShadow: CARD_SHADOW,
    display: "flex",
    flexDirection: "column",
};

/* Small uppercase label above each value. */
const FieldLabel = ({ children }) => (
    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: C.textMuted, textTransform: "uppercase" }}>
        {children}
    </Typography>
);

const Field = ({ label, children }) => (
    <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "6px" }}>
        <FieldLabel>{label}</FieldLabel>
        {children}
    </Box>
);

const SectionTitle = ({ children }) => (
    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text, textTransform: "uppercase" }}>
        {children}
    </Typography>
);

// The Parent and Internal variants are the same screen over different rows, so
// the props below carry the differences and default to the Parent values — the
// Parent route renders it with no props. Same shape as AuditLogPage.
export default function AuditLogDetailPage({
    crumbLabel = "School Operations",
    listPath = AUDIT_LOG_PATH,
    lookup = getAuditEntry,
}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const { canViewConfig } = useComplaintsPermissions();
    const entry = lookup(id);

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    // Unknown id — send the user back to the list rather than rendering blanks.
    if (!entry) return <Navigate to={listPath} replace />;

    const statusTone = STATUS_TONES[entry.status] || STATUS_TONES.SUCCESS;

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title + back */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <ComplaintsBreadcrumb
                    trail={[
                        { label: "Administration", onClick: () => navigate("/dashboardmenu/complaints/configuration") },
                        { label: crumbLabel, onClick: () => navigate("/dashboardmenu/complaints/configuration") },
                        { label: "Audit Log", onClick: () => navigate(listPath) },
                        { label: "Entry Details" },
                    ]}
                />

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", md: "center" },
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                        <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                            Audit Log Entry Details
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                            Detailed record of system activity and configuration changes.
                        </Typography>
                    </Box>

                    <Button
                        onClick={() => navigate(listPath)}
                        startIcon={<ChevronLeftOutlinedIcon sx={{ fontSize: "14px" }} />}
                        sx={{
                            px: 2,
                            py: 1,
                            gap: 1,
                            bgcolor: C.surface,
                            color: C.textMuted,
                            borderRadius: "8px",
                            border: `1px solid ${C.border}`,
                            fontSize: "13px",
                            fontWeight: 600,
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.border}` },
                        }}
                    >
                        Back to Audit Log
                    </Button>
                </Box>
            </Box>

            {/* Summary: outcome, audit id, timestamp, actor, action */}
            <Box sx={{ ...cardSx, gap: 2.5 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Box sx={{ px: 1.5, py: "6px", borderRadius: "6px", bgcolor: statusTone.bg }}>
                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: statusTone.color }}>
                                {entry.status}
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                            Audit ID: {entry.auditId}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Date &amp; Time: {entry.dateTime}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: "flex-start",
                        gap: { xs: 3, md: 5 },
                    }}
                >
                    {/* Actor */}
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <SectionTitle>Actor Information</SectionTitle>

                        <Field label="User">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        bgcolor: accent,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "14px", fontWeight: 800, color: C.onAccent }}>
                                        {initialsOf(entry.user)}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "15px", fontWeight: 600, color: C.text }}>
                                    {entry.user}
                                </Typography>
                            </Box>
                        </Field>

                        <Field label="Role">
                            <Typography sx={{ fontSize: "15px", fontWeight: 500, color: C.text }}>
                                {entry.role}
                            </Typography>
                        </Field>
                    </Box>

                    {/* Action */}
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <SectionTitle>Action Details</SectionTitle>

                        <Field label="Action Performed">
                            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                                {entry.action}
                            </Typography>
                        </Field>

                        <Field label="Affected Module">
                            <Box
                                sx={{
                                    alignSelf: "flex-start",
                                    px: 1,
                                    py: "4px",
                                    borderRadius: "4px",
                                    bgcolor: "#F4F6FA",
                                }}
                            >
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.textMuted }}>
                                    {entry.module}
                                </Typography>
                            </Box>
                        </Field>

                        <Field label="Reference Object">
                            <Typography
                                sx={{
                                    fontSize: "15px",
                                    fontWeight: 500,
                                    color: C.blue,
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}
                            >
                                {entry.reference}
                            </Typography>
                        </Field>
                    </Box>
                </Box>
            </Box>

            {/* Narrative */}
            <Box sx={{ ...cardSx, gap: 1.5 }}>
                <Typography sx={{ fontSize: "12px", fontWeight: 700, color: C.textMuted }}>
                    Activity Description
                </Typography>
                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.text, lineHeight: "20px" }}>
                    {entry.description}
                </Typography>
            </Box>

            {/* Before / after diff */}
            <Box sx={{ ...cardSx, gap: 2 }}>
                <SectionTitle>Change Details</SectionTitle>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "stretch",
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            p: 2,
                            boxSizing: "border-box",
                            bgcolor: "#F8FAFC",
                            borderRadius: "8px",
                            border: `1px solid ${C.border}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: C.textMuted }}>
                            Before
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                            {entry.before || "—"}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            p: 2,
                            boxSizing: "border-box",
                            bgcolor: "#F8FAFC",
                            borderRadius: "8px",
                            border: `1px solid ${C.border}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: STATUS_TONES.SUCCESS.color }}>
                            After
                        </Typography>
                        {entry.after.length > 0 ? (
                            entry.after.map((line) => (
                                <Typography key={line} sx={{ fontSize: "13px", fontWeight: 400, color: C.text }}>
                                    {line}
                                </Typography>
                            ))
                        ) : (
                            <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                                —
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
