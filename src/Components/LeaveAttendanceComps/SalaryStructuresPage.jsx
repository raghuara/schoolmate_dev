import React, { useCallback, useEffect, useState } from "react";
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
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { avatarToneOf, initialsOf, inputSx, GREEN, RED, BLUE } from "./LeaveAttendancePage";
import {
    rupees as rupeesOf,
    parseMoney,
    computeGross,
    fetchSalaryStructureDashboard,
    fetchEmployeesWithoutSalaryStructure,
    fetchEmployees,
    createSalaryStructure,
    updateSalaryStructure,
    deleteSalaryStructure,
} from "./payrollApi";

const PAGE_BG = "#F7F9F9";
const PURPLE = { main: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
const AMBER = { main: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };

/* ₹35,000. Re-exported from payrollApi so there is a single implementation — the old local
   copy used Number(), which read "₹1,000" as NaN → ₹0. BankDetailsPage, SalaryRegisterPage
   and ApprovePayrollPage still import it from here. */
export const rupees = rupeesOf;

const BLANK_STRUCTURE = {
    id: null,
    name: "",
    rollNo: "",
    subtitle: "Staff Member",
    basic: "",
    hraPercent: "",
    daPercent: "",
    conveyance: "",
    special: "",
    // paid every month by the engine; previously only reachable from Employee Compliance,
    // which left this screen's gross understated against what staff actually received
    incentive: "",
    addSalary: "",
    /* Free text on purpose — a rate ("12%") or an opt-out ("N/A"). Defaulted rather than
       left blank: a blank reads as "does not apply", so creating a structure without
       touching these would silently exempt that person from every statutory deduction. */
    pf: "12%",
    esi: "0.75%",
    pt: "200",
};

/* GET salaryStructureDashboard row → the shape the table and dialog already use. */
const rowFromApi = (item) => {
    const basic = item.basicSalary;
    return {
        // roll number is the only key in this API — there is no separate employee id
        id: item.rollNumber,
        staffId: item.rollNumber,
        rollNo: item.rollNumber,
        name: item.name,
        subtitle: [item.grade, item.section].filter(Boolean).join(" ").trim() || "Staff Member",
        basic,
        hraPercent: item.hra,
        daPercent: item.da,
        hra: Math.round((basic * item.hra) / 100),
        da: Math.round((basic * item.da) / 100),
        conveyance: parseMoney(item.conveyanceAllowance),
        special: parseMoney(item.specialAllowance),
        incentive: item.incentive,
        addSalary: item.addSalary,
        pf: item.pf,
        esi: item.esi,
        pt: item.pt,
        // server-computed; fall back only if this backend predates that change
        gross: item.grossSalary || computeGross({
            basicSalary: basic,
            hra: item.hra,
            da: item.da,
            conveyanceAllowance: item.conveyanceAllowance,
            specialAllowance: item.specialAllowance,
            incentive: item.incentive,
            addSalary: item.addSalary,
        }),
        /* false = the owner was deleted or converted to a student after this structure was
           created. Payroll will never pay them, but they still count toward the totals —
           which is why "Covered Staff" can read over 100%. */
        hasStaffRecord: item.hasStaffRecord,
    };
};

/**
 * Gross is always derived, never typed.
 *
 * This drives the live PREVIEW only. Since 19 Aug the server computes gross itself and
 * discards any TotalEarnings sent on the request, so after a save the stored grossSalary
 * from the response is what gets displayed. computeGross is shared with the API layer so
 * the preview cannot drift from the server's formula — and it now includes incentive and
 * additional salary, which the old version silently omitted.
 */
const withDerived = (draft) => {
    const basic = parseMoney(draft.basic);
    const hra = Math.round((basic * parseMoney(draft.hraPercent)) / 100);
    const da = Math.round((basic * parseMoney(draft.daPercent)) / 100);
    return {
        ...draft,
        basic,
        hra,
        da,
        conveyance: parseMoney(draft.conveyance),
        special: parseMoney(draft.special),
        incentive: parseMoney(draft.incentive),
        addSalary: parseMoney(draft.addSalary),
        gross: computeGross({
            basicSalary: draft.basic,
            hra: draft.hraPercent,
            da: draft.daPercent,
            conveyanceAllowance: draft.conveyance,
            specialAllowance: draft.special,
            incentive: draft.incentive,
            addSalary: draft.addSalary,
        }),
    };
};

export default function SalaryStructuresPage() {
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth);
    const [structures, setStructures] = useState([]);
    const [summary, setSummary] = useState(null);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: "", ok: true });

    /* Who can still be CREATED. Loaded lazily when the dialog opens, not on page load. */
    const [picker, setPicker] = useState(null);
    const [pickerFellBack, setPickerFellBack] = useState(false);

    const showSnack = (message, ok = true) => setSnack({ open: true, message, ok });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchSalaryStructureDashboard();
            setStructures(data.structures.map(rowFromApi));
            setSummary(data);
            setLoadError("");
        } catch (error) {
            setStructures([]);
            setSummary(null);
            setLoadError(error.message);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const term = search.trim().toLowerCase();
    const rows = structures.filter((row) =>
        !term ? true : row.name.toLowerCase().includes(term) || String(row.rollNo).includes(term)
    );

    /* Prefer the server's figures. They used to be summed client-side, which is correct at
       168 rows and silently wrong the day anyone paginates — so the local sum is only a
       fallback for a backend that predates them, and it says so on the card. */
    const localPayout = structures.reduce((sum, row) => sum + row.gross, 0);
    const localAvg = structures.length ? Math.round(localPayout / structures.length) : 0;
    const serverTotals = summary?.monthlyPayout !== null && summary?.monthlyPayout !== undefined;

    const totalStructures = summary?.totalStructures ?? structures.length;
    // headcount is the server's; 0 only while the first load is in flight
    const totalStaff = summary?.totalEmployees ?? 0;
    const coverage = totalStaff ? Math.round((totalStructures / totalStaff) * 100) : 0;

    /* Structures whose owner is no longer active non-student staff. Counted from the rows
       when the server does not send the tally. */
    const orphanCount =
        summary?.orphanedStructures ?? structures.filter((row) => !row.hasStaffRecord).length;

    const kpis = [
        {
            label: "TOTAL STRUCTURES",
            value: totalStructures,
            caption: `/ ${totalStaff} staff`,
            icon: AssignmentOutlinedIcon,
            tone: GREEN,
        },
        {
            label: "COVERED STAFF",
            value: `${coverage}%`,
            // stays an FE calculation by design: totalStructures / totalEmployees
            caption:
                coverage > 100
                    ? `${totalStructures} of ${totalStaff} — see stale structures`
                    : `${totalStructures} of ${totalStaff}`,
            icon: PeopleAltOutlinedIcon,
            tone: BLUE,
        },
        {
            label: "AVG. GROSS SALARY",
            value: rupees(summary?.averageGrossSalary ?? localAvg),
            caption: serverTotals ? "per structure" : "per structure · estimated",
            icon: TrendingUpIcon,
            tone: PURPLE,
        },
        {
            label: "MONTHLY PAYOUT",
            value: rupees(summary?.monthlyPayout ?? localPayout),
            caption: serverTotals ? "all structures" : "all structures · estimated",
            icon: CurrencyRupeeIcon,
            tone: AMBER,
        },
    ];

    /**
     * The CREATE picker must list only staff who can actually be created.
     *
     * getEmployees returns every non-student staff member including those who already have
     * a structure, and choosing one of those is rejected with "Salary structure already
     * exists for this RollNumber" — a dead end the user could have been steered around.
     *
     * That endpoint is not deployed yet, so this falls back to getEmployees and says so
     * rather than leaving Create broken.
     */
    const loadPicker = useCallback(async () => {
        try {
            setPicker(await fetchEmployeesWithoutSalaryStructure());
            setPickerFellBack(false);
        } catch (error) {
            try {
                const all = await fetchEmployees();
                const taken = new Set(structures.map((row) => String(row.rollNo)));
                setPicker({
                    totalEmployees: all.length,
                    completed: taken.size,
                    pending: all.length - taken.size,
                    // filter locally so the dead end is still avoided
                    employees: all.filter((person) => !taken.has(String(person.rollNumber))),
                });
                setPickerFellBack(true);
            } catch (fallbackError) {
                setPicker({ totalEmployees: 0, completed: 0, pending: 0, employees: [] });
                showSnack(fallbackError.message, false);
            }
        }
    }, [structures]);

    const openDialog = (row) => {
        setEditing(row ? { ...row } : { ...BLANK_STRUCTURE });
        if (!row) {
            setPicker(null);
            loadPicker();
        }
    };

    const saveStructure = async () => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        setSaving(true);
        const draft = withDerived(editing);
        const payload = {
            rollNumber: draft.rollNo,
            basicSalary: draft.basic,
            hra: draft.hraPercent,
            da: draft.daPercent,
            conveyanceAllowance: draft.conveyance,
            specialAllowance: draft.special,
            incentive: draft.incentive,
            addSalary: draft.addSalary,
            pf: draft.pf,
            esi: draft.esi,
            pt: draft.pt,
        };
        try {
            const saved = draft.id
                ? await updateSalaryStructure(payload)
                : await createSalaryStructure(payload);
            /* The server's gross is authoritative — the preview above is an estimate. Tell
               the user the stored figure rather than echoing back their own arithmetic. */
            const gross = saved?.grossSalary;
            showSnack(
                gross
                    ? `Saved. Gross salary stored as ${rupees(gross)}.`
                    : "Salary structure saved."
            );
            setEditing(null);
            await load();
        } catch (error) {
            showSnack(error.message, false);
        }
        setSaving(false);
    };

    const removeStructure = async (row) => {
        setSaving(true);
        try {
            await deleteSalaryStructure(row.rollNo);
            showSnack(`Salary structure removed for ${row.name}.`);
            await load();
        } catch (error) {
            showSnack(error.message, false);
        }
        setSaving(false);
    };

    const draftPreview = editing ? withDerived(editing) : null;

    /* Percentage pill with the rupee value underneath */
    const percentCell = (percent, amount, tone) => (
        <Box>
            <Chip
                label={`${percent}%`}
                size="small"
                sx={{
                    height: 22,
                    bgcolor: tone.bg,
                    color: tone.main,
                    border: `1px solid ${tone.border}`,
                    fontWeight: "700",
                    fontSize: "11.5px",
                }}
            />
            <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mt: 0.4 }}>{rupees(amount)}</Typography>
        </Box>
    );

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
            {/* ─── Header ─── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                    px: 2,
                    py: 1.5,
                    bgcolor: "#fff",
                    borderBottom: "1px solid #E5E7EB",
                    flexShrink: 0,
                }}
            >
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
                    <AssignmentOutlinedIcon sx={{ fontSize: "22px", color: GREEN.main }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                        Salary Structures
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
                        Configure earnings components and gross pay for each staff member
                    </Typography>
                </Box>

                <Box sx={{ flex: 1 }} />

                <TextField
                    size="small"
                    placeholder="Search by name or roll number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        minWidth: "300px",
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "50px",
                            fontSize: "13.5px",
                            bgcolor: "#F9FAFB",
                            "& fieldset": { borderColor: "#E5E7EB" },
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

                <Button
                    startIcon={<FileDownloadOutlinedIcon />}
                    sx={{
                        textTransform: "none",
                        borderRadius: "8px",
                        border: `1px solid ${GREEN.border}`,
                        color: GREEN.dark,
                        fontSize: "13.5px",
                        fontWeight: "700",
                        px: 2.5,
                        py: 1,
                        "&:hover": { bgcolor: GREEN.bg },
                    }}
                >
                    Export
                </Button>

                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => openDialog(null)}
                    sx={{
                        textTransform: "none",
                        borderRadius: "50px",
                        fontSize: "13.5px",
                        fontWeight: "700",
                        px: 3,
                        py: 1,
                        bgcolor: "#0B1220",
                        "&:hover": { bgcolor: "#1F2937" },
                    }}
                >
                    Create Structure
                </Button>
            </Box>

            {/* ─── Body ─── */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, pb: 3.5 }}>
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6, gap: 1.5 }}>
                        <CircularProgress size={22} sx={{ color: GREEN.main }} />
                        <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>Loading salary structures…</Typography>
                    </Box>
                )}

                {!loading && loadError && (
                    <Box
                        sx={{
                            mb: 2,
                            p: 1.8,
                            borderRadius: "10px",
                            bgcolor: "#FEF2F2",
                            border: "1px solid #FECACA",
                        }}
                    >
                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#991B1B" }}>
                            Could not load salary structures
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#B91C1C", mt: 0.4 }}>{loadError}</Typography>
                    </Box>
                )}

                {/* 168 structures against 165 staff is not duplicates — postSalaryStructure
                    rejects a second structure for the same roll number. These belong to people
                    deleted or converted to student after their structure was created. A
                    "102% covered" card nobody can explain is worse than rows visibly flagged. */}
                {!loading && orphanCount > 0 && (
                    <Box
                        sx={{
                            mb: 2,
                            p: 1.8,
                            borderRadius: "10px",
                            bgcolor: AMBER.bg,
                            border: `1px solid ${AMBER.border}`,
                        }}
                    >
                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#92400E" }}>
                            {orphanCount} stale {orphanCount === 1 ? "structure" : "structures"}
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#92400E", mt: 0.4 }}>
                            These belong to people who are no longer active staff. They still count toward
                            the totals — which is why Covered Staff can read above 100% — and payroll will
                            never pay them. They are marked <strong>Stale</strong> in the table below.
                        </Typography>
                    </Box>
                )}

                {/* Totals */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {kpis.map((kpi) => {
                        const KpiIcon = kpi.icon;
                        return (
                            <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3, lg: 3 }} sx={{ display: "flex" }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        width: "100%",
                                        p: 2,
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
                                            sx={{ fontSize: "30px", fontWeight: "700", color: "#111827", lineHeight: 1.35 }}
                                        >
                                            {kpi.value}
                                        </Typography>
                                        <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>{kpi.caption}</Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "10px",
                                            bgcolor: "#fff",
                                            border: `1px solid ${kpi.tone.border}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <KpiIcon sx={{ fontSize: "21px", color: kpi.tone.main }} />
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Structure table */}
                <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, px: 2.2, py: 1.8 }}>
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: "9px",
                                bgcolor: GREEN.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <AssignmentOutlinedIcon sx={{ fontSize: "19px", color: GREEN.main }} />
                        </Box>
                        <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                            All Salary Structures
                        </Typography>
                        <Chip
                            label={`${rows.length} records`}
                            size="small"
                            sx={{ bgcolor: "#F3F4F6", color: "#6B7280", fontWeight: "600", fontSize: "11.5px" }}
                        />
                    </Box>

                    <TableContainer sx={{ maxHeight: "52vh" }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {[
                                        "S.NO",
                                        "EMPLOYEE",
                                        "ROLL NO.",
                                        "BASIC",
                                        "HRA",
                                        "DA",
                                        "CONVEYANCE",
                                        "SPECIAL",
                                        "GROSS SALARY",
                                        "ACTIONS",
                                    ].map((head) => (
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
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, index) => {
                                    const tone = avatarToneOf(row.staffId);
                                    const stale = row.hasStaffRecord === false;
                                    return (
                                        <TableRow key={row.id} hover sx={stale ? { opacity: 0.55 } : undefined}>
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
                                                            fontSize: "13px",
                                                            fontWeight: "700",
                                                        }}
                                                    >
                                                        {initialsOf(row.name)}
                                                    </Avatar>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                                            <Typography
                                                                sx={{ fontSize: "14.5px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}
                                                            >
                                                                {row.name}
                                                            </Typography>
                                                            {stale && (
                                                                <Tooltip title="No active staff record for this roll number — payroll will never pay this structure">
                                                                    <Chip
                                                                        label="Stale"
                                                                        size="small"
                                                                        sx={{
                                                                            height: 19,
                                                                            bgcolor: AMBER.bg,
                                                                            color: "#92400E",
                                                                            border: `1px solid ${AMBER.border}`,
                                                                            fontWeight: "700",
                                                                            fontSize: "10.5px",
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                        <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                            {row.subtitle}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.rollNo}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#F3F4F6",
                                                        color: "#4B5563",
                                                        fontWeight: "600",
                                                        fontSize: "11.5px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                                                {rupees(row.basic)}
                                            </TableCell>
                                            <TableCell>{percentCell(row.hraPercent, row.hra, BLUE)}</TableCell>
                                            <TableCell>{percentCell(row.daPercent, row.da, GREEN)}</TableCell>
                                            <TableCell sx={{ fontSize: "13.5px", color: "#374151" }}>
                                                {rupees(row.conveyance)}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13.5px", color: "#374151" }}>
                                                {rupees(row.special)}
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "inline-block",
                                                        px: 1.6,
                                                        py: 0.7,
                                                        borderRadius: "8px",
                                                        bgcolor: GREEN.bg,
                                                        border: `1px solid ${GREEN.border}`,
                                                        color: GREEN.main,
                                                        fontSize: "14px",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {rupees(row.gross)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", gap: 0.8 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openDialog(row)}
                                                        sx={{
                                                            borderRadius: "8px",
                                                            bgcolor: BLUE.bg,
                                                            border: `1px solid ${BLUE.border}`,
                                                        }}
                                                    >
                                                        <EditOutlinedIcon sx={{ fontSize: "17px", color: BLUE.main }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        disabled={saving}
                                                        onClick={() => removeStructure(row)}
                                                        sx={{
                                                            borderRadius: "8px",
                                                            bgcolor: RED.bg,
                                                            border: `1px solid ${RED.border}`,
                                                        }}
                                                    >
                                                        <DeleteOutlineIcon sx={{ fontSize: "17px", color: RED.main }} />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {rows.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={10}
                                            sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: "13px" }}
                                        >
                                            {search.trim()
                                                ? "No salary structures match your search"
                                                : "No salary structures yet — these tables start empty, so every staff member needs one before the first payroll run"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>

            {/* ─── Create / edit structure ─── */}
            <Dialog
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
            >
                {editing && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                px: 2.5,
                                py: 2,
                                bgcolor: GREEN.bg,
                                borderBottom: `1px solid ${GREEN.border}`,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "9px",
                                    bgcolor: "#fff",
                                    border: `1px solid ${GREEN.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <AssignmentOutlinedIcon sx={{ color: GREEN.main, fontSize: "20px" }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                                    {editing.id ? "Edit Salary Structure" : "Create Salary Structure"}
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                                    Gross salary is calculated from the components below
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setEditing(null)}>
                                <CloseIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ p: 2.5 }}>
                            <Grid container spacing={2}>
                                {editing.id ? (
                                    /* Editing: the structure is KEYED on roll number, so it cannot be
                                       reassigned to someone else here. Delete and recreate instead. */
                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.4,
                                                p: 1.5,
                                                borderRadius: "10px",
                                                bgcolor: "#F9FAFB",
                                                border: "1px solid #E5E7EB",
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 38,
                                                    height: 38,
                                                    bgcolor: avatarToneOf(editing.rollNo).bg,
                                                    color: avatarToneOf(editing.rollNo).color,
                                                    fontSize: "13px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {initialsOf(editing.name)}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontSize: "14.5px", fontWeight: "700", color: "#111827" }}>
                                                    {editing.name}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                    {editing.rollNo} · {editing.subtitle}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ) : (
                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 0.7 }}>
                                            Employee
                                        </Typography>
                                        {picker === null ? (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 1 }}>
                                                <CircularProgress size={16} sx={{ color: GREEN.main }} />
                                                <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
                                                    Loading staff without a structure…
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size="small"
                                                    value={editing.rollNo}
                                                    onChange={(e) => {
                                                        const person = picker.employees.find(
                                                            (item) => item.rollNumber === e.target.value
                                                        );
                                                        setEditing((prev) => ({
                                                            ...prev,
                                                            rollNo: e.target.value,
                                                            name: person?.name || "",
                                                            subtitle: person?.department || "Staff Member",
                                                        }));
                                                    }}
                                                    disabled={!picker.employees.length}
                                                    sx={inputSx}
                                                    slotProps={{ select: { displayEmpty: true } }}
                                                >
                                                    <MenuItem value="" sx={{ fontSize: "13.5px", color: "#9CA3AF" }}>
                                                        {picker.employees.length
                                                            ? "Select an employee…"
                                                            : "No staff are awaiting a salary structure"}
                                                    </MenuItem>
                                                    {picker.employees.map((person) => (
                                                        <MenuItem
                                                            key={person.rollNumber}
                                                            value={person.rollNumber}
                                                            sx={{ fontSize: "13.5px" }}
                                                        >
                                                            {person.name} · {person.rollNumber}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                                {/* Only people who can actually be created appear, so
                                                    "Salary structure already exists for this RollNumber"
                                                    is unreachable through the UI. */}
                                                <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mt: 0.6 }}>
                                                    {picker.completed} of {picker.totalEmployees} set up ·{" "}
                                                    {picker.pending} awaiting a structure
                                                </Typography>
                                                {pickerFellBack && (
                                                    <Typography sx={{ fontSize: "11.5px", color: "#B45309", mt: 0.5 }}>
                                                        The dedicated picker endpoint is not deployed yet — this list is
                                                        filtered in the browser instead, so it may lag a colleague's changes.
                                                    </Typography>
                                                )}
                                            </>
                                        )}
                                    </Grid>
                                )}

                                {[
                                    { key: "basic", label: "Basic", adornment: "₹" },
                                    { key: "hraPercent", label: "HRA %", adornment: "%" },
                                    { key: "daPercent", label: "DA %", adornment: "%" },
                                    { key: "conveyance", label: "Conveyance", adornment: "₹" },
                                    { key: "special", label: "Special Allowance", adornment: "₹" },
                                    // paid every month by the engine — without these the gross shown
                                    // here was understated against what staff actually received
                                    { key: "incentive", label: "Incentive", adornment: "₹" },
                                    { key: "addSalary", label: "Additional Salary", adornment: "₹" },
                                ].map((field) => (
                                    <Grid key={field.key} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <Typography
                                            sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 0.7 }}
                                        >
                                            {field.label}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            value={editing[field.key]}
                                            onChange={(e) =>
                                                setEditing((prev) => ({ ...prev, [field.key]: e.target.value }))
                                            }
                                            sx={inputSx}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                                                                {field.adornment}
                                                            </Typography>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    </Grid>
                                ))}

                                {/* Free text by design: accepts a rate ("12%") or an opt-out
                                    ("N/A", "0", "nil"). Don't force a numeric input — anything
                                    reading as nil means the deduction does not apply to
                                    this person. Also editable per-person on Deductions & Compliance. */}
                                {[
                                    { key: "pf", label: "PF", hint: "e.g. 12% or N/A" },
                                    { key: "esi", label: "ESI", hint: "e.g. 0.75% or N/A" },
                                    { key: "pt", label: "PT", hint: "e.g. 200 or N/A" },
                                ].map((field) => (
                                    <Grid key={field.key} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <Typography
                                            sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 0.7 }}
                                        >
                                            {field.label}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={editing[field.key] ?? ""}
                                            onChange={(e) =>
                                                setEditing((prev) => ({ ...prev, [field.key]: e.target.value }))
                                            }
                                            placeholder={field.hint}
                                            sx={inputSx}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Live breakdown */}
                            <Box
                                sx={{
                                    mt: 2.5,
                                    p: 1.8,
                                    borderRadius: "10px",
                                    bgcolor: GREEN.bg,
                                    border: `1px solid ${GREEN.border}`,
                                }}
                            >
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1.2 }}>
                                    {[
                                        { label: "HRA", value: draftPreview.hra },
                                        { label: "DA", value: draftPreview.da },
                                        { label: "Conveyance", value: draftPreview.conveyance },
                                        { label: "Special", value: draftPreview.special },
                                        { label: "Incentive", value: draftPreview.incentive },
                                        { label: "Additional", value: draftPreview.addSalary },
                                    ].map((item) => (
                                        <Box key={item.label}>
                                            <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{item.label}</Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                                                {rupees(item.value)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Typography sx={{ fontSize: "13px", color: "#374151" }}>
                                    Gross Salary:{" "}
                                    <Box component="span" sx={{ fontSize: "17px", fontWeight: 700, color: GREEN.dark }}>
                                        {rupees(draftPreview.gross)}
                                    </Box>
                                </Typography>
                                {/* The server computes and stores gross itself and ignores anything
                                    the FE sends for it. This is a preview of the same formula, shown
                                    because it is useful while typing — but the stored figure is
                                    confirmed from the response after saving. */}
                                <Typography sx={{ fontSize: "11px", color: "#6B7280", mt: 0.5 }}>
                                    Estimate — the saved figure is confirmed by the server.
                                </Typography>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB" }}>
                            <Button
                                onClick={() => setEditing(null)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "50px",
                                    border: "1px solid #D1D5DB",
                                    color: "#374151",
                                    fontSize: "13.5px",
                                    fontWeight: "600",
                                    px: 3,
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={saveStructure}
                                startIcon={saving ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : null}
                                disabled={saving || !editing.rollNo || !editing.basic}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "50px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    px: 3,
                                    bgcolor: GREEN.dark,
                                    "&:hover": { bgcolor: "#065F46" },
                                }}
                            >
                                {editing.id ? "Save Changes" : "Create Structure"}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={5000}
                onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snack.ok ? "success" : "error"}
                    variant="filled"
                    onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
                    sx={{ fontSize: "13.5px" }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
