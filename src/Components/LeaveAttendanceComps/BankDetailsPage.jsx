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
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { avatarToneOf, initialsOf, GREEN, BLUE } from "./LeaveAttendancePage";
import {
    rupees,
    fetchBankDetails,
    fetchEmployeesWithoutBankDetails,
    updateBankDetails,
} from "./payrollApi";

const PAGE_BG = "#F7F9F9";
const PURPLE = { main: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
const AMBER = { main: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };

/* There is no bank master in this API — bank name and branch are stored as free text on
   the salaryStructure row, so the two mock lists that used to live here were removed
   rather than left implying a lookup exists. */

/* Floating-label field used throughout the edit dialog */
const fieldSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "14px", bgcolor: "#fff" },
};

/* "Teacher" → "teaching" */
const designationOf = (category) =>
    category === "Teacher" ? "teaching" : String(category || "staff").toLowerCase();

/**
 * The four columns that make a row payable. They live on the salaryStructure row —
 * BankName, AccountNumber, IFSC, Branch — there is no separate bank table.
 */
const BANK_FIELDS = [
    { key: "bankName", label: "Bank name" },
    { key: "accountNumber", label: "Account number" },
    { key: "ifsc", label: "IFSC" },
    { key: "branch", label: "Branch" },
];

const missingFieldsOf = (row) =>
    BANK_FIELDS.filter((field) => !String(row?.[field.key] ?? "").trim()).map((field) => field.key);

/**
 * Three states, not two.
 *
 * A HALF-filled row is just as unpayable as an empty one, but in a table view it looks
 * done — the bank name is there, so the eye moves on, and it fails silently at payout.
 * "Incomplete" exists to make that visible, which is why this is not a boolean.
 *
 * Note none of these mean "verified": the API carries no verification field, so claiming
 * an account had been checked against the bank would be inventing a fact.
 */
const statusOf = (missing) => {
    if (!missing.length) return "Complete";
    return missing.length === BANK_FIELDS.length ? "Not added" : "Incomplete";
};

/* GET employeeBankDetailsDashboard row → what this table renders. */
const rowFromApi = (item) => {
    const missing = missingFieldsOf(item);
    return {
        id: item.rollNumber,
        staffId: item.rollNumber,
        rollNo: item.rollNumber,
        name: item.name,
        category: item.department || "staff",
        netSalary: item.netSalary,
        bankName: item.bankName,
        accountNumber: item.accountNumber,
        ifsc: item.ifsc,
        branch: item.branch,
        // the API has no separate account-holder field; it is the staff member
        accountHolder: item.name,
        missingFields: missing,
        status: statusOf(missing),
    };
};

export default function BankDetailsPage() {
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth);
    const [rows, setRows] = useState([]);
    const [pending, setPending] = useState(null);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: "", ok: true });

    const showSnack = (message, ok = true) => setSnack({ open: true, message, ok });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setRows((await fetchBankDetails()).map(rowFromApi));
            setLoadError("");
        } catch (error) {
            setRows([]);
            setLoadError(error.message);
        }
        /* Only used for the headline counts. It is built from salaryStructure joined to
           Users, so anyone without a structure is already excluded — no filtering needed
           here. Optional: completeness is derived per row regardless, so the screen is
           fully usable when this endpoint is unavailable. */
        try {
            setPending(await fetchEmployeesWithoutBankDetails());
        } catch {
            setPending(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const term = search.trim().toLowerCase();
    /* Rows with no bank details yet are exactly the ones this screen exists to surface,
       so every field is coerced — a blank bankName would otherwise throw on .toLowerCase()
       and take the whole table down. */
    const visibleRows = rows.filter((row) =>
        !term
            ? true
            : String(row.name ?? "").toLowerCase().includes(term) ||
              String(row.rollNo ?? "").includes(term) ||
              String(row.bankName ?? "").toLowerCase().includes(term) ||
              String(row.accountNumber ?? "").includes(term)
    );

    const completeCount = rows.filter((row) => row.status === "Complete").length;
    const incompleteCount = rows.filter((row) => row.status === "Incomplete").length;
    const pendingCount = pending?.pending ?? rows.length - completeCount;
    const completePercent = rows.length ? Math.round((completeCount / rows.length) * 100) : 0;
    /* Only complete rows can actually be paid, so a half-filled row must not be counted
       into the disbursement total — that would overstate what the bank run will move. */
    const totalPayout = rows
        .filter((row) => row.status === "Complete")
        .reduce((sum, row) => sum + row.netSalary, 0);

    const kpis = [
        {
            label: "TOTAL EMPLOYEES",
            value: rows.length,
            caption: "on payroll",
            icon: PeopleAltOutlinedIcon,
            tone: GREEN,
            filledIcon: false,
        },
        {
            /* Was "VERIFIED ACCOUNTS", which claimed a check the system never performs —
               the API has no verification field. This is completeness of the four columns. */
            label: "PAYABLE ACCOUNTS",
            value: `${completePercent}%`,
            caption: `${completeCount} of ${rows.length} have all four fields`,
            icon: CheckIcon,
            tone: BLUE,
            filledIcon: true,
        },
        {
            label: "PENDING SETUP",
            value: pendingCount,
            caption: incompleteCount
                ? `${incompleteCount} partly filled — also unpayable`
                : "awaiting bank info",
            icon: HourglassEmptyIcon,
            tone: AMBER,
            filledIcon: false,
        },
        {
            label: "TOTAL NET PAYOUT",
            value: rupees(totalPayout),
            caption: "payable accounts only",
            icon: MonetizationOnOutlinedIcon,
            tone: PURPLE,
            filledIcon: false,
        },
    ];

    /* PUT updateEmployeeBankDetailsByRollnumber — writes the four columns on this person's
       salaryStructure row. Bank details are snapshotted onto the payslip when a cycle
       reaches Credited, so an edit after that point does not alter historic payslips. */
    const saveRow = async () => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        setSaving(true);
        try {
            await updateBankDetails({
                rollNumber: editing.rollNo,
                bankName: editing.bankName,
                accountNumber: editing.accountNumber,
                ifsc: editing.ifsc,
                branch: editing.branch,
                updatedByRollNumber: authUser.rollNumber,
            });
            showSnack(`Bank details saved for ${editing.name}.`);
            setEditing(null);
            await load();
        } catch (error) {
            showSnack(error.message, false);
        }
        setSaving(false);
    };

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
                    <AccountBalanceIcon sx={{ fontSize: "22px", color: GREEN.main }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                        Employee Bank Details
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
                        Manage payroll bank accounts and disbursement information
                    </Typography>
                </Box>

                <Box sx={{ flex: 1 }} />

                <TextField
                    size="small"
                    placeholder="Search by name, roll no, or bank..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        minWidth: "320px",
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
                    Export Data
                </Button>
            </Box>

            {/* ─── Body ─── */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, pb: 3.5 }}>
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6, gap: 1.5 }}>
                        <CircularProgress size={22} sx={{ color: GREEN.main }} />
                        <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>Loading bank details…</Typography>
                    </Box>
                )}

                {!loading && loadError && (
                    <Box sx={{ mb: 2, p: 1.8, borderRadius: "10px", bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#991B1B" }}>
                            Could not load bank details
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#B91C1C", mt: 0.4 }}>{loadError}</Typography>
                    </Box>
                )}

                {/* A partially-filled record reads as done in a table and fails at payout, so
                    it gets its own callout rather than being folded into "pending". */}
                {!loading && incompleteCount > 0 && (
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
                            {incompleteCount} {incompleteCount === 1 ? "account is" : "accounts are"} partly filled
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#92400E", mt: 0.4 }}>
                            A half-filled record cannot be paid any more than an empty one, but it looks
                            complete at a glance. Hover the <strong>Incomplete</strong> chip to see which of
                            the four fields is missing.
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

                {/* Account table */}
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
                            <AccountBalanceIcon sx={{ fontSize: "19px", color: GREEN.main }} />
                        </Box>
                        <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                            Employee Bank Account Details
                        </Typography>
                        <Chip
                            label={`${visibleRows.length} employees`}
                            size="small"
                            sx={{ bgcolor: "#F3F4F6", color: "#6B7280", fontWeight: "600", fontSize: "11.5px" }}
                        />
                    </Box>

                    <TableContainer sx={{ maxHeight: "55vh" }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {[
                                        "S.NO",
                                        "EMPLOYEE",
                                        "NET SALARY",
                                        "BANK NAME",
                                        "ACCOUNT NUMBER",
                                        "IFSC CODE",
                                        "BRANCH",
                                        "STATUS",
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
                                    const complete = row.status === "Complete";
                                    const blank = (value) =>
                                        String(value ?? "").trim() ? (
                                            value
                                        ) : (
                                            <Typography component="span" sx={{ fontSize: "13px", color: "#D1D5DB" }}>
                                                —
                                            </Typography>
                                        );
                                    return (
                                        <TableRow
                                            key={row.id}
                                            sx={{ "&:hover": { bgcolor: GREEN.bg } }}
                                        >
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
                                                            {row.rollNo} · {designationOf(row.category)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
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
                                            <TableCell sx={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                                                {blank(row.bankName)}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13.5px", color: "#374151", letterSpacing: "0.3px" }}>
                                                {blank(row.accountNumber)}
                                            </TableCell>
                                            <TableCell>
                                                {String(row.ifsc ?? "").trim() ? (
                                                    <Chip
                                                        label={row.ifsc}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: BLUE.bg,
                                                            color: BLUE.main,
                                                            border: `1px solid ${BLUE.border}`,
                                                            fontWeight: "600",
                                                            fontSize: "11.5px",
                                                        }}
                                                    />
                                                ) : (
                                                    blank(row.ifsc)
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13.5px", color: "#374151" }}>
                                                {blank(row.branch)}
                                            </TableCell>
                                            <TableCell>
                                                {/* "Incomplete" is the state worth seeing: it looks filled in a
                                                    table but fails at payout, so it is coloured as a problem
                                                    rather than as progress. */}
                                                <Tooltip
                                                    title={
                                                        complete
                                                            ? "All four fields present — payable"
                                                            : `Missing: ${row.missingFields
                                                                  .map(
                                                                      (key) =>
                                                                          BANK_FIELDS.find((field) => field.key === key)
                                                                              ?.label || key
                                                                  )
                                                                  .join(", ")}`
                                                    }
                                                >
                                                    <Chip
                                                        icon={
                                                            complete ? (
                                                                <CheckCircleIcon
                                                                    sx={{ fontSize: "14px !important", color: `${GREEN.main} !important` }}
                                                                />
                                                            ) : undefined
                                                        }
                                                        label={row.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: complete ? GREEN.bg : AMBER.bg,
                                                            color: complete ? GREEN.main : AMBER.main,
                                                            border: `1px solid ${complete ? GREEN.border : AMBER.border}`,
                                                            fontWeight: "700",
                                                            fontSize: "11.5px",
                                                        }}
                                                    />
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setEditing({ ...row })}
                                                    sx={{
                                                        borderRadius: "8px",
                                                        bgcolor: BLUE.bg,
                                                        border: `1px solid ${BLUE.border}`,
                                                    }}
                                                >
                                                    <EditOutlinedIcon sx={{ fontSize: "17px", color: BLUE.main }} />
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
                                            {search.trim() ? (
                                                "No bank accounts match your search"
                                            ) : (
                                                <Box>
                                                    <Typography sx={{ fontSize: "13.5px", color: "#6B7280", fontWeight: "600" }}>
                                                        No staff are set up for bank details yet
                                                    </Typography>
                                                    {/* Not a UX rule — a hard data dependency. The four bank
                                                        columns live ON the salaryStructure row, so someone
                                                        without a structure has nowhere to store them. */}
                                                    <Typography sx={{ fontSize: "12.5px", color: "#9CA3AF", mt: 0.6 }}>
                                                        Bank details are stored on a staff member's salary structure,
                                                        so a structure has to exist first.
                                                    </Typography>
                                                    <Button
                                                        onClick={() => navigate("../salary-structures")}
                                                        sx={{
                                                            mt: 1.2,
                                                            textTransform: "none",
                                                            borderRadius: "50px",
                                                            border: `1px solid ${GREEN.border}`,
                                                            color: GREEN.dark,
                                                            fontSize: "13px",
                                                            fontWeight: "700",
                                                            px: 2.5,
                                                        }}
                                                    >
                                                        Create salary structures first
                                                    </Button>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>

            {/* ─── Edit bank account ─── */}
            <Dialog
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
            >
                {editing && (
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
                                <EditOutlinedIcon sx={{ color: GREEN.main, fontSize: "23px" }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: "20px", fontWeight: "700", color: "#111827", lineHeight: 1.25 }}>
                                    Edit Bank Account Details
                                </Typography>
                                <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                                    Update the bank account information used for salary disbursement
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={() => setEditing(null)}
                                sx={{ width: 38, height: 38, border: "1px solid #E5E7EB", borderRadius: "10px", bgcolor: "#fff" }}
                            >
                                <CloseIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ p: 2.5, bgcolor: "#F9FAFB" }}>
                            {/* Who the account belongs to */}
                            <Box
                                sx={{
                                    p: 2,
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
                                            bgcolor: BLUE.bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <BadgeOutlinedIcon sx={{ fontSize: "18px", color: BLUE.main }} />
                                    </Box>
                                    <Typography
                                        sx={{ fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.8px" }}
                                    >
                                        EMPLOYEE
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.8, minWidth: 0 }}>
                                        <Avatar
                                            sx={{
                                                width: 54,
                                                height: 54,
                                                bgcolor: avatarToneOf(editing.staffId).bg,
                                                color: avatarToneOf(editing.staffId).color,
                                                fontSize: "18px",
                                                fontWeight: "700",
                                            }}
                                        >
                                            {initialsOf(editing.name)}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                sx={{ fontSize: "18px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}
                                            >
                                                {editing.name}
                                            </Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                                <Chip
                                                    label={editing.rollNo}
                                                    size="small"
                                                    sx={{
                                                        height: 22,
                                                        bgcolor: "#F3F4F6",
                                                        color: "#4B5563",
                                                        fontWeight: "600",
                                                        fontSize: "11.5px",
                                                    }}
                                                />
                                                <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                                                    {designationOf(editing.category)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 1.2,
                                            borderRadius: "10px",
                                            bgcolor: GREEN.bg,
                                            border: `1px solid ${GREEN.border}`,
                                            textAlign: "center",
                                        }}
                                    >
                                        <Typography
                                            sx={{ fontSize: "11px", fontWeight: "700", color: GREEN.main, letterSpacing: "0.6px" }}
                                        >
                                            NET SALARY
                                        </Typography>
                                        <Typography sx={{ fontSize: "19px", fontWeight: "700", color: GREEN.dark }}>
                                            {rupees(editing.netSalary)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Account fields */}
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "12px",
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.3, mb: 2.2 }}>
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
                                        <AccountBalanceIcon sx={{ fontSize: "18px", color: GREEN.main }} />
                                    </Box>
                                    <Typography
                                        sx={{ fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.8px" }}
                                    >
                                        BANK ACCOUNT INFORMATION
                                    </Typography>
                                </Box>

                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Bank Name *"
                                            value={editing.bankName}
                                            onChange={(e) => setEditing((prev) => ({ ...prev, bankName: e.target.value }))}
                                            sx={fieldSx}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Branch Name *"
                                            value={editing.branch}
                                            onChange={(e) => setEditing((prev) => ({ ...prev, branch: e.target.value }))}
                                            sx={fieldSx}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Account Number *"
                                            value={editing.accountNumber}
                                            onChange={(e) =>
                                                setEditing((prev) => ({
                                                    ...prev,
                                                    accountNumber: e.target.value.replace(/\D/g, "").slice(0, 18),
                                                }))
                                            }
                                            sx={fieldSx}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="IFSC Code *"
                                            value={editing.ifsc}
                                            onChange={(e) =>
                                                setEditing((prev) => ({
                                                    ...prev,
                                                    // IFSC is uppercase alphanumeric, 11 characters
                                                    ifsc: e.target.value
                                                        .toUpperCase()
                                                        .replace(/[^A-Z0-9]/g, "")
                                                        .slice(0, 11),
                                                }))
                                            }
                                            sx={fieldSx}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Grid>
                                </Grid>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 1.3,
                                        mt: 2.5,
                                        p: 1.6,
                                        borderRadius: "10px",
                                        bgcolor: "#FFFBEB",
                                        border: "1px solid #FDE68A",
                                    }}
                                >
                                    <CreditCardOutlinedIcon
                                        sx={{ fontSize: "19px", color: AMBER.main, mt: "1px", flexShrink: 0 }}
                                    />
                                    <Typography sx={{ fontSize: "12.5px", color: "#B45309", lineHeight: 1.6 }}>
                                        {missingFieldsOf(editing).length ? (
                                            <>
                                                Still needed:{" "}
                                                <strong>
                                                    {missingFieldsOf(editing)
                                                        .map(
                                                            (key) =>
                                                                BANK_FIELDS.find((field) => field.key === key)?.label || key
                                                        )
                                                        .join(", ")}
                                                </strong>
                                                . All four are required — a partly filled account cannot be paid.
                                            </>
                                        ) : (
                                            <>
                                                Double-check the account number and IFSC code before saving. Incorrect
                                                details can delay or misdirect salary disbursement.
                                            </>
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fff", borderTop: "1px solid #E5E7EB" }}>
                            <Button
                                onClick={() => setEditing(null)}
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
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={
                                    saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon />
                                }
                                onClick={saveRow}
                                /* Branch counts: all four columns are needed for a payable
                                   account, and leaving it out is exactly what produces the
                                   "Incomplete" rows this screen exists to surface. */
                                disabled={saving || missingFieldsOf(editing).length > 0}
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
                                Save Changes
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
