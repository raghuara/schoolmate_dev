import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    IconButton,
    MenuItem,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import { PRIORITY_OPTIONS, SLA_OPTIONS } from "./internalCategoriesData";

// Create form for an Internal Complaints category, opened from "Add Category" on
// the Internal Categories screen. Distinct from AddCategoryDrawer, which serves
// the Parent Categories screen — this one is a centred dialog and carries
// Resolution SLA, Department and a segmented status control.
//
// Width is not in the export (the frame is 100% of its container); 560 keeps the
// two-up SLA/Department row comfortable.
const DIALOG_WIDTH = 560;

const EMPTY = {
    name: "",
    description: "",
    priority: "Normal",
    owner: "",
    sla: "3 Days",
    department: "",
    status: "ACTIVE",
};

const labelSx = { fontSize: "13px", fontWeight: 600, color: C.text };

function Field({ label, children, sx }) {
    return (
        <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "6px", ...sx }}>
            <Typography sx={labelSx}>{label}</Typography>
            {children}
        </Box>
    );
}

export default function CreateCategoryDialog({
    open,
    onClose,
    onSave,
    ownerOptions = [],
    departmentOptions = [],
}) {
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const [draft, setDraft] = useState(EMPTY);

    // Reset on each open so a cancelled entry never carries into the next one.
    useEffect(() => {
        if (open) setDraft(EMPTY);
    }, [open]);

    const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

    // Category Name is the only field the comp marks required (*).
    const canSave = draft.name.trim().length > 0;

    const controlSx = {
        height: 38,
        boxSizing: "border-box",
        bgcolor: C.surface,
        borderRadius: "6px",
        fontSize: "13px",
        "& .MuiOutlinedInput-input": { p: "0 12px", display: "flex", alignItems: "center" },
        "& fieldset": { borderColor: C.border },
        "&:hover fieldset": { borderColor: C.border },
        "& .MuiSelect-icon": { color: C.textMuted, fontSize: "16px" },
    };

    const textFieldSx = {
        "& .MuiOutlinedInput-root": {
            height: 38,
            boxSizing: "border-box",
            bgcolor: C.surface,
            borderRadius: "6px",
            fontSize: "13px",
            "& fieldset": { borderColor: C.border },
            "&:hover fieldset": { borderColor: C.border },
        },
        "& .MuiOutlinedInput-input": { p: "0 12px", color: C.text },
        // This comp uses #64748B for placeholders, a shade darker than the
        // #94A3B8 the Parent "Add Category" drawer uses.
        "& .MuiOutlinedInput-input::placeholder": { color: C.textMuted, opacity: 1 },
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: DIALOG_WIDTH,
                        maxWidth: "100%",
                        m: 2,
                        borderRadius: "12px",
                        // Header and footer stay pinned; only the body scrolls.
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "calc(100% - 32px)",
                        boxShadow: CARD_SHADOW,
                    },
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 3,
                    py: "18px",
                    flexShrink: 0,
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
                    Create Category
                </Typography>
                <IconButton onClick={onClose} aria-label="Close" sx={{ p: 0.5 }}>
                    <CloseOutlinedIcon sx={{ fontSize: "14px", color: C.textMuted }} />
                </IconButton>
            </Box>

            {/* Body */}
            <Box
                sx={{
                    p: 3,
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <Field label="Category Name *">
                    <TextField
                        value={draft.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="e.g. Infrastructure & Maintenance"
                        fullWidth
                        sx={textFieldSx}
                    />
                </Field>

                <Field label="Description">
                    <TextField
                        value={draft.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Describe the scope of this operations category..."
                        fullWidth
                        multiline
                        rows={3}
                        sx={{
                            ...textFieldSx,
                            "& .MuiOutlinedInput-root": {
                                boxSizing: "border-box",
                                bgcolor: C.surface,
                                borderRadius: "6px",
                                fontSize: "13px",
                                p: "12px",
                                "& fieldset": { borderColor: C.border },
                                "&:hover fieldset": { borderColor: C.border },
                            },
                            "& .MuiOutlinedInput-input": { p: 0, color: C.text },
                        }}
                    />
                </Field>

                <Field label="Default Priority">
                    <Select
                        value={draft.priority}
                        onChange={(e) => set("priority", e.target.value)}
                        fullWidth
                        sx={controlSx}
                    >
                        {PRIORITY_OPTIONS.map((p) => (
                            <MenuItem key={p} value={p} sx={{ fontSize: "13px" }}>
                                {p}
                            </MenuItem>
                        ))}
                    </Select>
                </Field>

                <Field label="Default Owner">
                    <Select
                        value={draft.owner}
                        onChange={(e) => set("owner", e.target.value)}
                        displayEmpty
                        fullWidth
                        renderValue={(v) => v || "Select owner"}
                        sx={{ ...controlSx, color: draft.owner ? C.text : C.textMuted }}
                    >
                        {ownerOptions.map((o) => (
                            <MenuItem key={o} value={o} sx={{ fontSize: "13px" }}>
                                {o}
                            </MenuItem>
                        ))}
                    </Select>
                </Field>

                {/* SLA + Department sit two-up */}
                <Box sx={{ alignSelf: "stretch", display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Field label="Resolution SLA" sx={{ flex: "1 1 0", minWidth: 180 }}>
                        <Select
                            value={draft.sla}
                            onChange={(e) => set("sla", e.target.value)}
                            fullWidth
                            sx={controlSx}
                        >
                            {SLA_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>
                                    {s}
                                </MenuItem>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Department" sx={{ flex: "1 1 0", minWidth: 180 }}>
                        <Select
                            value={draft.department}
                            onChange={(e) => set("department", e.target.value)}
                            displayEmpty
                            fullWidth
                            renderValue={(v) => v || "Select departments"}
                            sx={{ ...controlSx, color: draft.department ? C.text : C.textMuted }}
                        >
                            {departmentOptions.map((d) => (
                                <MenuItem key={d} value={d} sx={{ fontSize: "13px" }}>
                                    {d}
                                </MenuItem>
                            ))}
                        </Select>
                    </Field>
                </Box>

                {/* Status — a segmented control here, not the switch the Parent
                    "Add Category" drawer uses. */}
                <Box
                    sx={{
                        alignSelf: "stretch",
                        pt: 0.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <Typography sx={labelSx}>Status</Typography>
                        <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                            Set the category status on creation
                        </Typography>
                    </Box>

                    <ToggleButtonGroup
                        exclusive
                        value={draft.status}
                        onChange={(e, v) => v && set("status", v)}
                        sx={{
                            p: "2px",
                            gap: "2px",
                            bgcolor: C.divider,
                            borderRadius: "6px",
                            "& .MuiToggleButton-root": {
                                px: "12px",
                                py: "4px",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: 500,
                                color: C.textMuted,
                                textTransform: "none",
                                "&.Mui-selected": {
                                    bgcolor: C.surface,
                                    boxShadow: CARD_SHADOW,
                                    fontWeight: 700,
                                    "&:hover": { bgcolor: C.surface },
                                },
                            },
                        }}
                    >
                        <ToggleButton
                            value="ACTIVE"
                            sx={{ "&.Mui-selected": { color: `${C.green} !important` } }}
                        >
                            ACTIVE
                        </ToggleButton>
                        <ToggleButton
                            value="INACTIVE"
                            sx={{ "&.Mui-selected": { color: `${C.text} !important` } }}
                        >
                            DISABLED
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    px: 3,
                    pt: 2,
                    pb: 2.5,
                    flexShrink: 0,
                    borderTop: `1px solid ${C.border}`,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 1.5,
                }}
            >
                <Button
                    onClick={onClose}
                    sx={{
                        height: 36,
                        px: 2,
                        boxSizing: "border-box",
                        borderRadius: "6px",
                        border: `1px solid ${C.border}`,
                        color: C.textMuted,
                        fontSize: "13px",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.border}` },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => onSave(draft)}
                    disabled={!canSave}
                    sx={{
                        height: 36,
                        px: 2,
                        boxSizing: "border-box",
                        bgcolor: accent,
                        borderRadius: "6px",
                        color: "#191C1E",
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": { bgcolor: websiteSettings.darkColor },
                        "&.Mui-disabled": { bgcolor: C.track, color: C.textFaint },
                    }}
                >
                    Create Category
                </Button>
            </Box>
        </Dialog>
    );
}
