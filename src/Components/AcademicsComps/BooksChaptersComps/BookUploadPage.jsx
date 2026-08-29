import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, LinearProgress, Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS, Panel } from "../../DashBoardComps/dashboardTheme";
import { selectAcademicYear, selectAcademicYearOptions } from "../../../Redux/Slices/academicYearSlice";
import { useGradeSubjects, gradeSign } from "../academicMeta";
import { ACCEPTED_TYPES, BOARDS, MAX_FILE_MB, MEDIUMS, PARSE_STEPS } from "./bookApi";
import { fieldSx, outlineBtnSx, primaryBtnSx } from "./bookTheme";

const STEP_MS = 900;

const emptyForm = {
    gradeId: "",
    subject: "",
    academicYear: "",
    medium: "English",
    title: "",
    board: "State Board",
    edition: String(new Date().getFullYear()),
};

/* Stand-in for the chapter split the parser returns. Replaced by the
   chapters array in the book/upload response. */
const buildMockChapters = (fileName) => {
    const base = String(fileName || "book").replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    const count = 6 + (base.length % 4);
    let page = 1;
    return Array.from({ length: count }, (_, i) => {
        const span = 9 + ((i * 7) % 12);
        const chapter = {
            id: `ch-${i + 1}`,
            number: i + 1,
            title: `Chapter ${i + 1}`,
            startPage: page,
            endPage: page + span,
            wordCount: 1100 + ((i * 419) % 2900),
            topics: [],
            preview: "Extracted text for this chapter will appear here once the parser finishes.",
            confirmed: false,
        };
        page += span + 1;
        return chapter;
    });
};

const FileIcon = ({ name }) =>
    String(name || "").toLowerCase().endsWith(".pdf")
        ? <PictureAsPdfOutlinedIcon sx={{ fontSize: 22, color: DASH.red }} />
        : <DescriptionOutlinedIcon sx={{ fontSize: 22, color: DASH.blue }} />;

const ProcessingView = ({ stepIndex, fileName }) => (
    <Box
        sx={{
            bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
            p: { xs: 2.5, md: 4 }, textAlign: "center",
        }}
    >
        <Box
            sx={{
                width: 62, height: 62, borderRadius: "50%", mx: "auto",
                bgcolor: DASH.primaryLight, border: `1px solid ${DASH.primaryBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 28, color: DASH.primary }} />
        </Box>

        <Typography sx={{ fontSize: "17px", fontWeight: 700, color: DASH.ink, mt: 1.6 }}>
            Splitting the book into chapters
        </Typography>
        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.4 }}>
            {fileName} - keep this screen open, it usually takes under a minute.
        </Typography>

        <Box sx={{ maxWidth: 470, mx: "auto", mt: 3, textAlign: "left" }}>
            {PARSE_STEPS.map((step, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                    <Box key={step.title} sx={{ display: "flex", gap: 1.4, mb: 2 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                            <Box
                                sx={{
                                    width: 24, height: 24, borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    bgcolor: done ? DASH.green : active ? DASH.primary : "#fff",
                                    border: `2px solid ${done ? DASH.green : active ? DASH.primary : DASH.line}`,
                                    transition: "all .3s ease",
                                }}
                            >
                                {done
                                    ? <CheckCircleIcon sx={{ fontSize: 14, color: "#fff" }} />
                                    : <Typography sx={{ fontSize: "10.5px", fontWeight: 800, color: active ? "#fff" : DASH.faint }}>{i + 1}</Typography>}
                            </Box>
                            {i < PARSE_STEPS.length - 1 && (
                                <Box sx={{ width: 2, flex: 1, minHeight: 18, bgcolor: done ? DASH.green : DASH.lineSoft, mt: 0.4 }} />
                            )}
                        </Box>
                        <Box sx={{ minWidth: 0, pb: 0.5 }}>
                            <Typography sx={{ fontSize: "13px", fontWeight: active || done ? 700 : 600, color: active || done ? DASH.ink : DASH.faint }}>
                                {step.title}
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                {step.detail}
                            </Typography>
                            {active && (
                                <LinearProgress
                                    sx={{
                                        mt: 0.8, height: 4, borderRadius: RADIUS, bgcolor: DASH.lineSoft, maxWidth: 220,
                                        "& .MuiLinearProgress-bar": { bgcolor: DASH.primary },
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    </Box>
);

export default function BookUploadPage() {
    const navigate = useNavigate();
    const academicYear = useSelector(selectAcademicYear);
    const yearOptions = useSelector(selectAcademicYearOptions) || [];
    const { grades, subjectsForGrade } = useGradeSubjects();

    const [form, setForm] = useState({ ...emptyForm, academicYear: academicYear || "" });
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const timers = useRef([]);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    useEffect(() => {
        if (academicYear && !form.academicYear) setForm((p) => ({ ...p, academicYear }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    const subjects = useMemo(
        () => subjectsForGrade(form.gradeId),
        [subjectsForGrade, form.gradeId]
    );

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const onDrop = (accepted, rejected) => {
        if (rejected?.length) {
            notify(`Only ${ACCEPTED_TYPES.join(", ")} files up to ${MAX_FILE_MB} MB are accepted`);
            return;
        }
        const picked = accepted?.[0];
        if (!picked) return;
        setFile(picked);
        setErrors((prev) => ({ ...prev, file: "" }));
        if (!form.title) {
            setField("title", picked.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        maxSize: MAX_FILE_MB * 1024 * 1024,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "application/msword": [".doc"],
        },
    });

    const validate = () => {
        const next = {};
        if (!form.gradeId) next.gradeId = "Pick a class";
        if (!form.subject) next.subject = "Pick a subject";
        if (!form.academicYear) next.academicYear = "Pick an academic year";
        if (!form.title.trim()) next.title = "Give the book a title";
        if (!file) next.file = "Attach the book file";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    /* Simulated parse. Replace with a multipart POST to book/upload and drive
       the same step display from the upload progress / poll response. */
    const startUpload = () => {
        if (!validate()) {
            notify("Fill the highlighted fields before uploading");
            return;
        }
        setProcessing(true);
        setStepIndex(0);

        PARSE_STEPS.forEach((_, i) => {
            timers.current.push(setTimeout(() => setStepIndex(i), i * STEP_MS));
        });

        timers.current.push(setTimeout(() => {
            const book = {
                id: `new-${Date.now()}`,
                title: form.title.trim(),
                gradeId: form.gradeId,
                grade: gradeSign(grades, form.gradeId),
                subject: form.subject,
                academicYear: form.academicYear,
                medium: form.medium,
                board: form.board,
                edition: form.edition,
                fileName: file.name,
                fileUrl: "",
                fileSizeMB: Math.round((file.size / (1024 * 1024)) * 10) / 10,
                pages: 0,
                chapters: buildMockChapters(file.name),
                status: "Needs Review",
                uploadedBy: "You",
                uploadedDate: null,
                usedInPapers: 0,
            };
            book.chapterCount = book.chapters.length;
            book.pages = book.chapters[book.chapters.length - 1]?.endPage || 0;

            navigate(`/dashboardmenu/books/${book.id}`, { state: { book, justUploaded: true } });
        }, PARSE_STEPS.length * STEP_MS + 600));
    };

    const dropBorder = errors.file ? DASH.red : isDragActive ? DASH.primary : DASH.line;

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mt: -0.5 }} disabled={processing}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                </IconButton>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                        Upload Book
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                        Class, subject and year decide where the book sits. Chapters are detected automatically.
                    </Typography>
                </Box>
            </Box>

            {processing ? (
                <ProcessingView stepIndex={stepIndex} fileName={file?.name} />
            ) : (
                <>
                    <Grid container spacing={1.8}>
                        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                            <Panel title="Book Details" subtitle="Where this book belongs" accent={DASH.primary} sx={{ mb: 1.8 }}>
                                <Grid container spacing={1.6}>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <TextField
                                            select fullWidth size="small" label="Class"
                                            value={form.gradeId}
                                            onChange={(e) => { setField("gradeId", e.target.value); setField("subject", ""); }}
                                            error={Boolean(errors.gradeId)} helperText={errors.gradeId || " "}
                                            sx={fieldSx}
                                        >
                                            {grades.map((g) => (
                                                <MenuItem key={g.id} value={String(g.id)} sx={{ fontSize: "13px" }}>
                                                    {g.sign}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <TextField
                                            select fullWidth size="small" label="Subject"
                                            value={form.subject}
                                            onChange={(e) => setField("subject", e.target.value)}
                                            disabled={!form.gradeId}
                                            error={Boolean(errors.subject)}
                                            helperText={errors.subject || (form.gradeId && subjects.length === 0 ? "No subjects mapped to this class yet" : " ")}
                                            sx={fieldSx}
                                        >
                                            {subjects.map((s) => (
                                                <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>{s}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <TextField
                                            select fullWidth size="small" label="Academic Year"
                                            value={form.academicYear}
                                            onChange={(e) => setField("academicYear", e.target.value)}
                                            error={Boolean(errors.academicYear)} helperText={errors.academicYear || " "}
                                            sx={fieldSx}
                                        >
                                            {(yearOptions.length ? yearOptions : [academicYear].filter(Boolean)).map((y) => (
                                                <MenuItem key={y} value={y} sx={{ fontSize: "13px" }}>{y}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8 }}>
                                        <TextField
                                            fullWidth size="small" label="Book Title"
                                            placeholder="e.g. Mathematics - Term I"
                                            value={form.title}
                                            onChange={(e) => setField("title", e.target.value)}
                                            error={Boolean(errors.title)} helperText={errors.title || " "}
                                            sx={fieldSx}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <TextField
                                            select fullWidth size="small" label="Medium"
                                            value={form.medium}
                                            onChange={(e) => setField("medium", e.target.value)}
                                            helperText=" "
                                            sx={fieldSx}
                                        >
                                            {MEDIUMS.map((m) => (
                                                <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{m}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <TextField
                                            select fullWidth size="small" label="Board / Publisher"
                                            value={form.board}
                                            onChange={(e) => setField("board", e.target.value)}
                                            helperText=" "
                                            sx={fieldSx}
                                        >
                                            {BOARDS.map((b) => (
                                                <MenuItem key={b} value={b} sx={{ fontSize: "13px" }}>{b}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <TextField
                                            fullWidth size="small" label="Edition / Year"
                                            value={form.edition}
                                            onChange={(e) => setField("edition", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                                            helperText=" "
                                            sx={fieldSx}
                                        />
                                    </Grid>
                                </Grid>
                            </Panel>

                            <Panel title="Book File" subtitle={`${ACCEPTED_TYPES.join(", ")} up to ${MAX_FILE_MB} MB`} accent={DASH.blue}>
                                {file ? (
                                    <Box
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 1.4,
                                            border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 1.6, bgcolor: "#FCFCFD",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 40, height: 40, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                            }}
                                        >
                                            <FileIcon name={file.name} />
                                        </Box>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {file.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                                {Math.round((file.size / (1024 * 1024)) * 10) / 10} MB - ready to upload
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Remove file" arrow>
                                            <IconButton onClick={() => setFile(null)} sx={{ width: 30, height: 30 }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 17, color: DASH.red }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ) : (
                                    <Box
                                        {...getRootProps()}
                                        sx={{
                                            border: `1.5px dashed ${dropBorder}`,
                                            borderRadius: RADIUS,
                                            bgcolor: isDragActive ? DASH.primaryLight : "#FCFCFD",
                                            py: 5, px: 2, textAlign: "center", cursor: "pointer",
                                            transition: "border-color .2s ease, background-color .2s ease",
                                            "&:hover": { borderColor: DASH.primary, bgcolor: DASH.primaryLight },
                                        }}
                                    >
                                        <input {...getInputProps()} />
                                        <CloudUploadOutlinedIcon sx={{ fontSize: 38, color: isDragActive ? DASH.primary : DASH.faint }} />
                                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                                            {isDragActive ? "Drop the book here" : "Drag the book here, or click to browse"}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.4 }}>
                                            A text-based PDF gives the cleanest chapter split. Scanned images may need review.
                                        </Typography>
                                    </Box>
                                )}
                                {errors.file && (
                                    <Typography sx={{ fontSize: "11px", color: DASH.red, mt: 0.8 }}>{errors.file}</Typography>
                                )}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                            <Panel title="What happens next" subtitle="After you press upload" accent={DASH.violet} sx={{ mb: 1.8 }}>
                                {PARSE_STEPS.map((step, i) => (
                                    <Box key={step.title} sx={{ display: "flex", gap: 1.2, mb: i < PARSE_STEPS.length - 1 ? 1.6 : 0 }}>
                                        <Box
                                            sx={{
                                                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                                bgcolor: DASH.violetLight, display: "flex",
                                                alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "10.5px", fontWeight: 800, color: DASH.violet }}>{i + 1}</Typography>
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: DASH.ink }}>{step.title}</Typography>
                                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.1, lineHeight: 1.5 }}>{step.detail}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Panel>

                            <Box
                                sx={{
                                    bgcolor: DASH.primaryLight, border: `1px solid ${DASH.primaryBorder}`,
                                    borderRadius: RADIUS, p: 1.6, display: "flex", gap: 1.2,
                                }}
                            >
                                <InfoOutlinedIcon sx={{ fontSize: 17, color: "#B45309", flexShrink: 0, mt: 0.2 }} />
                                <Box>
                                    <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#92400E" }}>
                                        You confirm the split
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", color: "#92400E", mt: 0.3, lineHeight: 1.55 }}>
                                        The book stays in <strong>Needs Review</strong> until you check the detected chapters.
                                        Only confirmed books can be picked in the question paper wizard.
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box
                        sx={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: 1.5, flexWrap: "wrap", mt: 2,
                            bgcolor: "#fff", border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 2, py: 1.4,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                            <MenuBookOutlinedIcon sx={{ fontSize: 17, color: DASH.faint }} />
                            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>
                                {form.gradeId ? gradeSign(grades, form.gradeId) : "Class"} -{" "}
                                {form.subject || "Subject"} - {form.academicYear || "Year"}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button onClick={() => navigate(-1)} sx={outlineBtnSx}>Cancel</Button>
                            <Button
                                onClick={startUpload}
                                startIcon={<TuneOutlinedIcon sx={{ fontSize: 16 }} />}
                                sx={primaryBtnSx}
                            >
                                Upload and Split Chapters
                            </Button>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}
