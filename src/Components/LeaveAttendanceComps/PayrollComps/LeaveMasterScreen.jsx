import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    TextField, Switch, Autocomplete, Tooltip,
    Dialog, CircularProgress, Chip,
    FormControl, InputLabel, Select, MenuItem, InputAdornment,
    Tabs, Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GavelIcon from '@mui/icons-material/Gavel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PolicyIcon from '@mui/icons-material/Policy';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SnackBar from '../../SnackBar';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LockIcon from '@mui/icons-material/Lock';
import dayjs from 'dayjs';
import { postleavepolicy, GetLeavePolicy, postleavetypes, GetleaveTypes, postworkingcalendar, GetWorkingcalendar, UpdateleaveTypeByID, DeleteleaveTypeByID } from '../../../Api/Api';

const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#ECFDF5';
const PRIMARY_DARK = '#047857';

const PAYOUT_FREQUENCIES = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

// ── Backend enum mappers ────────────────────────────────────────────────────
// Translate UI-friendly labels to the canonical strings the API expects.
const FREQUENCY_TO_API = {
    'Monthly': 'Monthly',
    'Quarterly': 'Quarterly',
    'Half-Yearly': 'HalfYearly',
    'Yearly': 'Yearly',
};

const DEDUCTION_APPLIED_TO_API = {
    'Same Month': 'SameMonth',
    'Next Month': 'NextMonth',
    'Quarterly': 'Quarterly',
    'Half-Yearly': 'HalfYearly',
    'Yearly': 'Yearly',
};

const DEDUCTION_FORMULA_TO_API = {
    'gross_by_working_days': 'GrossWorkingDays',
    'gross_by_calendar_days': 'GrossCalendarDays',
    'gross_by_fixed_days': 'GrossFixed30',
};

// Leave-type unused-action enum (per Add Leave Type API).
const UNUSED_ACTION_TO_API = {
    'encash': 'Encash',
    'carry_forward': 'CarryForward',
    'lapse': 'Lapse',
};

// ── Working-calendar API helpers ────────────────────────────────────────────
// API expects day-of-week labels as 'Sun', 'Mon', ..., 'Sat' (matches our DAY_LABELS).
const WC_DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Internal type → API type
const DAY_TYPE_TO_API = {
    working: 'Working',
    holiday: 'Holiday',
    mandatory: 'Mandatory',
};
// API type → internal type
const DAY_TYPE_FROM_API = {
    Working: 'working',
    Holiday: 'holiday',
    Mandatory: 'mandatory',
};

// defaultWorkingDays array (0..6) → { Sun: 'Working' | 'Holiday', ... }
// Used as a fallback when we don't yet have a month context (e.g. before calendar mounts).
const buildWeekPattern = (defaultWorkingDays = []) => {
    const pattern = {};
    WC_DAY_LABELS.forEach((label, idx) => {
        pattern[label] = defaultWorkingDays.includes(idx) ? 'Working' : 'Holiday';
    });
    return pattern;
};

// { Sun: 'Working' | 'Holiday' | 'Mandatory', ... } → array of day-of-week indexes
// Treats both Working & Mandatory as "working day of the week" since our default-day
// toggle only stores binary "is part of working week" state.
const parseWeekPattern = (pattern) => {
    if (!pattern || typeof pattern !== 'object') return null;
    const result = [];
    WC_DAY_LABELS.forEach((label, idx) => {
        const v = pattern[label];
        if (v === 'Working' || v === 'Mandatory') result.push(idx);
    });
    return result;
};

// Reverse maps — used when hydrating the form from the GET response.
const FREQUENCY_FROM_API = Object.fromEntries(
    Object.entries(FREQUENCY_TO_API).map(([k, v]) => [v, k])
);
const DEDUCTION_APPLIED_FROM_API = Object.fromEntries(
    Object.entries(DEDUCTION_APPLIED_TO_API).map(([k, v]) => [v, k])
);
const DEDUCTION_FORMULA_FROM_API = Object.fromEntries(
    Object.entries(DEDUCTION_FORMULA_TO_API).map(([k, v]) => [v, k])
);
const UNUSED_ACTION_FROM_API = Object.fromEntries(
    Object.entries(UNUSED_ACTION_TO_API).map(([k, v]) => [v, k])
);

// API returns dates as "DD-MM-YYYY". Convert to a dayjs object.
const parseApiDate = (s) => {
    if (!s || typeof s !== 'string') return null;
    const parts = s.split('-');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts;
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    const parsed = dayjs(iso);
    return parsed.isValid() ? parsed : null;
};

// ── Leave Policy Management constants ──────────────────────────────────────
const TOKEN = '123';

const LEAVE_COLORS = [
    '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4',
    '#10B981', '#F59E0B', '#6B7280', '#FF6B35', '#059669',
];

const LP_ALLOCATION_PERIODS = [
    { key: 'Monthly', label: 'Monthly', months: 1 },
    { key: 'Quarterly', label: 'Quarterly', months: 3 },
    { key: 'Half-Yearly', label: 'Half-Yearly', months: 6 },
    { key: 'Yearly', label: 'Yearly', months: 12 },
];

const UNUSED_ACTIONS = [
    { key: 'encash', label: 'Encash', desc: 'Credited to salary', color: '#059669' },
    { key: 'carry_forward', label: 'Carry Forward', desc: 'Added to next period', color: '#2563EB' },
    { key: 'lapse', label: 'Lapse', desc: 'Lost at period end', color: '#DC2626' },
];

const ENCASH_TIMINGS = ['End of Period', 'End of Quarter', 'End of Half-Year', 'End of Year'];

const ENCASH_FORMULAS = [
    { key: 'gross_by_working_days', label: 'Gross / Working Days', hint: 'Salary ÷ working days of the month' },
    { key: 'gross_by_calendar_days', label: 'Gross / Calendar Days', hint: 'Salary ÷ total days in the month' },
    { key: 'gross_by_fixed_days', label: 'Gross / Fixed 30', hint: 'Salary ÷ 30 (fixed)' },
];

const emptyLeaveForm = {
    name: '',
    shortCode: '',
    color: '#3B82F6',
    description: '',
    // Allocation — single source of truth: "X days per <period>"
    daysPerPeriod: 12,
    allocationPeriod: 'Yearly',
    // When true: all days are usable from day 1 of the period (lump-sum behavior).
    // When false: days accrue gradually month-by-month (only the earned share is usable).
    // Always true when allocationPeriod === 'Monthly' (no distinction to make).
    advanceUsageAllowed: true,
    // Optional monthly cap on top of the period allocation. 0 = no cap.
    // Example: daysPerPeriod=6, allocationPeriod='Yearly', maxPerMonth=3
    //   → "6 days/year, but no more than 3 in any single month".
    maxPerMonth: 0,
    // End of period
    unusedLeaveAction: 'lapse',
    encashmentTiming: 'End of Period',
    encashmentFormula: 'gross_by_working_days',
    // Deduction
    extraLeaveDeducted: true,
    // Special rules
    standaloneOnly: false,         // can't be adjacent to a holiday / another leave (no "sandwich")
    requiresDocument: false,       // user must upload a supporting doc when applying
    documentHint: '',              // free-text hint shown to user (e.g., "Medical certificate")
};

const getMonthsInPeriod = (period) => {
    const p = LP_ALLOCATION_PERIODS.find(a => a.key === period);
    return p?.months || 1;
};

// Total days the policy grants per its allocation cycle.
const getEffectiveTotalDays = (p) => Number(p?.daysPerPeriod) || 0;

// "Unlimited / on-demand" when the user has set the days to 0 for any cycle.
const isOnDemandPolicy = (p) => Number(p?.daysPerPeriod) === 0;

// Per-month equivalent for reference display (e.g. "12 days / year ≈ 1 day / month").
const getMonthlyEquivalent = (p) => {
    const months = getMonthsInPeriod(p?.allocationPeriod);
    if (!months) return 0;
    return (Number(p?.daysPerPeriod) || 0) / months;
};

const getPeriodLabel = (period) => {
    if (period === 'Monthly') return 'month';
    if (period === 'Quarterly') return 'quarter';
    if (period === 'Half-Yearly') return 'half-year';
    return 'year';
};

// ── Initial config for the 6 Policy Setup sections ─────────────────────────
// Used as the seed for useState and as the reset target for "Clear All".
const INITIAL_CONFIG = {
    // Attendance Bonus
    attendanceBonusEnabled: false,
    attendanceBonusAmount: '',
    minWorkingDaysForBonus: 15,
    mustJoinFirstDay: true,
    mandatoryDayAttendanceRequired: true,
    leaveDeductionStillApplies: true,

    // Punctuality Bonus
    punctualityBonusEnabled: false,
    punctualityBonusAmount: '',
    lateArrivalThresholdMinutes: 15,
    emergencyLatesPerMonth: 1,
    latePenaltyAmount: '',
    uninformedLeaveDisqualifies: true,
    informedLeaveLateBalanceEnabled: false,
    informedLeaveLateRatio: '1:1',

    // Leave Deduction
    deductionAppliesToPaidLeave: true,
    paidLeaveDeductionAppliedOn: 'Same Month',
    paidLeaveCarryForward: false,
    paidLeaveDaysPerMonth: 1,

    // Bonus Payout
    bonusCalculationFrequency: 'Monthly',
    bonusCreditFrequency: 'Quarterly',

    // Salary Deduction Formula
    deductionFormula: 'gross_by_working_days',

    // Shift Timing & Work Hours
    shiftStartTime: '08:00',
    shiftEndTime: '16:00',
    gracePeriodMinutes: 10,
    lunchBreakMinutes: 60,
    shortBreakMinutes: 15,

    // Default Working Days (0=Sun, 1=Mon … 6=Sat)
    defaultWorkingDays: [1, 2, 3, 4, 5, 6],
};

// ── Academic year helpers (India: Apr–Mar) ─────────────────────────────────
// Returns current academic year + the past 2 (3 options total). No future years.
const buildAcademicYears = () => {
    const today = new Date();
    const startYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    return [-2, -1, 0]
        .map((i) => {
            const y = startYear + i;
            return `${y}-${y + 1}`;
        })
        .reverse(); // newest first
};

const getCurrentAcademicYear = () => {
    const today = new Date();
    const start = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    return `${start}-${start + 1}`;
};

// ── Month helpers ─────────────────────────────────────────────────────────
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const computeEndMonth = (startMonth) => ((startMonth - 1 + 11) % 12) + 1;

// ── Section wrapper ────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, color, children }) => (
    <Box sx={{ mb: 2.5 }}>
        <Box sx={{
            bgcolor: color || '#059669',
            color: '#fff',
            fontSize: '13px',
            px: 3,
            py: 0.2,
            ml: '15px',
            fontWeight: 600,
            borderTopLeftRadius: '7px',
            borderTopRightRadius: '7px',
            width: 'fit-content',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
        }}>
            {Icon && <Icon sx={{ fontSize: 14 }} />}
            {title}
        </Box>
        <Box sx={{ border: '1px solid #E8DDEA', borderRadius: '5px', bgcolor: '#fff', p: 3 }}>
            {subtitle && (
                <Typography sx={{ fontSize: '12px', color: '#777', mb: 2 }}>{subtitle}</Typography>
            )}
            {children}
        </Box>
    </Box>
);

// ── Toggle row ─────────────────────────────────────────────────────────────
const ToggleRow = ({ label, description, checked, onChange }) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        border: `1px solid ${checked ? '#A7F3D0' : '#E5E7EB'}`,
        borderRadius: '8px',
        bgcolor: checked ? '#F0FDF4' : '#FAFAFA',
        transition: '0.2s',
    }}>
        <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>{label}</Typography>
            {description && (
                <Typography sx={{ fontSize: '11px', color: '#888', mt: 0.3 }}>{description}</Typography>
            )}
        </Box>
        <Switch
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            size="small"
            sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: PRIMARY },
            }}
        />
    </Box>
);

// ── Amount field ───────────────────────────────────────────────────────────
const AmountField = ({ label, value, onChange, prefix = '₹', helperText, disabled }) => (
    <Box>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>{label}</Typography>
        <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '');
                onChange(v);
            }}
            disabled={disabled}
            placeholder="0"
            slotProps={{
                input: {
                    startAdornment: prefix ? (
                        <Typography sx={{ fontSize: '13px', color: '#059669', fontWeight: 600, mr: 0.5 }}>{prefix}</Typography>
                    ) : null,
                }
            }}
            sx={{
                '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36 },
                '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000' },
            }}
        />
        {helperText && <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.3 }}>{helperText}</Typography>}
    </Box>
);

// ── Number field ───────────────────────────────────────────────────────────
const NumberField = ({ label, value, onChange, suffix, helperText, min = 0, disabled = false, infoTooltip }) => (
    <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: disabled ? '#9CA3AF' : '#555' }}>
                {label}
            </Typography>
            {infoTooltip && (
                <Tooltip title={infoTooltip} arrow placement="top">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: '#6366F1', cursor: 'help' }} />
                </Tooltip>
            )}
        </Box>
        <TextField
            fullWidth
            size="small"
            type="number"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Math.max(min, parseInt(e.target.value) || 0))}
            slotProps={{
                input: {
                    endAdornment: suffix ? (
                        <Typography sx={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap' }}>{suffix}</Typography>
                    ) : null,
                    inputProps: { min, step: 1 }
                }
            }}
            sx={{
                '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36 },
                '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#374151', fontWeight: 600 },
                '& .MuiOutlinedInput-root.Mui-disabled': { bgcolor: '#F9FAFB' },
            }}
        />
        {helperText && <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.3 }}>{helperText}</Typography>}
    </Box>
);

// ── Time field (HH:MM 24-hour) ────────────────────────────────────────────
const TimeField = ({ label, value, onChange, helperText }) => (
    <Box>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>{label}</Typography>
        <TextField
            fullWidth
            size="small"
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            slotProps={{ input: { inputProps: { step: 60 } } }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36 } }}
        />
        {helperText && <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.3 }}>{helperText}</Typography>}
    </Box>
);

// ── Helpers for shift timing math ─────────────────────────────────────────
const parseTimeToMinutes = (t) => {
    if (!t || typeof t !== 'string') return null;
    const [h, m] = t.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};

const formatTime12 = (t) => {
    const mins = parseTimeToMinutes(t);
    if (mins == null) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const formatHrs = (totalMinutes) => {
    if (totalMinutes == null || Number.isNaN(totalMinutes)) return '0h';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

// ════════════════════════════════════════════════════════════════════════════
export default function LeaveMasterScreen() {
    const navigate = useNavigate();
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);
    const authUser = useSelector((state) => state.auth);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [isSavingMaster, setIsSavingMaster] = useState(false);
    const [isLoadingMaster, setIsLoadingMaster] = useState(false);

    // ── Academic Year filter (header-level scope) ───────────────────────────
    const academicYears = useMemo(() => buildAcademicYears(), []);
    const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear);

    // ── Header tabs (split content into 3 logical groups, each with its own save flow) ──
    // 0 → "Policy Setup":     sections that share one POST (handleSave)
    // 1 → "Leave Types":      per-leave-type CRUD (handleSavePolicy)
    // 2 → "Working Calendar": per-month save (handleSaveMonth)
    const [activeTab, setActiveTab] = useState(0);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const showSnack = (msg, success) => {
        setMessage(msg); setOpen(true); setColor(success); setStatus(success);
    };

    // ── Master state ───────────────────────────────────────────────────────
    const [config, setConfig] = useState({ ...INITIAL_CONFIG });

    const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

    // Reset all 6 Policy Setup sections back to their default values.
    const handleClearAll = () => {
        setConfig({ ...INITIAL_CONFIG });
        setStartMonth(4); // April — typical academic year start
        setAutoRenew(true);
        setHasExistingPolicy(false);
        showSnack('All policy fields reset to defaults', true);
    };

    // Grace Period drives Late Arrival Threshold — they're the same concept.
    // When Grace Period has a value (> 0), it auto-syncs to Late Arrival Threshold and
    // locks that field. The user can only change the threshold via Grace Period.
    useEffect(() => {
        const grace = Number(config.gracePeriodMinutes) || 0;
        if (grace > 0 && grace !== Number(config.lateArrivalThresholdMinutes)) {
            setConfig(prev => ({ ...prev, lateArrivalThresholdMinutes: grace }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.gracePeriodMinutes]);

    // ── Policy Applicability Period (start month within academic year) ─────
    // User picks just the start month (1-12). End month is auto-calculated as
    // 11 months later (wrapping). Years come from the academic year in the header.
    const [startMonth, setStartMonth] = useState(4); // April (default academic-year start)
    const [autoRenew, setAutoRenew]   = useState(true); // roll policy over into the next academic year

    // Tracks whether a policy already exists on the server for the selected academic year.
    // Drives: button label ("Save" → "Update") and the 20-day edit-window lock.
    const [hasExistingPolicy, setHasExistingPolicy] = useState(false);

    // Auto-renew prompt: shown when a previous-year policy exists with autoRenew=false,
    // we're inside the cycle-start month's first 20 days, and the current year has no policy yet.
    const [renewDialog, setRenewDialog] = useState({ open: false, prevPolicy: null, prevAY: null });
    const closeRenewDialog = () => setRenewDialog({ open: false, prevPolicy: null, prevAY: null });
    const endMonth = computeEndMonth(startMonth);
    const [acadStartYearStr, acadEndYearStr] = academicYear.split('-');
    const acadStartYear = parseInt(acadStartYearStr, 10);
    const acadEndYear = parseInt(acadEndYearStr, 10);
    // If the cycle wraps past December, end month is in the next calendar year.
    const cycleStartYear = acadStartYear;
    const cycleEndYear = endMonth < startMonth ? acadEndYear : acadStartYear;
    const cycleLabel = `${MONTH_NAMES_SHORT[startMonth - 1]} ${cycleStartYear} → ${MONTH_NAMES_SHORT[endMonth - 1]} ${cycleEndYear}`;

    // ── Working Calendar State ─────────────────────────────────────────────
    const [calendarMonth, setCalendarMonth] = useState(dayjs());
    const [dayOverrides, setDayOverrides] = useState({});
    const [savedMonths, setSavedMonths] = useState({}); // { "2026-04": true } — server has a record (insert or update)
    const [dirtyMonths, setDirtyMonths] = useState({}); // { "2026-04": true } — local edits since last sync
    const [isSavingMonth, setIsSavingMonth] = useState(false);
    const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const DAY_COLORS = {
        working: { bg: '#F0FDF4', color: '#16A34A', border: '#A7F3D0' },
        holiday: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
        mandatory: { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
    };

    // Edit policy: only upcoming months are editable. Current and past months are read-only.
    // Navigation is allowed back to the current month (so users can view it) but not into past months.
    const currentMonth = dayjs().startOf('month');
    const maxMonth = currentMonth.add(11, 'month');

    // Badge for the "Working Calendar" tab — true when NEXT month's calendar isn't
    // saved yet. Workflow: while in current month, the admin should plan ahead and
    // save next month's working days before it begins.
    const nextMonthKey = useMemo(
        () => dayjs().add(1, 'month').startOf('month').format('YYYY-MM'),
        [],
    );
    const nextMonthLabel = useMemo(
        () => dayjs().add(1, 'month').format('MMMM YYYY'),
        [],
    );
    const isNextMonthMissing = !savedMonths[nextMonthKey];
    const canGoPrev = calendarMonth.isAfter(currentMonth, 'month');
    const canGoNext = calendarMonth.isBefore(maxMonth, 'month');
    const calendarMonthKey = calendarMonth.format('YYYY-MM');
    const isMonthSaved = !!savedMonths[calendarMonthKey];
    const isMonthDirty = !!dirtyMonths[calendarMonthKey];
    // The button can save when there are pending edits OR no record exists yet.
    const canSaveMonth = isMonthDirty || !isMonthSaved;
    // True when an existing record will be updated (vs. brand-new save).
    const isMonthUpdate = isMonthSaved && isMonthDirty;
    const isCurrentMonth = calendarMonth.isSame(currentMonth, 'month');
    const isPastMonth = calendarMonth.isBefore(currentMonth, 'month');
    const isReadOnlyMonth = isCurrentMonth || isPastMonth;

    const getDaysInMonth = () => {
        const start = calendarMonth.startOf('month');
        const daysCount = calendarMonth.daysInMonth();
        const days = [];
        for (let i = 0; i < daysCount; i++) {
            days.push(start.add(i, 'day'));
        }
        return days;
    };

    const getDayType = (date) => {
        const key = date.format('YYYY-MM-DD');
        if (dayOverrides[key]) return dayOverrides[key];
        const dayOfWeek = date.day();
        return config.defaultWorkingDays.includes(dayOfWeek) ? 'working' : 'holiday';
    };

    const cycleDayType = (date) => {
        if (isReadOnlyMonth) return; // Can't edit current or past months
        const key = date.format('YYYY-MM-DD');
        const current = getDayType(date);
        const cycle = { working: 'holiday', holiday: 'mandatory', mandatory: 'working' };
        const next = cycle[current];
        const dayOfWeek = date.day();
        const isDefaultType = config.defaultWorkingDays.includes(dayOfWeek) ? 'working' : 'holiday';

        if (next === isDefaultType) {
            setDayOverrides(prev => { const n = { ...prev }; delete n[key]; return n; });
        } else {
            setDayOverrides(prev => ({ ...prev, [key]: next }));
        }
        // Mark month as having pending changes. Keep savedMonths intact — the server
        // record still exists; the user is queueing an update on top of it.
        setDirtyMonths(prev => ({ ...prev, [calendarMonthKey]: true }));
    };

    // Builds the overrides array — every Holiday/Mandatory day in the visible month,
    // regardless of whether it matches the week pattern. Working days are implicit.
    const buildMonthOverrides = (monthDayjs) => {
        const result = [];
        const daysInMonth = monthDayjs.daysInMonth();
        for (let i = 0; i < daysInMonth; i++) {
            const date = monthDayjs.startOf('month').add(i, 'day');
            const type = getDayType(date);
            if (type === 'holiday' || type === 'mandatory') {
                result.push({
                    dayDate: date.format('YYYY-MM-DD'),
                    dayType: DAY_TYPE_TO_API[type],
                });
            }
        }
        return result;
    };

    // Builds weekPattern based on the *actual* days in the visible month — not just
    // the default-working-days toggle. Rule (per HR request):
    //   • If EVERY instance of a day-of-week is Holiday   → 'Holiday'
    //   • Otherwise (any instance is Working / Mandatory) → 'Working'
    // Example: if Sunday is OFF in defaults but the user marks ONE Sunday as Working
    // for this month, we send "Sun": "Working" (so the API consumer treats Sundays
    // as working unless explicitly listed in overrides).
    const buildMonthWeekPattern = (monthDayjs) => {
        const pattern = {};
        const start = monthDayjs.startOf('month');
        const daysInMonth = monthDayjs.daysInMonth();

        WC_DAY_LABELS.forEach((label, idx) => {
            let foundAny = false;
            let allHoliday = true;
            for (let i = 0; i < daysInMonth; i++) {
                const d = start.add(i, 'day');
                if (d.day() === idx) {
                    foundAny = true;
                    if (getDayType(d) !== 'holiday') {
                        allHoliday = false;
                        break;
                    }
                }
            }
            if (!foundAny) {
                // Defensive — every month has all 7 weekdays, but fall back gracefully.
                pattern[label] = config.defaultWorkingDays.includes(idx) ? 'Working' : 'Holiday';
            } else {
                pattern[label] = allHoliday ? 'Holiday' : 'Working';
            }
        });
        return pattern;
    };

    const handleSaveMonth = async () => {
        if (isReadOnlyMonth) {
            showSnack('You can only edit and save upcoming months. The current and past months are read-only.', false);
            return;
        }
        if (!authUser?.rollNumber) {
            showSnack('Cannot save: no logged-in user found.', false);
            return;
        }

        const body = {
            year: calendarMonth.year(),
            month: calendarMonth.month() + 1,        // dayjs month is 0-indexed
            weekPattern: buildMonthWeekPattern(calendarMonth),
            overrides: buildMonthOverrides(calendarMonth),
            updatedByRollNumber: authUser.rollNumber,
        };

        setIsSavingMonth(true);
        try {
            const res = await axios.post(postworkingcalendar, body, {
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            const ok = !res?.data || res.data.error === false;
            if (ok) {
                const wasUpdate = !!savedMonths[calendarMonthKey];
                setSavedMonths(prev => ({ ...prev, [calendarMonthKey]: true }));
                setDirtyMonths(prev => { const n = { ...prev }; delete n[calendarMonthKey]; return n; });
                showSnack(
                    res?.data?.message
                    || `Working calendar for ${calendarMonth.format('MMMM YYYY')} ${wasUpdate ? 'updated' : 'saved'} successfully`,
                    true
                );
            } else {
                showSnack(res.data.message || 'Failed to save working calendar', false);
            }
        } catch (err) {
            console.error('postworkingcalendar failed:', err);
            const apiMsg = err?.response?.data?.message;
            showSnack(apiMsg || 'Failed to save working calendar. Please try again.', false);
        } finally {
            setIsSavingMonth(false);
        }
    };

    // Fetches the saved working calendar for a specific month and hydrates the state.
    // Adopts the returned weekPattern as the new global default and replaces any local
    // overrides for that month with the server's.
    //
    // The API uses two "no record" shapes — both are treated as first-time-empty:
    //   1. HTTP 404 with no body
    //   2. HTTP 200 with { error: false, data: { weekPattern: {}, overrides: [], ... } }
    //      and a `message: "No working calendar saved for ..."`.
    // In either case we DO NOT overwrite the global defaultWorkingDays toggle (which would
    // make every day default to Holiday), and DO NOT mark the month as Saved.
    const fetchWorkingCalendar = async (monthDayjs) => {
        const year = monthDayjs.year();
        const month = monthDayjs.month() + 1;
        const monthKey = monthDayjs.format('YYYY-MM');

        const markNoRecord = () => {
            setSavedMonths(prev => { const n = { ...prev }; delete n[monthKey]; return n; });
            setDirtyMonths(prev => { const n = { ...prev }; delete n[monthKey]; return n; });
            // Also clear any stale overrides for this month from a previous fetch.
            setDayOverrides(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(k => {
                    if (k.startsWith(monthKey)) { delete next[k]; changed = true; }
                });
                return changed ? next : prev;
            });
        };

        setIsLoadingCalendar(true);
        try {
            const res = await axios.get(GetWorkingcalendar, {
                params: { year, month },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });

            const d = res?.data?.data;
            const hasWeekPattern = !!(
                d
                && d.weekPattern
                && typeof d.weekPattern === 'object'
                && Object.keys(d.weekPattern).length > 0
            );
            const hasOverrides = !!(d && Array.isArray(d.overrides) && d.overrides.length > 0);
            const hasRecord = res?.data?.error === false && (hasWeekPattern || hasOverrides);

            if (hasRecord) {
                // Real saved record — hydrate state from the server.
                if (hasWeekPattern) {
                    const parsedDow = parseWeekPattern(d.weekPattern);
                    if (parsedDow) update('defaultWorkingDays', parsedDow);
                }

                setDayOverrides(prev => {
                    const next = { ...prev };
                    Object.keys(next).forEach(k => {
                        if (k.startsWith(monthKey)) delete next[k];
                    });
                    (d.overrides || []).forEach(o => {
                        const t = DAY_TYPE_FROM_API[o.dayType];
                        if (o.dayDate && t) next[o.dayDate] = t;
                    });
                    return next;
                });

                setSavedMonths(prev => ({ ...prev, [monthKey]: true }));
                setDirtyMonths(prev => { const n = { ...prev }; delete n[monthKey]; return n; });
            } else {
                // Empty body (200) or { error: true } — treat as "no record yet".
                // Keep the user's existing default-working-days toggle intact.
                markNoRecord();
            }
        } catch (err) {
            if (err?.response?.status === 404) {
                // 404 — no record yet for this month.
                markNoRecord();
            } else {
                console.error('GetWorkingcalendar failed:', err);
                // Don't snack — calendar fetch is incidental and shouldn't spam the user.
            }
        } finally {
            setIsLoadingCalendar(false);
        }
    };

    // Refetch whenever the user navigates to a different month.
    useEffect(() => {
        fetchWorkingCalendar(calendarMonth);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calendarMonthKey]);

    const calendarDays = getDaysInMonth();
    const calendarStats = {
        working: calendarDays.filter(d => getDayType(d) === 'working').length,
        holiday: calendarDays.filter(d => getDayType(d) === 'holiday').length,
        mandatory: calendarDays.filter(d => getDayType(d) === 'mandatory').length,
    };

    const toggleDefaultWorkingDay = (dayIndex) => {
        const current = config.defaultWorkingDays;
        if (current.includes(dayIndex)) {
            update('defaultWorkingDays', current.filter(d => d !== dayIndex));
        } else {
            update('defaultWorkingDays', [...current, dayIndex].sort());
        }
        // Mark the visible month as dirty — its computed pattern just changed.
        setDirtyMonths(prev => ({ ...prev, [calendarMonthKey]: true }));
    };

    // ── Hydrate form from GetLeavePolicy ────────────────────────────────────
    // Maps the API response back into the local state shape so the user sees
    // their previously saved policy when they open the screen.
    const applyFetchedPolicy = (d) => {
        if (!d) return;
        setHasExistingPolicy(true);

        // Academic year (header filter scope)
        if (d.academicYear) setAcademicYear(d.academicYear);

        // Applicability period — new shape: { startMonth, endMonth, autoRenew, cycleLabel }
        const sm = Number(d.policyApplicabilityPeriod?.startMonth);
        if (sm >= 1 && sm <= 12) setStartMonth(sm);
        if (typeof d.policyApplicabilityPeriod?.autoRenew === 'boolean') {
            setAutoRenew(d.policyApplicabilityPeriod.autoRenew);
        }

        // Bonus / punctuality / deduction / payout — fold into config
        setConfig(prev => ({
            ...prev,

            // Attendance Bonus
            attendanceBonusEnabled: !!d.attendanceBonus?.enabled,
            attendanceBonusAmount: d.attendanceBonus?.amount != null ? String(d.attendanceBonus.amount) : '',
            minWorkingDaysForBonus: Number(d.attendanceBonus?.minWorkingDays) || 0,
            mustJoinFirstDay: !!d.attendanceBonus?.mustJoinFirstDay,
            mandatoryDayAttendanceRequired: !!d.attendanceBonus?.mandatoryDayRequired,
            leaveDeductionStillApplies: !!d.attendanceBonus?.salaryDeductStillApplies,

            // Punctuality
            punctualityBonusEnabled: !!d.punctuality?.enabled,
            punctualityBonusAmount: d.punctuality?.bonusAmount != null ? String(d.punctuality.bonusAmount) : '',
            lateArrivalThresholdMinutes: Number(d.punctuality?.lateThresholdMinutes) || 15,
            emergencyLatesPerMonth: Number(d.punctuality?.emergencyLatesAllowed) || 1,
            latePenaltyAmount: d.punctuality?.latePenaltyAmount != null ? String(d.punctuality.latePenaltyAmount) : '',
            uninformedLeaveDisqualifies: !!d.punctuality?.uninformedLeaveDisqualifies,
            informedLeaveLateBalanceEnabled: !!d.punctuality?.informedLeavePlusLateBalance,
            informedLeaveLateRatio: d.punctuality?.balanceRatio || '1:1',

            // Leave Salary Deduction
            deductionAppliesToPaidLeave: !!d.leaveSalaryDeduction?.appliesToPaidLeave,
            paidLeaveDeductionAppliedOn: DEDUCTION_APPLIED_FROM_API[d.leaveSalaryDeduction?.deductionAppliedWhen] || 'Same Month',
            deductionFormula: DEDUCTION_FORMULA_FROM_API[d.leaveSalaryDeduction?.formula] || 'gross_by_working_days',

            // Bonus Payout
            bonusCalculationFrequency: FREQUENCY_FROM_API[d.bonusPayout?.calcFrequency] || 'Monthly',
            bonusCreditFrequency: FREQUENCY_FROM_API[d.bonusPayout?.creditFrequency] || 'Quarterly',

            // Shift Timing & Work Hours
            // API uses startTime / endTime inside shiftTiming
            shiftStartTime: d.shiftTiming?.startTime || d.shiftTiming?.shiftStartTime || prev.shiftStartTime,
            shiftEndTime:   d.shiftTiming?.endTime   || d.shiftTiming?.shiftEndTime   || prev.shiftEndTime,
            gracePeriodMinutes: Number(d.shiftTiming?.gracePeriodMinutes) || 0,
            lunchBreakMinutes: Number(d.shiftTiming?.lunchBreakMinutes) || 0,
            shortBreakMinutes: Number(d.shiftTiming?.shortBreakMinutes) || 0,
        }));
    };

    // Apply a previous-year policy to the current form state (no save). Used by both
    // the auto-renew path and the "Restore Previous" choice in the prompt dialog.
    const applyPolicyAsTemplate = (prevPolicy, targetAY) => {
        if (!prevPolicy) return;
        applyFetchedPolicy({ ...prevPolicy, academicYear: targetAY });
    };

    // Build a POST payload from a previous-year policy response, retargeted at `targetAY`.
    const buildPayloadFromPolicy = (prev, targetAY) => ({
        academicYear: targetAY,
        policyApplicabilityPeriod: {
            startMonth: Number(prev.policyApplicabilityPeriod?.startMonth) || 4,
            endMonth:   Number(prev.policyApplicabilityPeriod?.endMonth)   || 3,
            autoRenew:  !!prev.policyApplicabilityPeriod?.autoRenew,
        },
        shiftTiming: {
            startTime: prev.shiftTiming?.startTime || '08:00',
            endTime:   prev.shiftTiming?.endTime   || '16:00',
            gracePeriodMinutes: Number(prev.shiftTiming?.gracePeriodMinutes) || 0,
            lunchBreakMinutes:  Number(prev.shiftTiming?.lunchBreakMinutes)  || 0,
            shortBreakMinutes:  Number(prev.shiftTiming?.shortBreakMinutes)  || 0,
        },
        attendanceBonus:     prev.attendanceBonus     || {},
        punctuality:         prev.punctuality         || {},
        leaveSalaryDeduction: prev.leaveSalaryDeduction || {},
        bonusPayout:         prev.bonusPayout         || {},
        updatedByRollNumber: authUser?.rollNumber || '',
    });

    // Silently POST a renewed policy for the new academic year.
    const autoRenewPolicy = async (prevPolicy, targetAY) => {
        try {
            const payload = buildPayloadFromPolicy(prevPolicy, targetAY);
            const res = await axios.post(postleavepolicy, payload, {
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            if (res?.data?.error === false) {
                applyPolicyAsTemplate(prevPolicy, targetAY);
                showSnack(`Policy auto-renewed from ${prevPolicy.academicYear} for ${targetAY}`, true);
            } else {
                showSnack(res?.data?.message || 'Auto-renew failed — please save manually', false);
            }
        } catch (err) {
            console.error('Auto-renew POST failed:', err);
            showSnack('Auto-renew failed — please save manually', false);
        }
    };

    // Check & handle the auto-renew window for an empty current-year policy.
    // Conditions checked here:
    //   1) The selected academic year IS the current academic year (no past/future).
    //   2) We're within the FIRST 20 DAYS of the previous policy's cycle start month.
    //   3) A previous-year policy exists.
    // Behaviour:
    //   • If previous policy had autoRenew=true → silently POST it for the new year.
    //   • Otherwise → open a dialog asking the user to Restore or Create New.
    const checkAutoRenewWindow = async (ay) => {
        const today = dayjs();
        const currentAY = getCurrentAcademicYear();
        if (ay !== currentAY) return;

        const [ysStr] = ay.split('-');
        const ys = parseInt(ysStr, 10);
        if (!Number.isFinite(ys)) return;
        const prevAY = `${ys - 1}-${ys}`;

        try {
            const res = await axios.get(GetLeavePolicy, {
                params: { academicYear: prevAY },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            if (!res?.data || res.data.error !== false || !res.data.data) return;

            const prevPolicy = res.data.data;
            const prevStartMonth = Number(prevPolicy.policyApplicabilityPeriod?.startMonth);
            if (!(prevStartMonth >= 1 && prevStartMonth <= 12)) return;

            // Within the first 20 days of the previous-policy's cycle start month?
            const todayMonth = today.month() + 1;
            const todayDay = today.date();
            const inWindow = todayMonth === prevStartMonth && todayDay <= 20;
            if (!inWindow) return;

            const prevAutoRenew = !!prevPolicy.policyApplicabilityPeriod?.autoRenew;
            if (prevAutoRenew) {
                await autoRenewPolicy(prevPolicy, ay);
            } else {
                setRenewDialog({ open: true, prevPolicy, prevAY });
            }
        } catch (err) {
            // 404 / network error fetching previous year → silently skip.
            if (err?.response?.status !== 404) {
                console.warn('checkAutoRenewWindow failed:', err);
            }
        }
    };

    // Restore previous year's policy into the form (no auto-save — user reviews).
    const handleRestorePrev = () => {
        if (renewDialog.prevPolicy) {
            applyPolicyAsTemplate(renewDialog.prevPolicy, academicYear);
            showSnack(`Restored policy from ${renewDialog.prevAY}. Review and save.`, true);
        }
        closeRenewDialog();
    };

    // Discard the prompt and let the user start from a clean slate.
    const handleCreateNewPolicy = () => {
        setConfig({ ...INITIAL_CONFIG });
        setStartMonth(4);
        setAutoRenew(true);
        closeRenewDialog();
    };

    const fetchLeavePolicy = async (year) => {
        const ay = year || academicYear;
        if (!ay) return;
        setIsLoadingMaster(true);
        try {
            const res = await axios.get(GetLeavePolicy, {
                params: { academicYear: ay },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            // Standard envelope: { error: false, data: {...} } when a policy exists.
            if (res?.data && res.data.error === false && res.data.data) {
                applyFetchedPolicy(res.data.data);
            } else {
                // No saved policy for this academic year — reset + check auto-renew window.
                setConfig({ ...INITIAL_CONFIG });
                setStartMonth(4);
                setAutoRenew(true);
                setHasExistingPolicy(false);
                checkAutoRenewWindow(ay);
            }
        } catch (err) {
            // 404 = no policy saved yet for this year → silent reset + auto-renew check.
            if (err?.response?.status === 404) {
                setConfig({ ...INITIAL_CONFIG });
                setStartMonth(4);
                setAutoRenew(true);
                setHasExistingPolicy(false);
                checkAutoRenewWindow(ay);
            } else {
                console.error('GetLeavePolicy failed:', err);
                showSnack('Failed to load existing leave policy', false);
            }
        } finally {
            setIsLoadingMaster(false);
        }
    };

    // Refetch whenever the academic year changes (header dropdown drives reload).
    useEffect(() => {
        fetchLeavePolicy(academicYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

    // Builds the API payload up to (and including) "Bonus Payout Schedule".
    // Working Calendar + Leave Policy Management have their own endpoints/save flows.
    const buildLeavePolicyPayload = () => ({
        academicYear,
        policyApplicabilityPeriod: {
            startMonth: Number(startMonth),
            endMonth:   Number(endMonth),
            autoRenew:  !!autoRenew,
        },
        shiftTiming: {
            startTime: config.shiftStartTime || '',
            endTime:   config.shiftEndTime   || '',
            gracePeriodMinutes: Number(config.gracePeriodMinutes) || 0,
            lunchBreakMinutes:  Number(config.lunchBreakMinutes)  || 0,
            shortBreakMinutes:  Number(config.shortBreakMinutes)  || 0,
        },
        attendanceBonus: {
            enabled: !!config.attendanceBonusEnabled,
            amount: Number(config.attendanceBonusAmount) || 0,
            minWorkingDays: Number(config.minWorkingDaysForBonus) || 0,
            mustJoinFirstDay: !!config.mustJoinFirstDay,
            mandatoryDayRequired: !!config.mandatoryDayAttendanceRequired,
            salaryDeductStillApplies: !!config.leaveDeductionStillApplies,
        },
        punctuality: {
            enabled: !!config.punctualityBonusEnabled,
            bonusAmount: Number(config.punctualityBonusAmount) || 0,
            lateThresholdMinutes: Number(config.lateArrivalThresholdMinutes) || 0,
            emergencyLatesAllowed: Number(config.emergencyLatesPerMonth) || 0,
            latePenaltyAmount: Number(config.latePenaltyAmount) || 0,
            uninformedLeaveDisqualifies: !!config.uninformedLeaveDisqualifies,
            informedLeavePlusLateBalance: !!config.informedLeaveLateBalanceEnabled,
            balanceRatio: config.informedLeaveLateRatio || '1:1',
        },
        leaveSalaryDeduction: {
            appliesToPaidLeave: !!config.deductionAppliesToPaidLeave,
            deductionAppliedWhen: DEDUCTION_APPLIED_TO_API[config.paidLeaveDeductionAppliedOn] || 'SameMonth',
            formula: DEDUCTION_FORMULA_TO_API[config.deductionFormula] || 'GrossWorkingDays',
        },
        bonusPayout: {
            calcFrequency: FREQUENCY_TO_API[config.bonusCalculationFrequency] || 'Monthly',
            creditFrequency: FREQUENCY_TO_API[config.bonusCreditFrequency] || 'Quarterly',
        },
        updatedByRollNumber: authUser?.rollNumber || '',
    });

    const validateLeavePolicyPayload = () => {
        if (!authUser?.rollNumber) {
            showSnack('Cannot save: no logged-in user found.', false);
            return false;
        }
        if (!startMonth || startMonth < 1 || startMonth > 12) {
            showSnack('Please choose a valid start month for the policy.', false);
            return false;
        }
        if (!academicYear) {
            showSnack('Please choose the academic year first.', false);
            return false;
        }
        // Cross-field sanity: if attendance bonus is enabled, amount must be > 0
        if (config.attendanceBonusEnabled && (Number(config.attendanceBonusAmount) || 0) <= 0) {
            showSnack('Please enter the Attendance Bonus amount.', false);
            return false;
        }
        if (config.punctualityBonusEnabled && (Number(config.punctualityBonusAmount) || 0) <= 0) {
            showSnack('Please enter the Punctuality Bonus amount.', false);
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateLeavePolicyPayload()) return;
        const payload = buildLeavePolicyPayload();
        setIsSavingMaster(true);
        try {
            const res = await axios.post(postleavepolicy, payload, {
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            if (res?.data && res.data.error === false) {
                showSnack(res.data.message || 'Leave policy saved successfully', true);
                setHasExistingPolicy(true);
            } else if (res?.data && res.data.error) {
                showSnack(res.data.message || 'Failed to save leave policy', false);
            } else {
                // Backend doesn't follow the standard envelope — assume HTTP 2xx = success.
                showSnack('Leave policy saved successfully', true);
                setHasExistingPolicy(true);
            }
        } catch (err) {
            console.error('postleavepolicy failed:', err);
            const apiMsg = err?.response?.data?.message;
            showSnack(apiMsg || 'Failed to save leave policy. Please try again.', false);
        } finally {
            setIsSavingMaster(false);
        }
    };

    // ── Leave Policy Management State ──────────────────────────────────────
    const [policies, setPolicies] = useState([]);
    const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
    const [isSavingPolicy, setIsSavingPolicy] = useState(false);
    const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
    const [deletePolicyDialogOpen, setDeletePolicyDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [policyForm, setPolicyForm] = useState(emptyLeaveForm);
    const [policyErrors, setPolicyErrors] = useState({});
    const [deletePolicyTarget, setDeletePolicyTarget] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeletingPolicy, setIsDeletingPolicy] = useState(false);
    const [policyStats, setPolicyStats] = useState({
        totalLeaveTypes: 0,
        totalDaysPerMonth: 0,
        onDemandUnlimited: 0,
        encashableLeaveTypes: 0,
    });

    const ffPolicy = (key, value) => {
        setPolicyForm(prev => ({ ...prev, [key]: value }));
        if (policyErrors[key]) {
            setPolicyErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
        }
    };

    const validatePolicyForm = () => {
        const e = {};
        const name = policyForm.name.trim();
        const code = policyForm.shortCode.trim();
        if (!name) e.name = 'Leave type name is required';
        else if (name.length < 2) e.name = 'Name must be at least 2 characters';
        if (!code) e.shortCode = 'Short code is required';
        else if (code.length < 2) e.shortCode = 'Short code must be at least 2 characters';
        const dpp = Number(policyForm.daysPerPeriod);
        if (isNaN(dpp) || dpp < 0) e.daysPerPeriod = 'Number of days cannot be negative';
        else if (dpp > 366) e.daysPerPeriod = 'Number of days seems too high';
        const cap = Number(policyForm.maxPerMonth);
        if (isNaN(cap) || cap < 0) e.maxPerMonth = 'Monthly cap cannot be negative';
        else if (cap > 31) e.maxPerMonth = 'Monthly cap cannot exceed 31';
        else if (cap > 0 && dpp > 0 && cap > dpp) e.maxPerMonth = `Cannot exceed total (${dpp})`;
        // Duplicates (case-insensitive) ignoring the one being edited
        const dupName = policies.find(p => p.name.trim().toLowerCase() === name.toLowerCase() && p.id !== editingPolicy?.id);
        const dupCode = policies.find(p => p.shortCode.trim().toLowerCase() === code.toLowerCase() && p.id !== editingPolicy?.id);
        if (dupName && !e.name) e.name = 'A leave type with this name already exists';
        if (dupCode && !e.shortCode) e.shortCode = 'A leave type with this short code already exists';
        setPolicyErrors(e);
        return Object.keys(e).length === 0;
    };

    const fetchLeavePolicies = async (year) => {
        const ay = year || academicYear;
        if (!ay) return;
        setIsLoadingPolicies(true);
        try {
            const res = await axios.get(GetleaveTypes, {
                params: { academicYear: ay },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            if (res?.data && res.data.error === false && res.data.data) {
                const d = res.data.data;
                const summary = d.summary || {};
                setPolicyStats({
                    totalLeaveTypes: Number(summary.totalTypes) || 0,
                    totalDaysPerMonth: Number(summary.daysPerMonth) || 0,
                    onDemandUnlimited: Number(summary.onDemand) || 0,
                    encashableLeaveTypes: Number(summary.encashable) || 0,
                });
                setPolicies((d.items || []).map(lt => ({
                    id: lt.id,
                    name: lt.name || '',
                    shortCode: lt.shortCode || '',
                    color: lt.colorTag || '#3B82F6',
                    description: lt.description || '',
                    daysPerPeriod: Number(lt.numberOfDays) || 0,
                    allocationPeriod: FREQUENCY_FROM_API[lt.allocationPeriod] || lt.allocationPeriod || 'Yearly',
                    advanceUsageAllowed: !!lt.advanceUsageAllowed,
                    maxPerMonth: Number(lt.maxDaysPerMonth) || 0,
                    unusedLeaveAction: UNUSED_ACTION_FROM_API[lt.unusedAction] || 'lapse',
                    extraLeaveDeducted: !!lt.deductSalaryForExtra,
                    standaloneOnly: !!lt.standaloneOnly,
                    requiresDocument: !!lt.requireSupportingDocument,
                    // Defaults for fields the new API doesn't return — kept so the dialog still renders.
                    encashmentTiming: 'End of Period',
                    encashmentFormula: 'gross_by_working_days',
                    documentHint: '',
                    // Audit metadata (available for future display)
                    academicYear: lt.academicYear || ay,
                    isActive: lt.isActive !== false,
                    monthlyEquivalent: Number(lt.monthlyEquivalent) || 0,
                    createdBy: lt.createdBy || null,
                    createdOn: lt.createdOn || null,
                    updatedBy: lt.updatedBy || null,
                    updatedOn: lt.updatedOn || null,
                })));
            } else if (res?.data && res.data.error) {
                // Treat error responses for an unset year as "no data" rather than an error toast.
                setPolicies([]);
                setPolicyStats({ totalLeaveTypes: 0, totalDaysPerMonth: 0, onDemandUnlimited: 0, encashableLeaveTypes: 0 });
            } else {
                // No data block → no leave types for this academic year yet.
                setPolicies([]);
                setPolicyStats({ totalLeaveTypes: 0, totalDaysPerMonth: 0, onDemandUnlimited: 0, encashableLeaveTypes: 0 });
            }
        } catch (err) {
            // 404 = nothing saved yet → silent reset. Other errors → user-visible.
            if (err?.response?.status === 404) {
                setPolicies([]);
                setPolicyStats({ totalLeaveTypes: 0, totalDaysPerMonth: 0, onDemandUnlimited: 0, encashableLeaveTypes: 0 });
            } else {
                console.error('GetleaveTypes failed:', err);
                showSnack('Failed to load leave types', false);
            }
        } finally {
            setIsLoadingPolicies(false);
        }
    };

    // Refetch leave types whenever the academic year scope changes.
    useEffect(() => {
        fetchLeavePolicies(academicYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

    const handleAddPolicy = () => {
        setEditingPolicy(null);
        setPolicyForm({ ...emptyLeaveForm });
        setPolicyErrors({});
        setPolicyDialogOpen(true);
    };

    const handleEditPolicy = (policy) => {
        setEditingPolicy(policy);
        setPolicyForm({ ...emptyLeaveForm, ...policy });
        setPolicyErrors({});
        setPolicyDialogOpen(true);
    };

    const handleDeletePolicyClick = (policy) => {
        setDeletePolicyTarget(policy);
        setDeleteConfirmText('');
        setDeletePolicyDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        if (isDeletingPolicy) return;
        setDeletePolicyDialogOpen(false);
        setDeletePolicyTarget(null);
        setDeleteConfirmText('');
    };

    const handleConfirmDeletePolicy = async () => {
        if (!deletePolicyTarget?.id) return;
        // Hard guard — extra safety on top of the disabled button.
        if (deleteConfirmText !== 'delete') {
            showSnack('Type the word "delete" to confirm.', false);
            return;
        }
        if (!authUser?.rollNumber) {
            showSnack('Cannot delete: no logged-in user found.', false);
            return;
        }

        setIsDeletingPolicy(true);
        try {
            const url = `${DeleteleaveTypeByID}/${deletePolicyTarget.id}`;
            const res = await axios.delete(url, {
                params: { updatedByRollNumber: authUser.rollNumber },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            const ok = !res?.data || res.data.error === false;
            if (ok) {
                showSnack(
                    res?.data?.message || `"${deletePolicyTarget.name}" deleted successfully.`,
                    true
                );
                setDeletePolicyDialogOpen(false);
                setDeletePolicyTarget(null);
                setDeleteConfirmText('');
                fetchLeavePolicies();
            } else {
                showSnack(res?.data?.message || 'Failed to delete leave type', false);
            }
        } catch (err) {
            console.error('DeleteleaveTypeByID failed:', err);
            const apiMsg = err?.response?.data?.message;
            showSnack(apiMsg || 'Failed to delete leave type. Please try again.', false);
        } finally {
            setIsDeletingPolicy(false);
        }
    };

    const handleSavePolicy = async () => {
        if (!validatePolicyForm()) {
            showSnack('Please correct the highlighted fields', false);
            return;
        }
        if (!authUser?.rollNumber) {
            showSnack('Cannot save: no logged-in user found.', false);
            return;
        }

        const isMonthly = policyForm.allocationPeriod === 'Monthly';
        // Monthly policies always have advanceUsage = true (irrelevant — it's just one month).
        const advanceUsage = isMonthly || !!policyForm.advanceUsageAllowed;

        const body = {
            academicYear,
            name: policyForm.name.trim(),
            shortCode: policyForm.shortCode.trim().toUpperCase(),
            colorTag: policyForm.color,
            description: policyForm.description?.trim() || '',
            allocationPeriod: FREQUENCY_TO_API[policyForm.allocationPeriod] || 'Yearly',
            numberOfDays: Number(policyForm.daysPerPeriod) || 0,
            maxDaysPerMonth: Number(policyForm.maxPerMonth) || 0,
            advanceUsageAllowed: advanceUsage,
            unusedAction: UNUSED_ACTION_TO_API[policyForm.unusedLeaveAction] || 'Lapse',
            deductSalaryForExtra: !!policyForm.extraLeaveDeducted,
            standaloneOnly: !!policyForm.standaloneOnly,
            requireSupportingDocument: !!policyForm.requiresDocument,
            updatedByRollNumber: authUser.rollNumber,
        };

        setIsSavingPolicy(true);
        try {
            // Add → POST /postleavetypes  ·  Edit → PUT /UpdateleaveTypeByID/{id}
            const isEdit = !!editingPolicy?.id;
            const res = isEdit
                ? await axios.put(`${UpdateleaveTypeByID}/${editingPolicy.id}`, body, {
                    headers: { Authorization: `Bearer ${TOKEN}` },
                })
                : await axios.post(postleavetypes, body, {
                    headers: { Authorization: `Bearer ${TOKEN}` },
                });
            const ok = !res?.data || res.data.error === false;
            if (ok) {
                showSnack(
                    res?.data?.message
                    || (isEdit ? 'Leave type updated successfully!' : 'Leave type added successfully!'),
                    true
                );
                setPolicyDialogOpen(false);
                fetchLeavePolicies();
            } else {
                showSnack(res?.data?.message || 'Failed to save leave type', false);
            }
        } catch (err) {
            console.error('Save leave type failed:', err);
            const apiMsg = err?.response?.data?.message;
            showSnack(
                apiMsg
                || (editingPolicy ? 'Failed to update leave type.' : 'Failed to add leave type.'),
                false
            );
        } finally {
            setIsSavingPolicy(false);
        }
    };

    return (
        <>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <Box sx={{ width: '100%' }}>
                {/* Fixed Header */}
                <Box sx={{
                    position: 'fixed',
                    top: '60px',
                    left: isExpanded ? '260px' : '80px',
                    right: 0,
                    backgroundColor: '#f2f2f2',
                    px: 2,
                    borderBottom: '1px solid #ddd',
                    zIndex: 1200,
                    transition: 'left 0.3s ease-in-out',
                    overflow: 'hidden',
                    py: 0.7,
                }}>
                    <Grid container sx={{ alignItems: 'center' }} spacing={1}>
                        {/* Left: Back + Title */}
                        <Grid size={{ xs: 6, md: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={() => navigate(-1)} sx={{ width: '27px', height: '27px', mt: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                            </IconButton>
                            <Box sx={{ ml: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '17px', lineHeight: 1.1 }} noWrap>
                                    Leave Policy Master
                                </Typography>
                                {isLoadingMaster ? (
                                    <Box sx={{
                                        display: 'inline-flex', alignItems: 'center', gap: 0.4,
                                        px: 0.8, py: 0.1, mt: 0.2, borderRadius: '20px',
                                        bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY}40`,
                                    }}>
                                        <CircularProgress size={9} sx={{ color: PRIMARY }} />
                                        <Typography sx={{ fontSize: 9, fontWeight: 700, color: PRIMARY_DARK }}>
                                            Loading…
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography sx={{ fontSize: 11, color: '#888' }} noWrap>
                                        Configure rules, leave types & calendar
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Center: Section tabs */}
                        <Grid size={{ xs: 12, md: 6 }} sx={{
                            display: 'flex', justifyContent: 'center',
                            order: { xs: 3, md: 2 },
                            mt: { xs: 1, md: 0 },
                        }}>
                            <Tabs
                                value={activeTab}
                                onChange={(_, v) => setActiveTab(v)}
                                variant="scrollable"
                                scrollButtons="auto"
                                slotProps={{ indicator: { sx: { display: 'none' } } }}
                                sx={{
                                    bgcolor: '#fff',
                                    minHeight: 36,
                                    borderRadius: '50px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    overflow: 'visible',
                                    '& .MuiTabs-scroller': { overflow: 'visible !important' },
                                    '& .MuiTabs-flexContainer': { gap: 0.3 },
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontSize: '12.5px',
                                        color: '#555',
                                        fontWeight: 700,
                                        minWidth: 0,
                                        minHeight: 30, height: 30,
                                        px: 2,
                                        m: 0.4,
                                        borderRadius: '50px',
                                        transition: 'all 0.2s',
                                        overflow: 'visible',
                                    },
                                    '& .Mui-selected': {
                                        color: `${websiteSettings.textColor} !important`,
                                        bgcolor: websiteSettings.mainColor,
                                        boxShadow: '1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                    },
                                    '& .MuiTabScrollButton-root': { width: 28 },
                                }}
                            >
                                <Tab label="Policy Setup" />
                                <Tab label="Leave Types" />
                                <Tab
                                    label={
                                        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', pr: isNextMonthMissing ? 1.2 : 0 }}>
                                            Working Calendar
                                            {isNextMonthMissing && (
                                                <Tooltip
                                                    arrow
                                                    title={`Save the working calendar for ${nextMonthLabel} before it begins — plan ahead.`}
                                                >
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: -7, right: -12,
                                                        width: 17, height: 17, borderRadius: '50%',
                                                        bgcolor: '#DC2626', color: '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: '0 0 0 2px #fff, 0 2px 5px rgba(220,38,38,0.55)',
                                                        zIndex: 2,
                                                        animation: 'wcPulse 1.8s infinite',
                                                        '@keyframes wcPulse': {
                                                            '0%, 100%': { transform: 'scale(1)',    boxShadow: '0 0 0 2px #fff, 0 2px 5px rgba(220,38,38,0.55)' },
                                                            '50%':      { transform: 'scale(1.18)', boxShadow: '0 0 0 2px #fff, 0 0 0 5px rgba(220,38,38,0.22), 0 3px 8px rgba(220,38,38,0.6)' },
                                                        },
                                                    }}>
                                                        <InfoOutlinedIcon sx={{ fontSize: 12 }} />
                                                    </Box>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    }
                                />
                            </Tabs>
                        </Grid>

                        {/* Right: Academic year selector (Autocomplete) */}
                        <Grid size={{ xs: 6, md: 3 }} sx={{
                            display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                            order: { xs: 2, md: 3 },
                        }}>
                            <Autocomplete
                                size="small"
                                disableClearable
                                options={academicYears}
                                value={academicYear}
                                onChange={(_, v) => v && setAcademicYear(v)}
                                isOptionEqualToValue={(o, v) => o === v}
                                sx={{ width: 170 }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Academic Year"
                                        slotProps={{
                                            input: {
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ ml: 0.5 }}>
                                                        <CalendarMonthIcon sx={{ fontSize: 15, color: PRIMARY }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: 34, fontSize: 12.5, borderRadius: '8px',
                                                bgcolor: '#fff', fontWeight: 700, color: PRIMARY_DARK,
                                                '& fieldset': { borderColor: `${PRIMARY}30` },
                                                '&:hover fieldset': { borderColor: PRIMARY },
                                                '&.Mui-focused fieldset': { borderColor: PRIMARY },
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Content */}
                <Box sx={{ px: 2, pt: '75px', pb: 4 }}>

                    {/* ─── TAB 0: POLICY SETUP ─── */}
                    {activeTab === 0 && (<>
                    {/* ═══ Section 0: Policy Applicability Period ═══ */}
                    <Section icon={CalendarMonthIcon} title="Policy Applicability Period" color="#7C3AED"
                        subtitle="Pick the start month — the policy runs for 12 months. The year comes from the Academic Year selected in the header.">

                        <Box sx={{
                            display: 'flex',
                            alignItems: { xs: 'stretch', sm: 'flex-end' },
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            flexWrap: 'wrap',
                        }}>
                            {/* Start month — editable */}
                            <Box sx={{ flex: 1, minWidth: 220 }}>
                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>
                                    Starts In <span style={{ color: '#DC2626' }}>*</span>
                                </Typography>
                                <Autocomplete
                                    size="small"
                                    disableClearable
                                    options={MONTH_NAMES.map((_, i) => i + 1)}
                                    value={startMonth}
                                    onChange={(_, v) => v && setStartMonth(v)}
                                    getOptionLabel={(m) => MONTH_NAMES[m - 1] || ''}
                                    isOptionEqualToValue={(o, v) => o === v}
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder="Select start month"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: 14, height: 40 } }}
                                        />
                                    )}
                                    renderOption={(props, m) => (
                                        <Box component="li" {...props} key={m}
                                            sx={{ display: 'flex', justifyContent: 'space-between !important', fontSize: 13 }}>
                                            <Typography sx={{ fontSize: 13, fontWeight: m === startMonth ? 700 : 500 }}>
                                                {MONTH_NAMES[m - 1]}
                                            </Typography>
                                            <Typography sx={{ fontSize: 10.5, color: '#9CA3AF', ml: 1 }}>
                                                (Current Year)
                                            </Typography>
                                        </Box>
                                    )}
                                />
                                <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 0.5 }}>
                                    {MONTH_NAMES[startMonth - 1]} <strong style={{ color: '#7C3AED' }}>(Current Year — {cycleStartYear})</strong>
                                </Typography>
                            </Box>

                            {/* Arrow */}
                            <Box sx={{
                                display: { xs: 'none', sm: 'flex' },
                                alignItems: 'center', justifyContent: 'center', pb: 3,
                            }}>
                                <Box sx={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    bgcolor: '#F5F3FF', border: '1px solid #DDD6FE',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <ArrowForwardIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
                                </Box>
                            </Box>

                            {/* End month — read-only, auto-calculated */}
                            <Box sx={{ flex: 1, minWidth: 220 }}>
                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>
                                    Ends In <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>(auto-calculated)</span>
                                </Typography>
                                <Box sx={{
                                    height: 40, px: 1.5, borderRadius: '6px',
                                    border: '1px solid #DDD6FE', bgcolor: '#F5F3FF',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', gap: 1,
                                }}>
                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#5B21B6' }}>
                                        {MONTH_NAMES[endMonth - 1]}
                                    </Typography>
                                    <Chip label="12 months" size="small"
                                        sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: '#fff', color: '#7C3AED', border: '1px solid #DDD6FE' }} />
                                </Box>
                                <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 0.5 }}>
                                    {MONTH_NAMES[endMonth - 1]} <strong style={{ color: '#7C3AED' }}>({cycleEndYear === cycleStartYear ? 'Current Year' : 'Next Year'} — {cycleEndYear})</strong>
                                </Typography>
                            </Box>
                        </Box>

                        {/* Auto-renew toggle */}
                        <Box sx={{ mt: 2 }}>
                            <ToggleRow
                                label="Auto-renew for the next academic year"
                                description={
                                    autoRenew
                                        ? `When ${MONTH_NAMES[startMonth - 1]} comes around in the next academic year, this same policy will be cloned automatically — no manual setup needed.`
                                        : 'The next academic year will start with a blank slate. You will be asked to either restore this year\'s data or create from scratch.'
                                }
                                checked={autoRenew}
                                onChange={setAutoRenew}
                            />
                        </Box>

                        {/* Summary banner */}
                        <Box sx={{
                            mt: 2, p: 1.5, borderRadius: '8px',
                            bgcolor: '#F5F3FF', border: '1px solid #DDD6FE',
                            display: 'flex', alignItems: 'flex-start', gap: 1,
                        }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#7C3AED', mt: 0.2, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 11, color: '#5B21B6', lineHeight: 1.7 }}>
                                Policy cycle: <strong>{cycleLabel}</strong> — runs for <strong>12 months</strong> within academic year <strong>{academicYear}</strong>.
                                {autoRenew
                                    ? <> Auto-renew is <strong>ON</strong> — the rules will roll forward to the next academic year automatically.</>
                                    : <> Auto-renew is <strong>OFF</strong> — you'll be prompted to renew or recreate when the next cycle starts.</>}
                            </Typography>
                        </Box>
                    </Section>

                    {/* ═══ Section: Shift Timing & Work Hours ═══ */}
                    {(() => {
                        const startMins = parseTimeToMinutes(config.shiftStartTime);
                        const endMins = parseTimeToMinutes(config.shiftEndTime);
                        let shiftMinutes = 0;
                        if (startMins != null && endMins != null) {
                            shiftMinutes = endMins - startMins;
                            if (shiftMinutes < 0) shiftMinutes += 24 * 60;
                        }
                        const totalBreakMinutes =
                            (Number(config.lunchBreakMinutes) || 0) +
                            (Number(config.shortBreakMinutes) || 0);
                        const effectiveMinutes = Math.max(0, shiftMinutes - totalBreakMinutes);
                        const lateAfter = startMins != null
                            ? (startMins + (Number(config.gracePeriodMinutes) || 0)) % (24 * 60)
                            : null;
                        const lateAfterStr = lateAfter != null
                            ? formatTime12(`${String(Math.floor(lateAfter / 60)).padStart(2, '0')}:${String(lateAfter % 60).padStart(2, '0')}`)
                            : '—';
                        const breakExceedsShift = totalBreakMinutes > shiftMinutes && shiftMinutes > 0;

                        return (
                            <Section icon={AccessTimeIcon} title="Shift Timing & Work Hours" color="#0891B2"
                                subtitle="Standard shift schedule for all staff — defines what counts as on-time, breaks, and effective working hours">

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                                        <TimeField
                                            label="Shift Start Time"
                                            value={config.shiftStartTime}
                                            onChange={(v) => update('shiftStartTime', v)}
                                            helperText={`Begins at ${formatTime12(config.shiftStartTime)}`}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                                        <TimeField
                                            label="Shift End Time"
                                            value={config.shiftEndTime}
                                            onChange={(v) => update('shiftEndTime', v)}
                                            helperText={`Ends at ${formatTime12(config.shiftEndTime)}`}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                                        <NumberField
                                            label="Grace Period"
                                            value={config.gracePeriodMinutes}
                                            onChange={(v) => update('gracePeriodMinutes', v)}
                                            suffix="minutes"
                                            helperText={`Late after ${lateAfterStr}`}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                                        <NumberField
                                            label="Lunch Break"
                                            value={config.lunchBreakMinutes}
                                            onChange={(v) => update('lunchBreakMinutes', v)}
                                            suffix="minutes"
                                            helperText="Excluded from working hours"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                                        <NumberField
                                            label="Short / Tea Break"
                                            value={config.shortBreakMinutes}
                                            onChange={(v) => update('shortBreakMinutes', v)}
                                            suffix="minutes"
                                            helperText="Combined short breaks per day"
                                        />
                                    </Grid>
                                </Grid>

                                {/* Computed Summary Cards */}
                                <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Box sx={{
                                            p: 1.5, borderRadius: '8px',
                                            bgcolor: '#F0F9FA', border: '1px solid #BAE6FD',
                                        }}>
                                            <Typography sx={{ fontSize: '10px', color: '#0E7490', fontWeight: 700, letterSpacing: '0.4px', mb: 0.3 }}>
                                                TOTAL SHIFT HOURS
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#0891B2', lineHeight: 1.2 }}>
                                                {formatHrs(shiftMinutes)}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#64748B' }}>
                                                {formatTime12(config.shiftStartTime)} → {formatTime12(config.shiftEndTime)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Box sx={{
                                            p: 1.5, borderRadius: '8px',
                                            bgcolor: '#FFF7ED', border: '1px solid #FED7AA',
                                        }}>
                                            <Typography sx={{ fontSize: '10px', color: '#9A3412', fontWeight: 700, letterSpacing: '0.4px', mb: 0.3 }}>
                                                TOTAL BREAK TIME
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#EA580C', lineHeight: 1.2 }}>
                                                {formatHrs(totalBreakMinutes)}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#64748B' }}>
                                                Lunch {config.lunchBreakMinutes || 0}m + Short {config.shortBreakMinutes || 0}m
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Box sx={{
                                            p: 1.5, borderRadius: '8px',
                                            bgcolor: '#F0FDF4', border: '1px solid #A7F3D0',
                                        }}>
                                            <Typography sx={{ fontSize: '10px', color: '#065F46', fontWeight: 700, letterSpacing: '0.4px', mb: 0.3 }}>
                                                EFFECTIVE LOGIN HOURS
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
                                                {formatHrs(effectiveMinutes)}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#64748B' }}>
                                                Shift − Breaks
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Box sx={{
                                            p: 1.5, borderRadius: '8px',
                                            bgcolor: '#FEF3C7', border: '1px solid #FDE68A',
                                        }}>
                                            <Typography sx={{ fontSize: '10px', color: '#92400E', fontWeight: 700, letterSpacing: '0.4px', mb: 0.3 }}>
                                                LATE MARK AFTER
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#D97706', lineHeight: 1.2 }}>
                                                {lateAfterStr}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#64748B' }}>
                                                Grace: {config.gracePeriodMinutes || 0} min
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Validation warning if break > shift */}
                                {breakExceedsShift && (
                                    <Box sx={{
                                        mt: 2, p: 1.2, borderRadius: '8px',
                                        bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                                        display: 'flex', alignItems: 'center', gap: 1,
                                    }}>
                                        <WarningAmberIcon sx={{ fontSize: 16, color: '#DC2626', flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: '11px', color: '#991B1B' }}>
                                            Total break time exceeds shift duration. Please review.
                                        </Typography>
                                    </Box>
                                )}

                                {/* Info banner */}
                                <Box sx={{
                                    mt: 2, p: 1.5, borderRadius: '8px',
                                    bgcolor: '#F0F9FA', border: '1px solid #BAE6FD',
                                    display: 'flex', alignItems: 'flex-start', gap: 1,
                                }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 16, color: '#0891B2', mt: 0.2, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: '11px', color: '#0E7490', lineHeight: 1.7 }}>
                                        Standard working day runs from <strong>{formatTime12(config.shiftStartTime)}</strong> to <strong>{formatTime12(config.shiftEndTime)}</strong> — a total of <strong>{formatHrs(shiftMinutes)}</strong> with <strong>{formatHrs(effectiveMinutes)}</strong> of effective login time after breaks.
                                        Staff arriving after <strong>{lateAfterStr}</strong> will be flagged as <strong>late</strong>. Use the Punctuality section below to set the late penalty and emergency allowance.
                                    </Typography>
                                </Box>
                            </Section>
                        );
                    })()}

                    {/* ═══ Section 1: Attendance Bonus ═══ */}
                    <Section icon={CalendarMonthIcon} title="Attendance Bonus" color="#2563EB"
                        subtitle="Define rules for monthly attendance bonus eligibility">

                        <ToggleRow
                            label="Enable Attendance Bonus"
                            description="Staff will be eligible for attendance bonus when conditions are met"
                            checked={config.attendanceBonusEnabled}
                            onChange={(v) => update('attendanceBonusEnabled', v)}
                        />

                        {config.attendanceBonusEnabled && (
                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <AmountField
                                            label="Bonus Amount (per month)"
                                            value={config.attendanceBonusAmount}
                                            onChange={(v) => update('attendanceBonusAmount', v)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <NumberField
                                            label="Minimum Working Days Required"
                                            value={config.minWorkingDaysForBonus}
                                            onChange={(v) => update('minWorkingDaysForBonus', v)}
                                            suffix="days"
                                            helperText="Employee must work at least this many days"
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <ToggleRow
                                            label="Must Join on First Working Day"
                                            description="Employee must be present on the 1st working day of the month"
                                            checked={config.mustJoinFirstDay}
                                            onChange={(v) => update('mustJoinFirstDay', v)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <ToggleRow
                                            label="Mandatory Day Attendance Required"
                                            description="Absence on mandatory working days disqualifies the bonus"
                                            checked={config.mandatoryDayAttendanceRequired}
                                            onChange={(v) => update('mandatoryDayAttendanceRequired', v)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <ToggleRow
                                            label="Salary Deduction Still Applies"
                                            description="Leave deduction applies even if bonus is earned"
                                            checked={config.leaveDeductionStillApplies}
                                            onChange={(v) => update('leaveDeductionStillApplies', v)}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Section>

                    {/* ═══ Section 2: Punctuality Bonus ═══ */}
                    <Section icon={AccessTimeIcon} title="Punctuality & Late Arrival" color="#F59E0B"
                        subtitle="Configure late arrival thresholds, emergency lates, and penalty rules">

                        <ToggleRow
                            label="Enable Punctuality Bonus"
                            description="Staff will receive punctuality bonus if late arrival rules are met"
                            checked={config.punctualityBonusEnabled}
                            onChange={(v) => update('punctualityBonusEnabled', v)}
                        />

                        {config.punctualityBonusEnabled && (
                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <AmountField
                                            label="Punctuality Bonus Amount"
                                            value={config.punctualityBonusAmount}
                                            onChange={(v) => update('punctualityBonusAmount', v)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        {(() => {
                                            const graceLinked = Number(config.gracePeriodMinutes) > 0;
                                            return (
                                                <NumberField
                                                    label="Late Arrival Threshold"
                                                    value={config.lateArrivalThresholdMinutes}
                                                    onChange={(v) => update('lateArrivalThresholdMinutes', v)}
                                                    suffix="minutes"
                                                    disabled={graceLinked}
                                                    helperText={graceLinked
                                                        ? `Synced from Grace Period (${config.gracePeriodMinutes} min)`
                                                        : 'Arrival after this duration is marked late'}
                                                    infoTooltip={graceLinked
                                                        ? 'This value is linked to the Grace Period field in “Shift Timing & Work Hours”. To change it, update the Grace Period field there.'
                                                        : undefined}
                                                />
                                            );
                                        })()}
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <NumberField
                                            label="Emergency Lates Allowed"
                                            value={config.emergencyLatesPerMonth}
                                            onChange={(v) => update('emergencyLatesPerMonth', v)}
                                            suffix="per month"
                                            helperText="Free late arrivals without losing bonus"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <AmountField
                                            label="Late Penalty Amount"
                                            value={config.latePenaltyAmount}
                                            onChange={(v) => update('latePenaltyAmount', v)}
                                            helperText="Deducted per extra late beyond allowed"
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <ToggleRow
                                            label="Uninformed Leave Disqualifies"
                                            description="Any UL (Uninformed Leave) will cancel the punctuality bonus"
                                            checked={config.uninformedLeaveDisqualifies}
                                            onChange={(v) => update('uninformedLeaveDisqualifies', v)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <ToggleRow
                                            label="Informed Leave + Late Balance"
                                            description="1 Informed Leave (IL) + 1 Late = Accepted (balanced)"
                                            checked={config.informedLeaveLateBalanceEnabled}
                                            onChange={(v) => update('informedLeaveLateBalanceEnabled', v)}
                                        />
                                    </Grid>
                                    {config.informedLeaveLateBalanceEnabled && (
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                            <Box>
                                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>Balance Ratio</Typography>
                                                <Autocomplete
                                                    size="small"
                                                    options={['1:1', '1:2', '2:1']}
                                                    value={config.informedLeaveLateRatio}
                                                    onChange={(_, v) => update('informedLeaveLateRatio', v || '1:1')}
                                                    renderInput={(params) => (
                                                        <TextField {...params} placeholder="Select ratio"
                                                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36 } }}
                                                        />
                                                    )}
                                                />
                                                <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.3 }}>IL : Late ratio for balance</Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}
                    </Section>

                    {/* ═══ Section 3: Leave Deduction ═══ */}
                    <Section icon={EventBusyIcon} title="Leave & Salary Deduction" color="#DC2626"
                        subtitle="Define how leave affects salary — deduction rules and paid leave allocation">

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <ToggleRow
                                    label="Applies to Paid Leave Too"
                                    description="Salary deduction applies even for paid leave (as per school policy)"

                                    checked={config.deductionAppliesToPaidLeave}
                                    onChange={(v) => update('deductionAppliesToPaidLeave', v)}
                                />
                            </Grid>
                            {config.deductionAppliesToPaidLeave && (
                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Box sx={{
                                        p: 1.5,
                                        border: '1px solid #FECACA',
                                        borderRadius: '8px',
                                        bgcolor: '#FFF5F5',
                                    }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>
                                            When is the deduction applied?
                                        </Typography>
                                        <Autocomplete
                                            size="small"
                                            options={['Same Month', 'Next Month', 'Quarterly', 'Half-Yearly', 'Yearly']}
                                            value={config.paidLeaveDeductionAppliedOn}
                                            onChange={(_, v) => update('paidLeaveDeductionAppliedOn', v || 'Same Month')}
                                            renderInput={(params) => (
                                                <TextField {...params} placeholder="Select"
                                                    sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36, bgcolor: '#fff' } }}
                                                />
                                            )}
                                        />
                                        <Typography sx={{ fontSize: '10px', color: '#DC2626', mt: 0.5 }}>
                                            The deducted amount for paid leave will be reflected in the <strong>{config.paidLeaveDeductionAppliedOn?.toLowerCase()}</strong> salary register
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>

                        {/* Deduction Formula Selection */}
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <GavelIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#333' }}>
                                    Salary Deduction Formula
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                {[
                                    { key: 'gross_by_working_days', label: 'Gross / Working Days', formula: 'Monthly Gross Salary ÷ Total Working Days of the Month', example: 'e.g., ₹30,000 / 26 working days = ₹1,153.84 per leave day' },
                                    { key: 'gross_by_calendar_days', label: 'Gross / Calendar Days', formula: 'Monthly Gross Salary ÷ Total Days in the Month', example: 'e.g., ₹30,000 / 30 calendar days = ₹1,000 per leave day' },
                                    { key: 'gross_by_fixed_days', label: 'Gross / Fixed (30)', formula: 'Monthly Gross Salary ÷ 30 (fixed)', example: 'e.g., ₹30,000 / 30 = ₹1,000 per leave day (every month)' },
                                ].map((opt) => {
                                    const isSelected = config.deductionFormula === opt.key;
                                    return (
                                        <Box
                                            key={opt.key}
                                            onClick={() => update('deductionFormula', opt.key)}
                                            sx={{
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: `2px solid ${isSelected ? '#DC2626' : '#E5E7EB'}`,
                                                bgcolor: isSelected ? '#FEF2F2' : '#FAFAFA',
                                                transition: '0.2s',
                                                minWidth: 200,
                                                flex: 1,
                                                '&:hover': { borderColor: isSelected ? '#DC2626' : '#F87171' },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Box sx={{
                                                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0, mt: '2px',
                                                    border: `2px solid ${isSelected ? '#DC2626' : '#D1D5DB'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {isSelected && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#DC2626' }} />}
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#991B1B' : '#333' }}>
                                                        {opt.label}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: isSelected ? '#B91C1C' : '#777', fontStyle: 'italic', mt: 0.2 }}>
                                                        {opt.formula}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: isSelected ? '#DC2626' : '#9CA3AF', fontWeight: 600, mt: 0.5 }}>
                                                        {opt.example}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Section>

                    {/* ═══ Section 4: Bonus Payout ═══ */}
                    <Section icon={AccountBalanceWalletIcon} title="Bonus Payout Schedule" color="#7C3AED"
                        subtitle="Define how bonuses are calculated and when they are credited to salary">

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>Bonus Calculation Frequency</Typography>
                                    <Autocomplete
                                        size="small"
                                        options={PAYOUT_FREQUENCIES}
                                        value={config.bonusCalculationFrequency}
                                        onChange={(_, v) => update('bonusCalculationFrequency', v || 'Monthly')}
                                        renderInput={(params) => (
                                            <TextField {...params} placeholder="Select"
                                                sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36 } }}
                                            />
                                        )}
                                    />
                                    <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.3 }}>How often the bonus eligibility is evaluated</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>Bonus Credit Frequency</Typography>
                                    <Autocomplete
                                        size="small"
                                        options={PAYOUT_FREQUENCIES}
                                        value={config.bonusCreditFrequency}
                                        onChange={(_, v) => update('bonusCreditFrequency', v || 'Quarterly')}
                                        renderInput={(params) => (
                                            <TextField {...params} placeholder="Select"
                                                sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36 } }}
                                            />
                                        )}
                                    />
                                    <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.3 }}>When the accumulated bonus is paid out</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{
                            mt: 2, p: 1.5, borderRadius: '8px',
                            bgcolor: '#F5F3FF', border: '1px solid #DDD6FE',
                            display: 'flex', alignItems: 'center', gap: 1,
                        }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#7C3AED', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '11px', color: '#5B21B6' }}>
                                Bonuses are <strong>calculated {config.bonusCalculationFrequency.toLowerCase()}</strong> and <strong>credited {config.bonusCreditFrequency.toLowerCase()}</strong>.
                                Only months where eligibility criteria are met will be included in the payout.
                            </Typography>
                        </Box>
                    </Section>
                    {/* ═══ Clear All + Save/Update Policy — action buttons for Sections 0 → Bonus Payout ═══
                         Edit window: updates are only allowed within the first 20 days of the
                         cycle start month. Initial creation is always allowed. */}
                    {(() => {
                        const today = dayjs();
                        const todayMonth = today.month() + 1;
                        const todayDay = today.date();
                        const inEditWindow = todayMonth === Number(startMonth) && todayDay <= 20;
                        // Existing policies can only be updated inside the 20-day window.
                        // Brand-new policies (no existing record yet) can be saved any time.
                        const updateLocked = hasExistingPolicy && !inEditWindow;
                        const isUpdate = hasExistingPolicy;
                        const buttonLabel = isUpdate ? 'Update Policy' : 'Save Policy';
                        const buttonLoadingLabel = isUpdate ? 'Updating…' : 'Saving…';
                        const startMonthName = MONTH_NAMES[startMonth - 1];

                        // When does the next window open? Same month next year if we've already passed
                        // this year's window, or this year's start month if it hasn't arrived yet.
                        const thisYearStart = today.month(startMonth - 1).date(1).startOf('day');
                        const nextWindowOpens =
                            today.isBefore(thisYearStart) ? thisYearStart
                            : todayDay <= 20 && todayMonth === Number(startMonth) ? thisYearStart
                            : thisYearStart.add(1, 'year');

                        return (
                            <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                {/* Lock notice — only when the button is locked */}
                                {updateLocked && (
                                    <Box sx={{
                                        width: '100%', maxWidth: 640,
                                        p: 1.4, borderRadius: '10px',
                                        bgcolor: '#FEF3C7', border: '1px solid #FDE68A',
                                        display: 'flex', alignItems: 'flex-start', gap: 1,
                                    }}>
                                        <LockIcon sx={{ fontSize: 18, color: '#D97706', mt: 0.2, flexShrink: 0 }} />
                                        <Box>
                                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#92400E', letterSpacing: 0.2 }}>
                                                EDITING LOCKED
                                            </Typography>
                                            <Typography sx={{ fontSize: 11.5, color: '#92400E', mt: 0.3, lineHeight: 1.55 }}>
                                                You can only update this policy within the first <strong>20 days</strong> of{' '}
                                                <strong>{startMonthName}</strong>. The next edit window opens on{' '}
                                                <strong>{nextWindowOpens.format('D MMMM YYYY')}</strong>.
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {/* Window-active hint — green note when inside the window for an existing policy */}
                                {hasExistingPolicy && inEditWindow && (
                                    <Box sx={{
                                        width: '100%', maxWidth: 640,
                                        p: 1.2, borderRadius: '10px',
                                        bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY}30`,
                                        display: 'flex', alignItems: 'center', gap: 1,
                                    }}>
                                        <InfoOutlinedIcon sx={{ fontSize: 16, color: PRIMARY, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: 11.5, color: PRIMARY_DARK, lineHeight: 1.55 }}>
                                            Edit window is <strong>open</strong> — you have until{' '}
                                            <strong>{thisYearStart.date(20).format('D MMMM YYYY')}</strong> to update this year's policy.
                                        </Typography>
                                    </Box>
                                )}

                                {/* Action buttons */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                    <Button
                                        onClick={handleClearAll}
                                        disabled={isSavingMaster || isLoadingMaster}
                                        startIcon={<RestartAltIcon sx={{ fontSize: 18 }} />}
                                        sx={{
                                            borderRadius: '999px', textTransform: 'none',
                                            fontSize: 13, fontWeight: 700,
                                            color: '#374151', bgcolor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            px: 2.5, height: 38, minWidth: 120,
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                                            transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                            '&:hover': {
                                                bgcolor: '#F9FAFB', borderColor: '#D1D5DB',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                                                transform: 'translateY(-1px)',
                                            },
                                            '&:active': { transform: 'translateY(0)' },
                                            '&.Mui-disabled': {
                                                bgcolor: '#F9FAFB', color: '#9CA3AF',
                                                border: '1px solid #E5E7EB', boxShadow: 'none',
                                            },
                                        }}
                                    >
                                        Clear All
                                    </Button>

                                    <Tooltip
                                        arrow
                                        title={updateLocked
                                            ? `Updates open in the first 20 days of ${startMonthName}. Next window: ${nextWindowOpens.format('D MMM YYYY')}.`
                                            : ''}
                                    >
                                        <Box sx={{ display: 'inline-flex' }}>
                                            <Button
                                                onClick={handleSave}
                                                disabled={isSavingMaster || isLoadingMaster || updateLocked}
                                                startIcon={
                                                    isSavingMaster
                                                        ? <CircularProgress size={14} sx={{ color: '#fff' }} />
                                                        : updateLocked
                                                            ? <LockIcon sx={{ fontSize: 16 }} />
                                                            : <SaveIcon sx={{ fontSize: 18 }} />
                                                }
                                                sx={{
                                                    borderRadius: '999px', textTransform: 'none',
                                                    fontSize: 13, fontWeight: 700,
                                                    color: '#fff',
                                                    background: `linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                                                    px: 3, height: 38, minWidth: 150,
                                                    boxShadow: `0 4px 12px ${PRIMARY}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
                                                    transition: 'transform 0.2s, box-shadow 0.2s, filter 0.2s',
                                                    '&:hover': {
                                                        filter: 'brightness(1.06)',
                                                        boxShadow: `0 8px 20px ${PRIMARY}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    '&:active': {
                                                        transform: 'translateY(0)',
                                                        boxShadow: `0 3px 10px ${PRIMARY}35`,
                                                    },
                                                    '&.Mui-disabled': {
                                                        background: '#E5E7EB', color: '#9CA3AF',
                                                        boxShadow: 'none',
                                                    },
                                                }}
                                            >
                                                {isSavingMaster ? buttonLoadingLabel : buttonLabel}
                                            </Button>
                                        </Box>
                                    </Tooltip>
                                </Box>
                            </Box>
                        );
                    })()}
                    </>)}
                    {/* ─── END TAB 0 ─── */}

                    {/* ─── TAB 1: LEAVE TYPES ─── */}
                    {activeTab === 1 && (<>
                    {/* ═══ Section 5: Leave Policy & Allocation (merged) ═══ */}
                    <Section icon={PolicyIcon} title="Leave Policy & Allocation" color={PRIMARY}
                        subtitle="Create each leave type with its own allocation period, accrual, end-of-period action, and deduction rule">

                        {/* Stat pills + Add button */}
                        <Box sx={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            mb: 2, gap: 1.5, flexWrap: 'wrap',
                        }}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {[
                                    { label: 'Total Types', value: policyStats.totalLeaveTypes, color: '#0891B2' },
                                    { label: 'Days / Month', value: `${policyStats.totalDaysPerMonth}d`, color: '#22C55E' },
                                    { label: 'On-Demand', value: policyStats.onDemandUnlimited, color: '#F97316' },
                                    { label: 'Encashable', value: policyStats.encashableLeaveTypes, color: '#E91E63' },
                                ].map((s, i) => (
                                    <Box key={i} sx={{
                                        px: 1.5, py: 0.5, borderRadius: '20px',
                                        bgcolor: `${s.color}10`, border: `1px solid ${s.color}30`,
                                        display: 'flex', alignItems: 'center', gap: 0.7,
                                    }}>
                                        <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: 500 }}>{s.label}:</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 800, color: s.color }}>{s.value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddPolicy}
                                sx={{
                                    textTransform: 'none', bgcolor: PRIMARY, borderRadius: '30px',
                                    fontSize: '12px', fontWeight: 600, px: 2, height: 32,
                                    '&:hover': { bgcolor: PRIMARY_DARK },
                                }}
                            >
                                Add Leave Type
                            </Button>
                        </Box>

                        {/* Info banner */}
                        <Box sx={{
                            mb: 2, p: 1.5, borderRadius: '8px',
                            bgcolor: '#FFFBEB', border: '1px solid #FDE68A',
                            display: 'flex', alignItems: 'flex-start', gap: 1,
                        }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#F59E0B', mt: 0.2, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 11, color: '#78350F', lineHeight: 1.7 }}>
                                Each leave type defines its <strong>allocation period</strong> (Monthly / Quarterly / Half-Yearly / Yearly),
                                its accrual rate (<strong>days per month</strong>), and an <strong>end-of-period action</strong> for unused days
                                (Encash / Carry Forward / Lapse). Set <strong>0</strong> days for on-demand leaves.
                                Salary will be deducted for any leave taken beyond the allocation when the deduction rule is on.
                            </Typography>
                        </Box>

                        {/* Loading / empty / cards */}
                        {isLoadingPolicies ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                <CircularProgress size={28} sx={{ color: PRIMARY }} />
                            </Box>
                        ) : policies.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center', py: 4, borderRadius: '8px',
                                border: '1px dashed #D1D5DB', bgcolor: '#FAFAFA',
                            }}>
                                <Typography sx={{ fontSize: '13px', color: '#888', mb: 1 }}>
                                    No leave types created yet
                                </Typography>
                                <Button size="small" variant="outlined" startIcon={<AddIcon />}
                                    onClick={handleAddPolicy}
                                    sx={{
                                        textTransform: 'none', fontSize: '12px', fontWeight: 600, borderRadius: '30px',
                                        borderColor: PRIMARY, color: PRIMARY,
                                        '&:hover': { borderColor: PRIMARY_DARK, bgcolor: PRIMARY_LIGHT },
                                    }}>
                                    Create your first leave type
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, minmax(0, 1fr))',
                                    md: 'repeat(2, minmax(0, 1fr))',
                                    lg: 'repeat(3, minmax(0, 1fr))',
                                },
                                gap: 2,
                                alignItems: 'stretch',
                            }}>
                                {policies.map(policy => {
                                    const isOnDemand = isOnDemandPolicy(policy);
                                    const totalDays = getEffectiveTotalDays(policy);
                                    const action = UNUSED_ACTIONS.find(a => a.key === policy.unusedLeaveAction) || UNUSED_ACTIONS[2];
                                    return (
                                        <Box key={policy.id} sx={{
                                            border: `1px solid ${policy.color}40`, borderRadius: '10px',
                                            bgcolor: '#fff', p: 2,
                                            display: 'flex', flexDirection: 'column',
                                            minHeight: 200, boxSizing: 'border-box',
                                            transition: '0.2s',
                                            '&:hover': { borderColor: policy.color, boxShadow: `0 4px 12px ${policy.color}20` },
                                        }}>
                                            {/* Header row */}
                                            <Box sx={{
                                                display: 'flex', justifyContent: 'space-between',
                                                alignItems: 'flex-start', mb: 1.5, gap: 1,
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                                                    <Box sx={{
                                                        width: 38, height: 38, borderRadius: '8px',
                                                        bgcolor: `${policy.color}15`, flexShrink: 0,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: `1.5px solid ${policy.color}40`,
                                                    }}>
                                                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: policy.color }}>
                                                            {policy.shortCode}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {policy.name}
                                                        </Typography>
                                                        {policy.description && (
                                                            <Typography sx={{ fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {policy.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                                    <Tooltip title="Edit" arrow>
                                                        <IconButton size="small" onClick={() => handleEditPolicy(policy)} sx={{ width: 26, height: 26 }}>
                                                            <EditIcon sx={{ fontSize: 14, color: '#1976D2' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete" arrow>
                                                        <IconButton size="small" onClick={() => handleDeletePolicyClick(policy)} sx={{ width: 26, height: 26 }}>
                                                            <DeleteIcon sx={{ fontSize: 14, color: '#f44336' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            {/* Allocation summary */}
                                            <Box sx={{
                                                p: 1.2, borderRadius: '8px', mb: 1.2,
                                                bgcolor: `${policy.color}08`,
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}>
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                        <Typography sx={{ fontSize: 22, fontWeight: 800, color: policy.color, lineHeight: 1 }}>
                                                            {isOnDemand ? '∞' : totalDays}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 11, color: '#666', fontWeight: 600 }}>
                                                            {isOnDemand ? 'on-demand' : `day(s) / ${getPeriodLabel(policy.allocationPeriod)}`}
                                                        </Typography>
                                                    </Box>
                                                    {!isOnDemand && policy.allocationPeriod !== 'Monthly' && (
                                                        <Typography sx={{ fontSize: 10, color: '#666', mt: 0.3, fontStyle: 'italic' }}>
                                                            {policy.advanceUsageAllowed
                                                                ? 'Lump sum — available from day 1'
                                                                : 'Accrues monthly across the period'}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Chip label={policy.allocationPeriod} size="small"
                                                    sx={{ fontSize: 10, fontWeight: 700, height: 22, bgcolor: '#fff', color: policy.color, border: `1px solid ${policy.color}40` }} />
                                            </Box>

                                            {/* Detail rules */}
                                            <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontSize: 11, color: '#666' }}>End of period:</Typography>
                                                    <Chip label={action.label} size="small"
                                                        sx={{ fontSize: 10, fontWeight: 700, height: 20, bgcolor: `${action.color}15`, color: action.color, border: `1px solid ${action.color}40` }} />
                                                </Box>
                                                {policy.unusedLeaveAction === 'encash' && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography sx={{ fontSize: 11, color: '#666' }}>Credited:</Typography>
                                                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#333' }}>{policy.encashmentTiming}</Typography>
                                                    </Box>
                                                )}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontSize: 11, color: '#666' }}>Extra leave:</Typography>
                                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: policy.extraLeaveDeducted ? '#DC2626' : '#999' }}>
                                                        {policy.extraLeaveDeducted ? 'Salary deducted' : 'No deduction'}
                                                    </Typography>
                                                </Box>

                                                {/* Special-rule chips — only render when set */}
                                                {(policy.standaloneOnly || policy.requiresDocument || Number(policy.maxPerMonth) > 0) && (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.4 }}>
                                                        {Number(policy.maxPerMonth) > 0 && (
                                                            <Chip
                                                                label={`Max ${policy.maxPerMonth}/month`}
                                                                size="small"
                                                                sx={{
                                                                    height: 20, fontSize: 10, fontWeight: 700,
                                                                    bgcolor: '#ECFEFF', color: '#155E75',
                                                                    border: '1px solid #A5F3FC',
                                                                }}
                                                            />
                                                        )}
                                                        {policy.standaloneOnly && (
                                                            <Chip
                                                                label="Standalone only"
                                                                size="small"
                                                                sx={{
                                                                    height: 20, fontSize: 10, fontWeight: 700,
                                                                    bgcolor: '#FEF3C7', color: '#92400E',
                                                                    border: '1px solid #FDE68A',
                                                                }}
                                                            />
                                                        )}
                                                        {policy.requiresDocument && (
                                                            <Chip
                                                                label="Document required"
                                                                size="small"
                                                                sx={{
                                                                    height: 20, fontSize: 10, fontWeight: 700,
                                                                    bgcolor: '#EEF2FF', color: '#4338CA',
                                                                    border: '1px solid #C7D2FE',
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Section>
                    </>)}
                    {/* ─── END TAB 1 ─── */}

                    {/* ─── TAB 2: WORKING CALENDAR ─── */}
                    {activeTab === 2 && (<>
                    {/* ═══ Section 6: Working Calendar ═══ */}
                    <Section icon={CalendarMonthIcon} title="Working Calendar" color="#0D9488"
                        subtitle="Define default working days and customize each month — click a date to cycle: Working → Holiday → Mandatory">

                        {/* Default Weekly Working Days */}
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 1 }}>
                            Default Working Days (applied to every month)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                            {DAY_LABELS.map((label, idx) => {
                                const isActive = config.defaultWorkingDays.includes(idx);
                                return (
                                    <Box
                                        key={idx}
                                        onClick={() => toggleDefaultWorkingDay(idx)}
                                        sx={{
                                            width: 52,
                                            py: 0.8,
                                            textAlign: 'center',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            border: `1.5px solid ${isActive ? '#16A34A' : '#E5E7EB'}`,
                                            bgcolor: isActive ? '#F0FDF4' : '#FAFAFA',
                                            color: isActive ? '#16A34A' : '#999',
                                            transition: '0.2s',
                                            '&:hover': { borderColor: isActive ? '#DC2626' : '#16A34A', transform: 'scale(1.05)' },
                                        }}
                                    >
                                        {label}
                                    </Box>
                                );
                            })}
                        </Box>
                        <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mb: 2 }}>
                            Click a day to toggle. Green = working day, grey = holiday. These defaults apply to all months unless overridden below.
                        </Typography>

                        {/* Edit-policy notice — always shown */}
                        <Box sx={{
                            mb: 2, p: 1.2, borderRadius: '8px',
                            bgcolor: '#EFF6FF', border: '1px solid #BFDBFE',
                            display: 'flex', alignItems: 'flex-start', gap: 1,
                        }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#2563EB', mt: 0.2, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 11, color: '#1E3A8A', lineHeight: 1.7 }}>
                                You can edit and save the working calendar only for <strong>upcoming months</strong>.
                                The <strong>current month</strong> and <strong>past months</strong> are read-only — once a month has started, its working-day pattern is locked.
                                Plan ahead by saving each upcoming month before it begins.
                            </Typography>
                        </Box>

                        {/* Contextual warning — when viewing a read-only month */}
                        {isReadOnlyMonth && (
                            <Box sx={{
                                mb: 2, p: 1.2, borderRadius: '8px',
                                bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                                display: 'flex', alignItems: 'center', gap: 1,
                            }}>
                                <InfoOutlinedIcon sx={{ fontSize: 16, color: '#DC2626', flexShrink: 0 }} />
                                <Typography sx={{ fontSize: 11, color: '#991B1B', lineHeight: 1.6 }}>
                                    <strong>{calendarMonth.format('MMMM YYYY')}</strong> {isCurrentMonth ? 'is the current month' : 'is in the past'} and is <strong>read-only</strong>. You cannot edit or save changes for this month — navigate to an upcoming month using the arrow.
                                </Typography>
                            </Box>
                        )}

                        {/* Month Selector */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton
                                    size="small"
                                    disabled={!canGoPrev}
                                    onClick={() => canGoPrev && setCalendarMonth(prev => prev.subtract(1, 'month'))}
                                    sx={{ border: '1px solid #E5E7EB', width: 28, height: 28, '&:hover': { bgcolor: '#F3F4F6' }, '&.Mui-disabled': { opacity: 0.3 } }}
                                >
                                    <ChevronLeftIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                <Box sx={{ minWidth: 180, textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111' }}>
                                        {calendarMonth.format('MMMM YYYY')}
                                    </Typography>
                                    <Typography sx={{ fontSize: '10px', fontWeight: 600, color: isReadOnlyMonth ? '#DC2626' : calendarMonth.isSame(currentMonth.add(1, 'month'), 'month') ? '#0891B2' : '#9CA3AF' }}>
                                        {isPastMonth ? 'Past Month · Read-only' : isCurrentMonth ? 'Current Month · Read-only' : calendarMonth.isSame(currentMonth.add(1, 'month'), 'month') ? 'Next Month · Editable' : 'Upcoming · Editable'}
                                    </Typography>
                                </Box>
                                <IconButton
                                    size="small"
                                    disabled={!canGoNext}
                                    onClick={() => canGoNext && setCalendarMonth(prev => prev.add(1, 'month'))}
                                    sx={{ border: '1px solid #E5E7EB', width: 28, height: 28, '&:hover': { bgcolor: '#F3F4F6' }, '&.Mui-disabled': { opacity: 0.3 } }}
                                >
                                    <ChevronRightIcon sx={{ fontSize: 18 }} />
                                </IconButton>

                                {/* Status pill — distinguishes Saved / Modified / Unsaved / Read-only */}
                                {(() => {
                                    let pill;
                                    if (isReadOnlyMonth) {
                                        pill = { label: 'Read-only', color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' };
                                    } else if (isMonthSaved && isMonthDirty) {
                                        pill = { label: 'Modified', color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' };
                                    } else if (isMonthSaved) {
                                        pill = { label: 'Saved', color: '#16A34A', bg: '#F0FDF4', border: '#A7F3D0' };
                                    } else {
                                        pill = { label: 'Unsaved', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' };
                                    }
                                    return (
                                        <Typography sx={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: pill.color,
                                            bgcolor: pill.bg,
                                            border: `1px solid ${pill.border}`,
                                            borderRadius: '12px',
                                            px: 1.5,
                                            py: 0.3,
                                            ml: 1,
                                        }}>
                                            {pill.label}
                                        </Typography>
                                    );
                                })()}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                {[
                                    { label: 'Working', count: calendarStats.working, ...DAY_COLORS.working },
                                    { label: 'Holiday', count: calendarStats.holiday, ...DAY_COLORS.holiday },
                                    { label: 'Mandatory', count: calendarStats.mandatory, ...DAY_COLORS.mandatory },
                                ].map((s) => (
                                    <Box key={s.label} sx={{
                                        display: 'flex', alignItems: 'center', gap: 0.8,
                                        px: 1.5, py: 0.5, borderRadius: '20px',
                                        bgcolor: s.bg, border: `1px solid ${s.border}`,
                                    }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: s.color }}>
                                            {s.count} {s.label}
                                        </Typography>
                                    </Box>
                                ))}
                                <Tooltip title={isReadOnlyMonth ? 'You cannot edit the current or past months. Navigate to an upcoming month to make changes.' : ''} arrow disableHoverListener={!isReadOnlyMonth}>
                                    <span>
                                        <Button
                                            variant="contained"
                                            startIcon={
                                                isSavingMonth
                                                    ? <CircularProgress size={14} sx={{ color: '#fff' }} />
                                                    : (isMonthSaved && !isMonthDirty && !isReadOnlyMonth)
                                                        ? <CheckCircleIcon sx={{ fontSize: 16 }} />
                                                        : <SaveIcon sx={{ fontSize: 16 }} />
                                            }
                                            disabled={isReadOnlyMonth || isSavingMonth || !canSaveMonth}
                                            onClick={handleSaveMonth}
                                            sx={{
                                                textTransform: 'none',
                                                bgcolor: '#0D9488',
                                                color: '#fff',
                                                borderRadius: '8px',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                letterSpacing: 0.2,
                                                px: 2,
                                                height: 32,
                                                boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
                                                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                                                '&:hover': {
                                                    bgcolor: '#0F766E',
                                                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
                                                    transform: 'translateY(-1px)',
                                                },
                                                '&:active': {
                                                    transform: 'translateY(0)',
                                                    boxShadow: '0 1px 4px rgba(13, 148, 136, 0.25)',
                                                },
                                                '&.Mui-disabled': {
                                                    bgcolor: (isMonthSaved && !isMonthDirty && !isReadOnlyMonth) ? '#D1FAE5' : '#F3F4F6',
                                                    color: (isMonthSaved && !isMonthDirty && !isReadOnlyMonth) ? '#047857' : '#9CA3AF',
                                                    boxShadow: 'none',
                                                    border: (isMonthSaved && !isMonthDirty && !isReadOnlyMonth) ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                                                },
                                            }}
                                        >
                                            {isReadOnlyMonth
                                                ? 'Read-only'
                                                : isSavingMonth
                                                    ? (isMonthUpdate ? 'Updating…' : 'Saving…')
                                                    : isMonthUpdate
                                                        ? `Update ${calendarMonth.format('MMM YYYY')}`
                                                        : (isMonthSaved && !isMonthDirty)
                                                            ? `${calendarMonth.format('MMM YYYY')} Saved`
                                                            : `Save ${calendarMonth.format('MMM YYYY')}`}
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* Calendar Grid */}
                        <Box sx={{ border: '1px solid #E8DDEA', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                            {/* Loading overlay while fetching this month from the server */}
                            {isLoadingCalendar && (
                                <Box sx={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    bgcolor: 'rgba(255,255,255,0.6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 2, backdropFilter: 'blur(1px)',
                                }}>
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', gap: 1,
                                        px: 1.5, py: 0.6, borderRadius: '20px',
                                        bgcolor: '#fff', border: '1px solid #99F6E4',
                                        boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)',
                                    }}>
                                        <CircularProgress size={12} sx={{ color: '#0D9488' }} />
                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#0D9488' }}>
                                            Loading {calendarMonth.format('MMM YYYY')}…
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            {/* Day headers */}
                            <Grid container>
                                {DAY_LABELS.map((label, idx) => (
                                    <Grid key={idx} size={{ xs: 12 / 7 }} sx={{
                                        textAlign: 'center',
                                        py: 1,
                                        bgcolor: '#faf6fc',
                                        borderBottom: '1px solid #E8DDEA',
                                        borderRight: idx < 6 ? '1px solid #E8DDEA' : 'none',
                                    }}>
                                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: idx === 0 ? '#DC2626' : '#555' }}>
                                            {label}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Calendar cells */}
                            <Grid container>
                                {/* Empty cells for offset */}
                                {Array.from({ length: calendarMonth.startOf('month').day() }).map((_, i) => (
                                    <Grid key={`empty-${i}`} size={{ xs: 12 / 7 }} sx={{
                                        minHeight: 56,
                                        borderBottom: '1px solid #E8DDEA',
                                        borderRight: '1px solid #E8DDEA',
                                        bgcolor: '#FAFAFA',
                                    }} />
                                ))}

                                {/* Actual days */}
                                {calendarDays.map((date) => {
                                    const type = getDayType(date);
                                    const dc = DAY_COLORS[type];
                                    const isToday = date.isSame(dayjs(), 'day');
                                    const dayNum = date.date();
                                    const cellIndex = (calendarMonth.startOf('month').day() + dayNum - 1) % 7;

                                    return (
                                        <Grid key={date.format('YYYY-MM-DD')} size={{ xs: 12 / 7 }}>
                                            <Box
                                                onClick={() => cycleDayType(date)}
                                                sx={{
                                                    minHeight: 56,
                                                    px: 0.5,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: isReadOnlyMonth ? 'not-allowed' : 'pointer',
                                                    bgcolor: dc.bg,
                                                    opacity: isReadOnlyMonth ? 0.7 : 1,
                                                    borderBottom: '1px solid #E8DDEA',
                                                    borderRight: cellIndex < 6 ? '1px solid #E8DDEA' : 'none',
                                                    transition: '0.15s',
                                                    userSelect: 'none',
                                                    '&:hover': isReadOnlyMonth ? {} : { filter: 'brightness(0.95)' },
                                                    '&:active': isReadOnlyMonth ? {} : { filter: 'brightness(0.88)' },
                                                }}
                                            >
                                                <Typography sx={{
                                                    fontSize: '13px',
                                                    fontWeight: isToday ? 800 : 600,
                                                    color: dc.color,
                                                }}>
                                                    {dayNum}
                                                </Typography>
                                                {isToday && (
                                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: dc.color, mt: 0.2 }} />
                                                )}
                                                <Typography sx={{ fontSize: '8px', fontWeight: 600, color: dc.color, opacity: 0.7, mt: 0.2, minHeight: 10 }}>
                                                    {type === 'mandatory' ? 'MWD' : type === 'holiday' ? 'OFF' : '\u00A0'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>

                        <Box sx={{
                            mt: 2, p: 1.5, borderRadius: '8px',
                            bgcolor: '#F0FDFA', border: '1px solid #99F6E4',
                            display: 'flex', alignItems: 'flex-start', gap: 1,
                        }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#0D9488', mt: 0.2, flexShrink: 0 }} />
                            <Box>
                                <Typography sx={{ fontSize: '11px', color: '#134E4A', lineHeight: 1.7 }}>
                                    <strong>Click any date</strong> (in an upcoming month) to cycle through: <strong style={{ color: '#16A34A' }}>Working</strong> → <strong style={{ color: '#DC2626' }}>Holiday</strong> → <strong style={{ color: '#EA580C' }}>Mandatory Working Day (MWD)</strong> → Working.
                                    Days without overrides follow the default weekly pattern above. The <strong>Total Working Days ({calendarStats.working + calendarStats.mandatory})</strong> value is used in the salary deduction formula.
                                    The <strong>current month</strong> and <strong>past months</strong> are read-only — only future months can be edited.
                                </Typography>
                            </Box>
                        </Box>
                    </Section>
                    </>)}
                    {/* ─── END TAB 2 ─── */}

                </Box>
            </Box>

            {/* ── Auto-renew prompt — empty new-year + within first 20 days ──── */}
            <Dialog
                open={renewDialog.open}
                onClose={closeRenewDialog}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '12px', overflow: 'hidden' } }}
            >
                <Box sx={{
                    px: 3, py: 2,
                    background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, #fff 60%)`,
                    borderBottom: `1px solid ${PRIMARY}25`,
                    display: 'flex', alignItems: 'center', gap: 1.2,
                }}>
                    <Box sx={{
                        width: 38, height: 38, borderRadius: '10px',
                        bgcolor: '#fff', border: `1px solid ${PRIMARY}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CalendarMonthIcon sx={{ color: PRIMARY, fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                            New Academic Year Detected
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#6B7280', mt: 0.2 }}>
                            No policy yet for <strong>{academicYear}</strong>
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={closeRenewDialog} sx={{ width: 28, height: 28 }}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <Box sx={{ px: 3, py: 2 }}>
                    <Typography sx={{ fontSize: 12.5, color: '#374151', lineHeight: 1.6, mb: 2 }}>
                        We found a saved policy from <strong>{renewDialog.prevAY}</strong>.
                        Would you like to restore it for the new academic year, or start from scratch?
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                            onClick={handleRestorePrev}
                            startIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: 'none', justifyContent: 'flex-start',
                                px: 1.6, py: 1.2, borderRadius: '10px',
                                border: `1px solid ${PRIMARY}30`,
                                bgcolor: PRIMARY_LIGHT,
                                color: PRIMARY_DARK,
                                fontSize: 13, fontWeight: 700,
                                '&:hover': { bgcolor: '#DCFCE7', borderColor: PRIMARY },
                            }}
                        >
                            <Box sx={{ textAlign: 'left' }}>
                                <Box>Restore Previous Year ({renewDialog.prevAY})</Box>
                                <Box sx={{ fontSize: 10.5, fontWeight: 500, color: '#6B7280', mt: 0.2 }}>
                                    Loads last year's data into the form — review then save
                                </Box>
                            </Box>
                        </Button>
                        <Button
                            onClick={handleCreateNewPolicy}
                            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: 'none', justifyContent: 'flex-start',
                                px: 1.6, py: 1.2, borderRadius: '10px',
                                border: '1px solid #E5E7EB', bgcolor: '#fff',
                                color: '#374151',
                                fontSize: 13, fontWeight: 700,
                                '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' },
                            }}
                        >
                            <Box sx={{ textAlign: 'left' }}>
                                <Box>Create New From Scratch</Box>
                                <Box sx={{ fontSize: 10.5, fontWeight: 500, color: '#9CA3AF', mt: 0.2 }}>
                                    Starts with defaults — fill in fresh values
                                </Box>
                            </Box>
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            {/* ── Leave Type Add/Edit Dialog ────────────────────────────────── */}
            <Dialog
                open={policyDialogOpen}
                onClose={() => setPolicyDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '10px', overflow: 'hidden' } }}
            >
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    px: 3, py: 1.5, bgcolor: '#f2f2f2', borderBottom: '1px solid #ddd',
                }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>
                        {editingPolicy ? 'Edit Leave Type' : 'Add Leave Type'}
                    </Typography>
                    <IconButton size="small" onClick={() => setPolicyDialogOpen(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2.5, maxHeight: '75vh', overflowY: 'auto' }}>

                    {/* ── Sub-card: Identity ── */}
                    <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', p: 2, mb: 2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Leave Type Identity
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 8, md: 8, lg: 8 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 0.5 }}>Leave Type Name *</Typography>
                                <TextField
                                    fullWidth size="small"
                                    value={policyForm.name}
                                    onChange={e => ffPolicy('name', e.target.value)}
                                    placeholder="e.g., Casual Leave"
                                    error={!!policyErrors.name}
                                    helperText={policyErrors.name || ' '}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 }, '& .MuiFormHelperText-root': { fontSize: 10, ml: 0 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 0.5 }}>Short Code *</Typography>
                                <TextField
                                    fullWidth size="small"
                                    value={policyForm.shortCode}
                                    onChange={e => ffPolicy('shortCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
                                    placeholder="e.g., CL"
                                    error={!!policyErrors.shortCode}
                                    helperText={policyErrors.shortCode || 'Up to 5 chars (A-Z, 0-9)'}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 }, '& .MuiFormHelperText-root': { fontSize: 10, ml: 0 } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 0.8 }}>Color Tag</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {LEAVE_COLORS.map(c => (
                                        <Box key={c} onClick={() => ffPolicy('color', c)}
                                            sx={{
                                                width: 24, height: 24, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                                                border: policyForm.color === c ? '3px solid #333' : '3px solid transparent',
                                                transition: '0.15s',
                                                '&:hover': { transform: 'scale(1.15)' },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 0.5 }}>Description</Typography>
                                <TextField
                                    fullWidth size="small" multiline rows={2}
                                    value={policyForm.description}
                                    onChange={e => ffPolicy('description', e.target.value)}
                                    placeholder="Brief description of when this leave applies"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 13 } }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* ── Sub-card: Allocation (unified) ── */}
                    <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', p: 2, mb: 2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            How is leave allocated?
                        </Typography>

                        {/* Period selector — 4 cards */}
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 1 }}>
                            Allocation Period
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                            {LP_ALLOCATION_PERIODS.map(opt => {
                                const desc = { Monthly: 'Resets every month', Quarterly: 'Resets every 3 months', 'Half-Yearly': 'Resets every 6 months', Yearly: 'Resets every year' }[opt.key];
                                const isSelected = policyForm.allocationPeriod === opt.key;
                                return (
                                    <Box
                                        key={opt.key}
                                        onClick={() => ffPolicy('allocationPeriod', opt.key)}
                                        sx={{
                                            px: 2, py: 1, borderRadius: '8px', cursor: 'pointer',
                                            border: `2px solid ${isSelected ? PRIMARY : '#E5E7EB'}`,
                                            bgcolor: isSelected ? PRIMARY_LIGHT : '#FAFAFA',
                                            transition: '0.2s',
                                            minWidth: 140, flex: 1,
                                            '&:hover': { borderColor: isSelected ? PRIMARY : '#34D399' },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <Box sx={{
                                                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                                                border: `2px solid ${isSelected ? PRIMARY : '#D1D5DB'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {isSelected && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: PRIMARY }} />}
                                            </Box>
                                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: isSelected ? PRIMARY_DARK : '#333' }}>
                                                {opt.label}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: 11, color: '#777', mt: 0.3, ml: 2.8 }}>{desc}</Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Single days input — works for ALL periods + both lump-sum & accrual */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 0.5 }}>
                                    Number of Days <span style={{ color: '#DC2626' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth size="small" type="number"
                                    value={policyForm.daysPerPeriod}
                                    onChange={e => ffPolicy('daysPerPeriod', Math.max(0, parseInt(e.target.value) || 0))}
                                    error={!!policyErrors.daysPerPeriod}
                                    helperText={
                                        policyErrors.daysPerPeriod
                                        || `Per ${getPeriodLabel(policyForm.allocationPeriod)} — e.g. 1 / Month for Casual, 6 / Year for Sick. Set 0 for unlimited / on-demand.`
                                    }
                                    slotProps={{ input: { inputProps: { min: 0, max: 366, step: 1 } } }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 }, '& .MuiFormHelperText-root': { fontSize: 10, ml: 0 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 0.5 }}>
                                    Monthly Equivalent <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>(reference)</span>
                                </Typography>
                                <Box sx={{
                                    height: 40, px: 1.5, borderRadius: '5px',
                                    border: '1px solid #E5E7EB', bgcolor: PRIMARY_LIGHT,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: PRIMARY_DARK }}>
                                        {isOnDemandPolicy(policyForm)
                                            ? 'Unlimited'
                                            : `${getMonthlyEquivalent(policyForm).toFixed(2)} day(s) / month`}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 0.4 }}>
                                    Auto-calculated from period & total days
                                </Typography>
                            </Grid>
                        </Grid>

                        {/* Optional monthly cap — only when period > Monthly and total > 1 */}
                        {policyForm.allocationPeriod !== 'Monthly' && Number(policyForm.daysPerPeriod) > 1 && (
                            <Grid container spacing={2} sx={{ mt: 0 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 0.5 }}>
                                        Max Days Per Month <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>(optional)</span>
                                    </Typography>
                                    <TextField
                                        fullWidth size="small" type="number"
                                        value={policyForm.maxPerMonth}
                                        onChange={e => ffPolicy('maxPerMonth', Math.max(0, parseInt(e.target.value) || 0))}
                                        error={!!policyErrors.maxPerMonth}
                                        helperText={
                                            policyErrors.maxPerMonth
                                            || (Number(policyForm.maxPerMonth) > 0
                                                ? `At most ${policyForm.maxPerMonth} day(s) usable in any single month`
                                                : 'Set 0 to allow using all allocated days in one month')
                                        }
                                        slotProps={{ input: { inputProps: { min: 0, max: 31, step: 1 } } }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 }, '& .MuiFormHelperText-root': { fontSize: 10, ml: 0 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Box sx={{
                                        p: 1.2, borderRadius: '6px',
                                        border: `1px dashed ${Number(policyForm.maxPerMonth) > 0 ? '#FDE68A' : '#E5E7EB'}`,
                                        bgcolor: Number(policyForm.maxPerMonth) > 0 ? '#FFFBEB' : '#FAFAFA',
                                    }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: Number(policyForm.maxPerMonth) > 0 ? '#92400E' : '#6B7280', mb: 0.3 }}>
                                            Why use a monthly cap?
                                        </Typography>
                                        <Typography sx={{ fontSize: 10, color: Number(policyForm.maxPerMonth) > 0 ? '#92400E' : '#6B7280', lineHeight: 1.5 }}>
                                            Spreads leaves across the {getPeriodLabel(policyForm.allocationPeriod)}. e.g. <strong>6 / year + max 3 / month</strong> means once 3 are used in a month, only the remaining balance carries to other months.
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        )}

                        {/* Availability toggle — only meaningful for periods longer than a month */}
                        {policyForm.allocationPeriod !== 'Monthly' && !isOnDemandPolicy(policyForm) && (
                            <Box sx={{ mt: 2 }}>
                                <ToggleRow
                                    label="Available from day 1 of the period"
                                    description={
                                        policyForm.advanceUsageAllowed
                                            ? `Lump sum — all ${policyForm.daysPerPeriod} day(s) are usable from the first day of the ${getPeriodLabel(policyForm.allocationPeriod)} (e.g. 6 sick leaves available immediately).`
                                            : `Accrued — only days earned so far are usable (≈ ${getMonthlyEquivalent(policyForm).toFixed(2)} day(s) added each month). Pool resets at end of period.`
                                    }
                                    checked={policyForm.advanceUsageAllowed}
                                    onChange={(v) => ffPolicy('advanceUsageAllowed', v)}
                                />
                            </Box>
                        )}

                        {/* Inline summary of the chosen rule */}
                        {!isOnDemandPolicy(policyForm) && (
                            <Box sx={{
                                mt: 2, p: 1.2, borderRadius: '6px', borderLeft: `3px solid ${PRIMARY}`,
                                bgcolor: PRIMARY_LIGHT,
                            }}>
                                <Typography sx={{ fontSize: 11, color: PRIMARY_DARK, lineHeight: 1.7 }}>
                                    <strong>{policyForm.daysPerPeriod}</strong> day(s) per <strong>{getPeriodLabel(policyForm.allocationPeriod)}</strong>
                                    {policyForm.allocationPeriod !== 'Monthly' && (
                                        <> — {policyForm.advanceUsageAllowed
                                            ? <>all <strong>available from day 1</strong></>
                                            : <>days <strong>accrue gradually</strong> across the {getPeriodLabel(policyForm.allocationPeriod)}</>}
                                        </>
                                    )}
                                    {Number(policyForm.maxPerMonth) > 0 && (
                                        <> · capped at <strong>{policyForm.maxPerMonth} per month</strong></>
                                    )}
                                    . Counter resets at the end of each {getPeriodLabel(policyForm.allocationPeriod)}.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* ── Sub-card: End of Period — only when not on-demand ── */}
                    {!isOnDemandPolicy(policyForm) && (
                        <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', p: 2, mb: 2 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                What happens to unused leave?
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                                {UNUSED_ACTIONS.map(opt => {
                                    const isSelected = policyForm.unusedLeaveAction === opt.key;
                                    return (
                                        <Box
                                            key={opt.key}
                                            onClick={() => ffPolicy('unusedLeaveAction', opt.key)}
                                            sx={{
                                                px: 2, py: 1, borderRadius: '8px', cursor: 'pointer',
                                                border: `2px solid ${isSelected ? opt.color : '#E5E7EB'}`,
                                                bgcolor: isSelected ? `${opt.color}10` : '#FAFAFA',
                                                transition: '0.2s',
                                                minWidth: 160, flex: 1,
                                                '&:hover': { borderColor: opt.color },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Box sx={{
                                                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0, mt: '2px',
                                                    border: `2px solid ${isSelected ? opt.color : '#D1D5DB'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {isSelected && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: opt.color }} />}
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: isSelected ? opt.color : '#333' }}>
                                                        {opt.label}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 11, color: '#777', mt: 0.2 }}>{opt.desc}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>

                            {/* Encashment details — only if encash */}
                            {policyForm.unusedLeaveAction === 'encash' && (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 0.5 }}>When is encashment credited?</Typography>
                                        <Autocomplete
                                            size="small"
                                            options={ENCASH_TIMINGS}
                                            value={policyForm.encashmentTiming}
                                            onChange={(_, v) => ffPolicy('encashmentTiming', v || 'End of Period')}
                                            disableClearable
                                            renderInput={(params) => (
                                                <TextField {...params} placeholder="Select"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 } }}
                                                />
                                            )}
                                        />
                                        <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 0.3 }}>Unused days credited to salary at this time</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 0.5 }}>Encashment Formula</Typography>
                                        <Autocomplete
                                            size="small"
                                            options={ENCASH_FORMULAS}
                                            getOptionLabel={(opt) => opt.label || ''}
                                            value={ENCASH_FORMULAS.find(f => f.key === policyForm.encashmentFormula) || ENCASH_FORMULAS[0]}
                                            onChange={(_, v) => ffPolicy('encashmentFormula', v?.key || 'gross_by_working_days')}
                                            isOptionEqualToValue={(o, v) => o.key === v.key}
                                            disableClearable
                                            renderInput={(params) => (
                                                <TextField {...params} placeholder="Select formula"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14 } }}
                                                />
                                            )}
                                        />
                                        <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 0.3 }}>
                                            {ENCASH_FORMULAS.find(f => f.key === policyForm.encashmentFormula)?.hint || ''}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                    )}

                    {/* ── Sub-card: Salary Deduction ── */}
                    <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', p: 2, mb: 2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            When will salary be deducted?
                        </Typography>
                        <ToggleRow
                            label="Deduct Salary for Extra Leave"
                            description={
                                isOnDemandPolicy(policyForm)
                                    ? 'Each leave day will result in a salary deduction (on-demand type)'
                                    : `Any leave taken beyond ${getEffectiveTotalDays(policyForm)} day(s) per ${getPeriodLabel(policyForm.allocationPeriod)} will result in a salary deduction`
                            }
                            checked={policyForm.extraLeaveDeducted}
                            onChange={(v) => ffPolicy('extraLeaveDeducted', v)}
                        />
                        <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 1 }}>
                            Per-day deduction is calculated using the global <strong>Salary Deduction Formula</strong> set in the section above.
                        </Typography>
                    </Box>

                    {/* ── Sub-card: Special Rules ── */}
                    <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', p: 2, mb: 2 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Special Rules
                        </Typography>

                        {/* Standalone-only toggle */}
                        <Box sx={{ mb: 1.5 }}>
                            <ToggleRow
                                label="Standalone only — block sandwich with off-days"
                                description="Leave can only be taken on a working day surrounded by other working days. The day before and the day after cannot be a holiday or another leave (prevents extending weekends)."
                                checked={policyForm.standaloneOnly}
                                onChange={(v) => ffPolicy('standaloneOnly', v)}
                            />
                            {policyForm.standaloneOnly && (
                                <Box sx={{
                                    mt: 1, ml: 2, p: 1.2, borderRadius: '6px',
                                    borderLeft: `3px solid ${PRIMARY}`, bgcolor: PRIMARY_LIGHT,
                                }}>
                                    <Typography sx={{ fontSize: 11, color: PRIMARY_DARK, lineHeight: 1.6 }}>
                                        <strong>Example:</strong> If Saturday & Sunday are off, this leave cannot be applied for Friday (would extend weekend) or Monday (would extend weekend) — only Tue / Wed / Thu would be allowed. Same rule blocks taking leave next to another approved leave.
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Document required toggle */}
                        <Box>
                            <ToggleRow
                                label="Require supporting document"
                                description="User must upload a document (e.g., medical certificate) when applying for this leave."
                                checked={policyForm.requiresDocument}
                                onChange={(v) => ffPolicy('requiresDocument', v)}
                            />
                            {policyForm.requiresDocument && (
                                <Box sx={{ mt: 1.2 }}>
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#555', mb: 0.5 }}>
                                        Document Hint <span style={{ color: '#9CA3AF', fontWeight: 500 }}>(shown to user)</span>
                                    </Typography>
                                    <TextField
                                        fullWidth size="small"
                                        value={policyForm.documentHint}
                                        onChange={(e) => ffPolicy('documentHint', e.target.value)}
                                        placeholder="e.g., Upload a medical certificate signed by a registered doctor"
                                        slotProps={{ htmlInput: { maxLength: 200 } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: 13 },
                                        }}
                                    />
                                    <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 0.4 }}>
                                        Up to 200 characters. Leave blank to use the default prompt "Upload supporting document".
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* ── Live summary ── */}
                    <Box sx={{
                        p: 2, borderRadius: '8px',
                        bgcolor: PRIMARY_LIGHT, border: `1px solid ${policyForm.color}40`,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{
                                width: 28, height: 28, borderRadius: '6px',
                                bgcolor: `${policyForm.color}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${policyForm.color}40`,
                            }}>
                                <Typography sx={{ fontSize: 10, fontWeight: 900, color: policyForm.color }}>
                                    {policyForm.shortCode || '—'}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: PRIMARY_DARK }}>
                                {policyForm.name || 'Leave Type'} — Policy Summary
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11, color: '#065F46', lineHeight: 1.9 }}>
                            {isOnDemandPolicy(policyForm) ? (
                                <>• <strong>Unlimited / On-demand</strong> — accrual is not tracked</>
                            ) : (
                                <>
                                    • <strong>{policyForm.daysPerPeriod}</strong> day(s) per <strong>{getPeriodLabel(policyForm.allocationPeriod)}</strong>
                                    {policyForm.allocationPeriod !== 'Monthly' && (
                                        <>
                                            {' — '}
                                            {policyForm.advanceUsageAllowed
                                                ? <>all <strong>available from day 1</strong> (lump sum)</>
                                                : <>days <strong>accrue gradually</strong> (≈ {getMonthlyEquivalent(policyForm).toFixed(2)} / month)</>
                                            }
                                        </>
                                    )}
                                </>
                            )}
                            {!isOnDemandPolicy(policyForm) && Number(policyForm.maxPerMonth) > 0 && (
                                <><br />• Monthly cap: <strong>up to {policyForm.maxPerMonth} day(s) per month</strong> — once used, balance carries to other months</>
                            )}
                            {!isOnDemandPolicy(policyForm) && (
                                <><br />• Unused at period end: <strong style={{ color: UNUSED_ACTIONS.find(a => a.key === policyForm.unusedLeaveAction)?.color }}>
                                    {policyForm.unusedLeaveAction === 'encash'
                                        ? `Encashed (credited at ${policyForm.encashmentTiming.toLowerCase()})`
                                        : policyForm.unusedLeaveAction === 'carry_forward'
                                            ? 'Carried forward to next period'
                                            : 'Lapses (expires)'}
                                </strong></>
                            )}
                            {policyForm.extraLeaveDeducted ? (
                                <><br />• Extra leave beyond allocation: <strong style={{ color: '#DC2626' }}>Salary deducted</strong></>
                            ) : (
                                <><br />• Extra leave beyond allocation: <strong style={{ color: '#666' }}>No deduction</strong></>
                            )}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'end', px: 2, py: 1.5, borderTop: '1px solid #eee', gap: 1 }}>
                    <Button
                        onClick={() => setPolicyDialogOpen(false)}
                        sx={{ border: '1px solid #000', borderRadius: '30px', textTransform: 'none', width: '100px', height: '30px', color: '#000', fontSize: 13, fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSavePolicy}
                        disabled={isSavingPolicy}
                        sx={{
                            bgcolor: PRIMARY, borderRadius: '30px', textTransform: 'none',
                            px: 3, height: '30px', color: '#fff', fontSize: 13, fontWeight: 600,
                            '&:hover': { bgcolor: PRIMARY_DARK },
                            '&.Mui-disabled': { bgcolor: '#E0E0E0', color: '#aaa' },
                        }}
                    >
                        {isSavingPolicy ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : editingPolicy ? 'Update' : 'Add Leave Type'}
                    </Button>
                </Box>
            </Dialog>

            {/* ── Delete Leave Type Dialog ───────────────────────────────────── */}
            <Dialog
                open={deletePolicyDialogOpen}
                onClose={handleCloseDeleteDialog}
                PaperProps={{ sx: { borderRadius: '10px', width: 460, maxWidth: '95vw', overflow: 'hidden', border: '1px solid #E5E7EB' } }}
            >
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    px: 2.5, py: 1.5, bgcolor: '#FEF2F2', borderBottom: '1px solid #FECACA',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: '8px',
                            bgcolor: '#fff', border: '1px solid #FECACA',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <DeleteIcon sx={{ fontSize: 18, color: '#DC2626' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#7F1D1D', lineHeight: 1.2 }}>
                                Delete Leave Type
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#991B1B' }}>
                                This action cannot be undone
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={handleCloseDeleteDialog} disabled={isDeletingPolicy}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2.5 }}>
                    {/* Target preview card */}
                    {deletePolicyTarget && (
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            p: 1.2, mb: 2, borderRadius: '8px',
                            bgcolor: '#FAFAFA', border: '1px solid #E5E7EB',
                        }}>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: '8px',
                                bgcolor: `${deletePolicyTarget.color}15`,
                                border: `1.5px solid ${deletePolicyTarget.color}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 900, color: deletePolicyTarget.color }}>
                                    {deletePolicyTarget.shortCode}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111' }} noWrap>
                                    {deletePolicyTarget.name}
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: '#6B7280' }}>
                                    {deletePolicyTarget.daysPerPeriod} day(s) / {deletePolicyTarget.allocationPeriod}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Warning banner — staff impact */}
                    <Box sx={{
                        p: 1.2, mb: 2, borderRadius: '8px',
                        bgcolor: '#FFFBEB', border: '1px solid #FDE68A',
                        display: 'flex', alignItems: 'flex-start', gap: 0.8,
                    }}>
                        <WarningAmberIcon sx={{ fontSize: 16, color: '#B45309', mt: 0.2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 11, color: '#92400E', lineHeight: 1.6 }}>
                            This leave type applies to <strong>all staff</strong>. Deleting it removes it from
                            future leave applications, balances and salary calculations.
                            Existing approved leaves of this type will remain on record.
                        </Typography>
                    </Box>

                    {/* Typed confirmation */}
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.6 }}>
                        To confirm, type <strong style={{ color: '#DC2626' }}>delete</strong> below
                        <Typography component="span" sx={{ fontSize: 10, color: '#9CA3AF', ml: 0.5, fontWeight: 500 }}>
                            (lowercase, no spaces)
                        </Typography>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        autoFocus
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type: delete"
                        error={deleteConfirmText.length > 0 && deleteConfirmText !== 'delete'}
                        helperText={
                            deleteConfirmText.length === 0
                                ? ' '
                                : deleteConfirmText === 'delete'
                                    ? '✓ Confirmed — you can now delete'
                                    : 'Must be exactly "delete" (lowercase, no spaces)'
                        }
                        slotProps={{ htmlInput: { spellCheck: false, autoCorrect: 'off', autoCapitalize: 'off' } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                fontSize: 14,
                                fontFamily: 'monospace',
                                '&.Mui-focused fieldset': { borderColor: '#DC2626' },
                            },
                            '& .MuiFormHelperText-root': {
                                fontSize: 10, ml: 0,
                                color: deleteConfirmText === 'delete' ? '#16A34A' : undefined,
                            },
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2.5, py: 1.5, borderTop: '1px solid #eee', gap: 1, bgcolor: '#FAFAFA' }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        disabled={isDeletingPolicy}
                        sx={{
                            textTransform: 'none', borderRadius: '8px',
                            color: '#374151', fontWeight: 600, fontSize: 13,
                            border: '1px solid #E5E7EB', px: 2, height: 34,
                            '&:hover': { bgcolor: '#F3F4F6' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDeletePolicy}
                        disabled={deleteConfirmText !== 'delete' || isDeletingPolicy}
                        startIcon={
                            isDeletingPolicy
                                ? <CircularProgress size={14} sx={{ color: '#fff' }} />
                                : <DeleteIcon sx={{ fontSize: 16 }} />
                        }
                        sx={{
                            bgcolor: '#DC2626', color: '#fff',
                            borderRadius: '8px', textTransform: 'none',
                            px: 2.5, height: 34, fontSize: 13, fontWeight: 700,
                            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
                            transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
                            '&:hover': {
                                bgcolor: '#B91C1C',
                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.45)',
                                transform: 'translateY(-1px)',
                            },
                            '&:active': { transform: 'translateY(0)' },
                            '&.Mui-disabled': { bgcolor: '#FECACA', color: '#fff', boxShadow: 'none' },
                        }}
                    >
                        {isDeletingPolicy ? 'Deleting…' : 'Delete Permanently'}
                    </Button>
                </Box>
            </Dialog>
        </>
    );
}
