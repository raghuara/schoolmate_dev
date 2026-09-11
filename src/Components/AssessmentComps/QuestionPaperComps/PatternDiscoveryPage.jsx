import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, LinearProgress, Tooltip, TextField,
    MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS, KPI_TONES, Panel, SolidStatCard, EmptyNote } from "../../DashBoardComps/dashboardTheme";
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import {
    UploadPatternBatch, ListPatternBatches, DeletePatternBatch,
} from "../../../Api/Api";
import { apiFailed } from "../../AcademicsComps/BooksChaptersComps/bookApi";
import {
    BATCH_STAGES, batchStage, isBatchBusy, normalizeBatchList, batchProgress,
    POLL_MS, MAX_ZIP_MB, isZipFile, fileSizeLabel, fmtDate, elapsedLabel,
} from "./patternDiscoveryApi";
import { fieldSx, outlineBtnSx, createBtnSx, Banner, Pill } from "./questionPaperTheme";

const token = "123";

const StagePill = ({ status }) => {
    const stage = batchStage(status);
    return (
        <Box
            sx={{
                display: "inline-flex", alignItems: "center", height: 22, px: 1,
                borderRadius: RADIUS, bgcolor: stage.tone.bg,
                border: `1px solid ${stage.tone.border}`, color: stage.tone.color,
                fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
            }}
        >
            {stage.label}
        </Box>
    );
};

/* One row per ZIP. The bar is the honest measure of progress - documents
   processed out of documents found - and it only exists once the ZIP has been
   opened and the count is real. */
const BatchRow = ({ batch, onOpen, onDelete, canDelete }) => {
    const busy = isBatchBusy(batch.status);
    const pct = batchProgress(batch);
    const stage = batchStage(batch.status);

    return (
        <Box
            onClick={() => onOpen(batch)}
            sx={{
                display: "flex", alignItems: "center", gap: 1.4,
                border: `1px solid ${DASH.line}`, borderRadius: RADIUS,
                bgcolor: "#fff", px: 1.6, py: 1.3, mb: 1.2, cursor: "pointer",
                transition: "border-color .2s ease, box-shadow .2s ease",
                "&:hover": { borderColor: DASH.violet, boxShadow: "0 4px 14px rgba(17,24,39,0.08)" },
            }}
        >
            <Box
                sx={{
                    width: 38, height: 38, borderRadius: RADIUS, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: stage.tone.bg, border: `1px solid ${stage.tone.border}`,
                }}
            >
                <FolderZipOutlinedIcon sx={{ fontSize: 19, color: stage.tone.color }} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                        sx={{
                            fontSize: "13px", fontWeight: 700, color: DASH.ink,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320,
                        }}
                    >
                        {batch.fileName || `Batch ${batch.id}`}
                    </Typography>
                    <StagePill status={batch.status} />
                    {batch.failedDocuments > 0 && (
                        <Pill label={`${batch.failedDocuments} need attention`} color={DASH.red} bg={DASH.redLight} border="#FECACA" />
                    )}
                </Box>

                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.3 }}>
                    {batch.totalDocuments > 0
                        ? `${batch.processedDocuments} of ${batch.totalDocuments} papers read`
                        : stage.hint}
                    {busy && batch.startedOn ? ` - ${elapsedLabel(batch.startedOn)} so far` : ""}
                    {!busy && batch.uploadedOn ? ` - uploaded ${fmtDate(batch.uploadedOn)}` : ""}
                </Typography>

                {batch.totalDocuments > 0 && (
                    <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                            mt: 0.8, height: 4, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                            "& .MuiLinearProgress-bar": { bgcolor: stage.tone.color, borderRadius: RADIUS },
                        }}
                    />
                )}
            </Box>

            {canDelete && (
                <Tooltip title="Delete this batch" arrow>
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onDelete(batch); }}
                        sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: 16, color: DASH.red }} />
                    </IconButton>
                </Tooltip>
            )}
            <ArrowForwardIcon sx={{ fontSize: 17, color: DASH.faint, flexShrink: 0 }} />
        </Box>
    );
};

export default function PatternDiscoveryPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;

    const perms = findSubMenuPermissions(user?.permissions, "patterndiscovery", "batch");
    const may = (key) => !perms || perms[key] === "Y";
    const canCreate = may("create");
    const canDelete = may("delete");

    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const inputRef = useRef(null);
    const pollRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    /* A 404 here is the API's way of saying "nothing matches", not a failure -
       the same convention the book list uses - so it clears the list quietly. */
    const load = useCallback((quiet = false) => {
        if (!quiet) setIsLoading(true);
        axios
            .get(ListPatternBatches, {
                params: {
                    status: statusFilter !== "all" ? statusFilter : undefined,
                    requestedByRollNumber: rollNumber,
                },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) { setBatches([]); return; }
                setBatches(normalizeBatchList(res.data));
            })
            .catch(() => setBatches([]))
            .finally(() => setIsLoading(false));
    }, [statusFilter, rollNumber]);

    useEffect(() => { load(); }, [load]);

    /* Polling is only armed while something is actually moving. A page full of
       finished batches makes no requests at all. */
    const anyBusy = useMemo(() => batches.some((b) => isBatchBusy(b.status)), [batches]);

    useEffect(() => {
        if (!anyBusy) return undefined;
        pollRef.current = setInterval(() => load(true), POLL_MS);
        return () => clearInterval(pollRef.current);
    }, [anyBusy, load]);

    const stats = useMemo(() => ({
        total: batches.length,
        running: batches.filter((b) => isBatchBusy(b.status)).length,
        ready: batches.filter((b) => b.status === "ReadyForReview").length,
        attention: batches.reduce((sum, b) => sum + (b.failedDocuments || 0), 0)
            + batches.filter((b) => b.status === "Failed").length,
    }), [batches]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return batches;
        return batches.filter((b) => `${b.fileName} ${b.uploadedBy}`.toLowerCase().includes(term));
    }, [batches, search]);

    const takeFile = (picked) => {
        if (!picked) return;
        if (!isZipFile(picked)) { notify("Only a .zip file can be uploaded here"); return; }
        if (picked.size > MAX_ZIP_MB * 1024 * 1024) {
            notify(`That ZIP is ${fileSizeLabel(picked.size)}. The limit is ${MAX_ZIP_MB} MB`);
            return;
        }
        setFile(picked);
    };

    /* FormData carries its own multipart boundary. Setting Content-Type by hand
       drops it and the server sees an empty body, so the header is left alone. */
    const upload = () => {
        if (!file || uploading) return;
        const body = new FormData();
        body.append("file", file);
        body.append("uploadedByRollNumber", rollNumber || "");

        setUploading(true);
        axios
            .post(UploadPatternBatch, body, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
                notify("Uploaded. Reading the papers now - this page updates on its own.", true);
                const batchId = res.data?.batchId || res.data?.BatchId;
                if (batchId) {
                    navigate(`/dashboardmenu/assessment/question-paper/patterns/ai/${batchId}`);
                    return;
                }
                load();
            })
            .catch((error) => notify(error?.response?.data?.message || "The ZIP could not be uploaded"))
            .finally(() => setUploading(false));
    };

    const confirmDelete = () => {
        const target = deleteTarget;
        setDeleteTarget(null);
        if (!target?.id) return;

        axios
            .delete(DeletePatternBatch, {
                params: { batchId: target.id, updatedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify("Batch deleted", true);
                load();
            })
            .catch((error) => notify(error?.response?.data?.message || "The batch could not be deleted"));
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
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns")}
                        sx={{ mt: -0.5 }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                            Find patterns from real papers
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Upload past question papers and the AI works out which question types keep coming back.
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
                    <Button
                        onClick={() => navigate("/dashboardmenu/assessment/question-paper/patterns/ai/review")}
                        startIcon={<RuleOutlinedIcon sx={{ fontSize: 17 }} />}
                        sx={createBtnSx}
                    >
                        Review found patterns
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={1.6} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard icon={FolderZipOutlinedIcon} label="Uploads" value={stats.total} tone={KPI_TONES.violet} />
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard icon={HourglassEmptyOutlinedIcon} label="Still reading" value={stats.running} tone={KPI_TONES.orange} />
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard icon={CheckCircleOutlineIcon} label="Ready to review" value={stats.ready} tone={KPI_TONES.green} />
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
                    <SolidStatCard icon={ErrorOutlineIcon} label="Need attention" value={stats.attention} tone={KPI_TONES.pink} />
                </Grid>
            </Grid>

            <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 5 }}>
                    {canCreate && (
                        <Panel title="Upload past papers" subtitle="One ZIP file" accent={DASH.violet}>
                            <Box
                                onClick={() => inputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragging(false);
                                    takeFile(e.dataTransfer?.files?.[0]);
                                }}
                                sx={{
                                    border: `1.5px dashed ${dragging ? DASH.violet : DASH.line}`,
                                    bgcolor: dragging ? DASH.violetLight : DASH.surface,
                                    borderRadius: RADIUS, px: 2, py: 3.4, textAlign: "center", cursor: "pointer",
                                    transition: "border-color .2s ease, background-color .2s ease",
                                    "&:hover": { borderColor: DASH.violet, bgcolor: DASH.violetLight },
                                }}
                            >
                                <FolderZipOutlinedIcon sx={{ fontSize: 34, color: DASH.violet }} />
                                <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                                    {file ? file.name : "Drop a ZIP here, or click to choose"}
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.4, lineHeight: 1.7 }}>
                                    {file
                                        ? `${fileSizeLabel(file.size)} - ready to upload`
                                        : `Only .zip, up to ${MAX_ZIP_MB} MB`}
                                </Typography>
                            </Box>

                            <input
                                ref={inputRef}
                                type="file"
                                accept=".zip,application/zip,application/x-zip-compressed"
                                hidden
                                onChange={(e) => takeFile(e.target.files?.[0])}
                            />

                            <Box sx={{ display: "flex", gap: 1, mt: 1.6 }}>
                                <Button
                                    onClick={upload}
                                    disabled={!file || uploading}
                                    startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 17 }} />}
                                    sx={{ ...createBtnSx, flex: 1 }}
                                >
                                    {uploading ? "Uploading..." : "Upload and find patterns"}
                                </Button>
                                {file && (
                                    <Button
                                        onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                                        sx={outlineBtnSx}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </Box>

                            {uploading && (
                                <LinearProgress
                                    sx={{
                                        mt: 1.4, height: 4, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                                        "& .MuiLinearProgress-bar": { bgcolor: DASH.violet },
                                    }}
                                />
                            )}

                            <Box sx={{ mt: 2 }}>
                                <Banner tone="info" icon={InfoOutlinedIcon} title="What goes in the ZIP">
                                    Anything. Put the papers in folders or leave them loose, mix classes and subjects,
                                    mix PDFs, Word files and photos of a printed paper - it does not need to be sorted.
                                    Each file is read on its own and its class, subject and questions are worked out
                                    from the paper itself. Files that are not question papers are simply left out.
                                </Banner>
                            </Box>

                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 1.6, lineHeight: 1.8 }}>
                                <strong>It takes a while.</strong> Every paper is read page by page, its questions are
                                pulled out one at a time, and only then are the patterns worked out. A big ZIP can run
                                for a long time. You can close this page - the work carries on and the batch is waiting
                                for you when you come back.
                            </Typography>
                        </Panel>
                    )}
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 12, lg: canCreate ? 7 : 12 }}>
                    <Panel
                        title="Uploads"
                        subtitle={`${filtered.length} batch${filtered.length === 1 ? "" : "es"}`}
                        accent={DASH.blue}
                        right={
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                <TextField
                                    size="small"
                                    placeholder="Search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    sx={{ ...fieldSx, width: 160 }}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ fontSize: 16, color: DASH.faint }} />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                <TextField
                                    select size="small" value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    sx={{ ...fieldSx, width: 175 }}
                                >
                                    <MenuItem value="all" sx={{ fontSize: "13px" }}>All statuses</MenuItem>
                                    {BATCH_STAGES.map((s) => (
                                        <MenuItem key={s.key} value={s.key} sx={{ fontSize: "13px" }}>{s.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        }
                    >
                        {isLoading ? (
                            <Box sx={{ py: 3 }}>
                                <LinearProgress
                                    sx={{
                                        height: 4, borderRadius: RADIUS, bgcolor: DASH.lineSoft,
                                        "& .MuiLinearProgress-bar": { bgcolor: DASH.blue },
                                    }}
                                />
                            </Box>
                        ) : filtered.length === 0 ? (
                            <EmptyNote text="No uploads yet. Add a ZIP of past question papers to get started." />
                        ) : (
                            filtered.map((batch) => (
                                <BatchRow
                                    key={batch.id}
                                    batch={batch}
                                    canDelete={canDelete}
                                    onDelete={setDeleteTarget}
                                    onOpen={(b) => navigate(`/dashboardmenu/assessment/question-paper/patterns/ai/${b.id}`)}
                                />
                            ))
                        )}

                        {anyBusy && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.4 }}>
                                <HourglassEmptyOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                    Checking again every {Math.round(POLL_MS / 1000)} seconds.
                                </Typography>
                            </Box>
                        )}
                    </Panel>
                </Grid>
            </Grid>

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: DASH.ink }}>
                    Delete this batch?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: "13px", color: DASH.muted, lineHeight: 1.8 }}>
                        <strong>{deleteTarget?.fileName}</strong> and everything read from it are removed for good.
                        Patterns already found are kept - they usually hold evidence from other uploads too - but this
                        batch stops counting towards them.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} sx={outlineBtnSx}>Cancel</Button>
                    <Button
                        onClick={confirmDelete}
                        startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                        sx={{ ...createBtnSx, bgcolor: DASH.red, "&:hover": { bgcolor: "#B91C1C" } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
