import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Drawer, IconButton, MenuItem, Select, Switch, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectUserTypes } from "../../Redux/Slices/userTypesSlice";
import { C } from "./complaintsTokens";
import {
    ASSIGNMENT_MODES,
    MODE_HELPER_TEXT,
    STAFF_BY_ROLE,
    AVATAR_TONES,
    ASSIGNMENT_MAPPINGS,
} from "./assignmentMappingData";

const AUTO = "Auto Assign";

const EMPTY = { category: "", mode: AUTO, role: "", owner: "", status: "Active" };

const initialsOf = (name = "") =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

/* Label + optional red asterisk. */
const FieldLabel = ({ children, required }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{children}</Typography>
        {required && (
            <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.red }}>*</Typography>
        )}
    </Box>
);

const selectSx = (height, placeholder) => ({
    height,
    borderRadius: "8px",
    bgcolor: C.surface,
    fontSize: "13px",
    fontWeight: placeholder ? 400 : 500,
    color: placeholder ? C.textFaint : C.text,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: height === 40 ? C.border : "#E2E8F0" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
    "& .MuiSelect-select": { px: height === 40 ? "14px" : "12px", display: "flex", alignItems: "center" },
});

// `categories` comes from the screen that owns the drawer — parent-side complaint
// categories or the internal School Operations ones.
export default function AssignmentMappingDrawer({ open, mapping, categories = [], onClose, onSave }) {
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    // Roles come from the user-types store, never a hardcoded list. While the
    // store is empty, fall back to the roles already present on the mappings.
    const userTypes = useSelector(selectUserTypes);
    const roles = useMemo(() => {
        const fromStore = (userTypes || []).map((u) => u.userType).filter(Boolean);
        if (fromStore.length) return fromStore;
        return [...new Set(ASSIGNMENT_MAPPINGS.map((m) => m.role))];
    }, [userTypes]);

    const [form, setForm] = useState(EMPTY);

    // Reset whenever the drawer opens — edit prefills, add starts blank. The role
    // defaults to the first one that actually has staff mapped, so "Assign To" is
    // usable straight away instead of sitting disabled on a fresh form.
    useEffect(() => {
        if (!open) return;
        const defaultRole = roles.find((r) => (STAFF_BY_ROLE[r] || []).length) || roles[0] || "";
        setForm(mapping ? { ...mapping } : { ...EMPTY, role: defaultRole });
    }, [open, mapping, roles]);

    const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

    const isManual = form.mode !== AUTO;
    const staff = STAFF_BY_ROLE[form.role] || [];
    const canSave = form.category && form.mode && (!isManual || (form.role && form.owner));

    const handleSave = () => {
        onSave({
            ...form,
            // Auto-assigned rows have no named owner — the table shows the mode instead.
            owner: isManual ? form.owner : AUTO,
            role: form.role || roles[0] || "",
        });
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: { xs: "100%", sm: 440 },
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
                    px: 3,
                    py: "18px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                    {mapping ? "Edit Assignment Mapping" : "Add Assignment Mapping"}
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{ width: 28, height: 28, p: "6px", bgcolor: "#F4F6FA", "&:hover": { bgcolor: "#E8ECF4" } }}
                >
                    <CloseOutlinedIcon sx={{ fontSize: "12px", color: C.textMuted }} />
                </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ flex: 1, p: 3, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Complaint category */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <FieldLabel required>Complaint Category</FieldLabel>
                    <Select
                        displayEmpty
                        value={form.category}
                        onChange={(e) => set("category")(e.target.value)}
                        IconComponent={KeyboardArrowDownOutlinedIcon}
                        renderValue={(v) => v || "Select complaint category"}
                        sx={selectSx(40, !form.category)}
                    >
                        {categories.map((name) => (
                            <MenuItem key={name} value={name} sx={{ fontSize: "13px" }}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Assignment mode */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <FieldLabel required>Assignment Mode</FieldLabel>

                    <Box sx={{ p: "3px", bgcolor: "#F4F6FA", borderRadius: "8px", display: "flex", gap: "2px" }}>
                        {ASSIGNMENT_MODES.map((mode) => {
                            const active = form.mode === mode;
                            return (
                                <Box
                                    key={mode}
                                    onClick={() => set("mode")(mode)}
                                    sx={{
                                        flex: 1,
                                        py: 1,
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        bgcolor: active ? C.surface : "transparent",
                                        boxShadow: active ? "0px 2px 4px rgba(0, 0, 0, 0.05)" : "none",
                                        transition: "background-color 0.2s",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "13px",
                                            fontWeight: active ? 600 : 500,
                                            color: active ? C.text : C.textMuted,
                                        }}
                                    >
                                        {mode}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted, lineHeight: "16px" }}>
                        {MODE_HELPER_TEXT}
                    </Typography>

                    {/* Default role */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <FieldLabel>Default Role</FieldLabel>
                        <Select
                            displayEmpty
                            value={form.role}
                            onChange={(e) => {
                                set("role")(e.target.value);
                                // Staff are role-specific, so a role change clears the pick.
                                setForm((prev) => ({ ...prev, role: e.target.value, owner: "" }));
                            }}
                            IconComponent={KeyboardArrowDownOutlinedIcon}
                            renderValue={(v) => v || "Select role"}
                            sx={selectSx(44, !form.role)}
                        >
                            {roles.map((role) => (
                                <MenuItem key={role} value={role} sx={{ fontSize: "13px" }}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    {/* Assign to — only meaningful for manual assignment; auto-assign
                        lets the system pick from the role, so the field is hidden. */}
                    {isManual && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <FieldLabel>Assign To</FieldLabel>
                            <Select
                                displayEmpty
                                value={form.owner}
                                onChange={(e) => set("owner")(e.target.value)}
                                disabled={!form.role}
                                IconComponent={KeyboardArrowDownOutlinedIcon}
                                renderValue={(v) =>
                                    v || (form.role ? `Select ${form.role}` : "Select a role first")
                                }
                                sx={selectSx(44, !form.owner)}
                            >
                                {staff.map((person, i) => (
                                    <MenuItem key={person.id} value={person.name} sx={{ height: 40, gap: 1.25 }}>
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: "50%",
                                                bgcolor: AVATAR_TONES[i % AVATAR_TONES.length],
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#FFFFFF" }}>
                                                {initialsOf(person.name)}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 500, color: C.text }}>
                                            {person.name}
                                        </Typography>
                                    </MenuItem>
                                ))}

                                {staff.length === 0 && (
                                    <MenuItem disabled sx={{ fontSize: "13px" }}>
                                        No staff mapped to this role
                                    </MenuItem>
                                )}
                            </Select>
                        </Box>
                    )}
                </Box>

                {/* Status */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: C.text }}>Status</Typography>
                        <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                            Toggle the mapping state
                        </Typography>
                    </Box>
                    <Switch
                        checked={form.status === "Active"}
                        onChange={(e) => set("status")(e.target.checked ? "Active" : "Inactive")}
                        sx={{
                            width: 44,
                            height: 24,
                            p: 0,
                            flexShrink: 0,
                            "& .MuiSwitch-switchBase": {
                                p: "2px",
                                "&.Mui-checked": {
                                    transform: "translateX(20px)",
                                    color: "#FFFFFF",
                                    "& + .MuiSwitch-track": { bgcolor: accent, opacity: 1 },
                                },
                            },
                            "& .MuiSwitch-thumb": {
                                width: 20,
                                height: 20,
                                boxShadow: "0px 1.5px 3px rgba(0, 0, 0, 0.12)",
                            },
                            "& .MuiSwitch-track": { borderRadius: "12px", bgcolor: "#E2E8F0", opacity: 1 },
                        }}
                    />
                </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    p: 3,
                    borderTop: `1px solid ${C.border}`,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1.5,
                }}
            >
                <Button
                    onClick={onClose}
                    sx={{
                        px: 2,
                        py: 1.25,
                        borderRadius: "8px",
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
                    onClick={handleSave}
                    disabled={!canSave}
                    sx={{
                        px: 2,
                        py: 1.25,
                        borderRadius: "8px",
                        bgcolor: accent,
                        color: "#191C1E",
                        fontSize: "13px",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: websiteSettings.darkColor },
                        "&.Mui-disabled": { bgcolor: "#F1F5F9", color: C.textFaint },
                    }}
                >
                    Save Mapping
                </Button>
            </Box>
        </Drawer>
    );
}
