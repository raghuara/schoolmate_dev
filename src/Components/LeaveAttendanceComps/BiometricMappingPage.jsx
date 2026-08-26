import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    MenuItem,
    Chip,
    Avatar,
    Checkbox,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SyncIcon from "@mui/icons-material/Sync";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import SnackBar from "../SnackBar";
import { initialsOf, inputSx, GREEN, RED, AMBER, BLUE } from "./LeaveAttendancePage";
import {
    fetchBiometricMappings,
    saveBiometricMappings,
    fetchSyncSummary,
    rebuildFromRecords,
    fetchBiometricLogs,
} from "./leaveAttendanceApi";

const PAGE_BG = "#F7F9F9";
const PURPLE = { main: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };

const ACADEMIC_YEARS = ["2026-2027", "2025-2026", "2024-2025"];

/* Avatar tint follows the first letter, so names group visually */
const LETTER_TONES = [
    { color: "#EA580C", bg: "#FFF1E7" },
    { color: "#2563EB", bg: "#EFF6FF" },
    { color: "#7C3AED", bg: "#F5F3FF" },
    { color: "#059669", bg: "#ECFDF5" },
    { color: "#DB2777", bg: "#FDF2F8" },
    { color: "#0891B2", bg: "#ECFEFF" },
];
const letterToneOf = (name) => {
    const code = String(name || "?").trim().toUpperCase().charCodeAt(0) || 65;
    return LETTER_TONES[(code - 65 + LETTER_TONES.length) % LETTER_TONES.length];
};

export default function BiometricMappingPage() {
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth);
    const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0]);
    const [search, setSearch] = useState("");
    // Rows come from GetBiometricMappings; edits are held against the roll number
    const [staff, setStaff] = useState([]);
    const [summary, setSummary] = useState(null);
    const [mapping, setMapping] = useState({});
    const [dirty, setDirty] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sync, setSync] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: "", ok: true });

    // ─── Device punch feed ───
    // "enrolment" is the mapping table; "logs" is the raw feed from the device
    const [view, setView] = useState("enrolment");
    const [logFrom, setLogFrom] = useState(() => new Date().toISOString().slice(0, 10));
    const [logTo, setLogTo] = useState(() => new Date().toISOString().slice(0, 10));
    const [logs, setLogs] = useState([]);
    const [logNote, setLogNote] = useState("");
    const [loadingLogs, setLoadingLogs] = useState(false);
    // The window the sync counts describe, refreshed alongside the feed
    const [logSync, setLogSync] = useState(null);

    const showSnack = (message, ok = true) => setSnack({ open: true, message, ok });

    const loadMappings = useCallback(async () => {
        setLoading(true);
        const result = await fetchBiometricMappings(academicYear);
        if (!result.ok) {
            showSnack(result.message, false);
        } else {
            setStaff(result.items);
            setSummary(result.summary);
            // Seed the editable map from whatever is already enrolled
            setMapping(
                result.items.reduce(
                    (acc, row) => (row.biometricId ? { ...acc, [row.rollNumber]: String(row.biometricId) } : acc),
                    {}
                )
            );
            setDirty([]);
        }
        setLoading(false);
    }, [academicYear]);

    useEffect(() => {
        loadMappings();
    }, [loadMappings]);

    // Defaults to today (IST) with no dates — drives the "synced" indicator
    useEffect(() => {
        fetchSyncSummary().then((result) => setSync(result.ok ? result : null));
    }, []);

    /* Reads the raw feed and the row counts for the same window side by side.
       This route is ISO-only and answers 404 on an empty window, which the api layer
       turns into an empty list plus the server's wording. */
    const loadLogs = useCallback(async () => {
        if (!logFrom || !logTo) return;
        setLoadingLogs(true);
        const [feed, counts] = await Promise.all([
            fetchBiometricLogs({ fromDate: logFrom, toDate: logTo }),
            fetchSyncSummary({ fromDate: logFrom, toDate: logTo }),
        ]);
        if (!feed.ok) {
            showSnack(feed.message, false);
            setLogs([]);
            setLogNote("");
        } else {
            setLogs(feed.logs);
            setLogNote(feed.logs.length ? "" : feed.message || "No punches in this window.");
        }
        setLogSync(counts.ok ? counts : null);
        setLoadingLogs(false);
    }, [logFrom, logTo]);

    useEffect(() => {
        if (view === "logs") loadLogs();
    }, [view, loadLogs]);

    const biometricOf = (rollNumber) => mapping[rollNumber] || "";

    const markDirty = (rollNumber) =>
        setDirty((prev) => (prev.includes(rollNumber) ? prev : [...prev, rollNumber]));

    const setBiometricId = (rollNumber, value) => {
        setMapping((prev) => ({ ...prev, [rollNumber]: value }));
        markDirty(rollNumber);
    };

    const unlink = (rollNumber) => {
        setMapping((prev) => {
            const updated = { ...prev };
            delete updated[rollNumber];
            return updated;
        });
        markDirty(rollNumber);
    };

    const saveMapping = async () => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        const edited = staff.filter((row) => dirty.includes(row.rollNumber));
        if (!edited.length) return;

        setSaving(true);
        // Rows that already had an id are a re-map (PUT); the rest are a fresh enrol (POST)
        const groups = [
            { isUpdate: false, items: edited.filter((row) => !row.biometricId) },
            { isUpdate: true, items: edited.filter((row) => row.biometricId) },
        ].filter((group) => group.items.length);

        const failures = [];
        for (const group of groups) {
            const result = await saveBiometricMappings({
                academicYear,
                rollNumber: authUser.rollNumber,
                isUpdate: group.isUpdate,
                items: group.items.map((row) => ({
                    rollNumber: row.rollNumber,
                    userType: row.userType,
                    biometricId: biometricOf(row.rollNumber),
                })),
            });
            if (!result.ok) failures.push(result.message);
            // Bulk calls report per item, so a partial failure is named row by row
            else if (result.failed?.length) {
                failures.push(
                    `${result.failed.length} row(s) rejected — ${result.failed[0].rollNumber || ""} ${
                        result.failed[0].message || ""
                    }`
                );
            }
        }

        showSnack(failures.length ? failures.join(" · ") : "Biometric mapping saved", !failures.length);
        setSaving(false);
        if (!failures.length) loadMappings();
    };

    const runRebuild = async () => {
        // Safe without a confirmation: hand-corrected values carry override flags and
        // are left alone by a rebuild
        const enrolled = staff.filter((row) => biometricOf(row.rollNumber));
        if (!enrolled.length) {
            showSnack("Nothing to rebuild — no staff are mapped to a device yet.", false);
            return;
        }
        const todayIso = new Date().toISOString().slice(0, 10);
        const result = await rebuildFromRecords(
            enrolled.map((row) => ({ employeeId: biometricOf(row.rollNumber), date: todayIso }))
        );
        showSnack(result.message, result.ok);
    };

    const term = search.trim().toLowerCase();
    // Alphabetical, the way an enrolment list is usually worked through
    const rows = [...staff]
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter((row) => {
            if (!term) return true;
            return (
                row.name.toLowerCase().includes(term) ||
                String(row.rollNumber).toLowerCase().includes(term) ||
                String(row.userType || "").toLowerCase().includes(term) ||
                biometricOf(row.rollNumber).toLowerCase().includes(term)
            );
        });

    // The server sends these totals; fall back to counting only before the first load
    const mappedCount = summary?.mapped ?? staff.filter((row) => biometricOf(row.rollNumber)).length;
    const totalStaff = summary?.totalStaff ?? staff.length;
    const unmappedCount = summary?.unmapped ?? totalStaff - mappedCount;
    const mappedPercent = totalStaff ? Math.round((mappedCount / totalStaff) * 100) : 0;

    const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.rollNumber));
    const toggleAll = () => setSelected(allSelected ? [] : rows.map((row) => row.rollNumber));
    const toggleOne = (staffId) =>
        setSelected((prev) => (prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]));

    const kpis = [
        {
            label: "TOTAL STAFF",
            value: totalStaff,
            caption: "on payroll",
            icon: PeopleAltOutlinedIcon,
            tone: GREEN,
            filledIcon: false,
        },
        {
            label: "MAPPED",
            value: mappedCount,
            caption: `${mappedPercent}% of staff`,
            icon: CheckIcon,
            tone: BLUE,
            filledIcon: true,
        },
        {
            label: "UNMAPPED",
            value: unmappedCount,
            caption: "awaiting biometric ID",
            icon: LinkOffIcon,
            tone: AMBER,
            filledIcon: false,
        },
        {
            label: "PENDING CHANGES",
            value: dirty.length,
            caption: dirty.length ? "not saved yet" : "all saved",
            icon: EditNoteIcon,
            tone: PURPLE,
            filledIcon: false,
        },
    ];

    return (
        <Box
            sx={{
                height: "calc(100vh - 76px)",
                display: "flex",
                flexDirection: "column",
                bgcolor: PAGE_BG,
                overflow: "hidden",
            }}
        >
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, pb: 3.5 }}>
                {/* ─── Header ─── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                        p: 1.8,
                        mb: 2,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{ width: 40, height: 40, border: "1px solid #E5E7EB", borderRadius: "10px" }}
                        >
                            <ArrowBackIcon sx={{ fontSize: "19px", color: "#111827" }} />
                        </IconButton>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: "10px",
                                bgcolor: GREEN.bg,
                                border: `1px solid ${GREEN.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <FingerprintIcon sx={{ fontSize: "22px", color: GREEN.main }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "20px", fontWeight: "700", color: "#111827", lineHeight: 1.25 }}>
                                Biometric Device Mapping
                            </Typography>
                            <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                                Link each staff member to their biometric device employee ID
                            </Typography>
                        </Box>
                    </Box>

                    {/* Confirms device data reached the cloud — defaults to today */}
                    {sync && (
                        <Chip
                            icon={
                                <CheckCircleIcon
                                    sx={{
                                        fontSize: "15px !important",
                                        color: `${sync.cloudLogsCount ? GREEN.main : "#9CA3AF"} !important`,
                                    }}
                                />
                            }
                            label={
                                sync.cloudLogsCount
                                    ? `Synced · ${sync.cloudLogsCount} punches from ${sync.uniqueEmployees} staff today`
                                    : "No device punches today"
                            }
                            sx={{
                                height: 34,
                                bgcolor: sync.cloudLogsCount ? GREEN.bg : "#F3F4F6",
                                color: sync.cloudLogsCount ? GREEN.dark : "#6B7280",
                                border: `1px solid ${sync.cloudLogsCount ? GREEN.border : "#E5E7EB"}`,
                                fontWeight: "700",
                                fontSize: "12.5px",
                            }}
                        />
                    )}

                    {/* Safe without a confirmation — hand-corrected values are preserved */}
                    <Button
                        startIcon={<SyncIcon />}
                        onClick={runRebuild}
                        sx={{
                            textTransform: "none",
                            borderRadius: "10px",
                            border: "1px solid #E5E7EB",
                            color: "#374151",
                            fontSize: "13.5px",
                            fontWeight: "700",
                            px: 2.2,
                            py: 1,
                        }}
                    >
                        Rebuild
                    </Button>

                    <TextField
                        select
                        size="small"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        sx={{
                            minWidth: "270px",
                            "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "14px", fontWeight: 700 },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarMonthOutlinedIcon sx={{ fontSize: "19px", color: GREEN.main, mr: 0.8 }} />
                                        <Typography
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                color: "#6B7280",
                                                letterSpacing: "0.5px",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            ACADEMIC YEAR
                                        </Typography>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    >
                        {ACADEMIC_YEARS.map((year) => (
                            <MenuItem key={year} value={year} sx={{ fontSize: "13.5px" }}>
                                {year}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {/* ─── View switcher ─── */}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    {[
                        { key: "enrolment", label: "Enrolment", icon: FingerprintIcon },
                        { key: "logs", label: "Device Punch Logs", icon: ReceiptLongOutlinedIcon },
                    ].map((item) => {
                        const ViewIcon = item.icon;
                        const active = view === item.key;
                        return (
                            <Box
                                key={item.key}
                                onClick={() => setView(item.key)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.9,
                                    px: 2.2,
                                    py: 1.1,
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    color: active ? "#fff" : "#374151",
                                    bgcolor: active ? GREEN.dark : "#fff",
                                    border: `1px solid ${active ? GREEN.dark : "#E5E7EB"}`,
                                    transition: "0.2s",
                                    "&:hover": { borderColor: GREEN.main },
                                }}
                            >
                                <ViewIcon sx={{ fontSize: "18px" }} />
                                {item.label}
                            </Box>
                        );
                    })}
                </Box>

                {/* ─── Totals ─── */}
                {view === "enrolment" && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {kpis.map((kpi) => {
                        const KpiIcon = kpi.icon;
                        return (
                            <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        p: 2,
                                        height: "100%",
                                        boxSizing: "border-box",
                                        borderRadius: "12px",
                                        bgcolor: kpi.tone.bg,
                                        border: `1px solid ${kpi.tone.border}`,
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                color: kpi.tone.main,
                                                letterSpacing: "0.6px",
                                            }}
                                        >
                                            {kpi.label}
                                        </Typography>
                                        <Typography
                                            sx={{ fontSize: "32px", fontWeight: "700", color: "#111827", lineHeight: 1.35 }}
                                        >
                                            {kpi.value}
                                        </Typography>
                                        <Typography sx={{ fontSize: "12px", fontWeight: "600", color: kpi.tone.main }}>
                                            {kpi.caption}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: kpi.filledIcon ? "50%" : "9px",
                                            bgcolor: kpi.filledIcon ? kpi.tone.main : "#fff",
                                            border: kpi.filledIcon ? "none" : `1px solid ${kpi.tone.border}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <KpiIcon
                                            sx={{ fontSize: "21px", color: kpi.filledIcon ? "#fff" : kpi.tone.main }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
                )}

                {/* ─── Search ─── */}
                {view === "enrolment" && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                        p: 1.5,
                        mb: 2,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search by name, roll no, designation or biometric ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            minWidth: "380px",
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "50px",
                                fontSize: "13.5px",
                                bgcolor: "#F9FAFB",
                                "& fieldset": { border: "1px solid #E5E7EB" },
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Box sx={{ flex: 1 }} />

                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                        Showing{" "}
                        <Box component="span" sx={{ fontWeight: 700, color: "#374151" }}>
                            {rows.length}
                        </Box>{" "}
                        of {totalStaff}
                    </Typography>
                </Box>
                )}

                {/* ─── Mapping table ─── */}
                {view === "enrolment" && (
                <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                    {selected.length > 0 && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1.5,
                                flexWrap: "wrap",
                                px: 2,
                                py: 1.2,
                                bgcolor: BLUE.bg,
                                borderBottom: `1px solid ${BLUE.border}`,
                            }}
                        >
                            <Typography sx={{ fontSize: "13px", fontWeight: "700", color: BLUE.main }}>
                                {selected.length} selected
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<LinkOffIcon />}
                                onClick={() => {
                                    selected.forEach((id) => unlink(id));
                                    setSelected([]);
                                }}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    border: `1px solid ${RED.border}`,
                                    bgcolor: RED.bg,
                                    color: RED.main,
                                    fontSize: "12.5px",
                                    fontWeight: "700",
                                    px: 1.8,
                                }}
                            >
                                Unlink selected
                            </Button>
                        </Box>
                    )}

                    <TableContainer sx={{ maxHeight: "52vh" }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        padding="checkbox"
                                        sx={{ bgcolor: GREEN.bg, borderBottom: `1px solid ${GREEN.border}` }}
                                    >
                                        <Checkbox
                                            size="small"
                                            checked={allSelected}
                                            indeterminate={selected.length > 0 && !allSelected}
                                            onChange={toggleAll}
                                            sx={{ "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: GREEN.main } }}
                                        />
                                    </TableCell>
                                    {["#", "STAFF MEMBER", "DESIGNATION", "BIOMETRIC EMPLOYEE ID", "STATUS", "ACTIONS"].map(
                                        (head) => (
                                            <TableCell
                                                key={head}
                                                sx={{
                                                    fontSize: "11.5px",
                                                    fontWeight: "700",
                                                    color: "#374151",
                                                    letterSpacing: "0.5px",
                                                    bgcolor: GREEN.bg,
                                                    borderBottom: `1px solid ${GREEN.border}`,
                                                    py: 1.8,
                                                }}
                                            >
                                                {head}
                                            </TableCell>
                                        )
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, index) => {
                                    const tone = letterToneOf(row.name);
                                    const value = biometricOf(row.rollNumber);
                                    const mapped = Boolean(value);
                                    return (
                                        <TableRow key={row.rollNumber} hover>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    size="small"
                                                    checked={selected.includes(row.rollNumber)}
                                                    onChange={() => toggleOne(row.rollNumber)}
                                                    sx={{ "&.Mui-checked": { color: GREEN.main } }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13px", color: "#9CA3AF", py: 1.5 }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 38,
                                                            height: 38,
                                                            bgcolor: tone.bg,
                                                            color: tone.color,
                                                            fontSize: "12.5px",
                                                            fontWeight: "700",
                                                        }}
                                                    >
                                                        {initialsOf(row.name)}
                                                    </Avatar>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            sx={{ fontSize: "14.5px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}
                                                        >
                                                            {row.name}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>
                                                            {row.rollNumber}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                                                {row.userType || "—"}
                                            </TableCell>
                                            <TableCell sx={{ width: "300px" }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Enter biometric ID"
                                                    value={value}
                                                    onChange={(e) => setBiometricId(row.rollNumber, e.target.value)}
                                                    sx={{
                                                        ...inputSx,
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: "8px",
                                                            fontSize: "13.5px",
                                                            bgcolor: mapped ? GREEN.bg : "#fff",
                                                            "& fieldset": {
                                                                borderColor: mapped ? GREEN.border : "#E5E7EB",
                                                            },
                                                        },
                                                    }}
                                                    slotProps={{
                                                        input: {
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <FingerprintIcon
                                                                        sx={{
                                                                            fontSize: "18px",
                                                                            color: mapped ? GREEN.main : "#9CA3AF",
                                                                        }}
                                                                    />
                                                                </InputAdornment>
                                                            ),
                                                        },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={
                                                        mapped ? (
                                                            <CheckCircleIcon
                                                                sx={{ fontSize: "14px !important", color: `${GREEN.main} !important` }}
                                                            />
                                                        ) : undefined
                                                    }
                                                    label={mapped ? "Mapped" : "Unmapped"}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: mapped ? GREEN.bg : AMBER.bg,
                                                        color: mapped ? GREEN.main : AMBER.main,
                                                        border: `1px solid ${mapped ? GREEN.border : AMBER.border}`,
                                                        fontWeight: "700",
                                                        fontSize: "11.5px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" disabled={!mapped} onClick={() => unlink(row.rollNumber)}>
                                                    <CloseIcon
                                                        sx={{ fontSize: "19px", color: mapped ? RED.main : "#E5E7EB" }}
                                                    />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {rows.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: "13px" }}
                                        >
                                            {loading ? "Loading staff…" : "No staff match your search"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Save bar appears only when something is edited */}
                    {dirty.length > 0 && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1.5,
                                flexWrap: "wrap",
                                px: 2,
                                py: 1.5,
                                borderTop: "1px solid #E5E7EB",
                            }}
                        >
                            <Typography sx={{ fontSize: "12.5px", color: PURPLE.main, fontWeight: 700 }}>
                                {dirty.length} unsaved change{dirty.length > 1 ? "s" : ""}
                            </Typography>
                            <Button
                                variant="contained"
                                disabled={saving}
                                startIcon={<SaveOutlinedIcon />}
                                onClick={saveMapping}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    px: 3,
                                    bgcolor: GREEN.dark,
                                    "&:hover": { bgcolor: "#065F46" },
                                }}
                            >
                                {saving ? "Saving…" : "Save Mapping"}
                            </Button>
                        </Box>
                    )}
                </Box>
                )}

                {/* ─── Device punch logs ─── */}
                {view === "logs" && (
                    <>
                        {/* Window + row counts for the same window */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                flexWrap: "wrap",
                                p: 1.5,
                                mb: 2,
                                bgcolor: "#fff",
                                border: "1px solid #E5E7EB",
                                borderRadius: "12px",
                            }}
                        >
                            <CalendarMonthOutlinedIcon sx={{ fontSize: "20px", color: GREEN.main }} />
                            <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}>
                                Punch window
                            </Typography>
                            <TextField
                                label="From"
                                size="small"
                                type="date"
                                value={logFrom}
                                onChange={(e) => setLogFrom(e.target.value)}
                                sx={{ ...inputSx, width: "185px" }}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <TextField
                                label="To"
                                size="small"
                                type="date"
                                value={logTo}
                                onChange={(e) => setLogTo(e.target.value)}
                                sx={{ ...inputSx, width: "185px" }}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <Button
                                onClick={loadLogs}
                                disabled={loadingLogs}
                                startIcon={<SyncIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    border: "1px solid #E5E7EB",
                                    color: "#374151",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    px: 2,
                                }}
                            >
                                {loadingLogs ? "Loading…" : "Refresh"}
                            </Button>

                            <Box sx={{ flex: 1 }} />

                            <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                                Showing{" "}
                                <Box component="span" sx={{ fontWeight: 700, color: "#374151" }}>
                                    {logs.length}
                                </Box>{" "}
                                punches
                            </Typography>
                        </Box>

                        {/* What actually reached the cloud for this window */}
                        {logSync && (
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                {[
                                    { label: "RAW PUNCHES", value: logSync.cloudLogsCount ?? 0, caption: "in staff_attendance_logs", icon: ReceiptLongOutlinedIcon, tone: GREEN },
                                    { label: "DAILY ROWS", value: logSync.cloudDailyCount ?? 0, caption: "built from those punches", icon: CheckCircleIcon, tone: BLUE },
                                    { label: "UNIQUE STAFF", value: logSync.uniqueEmployees ?? 0, caption: "seen by the device", icon: PeopleAltOutlinedIcon, tone: PURPLE },
                                ].map((card) => {
                                    const CardIcon = card.icon;
                                    return (
                                        <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    justifyContent: "space-between",
                                                    gap: 1,
                                                    p: 2,
                                                    height: "100%",
                                                    boxSizing: "border-box",
                                                    borderRadius: "12px",
                                                    bgcolor: card.tone.bg,
                                                    border: `1px solid ${card.tone.border}`,
                                                }}
                                            >
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: "11.5px", fontWeight: "700", color: card.tone.main, letterSpacing: "0.6px" }}>
                                                        {card.label}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "30px", fontWeight: "700", color: "#111827", lineHeight: 1.35 }}>
                                                        {card.value}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "12px", fontWeight: "700", color: card.tone.main }}>
                                                        {card.caption}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        width: 38,
                                                        height: 38,
                                                        borderRadius: "9px",
                                                        bgcolor: "#fff",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <CardIcon sx={{ fontSize: "21px", color: card.tone.main }} />
                                                </Box>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}

                        {/* The feed itself. This API only ever reads staff_attendance_logs —
                            punches are written by a separate push app. */}
                        <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                            <Box sx={{ px: 2.2, py: 1.8, borderBottom: "1px solid #E5E7EB" }}>
                                <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                                    Raw Device Punches
                                </Typography>
                                <Typography sx={{ fontSize: "12.5px", color: "#9CA3AF", mt: 0.3 }}>
                                    Read-only feed. Use Rebuild to turn these into daily attendance.
                                </Typography>
                            </Box>

                            <TableContainer sx={{ maxHeight: "56vh" }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {/* No DEVICE column: staff_attendance_logs carries no device identifier.
                                        Its only candidate, serialNo, is a per-punch record counter — showing
                                        it as a device would be inventing a fact, and it cannot tell two
                                        machines apart. DETAILS keeps the unmapped-field passthrough. */}
                                    {["S.NO", "EMPLOYEE ID", "ROLL NUMBER", "NAME", "PUNCH TIME", "DIRECTION", "DETAILS"].map((head) => (
                                                <TableCell
                                                    key={head}
                                                    sx={{
                                                        fontSize: "11.5px",
                                                        fontWeight: "700",
                                                        color: "#374151",
                                                        letterSpacing: "0.5px",
                                                        bgcolor: GREEN.bg,
                                                        borderBottom: `1px solid ${GREEN.border}`,
                                                        py: 1.8,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {head}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {logs.map((log, index) => {
                                            const dir = String(log.direction || "").toLowerCase();
                                            const isOut = dir.includes("out") || dir === "1";
                                            return (
                                                <TableRow key={`${log.id}-${index}`} hover>
                                                    <TableCell sx={{ fontSize: "13px", color: "#9CA3AF", py: 1.3 }}>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<FingerprintIcon sx={{ fontSize: "14px !important" }} />}
                                                            label={log.employeeId || "—"}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: BLUE.bg,
                                                                color: BLUE.main,
                                                                border: `1px solid ${BLUE.border}`,
                                                                fontWeight: "700",
                                                                fontSize: "11px",
                                                                "& .MuiChip-icon": { color: BLUE.main },
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>
                                                        {log.rollNumber || "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                            {log.name ? (
                                                                <>
                                                                    <Avatar
                                                                        sx={{
                                                                            width: 30,
                                                                            height: 30,
                                                                            fontSize: "11px",
                                                                            fontWeight: "700",
                                                                            bgcolor: letterToneOf(log.name).bg,
                                                                            color: letterToneOf(log.name).color,
                                                                        }}
                                                                    >
                                                                        {initialsOf(log.name)}
                                                                    </Avatar>
                                                                    <Box sx={{ minWidth: 0 }}>
                                                                        <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}>
                                                                            {log.name}
                                                                        </Typography>
                                                                        {log.userType && (
                                                                            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                                                                                {log.userType}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </>
                                                            ) : (
                                                                /* A punch from a device id nobody is enrolled against */
                                                                <Typography sx={{ fontSize: "12.5px", color: "#D1D5DB", fontStyle: "italic" }}>
                                                                    Unmapped device ID
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: "13px", fontWeight: "700", color: "#111827", whiteSpace: "nowrap" }}>
                                                        {log.punchTime || log.date || "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.direction ? (
                                                            <Chip
                                                                icon={
                                                                    isOut ? (
                                                                        <LogoutOutlinedIcon sx={{ fontSize: "14px !important" }} />
                                                                    ) : (
                                                                        <LoginOutlinedIcon sx={{ fontSize: "14px !important" }} />
                                                                    )
                                                                }
                                                                label={log.direction}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: isOut ? AMBER.bg : GREEN.bg,
                                                                    color: isOut ? AMBER.main : GREEN.main,
                                                                    border: `1px solid ${isOut ? AMBER.border : GREEN.border}`,
                                                                    fontWeight: "700",
                                                                    fontSize: "11px",
                                                                    "& .MuiChip-icon": { color: isOut ? AMBER.main : GREEN.main },
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography sx={{ fontSize: "12.5px", color: "#D1D5DB" }}>—</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                                            {log.device && (
                                                                <DevicesOtherOutlinedIcon sx={{ fontSize: "15px", color: "#9CA3AF" }} />
                                                            )}
                                                            <Typography sx={{ fontSize: "12.5px", color: log.device ? "#374151" : "#D1D5DB" }}>
                                                                {log.device || (log.serialNo ? `#${log.serialNo}` : "—")}
                                                            </Typography>
                                                        </Box>
                                                        {/* An unmapped device id — this punch belongs to nobody in
                                                            the system yet, which is what the Enrolment tab fixes. */}
                                                        {!log.rollNumber && (
                                                            <Typography sx={{ fontSize: "10.5px", fontWeight: "700", color: AMBER.main }}>
                                                                Unenrolled
                                                            </Typography>
                                                        )}
                                                        {/* Anything the mapper did not recognise is shown rather than dropped */}
                                                        {log.extra.map((item) => (
                                                            <Typography key={item.key} sx={{ fontSize: "10.5px", color: "#9CA3AF" }}>
                                                                {item.key}: {item.value}
                                                            </Typography>
                                                        ))}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {logs.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} sx={{ textAlign: "center", py: 6, color: "#9CA3AF", fontSize: "13px" }}>
                                                    {loadingLogs ? "Loading the punch feed…" : logNote}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </>
                )}

            </Box>

            <SnackBar
                open={snack.open}
                setOpen={(open) => setSnack((prev) => ({ ...prev, open }))}
                status={snack.ok}
                color={snack.ok}
                message={snack.message}
            />
        </Box>
    );
}
