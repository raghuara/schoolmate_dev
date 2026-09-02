import React, { useEffect, useMemo, useState } from "react";
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
import { useSelector } from "react-redux";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { C } from "./complaintsTokens";
import { selectUserTypes } from "../../Redux/Slices/userTypesSlice";
import {
    NOTE_VISIBILITY,
    addComplaintNote,
    assignComplaint,
    escalateComplaint,
    requestParentInformation,
} from "./complaintsActionsApi";

/**
 * The Control Panel actions that need a sentence before they can be sent.
 *
 * Four actions, one dialog: each is a token plus a piece of text plus a confirm, differing
 * only in wording and endpoint, so they share a component rather than becoming four
 * near-identical files that drift.
 *
 * Every one writes server-side and none returns the updated complaint, so `onDone` is
 * expected to re-read the detail rather than patch a local copy.
 */

const KINDS = {
    escalate: {
        title: "Escalate",
        intro: "Raises the complaint to the next level and queues it for management attention. The escalation rules also escalate on their own — those appear on the timeline as AutoEscalated.",
        label: "Reason for escalating",
        placeholder: "Why does this need to go up a level?",
        confirm: "Escalate",
        colour: C.amber,
    },
    requestInfo: {
        title: "Request information",
        intro: "Asks the parent for more detail. They are notified and the complaint waits on their reply.",
        label: "What do you need from them?",
        placeholder: "Be specific — a date, a route number, a name",
        confirm: "Send request",
        colour: C.blue,
    },
    addNote: {
        title: "Add note",
        intro: "Adds a note to the record and the timeline.",
        label: "Note",
        placeholder: "What has happened, or what needs to happen next",
        confirm: "Add note",
        colour: C.green,
    },
    assign: {
        title: "Reassign",
        intro: "Hands the complaint to a different owner. They become responsible for the SLA from this point.",
        label: "Reason for reassigning",
        placeholder: "Why is this moving?",
        confirm: "Reassign",
        colour: C.blue,
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

export default function ComplaintActionDialog({ open, kind, complaintToken, onClose, onDone }) {
    const spec = KINDS[kind] || KINDS.addNote;

    const userTypes = useSelector(selectUserTypes);

    const [text, setText] = useState("");
    const [visibility, setVisibility] = useState(NOTE_VISIBILITY[0]);
    const [targetLevel, setTargetLevel] = useState(2);
    const [ownerRollNumber, setOwnerRollNumber] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /* Everyone who could own a complaint, flattened out of the user-types store. Students
       are excluded — a complaint is never assigned to one. */
    const owners = useMemo(
        () =>
            (userTypes || [])
                .filter((type) => String(type?.userType || "").toLowerCase() !== "student")
                .flatMap((type) =>
                    (type.users || []).map((user) => ({
                        rollNumber: String(user.rollNumber ?? ""),
                        name: user.name || "",
                        role: type.userType || "",
                    })),
                ),
        [userTypes],
    );

    /* Reset on open, not on close — clearing during the closing animation makes the text
       visibly blank out as the dialog fades. */
    useEffect(() => {
        if (!open) return;
        setText("");
        setVisibility(NOTE_VISIBILITY[0]);
        setTargetLevel(2);
        setOwnerRollNumber("");
        setError("");
        setSaving(false);
    }, [open, kind]);

    const trimmed = text.trim();
    const canSubmit =
        !saving && trimmed.length > 0 && (kind !== "assign" || Boolean(ownerRollNumber));

    const runAction = () => {
        if (kind === "escalate") {
            return escalateComplaint({ complaintToken, targetLevel, reason: trimmed });
        }
        if (kind === "requestInfo") {
            return requestParentInformation({ complaintToken, requestMessage: trimmed });
        }
        if (kind === "assign") {
            const owner = owners.find((o) => o.rollNumber === ownerRollNumber);
            return assignComplaint({
                complaintToken,
                ownerRollNumber,
                ownerRole: owner?.role || "",
                reason: trimmed,
            });
        }
        return addComplaintNote({ complaintToken, note: trimmed, visibility });
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError("");
        const result = await runAction();
        setSaving(false);
        if (!result.ok) {
            setError(result.message || "Something went wrong. Please try again.");
            return;
        }
        onDone?.(result.message || `${spec.title} done`);
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
                sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, pb: 1 }}
            >
                <Box>
                    <Typography sx={{ fontSize: "18px", fontWeight: 600, color: C.text }}>
                        {spec.title}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: C.textMuted, mt: 0.25 }}>
                        {complaintToken}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} disabled={saving}>
                    <CloseOutlinedIcon sx={{ fontSize: "18px" }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Typography sx={{ fontSize: "13px", color: C.textMuted, mb: 2 }}>{spec.intro}</Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, fontSize: "13px", borderRadius: "9px" }}>
                        {error}
                    </Alert>
                )}

                {kind === "assign" && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={labelSx}>New owner</Typography>
                        <Select
                            fullWidth
                            size="small"
                            displayEmpty
                            value={ownerRollNumber}
                            onChange={(event) => setOwnerRollNumber(event.target.value)}
                            sx={{ borderRadius: "9px", fontSize: "13px" }}
                        >
                            <MenuItem value="" sx={{ fontSize: "13px" }}>
                                Select a person
                            </MenuItem>
                            {owners.map((owner) => (
                                <MenuItem key={owner.rollNumber} value={owner.rollNumber} sx={{ fontSize: "13px" }}>
                                    {owner.name} — {owner.role}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                )}

                {kind === "escalate" && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={labelSx}>Escalate to level</Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={targetLevel}
                            onChange={(event) => setTargetLevel(Number(event.target.value))}
                            sx={{ borderRadius: "9px", fontSize: "13px" }}
                        >
                            {[1, 2, 3].map((level) => (
                                <MenuItem key={level} value={level} sx={{ fontSize: "13px" }}>
                                    Level {level}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                )}

                {kind === "addNote" && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={labelSx}>Who can see this</Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={visibility}
                            onChange={(event) => setVisibility(event.target.value)}
                            sx={{ borderRadius: "9px", fontSize: "13px" }}
                        >
                            {NOTE_VISIBILITY.map((option) => (
                                <MenuItem key={option} value={option} sx={{ fontSize: "13px" }}>
                                    {option === "Internal" ? "Internal — staff only" : "Parent — visible to the parent"}
                                </MenuItem>
                            ))}
                        </Select>
                        {visibility === "Parent" && (
                            <Typography sx={{ fontSize: "12px", color: C.amber, mt: 0.75 }}>
                                The parent will be able to read this note.
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
