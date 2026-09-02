import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Typography, Button, IconButton, Select, MenuItem, Tooltip,
    InputAdornment, TextField, Pagination, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

import SnackBar from "../../SnackBar";
import { DASH, RADIUS, KPI_TONES, SolidStatCard } from "../../DashBoardComps/dashboardTheme";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { ListBooks } from "../../../Api/Api";
import {
    BOOK_STATUSES, MEDIUMS, downloadBook, fmtDate, parseApiDate,
    normalizeBookList, normalizeBookCounts,
} from "./bookApi";
import {
    fieldSx, subjectTone, StatusPill, Pill, MetaItem, outlineBtnSx, createBtnSx, primaryBtnSx,
    BOOK_GRID, KPI_GRID, BookCardSkeleton, KpiSkeleton,
} from "./bookTheme";

const PER_PAGE = 8;

const SORT_OPTIONS = [
    { key: "newest", label: "Newest first" },
    { key: "oldest", label: "Oldest first" },
    { key: "chapters", label: "Most chapters" },
    { key: "title", label: "Title A - Z" },
];

/* A book on a shelf, not a generic tile. The coloured spine carries the subject
   and gives the row the look of a bookcase; everything a teacher decides on -
   class, chapters, whether it is usable yet - sits on the face. */
const BookCard = ({ book, onOpen, onDelete, onDownload }) => {
    const tone = subjectTone(book.subject);
    const spineText = (book.subject || "Book").toUpperCase();

    return (
        <Box
            onClick={() => onOpen(book)}
            sx={{
                display: "flex",
                bgcolor: "#fff",
                border: `1px solid ${DASH.line}`,
                borderRadius: "8px",
                height: "100%",
                boxSizing: "border-box",
                cursor: "pointer",
                overflow: "hidden",
                transition: "box-shadow .2s ease, transform .2s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 26px rgba(17,24,39,0.12)",
                    ".bookActions": { opacity: 1 },
                },
            }}
        >
            {/* Spine */}
            <Box
                sx={{
                    width: 34,
                    flexShrink: 0,
                    position: "relative",
                    background: `linear-gradient(180deg, ${tone.color} 0%, ${tone.color}CC 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* the two bands a bound spine has */}
                <Box sx={{ position: "absolute", top: 10, left: 5, right: 5, height: "2px", bgcolor: "rgba(255,255,255,0.45)" }} />
                <Box sx={{ position: "absolute", bottom: 10, left: 5, right: 5, height: "2px", bgcolor: "rgba(255,255,255,0.45)" }} />
                <Typography
                    sx={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        fontSize: "9.5px",
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxHeight: "72%",
                    }}
                >
                    {spineText}
                </Typography>
            </Box>

            {/* Face */}
            <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                <Box sx={{ p: 1.7, flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: "13.5px", fontWeight: 700, color: DASH.ink, lineHeight: 1.35,
                                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                {book.title}
                            </Typography>
                            <Typography sx={{ fontSize: "11px", color: DASH.faint, mt: 0.3 }}>
                                {book.board || "-"}{book.edition ? ` - ${book.edition}` : ""}
                            </Typography>
                        </Box>
                        <StatusPill status={book.status} dense />
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mt: 1.3 }}>
                        <Pill label={book.grade || "-"} color={DASH.text} bg={DASH.lineSoft} />
                        <Pill label={book.subject} color={tone.color} bg={tone.bg} border={`${tone.color}33`} />
                        <Pill label={book.medium} color={DASH.muted} bg={DASH.lineSoft} />
                    </Box>

                    {/* Chapters is the number that decides whether the book is usable */}
                    <Box
                        sx={{
                            display: "flex", alignItems: "center", gap: 1.2, mt: 1.4,
                            px: 1.2, py: 0.9, borderRadius: RADIUS, bgcolor: tone.bg,
                        }}
                    >
                        <LayersOutlinedIcon sx={{ fontSize: 17, color: tone.color, flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "13px", fontWeight: 800, color: DASH.ink, lineHeight: 1.2 }}>
                                {book.chapterCount} chapters
                            </Typography>
                            <Typography sx={{ fontSize: "10.5px", color: DASH.muted, mt: 0.1 }}>
                                {book.status === "Ready"
                                    ? book.usedInPapers > 0
                                        ? `Used in ${book.usedInPapers} paper${book.usedInPapers > 1 ? "s" : ""}`
                                        : "Ready for question papers"
                                    : book.status === "Needs Review"
                                        ? "Confirm the split to use it"
                                        : book.status === "Processing"
                                            ? "Still being split"
                                            : "Upload failed - try again"}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.4, flexWrap: "wrap", mt: 1.3 }}>
                        <MetaItem icon={DescriptionOutlinedIcon} label={`${book.pages} pages`} />
                        <MetaItem icon={InsertDriveFileOutlinedIcon} label={`${book.fileSizeMB} MB`} />
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                        px: 1.7, py: 1, borderTop: `1px solid ${DASH.lineSoft}`, bgcolor: "#FCFCFD",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 21, height: 21, borderRadius: "50%", flexShrink: 0,
                                bgcolor: tone.bg, color: tone.color, display: "flex",
                                alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800,
                            }}
                        >
                            {String(book.uploadedBy || "-").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </Box>
                        <Typography sx={{ fontSize: "10.5px", color: DASH.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {book.uploadedBy} - {fmtDate(book.uploadedDate)}
                        </Typography>
                    </Box>

                    <Box className="bookActions" sx={{ display: "flex", gap: 0.2, opacity: { xs: 1, md: 0 }, transition: "opacity .2s ease", flexShrink: 0 }}>
                        <Tooltip title="Open chapters" arrow>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onOpen(book); }} sx={{ width: 26, height: 26 }}>
                                <VisibilityOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Download the book" arrow>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDownload(book); }} sx={{ width: 26, height: 26 }}>
                                <DownloadOutlinedIcon sx={{ fontSize: 15, color: DASH.muted }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete book" arrow>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(book); }} sx={{ width: 26, height: 26 }}>
                                <DeleteOutlineIcon sx={{ fontSize: 15, color: DASH.red }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default function BooksLibraryPage() {
    const navigate = useNavigate();
    const academicYear = useSelector(selectAcademicYear);
    const gradeOptions = useSelector(selectGrades) || [];

    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;
    const token = "123";

    const [books, setBooks] = useState([]);
    const [counts, setCounts] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [mediumFilter, setMediumFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortKey, setSortKey] = useState("newest");
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState("");

    const notify = (msg, ok = false) => {
        setMessage(msg); setColor(ok); setStatus(ok); setOpen(true);
    };

    /* The year's books in one call. listBooks also accepts grade / subject /
       medium / status / search, but the KPI counts it returns are relative to
       whatever was filtered - so the fetch stays unfiltered and the narrowing
       happens below, which also keeps typing in the search box instant. Push the
       dropdowns into params here if the library ever outgrows one response. */
    const loadBooks = useCallback(() => {
        setIsLoading(true);
        axios
            .get(ListBooks, {
                params: { academicYear, requestedByRollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setBooks(normalizeBookList(res.data, gradeOptions));
                setCounts(normalizeBookCounts(res.data));
            })
            .catch((error) => {
                setBooks([]);
                notify(error?.response?.data?.message || "Could not load the book library");
            })
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear, rollNumber]);

    useEffect(() => { if (academicYear) loadBooks(); }, [academicYear, loadBooks]);

    const subjects = useMemo(
        () => Array.from(new Set(books.map((b) => b.subject).filter(Boolean))).sort(),
        [books]
    );

    /* The server sends the badge counts with the list. Falling back to counting
       the rows keeps the cards honest if an older build answers without them. */
    const stats = useMemo(() => ({
        total: counts.total || books.length,
        ready: counts.confirmed || books.filter((b) => b.status === "Ready").length,
        review: counts.needsAttention
            || books.filter((b) => b.status === "Needs Review" || b.status === "Failed").length,
        chapters: counts.chaptersIndexed || books.reduce((sum, b) => sum + (b.chapterCount || 0), 0),
    }), [books, counts]);

    const activeFilterCount =
        (search.trim() ? 1 : 0) +
        (gradeFilter !== "all" ? 1 : 0) +
        (subjectFilter !== "all" ? 1 : 0) +
        (mediumFilter !== "all" ? 1 : 0) +
        (statusFilter !== "all" ? 1 : 0);

    const filtered = useMemo(() => {
        const time = (row) => parseApiDate(row.uploadedDate)?.getTime() ?? 0;

        return books
            .filter((b) => {
                if (statusFilter !== "all" && b.status !== statusFilter) return false;
                // Rows carry the class sign ("VIII"), not a grade id.
                if (gradeFilter !== "all" && String(b.grade) !== String(gradeFilter)) return false;
                if (subjectFilter !== "all" && b.subject !== subjectFilter) return false;
                if (mediumFilter !== "all" && b.medium !== mediumFilter) return false;
                if (search.trim()) {
                    const t = search.trim().toLowerCase();
                    const haystack = `${b.title} ${b.subject} ${b.board} ${b.uploadedBy}`.toLowerCase();
                    if (!haystack.includes(t)) return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortKey === "newest") return time(b) - time(a);
                if (sortKey === "oldest") return time(a) - time(b);
                if (sortKey === "chapters") return b.chapterCount - a.chapterCount;
                return String(a.title).localeCompare(String(b.title));
            });
    }, [books, search, gradeFilter, subjectFilter, mediumFilter, statusFilter, sortKey]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(page, pageCount);
    const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

    const resetFilters = () => {
        setSearch(""); setGradeFilter("all"); setSubjectFilter("all");
        setMediumFilter("all"); setStatusFilter("all"); setPage(1);
    };

    const openBook = (book) => {
        if (book.status === "Processing") {
            notify("This book is still being processed. Chapters appear once it finishes.");
            return;
        }
        navigate(`/dashboardmenu/books/${book.id}`, { state: { book } });
    };

    const saveBook = (book) => {
        if (!downloadBook(book)) notify("No file is attached to this book yet");
    };

    const confirmDelete = () => {
        const target = deleteTarget;
        setDeleteTarget(null);
        if (!target) return;
        setBooks((prev) => prev.filter((b) => b.id !== target.id));
        notify(`"${target.title}" removed from the library`, true);
    };

    // Every filter behaves the same way, so they are declared once and rendered
    // in a loop - that is what keeps them the same width and aligned.
    const filters = [
        {
            key: "grade", value: gradeFilter, set: setGradeFilter, width: 118, allLabel: "All Classes",
            options: gradeOptions.map((g) => ({ value: String(g.sign), label: g.sign })),
        },
        {
            key: "subject", value: subjectFilter, set: setSubjectFilter, width: 142, allLabel: "All Subjects",
            options: subjects.map((s) => ({ value: s, label: s })),
        },
        {
            key: "medium", value: mediumFilter, set: setMediumFilter, width: 122, allLabel: "All Mediums",
            options: MEDIUMS.map((m) => ({ value: m, label: m })),
        },
        {
            key: "status", value: statusFilter, set: setStatusFilter, width: 138, allLabel: "Any Status",
            options: BOOK_STATUSES.map((s) => ({ value: s, label: s })),
        },
    ];

    return (
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 2 }, pb: 4, bgcolor: DASH.canvas, minHeight: "100%" }}>
            <SnackBar open={open} setOpen={setOpen} status={status} color={color} message={message} />

            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 1.5,
                    mb: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, minWidth: 0 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mt: -0.5 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: DASH.text }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "21px", fontWeight: 700, color: DASH.ink }}>
                            Books &amp; Chapters
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.2 }}>
                            Class and subject books, split into chapters and ready for question papers.
                            {academicYear ? ` Academic year ${academicYear}.` : ""}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, pl: { xs: 5, md: 0 } }}>
                    <Tooltip title="Reload library" arrow>
                        <IconButton
                            onClick={loadBooks}
                            sx={{
                                width: 34, height: 34,
                                border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: "#fff",
                                "&:hover": { bgcolor: DASH.primaryLight, borderColor: DASH.primaryBorder },
                            }}
                        >
                            <RefreshIcon sx={{ fontSize: 18, color: DASH.text }} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        onClick={() => navigate("/dashboardmenu/books/upload")}
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        sx={createBtnSx}
                    >
                        Upload Book
                    </Button>
                </Box>
            </Box>

            {/* The counts arrive with the list, so the tiles wait with it. */}
            {isLoading ? (
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {[0, 1, 2, 3].map((i) => (
                        <Grid key={i} size={KPI_GRID}><KpiSkeleton /></Grid>
                    ))}
                </Grid>
            ) : (
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={KPI_GRID}>
                    <SolidStatCard
                        icon={MenuBookOutlinedIcon}
                        label="Books in Library"
                        value={stats.total}
                        note="All classes and subjects"
                        tone={KPI_TONES.orange}
                    />
                </Grid>
                <Grid size={KPI_GRID}>
                    <SolidStatCard
                        icon={FactCheckOutlinedIcon}
                        label="Ready for Papers"
                        value={stats.ready}
                        note="Chapter split confirmed"
                        tone={KPI_TONES.green}
                        onClick={() => { setStatusFilter("Ready"); setPage(1); }}
                    />
                </Grid>
                <Grid size={KPI_GRID}>
                    <SolidStatCard
                        icon={PendingOutlinedIcon}
                        label="Needs Attention"
                        value={stats.review}
                        note="Review or re-upload"
                        tone={KPI_TONES.pink}
                        onClick={() => { setStatusFilter("Needs Review"); setPage(1); }}
                    />
                </Grid>
                <Grid size={KPI_GRID}>
                    <SolidStatCard
                        icon={LayersOutlinedIcon}
                        label="Chapters Indexed"
                        value={stats.chapters}
                        note="Available to pick from"
                        tone={KPI_TONES.cyan}
                    />
                </Grid>
            </Grid>
            )}

            {/* One toolbar: search takes the space on the left, every filter sits
                on the right in a fixed order so the row never reshuffles. */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                    bgcolor: "#fff",
                    border: `1px solid ${DASH.line}`,
                    borderRadius: RADIUS,
                    px: 2,
                    py: 1.5,
                    mb: 2,
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search by book, subject or uploader"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    sx={{ ...fieldSx, flex: 1, minWidth: 220, maxWidth: { md: 340 } }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                        ml: { md: "auto" },
                    }}
                >
                    {filters.map((f) => (
                        <Select
                            key={f.key}
                            size="small"
                            value={f.value}
                            onChange={(e) => { f.set(e.target.value); setPage(1); }}
                            sx={{ ...fieldSx, minWidth: f.width, fontSize: "13px" }}
                        >
                            <MenuItem value="all" sx={{ fontSize: "13px" }}>{f.allLabel}</MenuItem>
                            {f.options.map((o) => (
                                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "13px" }}>{o.label}</MenuItem>
                            ))}
                        </Select>
                    ))}

                    <Box sx={{ width: "1px", height: 26, bgcolor: DASH.line, display: { xs: "none", md: "block" } }} />

                    <Select
                        size="small"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                        sx={{ ...fieldSx, minWidth: 145, fontSize: "13px" }}
                    >
                        {SORT_OPTIONS.map((o) => (
                            <MenuItem key={o.key} value={o.key} sx={{ fontSize: "13px" }}>{o.label}</MenuItem>
                        ))}
                    </Select>

                    {activeFilterCount > 0 && (
                        <Tooltip title="Clear all filters" arrow>
                            <IconButton
                                onClick={resetFilters}
                                sx={{
                                    border: "1px solid #FECACA", borderRadius: RADIUS,
                                    bgcolor: DASH.redLight, width: 34, height: 34,
                                    "&:hover": { bgcolor: "#FEE2E2" },
                                }}
                            >
                                <FilterAltOffOutlinedIcon sx={{ fontSize: 17, color: DASH.red }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.4, px: 0.4 }}>
                <Typography sx={{ fontSize: "12px", color: DASH.muted }}>
                    Showing <strong>{filtered.length}</strong> of {books.length} book{books.length === 1 ? "" : "s"}
                    {activeFilterCount > 0 ? ` - ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} on` : ""}
                </Typography>
            </Box>

            {isLoading ? (
                /* Placeholders in the same grid the cards land in, so nothing
                   reflows when the answer arrives. */
                <Grid container spacing={1.8}>
                    {Array.from({ length: PER_PAGE }, (_, i) => (
                        <Grid key={i} size={BOOK_GRID}><BookCardSkeleton /></Grid>
                    ))}
                </Grid>
            ) : paged.length === 0 ? (
                <Box
                    sx={{
                        bgcolor: "#fff", border: `1px dashed ${DASH.line}`, borderRadius: RADIUS,
                        py: 7, px: 3, textAlign: "center",
                    }}
                >
                    <AutoStoriesOutlinedIcon sx={{ fontSize: 42, color: DASH.line }} />
                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: DASH.ink, mt: 1 }}>
                        {books.length === 0 ? "No books here yet" : "Nothing matches these filters"}
                    </Typography>
                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, mt: 0.5, mb: 2 }}>
                        {books.length === 0
                            ? "Upload a class book and it is split into chapters automatically."
                            : "Widen the class, subject or status and try again."}
                    </Typography>
                    {books.length === 0 ? (
                        <Button
                            onClick={() => navigate("/dashboardmenu/books/upload")}
                            variant="contained"
                            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                            sx={createBtnSx}
                        >
                            Upload Book
                        </Button>
                    ) : (
                        <Button onClick={resetFilters} sx={outlineBtnSx}>Clear filters</Button>
                    )}
                </Box>
            ) : (
                <Grid container spacing={1.8}>
                    {paged.map((book) => (
                        <Grid key={book.id} size={BOOK_GRID}>
                            <BookCard book={book} onOpen={openBook} onDelete={setDeleteTarget} onDownload={saveBook} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {pageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
                    <Pagination
                        count={pageCount}
                        page={safePage}
                        onChange={(e, v) => setPage(v)}
                        size="small"
                        sx={{
                            "& .MuiPaginationItem-root": { fontSize: "12.5px", borderRadius: RADIUS },
                            "& .Mui-selected": { bgcolor: `${DASH.primary} !important`, color: "#fff" },
                        }}
                    />
                </Box>
            )}

            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                slotProps={{ paper: { sx: { borderRadius: RADIUS, width: 400 } } }}
            >
                <DialogTitle sx={{ fontSize: "15px", fontWeight: 700, color: DASH.ink }}>
                    Delete this book?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: "13px", color: DASH.muted }}>
                        "{deleteTarget?.title}" and its {deleteTarget?.chapterCount} chapters will be removed.
                        {deleteTarget?.usedInPapers > 0
                            ? ` It is used by ${deleteTarget.usedInPapers} question paper(s) - those papers keep their questions but lose the chapter link.`
                            : ""}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} sx={outlineBtnSx}>Cancel</Button>
                    <Button
                        onClick={confirmDelete}
                        sx={{ ...primaryBtnSx, bgcolor: DASH.red, "&:hover": { bgcolor: "#DC2626" } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
