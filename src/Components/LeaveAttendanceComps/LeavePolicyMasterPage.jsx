import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Box,
    Typography,
    IconButton,
    Switch,
    TextField,
    InputAdornment,
    MenuItem,
    Chip,
    Divider,
    Collapse,
    Button,
    Radio,
    Tooltip,
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
    Avatar,
    Checkbox,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PolicyIcon from "@mui/icons-material/Policy";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import SnackBar from "../SnackBar";
import {
    buildPolicyPayload,
    fetchLeavePolicy,
    policyFromApi,
    saveLeavePolicy,
    fetchLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    buildCalendarPayload,
    calendarFromApi,
    fetchWorkingCalendar,
    saveWorkingCalendar,
    fetchUnassignedStaff,
    fetchShiftStaff,
    assignStaff,
    moveStaffToShift,
    unassignStaffFromShift,
    BONUS_AMOUNT_TYPES,
    fetchEmployeeLeaveBalance,
    ENCASH_CREDITED_WHEN_TO_API,
    ENCASH_FORMULA_TO_API,
    ENCASH_FORMULA_HINT,
} from "./leavePolicyApi";
import { fetchBiometricMappings } from "./leaveAttendanceApi";

/* ───────────────────────── Theme tokens ─────────────────────────
   Each section carries its own accent colour (main / light bg / border). */
const ACCENT = {
    autoRenew: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    shift: { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
    attendance: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    deduction: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    leaveTypes: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
    calendar: { color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" },
};
const GREEN = "#10B981";
const GREEN_BG = "#ECFDF5";
const GREEN_BORDER = "#A7F3D0";
const AMBER = "#F59E0B";
const TAB_ACTIVE = "#F6B93B";

/* Amount options for the bonus dropdowns */
const AMOUNT_OPTIONS = [250, 500, 750, 1000, 1500, 2000, 2500, 3000, 5000];

/* Payout schedule options */
const PAYOUT_OPTIONS = ["Monthly", "Quarterly", "Half-Yearly", "Yearly"];

/* Salary register options for deduct / credit-back */
/* The five values deductionAppliedWhen / creditBackWhen accept, in API order */
const REGISTER_OPTIONS = ["Same Month", "Next Month", "Quarterly", "Half-Yearly", "Yearly"];

/* Salary deduction formula choices — shown as radio cards */
const FORMULA_OPTIONS = [
    {
        key: "working",
        title: "Gross / Working Days",
        formula: "Monthly Gross Salary ÷ Total Working Days of the Month",
        example: "e.g., ₹30,000 ÷ 26 working days = ₹1,153.84 per leave day",
    },
    {
        key: "calendar",
        title: "Gross / Calendar Days",
        formula: "Monthly Gross Salary ÷ Total Days in the Month",
        example: "e.g., ₹30,000 ÷ 30 calendar days = ₹1,000 per leave day",
    },
    {
        key: "fixed",
        title: "Gross / Fixed (30)",
        formula: "Monthly Gross Salary ÷ 30 (fixed)",
        example: "e.g., ₹30,000 ÷ 30 = ₹1,000 per leave day (every month)",
    },
];

/* Shifts come from GetLeavePolicy; see leavePolicyApi.shiftFromApi for the shape. */

/* Accent assigned to each shift, by position */
const SHIFT_COLORS = ["#0891B2", "#7C3AED", "#F97316", "#059669", "#DB2777"];

/* "14:00" → "2:00 PM" */
const formatTime = (value) => {
    const [rawHour, rawMinute] = String(value || "").split(":");
    const hour = Number(rawHour);
    if (Number.isNaN(hour)) return value;
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display}:${rawMinute} ${period}`;
};

/* Initials for the staff avatar */
const initialsOf = (name) =>
    String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

/* Allocation periods — label shown after "day(s) /", how many months the period spans,
   and the reset wording used on the period picker */
const PERIOD_META = {
    Monthly: { unit: "month", months: 1, resets: "Resets every month" },
    Quarterly: { unit: "quarter", months: 3, resets: "Resets every 3 months" },
    "Half-Yearly": { unit: "half-year", months: 6, resets: "Resets every 6 months" },
    Yearly: { unit: "year", months: 12, resets: "Resets every year" },
};
const PERIOD_OPTIONS = Object.keys(PERIOD_META);

/* End-of-period action for unused days */
const END_ACTIONS = {
    Encash: {
        color: "#059669",
        bg: "#ECFDF5",
        border: "#A7F3D0",
        desc: "Credited to salary",
        summary: "Encashed (credited to salary)",
    },
    "Carry Forward": {
        color: "#2563EB",
        bg: "#EFF6FF",
        border: "#BFDBFE",
        desc: "Added to next period",
        summary: "Carried forward to the next period",
    },
    Lapse: {
        color: "#DC2626",
        bg: "#FEF2F2",
        border: "#FECACA",
        desc: "Lost at period end",
        summary: "Lapses (expires)",
    },
};
const END_ACTION_OPTIONS = Object.keys(END_ACTIONS);

/* Colour tags available for a leave type card */
const LEAVE_COLORS = [
    "#3457D5",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#6B7280",
    "#F97316",
    "#059669",
];

/* Leave types come from GetleaveTypes; see leavePolicyApi.leaveTypeFromApi for the shape. */

/* ── Working calendar. Expected from API: GetWorkingcalendar ── */
/* Week starts on Sunday to match the calendar grid */
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* Default weekly pattern — index matches WEEK_DAYS (0 = Sunday) */
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5, 6];

/* The three states a date can cycle through */
const DAY_STATUS = {
    working: { color: "#059669", bg: "#F0FDF4", tag: "" },
    holiday: { color: "#DC2626", bg: "#FEF2F2", tag: "OFF" },
    mandatory: { color: "#D97706", bg: "#FFFBEB", tag: "MWD" },
};
const NEXT_STATUS = { working: "holiday", holiday: "mandatory", mandatory: "working" };

/* What a late-arrival tier can deduct */
const LATE_DEDUCT_OPTIONS = [
    "Fixed Amount",
    "% of Day's Salary",
    "Slab Time Salary",
    "Per-Hour Salary",
    "Half-Day Salary",
    "Full-Day Salary",
];

/* The last tier is always open-ended. Expected from API: GetLatePenaltySlabs */
const INITIAL_LATE_SLABS = [{ id: 1, afterMin: 0, deductType: "Half-Day Salary", amount: "" }];

/* Per-date overrides are keyed `year-monthIndex-day` and come from GetWorkingcalendar */

/* Staff rosters come from GetunassignedStaff / GetShiftAssignedStaffs as StaffCard rows. */

/* Readable labels for the three bonus amount types the API accepts */
const BONUS_TYPE_LABELS = {
    FixedAmount: "Fixed Amount",
    HalfDaySalary: "Half-Day Salary",
    FullDaySalary: "Full-Day Salary",
};

/* Academic year for this module. Expected from academic_year_config once wired. */
const ACADEMIC_YEAR = "2026-2027";

/* Editing window — policy can only be updated in the first N days of the cycle month.
   Not enforced by the API; flip `locked` on once the rule is agreed. */
const EDIT_WINDOW = { days: 20, month: "April", nextOpens: "1 April 2027", locked: false };

const TABS = [
    { key: "policy", label: "Policy Setup" },
    { key: "types", label: "Leave Types" },
    { key: "calendar", label: "Working Calendar" },
    { key: "shifts", label: "Assign Shifts" },
    { key: "balances", label: "Leave Balances" },
];

/* Colours for a period bucket in the allocation breakdown. A period that closed with
   balance still on it is "lapsed" — the remaining figure is history, not headroom. */
const PERIOD_TONE = {
    current: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", label: "Current" },
    lapsed: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "Lapsed" },
    past: { color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", label: "Closed" },
    future: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", label: "Upcoming" },
};
const periodTone = (period) => {
    if (period.isCurrentPeriod) return PERIOD_TONE.current;
    if (period.lapsed) return PERIOD_TONE.lapsed;
    if (period.isPastPeriod) return PERIOD_TONE.past;
    return PERIOD_TONE.future;
};

/* ───────────────────────── Small building blocks ───────────────────────── */

/* Section wrapper — coloured tab label sitting on top of a white card */
function Section({ icon: Icon, title, accent, helper, children }) {
    return (
        <Box sx={{ mb: 2.5 }}>
            <Box
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.8,
                    bgcolor: accent.color,
                    color: "#fff",
                    px: 1.6,
                    py: 0.6,
                    borderRadius: "8px 8px 0 0",
                }}
            >
                <Icon sx={{ fontSize: "15px" }} />
                <Typography sx={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.2px" }}>
                    {title}
                </Typography>
            </Box>
            <Box
                sx={{
                    bgcolor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "0 10px 10px 10px",
                    p: { xs: 1.5, md: 2.5 },
                }}
            >
                {helper && (
                    <Typography sx={{ fontSize: "12.5px", color: accent.color, mb: 2 }}>
                        {helper}
                    </Typography>
                )}
                {children}
            </Box>
        </Box>
    );
}

/* Sub-header inside a section — small tinted icon + title/description */
function SubHeader({ icon: Icon, title, description, color, bg }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "8px",
                    bgcolor: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ color, fontSize: "18px" }} />
            </Box>
            <Box>
                <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>{description}</Typography>
            </Box>
        </Box>
    );
}

/* Green switch used for every on/off row */
function GreenSwitch({ checked, onChange, disabled }) {
    return (
        <Switch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: GREEN },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: GREEN,
                    opacity: 1,
                },
            }}
        />
    );
}

/* Toggle row — tinted green when on, neutral grey when off */
function ToggleRow({ title, description, checked, onChange, disabled }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                p: 1.5,
                borderRadius: "10px",
                bgcolor: checked ? GREEN_BG : "#F9FAFB",
                border: `1px solid ${checked ? GREEN_BORDER : "#E5E7EB"}`,
                transition: "background-color 0.2s, border-color 0.2s",
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "13.5px", fontWeight: "600", color: "#111827" }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>{description}</Typography>
            </Box>
            <GreenSwitch checked={checked} onChange={onChange} disabled={disabled} />
        </Box>
    );
}

/* Field label + helper text wrapper for the numeric / select inputs */
function Field({ label, helper, children }) {
    return (
        <Box>
            <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 0.7 }}>
                {label}
            </Typography>
            {children}
            {helper && (
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.6, lineHeight: 1.35 }}>
                    {helper}
                </Typography>
            )}
        </Box>
    );
}

/* Tinted info callout used at the bottom of a few sections */
function InfoNote({ color, bg, border, children }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                p: 1.3,
                borderRadius: "8px",
                bgcolor: bg,
                border: `1px solid ${border}`,
            }}
        >
            <InfoOutlinedIcon sx={{ color, fontSize: "16px", mt: "1px", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "11.5px", color: "#374151", lineHeight: 1.5 }}>
                {children}
            </Typography>
        </Box>
    );
}

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        fontSize: "13.5px",
        bgcolor: "#fff",
    },
};

/* White block inside the leave-type dialog, with a green uppercase caption */
function FormCard({ title, children }) {
    return (
        <Box
            sx={{
                bgcolor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "10px",
                p: { xs: 1.8, md: 2.5 },
                mb: 2,
            }}
        >
            <Typography
                sx={{
                    fontSize: "12.5px",
                    fontWeight: "700",
                    color: ACCENT.leaveTypes.color,
                    letterSpacing: "0.6px",
                    mb: 2,
                }}
            >
                {title}
            </Typography>
            {children}
        </Box>
    );
}

/* Selectable radio card — used for allocation period and unused-leave action */
function ChoiceCard({ selected, color, title, description, onClick }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                height: "100%",
                boxSizing: "border-box",
                borderRadius: "10px",
                cursor: "pointer",
                userSelect: "none",
                bgcolor: selected ? `${color}0F` : "#F9FAFB",
                border: `${selected ? "2px" : "1px"} solid ${selected ? color : "#E5E7EB"}`,
                transition: "0.2s",
                "&:hover": { borderColor: color },
            }}
        >
            <Radio
                checked={selected}
                size="small"
                sx={{ p: 0, "&.Mui-checked": { color } }}
            />
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    sx={{ fontSize: "13.5px", fontWeight: "700", color: selected ? color : "#111827", lineHeight: 1.25 }}
                >
                    {title}
                </Typography>
                {description && (
                    <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>{description}</Typography>
                )}
            </Box>
        </Box>
    );
}

/* Label with a red required marker */
function RequiredLabel({ children, optional }) {
    return (
        <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 0.7 }}>
            {children}
            {optional ? (
                <Box component="span" sx={{ color: "#9CA3AF", fontWeight: 400 }}> (optional)</Box>
            ) : (
                <Box component="span" sx={{ color: "#DC2626" }}> *</Box>
            )}
        </Typography>
    );
}

/* ───────────────────────── Page ───────────────────────── */

export default function LeavePolicyMasterPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("policy");

    // ─── Leave Balances tab ───
    // Looked up one employee at a time; the API has no "everyone" variant
    const [balanceRoll, setBalanceRoll] = useState("");
    const [balanceQuery, setBalanceQuery] = useState("");
    const [balances, setBalances] = useState([]);
    const [balanceNote, setBalanceNote] = useState("");
    const [loadingBalances, setLoadingBalances] = useState(false);
    // Which allocation has its per-period breakdown expanded
    const [openAllocation, setOpenAllocation] = useState(null);
    // Name + roll for the picker, so nobody has to remember a roll number
    const [staffDirectory, setStaffDirectory] = useState([]);
    const [loadingDirectory, setLoadingDirectory] = useState(false);

    // ─── Policy Setup state ───
    const [config, setConfig] = useState({
        autoRenew: true,
        gracePeriodMinutes: 0,
        attendanceBonusEnabled: true,
        // FixedAmount | HalfDaySalary | FullDaySalary — bonuses accept only these three
        attendanceBonusType: "FixedAmount",
        attendanceBonusAmount: "",
        minWorkingDays: 15,
        newJoinerFirstDay: true,
        mandatoryDayRequired: true,
        punctualityBonusEnabled: true,
        punctualityBonusType: "FixedAmount",
        punctualityBonusAmount: "",
        latesAllowed: 1,
        informedLeavesAllowed: 1,
        lateArrivalPenalty: false,
        permissionDeduction: false,
        permissionFreeHours: 2,
        permissionRate: 100,
        payoutSchedule: "Quarterly",
        appliesToPaidLeave: true,
        deductIn: "Same Month",
        creditBack: true,
        creditBackIn: "Next Month",
        formula: "working",
    });

    const setField = (key) => (event) => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    // ─── Late penalty tiers ───
    const [lateSlabs, setLateSlabs] = useState(INITIAL_LATE_SLABS);

    // ─── Policy Setup ↔ api/leavePolicy ───
    const authUser = useSelector((state) => state.auth);
    const academicYear = ACADEMIC_YEAR;
    const [loadingPolicy, setLoadingPolicy] = useState(true);
    const [savingPolicy, setSavingPolicy] = useState(false);
    /* Snapshot of what the server last gave us, to decide whether the tri-state child lists
       need sending at all. Compared by value: any edit changes the serialised form. */
    const loadedShiftsRef = useRef("");
    const loadedSlabsRef = useRef("");
    // A 404 from GetLeavePolicy means this year has no row yet — the first save creates it
    const [policyExists, setPolicyExists] = useState(true);
    const [snack, setSnack] = useState({ open: false, message: "", ok: true });

    const showSnack = (message, ok = true) => setSnack({ open: true, message, ok });

    const loadPolicy = useCallback(async () => {
        setLoadingPolicy(true);
        const result = await fetchLeavePolicy(academicYear);
        if (!result.ok) {
            showSnack(result.message, false);
        } else if (result.data) {
            const mapped = policyFromApi(result.data);
            setConfig((prev) => ({ ...prev, ...mapped.config }));
            // Tri-state: only replace the child lists when the server actually sent them
            if (mapped.shifts.length) {
                setShifts(mapped.shifts);
                loadedShiftsRef.current = JSON.stringify(mapped.shifts);
            }
            if (mapped.lateSlabs.length) {
                setLateSlabs(mapped.lateSlabs);
                loadedSlabsRef.current = JSON.stringify(mapped.lateSlabs);
            }
            setPolicyExists(true);
        } else {
            setPolicyExists(false);
        }
        setLoadingPolicy(false);
    }, [academicYear]);

    useEffect(() => {
        loadPolicy();
    }, [loadPolicy]);

    const savePolicy = async () => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        setSavingPolicy(true);
        /* Omitting a list leaves the server's rows untouched; sending it replaces them all.
           So send only what changed — an untouched shift list must not be rewritten, or
           every staff member assigned to a shift loses that assignment. */
        const shiftsChanged = JSON.stringify(shifts) !== loadedShiftsRef.current;
        const slabsChanged = JSON.stringify(lateSlabs) !== loadedSlabsRef.current;
        const payload = buildPolicyPayload({
            academicYear,
            config,
            shifts,
            lateSlabs,
            rollNumber: authUser.rollNumber,
            includeShifts: shiftsChanged,
            includeSlabs: slabsChanged,
        });
        const result = await saveLeavePolicy(payload);
        if (result.ok) {
            loadedShiftsRef.current = JSON.stringify(shifts);
            loadedSlabsRef.current = JSON.stringify(lateSlabs);
        }
        showSnack(result.message, result.ok);
        setSavingPolicy(false);
        if (result.ok) loadPolicy();
    };

    const addSlab = () =>
        setLateSlabs((prev) => [
            ...prev,
            {
                id: prev.length ? Math.max(...prev.map((s) => s.id)) + 1 : 1,
                afterMin: 0,
                deductType: "Fixed Amount",
                amount: "",
            },
        ]);

    const updateSlab = (id, key, value) =>
        setLateSlabs((prev) => prev.map((slab) => (slab.id === id ? { ...slab, [key]: value } : slab)));

    const removeSlab = (id) => setLateSlabs((prev) => prev.filter((slab) => slab.id !== id));

    const [shiftsOpen, setShiftsOpen] = useState(false);
    // Seeded by GetLeavePolicy; only saved shifts carry a server shiftId
    const [shifts, setShifts] = useState([]);

    const updateShift = (id, key, value) => {
        setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
    };

    // ─── Leave Types state ───
    // Populated by GetleaveTypes; starts empty so no mock data flashes on load
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);

    const blankLeaveType = {
        code: "",
        name: "",
        description: "",
        days: 0,
        period: "Monthly",
        accruesMonthly: false,
        endOfPeriod: "Lapse",
        maxPerMonth: "",
        documentRequired: false,
        continuousBlocked: false,
        color: LEAVE_COLORS[0],
        // The server creates every new type active; mirror that so a fresh card is not dimmed
        isActive: true,
        // Only sent when endOfPeriod is Encash; the server rejects them otherwise
        encashCreditedWhen: "End of Period",
        encashFormula: "Gross / Working Days",
    };

    const openTypeDialog = (row) => {
        setEditingType(row ? { ...row } : { ...blankLeaveType, id: null });
        setTypeDialogOpen(true);
    };

    // ─── Leave Types ↔ api/leavePolicy ───
    const [typeSummary, setTypeSummary] = useState(null);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [savingType, setSavingType] = useState(false);

    const loadLeaveTypes = useCallback(async () => {
        setLoadingTypes(true);
        const result = await fetchLeaveTypes(academicYear);
        if (!result.ok) {
            showSnack(result.message, false);
        } else {
            setLeaveTypes(result.items);
            setTypeSummary(result.summary);
        }
        setLoadingTypes(false);
    }, [academicYear]);

    useEffect(() => {
        loadLeaveTypes();
    }, [loadLeaveTypes]);

    const saveLeaveType = async () => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        setSavingType(true);
        const context = { academicYear, rollNumber: authUser.rollNumber };
        const result = editingType.id
            ? await updateLeaveType(editingType.id, editingType, context)
            : await createLeaveType(editingType, context);

        if (result.ok) {
            // The save cascades into EmployeeLeaveBalance — report how far it reached
            const cascade = result.cascade;
            const detail = cascade
                ? ` · ${cascade.balancesInserted || 0} balances added, ${cascade.balancesUpdated || 0} updated`
                : "";
            showSnack(`${result.message}${detail}`, true);
            setTypeDialogOpen(false);
            loadLeaveTypes();
        } else {
            showSnack(result.message, false);
        }
        setSavingType(false);
    };

    const removeLeaveType = async (row) => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot delete: no signed-in user found.", false);
            return;
        }
        const result = await deleteLeaveType(row.id, authUser.rollNumber);
        showSnack(result.message, result.ok);
        if (result.ok) loadLeaveTypes();
    };

    // ─── Working Calendar state ───
    const [today] = useState(() => new Date());
    const [workingDays, setWorkingDays] = useState(DEFAULT_WORKING_DAYS);
    const [dayOverrides, setDayOverrides] = useState({});
    const [viewDate, setViewDate] = useState(() => ({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
    }));
    // Server-computed month totals, and whether this month has a saved row at all
    const [calendarCounts, setCalendarCounts] = useState(null);
    const [calendarSaved, setCalendarSaved] = useState(true);
    const [loadingCalendar, setLoadingCalendar] = useState(true);
    const [savingCalendar, setSavingCalendar] = useState(false);

    const toggleWorkingDay = (index) => {
        setWorkingDays((prev) => (prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]));
    };

    const shiftMonth = (step) => {
        setViewDate((prev) => {
            const next = new Date(prev.year, prev.month + step, 1);
            return { year: next.getFullYear(), month: next.getMonth() };
        });
    };

    // ─── Working Calendar ↔ api/leavePolicy ───
    const loadCalendar = useCallback(async () => {
        setLoadingCalendar(true);
        // The API takes a 1-based month; the grid holds a 0-based index
        const month = viewDate.month + 1;
        const result = await fetchWorkingCalendar(viewDate.year, month);

        if (!result.ok) {
            showSnack(result.message, false);
        } else if (result.found) {
            const mapped = calendarFromApi(result.data, { year: viewDate.year, month });
            setWorkingDays(mapped.workingDays);
            setDayOverrides(mapped.overrides);
            setCalendarCounts(mapped.counts);
            setCalendarSaved(true);
        } else {
            // No row for this month — the server silently falls back to Mon–Fri
            setDayOverrides({});
            setCalendarCounts(null);
            setCalendarSaved(false);
        }
        setLoadingCalendar(false);
    }, [viewDate.year, viewDate.month]);

    useEffect(() => {
        loadCalendar();
    }, [loadCalendar]);

    const saveCalendar = async () => {
        if (!authUser?.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        setSavingCalendar(true);
        const payload = buildCalendarPayload({
            year: viewDate.year,
            month: viewDate.month + 1,
            workingDays,
            dayOverrides,
            rollNumber: authUser.rollNumber,
        });
        const result = await saveWorkingCalendar(payload);
        showSnack(result.message, result.ok);
        setSavingCalendar(false);
        if (result.ok) loadCalendar();
    };

    // A month is locked once it has started — only future months can be edited
    const isPastMonth =
        viewDate.year < today.getFullYear() ||
        (viewDate.year === today.getFullYear() && viewDate.month < today.getMonth());
    const isCurrentMonth = viewDate.year === today.getFullYear() && viewDate.month === today.getMonth();
    const isReadOnlyMonth = isPastMonth || isCurrentMonth;

    const dayKey = (day) => `${viewDate.year}-${viewDate.month}-${day}`;

    // Status comes from an explicit override, otherwise from the default weekly pattern
    const statusForDay = (day) => {
        const override = dayOverrides[dayKey(day)];
        if (override) return override;
        return workingDays.includes(new Date(viewDate.year, viewDate.month, day).getDay())
            ? "working"
            : "holiday";
    };

    const cycleDay = (day) => {
        if (isReadOnlyMonth) return;
        const next = NEXT_STATUS[statusForDay(day)];
        const defaultStatus = workingDays.includes(new Date(viewDate.year, viewDate.month, day).getDay())
            ? "working"
            : "holiday";
        setDayOverrides((prev) => {
            const updated = { ...prev };
            // Drop the override once the date is back to its default state
            if (next === defaultStatus) delete updated[dayKey(day)];
            else updated[dayKey(day)] = next;
            return updated;
        });
    };

    // ─── Assign Shifts ↔ api/leavePolicy ───
    // Rosters keyed by the server's shiftId, plus "unassigned" for the pool
    const [rosters, setRosters] = useState({ unassigned: [] });
    const [shiftTab, setShiftTab] = useState("unassigned");
    const [staffQuery, setStaffQuery] = useState("");
    const [staffView, setStaffView] = useState("grid");
    const [loadingRosters, setLoadingRosters] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignTarget, setAssignTarget] = useState("");
    const [assignSelection, setAssignSelection] = useState([]);
    const [assigning, setAssigning] = useState(false);
    // { row, mode: "view" | "move" } — drives the per-staff dialog
    const [staffDialog, setStaffDialog] = useState(null);
    const [moveTarget, setMoveTarget] = useState("");

    // Only shifts saved to the policy carry a server id, and assignment needs one
    const assignableShifts = shifts.filter((shift) => shift.shiftId);
    const actor = { rollNumber: authUser?.rollNumber, userType: authUser?.userType };

    const loadRosters = useCallback(async () => {
        const saved = shifts.filter((shift) => shift.shiftId);
        setLoadingRosters(true);

        const [pool, ...lists] = await Promise.all([
            fetchUnassignedStaff(academicYear),
            ...saved.map((shift) => fetchShiftStaff(academicYear, shift.shiftId)),
        ]);

        const next = { unassigned: pool.ok ? pool.staff : [] };
        saved.forEach((shift, index) => {
            const result = lists[index];
            next[shift.shiftId] = result?.ok ? result.staff : [];
        });

        const failure = [pool, ...lists].find((result) => result && !result.ok);
        if (failure) showSnack(failure.message, false);

        setRosters(next);
        setLoadingRosters(false);
    }, [academicYear, shifts]);

    useEffect(() => {
        loadRosters();
    }, [loadRosters]);

    const openStaffDialog = (row, mode) => {
        setMoveTarget(row.shiftId ?? "");
        setStaffDialog({ row, mode });
    };

    /* Empty target means unassign; anything else is a move */
    const applyShiftChange = async (row, targetShiftId) => {
        if (!actor.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        const result = !targetShiftId
            ? await unassignStaffFromShift({
                  academicYear,
                  rollNumbers: [row.rollNumber],
                  rollNumber: actor.rollNumber,
                  userType: actor.userType,
              })
            : await moveStaffToShift({
                  academicYear,
                  rollNumber: row.rollNumber,
                  newShiftId: Number(targetShiftId),
                  movedBy: actor.rollNumber,
                  userType: actor.userType,
              });
        showSnack(result.message, result.ok);
        if (result.ok) loadRosters();
    };

    const confirmMove = async () => {
        await applyShiftChange(staffDialog.row, moveTarget);
        setStaffDialog(null);
    };

    const openAssignDialog = () => {
        setAssignTarget(shiftTab === "unassigned" ? assignableShifts[0]?.shiftId || "" : shiftTab);
        setAssignSelection([]);
        setAssignDialogOpen(true);
    };

    const confirmAssign = async () => {
        if (!actor.rollNumber) {
            showSnack("Cannot save: no signed-in user found.", false);
            return;
        }
        setAssigning(true);
        // Bulk assign is all-or-nothing; the 400 message names the roll that failed
        const result = await assignStaff({
            academicYear,
            shiftId: Number(assignTarget),
            rollNumbers: assignSelection,
            rollNumber: actor.rollNumber,
            userType: actor.userType,
        });
        showSnack(result.message, result.ok);
        setAssigning(false);
        if (result.ok) {
            setAssignDialogOpen(false);
            loadRosters();
        }
    };

    const handleClearAll = () => {
        setConfig({
            autoRenew: false,
            gracePeriodMinutes: 0,
            attendanceBonusEnabled: false,
            attendanceBonusAmount: "",
            minWorkingDays: "",
            newJoinerFirstDay: false,
            mandatoryDayRequired: false,
            punctualityBonusEnabled: false,
            punctualityBonusAmount: "",
            latesAllowed: "",
            informedLeavesAllowed: "",
            lateArrivalPenalty: false,
            permissionDeduction: false,
            payoutSchedule: "Monthly",
            appliesToPaidLeave: false,
            deductIn: "Same Month",
            creditBack: false,
            creditBackIn: "Next Month",
            formula: "working",
        });
    };

    /* ─────────────── Policy Setup tab ─────────────── */
    const renderPolicySetup = () => (
        <>
            {/* First run for this year — postleavepolicy upserts, so saving creates the row */}
            {!loadingPolicy && !policyExists && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        p: 1.5,
                        mb: 2.5,
                        borderRadius: "10px",
                        bgcolor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                    }}
                >
                    <InfoOutlinedIcon sx={{ color: "#2563EB", fontSize: "18px", mt: "1px" }} />
                    <Typography sx={{ fontSize: "12.5px", color: "#374151", lineHeight: 1.6 }}>
                        No policy is saved for <strong>{academicYear}</strong> yet — everything below is a default.
                        Nothing in Leave, Attendance or Payroll works until this is saved, so set the rules and press{" "}
                        <strong>Update Policy</strong> to create it.
                    </Typography>
                </Box>
            )}

            {/* ═══ Auto-Renew ═══ */}
            <Section
                icon={AutorenewIcon}
                title="Auto-Renew"
                accent={ACCENT.autoRenew}
                helper="Roll this policy over into the next academic year automatically."
            >
                <ToggleRow
                    title="Auto-renew for the next academic year"
                    description="This policy will roll forward to the next academic year automatically — no manual setup needed."
                    checked={config.autoRenew}
                    onChange={setField("autoRenew")}
                />
            </Section>

            {/* ═══ Shift Timing & Work Hours ═══ */}
            <Section
                icon={AccessTimeIcon}
                title="Shift Timing & Work Hours"
                accent={ACCENT.shift}
                helper="Add one or more shift schedules — timing and breaks are per shift; the grace period below is common and applies to every shift"
            >
                {/* Grace period — shared by every shift */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                        p: 1.8,
                        mb: 1.5,
                        borderRadius: "10px",
                        bgcolor: ACCENT.shift.bg,
                        border: `1px solid ${ACCENT.shift.border}`,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2, minWidth: 0 }}>
                        <AccessTimeIcon sx={{ color: ACCENT.shift.color, fontSize: "20px", mt: "2px" }} />
                        <Box>
                            <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: ACCENT.shift.color }}>
                                Grace Period — common for all shifts
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                                A late mark is applied after this many minutes past each shift's start time.
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ width: { xs: "100%", sm: "220px" } }}>
                        <Field label="Grace Period">
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                value={config.gracePeriodMinutes}
                                onChange={setField("gracePeriodMinutes")}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                    minutes
                                                </Typography>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Field>
                    </Box>
                </Box>

                {/* Collapsible shift list */}
                <Box
                    sx={{
                        borderRadius: "10px",
                        bgcolor: ACCENT.shift.bg,
                        border: `1px solid ${ACCENT.shift.border}`,
                        mb: 1.5,
                        overflow: "hidden",
                    }}
                >
                    <Box
                        onClick={() => setShiftsOpen((prev) => !prev)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                            p: 1.6,
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#E0F7FA" },
                        }}
                    >
                        <AccessTimeIcon sx={{ color: ACCENT.shift.color, fontSize: "20px" }} />
                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: ACCENT.shift.color }}>
                            Shifts
                        </Typography>
                        <Chip
                            label={shifts.length}
                            size="small"
                            sx={{
                                bgcolor: ACCENT.shift.color,
                                color: "#fff",
                                fontWeight: "700",
                                fontSize: "11px",
                                height: 20,
                            }}
                        />
                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                            Click to expand &amp; edit shifts
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <ExpandMoreIcon
                            sx={{
                                color: ACCENT.shift.color,
                                transition: "transform 0.25s",
                                transform: shiftsOpen ? "rotate(180deg)" : "none",
                            }}
                        />
                    </Box>

                    <Collapse in={shiftsOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 1.6, pt: 0 }}>
                            {shifts.map((shift) => (
                                <Box
                                    key={shift.id}
                                    sx={{
                                        bgcolor: "#fff",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "8px",
                                        p: 1.5,
                                        mb: 1.2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            mb: 1.2,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                                            {shift.name}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => setShifts((prev) => prev.filter((s) => s.id !== shift.id))}
                                        >
                                            <DeleteOutlineIcon sx={{ fontSize: "17px", color: "#9CA3AF" }} />
                                        </IconButton>
                                    </Box>
                                    <Grid container spacing={1.5}>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <Field label="Start Time">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="time"
                                                    value={shift.startTime}
                                                    onChange={(e) => updateShift(shift.id, "startTime", e.target.value)}
                                                    sx={inputSx}
                                                />
                                            </Field>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <Field label="End Time">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="time"
                                                    value={shift.endTime}
                                                    onChange={(e) => updateShift(shift.id, "endTime", e.target.value)}
                                                    sx={inputSx}
                                                />
                                            </Field>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <Field label="Break Start">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="time"
                                                    value={shift.breakStart}
                                                    onChange={(e) => updateShift(shift.id, "breakStart", e.target.value)}
                                                    sx={inputSx}
                                                />
                                            </Field>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <Field label="Break End">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="time"
                                                    value={shift.breakEnd}
                                                    onChange={(e) => updateShift(shift.id, "breakEnd", e.target.value)}
                                                    sx={inputSx}
                                                />
                                            </Field>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() =>
                                    setShifts((prev) => [
                                        ...prev,
                                        {
                                            id: prev.length ? Math.max(...prev.map((s) => s.id)) + 1 : 1,
                                            name: `Shift ${prev.length + 1}`,
                                            startTime: "09:00",
                                            endTime: "17:00",
                                            breakStart: "13:00",
                                            breakEnd: "13:45",
                                            color: SHIFT_COLORS[prev.length % SHIFT_COLORS.length],
                                        },
                                    ])
                                }
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "50px",
                                    border: `1px solid ${ACCENT.shift.color}`,
                                    color: ACCENT.shift.color,
                                    fontSize: "12.5px",
                                    fontWeight: "600",
                                    px: 2,
                                }}
                            >
                                Add Shift
                            </Button>
                        </Box>
                    </Collapse>
                </Box>

                <InfoNote color={ACCENT.shift.color} bg={ACCENT.shift.bg} border={ACCENT.shift.border}>
                    Each shift defines its own start time, end time, grace period and breaks. Staff arriving after{" "}
                    <strong>start time + grace</strong> will be flagged as <strong>late</strong> for that shift. Use the
                    Punctuality section below to set the late penalty and emergency allowance.
                </InfoNote>
            </Section>

            {/* ═══ Attendance, Punctuality & Bonus Payout ═══ */}
            <Section
                icon={ReceiptLongIcon}
                title="Attendance, Punctuality & Bonus Payout"
                accent={ACCENT.attendance}
                helper="Configure attendance & punctuality bonuses, then set how often bonuses are calculated and credited"
            >
                {/* ── Attendance Bonus ── */}
                <SubHeader
                    icon={CalendarMonthIcon}
                    title="Attendance Bonus"
                    description="Define rules for monthly attendance bonus eligibility"
                    color={ACCENT.attendance.color}
                    bg={ACCENT.attendance.bg}
                />

                <ToggleRow
                    title="Enable Attendance Bonus"
                    description="Staff will be eligible for attendance bonus when conditions are met"
                    checked={config.attendanceBonusEnabled}
                    onChange={setField("attendanceBonusEnabled")}
                />

                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Field
                            label="Bonus Type"
                            helper="Half / full day derive the figure from the staff member's own salary"
                        >
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={config.attendanceBonusType}
                                onChange={setField("attendanceBonusType")}
                                disabled={!config.attendanceBonusEnabled}
                                sx={inputSx}
                            >
                                {BONUS_AMOUNT_TYPES.map((type) => (
                                    <MenuItem key={type} value={type} sx={{ fontSize: "13.5px" }}>
                                        {BONUS_TYPE_LABELS[type]}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Field>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Field
                            label="Bonus Amount (per month)"
                            helper="Paid each month when all attendance conditions are met"
                        >
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={config.attendanceBonusAmount}
                                onChange={setField("attendanceBonusAmount")}
                                disabled={!config.attendanceBonusEnabled || config.attendanceBonusType !== "FixedAmount"}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        startAdornment: config.attendanceBonusAmount ? (
                                            <InputAdornment position="start">
                                                <Typography sx={{ fontSize: "13px" }}>₹</Typography>
                                            </InputAdornment>
                                        ) : null,
                                    },
                                }}
                            >
                                {AMOUNT_OPTIONS.map((amount) => (
                                    <MenuItem key={amount} value={amount} sx={{ fontSize: "13.5px" }}>
                                        ₹{amount.toLocaleString("en-IN")}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Field>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 5, lg: 4 }}>
                        <Field
                            label="Minimum Working Days Required (in the month)"
                            helper="Employee must work at least this many days in the month to earn the bonus"
                        >
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                value={config.minWorkingDays}
                                onChange={setField("minWorkingDays")}
                                disabled={!config.attendanceBonusEnabled}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                    days / month
                                                </Typography>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Field>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 1.5 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 5 }}>
                        <ToggleRow
                            title="New Joiners Must Join on First Working Day"
                            description="New employees only — must join on the 1st working day."
                            checked={config.newJoinerFirstDay}
                            onChange={setField("newJoinerFirstDay")}
                            disabled={!config.attendanceBonusEnabled}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 5 }}>
                        <ToggleRow
                            title="Mandatory Day Attendance Required"
                            description="Absence on mandatory working days disqualifies the bonus"
                            checked={config.mandatoryDayRequired}
                            onChange={setField("mandatoryDayRequired")}
                            disabled={!config.attendanceBonusEnabled}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2.5 }} />

                {/* ── Punctuality & Late Arrival ── */}
                <SubHeader
                    icon={AccessTimeIcon}
                    title="Punctuality & Late Arrival"
                    description="Configure late arrival thresholds, emergency lates, and penalty rules"
                    color={AMBER}
                    bg="#FFFBEB"
                />

                <ToggleRow
                    title="Enable Punctuality Bonus"
                    description="Staff will receive punctuality bonus if late arrival rules are met"
                    checked={config.punctualityBonusEnabled}
                    onChange={setField("punctualityBonusEnabled")}
                />

                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Field
                            label="Bonus Type"
                            helper="Half / full day derive the figure from the staff member's own salary"
                        >
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={config.punctualityBonusType}
                                onChange={setField("punctualityBonusType")}
                                disabled={!config.punctualityBonusEnabled}
                                sx={inputSx}
                            >
                                {BONUS_AMOUNT_TYPES.map((type) => (
                                    <MenuItem key={type} value={type} sx={{ fontSize: "13.5px" }}>
                                        {BONUS_TYPE_LABELS[type]}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Field>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Field
                            label="Punctuality Bonus Amount (per month)"
                            helper="Total bonus paid per month when punctuality rules are met"
                        >
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={config.punctualityBonusAmount}
                                onChange={setField("punctualityBonusAmount")}
                                disabled={!config.punctualityBonusEnabled || config.punctualityBonusType !== "FixedAmount"}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        startAdornment: config.punctualityBonusAmount ? (
                                            <InputAdornment position="start">
                                                <Typography sx={{ fontSize: "13px" }}>₹</Typography>
                                            </InputAdornment>
                                        ) : null,
                                    },
                                }}
                            >
                                {AMOUNT_OPTIONS.map((amount) => (
                                    <MenuItem key={amount} value={amount} sx={{ fontSize: "13.5px" }}>
                                        ₹{amount.toLocaleString("en-IN")}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Field>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Field label="Lates Allowed" helper="Free late arrivals without losing bonus">
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                value={config.latesAllowed}
                                onChange={setField("latesAllowed")}
                                disabled={!config.punctualityBonusEnabled}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                    per month
                                                </Typography>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Field>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Field label="Leaves Allowed (Informed)" helper="Informed leaves allowed without losing bonus">
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                value={config.informedLeavesAllowed}
                                onChange={setField("informedLeavesAllowed")}
                                disabled={!config.punctualityBonusEnabled}
                                sx={inputSx}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                    per month
                                                </Typography>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Field>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                    <ToggleRow
                        title="Late Arrival Penalty"
                        description="Deduct a penalty based on how late the staff arrives — works on its own, even without the punctuality bonus."
                        checked={config.lateArrivalPenalty}
                        onChange={setField("lateArrivalPenalty")}
                    />
                </Box>

                {/* ── Late penalty slabs ── */}
                <Collapse in={config.lateArrivalPenalty} timeout="auto">
                    <Box
                        sx={{
                            mt: 1.5,
                            p: 2,
                            borderRadius: "10px",
                            bgcolor: "#E0F2FE",
                            border: "1px solid #BAE6FD",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: "19px", color: "#0284C7" }} />
                            <Typography sx={{ fontSize: "15px", fontWeight: "700", color: "#0C4A6E" }}>
                                Late Penalty Slabs
                            </Typography>
                        </Box>

                        <Typography sx={{ fontSize: "12.5px", color: "#B45309", lineHeight: 1.7, mb: 1.5 }}>
                            Penalty increases with how late the staff arrives (counted after start time + grace). Each
                            tier can deduct a fixed ₹ or a <strong>salary-based</strong> amount — % of a day's pay, the{" "}
                            <strong>slab's own time</strong> (a 1–20 min slab → 20 minutes' pay), per-hour salary, or
                            half / full day — computed per employee at payroll.
                        </Typography>

                        {lateSlabs.length <= 1 && (
                            <Typography
                                sx={{ fontSize: "12.5px", color: "#B45309", fontStyle: "italic", mb: 1.5 }}
                            >
                                No slabs yet — add one or more tiers below.
                            </Typography>
                        )}

                        {lateSlabs.map((slab, index) => {
                            const openEnded = index === lateSlabs.length - 1;
                            /* Three types carry a deductAmount. "Per-Hour Salary" was missing here,
                               so its hours box never rendered and the slab always sent 0 hours —
                               a penalty tier that looked configured and charged nothing. */
                            const needsAmount =
                                slab.deductType === "Fixed Amount" ||
                                slab.deductType === "% of Day's Salary" ||
                                slab.deductType === "Per-Hour Salary";
                            /* "Slab Time Salary" bills the band's UPPER minute, so it cannot be used
                               on the final open-ended band (toMinutes: null). The server rejects it
                               and the entire policy save fails, which reads as "saving is broken"
                               rather than "this one tier is invalid" — so it is not offered here. */
                            const deductOptions = openEnded
                                ? LATE_DEDUCT_OPTIONS.filter((option) => option !== "Slab Time Salary")
                                : LATE_DEDUCT_OPTIONS;
                            return (
                                <Box
                                    key={slab.id}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.3,
                                        flexWrap: "wrap",
                                        p: 1.4,
                                        mb: 1.2,
                                        borderRadius: "10px",
                                        bgcolor: "#FEF2F2",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: "50%",
                                            bgcolor: "#DC2626",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {openEnded ? <AllInclusiveIcon sx={{ fontSize: "16px" }} /> : index + 1}
                                    </Box>

                                    <Typography sx={{ fontSize: "13.5px", fontWeight: "600", color: "#374151" }}>
                                        More than
                                    </Typography>

                                    <TextField
                                        size="small"
                                        type="number"
                                        value={slab.afterMin}
                                        onChange={(e) => updateSlab(slab.id, "afterMin", e.target.value)}
                                        sx={{
                                            width: "110px",
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "50px",
                                                fontSize: "13.5px",
                                                fontWeight: 700,
                                                color: "#DC2626",
                                                bgcolor: "#FEE2E2",
                                                "& fieldset": { border: "none" },
                                            },
                                        }}
                                        slotProps={{
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#DC2626" }}>
                                                            min
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />

                                    <ArrowRightAltIcon sx={{ color: "#DC2626" }} />

                                    <Typography sx={{ fontSize: "13.5px", fontWeight: "600", color: "#374151" }}>
                                        Deduct
                                    </Typography>

                                    <TextField
                                        select
                                        size="small"
                                        value={slab.deductType}
                                        onChange={(e) => updateSlab(slab.id, "deductType", e.target.value)}
                                        sx={{ ...inputSx, minWidth: "200px" }}
                                    >
                                        {deductOptions.map((option) => (
                                            <MenuItem key={option} value={option} sx={{ fontSize: "13.5px" }}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    {needsAmount && (
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={slab.amount}
                                            onChange={(e) => updateSlab(slab.id, "amount", e.target.value)}
                                            sx={{ ...inputSx, width: "150px" }}
                                            slotProps={{
                                                // percent is capped at 100 and hours at 24 server-side
                                                htmlInput:
                                                    slab.deductType === "% of Day's Salary"
                                                        ? { min: 0, max: 100 }
                                                        : slab.deductType === "Per-Hour Salary"
                                                        ? { min: 0, max: 24 }
                                                        : { min: 0 },
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                                                                {slab.deductType === "Fixed Amount" ? "₹" : ""}
                                                            </Typography>
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                                {slab.deductType === "% of Day's Salary"
                                                                    ? "%"
                                                                    : slab.deductType === "Per-Hour Salary"
                                                                    ? "hrs"
                                                                    : ""}
                                                            </Typography>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}

                                    <Box sx={{ flex: 1 }} />

                                    {lateSlabs.length > 1 && (
                                        <IconButton size="small" onClick={() => removeSlab(slab.id)}>
                                            <DeleteOutlineIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                                        </IconButton>
                                    )}
                                </Box>
                            );
                        })}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={addSlab}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                border: "1px dashed #FCD34D",
                                color: "#0284C7",
                                fontSize: "13.5px",
                                fontWeight: "700",
                                px: 2,
                                "&:hover": { bgcolor: "#F0F9FF" },
                            }}
                        >
                            Add Slab
                        </Button>
                    </Box>
                </Collapse>

                <Box sx={{ mt: 1.2 }}>
                    <ToggleRow
                        title="Permission Deduction"
                        description="Charge for approved hourly permission. If the staff is also late, this adds on top of the late penalty."
                        checked={config.permissionDeduction}
                        onChange={setField("permissionDeduction")}
                    />
                </Box>

                {/* ── Permission charge ── */}
                <Collapse in={config.permissionDeduction} timeout="auto">
                    <Box
                        sx={{
                            mt: 1.5,
                            p: 2,
                            borderRadius: "10px",
                            bgcolor: "#EEF2FF",
                            border: "1px solid #C7D2FE",
                        }}
                    >
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <Typography sx={{ fontSize: "13.5px", fontWeight: "600", color: "#374151", mb: 0.8 }}>
                                    Free Permission (per month)
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={config.permissionFreeHours}
                                    onChange={setField("permissionFreeHours")}
                                    sx={inputSx}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: "12.5px", color: "#9CA3AF" }}>
                                                        hours / month
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                <Typography sx={{ fontSize: "11.5px", color: "#6B7280", mt: 0.7 }}>
                                    Permission hours allowed free each month
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <Typography sx={{ fontSize: "13.5px", fontWeight: "600", color: "#374151", mb: 0.8 }}>
                                    Permission Amount (per hour)
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={config.permissionRate}
                                    onChange={setField("permissionRate")}
                                    sx={inputSx}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>₹</Typography>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                <Typography sx={{ fontSize: "11.5px", color: "#6B7280", mt: 0.7 }}>
                                    Charged per hour beyond the free allowance
                                </Typography>
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1.2,
                                mt: 2.2,
                                p: 1.5,
                                borderRadius: "8px",
                                bgcolor: "#fff",
                                border: "1px solid #C7D2FE",
                            }}
                        >
                            <InfoOutlinedIcon sx={{ fontSize: "17px", color: "#4F46E5", mt: "1px", flexShrink: 0 }} />
                            <Typography sx={{ fontSize: "12.5px", color: "#374151", lineHeight: 1.7 }}>
                                First <strong>{config.permissionFreeHours || 0} hour(s)</strong> of permission each month
                                are <strong>free</strong>. Beyond that, <strong>₹{config.permissionRate || 0}/hour</strong>{" "}
                                is deducted, and it stacks with the late penalty. Example:{" "}
                                <strong>1 extra billable hour</strong> (₹{config.permissionRate || 0}) +{" "}
                                <strong>late by 1 min</strong> (₹0) = <strong>₹{config.permissionRate || 0}</strong>.
                            </Typography>
                        </Box>
                    </Box>
                </Collapse>

                <Divider sx={{ my: 2.5 }} />

                {/* ── Bonus Payout Schedule ── */}
                <SubHeader
                    icon={AccountBalanceWalletIcon}
                    title="Bonus Payout Schedule"
                    description="Choose when the auto-calculated bonus is credited to salary"
                    color={ACCENT.autoRenew.color}
                    bg={ACCENT.autoRenew.bg}
                />

                <Box sx={{ maxWidth: "340px", mb: 2 }}>
                    <Field
                        label="When is the bonus credited?"
                        helper="The eligible bonus is auto-calculated each month and paid out on this schedule"
                    >
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={config.payoutSchedule}
                            onChange={setField("payoutSchedule")}
                            sx={inputSx}
                        >
                            {PAYOUT_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option} sx={{ fontSize: "13.5px" }}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Field>
                </Box>

                <InfoNote
                    color={ACCENT.autoRenew.color}
                    bg={ACCENT.autoRenew.bg}
                    border={ACCENT.autoRenew.border}
                >
                    The bonus is <strong>auto-calculated each month</strong> and{" "}
                    <strong>credited {config.payoutSchedule.toLowerCase()}</strong>. Only months where eligibility
                    criteria are met will be included in the payout.
                </InfoNote>
            </Section>

            {/* ═══ Leave & Salary Deduction ═══ */}
            <Section
                icon={CalendarMonthIcon}
                title="Leave & Salary Deduction"
                accent={ACCENT.deduction}
                helper="Define how leave affects salary — deduction rules and paid leave allocation"
            >
                <ToggleRow
                    title="Applies to Paid Leave Too"
                    description="If a paid leave is taken, its salary is first deducted and then credited back later — set the deduct & credit-back schedule below."
                    checked={config.appliesToPaidLeave}
                    onChange={setField("appliesToPaidLeave")}
                />

                <Collapse in={config.appliesToPaidLeave} timeout="auto">
                    <Box
                        sx={{
                            mt: 1.5,
                            p: 2,
                            borderRadius: "10px",
                            bgcolor: ACCENT.deduction.bg,
                            border: `1px solid ${ACCENT.deduction.border}`,
                        }}
                    >
                        <Grid container spacing={2} alignItems="flex-start">
                            <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                                <Field label="Deduct salary in" helper="Salary register where the leave amount is deducted">
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={config.deductIn}
                                        onChange={setField("deductIn")}
                                        sx={inputSx}
                                    >
                                        {REGISTER_OPTIONS.map((option) => (
                                            <MenuItem key={option} value={option} sx={{ fontSize: "13.5px" }}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Field>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                                <ToggleRow
                                    title="Credit Back (Refund)"
                                    description="Refund the deducted paid-leave amount in a later salary"
                                    checked={config.creditBack}
                                    onChange={setField("creditBack")}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                                <Field label="Credit back in" helper="Salary register where the amount is refunded">
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={config.creditBackIn}
                                        onChange={setField("creditBackIn")}
                                        disabled={!config.creditBack}
                                        sx={inputSx}
                                    >
                                        {REGISTER_OPTIONS.map((option) => (
                                            <MenuItem key={option} value={option} sx={{ fontSize: "13.5px" }}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Field>
                            </Grid>
                        </Grid>

                        {/* Deduct → credit-back summary strip */}
                        <Box
                            sx={{
                                mt: 2,
                                p: 1.6,
                                borderRadius: "8px",
                                border: "1px dashed #FCA5A5",
                                bgcolor: "#fff",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                    <RemoveCircleOutlineIcon sx={{ color: "#DC2626", fontSize: "20px" }} />
                                    <Box>
                                        <Typography
                                            sx={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.5px" }}
                                        >
                                            DEDUCTED
                                        </Typography>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: "700", color: "#DC2626" }}>
                                            {config.deductIn}
                                        </Typography>
                                    </Box>
                                </Box>
                                <ArrowRightAltIcon sx={{ color: "#9CA3AF" }} />
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                    <AddCircleOutlineIcon sx={{ color: GREEN, fontSize: "20px" }} />
                                    <Box>
                                        <Typography
                                            sx={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.5px" }}
                                        >
                                            CREDITED BACK
                                        </Typography>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: "700", color: GREEN }}>
                                            {config.creditBack ? config.creditBackIn : "Not refunded"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: "11.5px", color: "#374151", lineHeight: 1.5 }}>
                                For paid leave (e.g. 1 casual leave / month), salary is{" "}
                                <Box component="span" sx={{ color: "#DC2626", fontWeight: 600 }}>
                                    deducted in the {config.deductIn.toLowerCase()} register
                                </Box>{" "}
                                and{" "}
                                <Box component="span" sx={{ color: GREEN, fontWeight: 600 }}>
                                    credited back in the {config.creditBackIn.toLowerCase()} register
                                </Box>{" "}
                                — so the employee is effectively not charged.
                            </Typography>
                        </Box>
                    </Box>
                </Collapse>

                {/* ── Salary Deduction Formula ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2.5, mb: 1.5 }}>
                    <CalculateOutlinedIcon sx={{ color: ACCENT.deduction.color, fontSize: "20px" }} />
                    <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                        Salary Deduction Formula
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {FORMULA_OPTIONS.map((option) => {
                        const selected = config.formula === option.key;
                        return (
                            <Grid key={option.key} size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                                <Box
                                    onClick={() => setConfig((prev) => ({ ...prev, formula: option.key }))}
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 1,
                                        p: 1.6,
                                        height: "100%",
                                        boxSizing: "border-box",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        bgcolor: selected ? ACCENT.deduction.bg : "#fff",
                                        border: `${selected ? "2px" : "1px"} solid ${selected ? ACCENT.deduction.color : "#E5E7EB"}`,
                                        transition: "0.2s",
                                        "&:hover": { borderColor: ACCENT.deduction.color },
                                    }}
                                >
                                    <Radio
                                        checked={selected}
                                        size="small"
                                        sx={{ p: 0, mt: "2px", "&.Mui-checked": { color: ACCENT.deduction.color } }}
                                    />
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}>
                                            {option.title}
                                        </Typography>
                                        <Typography
                                            sx={{ fontSize: "11.5px", color: "#6B7280", fontStyle: "italic", mt: 0.3 }}
                                        >
                                            {option.formula}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "11.5px",
                                                mt: 0.6,
                                                fontWeight: "600",
                                                color: selected ? ACCENT.deduction.color : "#9CA3AF",
                                            }}
                                        >
                                            {option.example}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </Section>

            {/* ═══ Editing lock + action buttons ═══ */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, pb: 2 }}>
                {EDIT_WINDOW.locked && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                            px: 2,
                            py: 1.2,
                            borderRadius: "8px",
                            bgcolor: "#FEF3C7",
                            border: "1px solid #FDE68A",
                            maxWidth: "560px",
                        }}
                    >
                        <LockOutlinedIcon sx={{ color: "#B45309", fontSize: "17px", mt: "1px" }} />
                        <Box>
                            <Typography
                                sx={{ fontSize: "11px", fontWeight: "700", color: "#B45309", letterSpacing: "0.5px" }}
                            >
                                EDITING LOCKED
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: "#92400E", lineHeight: 1.5 }}>
                                You can only update this policy within the first{" "}
                                <strong>{EDIT_WINDOW.days} days</strong> of <strong>{EDIT_WINDOW.month}</strong>. The
                                next edit window opens on <strong>{EDIT_WINDOW.nextOpens}</strong>.
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
                    <Button
                        startIcon={<RestartAltIcon />}
                        onClick={handleClearAll}
                        sx={{
                            textTransform: "none",
                            borderRadius: "50px",
                            border: "1px solid #D1D5DB",
                            color: "#374151",
                            fontSize: "13px",
                            fontWeight: "600",
                            px: 2.5,
                            "&:hover": { bgcolor: "#F9FAFB" },
                        }}
                    >
                        Clear All
                    </Button>
                    <Button
                        variant="contained"
                        disabled={EDIT_WINDOW.locked || savingPolicy || loadingPolicy}
                        onClick={savePolicy}
                        startIcon={EDIT_WINDOW.locked ? <LockOutlinedIcon /> : <SaveOutlinedIcon />}
                        sx={{
                            textTransform: "none",
                            borderRadius: "50px",
                            fontSize: "13px",
                            fontWeight: "700",
                            px: 3,
                            bgcolor: ACCENT.attendance.color,
                            "&:hover": { bgcolor: "#1D4ED8" },
                        }}
                    >
                        {savingPolicy ? "Saving…" : "Update Policy"}
                    </Button>
                </Box>
            </Box>
        </>
    );

    /* ─────────────── Leave Types tab ─────────────── */
    const renderLeaveTypes = () => {
        // Derived values for the add/edit dialog
        const draftMeta = editingType ? PERIOD_META[editingType.period] || PERIOD_META.Monthly : PERIOD_META.Monthly;
        const draftDays = Number(editingType?.days) || 0;
        const draftCap = Number(editingType?.maxPerMonth) || 0;
        const draftMonthlyEq = draftDays / draftMeta.months;
        const draftEndCfg = editingType ? END_ACTIONS[editingType.endOfPeriod] || END_ACTIONS.Lapse : END_ACTIONS.Lapse;

        // The API sends these totals; fall back to computing them only when it hasn't
        const daysPerMonth =
            typeSummary?.daysPerMonth ??
            leaveTypes.reduce(
                (sum, type) => sum + (Number(type.days) || 0) / (PERIOD_META[type.period]?.months || 1),
                0
            );
        const summaryPills = [
            {
                label: "Total Types",
                value: typeSummary?.totalTypes ?? leaveTypes.length,
                color: "#2563EB",
                bg: "#EFF6FF",
                border: "#BFDBFE",
            },
            {
                label: "Days / Month",
                value: `${Number(Number(daysPerMonth).toFixed(2))}d`,
                color: "#059669",
                bg: "#ECFDF5",
                border: "#A7F3D0",
            },
            {
                label: "On-Demand",
                value: typeSummary?.onDemand ?? leaveTypes.filter((type) => Number(type.days) === 0).length,
                color: "#F59E0B",
                bg: "#FFFBEB",
                border: "#FDE68A",
            },
            {
                label: "Encashable",
                value: typeSummary?.encashable ?? leaveTypes.filter((type) => type.endOfPeriod === "Encash").length,
                color: "#DB2777",
                bg: "#FDF2F8",
                border: "#FBCFE8",
            },
        ];

        return (
        <Section
            icon={PolicyIcon}
            title="Leave Policy & Allocation"
            accent={ACCENT.leaveTypes}
            helper="Create each leave type with its own allocation period, accrual, end-of-period action, and deduction rule"
        >
            {/* Summary pills + add action */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    flexWrap: "wrap",
                    mb: 2,
                }}
            >
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {summaryPills.map((pill) => (
                        <Box
                            key={pill.label}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.7,
                                px: 1.8,
                                py: 0.8,
                                borderRadius: "50px",
                                bgcolor: pill.bg,
                                border: `1px solid ${pill.border}`,
                            }}
                        >
                            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{pill.label}:</Typography>
                            <Typography sx={{ fontSize: "13px", fontWeight: "700", color: pill.color }}>
                                {pill.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openTypeDialog(null)}
                    sx={{
                        textTransform: "none",
                        borderRadius: "50px",
                        fontSize: "13.5px",
                        fontWeight: "700",
                        px: 3,
                        py: 1,
                        bgcolor: ACCENT.leaveTypes.color,
                        boxShadow: `0 2px 8px ${ACCENT.leaveTypes.color}40`,
                        "&:hover": { bgcolor: "#047857" },
                    }}
                >
                    Add Leave Type
                </Button>
            </Box>

            {/* How allocation works */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.2,
                    p: 1.6,
                    mb: 2.5,
                    borderRadius: "8px",
                    bgcolor: "#FFFBEB",
                    border: "1px solid #FDE68A",
                }}
            >
                <InfoOutlinedIcon sx={{ color: "#B45309", fontSize: "18px", mt: "1px", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "12px", color: "#78350F", lineHeight: 1.7 }}>
                    Each leave type defines its <strong>allocation period</strong> (Monthly / Quarterly / Half-Yearly /
                    Yearly), its accrual rate (<strong>days per month</strong>), and an{" "}
                    <strong>end-of-period action</strong> for unused days (Encash / Carry Forward / Lapse). Set{" "}
                    <strong>0</strong> days for on-demand leaves. Salary will be deducted for any leave taken beyond the
                    allocation when the deduction rule is on.
                </Typography>
            </Box>

            {/* Leave type cards */}
            {(loadingTypes || leaveTypes.length === 0) && (
                <Box
                    sx={{
                        py: 5,
                        textAlign: "center",
                        borderRadius: "10px",
                        border: "1px dashed #D1D5DB",
                        bgcolor: "#FCFCFD",
                    }}
                >
                    <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#9CA3AF" }}>
                        {loadingTypes ? "Loading leave types…" : "No leave types yet"}
                    </Typography>
                    {!loadingTypes && (
                        <Typography sx={{ fontSize: "12.5px", color: "#D1D5DB", mt: 0.6 }}>
                            Nobody can apply for leave until at least one type exists for {academicYear}.
                        </Typography>
                    )}
                </Box>
            )}

            <Grid container spacing={2}>
                {leaveTypes.map((type) => {
                    const meta = PERIOD_META[type.period] || PERIOD_META.Monthly;
                    const endCfg = END_ACTIONS[type.endOfPeriod] || END_ACTIONS.Lapse;
                    return (
                        <Grid key={type.id} size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
                            <Box
                                sx={{
                                    bgcolor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderTop: `4px solid ${type.color}`,
                                    borderRadius: "10px",
                                    p: 2,
                                    height: "100%",
                                    // padding + border must sit inside the 100% height, else the
                                    // card overflows its grid slot and overlaps the next row
                                    boxSizing: "border-box",
                                    display: "flex",
                                    flexDirection: "column",
                                    // An inactive type stays visible but reads as switched off
                                    opacity: type.isActive ? 1 : 0.65,
                                    transition: "box-shadow 0.25s, transform 0.25s",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: `0 6px 16px ${type.color}26`,
                                    },
                                }}
                            >
                                {/* Code badge + name + actions */}
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2, mb: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "8px",
                                            bgcolor: `${type.color}14`,
                                            border: `1px solid ${type.color}33`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "13px", fontWeight: "700", color: type.color }}>
                                            {type.code}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                                            <Typography
                                                sx={{ fontSize: "15px", fontWeight: "700", color: "#111827", lineHeight: 1.25 }}
                                            >
                                                {type.name}
                                            </Typography>
                                            {!type.isActive && (
                                                <Chip
                                                    label="Inactive"
                                                    size="small"
                                                    sx={{
                                                        height: 19,
                                                        fontSize: "10px",
                                                        fontWeight: "700",
                                                        bgcolor: "#F3F4F6",
                                                        color: "#6B7280",
                                                        border: "1px solid #E5E7EB",
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                                            {type.description}
                                        </Typography>
                                    </Box>
                                    <IconButton size="small" onClick={() => openTypeDialog(type)}>
                                        <EditOutlinedIcon sx={{ fontSize: "17px", color: "#2563EB" }} />
                                    </IconButton>
                                    {/* Delete is refused once anyone has consumed the type */}
                                    <Tooltip
                                        title={type.inUse ? "In use — staff have already taken this leave" : "Delete"}
                                    >
                                        <span>
                                            <IconButton
                                                size="small"
                                                disabled={type.inUse}
                                                onClick={() => removeLeaveType(type)}
                                            >
                                                <DeleteIcon
                                                    sx={{ fontSize: "17px", color: type.inUse ? "#D1D5DB" : "#DC2626" }}
                                                />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Box>

                                {/* Allocation + period */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        p: 1.5,
                                        mb: 1.5,
                                        borderRadius: "8px",
                                        bgcolor: `${type.color}0F`,
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
                                            <Typography
                                                sx={{ fontSize: "24px", fontWeight: "700", color: type.color, lineHeight: 1 }}
                                            >
                                                {type.days}
                                            </Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                                                day(s) / {meta.unit}
                                            </Typography>
                                        </Box>
                                        {/* A monthly cap means the allocation is spread across the period */}
                                        {(type.accruesMonthly || Number(type.maxPerMonth) > 0) && (
                                            <Typography
                                                sx={{ fontSize: "11.5px", color: "#6B7280", fontStyle: "italic", mt: 0.6 }}
                                            >
                                                Accrues monthly across the period
                                            </Typography>
                                        )}
                                    </Box>
                                    <Chip
                                        label={type.period}
                                        size="small"
                                        sx={{
                                            bgcolor: "#fff",
                                            color: type.color,
                                            border: `1px solid ${type.color}55`,
                                            fontWeight: "700",
                                            fontSize: "11px",
                                        }}
                                    />
                                </Box>

                                {/* End-of-period action */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        mb: 1.2,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>End of period:</Typography>
                                    <Chip
                                        label={type.endOfPeriod}
                                        size="small"
                                        sx={{
                                            bgcolor: endCfg.bg,
                                            color: endCfg.color,
                                            border: `1px solid ${endCfg.border}`,
                                            fontWeight: "700",
                                            fontSize: "11px",
                                        }}
                                    />
                                </Box>

                                {/* Extra rules */}
                                <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mt: "auto" }}>
                                    {type.maxPerMonth !== "" && type.maxPerMonth != null && (
                                        <Chip
                                            label={`Max ${type.maxPerMonth}/month`}
                                            size="small"
                                            sx={{
                                                bgcolor: "#ECFEFF",
                                                color: "#0891B2",
                                                border: "1px solid #A5F3FC",
                                                fontWeight: "600",
                                                fontSize: "11px",
                                            }}
                                        />
                                    )}
                                    {type.continuousBlocked && (
                                        <Chip
                                            label="Continuous Leave blocked"
                                            size="small"
                                            sx={{
                                                bgcolor: "#FFFBEB",
                                                color: "#B45309",
                                                border: "1px solid #FDE68A",
                                                fontWeight: "600",
                                                fontSize: "11px",
                                            }}
                                        />
                                    )}
                                    {type.documentRequired && (
                                        <Chip
                                            label="Document required"
                                            size="small"
                                            sx={{
                                                bgcolor: "#F5F3FF",
                                                color: "#7C3AED",
                                                border: "1px solid #DDD6FE",
                                                fontWeight: "600",
                                                fontSize: "11px",
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* Who set this type up, and who touched it last */}
                                {(type.createdBy || type.updatedBy) && (
                                    <Box sx={{ mt: 1.4, pt: 1.1, borderTop: "1px dashed #E5E7EB" }}>
                                        {type.createdBy && (
                                            <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF", lineHeight: 1.5 }}>
                                                Created by {type.createdBy}
                                                {type.createdOn ? ` · ${type.createdOn}` : ""}
                                            </Typography>
                                        )}
                                        {type.updatedBy && (
                                            <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF", lineHeight: 1.5 }}>
                                                Updated by {type.updatedBy}
                                                {type.updatedOn ? ` · ${type.updatedOn}` : ""}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Add / edit leave type */}
            <Dialog
                open={typeDialogOpen}
                onClose={() => setTypeDialogOpen(false)}
                maxWidth="md"
                fullWidth
                scroll="paper"
                slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
            >
                {editingType && (
                    <>
                        {/* ── Dialog header ── */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                px: 2.5,
                                py: 2,
                                bgcolor: ACCENT.leaveTypes.bg,
                                borderBottom: `1px solid ${ACCENT.leaveTypes.border}`,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "9px",
                                    bgcolor: "#fff",
                                    border: `1px solid ${ACCENT.leaveTypes.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <PolicyIcon sx={{ color: ACCENT.leaveTypes.color, fontSize: "20px" }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: "17px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                                    {editingType.id ? "Edit Leave Type" : "Add Leave Type"}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                                    Set allocation, accrual, end-of-period action &amp; special rules
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setTypeDialogOpen(false)}>
                                <CloseIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ bgcolor: "#F9FAFB", p: { xs: 1.5, md: 2.5 } }}>
                            {/* ═══ Identity ═══ */}
                            <FormCard title="LEAVE TYPE IDENTITY">
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7 }}>
                                        <RequiredLabel>Leave Type Name</RequiredLabel>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="e.g., Casual Leave"
                                            value={editingType.name}
                                            onChange={(e) => setEditingType((prev) => ({ ...prev, name: e.target.value }))}
                                            sx={inputSx}
                                            // Server caps at 60; stop at the limit rather than truncating on save
                                            slotProps={{ htmlInput: { maxLength: 60 } }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: "11px",
                                                color: (editingType.name || "").length >= 60 ? "#B45309" : "#9CA3AF",
                                                mt: 0.6,
                                            }}
                                        >
                                            {(editingType.name || "").length} / 60 characters
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5 }}>
                                        <RequiredLabel>Short Code</RequiredLabel>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="e.g., CL"
                                            value={editingType.code}
                                            onChange={(e) =>
                                                setEditingType((prev) => ({
                                                    ...prev,
                                                    // Codes are uppercase alphanumeric, 5 chars max
                                                    code: e.target.value
                                                        .toUpperCase()
                                                        .replace(/[^A-Z0-9]/g, "")
                                                        .slice(0, 5),
                                                }))
                                            }
                                            sx={inputSx}
                                        />
                                        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.6 }}>
                                            Up to 5 chars (A-Z, 0-9)
                                        </Typography>
                                        {/* Not scoped to the academic year — reusing CL next year is rejected */}
                                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mt: 0.5 }}>
                                            <InfoOutlinedIcon sx={{ fontSize: "13px", color: "#B45309", mt: "1px", flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: "11px", color: "#B45309", lineHeight: 1.45 }}>
                                                Must be unique across <strong>every</strong> academic year, not just this one.
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 1 }}>
                                            Color Tag
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                                            {LEAVE_COLORS.map((color) => (
                                                <Box
                                                    key={color}
                                                    onClick={() => setEditingType((prev) => ({ ...prev, color }))}
                                                    sx={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: "50%",
                                                        bgcolor: color,
                                                        cursor: "pointer",
                                                        boxShadow:
                                                            editingType.color === color
                                                                ? "0 0 0 2px #fff, 0 0 0 4px #111827"
                                                                : "none",
                                                        transition: "box-shadow 0.15s, transform 0.15s",
                                                        "&:hover": { transform: "scale(1.08)" },
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 0.7 }}>
                                            Description
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            multiline
                                            rows={2}
                                            placeholder="Brief description of when this leave applies"
                                            value={editingType.description}
                                            onChange={(e) =>
                                                setEditingType((prev) => ({ ...prev, description: e.target.value }))
                                            }
                                            sx={inputSx}
                                            slotProps={{ htmlInput: { maxLength: 250 } }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: "11px",
                                                color: (editingType.description || "").length >= 250 ? "#B45309" : "#9CA3AF",
                                                mt: 0.6,
                                            }}
                                        >
                                            {(editingType.description || "").length} / 250 characters
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </FormCard>

                            {/* ═══ Allocation ═══ */}
                            <FormCard title="HOW IS LEAVE ALLOCATED?">
                                {/* Allocation freezes once staff have consumed the type */}
                                {editingType.inUse && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 1,
                                            p: 1.3,
                                            mb: 2,
                                            borderRadius: "8px",
                                            bgcolor: "#FFFBEB",
                                            border: "1px solid #FDE68A",
                                        }}
                                    >
                                        <InfoOutlinedIcon sx={{ color: AMBER, fontSize: "16px", mt: "1px" }} />
                                        <Typography sx={{ fontSize: "11.5px", color: "#92400E", lineHeight: 1.5 }}>
                                            Staff have already taken this leave, so the allocation is locked. Name,
                                            colour and description stay editable.
                                        </Typography>
                                    </Box>
                                )}

                                <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 1 }}>
                                    Allocation Period
                                </Typography>
                                <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                                    {PERIOD_OPTIONS.map((period) => (
                                        <Grid key={period} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <ChoiceCard
                                                selected={editingType.period === period}
                                                color={ACCENT.leaveTypes.color}
                                                title={period}
                                                description={PERIOD_META[period].resets}
                                                onClick={() =>
                                                    !editingType.inUse && setEditingType((prev) => ({ ...prev, period }))
                                                }
                                            />
                                        </Grid>
                                    ))}
                                </Grid>

                                <Grid container spacing={2.5}>
                                    {/* Left column — the numbers */}
                                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                        <RequiredLabel>Number of Days</RequiredLabel>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            disabled={editingType.inUse}
                                            value={editingType.days}
                                            onChange={(e) => setEditingType((prev) => ({ ...prev, days: e.target.value }))}
                                            sx={inputSx}
                                        />
                                        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.6, mb: 1.8 }}>
                                            Per {draftMeta.unit} · set 0 for unlimited / on-demand
                                        </Typography>

                                        <RequiredLabel optional>Max Days Per Month</RequiredLabel>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            disabled={editingType.inUse}
                                            value={editingType.maxPerMonth}
                                            onChange={(e) =>
                                                setEditingType((prev) => ({ ...prev, maxPerMonth: e.target.value }))
                                            }
                                            sx={inputSx}
                                        />
                                        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.6 }}>
                                            Set 0 to allow using all allocated days in one month (max allowed: {draftDays})
                                        </Typography>
                                    </Grid>

                                    {/* Right column — reference readouts */}
                                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                        <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 0.7 }}>
                                            Monthly Equivalent{" "}
                                            <Box component="span" sx={{ color: "#9CA3AF", fontWeight: 400 }}>
                                                (reference)
                                            </Box>
                                        </Typography>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: "8px",
                                                bgcolor: ACCENT.leaveTypes.bg,
                                                border: `1px solid ${ACCENT.leaveTypes.border}`,
                                            }}
                                        >
                                            <Typography
                                                sx={{ fontSize: "15px", fontWeight: "700", color: ACCENT.leaveTypes.color }}
                                            >
                                                {/* Server sends monthlyEquivalent once saved; compute only for a fresh draft */}
                                                {(editingType.monthlyEquivalent ?? draftMonthlyEq).toFixed(2)} day(s) /
                                                month
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.6, mb: 1.5 }}>
                                            Auto-calculated from period &amp; total days
                                        </Typography>

                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: "8px",
                                                bgcolor: "#F3F4F6",
                                                border: "1px solid #E5E7EB",
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "12.5px", fontWeight: "700", color: "#374151" }}>
                                                Why use a monthly cap?
                                            </Typography>
                                            <Typography sx={{ fontSize: "11.5px", color: "#6B7280", mt: 0.5, lineHeight: 1.6 }}>
                                                Spreads leaves across the year. e.g. 6 / year + max 3 / month means once 3
                                                are used in a month, only the remaining balance carries to other months.
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Plain-language recap of the numbers above */}
                                <Box
                                    sx={{
                                        mt: 2.5,
                                        p: 1.5,
                                        borderRadius: "0 8px 8px 0",
                                        bgcolor: ACCENT.leaveTypes.bg,
                                        borderLeft: `4px solid ${ACCENT.leaveTypes.color}`,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "12.5px", color: "#374151", lineHeight: 1.6 }}>
                                        <strong>{draftDays}</strong> day(s) per <strong>{draftMeta.unit}</strong> —{" "}
                                        {draftCap > 0 ? (
                                            <>
                                                capped at <strong>{draftCap} / month</strong>, remaining balance carries to
                                                later months
                                            </>
                                        ) : (
                                            <>
                                                all <strong>available from day 1</strong>
                                            </>
                                        )}
                                        . Counter resets at the end of each {draftMeta.unit}.
                                    </Typography>
                                </Box>
                            </FormCard>

                            {/* ═══ Unused leave ═══ */}
                            <FormCard title="WHAT HAPPENS TO UNUSED LEAVE?">
                                <Grid container spacing={1.5}>
                                    {END_ACTION_OPTIONS.map((action) => (
                                        <Grid key={action} size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                                            <ChoiceCard
                                                selected={editingType.endOfPeriod === action}
                                                color={END_ACTIONS[action].color}
                                                title={action}
                                                description={END_ACTIONS[action].desc}
                                                onClick={() =>
                                                    setEditingType((prev) => ({ ...prev, endOfPeriod: action }))
                                                }
                                            />
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Encashment scheduling — server requires both when the action is
                                    Encash and rejects them for Carry Forward / Lapse, so they are
                                    bound to the radio and only sent for an encashing type. */}
                                {editingType.endOfPeriod === "Encash" && (
                                    <>
                                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 0.7 }}>
                                                    When is encashment credited?
                                                </Typography>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size="small"
                                                    value={editingType.encashCreditedWhen || "End of Period"}
                                                    onChange={(e) =>
                                                        setEditingType((prev) => ({ ...prev, encashCreditedWhen: e.target.value }))
                                                    }
                                                    sx={inputSx}
                                                >
                                                    {Object.keys(ENCASH_CREDITED_WHEN_TO_API).map((label) => (
                                                        <MenuItem key={label} value={label} sx={{ fontSize: "13.5px" }}>
                                                            {label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.6 }}>
                                                    {editingType.encashCreditedWhen === "End of Period"
                                                        ? `Follows this type's own period — credits at each ${draftMeta.unit} end`
                                                        : "Unused days credited to salary at this time"}
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mb: 0.7 }}>
                                                    Encashment Formula
                                                </Typography>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size="small"
                                                    value={editingType.encashFormula || "Gross / Working Days"}
                                                    onChange={(e) =>
                                                        setEditingType((prev) => ({ ...prev, encashFormula: e.target.value }))
                                                    }
                                                    sx={inputSx}
                                                >
                                                    {Object.keys(ENCASH_FORMULA_TO_API).map((label) => (
                                                        <MenuItem key={label} value={label} sx={{ fontSize: "13.5px" }}>
                                                            {label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.6 }}>
                                                    {ENCASH_FORMULA_HINT[editingType.encashFormula] ||
                                                        ENCASH_FORMULA_HINT["Gross / Working Days"]}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        {/* The backend captures these but no sweep pays them out yet —
                                            say so rather than imply money will move. */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 1,
                                                mt: 1.8,
                                                p: 1.4,
                                                borderRadius: "8px",
                                                bgcolor: "#FFFBEB",
                                                border: "1px solid #FDE68A",
                                            }}
                                        >
                                            <InfoOutlinedIcon sx={{ fontSize: "16px", color: "#B45309", mt: "1px", flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: "11.5px", color: "#92400E", lineHeight: 1.6 }}>
                                                These settings are saved, but the encashment payout is <strong>not built yet</strong> —
                                                no amount is credited to a payslip. Unused days will not be paid out until the
                                                backend sweep is released.
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </FormCard>

                            {/* ═══ Special rules ═══ */}
                            <FormCard title="SPECIAL RULES">
                                {[
                                    {
                                        key: "continuousBlocked",
                                        title: "Continuous Leave — block any back-to-back leave",
                                        description:
                                            "Leave can only be taken as a single, standalone working day. The day before and the day after cannot be a holiday, weekend, or another leave — blocking every form of continuous / sandwich leave.",
                                    },
                                    {
                                        key: "documentRequired",
                                        title: "Require supporting document",
                                        description:
                                            "User must upload a document (e.g., medical certificate) when applying for this leave.",
                                    },
                                    // NOTE: `isActive` is deliberately NOT here. The API returns it on
                                    // GET but the documented POST/PUT body has no such field, so a
                                    // toggle would look editable and silently never persist. It is
                                    // shown read-only on the card instead.
                                ].map((rule, index) => (
                                    <Box
                                        key={rule.key}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 2,
                                            p: 1.8,
                                            mb: index === 0 ? 1.5 : 0,
                                            borderRadius: "10px",
                                            bgcolor: "#fff",
                                            border: "1px solid #E5E7EB",
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontSize: "13.5px", fontWeight: "700", color: "#111827" }}>
                                                {rule.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11.5px", color: "#6B7280", lineHeight: 1.6, mt: 0.3 }}>
                                                {rule.description}
                                            </Typography>
                                        </Box>
                                        <GreenSwitch
                                            checked={Boolean(editingType[rule.key])}
                                            onChange={(e) =>
                                                setEditingType((prev) => ({ ...prev, [rule.key]: e.target.checked }))
                                            }
                                        />
                                    </Box>
                                ))}
                            </FormCard>

                            {/* ═══ Policy summary ═══ */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: "10px",
                                    bgcolor: ACCENT.leaveTypes.bg,
                                    border: `1px solid ${ACCENT.leaveTypes.border}`,
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.2 }}>
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: "7px",
                                            bgcolor: "#DBEAFE",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "15px", fontWeight: "700", color: "#2563EB", lineHeight: 1 }}>
                                            –
                                        </Typography>
                                    </Box>
                                    <Typography
                                        sx={{ fontSize: "14px", fontWeight: "700", color: ACCENT.leaveTypes.color }}
                                    >
                                        Leave Type — Policy Summary
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "12.5px", color: "#374151", lineHeight: 1.9 }}>
                                    • <strong>{draftDays}</strong> day(s) per <strong>{draftMeta.unit}</strong> —{" "}
                                    {draftCap > 0 ? (
                                        <>
                                            max <strong>{draftCap} / month</strong> (spread across the period)
                                        </>
                                    ) : (
                                        <>
                                            all <strong>available from day 1</strong> (lump sum)
                                        </>
                                    )}
                                    <br />• Unused at period end:{" "}
                                    <Box component="span" sx={{ color: draftEndCfg.color, fontWeight: 700 }}>
                                        {draftEndCfg.summary}
                                    </Box>
                                    {editingType.continuousBlocked && (
                                        <>
                                            <br />• Continuous / sandwich leave is <strong>blocked</strong>
                                        </>
                                    )}
                                    {editingType.documentRequired && (
                                        <>
                                            <br />• A <strong>supporting document</strong> is required when applying
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fff", borderTop: "1px solid #E5E7EB" }}>
                            <Button
                                onClick={() => setTypeDialogOpen(false)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "50px",
                                    border: "1px solid #D1D5DB",
                                    color: "#374151",
                                    fontSize: "13.5px",
                                    fontWeight: "600",
                                    px: 3.5,
                                    py: 0.9,
                                    "&:hover": { bgcolor: "#F9FAFB" },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={saveLeaveType}
                                disabled={savingType || !editingType.name || !editingType.code}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "50px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    px: 3.5,
                                    py: 0.9,
                                    bgcolor: ACCENT.leaveTypes.color,
                                    boxShadow: `0 2px 8px ${ACCENT.leaveTypes.color}40`,
                                    "&:hover": { bgcolor: "#047857" },
                                }}
                            >
                                {savingType ? "Saving…" : editingType.id ? "Save Changes" : "Add Leave Type"}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Section>
        );
    };

    /* ─────────────── Working Calendar tab ─────────────── */
    const renderWorkingCalendar = () => {
        const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
        const leadingBlanks = new Date(viewDate.year, viewDate.month, 1).getDay();
        const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
        const cells = Array.from({ length: totalCells }, (_, i) => {
            const day = i - leadingBlanks + 1;
            return day >= 1 && day <= daysInMonth ? day : null;
        });

        // Counters shown next to the month title
        const localCounts = { working: 0, holiday: 0, mandatory: 0 };
        for (let day = 1; day <= daysInMonth; day += 1) localCounts[statusForDay(day)] += 1;
        // Prefer the server's totals; fall back to the grid while a month is unsaved or edited
        const counts = {
            working: calendarCounts?.working ?? localCounts.working,
            holiday: calendarCounts?.holiday ?? localCounts.holiday,
            mandatory: calendarCounts?.mandatory ?? localCounts.mandatory,
        };
        const totalWorkingDays = counts.working + counts.mandatory;

        const monthLabel = new Date(viewDate.year, viewDate.month, 1).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        });

        const legend = [
            { label: `${counts.working} Working`, ...DAY_STATUS.working, border: "#A7F3D0" },
            { label: `${counts.holiday} Holiday`, ...DAY_STATUS.holiday, border: "#FECACA" },
            { label: `${counts.mandatory} Mandatory`, ...DAY_STATUS.mandatory, border: "#FDE68A" },
        ];

        return (
            <Section
                icon={CalendarMonthIcon}
                title="Working Calendar"
                accent={ACCENT.calendar}
                helper="Define default working days and customize each month — click a date to cycle: Working → Holiday → Mandatory"
            >
                {/* ── Default weekly pattern ── */}
                <Typography sx={{ fontSize: "13px", fontWeight: "700", color: "#111827", mb: 1.2 }}>
                    Default Working Days (applied to every month)
                </Typography>
                <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", mb: 1.2 }}>
                    {WEEK_DAYS.map((day, index) => {
                        const active = workingDays.includes(index);
                        return (
                            <Box
                                key={day}
                                onClick={() => toggleWorkingDay(index)}
                                sx={{
                                    minWidth: "68px",
                                    textAlign: "center",
                                    px: 2,
                                    py: 1,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    userSelect: "none",
                                    bgcolor: active ? "#F0FDF4" : "#F9FAFB",
                                    color: active ? "#059669" : "#9CA3AF",
                                    border: `1px solid ${active ? "#A7F3D0" : "#E5E7EB"}`,
                                    transition: "0.2s",
                                    "&:hover": { borderColor: active ? "#6EE7B7" : "#D1D5DB" },
                                }}
                            >
                                {day}
                            </Box>
                        );
                    })}
                </Box>
                <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mb: 2 }}>
                    Click a day to toggle. Green = working day, grey = holiday. These defaults apply to all months
                    unless overridden below.
                </Typography>

                {/* ── Editing rules ── */}
                <Box sx={{ mb: 1.5 }}>
                    <InfoNote color="#2563EB" bg="#EFF6FF" border="#BFDBFE">
                        You can edit and save the working calendar only for <strong>upcoming months</strong>. The{" "}
                        <strong>current month</strong> and <strong>past months</strong> are read-only — once a month has
                        started, its working-day pattern is locked. Plan ahead by saving each upcoming month before it
                        begins.
                    </InfoNote>
                </Box>

                {isReadOnlyMonth && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                            p: 1.3,
                            mb: 2,
                            borderRadius: "8px",
                            bgcolor: ACCENT.deduction.bg,
                            border: `1px solid ${ACCENT.deduction.border}`,
                        }}
                    >
                        <ErrorOutlineIcon sx={{ color: ACCENT.deduction.color, fontSize: "16px", mt: "1px" }} />
                        <Typography sx={{ fontSize: "11.5px", color: "#374151", lineHeight: 1.5 }}>
                            <strong>{monthLabel}</strong> is {isCurrentMonth ? "the current month" : "a past month"} and
                            is <strong>read-only</strong>. You cannot edit or save changes for this month — navigate to
                            an upcoming month using the arrow.
                        </Typography>
                    </Box>
                )}

                {/* A month with no saved row falls back to Mon–Fri server-side, with no warning
                    of its own — which is why school holidays then read as absences. */}
                {!loadingCalendar && !calendarSaved && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                            p: 1.3,
                            mb: 2,
                            borderRadius: "8px",
                            bgcolor: "#FFFBEB",
                            border: "1px solid #FDE68A",
                        }}
                    >
                        <ErrorOutlineIcon sx={{ color: AMBER, fontSize: "16px", mt: "1px" }} />
                        <Typography sx={{ fontSize: "11.5px", color: "#92400E", lineHeight: 1.5 }}>
                            No working calendar is saved for <strong>{monthLabel}</strong>. Until one is saved the
                            system assumes <strong>Mon–Fri working, Sat–Sun holiday</strong>, so school holidays will
                            be counted as absences and payroll will use the wrong working-day divisor.
                        </Typography>
                    </Box>
                )}

                {/* ── Month navigation + counters ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                        mb: 1.5,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <IconButton size="small" onClick={() => shiftMonth(-1)} sx={{ border: "1px solid #E5E7EB" }}>
                            <ChevronLeftIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                        </IconButton>
                        <Box sx={{ textAlign: "center", minWidth: "150px" }}>
                            <Typography sx={{ fontSize: "17px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                                {monthLabel}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    color: isReadOnlyMonth ? ACCENT.deduction.color : "#059669",
                                }}
                            >
                                {isCurrentMonth
                                    ? "Current Month · Read-only"
                                    : isPastMonth
                                    ? "Past Month · Read-only"
                                    : "Upcoming Month · Editable"}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => shiftMonth(1)} sx={{ border: "1px solid #E5E7EB" }}>
                            <ChevronRightIcon sx={{ fontSize: "18px", color: "#374151" }} />
                        </IconButton>
                        <Chip
                            label={isReadOnlyMonth ? "Read-only" : "Editable"}
                            size="small"
                            sx={{
                                bgcolor: isReadOnlyMonth ? "#F3F4F6" : "#ECFDF5",
                                color: isReadOnlyMonth ? "#6B7280" : "#059669",
                                border: `1px solid ${isReadOnlyMonth ? "#E5E7EB" : "#A7F3D0"}`,
                                fontWeight: "600",
                                fontSize: "11.5px",
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        {legend.map((item) => (
                            <Box
                                key={item.label}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.7,
                                    px: 1.5,
                                    py: 0.7,
                                    borderRadius: "50px",
                                    bgcolor: item.bg,
                                    border: `1px solid ${item.border}`,
                                }}
                            >
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                                <Typography sx={{ fontSize: "12px", fontWeight: "700", color: item.color }}>
                                    {item.label}
                                </Typography>
                            </Box>
                        ))}
                        <Button
                            disabled={isReadOnlyMonth || savingCalendar || loadingCalendar}
                            onClick={saveCalendar}
                            startIcon={isReadOnlyMonth ? <EditOutlinedIcon /> : <SaveOutlinedIcon />}
                            variant={isReadOnlyMonth ? "text" : "contained"}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                px: 2,
                                bgcolor: isReadOnlyMonth ? "#F3F4F6" : ACCENT.calendar.color,
                                color: isReadOnlyMonth ? "#9CA3AF" : "#fff",
                                "&:hover": { bgcolor: isReadOnlyMonth ? "#F3F4F6" : "#0F766E" },
                            }}
                        >
                            {isReadOnlyMonth ? "Read-only" : savingCalendar ? "Saving…" : "Save Month"}
                        </Button>
                    </Box>
                </Box>

                {/* ── Month grid ── */}
                <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
                    {/* Weekday header */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "#FDF4F5" }}>
                        {WEEK_DAYS.map((day, index) => (
                            <Box
                                key={day}
                                sx={{
                                    py: 1.2,
                                    textAlign: "center",
                                    borderRight: index === 6 ? "none" : "1px solid #E5E7EB",
                                    borderBottom: "1px solid #E5E7EB",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "12.5px",
                                        fontWeight: "600",
                                        color: index === 0 ? ACCENT.deduction.color : "#6B7280",
                                    }}
                                >
                                    {day}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Date cells */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                        {cells.map((day, index) => {
                            if (day === null) {
                                return (
                                    <Box
                                        key={`blank-${index}`}
                                        sx={{
                                            minHeight: "70px",
                                            bgcolor: "#fff",
                                            borderRight: index % 7 === 6 ? "none" : "1px solid #F3F4F6",
                                            borderBottom: "1px solid #F3F4F6",
                                        }}
                                    />
                                );
                            }
                            const status = statusForDay(day);
                            const cfg = DAY_STATUS[status];
                            const isToday = isCurrentMonth && day === today.getDate();
                            return (
                                <Box
                                    key={day}
                                    onClick={() => cycleDay(day)}
                                    sx={{
                                        minHeight: "70px",
                                        p: 1,
                                        boxSizing: "border-box",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: cfg.bg,
                                        borderRight: index % 7 === 6 ? "none" : "1px solid #F3F4F6",
                                        borderBottom: "1px solid #F3F4F6",
                                        cursor: isReadOnlyMonth ? "default" : "pointer",
                                        transition: "background-color 0.15s",
                                        "&:hover": !isReadOnlyMonth ? { filter: "brightness(0.97)" } : undefined,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "14px", fontWeight: "600", color: cfg.color }}>
                                        {day}
                                    </Typography>
                                    {cfg.tag && (
                                        <Typography sx={{ fontSize: "9.5px", fontWeight: "600", color: cfg.color, mt: 0.2 }}>
                                            {cfg.tag}
                                        </Typography>
                                    )}
                                    {isToday && (
                                        <Box
                                            sx={{
                                                width: 5,
                                                height: 5,
                                                borderRadius: "50%",
                                                bgcolor: cfg.color,
                                                mt: 0.4,
                                            }}
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* ── How the cycle works ── */}
                <Box sx={{ mt: 2 }}>
                    <InfoNote color={ACCENT.calendar.color} bg={ACCENT.calendar.bg} border={ACCENT.calendar.border}>
                        <strong>Click any date</strong> (in an upcoming month) to cycle through:{" "}
                        <Box component="span" sx={{ color: "#059669", fontWeight: 700 }}>
                            Working
                        </Box>{" "}
                        →{" "}
                        <Box component="span" sx={{ color: "#DC2626", fontWeight: 700 }}>
                            Holiday
                        </Box>{" "}
                        →{" "}
                        <Box component="span" sx={{ color: "#D97706", fontWeight: 700 }}>
                            Mandatory Working Day (MWD)
                        </Box>{" "}
                        → Working. Days without overrides follow the default weekly pattern above. The{" "}
                        <strong>Total Working Days ({totalWorkingDays})</strong> value is used in the salary deduction
                        formula. The <strong>current month</strong> and <strong>past months</strong> are read-only —
                        only future months can be edited.
                    </InfoNote>
                </Box>
            </Section>
        );
    };

    /* ─────────────── Assign Shifts tab ─────────────── */
    const renderAssignShifts = () => {
        const unassignedStaff = rosters.unassigned || [];
        const unassignedCount = unassignedStaff.length;
        const assignedCount = assignableShifts.reduce(
            (sum, shift) => sum + (rosters[shift.shiftId]?.length || 0),
            0
        );
        const totalStaff = assignedCount + unassignedCount;
        const assignedPercent = totalStaff ? (assignedCount / totalStaff) * 100 : 0;

        const activeShift = assignableShifts.find((s) => s.shiftId === shiftTab);
        const query = staffQuery.trim().toLowerCase();
        const listedStaff = (rosters[shiftTab] || []).filter((s) =>
            !query
                ? true
                : [s.name, s.rollNumber, s.role].some((value) => String(value).toLowerCase().includes(query))
        );

        // Shift filter tabs, with "Unassigned" pinned at the end
        const shiftTabs = [
            ...assignableShifts.map((shift) => ({
                key: shift.shiftId,
                label: shift.name,
                caption: `${formatTime(shift.startTime)} – ${formatTime(shift.endTime)}`,
                color: shift.color || SHIFT_COLORS[0],
                count: rosters[shift.shiftId]?.length || 0,
            })),
            {
                key: "unassigned",
                label: "Unassigned",
                caption: "",
                color: "#374151",
                count: unassignedCount,
            },
        ];

        const shiftOf = (row) => assignableShifts.find((s) => s.shiftId === row.shiftId);

        // Everything on this tab picks up the selected shift's colour
        const accent = shiftTab === "unassigned" ? "#374151" : activeShift?.color || ACCENT.shift.color;

        return (
            <Box>
                {/* ── Title + assigned progress ── */}
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
                        <Typography sx={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>
                            Assign Shifts
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.3 }}>
                            Assign each staff member to a shift for {academicYear}. Move them anytime they{" "}
                            <Box component="span" sx={{ color: ACCENT.shift.color }}>
                                switch shifts
                            </Box>
                            .
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            px: 2,
                            py: 1.2,
                            borderRadius: "10px",
                            bgcolor: "#fff",
                            border: "1px solid #E5E7EB",
                        }}
                    >
                        <Box sx={{ position: "relative", display: "inline-flex" }}>
                            <CircularProgress
                                variant="determinate"
                                value={100}
                                size={42}
                                thickness={3.5}
                                sx={{ color: "#F3F4F6" }}
                            />
                            <CircularProgress
                                variant="determinate"
                                value={assignedPercent}
                                size={42}
                                thickness={3.5}
                                sx={{ color: ACCENT.shift.color, position: "absolute", left: 0 }}
                            />
                        </Box>
                        <Box>
                            <Typography
                                sx={{ fontSize: "10.5px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.6px" }}
                            >
                                ASSIGNED
                            </Typography>
                            <Typography sx={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>
                                {assignedCount}
                                <Box component="span" sx={{ color: "#9CA3AF", fontWeight: 500 }}>
                                    {" "}
                                    / {totalStaff}
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* ── Shift filter tabs ── */}
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
                    {shiftTabs.map((item) => {
                        const active = shiftTab === item.key;
                        const isUnassigned = item.key === "unassigned";
                        return (
                            <Box
                                key={item.key}
                                onClick={() => setShiftTab(item.key)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.2,
                                    px: 2,
                                    py: 1.2,
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    bgcolor: active ? `${item.color}0F` : "#fff",
                                    border: `${active ? "2px" : "1px"} solid ${active ? item.color : "#E5E7EB"}`,
                                    transition: "0.2s",
                                    "&:hover": { borderColor: item.color },
                                }}
                            >
                                {isUnassigned ? (
                                    <PersonOffIcon sx={{ fontSize: "18px", color: active ? item.color : "#6B7280" }} />
                                ) : (
                                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: item.color }} />
                                )}
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "13.5px",
                                            fontWeight: "700",
                                            color: active ? item.color : "#111827",
                                            lineHeight: 1.25,
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                    {item.caption && (
                                        <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                                            {item.caption}
                                        </Typography>
                                    )}
                                </Box>
                                <Box
                                    sx={{
                                        minWidth: 26,
                                        px: 1,
                                        py: 0.3,
                                        borderRadius: "50px",
                                        textAlign: "center",
                                        bgcolor: isUnassigned ? "#FEF2F2" : active ? item.color : "#F3F4F6",
                                        color: isUnassigned ? "#DC2626" : active ? "#fff" : "#6B7280",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                    }}
                                >
                                    {item.count}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                {/* ── Search + view toggle + assign ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap", mb: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search staff by name, ID or role..."
                        value={staffQuery}
                        onChange={(e) => setStaffQuery(e.target.value)}
                        sx={{ ...inputSx, flex: 1, minWidth: "240px" }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: "19px", color: "#9CA3AF" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            overflow: "hidden",
                            bgcolor: "#fff",
                        }}
                    >
                        {[
                            { key: "grid", icon: GridViewIcon },
                            { key: "list", icon: ViewListIcon },
                        ].map((view) => {
                            const ViewIcon = view.icon;
                            const active = staffView === view.key;
                            return (
                                <IconButton
                                    key={view.key}
                                    onClick={() => setStaffView(view.key)}
                                    sx={{ borderRadius: 0, bgcolor: active ? "#EEF2FF" : "transparent" }}
                                >
                                    <ViewIcon sx={{ fontSize: "19px", color: active ? "#4F46E5" : "#9CA3AF" }} />
                                </IconButton>
                            );
                        })}
                    </Box>

                    {/* Assigning happens into a shift, so this is hidden on the Unassigned tab */}
                    {shiftTab !== "unassigned" && (
                        <Button
                            variant="contained"
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={openAssignDialog}
                            disabled={!unassignedStaff.length || !assignableShifts.length || loadingRosters}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                fontSize: "13.5px",
                                fontWeight: "700",
                                px: 2.5,
                                py: 1,
                                bgcolor: accent,
                                "&:hover": { bgcolor: accent, filter: "brightness(0.92)" },
                            }}
                        >
                            Assign Staff
                        </Button>
                    )}
                </Box>

                {/* ── Staff list ── */}
                {listedStaff.length === 0 ? (
                    <Box
                        sx={{
                            border: "1px dashed #D1D5DB",
                            borderRadius: "10px",
                            bgcolor: "#FCFCFD",
                            py: 7,
                            textAlign: "center",
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#9CA3AF" }}>
                            {loadingRosters
                                ? "Loading staff…"
                                : query
                                ? "No staff match your search"
                                : shiftTab === "unassigned"
                                ? "Every staff member has a shift"
                                : "No staff in this shift yet"}
                        </Typography>
                        {/* Attendance posting is refused for anyone without a shift */}
                        {!loadingRosters && !assignableShifts.length && (
                            <Typography sx={{ fontSize: "12.5px", color: "#D1D5DB", mt: 0.8, px: 3 }}>
                                No shifts exist yet — add them under Policy Setup and save the policy first.
                            </Typography>
                        )}
                        {!loadingRosters && !query && shiftTab !== "unassigned" && unassignedStaff.length > 0 && (
                            <Button
                                startIcon={<PersonAddAlt1Icon />}
                                onClick={openAssignDialog}
                                sx={{
                                    textTransform: "none",
                                    mt: 1.5,
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    color: accent,
                                }}
                            >
                                Assign staff to this shift
                            </Button>
                        )}
                    </Box>
                ) : staffView === "grid" ? (
                    <Grid container spacing={2}>
                        {listedStaff.map((row) => {
                            const rowShift = shiftOf(row);
                            const rowColor = rowShift?.color || "#6B7280";
                            return (
                                <Grid key={row.rollNumber} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                    <Box
                                        sx={{
                                            bgcolor: "#fff",
                                            border: "1px solid #E5E7EB",
                                            borderRadius: "10px",
                                            p: 2,
                                            height: "100%",
                                            boxSizing: "border-box",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1.5,
                                            transition: "box-shadow 0.25s, transform 0.25s",
                                            "&:hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow: `0 6px 16px ${rowColor}26`,
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, minWidth: 0 }}>
                                            <Avatar
                                                sx={{
                                                    width: 46,
                                                    height: 46,
                                                    bgcolor: rowShift ? `${rowColor}1A` : "#F3F4F6",
                                                    color: rowShift ? rowColor : "#6B7280",
                                                    fontSize: "14px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {initialsOf(row.name)}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    sx={{ fontSize: "15px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}
                                                >
                                                    {row.name}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                    {row.rollNumber} · {row.role}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 1,
                                                mt: "auto",
                                            }}
                                        >
                                            <Chip
                                                label={rowShift ? rowShift.name : "Unassigned"}
                                                size="small"
                                                sx={{
                                                    bgcolor: rowShift ? `${rowColor}14` : "#F3F4F6",
                                                    color: rowShift ? rowColor : "#6B7280",
                                                    fontWeight: "600",
                                                    fontSize: "11.5px",
                                                }}
                                            />
                                            <Box sx={{ display: "flex", gap: 0.3 }}>
                                                <IconButton size="small" onClick={() => openStaffDialog(row, "view")}>
                                                    <VisibilityOutlinedIcon sx={{ fontSize: "18px", color: "#6B7280" }} />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => openStaffDialog(row, "move")}>
                                                    <SwapHorizIcon sx={{ fontSize: "18px", color: "#6B7280" }} />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <TableContainer sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", bgcolor: "#fff" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                                    {["Staff", "Roll No.", "Role", "Assigned On", "Shift"].map((head) => (
                                        <TableCell
                                            key={head}
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                color: "#374151",
                                                borderBottom: "1px solid #E5E7EB",
                                            }}
                                        >
                                            {head}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {listedStaff.map((row) => {
                                    const rowShift = shiftOf(row);
                                    const rowColor = rowShift?.color || "#6B7280";
                                    return (
                                        <TableRow key={row.rollNumber} hover>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 30,
                                                            height: 30,
                                                            bgcolor: rowShift ? `${rowColor}1A` : "#F3F4F6",
                                                            color: rowColor,
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                        }}
                                                    >
                                                        {initialsOf(row.name)}
                                                    </Avatar>
                                                    <Typography
                                                        sx={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}
                                                    >
                                                        {row.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "13px", color: "#6B7280" }}>{row.rollNumber}</TableCell>
                                            <TableCell sx={{ fontSize: "13px", color: "#6B7280" }}>{row.role}</TableCell>
                                            <TableCell sx={{ fontSize: "13px", color: "#6B7280" }}>
                                                {row.assignedOn || "—"}
                                            </TableCell>
                                            <TableCell sx={{ width: "190px" }}>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size="small"
                                                    value={row.shiftId ?? ""}
                                                    onChange={(e) => applyShiftChange(row, e.target.value)}
                                                    sx={inputSx}
                                                >
                                                    <MenuItem value="" sx={{ fontSize: "13.5px" }}>
                                                        Unassigned
                                                    </MenuItem>
                                                    {assignableShifts.map((shift) => (
                                                        <MenuItem
                                                            key={shift.shiftId}
                                                            value={shift.shiftId}
                                                            sx={{ fontSize: "13.5px" }}
                                                        >
                                                            {shift.name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* ── Bulk assign dialog ── */}
                <Dialog
                    open={assignDialogOpen}
                    onClose={() => setAssignDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            px: 2.5,
                            py: 2,
                            bgcolor: ACCENT.shift.bg,
                            borderBottom: `1px solid ${ACCENT.shift.border}`,
                        }}
                    >
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "9px",
                                bgcolor: "#fff",
                                border: `1px solid ${ACCENT.shift.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <PersonAddAlt1Icon sx={{ color: ACCENT.shift.color, fontSize: "20px" }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                                Assign Staff
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                                Pick the staff to move into a shift
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setAssignDialogOpen(false)}>
                            <CloseIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
                        </IconButton>
                    </Box>

                    <DialogContent sx={{ p: 2.5 }}>
                        <Field label="Assign to shift">
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={assignTarget ?? ""}
                                onChange={(e) => setAssignTarget(e.target.value)}
                                sx={inputSx}
                            >
                                {assignableShifts.map((shift) => (
                                    <MenuItem key={shift.shiftId} value={shift.shiftId} sx={{ fontSize: "13.5px" }}>
                                        {shift.name} · {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Field>

                        <Typography sx={{ fontSize: "12.5px", fontWeight: "600", color: "#374151", mt: 2, mb: 1 }}>
                            Unassigned staff ({unassignedStaff.length})
                        </Typography>
                        <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", maxHeight: "300px", overflowY: "auto" }}>
                            {unassignedStaff.map((row) => {
                                const checked = assignSelection.includes(row.rollNumber);
                                return (
                                    <Box
                                        key={row.rollNumber}
                                        onClick={() =>
                                            setAssignSelection((prev) =>
                                                checked
                                                    ? prev.filter((roll) => roll !== row.rollNumber)
                                                    : [...prev, row.rollNumber]
                                            )
                                        }
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.2,
                                            px: 1.5,
                                            py: 1,
                                            cursor: "pointer",
                                            borderBottom: "1px solid #F3F4F6",
                                            bgcolor: checked ? ACCENT.shift.bg : "#fff",
                                            "&:last-of-type": { borderBottom: "none" },
                                        }}
                                    >
                                        <Checkbox
                                            checked={checked}
                                            size="small"
                                            sx={{ p: 0, "&.Mui-checked": { color: ACCENT.shift.color } }}
                                        />
                                        <Avatar
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                bgcolor: "#F3F4F6",
                                                color: "#6B7280",
                                                fontSize: "11px",
                                                fontWeight: "700",
                                            }}
                                        >
                                            {initialsOf(row.name)}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                                                {row.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                                                {row.rollNumber} · {row.role}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB" }}>
                        <Button
                            onClick={() => setAssignDialogOpen(false)}
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
                            disabled={!assignSelection.length || !assignTarget || assigning}
                            onClick={confirmAssign}
                            sx={{
                                textTransform: "none",
                                borderRadius: "50px",
                                fontSize: "13.5px",
                                fontWeight: "700",
                                px: 3,
                                bgcolor: ACCENT.shift.color,
                                "&:hover": { bgcolor: "#0E7490" },
                            }}
                        >
                            {assigning ? "Assigning…" : `Assign ${assignSelection.length || ""}`}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── Single staff: view details / move shift ── */}
                <Dialog
                    open={Boolean(staffDialog)}
                    onClose={() => setStaffDialog(null)}
                    maxWidth="xs"
                    fullWidth
                    slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
                >
                    {staffDialog && (
                        <>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    px: 2.5,
                                    py: 2,
                                    bgcolor: "#F9FAFB",
                                    borderBottom: "1px solid #E5E7EB",
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        bgcolor: "#F3F4F6",
                                        color: "#6B7280",
                                        fontSize: "14px",
                                        fontWeight: "700",
                                    }}
                                >
                                    {initialsOf(staffDialog.row.name)}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                                        {staffDialog.row.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11.5px", color: "#6B7280" }}>
                                        {staffDialog.row.rollNumber} · {staffDialog.row.role}
                                    </Typography>
                                </Box>
                                <IconButton size="small" onClick={() => setStaffDialog(null)}>
                                    <CloseIcon sx={{ fontSize: "20px", color: "#6B7280" }} />
                                </IconButton>
                            </Box>

                            <DialogContent sx={{ p: 2.5 }}>
                                {staffDialog.mode === "view" ? (
                                    <Box>
                                        {[
                                            { label: "Roll Number", value: staffDialog.row.rollNumber },
                                            { label: "Role", value: staffDialog.row.role },
                                            { label: "Assigned On", value: staffDialog.row.assignedOn || "—" },
                                            {
                                                label: "Current Shift",
                                                value: shiftOf(staffDialog.row)?.name || "Unassigned",
                                            },
                                            {
                                                label: "Shift Timing",
                                                value: shiftOf(staffDialog.row)
                                                    ? `${formatTime(shiftOf(staffDialog.row).startTime)} – ${formatTime(
                                                          shiftOf(staffDialog.row).endTime
                                                      )}`
                                                    : "—",
                                            },
                                        ].map((item) => (
                                            <Box
                                                key={item.label}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    gap: 2,
                                                    py: 1.1,
                                                    borderBottom: "1px solid #F3F4F6",
                                                    "&:last-of-type": { borderBottom: "none" },
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                                                    {item.label}
                                                </Typography>
                                                <Typography
                                                    sx={{ fontSize: "12.5px", fontWeight: "600", color: "#111827" }}
                                                >
                                                    {item.value}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Field label="Move to shift" helper="Pick a shift, or unassign this staff member">
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            value={moveTarget}
                                            onChange={(e) => setMoveTarget(e.target.value)}
                                            sx={inputSx}
                                        >
                                            <MenuItem value="" sx={{ fontSize: "13.5px" }}>
                                                Unassigned
                                            </MenuItem>
                                            {shifts.map((shift) => (
                                                <MenuItem key={shift.id} value={shift.id} sx={{ fontSize: "13.5px" }}>
                                                    {shift.name} · {formatTime(shift.startTime)} –{" "}
                                                    {formatTime(shift.endTime)}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Field>
                                )}
                            </DialogContent>

                            <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E5E7EB" }}>
                                <Button
                                    onClick={() => setStaffDialog(null)}
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
                                    Close
                                </Button>
                                {staffDialog.mode === "move" && (
                                    <Button
                                        variant="contained"
                                        onClick={confirmMove}
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: "50px",
                                            fontSize: "13.5px",
                                            fontWeight: "700",
                                            px: 3,
                                            bgcolor: accent,
                                            "&:hover": { bgcolor: accent, filter: "brightness(0.92)" },
                                        }}
                                    >
                                        Move
                                    </Button>
                                )}
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </Box>
        );
    };

    /* ─────────────── Leave Balances tab ─────────────── */

    /* One employee at a time — the API has no "everyone" variant. A roll number with no
       allocations yet answers 404, which the api layer turns into an empty list. */
    const loadBalances = async (roll, { silent = false } = {}) => {
        const wanted = String(roll || "").trim();
        if (!wanted) return;
        setLoadingBalances(true);
        setOpenAllocation(null);
        const result = await fetchEmployeeLeaveBalance({ academicYear: ACADEMIC_YEAR, rollNumber: wanted });
        if (!result.ok) {
            // A roll number outside `users` comes back as a 400 naming it verbatim.
            // `silent` covers the on-open lookup of the signed-in user, whose roll is not
            // necessarily a staff record — that should land on the empty state, not a toast.
            if (!silent) showSnack(result.message, false);
            setBalances([]);
            setBalanceNote(result.message);
        } else {
            setBalances(result.balances);
            setBalanceNote(result.balances.length ? "" : result.message || "No leave allocated to this employee yet.");
        }
        setBalanceRoll(wanted);
        setLoadingBalances(false);
    };

    /* Open the tab on the signed-in user rather than an empty panel. Their own balance is
       the one most likely to be wanted, and it proves the screen works without anyone
       having to know a roll number. */
    useEffect(() => {
        if (tab !== "balances") return;
        if (balanceRoll || !authUser?.rollNumber) return;
        setBalanceQuery(authUser.rollNumber);
        loadBalances(authUser.rollNumber, { silent: true });
        // loadBalances is stable for this purpose; re-running on every render would loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, authUser?.rollNumber, balanceRoll]);

    /* Names for the picker.

       No leavePolicy route lists all staff. GetBiometricMappings does — it has to, since
       anyone can be enrolled against a device — and it is a plain list rather than the
       attendance computation reportsLeaveManagement runs over 146 people to produce.

       Loaded on first use of the picker, not on tab open: opening the tab should cost one
       request (the balance), not two. */
    const loadStaffDirectory = useCallback(async () => {
        if (staffDirectory.length || loadingDirectory) return;
        setLoadingDirectory(true);
        const result = await fetchBiometricMappings(ACADEMIC_YEAR);
        if (result.ok) {
            setStaffDirectory(
                result.items.map((row) => ({
                    rollNumber: String(row.rollNumber || ""),
                    name: row.name || "",
                    category: row.userType || "",
                }))
            );
        }
        setLoadingDirectory(false);
    }, [staffDirectory.length, loadingDirectory]);

    const renderLeaveBalances = () => {
        const totalRemaining = balances.reduce((sum, row) => sum + (row.remaining || 0), 0);
        const totalPending = balances.reduce(
            (sum, row) => sum + row.perPeriod.data.reduce((inner, period) => inner + (period.pending || 0), 0),
            0
        );
        const totalApproved = balances.reduce(
            (sum, row) => sum + row.perPeriod.data.reduce((inner, period) => inner + (period.approved || 0), 0),
            0
        );
        const employeeName = balances[0]?.employeeName || "";

        const kpis = [
            { label: "ALLOCATIONS", value: balances.length, caption: "leave types granted", icon: SavingsOutlinedIcon, tone: ACCENT.leaveTypes },
            { label: "REMAINING", value: totalRemaining, caption: "days left this year", icon: AllInclusiveIcon, tone: ACCENT.calendar },
            { label: "APPROVED", value: totalApproved, caption: "days already taken", icon: EventBusyOutlinedIcon, tone: ACCENT.attendance },
            { label: "PENDING", value: totalPending, caption: "awaiting a decision", icon: HourglassEmptyIcon, tone: ACCENT.autoRenew },
        ];

        return (
            <>
                {/* ── Who to look up ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                        p: 1.8,
                        mb: 2.5,
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                    }}
                >
                    <PersonSearchOutlinedIcon sx={{ fontSize: "21px", color: ACCENT.leaveTypes.color }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                            Employee Leave Balance
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                            Allocations and per-period usage for {ACADEMIC_YEAR}
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }} />

                    {/* Search by name or roll number; free text still works for a roll
                        number that is not in the directory */}
                    <Autocomplete
                        freeSolo
                        options={staffDirectory}
                        getOptionLabel={(option) =>
                            typeof option === "string" ? option : `${option.name} · ${option.rollNumber}`
                        }
                        filterOptions={(options, state) => {
                            const term = state.inputValue.trim().toLowerCase();
                            if (!term) return options.slice(0, 50);
                            return options
                                .filter(
                                    (option) =>
                                        option.name.toLowerCase().includes(term) ||
                                        option.rollNumber.toLowerCase().includes(term)
                                )
                                .slice(0, 50);
                        }}
                        loading={loadingDirectory}
                        onOpen={loadStaffDirectory}
                        inputValue={balanceQuery}
                        onInputChange={(_, value) => {
                            setBalanceQuery(value);
                            if (value.trim()) loadStaffDirectory();
                        }}
                        onChange={(_, value) => {
                            if (value && typeof value !== "string") {
                                setBalanceQuery(value.rollNumber);
                                loadBalances(value.rollNumber);
                            }
                        }}
                        sx={{ minWidth: "320px" }}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.rollNumber}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
                                        {option.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                                        {option.rollNumber}
                                        {option.category ? ` · ${option.category}` : ""}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                placeholder={
                                    loadingDirectory
                                        ? "Loading staff…"
                                        : staffDirectory.length
                                        ? `Search ${staffDirectory.length} staff by name or roll...`
                                        : "Search by name or roll number..."
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") loadBalances(balanceQuery);
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "50px",
                                        fontSize: "13.5px",
                                        bgcolor: "#F9FAFB",
                                        "& fieldset": { border: "1px solid #E5E7EB" },
                                    },
                                }}
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: "18px", color: "#9CA3AF" }} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        )}
                    />
                    <Button
                        variant="contained"
                        disableElevation
                        disabled={loadingBalances || !balanceQuery.trim()}
                        onClick={() => loadBalances(balanceQuery)}
                        sx={{
                            textTransform: "none",
                            borderRadius: "50px",
                            fontSize: "13.5px",
                            fontWeight: "700",
                            px: 3,
                            height: 40,
                            bgcolor: ACCENT.leaveTypes.color,
                            "&:hover": { bgcolor: "#047857" },
                        }}
                    >
                        {loadingBalances ? "Looking up…" : "Look up"}
                    </Button>
                </Box>

                {/* ── Nothing searched yet, or nothing found ── */}
                {balances.length === 0 && (
                    <Box
                        sx={{
                            textAlign: "center",
                            py: 8,
                            bgcolor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "12px",
                        }}
                    >
                        <SavingsOutlinedIcon sx={{ fontSize: "42px", color: "#D1D5DB" }} />
                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#6B7280", mt: 1 }}>
                            {loadingBalances
                                ? "Loading the balance…"
                                : balanceRoll
                                ? `No allocations for ${balanceRoll}`
                                : "Search for a staff member"}
                        </Typography>
                        <Typography sx={{ fontSize: "12.5px", color: "#9CA3AF", mt: 0.4 }}>
                            {balanceNote || "Enter a roll number above to see their leave allocations."}
                        </Typography>
                    </Box>
                )}

                {balances.length > 0 && (
                    <>
                        {/* ── Who this is ── */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1.8,
                                mb: 2,
                                bgcolor: ACCENT.leaveTypes.bg,
                                border: `1px solid ${ACCENT.leaveTypes.border}`,
                                borderRadius: "12px",
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 44,
                                    height: 44,
                                    bgcolor: "#fff",
                                    color: ACCENT.leaveTypes.color,
                                    fontSize: "15px",
                                    fontWeight: "700",
                                }}
                            >
                                {String(employeeName || balanceRoll)
                                    .split(" ")
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((part) => part[0])
                                    .join("")
                                    .toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: "16px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                                    {employeeName || balanceRoll}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                                    {balanceRoll} · {balances[0]?.academicYear || ACADEMIC_YEAR}
                                </Typography>
                            </Box>
                        </Box>

                        {/* ── Totals ── */}
                        <Grid container spacing={2} sx={{ mb: 2.5 }}>
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
                                                <Typography sx={{ fontSize: "11.5px", fontWeight: "700", color: kpi.tone.color, letterSpacing: "0.6px" }}>
                                                    {kpi.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: "30px", fontWeight: "700", color: "#111827", lineHeight: 1.35 }}>
                                                    {kpi.value}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", fontWeight: "700", color: kpi.tone.color }}>
                                                    {kpi.caption}
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
                                                <KpiIcon sx={{ fontSize: "21px", color: kpi.tone.color }} />
                                            </Box>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {/* ── One card per allocation ── */}
                        {balances.map((row) => {
                            const periods = row.perPeriod.data;
                            const yearCap = row.perPeriod.cap || 0;
                            const drawn = periods.reduce((sum, p) => sum + (p.approved || 0), 0);
                            const usedPercent = yearCap ? Math.min(Math.round((drawn / yearCap) * 100), 100) : 0;
                            const expanded = openAllocation === row.id;

                            return (
                                <Box
                                    key={row.id}
                                    sx={{
                                        mb: 2,
                                        bgcolor: "#fff",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        opacity: row.isActive ? 1 : 0.6,
                                    }}
                                >
                                    <Box
                                        onClick={() => setOpenAllocation(expanded ? null : row.id)}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            flexWrap: "wrap",
                                            px: 2.2,
                                            py: 1.8,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "#FAFAFA" },
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography sx={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>
                                                    {row.leaveTypeName}
                                                </Typography>
                                                {!row.isActive && (
                                                    <Chip
                                                        label="Inactive"
                                                        size="small"
                                                        sx={{ height: 20, fontSize: "10.5px", fontWeight: 700, bgcolor: "#F3F4F6", color: "#6B7280" }}
                                                    />
                                                )}
                                                <Chip
                                                    label={row.allocationPeriod || "Yearly"}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: "10.5px",
                                                        fontWeight: 700,
                                                        bgcolor: ACCENT.autoRenew.bg,
                                                        color: ACCENT.autoRenew.color,
                                                        border: `1px solid ${ACCENT.autoRenew.border}`,
                                                    }}
                                                />
                                            </Box>
                                            {/* The audit line the API carries on every allocation row */}
                                            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.3 }}>
                                                Created by {row.createdBy || "—"}
                                                {row.createdOn ? ` on ${row.createdOn}` : ""}
                                                {row.updatedBy ? ` · last updated by ${row.updatedBy}${row.updatedOn ? ` on ${row.updatedOn}` : ""}` : ""}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
                                            {[
                                                { label: "Year cap", value: yearCap, color: "#374151" },
                                                { label: "Per period", value: row.perPeriod.monthlyCap || "—", color: "#374151" },
                                                { label: "Taken", value: drawn, color: ACCENT.attendance.color },
                                                { label: "Remaining", value: row.remaining, color: ACCENT.calendar.color },
                                            ].map((stat) => (
                                                <Box key={stat.label} sx={{ textAlign: "right" }}>
                                                    <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                                                        {stat.label}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "18px", fontWeight: "700", color: stat.color, lineHeight: 1.2 }}>
                                                        {stat.value}
                                                    </Typography>
                                                </Box>
                                            ))}
                                            <ExpandMoreIcon
                                                sx={{
                                                    fontSize: "22px",
                                                    color: "#9CA3AF",
                                                    transform: expanded ? "rotate(180deg)" : "none",
                                                    transition: "0.2s",
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Year-level usage bar */}
                                    <Box sx={{ px: 2.2, pb: 1.6 }}>
                                        <Box sx={{ width: "100%", height: 6, borderRadius: "50px", bgcolor: "#F3F4F6", overflow: "hidden" }}>
                                            <Box
                                                sx={{
                                                    width: `${usedPercent}%`,
                                                    height: "100%",
                                                    bgcolor: ACCENT.attendance.color,
                                                    transition: "width 0.3s",
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Per-period breakdown — where the balance actually sits */}
                                    {expanded && (
                                        <Box sx={{ px: 2.2, pb: 2.2, borderTop: "1px solid #F3F4F6", pt: 1.8 }}>
                                            <Typography sx={{ fontSize: "12px", fontWeight: "700", color: "#374151", mb: 1.2 }}>
                                                {row.perPeriod.allocationPeriod || "Period"} breakdown
                                                {row.perPeriod.academicYearStartMonth
                                                    ? ` · year starts in month ${row.perPeriod.academicYearStartMonth}`
                                                    : ""}
                                            </Typography>
                                            <Grid container spacing={1.2}>
                                                {periods.map((period) => {
                                                    const tone = periodTone(period);
                                                    return (
                                                        <Grid key={period.index} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    p: 1.2,
                                                                    borderRadius: "10px",
                                                                    bgcolor: tone.bg,
                                                                    border: `1px solid ${tone.border}`,
                                                                    height: "100%",
                                                                    boxSizing: "border-box",
                                                                }}
                                                            >
                                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
                                                                    <Typography sx={{ fontSize: "12px", fontWeight: "700", color: "#111827" }}>
                                                                        {period.label}
                                                                    </Typography>
                                                                    {(period.isCurrentPeriod || period.lapsed) && (
                                                                        <Chip
                                                                            label={tone.label}
                                                                            size="small"
                                                                            sx={{ height: 17, fontSize: "9px", fontWeight: 700, bgcolor: "#fff", color: tone.color }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                                <Typography sx={{ fontSize: "19px", fontWeight: "700", color: tone.color, lineHeight: 1.3 }}>
                                                                    {period.remaining}
                                                                    <Box component="span" sx={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>
                                                                        {" "}
                                                                        / {period.cap}
                                                                    </Box>
                                                                </Typography>
                                                                <Typography sx={{ fontSize: "10.5px", color: "#6B7280" }}>
                                                                    {period.approved} taken
                                                                    {period.pending ? ` · ${period.pending} pending` : ""}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </>
                )}
            </>
        );
    };

    const renderTabContent = () => {
        switch (tab) {
            case "types":
                return renderLeaveTypes();
            case "calendar":
                return renderWorkingCalendar();
            case "shifts":
                return renderAssignShifts();
            case "balances":
                return renderLeaveBalances();
            default:
                return renderPolicySetup();
        }
    };

    return (
        <Box
            sx={{
                height: "calc(100vh - 76px)",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#FAFAFA",
                overflow: "hidden",
            }}
        >
            {/* ─── Header: title + pill tabs ─── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                    px: 2,
                    py: 1.2,
                    bgcolor: "#F3F4F6",
                    borderBottom: "1px solid #E5E7EB",
                    flexShrink: 0,
                }}
            >
                <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                    <ArrowBackIcon sx={{ fontSize: "18px", color: "#111827" }} />
                </IconButton>
                <Box>
                    <Typography sx={{ fontSize: "19px", fontWeight: "700", color: "#111827", lineHeight: 1.2 }}>
                        Leave Policy Master
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                        Configure rules, leave types &amp; calendar
                    </Typography>
                </Box>

                {/* Spacers on both sides keep the tab group centred in the header */}
                <Box sx={{ flex: 1 }} />

                <Box
                    sx={{
                        display: "flex",
                        gap: 0.5,
                        p: 0.4,
                        borderRadius: "50px",
                        bgcolor: "#fff",
                        border: "1px solid #E5E7EB",
                        flexWrap: "wrap",
                    }}
                >
                    {TABS.map((item) => {
                        const active = tab === item.key;
                        return (
                            <Box
                                key={item.key}
                                onClick={() => setTab(item.key)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    px: 2.5,
                                    py: 0.9,
                                    borderRadius: "50px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    whiteSpace: "nowrap",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    color: active ? "#1A1A1A" : "#374151",
                                    bgcolor: active ? TAB_ACTIVE : "transparent",
                                    transition: "0.2s",
                                    "&:hover": { bgcolor: active ? TAB_ACTIVE : "#F3F4F6" },
                                }}
                            >
                                {item.label}
                                {/* Working Calendar flags that the viewed month is locked for editing */}
                                {item.key === "calendar" && isReadOnlyMonth && (
                                    <Box
                                        sx={{
                                            width: 18,
                                            height: 18,
                                            flexShrink: 0,
                                            borderRadius: "50%",
                                            bgcolor: "#EF4444",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <PriorityHighIcon sx={{ fontSize: "12px", color: "#fff" }} />
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{ flex: 1 }} />
            </Box>

            {/* ─── Scrollable body ─── */}
            <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 1.5, md: 2.5 }, pb: 3.5 }}>{renderTabContent()}</Box>

            {/* API errors come back as 400 with a message written to be shown to the user */}
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
