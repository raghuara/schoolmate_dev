import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Typography, TextField, Button, InputAdornment, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Pagination, Tooltip,
} from "@mui/material";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DASH, RADIUS } from "../../DashBoardComps/dashboardTheme";
import { FetchExitHistory, FetchAllLinkedRecords } from "../../../Api/Api";

const TOKEN = "123";
const ROWS_PER_PAGE = 6;

const ACTION_TONE = {
    TC: { color: DASH.blue, bg: DASH.blueLight, border: "#BFDBFE", label: "TC ISSUED" },
    Discontinue: { color: DASH.red, bg: DASH.redLight, border: `${DASH.red}4D`, label: "DISCONTINUED" },
};

const exitIdOf = (row) =>
    row?.studentExitId ?? row?.StudentExitId ?? row?.exitId ?? row?.id ?? null;

const gradeOf = (row) => row?.gradeName ?? row?.grade ?? row?.oldGrade ?? "";
const sectionOf = (row) => row?.sectionName ?? row?.section ?? row?.oldSection ?? "";

const HeadCell = ({ children, align = "left" }) => (
    <TableCell
        align={align}
        sx={{
            bgcolor: DASH.surface,
            borderBottom: `1px solid ${DASH.line}`,
            fontSize: "10.5px",
            fontWeight: 700,
            color: DASH.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            py: 1.2,
            whiteSpace: "nowrap",
        }}
    >
        {children}
    </TableCell>
);

const BodyCell = ({ children, align = "left", sx = {} }) => (
    <TableCell
        align={align}
        sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1.2, fontSize: "12.5px", color: DASH.text, ...sx }}
    >
        {children}
    </TableCell>
);

const ResultsSkeleton = () => (
    <TableBody>
        {[...Array(5)].map((_, r) => (
            <TableRow key={r}>
                {[...Array(6)].map((_, c) => (
                    <TableCell key={c} sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1.4 }}>
                        <Skeleton
                            variant="rounded"
                            height={11}
                            width={c === 0 ? "78%" : "54%"}
                            sx={{ bgcolor: DASH.lineSoft }}
                        />
                    </TableCell>
                ))}
            </TableRow>
        ))}
    </TableBody>
);

export default function ExistingStudentVerification({
    accent = "#E30053",
    selectedRecord = null,
    onSelectRecord,
    onClearRecord,
}) {
    const [rows, setRows] = useState([]);
    const [linkedByExitId, setLinkedByExitId] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [historyRes, linkedRes] = await Promise.all([
                axios.get(FetchExitHistory, { headers: { Authorization: `Bearer ${TOKEN}` } }),
                axios.get(FetchAllLinkedRecords, { headers: { Authorization: `Bearer ${TOKEN}` } }),
            ]);

            const historyBody = historyRes?.data || {};
            if (historyBody.error) {
                setRows([]);
                setError(historyBody.message || "Could not load archived student records.");
            } else {
                setRows(historyBody.history || []);
            }

            const linkedBody = linkedRes?.data || {};
            const map = {};
            (linkedBody.records || []).forEach((rec) => {
                if (rec.studentExitId != null) map[rec.studentExitId] = rec;
            });
            setLinkedByExitId(map);
        } catch (err) {
            setRows([]);
            setError(err?.response?.data?.message || "Could not load archived student records.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) =>
            (r.name || "").toLowerCase().includes(q)
            || String(r.rollNumber || "").toLowerCase().includes(q)
            || String(gradeOf(r)).toLowerCase().includes(q)
            || (r.reason || "").toLowerCase().includes(q)
        );
    }, [rows, search]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const pageRows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

    return (
        <Box sx={{ px: 2, pt: 2 }}>
            {selectedRecord ? (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 2,
                        borderRadius: "10px",
                        bgcolor: DASH.greenLight,
                        border: `1px solid ${DASH.green}4D`,
                        borderLeft: `3px solid ${DASH.green}`,
                        flexWrap: "wrap",
                    }}
                >
                    <CheckCircleOutlineIcon sx={{ fontSize: 20, color: DASH.green, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                            {selectedRecord.name} · #{selectedRecord.rollNumber}
                        </Typography>
                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                            Selected to link. Save Student Academic Info below and the new roll number will be bound to
                            this record automatically.
                        </Typography>
                    </Box>
                    <Button
                        onClick={onClearRecord}
                        startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: "none",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            height: 34,
                            px: 1.8,
                            borderRadius: RADIUS,
                            color: DASH.text,
                            bgcolor: "#fff",
                            border: `1px solid ${DASH.line}`,
                            flexShrink: 0,
                            "& .MuiButton-startIcon": { mr: 0.6 },
                            "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                        }}
                    >
                        Change
                    </Button>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        p: 1.4,
                        borderRadius: RADIUS,
                        bgcolor: DASH.blueLight,
                        border: "1px solid #BFDBFE",
                    }}
                >
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: DASH.blue, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "12.5px", color: DASH.text, fontWeight: 600 }}>
                        Pick the student's earlier enrolment below. Their old roll number is bound to the new one on
                        save, so past fees and history stay attached.
                    </Typography>
                </Box>
            )}

            <Box
                sx={{
                    mt: 2,
                    border: `1px solid ${DASH.line}`,
                    borderRadius: "10px",
                    bgcolor: "#fff",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        px: 2,
                        py: 1.5,
                        borderBottom: `1px solid ${DASH.line}`,
                        bgcolor: DASH.surface,
                        flexWrap: "wrap",
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                            Archived student records
                        </Typography>
                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                            {loading
                                ? "Loading…"
                                : `${filtered.length} record${filtered.length === 1 ? "" : "s"} who left the school`}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <TextField
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, roll number or class"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        height: 34,
                                        fontSize: "12.5px",
                                        borderRadius: RADIUS,
                                        bgcolor: "#fff",
                                        width: { xs: "100%", sm: 280 },
                                        "& fieldset": { borderColor: DASH.line },
                                        "&:hover fieldset": { borderColor: DASH.faint },
                                    },
                                },
                            }}
                        />
                        <Tooltip title="Reload records" arrow>
                            <Button
                                onClick={load}
                                sx={{
                                    minWidth: 0,
                                    width: 34,
                                    height: 34,
                                    borderRadius: RADIUS,
                                    bgcolor: "#fff",
                                    border: `1px solid ${DASH.line}`,
                                    "&:hover": { bgcolor: DASH.lineSoft },
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 17, color: DASH.muted }} />
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>

                <TableContainer sx={{ maxHeight: 420 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <HeadCell>Student</HeadCell>
                                <HeadCell>Left From</HeadCell>
                                <HeadCell>Academic Year</HeadCell>
                                <HeadCell>Exit Date</HeadCell>
                                <HeadCell>Status</HeadCell>
                                <HeadCell align="right">Action</HeadCell>
                            </TableRow>
                        </TableHead>

                        {loading ? (
                            <ResultsSkeleton />
                        ) : (
                            <TableBody>
                                {pageRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: "none" }}>
                                            <Box
                                                sx={{
                                                    width: 46,
                                                    height: 46,
                                                    mx: "auto",
                                                    mb: 1.6,
                                                    borderRadius: RADIUS,
                                                    bgcolor: DASH.lineSoft,
                                                    border: `1px solid ${DASH.line}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <PersonSearchOutlinedIcon sx={{ fontSize: 22, color: DASH.faint }} />
                                            </Box>
                                            <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                                                {error ? "Records unavailable" : "No archived records found"}
                                            </Typography>
                                            <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.5 }}>
                                                {error
                                                    || (search
                                                        ? `Nothing matches “${search}” — try a roll number instead.`
                                                        : "Nobody has left the school yet, so there is nothing to link.")}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pageRows.map((row, idx) => {
                                        const exitId = exitIdOf(row);
                                        const tone = ACTION_TONE[row.action] || {
                                            color: DASH.muted,
                                            bg: DASH.lineSoft,
                                            border: DASH.line,
                                            label: String(row.action || "EXITED").toUpperCase(),
                                        };
                                        const alreadyLinked = exitId != null ? linkedByExitId[exitId] : null;
                                        const isSelected =
                                            selectedRecord && exitIdOf(selectedRecord) === exitId && exitId != null;

                                        return (
                                            <TableRow
                                                key={`${row.rollNumber}-${exitId ?? idx}`}
                                                sx={{
                                                    bgcolor: isSelected ? DASH.greenLight : "transparent",
                                                    "&:hover": { bgcolor: isSelected ? DASH.greenLight : DASH.surface },
                                                }}
                                            >
                                                <BodyCell>
                                                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: DASH.ink }}>
                                                        {row.name || "—"}
                                                    </Typography>
                                                    <Typography
                                                        sx={{ fontSize: "11.5px", color: DASH.muted, fontFamily: "monospace" }}
                                                    >
                                                        #{row.rollNumber}
                                                    </Typography>
                                                </BodyCell>

                                                <BodyCell>
                                                    {gradeOf(row)
                                                        ? `${gradeOf(row)}${sectionOf(row) ? ` · ${sectionOf(row)}` : ""}`
                                                        : "—"}
                                                </BodyCell>

                                                <BodyCell sx={{ whiteSpace: "nowrap" }}>{row.academicYear || "—"}</BodyCell>

                                                <BodyCell sx={{ whiteSpace: "nowrap" }}>{row.exitDate || "—"}</BodyCell>

                                                <BodyCell>
                                                    <Box
                                                        sx={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            px: 1.1,
                                                            height: 21,
                                                            borderRadius: "999px",
                                                            bgcolor: tone.bg,
                                                            color: tone.color,
                                                            border: `1px solid ${tone.border}`,
                                                            fontSize: "10px",
                                                            fontWeight: 700,
                                                            letterSpacing: "0.04em",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {tone.label}
                                                    </Box>
                                                    {row.reason && (
                                                        <Typography sx={{ fontSize: "10.5px", color: DASH.faint, mt: 0.3 }}>
                                                            {row.reason}
                                                        </Typography>
                                                    )}
                                                </BodyCell>

                                                <BodyCell align="right">
                                                    {exitId == null ? (
                                                        <Tooltip
                                                            arrow
                                                            title="This record has no exit id, so it cannot be linked. Contact support."
                                                        >
                                                            <Typography sx={{ fontSize: "11.5px", color: DASH.faint, fontWeight: 600 }}>
                                                                Not linkable
                                                            </Typography>
                                                        </Tooltip>
                                                    ) : alreadyLinked ? (
                                                        <Tooltip
                                                            arrow
                                                            title={`Already linked to ${alreadyLinked.newStudentName || "a student"} on ${alreadyLinked.linkedOn}`}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: 0.5,
                                                                    px: 1.1,
                                                                    height: 26,
                                                                    borderRadius: "999px",
                                                                    bgcolor: DASH.amberLight,
                                                                    border: "1px solid #FDE68A",
                                                                    color: DASH.amber,
                                                                    fontSize: "11px",
                                                                    fontWeight: 700,
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                <LinkOutlinedIcon sx={{ fontSize: 13 }} />
                                                                #{alreadyLinked.newRollNumber}
                                                            </Box>
                                                        </Tooltip>
                                                    ) : isSelected ? (
                                                        <Box
                                                            sx={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: 0.5,
                                                                px: 1.2,
                                                                height: 28,
                                                                borderRadius: "999px",
                                                                bgcolor: DASH.green,
                                                                color: "#fff",
                                                                fontSize: "11.5px",
                                                                fontWeight: 700,
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                                                            Selected
                                                        </Box>
                                                    ) : (
                                                        <Button
                                                            size="small"
                                                            onClick={() => onSelectRecord && onSelectRecord({ ...row, studentExitId: exitId })}
                                                            sx={{
                                                                textTransform: "none",
                                                                fontSize: "11.5px",
                                                                fontWeight: 700,
                                                                height: 28,
                                                                px: 1.5,
                                                                borderRadius: "999px",
                                                                color: "#fff",
                                                                bgcolor: accent,
                                                                whiteSpace: "nowrap",
                                                                boxShadow: "none",
                                                                "&:hover": { bgcolor: accent, filter: "brightness(0.92)" },
                                                            }}
                                                        >
                                                            Link this record
                                                        </Button>
                                                    )}
                                                </BodyCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        )}
                    </Table>
                </TableContainer>

                {!loading && filtered.length > ROWS_PER_PAGE && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 1,
                            px: 2,
                            py: 1.2,
                            borderTop: `1px solid ${DASH.lineSoft}`,
                        }}
                    >
                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                            Showing {(page - 1) * ROWS_PER_PAGE + 1}–
                            {Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
                        </Typography>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                            size="small"
                            shape="rounded"
                            sx={{ "& .Mui-selected": { bgcolor: `${accent} !important`, color: "#fff !important" } }}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
