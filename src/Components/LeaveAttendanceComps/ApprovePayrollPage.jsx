import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Button,
    TextField,
    InputAdornment,
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
    MenuItem,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SchoolIcon from "@mui/icons-material/School";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { avatarToneOf, initialsOf, GREEN, RED, BLUE } from "./LeaveAttendancePage";
import {
    rupees,
    monthLabel,
    toPayoutMonth,
    fetchPayrollCycle,
    fetchPayrollRegister,
    fetchPayslip,
    lockAttendance,
    calculatePayroll,
    approvePayroll,
    markPayrollCredited,
    rollbackPayrollCycle,
} from "./payrollApi";

const PAGE_BG = "#F7F9F9";

const PURPLE = { main: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
const AMBER = { main: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };

/* Letterhead name. Expected from website settings once wired */
const SCHOOL_NAME = "Morning Star Matriculation School";

/* Payslip line amounts print without the currency symbol */
const plain = (value) => Math.round(Number(value) || 0).toLocaleString("en-IN");

const ddmmyyyy = (date) =>
    `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

/**
 * The cycle stage machine.
 *
 * One payroll_cycle row per (academic year, payout month). Approval is a CYCLE-level
 * action — there is no per-payslip approve endpoint — so this screen offers exactly one
 * action at a time, decided by the stage the server reports.
 *
 * Credited is TERMINAL by design: corrections go into the next cycle as an adjustment,
 * so no rollback is offered from it.
 */
const STAGE_ACTIONS = {
    None: {
        label: "Lock Attendance",
        caption: "Freezes the attendance month so the figures cannot move underneath the run.",
        run: lockAttendance,
    },
    AttendanceLocked: {
        label: "Calculate Payroll",
        caption: "Runs the engine and writes one payslip per staff member.",
        run: calculatePayroll,
    },
    Calculated: {
        label: "Approve Payroll",
        caption: "Locks the numbers for this cycle.",
        run: approvePayroll,
    },
    Approved: {
        label: "Mark as Credited",
        caption: "Records that salaries have been paid. This cannot be undone.",
        run: markPayrollCredited,
    },
    Credited: null,
};

const STAGE_INDEX = { None: 0, AttendanceLocked: 1, Calculated: 2, Approved: 3, Credited: 4 };

/* Register row → what this queue renders. Figures are FROZEN at calculation. */
const rowFromApi = (item) => ({
    id: item.rollNumber,
    staffId: item.rollNumber,
    rollNo: item.rollNumber,
    name: item.name,
    department: item.department,
    basic: item.basicSalary,
    gross: item.grossSalary,
    deductions: item.deductions,
    net: item.netSalary,
    paymentDate: item.paymentDate,
    // the payslip's own state — Draft / Approved / Paid
    status: item.status,
});

const recentPayoutMonths = (from) => {
    const list = [];
    for (let back = 0; back < 12; back += 1) {
        list.push(toPayoutMonth(new Date(from.getFullYear(), from.getMonth() - back, 1)));
    }
    return list;
};

export default function ApprovePayrollPage() {
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth);
    const [today] = useState(() => new Date());
    const [payoutMonth, setPayoutMonth] = useState(() => toPayoutMonth(today));
    const monthOptions = recentPayoutMonths(today);
    const generatedOn = ddmmyyyy(today);

    const [cycle, setCycle] = useState(null);
    const [register, setRegister] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registerError, setRegisterError] = useState("");
    const [busy, setBusy] = useState(false);
    /* The structured error from calculate: who is missing what. Kept in state because it is
       an actionable worklist, not a toast. */
    const [blockers, setBlockers] = useState(null);
    const [search, setSearch] = useState("");
    const [payslipFor, setPayslipFor] = useState(null);
    const [payslip, setPayslip] = useState(null);
    const [payslipError, setPayslipError] = useState("");
    const [snack, setSnack] = useState({ open: false, message: "", ok: true });

    const showSnack = (message, ok = true) => setSnack({ open: true, message, ok });

    const load = useCallback(async () => {
        setLoading(true);
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
            setRegisterError(error.message);
        }
        setLoading(false);
    }, [payoutMonth]);

    useEffect(() => {
        load();
    }, [load]);

    const cycleLabel = cycle?.payoutMonth || monthLabel(payoutMonth);
    const stage = cycle?.status || "None";
    const stageIndex = STAGE_INDEX[stage] ?? 0;
    const action = STAGE_ACTIONS[stage];

    const term = search.trim().toLowerCase();
    const visibleRows = rows.filter((row) =>
        !term
            ? true
            : String(row.name ?? "").toLowerCase().includes(term) ||
              String(row.rollNo ?? "").includes(term) ||
              String(row.department ?? "").toLowerCase().includes(term)
    );

    const approvedCount = rows.filter((row) => row.status !== "Draft").length;
    const pendingCount = rows.length - approvedCount;
    const totalNet = register?.totalNet ?? 0;

    /**
     * Runs whichever single stage action the server says is next.
     *
     * calculate is the one that fails on missing setup, and it names exactly who is missing
     * what. Those arrays are rendered as a worklist with links to the fixing screens — this
     * is the most common payroll failure and a generic message wastes the admin's time.
     */
    const runStage = async () => {
        if (!action) return;
        if (!authUser?.rollNumber) {
            showSnack("Cannot continue: no signed-in user found.", false);
            return;
        }
        setBusy(true);
        setBlockers(null);
        try {
            await action.run({
                academicYear: cycle?.academicYear,
                payoutMonth,
                actionByRollNumber: authUser.rollNumber,
                actionByUserType: authUser.userType,
            });
            showSnack(`${action.label} completed for ${cycleLabel}.`);
            await load();
        } catch (error) {
            const missingStructure = error.missingSalaryStructure || [];
            const missingShift = error.missingShiftAssignment || [];
            if (missingStructure.length || missingShift.length) {
                setBlockers({ missingStructure, missingShift, message: error.message });
            } else {
                showSnack(error.message, false);
            }
        }
        setBusy(false);
    };

    /* Steps back exactly one stage. Also the prescribed way out of "attendance for this
       month is locked" — editing a punch requires rolling the cycle back first. */
    const rollback = async () => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot continue: no signed-in user found.", false);
            return;
        }
        setBusy(true);
        try {
            await rollbackPayrollCycle({
                academicYear: cycle?.academicYear,
                payoutMonth,
                actionByRollNumber: authUser.rollNumber,
                actionByUserType: authUser.userType,
            });
            showSnack(`${cycleLabel} rolled back one stage.`);
            await load();
        } catch (error) {
            showSnack(error.message, false);
        }
        setBusy(false);
    };

    const openPayslip = async (row) => {
        setPayslipFor(row);
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
            label: "TOTAL EMPLOYEES",
            value: rows.length,
            caption: "on this payroll",
            icon: PeopleAltOutlinedIcon,
            tone: GREEN,
            filledIcon: false,
        },
        {
            label: "PENDING APPROVAL",
            value: pendingCount,
            caption: "awaiting review",
            icon: HourglassEmptyIcon,
            tone: AMBER,
            filledIcon: false,
        },
        {
            label: "APPROVED",
            value: approvedCount,
            caption: "ready for disbursement",
            icon: CheckIcon,
            tone: BLUE,
            filledIcon: true,
        },
        {
            label: "TOTAL NET PAYOUT",
            value: rupees(totalNet),
            caption: "this cycle",
            icon: MonetizationOnOutlinedIcon,
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
                    <CheckCircleOutlineIcon sx={{ fontSize: "23px", color: GREEN.main }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                        Approve Payroll &amp; Payslips
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
                        Review monthly payroll and generate audit-ready payslips
                    </Typography>
                </Box>

                <Box sx={{ flex: 1 }} />

                <TextField
                    size="small"
                    placeholder="Search by name, roll no, or dept..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        minWidth: "330px",
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
            </Box>

            {/* ─── Body ─── */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, pb: 3.5 }}>
                {/* Cycle selector + where the run has got to. Labelled by PAYOUT month, with
                    the attendance month it pays for shown as context — never asking for both. */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                        p: 1.8,
                        mb: 2,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
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

                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}>
                            {cycleLabel}
                            {cycle?.attendanceMonth ? ` · pays for ${cycle.attendanceMonth}` : ""}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                            Stage: {stage === "None" ? "Not started" : stage}
                            {cycle?.stages?.calculated?.on ? ` · calculated ${cycle.stages.calculated.on}` : ""}
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }} />

                    {loading && <CircularProgress size={18} sx={{ color: GREEN.main }} />}
                </Box>

                {/**
                 * Missing setup — rendered as a worklist, not a toast.
                 *
                 * calculate fails with a structured error naming exactly who lacks a salary
                 * structure or a shift assignment. This is the most common payroll failure, and
                 * a generic "calculation failed" makes an admin go hunting.
                 */}
                {blockers && (
                    <Box
                        sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: "12px",
                            bgcolor: "#FEF2F2",
                            border: "1px solid #FECACA",
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#991B1B" }}>
                            Payroll cannot be calculated yet
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#B91C1C", mt: 0.4, mb: 1.4 }}>
                            {blockers.message}
                        </Typography>

                        <Grid container spacing={2}>
                            {[
                                {
                                    title: "No salary structure",
                                    people: blockers.missingStructure,
                                    to: "../salary-structures",
                                    cta: "Open Salary Structures",
                                },
                                {
                                    title: "No shift assignment",
                                    people: blockers.missingShift,
                                    to: "/dashboardmenu/leave-management/leave-policy-master",
                                    cta: "Open Leave Policy",
                                },
                            ]
                                .filter((group) => group.people.length > 0)
                                .map((group) => (
                                    <Grid key={group.title} size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: "700", color: "#991B1B" }}>
                                            {group.title} ({group.people.length})
                                        </Typography>
                                        <Box sx={{ maxHeight: 150, overflowY: "auto", mt: 0.6 }}>
                                            {group.people.map((person) => (
                                                <Typography
                                                    key={person.rollNumber}
                                                    sx={{ fontSize: "12.5px", color: "#7F1D1D" }}
                                                >
                                                    {person.name} · {person.rollNumber}
                                                </Typography>
                                            ))}
                                        </Box>
                                        <Button
                                            onClick={() => navigate(group.to)}
                                            sx={{
                                                mt: 1,
                                                textTransform: "none",
                                                borderRadius: "50px",
                                                border: "1px solid #FECACA",
                                                color: "#991B1B",
                                                fontSize: "12.5px",
                                                fontWeight: "700",
                                                px: 2,
                                            }}
                                        >
                                            {group.cta}
                                        </Button>
                                    </Grid>
                                ))}
                        </Grid>
                    </Box>
                )}

                {/* "Payroll not yet calculated for this month." is a stage, not a fault. */}
                {!loading && registerError && (
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
                            Nothing to approve for {monthLabel(payoutMonth)} yet
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#92400E", mt: 0.4 }}>
                            {registerError} Use the action below to move the cycle forward.
                        </Typography>
                    </Box>
                )}

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
                                            sx={{ fontSize: "31px", fontWeight: "700", color: "#111827", lineHeight: 1.35 }}
                                        >
                                            {kpi.value}
                                        </Typography>
                                        <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>{kpi.caption}</Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: kpi.filledIcon ? "50%" : "10px",
                                            bgcolor: kpi.filledIcon ? kpi.tone.main : "#fff",
                                            border: kpi.filledIcon ? "none" : `1px solid ${kpi.tone.border}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <KpiIcon sx={{ fontSize: "21px", color: kpi.filledIcon ? "#fff" : kpi.tone.main }} />
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Payroll table */}
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
                            <ReceiptLongOutlinedIcon sx={{ fontSize: "19px", color: GREEN.main }} />
                        </Box>
                        <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                            Monthly Payroll
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
                                        "BASIC",
                                        "GROSS SALARY",
                                        "DEDUCTIONS",
                                        "NET SALARY",
                                        "STATUS",
                                        "ACTION",
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
                                    const approved = row.status === "Approved";
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
                                            <TableCell sx={{ fontSize: "13.5px", color: "#9CA3AF" }}>
                                                {row.department || "—"}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                                                {rupees(row.basic)}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13.5px", fontWeight: "600", color: GREEN.main }}>
                                                {rupees(row.gross)}
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
                                                    {rupees(row.net)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={
                                                        approved ? (
                                                            <CheckCircleIcon
                                                                sx={{ fontSize: "14px !important", color: `${GREEN.main} !important` }}
                                                            />
                                                        ) : (
                                                            <HourglassEmptyIcon
                                                                sx={{ fontSize: "14px !important", color: `${AMBER.main} !important` }}
                                                            />
                                                        )
                                                    }
                                                    label={row.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: approved ? GREEN.bg : AMBER.bg,
                                                        color: approved ? GREEN.main : AMBER.main,
                                                        border: `1px solid ${approved ? GREEN.border : AMBER.border}`,
                                                        fontWeight: "700",
                                                        fontSize: "11.5px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    startIcon={<PrintOutlinedIcon />}
                                                    onClick={() => openPayslip(row)}
                                                    sx={{
                                                        textTransform: "none",
                                                        borderRadius: "8px",
                                                        bgcolor: BLUE.bg,
                                                        border: `1px solid ${BLUE.border}`,
                                                        color: BLUE.main,
                                                        fontSize: "13px",
                                                        fontWeight: "700",
                                                        px: 2,
                                                        "&:hover": { bgcolor: "#DBEAFE" },
                                                    }}
                                                >
                                                    Payslip
                                                </Button>
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
                                            No payroll records match your search
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Approval bar */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            flexWrap: "wrap",
                            px: 2.2,
                            py: 1.6,
                            borderTop: "1px solid #E5E7EB",
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                                {stage === "Credited"
                                    ? `${cycleLabel} is credited and closed`
                                    : `${cycleLabel} · ${rows.length} payslips · ${pendingCount} still draft`}
                            </Typography>
                            {action && (
                                <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mt: 0.2 }}>
                                    {action.caption}
                                </Typography>
                            )}
                            {stage === "Credited" && (
                                /* Terminal by design — corrections belong in the next cycle. */
                                <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mt: 0.2 }}>
                                    There is no rollback from Credited. Issue an adjustment in the next cycle.
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {/* Rollback is hidden at Credited and meaningless at None. It is also the
                                way out of a locked attendance month — editing a punch requires it. */}
                            {stageIndex > 0 && stage !== "Credited" && (
                                <Button
                                    onClick={rollback}
                                    disabled={busy}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        border: "1px solid #D1D5DB",
                                        color: "#374151",
                                        fontSize: "13.5px",
                                        fontWeight: "700",
                                        px: 2.5,
                                        py: 1,
                                    }}
                                >
                                    Roll back one stage
                                </Button>
                            )}

                            {action && (
                                <Button
                                    variant="contained"
                                    startIcon={
                                        busy ? (
                                            <CircularProgress size={16} sx={{ color: "#fff" }} />
                                        ) : (
                                            <CheckCircleOutlineIcon />
                                        )
                                    }
                                    disabled={busy}
                                    onClick={runStage}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        fontSize: "13.5px",
                                        fontWeight: "700",
                                        px: 3,
                                        py: 1,
                                        bgcolor: GREEN.dark,
                                        "&:hover": { bgcolor: "#065F46" },
                                    }}
                                >
                                    {action.label}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* ─── Payslip ─── */}
            <Dialog
                open={Boolean(payslipFor)}
                onClose={() => setPayslipFor(null)}
                maxWidth="md"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
            >
                {payslipFor && (
                    <>
                        <DialogContent sx={{ p: 0, bgcolor: "#fff" }}>
                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                {/* Letterhead */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
                                        <Box
                                            sx={{
                                                width: 62,
                                                height: 62,
                                                borderRadius: "8px",
                                                border: "1px solid #D1D5DB",
                                                bgcolor: "#F9FAFB",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <SchoolIcon sx={{ fontSize: "32px", color: "#B45309" }} />
                                        </Box>
                                        <Typography
                                            sx={{
                                                fontSize: "20px",
                                                fontWeight: "800",
                                                color: "#111827",
                                                letterSpacing: "0.3px",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {SCHOOL_NAME}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            px: 2.5,
                                            py: 1.5,
                                            border: "1px solid #D1D5DB",
                                            borderRadius: "6px",
                                            textAlign: "center",
                                            minWidth: "190px",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "14px",
                                                fontWeight: "800",
                                                color: "#111827",
                                                letterSpacing: "2px",
                                                pb: 0.8,
                                                borderBottom: "1px solid #E5E7EB",
                                            }}
                                        >
                                            SALARY SLIP
                                        </Typography>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827", mt: 1 }}>
                                            {cycleLabel}
                                        </Typography>
                                        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.3 }}>
                                            Generated: {generatedOn}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ borderTop: "3px solid #111827", my: 2.5 }} />

                                {/* Employee information */}
                                <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "4px", mb: 2.5 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            px: 2,
                                            py: 1.2,
                                            bgcolor: "#F3F4F6",
                                            borderBottom: "1px solid #E5E7EB",
                                        }}
                                    >
                                        <BadgeOutlinedIcon sx={{ fontSize: "17px", color: "#4B5563" }} />
                                        <Typography
                                            sx={{ fontSize: "12.5px", fontWeight: "700", color: "#374151", letterSpacing: "0.8px" }}
                                        >
                                            EMPLOYEE INFORMATION
                                        </Typography>
                                    </Box>

                                    <Box sx={{ p: 2 }}>
                                        <Grid container spacing={2.2}>
                                            {[
                                                { label: "EMPLOYEE NAME", value: payslip?.employee.name || payslipFor.name },
                                                { label: "EMPLOYEE ID", value: payslipFor.rollNo },
                                                {
                                                    label: "PAYS FOR",
                                                    value: payslip?.cycle.attendanceMonth || cycle?.attendanceMonth || "-",
                                                },
                                                {
                                                    label: "DEPARTMENT",
                                                    value: payslip?.employee.department || payslipFor.department || "-",
                                                },
                                                { label: "DATE OF JOINING", value: "-" },
                                                { label: "PAN NUMBER", value: "-" },
                                                {
                                                    label: "BANK ACCOUNT NO.",
                                                    value: payslip?.employee.accountNumber
                                                        ? `****${String(payslip.employee.accountNumber).slice(-4)} (${payslip.employee.bankName || "—"})`
                                                        : "—",
                                                },
                                                { label: "UAN NUMBER", value: "-" },
                                                { label: "PF ACCOUNT NO.", value: "-" },
                                                { label: "ESI IP NUMBER", value: "-" },
                                            ].map((item) => (
                                                <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                                    <Typography
                                                        sx={{
                                                            fontSize: "10.5px",
                                                            fontWeight: "600",
                                                            color: "#9CA3AF",
                                                            letterSpacing: "0.8px",
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Typography>
                                                    <Typography
                                                        sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827", mt: 0.3 }}
                                                    >
                                                        {item.value}
                                                    </Typography>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </Box>

                                {payslipError && (
                                    <Box sx={{ mb: 2, p: 1.6, borderRadius: "8px", bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
                                        <Typography sx={{ fontSize: "12.5px", color: "#B91C1C" }}>{payslipError}</Typography>
                                    </Box>
                                )}

                                {/* Attendance */}
                                <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "4px", mb: 2.5 }}>
                                    <Box sx={{ px: 2, py: 1.2, bgcolor: "#F3F4F6", borderBottom: "1px solid #E5E7EB" }}>
                                        <Typography
                                            sx={{ fontSize: "12.5px", fontWeight: "700", color: "#374151", letterSpacing: "0.8px" }}
                                        >
                                            ATTENDANCE — {cycleLabel.toUpperCase()}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                                        {[
                                            { label: "Working Days", value: payslip?.attendance.workingDays ?? "—" },
                                            { label: "Present Days", value: payslip?.attendance.present ?? "—" },
                                            { label: "Absent Days", value: payslip?.attendance.absent ?? "—" },
                                            { label: "LOP Days", value: payslip?.attendance.lop ?? "—" },
                                            { label: "Paid Leave", value: payslip?.attendance.paidLeave ?? "—" },
                                        ].map((item, index) => (
                                            <Box
                                                key={item.label}
                                                sx={{
                                                    flex: "1 1 130px",
                                                    py: 1.8,
                                                    textAlign: "center",
                                                    borderLeft: index === 0 ? "none" : "1px solid #E5E7EB",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "26px", fontWeight: "700", color: "#111827" }}>
                                                    {item.value}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.3 }}>
                                                    {item.label}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Earnings and deductions */}
                                <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex" }}>
                                        <Box sx={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: "4px" }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    px: 2,
                                                    py: 1.2,
                                                    bgcolor: "#F3F4F6",
                                                    borderBottom: "1px solid #E5E7EB",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "#374151" }}>
                                                    EARNINGS
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Amount (₹)</Typography>
                                            </Box>

                                            {[
                                                ...(payslip?.earnings || []).map((line) => ({
                                                    label: line.description || line.category,
                                                    value: line.amount,
                                                })),
                                            ].map((item) => (
                                                <Box
                                                    key={item.label}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: 2,
                                                        px: 2,
                                                        py: 1.2,
                                                        borderBottom: "1px solid #F3F4F6",
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: "13.5px", color: "#374151" }}>
                                                        {item.label}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "13.5px", fontWeight: "600", color: "#111827" }}>
                                                        {plain(item.value)}
                                                    </Typography>
                                                </Box>
                                            ))}

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    gap: 2,
                                                    px: 2,
                                                    py: 1.4,
                                                    bgcolor: "#F3F4F6",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                                                    Gross Earnings
                                                </Typography>
                                                <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                                                    {rupees(payslip?.totals.totalEarnings ?? 0)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex" }}>
                                        <Box sx={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: "4px" }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    px: 2,
                                                    py: 1.2,
                                                    bgcolor: "#F3F4F6",
                                                    borderBottom: "1px solid #E5E7EB",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "#374151" }}>
                                                    DEDUCTIONS
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Amount (₹)</Typography>
                                            </Box>

                                            {(payslip?.deductions || []).map((line) => (
                                                <Box
                                                    key={line.category + line.description}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: 2,
                                                        px: 2,
                                                        py: 1.2,
                                                        borderBottom: "1px solid #F3F4F6",
                                                    }}
                                                >
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: "13.5px", color: "#374151" }}>
                                                            {line.description || line.category}
                                                        </Typography>
                                                        {line.formula && (
                                                            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                                                                {line.formula}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Typography sx={{ fontSize: "13.5px", fontWeight: "600", color: "#111827" }}>
                                                        {plain(line.amount)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                            {!payslip?.deductions?.length && (
                                                <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid #F3F4F6" }}>
                                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                                                        No deductions this month
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    gap: 2,
                                                    px: 2,
                                                    py: 1.4,
                                                    bgcolor: "#F3F4F6",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                                                    Total Deductions
                                                </Typography>
                                                <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                                                    {rupees(payslip?.totals.totalDeductions ?? 0)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Take home */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        flexWrap: "wrap",
                                        px: 2.5,
                                        py: 2.5,
                                        borderRadius: "4px",
                                        bgcolor: "#111827",
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                color: "#9CA3AF",
                                                letterSpacing: "1.2px",
                                            }}
                                        >
                                            NET SALARY — TAKE HOME PAY
                                        </Typography>
                                        <Typography sx={{ fontSize: "13px", color: "#D1D5DB", mt: 0.6 }}>
                                            {cycleLabel} · {payslipFor.name} ({payslipFor.rollNo})
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: "34px", fontWeight: "800", color: "#fff", lineHeight: 1.1 }}>
                                        {rupees(payslip?.totals.netSalary ?? 0)}
                                    </Typography>
                                </Box>

                                {payslip?.employerContributions?.length > 0 && (
                                    <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "4px", mt: 2.5 }}>
                                        <Box sx={{ px: 2, py: 1.2, bgcolor: "#F3F4F6", borderBottom: "1px solid #E5E7EB" }}>
                                            <Typography
                                                sx={{ fontSize: "12.5px", fontWeight: "700", color: "#374151", letterSpacing: "0.8px" }}
                                            >
                                                EMPLOYER CONTRIBUTIONS — PAID BY THE SCHOOL
                                            </Typography>
                                            <Typography sx={{ fontSize: "11.5px", color: "#6B7280", mt: 0.2 }}>
                                                Shown for transparency. These are not deducted from your salary and are
                                                not part of gross or net pay above.
                                            </Typography>
                                        </Box>
                                        {payslip.employerContributions.map((line) => (
                                            <Box
                                                key={line.category + line.description}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    gap: 2,
                                                    px: 2,
                                                    py: 1.1,
                                                    borderBottom: "1px solid #F3F4F6",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "13px", color: "#374151" }}>
                                                    {line.description || line.category}
                                                </Typography>
                                                <Typography sx={{ fontSize: "13px", fontWeight: "600", color: "#6B7280" }}>
                                                    {plain(line.amount)}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                <Box sx={{ borderTop: "1px dashed #D1D5DB", my: 3 }} />

                                {/* Signatures */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3, flexWrap: "wrap" }}>
                                    {["Prepared By", "Verified By", "Authorised Signatory"].map((label) => (
                                        <Box key={label} sx={{ flex: "1 1 180px", textAlign: "center" }}>
                                            <Box sx={{ borderTop: "1px solid #9CA3AF", pt: 0.8 }}>
                                                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{label}</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", textAlign: "center", mt: 2.5 }}>
                                    This is a computer-generated payslip and does not require a signature.
                                </Typography>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fff", borderTop: "1px solid #E5E7EB" }}>
                            <Button
                                onClick={() => setPayslipFor(null)}
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
                                onClick={() => window.print()}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    px: 3.5,
                                    py: 1,
                                    bgcolor: "#111827",
                                    "&:hover": { bgcolor: "#1F2937" },
                                }}
                            >
                                Print / Download PDF
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
