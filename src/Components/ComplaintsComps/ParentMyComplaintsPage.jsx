import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    InputAdornment,
    MenuItem,
    Pagination,
    Select,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import { C, cardSx } from "./complaintsTokens";
import { actorRollNumber, fetchMyComplaints } from "./complaintsParentApi";
import { fetchLookupCategories } from "./complaintsDetailApi";
import { MODULE } from "./complaintsConfigApi";
import ParentActionDialog from "./ParentActionDialog";
import {
    ACTION_LABELS,
    PARENT_PRIORITY_FILTERS,
    PARENT_PRIORITY_TONES,
    PARENT_STATUS_FILTERS,
    PARENT_STATUS_TONES,
    SLA_STATE_TONES,
    availableActions,
    formatOn,
} from "./parentComplaintsView";

/**
 * Every complaint raised for one student, with the actions the parent can take on each.
 *
 * FILTERING IS SERVER-SIDE
 * status, priority, category, search and paging all go to the API — the rows on screen are
 * one page, so filtering the array here would only filter that page and quietly under-report.
 *
 * The search box is debounced rather than filtered on each keystroke, because every change
 * is a network round trip.
 */

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

const selectSx = {
    minWidth: 150,
    borderRadius: "9px",
    fontSize: "13px",
    bgcolor: C.surface,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: C.inputBorder },
};

const chipSx = (tone) => ({
    bgcolor: tone.bg,
    color: tone.fg,
    fontSize: "11px",
    fontWeight: 600,
});

export default function ParentMyComplaintsPage() {
    const navigate = useNavigate();
    const { studentId } = useParams();
    const studentRollNumber = studentId || actorRollNumber();

    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [categories, setCategories] = useState([]);
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");

    const [dialog, setDialog] = useState({ open: false, kind: "feedback", complaint: null });

    /* Debounce the search box: each change is a request, and typing "playground" would
       otherwise fire ten. */
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput]);

    /* The category filter's options. A failure here is not worth an error banner — the
       filter just stays empty and the rest of the screen still works. */
    useEffect(() => {
        let cancelled = false;
        fetchLookupCategories({ moduleType: MODULE.parent }).then((result) => {
            if (!cancelled && result.ok) setCategories(result.rows);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        const result = await fetchMyComplaints({
            studentRollNumber,
            status,
            priority,
            categoryId,
            search,
            page,
            pageSize: PAGE_SIZE,
        });
        if (!result.ok) {
            setError(
                result.routeMissing
                    ? "The complaint list is not available on the server yet."
                    : result.message || "Could not load your complaints.",
            );
            setRows([]);
            setTotalCount(0);
        } else {
            setRows(result.rows);
            setTotalCount(result.totalCount);
        }
        setLoading(false);
    }, [studentRollNumber, status, priority, categoryId, search, page]);

    useEffect(() => {
        load();
    }, [load]);

    const openAction = (kind, complaint) => setDialog({ open: true, kind, complaint });
    const closeAction = () => setDialog((current) => ({ ...current, open: false }));

    /* Every action changes the complaint's status server-side, so the list is reloaded
       rather than patched — the new status, and which actions it now allows, are the
       server's to decide. */
    const handleDone = (message) => {
        closeAction();
        setToast(message);
        load();
    };

    const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Button
                    onClick={() => navigate(-1)}
                    sx={{ minWidth: 0, p: 0.5, color: C.text }}
                    aria-label="Back"
                >
                    <ArrowBackIcon sx={{ fontSize: "20px" }} />
                </Button>
                <Box>
                    <Typography sx={{ fontSize: "20px", fontWeight: 600, color: C.text }}>
                        My Complaints
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: C.textMuted }}>
                        {loading ? "Loading…" : `${totalCount} complaint${totalCount === 1 ? "" : "s"}`}
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <TextField
                    size="small"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search complaints"
                    sx={{
                        minWidth: { xs: "100%", sm: 260 },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "9px",
                            fontSize: "13px",
                            bgcolor: C.surface,
                            "& fieldset": { borderColor: C.inputBorder },
                        },
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlinedIcon sx={{ fontSize: "18px", color: C.textFaint }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <Select
                    size="small"
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value);
                        setPage(1);
                    }}
                    sx={selectSx}
                >
                    {PARENT_STATUS_FILTERS.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: "13px" }}>
                            {option === "All" ? "All statuses" : option}
                        </MenuItem>
                    ))}
                </Select>

                <Select
                    size="small"
                    displayEmpty
                    value={priority}
                    onChange={(event) => {
                        setPriority(event.target.value);
                        setPage(1);
                    }}
                    sx={selectSx}
                >
                    <MenuItem value="" sx={{ fontSize: "13px" }}>
                        All priorities
                    </MenuItem>
                    {PARENT_PRIORITY_FILTERS.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: "13px" }}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>

                <Select
                    size="small"
                    displayEmpty
                    value={categoryId}
                    onChange={(event) => {
                        setCategoryId(event.target.value);
                        setPage(1);
                    }}
                    sx={selectSx}
                >
                    <MenuItem value="" sx={{ fontSize: "13px" }}>
                        All categories
                    </MenuItem>
                    {categories.map((category) => (
                        <MenuItem
                            key={category.categoryId}
                            value={category.categoryId}
                            sx={{ fontSize: "13px" }}
                        >
                            {category.name}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2, fontSize: "13px", borderRadius: "9px" }}>
                    {error}
                </Alert>
            )}

            <Box sx={cardSx}>
                {loading && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 3 }}>
                        <CircularProgress size={18} sx={{ color: C.textMuted }} />
                        <Typography sx={{ fontSize: "13px", color: C.textMuted }}>
                            Loading complaints…
                        </Typography>
                    </Box>
                )}

                {!loading && rows.length === 0 && !error && (
                    <Typography sx={{ fontSize: "13px", color: C.textMuted, py: 3 }}>
                        No complaints match these filters.
                    </Typography>
                )}

                {!loading &&
                    rows.map((row) => {
                        const statusTone = PARENT_STATUS_TONES[row.displayStatus] || {
                            fg: C.textMuted,
                            bg: C.track,
                        };
                        const priorityTone = PARENT_PRIORITY_TONES[row.priority];
                        const actions = availableActions(row);
                        return (
                            <Box
                                key={row.token}
                                sx={{
                                    py: 2,
                                    borderBottom: `1px solid ${C.divider}`,
                                    "&:last-of-type": { borderBottom: "none" },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography
                                            sx={{ fontSize: "14px", fontWeight: 600, color: C.text }}
                                        >
                                            {row.title || "Untitled complaint"}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px", color: C.textFaint, mt: 0.25 }}>
                                            {row.token}
                                            {row.category ? ` · ${row.category}` : ""} · Raised{" "}
                                            {formatOn(row.raisedOn)}
                                            {/* No owner comes back until someone is assigned,
                                                so say so rather than leaving a gap. */}
                                            {` · ${row.owner ? `With ${row.owner}` : "Unassigned"}`}
                                        </Typography>
                                        {row.slaState && (
                                            <Typography
                                                sx={{
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    mt: 0.75,
                                                    color: SLA_STATE_TONES[row.slaState] || C.textMuted,
                                                }}
                                            >
                                                {row.slaState}
                                                {row.dueOn ? ` · due ${formatOn(row.dueOn)}` : ""}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 1,
                                            alignItems: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {priorityTone && (
                                            <Chip
                                                label={row.priority}
                                                size="small"
                                                sx={chipSx(priorityTone)}
                                            />
                                        )}
                                        {row.isConfidential && (
                                            <Chip
                                                label="Confidential"
                                                size="small"
                                                sx={chipSx({ fg: C.textMuted, bg: C.track })}
                                            />
                                        )}
                                        <Chip
                                            label={row.displayStatus || "—"}
                                            size="small"
                                            sx={chipSx(statusTone)}
                                        />
                                    </Box>
                                </Box>

                                {actions.length > 0 && (
                                    <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                                        {actions.map((kind) => (
                                            <Button
                                                key={kind}
                                                size="small"
                                                onClick={() => openAction(kind, row)}
                                                sx={{
                                                    textTransform: "none",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    color: C.text,
                                                    border: `1px solid ${C.inputBorder}`,
                                                    borderRadius: "9px",
                                                    px: 1.5,
                                                    "&:hover": { bgcolor: C.fieldBg },
                                                }}
                                            >
                                                {ACTION_LABELS[kind]}
                                            </Button>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
            </Box>

            {pageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        size="small"
                    />
                </Box>
            )}

            <ParentActionDialog
                open={dialog.open}
                kind={dialog.kind}
                complaint={dialog.complaint}
                onClose={closeAction}
                onDone={handleDone}
            />

            <Snackbar
                open={Boolean(toast)}
                autoHideDuration={4000}
                onClose={() => setToast("")}
                message={toast}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </Box>
    );
}
