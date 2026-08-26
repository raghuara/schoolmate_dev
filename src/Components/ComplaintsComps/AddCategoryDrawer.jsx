import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Drawer,
    IconButton,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C } from "./complaintsTokens";

// Slide-over for adding a complaint category, opened from the "Add Category"
// button on the Categories screen. The comp draws it as a full-height panel
// pinned to the right edge with a left border and an outward shadow.
//
// Width is not in the export (the frame is 100% of its container); 440 keeps the
// field proportions the comp shows. Adjust if the design specifies otherwise.
const DRAWER_WIDTH = 440;

// Straight from the Default Priority placeholder text.
const PRIORITY_OPTIONS = ["Critical", "High", "Normal", "Low"];

const EMPTY = {
    name: "",
    description: "",
    priority: "",
    owner: "",
    status: "ACTIVE",
};

const labelSx = { fontSize: "13px", fontWeight: 600, color: C.labelText };

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: C.surface,
        borderRadius: "8px",
        fontSize: "13px",
        alignItems: "flex-start",
        "& fieldset": { borderColor: C.inputBorder },
        "&:hover fieldset": { borderColor: C.inputBorder },
    },
    "& .MuiOutlinedInput-input::placeholder": { color: C.textFaint, opacity: 1 },
};

function Field({ label, children }) {
    return (
        <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "6px" }}>
            <Typography sx={labelSx}>{label}</Typography>
            {children}
        </Box>
    );
}

export default function AddCategoryDrawer({ open, onClose, onSave, ownerOptions = [] }) {
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const [draft, setDraft] = useState(EMPTY);

    // Reset on each open so a cancelled entry never carries into the next one.
    useEffect(() => {
        if (open) setDraft(EMPTY);
    }, [open]);

    const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
    const isActive = draft.status === "ACTIVE";

    // The comp gives no validation rules; a category with no name is meaningless,
    // so that is the one thing gated here.
    const canSave = draft.name.trim().length > 0;

    const selectSx = {
        height: 40,
        bgcolor: C.surface,
        borderRadius: "8px",
        fontSize: "13px",
        "& .MuiOutlinedInput-input": { p: "0 14px", display: "flex", alignItems: "center" },
        "& fieldset": { borderColor: C.inputBorder },
        "&:hover fieldset": { borderColor: C.inputBorder },
        "& .MuiSelect-icon": { color: C.textFaint, fontSize: "18px" },
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: DRAWER_WIDTH,
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        borderLeft: `1px solid ${C.border}`,
                        boxShadow: "-4px 0px 16px rgba(0, 0, 0, 0.10)",
                        display: "flex",
                        flexDirection: "column",
                    },
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    height: 58,
                    px: 3,
                    flexShrink: 0,
                    boxSizing: "border-box",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
                    Add Category
                </Typography>
                <IconButton
                    onClick={onClose}
                    aria-label="Close"
                    sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "6px",
                        bgcolor: C.fieldBg,
                        "&:hover": { bgcolor: "#EDF1F7" },
                    }}
                >
                    <CloseOutlinedIcon sx={{ fontSize: "12px", color: C.textMuted }} />
                </IconButton>
            </Box>

            {/* Body — scrolls if the panel is shorter than the form */}
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                }}
            >
                <Field label="Category Name">
                    <TextField
                        value={draft.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Enter category name"
                        fullWidth
                        sx={{
                            ...fieldSx,
                            "& .MuiOutlinedInput-root": {
                                ...fieldSx["& .MuiOutlinedInput-root"],
                                height: 40,
                                alignItems: "center",
                            },
                            "& .MuiOutlinedInput-input": { p: "0 14px", color: C.text },
                        }}
                    />
                </Field>

                <Field label="Description">
                    <TextField
                        value={draft.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Enter category description"
                        fullWidth
                        multiline
                        rows={4}
                        sx={{
                            ...fieldSx,
                            "& .MuiOutlinedInput-root": {
                                ...fieldSx["& .MuiOutlinedInput-root"],
                                p: "12px",
                            },
                            "& .MuiOutlinedInput-input": { p: 0, color: C.text },
                        }}
                    />
                </Field>

                <Field label="Default Priority">
                    <Select
                        value={draft.priority}
                        onChange={(e) => set("priority", e.target.value)}
                        displayEmpty
                        fullWidth
                        renderValue={(v) => v || "Select priority (Critical, High, Normal, Low)"}
                        sx={{ ...selectSx, color: draft.priority ? C.text : C.text }}
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
                        renderValue={(v) => v || "Select default owner"}
                        sx={{ ...selectSx, color: draft.owner ? C.text : C.textFaint }}
                    >
                        {ownerOptions.map((o) => (
                            <MenuItem key={o} value={o} sx={{ fontSize: "13px" }}>
                                {o}
                            </MenuItem>
                        ))}
                    </Select>
                </Field>

                {/* Status */}
                <Box
                    sx={{
                        alignSelf: "stretch",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <Typography sx={labelSx}>Status</Typography>
                        <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                            Determine if this category is currently active
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                            sx={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: isActive ? C.green : C.textMuted,
                            }}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </Typography>
                        {/* Green here rather than the brand accent — this toggle carries
                            the same ACTIVE/INACTIVE meaning as the table's status chip. */}
                        <Switch
                            checked={isActive}
                            onChange={(e) => set("status", e.target.checked ? "ACTIVE" : "INACTIVE")}
                            disableRipple
                            inputProps={{ "aria-label": "Category status" }}
                            sx={{
                                width: 40,
                                height: 20,
                                p: 0,
                                "& .MuiSwitch-switchBase": {
                                    p: 0,
                                    m: "2px",
                                    "&.Mui-checked": {
                                        transform: "translateX(20px)",
                                        color: "#fff",
                                        "& + .MuiSwitch-track": { bgcolor: C.green, opacity: 1 },
                                    },
                                },
                                "& .MuiSwitch-thumb": { width: 16, height: 16, boxShadow: "none", color: "#fff" },
                                "& .MuiSwitch-track": { borderRadius: "10px", bgcolor: C.border, opacity: 1 },
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    p: 3,
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
                        height: 38,
                        px: 2,
                        boxSizing: "border-box",
                        bgcolor: C.surface,
                        borderRadius: "8px",
                        border: `1px solid ${C.inputBorder}`,
                        color: C.labelText,
                        fontSize: "13px",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.inputBorder}` },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => onSave(draft)}
                    disabled={!canSave}
                    sx={{
                        height: 38,
                        px: 2,
                        boxSizing: "border-box",
                        bgcolor: accent,
                        borderRadius: "8px",
                        color: C.text,
                        fontSize: "13px",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: websiteSettings.darkColor },
                        "&.Mui-disabled": { bgcolor: C.track, color: C.textFaint },
                    }}
                >
                    Save Category
                </Button>
            </Box>
        </Drawer>
    );
}
