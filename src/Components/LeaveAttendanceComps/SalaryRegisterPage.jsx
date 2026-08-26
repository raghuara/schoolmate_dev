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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import VerifiedIcon from "@mui/icons-material/Verified";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckIcon from "@mui/icons-material/Check";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

import { avatarToneOf, initialsOf, GREEN, RED, BLUE } from "./LeaveAttendancePage";
import { PAYROLL_STAGES } from "./PayrollManagementPage";
import {
    rupees,
    monthLabel,
    toPayoutMonth,
    fetchPayrollCycle,
    fetchPayrollRegister,
    fetchPayslip,
} from "./payrollApi";

const PAGE_BG = "#F7F9F9";
const PURPLE = { main: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
const ORANGE = { main: "#F97316", bg: "#FFF7ED", border: "#FED7AA" };

const ALL_DEPARTMENTS = "All Departments";

/* The cycle's stage names, mapped onto the four steps this page already renders. */
const STAGE_INDEX = {
    None: 0,
    AttendanceLocked: 1,
    Calculated: 2,
    Approved: 3,
    Credited: 4,
};

/* GET api/payroll/register row → what this table renders.

   basicSalary comes from the LIVE salary structure while grossSalary onward are FROZEN at
   calculation, so the two can legitimately disagree if someone edited a structure after
   calculating. That is expected, not a bug. */
const rowFromApi = (item) => ({
    id: item.rollNumber,
    staffId: item.rollNumber,
    rollNo: item.rollNumber,
    name: item.name,
    // derived from Users.SubUserType server-side, falls back to "—"
    department: item.department,
    category: item.department,
    basic: item.basicSalary,
    grossSalary: item.grossSalary,
    deductions: item.deductions,
    netSalary: item.netSalary,
    paymentDate: item.paymentDate,
    // the PAYSLIP's own state (Draft / Approved / Paid), distinct from the cycle's stage
    status: item.status,
});

/* Last twelve payout months, newest first. */
const recentPayoutMonths = (from) => {
    const list = [];
    for (let back = 0; back < 12; back += 1) {
        const date = new Date(from.getFullYear(), from.getMonth() - back, 1);
        list.push(toPayoutMonth(date));
    }
    return list;
};

export default function SalaryRegisterPage() {
    const navigate = useNavigate();
    const [today] = useState(() => new Date());
    /* Everything is labelled by PAYOUT month. The engine derives the attendance month
       itself (payout M pays for M-1) and returns both, so the user is never asked for two. */
    const [payoutMonth, setPayoutMonth] = useState(() => toPayoutMonth(today));
    const monthOptions = recentPayoutMonths(today);

    const [cycle, setCycle] = useState(null);
    const [register, setRegister] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registerError, setRegisterError] = useState("");

    const [department, setDepartment] = useState(ALL_DEPARTMENTS);
    const [search, setSearch] = useState("");
    const [viewing, setViewing] = useState(null);
    const [payslip, setPayslip] = useState(null);
    const [payslipError, setPayslipError] = useState("");
    const [snack, setSnack] = useState({ open: false, message: "", ok: true });

    const load = useCallback(async () => {
        setLoading(true);
        /* The cycle is read separately from the register because it still answers before
           calculation — that is what tells the user WHY the register is empty. */
        try {
            setCycle(await fetchPayrollCycle({ payoutMonth }));
        } catch {
            setCycle(null);
        }
        try {
            const data = await fetchPayrollRegister({ payoutMonth });
            setRegister(data);
            setRows(data.rows.map(rowFromApi));
            setRegisterError("");
        } catch (error) {
            setRegister(null);
            setRows([]);
            // e.g. "Payroll not yet calculated for this month." — a state, not a fault
            setRegisterError(error.message);
        }
        setLoading(false);
    }, [payoutMonth]);

    useEffect(() => {
        load();
    }, [load]);

    const cycleLabel = cycle?.payoutMonth || monthLabel(payoutMonth);
    const stageIndex = STAGE_INDEX[cycle?.status] ?? 0;

    /* Departments come from the data — the old hardcoded list did not match what the
       server derives from Users.SubUserType. */
    const departments = [ALL_DEPARTMENTS, ...Array.from(new Set(rows.map((row) => row.department).filter(Boolean)))];

    const term = search.trim().toLowerCase();
    const visibleRows = rows
        .filter((row) => department === ALL_DEPARTMENTS || row.department === department)
        .filter((row) =>
            !term
                ? true
                : String(row.name ?? "").toLowerCase().includes(term) || String(row.rollNo ?? "").includes(term)
        );

    /* Server totals cover the whole register; once a filter is applied the visible subset
       is summed instead, so the cards always describe what is on screen. */
    const filtered = department !== ALL_DEPARTMENTS || Boolean(term);
    const totalGross = filtered
        ? visibleRows.reduce((sum, row) => sum + row.grossSalary, 0)
        : register?.totalGross ?? 0;
    const totalDeductions = filtered
        ? visibleRows.reduce((sum, row) => sum + row.deductions, 0)
        : register?.totalDeductions ?? 0;
    const totalNet = filtered
        ? visibleRows.reduce((sum, row) => sum + row.netSalary, 0)
        : register?.totalNet ?? 0;

    /* Payslips are fetched per employee — the register row carries only the summary. */
    const openPayslip = async (row) => {
        setViewing(row);
        setPayslip(null);
        setPayslipError("");
        try {
            setPayslip(await fetchPayslip({ payoutMonth, rollNumber: row.rollNo }));
        } catch (error) {
            setPayslipError(error.message);
        }
    };

    const kpis = [
        {
            label: "TOTAL GROSS SALARY",
            value: rupees(totalGross),
            caption: "across all employees",
            icon: BarChartIcon,
            tone: GREEN,
        },
        {
            label: "TOTAL NET PAYOUT",
            value: rupees(totalNet),
            caption: "after all deductions",
            icon: VerifiedIcon,
            tone: BLUE,
        },
        {
            label: "TOTAL DEDUCTIONS",
            value: rupees(totalDeductions),
            caption: "statutory + others",
            icon: DescriptionOutlinedIcon,
            tone: RED,
        },
        {
            label: "TOTAL EMPLOYEES",
            value: visibleRows.length,
            caption: "on register",
            icon: HistoryIcon,
            tone: PURPLE,
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
                    <DescriptionOutlinedIcon sx={{ fontSize: "22px", color: GREEN.main }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                        Audit-ready Salary Register
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
                        Comprehensive salary records for audit and compliance
                    </Typography>
                </Box>

                <Box sx={{ flex: 1 }} />

                <TextField
                    select
                    size="small"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    sx={{
                        minWidth: "225px",
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "50px",
                            fontSize: "14px",
                            fontWeight: 600,
                            bgcolor: "#F9FAFB",
                            "& fieldset": { borderColor: "#E5E7EB" },
                        },
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <ApartmentIcon sx={{ fontSize: "19px", color: "#6B7280" }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                >
                    {departments.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: "13.5px" }}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Labelled by PAYOUT month only. The attendance month it pays for is shown as
                    context beneath — asking an admin for both is how the arrears rule gets
                    misread. */}
                <TextField
                    select
                    size="small"
                    value={payoutMonth}
                    onChange={(e) => setPayoutMonth(e.target.value)}
                    sx={{
                        minWidth: "190px",
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "50px",
                            fontSize: "14px",
                            fontWeight: 600,
                            bgcolor: "#F9FAFB",
                            "& fieldset": { borderColor: "#E5E7EB" },
                        },
                    }}
                >
                    {monthOptions.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: "13.5px" }}>
                            {monthLabel(option)}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    size="small"
                    placeholder="Search by name or roll no..."
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
                    variant="contained"
                    startIcon={<FileDownloadOutlinedIcon />}
                    sx={{
                        textTransform: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "700",
                        px: 3,
                        py: 1,
                        bgcolor: "#0B1220",
                        "&:hover": { bgcolor: "#1F2937" },
                    }}
                >
                    Export Excel
                </Button>
            </Box>

            {/* ─── Body ─── */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, pb: 3.5 }}>
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4, gap: 1.5 }}>
                        <CircularProgress size={22} sx={{ color: GREEN.main }} />
                        <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
                            Loading {monthLabel(payoutMonth)} register…
                        </Typography>
                    </Box>
                )}

                {/* "Payroll not yet calculated for this month." is a normal stage of the cycle,
                    not a fault — so it is presented as where the run has got to, with the way
                    forward, rather than as an error. */}
                {!loading && registerError && (
                    <Box
                        sx={{
                            mb: 2,
                            p: 1.8,
                            borderRadius: "10px",
                            bgcolor: ORANGE.bg,
                            border: `1px solid ${ORANGE.border}`,
                        }}
                    >
                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#9A3412" }}>
                            No register for {monthLabel(payoutMonth)} yet
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#9A3412", mt: 0.4 }}>
                            {registerError}
                        </Typography>
                        {cycle && (
                            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.8 }}>
                                This cycle is at <strong>{cycle.status === "None" ? "Not started" : cycle.status}</strong>
                                {cycle.attendanceMonth ? ` and pays for ${cycle.attendanceMonth}` : ""}. Run the payroll
                                cycle to produce the register.
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Cycle + stage tracker */}
                <Box
                    sx={{
                        p: 2.2,
                        mb: 2,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 2,
                            flexWrap: "wrap",
                            mb: 2.5,
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>
                                Payroll Cycle — {cycleLabel}
                                {cycle?.attendanceMonth && (
                                    <Typography
                                        component="span"
                                        sx={{ fontSize: "12.5px", fontWeight: "500", color: "#9CA3AF", ml: 1 }}
                                    >
                                        pays for {cycle.attendanceMonth}
                                    </Typography>
                                )}
                            </Typography>
                            <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 0.3 }}>
                                Track the processing stage of this month's payroll
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                            <Chip
                                icon={<PendingActionsIcon sx={{ fontSize: "15px !important", color: `${ORANGE.main} !important` }} />}
                                label={
                                    cycle?.status === "None" || !cycle
                                        ? "Not started"
                                        : cycle.status === "Credited"
                                        ? "Credited — cycle closed"
                                        : `Next: ${PAYROLL_STAGES[Math.min(stageIndex, PAYROLL_STAGES.length - 1)]?.label}`
                                }
                                size="small"
                                sx={{
                                    height: 30,
                                    bgcolor: ORANGE.bg,
                                    color: ORANGE.main,
                                    border: `1px solid ${ORANGE.border}`,
                                    fontWeight: "700",
                                    fontSize: "12.5px",
                                }}
                            />
                            <Chip
                                icon={<LockOutlinedIcon sx={{ fontSize: "15px !important", color: "#9CA3AF !important" }} />}
                                label="Read-only access"
                                size="small"
                                sx={{
                                    height: 30,
                                    bgcolor: "#F9FAFB",
                                    color: "#6B7280",
                                    border: "1px solid #E5E7EB",
                                    fontWeight: "600",
                                    fontSize: "12.5px",
                                }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "flex-start", overflowX: "auto" }}>
                        {PAYROLL_STAGES.map((stage, index) => {
                            const done = index < stageIndex;
                            const active = index === stageIndex;
                            const StageIcon = done ? CheckIcon : stage.icon;
                            const accent = done ? GREEN.main : active ? ORANGE.main : "#9CA3AF";
                            return (
                                <React.Fragment key={stage.key}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            textAlign: "center",
                                            minWidth: "140px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 46,
                                                height: 46,
                                                borderRadius: "50%",
                                                boxSizing: "border-box",
                                                bgcolor: done ? GREEN.main : active ? "#fff" : "#F3F4F6",
                                                border: `2px solid ${done ? GREEN.main : active ? ORANGE.main : "#E5E7EB"}`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <StageIcon sx={{ fontSize: "23px", color: done ? "#fff" : accent }} />
                                        </Box>
                                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: accent, mt: 1 }}>
                                            {stage.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px", color: active ? ORANGE.main : "#9CA3AF", mt: 0.2 }}>
                                            {stage.caption}
                                        </Typography>
                                    </Box>

                                    {index < PAYROLL_STAGES.length - 1 && (
                                        <Box
                                            sx={{
                                                flex: 1,
                                                minWidth: "30px",
                                                height: "2px",
                                                mt: "22px",
                                                bgcolor: index < stageIndex ? GREEN.main : "#E5E7EB",
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Box>
                </Box>

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
                                            sx={{ fontSize: "12px", fontWeight: "700", color: kpi.tone.main, letterSpacing: "0.6px" }}
                                        >
                                            {kpi.label}
                                        </Typography>
                                        <Typography
                                            sx={{ fontSize: "29px", fontWeight: "700", color: "#111827", lineHeight: 1.35 }}
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

                {/* Register */}
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
                            <DescriptionOutlinedIcon sx={{ fontSize: "19px", color: GREEN.main }} />
                        </Box>
                        <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                            Salary Register
                        </Typography>
                        <Chip
                            label={`${visibleRows.length} records`}
                            size="small"
                            sx={{ bgcolor: "#F3F4F6", color: "#6B7280", fontWeight: "600", fontSize: "11.5px" }}
                        />
                    </Box>

                    <TableContainer sx={{ maxHeight: "50vh" }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {[
                                        "S.NO",
                                        "EMPLOYEE",
                                        "DEPARTMENT",
                                        "BASIC SALARY",
                                        "GROSS SALARY",
                                        "DEDUCTIONS",
                                        "NET SALARY",
                                        "PAYMENT DATE",
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
                                {visibleRows.map((row, index) => {
                                    const tone = avatarToneOf(row.staffId);
                                    return (
                                        <TableRow key={row.id} hover>
                                            <TableCell sx={{ fontSize: "13px", color: "#9CA3AF", py: 1.5 }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
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
                                                            {row.rollNo} · {row.department}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.department}
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
                                            <TableCell sx={{ fontSize: "13.5px", fontWeight: "600", color: GREEN.main }}>
                                                {rupees(row.grossSalary)}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13.5px", fontWeight: "600", color: RED.main }}>
                                                {rupees(row.deductions)}
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "inline-block",
                                                        px: 1.5,
                                                        py: 0.6,
                                                        borderRadius: "8px",
                                                        bgcolor: GREEN.bg,
                                                        border: `1px solid ${GREEN.border}`,
                                                        color: GREEN.main,
                                                        fontSize: "13.5px",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {rupees(row.netSalary)}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13.5px", color: "#374151" }}>
                                                {row.paymentDate}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openPayslip(row)}
                                                    sx={{
                                                        borderRadius: "8px",
                                                        bgcolor: BLUE.bg,
                                                        border: `1px solid ${BLUE.border}`,
                                                    }}
                                                >
                                                    <VisibilityOutlinedIcon sx={{ fontSize: "17px", color: BLUE.main }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {visibleRows.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: "13px" }}
                                        >
                                            No salary records match your filters
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>

            {/* ─── Salary breakdown ─── */}
            <Dialog
                open={Boolean(viewing)}
                onClose={() => {
                    setViewing(null);
                    setPayslip(null);
                    setPayslipError("");
                }}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
            >
                {viewing && (
                    <>
                        {/* Header */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.8,
                                px: 2.5,
                                py: 2.2,
                                background: "linear-gradient(90deg, #ECFDF5 0%, #F0FDFA 55%, #FFFFFF 100%)",
                                borderBottom: `1px solid ${GREEN.border}`,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: "11px",
                                    bgcolor: "#fff",
                                    border: `1px solid ${GREEN.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <DescriptionOutlinedIcon sx={{ color: GREEN.main, fontSize: "23px" }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: "20px", fontWeight: "700", color: "#111827", lineHeight: 1.25 }}>
                                    Salary Breakdown
                                </Typography>
                                <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                                    {viewing.name} ({viewing.rollNo}) · {viewing.department}
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={() => setViewing(null)}
                                sx={{ width: 38, height: 38, border: "1px solid #E5E7EB", borderRadius: "10px", bgcolor: "#fff" }}
                            >
                                <CloseIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ p: 2.5, bgcolor: "#F9FAFB" }}>
                            {/* Identity */}
                            <Box
                                sx={{
                                    p: 2.2,
                                    mb: 2,
                                    bgcolor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "12px",
                                }}
                            >
                                <Grid container spacing={2.5}>
                                    {[
                                        { label: "EMPLOYEE NAME", value: payslip?.employee.name || viewing.name },
                                        { label: "ROLL NUMBER", value: viewing.rollNo },
                                        { label: "DEPARTMENT", value: payslip?.employee.department || viewing.department },
                                        {
                                            label: "PAYS FOR",
                                            // arrears: the payout month pays for the month before it
                                            value: payslip?.cycle.attendanceMonth || cycle?.attendanceMonth || "—",
                                        },
                                    ].map((item) => (
                                        <Grid key={item.label} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: "11.5px",
                                                    fontWeight: "600",
                                                    color: "#9CA3AF",
                                                    letterSpacing: "0.6px",
                                                }}
                                            >
                                                {item.label}
                                            </Typography>
                                            <Typography sx={{ fontSize: "15px", fontWeight: "700", color: "#111827", mt: 0.3 }}>
                                                {item.value}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {/* Figures */}
                            <Box
                                sx={{
                                    p: 2.2,
                                    mb: 2,
                                    bgcolor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "12px",
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.3, mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "9px",
                                            bgcolor: GREEN.bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <BarChartIcon sx={{ fontSize: "18px", color: GREEN.main }} />
                                    </Box>
                                    <Typography
                                        sx={{ fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.8px" }}
                                    >
                                        SALARY BREAKDOWN
                                    </Typography>
                                </Box>

                                {!payslip && !payslipError && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, py: 3 }}>
                                        <CircularProgress size={18} sx={{ color: GREEN.main }} />
                                        <Typography sx={{ fontSize: "13.5px", color: "#6B7280" }}>
                                            Loading payslip…
                                        </Typography>
                                    </Box>
                                )}

                                {payslipError && (
                                    <Box sx={{ py: 2 }}>
                                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#991B1B" }}>
                                            Payslip unavailable
                                        </Typography>
                                        <Typography sx={{ fontSize: "12.5px", color: "#B91C1C", mt: 0.4 }}>
                                            {payslipError}
                                        </Typography>
                                    </Box>
                                )}

                                {payslip && (
                                    <>
                                        {/* earnings[] and deductions[] are LINE LISTS, not fixed fields, and the
                                            API suppresses zero-amount lines. Rendering them by loop is what makes
                                            the removed rows (Loss of Pay, Prev-Month LOP Carry, Permission
                                            Refund, TDS) simply stop appearing with no code change. Each line
                                            carries the server's own formula string, so the FE never reproduces
                                            payroll maths. */}
                                        {[
                                            { title: "EARNINGS", lines: payslip.earnings, color: GREEN.main },
                                            { title: "DEDUCTIONS", lines: payslip.deductions, color: RED.main },
                                        ].map((group) => (
                                            <Box key={group.title} sx={{ mb: 2 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: "11.5px",
                                                        fontWeight: "700",
                                                        color: "#6B7280",
                                                        letterSpacing: "0.7px",
                                                        mb: 0.6,
                                                    }}
                                                >
                                                    {group.title}
                                                </Typography>
                                                {group.lines.length === 0 && (
                                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF", py: 1 }}>
                                                        None this month
                                                    </Typography>
                                                )}
                                                {group.lines.map((line) => (
                                                    <Box
                                                        key={line.category + line.description}
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "flex-start",
                                                            justifyContent: "space-between",
                                                            gap: 2,
                                                            py: 1.2,
                                                            borderBottom: "1px dashed #E5E7EB",
                                                        }}
                                                    >
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography sx={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                                                                {line.description || line.category}
                                                            </Typography>
                                                            {line.formula && (
                                                                <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>
                                                                    {line.formula}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Typography
                                                            sx={{ fontSize: "14.5px", fontWeight: "700", color: group.color, whiteSpace: "nowrap" }}
                                                        >
                                                            {rupees(line.amount)}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        ))}

                                        {/* Attendance explains WHY the pay is what it is, so it sits next to the
                                            totals — a query about a short payslip then answers itself. */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 2.5,
                                                p: 1.6,
                                                mb: 2,
                                                borderRadius: "10px",
                                                bgcolor: "#F9FAFB",
                                                border: "1px solid #E5E7EB",
                                            }}
                                        >
                                            {[
                                                { label: "Working days", value: payslip.attendance.workingDays },
                                                { label: "Present", value: payslip.attendance.present },
                                                { label: "Paid leave", value: payslip.attendance.paidLeave },
                                                { label: "Loss of pay", value: payslip.attendance.lop },
                                                { label: "Absent", value: payslip.attendance.absent },
                                                { label: "Late", value: payslip.attendance.late },
                                            ].map((item) => (
                                                <Box key={item.label}>
                                                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                        {item.label}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>
                                                        {item.value}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>

                                        {/* Unpaid days are settled by pro-rating Basic/HRA/DA, so the reduction is
                                            already visible on the earnings side. Showing it again as a deduction
                                            charged the employee twice for one absence — hence LOP is always 0 now. */}
                                        {payslip.attendance.lop > 0 && (
                                            <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mb: 2 }}>
                                                Loss of pay is settled by pro-rating Basic, HRA and DA — it is already
                                                reflected in the earnings above, not charged again as a deduction.
                                            </Typography>
                                        )}

                                        {[
                                            { label: "Total Earnings", value: payslip.totals.totalEarnings, color: GREEN.main },
                                            { label: "Gross Salary", value: payslip.totals.grossSalary, color: "#111827" },
                                            { label: "Total Deductions", value: payslip.totals.totalDeductions, color: RED.main },
                                        ].map((item, index, list) => (
                                            <Box
                                                key={item.label}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: 2,
                                                    py: 1.5,
                                                    borderBottom: index === list.length - 1 ? "none" : "1px dashed #E5E7EB",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "15px", fontWeight: "700", color: "#374151" }}>
                                                    {item.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: "15px", fontWeight: "700", color: item.color }}>
                                                    {rupees(item.value)}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </>
                                )}
                            </Box>

                            {/* Take home */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 2,
                                    flexWrap: "wrap",
                                    p: 2.2,
                                    borderRadius: "12px",
                                    bgcolor: GREEN.bg,
                                    border: `1px solid ${GREEN.border}`,
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{ fontSize: "12px", fontWeight: "700", color: GREEN.main, letterSpacing: "0.6px" }}
                                    >
                                        NET SALARY (TAKE HOME)
                                    </Typography>
                                    <Typography sx={{ fontSize: "34px", fontWeight: "700", color: GREEN.dark, lineHeight: 1.25 }}>
                                        {rupees(payslip?.totals.netSalary ?? viewing.netSalary)}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                                        Disbursed to registered bank account
                                    </Typography>
                                </Box>

                                <Chip
                                    label="Bank Transfer"
                                    sx={{
                                        height: 34,
                                        px: 1,
                                        bgcolor: GREEN.main,
                                        color: "#fff",
                                        fontWeight: "700",
                                        fontSize: "13px",
                                    }}
                                />
                            </Box>

                            {/**
                             * Employer contributions — what the SCHOOL pays on top of salary.
                             *
                             * This is deliberately outside the deductions list and below the take-home
                             * figure. It is not part of totalDeductions, grossSalary or netSalary, and
                             * rendering it among the deductions would read to a staff member as money
                             * taken off their pay — the opposite of what it is.
                             *
                             * Zero-suppressed like the other lists, so it stays empty while the employer
                             * percentages on the statutory screen are still at their seeded "0".
                             */}
                            {payslip?.employerContributions?.length > 0 && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        borderRadius: "12px",
                                        bgcolor: "#F9FAFB",
                                        border: "1px dashed #D1D5DB",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "11.5px",
                                            fontWeight: "700",
                                            color: "#6B7280",
                                            letterSpacing: "0.7px",
                                        }}
                                    >
                                        EMPLOYER CONTRIBUTIONS — PAID BY THE SCHOOL
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mt: 0.3, mb: 1.2 }}>
                                        Not deducted from this salary. Shown for cost visibility only.
                                    </Typography>
                                    {payslip.employerContributions.map((line) => (
                                        <Box
                                            key={line.category + line.description}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 2,
                                                py: 1,
                                                borderTop: "1px dashed #E5E7EB",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "13.5px", color: "#374151" }}>
                                                {line.description || line.category}
                                            </Typography>
                                            <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#6B7280" }}>
                                                {rupees(line.amount)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fff", borderTop: "1px solid #E5E7EB" }}>
                            <Button
                                onClick={() => setViewing(null)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    border: "1px solid #D1D5DB",
                                    color: "#374151",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    px: 3.5,
                                    py: 1,
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<PrintOutlinedIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    px: 3.5,
                                    py: 1,
                                    bgcolor: GREEN.dark,
                                    "&:hover": { bgcolor: "#065F46" },
                                }}
                            >
                                Print Payslip
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
