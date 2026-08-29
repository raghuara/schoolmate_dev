import React, { useState } from "react";
import { Box, Breadcrumbs, Button, Link, Switch, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import toast from "react-hot-toast";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import useComplaintsPermissions from "./useComplaintsPermissions";
import { ESCALATION_LEVELS, ESCALATION_TRIGGERS } from "./escalationConfigData";

// The Figma frame includes the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this page starts
// at the breadcrumb.

const sectionCardSx = {
    alignSelf: "stretch",
    p: 3,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: CARD_SHADOW,
    display: "flex",
    flexDirection: "column",
};

/* Figma's toggle: 38x20 track, 16px thumb, accent when on / slate when off. */
const trackSwitchSx = (accent) => ({
    width: 38,
    height: 20,
    p: 0,
    "& .MuiSwitch-switchBase": {
        p: "2px",
        "&.Mui-checked": {
            transform: "translateX(18px)",
            color: "#FFFFFF",
            "& + .MuiSwitch-track": { bgcolor: accent, opacity: 1 },
        },
    },
    "& .MuiSwitch-thumb": { width: 16, height: 16, boxShadow: "none" },
    "& .MuiSwitch-track": { borderRadius: "10px", bgcolor: C.textFaint, opacity: 1 },
});

// Parent and Staff Concerns escalate through the same shape of screen — a role
// ladder plus a set of automatic triggers — so the two variants differ only in
// the data and copy passed in. Defaults are the School Operations set.
export default function EscalationConfigPage({
    // Rendered inside the Configuration Hub: the hub owns the page chrome,
    // so the screen drops its own padding, breadcrumb and title.
    embedded = false,
    crumbLabel = "Complaint Configuration",
    subtitle = "Configure when actions should be escalated and who receives them.",
    levels = ESCALATION_LEVELS,
    triggerList = ESCALATION_TRIGGERS,
    // Each variant owns its own write path. Receives the { [key]: boolean } map.
    onSave = null,
}) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Who may open and change these rules comes from the role permissions.
    const { canViewConfig, canEditConfig } = useComplaintsPermissions();

    const [triggers, setTriggers] = useState(() =>
        triggerList.reduce((acc, t) => ({ ...acc, [t.key]: t.enabled }), {}),
    );

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    const toggle = (key) => setTriggers((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleSave = () => {
        if (onSave) {
            onSave(triggers);
            return;
        }
        // No caller supplied a save yet — leave the existing placeholder behaviour.
        toast.success("Escalation rules saved");
    };

    return (
        <Box sx={{ p: embedded ? 0 : "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title */}
            {!embedded && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Breadcrumbs
                        separator=">"
                        sx={{ "& .MuiBreadcrumbs-separator": { color: C.textFaint, fontSize: "11px", mx: "4px" } }}
                    >
                        <Link
                            component="button"
                            underline="hover"
                            onClick={() => navigate(-2)}
                            sx={{ fontSize: "11px", fontWeight: 500, color: C.textFaint }}
                        >
                            Administration
                        </Link>
                        <Link
                            component="button"
                            underline="hover"
                            onClick={() => navigate(-1)}
                            sx={{ fontSize: "11px", fontWeight: 500, color: C.textFaint }}
                        >
                            Complaint Configuration
                        </Link>
                        <Typography sx={{ fontSize: "11px", fontWeight: 600, color: accent }}>
                            Escalation Configuration
                        </Typography>
                    </Breadcrumbs>

                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        Escalation Configuration
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Configure when actions should be escalated and who receives them.
                    </Typography>
                </Box>
            )}

            {/* Escalation hierarchy */}
            <Box sx={{ ...sectionCardSx, gap: 2.5 }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                    Escalation Hierarchy
                </Typography>

                {/* Figma lays the three levels in one row with arrows between; on narrow
                    screens they stack and the arrows rotate to point down. */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: { xs: "stretch", md: "center" },
                        gap: 2,
                    }}
                >
                    {levels.map((lvl, i) => (
                        <React.Fragment key={lvl.level}>
                            <Box
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    p: 2,
                                    boxSizing: "border-box",
                                    bgcolor: "#F4F6FA",
                                    borderRadius: "8px",
                                    border: `1px solid ${C.border}`,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        color: accent,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {lvl.level}
                                </Typography>
                                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                                    {lvl.role}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>
                                    {lvl.description}
                                </Typography>
                            </Box>

                            {i < levels.length - 1 && (
                                <ArrowForwardIcon
                                    sx={{
                                        fontSize: "16px",
                                        color: C.textFaint,
                                        flexShrink: 0,
                                        alignSelf: "center",
                                        transform: { xs: "rotate(90deg)", md: "none" },
                                    }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </Box>
            </Box>

            {/* Automatic triggers */}
            <Box sx={{ ...sectionCardSx, gap: 2 }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                    Automatic Escalation Triggers &amp; System Rules
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {triggerList.map((t) => {
                        const on = triggers[t.key];
                        return (
                            <Box
                                key={t.key}
                                sx={{
                                    p: 2,
                                    borderBottom: `1px solid ${C.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    // The comp dims rules that are switched off.
                                    opacity: on ? 1 : 0.5,
                                    transition: "opacity 0.2s",
                                }}
                            >
                                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
                                        {t.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>
                                        {t.description}
                                    </Typography>
                                </Box>
                                <Switch
                                    checked={!!on}
                                    onChange={() => toggle(t.key)}
                                    disabled={!canEditConfig}
                                    sx={trackSwitchSx(accent)}
                                />
                            </Box>
                        );
                    })}
                </Box>

                {canEditConfig && (
                    <Box sx={{ pt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            onClick={handleSave}
                            sx={{
                                px: 3,
                                py: 1.5,
                                bgcolor: accent,
                                color: "#191C1E",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: 600,
                                textTransform: "none",
                                "&:hover": { bgcolor: websiteSettings.darkColor },
                            }}
                        >
                            Save Escalation Rules
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
