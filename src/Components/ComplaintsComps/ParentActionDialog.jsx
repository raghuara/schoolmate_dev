import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { C } from "./complaintsTokens";
import {
    FEEDBACK_OPTIONS,
    reopenComplaint,
    submitAdditionalInformation,
    submitParentFeedback,
    withdrawComplaint,
} from "./complaintsParentApi";

/**
 * The four parent actions, in one dialog.
 *
 * They share a shape — a token, a piece of text, a confirm — and differ only in wording and
 * which endpoint they call, so they are one component with a `kind` rather than four
 * near-identical files that would drift apart.
 *
 * EACH ONE CHANGES THE COMPLAINT'S STATUS SERVER-SIDE, so `onDone` is expected to reload
 * the list rather than patch its own copy of the row. Feedback in particular has two
 * outcomes from one endpoint: "Satisfied" closes the complaint, "Not Satisfied" reopens it.
 */

/* Everything that differs between the four, in one table. */
const KINDS = {
    feedback: {
        title: "Confirm resolution",
        intro: "Let the school know whether the resolution worked. Choosing “Not Satisfied” reopens the complaint.",
        label: "Comment",
        placeholder: "Anything you would like to add (optional)",
        confirm: "Submit feedback",
        colour: C.green,
        requiresText: false,
    },
    withdraw: {
        title: "Withdraw complaint",
        intro: "The complaint stops being processed. The record and its history are kept, and it cannot be un-withdrawn — reopen it instead if the issue returns.",
        label: "Reason for withdrawing",
        placeholder: "Tell the school why you are withdrawing this",
        confirm: "Withdraw complaint",
        colour: C.red,
        requiresText: true,
    },
    reopen: {
        title: "Reopen complaint",
        intro: "The same complaint is reopened under its existing token, escalated, and queued to be reassigned. A new complaint is not created.",
        label: "Why are you reopening this?",
        placeholder: "Describe what has happened since",
        confirm: "Reopen complaint",
        colour: C.amber,
        requiresText: true,
    },
    information: {
        title: "Provide additional information",
        intro: "The school has asked for more detail before it can proceed.",
        label: "Your response",
        placeholder: "Answer the school's question here",
        confirm: "Send information",
        colour: C.blue,
        requiresText: true,
    },
};

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "9px",
        fontSize: "13px",
        "& fieldset": { borderColor: C.inputBorder },
    },
};

const labelSx = { fontSize: "12px", fontWeight: 600, color: C.labelText, mb: 0.75 };

export default function ParentActionDialog({ open, kind, complaint, onClose, onDone }) {
    const spec = KINDS[kind] || KINDS.feedback;

    const [text, setText] = useState("");
    const [feedbackOption, setFeedbackOption] = useState(FEEDBACK_OPTIONS[0]);
    const [files, setFiles] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /* Reset on open, not on close — clearing during the closing animation makes the text
       visibly blank out as the dialog fades. */
    useEffect(() => {
        if (!open) return;
        setText("");
        setFeedbackOption(FEEDBACK_OPTIONS[0]);
        setFiles([]);
        setError("");
        setSaving(false);
    }, [open, kind]);

    const trimmed = text.trim();
    const canSubmit = !saving && (!spec.requiresText || trimmed.length > 0);

    const runAction = async () => {
        const token = complaint?.token;
        if (kind === "feedback") {
            return submitParentFeedback({ complaintToken: token, feedbackOption, comment: trimmed });
        }
        if (kind === "withdraw") {
            return withdrawComplaint({ complaintToken: token, reason: trimmed });
        }
        if (kind === "reopen") {
            return reopenComplaint({ complaintToken: token, reason: trimmed });
        }
        return submitAdditionalInformation({
            complaintToken: token,
            informationRequestId: complaint?.informationRequestId,
            responseMessage: trimmed,
            attachments: files,
        });
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError("");
        const result = await runAction();
        setSaving(false);
        if (!result.ok) {
            setError(
                result.routeMissing
                    ? "This action is not available on the server yet. Please tell the school office."
                    : result.message || "Something went wrong. Please try again.",
            );
            return;
        }
        onDone?.(result.message || `${spec.title} completed`);
    };

    const addFiles = (event) => {
        const picked = Array.from(event.target.files || []);
        if (picked.length) setFiles((current) => [...current, ...picked]);
        /* Clear the input so picking the same file twice in a row still fires onChange. */
        event.target.value = "";
    };

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 2,
                    pb: 1,
                }}
            >
                <Box>
                    <Typography sx={{ fontSize: "18px", fontWeight: 600, color: C.text }}>
                        {spec.title}
                    </Typography>
                    {complaint?.token && (
                        <Typography sx={{ fontSize: "12px", color: C.textMuted, mt: 0.25 }}>
                            {complaint.token}
                            {complaint.title ? ` · ${complaint.title}` : ""}
                        </Typography>
                    )}
                </Box>
                <IconButton size="small" onClick={onClose} disabled={saving}>
                    <CloseOutlinedIcon sx={{ fontSize: "18px" }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Typography sx={{ fontSize: "13px", color: C.textMuted, mb: 2 }}>
                    {spec.intro}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, fontSize: "13px", borderRadius: "9px" }}>
                        {error}
                    </Alert>
                )}

                {kind === "feedback" && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={labelSx}>Were you satisfied?</Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={feedbackOption}
                            onChange={(event) => setFeedbackOption(event.target.value)}
                            sx={{ borderRadius: "9px", fontSize: "13px" }}
                        >
                            {FEEDBACK_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option} sx={{ fontSize: "13px" }}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                        {feedbackOption === "Not Satisfied" && (
                            <Typography sx={{ fontSize: "12px", color: C.amber, mt: 0.75 }}>
                                This will reopen the complaint for further review.
                            </Typography>
                        )}
                    </Box>
                )}

                <Typography sx={labelSx}>{spec.label}</Typography>
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={spec.placeholder}
                    sx={fieldSx}
                />

                {kind === "information" && (
                    <Box sx={{ mt: 2 }}>
                        <Button
                            component="label"
                            startIcon={<AttachFileOutlinedIcon sx={{ fontSize: "16px" }} />}
                            sx={{
                                textTransform: "none",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: C.text,
                                border: `1px solid ${C.inputBorder}`,
                                borderRadius: "9px",
                                px: 1.5,
                            }}
                        >
                            Attach files
                            <input hidden multiple type="file" onChange={addFiles} />
                        </Button>
                        {files.map((file, index) => (
                            <Box
                                key={`${file.name}-${index}`}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mt: 1,
                                    px: 1.5,
                                    py: 0.75,
                                    bgcolor: C.fieldBg,
                                    borderRadius: "9px",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "12px",
                                        color: C.text,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {file.name}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        setFiles((current) => current.filter((_, i) => i !== index))
                                    }
                                >
                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: "16px", color: C.red }} />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={saving}
                    sx={{ textTransform: "none", fontSize: "13px", color: C.textMuted }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disableElevation
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    sx={{
                        textTransform: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        borderRadius: "9px",
                        px: 2.5,
                        bgcolor: spec.colour,
                        "&:hover": { bgcolor: spec.colour, filter: "brightness(0.94)" },
                    }}
                >
                    {saving ? "Working…" : spec.confirm}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
