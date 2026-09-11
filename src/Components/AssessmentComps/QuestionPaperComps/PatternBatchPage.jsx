import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, LinearProgress, Tooltip, TextField,
    MenuItem, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS, KPI_TONES, Panel, SolidStatCard, EmptyNote } from "../../DashBoardComps/dashboardTheme";
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import { useGradeSubjects } from "../../AcademicsComps/academicMeta";
import {
    GetPatternBatchStatus, GetPatternBatchDocuments, GetPatternDocumentQuestions,
    SetPatternDocumentIdentification, RetryPatternDocument, RetryPatternBatchClustering,
} from "../../../Api/Api";
import { apiFailed } from "../../AcademicsComps/BooksChaptersComps/bookApi";
import {
    BATCH_TRACK, batchStage, batchTrackIndex, isBatchBusy, normalizeBatch,
    normalizeDocumentList, normalizeDocumentQuestions, documentState, documentNeedsAdmin,
    RETRYABLE, POLL_MS, elapsedLabel, fmtDate,
} from "./patternDiscoveryApi";
import { fieldSx, outlineBtnSx, createBtnSx, primaryBtnSx, Banner } from "./questionPaperTheme";

const token = "123";

const MEDIUMS = ["English", "Tamil", "Telugu", "Kannada", "Malayalam", "Hindi", "Marathi", "Gujarati", "Bengali", "Punjabi"];

const StatePill = ({ status }) => {
    const state = documentState(status);
    return (
        <Box
            sx={{
                display: "inline-flex", alignItems: "center", height: 21, px: 0.9,
                borderRadius: RADIUS, bgcolor: state.tone.bg,
                border: `1px solid ${state.tone.border}`, color: state.tone.color,
                fontSize: "10.5px", fontWeight: 700, whiteSpace: "nowrap",
            }}
        >
            {state.label}
        </Box>
    );
};

/* The five things that happen to a ZIP, in order. There is no server-reported
   step list, so the screen reads the status back into a position on the track
   rather than inventing progress of its own. */
const StageTrack = ({ batch }) => {
    const at = batchTrackIndex(batch.status);
    const failed = batch.status === "Failed";

    return (
        <Box>
            {BATCH_TRACK.map((key, i) => {
                const stage = batchStage(key);
                const done = i < at;
                const active = i === at && !failed;
                const last = i === BATCH_TRACK.length - 1;

                return (
                    <Box key={key} sx={{ display: "flex", gap: 1.4, mb: last ? 0 : 1.6 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                            <Box
                                sx={{
                                    width: 22, height: 22, borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    bgcolor: done ? DASH.green : active ? DASH.violet : "#fff",
                                    border: `2px solid ${done ? DASH.green : active ? DASH.violet : DASH.line}`,
                                    transition: "all .3s ease",
                                }}
                            >
                                {done
                                    ? <CheckCircleIcon sx={{ fontSize: 13, color: "#fff" }} />
                                    : active
                                        ? <CircularProgress size={10} thickness={6} sx={{ color: "#fff" }} />
                                        : <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: DASH.line }} />}
                            </Box>
                            {!last && (
                                <Box sx={{ width: 2, flex: 1, minHeight: 14, bgcolor: done ? DASH.green : DASH.lineSoft, mt: 0.4 }} />
                            )}
                        </Box>
                        <Box sx={{ minWidth: 0, pb: 0.4 }}>
                            <Typography
                                sx={{
                                    fontSize: "12.5px",
                                    fontWeight: done || active ? 700 : 600,
                                    color: done || active ? DASH.ink : DASH.faint,
                                }}
                            >
                                {stage.label}
                            </Typography>
                            <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.15, lineHeight: 1.55 }}>
                                {key === "ProcessingDocuments" && batch.totalDocuments > 0
                                    ? `${batch.processedDocuments} of ${batch.totalDocuments} papers read`
                                    : stage.hint}
                            </Typography>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default function PatternBatchPage() {
    const navigate = useNavigate();
    const { batchId } = useParams();
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;
    const { grades, subjectsForGrade } = useGradeSubjects();

    const perms = findSubMenuPermissions(user?.permissions, "patterndiscovery", "batch");
    const may = (key) => !perms || perms[key] === "Y";
    const canEdit = may("edit");

    const [batch, setBatch] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [working, setWorking] = useState(false);

    const [identifyTarget, setIdentifyTarget] = useState(null);
    const [identify, setIdentify] = useState({ grade: "", subject: "", board: "", examType: "", medium: "" });

    const [questionsFor, setQuestionsFor] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);

    const pollRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    const load = useCallback((quiet = false) => {
        if (!batchId) return;
        if (!quiet) setIsLoading(true);

        axios
            .get(GetPatternBatchStatus, {
                params: { batchId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) return;
                setBatch(normalizeBatch(res.data));
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));

        axios
            .get(GetPatternBatchDocuments, {
                params: { batchId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) { setDocuments([]); return; }
                setDocuments(normalizeDocumentList(res.data));
            })
            .catch(() => setDocuments([]));
    }, [batchId, rollNumber]);

    useEffect(() => { load(); }, [load]);

    const busy = isBatchBusy(batch?.status);

    useEffect(() => {
        if (!busy) return undefined;
        pollRef.current = setInterval(() => load(true), POLL_MS);
        return () => clearInterval(pollRef.current);
    }, [busy, load]);

    const stage = batchStage(batch?.status);

    const needsAdmin = useMemo(
        () => documents.filter((d) => documentNeedsAdmin(d.status)),
        [documents]
    );

    const readyCount = useMemo(() => documents.filter((d) => d.status === "Ready").length, [documents]);

    const questionTotal = useMemo(
        () => documents.reduce((sum, d) => sum + (d.questionCount || 0), 0),
        [documents]
    );

    const openIdentify = (doc) => {
        setIdentifyTarget(doc);
        setIdentify({
            grade: doc.grade || doc.detectedGrade || "",
            subject: doc.subject || doc.detectedSubject || "",
            board: doc.board || doc.detectedBoard || "",
            examType: doc.examType || doc.detectedExamType || "",
            medium: doc.medium || doc.detectedMedium || "",
        });
    };

    /* The dialog only offers subjects the school actually runs for the class
       that was picked, so a typo can never reach the API. */
    const identifyGradeId = useMemo(
        () => grades.find((g) => String(g.sign) === String(identify.grade))?.id || "",
        [grades, identify.grade]
    );
    const identifySubjects = useMemo(
        () => (identifyGradeId ? subjectsForGrade(identifyGradeId) : []),
        [identifyGradeId, subjectsForGrade]
    );

    const saveIdentity = () => {
        if (!identifyTarget) return;
        if (!identify.grade || !identify.subject) { notify("Pick the class and the subject"); return; }

        setWorking(true);
        axios
            .put(
                SetPatternDocumentIdentification,
                {
                    documentId: identifyTarget.id,
                    grade: identify.grade,
                    subject: identify.subject,
                    board: identify.board || null,
                    examType: identify.examType || null,
                    medium: identify.medium || null,
                    updatedByRollNumber: rollNumber,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                setIdentifyTarget(null);
                notify("Saved. The paper carries on from here - it is not read again.", true);
                load(true);
            })
            .catch((error) => notify(error?.response?.data?.message || "That could not be saved"))
            .finally(() => setWorking(false));
    };

    const retryDocument = (doc) => {
        setWorking(true);
        axios
            .post(RetryPatternDocument, null, {
                params: { documentId: doc.id, updatedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify(`Retrying ${doc.fileName}`, true);
                load(true);
            })
            .catch((error) => notify(error?.response?.data?.message || "The retry could not be started"))
            .finally(() => setWorking(false));
    };

    const retryClustering = () => {
        setWorking(true);
        axios
            .post(RetryPatternBatchClustering, null, {
                params: { batchId, updatedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify("Finding the patterns again from what has already been read", true);
                load(true);
            })
            .catch((error) => notify(error?.response?.data?.message || "That could not be started"))
            .finally(() => setWorking(false));
    };

    const openQuestions = (doc) => {
        setQuestionsFor(doc);
        setQuestions([]);
        setQuestionsLoading(true);
        axios
            .get(GetPatternDocumentQuestions, {
                params: { documentId: doc.id, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) { setQuestions([]); return; }
                setQuestions(normalizeDocumentQuestions(res.data));
            })
            .catch(() => setQuestions([]))
            .finally(() => setQuestionsLoading(false));
    };

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

            <Box
                sx={{
                    display: "flex", alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between", flexDirection: { xs: "column", md: "row" },
                    gap: 1.5, mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, minWidth: 0 }}>
                    <IconButton
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/ai")}
                        sx={{ mt: -0.5 }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                            {batch?.fileName || "Reading the papers"}
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            {stage.hint}
                            {batch?.uploadedOn ? ` Uploaded ${fmtDate(batch.uploadedOn)}.` : ""}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    <Tooltip title="Reload" arrow>
                        <IconButton
                            onClick={() => load()}
                            sx={{ width: 34, height: 34, border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff" }}
                        >
                            <RefreshIcon sx={{ fontSize: 17, color: DASH.text }} />
                        </IconButton>
                    </Tooltip>
                    {canEdit && !busy && (
                        <Button
                            onClick={retryClustering}
                            disabled={working}
                            startIcon={<AutorenewIcon sx={{ fontSize: 17 }} />}
                            sx={outlineBtnSx}
                        >
                            Find patterns again
                        </Button>
                    )}
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/ai/review")}
                        startIcon={<RuleOutlinedIcon sx={{ fontSize: 17 }} />}
                        sx={createBtnSx}
                    >
                        Review found patterns
                    </Button>
                </Box>
            </Box>

            {isLoading && !batch ? (
                <LinearProgress
                    sx={{
                        height: 4, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                        "& .MuiLinearProgress-bar": { bgcolor: DASH.violet },
                    }}
                />
            ) : (
                <>
                    <Grid container spacing={1.6} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                            <SolidStatCard icon={FolderZipOutlinedIcon} label="Papers in the ZIP" value={batch?.totalDocuments || 0} tone={KPI_TONES.violet} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                            <SolidStatCard icon={CheckCircleIcon} label="Read" value={readyCount} tone={KPI_TONES.green} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                            <SolidStatCard icon={DescriptionOutlinedIcon} label="Questions found" value={questionTotal} tone={KPI_TONES.blue} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                            <SolidStatCard icon={ErrorOutlineIcon} label="Need you" value={needsAdmin.length} tone={KPI_TONES.pink} />
                        </Grid>
                    </Grid>

                    {batch?.status === "Failed" && (
                        <Box sx={{ mb: 2 }}>
                            <Banner tone="error" icon={ErrorOutlineIcon} title="This batch could not be processed">
                                {batch.failureReason || "No reason was given. Upload the ZIP again."}
                            </Banner>
                        </Box>
                    )}

                    {needsAdmin.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Banner tone="warn" icon={InfoOutlinedIcon} title={`${needsAdmin.length} paper${needsAdmin.length === 1 ? "" : "s"} stopped and need you`}>
                                Nothing moves for these until they are cleared. A paper asking for a class and subject
                                only needs you to type them in - it is not read again. A failed one can be retried.
                            </Banner>
                        </Box>
                    )}

                    <Grid container spacing={1.8}>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                            <Panel title="Where it has got to" subtitle={stage.label} accent={DASH.violet}>
                                <StageTrack batch={batch || {}} />

                                {busy && (
                                    <Box
                                        sx={{
                                            display: "flex", alignItems: "flex-start", gap: 1, mt: 2,
                                            bgcolor: DASH.violetLight, border: "1px solid #DDD6FE",
                                            borderRadius: RADIUS, px: 1.4, py: 1.1,
                                        }}
                                    >
                                        <HourglassEmptyOutlinedIcon sx={{ fontSize: 15, color: DASH.violet, mt: 0.2, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: "11.5px", color: "#5B21B6", lineHeight: 1.75 }}>
                                            Running for {elapsedLabel(batch?.startedOn || batch?.uploadedOn)}. One paper is
                                            handled at a time, so a big ZIP takes a while. This page checks again every{" "}
                                            {Math.round(POLL_MS / 1000)} seconds on its own - you can leave and come back.
                                        </Typography>
                                    </Box>
                                )}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8 }}>
                            <Panel
                                title="Papers inside"
                                subtitle={`${documents.length} file${documents.length === 1 ? "" : "s"}`}
                                accent={DASH.blue}
                                bodySx={{ p: 0 }}
                            >
                                {documents.length === 0 ? (
                                    <Box sx={{ p: 2 }}>
                                        <EmptyNote text={busy ? "The ZIP is still being opened." : "Nothing usable was found in this ZIP."} />
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ maxHeight: 520 }}>
                                        <Table stickyHeader size="small">
                                            <TableHead>
                                                <TableRow>
                                                    {["File", "Status", "Class / Subject", "Pages", "Questions", ""].map((h) => (
                                                        <TableCell
                                                            key={h}
                                                            sx={{
                                                                fontSize: "11px", fontWeight: 700, color: DASH.muted,
                                                                textTransform: "uppercase", letterSpacing: 0.4,
                                                                bgcolor: DASH.surface, borderBottom: `1px solid ${DASH.line}`,
                                                            }}
                                                        >
                                                            {h}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {documents.map((doc) => {
                                                    const state = documentState(doc.status);
                                                    const corrected = doc.detectedGrade
                                                        && doc.grade
                                                        && String(doc.detectedGrade) !== String(doc.grade);

                                                    return (
                                                        <TableRow key={doc.id} hover>
                                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                                <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: DASH.ink }}>
                                                                    {doc.fileName}
                                                                </Typography>
                                                                {doc.failureReason && (
                                                                    <Typography sx={{ fontSize: "10.5px", color: DASH.red, mt: 0.2 }}>
                                                                        {doc.failureReason}
                                                                    </Typography>
                                                                )}
                                                                {!doc.failureReason && state.advice && (
                                                                    <Typography sx={{ fontSize: "10.5px", color: DASH.muted, mt: 0.2 }}>
                                                                        {state.advice}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                                <StatePill status={doc.status} />
                                                            </TableCell>
                                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                                <Typography sx={{ fontSize: "12px", color: DASH.ink }}>
                                                                    {doc.grade || doc.detectedGrade || "-"}
                                                                    {(doc.subject || doc.detectedSubject) ? ` / ${doc.subject || doc.detectedSubject}` : ""}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: "10.5px", color: DASH.faint, mt: 0.1 }}>
                                                                    {corrected
                                                                        ? `read as ${doc.detectedGrade}, corrected`
                                                                        : doc.confidence > 0
                                                                            ? `${Math.round(doc.confidence)}% sure`
                                                                            : ""}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: "12px", color: DASH.text, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                                {doc.totalPages || "-"}
                                                            </TableCell>
                                                            <TableCell sx={{ fontSize: "12px", color: DASH.text, borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                                {doc.questionCount || "-"}
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, whiteSpace: "nowrap" }}>
                                                                {doc.questionCount > 0 && (
                                                                    <Tooltip title="See the questions found" arrow>
                                                                        <IconButton size="small" onClick={() => openQuestions(doc)}>
                                                                            <VisibilityOutlinedIcon sx={{ fontSize: 16, color: DASH.blue }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {canEdit && doc.status === "NeedsManualIdentification" && (
                                                                    <Tooltip title="Type in the class and subject" arrow>
                                                                        <IconButton size="small" onClick={() => openIdentify(doc)}>
                                                                            <EditOutlinedIcon sx={{ fontSize: 16, color: DASH.primary }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {canEdit && RETRYABLE.includes(doc.status) && (
                                                                    <Tooltip title="Try this paper again" arrow>
                                                                        <IconButton size="small" disabled={working} onClick={() => retryDocument(doc)}>
                                                                            <AutorenewIcon sx={{ fontSize: 16, color: DASH.violet }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Panel>
                        </Grid>
                    </Grid>
                </>
            )}

            <Dialog open={Boolean(identifyTarget)} onClose={() => setIdentifyTarget(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: DASH.ink }}>
                    Which paper is this?
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "12px", color: DASH.muted, mb: 2, lineHeight: 1.75 }}>
                        <strong>{identifyTarget?.fileName}</strong> was read, but its class and subject could not be
                        worked out with any confidence. Fill these in and it carries on from there - the file is not
                        read again.
                    </Typography>

                    <Grid container spacing={1.6}>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                select fullWidth size="small" label="Class"
                                value={identify.grade}
                                onChange={(e) => setIdentify((p) => ({ ...p, grade: e.target.value, subject: "" }))}
                                sx={fieldSx}
                            >
                                {grades.map((g) => (
                                    <MenuItem key={g.id} value={g.sign} sx={{ fontSize: "13px" }}>{g.sign}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                select fullWidth size="small" label="Subject"
                                value={identify.subject}
                                disabled={!identify.grade}
                                onChange={(e) => setIdentify((p) => ({ ...p, subject: e.target.value }))}
                                helperText={identify.grade ? "" : "Pick the class first"}
                                sx={fieldSx}
                            >
                                {identifySubjects.map((s) => (
                                    <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>{s}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <TextField
                                fullWidth size="small" label="Board (optional)"
                                value={identify.board}
                                onChange={(e) => setIdentify((p) => ({ ...p, board: e.target.value }))}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                            <TextField
                                fullWidth size="small" label="Exam type (optional)"
                                value={identify.examType}
                                onChange={(e) => setIdentify((p) => ({ ...p, examType: e.target.value }))}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                            <TextField
                                select fullWidth size="small" label="Medium (optional)"
                                value={identify.medium}
                                onChange={(e) => setIdentify((p) => ({ ...p, medium: e.target.value }))}
                                sx={fieldSx}
                            >
                                {MEDIUMS.map((m) => (
                                    <MenuItem key={m} value={m} sx={{ fontSize: "13px" }}>{m}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setIdentifyTarget(null)} sx={outlineBtnSx}>Cancel</Button>
                    <Button onClick={saveIdentity} disabled={working} sx={primaryBtnSx}>
                        {working ? "Saving..." : "Save and carry on"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(questionsFor)} onClose={() => setQuestionsFor(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: DASH.ink }}>
                    {questionsFor?.fileName}
                </DialogTitle>
                <DialogContent>
                    {questionsLoading ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 3, justifyContent: "center" }}>
                            <CircularProgress size={18} thickness={4} sx={{ color: DASH.blue }} />
                            <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>Loading</Typography>
                        </Box>
                    ) : questions.length === 0 ? (
                        <EmptyNote text="No questions have been pulled out of this paper yet." />
                    ) : (
                        questions.map((q) => (
                            <Box
                                key={q.id}
                                sx={{
                                    border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
                                    px: 1.4, py: 1.1, mb: 1,
                                }}
                            >
                                <Typography sx={{ fontSize: "12.5px", color: DASH.ink, lineHeight: 1.7 }}>
                                    <strong>{q.number || "-"}.</strong> {q.text}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", color: DASH.muted, mt: 0.4, lineHeight: 1.6 }}>
                                    {q.sectionLabel ? `${q.sectionLabel} - ` : ""}
                                    {q.marks ? `${q.marks} mark${q.marks === 1 ? "" : "s"} - ` : ""}
                                    page {q.page || "-"}
                                    {q.hasVisual ? " - has a picture" : ""}
                                </Typography>
                                {q.taskDescription && (
                                    <Typography sx={{ fontSize: "11px", color: DASH.violet, mt: 0.4, fontStyle: "italic" }}>
                                        What it asks the student to do: {q.taskDescription}
                                    </Typography>
                                )}
                            </Box>
                        ))
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setQuestionsFor(null)} sx={outlineBtnSx}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
