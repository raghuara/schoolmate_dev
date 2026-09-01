import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, TextField, Tooltip, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
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

import SnackBar from "../../SnackBar";
import Loader from "../../Loader";
import { DASH, RADIUS, SOFT, Panel } from "../../DashBoardComps/dashboardTheme";
import { MOCK_BOOKS, bookPageUrl, chapterPageCount, downloadBook } from "./bookApi";
import { fieldSx, subjectTone, StatusPill, Pill, outlineBtnSx, softBtnSx, primaryBtnSx, headerActionSx, HEADER_ACTION_H } from "./bookTheme";

const renumber = (list) => list.map((c, i) => ({ ...c, number: i + 1 }));

/* Wide enough for the longest trailing action ("Not confirmed"), so the view
   switch sits in one place whichever view is open. */
const VIEW_ACTION_W = 140;

export default function BookChaptersPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookId } = useParams();

    const [book, setBook] = useState(location.state?.book || null);
    const [chapters, setChapters] = useState(location.state?.book?.chapters || []);
    /* The last saved split. Revert copies this back, so an edit session can be
       abandoned without reloading the page. */
    const [baseline, setBaseline] = useState(location.state?.book?.chapters || []);
    const [isLoading, setIsLoading] = useState(!location.state?.book);
    const [selectedId, setSelectedId] = useState(location.state?.book?.chapters?.[0]?.id || null);
    const [editingId, setEditingId] = useState(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [dirty, setDirty] = useState(false);
    // Read the extracted text, or the book it was pulled from.
    const [view, setView] = useState("details");
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

    /* Mock read. Replace with axios.get(GetBookById, { params: { bookId } })
       and normalizeBook(res.data, grades). */
    useEffect(() => {
        if (book) return;
        setIsLoading(true);
        const timer = setTimeout(() => {
            const found = MOCK_BOOKS.find((b) => String(b.id) === String(bookId));
            if (found) {
                setBook(found);
                setChapters(found.chapters);
                setBaseline(found.chapters);
                setSelectedId(found.chapters[0]?.id || null);
            }
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [book, bookId]);

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

    /* A chapter is confirmed as part of an edit session. With no session open, or
       nothing changed in it, the badge is a status and not a button. */
    const canConfirmChapter = editing && dirty;

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

    const toggleConfirm = (chapter) =>
        mutate(chapters.map((c) => (c.id === chapter.id ? { ...c, confirmed: !c.confirmed } : c)));

    /* Replace with POST book/updateChapters { bookId, chapters }. */
    const saveChapters = () => {
        setBaseline(chapters);
        setDirty(false);
        notify("Chapter list saved", true);
    };

    /* Throws away the current edit session and puts the last saved split back. */
    const revertChapters = () => {
        setChapters(baseline);
        setDirty(false);
        setEditingId(null);
        if (!baseline.some((c) => c.id === selectedId)) setSelectedId(baseline[0]?.id || null);
        notify("Changes reverted", true);
    };

    const confirmAll = () => {
        const next = renumber(chapters.map((c) => ({ ...c, confirmed: true })));
        setChapters(next);
        setBaseline(next);
        setBook((prev) => (prev ? { ...prev, status: "Ready" } : prev));
        setDirty(false);
        notify("Book is ready for question papers", true);
    };

    if (isLoading) return <Loader />;

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
                    {/* Save only matters once something has actually changed. */}
                    {dirty && (
                        <Button
                            onClick={saveChapters}
                            startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                            sx={{ ...softBtnSx(SOFT.purple), ...headerActionSx }}
                        >
                            Save
                        </Button>
                    )}

                    {/* The submit action. It shows while there is something left to
                       confirm - either unconfirmed chapters or unsaved edits - and
                       is the one solid, full-colour button on the page. */}
                    {needsConfirm ? (
                        <Button
                            onClick={confirmAll}
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
                            Confirm All Chapters
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

            {!allConfirmed && (
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
                            return (
                                <Box
                                    key={chapter.id}
                                    draggable={editing}
                                    onDragStart={() => setDragIndex(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(index)}
                                    onClick={() => setSelectedId(chapter.id)}
                                    sx={{
                                        border: `1px solid ${active ? DASH.primary : DASH.line}`,
                                        bgcolor: active ? DASH.primaryLight : "#fff",
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
                        title={
                            view === "pdf"
                                ? book.fileName || "Book file"
                                : selected ? `Chapter ${selected.number} - ${selected.title}` : "Chapter"
                        }
                        subtitle={
                            view === "pdf"
                                ? selected
                                    ? `Opened at page ${selected.startPage} - where chapter ${selected.number} begins`
                                    : "The uploaded book"
                                : "Extracted content used to generate questions"
                        }
                        accent={DASH.blue}
                        right={(
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {/* Read the extracted text, or the book it came from. */}
                                <Box sx={{ display: "flex", alignItems: "center", height: 34, bgcolor: DASH.lineSoft, borderRadius: RADIUS, p: 0.4 }}>
                                    {[
                                        { key: "details", label: "Details", icon: NotesOutlinedIcon },
                                        { key: "pdf", label: "Book PDF", icon: PictureAsPdfOutlinedIcon },
                                    ].map((t) => {
                                        const TabIcon = t.icon;
                                        const active = view === t.key;
                                        return (
                                            <Box
                                                key={t.key}
                                                onClick={() => setView(t.key)}
                                                sx={{
                                                    display: "flex", alignItems: "center", gap: 0.5, height: 26,
                                                    px: 1.1, borderRadius: RADIUS, cursor: "pointer",
                                                    bgcolor: active ? "#fff" : "transparent",
                                                    boxShadow: active ? "0 1px 3px rgba(17,24,39,0.12)" : "none",
                                                    transition: "background-color .15s ease",
                                                }}
                                            >
                                                <TabIcon sx={{ fontSize: 14, color: active ? DASH.blue : DASH.muted }} />
                                                <Typography
                                                    sx={{
                                                        fontSize: "11.5px",
                                                        fontWeight: active ? 700 : 600,
                                                        color: active ? DASH.ink : DASH.muted,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {t.label}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>

                                {/* Each view has its own trailing action, and they are
                                    different widths. The slot is fixed so the Details /
                                    Book PDF switch stays put when the view changes. */}
                                <Box
                                    sx={{
                                        width: VIEW_ACTION_W, flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "flex-end",
                                    }}
                                >
                                    {view === "details" && selected && (
                                        canConfirmChapter ? (
                                            /* Only an open edit session with unsaved
                                               changes turns this into an action. */
                                            <Button
                                                onClick={() => toggleConfirm(selected)}
                                                startIcon={
                                                    selected.confirmed
                                                        ? <CheckCircleIcon sx={{ fontSize: 15 }} />
                                                        : <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
                                                }
                                                sx={selected.confirmed ? softBtnSx(SOFT.green) : outlineBtnSx}
                                            >
                                                {selected.confirmed ? "Confirmed" : "Confirm"}
                                            </Button>
                                        ) : (
                                            /* Otherwise it is just where this chapter stands. */
                                            <Box
                                                sx={{
                                                    display: "flex", alignItems: "center", gap: 0.6,
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
                                        )
                                    )}

                                    {view === "pdf" && book.fileUrl && (
                                        <Tooltip title="Open in a new tab" arrow>
                                            <IconButton
                                                onClick={() => window.open(bookPageUrl(book, selected?.startPage), "_blank", "noopener")}
                                                sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, width: 34, height: 34, bgcolor: "#fff" }}
                                            >
                                                <OpenInNewIcon sx={{ fontSize: 16, color: DASH.text }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>
                        )}
                        bodySx={view === "pdf" ? { p: 0 } : { maxHeight: "62vh", overflowY: "auto" }}
                    >
                        {view === "pdf" ? (
                            book.fileUrl ? (
                                <Box sx={{ height: "62vh", bgcolor: "#EEF0F4" }}>
                                    <iframe
                                        key={`${book.id}-${selected?.startPage || 1}`}
                                        title={book.fileName || "Book"}
                                        src={bookPageUrl(book, selected?.startPage)}
                                        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                                    />
                                </Box>
                            ) : (
                                /* The mock library has no file URL. Once book/getById
                                   returns one this renders the real PDF. */
                                <Box sx={{ height: "62vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#EEF0F4" }}>
                                    <Box sx={{ textAlign: "center", px: 3 }}>
                                        <PictureAsPdfOutlinedIcon sx={{ fontSize: 44, color: DASH.line }} />
                                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                                            The file is not attached to this record
                                        </Typography>
                                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.6, maxWidth: 420, lineHeight: 1.7 }}>
                                            {book.fileName
                                                ? `"${book.fileName}" was uploaded, but this record carries no file link yet. The book appears here as soon as the API returns one.`
                                                : "No file was uploaded with this book."}
                                        </Typography>
                                    </Box>
                                </Box>
                            )
                        ) : !selected ? (
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
