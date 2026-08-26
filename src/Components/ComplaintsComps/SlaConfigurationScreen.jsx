import React, { useState } from "react";
import { Box, Button, Switch, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import toast from "react-hot-toast";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, TINT, CARD_SHADOW } from "./complaintsTokens";
import ComplaintsBreadcrumb from "./ComplaintsBreadcrumb";
import useComplaintsPermissions from "./useComplaintsPermissions";
import { PRIORITY_STYLE } from "./complaintCategoriesData";
import { SLA_FIELDS } from "./slaConfigData";

// Priority-band deadlines plus the working-hours rules. Written to serve both the
// parent-side and internal (School Operations) SLA comps — they are the same
// screen with different copy, a different pause-toggle set and an optional Reset.
//
// The comps draw the deadline values as static text, but the screen carries a
// save action — so they are real inputs here.

const cardSx = {
    alignSelf: "stretch",
    p: 2.5,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: CARD_SHADOW,
    display: "flex",
    flexDirection: "column",
    gap: 2,
};

const fieldLabelSx = {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    color: C.textMuted,
};

/* Input styled to the comp: #F4F6FA fill, 6px radius, 8/12 padding. */
function RuleField({ label, value, onChange, disabled }) {
    return (
        <Box sx={{ flex: "1 1 0", minWidth: 140, display: "flex", flexDirection: "column", gap: "6px" }}>
            <Typography sx={fieldLabelSx}>{label}</Typography>
            <TextField
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                fullWidth
                sx={{
                    "& .MuiOutlinedInput-root": {
                        bgcolor: "#F4F6FA",
                        borderRadius: "6px",
                        "& fieldset": { borderColor: C.border },
                        "&:hover fieldset": { borderColor: C.border },
                    },
                    "& .MuiOutlinedInput-input": {
                        p: "8px 12px",
                        fontSize: "13px",
                        fontWeight: 400,
                        color: C.text,
                    },
                }}
            />
        </Box>
    );
}

/* 38x20 track with a 16px thumb — MUI's Switch resized to the comp. */
function RuleSwitch({ checked, onChange, label, accent, disabled }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Switch
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                disableRipple
                sx={{
                    width: 38,
                    height: 20,
                    p: 0,
                    "& .MuiSwitch-switchBase": {
                        p: 0,
                        m: "2px",
                        "&.Mui-checked": {
                            transform: "translateX(18px)",
                            color: "#fff",
                            "& + .MuiSwitch-track": { bgcolor: accent, opacity: 1 },
                        },
                    },
                    "& .MuiSwitch-thumb": { width: 16, height: 16, boxShadow: "none", color: "#fff" },
                    "& .MuiSwitch-track": { borderRadius: "10px", bgcolor: C.border, opacity: 1 },
                }}
            />
            <Typography sx={{ fontSize: "13px", fontWeight: 500, color: C.text }}>{label}</Typography>
        </Box>
    );
}

export default function SlaConfigurationScreen({
    trail,
    currentCrumbColor,
    title,
    subtitle,
    initialRules,
    initialWorking,
    pauseToggles,
    showReset = false,
}) {
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const { canViewConfig, canEditConfig } = useComplaintsPermissions();

    const [rules, setRules] = useState(initialRules);
    const [working, setWorking] = useState(initialWorking);

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    const setRuleValue = (ruleKey, fieldKey, value) =>
        setRules((prev) =>
            prev.map((r) => (r.key === ruleKey ? { ...r, values: { ...r.values, [fieldKey]: value } } : r)),
        );

    const setWorkingValue = (key, value) => setWorking((prev) => ({ ...prev, [key]: value }));

    const resetChanges = () => {
        setRules(initialRules);
        setWorking(initialWorking);
    };

    const saveChanges = () => {
        // TODO: PUT { rules, working } to the SLA settings endpoint.
        toast.success("SLA configuration saved");
    };

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title + blurb */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <ComplaintsBreadcrumb trail={trail} currentColor={currentCrumbColor} />
                <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                    {subtitle}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* One card per priority band */}
                {rules.map((rule) => {
                    const tone = PRIORITY_STYLE[rule.badge] || { bg: C.track, color: C.textMuted };
                    return (
                        <Box key={rule.key} sx={cardSx}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            p: 1,
                                            bgcolor: TINT.accent,
                                            borderRadius: "8px",
                                            boxSizing: "border-box",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <ScheduleOutlinedIcon sx={{ fontSize: "16px", color: accent }} />
                                    </Box>
                                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                                        {rule.title}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        px: "8px",
                                        py: "2px",
                                        bgcolor: tone.bg,
                                        borderRadius: "4px",
                                        boxSizing: "border-box",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            color: tone.color,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {rule.badge}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "14px", flexWrap: "wrap" }}>
                                {SLA_FIELDS.map((f) => (
                                    <RuleField
                                        key={f.key}
                                        label={f.label}
                                        value={rule.values[f.key]}
                                        disabled={!canEditConfig}
                                        onChange={(v) => setRuleValue(rule.key, f.key, v)}
                                    />
                                ))}
                            </Box>
                        </Box>
                    );
                })}

                {/* Working hours & system rules */}
                <Box sx={cardSx}>
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                        Working Hours &amp; System Rules
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, flexWrap: "wrap" }}>
                        <RuleField
                            label="Working Days"
                            value={working.workingDays}
                            disabled={!canEditConfig}
                            onChange={(v) => setWorkingValue("workingDays", v)}
                        />
                        <RuleField
                            label="Working Hours"
                            value={working.workingHours}
                            disabled={!canEditConfig}
                            onChange={(v) => setWorkingValue("workingHours", v)}
                        />
                    </Box>

                    <Box sx={{ pt: 1, display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                        {pauseToggles.map((t) => (
                            <RuleSwitch
                                key={t.key}
                                checked={!!working[t.key]}
                                disabled={!canEditConfig}
                                onChange={(e) => setWorkingValue(t.key, e.target.checked)}
                                label={t.label}
                                accent={accent}
                            />
                        ))}
                    </Box>
                </Box>

                {canEditConfig && (
                    <Box sx={{ pt: 1, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                        {showReset && (
                            <Button
                                onClick={resetChanges}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: "8px",
                                    border: `1px solid ${C.textMuted}`,
                                    color: C.textMuted,
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    boxSizing: "border-box",
                                    "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.textMuted}` },
                                }}
                            >
                                Reset
                            </Button>
                        )}
                        <Button
                            onClick={saveChanges}
                            sx={{
                                px: 3,
                                py: 1.5,
                                bgcolor: accent,
                                color: "#191C1E",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: 600,
                                textTransform: "none",
                                boxSizing: "border-box",
                                "&:hover": { bgcolor: websiteSettings.darkColor },
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
