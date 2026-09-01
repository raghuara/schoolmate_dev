import React, { useCallback, useEffect, useState } from "react";
import { Box, Breadcrumbs, Button, Link, Switch, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import useComplaintsPermissions from "./useComplaintsPermissions";
import { MODULE, fetchDashboardWidgets, saveDashboardWidgets } from "./complaintsConfigApi";

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
    /* Both streams share these endpoints and are told apart by moduleType. */
    moduleType = MODULE.parent,
    // The comps' seed, shown until the fetch lands
}) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Who may open and change this comes from the role permissions.
    const { canViewConfig, canEditConfig } = useComplaintsPermissions();

    /* Empty until the fetch lands. Seeding from the comps' mock made the screen render
       one set of rows and then visibly swap it for the server's — a flash of data that was
       never real. A loading line is honest; wrong content is not. */
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* Empty until the fetch lands — the server owns which widgets exist and which are
       on, so there is nothing to seed from. */
    const [widgets, setWidgets] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchDashboardWidgets({ moduleType });
        if (!result.ok) {
            setError(result.message);
        } else {
            setError("");
            setList(result.widgets);
            setWidgets(result.widgets.reduce((acc, w) => ({ ...acc, [w.key]: w.enabled }), {}));
        }
        setLoading(false);
    }, [moduleType]);

    useEffect(() => {
        load();
    }, [load]);

    const toggle = (key) => setWidgets((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleSave = async () => {
        const result = await saveDashboardWidgets({
            moduleType,
            /* Every widget is sent, not just the enabled ones — a widget switched off is a
               real change. displayOrder goes back untouched; this screen does not reorder. */
            widgets: list.map((w) => ({
                widgetCode: w.widgetCode,
                isEnabled: Boolean(widgets[w.key]),
                displayOrder: w.displayOrder,
            })),
        });
        if (!result.ok) {
            setError(result.message);
            toast.error(result.message);
            return;
        }
        setError("");
        toast.success("Dashboard configuration saved");
        load();
    };

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

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
                    {loading && (
                        <Typography sx={{ p: 2, fontSize: "13px", color: C.textMuted }}>
                            Loading dashboard settings…
                        </Typography>
                    )}
                    {!loading && error && (
                        <Typography sx={{ p: 2, fontSize: "13px", color: C.red }}>{error}</Typography>
                    )}
                    {!loading && list.map((w) => (
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
