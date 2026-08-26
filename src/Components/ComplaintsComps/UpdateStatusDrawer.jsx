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
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { C, CARD_SHADOW } from "./complaintsTokens";
import { STATUS_OPTIONS, DETAIL_STATUS_TONES } from "./complaintDetailData";

// Opened by "Update Status" on the Complaint Details control panel.
//
// Width is not in the export (the frame is 100% of its container); 460 keeps the
// note field and the date row comfortable.
const DRAWER_WIDTH = 460;

const labelSx = {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    color: C.textMuted,
};

const Field = ({ label, children }) => (
    <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography sx={labelSx}>{label}</Typography>
        {children}
    </Box>
);

// Serves both the parent-complaint and internal-action detail screens; the
// options, tones and heading default to the complaint flow.
export default function UpdateStatusDrawer({
    open,
    complaint,
    onClose,
    onSubmit,
    statusOptions = STATUS_OPTIONS,
    statusTones = DETAIL_STATUS_TONES,
    title = "Update Complaint Status",
    // The action flow notifies the owner, the complaint flow the parent.
    notifyLabel = "Send notification to parent",
    notifyHelper = "Parent will receive an SMS and app notification about this status change.",
    dateLabel = "Expected Resolution Date",
}) {
    const websiteSettings = useSelector(selectWebsiteSettings);
    const accent = websiteSettings.mainColor;

    const [status, setStatus] = useState(statusOptions[0]);
    const [note, setNote] = useState("");
    const [notify, setNotify] = useState(true);
    const [dueDate, setDueDate] = useState(null);

    // Reset on each open so a cancelled update never carries into the next one.
    useEffect(() => {
        if (!open) return;
        setStatus(statusOptions[0]);
        setNote("");
        setNotify(true);
        setDueDate(null);
    }, [open, statusOptions]);

    if (!complaint) return null;

    // The comp marks only the note as required (*).
    const canSubmit = note.trim().length > 0;

    const currentTone = statusTones[complaint.status] || { bg: C.track, color: C.textMuted };
    const currentSince = complaint.timeline?.find((s) => s.label === complaint.status)?.at || "";

    const controlSx = {
        alignSelf: "stretch",
        bgcolor: C.surface,
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        "& .MuiOutlinedInput-input": { p: "10px 14px" },
        "& fieldset": { borderColor: C.border },
        "&:hover fieldset": { borderColor: C.border },
        // The comp draws this control with the accent ring, i.e. its open state.
        "&.Mui-focused fieldset": { borderColor: accent, borderWidth: "1.5px" },
        "& .MuiSelect-icon": { color: C.text, fontSize: "18px" },
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
                        boxShadow: "-4px 0px 24px rgba(0, 0, 0, 0.20)",
                        display: "flex",
                        flexDirection: "column",
                    },
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 3,
                    flexShrink: 0,
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Typography sx={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 500, color: C.textMuted }}>
                        {complaint.ref}
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    aria-label="Close"
                    sx={{
                        p: 1,
                        bgcolor: "#F4F6FA",
                        border: `1px solid ${C.border}`,
                        "&:hover": { bgcolor: "#EDF1F7" },
                    }}
                >
                    <CloseOutlinedIcon sx={{ fontSize: "14px", color: C.text }} />
                </IconButton>
            </Box>

            {/* Body — the only scrolling region */}
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}
            >
                <Field label="Current Status">
                    <Box
                        sx={{
                            alignSelf: "stretch",
                            p: 1.5,
                            bgcolor: "#F4F6FA",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            flexWrap: "wrap",
                        }}
                    >
                        <Box
                            sx={{
                                px: "10px",
                                py: "4px",
                                borderRadius: "6px",
                                bgcolor: currentTone.bg,
                                flexShrink: 0,
                            }}
                        >
                            <Typography
                                sx={{ fontSize: "11px", fontWeight: 700, color: currentTone.color, whiteSpace: "nowrap" }}
                            >
                                {complaint.status}
                            </Typography>
                        </Box>
                        {currentSince && (
                            <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>
                                Since{" "}
                                <Box component="span" sx={{ fontWeight: 600, color: C.text }}>
                                    {/* Complaint steps read "Active - date", action steps "Active · date". */}
                                    {currentSince.replace(/^Active\s*[-·]\s*/, "")}
                                </Box>
                            </Typography>
                        )}
                    </Box>
                </Field>

                <Field label="Move to">
                    <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={controlSx}
                        // The comps draw the open menu as a padded card whose selected
                        // row is tinted and ticked.
                        MenuProps={{
                            slotProps: {
                                paper: {
                                    sx: {
                                        p: "6px",
                                        mt: "4px",
                                        borderRadius: "8px",
                                        border: `1px solid ${C.border}`,
                                        boxShadow: CARD_SHADOW,
                                        "& .MuiList-root": { p: 0, display: "flex", flexDirection: "column", gap: "2px" },
                                    },
                                },
                            },
                        }}
                    >
                        {statusOptions.map((s) => (
                            <MenuItem
                                key={s}
                                value={s}
                                sx={{
                                    px: "12px",
                                    py: "10px",
                                    gap: 1,
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 400,
                                    color: C.text,
                                    "&.Mui-selected": {
                                        bgcolor: "#FFFCF5",
                                        fontWeight: 600,
                                        "&:hover": { bgcolor: "#FFFCF5" },
                                    },
                                }}
                            >
                                {status === s && (
                                    <CheckOutlinedIcon sx={{ fontSize: "14px", color: "#D97706" }} />
                                )}
                                {s}
                            </MenuItem>
                        ))}
                    </Select>
                </Field>

                <Field label="Status Update Note *">
                    <TextField
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Describe what changed and why…"
                        fullWidth
                        multiline
                        minRows={4}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                alignItems: "flex-start",
                                minHeight: 90,
                                boxSizing: "border-box",
                                bgcolor: C.surface,
                                borderRadius: "8px",
                                p: 1.5,
                                "& fieldset": { borderColor: C.border },
                                "&:hover fieldset": { borderColor: C.border },
                                "&.Mui-focused fieldset": { borderColor: accent },
                            },
                            "& .MuiOutlinedInput-input": {
                                p: 0,
                                fontSize: "13px",
                                fontWeight: 400,
                                lineHeight: "18px",
                                color: C.text,
                            },
                        }}
                    />
                </Field>

                {/* Notify parent */}
                <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
                            {notifyLabel}
                        </Typography>
                        <Switch
                            checked={notify}
                            onChange={(e) => setNotify(e.target.checked)}
                            disableRipple
                            inputProps={{ "aria-label": notifyLabel }}
                            sx={{
                                width: 40,
                                height: 20,
                                p: 0,
                                flexShrink: 0,
                                "& .MuiSwitch-switchBase": {
                                    p: 0,
                                    m: "2px",
                                    "&.Mui-checked": {
                                        transform: "translateX(20px)",
                                        color: "#fff",
                                        "& + .MuiSwitch-track": { bgcolor: accent, opacity: 1 },
                                    },
                                },
                                "& .MuiSwitch-thumb": {
                                    width: 16,
                                    height: 16,
                                    color: "#fff",
                                    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.20)",
                                },
                                "& .MuiSwitch-track": { borderRadius: "10px", bgcolor: C.border, opacity: 1 },
                            }}
                        />
                    </Box>
                    <Typography
                        sx={{ fontSize: "11px", fontWeight: 400, lineHeight: "16px", color: C.textMuted }}
                    >
                        {notifyHelper}
                    </Typography>
                </Box>

                <Field label={dateLabel}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            value={dueDate}
                            onChange={setDueDate}
                            format="DD MMM YYYY"
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    placeholder: "Select a date",
                                    sx: {
                                        "& .MuiOutlinedInput-root": {
                                            bgcolor: C.surface,
                                            borderRadius: "8px",
                                            "& fieldset": { borderColor: C.border },
                                            "&:hover fieldset": { borderColor: C.border },
                                            "&.Mui-focused fieldset": { borderColor: accent },
                                        },
                                        "& .MuiOutlinedInput-input": {
                                            p: "10px 14px",
                                            fontSize: "13px",
                                            fontWeight: 400,
                                            color: C.text,
                                        },
                                        "& .MuiIconButton-root": { color: C.textMuted },
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>
                </Field>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    p: 3,
                    flexShrink: 0,
                    bgcolor: C.surface,
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
                        px: 2,
                        py: 1.25,
                        boxSizing: "border-box",
                        bgcolor: C.surface,
                        borderRadius: "8px",
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.border}` },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={() =>
                        onSubmit({
                            status,
                            note: note.trim(),
                            notify,
                            expectedResolutionDate: dueDate ? dayjs(dueDate).format("DD MMM YYYY") : null,
                        })
                    }
                    disabled={!canSubmit}
                    sx={{
                        px: 2,
                        py: 1.25,
                        boxSizing: "border-box",
                        bgcolor: accent,
                        borderRadius: "8px",
                        color: C.text,
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": { bgcolor: websiteSettings.darkColor },
                        "&.Mui-disabled": { bgcolor: C.track, color: C.textFaint },
                    }}
                >
                    Update Status
                </Button>
            </Box>
        </Drawer>
    );
}
