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
    Switch,
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
import GppGoodOutlinedIcon from "@mui/icons-material/GppGoodOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { avatarToneOf, initialsOf, GREEN, RED, BLUE } from "./LeaveAttendancePage";
import {
    rupees,
    parseRate,
    parseMoney,
    isNilRate,
    fetchComplianceConfig,
    fetchEmployeeCompliance,
    savePFConfiguration,
    saveESIConfiguration,
    savePTConfiguration,
    updateEmployeeCompliance,
} from "./payrollApi";

const PAGE_BG = "#F7F9F9";
const PURPLE = { main: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
const AMBER = { main: "#D97706", bg: "#FFF7ED", border: "#FDE68A" };

const TABS = [
    { key: "employee", label: "Employee Compliance" },
    { key: "pf", label: "Provident Fund (PF)" },
    { key: "esi", label: "ESI" },
    { key: "pt", label: "Professional Tax" },
    // { key: "tds", label: "TDS" },
];

/* "Teacher" → "teaching", used under the employee name */
const designationOf = (category) =>
    category === "Teacher" ? "teaching" : String(category || "staff").toLowerCase();

/**
 * One row of GET api/payRoll/employeeComplianceDashboard.
 *
 * pf / esi / pt come back as FREE TEXT and carry two facts at once: whether the deduction
 * applies to this person, and at what rate. "N/A", "nil" or "0" all mean it does not apply,
 * which is why the toggle is derived from the value rather than stored separately.
 * The `tds` field was dropped 19 Aug 2026.
 */
const complianceRowFromApi = (item, index) => ({
    id: item.rollNumber || `row-${index}`,
    staffId: item.rollNumber,
    rollNo: item.rollNumber,
    name: item.name,
    category: item.department || item.extra?.userType || "staff",
    basic: item.basicSalary,
    incentive: item.incentive,
    additionalSalary: item.addSalary,
    pfEnabled: !isNilRate(item.pf),
    pfPercent: parseRate(item.pf),
    esiEnabled: !isNilRate(item.esi),
    esiPercent: parseRate(item.esi),
    ptEnabled: !isNilRate(item.pt),
    ptAmount: parseMoney(item.pt),
});

/* Sent back as the same free text the server stores. An "off" deduction is written as
   "N/A" rather than "0" so the intent stays readable in the database. */
const rateOut = (enabled, value, suffix) => (enabled ? `${parseMoney(value)}${suffix}` : "N/A");

/**
 * Shown only until GET getDeductionsAndCompliance answers.
 *
 * These are the statutory defaults, NOT saved values — the config row is app-wide and
 * single, and the three tabs write different column groups of it. Never save straight from
 * these without a successful load first, or an unedited tab would overwrite a real value.
 */
const INITIAL_SETTINGS = {
    pf: { enabled: true, employee: 12, employer: 12, ceiling: 15000, admin: 0.5 },
    esi: { enabled: true, employee: 0.75, employer: 3.25, ceiling: 21000 },
    pt: { enabled: true, monthly: 200, annual: 2400, applicableFrom: 15000 },
    //     tds: {
    //         enabled: true,
    //         standardDeduction: 50000,
    //         section80C: 150000,
    //         section80D: 25000,
    //         hraExemption: true,
    //     },
};

/* API config → the shape the three tabs edit. Rates are stored as free text ("12%"), so
   they are parsed for the number inputs and re-serialised on save. */
const settingsFromApi = (config) => ({
    pf: {
        enabled: config.pf.enabled,
        employee: parseRate(config.pf.employeeContribution),
        employer: parseRate(config.pf.employerContribution),
        ceiling: parseMoney(config.pf.wageCeiling),
        admin: parseRate(config.pf.adminCharges),
    },
    esi: {
        enabled: config.esi.enabled,
        employee: parseRate(config.esi.employeeContribution),
        employer: parseRate(config.esi.employerContribution),
        ceiling: parseMoney(config.esi.wageCeiling),
    },
    pt: {
        enabled: config.pt.enabled,
        monthly: parseMoney(config.pt.monthly),
        annual: parseMoney(config.pt.annual),
        applicableFrom: parseMoney(config.pt.applicableFrom),
    },
});

/* Small coloured pill used across the compliance table */
function ValuePill({ label, tone, muted }) {
    return (
        <Chip
            label={label}
            size="small"
            sx={{
                height: 24,
                minWidth: 52,
                bgcolor: muted ? "#F3F4F6" : tone.bg,
                color: muted ? "#9CA3AF" : tone.main,
                border: `1px solid ${muted ? "#E5E7EB" : tone.border}`,
                fontWeight: "700",
                fontSize: "11.5px",
            }}
        />
    );
}

/* On/off row heading each settings tab — switch takes the tab's accent */
function EnableRow({ title, description, checked, onChange, tone = GREEN, mb = 2.5 }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 1.8,
                mb,
                height: "100%",
                boxSizing: "border-box",
                borderRadius: "10px",
                bgcolor: "#F9FAFB",
                border: "1px solid #E5E7EB",
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>{title}</Typography>
                <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 0.3 }}>{description}</Typography>
            </Box>
            <Switch
                checked={checked}
                onChange={onChange}
                sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: tone.main },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: tone.main,
                        opacity: 1,
                    },
                }}
            />
        </Box>
    );
}

export default function CompliancePage() {
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth);
    const [tab, setTab] = useState("employee");
    const [search, setSearch] = useState("");
    const [rows, setRows] = useState([]);
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [editing, setEditing] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    /* Held separately per source so a failure on one does not blank the other. */
    const [configError, setConfigError] = useState("");
    const [rowsError, setRowsError] = useState("");
    /* Guards save: the three tabs write column groups of ONE shared row, so saving from the
       placeholder defaults would overwrite whatever the other tabs hold. */
    const [configLoaded, setConfigLoaded] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: "", ok: true });

    const showSnack = (message, ok = true) => setSnack({ open: true, message, ok });

    const patchSettings = (section, patch) =>
        setSettings((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));

    const loadConfig = useCallback(async () => {
        try {
            const config = await fetchComplianceConfig();
            setSettings(settingsFromApi(config));
            setConfigLoaded(true);
            setConfigError("");
        } catch (error) {
            setConfigLoaded(false);
            setConfigError(error.message);
        }
    }, []);

    const loadRows = useCallback(async () => {
        try {
            setRows((await fetchEmployeeCompliance()).map(complianceRowFromApi));
            setRowsError("");
        } catch (error) {
            setRows([]);
            setRowsError(error.message);
        }
    }, []);

    useEffect(() => {
        let live = true;
        setLoading(true);
        Promise.all([loadConfig(), loadRows()]).finally(() => {
            if (live) setLoading(false);
        });
        return () => {
            live = false;
        };
    }, [loadConfig, loadRows]);

    const term = search.trim().toLowerCase();
    const visibleRows = rows.filter((row) =>
        !term
            ? true
            : row.name.toLowerCase().includes(term) ||
              String(row.rollNo).includes(term) ||
              designationOf(row.category).includes(term)
    );

    const totalIncentives = rows.reduce((sum, row) => sum + row.incentive, 0);
    const incentiveCount = rows.filter((row) => row.incentive > 0).length;
    const totalAdditional = rows.reduce((sum, row) => sum + row.additionalSalary, 0);
    const additionalCount = rows.filter((row) => row.additionalSalary > 0).length;

    /* A deduction applies to someone only if the master toggle is on AND their own rate is
       not an opt-out. Counting rows.length whenever the toggle was on overstated coverage
       for everyone marked "N/A". */
    const countApplicable = (key) =>
        settings[key].enabled ? rows.filter((row) => row[key + "Enabled"]).length : 0;

    const kpis = [
        { label: "TOTAL EMPLOYEES", value: rows.length, caption: "on payroll", icon: PeopleAltOutlinedIcon, tone: GREEN },
        { label: "PF APPLICABLE", value: countApplicable("pf"), caption: `of ${rows.length}`, icon: AccountBalanceIcon, tone: PURPLE },
        { label: "ESI APPLICABLE", value: countApplicable("esi"), caption: `of ${rows.length}`, icon: ShieldOutlinedIcon, tone: GREEN },
        { label: "PT APPLICABLE", value: countApplicable("pt"), caption: `of ${rows.length}`, icon: ReceiptLongOutlinedIcon, tone: AMBER },
    ];

    /* PUT updateEmployeeComplianceByRollnumber — writes back to this person's
       salaryStructure PF/ESI/PT text fields. `tds` is no longer accepted, and because the
       server ignores unknown fields, sending it would silently do nothing rather than error. */
    const saveEmployee = async () => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        setSaving(true);
        try {
            await updateEmployeeCompliance({
                rollNumber: editing.rollNo,
                pf: rateOut(editing.pfEnabled, editing.pfPercent, "%"),
                esi: rateOut(editing.esiEnabled, editing.esiPercent, "%"),
                // PT is a rupee amount, not a rate
                pt: rateOut(editing.ptEnabled, editing.ptAmount, ""),
                incentive: editing.incentive,
                addSalary: editing.additionalSalary,
                updatedByRollNumber: authUser.rollNumber,
            });
            // re-read rather than patching locally — the server may normalise what it stored
            await loadRows();
            showSnack("Compliance updated for " + editing.name + ".");
            setEditing(null);
        } catch (error) {
            showSnack(error.message, false);
        }
        setSaving(false);
    };

    /**
     * Saves ONLY the active tab's column group.
     *
     * The three POSTs write different columns of the same single config row, so each one
     * carries its own Enable flag. Omitting that flag is treated as TRUE server-side, which
     * is why it is always sent explicitly rather than only when switched off — an FE that
     * never sends it can never turn a deduction off.
     */
    const saveSettings = async () => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        if (!configLoaded) {
            showSnack("Cannot save until the current configuration has loaded.", false);
            return;
        }
        setSaving(true);
        const actor = { updatedByRollNumber: authUser.rollNumber };
        try {
            let config;
            if (tab === "pf") {
                config = await savePFConfiguration({
                    enabled: settings.pf.enabled,
                    employeeContribution: settings.pf.employee,
                    employerContribution: settings.pf.employer,
                    wageCeiling: settings.pf.ceiling,
                    adminCharges: settings.pf.admin,
                    ...actor,
                });
            } else if (tab === "esi") {
                config = await saveESIConfiguration({
                    enabled: settings.esi.enabled,
                    employeeContribution: settings.esi.employee,
                    employerContribution: settings.esi.employer,
                    wageCeiling: settings.esi.ceiling,
                    ...actor,
                });
            } else {
                config = await savePTConfiguration({
                    enabled: settings.pt.enabled,
                    monthly: settings.pt.monthly,
                    annual: settings.pt.annual,
                    applicableFrom: settings.pt.applicableFrom,
                    ...actor,
                });
            }
            // every statutory POST returns the WHOLE config back — adopt it so the other two
            // tabs reflect anything the server normalised
            setSettings(settingsFromApi(config));
            showSnack("Settings saved. Applies from the next payroll calculation.");
        } catch (error) {
            showSnack(error.message, false);
        }
        setSaving(false);
    };

    /* ─────────────── Employee Compliance tab ─────────────── */
    const renderEmployeeTab = () => (
        <>
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

            {/* Money totals */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                    {
                        label: "TOTAL INCENTIVES",
                        value: rupees(totalIncentives),
                        caption: `${incentiveCount} employees receiving incentives`,
                        icon: TrendingUpIcon,
                        tone: GREEN,
                    },
                    {
                        label: "TOTAL ADDITIONAL SALARY",
                        value: rupees(totalAdditional),
                        caption: `${additionalCount} employees with additional salary`,
                        icon: PaymentsOutlinedIcon,
                        tone: RED,
                    },
                ].map((card) => {
                    const CardIcon = card.icon;
                    return (
                        <Grid key={card.label} size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1,
                                    width: "100%",
                                    p: 2,
                                    boxSizing: "border-box",
                                    borderRadius: "12px",
                                    bgcolor: card.tone.bg,
                                    border: `1px solid ${card.tone.border}`,
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{ fontSize: "12px", fontWeight: "700", color: card.tone.main, letterSpacing: "0.6px" }}
                                    >
                                        {card.label}
                                    </Typography>
                                    <Typography
                                        sx={{ fontSize: "31px", fontWeight: "700", color: "#111827", lineHeight: 1.35 }}
                                    >
                                        {card.value}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>{card.caption}</Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "10px",
                                        bgcolor: "#fff",
                                        border: `1px solid ${card.tone.border}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <CardIcon sx={{ fontSize: "23px", color: card.tone.main }} />
                                </Box>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Per-employee table */}
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
                        <GppGoodOutlinedIcon sx={{ fontSize: "19px", color: GREEN.main }} />
                    </Box>
                    <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                        Employee Compliance Settings
                    </Typography>
                    <Chip
                        label={`${visibleRows.length} employees`}
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
                                    "BASIC SALARY",
                                    "INCENTIVE",
                                    "ADD. SALARY",
                                    "PF",
                                    "ESI",
                                    "PT",
                                    // "TDS",
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
                                                        sx={{ fontSize: "14px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}
                                                    >
                                                        {row.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF" }}>
                                                        {row.rollNo} · {designationOf(row.category)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                                            {rupees(row.basic)}
                                        </TableCell>
                                        <TableCell>
                                            <ValuePill label={rupees(row.incentive)} tone={GREEN} muted={!row.incentive} />
                                        </TableCell>
                                        <TableCell>
                                            <ValuePill
                                                label={row.additionalSalary ? rupees(row.additionalSalary) : "Nil"}
                                                tone={BLUE}
                                                muted={!row.additionalSalary}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <ValuePill
                                                label={row.pfEnabled ? `${row.pfPercent}%` : "Off"}
                                                tone={PURPLE}
                                                muted={!row.pfEnabled}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <ValuePill
                                                label={row.esiEnabled ? `${row.esiPercent}%` : "Off"}
                                                tone={GREEN}
                                                muted={!row.esiEnabled}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <ValuePill
                                                label={row.ptEnabled ? rupees(row.ptAmount) : "Off"}
                                                tone={AMBER}
                                                muted={!row.ptEnabled}
                                            />
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
                                        colSpan={10}
                                        sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: "13px" }}
                                    >
                                        No employees match your search
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );

    /* ─────────────── Settings card wrapper ─────────────── */
    const settingsCard = (title, subtitle, icon, tone, children) => {
        const CardIcon = icon;
        return (
            <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.2, py: 1.8 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            bgcolor: tone.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <CardIcon sx={{ fontSize: "21px", color: tone.main }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "17px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}>
                            {title}
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>{subtitle}</Typography>
                    </Box>
                </Box>

                <Box sx={{ borderTop: "1px solid #E5E7EB", p: 2.2 }}>{children}</Box>
            </Box>
        );
    };

    /* Number field with a floating label, matching the settings layout */
    const settingField = ({ label, value, onChange, prefix, suffix, disabled }) => (
        <TextField
            fullWidth
            size="small"
            type="number"
            label={label}
            value={value}
            onChange={onChange}
            disabled={disabled}
            sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "14px", bgcolor: "#F9FAFB" },
            }}
            slotProps={{
                inputLabel: { shrink: true },
                input: {
                    startAdornment: prefix ? (
                        <InputAdornment position="start">
                            <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>{prefix}</Typography>
                        </InputAdornment>
                    ) : null,
                    endAdornment: suffix ? (
                        <InputAdornment position="end">
                            <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>{suffix}</Typography>
                        </InputAdornment>
                    ) : null,
                },
            }}
        />
    );

    /* ─────────────── PF tab ─────────────── */
    const renderPfTab = () =>
        settingsCard(
            "Provident Fund (PF) Configuration",
            "Configure employee and employer PF contribution rates",
            AccountBalanceIcon,
            PURPLE,
            <>
                <EnableRow
                    title="Enable PF Deduction"
                    description="Automatically deduct PF from employee salary"
                    checked={settings.pf.enabled}
                    tone={PURPLE}
                    onChange={(e) => patchSettings("pf", { enabled: e.target.checked })}
                />
                <Grid container spacing={2.5}>
                    {[
                        { key: "employee", label: "Employee Contribution", suffix: "%" },
                        { key: "employer", label: "Employer Contribution", suffix: "%" },
                        { key: "ceiling", label: "Wage Ceiling Limit", prefix: "₹" },
                        { key: "admin", label: "Admin Charges", suffix: "%" },
                    ].map((field) => (
                        <Grid key={field.key} size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                            {settingField({
                                label: field.label,
                                value: settings.pf[field.key],
                                onChange: (e) => patchSettings("pf", { [field.key]: e.target.value }),
                                prefix: field.prefix,
                                suffix: field.suffix,
                                disabled: !settings.pf.enabled,
                            })}
                            {/* The PF and ESI ceilings behave OPPOSITELY, so they must not read
                                alike: this one caps the calculation base, the ESI one decides
                                eligibility. Same word, reversed meaning. */}
                            {field.key === "ceiling" && (
                                <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 1 }}>
                                    A cap on the amount PF is calculated on — not an eligibility test.
                                    Staff earning above this still pay PF, calculated on the ceiling.
                                </Typography>
                            )}
                        </Grid>
                    ))}
                </Grid>

                <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 2 }}>
                    PF is calculated on <strong>Basic + DA</strong>. Where DA is non-zero, PF is
                    higher than a Basic-only figure.
                </Typography>
            </>
        );

    /* ─────────────── ESI tab ─────────────── */
    const renderEsiTab = () =>
        settingsCard(
            "ESI Configuration",
            "Configure employee and employer ESI contribution rates",
            ShieldOutlinedIcon,
            GREEN,
            <>
                <EnableRow
                    title="Enable ESI Deduction"
                    description="Applies to employees whose contracted gross is at or below the wage ceiling"
                    checked={settings.esi.enabled}
                    tone={GREEN}
                    onChange={(e) => patchSettings("esi", { enabled: e.target.checked })}
                />
                <Grid container spacing={2.5}>
                    {[
                        { key: "employee", label: "Employee Contribution", suffix: "%" },
                        { key: "employer", label: "Employer Contribution", suffix: "%" },
                        { key: "ceiling", label: "Wage Ceiling Limit", prefix: "₹" },
                    ].map((field) => (
                        <Grid key={field.key} size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                            {settingField({
                                label: field.label,
                                value: settings.esi[field.key],
                                onChange: (e) => patchSettings("esi", { [field.key]: e.target.value }),
                                prefix: field.prefix,
                                suffix: field.suffix,
                                disabled: !settings.esi.enabled,
                            })}
                            {field.key === "ceiling" && (
                                <Typography sx={{ fontSize: "12.5px", fontWeight: "700", color: "#047857", mt: 1 }}>
                                    ESI applies if contracted gross is at or below this limit
                                </Typography>
                            )}
                        </Grid>
                    ))}
                </Grid>

                {/* Eligibility used to be tested against what the month actually earned, so a
                    month of heavy unpaid leave could pull someone under the ceiling, start
                    deducting ESI, and stop again the next month. */}
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 2 }}>
                    Eligibility is tested on <strong>contracted</strong> gross, so coverage no longer
                    changes month to month with attendance. The contribution itself is still charged
                    on wages actually earned, so a light month pays proportionally less.
                </Typography>
            </>
        );

    /* ─────────────── Professional Tax tab ─────────────── */
    const renderPtTab = () =>
        settingsCard(
            "Professional Tax (PT) Configuration",
            "Configure state-specific professional tax slabs",
            ReceiptLongOutlinedIcon,
            AMBER,
            <>
                <EnableRow
                    title="Enable Professional Tax"
                    description="Deduct PT as per state regulations"
                    checked={settings.pt.enabled}
                    tone={AMBER}
                    onChange={(e) => patchSettings("pt", { enabled: e.target.checked })}
                />

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        {settingField({
                            label: "Monthly PT Deduction",
                            value: settings.pt.monthly,
                            // Annual follows the monthly figure unless it is edited directly
                            onChange: (e) =>
                                patchSettings("pt", {
                                    monthly: e.target.value,
                                    annual: (Number(e.target.value) || 0) * 12,
                                }),
                            prefix: "₹",
                            disabled: !settings.pt.enabled,
                        })}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        {settingField({
                            label: "Annual PT Deduction",
                            value: settings.pt.annual,
                            onChange: (e) => patchSettings("pt", { annual: e.target.value }),
                            prefix: "₹",
                            disabled: !settings.pt.enabled,
                        })}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                        {settingField({
                            label: "Applicable From Salary",
                            value: settings.pt.applicableFrom,
                            onChange: (e) => patchSettings("pt", { applicableFrom: e.target.value }),
                            prefix: "₹",
                            disabled: !settings.pt.enabled,
                        })}
                        {/* "above" was wrong at the boundary: at exactly the threshold PT DOES
                            apply. The threshold is enforced now, so the wording decides whether
                            an admin sets it one rupee off. */}
                        <Typography sx={{ fontSize: "12.5px", fontWeight: "700", color: "#C2410C", mt: 1 }}>
                            PT applicable if gross salary is at or above this limit
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.8 }}>
                            Leave at <strong>0</strong> to skip the threshold entirely. Annual PT is a real
                            ceiling — the last chargeable month of the year may show a part-month amount
                            once the annual total is reached.
                        </Typography>
                    </Grid>
                </Grid>
            </>
        );

    /* TDS SWITCHED OFF 19 Aug 2026 — postTDSConfiguration and payslip/tds now 404.
       Commented out rather than deleted: TDS returns as its own module and most of this
       can be revived. Must stay UNMOUNTED, not merely hidden — a mounted component keeps
       firing the dead endpoints on load. */
    //     /* ─────────────── TDS tab ─────────────── */
    //     const renderTdsTab = () =>
    //         settingsCard(
    //             "Tax Deducted at Source (TDS) Configuration",
    //             "Configure income tax deduction settings and exemptions",
    //             PaymentsOutlinedIcon,
    //             BLUE,
    //             <>
    //                 <EnableRow
    //                     title="Enable TDS Calculation"
    //                     description="Calculate and deduct income tax as per IT Act"
    //                     checked={settings.tds.enabled}
    //                     tone={BLUE}
    //                     onChange={(e) => patchSettings("tds", { enabled: e.target.checked })}
    //                 />
    // 
    //                 <Grid container spacing={2.5}>
    //                     {[
    //                         { key: "standardDeduction", label: "Standard Deduction" },
    //                         { key: "section80C", label: "Section 80C Limit" },
    //                         { key: "section80D", label: "Section 80D Limit (Medical Insurance)" },
    //                     ].map((field) => (
    //                         <Grid key={field.key} size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
    //                             {settingField({
    //                                 label: field.label,
    //                                 value: settings.tds[field.key],
    //                                 onChange: (e) => patchSettings("tds", { [field.key]: e.target.value }),
    //                                 prefix: "₹",
    //                                 disabled: !settings.tds.enabled,
    //                             })}
    //                         </Grid>
    //                     ))}
    // 
    //                     <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex" }}>
    //                         <EnableRow
    //                             title="Enable HRA Exemption"
    //                             description="Exempt House Rent Allowance from TDS"
    //                             checked={settings.tds.hraExemption}
    //                             tone={BLUE}
    //                             mb={0}
    //                             onChange={(e) => patchSettings("tds", { hraExemption: e.target.checked })}
    //                         />
    //                     </Grid>
    //                 </Grid>
    //             </>
    //         );
    // 
    const renderTabContent = () => {
        switch (tab) {
            case "pf":
                return renderPfTab();
            case "esi":
                return renderEsiTab();
            case "pt":
                return renderPtTab();
            // case "tds":
            //     return renderTdsTab();
            default:
                return renderEmployeeTab();
        }
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
                    <GppGoodOutlinedIcon sx={{ fontSize: "22px", color: GREEN.main }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "21px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                        Auto-Deductions &amp; Compliance
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
                        Configure statutory compliance settings and per-employee deductions
                    </Typography>
                </Box>

                <Box sx={{ flex: 1 }} />

                {/* The employee list searches and exports; the settings tabs save */}
                {tab === "employee" ? (
                    <>
                        <TextField
                            size="small"
                            placeholder="Search by name, ID, or designation..."
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
                            startIcon={<SaveAltIcon />}
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
                    </>
                ) : (
                    <Button
                        variant="contained"
                        onClick={saveSettings}
                        disabled={saving || loading || !configLoaded}
                        startIcon={
                            saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon />
                        }
                        sx={{
                            textTransform: "none",
                            borderRadius: "50px",
                            fontSize: "14px",
                            fontWeight: "700",
                            px: 3,
                            py: 1,
                            bgcolor: "#0B1220",
                            "&:hover": { bgcolor: "#1F2937" },
                        }}
                    >
                        {saving ? "Saving…" : "Save Settings"}
                    </Button>
                )}
            </Box>

            {/* ─── Tabs ─── */}
            <Box
                sx={{
                    display: "flex",
                    gap: 0.5,
                    px: 2,
                    bgcolor: "#fff",
                    borderBottom: "1px solid #E5E7EB",
                    overflowX: "auto",
                    flexShrink: 0,
                }}
            >
                {TABS.map((item) => {
                    const active = tab === item.key;
                    return (
                        <Box
                            key={item.key}
                            onClick={() => setTab(item.key)}
                            sx={{
                                px: 2,
                                py: 1.6,
                                cursor: "pointer",
                                userSelect: "none",
                                whiteSpace: "nowrap",
                                borderBottom: `3px solid ${active ? GREEN.main : "transparent"}`,
                                color: active ? GREEN.main : "#6B7280",
                                transition: "0.2s",
                                "&:hover": { color: active ? GREEN.main : "#374151" },
                            }}
                        >
                            <Typography sx={{ fontSize: "14px", fontWeight: active ? "700" : "600", color: "inherit" }}>
                                {item.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* ─── Body ─── */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, pb: 3.5 }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8, gap: 1.5 }}>
                        <CircularProgress size={22} sx={{ color: GREEN.main }} />
                        <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
                            Loading statutory configuration…
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Surface the real server message rather than an empty table. These
                            endpoints currently fail with "Unknown column 's.TDS'" because the
                            TDS columns were dropped from the database while the deployed
                            backend still selects them — a deployment gap, not a data problem.
                            An admin seeing a blank grid would reasonably assume the data is
                            gone, so say what broke. */}
                        {(tab === "employee" ? rowsError : configError) && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 1.2,
                                    mb: 2,
                                    p: 1.8,
                                    borderRadius: "10px",
                                    bgcolor: "#FEF2F2",
                                    border: "1px solid #FECACA",
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#991B1B" }}>
                                        This screen could not load from the server
                                    </Typography>
                                    <Typography sx={{ fontSize: "12.5px", color: "#B91C1C", mt: 0.4 }}>
                                        {tab === "employee" ? rowsError : configError}
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.8 }}>
                                        Nothing below is live. Saving is disabled until the configuration
                                        loads, so an unedited field cannot overwrite a stored value.
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        {renderTabContent()}
                    </>
                )}
            </Box>

            {/* ─── Per-employee overrides ─── */}
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
                                    Edit Compliance Settings
                                </Typography>
                                <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                                    Update statutory deductions and salary components for this employee
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
                            {/* Who this is for */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 2,
                                    flexWrap: "wrap",
                                    p: 2,
                                    mb: 2,
                                    bgcolor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "12px",
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
                                        <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}>
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
                                        BASIC SALARY
                                    </Typography>
                                    <Typography sx={{ fontSize: "19px", fontWeight: "700", color: GREEN.dark }}>
                                        {rupees(editing.basic)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Salary components */}
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
                                            bgcolor: GREEN.bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <TrendingUpIcon sx={{ fontSize: "18px", color: GREEN.main }} />
                                    </Box>
                                    <Typography
                                        sx={{ fontSize: "13px", fontWeight: "700", color: "#374151", letterSpacing: "0.8px" }}
                                    >
                                        SALARY COMPONENTS
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    {[
                                        {
                                            key: "incentive",
                                            label: "Performance Incentive",
                                            helper: "Monthly performance-based incentive",
                                        },
                                        {
                                            key: "additionalSalary",
                                            label: "Additional Salary",
                                            helper: "One-time or special allowance",
                                        },
                                    ].map((field) => (
                                        <Grid key={field.key} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                label={field.label}
                                                value={editing[field.key]}
                                                onChange={(e) =>
                                                    setEditing((prev) => ({ ...prev, [field.key]: e.target.value }))
                                                }
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: "8px",
                                                        fontSize: "14px",
                                                        bgcolor: "#F9FAFB",
                                                    },
                                                }}
                                                slotProps={{
                                                    inputLabel: { shrink: true },
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>₹</Typography>
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                            />
                                            <Typography sx={{ fontSize: "11.5px", color: "#6B7280", mt: 0.7 }}>
                                                {field.helper}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {/* Statutory deductions */}
                            <Grid container spacing={2}>
                                {[
                                    {
                                        title: "Provident Fund",
                                        icon: AccountBalanceIcon,
                                        tone: PURPLE,
                                        enabledKey: "pfEnabled",
                                        valueKey: "pfPercent",
                                        label: "PF Percentage",
                                        suffix: "%",
                                    },
                                    {
                                        title: "ESI",
                                        icon: ShieldOutlinedIcon,
                                        tone: GREEN,
                                        enabledKey: "esiEnabled",
                                        valueKey: "esiPercent",
                                        label: "ESI Percentage",
                                        suffix: "%",
                                    },
                                    {
                                        title: "Professional Tax",
                                        icon: ReceiptLongOutlinedIcon,
                                        tone: AMBER,
                                        enabledKey: "ptEnabled",
                                        valueKey: "ptAmount",
                                        label: "PT Amount",
                                        prefix: "₹",
                                    },
                                ].map((card) => {
                                    const CardIcon = card.icon;
                                    const on = Boolean(editing[card.enabledKey]);
                                    return (
                                        <Grid key={card.title} size={{ xs: 12, sm: 6, md: 6, lg: 6 }} sx={{ display: "flex" }}>
                                            <Box
                                                sx={{
                                                    width: "100%",
                                                    p: 2,
                                                    boxSizing: "border-box",
                                                    bgcolor: "#fff",
                                                    border: `1px solid ${on ? card.tone.border : "#E5E7EB"}`,
                                                    borderRadius: "12px",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.3, mb: 1.8 }}>
                                                    <Box
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: "9px",
                                                            bgcolor: card.tone.bg,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <CardIcon sx={{ fontSize: "18px", color: card.tone.main }} />
                                                    </Box>
                                                    <Typography
                                                        sx={{ flex: 1, fontSize: "15px", fontWeight: "700", color: "#111827" }}
                                                    >
                                                        {card.title}
                                                    </Typography>
                                                    <Switch
                                                        size="small"
                                                        checked={on}
                                                        onChange={(e) =>
                                                            setEditing((prev) => ({
                                                                ...prev,
                                                                [card.enabledKey]: e.target.checked,
                                                            }))
                                                        }
                                                        sx={{
                                                            "& .MuiSwitch-switchBase.Mui-checked": { color: card.tone.main },
                                                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                                backgroundColor: card.tone.main,
                                                                opacity: 1,
                                                            },
                                                        }}
                                                    />
                                                </Box>

                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="number"
                                                    label={card.label}
                                                    disabled={!on}
                                                    value={editing[card.valueKey]}
                                                    onChange={(e) =>
                                                        setEditing((prev) => ({ ...prev, [card.valueKey]: e.target.value }))
                                                    }
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: "8px",
                                                            fontSize: "14px",
                                                            bgcolor: "#F9FAFB",
                                                        },
                                                    }}
                                                    slotProps={{
                                                        inputLabel: { shrink: true },
                                                        input: {
                                                            startAdornment: card.prefix ? (
                                                                <InputAdornment position="start">
                                                                    <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
                                                                        {card.prefix}
                                                                    </Typography>
                                                                </InputAdornment>
                                                            ) : null,
                                                            endAdornment: card.suffix ? (
                                                                <InputAdornment position="end">
                                                                    <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
                                                                        {card.suffix}
                                                                    </Typography>
                                                                </InputAdornment>
                                                            ) : null,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
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
                                disabled={saving}
                                startIcon={
                                    saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon />
                                }
                                onClick={saveEmployee}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    px: 3.5,
                                    py: 1,
                                    bgcolor: GREEN.main,
                                    "&:hover": { bgcolor: GREEN.dark },
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
