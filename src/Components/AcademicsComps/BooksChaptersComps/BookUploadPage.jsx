import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, Tooltip,
    CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS, Panel } from "../../DashBoardComps/dashboardTheme";
import { selectAcademicYear, selectAcademicYearOptions } from "../../../Redux/Slices/academicYearSlice";
import { useGradeSubjects } from "../academicMeta";
import { UploadBook, GetBookStatus, UpdateBookMetadata } from "../../../Api/Api";
import {
    ACCEPTED_TYPES, BOARDS, MAX_FILE_MB, MEDIUMS,
    apiFailed, normalizeBookResponse, normalizeProcessing,
} from "./bookApi";
import { fieldSx, outlineBtnSx, primaryBtnSx } from "./bookTheme";
import { BookProgressPanel } from "./bookProgress";

const token = "123";

const emptyForm = {
    grade: "",
    subject: "",
    title: "",
    medium: "",
    board: "",
    edition: "",
};

/* Detection can return a class or subject the dropdown does not carry. Showing
   an empty select over a value the server actually holds would be a lie, so the
   detected value joins the list. */
const withDetected = (options, value) => {
    const list = (options || []).map(String).filter(Boolean);
    const detected = String(value || "").trim();
    return detected && !list.includes(detected) ? [detected, ...list] : list;
};

const FileIcon = ({ name }) =>
    String(name || "").toLowerCase().endsWith(".pdf")
        ? <PictureAsPdfOutlinedIcon sx={{ fontSize: 22, color: DASH.red }} />
        : <DescriptionOutlinedIcon sx={{ fontSize: 22, color: DASH.blue }} />;

export default function BookUploadPage() {
    const navigate = useNavigate();
    const academicYear = useSelector(selectAcademicYear);
    const yearOptions = useSelector(selectAcademicYearOptions) || [];
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;
    const { grades, allSubjects } = useGradeSubjects();

    const [file, setFile] = useState(null);
    const [year, setYear] = useState("");
    const [uploading, setUploading] = useState(false);
    const [percent, setPercent] = useState(0);

    /* Everything after the upload succeeds: the book the server created, the
       metadata it read off the cover, and how far the reader has got. */
    const [book, setBook] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [dirty, setDirty] = useState(false);
    const [processing, setProcessing] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [saving, setSaving] = useState(false);
    const [fileError, setFileError] = useState("");

    const pollTimer = useRef(null);
    const tickTimer = useRef(null);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    useEffect(() => { if (academicYear && !year) setYear(academicYear); }, [academicYear, year]);

    useEffect(() => () => {
        clearTimeout(pollTimer.current);
        clearInterval(tickTimer.current);
    }, []);

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setDirty(true);
    };

    /* Whatever the server read wins, but a blank field must not wipe the class
       and subject the teacher already picked to get the upload accepted. */
    const seedForm = (next) => setForm((prev) => ({
        grade: next.grade || prev.grade || "",
        subject: next.subject || prev.subject || "",
        title: next.title === "Untitled book" ? prev.title : (next.title || prev.title || ""),
        medium: next.medium || prev.medium || "",
        board: next.board || prev.board || "",
        edition: next.edition || prev.edition || "",
    }));

    const onDrop = (accepted, rejected) => {
        if (rejected?.length) {
            setFileError(`Only ${ACCEPTED_TYPES.join(", ")} files up to ${MAX_FILE_MB} MB are accepted`);
            return;
        }
        const picked = accepted?.[0];
        if (!picked) return;
        setFile(picked);
        setFileError("");
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        // A second file dropped mid-upload would silently replace the one in flight.
        disabled: uploading,
        maxSize: MAX_FILE_MB * 1024 * 1024,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "application/msword": [".doc"],
        },
    });

    /* One poll. The server decides how often to come back, so the next timer is
       scheduled from its own answer rather than a number picked here. */
    const poll = useCallback((bookId) => {
        axios
            .get(GetBookStatus, {
                params: { bookId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) {
                    clearInterval(tickTimer.current);
                    notify(rejected);
                    return;
                }
                const next = normalizeBookResponse(res.data, grades);
                const state = normalizeProcessing(res.data);
                setProcessing(state);
                setElapsed(state.elapsedSeconds);
                setBook((prev) => ({ ...next, id: next.id || prev?.id || bookId }));

                if (next.status === "Processing") {
                    pollTimer.current = setTimeout(() => poll(bookId), state.pollSeconds * 1000);
                    return;
                }
                clearInterval(tickTimer.current);
                if (next.status === "Failed") {
                    notify(next.failureReason || "The book could not be read");
                    return;
                }
                /* Only fill the form from the server while the teacher has not
                   started correcting it - their edits outrank a later read. */
                setForm((prevForm) => ({
                    grade: prevForm.grade || next.grade || "",
                    subject: prevForm.subject || next.subject || "",
                    title: prevForm.title || (next.title === "Untitled book" ? "" : next.title || ""),
                    medium: prevForm.medium || next.medium || "",
                    board: prevForm.board || next.board || "",
                    edition: prevForm.edition || next.edition || "",
                }));
                notify(`${next.chapterCount} chapters detected - check the split`, true);
            })
            .catch(() => {
                // A dropped poll is not a failed book. Try again on the same beat.
                pollTimer.current = setTimeout(() => poll(bookId), 15000);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rollNumber, grades]);

    /* Three fields, exactly as the endpoint documents. Class, subject, title,
       medium, board and edition are read off the book's own cover pages. */
    const startUpload = () => {
        if (!file) { setFileError("Attach the book file"); return; }
        if (!year) { notify("Pick the academic year"); return; }

        const body = new FormData();
        body.append("file", file);
        body.append("academicYear", year);
        body.append("uploadedByRollNumber", rollNumber);

        setUploading(true);
        setPercent(0);

        axios
            .post(UploadBook, body, {
                /* No Content-Type here on purpose. The browser sets
                   "multipart/form-data; boundary=..." itself for a FormData body;
                   writing the header by hand drops the boundary, the server
                   cannot split the parts, and it reads the request as if no file
                   or fields were sent at all. */
                headers: { Authorization: `Bearer ${token}` },
                onUploadProgress: (event) => {
                    if (!event.total) return;
                    setPercent(Math.round((event.loaded * 100) / event.total));
                },
            })
            .then((res) => {
                /* A rejected upload still comes back 200 with error:true, so the
                   body decides whether this worked, not the status code. */
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }

                const created = normalizeBookResponse(res.data, grades);
                if (!created.id) {
                    notify("The book was sent but no book id came back");
                    return;
                }
                setBook(created);
                seedForm(created);
                setDirty(false);
                setProcessing(created.processing);
                setElapsed(created.processing.elapsedSeconds);

                // A local second hand between polls, so the page is not frozen.
                tickTimer.current = setInterval(() => setElapsed((s) => s + 1), 1000);
                pollTimer.current = setTimeout(
                    () => poll(created.id),
                    (created.processing.pollSeconds || 15) * 1000
                );
                notify("Book uploaded - reading it now", true);
            })
            .catch((error) => {
                notify(error?.response?.data?.message || "The book could not be uploaded");
            })
            .finally(() => setUploading(false));
    };

    // Metadata is corrected on its own call; it never re-triggers the reading.
    const openChapters = () => {
        const go = () => navigate(`/dashboardmenu/books/${book.id}`, { state: { justUploaded: true } });
        if (!dirty) { go(); return; }

        setSaving(true);
        axios
            .put(
                UpdateBookMetadata,
                {
                    bookId: book.id,
                    grade: form.grade || null,
                    subject: form.subject || null,
                    bookTitle: form.title || null,
                    medium: form.medium || null,
                    boardOrPublisher: form.board || null,
                    editionYear: form.edition || null,
                    updatedByRollNumber: rollNumber,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                go();
            })
            .catch((error) => notify(error?.response?.data?.message || "The details could not be saved"))
            .finally(() => setSaving(false));
    };

    const reset = () => {
        clearTimeout(pollTimer.current);
        clearInterval(tickTimer.current);
        setBook(null); setFile(null); setForm(emptyForm);
        setDirty(false); setProcessing(null); setElapsed(0); setPercent(0);
    };

    const gradeChoices = useMemo(
        () => withDetected(grades.map((g) => g.sign), form.grade),
        [grades, form.grade]
    );
    const subjectChoices = useMemo(
        () => withDetected(allSubjects, form.subject),
        [allSubjects, form.subject]
    );

    const working = Boolean(book);
    const bookStatus = book?.status || "";
    const ready = bookStatus === "Needs Review" || bookStatus === "Ready";
    const failed = bookStatus === "Failed";

    const dropBorder = fileError ? DASH.red : isDragActive ? DASH.primary : DASH.line;

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 2 }}>
                <IconButton onClick={() => navigate("/dashboardmenu/books")} sx={{ mt: -0.5 }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                </IconButton>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                        Upload Book
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                        Attach the book and the class, subject and title are read from its own cover. Chapters are detected automatically.
                    </Typography>
                </Box>
            </Box>

            {/* One centred column until there is a second thing to show. */}
            <Grid container spacing={1.8} sx={working ? {} : { maxWidth: 820, mx: "auto" }}>
                <Grid size={{ xs: 12, md: working ? 7 : 12, lg: working ? 7 : 12 }}>
                    {!working ? (
                        <Panel title="The book file" subtitle="PDF or Word, up to 100 MB" accent={DASH.primary}>
                            {/* While the file is going up the drop area becomes the
                                progress - one busy state on the screen, not a
                                spinner here and another on the button. */}
                            {uploading ? (
                                <Box
                                    sx={{
                                        border: `2px solid ${DASH.primaryBorder}`,
                                        borderRadius: RADIUS,
                                        bgcolor: DASH.primaryLight,
                                        px: { xs: 2, md: 3 }, py: { xs: 3, md: 4.5 }, textAlign: "center",
                                    }}
                                >
                                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                                        <CircularProgress
                                            variant={percent > 0 && percent < 100 ? "determinate" : "indeterminate"}
                                            value={percent}
                                            size={62}
                                            thickness={4}
                                            sx={{ color: DASH.primary }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute", inset: 0,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "13px", fontWeight: 800, color: DASH.ink }}>
                                                {percent}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASH.ink, mt: 1.6 }}>
                                        {percent >= 100 ? "Storing the book" : "Sending the book"}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: "12px", color: DASH.muted, mt: 0.4, mx: "auto", maxWidth: 400,
                                            lineHeight: 1.6, overflow: "hidden", textOverflow: "ellipsis",
                                        }}
                                    >
                                        {percent >= 100
                                            ? "The file is uploaded. Waiting for the server to take it."
                                            : `${file?.name} - ${(file?.size / (1024 * 1024)).toFixed(1)} MB. A large book can take a couple of minutes on a slow connection.`}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    {...getRootProps()}
                                    sx={{
                                        border: `2px dashed ${dropBorder}`,
                                        borderRadius: RADIUS,
                                        bgcolor: isDragActive ? DASH.primaryLight : "#FCFCFD",
                                        px: 2, py: { xs: 4, md: 6 }, textAlign: "center", cursor: "pointer",
                                        transition: "border-color .2s ease, background-color .2s ease",
                                    }}
                                >
                                    <input {...getInputProps()} />
                                    <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: isDragActive ? DASH.primary : DASH.line }} />
                                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                                        {isDragActive ? "Drop the book here" : "Drag the book here, or click to browse"}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.5 }}>
                                        {ACCEPTED_TYPES.join(", ")} - up to {MAX_FILE_MB} MB
                                    </Typography>
                                </Box>
                            )}

                            {fileError && (
                                <Typography sx={{ fontSize: "11.5px", color: DASH.red, mt: 0.8 }}>
                                    {fileError}
                                </Typography>
                            )}

                            {file && !uploading && (
                                <Box
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1.2, mt: 1.6,
                                        border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.4, py: 1.2,
                                    }}
                                >
                                    <FileIcon name={file.name} />
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography
                                            sx={{
                                                fontSize: "12.5px", fontWeight: 700, color: DASH.ink,
                                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            }}
                                        >
                                            {file.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px", color: DASH.muted }}>
                                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                                        </Typography>
                                    </Box>
                                    <Tooltip title="Remove" arrow>
                                        <span>
                                            <IconButton
                                                size="small"
                                                disabled={uploading}
                                                onClick={() => setFile(null)}
                                                sx={{ width: 28, height: 28 }}
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 16, color: DASH.red }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Box>
                            )}

                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4, mt: 2, flexWrap: "wrap" }}>
                                <TextField
                                    select size="small" label="Academic year"
                                    value={year}
                                    disabled={uploading}
                                    onChange={(e) => setYear(e.target.value)}
                                    sx={{ ...fieldSx, minWidth: 190 }}
                                    helperText="Decides which year the book belongs to"
                                >
                                    {(yearOptions.length ? yearOptions : [academicYear].filter(Boolean)).map((y) => (
                                        <MenuItem key={y} value={y} sx={{ fontSize: "13px" }}>{y}</MenuItem>
                                    ))}
                                </TextField>

                                <Button
                                    onClick={startUpload}
                                    disabled={uploading || !file}
                                    startIcon={uploading
                                        ? <CircularProgress size={14} thickness={6} sx={{ color: "inherit" }} />
                                        : <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />}
                                    sx={{ ...primaryBtnSx, height: 40, mt: 0.2 }}
                                >
                                    {uploading ? "Uploading" : "Upload Book"}
                                </Button>
                            </Box>

                            <Box sx={{ display: "flex", gap: 1.2, alignItems: "flex-start", mt: 1.6 }}>
                                <TuneOutlinedIcon sx={{ fontSize: 16, color: DASH.faint, mt: 0.2, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: "12px", color: DASH.muted, lineHeight: 1.7 }}>
                                    Nothing else to fill in. The class, subject, title, medium, board and edition
                                    are read from the book's own cover pages, and appear for you to check once it's
                                    been read.
                                </Typography>
                            </Box>
                        </Panel>
                    ) : (
                        <BookProgressPanel
                            book={{ ...book, fileName: book.fileName || file?.name }}
                            processing={processing}
                            elapsed={elapsed}
                            footNote={!ready && !failed
                                ? "Leaving is safe - the book keeps being read, and the library shows it as Processing until the chapters are ready."
                                : ""}
                            actions={(
                                <>
                                    {ready && (
                                        <Button
                                            onClick={openChapters}
                                            disabled={saving}
                                            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                                            sx={{ ...primaryBtnSx, height: 38 }}
                                        >
                                            {saving ? "Saving..." : "Review the chapters"}
                                        </Button>
                                    )}
                                    {failed && (
                                        <Button onClick={reset} sx={{ ...primaryBtnSx, height: 38 }}>
                                            Upload another file
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => navigate("/dashboardmenu/books")}
                                        sx={{ ...outlineBtnSx, height: 38 }}
                                    >
                                        {ready || failed ? "Back to library" : "Leave it running"}
                                    </Button>
                                </>
                            )}
                        />
                    )}
                </Grid>

                {/* Nothing is typed before the upload, so before it there is
                    nothing to put beside the drop area. The second column - and
                    the whole two-column layout - only appears once there are
                    detected details worth reading. */}
                {working && (
                    <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                        <Panel
                            title="Book details"
                            subtitle="Read from the book - correct anything that is wrong"
                            accent={DASH.cyan}
                        >
                            <>
                                <Box
                                    sx={{
                                        display: "flex", gap: 1.2, alignItems: "flex-start",
                                        bgcolor: DASH.cyanLight, border: `1px solid ${DASH.cyan}33`,
                                        borderRadius: RADIUS, px: 1.4, py: 1.1, mb: 1.8,
                                    }}
                                >
                                    <InfoOutlinedIcon sx={{ fontSize: 16, color: DASH.cyan, mt: 0.1, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: "11.5px", color: "#0E7490", lineHeight: 1.6 }}>
                                        These were read off the book. Check them and edit anything that is wrong -
                                        they are saved when you move on, and never restart the reading.
                                    </Typography>
                                </Box>

                                <Grid container spacing={1.4}>
                                    <Grid size={{ xs: 12, sm: 6, md: 12, lg: 6 }}>
                                        <TextField
                                            select fullWidth size="small" label="Class"
                                            value={form.grade}
                                            onChange={(e) => setField("grade", e.target.value)}
                                            sx={fieldSx}
                                            helperText=" "
                                        >
                                            {gradeChoices.map((sign) => (
                                                <MenuItem key={sign} value={sign} sx={{ fontSize: "13px" }}>{sign}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 12, lg: 6 }}>
                                        <TextField
                                            select fullWidth size="small" label="Subject"
                                            value={form.subject}
                                            onChange={(e) => setField("subject", e.target.value)}
                                            sx={fieldSx}
                                            helperText=" "
                                        >
                                            {subjectChoices.map((name) => (
                                                <MenuItem key={name} value={name} sx={{ fontSize: "13px" }}>{name}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                        <TextField
                                            fullWidth size="small" label="Book title"
                                            value={form.title}
                                            onChange={(e) => setField("title", e.target.value)}
                                            sx={fieldSx}
                                            helperText=" "
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 12, lg: 6 }}>
                                        <TextField
                                            select fullWidth size="small" label="Medium"
                                            value={form.medium}
                                            onChange={(e) => setField("medium", e.target.value)}
                                            sx={fieldSx}
                                            helperText=" "
                                        >
                                            {withDetected(MEDIUMS, form.medium).map((m) => (
                                                <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{m}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 12, lg: 6 }}>
                                        <TextField
                                            fullWidth size="small" label="Edition year"
                                            value={form.edition}
                                            onChange={(e) => setField("edition", e.target.value.replace(/[^0-9]/g, ""))}
                                            sx={fieldSx}
                                            helperText=" "
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                        <TextField
                                            select fullWidth size="small" label="Board or publisher"
                                            value={form.board}
                                            onChange={(e) => setField("board", e.target.value)}
                                            sx={fieldSx}
                                            helperText={book?.detectionMethod ? `Chapters found by ${book.detectionMethod === "Toc" ? "the table of contents" : "scanning the headings"}` : " "}
                                        >
                                            {withDetected(BOARDS, form.board).map((b) => (
                                                <MenuItem key={b} value={b} sx={{ fontSize: "13px" }}>{b}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </>
                        </Panel>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
