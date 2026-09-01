import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C } from "./complaintsTokens";

import ComplaintCategoriesPage from "./ComplaintCategoriesPage";
import InternalCategoriesPage from "./InternalCategoriesPage";
import AssignmentMappingPage from "./AssignmentMappingPage";
import InternalAssignmentMappingPage from "./InternalAssignmentMappingPage";
import ComplaintPermissionsPage from "./ComplaintPermissionsPage";
import InternalPermissionsPage from "./InternalPermissionsPage";
import SlaConfigurationPage from "./SlaConfigurationPage";
import InternalSlaConfigurationPage from "./InternalSlaConfigurationPage";
import EscalationConfigPage from "./EscalationConfigPage";
import NotificationTemplatesPage from "./NotificationTemplatesPage";
import DashboardConfigPage from "./DashboardConfigPage";
import AuditLogPage from "./AuditLogPage";

import { INTERNAL_TEMPLATE_COPY } from "./internalNotificationTemplatesData";
import { INTERNAL_DASHBOARD_COPY } from "./internalDashboardConfigData";
import { INTERNAL_AUDIT_PAGINATION, INTERNAL_AUDIT_COPY } from "./internalAuditLogData";
import { MODULE } from "./complaintsConfigApi";

// Configuration Hub. Replaces the old tile grid: every configuration screen is
// reachable from one page through the tab rail, with the stream pill choosing
// between the parent-complaint and staff-concern variant of that screen.
//
// The screens themselves are the same components the standalone routes render —
// each takes `embedded`, which drops its page padding, breadcrumb and title so
// the hub can own the chrome. Those routes still work for deep links.
//
// The Figma frame includes the global top bar (Welcome back / search / avatar);
// DashBoardLayout already renders that, so this page starts at the breadcrumb.

const PARENT = "Parent Complaints";
const STAFF = "Staff Concerns";
const STREAMS = [PARENT, STAFF];

const SECTIONS = [
    {
        key: "categories",
        label: "Categories",
        parent: () => <ComplaintCategoriesPage embedded />,
        staff: () => <InternalCategoriesPage embedded />,
    },
    {
        key: "assignment",
        label: "Staff Assignment",
        parent: () => <AssignmentMappingPage embedded />,
        staff: () => <InternalAssignmentMappingPage embedded />,
    },
    {
        key: "permissions",
        label: "Permissions",
        parent: () => <ComplaintPermissionsPage embedded />,
        staff: () => <InternalPermissionsPage embedded />,
    },
    {
        key: "sla",
        label: "SLA",
        parent: () => <SlaConfigurationPage embedded />,
        staff: () => <InternalSlaConfigurationPage embedded />,
    },
    {
        /* One comp, two streams: the screen is the same but each tab reads and writes its
           own escalation ladder and triggers, told apart by moduleType. */
        key: "escalation",
        label: "Escalation",
        parent: () => <EscalationConfigPage embedded moduleType={MODULE.parent} />,
        staff: () => <EscalationConfigPage embedded moduleType={MODULE.staff} />,
    },
    {
        key: "notifications",
        label: "Notifications",
        parent: () => <NotificationTemplatesPage embedded moduleType={MODULE.parent} />,
        staff: () => (
            <NotificationTemplatesPage
                embedded
                moduleType={MODULE.staff}
                crumbLabel={INTERNAL_TEMPLATE_COPY.crumbLabel}
                subtitle={INTERNAL_TEMPLATE_COPY.subtitle}
            />
        ),
    },
    {
        key: "dashboard",
        label: "Dashboard",
        parent: () => <DashboardConfigPage embedded moduleType={MODULE.parent} />,
        staff: () => (
            <DashboardConfigPage
                embedded
                moduleType={MODULE.staff}
                crumbLabel={INTERNAL_DASHBOARD_COPY.crumbLabel}
                title={INTERNAL_DASHBOARD_COPY.title}
                subtitle={INTERNAL_DASHBOARD_COPY.subtitle}
            />
        ),
    },
    {
        key: "auditLog",
        label: "Audit log",
        parent: () => <AuditLogPage embedded moduleType={MODULE.parent} />,
        staff: () => (
            <AuditLogPage
                embedded
                moduleType={MODULE.staff}
                crumbLabel={INTERNAL_AUDIT_COPY.crumbLabel}
                subtitle={INTERNAL_AUDIT_COPY.subtitle}
                pagination={INTERNAL_AUDIT_PAGINATION}
                showCardShadow={false}
            />
        ),
    },
];

export default function ComplaintsConfigurationPage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const [section, setSection] = useState(SECTIONS[0].key);
    const [stream, setStream] = useState(PARENT);

    const active = SECTIONS.find((s) => s.key === section) || SECTIONS[0];
    const render = stream === PARENT ? active.parent : active.staff;

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title + blurb. The comp has no back affordance, but this
                screen is only reachable from the dashboard, so leaving it without one
                strands the user on a page whose tabs never navigate away. */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                <IconButton
                    onClick={() => navigate("/dashboardmenu/complaints")}
                    aria-label="Back"
                    sx={{ mt: "-2px", ml: "-8px" }}
                >
                    <ArrowBackIcon sx={{ fontSize: "20px", color: C.text }} />
                </IconButton>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Typography
                            onClick={() => navigate("/dashboardmenu/complaints")}
                            sx={{
                                fontSize: "11px",
                                fontWeight: 500,
                                color: C.textFaint,
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            Dashboard
                        </Typography>
                        <ChevronRightOutlinedIcon sx={{ fontSize: "11px", color: C.textFaint }} />
                        <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#212121" }}>
                            Configuration
                        </Typography>
                    </Box>

                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        Configuration Hub
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Configure categories, assignments, permissions, SLA, escalation, notifications and
                        dashboard settings.
                    </Typography>
                </Box>
            </Box>

            {/* Section rail — underline tabs, scrollable rather than wrapping so the
                row keeps its single-line rhythm on narrow screens. */}
            <Box
                sx={{
                    alignSelf: "stretch",
                    px: 0.5,
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    overflowX: "auto",
                }}
            >
                {SECTIONS.map((s) => {
                    const isActive = s.key === section;
                    return (
                        <Box
                            key={s.key}
                            onClick={() => setSection(s.key)}
                            sx={{
                                px: 2,
                                py: 1.5,
                                boxSizing: "border-box",
                                borderBottom: `2px solid ${isActive ? accent : "transparent"}`,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? C.text : C.textMuted,
                                }}
                            >
                                {s.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Stream pills — which variant of the selected section to configure. */}
                <Box
                    sx={{
                        alignSelf: "flex-start",
                        maxWidth: "100%",
                        minHeight: 40,
                        p: 0.5,
                        boxSizing: "border-box",
                        bgcolor: C.surface,
                        borderRadius: "10px",
                        border: `1px solid ${C.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexWrap: "wrap",
                    }}
                >
                    {STREAMS.map((label) => {
                        const isActive = stream === label;
                        return (
                            <Box
                                key={label}
                                onClick={() => setStream(label)}
                                sx={{
                                    px: 2,
                                    py: "6px",
                                    boxSizing: "border-box",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    bgcolor: isActive ? accent : "transparent",
                                    transition: "background-color 0.2s",
                                    "&:hover": { bgcolor: isActive ? accent : "#F8FAFC" },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "13px",
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive ? C.tabActiveText : C.textMuted,
                                    }}
                                >
                                    {label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {/* Selected section. Keyed by section + stream so switching either
                    remounts the screen — several of them seed local state from their
                    props, which would otherwise keep the previous variant's values. */}
                {render ? (
                    <Box key={`${section}-${stream}`} sx={{ alignSelf: "stretch" }}>
                        {render()}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            py: 10,
                            alignSelf: "stretch",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", fontWeight: 400, color: C.textFaint }}>
                            {active.label} configuration for {stream} is coming soon.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
