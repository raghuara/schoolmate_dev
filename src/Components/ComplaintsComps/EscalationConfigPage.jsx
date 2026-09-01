import React, { useCallback, useEffect, useState } from "react";
import { Box, Breadcrumbs, Button, Link, Switch, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import toast from "react-hot-toast";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import useComplaintsPermissions from "./useComplaintsPermissions";
import { ESCALATION_TRIGGERS } from "./escalationConfigData";
import { MODULE, fetchEscalation, saveEscalation, triggerLabel } from "./complaintsConfigApi";

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
    /* One route serves both tabs, so the stream cannot be read from the URL — the hub
       passes it, and a direct visit falls back to the parent stream. */
    moduleType = MODULE.parent,
    // The comps' seed, shown until the fetch lands
    triggerList: seedTriggers = ESCALATION_TRIGGERS,
}) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Who may open and change these rules comes from the role permissions.
    const { canViewConfig, canEditConfig } = useComplaintsPermissions();

    /* Empty until the fetch lands. Seeding from the comps' mock made the screen render
       one set of rows and then visibly swap it for the server's — a flash of data that was
       never real. A loading line is honest; wrong content is not. */
    const [levels, setLevels] = useState([]);
    /* Rules keep the server's own rows so a save can send back thresholdMinutes untouched —
       the screen only edits the on/off flag. */
    const [rules, setRules] = useState([]);
    const [triggerList, setTriggerList] = useState([]);
    const [triggers, setTriggers] = useState(() =>
        seedTriggers.reduce((acc, t) => ({ ...acc, [t.key]: t.enabled }), {}),
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchEscalation({ moduleType });
        if (!result.ok) {
            setError(result.message);
            setLoading(false);
            return;
        }
        setError("");
        setLevels(
            (result.levels || []).map((lvl) => ({
                level: `Level ${lvl.levelNumber}`,
                levelNumber: lvl.levelNumber,
                role: lvl.roleName || "",
                userRollNumber: lvl.userRollNumber || "",
                description: lvl.description || "",
            })),
        );
        setRules(result.rules || []);
        setTriggerList(
            (result.rules || []).map((rule) => ({
                key: rule.triggerType,
                title: triggerLabel(rule.triggerType),
                description:
                    rule.thresholdMinutes != null
                        ? `Escalates after ${rule.thresholdMinutes} minutes.`
                        : "Escalates to the next level when this happens.",
            })),
        );
        setTriggers(
            (result.rules || []).reduce(
                (acc, rule) => ({ ...acc, [rule.triggerType]: rule.isEnabled === true }),
                {},
            ),
        );
        setLoading(false);
    }, [moduleType]);

    useEffect(() => {
        load();
    }, [load]);

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    const toggle = (key) => setTriggers((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleSave = async () => {
        const result = await saveEscalation({
            moduleType,
            /* Levels are not editable on this screen, so they go back exactly as they came
               — sending a trimmed version would drop the ladder. */
            levels: levels.map((lvl) => ({
                levelNumber: lvl.levelNumber,
                roleName: lvl.role,
                userRollNumber: lvl.userRollNumber || "",
                description: lvl.description,
            })),
            rules: rules.map((rule) => ({
                triggerType: rule.triggerType,
                thresholdMinutes: rule.thresholdMinutes ?? null,
                isEnabled: Boolean(triggers[rule.triggerType]),
            })),
        });
        if (!result.ok) {
            setError(result.message);
            toast.error(result.message);
            return;
        }
        setError("");
        toast.success("Escalation rules saved");
        load();
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
