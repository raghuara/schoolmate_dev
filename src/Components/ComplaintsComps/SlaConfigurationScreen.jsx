import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";
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
import {
    DURATION_UNITS,
    fetchSla,
    minutesToParts,
    partsToMinutes,
    saveSla,
    slaPolicyToValues,
    valuesToSlaPolicy,
} from "./complaintsConfigApi";

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
function RuleField({ label, minutes, onChange, disabled = false }) {
    /* A number and a unit rather than free text: there is nothing to spell, so a typo
       cannot become a wrong deadline and no parser has to guess at one. */
    const { amount, unit } = minutesToParts(minutes);
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
            <Box sx={{ display: "flex", gap: "6px" }}>
                <TextField
                    type="number"
                    value={amount}
                    onChange={(e) => onChange(partsToMinutes(e.target.value, unit))}
                    disabled={disabled}
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                            bgcolor: "#F4F6FA",
                            borderRadius: "6px",
                            "& fieldset": { borderColor: C.border },
                            "&:hover fieldset": { borderColor: C.border },
                        },
                        "& .MuiOutlinedInput-input": { p: "8px 10px", fontSize: "13px" },
                    }}
                />
                <Select
                    value={unit}
                    onChange={(e) => onChange(partsToMinutes(amount, e.target.value))}
                    disabled={disabled}
                    sx={{
                        width: 84,
                        bgcolor: "#F4F6FA",
                        borderRadius: "6px",
                        fontSize: "13px",
                        "& .MuiOutlinedInput-input": { p: "8px 10px" },
                        "& fieldset": { borderColor: C.border },
                        "&:hover fieldset": { borderColor: C.border },
                    }}
                >
                    {DURATION_UNITS.map((u) => (
                        <MenuItem key={u.key} value={u.key} sx={{ fontSize: "13px" }}>
                            {u.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        </Box>
    );
}


/* Plain text, for the working-calendar fields that are not durations. */
function TextRuleField({ label, value, onChange, disabled = false }) {
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
                value={value ?? ""}
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
                    "& .MuiOutlinedInput-input": { p: "8px 12px", fontSize: "13px" },
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
    // Rendered inside the Configuration Hub: the hub owns the page chrome,
    // so the screen drops its own padding, breadcrumb and title.
    embedded = false,
    trail,
    currentCrumbColor,
    title,
    subtitle,
    /* Which stream to configure — the SLA endpoints serve both and are told apart by
       moduleType. `initialRules` / `initialWorking` remain as the shape to render before
       the fetch lands. */
    moduleType,
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
    const [serverRules, setServerRules] = useState(initialRules);
    const [serverWorking, setServerWorking] = useState(initialWorking);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        if (!moduleType) return;
        setLoading(true);
        const result = await fetchSla({ moduleType });
        if (!result.ok) {
            setError(result.message);
            setLoading(false);
            return;
        }
        setError("");
        const nextRules = (result.policies || []).map((policy) => ({
            key: String(policy.priority || "").toLowerCase(),
            title: `${policy.priority} Priority Rules`,
            badge: String(policy.priority || "").toUpperCase(),
            values: slaPolicyToValues(policy),
        }));
        const nextWorking = {
            workingDays: result.workingDays,
            workingHours: `${result.workingDayStart} - ${result.workingDayEnd}`,
            pauseWeekends: result.pauseOnWeekends,
            pauseHolidays: result.pauseOnSchoolHolidays,
            pauseOutsideHours: result.pauseOutsideWorkingHours,
            workingDayStart: result.workingDayStart,
            workingDayEnd: result.workingDayEnd,
            timeZoneId: result.timeZoneId,
        };
        setRules(nextRules);
        setWorking(nextWorking);
        // Reset returns to what the server sent, not to the comps' seed
        setServerRules(nextRules);
        setServerWorking(nextWorking);
        setLoading(false);
    }, [moduleType]);

    useEffect(() => {
        load();
    }, [load]);

    if (!canViewConfig) return <Navigate to="/dashboardmenu/dashboard" replace />;

    const setRuleValue = (ruleKey, fieldKey, value) =>
        setRules((prev) =>
            prev.map((r) => (r.key === ruleKey ? { ...r, values: { ...r.values, [fieldKey]: value } } : r)),
        );

    const setWorkingValue = (key, value) => setWorking((prev) => ({ ...prev, [key]: value }));

    const resetChanges = () => {
        setRules(serverRules);
        setWorking(serverWorking);
        setError("");
    };

    const saveChanges = async () => {
        /* Deadlines are edited as text and stored as minutes. One unreadable field stops
           the whole save — a partial policy would leave a deadline nobody chose. */
        const policies = [];
        for (const rule of rules) {
            const priority = rule.badge
                ? rule.badge.charAt(0) + rule.badge.slice(1).toLowerCase()
                : rule.title;
            const policy = valuesToSlaPolicy(priority, rule.values);
            if (!policy) {
                setError(`${priority}: every deadline must read like "30 min", "2 hrs" or "3 days".`);
                return;
            }
            policies.push(policy);
        }

        setSaving(true);
        const result = await saveSla({
            moduleType,
            settings: {
                workingDays: working.workingDays,
                workingDayStart: working.workingDayStart,
                workingDayEnd: working.workingDayEnd,
                pauseOnWeekends: working.pauseWeekends,
                pauseOnSchoolHolidays: working.pauseHolidays,
                pauseOutsideWorkingHours: working.pauseOutsideHours !== false,
                timeZoneId: working.timeZoneId,
                policies,
            },
        });
        setSaving(false);
        if (!result.ok) {
            setError(result.message);
            toast.error(result.message);
            return;
        }
        setError("");
        toast.success("SLA configuration saved");
        load();
    };

    return (
        <Box sx={{ p: embedded ? 0 : "28px", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Breadcrumb + title + blurb */}
            {!embedded && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <ComplaintsBreadcrumb trail={trail} currentColor={currentCrumbColor} />
                    <Typography sx={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                        {subtitle}
                    </Typography>
                </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                {/* The bands render with empty fields until the policy lands, so say why
                    rather than showing blanks that look like a policy of "no deadline". */}
                {loading && (
                    <Typography sx={{ fontSize: "13px", color: C.textMuted }}>
                        Loading SLA policy&hellip;
                    </Typography>
                )}

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
                                        minutes={rule.values[f.key]}
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
                        <TextRuleField
                            label="Working Days"
                            value={working.workingDays}
                            disabled={!canEditConfig}
                            onChange={(v) => setWorkingValue("workingDays", v)}
                        />
                        <TextRuleField
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
