import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectAuth } from "../../Redux/Slices/AuthSlice";
import { PostStaffConcern } from "../../Api/Api";
import { C } from "./complaintsTokens";
import { MODULE } from "./complaintsConfigApi";
import { fetchLookupCategories } from "./complaintsDetailApi";
import {
    ISSUE_ATTACHMENT_MAX_MB,
    ISSUE_ATTACHMENT_ACCEPT,
} from "./addIssueData";

// The Staff Concern branch of "Add New" on the Management Dashboard: a staff
// member reports an operational or safety issue they have observed.
//
// This comp runs on the #E2E8F0 hairline (complaintsTokens' `inputBorder`) for
// both the card and its fields, with 12px-tall controls rather than the fixed
// 40px the parent-complaint intake uses.

const REQUIRED = "#EF4444";

const controlSx = {
    bgcolor: C.surface,
    borderRadius: "8px",
    fontSize: "14px",
    "& .MuiOutlinedInput-input": { p: "12px 16px", display: "flex", alignItems: "center" },
    "& fieldset": { borderColor: C.inputBorder },
    "&:hover fieldset": { borderColor: C.inputBorder },
    "& .MuiSelect-icon": { color: C.textMuted, fontSize: "18px" },
};

const textFieldSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: C.surface,
        borderRadius: "8px",
        fontSize: "14px",
        p: 0,
        "& fieldset": { borderColor: C.inputBorder },
        "&:hover fieldset": { borderColor: C.inputBorder },
    },
    "& .MuiOutlinedInput-input": { p: "12px 16px", color: C.text },
    "& .MuiOutlinedInput-input::placeholder": { color: C.textFaint, opacity: 1 },
};

/* Field label — 13/700 uppercase, with the red asterisk where required. */
const Field = ({ label, required, children }) => (
    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        <Typography
            sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
            }}
        >
            {label}
            {required && (
                <Box component="span" sx={{ color: REQUIRED }}>
                    {" *"}
                </Box>
            )}
        </Typography>
        {children}
    </Box>
);

// `incidentDate` and `confidential` are not in the comp — the issues API asks
// for both, so they sit alongside Location rather than in a new section.
const EMPTY_FORM = {
    category: "",
    title: "",
    description: "",
    location: "",
    incidentDate: "",
    confidential: false,
};

// The UAT endpoints take the same fixed bearer the rest of this app sends; swap
// for the session token once the backend confirms which one these accept.
const TOKEN = "123";

export default function AddIssuePage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const auth = useSelector(selectAuth);
    const accent = websiteSettings.mainColor;
    const fileInputRef = useRef(null);

    const [form, setForm] = useState(EMPTY_FORM);
    const [files, setFiles] = useState([]);
    /* The category list comes from the API rather than a bundled seed — a hardcoded copy
       drifts the moment someone edits a category in the Configuration Hub. */
    const [categories, setCategories] = useState([]);
    const [categoryError, setCategoryError] = useState("");

    useEffect(() => {
        let cancelled = false;
        fetchLookupCategories({ moduleType: MODULE.staff }).then((result) => {
            if (cancelled) return;
            if (!result.ok) setCategoryError(result.message);
            else {
                setCategoryError("");
                setCategories(result.rows);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const [dragging, setDragging] = useState(false);
    const [saving, setSaving] = useState(false);

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    // Everything except the attachment is marked required in the comp.
    const canSubmit =
        form.category !== "" &&
        form.title.trim() !== "" &&
        form.description.trim() !== "" &&
        form.location.trim() !== "";

    const addFiles = (incoming) => {
        const accepted = [...incoming].filter((f) => f.size <= ISSUE_ATTACHMENT_MAX_MB * 1024 * 1024);
        setFiles((prev) => [...prev, ...accepted]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    // POST /complaints/staff-concern. Multipart, because the endpoint takes files
    // alongside the text fields.
    //
    // StudentRollNumber is not sent. The collection documents it as "optional
    // student linkage; leave blank when not applicable", and an operations issue
    // is about a place. Add it here if the screen ever gains a student picker.
    const handleSubmit = async () => {
        if (!canSubmit || saving) return;
        setSaving(true);

        const body = new FormData();
        body.append("CategoryId", form.category);
        body.append("SubmittedByRollNumber", auth?.rollNumber || "");
        body.append("SubmissionPlatform", "Website");
        body.append("Title", form.title.trim());
        body.append("Description", form.description.trim());
        body.append("Location", form.location.trim());
        if (form.incidentDate) body.append("IncidentDate", form.incidentDate);
        body.append("IsConfidential", String(form.confidential));
        files.forEach((file) => body.append("Attachments", file));

        try {
            const res = await axios.post(PostStaffConcern, body, {
                headers: { Accept: "application/json", Authorization: `Bearer ${TOKEN}` },
            });

            // The response shape is not documented yet — read the token from the
            // likely spellings and fall back to a plain confirmation.
            const data = res?.data || {};
            const reference = data.complaintToken || data.ComplaintToken || data.token;
            toast.success(reference ? `Issue submitted — ${reference}` : "Issue submitted");

            setForm(EMPTY_FORM);
            setFiles([]);
            navigate(-1);
        } catch (error) {
            // Surface what the API said rather than a generic failure — the
            // validation messages are how we learn which fields it requires.
            const data = error?.response?.data;
            const message =
                data?.message ||
                data?.title ||
                (data?.errors && Object.values(data.errors).flat().join(" ")) ||
                "Could not submit the issue. Please try again.";
            toast.error(message);
            console.error("Staff concern POST failed:", error?.response?.status, data);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3.5 }}>
            {/* Back + title */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} aria-label="Back" sx={{ p: 0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: "18px", color: C.textMuted }} />
                    </IconButton>
                    <Typography sx={{ fontSize: "21px", fontWeight: 700, color: C.text }}>
                        Add issue
                    </Typography>
                </Box>
                <Typography sx={{ pl: "26px", fontSize: "13px", fontWeight: 500, color: C.textMuted }}>
                    Report School Operations Issue
                </Typography>
            </Box>

            {/* Form card */}
            <Box
                sx={{
                    alignSelf: "stretch",
                    p: 4,
                    boxSizing: "border-box",
                    bgcolor: C.surface,
                    borderRadius: "12px",
                    border: `1px solid ${C.inputBorder}`,
                    boxShadow: "0px 4px 20px rgba(15, 23, 42, 0.02)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}
            >
                <Box sx={{ alignSelf: "stretch", display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Field label="Category" required>
                        <Select
                            value={form.category}
                            onChange={(e) => set("category", e.target.value)}
                            displayEmpty
                            renderValue={(v) =>
                                v === ""
                                    ? "Select Operations Category"
                                    : categories.find((c) => c.categoryId === v)?.name
                            }
                            fullWidth
                            sx={{ ...controlSx, color: form.category === "" ? C.textMuted : C.text }}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: "14px" }}>
                                Select Operations Category
                            </MenuItem>
                            {categories.map((option) => (
                                <MenuItem key={option.categoryId} value={option.categoryId} sx={{ fontSize: "14px" }}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Title / Subject" required>
                        <TextField
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="e.g. Broken stair tread in Block-B staircase"
                            fullWidth
                            sx={textFieldSx}
                        />
                    </Field>
                </Box>

                <Field label="Description" required>
                    <TextField
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Provide detailed operational observation or safety concern..."
                        fullWidth
                        multiline
                        rows={5}
                        sx={textFieldSx}
                    />
                </Field>

                <Box sx={{ alignSelf: "stretch", display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Field label="Location" required>
                        <TextField
                            value={form.location}
                            onChange={(e) => set("location", e.target.value)}
                            placeholder="e.g. West Wing, Staircase 2"
                            fullWidth
                            sx={textFieldSx}
                        />
                    </Field>

                    <Field label="Incident Date">
                        {/* A native date input keeps the value in the API's
                            YYYY-MM-DD form with no parsing on the way out. */}
                        <TextField
                            type="date"
                            value={form.incidentDate}
                            onChange={(e) => set("incidentDate", e.target.value)}
                            fullWidth
                            sx={textFieldSx}
                        />
                    </Field>
                </Box>

                <Field label="Confidential">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Switch
                            checked={form.confidential}
                            onChange={(e) => set("confidential", e.target.checked)}
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: C.surface },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                    bgcolor: accent,
                                    opacity: 1,
                                },
                                "& .MuiSwitch-track": { bgcolor: "#CBD5E1", opacity: 1 },
                            }}
                        />
                        <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                            Visible only to authorised roles.
                        </Typography>
                    </Box>
                </Field>

                <Field label="Attachment">
                    <Box
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        sx={{
                            alignSelf: "stretch",
                            py: 4,
                            px: 2,
                            boxSizing: "border-box",
                            bgcolor: dragging ? C.track : "#F8FAFC",
                            borderRadius: "12px",
                            border: `1.5px solid ${C.inputBorder}`,
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1.5,
                            transition: "background-color 0.2s",
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                boxSizing: "border-box",
                                bgcolor: C.surface,
                                borderRadius: "24px",
                                border: `1px solid ${C.inputBorder}`,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <FileUploadOutlinedIcon sx={{ fontSize: "20px", color: C.textMuted }} />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
                                Upload Image or Document
                            </Typography>
                            <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textFaint }}>
                                PDF, PNG, JPG up to {ISSUE_ATTACHMENT_MAX_MB}MB
                            </Typography>
                        </Box>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ISSUE_ATTACHMENT_ACCEPT}
                            hidden
                            onChange={(e) => {
                                addFiles(e.target.files);
                                // Clear it so re-picking the same file still fires onChange.
                                e.target.value = "";
                            }}
                        />
                    </Box>

                    {files.length > 0 && (
                        <Box sx={{ alignSelf: "stretch", mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                            {files.map((file, i) => (
                                <Box
                                    key={`${file.name}-${i}`}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        boxSizing: "border-box",
                                        bgcolor: "#F8FAFC",
                                        borderRadius: "8px",
                                        border: `1px solid ${C.inputBorder}`,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            fontSize: "13px",
                                            fontWeight: 500,
                                            color: C.text,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {file.name}
                                    </Typography>
                                    <IconButton
                                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                                        aria-label={`Remove ${file.name}`}
                                        sx={{ p: 0.5 }}
                                    >
                                        <CloseOutlinedIcon sx={{ fontSize: "14px", color: C.textMuted }} />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Field>

                <Divider sx={{ borderColor: C.inputBorder }} />

                <Box
                    sx={{
                        alignSelf: "stretch",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <Button
                        onClick={() => navigate(-1)}
                        sx={{
                            px: 2.5,
                            py: 1.5,
                            borderRadius: "8px",
                            color: C.textMuted,
                            fontSize: "14px",
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": { bgcolor: "#F8FAFC" },
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || saving}
                        startIcon={
                            saving ? <CircularProgress size={14} sx={{ color: C.textFaint }} /> : null
                        }
                        sx={{
                            px: 3,
                            py: 1.5,
                            bgcolor: accent,
                            color: C.text,
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": { bgcolor: websiteSettings.darkColor },
                            "&.Mui-disabled": { bgcolor: C.track, color: C.textFaint },
                        }}
                    >
                        {saving ? "Submitting..." : "Submit Issue"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
