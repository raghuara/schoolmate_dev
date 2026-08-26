import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, IconButton, Switch, TextField, Typography } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";

import { C } from "./complaintsTokens";
import { TEMPLATE_CHANNELS } from "./notificationTemplatesData";

// Edit dialog for one notification template, opened from the Notification
// Templates table.
//
// NOTE ON THE ACCENT: this comp uses #F5A623 for its primary button, the active
// toggle and the selected channel pill, where every other Complaints comp uses
// the brand #FCBE3A (websiteSettings.mainColor). Built literally to the comp —
// switch ACCENT to the store value if that divergence was unintentional.
const ACCENT = "#F5A623";

const CHANNEL_ICON = { PUSH: NotificationsNoneOutlinedIcon, SMS: SmsOutlinedIcon };

const labelSx = { fontSize: "13px", fontWeight: 600, color: C.text };

/* Field shell: label above, control below. */
function Field({ label, hint, children }) {
    return (
        <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1 }}>
            {hint ? (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                    <Typography sx={labelSx}>{label}</Typography>
                    <Typography sx={{ fontSize: "11px", fontWeight: 500, color: C.textMuted }}>
                        {hint}
                    </Typography>
                </Box>
            ) : (
                <Typography sx={labelSx}>{label}</Typography>
            )}
            {children}
        </Box>
    );
}

/* Pill toggle for one channel — filled when on, outlined when off. */
function ChannelPill({ channel, active, onToggle }) {
    const Icon = CHANNEL_ICON[channel.key];
    return (
        <Box
            onClick={onToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle();
                }
            }}
            sx={{
                px: 2,
                py: 1,
                borderRadius: "99px",
                boxSizing: "border-box",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                bgcolor: active ? ACCENT : "transparent",
                border: `1px solid ${active ? ACCENT : C.border}`,
                "&:focus-visible": { outline: `2px solid ${ACCENT}`, outlineOffset: 2 },
            }}
        >
            {Icon && <Icon sx={{ fontSize: "14px", color: active ? "#fff" : C.textMuted }} />}
            <Typography
                sx={{
                    fontSize: "13px",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#fff" : C.textMuted,
                }}
            >
                {channel.label}
            </Typography>
        </Box>
    );
}

export default function EditTemplateDialog({ open, template, onClose, onSave }) {
    const [draft, setDraft] = useState(null);

    // Reload the draft whenever a different template is opened, so edits are
    // discarded on cancel rather than leaking into the next row.
    useEffect(() => {
        if (open && template) setDraft({ ...template, channels: [...(template.channels || [])] });
    }, [open, template]);

    if (!draft) return null;

    const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

    const toggleChannel = (key) =>
        setDraft((prev) => ({
            ...prev,
            channels: prev.channels.includes(key)
                ? prev.channels.filter((c) => c !== key)
                : [...prev.channels, key],
        }));

    const isActive = draft.status === "ACTIVE";

    const inputSx = (filled) => ({
        "& .MuiOutlinedInput-root": {
            bgcolor: filled ? "#F8FAFC" : C.surface,
            borderRadius: "8px",
            alignItems: "flex-start",
            "& fieldset": { borderColor: C.border },
            "&:hover fieldset": { borderColor: C.border },
            "&.Mui-focused fieldset": { borderColor: ACCENT },
        },
        "& .MuiOutlinedInput-input": {
            p: "10px 14px",
            fontSize: "14px",
            fontWeight: 400,
            color: C.text,
        },
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: 640,
                        maxWidth: "100%",
                        m: 2,
                        borderRadius: "16px",
                        // `overflow: hidden` keeps the corners clipped, so the paper
                        // itself can never scroll — it is a flex column and only the
                        // body below scrolls, pinning the header and footer.
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "calc(100% - 32px)",
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
                    },
                },
                backdrop: { sx: { bgcolor: "rgba(15, 23, 42, 0.60)" } },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 3,
                    py: 2.5,
                    flexShrink: 0,
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
                    Edit Template
                </Typography>
                <IconButton
                    onClick={onClose}
                    aria-label="Close"
                    sx={{ p: "6px", bgcolor: "#F4F6FA", "&:hover": { bgcolor: "#EDF1F7" } }}
                >
                    <CloseOutlinedIcon sx={{ fontSize: "16px", color: C.textMuted }} />
                </IconButton>
            </Box>

            {/* Body — the only scrolling region */}
            <Box
                sx={{
                    p: "28px",
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                }}
            >
                {/* Read-only in the comp — the fill is #F8FAFC where the editable
                    fields are white, and templates are system-named. */}
                {/* Read-only in the comp, but `disabled` would dim the text —
                    the comp shows it at full strength, so readOnly it is. */}
                <Field label="Template Name">
                    <TextField
                        value={draft.name}
                        fullWidth
                        slotProps={{ input: { readOnly: true } }}
                        sx={inputSx(true)}
                    />
                </Field>

                <Field label="Active Channels">
                    <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                        {TEMPLATE_CHANNELS.map((ch) => (
                            <ChannelPill
                                key={ch.key}
                                channel={ch}
                                active={draft.channels.includes(ch.key)}
                                onToggle={() => toggleChannel(ch.key)}
                            />
                        ))}
                    </Box>
                </Field>

                <Field label="Subject Line">
                    <TextField
                        value={draft.subject || ""}
                        onChange={(e) => set("subject", e.target.value)}
                        fullWidth
                        sx={inputSx(false)}
                    />
                </Field>

                <Field label="Message Body" hint="Supports markdown & variables">
                    <TextField
                        value={draft.body || ""}
                        onChange={(e) => set("body", e.target.value)}
                        fullWidth
                        multiline
                        minRows={8}
                        sx={{
                            ...inputSx(false),
                            "& .MuiOutlinedInput-input": {
                                p: 0,
                                fontSize: "13px",
                                fontWeight: 400,
                                lineHeight: "20px",
                                color: C.text,
                            },
                            "& .MuiOutlinedInput-root": {
                                ...inputSx(false)["& .MuiOutlinedInput-root"],
                                p: "14px",
                            },
                        }}
                    />
                </Field>

                {/* Active status */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <Typography sx={labelSx}>Active Status</Typography>
                        <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                            When active, system will trigger notifications automatically.
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                            sx={{ fontSize: "13px", fontWeight: 600, color: isActive ? ACCENT : C.textMuted }}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </Typography>
                        <Switch
                            checked={isActive}
                            onChange={(e) => set("status", e.target.checked ? "ACTIVE" : "INACTIVE")}
                            disableRipple
                            inputProps={{ "aria-label": "Active status" }}
                            sx={{
                                width: 44,
                                height: 24,
                                p: 0,
                                "& .MuiSwitch-switchBase": {
                                    p: 0,
                                    m: "2px",
                                    "&.Mui-checked": {
                                        transform: "translateX(20px)",
                                        color: "#fff",
                                        "& + .MuiSwitch-track": { bgcolor: ACCENT, opacity: 1 },
                                    },
                                },
                                "& .MuiSwitch-thumb": { width: 20, height: 20, boxShadow: "none", color: "#fff" },
                                "& .MuiSwitch-track": { borderRadius: "12px", bgcolor: C.border, opacity: 1 },
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    px: 3,
                    py: 2.5,
                    flexShrink: 0,
                    bgcolor: "#F8FAFC",
                    borderTop: `1px solid ${C.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Button
                    onClick={onClose}
                    sx={{
                        px: 2.5,
                        py: 1.25,
                        borderRadius: "8px",
                        border: `1px solid ${C.textMuted}`,
                        color: C.textMuted,
                        fontSize: "14px",
                        fontWeight: 600,
                        textTransform: "none",
                        boxSizing: "border-box",
                        "&:hover": { bgcolor: "#EDF1F7", border: `1px solid ${C.textMuted}` },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => onSave(draft)}
                    endIcon={<CheckOutlinedIcon sx={{ fontSize: "14px" }} />}
                    sx={{
                        px: 3,
                        py: 1.25,
                        borderRadius: "8px",
                        bgcolor: ACCENT,
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: 700,
                        textTransform: "none",
                        boxSizing: "border-box",
                        "&:hover": { bgcolor: "#E0951C" },
                    }}
                >
                    Save Changes
                </Button>
            </Box>
        </Dialog>
    );
}
