import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, MenuItem, Tooltip,
    Checkbox, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS, Panel, EmptyNote } from "../../DashBoardComps/dashboardTheme";
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import { useGradeSubjects } from "../../AcademicsComps/academicMeta";
import {
    ListDiscoveredPatterns, GetDiscoveredPatternEvidence, ConfirmDiscoveredPattern,
    RenameDiscoveredPattern, MergeDiscoveredPatterns, SplitDiscoveredPattern,
    RejectDiscoveredPattern,
} from "../../../Api/Api";
import { apiFailed } from "../../AcademicsComps/BooksChaptersComps/bookApi";
import {
    DISCOVERED_FILTERS, discoveredState, normalizeDiscoveredList, normalizeEvidence,
} from "./patternDiscoveryApi";
import { emptyPattern, newSection } from "./questionPaperApi";
import { fieldSx, outlineBtnSx, createBtnSx, primaryBtnSx, Banner, Pill } from "./questionPaperTheme";

const token = "123";

const StatusPill = ({ status }) => {
    const state = discoveredState(status);
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

const PatternCard = ({ pattern, picked, onPick, onEvidence, onConfirm, onRename, onReject, onSplit, onUse, canEdit, canConfirm }) => {
    const state = discoveredState(pattern.status);
    const decided = ["Confirmed", "Rejected", "Merged"].includes(pattern.status);

    return (
        <Box
            sx={{
                border: `1px solid ${picked ? DASH.violet : DASH.line}`,
                bgcolor: picked ? DASH.violetLight : "#fff",
                borderRadius: RADIUS, p: 1.6, height: "100%",
                display: "flex", flexDirection: "column",
                transition: "border-color .2s ease, background-color .2s ease",
                "&:hover": { borderColor: DASH.violet },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.8 }}>
                {canEdit && !decided && (
                    <Checkbox
                        checked={picked}
                        size="small"
                        onChange={() => onPick(pattern)}
                        sx={{ p: 0.3, mt: -0.2, "&.Mui-checked": { color: DASH.violet } }}
                    />
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink, lineHeight: 1.4 }}>
                        {pattern.name || `Pattern ${pattern.id}`}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.6, mt: 0.6, flexWrap: "wrap" }}>
                        <StatusPill status={pattern.status} />
                        {pattern.grade && <Pill label={pattern.grade} color={DASH.text} bg={DASH.lineSoft} />}
                        {pattern.subject && <Pill label={pattern.subject} color={DASH.text} bg={DASH.lineSoft} />}
                    </Box>
                </Box>
            </Box>

            <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 1, lineHeight: 1.7, flex: 1 }}>
                {pattern.description || state.blurb}
            </Typography>

            {pattern.capability && (
                <Typography sx={{ fontSize: "11px", color: DASH.violet, mt: 0.8, fontStyle: "italic" }}>
                    Asks the student to: {pattern.capability}
                </Typography>
            )}

            <Box sx={{ display: "flex", gap: 1.6, mt: 1.4, pt: 1.2, borderTop: `1px solid ${DASH.lineSoft}` }}>
                {[
                    { label: "questions", value: pattern.questionCount },
                    { label: "papers", value: pattern.documentCount },
                    { label: "match", value: pattern.cohesion ? `${Math.round(pattern.cohesion * 100)}%` : "-" },
                ].map((stat) => (
                    <Box key={stat.label}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                            {stat.value}
                        </Typography>
                        <Typography sx={{ fontSize: "10px", color: DASH.faint, textTransform: "uppercase", letterSpacing: 0.3 }}>
                            {stat.label}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Box sx={{ display: "flex", gap: 0.6, mt: 1.4, flexWrap: "wrap" }}>
                <Button
                    onClick={() => onEvidence(pattern)}
                    startIcon={<FactCheckOutlinedIcon sx={{ fontSize: 15 }} />}
                    sx={{ ...outlineBtnSx, height: 30, fontSize: "11.5px" }}
                >
                    Evidence
                </Button>

                {canConfirm && pattern.status === "NeedsReview" && (
                    <Button
                        onClick={() => onConfirm(pattern)}
                        startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
                        sx={{ ...createBtnSx, height: 30, fontSize: "11.5px", bgcolor: DASH.green, "&:hover": { bgcolor: "#059669" } }}
                    >
                        Confirm
                    </Button>
                )}

                {canEdit && pattern.status === "Confirmed" && (
                    <Button
                        onClick={() => onUse(pattern)}
                        startIcon={<DashboardCustomizeOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{ ...createBtnSx, height: 30, fontSize: "11.5px" }}
                    >
                        Use in a pattern
                    </Button>
                )}

                {canEdit && !["Rejected", "Merged"].includes(pattern.status) && (
                    <>
                        <Tooltip title="Rename or reword" arrow>
                            <IconButton size="small" onClick={() => onRename(pattern)} sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS }}>
                                <EditOutlinedIcon sx={{ fontSize: 15, color: DASH.text }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Split it into two" arrow>
                            <IconButton size="small" onClick={() => onSplit(pattern)} sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS }}>
                                <CallSplitIcon sx={{ fontSize: 15, color: DASH.violet }} />
                            </IconButton>
                        </Tooltip>
                        {canConfirm && (
                            <Tooltip title="Not a real pattern" arrow>
                                <IconButton size="small" onClick={() => onReject(pattern)} sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS }}>
                                    <BlockOutlinedIcon sx={{ fontSize: 15, color: DASH.red }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default function DiscoveredPatternsPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;
    const { grades, allSubjects } = useGradeSubjects();

    /* Only an explicit "N" refuses. A login payload that predates the submenu
       has no key to read, and treating "not in my payload" as denied would lock
       out someone who holds the right. */
    const perms = findSubMenuPermissions(user?.permissions, "patterndiscovery", "pattern");
    const may = (key) => !perms || perms[key] === "Y";
    const canEdit = may("edit");
    const canConfirm = may("allowconfirmpattern");

    const [patterns, setPatterns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [working, setWorking] = useState(false);

    const [statusFilter, setStatusFilter] = useState("NeedsReview");
    const [gradeFilter, setGradeFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");

    const [selected, setSelected] = useState([]);

    const [evidenceFor, setEvidenceFor] = useState(null);
    const [evidence, setEvidence] = useState(null);
    const [evidenceLoading, setEvidenceLoading] = useState(false);

    const [renameTarget, setRenameTarget] = useState(null);
    const [renameForm, setRenameForm] = useState({ name: "", description: "" });

    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    const [splitTarget, setSplitTarget] = useState(null);
    const [splitForm, setSplitForm] = useState({ name: "", clusterIds: [] });
    const [splitClusters, setSplitClusters] = useState([]);

    const [mergeOpen, setMergeOpen] = useState(false);
    const [mergeTargetId, setMergeTargetId] = useState("");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    const load = useCallback(() => {
        setIsLoading(true);
        axios
            .get(ListDiscoveredPatterns, {
                params: {
                    grade: gradeFilter !== "all" ? gradeFilter : undefined,
                    subject: subjectFilter !== "all" ? subjectFilter : undefined,
                    status: statusFilter !== "all" ? statusFilter : undefined,
                    requestedByRollNumber: rollNumber,
                },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) { setPatterns([]); return; }
                setPatterns(normalizeDiscoveredList(res.data));
            })
            .catch(() => setPatterns([]))
            .finally(() => setIsLoading(false));
    }, [gradeFilter, subjectFilter, statusFilter, rollNumber]);

    useEffect(() => { load(); }, [load]);

    // A filter change can hide something that was ticked; the tick goes with it.
    useEffect(() => { setSelected([]); }, [statusFilter, gradeFilter, subjectFilter]);

    const togglePick = (pattern) => {
        setSelected((prev) => (prev.includes(pattern.id)
            ? prev.filter((id) => id !== pattern.id)
            : [...prev, pattern.id]));
    };

    const fetchEvidence = (pattern, onDone) => {
        setEvidenceLoading(true);
        axios
            .get(GetDiscoveredPatternEvidence, {
                params: { patternId: pattern.id, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (apiFailed(res.data)) { setEvidence(null); return; }
                const parsed = normalizeEvidence(res.data);
                setEvidence(parsed);
                if (onDone) onDone(parsed);
            })
            .catch(() => setEvidence(null))
            .finally(() => setEvidenceLoading(false));
    };

    const openEvidence = (pattern) => {
        setEvidenceFor(pattern);
        setEvidence(null);
        fetchEvidence(pattern);
    };

    const act = (request, okMessage) => {
        setWorking(true);
        request
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }
                notify(okMessage, true);
                setSelected([]);
                load();
            })
            .catch((error) => notify(error?.response?.data?.message || "That could not be saved"))
            .finally(() => setWorking(false));
    };

    const confirmPattern = (pattern) => act(
        axios.put(
            ConfirmDiscoveredPattern,
            { patternId: pattern.id, reviewedByRollNumber: rollNumber },
            { headers: { Authorization: `Bearer ${token}` } }
        ),
        `"${pattern.name}" confirmed`
    );

    const openRename = (pattern) => {
        setRenameTarget(pattern);
        setRenameForm({ name: pattern.name || "", description: pattern.description || "" });
    };

    const saveRename = () => {
        if (!renameForm.name.trim()) { notify("Give it a name"); return; }
        const target = renameTarget;
        setRenameTarget(null);
        act(
            axios.put(
                RenameDiscoveredPattern,
                {
                    patternId: target.id,
                    patternName: renameForm.name.trim(),
                    description: renameForm.description.trim() || undefined,
                    reviewedByRollNumber: rollNumber,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            ),
            "Renamed"
        );
    };

    const saveReject = () => {
        const target = rejectTarget;
        setRejectTarget(null);
        act(
            axios.put(
                RejectDiscoveredPattern,
                { patternId: target.id, reason: rejectReason.trim() || undefined, reviewedByRollNumber: rollNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            ),
            `"${target.name}" set aside`
        );
        setRejectReason("");
    };

    /* Splitting works on whole clusters, so the dialog has to know which
       clusters this pattern owns - and that only comes back with the evidence. */
    const openSplit = (pattern) => {
        setSplitTarget(pattern);
        setSplitForm({ name: "", clusterIds: [] });
        setSplitClusters([]);
        fetchEvidence(pattern, (parsed) => setSplitClusters(parsed.clusterIds || []));
    };

    const saveSplit = () => {
        if (!splitForm.name.trim()) { notify("Name the new pattern"); return; }
        if (!splitForm.clusterIds.length) { notify("Pick at least one group to move out"); return; }
        if (splitForm.clusterIds.length >= splitClusters.length) {
            notify("At least one group has to stay behind - reject the whole pattern instead");
            return;
        }
        const target = splitTarget;
        setSplitTarget(null);
        act(
            axios.put(
                SplitDiscoveredPattern,
                {
                    patternId: target.id,
                    clusterIdsToMoveOut: splitForm.clusterIds,
                    newPatternName: splitForm.name.trim(),
                    reviewedByRollNumber: rollNumber,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            ),
            "Split into a new pattern"
        );
    };

    const saveMerge = () => {
        if (!mergeTargetId) { notify("Pick the one to keep"); return; }
        const sources = selected.filter((id) => String(id) !== String(mergeTargetId));
        if (!sources.length) { notify("Pick at least two patterns to merge"); return; }
        setMergeOpen(false);
        act(
            axios.put(
                MergeDiscoveredPatterns,
                { sourcePatternIds: sources, targetPatternId: mergeTargetId, reviewedByRollNumber: rollNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            ),
            `${sources.length + 1} patterns merged into one`
        );
        setMergeTargetId("");
    };

    /* Discovery finds question TYPES, not a whole paper layout, and nothing
       carries across on its own. This hands the confirmed type straight into the
       manual builder as a section so the trip is one click rather than retyping. */
    const useInPattern = (pattern) => {
        const gradeId = grades.find((g) => String(g.sign) === String(pattern.grade))?.id || "";
        const seed = {
            ...emptyPattern(),
            name: `${pattern.subject || ""} - ${pattern.name}`.trim(),
            gradeIds: gradeId ? [gradeId] : [],
            subject: pattern.subject || "",
            sections: [{
                ...newSection(0),
                type: "custom",
                customLabel: pattern.name,
                baseType: "long",
                instruction: pattern.description || "",
            }],
        };
        navigate("/dashboardmenu/assessment/question-paper/patterns/create", { state: { pattern: seed } });
    };

    const selectedRows = useMemo(
        () => patterns.filter((p) => selected.includes(p.id)),
        [patterns, selected]
    );

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
                            Patterns found in your papers
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Nothing here counts until you say so. Open the evidence to see the real questions behind each one.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    <Tooltip title="Reload" arrow>
                        <IconButton
                            onClick={load}
                            sx={{ width: 34, height: 34, border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff" }}
                        >
                            <RefreshIcon sx={{ fontSize: 17, color: DASH.text }} />
                        </IconButton>
                    </Tooltip>
                    {canEdit && (
                        <Button
                            onClick={() => { setMergeTargetId(selected[0] || ""); setMergeOpen(true); }}
                            disabled={selected.length < 2}
                            startIcon={<MergeTypeIcon sx={{ fontSize: 17 }} />}
                            sx={createBtnSx}
                        >
                            Merge {selected.length > 1 ? `(${selected.length})` : ""}
                        </Button>
                    )}
                </Box>
            </Box>

            <Banner tone="info" icon={InfoOutlinedIcon} title="What this gives you">
                The AI reads real papers and works out which <strong>question types</strong> keep coming back - it does
                not rebuild a whole paper layout. Confirm the ones that are real, then use them as sections when you
                build a pattern by hand.
            </Banner>

            <Panel
                title="Found patterns"
                subtitle={`${patterns.length} in this view`}
                accent={DASH.violet}
                right={
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <TextField
                            select size="small" value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{ ...fieldSx, width: 150 }}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>All statuses</MenuItem>
                            {DISCOVERED_FILTERS.map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>{discoveredState(s).label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select size="small" value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                            sx={{ ...fieldSx, width: 120 }}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>All classes</MenuItem>
                            {grades.map((g) => (
                                <MenuItem key={g.id} value={g.sign} sx={{ fontSize: "13px" }}>{g.sign}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select size="small" value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            sx={{ ...fieldSx, width: 150 }}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>All subjects</MenuItem>
                            {(allSubjects || []).map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontSize: "13px" }}>{s}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                }
            >
                {isLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 3, justifyContent: "center" }}>
                        <CircularProgress size={18} thickness={4} sx={{ color: DASH.violet }} />
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>Loading</Typography>
                    </Box>
                ) : patterns.length === 0 ? (
                    <EmptyNote text="Nothing here yet. Upload a ZIP of past papers and the patterns show up once it has been read." />
                ) : (
                    <Grid container spacing={1.6}>
                        {patterns.map((pattern) => (
                            <Grid key={pattern.id} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <PatternCard
                                    pattern={pattern}
                                    picked={selected.includes(pattern.id)}
                                    canEdit={canEdit && !working}
                                    canConfirm={canConfirm && !working}
                                    onPick={togglePick}
                                    onEvidence={openEvidence}
                                    onConfirm={confirmPattern}
                                    onRename={openRename}
                                    onReject={(p) => { setRejectTarget(p); setRejectReason(""); }}
                                    onSplit={openSplit}
                                    onUse={useInPattern}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Panel>

            <Dialog open={Boolean(evidenceFor)} onClose={() => setEvidenceFor(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: DASH.ink }}>
                    Why this is called a pattern
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mb: 2, lineHeight: 1.75 }}>
                        <strong>{evidenceFor?.name}</strong> - every question below came from a real paper you uploaded.
                    </Typography>

                    {evidenceLoading ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 3, justifyContent: "center" }}>
                            <CircularProgress size={18} thickness={4} sx={{ color: DASH.violet }} />
                            <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>Loading</Typography>
                        </Box>
                    ) : !evidence || evidence.items.length === 0 ? (
                        <EmptyNote text="No source questions came back for this pattern." />
                    ) : (
                        evidence.items.map((item) => (
                            <Box
                                key={item.questionId}
                                sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 1.4, py: 1.1, mb: 1 }}
                            >
                                <Typography sx={{ fontSize: "12.5px", color: DASH.ink, lineHeight: 1.7 }}>
                                    <strong>{item.number || "-"}.</strong> {item.text}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1, mt: 0.6, flexWrap: "wrap", alignItems: "center" }}>
                                    <Pill label={item.documentName || "unknown file"} color={DASH.text} bg={DASH.lineSoft} />
                                    {item.batchName && <Pill label={item.batchName} color={DASH.faint} bg={DASH.lineSoft} />}
                                    <Typography sx={{ fontSize: "10.5px", color: DASH.violet, fontWeight: 700 }}>
                                        {Math.round((item.similarity || 0) * 100)}% match
                                    </Typography>
                                </Box>
                            </Box>
                        ))
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEvidenceFor(null)} sx={outlineBtnSx}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(renameTarget)} onClose={() => setRenameTarget(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: DASH.ink }}>Rename this pattern</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth size="small" label="Name"
                        value={renameForm.name}
                        onChange={(e) => setRenameForm((p) => ({ ...p, name: e.target.value }))}
                        sx={{ ...fieldSx, mt: 1, mb: 2 }}
                    />
                    <TextField
                        fullWidth size="small" label="Description" multiline minRows={3}
                        value={renameForm.description}
                        onChange={(e) => setRenameForm((p) => ({ ...p, description: e.target.value }))}
                        helperText="Leave it as it is to keep the wording the AI wrote."
                        sx={fieldSx}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRenameTarget(null)} sx={outlineBtnSx}>Cancel</Button>
                    <Button onClick={saveRename} sx={primaryBtnSx}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: DASH.ink }}>Set this aside?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mb: 2, lineHeight: 1.75 }}>
                        <strong>{rejectTarget?.name}</strong> stops showing in the queue. Nothing is deleted - the
                        source questions are kept, so you can see later why it was found.
                    </Typography>
                    <TextField
                        fullWidth size="small" label="Reason (optional)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        sx={fieldSx}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRejectTarget(null)} sx={outlineBtnSx}>Cancel</Button>
                    <Button
                        onClick={saveReject}
                        sx={{ ...createBtnSx, bgcolor: DASH.red, "&:hover": { bgcolor: "#B91C1C" } }}
                    >
                        Set aside
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(splitTarget)} onClose={() => setSplitTarget(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: DASH.ink }}>Split this pattern</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mb: 2, lineHeight: 1.75 }}>
                        <strong>{splitTarget?.name}</strong> holds {splitClusters.length} group
                        {splitClusters.length === 1 ? "" : "s"} of similar questions. Move the ones that do not belong
                        into a pattern of their own. At least one has to stay behind.
                    </Typography>

                    {evidenceLoading ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 2, justifyContent: "center" }}>
                            <CircularProgress size={18} thickness={4} sx={{ color: DASH.violet }} />
                        </Box>
                    ) : splitClusters.length < 2 ? (
                        <EmptyNote text="This pattern has only one group, so there is nothing to split out." />
                    ) : (
                        <>
                            <TextField
                                fullWidth size="small" label="Name for the new pattern"
                                value={splitForm.name}
                                onChange={(e) => setSplitForm((p) => ({ ...p, name: e.target.value }))}
                                sx={{ ...fieldSx, mb: 2 }}
                            />
                            {splitClusters.map((clusterId) => {
                                const on = splitForm.clusterIds.includes(clusterId);
                                return (
                                    <Box
                                        key={clusterId}
                                        onClick={() => setSplitForm((p) => ({
                                            ...p,
                                            clusterIds: on
                                                ? p.clusterIds.filter((c) => c !== clusterId)
                                                : [...p.clusterIds, clusterId],
                                        }))}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 1,
                                            border: `1px solid ${on ? DASH.violet : DASH.line}`,
                                            bgcolor: on ? DASH.violetLight : "#fff",
                                            borderRadius: RADIUS, px: 1.2, py: 0.9, mb: 1, cursor: "pointer",
                                        }}
                                    >
                                        <Checkbox checked={on} size="small" sx={{ p: 0.3, "&.Mui-checked": { color: DASH.violet } }} />
                                        <Typography sx={{ fontSize: "12.5px", color: DASH.ink }}>
                                            Group {clusterId}
                                            {evidence
                                                ? ` - ${evidence.items.length} question${evidence.items.length === 1 ? "" : "s"} in this pattern`
                                                : ""}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setSplitTarget(null)} sx={outlineBtnSx}>Cancel</Button>
                    <Button onClick={saveSplit} disabled={splitClusters.length < 2} sx={primaryBtnSx}>Split</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={mergeOpen} onClose={() => setMergeOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: "16px", fontWeight: 700, color: DASH.ink }}>Merge into one</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mb: 2, lineHeight: 1.75 }}>
                        The ones you did not keep are folded into the one you did. Their evidence moves across - nothing
                        is lost.
                    </Typography>
                    <TextField
                        select fullWidth size="small" label="Keep this one"
                        value={mergeTargetId}
                        onChange={(e) => setMergeTargetId(e.target.value)}
                        sx={fieldSx}
                    >
                        {selectedRows.map((p) => (
                            <MenuItem key={p.id} value={p.id} sx={{ fontSize: "13px" }}>
                                {p.name} ({p.questionCount} questions)
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setMergeOpen(false)} sx={outlineBtnSx}>Cancel</Button>
                    <Button onClick={saveMerge} sx={primaryBtnSx}>Merge</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
