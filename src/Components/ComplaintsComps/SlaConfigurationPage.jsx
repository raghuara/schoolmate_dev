import React, { useState } from "react";
import { Box, Button, Switch, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, TINT, CARD_SHADOW } from "./complaintsTokens";
import ComplaintsBreadcrumb from "./ComplaintsBreadcrumb";
import { PRIORITY_STYLE } from "./complaintCategoriesData";
import { SLA_FIELDS, DEFAULT_SLA_RULES, DEFAULT_WORKING_RULES } from "./slaConfigData";

// Reached from the "SLA Configuration" tile on the Configurations screen.
// The comp draws the deadline values as static text, but the screen carries a
// "Save Changes" action — so they are real inputs here.

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
function RuleField({ label, value, onChange }) {
    return (
        <Box
            sx={{
                flex: "1 1 0",
                minWidth: 140,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
            }}
        >
            <Typography sx={fieldLabelSx}>{label}</Typography>
            <TextField
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
function RuleSwitch({ checked, onChange, label, accent }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Switch
                checked={checked}
                onChange={onChange}
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
            <Typography sx={{ fontSize: "13px", fontWeight: 500, color: C.text }}>
                {label}
            </Typography>
        </Box>
    );
}

export default function SlaConfigurationPage({ embedded = false }) {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const [rules, setRules] = useState(DEFAULT_SLA_RULES);
    const [working, setWorking] = useState(DEFAULT_WORKING_RULES);

    const setRuleValue = (ruleKey, fieldKey, value) =>
        setRules((prev) =>
            prev.map((r) =>
                r.key === ruleKey ? { ...r, values: { ...r.values, [fieldKey]: value } } : r,
            ),
        );

    const setWorkingValue = (key, value) => setWorking((prev) => ({ ...prev, [key]: value }));

    // No endpoint yet — wire this to the SLA settings API when it lands.
    const saveChanges = () => {};

    return (
        <Box sx={{ p: embedded ? 0 : "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title + blurb */}
            {!embedded && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <ComplaintsBreadcrumb
                        currentColor={accent}
                        trail={[
                            { label: "Administration" },
                            {
                                label: "Complaint Configuration",
                                onClick: () => navigate("/dashboardmenu/complaints/configuration"),
                            },
                            { label: "SLA Configuration" },
                        ]}
                    />
                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        SLA Configuration
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        Configure complaint response and resolution deadlines by priority.
                    </Typography>
                </Box>
            )}

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

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
                        <RuleField
                            label="Working Days"
                            value={working.workingDays}
                            onChange={(v) => setWorkingValue("workingDays", v)}
                        />
                        <RuleField
                            label="Working Hours"
                            value={working.workingHours}
                            onChange={(v) => setWorkingValue("workingHours", v)}
                        />
                        {/* The comp nudges this column down 18px so the switches sit on
                            the same line as the inputs rather than their labels. */}
                        <Box
                            sx={{
                                flex: "1 1 0",
                                minWidth: 280,
                                pt: { xs: 0, md: "18px" },
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                flexWrap: "wrap",
                            }}
                        >
                            <RuleSwitch
                                checked={working.pauseWeekends}
                                onChange={(e) => setWorkingValue("pauseWeekends", e.target.checked)}
                                label="Pause SLA on Weekends"
                                accent={accent}
                            />
                            <RuleSwitch
                                checked={working.pauseHolidays}
                                onChange={(e) => setWorkingValue("pauseHolidays", e.target.checked)}
                                label="Pause SLA on Holidays"
                                accent={accent}
                            />
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ pt: 1, display: "flex", justifyContent: "flex-end" }}>
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
            </Box>
        </Box>
    );
}
