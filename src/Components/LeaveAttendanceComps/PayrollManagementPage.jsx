import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, IconButton, TextField, MenuItem, Tooltip, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckIcon from "@mui/icons-material/Check";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";

import { monthLabel, toPayoutMonth, fetchPayrollCycle } from "./payrollApi";

const PAGE_BG = "#F7F9F9";

/* Payroll runs through these four stages each month. The server owns the progression —
   GET api/payroll/cycle returns the stage, so nothing here tracks it client-side. */
export const PAYROLL_STAGES = [
    { key: "cutoff", label: "Attendance Cutoff", caption: "Lock monthly attendance", icon: CheckIcon },
    { key: "calculation", label: "Salary Calculation", caption: "Compute gross / LOP / net", icon: CheckIcon },
    { key: "approval", label: "Manager Approval", caption: "Review & approve register", icon: HowToRegOutlinedIcon },
    { key: "credited", label: "Salary Credited", caption: "Paid to bank & payslips shared", icon: SavingsOutlinedIcon },
];

/* Cycle status → how many of the four steps above are complete. */
const STAGE_INDEX = { None: 0, AttendanceLocked: 1, Calculated: 2, Approved: 3, Credited: 4 };

const STAGE_DONE = { main: "#059669", bg: "#059669", ring: "#059669" };
const STAGE_ACTIVE = { main: "#F97316", bg: "#FFFFFF", ring: "#F97316" };
const STAGE_TODO = { main: "#9CA3AF", bg: "#F3F4F6", ring: "#E5E7EB" };

export const PAYROLL_MODULES = [
    {
        slug: "salary-structures",
        title: "Create Salary Structures",
        description:
            "Configure salary components and define earnings / deduction rules for employee categories and salary grades.",
        icon: AssignmentOutlinedIcon,
        color: "#A855F7",
        bg: "#FBF5FF",
    },
    {
        slug: "compliance",
        title: "Auto-Deductions & Compliance",
        description:
            // TDS dropped 19 Aug 2026 — the module is switched off backend-side and returns separately
        "Manage statutory deductions: Provident Fund (PF), ESI and Professional Tax (PT) settings for payroll compliance.",
        icon: AccountBalanceIcon,
        color: "#3B82F6",
        bg: "#EFF6FF",
    },
    {
        slug: "bank-details",
        title: "Bank Details",
        description:
            "Manage employee bank account details for salary disbursement and maintain records for payroll processing.",
        icon: ReceiptLongOutlinedIcon,
        color: "#06B6D4",
        bg: "#E3F6FA",
    },
    {
        slug: "salary-register",
        title: "Audit-Ready Salary Register",
        description:
            "View and export detailed salary breakdowns per employee including earnings, deductions, and net pay for each month.",
        icon: DescriptionOutlinedIcon,
        color: "#E11D48",
        bg: "#FEF2F3",
    },
    {
        slug: "run-approve",
        title: "Run & Approve Payroll",
        description:
            "Process monthly payroll, approve salary disbursement, and download professional payslips for employees.",
        icon: CheckCircleOutlineIcon,
        color: "#F59E0B",
        bg: "#FEF6EC",
    },
    {
        slug: "mark-credited",
        title: "Mark Salary Credited",
        description:
            "Record salary as credited for any month — including past-month salaries paid in the current month, with a credited-on date.",
        icon: SavingsOutlinedIcon,
        color: "#059669",
        bg: "#EDFBF3",
    },
];

/* Current PAYOUT month plus the previous eleven, in the "YYYY-MM" form the cycle
   endpoints take. Rendered through monthLabel() so the user still reads "August 2026". */
const buildMonthOptions = () => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) =>
        toPayoutMonth(new Date(now.getFullYear(), now.getMonth() - i, 1))
    );
};

export default function PayrollManagementPage() {
    const navigate = useNavigate();
    const [monthOptions] = useState(buildMonthOptions);
    const [month, setMonth] = useState(monthOptions[0]);
    const [cycle, setCycle] = useState(null);
    const [loadingCycle, setLoadingCycle] = useState(true);

    const loadCycle = useCallback(async () => {
        setLoadingCycle(true);
        try {
            setCycle(await fetchPayrollCycle({ payoutMonth: month }));
        } catch {
            // A month with no cycle row yet is a normal state, not an error worth shouting
            setCycle(null);
        }
        setLoadingCycle(false);
    }, [month]);

    useEffect(() => {
        loadCycle();
    }, [loadCycle]);

    const currentStage = STAGE_INDEX[cycle?.status] ?? 0;

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
                    py: 1.8,
                    bgcolor: "#fff",
                    borderBottom: "1px solid #E5E7EB",
                    flexShrink: 0,
                }}
            >
                <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                    <ArrowBackIcon sx={{ fontSize: "19px", color: "#111827" }} />
                </IconButton>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                        Payroll Management
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
                        Process, approve and audit salaries with complete statutory compliance
                    </Typography>
                </Box>

                <Box sx={{ flex: 1 }} />

                <TextField
                    select
                    size="small"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    sx={{
                        minWidth: "215px",
                        "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "14.5px", fontWeight: 600 },
                    }}
                >
                    {monthOptions.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: "13.5px" }}>
                            {monthLabel(option)}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {/* ─── Body ─── */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, pb: 3.5 }}>
                {/* Processing stages */}
                <Box
                    sx={{
                        p: 1.8,
                        mb: 2.5,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mb: 1.8 }}>
                        {loadingCycle
                            ? "Checking this month's payroll cycle…"
                            : cycle
                            ? /* Arrears: the payout month pays for the month before it. Saying so
                                 here is the cheapest place to stop it being misread. */
                              `${cycle.payoutMonth} pays for ${cycle.attendanceMonth} · currently ${
                                  cycle.status === "None" ? "not started" : cycle.status
                              }`
                            : `No payroll cycle started for ${monthLabel(month)} yet`}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "flex-start", overflowX: "auto" }}>
                        {PAYROLL_STAGES.map((stage, index) => {
                            const done = index < currentStage;
                            const active = index === currentStage;
                            const tone = done ? STAGE_DONE : active ? STAGE_ACTIVE : STAGE_TODO;
                            const StageIcon = done ? CheckIcon : stage.icon;
                            return (
                                <React.Fragment key={stage.key}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            textAlign: "center",
                                            minWidth: "125px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: "50%",
                                                bgcolor: done ? STAGE_DONE.bg : tone.bg,
                                                border: `2px solid ${tone.ring}`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxSizing: "border-box",
                                            }}
                                        >
                                            <StageIcon
                                                sx={{ fontSize: "20px", color: done ? "#fff" : tone.main }}
                                            />
                                        </Box>
                                        <Typography
                                            sx={{
                                                fontSize: "12.5px",
                                                fontWeight: "700",
                                                color: active ? STAGE_ACTIVE.main : done ? "#111827" : "#9CA3AF",
                                                mt: 0.9,
                                            }}
                                        >
                                            {stage.label}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "10.5px",
                                                color: active ? STAGE_ACTIVE.main : "#9CA3AF",
                                                mt: 0.2,
                                            }}
                                        >
                                            {stage.caption}
                                        </Typography>
                                    </Box>

                                    {index < PAYROLL_STAGES.length - 1 && (
                                        <Box
                                            sx={{
                                                flex: 1,
                                                minWidth: "30px",
                                                height: "2px",
                                                mt: "18px",
                                                bgcolor: index < currentStage ? STAGE_DONE.main : "#E5E7EB",
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Box>
                </Box>

                {/* Modules */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                        Payroll Management Modules
                    </Typography>
                    <Tooltip title="Each module handles one part of the monthly payroll cycle">
                        <InfoOutlinedIcon sx={{ fontSize: "17px", color: "#9CA3AF" }} />
                    </Tooltip>
                </Box>

                <Grid container spacing={2.5}>
                    {PAYROLL_MODULES.map((module) => {
                        const ModuleIcon = module.icon;
                        return (
                            <Grid key={module.slug} size={{ xs: 12, sm: 12, md: 6, lg: 4 }} sx={{ display: "flex" }}>
                                <Box
                                    onClick={() => navigate(module.slug, { state: { value: "Y" } })}
                                    sx={{
                                        p: 2.5,
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        boxSizing: "border-box",
                                        borderRadius: "12px",
                                        bgcolor: module.bg,
                                        border: `1px solid ${module.color}22`,
                                        cursor: "pointer",
                                        transition: "transform 0.25s, box-shadow 0.25s",
                                        "&:hover": {
                                            transform: "translateY(-3px)",
                                            boxShadow: `0 8px 20px ${module.color}26`,
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 54,
                                            height: 54,
                                            borderRadius: "12px",
                                            bgcolor: "#fff",
                                            border: `1.5px solid ${module.color}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mb: 2,
                                        }}
                                    >
                                        <ModuleIcon sx={{ fontSize: "27px", color: module.color }} />
                                    </Box>
                                    <Typography
                                        sx={{ fontSize: "17.5px", fontWeight: "700", color: "#111827", mb: 1 }}
                                    >
                                        {module.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: "13.5px", color: "#4B5563", lineHeight: 1.65 }}>
                                        {module.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
}
