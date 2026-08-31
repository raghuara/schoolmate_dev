import React, { useMemo, useRef, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    MenuItem,
    Radio,
    RadioGroup,
    FormControlLabel,
    Select,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectAuth } from "../../Redux/Slices/AuthSlice";
import { PostParentComplaint } from "../../Api/Api";
import { C } from "./complaintsTokens";
import {
    STUDENT_RESULTS,
    SOURCE_OPTIONS,
    SOURCE_VALUES,
    COMPLAINT_CATEGORIES,
    PARENT_RELATIONS,
    CONTACT_METHODS,
    RECEIVING_STAFF_FALLBACK,
    ATTACHMENT_MAX_MB,
    ATTACHMENT_ACCEPT,
} from "./registerComplaintData";

// Step two of the parent-complaint intake: the office records what the parent
// reported about the student picked on the search screen.
//
// This comp uses its own card treatment — #E5E7EB hairline, 10px radius and a
// two-layer shadow — rather than the #E8ECF4 / 16px cards the dashboard uses, so
// those values are local instead of coming from complaintsTokens.
const CARD_BORDER = "#E5E7EB";
const CARD_SHADOW_SM = "0px 1px 2px -1px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.05)";
const FIELD_BORDER = "#D1D5DC";
const HEADING = "#0A0A0A";
const REQUIRED = "#FB2C36";
const READONLY_BG = "#F9FAFB";

// Banner tints for the selected-student strip.
const BANNER_BG = "#EBF3FC";
const BANNER_BORDER = "#D0E2FF";
const BANNER_CHIP_TEXT = "#002D9C";

const cardSx = {
    alignSelf: "stretch",
    p: 3,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "10px",
    border: `1px solid ${CARD_BORDER}`,
    boxShadow: CARD_SHADOW_SM,
    display: "flex",
    flexDirection: "column",
    gap: 2.5,
};

const controlSx = {
    height: 40,
    boxSizing: "border-box",
    bgcolor: C.surface,
    borderRadius: "8px",
    fontSize: "14px",
    "& .MuiOutlinedInput-input": { p: "0 12px", display: "flex", alignItems: "center" },
    "& fieldset": { borderColor: FIELD_BORDER },
    "&:hover fieldset": { borderColor: FIELD_BORDER },
    "& .MuiSelect-icon": { color: C.textMuted, fontSize: "18px" },
};

const textFieldSx = {
    "& .MuiOutlinedInput-root": {
        height: 40,
        boxSizing: "border-box",
        bgcolor: C.surface,
        borderRadius: "8px",
        fontSize: "14px",
        "& fieldset": { borderColor: FIELD_BORDER },
        "&:hover fieldset": { borderColor: FIELD_BORDER },
    },
    "& .MuiOutlinedInput-input": { p: "0 12px", color: HEADING },
    "& .MuiOutlinedInput-input::placeholder": { color: C.textMuted, opacity: 1 },
};

const areaFieldSx = {
    "& .MuiOutlinedInput-root": {
        boxSizing: "border-box",
        bgcolor: C.surface,
        borderRadius: "8px",
        fontSize: "14px",
        p: "12px",
        "& fieldset": { borderColor: FIELD_BORDER },
        "&:hover fieldset": { borderColor: FIELD_BORDER },
    },
    "& .MuiOutlinedInput-input": { p: 0, color: HEADING },
    "& .MuiOutlinedInput-input::placeholder": { color: C.textMuted, opacity: 1 },
};

/* Read-only field — the comp fills these from the session and dims them. */
const readOnlyFieldSx = {
    ...textFieldSx,
    opacity: 0.8,
    "& .MuiOutlinedInput-root": { ...textFieldSx["& .MuiOutlinedInput-root"], bgcolor: READONLY_BG },
};

/* Card heading — 16/600 in this comp's near-black. */
const SectionCard = ({ title, children }) => (
    <Box sx={cardSx}>
        <Typography sx={{ fontSize: "16px", fontWeight: 600, color: HEADING }}>{title}</Typography>
        <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 2 }}>
            {children}
        </Box>
    </Box>
);

/* Field label, with the red asterisk where the comp marks one required. */
const FieldLabel = ({ children, required, trailing }) => (
    <Box sx={{ alignSelf: "stretch", display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 500, color: HEADING }}>
            {children}
            {required && (
                <Box component="span" sx={{ color: REQUIRED }}>
                    {" *"}
                </Box>
            )}
        </Typography>
        {trailing}
    </Box>
);

const Field = ({ label, required, trailing, helper, children }) => (
    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        <FieldLabel required={required} trailing={trailing}>
            {label}
        </FieldLabel>
        {children}
        {helper && (
            <Typography sx={{ fontSize: "11px", fontWeight: 400, color: C.textMuted }}>
                {helper}
            </Typography>
        )}
    </Box>
);

/* "Admission No: MSMS10234" — muted label, bold value. */
const BannerMeta = ({ label, value }) => (
    <Typography sx={{ fontSize: "13px", fontWeight: 400, color: C.textMuted, whiteSpace: "nowrap" }}>
        {label}{" "}
        <Box component="span" sx={{ fontWeight: 600, color: C.text }}>
            {value}
        </Box>
    </Typography>
);

// The comp masks the parent's number in the banner — the office does not need
// the full number to file the complaint.
const maskMobile = (mobile = "") =>
    mobile.length > 4 ? `${mobile.slice(0, 2)}${"X".repeat(mobile.length - 4)}${mobile.slice(-2)}` : mobile;

const initialsOf = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

// The UAT endpoints take the same fixed bearer the rest of this app sends; swap
// for the session token once the backend confirms which one these accept.
const TOKEN = "123";

const EMPTY_FORM = {
    source: SOURCE_OPTIONS[0],
    category: "",
    subject: "",
    statement: "",
    // Incident Details — required by the API, not marked required in the comp, so
    // they do not gate Review until the backend confirms which are mandatory.
    parentRelation: "",
    incidentDate: "",
    incidentLocation: "",
    personInvolved: "",
    preferredContact: "",
    internalNotes: "",
    immediateAction: "",
    confidential: false,
};

export default function RegisterComplaintFormPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { studentId } = useParams();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const auth = useSelector(selectAuth);
    const accent = websiteSettings.mainColor;
    const fileInputRef = useRef(null);

    // Carried in navigation state from the search screen; the id keeps the page
    // usable on a refresh while the roster is mock.
    const student =
        location.state?.student || STUDENT_RESULTS.find((s) => String(s.id) === String(studentId));

    const [form, setForm] = useState(EMPTY_FORM);
    const [files, setFiles] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [saving, setSaving] = useState(false);

    // Stamped once on open — this is when the office took the call, not when the
    // form was submitted, so it must not tick with re-renders. The field shows the
    // friendly form; the API takes the ISO one with its offset.
    const openedAt = useMemo(() => dayjs(), []);
    const receivedAt = openedAt.format("DD MMM YYYY, hh:mm A");
    const receivedAtIso = openedAt.format("YYYY-MM-DDTHH:mm:ssZ");

    const receivingStaff = [auth?.position, auth?.name].filter(Boolean).join(" - ") || RECEIVING_STAFF_FALLBACK;

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    // The comp marks Category, Subject and Statement required; the other two
    // required fields are filled by the session and cannot be empty.
    const canSubmit =
        form.category !== "" && form.subject.trim() !== "" && form.statement.trim() !== "";

    const addFiles = (incoming) => {
        const accepted = [...incoming].filter((f) => f.size <= ATTACHMENT_MAX_MB * 1024 * 1024);
        setFiles((prev) => [...prev, ...accepted]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    // POST /complaints/parent as StaffOnBehalf / Website. Multipart, because the
    // endpoint takes files alongside the text fields.
    //
    // The backend's screen/API mapping names this trigger "Submit Complaint" and
    // shows no separate review frame for the website flow, so the form's final
    // action submits. If a Review Complaint screen is designed later, move this
    // call there and turn the button back into a next-step.
    const handleSubmit = async () => {
        if (!canSubmit || saving) return;
        setSaving(true);

        const body = new FormData();
        body.append("CategoryId", form.category);
        body.append("StudentRollNumber", student.rollNumber || "");
        body.append("SubmittedByRollNumber", auth?.rollNumber || "");
        body.append("RegistrationMode", "StaffOnBehalf");
        body.append("SubmissionPlatform", "Website");
        body.append("ComplaintSource", SOURCE_VALUES[form.source] || form.source);
        body.append("Subject", form.subject.trim());
        body.append("StatementOfConcern", form.statement.trim());
        body.append("ReceivedOn", receivedAtIso);
        body.append("IsConfidential", String(form.confidential));
        // Incident Details are not marked required in the comp, so they are only
        // sent when filled rather than posted as empty strings.
        if (form.parentRelation) body.append("ParentRelation", form.parentRelation);
        if (form.incidentDate) body.append("IncidentDate", form.incidentDate);
        if (form.incidentLocation) body.append("IncidentLocation", form.incidentLocation.trim());
        if (form.personInvolved) body.append("PersonOrRoleInvolved", form.personInvolved.trim());
        if (form.preferredContact) body.append("PreferredContactMethod", form.preferredContact);
        if (form.internalNotes) body.append("InternalStaffNotes", form.internalNotes.trim());
        if (form.immediateAction) body.append("ImmediateResponse", form.immediateAction.trim());
        files.forEach((file) => body.append("Attachments", file));

        try {
            const res = await axios.post(PostParentComplaint, body, {
                headers: { Accept: "application/json", Authorization: `Bearer ${TOKEN}` },
            });

            // The response shape is not documented yet — read the token from the
            // likely spellings and fall back to a plain confirmation.
            const data = res?.data || {};
            const reference = data.complaintToken || data.ComplaintToken || data.token;
            toast.success(reference ? `Complaint registered — ${reference}` : "Complaint registered");

            setForm(EMPTY_FORM);
            setFiles([]);
            navigate("/dashboardmenu/complaints/register");
        } catch (error) {
            // Surface what the API said rather than a generic failure — the
            // validation messages are how we learn which fields it requires.
            const data = error?.response?.data;
            const message =
                data?.message ||
                data?.title ||
                (data?.errors && Object.values(data.errors).flat().join(" ")) ||
                "Could not register the complaint. Please try again.";
            toast.error(message);
            console.error("Parent complaint POST failed:", error?.response?.status, data);
        } finally {
            setSaving(false);
        }
    };

    // Deep-linked with an id that is not in the roster — send the user back to
    // the search rather than rendering a form with no student.
    if (!student) return <Navigate to="/dashboardmenu/complaints/register" replace />;

    return (
        <Box sx={{ p: "28px", display: "flex", flexDirection: "column", gap: 3.5 }}>
            {/* Back + title */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} aria-label="Back" sx={{ p: 0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: "18px", color: C.textMuted }} />
                    </IconButton>
                    <Typography sx={{ fontSize: "21px", fontWeight: 700, color: C.text }}>
                        Register Complaint
                    </Typography>
                </Box>
                <Typography sx={{ pl: "26px", fontSize: "13px", fontWeight: 400, color: C.textMuted }}>
                    Register a complaint on behalf of a parent.
                </Typography>
            </Box>

            {/* Selected student */}
            <Box
                sx={{
                    alignSelf: "stretch",
                    p: 2,
                    boxSizing: "border-box",
                    bgcolor: BANNER_BG,
                    borderRadius: "10px",
                    border: `1px solid ${BANNER_BORDER}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    flexWrap: "wrap",
                }}
            >
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        bgcolor: C.blue,
                        borderRadius: "22px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: C.surface }}>
                        {initialsOf(student.name)}
                    </Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: "7px" }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                        {student.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                        <BannerMeta label="Admission No:" value={student.admissionNo} />
                        <BannerMeta label="Class:" value={`${student.grade} - ${student.section}`} />
                        <BannerMeta label="Parent:" value={student.parentName} />
                        <BannerMeta label="Mobile:" value={maskMobile(student.parentMobile)} />
                    </Box>
                </Box>

                <Box
                    sx={{
                        px: 1,
                        py: "2px",
                        bgcolor: BANNER_BORDER,
                        borderRadius: "4px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Typography sx={{ fontSize: "10px", fontWeight: 600, color: BANNER_CHIP_TEXT }}>
                        Registered on behalf of parent
                    </Typography>
                </Box>
            </Box>

            {/* Complaint Source */}
            <SectionCard title="Complaint Source">
                <RadioGroup
                    row
                    value={form.source}
                    onChange={(e) => set("source", e.target.value)}
                    sx={{ gap: 3 }}
                >
                    {SOURCE_OPTIONS.map((option) => {
                        const active = form.source === option;
                        return (
                            <FormControlLabel
                                key={option}
                                value={option}
                                sx={{ m: 0, gap: 1 }}
                                control={
                                    <Radio
                                        size="small"
                                        sx={{
                                            p: 0,
                                            color: FIELD_BORDER,
                                            "&.Mui-checked": { color: accent },
                                        }}
                                    />
                                }
                                label={
                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            fontWeight: active ? 600 : 400,
                                            color: active ? C.text : C.textMuted,
                                        }}
                                    >
                                        {option}
                                    </Typography>
                                }
                            />
                        );
                    })}
                </RadioGroup>
            </SectionCard>

            {/* Complaint Information */}
            <SectionCard title="Complaint Information">
                <Box sx={{ alignSelf: "stretch", display: "flex", gap: 2.5, flexWrap: "wrap" }}>
                    <Field label="Complaint Category" required>
                        <Select
                            value={form.category}
                            onChange={(e) => set("category", e.target.value)}
                            displayEmpty
                            renderValue={(v) =>
                                v === ""
                                    ? "Select category"
                                    : COMPLAINT_CATEGORIES.find((c) => c.id === v)?.name
                            }
                            fullWidth
                            sx={{ ...controlSx, color: form.category === "" ? C.textMuted : HEADING }}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: "14px" }}>
                                Select category
                            </MenuItem>
                            {COMPLAINT_CATEGORIES.map((option) => (
                                <MenuItem key={option.id} value={option.id} sx={{ fontSize: "14px" }}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Complaint Subject" required>
                        <TextField
                            value={form.subject}
                            onChange={(e) => set("subject", e.target.value)}
                            placeholder="Enter a brief subject/headline of the concern"
                            fullWidth
                            sx={textFieldSx}
                        />
                    </Field>
                </Box>

                <Box sx={{ alignSelf: "stretch", display: "flex", gap: 2.5, flexWrap: "wrap" }}>
                    {/* Both fields come from the session — recorded, not chosen. */}
                    <Field label="Date & Time Received" required>
                        <TextField
                            value={receivedAt}
                            fullWidth
                            slotProps={{ input: { readOnly: true } }}
                            sx={readOnlyFieldSx}
                        />
                    </Field>

                    <Field label="Receiving Staff Member" required>
                        <TextField
                            value={receivingStaff}
                            fullWidth
                            slotProps={{ input: { readOnly: true } }}
                            sx={readOnlyFieldSx}
                        />
                    </Field>
                </Box>
            </SectionCard>

            {/* Incident Details — not in the comp; these are the fields the intake
                API expects. Kept in their own card so the designed sections stay
                as drawn. */}
            <SectionCard title="Incident Details">
                <Box sx={{ alignSelf: "stretch", display: "flex", gap: 2.5, flexWrap: "wrap" }}>
                    <Field label="Parent Relation">
                        <Select
                            value={form.parentRelation}
                            onChange={(e) => set("parentRelation", e.target.value)}
                            displayEmpty
                            renderValue={(v) =>
                                v === ""
                                    ? "Select relation"
                                    : PARENT_RELATIONS.find((r) => r.value === v)?.label
                            }
                            fullWidth
                            sx={{ ...controlSx, color: form.parentRelation === "" ? C.textMuted : HEADING }}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: "14px" }}>
                                Select relation
                            </MenuItem>
                            {PARENT_RELATIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value} sx={{ fontSize: "14px" }}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Preferred Contact Method">
                        <Select
                            value={form.preferredContact}
                            onChange={(e) => set("preferredContact", e.target.value)}
                            displayEmpty
                            renderValue={(v) =>
                                v === ""
                                    ? "Select contact method"
                                    : CONTACT_METHODS.find((m) => m.value === v)?.label
                            }
                            fullWidth
                            sx={{ ...controlSx, color: form.preferredContact === "" ? C.textMuted : HEADING }}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: "14px" }}>
                                Select contact method
                            </MenuItem>
                            {CONTACT_METHODS.map((option) => (
                                <MenuItem key={option.value} value={option.value} sx={{ fontSize: "14px" }}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </Field>
                </Box>

                <Box sx={{ alignSelf: "stretch", display: "flex", gap: 2.5, flexWrap: "wrap" }}>
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

                    <Field label="Person or Role Involved">
                        <TextField
                            value={form.personInvolved}
                            onChange={(e) => set("personInvolved", e.target.value)}
                            placeholder="e.g. Class Teacher"
                            fullWidth
                            sx={textFieldSx}
                        />
                    </Field>
                </Box>

                <Field label="Incident Location">
                    <TextField
                        value={form.incidentLocation}
                        onChange={(e) => set("incidentLocation", e.target.value)}
                        placeholder="e.g. Classroom 7B"
                        fullWidth
                        sx={textFieldSx}
                    />
                </Field>
            </SectionCard>

            {/* Parent Complaint Statement */}
            <SectionCard title="Parent Complaint Statement">
                <Field
                    label="Statement of Concern"
                    required
                    helper="Ensure details like names, dates, or specific incidents are clearly noted exactly as communicated."
                >
                    <TextField
                        value={form.statement}
                        onChange={(e) => set("statement", e.target.value)}
                        placeholder="Record the concern communicated by the parent."
                        fullWidth
                        multiline
                        rows={4}
                        sx={areaFieldSx}
                    />
                </Field>
            </SectionCard>

            {/* Internal Staff Notes */}
            <SectionCard title="Internal Staff Notes">
                <Field
                    label="Internal Reference Notes"
                    trailing={
                        <Box
                            sx={{
                                px: 1,
                                py: "2px",
                                bgcolor: "#FFF5F5",
                                borderRadius: "4px",
                                border: "1px solid #FEB2B2",
                                flexShrink: 0,
                            }}
                        >
                            <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#C53030" }}>
                                Internal only — not visible to parent
                            </Typography>
                        </Box>
                    }
                >
                    <TextField
                        value={form.internalNotes}
                        onChange={(e) => set("internalNotes", e.target.value)}
                        placeholder="Add internal notes for staff reference"
                        fullWidth
                        multiline
                        rows={4}
                        sx={areaFieldSx}
                    />
                </Field>
            </SectionCard>

            {/* Immediate Response */}
            <SectionCard title="Immediate Response">
                <Field label="Immediate Action Communicated">
                    <TextField
                        value={form.immediateAction}
                        onChange={(e) => set("immediateAction", e.target.value)}
                        placeholder="Record any immediate response or action communicated to the parent"
                        fullWidth
                        multiline
                        rows={4}
                        sx={areaFieldSx}
                    />
                </Field>
            </SectionCard>

            {/* Confidentiality */}
            <SectionCard title="Confidentiality">
                <Box sx={{ alignSelf: "stretch", display: "flex", alignItems: "center", gap: 1.5 }}>
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
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
                            Confidential Complaint
                        </Typography>
                        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>
                            Confidential complaints are visible only to authorised roles.
                        </Typography>
                    </Box>
                </Box>
            </SectionCard>

            {/* Attachments */}
            <SectionCard title="Attachments">
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
                        p: 3,
                        boxSizing: "border-box",
                        bgcolor: dragging ? "#F1F5F9" : READONLY_BG,
                        borderRadius: "8px",
                        border: `1px solid ${FIELD_BORDER}`,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1.5,
                        transition: "background-color 0.2s",
                    }}
                >
                    <CloudUploadOutlinedIcon sx={{ fontSize: "32px", color: C.textMuted }} />
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#4D4D4D" }}>
                            Drag &amp; drop or click to upload
                        </Typography>
                        <Typography sx={{ fontSize: "12px", fontWeight: 400, color: C.textMuted }}>
                            Supports PNG, JPG, PDF or Doc (Max {ATTACHMENT_MAX_MB}MB)
                        </Typography>
                    </Box>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ATTACHMENT_ACCEPT}
                        hidden
                        onChange={(e) => {
                            addFiles(e.target.files);
                            // Clear it so re-picking the same file still fires onChange.
                            e.target.value = "";
                        }}
                    />
                </Box>

                {files.length > 0 && (
                    <Box sx={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 1 }}>
                        {files.map((file, i) => (
                            <Box
                                key={`${file.name}-${i}`}
                                sx={{
                                    px: 1.5,
                                    py: 1,
                                    boxSizing: "border-box",
                                    bgcolor: READONLY_BG,
                                    borderRadius: "6px",
                                    border: `1px solid ${CARD_BORDER}`,
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
            </SectionCard>

            {/* Footer actions */}
            <Box
                sx={{
                    alignSelf: "stretch",
                    minHeight: 80,
                    boxSizing: "border-box",
                    bgcolor: C.surface,
                    borderTop: `1px solid ${CARD_BORDER}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Button
                    onClick={() => navigate(-1)}
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderRadius: "6px",
                        border: `1px solid ${C.textMuted}`,
                        color: C.textMuted,
                        fontSize: "14px",
                        fontWeight: 500,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#F8FAFC", border: `1px solid ${C.textMuted}` },
                    }}
                >
                    Cancel
                </Button>

                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || saving}
                    endIcon={
                        saving ? (
                            <CircularProgress size={14} sx={{ color: C.textFaint }} />
                        ) : (
                            <ArrowForwardIcon sx={{ fontSize: "14px" }} />
                        )
                    }
                    sx={{
                        px: 3,
                        py: 1.5,
                        gap: 1,
                        bgcolor: accent,
                        color: "#191C1E",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: websiteSettings.darkColor },
                        "&.Mui-disabled": { bgcolor: C.track, color: C.textFaint },
                    }}
                >
                    {saving ? "Submitting..." : "Submit Complaint"}
                </Button>
            </Box>
        </Box>
    );
}
