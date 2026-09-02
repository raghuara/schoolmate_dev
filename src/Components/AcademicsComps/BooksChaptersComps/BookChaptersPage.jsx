import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, Tooltip, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Skeleton,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DoneIcon from "@mui/icons-material/Done";
import UndoIcon from "@mui/icons-material/Undo";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS, SOFT, Panel } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { GetBookStatus, ConfirmBookChapters } from "../../../Api/Api";
import {
    apiFailed, bookPageUrl, chapterPageCount, downloadBook,
    normalizeBookResponse, confirmChaptersPayload, findChapterRangeIssue,
} from "./bookApi";
import {
    fieldSx, subjectTone, StatusPill, Pill, outlineBtnSx, softBtnSx, primaryBtnSx,
    headerActionSx, HEADER_ACTION_H, ChapterRowSkeleton, PanelSkeleton,
} from "./bookTheme";
import { BookProgressPanel } from "./bookProgress";

const token = "123";

const renumber = (list) => list.map((c, i) => ({ ...c, number: i + 1 }));

export default function BookChaptersPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookId } = useParams();
    const grades = useSelector(selectGrades) || [];
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;

    const [book, setBook] = useState(location.state?.book || null);
    const [chapters, setChapters] = useState(location.state?.book?.chapters || []);
    /* The last saved split. Revert copies this back, so an edit session can be
       abandoned without reloading the page. */
    const [baseline, setBaseline] = useState(location.state?.book?.chapters || []);
    /* Always true to begin with. The row the library hands over has no chapters,
       so treating it as "already loaded" showed an empty editor - 0 chapters,
       "Pick a chapter on the left" - until the real read landed. */
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(location.state?.book?.chapters?.[0]?.id || null);
    const [editingId, setEditingId] = useState(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [dirty, setDirty] = useState(false);
    // Chapters the server knows about that this session deleted.
    const [removed, setRemoved] = useState([]);
    const [saving, setSaving] = useState(false);
    /* The page-range clash that stopped the last confirm, and which chapters it
       is about. Cleared only when a confirm actually goes through. */
    const [issue, setIssue] = useState(null);
    /* The dialog is the interruption; the banner and the red rows are the trace
       it leaves behind, so closing one must not clear the other. */
    const [issueOpen, setIssueOpen] = useState(false);
    // How far the reader has got, for a book opened while it is still processing.
    const [processing, setProcessing] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    // The chapter list is read-only until the teacher asks to change it.
    const [editing, setEditing] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const [splitTarget, setSplitTarget] = useState(null);
    const [splitPage, setSplitPage] = useState("");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    /* getBookStatus is also the detail read - it carries the chapters, the file
       and the metadata once the book is past Processing. */
    useEffect(() => {
        /* A book handed over by the library is only the list row - listBooks
           carries no chapters - so it is never a reason to skip this read, and
           the page waits on it rather than drawing an empty split. */
        setIsLoading(true);
        axios
            .get(GetBookStatus, {
                params: { bookId, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const rejected = apiFailed(res.data);
                if (rejected) { notify(rejected); return; }

                const found = normalizeBookResponse(res.data, grades);
                setBook(found);
                setChapters(found.chapters);
                setBaseline(found.chapters);
                setSelectedId(found.chapters[0]?.id || null);
                setProcessing(found.processing);
                setElapsed(found.processing.elapsedSeconds);
            })
            .catch((error) => notify(error?.response?.data?.message || "This book could not be loaded"))
            .finally(() => setIsLoading(false));
        /* Keyed on the book being looked at, not on `book` - the effect sets
           that, and depending on it would refetch forever. */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookId, rollNumber]);

    /* A book opened from the library while it is still being read has nothing to
       edit yet, so the page keeps polling and turns into the chapter list on its
       own the moment the split lands - the same beat the upload screen uses. */
    useEffect(() => {
        if (book?.status !== "Processing") return undefined;

        const seconds = processing?.pollSeconds || 15;
        const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
        const timer = setTimeout(() => {
            axios
                .get(GetBookStatus, {
                    params: { bookId, requestedByRollNumber: rollNumber },
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    if (apiFailed(res.data)) return;
                    const found = normalizeBookResponse(res.data, grades);
                    setBook(found);
                    setProcessing(found.processing);
                    setElapsed(found.processing.elapsedSeconds);
                    if (found.status !== "Processing") {
                        setChapters(found.chapters);
                        setBaseline(found.chapters);
                        setSelectedId(found.chapters[0]?.id || null);
                        if (found.status === "Failed") notify(found.failureReason || "The book could not be read");
                        else notify(`${found.chapterCount} chapters detected - check the split`, true);
                    }
                })
                // A dropped poll is not a failed book; the next tick tries again.
                .catch(() => {});
        }, seconds * 1000);

        return () => { clearTimeout(timer); clearInterval(tick); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [book, processing, bookId, rollNumber]);

    const selected = useMemo(
        () => chapters.find((c) => c.id === selectedId) || chapters[0] || null,
        [chapters, selectedId]
    );

    const tone = subjectTone(book?.subject);
    const allConfirmed = chapters.length > 0 && chapters.every((c) => c.confirmed);
    const totalWords = chapters.reduce((sum, c) => sum + (c.wordCount || 0), 0);

    /* Something is left to confirm when a chapter is still unconfirmed, or when
       an edit has been made since the last confirm. A cleanly detected book can
       therefore still be confirmed without touching anything. */
    const needsConfirm = !allConfirmed || dirty;

    const mutate = (next) => { setChapters(renumber(next)); setDirty(true); };

    const move = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= chapters.length) return;
        const next = [...chapters];
        [next[index], next[target]] = [next[target], next[index]];
        mutate(next);
    };

    const handleDrop = (index) => {
        if (dragIndex === null || dragIndex === index) { setDragIndex(null); return; }
        const next = [...chapters];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(index, 0, moved);
        mutate(next);
        setDragIndex(null);
    };

    const startRename = (chapter) => { setEditingId(chapter.id); setDraftTitle(chapter.title); };

    const commitRename = () => {
        if (!editingId) return;
        const title = draftTitle.trim();
        if (!title) { notify("Chapter title cannot be empty"); return; }
        mutate(chapters.map((c) => (c.id === editingId ? { ...c, title } : c)));
        setEditingId(null);
    };

    const removeChapter = (chapter) => {
        if (chapters.length === 1) { notify("A book needs at least one chapter"); return; }
        /* A chapter the server knows about has to be sent back flagged deleted,
           not simply dropped from the list. */
        setRemoved((prev) => [...prev, chapter]);
        mutate(chapters.filter((c) => c.id !== chapter.id));
        if (selectedId === chapter.id) setSelectedId(chapters.find((c) => c.id !== chapter.id)?.id || null);
        notify(`"${chapter.title}" removed`, true);
    };

    const mergeWithNext = (index) => {
        if (index >= chapters.length - 1) return;
        const current = chapters[index];
        const next = chapters[index + 1];
        const merged = {
            ...current,
            title: `${current.title} + ${next.title}`,
            endPage: next.endPage || current.endPage,
            wordCount: (current.wordCount || 0) + (next.wordCount || 0),
            topics: Array.from(new Set([...(current.topics || []), ...(next.topics || [])])),
            preview: `${current.preview || ""}\n\n${next.preview || ""}`.trim(),
            confirmed: false,
        };
        const list = [...chapters];
        list.splice(index, 2, merged);
        mutate(list);
        setSelectedId(merged.id);
        notify("Chapters merged", true);
    };

    const openSplit = (chapter) => {
        setSplitTarget(chapter);
        setSplitPage(String(Math.floor((chapter.startPage + chapter.endPage) / 2) || ""));
    };

    const confirmSplit = () => {
        const chapter = splitTarget;
        const at = Number(splitPage);
        if (!chapter) return;
        if (!at || at <= chapter.startPage || at >= chapter.endPage) {
            notify(`Pick a page between ${chapter.startPage + 1} and ${chapter.endPage - 1}`);
            return;
        }
        const half = Math.round((chapter.wordCount || 0) / 2);
        const first = { ...chapter, endPage: at, wordCount: half, confirmed: false };
        const second = {
            ...chapter,
            id: `${chapter.id}-b`,
            title: `${chapter.title} (Part 2)`,
            startPage: at + 1,
            wordCount: (chapter.wordCount || 0) - half,
            confirmed: false,
        };
        const index = chapters.findIndex((c) => c.id === chapter.id);
        const list = [...chapters];
        list.splice(index, 1, first, second);
        mutate(list);
        setSplitTarget(null);
        notify("Chapter split into two", true);
    };

    const addChapter = () => {
        const last = chapters[chapters.length - 1];
        const start = (last?.endPage || 0) + 1;
        const created = {
            id: `manual-${Date.now()}`,
            number: chapters.length + 1,
            title: `Chapter ${chapters.length + 1}`,
            startPage: start,
            endPage: start + 9,
            wordCount: 0,
            topics: [],
            preview: "",
            confirmed: false,
        };
        mutate([...chapters, created]);
        setSelectedId(created.id);
        startRename(created);
    };

    const setPageField = (id, key, raw) => {
        const value = Number(String(raw).replace(/[^0-9]/g, "")) || 0;
        mutate(chapters.map((c) => (c.id === id ? { ...c, [key]: value, confirmed: false } : c)));
    };

    /* Throws away the current edit session and puts the last saved split back. */
    const revertChapters = () => {
        setChapters(baseline);
        setRemoved([]);
        setDirty(false);
        setEditingId(null);
        if (!baseline.some((c) => c.id === selectedId)) setSelectedId(baseline[0]?.id || null);
        notify("Changes reverted", true);
    };

    /* The only write there is. confirmChapters saves the edited list and marks
       the book confirmed in one call - there is no draft save, so this button is
       both. Validation is all-or-nothing on the server: one overlapping page
       range rejects the whole list and nothing is stored. */
    const confirmAll = () => {
        if (!book?.id) return;

        /* Caught here first so the teacher is told which two chapters disagree
           rather than a bare page number, and the offending rows are marked. */
        const local = findChapterRangeIssue(chapters, book.pages);
        if (local) {
            setIssue(local);
            setIssueOpen(true);
            return;
        }

        setSaving(true);
        axios
            .post(
                ConfirmBookChapters,
                confirmChaptersPayload(book.id, renumber(chapters), removed, rollNumber),
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                /* A rejected save still answers 200 with error:true. Without this
                   the page would say the book was ready when nothing was stored. */
                const rejected = apiFailed(res.data);
                if (rejected) {
                    /* The server checks the same rule and answers with a page
                       number. Shown in the same dialog, without the two titles
                       the local check would have found. */
                    setIssue({
                        kind: "server",
                        ids: [],
                        items: [],
                        title: "The chapters could not be saved",
                        message: rejected,
                        hint: "Check the page ranges - no two chapters can share a page.",
                    });
                    setIssueOpen(true);
                    return;
                }

                const next = renumber(chapters.map((c) => ({ ...c, confirmed: true })));
                setIssue(null);
                setChapters(next);
                setBaseline(next);
                setRemoved([]);
                setBook((prev) => (prev ? { ...prev, status: "Ready" } : prev));
                setDirty(false);
                notify("Book is ready for question papers", true);
            })
            .catch((error) => {
                setIssue({
                    kind: "server",
                    ids: [],
                    items: [],
                    title: "The chapters could not be saved",
                    message: error?.response?.data?.message || "The request did not reach the server.",
                    hint: "Check the page ranges - no two chapters can share a page.",
                });
                setIssueOpen(true);
            })
            .finally(() => setSaving(false));
    };

    /* The same two-panel grid the page settles into, so the chapter list and the
       reader do not jump sideways when the book lands. */
    if (isLoading) {
        return (
            <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4, mb: 2 }}>
                    <Skeleton variant="circular" width={34} height={34} sx={{ flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Skeleton variant="text" width={260} height={26} />
                        <Box sx={{ display: "flex", gap: 0.6, mt: 0.7 }}>
                            <Skeleton variant="rounded" width={34} height={18} />
                            <Skeleton variant="rounded" width={64} height={18} />
                            <Skeleton variant="rounded" width={58} height={18} />
                            <Skeleton variant="rounded" width={72} height={18} />
                        </Box>
                    </Box>
                    <Skeleton variant="rounded" width={128} height={HEADER_ACTION_H} sx={{ flexShrink: 0 }} />
                    <Skeleton variant="rounded" width={168} height={HEADER_ACTION_H} sx={{ flexShrink: 0 }} />
                </Box>

                <Grid container spacing={1.8}>
                    <Grid size={{ xs: 12, md: 6, lg: 5 }}>
                        <Box
                            sx={{
                                bgcolor: "#fff", border: `1px solid ${DASH.primary}38`,
                                borderRadius: RADIUS, overflow: "hidden",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.2,
                                    px: 2, py: 1.4, borderBottom: `1px solid ${DASH.primary}22`,
                                }}
                            >
                                <Box sx={{ width: 3, height: 20, borderRadius: RADIUS, bgcolor: `${DASH.primary}55`, flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Skeleton variant="text" width={110} height={16} />
                                    <Skeleton variant="text" width={150} height={12} />
                                </Box>
                                <Skeleton variant="rounded" width={104} height={34} sx={{ flexShrink: 0 }} />
                            </Box>
                            <Box sx={{ p: 1.2 }}>
                                {Array.from({ length: 6 }, (_, i) => <ChapterRowSkeleton key={i} />)}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6, lg: 7 }}>
                        <PanelSkeleton accent={DASH.blue} bodyHeight={320} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (!book) {
        return (
            <Box sx={{ p: 3, bgcolor: DASH.canvas, minHeight: "100%" }}>
                <Typography sx={{ fontSize: "14px", color: DASH.muted }}>
                    This book could not be found.{" "}
                    <Button onClick={() => navigate("/dashboardmenu/books")} sx={{ ...outlineBtnSx, ml: 1 }}>
                        Back to library
                    </Button>
                </Typography>
            </Box>
        );
    }

    /* Still being read, or the read failed - there is no split to review yet, so
       the page shows how far it has got instead of an empty editor. It turns
       into the chapter list on its own when the poll comes back done. */
    if (book.status === "Processing" || book.status === "Failed") {
        return (
            <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
                <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mb: 2, minWidth: 0 }}>
                    <IconButton onClick={() => navigate("/dashboardmenu/books")} sx={{ mt: -0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink, lineHeight: 1.3 }}>
                                {book.title}
                            </Typography>
                            <StatusPill status={book.status} />
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 0.7 }}>
                            <Pill label={book.grade || "-"} color={DASH.text} bg={DASH.lineSoft} />
                            <Pill label={book.subject} color={tone.color} bg={tone.bg} border={`${tone.color}33`} />
                            <Pill label={book.medium} color={DASH.muted} bg={DASH.lineSoft} />
                            <Pill label={book.academicYear} color={DASH.muted} bg={DASH.lineSoft} />
                        </Box>
                    </Box>
                </Box>

                <Grid container spacing={1.8}>
                    <Grid size={{ xs: 12, md: 7, lg: 7 }}>
                        <BookProgressPanel
                            book={book}
                            processing={processing}
                            elapsed={elapsed}
                            footNote={book.status === "Processing"
                                ? "Leaving is safe - the book keeps being read, and the library shows it as Processing until the chapters are ready."
                                : ""}
                            actions={(
                                <>
                                    {book.status === "Failed" && (
                                        <Button
                                            onClick={() => navigate("/dashboardmenu/books/upload")}
                                            sx={{ ...primaryBtnSx, height: 38 }}
                                        >
                                            Upload the file again
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => navigate("/dashboardmenu/books")}
                                        sx={{ ...outlineBtnSx, height: 38 }}
                                    >
                                        Back to library
                                    </Button>
                                </>
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                        <Panel
                            title="Book details"
                            subtitle="Read from the book's own cover pages"
                            accent={DASH.cyan}
                        >
                            {[
                                { label: "Class", value: book.grade },
                                { label: "Subject", value: book.subject },
                                { label: "Medium", value: book.medium },
                                { label: "Board or publisher", value: book.board },
                                { label: "Edition year", value: book.edition },
                                { label: "Academic year", value: book.academicYear },
                                { label: "File", value: book.fileName },
                            ].map((row, i, list) => (
                                <Box key={row.label}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.9 }}>
                                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, flex: 1, minWidth: 0 }}>
                                            {row.label}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "12.5px", fontWeight: 600, color: row.value ? DASH.ink : DASH.faint,
                                                maxWidth: "62%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            }}
                                        >
                                            {row.value || "Not detected yet"}
                                        </Typography>
                                    </Box>
                                    {i < list.length - 1 && <Divider sx={{ borderColor: DASH.lineSoft }} />}
                                </Box>
                            ))}
                        </Panel>
                    </Grid>
                </Grid>
            </Box>
        );
    }

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
                    <IconButton onClick={() => navigate("/dashboardmenu/books")} sx={{ mt: -0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                                {book.title}
                            </Typography>
                            <StatusPill status={allConfirmed ? "Ready" : book.status} />
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 0.7 }}>
                            <Pill label={book.grade || "-"} color={DASH.text} bg={DASH.lineSoft} />
                            <Pill label={book.subject} color={tone.color} bg={tone.bg} border={`${tone.color}33`} />
                            <Pill label={book.medium} color={DASH.muted} bg={DASH.lineSoft} />
                            <Pill label={book.academicYear} color={DASH.muted} bg={DASH.lineSoft} />
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 }, flexWrap: "wrap" }}>
                    <Button
                        onClick={() => {
                            if (!downloadBook(book)) notify("No file is attached to this book yet");
                        }}
                        startIcon={<DownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{ ...softBtnSx(SOFT.cyan), ...headerActionSx }}
                    >
                        Download
                    </Button>
                    {/* No separate Save. confirmChapters is the only write there
                       is - it stores the edited list and confirms it in one go -
                       so a half-saved, unconfirmed split cannot exist. */}

                    {/* The submit action. It shows while there is something left to
                       confirm - either unconfirmed chapters or unsaved edits - and
                       is the one solid, full-colour button on the page. */}
                    {needsConfirm ? (
                        <Button
                            onClick={confirmAll}
                            disabled={saving}
                            startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                color: "#fff",
                                bgcolor: DASH.green,
                                borderRadius: RADIUS,
                                boxShadow: "0 2px 10px rgba(16,185,129,0.35)",
                                "&:hover": { bgcolor: "#059669", boxShadow: "0 4px 14px rgba(16,185,129,0.45)" },
                                ...headerActionSx,
                            }}
                        >
                            {saving ? "Saving..." : "Confirm All Chapters"}
                        </Button>
                    ) : (
                        <Box
                            sx={{
                                display: "flex", alignItems: "center", gap: 0.7,
                                height: HEADER_ACTION_H, px: 2, borderRadius: RADIUS,
                                bgcolor: DASH.greenLight, border: "1px solid #BBF7D0",
                            }}
                        >
                            <CheckCircleIcon sx={{ fontSize: 16, color: DASH.green }} />
                            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#065F46", whiteSpace: "nowrap" }}>
                                All chapters confirmed
                            </Typography>
                        </Box>
                    )}

                </Box>
            </Box>

            {/* Nothing was saved when this shows - the server rejects the whole
                list on one bad range - so it stays until the clash is fixed. */}
            {issue && (
                <Box
                    sx={{
                        display: "flex", gap: 1.2, alignItems: "flex-start",
                        bgcolor: DASH.redLight, border: "1px solid #FECACA",
                        borderRadius: RADIUS, px: 1.8, py: 1.3, mb: 2,
                    }}
                >
                    <ErrorOutlineIcon sx={{ fontSize: 17, color: DASH.red, flexShrink: 0, mt: 0.1 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#991B1B" }}>
                            Nothing was saved
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#991B1B", mt: 0.3, lineHeight: 1.6 }}>
                            {issue.message}
                            {issue.ids.length > 0 && " The rows below are marked in red - fix the pages and confirm again."}
                        </Typography>
                    </Box>
                    <Button
                        onClick={() => setIssueOpen(true)}
                        sx={{ ...outlineBtnSx, flexShrink: 0 }}
                    >
                        What went wrong
                    </Button>
                </Box>
            )}

            {!allConfirmed && !issue && (
                <Box
                    sx={{
                        display: "flex", gap: 1.2, alignItems: "flex-start",
                        bgcolor: DASH.primaryLight, border: `1px solid ${DASH.primaryBorder}`,
                        borderRadius: RADIUS, px: 1.8, py: 1.3, mb: 2,
                    }}
                >
                    <InfoOutlinedIcon sx={{ fontSize: 17, color: "#B45309", flexShrink: 0, mt: 0.1 }} />
                    <Typography sx={{ fontSize: "12.5px", color: "#92400E", lineHeight: 1.55 }}>
                        Check the detected split before this book is used. Press <strong>Edit chapters</strong> to rename, reorder,
                        merge or split them, then <strong>Confirm All Chapters</strong> - only confirmed books appear in the question paper wizard.
                    </Typography>
                </Box>
            )}

            <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, md: 6, lg: 5 }}>
                    <Panel
                        title={`Chapters (${chapters.length})`}
                        subtitle={`${totalWords.toLocaleString()} words - ${book.pages} pages`}
                        accent={DASH.primary}
                        right={
                            /* Reading the split and changing it are different jobs.
                               The list stays clean until Edit is pressed. */
                            editing ? (
                                <Box sx={{ display: "flex", gap: 0.8 }}>
                                    {/* A way back out of an edit session, so trying a
                                        merge or a split is never a one-way door. */}
                                    {dirty && (
                                        <Button
                                            onClick={revertChapters}
                                            startIcon={<UndoIcon sx={{ fontSize: 15 }} />}
                                            sx={softBtnSx(SOFT.orange)}
                                        >
                                            Revert
                                        </Button>
                                    )}
                                    <Button onClick={addChapter} startIcon={<AddIcon sx={{ fontSize: 15 }} />} sx={softBtnSx(SOFT.blue)}>
                                        Add
                                    </Button>
                                    <Button
                                        onClick={() => { setEditing(false); setEditingId(null); }}
                                        startIcon={<DoneIcon sx={{ fontSize: 15 }} />}
                                        sx={outlineBtnSx}
                                    >
                                        Done
                                    </Button>
                                </Box>
                            ) : (
                                <Button
                                    onClick={() => setEditing(true)}
                                    startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                                    sx={outlineBtnSx}
                                >
                                    Edit chapters
                                </Button>
                            )
                        }
                        bodySx={{ p: 1.2, maxHeight: "62vh", overflowY: "auto" }}
                    >
                        {chapters.map((chapter, index) => {
                            const active = selected?.id === chapter.id;
                            // One of the two chapters the server refused to store.
                            const clashing = (issue?.ids || []).includes(chapter.id);
                            return (
                                <Box
                                    key={chapter.id}
                                    draggable={editing}
                                    onDragStart={() => setDragIndex(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(index)}
                                    onClick={() => setSelectedId(chapter.id)}
                                    sx={{
                                        border: `1px solid ${clashing ? DASH.red : active ? DASH.primary : DASH.line}`,
                                        bgcolor: clashing ? DASH.redLight : active ? DASH.primaryLight : "#fff",
                                        borderRadius: RADIUS,
                                        p: 1.2,
                                        mb: 1,
                                        cursor: "pointer",
                                        opacity: dragIndex === index ? 0.5 : 1,
                                        transition: "border-color .2s ease, background-color .2s ease",
                                        "&:hover": { borderColor: DASH.primaryBorder },
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                        {/* Kept in the layout so the rows do not shift when edit mode opens. */}
                                        <DragIndicatorIcon
                                            sx={{
                                                fontSize: 16, color: DASH.faint, flexShrink: 0,
                                                cursor: editing ? "grab" : "default",
                                                visibility: editing ? "visible" : "hidden",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                width: 22, height: 22, borderRadius: RADIUS, flexShrink: 0,
                                                bgcolor: chapter.confirmed ? DASH.greenLight : DASH.lineSoft,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "10.5px", fontWeight: 800, color: chapter.confirmed ? DASH.green : DASH.muted }}>
                                                {chapter.number}
                                            </Typography>
                                        </Box>

                                        {editingId === chapter.id ? (
                                            <TextField
                                                autoFocus size="small" value={draftTitle}
                                                onChange={(e) => setDraftTitle(e.target.value)}
                                                onBlur={commitRename}
                                                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); }}
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{ ...fieldSx, flex: 1, "& input": { py: 0.5, fontSize: "12.5px" } }}
                                            />
                                        ) : (
                                            <Typography
                                                sx={{
                                                    fontSize: "12.5px", fontWeight: 600, color: DASH.ink, flex: 1, minWidth: 0,
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                }}
                                            >
                                                {chapter.title}
                                            </Typography>
                                        )}

                                        {chapter.confirmed && (
                                            <CheckCircleIcon sx={{ fontSize: 15, color: DASH.green, flexShrink: 0 }} />
                                        )}
                                    </Box>

                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 0.8, pl: 3.6 }}>
                                        <Typography sx={{ fontSize: "11px", color: DASH.muted }}>
                                            p.{chapter.startPage}-{chapter.endPage} - {chapterPageCount(chapter)} pages - {(chapter.wordCount || 0).toLocaleString()} words
                                        </Typography>

                                        {/* In edit mode the tools stay put rather than
                                            appearing on hover - nothing to discover. */}
                                        <Box sx={{ display: editing ? "flex" : "none", gap: 0.1 }}>
                                            <Tooltip title="Move up" arrow>
                                                <span>
                                                    <IconButton size="small" disabled={index === 0}
                                                        onClick={(e) => { e.stopPropagation(); move(index, -1); }}
                                                        sx={{ width: 24, height: 24 }}>
                                                        <ArrowUpwardIcon sx={{ fontSize: 13, color: DASH.muted }} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Move down" arrow>
                                                <span>
                                                    <IconButton size="small" disabled={index === chapters.length - 1}
                                                        onClick={(e) => { e.stopPropagation(); move(index, 1); }}
                                                        sx={{ width: 24, height: 24 }}>
                                                        <ArrowDownwardIcon sx={{ fontSize: 13, color: DASH.muted }} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Rename" arrow>
                                                <IconButton size="small"
                                                    onClick={(e) => { e.stopPropagation(); startRename(chapter); }}
                                                    sx={{ width: 24, height: 24 }}>
                                                    <EditOutlinedIcon sx={{ fontSize: 13, color: DASH.muted }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Merge with next" arrow>
                                                <span>
                                                    <IconButton size="small" disabled={index === chapters.length - 1}
                                                        onClick={(e) => { e.stopPropagation(); mergeWithNext(index); }}
                                                        sx={{ width: 24, height: 24 }}>
                                                        <CallMergeIcon sx={{ fontSize: 13, color: DASH.muted }} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Split chapter" arrow>
                                                <IconButton size="small"
                                                    onClick={(e) => { e.stopPropagation(); openSplit(chapter); }}
                                                    sx={{ width: 24, height: 24 }}>
                                                    <CallSplitIcon sx={{ fontSize: 13, color: DASH.muted }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete" arrow>
                                                <IconButton size="small"
                                                    onClick={(e) => { e.stopPropagation(); removeChapter(chapter); }}
                                                    sx={{ width: 24, height: 24 }}>
                                                    <DeleteOutlineIcon sx={{ fontSize: 13, color: DASH.red }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 7 }}>
                    <Panel
                        title={selected ? `Chapter ${selected.number} - ${selected.title}` : "Chapter"}
                        subtitle="Extracted content used to generate questions"
                        accent={DASH.blue}
                        right={(
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {/* The book cannot be drawn inside the page - storage
                                    serves it as a download and blocks the read a
                                    viewer would need - so the action is to open the
                                    real file at this chapter's first page. */}
                                {book.fileUrl && selected && (
                                    <Tooltip title={`Opens the book at page ${selected.startPage}`} arrow>
                                        <Button
                                            onClick={() => window.open(
                                                bookPageUrl(book, selected.startPage),
                                                "_blank",
                                                "noopener"
                                            )}
                                            startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 15 }} />}
                                            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                                            sx={outlineBtnSx}
                                        >
                                            Open page {selected.startPage}
                                        </Button>
                                    </Tooltip>
                                )}

                                {selected && (
                                    /* Confirmation is a book-level state on the
                                       server, so a single chapter shows where it
                                       stands, it is not a switch. */
                                    <Box
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0,
                                            height: 34, px: 1.4, borderRadius: RADIUS,
                                            bgcolor: selected.confirmed ? DASH.greenLight : DASH.lineSoft,
                                            border: `1px solid ${selected.confirmed ? "#BBF7D0" : DASH.line}`,
                                        }}
                                    >
                                        {selected.confirmed
                                            ? <CheckCircleIcon sx={{ fontSize: 15, color: DASH.green }} />
                                            : <CheckCircleOutlineIcon sx={{ fontSize: 15, color: DASH.muted }} />}
                                        <Typography
                                            sx={{
                                                fontSize: "12.5px", fontWeight: 700, whiteSpace: "nowrap",
                                                color: selected.confirmed ? "#065F46" : DASH.muted,
                                            }}
                                        >
                                            {selected.confirmed ? "Confirmed" : "Not confirmed"}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                        bodySx={{ maxHeight: "62vh", overflowY: "auto" }}
                    >
                        {!selected ? (
                            <Typography sx={{ fontSize: "12.5px", color: DASH.faint, textAlign: "center", py: 4 }}>
                                Pick a chapter on the left.
                            </Typography>
                        ) : (
                            <>
                                <Grid container spacing={1.4}>
                                    <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                        <TextField
                                            fullWidth size="small" label="Start page"
                                            value={selected.startPage}
                                            onChange={(e) => setPageField(selected.id, "startPage", e.target.value)}
                                            sx={fieldSx}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                        <TextField
                                            fullWidth size="small" label="End page"
                                            value={selected.endPage}
                                            onChange={(e) => setPageField(selected.id, "endPage", e.target.value)}
                                            sx={fieldSx}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <TextField
                                            fullWidth size="small" label="Chapter title"
                                            value={selected.title}
                                            onChange={(e) => mutate(chapters.map((c) => (c.id === selected.id ? { ...c, title: e.target.value } : c)))}
                                            sx={fieldSx}
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1.8 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                        <DescriptionOutlinedIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                            {chapterPageCount(selected)} pages
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                        <NotesOutlinedIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                            {(selected.wordCount || 0).toLocaleString()} words
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                        <MenuBookOutlinedIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                            {book.subject} - {book.grade}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 1.8, borderColor: DASH.lineSoft }} />

                                <Typography
                                    sx={{
                                        fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.06em",
                                        textTransform: "uppercase", color: DASH.muted, mb: 1,
                                    }}
                                >
                                    Extracted preview
                                </Typography>
                                <Box
                                    sx={{
                                        bgcolor: "#FCFCFD", border: `1px solid ${DASH.line}`,
                                        borderRadius: RADIUS, p: 1.6,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                        {selected.preview || "No text was extracted for this chapter yet."}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Panel>
                </Grid>
            </Grid>

            {/* A refused confirm stops the teacher, so it is a dialog and not a
                notice that slides away. It names the two chapters and puts the
                page they fight over between them. */}
            <Dialog
                open={issueOpen}
                onClose={() => setIssueOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: "10px", width: 460, maxWidth: "94vw" } } }}
            >
                <Box sx={{ px: 3, pt: 3, pb: 1, textAlign: "center" }}>
                    <Box
                        sx={{
                            width: 52, height: 52, borderRadius: "50%", mx: "auto",
                            bgcolor: DASH.redLight, border: "1px solid #FECACA",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <ErrorOutlineIcon sx={{ fontSize: 26, color: DASH.red }} />
                    </Box>
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: DASH.ink, mt: 1.6 }}>
                        {issue?.title || "The chapters could not be saved"}
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.6, lineHeight: 1.65 }}>
                        {issue?.message}
                    </Typography>
                </Box>

                <DialogContent sx={{ pt: 1 }}>
                    {issue?.items?.length > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {issue.items.map((item, i) => (
                                <React.Fragment key={item.id}>
                                    {i > 0 && issue.page && (
                                        <Box
                                            sx={{
                                                flexShrink: 0, px: 1, py: 0.5, borderRadius: RADIUS,
                                                bgcolor: DASH.red, textAlign: "center",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: "#FEE2E2", letterSpacing: "0.05em" }}>
                                                PAGE
                                            </Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                                                {issue.page}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box
                                        sx={{
                                            flex: 1, minWidth: 0, borderRadius: RADIUS,
                                            border: `1px solid ${DASH.line}`, borderLeft: `3px solid ${DASH.red}`,
                                            px: 1.2, py: 1,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "12.5px", fontWeight: 700, color: DASH.ink,
                                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                            p.{item.startPage}-{item.endPage}
                                        </Typography>
                                    </Box>
                                </React.Fragment>
                            ))}
                        </Box>
                    )}

                    <Box
                        sx={{
                            display: "flex", gap: 1, alignItems: "flex-start",
                            bgcolor: DASH.lineSoft, borderRadius: RADIUS, px: 1.4, py: 1.1, mt: 1.8,
                        }}
                    >
                        <InfoOutlinedIcon sx={{ fontSize: 15, color: DASH.muted, mt: 0.2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: "11.5px", color: DASH.text, lineHeight: 1.6 }}>
                            {issue?.hint} Nothing was saved - the whole list is stored at once, so the
                            book is exactly as it was.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.4, pt: 0 }}>
                    <Button onClick={() => setIssueOpen(false)} sx={outlineBtnSx}>Close</Button>
                    <Button
                        onClick={() => {
                            setEditing(true);
                            if (issue?.ids?.length) setSelectedId(issue.ids[0]);
                            setIssueOpen(false);
                        }}
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={primaryBtnSx}
                    >
                        Fix the pages
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(splitTarget)}
                onClose={() => setSplitTarget(null)}
                slotProps={{ paper: { sx: { borderRadius: RADIUS, width: 380 } } }}
            >
                <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>
                    Split this chapter
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mb: 2 }}>
                        "{splitTarget?.title}" runs from page {splitTarget?.startPage} to {splitTarget?.endPage}.
                        The first part ends on the page you pick.
                    </Typography>
                    <TextField
                        select fullWidth size="small" label="Split after page"
                        value={splitPage}
                        onChange={(e) => setSplitPage(e.target.value)}
                        sx={fieldSx}
                    >
                        {splitTarget && Array.from(
                            { length: Math.max(0, splitTarget.endPage - splitTarget.startPage - 1) },
                            (_, i) => splitTarget.startPage + 1 + i
                        ).map((p) => (
                            <MenuItem key={p} value={String(p)} sx={{ fontSize: "13px" }}>Page {p}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setSplitTarget(null)} sx={outlineBtnSx}>Cancel</Button>
                    <Button onClick={confirmSplit} sx={primaryBtnSx}>Split</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
