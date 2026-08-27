import React, { useState } from "react";
import { Box, Breadcrumbs, Button, Link, Switch, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import useComplaintsPermissions from "./useComplaintsPermissions";
import { DASHBOARD_WIDGETS } from "./dashboardConfigData";

// The Figma frame includes the global top bar (Welcome back / search / avatar).
// DashBoardLayout already renders that via DashBoardHeader, so this page starts
// at the breadcrumb.

/* Figma's toggle here: 40x22 track, 18px thumb, accent on / #E2E8F0 off. */
const widgetSwitchSx = (accent) => ({
    width: 40,
    height: 22,
    p: 0,
    flexShrink: 0,
    "& .MuiSwitch-switchBase": {
        p: "2px",
        "&.Mui-checked": {
            transform: "translateX(18px)",
            color: "#FFFFFF",
            "& + .MuiSwitch-track": { bgcolor: accent, opacity: 1 },
        },
    },
    "& .MuiSwitch-thumb": { width: 18, height: 18, boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.12)" },
    "& .MuiSwitch-track": { borderRadius: "11px", bgcolor: "#E2E8F0", opacity: 1 },
});

// The Parent and Internal comps for this screen are identical apart from their
// copy and their widget list, so the props below carry the differences and
// default to the Parent values — the Parent route renders it with no props.
export default function DashboardConfigPage({
    // Rendered inside the Configuration Hub: the hub owns the page chrome,
    // so the screen drops its own padding, breadcrumb and title.
    embedded = false,
    crumbLabel = "Dashboard Configuration",
    title = "Dashboard Configuration",
    subtitle = "Configure which complaint metrics and widgets are visible to Management.",
    widgetList = DASHBOARD_WIDGETS,
    // Each variant owns its own write path — Parent and Internal save to different
    // endpoints. Receives the { [widgetKey]: boolean } map. Falling back to a toast
    // keeps today's behaviour until a caller supplies the real call.
    onSave = null,
}) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Who may open and change this comes from the role permissions.
    const { canViewConfig, canEditConfig } = useComplaintsPermissions();

    // Re-seed when a different widget list is passed in, so the two variants do
    // not share stale toggle state.
    const [widgets, setWidgets] = useState(() =>
        widgetList.reduce((acc, w) => ({ ...acc, [w.key]: w.enabled }), {}),
    );

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    const toggle = (key) => setWidgets((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleSave = () => {
        if (onSave) {
            onSave(widgets);
            return;
        }
        // No caller supplied a save yet — leave the existing placeholder behaviour.
        toast.success("Dashboard configuration saved");
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
                        <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#212121" }}>
                            {crumbLabel}
                        </Typography>
                    </Breadcrumbs>

                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        {subtitle}
                    </Typography>
                </Box>
            )}

            {/* Widget list */}
            <Box
                sx={{
                    alignSelf: "stretch",
                    p: 3,
                    boxSizing: "border-box",
                    bgcolor: C.surface,
                    borderRadius: "16px",
                    border: `1px solid ${C.border}`,
                    boxShadow: CARD_SHADOW,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {widgetList.map((w) => (
                        <Box
                            key={w.key}
                            sx={{
                                px: 2,
                                py: 1.5,
                                boxSizing: "border-box",
                                bgcolor: "#F4F6FA",
                                borderRadius: "12px",
                                border: `1px solid ${C.border}`,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                                    {w.title}
                                </Typography>
                                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                                    {w.description}
                                </Typography>
                            </Box>
                            <Switch
                                checked={!!widgets[w.key]}
                                onChange={() => toggle(w.key)}
                                disabled={!canEditConfig}
                                sx={widgetSwitchSx(accent)}
                            />
                        </Box>
                    ))}
                </Box>

                {canEditConfig && (
                    <Box
                        sx={{
                            pt: 2,
                            borderTop: `1px solid ${C.border}`,
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button
                            onClick={handleSave}
                            sx={{
                                px: 3,
                                py: 1.5,
                                bgcolor: accent,
                                color: "#191C1E",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: 600,
                                textTransform: "none",
                                "&:hover": { bgcolor: websiteSettings.darkColor },
                            }}
                        >
                            Save Configuration
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
