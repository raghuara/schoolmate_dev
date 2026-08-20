import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, Checkbox,
    Accordion, AccordionSummary, AccordionDetails, Chip, Divider, Tooltip,
    FormControlLabel, Radio, RadioGroup, InputAdornment,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PhonelinkEraseOutlinedIcon from "@mui/icons-material/PhonelinkEraseOutlined";
import AlarmOnOutlinedIcon from "@mui/icons-material/AlarmOnOutlined";
import HourglassBottomOutlinedIcon from "@mui/icons-material/HourglassBottomOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import AiProcessingView from "./AiProcessingView";
import { DASH, RADIUS, Panel } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { QuizLimits, GenerateQuizQuestions, PostQuizQuestions } from "../../../Api/Api";

const WIZARD_STEPS = [
    { label: "Source", icon: CloudUploadOutlinedIcon },
    { label: "Configure", icon: TuneOutlinedIcon },
    { label: "Review Questions", icon: FactCheckOutlinedIcon },
    { label: "Publish", icon: RocketLaunchOutlinedIcon },
];

const DEFAULT_LIMITS = {
    minTotalQuestions: 1,
    maxTotalQuestions: 100,
    minOptionsForChoose: 2,
    maxOptionsForChoose: 10,
    maxPages: 100,
    maxFileSizeMB: 100,
    allowedDifficulties: ["Easy", "Medium", "Hard"],
    allowedFileTypes: [".pdf", ".docx"],
};

const SUBJECTS = [
    "Tamil", "English", "Mathematics", "Science", "Social", "Physics", "Chemistry",
    "Biology", "History", "Geography", "Computer Science", "General Knowledge",
];

const TYPE_META = {
    mcq: { label: "Choose the Best Answer", short: "MCQ", color: DASH.violet, bg: DASH.violetLight },
    truefalse: { label: "True / False", short: "True / False", color: DASH.cyan, bg: DASH.cyanLight },
    fillblank: { label: "Fill in the Blanks", short: "Blanks", color: DASH.pink, bg: DASH.pinkLight },
};

const AI_STEPS = [
    { title: "Uploading document", detail: "Sending the file securely to the server" },
    { title: "Reading pages", detail: "Extracting text from the selected page range" },
    { title: "Understanding the lesson", detail: "Identifying key concepts and definitions" },
    { title: "Drafting questions", detail: "Writing questions across the chosen types" },
    { title: "Finalising", detail: "Checking answers and formatting the paper" },
];

const EXPECTED_SECONDS = 30;
const GENERATE_TIMEOUT_MS = 5 * 60 * 1000;
const GRACE_MINUTES = 10;
// How far ahead the schedule defaults to, measured from the moment the user
// reaches the publish step - not from when they opened the page.
const SCHEDULE_LEAD_MINUTES = 35;
// Smallest gap we let a teacher schedule into. Not a policy - it exists so a
// start time cannot slip between two backend scheduler passes and never open.
const SCHEDULE_MIN_LEAD_MINUTES = 5;
const DATE_TIME_FORMAT = "DD-MM-YYYY hh:mm A";
const DATE_FORMAT = "DD-MM-YYYY";

// How many times a student may leave the app before the attempt is auto-submitted.
// 0 means the very first exit ends the quiz.
const WARNING_OPTIONS = [
    { value: 0, label: "0", caption: "No second chance" },
    { value: 1, label: "1", caption: "Strict" },
    { value: 2, label: "2", caption: "Balanced" },
    { value: 3, label: "3", caption: "Lenient" },
];

// Decides what happens to a student who starts late. These keys go straight to
// the API as `attendanceMode`, and each one requires a different date field.
const ATTEMPT_MODES = [
    {
        key: "fixedend",
        icon: AlarmOnOutlinedIcon,
        title: "Fixed end time",
        detail: "You set the end. A late starter gets whatever time is left.",
    },
    {
        key: "fulltime",
        icon: HourglassBottomOutlinedIcon,
        title: "Full time for everyone",
        detail: "You set the last start time. Each timer runs from their own start.",
    },
    {
        key: "anytime",
        icon: TodayOutlinedIcon,
        title: "Any time on the day",
        detail: "You set only the date. They attend whenever they are free.",
    },
];

const formatDuration = (minutes) => {
    const total = Math.max(0, Math.round(Number(minutes) || 0));
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h && m) return `${h} hr ${m} min`;
    if (h) return `${h} hr`;
    return `${m} min`;
};

const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const blankQuestion = (type, optionCount = 4) => ({
    uid: uid(type),
    type,
    question: "",
    answer: type === "truefalse" ? "Y" : "",
    options: type === "mcq"
        ? Array.from({ length: optionCount }, (_, i) => ({ optionText: "", isCorrect: i === 0 ? "Y" : "N" }))
        : [],
});

const yn = (value) => {
    if (value === true) return "Y";
    if (value === false) return "N";
    const v = String(value ?? "").trim().toLowerCase();
    if (["y", "yes", "true", "t", "1"].includes(v)) return "Y";
    return "N";
};

const questionText = (q) =>
    q?.question ?? q?.questionText ?? q?.text ?? q?.title ?? q?.statement ?? "";

const rawOptionsOf = (q) => q?.options || q?.choices || q?.answerOptions || q?.optionList || null;

const collectQuestionBuckets = (root) => {
    const buckets = { fill: [], mcq: [], tf: [], loose: [] };
    const seen = new Set();

    const visit = (node) => {
        if (!node || typeof node !== "object" || seen.has(node)) return;
        seen.add(node);

        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }

        Object.entries(node).forEach(([key, value]) => {
            const isQuestionArray =
                Array.isArray(value) && value.length > 0 && value.every((v) => v && typeof v === "object");

            if (isQuestionArray && value.some((v) => questionText(v))) {
                const k = key.toLowerCase();
                if (k.includes("blank") || k.includes("fill")) { buckets.fill.push(...value); return; }
                if (k.includes("choose") || k.includes("mcq") || k.includes("bestanswer") || k.includes("multiple")) {
                    buckets.mcq.push(...value); return;
                }
                if (k.includes("truefalse") || k.includes("trueorfalse") || k.includes("tf")) {
                    buckets.tf.push(...value); return;
                }
                buckets.loose.push(...value);
                return;
            }

            visit(value);
        });
    };

    visit(root);
    return buckets;
};

const buildMcq = (q, optionCount) => {
    const source = rawOptionsOf(q) || [];
    const correct = q?.answer ?? q?.correctAnswer ?? q?.correctOption;
    const options = source.map((o) => {
        if (typeof o === "string") {
            return { optionText: o, isCorrect: correct != null && String(correct).trim() === o.trim() ? "Y" : "N" };
        }
        return {
            optionText: o?.optionText ?? o?.text ?? o?.option ?? o?.value ?? "",
            isCorrect: yn(o?.isCorrect ?? o?.correct ?? o?.isAnswer),
        };
    });
    if (options.length && !options.some((o) => o.isCorrect === "Y")) options[0].isCorrect = "Y";
    while (options.length < optionCount) options.push({ optionText: "", isCorrect: "N" });
    return { uid: uid("mcq"), type: "mcq", question: questionText(q), answer: "", options };
};

const buildTrueFalse = (q) => ({
    uid: uid("truefalse"),
    type: "truefalse",
    question: questionText(q),
    answer: yn(q?.answer ?? q?.correctAnswer),
    options: [],
});

const buildFillBlank = (q) => ({
    uid: uid("fillblank"),
    type: "fillblank",
    question: questionText(q),
    answer: String(q?.answer ?? q?.correctAnswer ?? "").trim(),
    options: [],
});

const classifyLoose = (q) => {
    if (rawOptionsOf(q)?.length) return "mcq";
    const answer = String(q?.answer ?? q?.correctAnswer ?? "").trim().toLowerCase();
    if (["y", "n", "true", "false", "yes", "no"].includes(answer)) return "truefalse";
    return "fillblank";
};

const normalizeGenerated = (raw, optionCount) => {
    const buckets = collectQuestionBuckets(raw);

    buckets.loose.forEach((q) => {
        const type = classifyLoose(q);
        if (type === "mcq") buckets.mcq.push(q);
        else if (type === "truefalse") buckets.tf.push(q);
        else buckets.fill.push(q);
    });

    return [
        ...buckets.mcq.map((q) => buildMcq(q, optionCount)),
        ...buckets.tf.map(buildTrueFalse),
        ...buckets.fill.map(buildFillBlank),
    ].filter((q) => q.question.trim());
};

const toTimingString = (minutes) => {
    const total = Math.max(1, Math.round(Number(minutes) || 0));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const fmtDateTime = (value) => (value ? dayjs(value).format("DD-MM-YYYY HH:mm") : null);

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: RADIUS,
        fontSize: "13px",
        bgcolor: "#fff",
        "& fieldset": { borderColor: DASH.line },
        "&:hover fieldset": { borderColor: DASH.primaryBorder },
        "&.Mui-focused fieldset": { borderColor: DASH.primary },
    },
    "& .MuiInputLabel-root": { fontSize: "13px", color: DASH.muted },
    "& .MuiInputLabel-root.Mui-focused": { color: DASH.primary },
    "& .MuiFormHelperText-root": { fontSize: "11px", color: DASH.muted, ml: 0, mt: 0.5, lineHeight: 1.5 },
};

const pickerPaperSx = {
    borderRadius: RADIUS,
    border: `1px solid ${DASH.line}`,
    boxShadow: "0 14px 38px rgba(17,24,39,0.16)",
    "& .MuiPickersCalendarHeader-label": { fontSize: "13.5px", fontWeight: 700, color: DASH.ink },
    "& .MuiPickersArrowSwitcher-button, & .MuiPickersCalendarHeader-switchViewButton": { color: DASH.muted },
    "& .MuiDayCalendar-weekDayLabel": { fontSize: "11px", fontWeight: 700, color: DASH.faint },
    "& .MuiPickersDay-root": { fontSize: "12.5px", borderRadius: RADIUS, color: DASH.text },
    "& .MuiPickersDay-root:hover": { bgcolor: DASH.primaryLight },
    "& .MuiPickersDay-today": { borderColor: DASH.primaryBorder, color: DASH.primary, fontWeight: 700 },
    "& .MuiPickersDay-root.Mui-selected": { bgcolor: DASH.primary, color: "#fff", fontWeight: 700 },
    "& .MuiPickersDay-root.Mui-selected:hover, & .MuiPickersDay-root.Mui-selected:focus": { bgcolor: "#D89400" },
    "& .MuiPickersYear-yearButton.Mui-selected, & .MuiPickersMonth-monthButton.Mui-selected": {
        bgcolor: DASH.primary, color: "#fff", fontWeight: 700,
    },
    "& .MuiMultiSectionDigitalClockSection-root": {
        borderColor: DASH.lineSoft,
        "&::-webkit-scrollbar": { width: 5 },
        "&::-webkit-scrollbar-thumb": { backgroundColor: DASH.line, borderRadius: 999 },
    },
    "& .MuiMultiSectionDigitalClockSection-item": { fontSize: "12.5px", borderRadius: RADIUS, color: DASH.text },
    "& .MuiMultiSectionDigitalClockSection-item:hover": { bgcolor: DASH.primaryLight },
    "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": { bgcolor: DASH.primary, color: "#fff", fontWeight: 700 },
    "& .MuiMultiSectionDigitalClockSection-item.Mui-selected:hover": { bgcolor: "#D89400" },
    "& .MuiPickersToolbar-title, & .MuiPickersToolbarText-root": { color: DASH.muted },
    "& .MuiPickersToolbarText-root.Mui-selected": { color: DASH.ink },
    "& .MuiPickersLayout-actionBar .MuiButton-root": {
        textTransform: "none", fontSize: "12.5px", fontWeight: 700, color: DASH.primary,
    },
};

const pickerSlotProps = (textField = {}) => ({
    textField: { size: "small", fullWidth: true, sx: fieldSx, ...textField },
    desktopPaper: { sx: pickerPaperSx },
    mobilePaper: { sx: pickerPaperSx },
});

const SectionTitle = ({ children, icon: Icon }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.9, mt: 0.3 }}>
        {Icon && <Icon sx={{ fontSize: 15, color: DASH.primary }} />}
        <Typography
            sx={{
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color: DASH.muted, flexShrink: 0,
            }}
        >
            {children}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: DASH.line }} />
    </Box>
);

const WizardHeader = ({ step }) => (
    <Box
        sx={{
            display: "flex", alignItems: "center", gap: { xs: 0.8, md: 1.5 },
            bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
            px: { xs: 1.2, md: 2 }, py: 1.1, mb: 1.4, overflowX: "auto",
        }}
    >
        {WIZARD_STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const Icon = s.icon;
            return (
                <React.Fragment key={s.label}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, flexShrink: 0 }}>
                        <Box
                            sx={{
                                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                bgcolor: done ? DASH.green : active ? DASH.primary : "#fff",
                                border: `2px solid ${done ? DASH.green : active ? DASH.primary : DASH.line}`,
                                color: done || active ? "#fff" : DASH.faint,
                                transition: "all 0.25s ease",
                            }}
                        >
                            {done ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <Icon sx={{ fontSize: 14 }} />}
                        </Box>
                        <Typography
                            sx={{
                                fontSize: "12.5px",
                                fontWeight: active ? 700 : 600,
                                color: done ? DASH.ink : active ? DASH.ink : DASH.faint,
                                display: { xs: active ? "block" : "none", md: "block" },
                                whiteSpace: "nowrap",
                            }}
                        >
                            {s.label}
                        </Typography>
                    </Box>
                    {i < WIZARD_STEPS.length - 1 && (
                        <Box sx={{ flex: 1, height: 2, minWidth: 16, bgcolor: done ? DASH.green : DASH.lineSoft, borderRadius: 999 }} />
                    )}
                </React.Fragment>
            );
        })}
    </Box>
);

const CountField = ({ label, value, onChange, min = 0, max = 100, tone }) => (
    <Box
        sx={{
            border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 1.2,
            display: "flex", flexDirection: "column", gap: 1, height: "100%", boxSizing: "border-box",
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: tone, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.text }}>{label}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
                size="small"
                onClick={() => onChange(Math.max(min, Number(value || 0) - 1))}
                sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, width: 28, height: 28 }}
            >
                <RemoveIcon sx={{ fontSize: 15, color: DASH.text }} />
            </IconButton>
            <TextField
                size="small"
                value={value}
                onChange={(e) => {
                    const n = Number(e.target.value.replace(/[^0-9]/g, ""));
                    onChange(Math.min(max, Math.max(min, Number.isNaN(n) ? min : n)));
                }}
                sx={{ ...fieldSx, flex: 1, "& input": { textAlign: "center", fontWeight: 700, fontSize: "14px", py: 0.7 } }}
            />
            <IconButton
                size="small"
                onClick={() => onChange(Math.min(max, Number(value || 0) + 1))}
                sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, width: 28, height: 28 }}
            >
                <AddIcon sx={{ fontSize: 15, color: DASH.text }} />
            </IconButton>
        </Box>
    </Box>
);

const CorrectTag = ({ compact = false }) => (
    <Box
        sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.4,
            flexShrink: 0,
            px: 0.7,
            py: 0.2,
            borderRadius: RADIUS,
            bgcolor: DASH.greenLight,
            whiteSpace: "nowrap",
        }}
    >
        <CheckCircleIcon sx={{ fontSize: 12, color: DASH.green }} />
        <Typography sx={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.03em", color: DASH.green }}>
            {compact ? "CORRECT" : "CORRECT ANSWER"}
        </Typography>
    </Box>
);

const SummaryTile = ({ label, value, tone }) => (
    <Box sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.4, py: 1.05, height: "100%", boxSizing: "border-box" }}>
        <Typography sx={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: DASH.faint }}>
            {label}
        </Typography>
        <Typography sx={{ fontSize: "17px", fontWeight: 700, color: tone || DASH.ink, mt: 0.3, lineHeight: 1.2 }}>
            {value}
        </Typography>
    </Box>
);

export default function CreateOnlineQuizPage() {
    const navigate = useNavigate();
    const grades = useSelector(selectGrades);
    const academicYear = useSelector(selectAcademicYear);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;
    const token = "123";

    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    const [limits, setLimits] = useState(DEFAULT_LIMITS);

    const [mode, setMode] = useState("automation");
    const [file, setFile] = useState(null);
    const [wholeDocument, setWholeDocument] = useState(true);
    const [pageFrom, setPageFrom] = useState("");
    const [pageTo, setPageTo] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");

    const [subject, setSubject] = useState("");
    const [gradeSections, setGradeSections] = useState({});
    const [expandedGrade, setExpandedGrade] = useState(null);

    const [optionCount, setOptionCount] = useState(4);
    const [mix, setMix] = useState({ mcq: 10, truefalse: 5, fillblank: 5 });

    const [timingMode, setTimingMode] = useState("overall");
    const [overallMinutes, setOverallMinutes] = useState(30);
    const [perQuestionSeconds, setPerQuestionSeconds] = useState(60);

    const [questions, setQuestions] = useState([]);
    const [reviewFilter, setReviewFilter] = useState("all");

    const [publishMode, setPublishMode] = useState("schedule");
    const [scheduledAt, setScheduledAt] = useState(() => dayjs().add(SCHEDULE_LEAD_MINUTES, "minute").startOf("minute"));
    // Set once the user picks a start time themselves, so the clock sync below
    // stops overwriting their choice.
    const [scheduleTouched, setScheduleTouched] = useState(false);
    // What the user actually picked. Read through the clamped `completeBefore`
    // below - never directly - so the field cannot render under its own minimum.
    const [completeBeforeRaw, setCompleteBefore] = useState(null);
    const [attendanceMode, setAttendanceMode] = useState("fixedend");
    const [attemptDate, setAttemptDate] = useState(() => dayjs().startOf("day"));
    const [warningCount, setWarningCount] = useState(3);

    const [processing, setProcessing] = useState(null);
    const progressRef = useRef(null);
    const abortRef = useRef(null);

    useEffect(() => {
        const fetchLimits = async () => {
            try {
                const res = await axios.get(QuizLimits, { headers: { Authorization: `Bearer ${token}` } });
                const data = res?.data?.data;
                if (data) {
                    setLimits({ ...DEFAULT_LIMITS, ...data });
                    if (Array.isArray(data.allowedDifficulties) && data.allowedDifficulties.length) {
                        setDifficulty((prev) => (data.allowedDifficulties.includes(prev) ? prev : data.allowedDifficulties[0]));
                    }
                    if (data.minOptionsForChoose) {
                        setOptionCount((prev) => Math.min(data.maxOptionsForChoose || 10, Math.max(data.minOptionsForChoose, prev)));
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchLimits();
    }, []);

    useEffect(() => () => {
        clearInterval(progressRef.current);
        if (abortRef.current) abortRef.current.abort();
    }, []);

    const acceptMap = useMemo(() => {
        const map = {};
        (limits.allowedFileTypes || []).forEach((ext) => {
            if (ext === ".pdf") map["application/pdf"] = [".pdf"];
            if (ext === ".docx") map["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = [".docx"];
            if (ext === ".doc") map["application/msword"] = [".doc"];
            if (ext === ".txt") map["text/plain"] = [".txt"];
        });
        return map;
    }, [limits.allowedFileTypes]);

    const maxFileBytes = (limits.maxFileSizeMB || 100) * 1024 * 1024;

    const onDrop = (accepted, rejected) => {
        if (rejected?.length) {
            const code = rejected[0]?.errors?.[0]?.code;
            const sizeMb = rejected[0]?.file?.size ? (rejected[0].file.size / (1024 * 1024)).toFixed(1) : null;
            if (code === "file-too-large") {
                notify(
                    sizeMb
                        ? `That file is ${sizeMb} MB. Maximum allowed is ${limits.maxFileSizeMB} MB`
                        : `Maximum file size is ${limits.maxFileSizeMB} MB`
                );
            } else if (code === "too-many-files") {
                notify("Upload one document at a time");
            } else {
                notify(`Only ${(limits.allowedFileTypes || []).join(", ")} files are supported`);
            }
            return;
        }
        const picked = accepted?.[0];
        if (!picked) return;
        if (picked.size > maxFileBytes) {
            notify(`That file is ${(picked.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed is ${limits.maxFileSizeMB} MB`);
            return;
        }
        setFile(picked);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: acceptMap,
        maxSize: maxFileBytes,
    });

    const allGradesSelected = useMemo(
        () => grades.length > 0 && grades.every((g) => (gradeSections[g.id] || []).length === (g.sections || []).length && (g.sections || []).length > 0),
        [grades, gradeSections]
    );

    const toggleAllGrades = () => {
        if (allGradesSelected) { setGradeSections({}); return; }
        const next = {};
        grades.forEach((g) => { next[g.id] = [...(g.sections || [])]; });
        setGradeSections(next);
    };

    const toggleGrade = (grade) => {
        const current = gradeSections[grade.id] || [];
        const all = grade.sections || [];
        setGradeSections((prev) => {
            const next = { ...prev };
            if (current.length === all.length && all.length > 0) delete next[grade.id];
            else next[grade.id] = [...all];
            return next;
        });
    };

    const toggleSection = (grade, section) => {
        setGradeSections((prev) => {
            const current = prev[grade.id] || [];
            const next = { ...prev };
            if (current.includes(section)) {
                const left = current.filter((s) => s !== section);
                if (left.length) next[grade.id] = left; else delete next[grade.id];
            } else {
                next[grade.id] = [...current, section];
            }
            return next;
        });
    };

    const selectedSectionCount = useMemo(
        () => Object.values(gradeSections).reduce((sum, arr) => sum + arr.length, 0),
        [gradeSections]
    );

    const mixTotal = useMemo(
        () => Number(mix.mcq || 0) + Number(mix.truefalse || 0) + Number(mix.fillblank || 0),
        [mix]
    );

    const counts = useMemo(() => {
        const c = { mcq: 0, truefalse: 0, fillblank: 0 };
        questions.forEach((q) => { c[q.type] += 1; });
        return { ...c, total: questions.length };
    }, [questions]);

    const totalQuestions = questions.length || (mode === "automation" ? mixTotal : 0);

    const totalDuration = useMemo(() => {
        if (timingMode === "overall") return Number(overallMinutes || 0);
        return Math.ceil((totalQuestions * Number(perQuestionSeconds || 0)) / 60);
    }, [timingMode, overallMinutes, perQuestionSeconds, totalQuestions]);

    const requiredWindow = useMemo(() => Math.max(1, totalDuration) + GRACE_MINUTES, [totalDuration]);

    const [nowAnchor, setNowAnchor] = useState(() => dayjs().startOf("minute"));

    // Reading a document and generating questions can take several minutes, so a
    // default calculated at mount is already stale by the time the user gets here.
    // Re-read the clock on arrival and keep it current while the step is open, so
    // "now" always means now rather than whenever the page was opened.
    useEffect(() => {
        if (step !== 3) return undefined;

        const sync = () => {
            const now = dayjs().startOf("minute");
            setNowAnchor(now);

            // "Publish now" means today by definition, so the date is not the
            // user's to choose any more.
            if (publishMode === "post") setAttemptDate(now.startOf("day"));

            setScheduledAt((prev) => {
                // Leave a time the user picked alone, unless it has since passed.
                if (scheduleTouched && prev && prev.isAfter(now)) return prev;
                return now.add(SCHEDULE_LEAD_MINUTES, "minute");
            });
        };

        sync();
        const id = setInterval(sync, 30000);
        return () => clearInterval(id);
    }, [step, publishMode, scheduleTouched]);

    // Anything earlier risks the scheduler missing it entirely.
    const scheduleFloor = useMemo(
        () => nowAnchor.add(SCHEDULE_MIN_LEAD_MINUTES, "minute"),
        [nowAnchor],
    );

    const windowStart = attendanceMode === "anytime"
        ? (attemptDate ? attemptDate.startOf("day") : nowAnchor)
        : (publishMode === "schedule" ? scheduledAt : nowAnchor);

    // The earliest the picker will accept.
    //   fixedend - the whole quiz plus its grace has to fit before the deadline.
    //   fulltime  - the picked time is the last moment a student may START, so it
    //               only has to be strictly after the window opens. Allowing it to
    //               equal the start would leave a zero-length window nobody could
    //               begin in.
    const minCompleteBefore = useMemo(() => {
        const base = windowStart || nowAnchor;
        return attendanceMode === "fulltime"
            ? base.add(1, "minute")
            : base.add(requiredWindow, "minute");
    }, [windowStart, nowAnchor, requiredWindow, attendanceMode]);

    // What the field shows before the user picks anything. Both modes open a
    // window as wide as the quiz plus its grace period, so the default scales
    // with the paper: a 30 min quiz opens a 40 min window, a 60 min quiz 70.
    const defaultCompleteBefore = useMemo(
        () => (windowStart || nowAnchor).add(requiredWindow, "minute"),
        [windowStart, nowAnchor, requiredWindow],
    );

    // Clamped while rendering rather than corrected afterwards by an effect.
    // The effect version left one render where the picker held a value below its
    // own minDateTime, which is what flashed a validation error every time the
    // clock ticked and pushed the start time forward.
    const completeBefore = useMemo(() => {
        if (attendanceMode === "anytime") return completeBeforeRaw;
        if (!completeBeforeRaw) return defaultCompleteBefore;
        if (completeBeforeRaw.isBefore(minCompleteBefore)) return minCompleteBefore;
        return completeBeforeRaw;
    }, [completeBeforeRaw, minCompleteBefore, defaultCompleteBefore, attendanceMode]);

    // The real moment the last attempt can still be running. This is what the API
    // is told, so one field carries all three modes.
    const effectiveEnd = useMemo(() => {
        if (attendanceMode === "anytime") return attemptDate ? attemptDate.endOf("day") : null;
        if (attendanceMode === "fulltime") return completeBefore ? completeBefore.add(totalDuration, "minute") : null;
        return completeBefore;
    }, [attendanceMode, attemptDate, completeBefore, totalDuration]);

    // The API takes a different date field per mode, and rejects the others.
    // fixedend -> shouldCompleteBefore, fulltime -> lastStartDateAndTime,
    // anytime  -> attemptDate (date only).
    const attendanceFields = useMemo(() => {
        if (attendanceMode === "fulltime") {
            return { lastStartDateAndTime: fmtDateTime(completeBefore) };
        }
        if (attendanceMode === "anytime") {
            return { attemptDate: attemptDate ? dayjs(attemptDate).format(DATE_FORMAT) : null };
        }
        return { shouldCompleteBefore: fmtDateTime(completeBefore) };
    }, [attendanceMode, completeBefore, attemptDate]);

    const filteredQuestions = useMemo(
        () => (reviewFilter === "all" ? questions : questions.filter((q) => q.type === reviewFilter)),
        [questions, reviewFilter]
    );

    const updateQuestion = (targetUid, patch) => {
        setQuestions((prev) => prev.map((q) => (q.uid === targetUid ? { ...q, ...patch } : q)));
    };

    const updateOption = (targetUid, index, patch) => {
        setQuestions((prev) => prev.map((q) => {
            if (q.uid !== targetUid) return q;
            const options = q.options.map((o, i) => (i === index ? { ...o, ...patch } : o));
            return { ...q, options };
        }));
    };

    const setCorrectOption = (targetUid, index) => {
        setQuestions((prev) => prev.map((q) => {
            if (q.uid !== targetUid) return q;
            return { ...q, options: q.options.map((o, i) => ({ ...o, isCorrect: i === index ? "Y" : "N" })) };
        }));
    };

    const removeQuestion = (targetUid) => setQuestions((prev) => prev.filter((q) => q.uid !== targetUid));

    const addQuestion = (type) => {
        if (questions.length >= (limits.maxTotalQuestions || 100)) {
            notify(`Maximum ${limits.maxTotalQuestions} questions allowed`);
            return;
        }
        setQuestions((prev) => [...prev, blankQuestion(type, optionCount)]);
        setReviewFilter((prev) => (prev === "all" || prev === type ? prev : "all"));
    };

    const startProgress = () => {
        const startedAt = Date.now();
        setProcessing({ progress: 3, activeIndex: 0, fileName: file?.name, secondsLeft: EXPECTED_SECONDS });
        clearInterval(progressRef.current);
        progressRef.current = setInterval(() => {
            const elapsed = (Date.now() - startedAt) / 1000;
            const progress = Math.min(93, 93 * (1 - Math.exp(-elapsed / 14)));
            const activeIndex = Math.min(AI_STEPS.length - 1, Math.floor((progress / 93) * AI_STEPS.length));
            const secondsLeft = Math.max(0, Math.ceil(EXPECTED_SECONDS - elapsed));
            setProcessing((prev) => (prev ? { ...prev, progress, activeIndex, secondsLeft } : prev));
        }, 400);
    };

    const stopProgress = (done) => {
        clearInterval(progressRef.current);
        if (!done) { setProcessing(null); return; }
        setProcessing((prev) => (prev ? { ...prev, progress: 100, activeIndex: AI_STEPS.length - 1, secondsLeft: 0 } : prev));
        setTimeout(() => setProcessing(null), 500);
    };

    const cancelProcessing = () => {
        if (abortRef.current) abortRef.current.abort();
        stopProgress(false);
        setStep(1);
    };

    const generateQuestions = async () => {
        const form = new FormData();
        form.append("file", file);
        form.append("totalNumberOfQuestions", String(mixTotal));
        form.append("fillingTheBlanksNumber", String(mix.fillblank || 0));
        form.append("chooseTheBestAnswerNumber", String(mix.mcq || 0));
        form.append("numberOfOptionsForChooseTheBestAnswers", String(optionCount));
        form.append("trueOrFalseNumber", String(mix.truefalse || 0));
        form.append("difficulty", difficulty);
        if (!wholeDocument) {
            form.append("fromPageNo", String(pageFrom));
            form.append("toPageNo", String(pageTo));
        }

        abortRef.current = new AbortController();
        startProgress();
        setStep(2);

        try {
            const res = await axios.post(GenerateQuizQuestions, form, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                signal: abortRef.current.signal,
                timeout: GENERATE_TIMEOUT_MS,
            });

            if (res?.data?.error) {
                stopProgress(false);
                setStep(1);
                notify(res.data.message || "Could not generate questions from this document");
                return;
            }

            const generated = normalizeGenerated(res.data, optionCount);
            if (!generated.length) {
                stopProgress(false);
                setStep(1);
                console.warn("generateQuestions returned no readable questions:", res.data);
                notify("The document was read but no questions came back. Try a wider page range.");
                return;
            }

            stopProgress(true);
            setQuestions(generated);
            setReviewFilter("all");
            notify(`${generated.length} questions generated. Review them before publishing.`, true);
        } catch (error) {
            stopProgress(false);
            if (axios.isCancel?.(error) || error.name === "CanceledError") return;
            setStep(1);
            console.error(error);
            notify(error?.response?.data?.message || "Question generation failed. Please try again.");
        }
    };

    const buildPayload = () => ({
        gradeSections: Object.entries(gradeSections).map(([gradeId, sections]) => ({
            gradeId: Number(gradeId),
            sections,
        })),
        warningCount: Number(warningCount),
        createdByRollNumber: rollNumber,
        status: publishMode,
        postedDateAndTime: publishMode === "post" ? fmtDateTime(dayjs()) : null,
        scheduledDateAndTime: publishMode === "schedule" ? fmtDateTime(windowStart) : null,
        academicYear,
        subject,
        timing: toTimingString(totalDuration),
        attendanceMode,
        ...attendanceFields,
        questionType: mode,
        totalNumberOfQuestions: counts.total,
        fillingTheBlanksNumber: counts.fillblank,
        chooseTheBestAnswerNumber: counts.mcq,
        numberOfOptionsForChooseTheBestAnswers: optionCount,
        trueOrFalseNumber: counts.truefalse,
        fillingTheBlanksQuestions: questions
            .filter((q) => q.type === "fillblank")
            .map((q) => ({ question: q.question.trim(), answer: String(q.answer || "").trim() })),
        chooseTheBestAnswerQuestions: questions
            .filter((q) => q.type === "mcq")
            .map((q) => ({
                question: q.question.trim(),
                options: q.options.map((o) => ({ optionText: o.optionText.trim(), isCorrect: o.isCorrect })),
            })),
        trueOrFalseQuestions: questions
            .filter((q) => q.type === "truefalse")
            .map((q) => ({ question: q.question.trim(), answer: yn(q.answer) })),
    });

    const publishQuiz = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(PostQuizQuestions, buildPayload(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res?.data?.error) {
                notify(res.data.message || "Could not save the quiz");
                return;
            }
            notify(publishMode === "post" ? "Quiz published successfully" : "Quiz scheduled successfully", true);
            setTimeout(() => navigate("/dashboardmenu/assessment/online-quiz"), 900);
        } catch (error) {
            console.error(error);
            notify(error?.response?.data?.message || "Could not save the quiz. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const validateStep = () => {
        if (step === 0) {
            if (mode === "automation") {
                if (!file) { notify("Upload a lesson document to continue"); return false; }
                if (!wholeDocument) {
                    const from = Number(pageFrom);
                    const to = Number(pageTo);
                    if (!from || !to) { notify("Enter both the start and end page"); return false; }
                    if (to < from) { notify("End page must be greater than the start page"); return false; }
                    if (to - from + 1 > (limits.maxPages || 100)) {
                        notify(`Page range cannot exceed ${limits.maxPages} pages`); return false;
                    }
                }
            }
            return true;
        }

        if (step === 1) {
            if (!subject) { notify("Select a subject"); return false; }
            if (!selectedSectionCount) { notify("Select at least one grade and section"); return false; }
            if (totalDuration < 1) { notify("Set a valid time limit"); return false; }
            if (optionCount < (limits.minOptionsForChoose || 2) || optionCount > (limits.maxOptionsForChoose || 10)) {
                notify(`Options per question must be between ${limits.minOptionsForChoose} and ${limits.maxOptionsForChoose}`);
                return false;
            }
            if (mode === "automation") {
                if (mixTotal < (limits.minTotalQuestions || 1)) {
                    notify(`Add at least ${limits.minTotalQuestions} question`); return false;
                }
                if (mixTotal > (limits.maxTotalQuestions || 100)) {
                    notify(`Total questions cannot exceed ${limits.maxTotalQuestions}`); return false;
                }
            }
            return true;
        }

        if (step === 2) {
            if (!questions.length) { notify("Add at least one question"); return false; }
            if (questions.length > (limits.maxTotalQuestions || 100)) {
                notify(`Total questions cannot exceed ${limits.maxTotalQuestions}`); return false;
            }
            const blank = questions.find((q) => !q.question.trim());
            if (blank) { notify("Every question needs text"); return false; }
            const missingAnswer = questions.find((q) => q.type === "fillblank" && !String(q.answer || "").trim());
            if (missingAnswer) { notify("Fill in the blanks questions need an answer"); return false; }
            const badMcq = questions.find(
                (q) => q.type === "mcq" && (q.options.some((o) => !o.optionText.trim()) || !q.options.some((o) => o.isCorrect === "Y"))
            );
            if (badMcq) { notify("Every MCQ needs all options filled and one correct answer"); return false; }
            return true;
        }

        if (step === 3) {
            if (![0, 1, 2, 3].includes(Number(warningCount))) {
                notify("Choose how many app-exit warnings a student gets"); return false;
            }

            if (attendanceMode === "anytime") {
                if (!attemptDate) { notify("Pick the date students should attend"); return false; }
                if (attemptDate.startOf("day").isBefore(dayjs().startOf("day"))) {
                    notify("The attempt date cannot be in the past"); return false;
                }
                return true;
            }

            if (publishMode === "schedule") {
                if (!scheduledAt) { notify("Pick a start date and time"); return false; }
                // Checked against a live clock, not nowAnchor, so a form left open
                // for a while cannot submit a start time that has since expired.
                if (scheduledAt.isBefore(dayjs().add(SCHEDULE_MIN_LEAD_MINUTES, "minute").startOf("minute"))) {
                    notify(`Schedule the start at least ${SCHEDULE_MIN_LEAD_MINUTES} minutes from now`); return false;
                }
            }
            if (!completeBefore) {
                notify(attendanceMode === "fulltime" ? "Pick the last start time" : "Pick a completion deadline");
                return false;
            }

            const start = publishMode === "schedule" ? scheduledAt : dayjs();
            if (attendanceMode === "fulltime") {
                if (!completeBefore.isAfter(start)) {
                    notify("The last start time must come after the quiz opens"); return false;
                }
                return true;
            }

            const windowMinutes = completeBefore.diff(start, "minute");
            if (windowMinutes < requiredWindow) {
                notify(
                    `Students need at least ${formatDuration(requiredWindow)} — ${formatDuration(totalDuration)} quiz plus ${GRACE_MINUTES} min grace`
                );
                return false;
            }
            return true;
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) return;
        if (step === 1 && mode === "automation") { generateQuestions(); return; }
        if (step === 1 && mode === "manual" && !questions.length) {
            setQuestions([blankQuestion("mcq", optionCount)]);
        }
        setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1));
    };

    const handleBack = () => {
        if (step === 0) { navigate(-1); return; }
        setStep((s) => s - 1);
    };

    const pageLabel = wholeDocument
        ? "Whole document"
        : pageFrom && pageTo ? `Pages ${pageFrom} to ${pageTo}` : "";

    const nextLabel = step === 1 && mode === "automation"
        ? "Generate Questions"
        : step === WIZARD_STEPS.length - 1
            ? (publishMode === "post" ? "Publish Now" : "Schedule Quiz")
            : "Continue";

    return (
        <Box sx={{ px: { xs: 1.25, md: 1.75 }, pt: { xs: 1.25, md: 1.5 }, pb: 3, bgcolor: DASH.canvas, minHeight: "calc(100vh - 60px)" }}>
            {isLoading && <Loader />}

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.3, mb: 1.2, minWidth: 0 }}>
                <IconButton onClick={() => navigate(-1)} size="small" sx={{ mt: 0.1 }}>
                    <ArrowBackIcon sx={{ fontSize: 19, color: DASH.text }} />
                </IconButton>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "18px", fontWeight: 700, color: DASH.ink, lineHeight: 1.3 }}>
                        Create Online Quiz
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.1 }}>
                        Upload lesson content to generate questions, or write them yourself. Students attend from the mobile app at the scheduled time.
                    </Typography>
                </Box>
            </Box>

            <WizardHeader step={step} />

            {(
                <>
                    {step === 0 && (
                        <>
                            <SectionTitle icon={AutoAwesomeOutlinedIcon}>How do you want to build this quiz?</SectionTitle>
                            <Grid container spacing={1.5} sx={{ alignItems: "stretch", mb: 1.4 }}>
                                {[
                                    {
                                        key: "automation",
                                        icon: AutoAwesomeOutlinedIcon,
                                        title: "Generate from a lesson",
                                        detail: "Upload a PDF or Word file and let the system draft the questions for you.",
                                        tone: DASH.violet,
                                        bg: DASH.violetLight,
                                    },
                                    {
                                        key: "manual",
                                        icon: EditNoteOutlinedIcon,
                                        title: "Write questions manually",
                                        detail: "Type each question yourself with full control over wording and answers.",
                                        tone: DASH.cyan,
                                        bg: DASH.cyanLight,
                                    },
                                ].map((opt) => {
                                    const active = mode === opt.key;
                                    const Icon = opt.icon;
                                    return (
                                        <Grid key={opt.key} size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                            <Box
                                                onClick={() => setMode(opt.key)}
                                                sx={{
                                                    height: "100%", boxSizing: "border-box", cursor: "pointer",
                                                    bgcolor: "#fff", borderRadius: RADIUS, p: 1.5,
                                                    border: `1px solid ${active ? opt.tone : DASH.line}`,
                                                    boxShadow: active ? `0 0 0 3px ${opt.bg}` : "none",
                                                    display: "flex", gap: 1.6, alignItems: "flex-start",
                                                    transition: "border-color 0.2s, box-shadow 0.2s",
                                                    "&:hover": { borderColor: opt.tone },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 40, height: 40, borderRadius: RADIUS, flexShrink: 0,
                                                        bgcolor: opt.bg, display: "flex", alignItems: "center", justifyContent: "center",
                                                    }}
                                                >
                                                    <Icon sx={{ fontSize: 21, color: opt.tone }} />
                                                </Box>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASH.ink }}>
                                                        {opt.title}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.3, lineHeight: 1.5 }}>
                                                        {opt.detail}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, mt: 0.3,
                                                        border: `2px solid ${active ? opt.tone : DASH.line}`,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                    }}
                                                >
                                                    {active && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: opt.tone }} />}
                                                </Box>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            {mode === "automation" ? (
                                <Grid container spacing={1.5} sx={{ alignItems: "stretch" }}>
                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8 }}>
                                        <Panel title="Lesson Document" subtitle="The questions are drafted from this file" sx={{ height: "100%" }}>
                                            <Box sx={{ p: 1.6 }}>
                                                {file ? (
                                                    <Box
                                                        sx={{
                                                            display: "flex", alignItems: "center", gap: 1.5,
                                                            border: `1px solid ${DASH.primaryBorder}`, bgcolor: DASH.primaryLight,
                                                            borderRadius: RADIUS, p: 1.6,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 38, height: 38, borderRadius: RADIUS, bgcolor: "#fff", flexShrink: 0,
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                            }}
                                                        >
                                                            <DescriptionOutlinedIcon sx={{ fontSize: 20, color: DASH.primary }} />
                                                        </Box>
                                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {file.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                            </Typography>
                                                        </Box>
                                                        <IconButton size="small" onClick={() => setFile(null)}>
                                                            <CloseIcon sx={{ fontSize: 18, color: DASH.muted }} />
                                                        </IconButton>
                                                    </Box>
                                                ) : (
                                                    <Box
                                                        {...getRootProps()}
                                                        sx={{
                                                            border: `1.5px dashed ${isDragActive ? DASH.primary : DASH.line}`,
                                                            bgcolor: isDragActive ? DASH.primaryLight : DASH.surface,
                                                            borderRadius: RADIUS, py: 3.4, px: 2, textAlign: "center", cursor: "pointer",
                                                            transition: "all 0.2s",
                                                            "&:hover": { borderColor: DASH.primary, bgcolor: DASH.primaryLight },
                                                        }}
                                                    >
                                                        <input {...getInputProps()} />
                                                        <CloudUploadOutlinedIcon sx={{ fontSize: 38, color: DASH.primary }} />
                                                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: DASH.ink, mt: 1 }}>
                                                            {isDragActive ? "Drop the file here" : "Drag a lesson file here, or click to browse"}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.5 }}>
                                                            {(limits.allowedFileTypes || []).join(" / ")} up to {limits.maxFileSizeMB} MB
                                                        </Typography>
                                                    </Box>
                                                )}

                                                <Divider sx={{ my: 1.6 }} />

                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.4 }}>
                                                    <MenuBookOutlinedIcon sx={{ fontSize: 17, color: DASH.muted }} />
                                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.text }}>
                                                        Which part of the document?
                                                    </Typography>
                                                </Box>

                                                <RadioGroup
                                                    row
                                                    value={wholeDocument ? "whole" : "range"}
                                                    onChange={(e) => setWholeDocument(e.target.value === "whole")}
                                                    sx={{ mb: 1.5 }}
                                                >
                                                    <FormControlLabel
                                                        value="whole"
                                                        control={<Radio size="small" sx={{ color: DASH.faint, "&.Mui-checked": { color: DASH.primary } }} />}
                                                        label={<Typography sx={{ fontSize: "13px", color: DASH.text }}>Whole document</Typography>}
                                                    />
                                                    <FormControlLabel
                                                        value="range"
                                                        control={<Radio size="small" sx={{ color: DASH.faint, "&.Mui-checked": { color: DASH.primary } }} />}
                                                        label={<Typography sx={{ fontSize: "13px", color: DASH.text }}>Specific pages</Typography>}
                                                    />
                                                </RadioGroup>

                                                {!wholeDocument && (
                                                    <Grid container spacing={1.5}>
                                                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
                                                            <TextField
                                                                fullWidth size="small" label="From page" value={pageFrom}
                                                                onChange={(e) => setPageFrom(e.target.value.replace(/[^0-9]/g, ""))}
                                                                sx={fieldSx}
                                                            />
                                                        </Grid>
                                                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
                                                            <TextField
                                                                fullWidth size="small" label="To page" value={pageTo}
                                                                onChange={(e) => setPageTo(e.target.value.replace(/[^0-9]/g, ""))}
                                                                sx={fieldSx}
                                                            />
                                                        </Grid>
                                                        <Grid size={{ xs: 12, sm: 4, md: 6, lg: 6 }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, height: "100%" }}>
                                                                <InfoOutlinedIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                                                    Up to {limits.maxPages} pages per quiz
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                )}
                                            </Box>
                                        </Panel>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                                        <Panel title="Difficulty" subtitle="Applies to the whole paper" sx={{ height: "100%" }}>
                                            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.2 }}>
                                                {(limits.allowedDifficulties || []).map((level) => {
                                                    const active = difficulty === level;
                                                    const tone = level === "Easy" ? DASH.green : level === "Hard" ? DASH.red : DASH.primary;
                                                    return (
                                                        <Box
                                                            key={level}
                                                            onClick={() => setDifficulty(level)}
                                                            sx={{
                                                                display: "flex", alignItems: "center", gap: 1.2, cursor: "pointer",
                                                                border: `1px solid ${active ? tone : DASH.line}`,
                                                                bgcolor: active ? `${tone}12` : "#fff",
                                                                borderRadius: RADIUS, px: 1.5, py: 1.1,
                                                                transition: "all 0.18s",
                                                                "&:hover": { borderColor: tone },
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                                                                    border: `2px solid ${active ? tone : DASH.line}`,
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                }}
                                                            >
                                                                {active && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: tone }} />}
                                                            </Box>
                                                            <Typography sx={{ fontSize: "13px", fontWeight: active ? 700 : 500, color: active ? DASH.ink : DASH.text }}>
                                                                {level}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </Panel>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Panel title="Manual Question Paper" subtitle="You will type each question in the review step">
                                    <Box sx={{ p: 2, display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                        <EditNoteOutlinedIcon sx={{ fontSize: 22, color: DASH.cyan, mt: 0.2 }} />
                                        <Typography sx={{ fontSize: "13px", color: DASH.text, lineHeight: 1.7 }}>
                                            No document is needed. Set the subject, audience and time limit on the next step, then add
                                            your questions — choose the best answer, true / false and fill in the blanks are all supported.
                                        </Typography>
                                    </Box>
                                </Panel>
                            )}
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <SectionTitle icon={TuneOutlinedIcon}>Quiz Setup</SectionTitle>
                            <Grid container spacing={1.5} sx={{ alignItems: "stretch", mb: 1.4 }}>
                                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 5 }}>
                                    <Panel title="Subject & Time" sx={{ height: "100%" }}>
                                        <Box sx={{ p: 1.6 }}>
                                            <TextField
                                                select fullWidth size="small" label="Subject" value={subject}
                                                onChange={(e) => setSubject(e.target.value)} sx={{ ...fieldSx, mb: 1.4 }}
                                            >
                                                {SUBJECTS.map((s) => (
                                                    <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>{s}</MenuItem>
                                                ))}
                                            </TextField>

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                                                <TimerOutlinedIcon sx={{ fontSize: 17, color: DASH.muted }} />
                                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.text }}>Time limit</Typography>
                                            </Box>

                                            <RadioGroup
                                                row value={timingMode} onChange={(e) => setTimingMode(e.target.value)} sx={{ mb: 1.5 }}
                                            >
                                                <FormControlLabel
                                                    value="overall"
                                                    control={<Radio size="small" sx={{ color: DASH.faint, "&.Mui-checked": { color: DASH.primary } }} />}
                                                    label={<Typography sx={{ fontSize: "13px", color: DASH.text }}>Overall</Typography>}
                                                />
                                                <FormControlLabel
                                                    value="perQuestion"
                                                    control={<Radio size="small" sx={{ color: DASH.faint, "&.Mui-checked": { color: DASH.primary } }} />}
                                                    label={<Typography sx={{ fontSize: "13px", color: DASH.text }}>Per question</Typography>}
                                                />
                                            </RadioGroup>

                                            {timingMode === "overall" ? (
                                                <TextField
                                                    fullWidth size="small" label="Total time" value={overallMinutes}
                                                    onChange={(e) => setOverallMinutes(e.target.value.replace(/[^0-9]/g, ""))}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <Typography sx={{ fontSize: "12px", color: DASH.muted }}>minutes</Typography>
                                                                </InputAdornment>
                                                            ),
                                                        },
                                                    }}
                                                    sx={fieldSx}
                                                />
                                            ) : (
                                                <TextField
                                                    fullWidth size="small" label="Time per question" value={perQuestionSeconds}
                                                    onChange={(e) => setPerQuestionSeconds(e.target.value.replace(/[^0-9]/g, ""))}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <Typography sx={{ fontSize: "12px", color: DASH.muted }}>seconds</Typography>
                                                                </InputAdornment>
                                                            ),
                                                        },
                                                    }}
                                                    sx={fieldSx}
                                                />
                                            )}

                                            <Box
                                                sx={{
                                                    mt: 1.5, display: "flex", alignItems: "center", gap: 1,
                                                    bgcolor: DASH.surface, border: `1px solid ${DASH.lineSoft}`,
                                                    borderRadius: RADIUS, px: 1.4, py: 1,
                                                }}
                                            >
                                                <InfoOutlinedIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                                    Students get <strong style={{ color: DASH.ink }}>{formatDuration(totalDuration)}</strong> to finish the paper
                                                    {timingMode === "perQuestion" && totalQuestions > 0
                                                        ? ` (${totalQuestions} questions x ${perQuestionSeconds} sec)`
                                                        : ""}.
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Panel>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 7 }}>
                                    <Panel
                                        title={mode === "automation" ? "Question Mix" : "Answer Options"}
                                        subtitle={
                                            mode === "automation"
                                                ? `${mixTotal} of ${limits.maxTotalQuestions} questions`
                                                : "Applies to every choose-the-best-answer question"
                                        }
                                        sx={{ height: "100%" }}
                                    >
                                        <Box sx={{ p: 1.6 }}>
                                            {mode === "automation" && (
                                                <Grid container spacing={1.5} sx={{ alignItems: "stretch", mb: 1.4 }}>
                                                    <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                                                        <CountField
                                                            label="Choose the Best Answer"
                                                            value={mix.mcq}
                                                            onChange={(v) => setMix((p) => ({ ...p, mcq: v }))}
                                                            max={limits.maxTotalQuestions}
                                                            tone={TYPE_META.mcq.color}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                                                        <CountField
                                                            label="True / False"
                                                            value={mix.truefalse}
                                                            onChange={(v) => setMix((p) => ({ ...p, truefalse: v }))}
                                                            max={limits.maxTotalQuestions}
                                                            tone={TYPE_META.truefalse.color}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                                                        <CountField
                                                            label="Fill in the Blanks"
                                                            value={mix.fillblank}
                                                            onChange={(v) => setMix((p) => ({ ...p, fillblank: v }))}
                                                            max={limits.maxTotalQuestions}
                                                            tone={TYPE_META.fillblank.color}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            )}

                                            <Grid container spacing={1.5} sx={{ alignItems: "stretch" }}>
                                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 5 }}>
                                                    <CountField
                                                        label="Options per MCQ"
                                                        value={optionCount}
                                                        onChange={setOptionCount}
                                                        min={limits.minOptionsForChoose}
                                                        max={limits.maxOptionsForChoose}
                                                        tone={DASH.blue}
                                                    />
                                                </Grid>
                                                {mode === "automation" && (
                                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 7 }}>
                                                        <Box
                                                            sx={{
                                                                height: "100%", boxSizing: "border-box",
                                                                border: `1px solid ${mixTotal > limits.maxTotalQuestions ? "#FECACA" : DASH.line}`,
                                                                bgcolor: mixTotal > limits.maxTotalQuestions ? DASH.redLight : DASH.surface,
                                                                borderRadius: RADIUS, p: 1.2,
                                                                display: "flex", flexDirection: "column", justifyContent: "center",
                                                            }}
                                                        >
                                                            <Typography sx={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: DASH.faint }}>
                                                                Total questions
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    fontSize: "22px", fontWeight: 700, lineHeight: 1.2, mt: 0.2,
                                                                    color: mixTotal > limits.maxTotalQuestions ? DASH.red : DASH.ink,
                                                                }}
                                                            >
                                                                {mixTotal}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                                                Allowed range {limits.minTotalQuestions} - {limits.maxTotalQuestions}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Box>
                                    </Panel>
                                </Grid>
                            </Grid>

                            <SectionTitle icon={GroupsOutlinedIcon}>Audience</SectionTitle>
                            <Panel
                                title="Grades & Sections"
                                subtitle={selectedSectionCount ? `${selectedSectionCount} sections selected` : "No sections selected yet"}
                                right={
                                    <Button
                                        onClick={toggleAllGrades}
                                        sx={{ textTransform: "none", fontSize: "12px", fontWeight: 700, color: DASH.primary }}
                                    >
                                        {allGradesSelected ? "Clear all" : "Select all"}
                                    </Button>
                                }
                            >
                                <Box sx={{ p: 1.2, maxHeight: 296, overflowY: "auto" }}>
                                    {(grades || []).map((grade) => {
                                        const selected = gradeSections[grade.id] || [];
                                        const all = grade.sections || [];
                                        const fully = all.length > 0 && selected.length === all.length;
                                        return (
                                            <Accordion
                                                key={grade.id}
                                                expanded={expandedGrade === grade.id}
                                                onChange={() => setExpandedGrade(expandedGrade === grade.id ? null : grade.id)}
                                                disableGutters
                                                elevation={0}
                                                sx={{
                                                    border: `1px solid ${selected.length ? DASH.primaryBorder : DASH.line}`,
                                                    bgcolor: selected.length ? DASH.primaryLight : "#fff",
                                                    borderRadius: `${RADIUS} !important`, mb: 1,
                                                    "&:before": { display: "none" },
                                                }}
                                            >
                                                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 19, color: DASH.muted }} />} sx={{ minHeight: 44, px: 1.5 }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                                        <Checkbox
                                                            size="small"
                                                            checked={fully}
                                                            indeterminate={selected.length > 0 && !fully}
                                                            onClick={(e) => { e.stopPropagation(); toggleGrade(grade); }}
                                                            sx={{ p: 0.5, color: DASH.faint, "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: DASH.primary } }}
                                                        />
                                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: DASH.ink }}>
                                                            {grade.sign}
                                                        </Typography>
                                                        {selected.length > 0 && (
                                                            <Chip
                                                                label={`${selected.length}/${all.length}`}
                                                                size="small"
                                                                sx={{ height: 19, fontSize: "10.5px", fontWeight: 700, bgcolor: "#fff", color: DASH.primary, border: `1px solid ${DASH.primaryBorder}` }}
                                                            />
                                                        )}
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 1.5 }}>
                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                                                        {all.map((section) => {
                                                            const on = selected.includes(section);
                                                            return (
                                                                <Chip
                                                                    key={section}
                                                                    label={section}
                                                                    size="small"
                                                                    onClick={() => toggleSection(grade, section)}
                                                                    sx={{
                                                                        cursor: "pointer", fontSize: "11.5px", fontWeight: 600,
                                                                        bgcolor: on ? DASH.primary : "#fff",
                                                                        color: on ? "#fff" : DASH.text,
                                                                        border: `1px solid ${on ? DASH.primary : DASH.line}`,
                                                                        "&:hover": { bgcolor: on ? DASH.primary : DASH.primaryLight },
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        );
                                    })}
                                </Box>
                            </Panel>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <SectionTitle icon={FactCheckOutlinedIcon}>Review & Edit</SectionTitle>
                            <Grid container spacing={1.5} sx={{ alignItems: "stretch", mb: 1.4, opacity: processing ? 0.6 : 1 }}>
                                <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                    <SummaryTile label="Total" value={processing ? mixTotal : counts.total} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                    <SummaryTile label="MCQ" value={processing ? mix.mcq : counts.mcq} tone={TYPE_META.mcq.color} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                    <SummaryTile label="True / False" value={processing ? mix.truefalse : counts.truefalse} tone={TYPE_META.truefalse.color} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                    <SummaryTile label="Blanks" value={processing ? mix.fillblank : counts.fillblank} tone={TYPE_META.fillblank.color} />
                                </Grid>
                            </Grid>

                            {processing ? (
                                <AiProcessingView
                                    steps={AI_STEPS}
                                    activeIndex={processing.activeIndex}
                                    progress={processing.progress}
                                    fileName={processing.fileName}
                                    pageLabel={pageLabel}
                                    secondsLeft={processing.secondsLeft}
                                    onCancel={cancelProcessing}
                                    skeletonCount={Math.min(4, Math.max(2, mixTotal))}
                                />
                            ) : (
                            <Panel
                                title="Questions"
                                subtitle={`${filteredQuestions.length} shown`}
                                right={
                                    <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap" }}>
                                        {["all", "mcq", "truefalse", "fillblank"].map((key) => {
                                            const on = reviewFilter === key;
                                            const label = key === "all" ? "All" : TYPE_META[key].short;
                                            return (
                                                <Chip
                                                    key={key}
                                                    label={label}
                                                    size="small"
                                                    onClick={() => setReviewFilter(key)}
                                                    sx={{
                                                        cursor: "pointer", fontSize: "11.5px", fontWeight: 600, height: 26,
                                                        bgcolor: on ? DASH.primary : "#fff",
                                                        color: on ? "#fff" : DASH.text,
                                                        border: `1px solid ${on ? DASH.primary : DASH.line}`,
                                                        "&:hover": { bgcolor: on ? DASH.primary : DASH.primaryLight },
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                }
                            >
                                <Box sx={{ p: 1.6 }}>
                                    {questions.length > 0 && (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 1.2,
                                                bgcolor: DASH.greenLight,
                                                border: "1px solid #BBF7D0",
                                                borderRadius: RADIUS,
                                                px: 1.4,
                                                py: 1.1,
                                                mb: 1.6,
                                            }}
                                        >
                                            <CheckCircleIcon sx={{ fontSize: 17, color: DASH.green, mt: 0.15, flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: "12px", color: DASH.text, lineHeight: 1.65 }}>
                                                <strong style={{ color: DASH.ink }}>The correct answers are already selected for you.</strong>{" "}
                                                Every option marked <strong style={{ color: DASH.green }}>CORRECT</strong> is the answer students
                                                will be scored against. If any of them is wrong, just pick a different option or retype the answer —
                                                whatever is selected on this screen is what gets saved.
                                            </Typography>
                                        </Box>
                                    )}

                                    {filteredQuestions.length === 0 && (
                                        <Box sx={{ textAlign: "center", py: 5 }}>
                                            <QuizOutlinedIcon sx={{ fontSize: 40, color: DASH.line }} />
                                            <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: DASH.muted, mt: 0.8 }}>
                                                No questions here yet
                                            </Typography>
                                            <Typography sx={{ fontSize: "12px", color: DASH.faint, mt: 0.3 }}>
                                                Use the buttons below to add one.
                                            </Typography>
                                        </Box>
                                    )}

                                    {filteredQuestions.map((q) => {
                                        const meta = TYPE_META[q.type];
                                        const index = questions.findIndex((item) => item.uid === q.uid) + 1;
                                        return (
                                            <Box
                                                key={q.uid}
                                                sx={{
                                                    border: `1px solid ${DASH.line}`, borderLeft: `3px solid ${meta.color}`,
                                                    borderRadius: RADIUS, p: 1.5, mb: 1.1,
                                                    transition: "border-color 0.18s, box-shadow 0.18s",
                                                    "&:hover": { boxShadow: "0 2px 10px rgba(17,24,39,0.06)" },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.4 }}>
                                                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.faint }}>
                                                        Q{index}
                                                    </Typography>
                                                    <Chip
                                                        label={meta.label}
                                                        size="small"
                                                        sx={{ height: 21, fontSize: "10.5px", fontWeight: 700, bgcolor: meta.bg, color: meta.color }}
                                                    />
                                                    <Box sx={{ flex: 1 }} />
                                                    <Tooltip title="Remove question" arrow>
                                                        <IconButton size="small" onClick={() => removeQuestion(q.uid)} sx={{ color: DASH.faint, "&:hover": { color: DASH.red } }}>
                                                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>

                                                <TextField
                                                    fullWidth multiline minRows={1} size="small" placeholder="Question text"
                                                    value={q.question}
                                                    onChange={(e) => updateQuestion(q.uid, { question: e.target.value })}
                                                    sx={{ ...fieldSx, mb: 1.4 }}
                                                />

                                                {q.type === "mcq" && (
                                                    <Grid container spacing={1.2}>
                                                        {q.options.map((opt, i) => (
                                                            <Grid key={i} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                                                    <Radio
                                                                        size="small"
                                                                        checked={opt.isCorrect === "Y"}
                                                                        onChange={() => setCorrectOption(q.uid, i)}
                                                                        sx={{ color: DASH.faint, "&.Mui-checked": { color: DASH.green } }}
                                                                    />
                                                                    <TextField
                                                                        fullWidth size="small"
                                                                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                                        value={opt.optionText}
                                                                        onChange={(e) => updateOption(q.uid, i, { optionText: e.target.value })}
                                                                        slotProps={{
                                                                            input: {
                                                                                endAdornment: opt.isCorrect === "Y" ? (
                                                                                    <InputAdornment position="end">
                                                                                        <CorrectTag compact />
                                                                                    </InputAdornment>
                                                                                ) : null,
                                                                            },
                                                                        }}
                                                                        sx={{
                                                                            ...fieldSx,
                                                                            "& .MuiOutlinedInput-root": {
                                                                                ...fieldSx["& .MuiOutlinedInput-root"],
                                                                                bgcolor: opt.isCorrect === "Y" ? DASH.greenLight : "#fff",
                                                                            },
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}

                                                {q.type === "truefalse" && (
                                                    <RadioGroup
                                                        row value={q.answer}
                                                        onChange={(e) => updateQuestion(q.uid, { answer: e.target.value })}
                                                    >
                                                        <FormControlLabel
                                                            value="Y"
                                                            control={<Radio size="small" sx={{ color: DASH.faint, "&.Mui-checked": { color: DASH.green } }} />}
                                                            label={
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                                                    <Typography sx={{ fontSize: "13px", color: DASH.text }}>True</Typography>
                                                                    {q.answer === "Y" && <CorrectTag />}
                                                                </Box>
                                                            }
                                                        />
                                                        <FormControlLabel
                                                            value="N"
                                                            control={<Radio size="small" sx={{ color: DASH.faint, "&.Mui-checked": { color: DASH.red } }} />}
                                                            label={
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                                                    <Typography sx={{ fontSize: "13px", color: DASH.text }}>False</Typography>
                                                                    {q.answer === "N" && <CorrectTag />}
                                                                </Box>
                                                            }
                                                        />
                                                    </RadioGroup>
                                                )}

                                                {q.type === "fillblank" && (
                                                    <TextField
                                                        fullWidth size="small" label="Correct answer"
                                                        value={q.answer}
                                                        onChange={(e) => updateQuestion(q.uid, { answer: e.target.value })}
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: String(q.answer || "").trim() ? (
                                                                    <InputAdornment position="end">
                                                                        <CorrectTag compact />
                                                                    </InputAdornment>
                                                                ) : null,
                                                            },
                                                        }}
                                                        sx={{
                                                            ...fieldSx,
                                                            maxWidth: 340,
                                                            "& .MuiOutlinedInput-root": {
                                                                ...fieldSx["& .MuiOutlinedInput-root"],
                                                                bgcolor: DASH.greenLight,
                                                            },
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        );
                                    })}

                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pt: 0.5 }}>
                                        {["mcq", "truefalse", "fillblank"].map((type) => (
                                            <Button
                                                key={type}
                                                onClick={() => addQuestion(type)}
                                                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                                sx={{
                                                    textTransform: "none", fontSize: "12.5px", fontWeight: 600,
                                                    color: TYPE_META[type].color, bgcolor: TYPE_META[type].bg,
                                                    borderRadius: RADIUS, px: 1.6,
                                                    "&:hover": { bgcolor: TYPE_META[type].bg, filter: "brightness(0.96)" },
                                                }}
                                            >
                                                Add {TYPE_META[type].short}
                                            </Button>
                                        ))}
                                    </Box>
                                </Box>
                            </Panel>
                            )}
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <SectionTitle icon={RocketLaunchOutlinedIcon}>Schedule</SectionTitle>
                            <Grid container spacing={1.5} sx={{ alignItems: "stretch", mb: 1.4 }}>
                                <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7 }}>
                                    <Panel title="When should students attend?" sx={{ height: "100%" }}>
                                        <Box sx={{ p: 1.6 }}>
                                            <Grid container spacing={1.5} sx={{ alignItems: "stretch", mb: 1.4 }}>
                                                {[
                                                    { key: "schedule", icon: ScheduleSendOutlinedIcon, title: "Schedule", detail: "Opens automatically at the chosen time", tone: DASH.blue, bg: DASH.blueLight },
                                                    { key: "post", icon: SendOutlinedIcon, title: "Publish now", detail: "Students can start immediately", tone: DASH.green, bg: DASH.greenLight },
                                                ].map((opt) => {
                                                    const active = publishMode === opt.key;
                                                    const Icon = opt.icon;
                                                    return (
                                                        <Grid key={opt.key} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                            <Box
                                                                onClick={() => setPublishMode(opt.key)}
                                                                sx={{
                                                                    height: "100%", boxSizing: "border-box", cursor: "pointer",
                                                                    border: `1px solid ${active ? opt.tone : DASH.line}`,
                                                                    bgcolor: active ? opt.bg : "#fff",
                                                                    borderRadius: RADIUS, p: 1.5,
                                                                    display: "flex", gap: 1.2, alignItems: "flex-start",
                                                                    transition: "all 0.18s",
                                                                    "&:hover": { borderColor: opt.tone },
                                                                }}
                                                            >
                                                                <Icon sx={{ fontSize: 20, color: opt.tone, mt: 0.2 }} />
                                                                <Box sx={{ minWidth: 0 }}>
                                                                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink }}>
                                                                        {opt.title}
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                                                        {opt.detail}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>

                                            <Divider sx={{ mb: 1.5 }} />

                                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink, mb: 0.9 }}>
                                                What happens to a student who starts late?
                                            </Typography>

                                            <Grid container spacing={1.2} sx={{ alignItems: "stretch", mb: 1.6 }}>
                                                {ATTEMPT_MODES.map((opt) => {
                                                    const active = attendanceMode === opt.key;
                                                    const Icon = opt.icon;
                                                    return (
                                                        <Grid key={opt.key} size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                                                            <Box
                                                                onClick={() => setAttendanceMode(opt.key)}
                                                                sx={{
                                                                    height: "100%", boxSizing: "border-box", cursor: "pointer",
                                                                    border: `1px solid ${active ? DASH.violet : DASH.line}`,
                                                                    bgcolor: active ? DASH.violetLight : "#fff",
                                                                    borderRadius: RADIUS, p: 1.3,
                                                                    transition: "all 0.18s",
                                                                    "&:hover": { borderColor: DASH.violet },
                                                                }}
                                                            >
                                                                <Icon sx={{ fontSize: 19, color: active ? DASH.violet : DASH.faint }} />
                                                                <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink, mt: 0.5 }}>
                                                                    {opt.title}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.2, lineHeight: 1.5 }}>
                                                                    {opt.detail}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>

                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <Grid container spacing={1.5}>
                                                    {attendanceMode === "anytime" ? (
                                                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                            <DatePicker
                                                                label="Attempt date"
                                                                value={attemptDate}
                                                                onChange={setAttemptDate}
                                                                format={DATE_FORMAT}
                                                                minDate={dayjs().startOf("day")}
                                                                disabled={publishMode === "post"}
                                                                slotProps={pickerSlotProps({
                                                                    helperText: publishMode === "post"
                                                                        ? "Fixed to today — you are publishing now"
                                                                        : "Open all day — students pick their own time",
                                                                })}
                                                            />
                                                        </Grid>
                                                    ) : (
                                                        <>
                                                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                                {publishMode === "schedule" ? (
                                                                    <DateTimePicker
                                                                        label="Starts at"
                                                                        value={scheduledAt}
                                                                        onChange={(value) => {
                                                                            setScheduledAt(value);
                                                                            setScheduleTouched(true);
                                                                        }}
                                                                        format={DATE_TIME_FORMAT}
                                                                        minDateTime={scheduleFloor}
                                                                        slotProps={pickerSlotProps({
                                                                            helperText: scheduleTouched
                                                                                ? "Students can begin from this time"
                                                                                : `Defaults to ${SCHEDULE_LEAD_MINUTES} minutes from now - change it if you need to`,
                                                                        })}
                                                                    />
                                                                ) : (
                                                                    <TextField
                                                                        label="Starts at"
                                                                        value={nowAnchor.format(DATE_TIME_FORMAT)}
                                                                        disabled
                                                                        size="small"
                                                                        fullWidth
                                                                        sx={fieldSx}
                                                                        helperText="Fixed — the quiz opens the moment you publish"
                                                                    />
                                                                )}
                                                            </Grid>
                                                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                                <DateTimePicker
                                                                    label={attendanceMode === "fulltime" ? "Last start time" : "Should complete before"}
                                                                    value={completeBefore}
                                                                    onChange={setCompleteBefore}
                                                                    format={DATE_TIME_FORMAT}
                                                                    minDateTime={minCompleteBefore}
                                                                    slotProps={pickerSlotProps({
                                                                        helperText: attendanceMode === "fulltime"
                                                                            ? `Nobody may begin after this — last paper ends ${effectiveEnd ? effectiveEnd.format("hh:mm A") : "-"}`
                                                                            : `Minimum ${formatDuration(requiredWindow)} window — ${formatDuration(totalDuration)} quiz + ${GRACE_MINUTES} min grace`,
                                                                    })}
                                                                />
                                                            </Grid>
                                                        </>
                                                    )}
                                                </Grid>
                                            </LocalizationProvider>

                                            <Box
                                                sx={{
                                                    display: "flex", alignItems: "flex-start", gap: 1.1, mt: 1.6,
                                                    bgcolor: DASH.surface, border: `1px solid ${DASH.lineSoft}`,
                                                    borderRadius: RADIUS, px: 1.4, py: 1.1,
                                                }}
                                            >
                                                <InfoOutlinedIcon sx={{ fontSize: 15, color: DASH.faint, mt: 0.2, flexShrink: 0 }} />
                                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, lineHeight: 1.6 }}>
                                                    {attendanceMode === "anytime" && (
                                                        <>
                                                            The quiz stays open all day on{" "}
                                                            <strong style={{ color: DASH.ink }}>
                                                                {attemptDate ? attemptDate.format("DD MMM YYYY") : "-"}
                                                            </strong>. A student who begins at 11:40 PM still gets the full{" "}
                                                            <strong style={{ color: DASH.ink }}>{formatDuration(totalDuration)}</strong>, so the last
                                                            paper can close just after midnight.
                                                        </>
                                                    )}
                                                    {attendanceMode === "fulltime" && (
                                                        <>
                                                            The time you pick is the last moment a student may{" "}
                                                            <strong style={{ color: DASH.ink }}>start</strong>, not the end. Their{" "}
                                                            <strong style={{ color: DASH.ink }}>{formatDuration(totalDuration)}</strong> then runs from
                                                            their own start — someone opening it at{" "}
                                                            <strong style={{ color: DASH.ink }}>
                                                                {completeBefore ? completeBefore.format("hh:mm A") : "-"}
                                                            </strong>{" "}
                                                            finishes at{" "}
                                                            <strong style={{ color: DASH.ink }}>
                                                                {effectiveEnd ? effectiveEnd.format("hh:mm A") : "-"}
                                                            </strong>. So the quiz can still be running after the time you set, and nobody loses
                                                            time for starting late.
                                                        </>
                                                    )}
                                                    {attendanceMode === "fixedend" && (
                                                        <>
                                                            The quiz runs for <strong style={{ color: DASH.ink }}>{formatDuration(totalDuration)}</strong>
                                                            {timingMode === "perQuestion" && totalQuestions > 0
                                                                ? ` (${totalQuestions} questions x ${perQuestionSeconds} sec)`
                                                                : ""}
                                                            , so the attempt window must be at least{" "}
                                                            <strong style={{ color: DASH.ink }}>{formatDuration(requiredWindow)}</strong> including the{" "}
                                                            {GRACE_MINUTES} minute grace period. A student starting 5 minutes before the deadline gets
                                                            only those 5 minutes.
                                                        </>
                                                    )}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Panel>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5 }}>
                                    <Panel title="Quiz Summary" sx={{ height: "100%" }}>
                                        <Box sx={{ p: 1.6 }}>
                                            <Grid container spacing={1.2} sx={{ alignItems: "stretch", mb: 1.8 }}>
                                                <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                                    <SummaryTile label="Questions" value={counts.total} />
                                                </Grid>
                                                <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                                    <SummaryTile label="Time limit" value={formatDuration(totalDuration)} tone={DASH.primary} />
                                                </Grid>
                                                <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                                    <SummaryTile label="Sections" value={selectedSectionCount} tone={DASH.blue} />
                                                </Grid>
                                                <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                                    <SummaryTile label="Subject" value={subject || "-"} tone={DASH.violet} />
                                                </Grid>
                                            </Grid>

                                            <Divider sx={{ mb: 1.5 }} />

                                            {[
                                                ["Starts", attendanceMode === "anytime"
                                                    ? (attemptDate ? `${attemptDate.format(DATE_FORMAT)} — any time` : "-")
                                                    : publishMode === "post" ? "Immediately" : (scheduledAt ? scheduledAt.format(DATE_TIME_FORMAT) : "-")],
                                                [attendanceMode === "fulltime" ? "Last start time" : "Must finish before",
                                                    attendanceMode === "anytime"
                                                        ? (attemptDate ? attemptDate.endOf("day").format(DATE_TIME_FORMAT) : "-")
                                                        : (completeBefore ? completeBefore.format(DATE_TIME_FORMAT) : "-")],
                                                ["Last paper closes", effectiveEnd ? effectiveEnd.format(DATE_TIME_FORMAT) : "-"],
                                                ["Attempt window", effectiveEnd ? formatDuration(effectiveEnd.diff(windowStart, "minute")) : "-"],
                                                ["Exit warnings", `${warningCount} ${Number(warningCount) === 1 ? "warning" : "warnings"}`],
                                                ["Academic year", academicYear || "-"],
                                                ["Built by", mode === "automation" ? `Document (${difficulty})` : "Written manually"],
                                                ["Options per MCQ", optionCount],
                                                ["Created by", rollNumber || "-"],
                                            ].map(([label, value]) => (
                                                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 0.55 }}>
                                                    <Typography sx={{ fontSize: "12px", color: DASH.muted }}>{label}</Typography>
                                                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: DASH.ink, textAlign: "right" }}>
                                                        {value}
                                                    </Typography>
                                                </Box>
                                            ))}

                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: 1.4 }}>
                                                {Object.entries(gradeSections).map(([gradeId, sections]) => {
                                                    const grade = (grades || []).find((g) => String(g.id) === String(gradeId));
                                                    return (
                                                        <Chip
                                                            key={gradeId}
                                                            label={`${grade?.sign || gradeId} · ${sections.join(", ")}`}
                                                            size="small"
                                                            sx={{ height: 21, fontSize: "10.5px", fontWeight: 600, bgcolor: DASH.blueLight, color: DASH.blue }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    </Panel>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                    <Panel
                                        title="Exam integrity"
                                        subtitle="What the app does if a student leaves the quiz"
                                    >
                                        <Box sx={{ p: 1.6 }}>
                                            <Box
                                                sx={{
                                                    display: "flex", alignItems: "flex-start", gap: 1.2, mb: 1.8,
                                                    bgcolor: DASH.redLight, border: `1px solid ${DASH.red}33`,
                                                    borderRadius: RADIUS, px: 1.4, py: 1.2,
                                                }}
                                            >
                                                <PhonelinkEraseOutlinedIcon sx={{ fontSize: 18, color: DASH.red, mt: 0.2, flexShrink: 0 }} />
                                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, lineHeight: 1.6 }}>
                                                    While the quiz is running the app watches for the student leaving — switching to another app,
                                                    opening recents, or locking the screen. Each time that happens they get a warning on the way back.
                                                    Once the warnings run out the attempt is submitted automatically with whatever was answered.
                                                </Typography>
                                            </Box>

                                            <Grid container spacing={1.5} sx={{ alignItems: "stretch" }}>
                                                <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7 }}>
                                                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink, mb: 0.9 }}>
                                                        Warnings allowed before auto-submit
                                                    </Typography>
                                                    <Grid container spacing={1}>
                                                        {WARNING_OPTIONS.map((opt) => {
                                                            const active = Number(warningCount) === opt.value;
                                                            return (
                                                                <Grid key={opt.value} size={{ xs: 3, sm: 3, md: 3, lg: 3 }}>
                                                                    <Box
                                                                        onClick={() => setWarningCount(opt.value)}
                                                                        sx={{
                                                                            cursor: "pointer", textAlign: "center",
                                                                            border: `1px solid ${active ? DASH.red : DASH.line}`,
                                                                            bgcolor: active ? DASH.redLight : "#fff",
                                                                            borderRadius: RADIUS, py: 1.1, px: 0.5,
                                                                            transition: "all 0.18s",
                                                                            "&:hover": { borderColor: DASH.red },
                                                                        }}
                                                                    >
                                                                        <Typography sx={{
                                                                            fontSize: "20px", fontWeight: 800, lineHeight: 1.1,
                                                                            color: active ? DASH.red : DASH.ink,
                                                                        }}>
                                                                            {opt.label}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: "10.5px", color: DASH.muted, mt: 0.3 }}>
                                                                            {opt.caption}
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                            );
                                                        })}
                                                    </Grid>
                                                </Grid>

                                                <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5 }}>
                                                    <Box
                                                        sx={{
                                                            height: "100%", boxSizing: "border-box",
                                                            bgcolor: DASH.surface, border: `1px solid ${DASH.lineSoft}`,
                                                            borderRadius: RADIUS, px: 1.4, py: 1.2,
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.7 }}>
                                                            <ShieldOutlinedIcon sx={{ fontSize: 16, color: DASH.violet }} />
                                                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink }}>
                                                                What students will see
                                                            </Typography>
                                                        </Box>
                                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, lineHeight: 1.7 }}>
                                                            {Number(warningCount) === 0
                                                                ? "The very first exit closes the quiz on the spot."
                                                                : `The first ${warningCount} ${Number(warningCount) === 1 ? "exit only shows a warning" : "exits only show a warning"}. Exit ${Number(warningCount) + 1} closes the quiz on the spot.`}
                                                            {" "}
                                                            <strong style={{ color: DASH.ink }}>
                                                                No more questions are shown and they cannot reopen it.
                                                            </strong>
                                                            {" "}
                                                            Only the answers already given are submitted — if they answered 3 of {counts.total || totalQuestions || "N"},
                                                            just those 3 are marked and the rest count as unanswered.
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Panel>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    <Box
                        sx={{
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5,
                            bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
                            px: 1.6, py: 1, mt: 1.4, flexWrap: "wrap",
                        }}
                    >
                        <Button
                            onClick={handleBack}
                            disabled={Boolean(processing)}
                            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: "none", fontSize: "12.5px", fontWeight: 600, color: DASH.text,
                                border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.8,
                                "&:hover": { bgcolor: DASH.surface },
                            }}
                        >
                            {step === 0 ? "Cancel" : "Back"}
                        </Button>

                        <Typography sx={{ fontSize: "12px", color: DASH.faint, display: { xs: "none", sm: "block" } }}>
                            Step {step + 1} of {WIZARD_STEPS.length} — {WIZARD_STEPS[step].label}
                        </Typography>

                        <Button
                            onClick={step === WIZARD_STEPS.length - 1 ? () => { if (validateStep()) publishQuiz(); } : handleNext}
                            disabled={isLoading || Boolean(processing)}
                            endIcon={
                                step === 1 && mode === "automation"
                                    ? <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
                                    : <ArrowForwardIcon sx={{ fontSize: 16 }} />
                            }
                            sx={{
                                textTransform: "none", fontSize: "12.5px", fontWeight: 700, color: "#fff",
                                bgcolor: DASH.primary, borderRadius: RADIUS, px: 2.4, boxShadow: "none",
                                "&:hover": { bgcolor: "#D89400" },
                                "&.Mui-disabled": { bgcolor: DASH.line, color: "#fff" },
                            }}
                        >
                            {nextLabel}
                        </Button>
                    </Box>
                </>
            )}

            <SnackBar open={open} message={message} setOpen={setOpen} status={status} color={color} />
        </Box>
    );
}
