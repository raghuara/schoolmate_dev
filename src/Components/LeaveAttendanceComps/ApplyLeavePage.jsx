import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Grid, Typography, IconButton, Button, Chip, TextField, Select, MenuItem,
    FormControl, InputLabel, CircularProgress, Checkbox, FormControlLabel, Divider,
    Drawer, LinearProgress,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { postLeaveRequest, GetEmployeeLeaveBalance } from '../../Api/Api';
import SnackBar from '../SnackBar';

const token = '123';
const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#ECFDF5';
const PRIMARY_DARK = '#047857';

// ─── Working Calendar (sourced from Leave Policy Master) ────────────────────
// TODO: replace with API fetch — same data HR sets in the Working Calendar section.
const DEFAULT_WORKING_DOW = [1, 2, 3, 4, 5, 6];                       // 0=Sun
const MOCK_HOLIDAY_OVERRIDES = new Set();                             // YYYY-MM-DD strings
const MOCK_MANDATORY_DAYS = new Set([
    dayjs().date(15).format('YYYY-MM-DD'),
    dayjs().add(1, 'month').date(1).format('YYYY-MM-DD'),
]);

const getDayType = (date) => {
    const key = date.format('YYYY-MM-DD');
    if (MOCK_MANDATORY_DAYS.has(key)) return 'mandatory';
    if (MOCK_HOLIDAY_OVERRIDES.has(key)) return 'holiday';
    return DEFAULT_WORKING_DOW.includes(date.day()) ? 'working' : 'holiday';
};

const DAY_TYPE_STYLE = {
    working:   { bg: '#F0FDF4', color: '#16A34A', border: '#A7F3D0' },
    holiday:   { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
    mandatory: { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
};

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDateForApi = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
};

// ─── Per-leave-type rules from Leave Policy Master ─────────────────────────
// TODO: replace with the rules section returned by the leave-types API.
// For now we mirror the policy fields HR sets in Leave Policy Master.
// `maxPerMonth` (0 = no cap) caps how many days of this type can be taken in a single month.
const LEAVE_TYPE_RULES = {
    'Sick Leave':       { standaloneOnly: false, requiresDocument: true,  documentHint: 'Upload a medical certificate signed by a registered doctor', maxPerMonth: 3 },
    'Casual Leave':     { standaloneOnly: true,  requiresDocument: false, documentHint: '',                                                          maxPerMonth: 0 },
    'Emergency Leave':  { standaloneOnly: false, requiresDocument: false, documentHint: '',                                                          maxPerMonth: 0 },
    'Maternity Leave':  { standaloneOnly: false, requiresDocument: true,  documentHint: 'Upload medical / hospital documents',                       maxPerMonth: 0 },
    'Paternity Leave':  { standaloneOnly: false, requiresDocument: true,  documentHint: 'Upload birth certificate or hospital document',             maxPerMonth: 0 },
    'Annual Leave':     { standaloneOnly: false, requiresDocument: false, documentHint: '',                                                          maxPerMonth: 0 },
    'Unpaid Leave':     { standaloneOnly: false, requiresDocument: false, documentHint: '',                                                          maxPerMonth: 0 },
};

// Current academic year (Apr–Mar window). Before April we're still in the previous year's cycle.
const getCurrentAcademicYear = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    return m >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};

// Stable colour for each leave type based on its id.
const LEAVE_TYPE_PALETTE = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
const colorForLeaveType = (id) => LEAVE_TYPE_PALETTE[Math.abs(Number(id) || 0) % LEAVE_TYPE_PALETTE.length];

// Cheap short-code: take the first letter of each word (max 3).
const shortCodeFor = (name = '') =>
    name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase() || '–';

// ─── Numbered step header (matches Leave Policy Master pattern) ─────────────
const StepHeader = ({ number, title, hint }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{
            width: 26, height: 26, borderRadius: '50%',
            bgcolor: PRIMARY, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
            {number}
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#222' }}>
            {title}
        </Typography>
        {hint && (
            <Typography sx={{ fontSize: 11, color: '#888', ml: 0.5 }}>
                — {hint}
            </Typography>
        )}
    </Box>
);

export default function ApplyLeavePage({ onSuccess, onCancel }) {
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;

    // Form state
    const [form, setForm] = useState({
        leaveType: '',
        reason: '',
    });
    const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    // Calendar picker state
    const [pickerMonth, setPickerMonth] = useState(() => dayjs().startOf('month'));
    const [selectedStart, setSelectedStart] = useState(null);
    const [selectedEnd, setSelectedEnd] = useState(null);
    const [mandatoryAck, setMandatoryAck] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Active policy rules for the chosen leave type
    const activeRules = LEAVE_TYPE_RULES[form.leaveType] || { standaloneOnly: false, requiresDocument: false, documentHint: '' };

    const today = useMemo(() => dayjs().startOf('day'), []);
    const maxPickerMonth = useMemo(() => today.startOf('month').add(11, 'month'), [today]);
    const canPickerPrev = pickerMonth.isAfter(today.startOf('month'), 'month');
    const canPickerNext = pickerMonth.isBefore(maxPickerMonth, 'month');

    // Leave balance drawer
    const [balanceOpen, setBalanceOpen] = useState(false);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [balanceTypes, setBalanceTypes] = useState([]);
    const [balanceAsOf, setBalanceAsOf] = useState(dayjs().format('D MMM YYYY'));
    const academicYear = useMemo(() => getCurrentAcademicYear(), []);

    // Fetch the logged-in user's leave balance for the current academic year.
    // The API returns one row per leave type already allocated for them.
    const fetchLeaveBalance = async () => {
        if (!rollNumber) return;
        setBalanceLoading(true);
        try {
            const res = await axios.get(GetEmployeeLeaveBalance, {
                params: { academicYear, rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            });
            const list = Array.isArray(res?.data?.data) ? res.data.data : [];
            setBalanceTypes(list.map(d => ({
                id: d.id,
                leaveTypeId: d.leaveTypeId,
                name: d.leaveTypeName || 'Leave',
                shortCode: shortCodeFor(d.leaveTypeName),
                color: colorForLeaveType(d.leaveTypeId),
                academicYear: d.academicYear,
                allocated: Number(d.allocated) || 0,
                used: Number(d.used) || 0,
                remaining: Number(d.remaining) || 0,
                usedThisMonth: Number(d.usedThisMonth) || 0,
                usedThisQuarter: Number(d.usedThisQuarter) || 0,
                usedThisHalfYear: Number(d.usedThisHalfYear) || 0,
                usedThisYear: Number(d.usedThisYear) || 0,
            })));
            setBalanceAsOf(dayjs().format('D MMM YYYY'));
        } catch (err) {
            console.error('GetEmployeeLeaveBalance failed:', err);
            setBalanceTypes([]);
        } finally {
            setBalanceLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rollNumber, academicYear]);

    const balanceTotals = useMemo(() => (
        balanceTypes.reduce((acc, t) => ({
            allocated: acc.allocated + t.allocated,
            used: acc.used + t.used,
            remaining: acc.remaining + t.remaining,
        }), { allocated: 0, used: 0, remaining: 0 })
    ), [balanceTypes]);

    // Hardcoded "Others (Loss of Pay)" — always available as a fallback when an
    // employee has exhausted their allocated balance but still needs to take leave.
    // Marked unpaid so the backend can deduct salary accordingly.
    const LOSS_OF_PAY_OPTION = {
        value: 'Loss of Pay',
        label: 'Others',
        sublabel: 'Loss of Pay',
        leaveTypeId: null,
        remaining: null,
        allocated: null,
        color: '#6B7280',
        isUnpaid: true,
    };

    // Dropdown options = allocated types from API balance + "Others (LOP)" always last.
    const leaveTypeOptions = useMemo(() => {
        const fromApi = balanceTypes.map(t => ({
            value: t.name,
            label: t.name,
            sublabel: `${t.remaining} of ${t.allocated} left`,
            leaveTypeId: t.leaveTypeId,
            remaining: t.remaining,
            allocated: t.allocated,
            color: t.color,
            isUnpaid: false,
        }));
        return [...fromApi, LOSS_OF_PAY_OPTION];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [balanceTypes]);

    const selectedLeaveOption = useMemo(
        () => leaveTypeOptions.find(o => o.value === form.leaveType) || null,
        [leaveTypeOptions, form.leaveType]
    );

    // SnackBar
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true);
        setSnackColor(success); setSnackStatus(success);
    };

    // Reset everything (used by Reset and after successful submit)
    const resetAll = () => {
        setForm({ leaveType: '', reason: '' });
        setSelectedStart(null);
        setSelectedEnd(null);
        setMandatoryAck(false);
        setUploadedFiles([]);
        setPickerMonth(dayjs().startOf('month'));
    };

    // ── Standalone-leave check (no sandwich with off-days) ─────────────────
    // Reads the policy flag for the chosen leave type and verifies that the day
    // immediately before the start AND the day immediately after the end of the
    // selection are both regular working days (not holidays / weekends / mandatory).
    const standaloneCheck = useMemo(() => {
        if (!activeRules.standaloneOnly || !selectedStart) return null;
        const end = selectedEnd || selectedStart;
        const dayBefore = selectedStart.subtract(1, 'day');
        const dayAfter = end.add(1, 'day');
        const isPlainWorking = (d) => getDayType(d) === 'working';

        const beforeOk = isPlainWorking(dayBefore);
        const afterOk = isPlainWorking(dayAfter);
        const violations = [];
        if (!beforeOk) violations.push({ side: 'before', date: dayBefore, type: getDayType(dayBefore) });
        if (!afterOk) violations.push({ side: 'after', date: dayAfter, type: getDayType(dayAfter) });
        return { ok: beforeOk && afterOk, violations };
    }, [activeRules.standaloneOnly, selectedStart, selectedEnd]);

    // ── Monthly-cap check ──────────────────────────────────────────────────
    // For policies with maxPerMonth > 0, count working+mandatory days per calendar
    // month inside the selection. Any month exceeding the cap is a violation.
    const monthlyCapCheck = useMemo(() => {
        const cap = Number(activeRules.maxPerMonth) || 0;
        if (!cap || !selectedStart) return null;
        const end = selectedEnd || selectedStart;
        const totalDays = end.diff(selectedStart, 'day') + 1;
        const perMonth = {};
        for (let i = 0; i < totalDays; i++) {
            const d = selectedStart.add(i, 'day');
            const t = getDayType(d);
            if (t === 'working' || t === 'mandatory') {
                const key = d.format('YYYY-MM');
                perMonth[key] = (perMonth[key] || 0) + 1;
            }
        }
        const offenders = Object.entries(perMonth)
            .filter(([, n]) => n > cap)
            .map(([k, n]) => ({ month: k, monthLabel: dayjs(k + '-01').format('MMMM YYYY'), used: n, cap }));
        return { ok: offenders.length === 0, cap, offenders };
    }, [activeRules.maxPerMonth, selectedStart, selectedEnd]);

    // ── Document upload handlers ──────────────────────────────────────────
    const MAX_FILE_MB = 5;
    const ACCEPTED_FILE_TYPES = '.pdf,.png,.jpg,.jpeg';

    const handleFilesAdded = (fileList) => {
        const incoming = Array.from(fileList || []);
        const valid = [];
        for (const f of incoming) {
            if (f.size > MAX_FILE_MB * 1024 * 1024) {
                showSnack(`"${f.name}" exceeds the ${MAX_FILE_MB} MB limit.`, false);
                continue;
            }
            valid.push({
                id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
                file: f,
                name: f.name,
                size: f.size,
                type: f.type,
            });
        }
        if (valid.length) setUploadedFiles(prev => [...prev, ...valid]);
    };

    const handleRemoveFile = (id) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    // Click handler for calendar cells
    const handleDayClick = (date) => {
        if (date.isBefore(today, 'day')) return;
        if (getDayType(date) === 'holiday') return;

        if (!selectedStart || (selectedStart && selectedEnd)) {
            setSelectedStart(date);
            setSelectedEnd(null);
            setMandatoryAck(false);
        } else if (date.isSame(selectedStart, 'day')) {
            setSelectedEnd(date);
        } else if (date.isBefore(selectedStart, 'day')) {
            setSelectedEnd(selectedStart);
            setSelectedStart(date);
        } else {
            setSelectedEnd(date);
        }
    };

    const handleResetSelection = () => {
        setSelectedStart(null);
        setSelectedEnd(null);
        setMandatoryAck(false);
    };

    // Compute breakdown of working / mandatory / holiday days in the selection
    const rangeBreakdown = useMemo(() => {
        if (!selectedStart) return null;
        const end = selectedEnd || selectedStart;
        const totalDays = end.diff(selectedStart, 'day') + 1;
        let working = 0, mandatory = 0, holiday = 0;
        const mandatoryDates = [];
        for (let i = 0; i < totalDays; i++) {
            const d = selectedStart.add(i, 'day');
            const t = getDayType(d);
            if (t === 'working') working++;
            else if (t === 'mandatory') { mandatory++; mandatoryDates.push(d); }
            else holiday++;
        }
        return { totalDays, working, mandatory, holiday, mandatoryDates, leaveDays: working + mandatory };
    }, [selectedStart, selectedEnd]);

    // Balance check — leaveDays selected must not exceed remaining for paid
    // leave types. "Others (Loss of Pay)" always passes.
    const balanceCheck = useMemo(() => {
        if (!selectedLeaveOption || selectedLeaveOption.isUnpaid) return null;
        if (!rangeBreakdown) return null;
        const requested = rangeBreakdown.leaveDays;
        const remaining = selectedLeaveOption.remaining;
        return {
            ok: requested <= remaining,
            requested,
            remaining,
            shortfall: Math.max(0, requested - remaining),
        };
    }, [selectedLeaveOption, rangeBreakdown]);

    const isPickerDayInRange = (date) => {
        if (!selectedStart) return false;
        const end = selectedEnd || selectedStart;
        return (date.isAfter(selectedStart, 'day') && date.isBefore(end, 'day'));
    };

    const isPickerDayEdge = (date) => {
        if (!selectedStart) return false;
        if (date.isSame(selectedStart, 'day')) return 'start';
        if (selectedEnd && date.isSame(selectedEnd, 'day')) return 'end';
        return false;
    };

    const handleSubmit = async () => {
        if (!form.leaveType || !selectedStart || !form.reason.trim()) {
            showSnack('Please fill all required fields', false);
            return;
        }
        if (rangeBreakdown && rangeBreakdown.leaveDays === 0) {
            showSnack('Selected range has no working days — leave does not need to be applied.', false);
            return;
        }
        if (rangeBreakdown && rangeBreakdown.mandatory > 0 && !mandatoryAck) {
            showSnack(`Your leave includes ${rangeBreakdown.mandatory} Mandatory Working Day(s). Please confirm prior approval.`, false);
            return;
        }
        if (standaloneCheck && !standaloneCheck.ok) {
            showSnack(`${form.leaveType} must be standalone — cannot be adjacent to off-days or other leaves.`, false);
            return;
        }
        if (monthlyCapCheck && !monthlyCapCheck.ok) {
            const first = monthlyCapCheck.offenders[0];
            showSnack(`${form.leaveType} is capped at ${monthlyCapCheck.cap} day(s) per month. ${first.monthLabel} would have ${first.used}.`, false);
            return;
        }
        if (activeRules.requiresDocument && uploadedFiles.length === 0) {
            showSnack(`${form.leaveType} requires a supporting document. Please upload at least one file.`, false);
            return;
        }
        if (balanceCheck && !balanceCheck.ok) {
            showSnack(
                `Only ${balanceCheck.remaining} day(s) of ${form.leaveType} remaining. Reduce the range or pick "Others (Loss of Pay)".`,
                false
            );
            return;
        }

        const startStr = selectedStart.format('YYYY-MM-DD');
        const endStr = (selectedEnd || selectedStart).format('YYYY-MM-DD');

        const payload = {
            forRollNumber: rollNumber,
            fromDate: formatDateForApi(startStr),
            toDate: formatDateForApi(endStr),
            duration: rangeBreakdown ? rangeBreakdown.leaveDays : 1,
            leaveType: form.leaveType,
            leaveTypeId: selectedLeaveOption?.leaveTypeId ?? null,
            isLossOfPay: !!selectedLeaveOption?.isUnpaid,
            academicYear,
            reason: form.reason.trim(),
            remarks: form.reason.trim(),
            mandatoryDays: rangeBreakdown?.mandatoryDates?.map(d => d.format('YYYY-MM-DD')) || [],
            holidaysSkipped: rangeBreakdown?.holiday || 0,
        };

        setIsSubmitting(true);
        try {
            await axios.post(postLeaveRequest, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showSnack('Leave application submitted successfully', true);
            resetAll();
            // small delay so user sees the success snack before navigating
            setTimeout(() => onSuccess?.(), 800);
        } catch (err) {
            console.error('Submit leave failed', err);
            showSnack('Failed to submit leave. Please try again.', false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitDisabled =
        isSubmitting
        || !form.leaveType
        || !selectedStart
        || !form.reason.trim()
        || (rangeBreakdown && rangeBreakdown.leaveDays === 0)
        || (rangeBreakdown && rangeBreakdown.mandatory > 0 && !mandatoryAck)
        || (standaloneCheck && !standaloneCheck.ok)
        || (monthlyCapCheck && !monthlyCapCheck.ok)
        || (activeRules.requiresDocument && uploadedFiles.length === 0)
        || (balanceCheck && !balanceCheck.ok);

    return (
        <>
            <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />

            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                {/* ─── Top action bar — Leave Balance trigger ─── */}
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    mb: 1.2, flexWrap: 'wrap', gap: 1,
                }}>
                    <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
                        Need to know how many days you've got left?
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<EventAvailableIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setBalanceOpen(true)}
                        sx={{
                            textTransform: 'none',
                            fontSize: 12,
                            fontWeight: 700,
                            color: PRIMARY_DARK,
                            bgcolor: '#fff',
                            borderColor: '#A7F3D0',
                            borderRadius: '8px',
                            px: 2,
                            height: 32,
                            '&:hover': {
                                bgcolor: PRIMARY_LIGHT,
                                borderColor: PRIMARY,
                            },
                        }}
                    >
                        My Leave Balance
                    </Button>
                </Box>

                {/* ─── Two-column body ─── */}
                <Grid container spacing={1.5} alignItems="stretch">
                    {/* ── LEFT: form fields ── */}
                    <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Leave Details card */}
                        <Box sx={{ p: 2, mb: 1.5, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB' }}>
                            <StepHeader number={1} title="Leave Details" />
                            <FormControl fullWidth required size="small" sx={{ mb: 1.5 }}>
                                <InputLabel sx={{ fontSize: 13 }}>Leave Type</InputLabel>
                                <Select
                                    value={form.leaveType}
                                    onChange={(e) => {
                                        updateForm('leaveType', e.target.value);
                                        // Reset documents when switching to a type that may not need them
                                        const next = LEAVE_TYPE_RULES[e.target.value];
                                        if (!next?.requiresDocument) setUploadedFiles([]);
                                    }}
                                    label="Leave Type"
                                    renderValue={(selected) => {
                                        if (!selected) return '';
                                        const opt = leaveTypeOptions.find(o => o.value === selected);
                                        return opt ? (opt.isUnpaid ? `${opt.label} (Loss of Pay)` : opt.label) : selected;
                                    }}
                                    sx={{
                                        fontSize: 13,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                                    }}
                                >
                                    {balanceLoading && (
                                        <MenuItem disabled value="">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress size={14} sx={{ color: PRIMARY }} />
                                                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                                                    Loading your leave balance...
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    )}
                                    {leaveTypeOptions.map(opt => {
                                        const exhausted = !opt.isUnpaid && opt.remaining === 0;
                                        return (
                                            <MenuItem
                                                key={opt.value}
                                                value={opt.value}
                                                disabled={exhausted}
                                                sx={{
                                                    py: 0.8, px: 1.4,
                                                    '&.Mui-disabled': { opacity: 0.55 },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                    <Box sx={{
                                                        width: 9, height: 9, borderRadius: '50%',
                                                        bgcolor: opt.color, flexShrink: 0,
                                                    }} />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.2 }} noWrap>
                                                            {opt.isUnpaid ? `${opt.label} (Loss of Pay)` : opt.label}
                                                        </Typography>
                                                        {!opt.isUnpaid && (
                                                            <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 0.1 }} noWrap>
                                                                {opt.sublabel}
                                                            </Typography>
                                                        )}
                                                        {opt.isUnpaid && (
                                                            <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 0.1 }} noWrap>
                                                                Use this when balance is exhausted — unpaid
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Chip
                                                        size="small"
                                                        label={
                                                            opt.isUnpaid ? 'LOP'
                                                                : exhausted ? 'Exhausted'
                                                                : `${opt.remaining} left`
                                                        }
                                                        sx={{
                                                            height: 20, fontSize: 10, fontWeight: 800,
                                                            bgcolor: opt.isUnpaid ? '#FEF3C7'
                                                                : exhausted ? '#FEF2F2'
                                                                : `${opt.color}15`,
                                                            color: opt.isUnpaid ? '#B45309'
                                                                : exhausted ? '#DC2626'
                                                                : opt.color,
                                                            border: `1px solid ${
                                                                opt.isUnpaid ? '#FDE68A'
                                                                : exhausted ? '#FECACA'
                                                                : `${opt.color}40`
                                                            }`,
                                                        }}
                                                    />
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>

                            {/* Live balance banner — appears after a type is chosen */}
                            {selectedLeaveOption && !selectedLeaveOption.isUnpaid && balanceCheck && !balanceCheck.ok && (
                                <Box sx={{
                                    mb: 1.5, p: 1, borderRadius: '6px',
                                    bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                                    display: 'flex', alignItems: 'flex-start', gap: 0.8,
                                }}>
                                    <WarningAmberIcon sx={{ fontSize: 16, color: '#DC2626', mt: 0.2, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#991B1B', mb: 0.2 }}>
                                            Balance exceeded — short by {balanceCheck.shortfall} day(s)
                                        </Typography>
                                        <Typography sx={{ fontSize: 10, color: '#991B1B', lineHeight: 1.5 }}>
                                            You requested {balanceCheck.requested} day(s) but only {balanceCheck.remaining} of
                                            {' '}{selectedLeaveOption.label} remain. Reduce the range, or pick
                                            {' '}<strong>Others (Loss of Pay)</strong> to continue.
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            {selectedLeaveOption?.isUnpaid && (
                                <Box sx={{
                                    mb: 1.5, p: 1, borderRadius: '6px',
                                    bgcolor: '#FEF3C7', border: '1px solid #FDE68A',
                                    display: 'flex', alignItems: 'flex-start', gap: 0.8,
                                }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 14, color: '#B45309', mt: 0.2, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
                                        This leave will be marked as <strong>Loss of Pay</strong> — salary for the leave days
                                        will be deducted. Use this only when your paid balance is exhausted.
                                    </Typography>
                                </Box>
                            )}

                            {/* Live metric tiles — Selected Range + Duration */}
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 7 }}>
                                    <Box sx={{
                                        px: 1.2, py: 0.8,
                                        borderRadius: '6px',
                                        border: '1px solid',
                                        bgcolor: rangeBreakdown ? PRIMARY_LIGHT : '#F9FAFB',
                                        borderColor: rangeBreakdown ? '#A7F3D0' : '#E5E7EB',
                                        height: 52,
                                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                    }}>
                                        <Typography sx={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                            Selected Range
                                        </Typography>
                                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: rangeBreakdown ? PRIMARY_DARK : '#9CA3AF', lineHeight: 1.3, mt: 0.2 }} noWrap>
                                            {selectedStart
                                                ? `${selectedStart.format('D MMM')}${selectedEnd && !selectedEnd.isSame(selectedStart, 'day') ? ` → ${selectedEnd.format('D MMM YYYY')}` : ` ${selectedStart.format('YYYY')}`}`
                                                : 'Not selected'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 5 }}>
                                    <Box sx={{
                                        px: 1.2, py: 0.8,
                                        borderRadius: '6px',
                                        border: '1px solid',
                                        bgcolor: rangeBreakdown ? PRIMARY : '#F9FAFB',
                                        borderColor: rangeBreakdown ? PRIMARY : '#E5E7EB',
                                        height: 52,
                                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                    }}>
                                        <Typography sx={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: rangeBreakdown ? '#fff' : '#6B7280' }}>
                                            Duration
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4, mt: 0.2 }}>
                                            <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1, color: rangeBreakdown ? '#fff' : '#9CA3AF' }}>
                                                {rangeBreakdown ? rangeBreakdown.leaveDays : 0}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: rangeBreakdown ? '#fff' : '#9CA3AF' }}>
                                                day(s)
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Reason card — fills remaining height when no upload card; otherwise stacks naturally */}
                        <Box sx={{
                            p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB',
                            mb: activeRules.requiresDocument ? 1.5 : 0,
                            flex: activeRules.requiresDocument ? 'none' : 1,
                            display: 'flex', flexDirection: 'column',
                        }}>
                            <StepHeader number={2} title="Reason for Leave" />
                            <TextField
                                fullWidth
                                required
                                multiline
                                minRows={activeRules.requiresDocument ? 3 : 5}
                                placeholder="Briefly describe the reason for your leave request..."
                                value={form.reason}
                                onChange={(e) => updateForm('reason', e.target.value)}
                                sx={{
                                    flex: activeRules.requiresDocument ? 'none' : 1,
                                    '& .MuiOutlinedInput-root': {
                                        height: activeRules.requiresDocument ? 'auto' : '100%',
                                        alignItems: 'flex-start',
                                        fontSize: 13,
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                                }}
                            />
                        </Box>

                        {/* Documents card — only when leave type requires supporting documents */}
                        {activeRules.requiresDocument && (
                            <Box sx={{
                                p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB',
                                flex: 1, display: 'flex', flexDirection: 'column',
                            }}>
                                <StepHeader number={3} title="Supporting Documents *" />
                                <Typography sx={{ fontSize: 11, color: '#6B7280', mb: 1, lineHeight: 1.5 }}>
                                    {activeRules.documentHint || 'Upload supporting document(s) for this leave.'}
                                </Typography>

                                {/* Upload drop zone */}
                                <Box
                                    component="label"
                                    htmlFor="leave-doc-upload"
                                    sx={{
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        textAlign: 'center',
                                        py: 1.5, px: 2,
                                        borderRadius: '8px',
                                        border: '1.5px dashed #C7D2FE',
                                        bgcolor: '#F5F7FF',
                                        cursor: 'pointer',
                                        transition: '0.15s',
                                        '&:hover': { bgcolor: '#EEF2FF', borderColor: '#A5B4FC' },
                                    }}
                                >
                                    <input
                                        id="leave-doc-upload"
                                        type="file"
                                        accept={ACCEPTED_FILE_TYPES}
                                        multiple
                                        onChange={(e) => { handleFilesAdded(e.target.files); e.target.value = ''; }}
                                        style={{ display: 'none' }}
                                    />
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#4338CA', mb: 0.2 }}>
                                        + Click to upload
                                    </Typography>
                                    <Typography sx={{ fontSize: 10, color: '#6B7280' }}>
                                        PDF, JPG or PNG · up to {MAX_FILE_MB} MB each · multiple allowed
                                    </Typography>
                                </Box>

                                {/* File list */}
                                {uploadedFiles.length > 0 && (
                                    <Box sx={{ mt: 1.2, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                                        {uploadedFiles.map(f => (
                                            <Box key={f.id} sx={{
                                                display: 'flex', alignItems: 'center', gap: 1,
                                                px: 1.2, py: 0.7, borderRadius: '6px',
                                                bgcolor: '#F9FAFB', border: '1px solid #E5E7EB',
                                            }}>
                                                <Box sx={{
                                                    width: 28, height: 28, borderRadius: '6px',
                                                    bgcolor: '#EEF2FF', flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#4338CA' }}>
                                                        {f.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#111' }} noWrap>
                                                        {f.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>
                                                        {formatFileSize(f.size)}
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveFile(f.id)}
                                                    sx={{ width: 24, height: 24, color: '#9CA3AF', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                                                >
                                                    <CloseIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                                {uploadedFiles.length === 0 && (
                                    <Typography sx={{ fontSize: 10, color: '#DC2626', mt: 0.8, fontWeight: 600 }}>
                                        At least one document is required to apply this leave.
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Grid>

                    {/* ── RIGHT: calendar + summary + ack ── */}
                    <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{
                            p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB',
                            flex: 1, display: 'flex', flexDirection: 'column',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <StepHeader number={3} title="Pick Leave Dates" />
                                {selectedStart && (
                                    <Button
                                        size="small"
                                        startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
                                        onClick={handleResetSelection}
                                        sx={{ ml: 'auto', mb: 1.5, textTransform: 'none', fontSize: 11, fontWeight: 600, color: '#6B7280', minWidth: 'auto', px: 1, '&:hover': { bgcolor: '#F3F4F6' } }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </Box>

                            {/* Calendar shell */}
                            <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', bgcolor: '#fff' }}>
                                {/* Picker header */}
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    px: 1, py: 0.6, bgcolor: '#FAFAFA', borderBottom: '1px solid #E5E7EB',
                                    flexWrap: 'wrap', gap: 0.5,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                        <IconButton size="small" disabled={!canPickerPrev}
                                            onClick={() => canPickerPrev && setPickerMonth(prev => prev.subtract(1, 'month'))}
                                            sx={{ width: 24, height: 24, '&.Mui-disabled': { opacity: 0.3 } }}>
                                            <ChevronLeftIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111', minWidth: 110, textAlign: 'center' }}>
                                            {pickerMonth.format('MMMM YYYY')}
                                        </Typography>
                                        <IconButton size="small" disabled={!canPickerNext}
                                            onClick={() => canPickerNext && setPickerMonth(prev => prev.add(1, 'month'))}
                                            sx={{ width: 24, height: 24, '&.Mui-disabled': { opacity: 0.3 } }}>
                                            <ChevronRightIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {[
                                            { label: 'Working', ...DAY_TYPE_STYLE.working },
                                            { label: 'Mandatory', ...DAY_TYPE_STYLE.mandatory },
                                            { label: 'Holiday', ...DAY_TYPE_STYLE.holiday },
                                        ].map(s => (
                                            <Box key={s.label} sx={{
                                                display: 'flex', alignItems: 'center', gap: 0.4,
                                                px: 0.8, py: 0.2, borderRadius: '20px',
                                                bgcolor: s.bg, border: `1px solid ${s.border}`,
                                            }}>
                                                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: s.color }} />
                                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: s.color }}>{s.label}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Day-of-week headers */}
                                <Grid container>
                                    {DOW_LABELS.map((label, idx) => (
                                        <Grid key={idx} size={{ xs: 12 / 7 }} sx={{
                                            textAlign: 'center', py: 0.5,
                                            bgcolor: '#FAFAFA',
                                            borderBottom: '1px solid #E5E7EB',
                                            borderRight: idx < 6 ? '1px solid #E5E7EB' : 'none',
                                        }}>
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: idx === 0 ? '#DC2626' : '#6B7280' }}>
                                                {label}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Days */}
                                <Grid container>
                                    {Array.from({ length: pickerMonth.startOf('month').day() }).map((_, i) => (
                                        <Grid key={`off-${i}`} size={{ xs: 12 / 7 }} sx={{
                                            minHeight: 42, bgcolor: '#FAFAFA',
                                            borderBottom: '1px solid #E5E7EB',
                                            borderRight: '1px solid #E5E7EB',
                                        }} />
                                    ))}
                                    {Array.from({ length: pickerMonth.daysInMonth() }).map((_, i) => {
                                        const date = pickerMonth.add(i, 'day');
                                        const type = getDayType(date);
                                        const ts = DAY_TYPE_STYLE[type];
                                        const isPast = date.isBefore(today, 'day');
                                        const isToday = date.isSame(dayjs(), 'day');
                                        const edge = isPickerDayEdge(date);
                                        const inRange = isPickerDayInRange(date);
                                        const disabled = isPast || type === 'holiday';
                                        const cellIndex = (pickerMonth.startOf('month').day() + i) % 7;

                                        let bg = ts.bg;
                                        let textColor = ts.color;
                                        if (edge === 'start' || edge === 'end') {
                                            bg = PRIMARY;
                                            textColor = '#fff';
                                        } else if (inRange) {
                                            bg = '#D1FAE5';
                                            textColor = PRIMARY_DARK;
                                        }
                                        if (isPast && !edge) {
                                            bg = '#F9FAFB';
                                            textColor = '#D1D5DB';
                                        }

                                        return (
                                            <Grid key={date.format('YYYY-MM-DD')} size={{ xs: 12 / 7 }}>
                                                <Box
                                                    onClick={() => !disabled && handleDayClick(date)}
                                                    sx={{
                                                        minHeight: 42,
                                                        position: 'relative',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                                        bgcolor: bg,
                                                        opacity: isPast ? 0.55 : 1,
                                                        borderBottom: '1px solid #E5E7EB',
                                                        borderRight: cellIndex < 6 ? '1px solid #E5E7EB' : 'none',
                                                        transition: '0.15s',
                                                        userSelect: 'none',
                                                        '&:hover': disabled ? {} : { filter: 'brightness(0.95)' },
                                                    }}
                                                >
                                                    <Typography sx={{
                                                        fontSize: 12,
                                                        fontWeight: isToday || edge ? 800 : 600,
                                                        color: textColor,
                                                        lineHeight: 1,
                                                    }}>
                                                        {date.date()}
                                                    </Typography>
                                                    {edge && (
                                                        <Typography sx={{ fontSize: 8, fontWeight: 700, color: '#fff', opacity: 0.95, mt: 0.2 }}>
                                                            {edge === 'start' ? 'START' : 'END'}
                                                        </Typography>
                                                    )}
                                                    {!edge && type === 'mandatory' && (
                                                        <Box sx={{
                                                            position: 'absolute', top: 3, right: 3,
                                                            width: 4, height: 4, borderRadius: '50%', bgcolor: '#EA580C',
                                                        }} />
                                                    )}
                                                    {isToday && !edge && (
                                                        <Box sx={{ position: 'absolute', bottom: 2, width: 3, height: 3, borderRadius: '50%', bgcolor: textColor }} />
                                                    )}
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>

                            {/* Selection summary */}
                            {rangeBreakdown && (
                                <Box sx={{
                                    mt: 1, p: 1, borderRadius: '6px',
                                    bgcolor: PRIMARY_LIGHT, border: '1px solid #A7F3D0',
                                    display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap',
                                }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 14, color: PRIMARY, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY_DARK }}>
                                        {selectedStart.format('D MMM')}
                                        {selectedEnd && !selectedEnd.isSame(selectedStart, 'day') && ` → ${selectedEnd.format('D MMM YYYY')}`}
                                        {(!selectedEnd || selectedEnd.isSame(selectedStart, 'day')) && ` ${selectedStart.format('YYYY')}`}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap', ml: 'auto' }}>
                                        <Chip size="small" label={`${rangeBreakdown.working}W`}
                                            sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: '#fff', color: '#16A34A', border: '1px solid #A7F3D0' }} />
                                        {rangeBreakdown.mandatory > 0 && (
                                            <Chip size="small" label={`${rangeBreakdown.mandatory}M`}
                                                sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: '#fff', color: '#EA580C', border: '1px solid #FED7AA' }} />
                                        )}
                                        {rangeBreakdown.holiday > 0 && (
                                            <Chip size="small" label={`${rangeBreakdown.holiday} off`}
                                                sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: '#fff', color: '#DC2626', border: '1px solid #FECACA' }} />
                                        )}
                                        <Chip size="small" label={`= ${rangeBreakdown.leaveDays} day(s)`}
                                            sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: PRIMARY, color: '#fff' }} />
                                    </Box>
                                </Box>
                            )}

                            {/* Mandatory acknowledgment */}
                            {rangeBreakdown && rangeBreakdown.mandatory > 0 && (
                                <Box sx={{
                                    mt: 1, p: 1, borderRadius: '6px',
                                    bgcolor: '#FFF7ED', border: '1px solid #FED7AA',
                                    display: 'flex', alignItems: 'flex-start', gap: 0.8,
                                }}>
                                    <WarningAmberIcon sx={{ fontSize: 16, color: '#EA580C', mt: 0.2, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: 11, color: '#9A3412', lineHeight: 1.5 }}>
                                            <strong>{rangeBreakdown.mandatory} Mandatory Working Day{rangeBreakdown.mandatory > 1 ? 's' : ''}</strong> in range ({rangeBreakdown.mandatoryDates.map(d => d.format('D MMM')).join(', ')}). Needs prior approval.
                                        </Typography>
                                        <FormControlLabel
                                            sx={{ ml: 0, mt: 0.2 }}
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={mandatoryAck}
                                                    onChange={(e) => setMandatoryAck(e.target.checked)}
                                                    sx={{ color: '#EA580C', '&.Mui-checked': { color: '#EA580C' }, p: 0.3 }}
                                                />
                                            }
                                            label={
                                                <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#9A3412' }}>
                                                    I have prior approval for these mandatory day(s)
                                                </Typography>
                                            }
                                        />
                                    </Box>
                                </Box>
                            )}

                            {/* Standalone-only rule hint (when type requires it but no dates picked yet) */}
                            {activeRules.standaloneOnly && !selectedStart && (
                                <Box sx={{
                                    mt: 1, p: 1, borderRadius: '6px',
                                    bgcolor: '#FEF3C7', border: '1px solid #FDE68A',
                                    display: 'flex', alignItems: 'flex-start', gap: 0.8,
                                }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 14, color: '#B45309', mt: 0.2, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
                                        <strong>{form.leaveType}</strong> must be standalone — pick a date where both the day before and the day after are working days (no Friday/Monday next to weekends).
                                    </Typography>
                                </Box>
                            )}

                            {/* Standalone violation — when picked dates break the rule */}
                            {standaloneCheck && !standaloneCheck.ok && (
                                <Box sx={{
                                    mt: 1, p: 1, borderRadius: '6px',
                                    bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                                    display: 'flex', alignItems: 'flex-start', gap: 0.8,
                                }}>
                                    <WarningAmberIcon sx={{ fontSize: 16, color: '#DC2626', mt: 0.2, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#991B1B', mb: 0.2 }}>
                                            {form.leaveType} cannot be combined with off-days
                                        </Typography>
                                        <Typography sx={{ fontSize: 10, color: '#991B1B', lineHeight: 1.5 }}>
                                            {standaloneCheck.violations.map(v => (
                                                `The day ${v.side === 'before' ? 'before your start' : 'after your end'} (${v.date.format('ddd, D MMM')}) is a ${v.type === 'holiday' ? 'holiday' : 'mandatory day'}.`
                                            )).join(' ')}
                                            {' '}Pick dates surrounded by regular working days, or change the leave type.
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Monthly cap rule — info banner before any selection */}
                            {Number(activeRules.maxPerMonth) > 0 && !selectedStart && (
                                <Box sx={{
                                    mt: 1, p: 1, borderRadius: '6px',
                                    bgcolor: '#ECFEFF', border: '1px solid #A5F3FC',
                                    display: 'flex', alignItems: 'flex-start', gap: 0.8,
                                }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 14, color: '#0E7490', mt: 0.2, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: 11, color: '#155E75', lineHeight: 1.5 }}>
                                        <strong>{form.leaveType}</strong> is capped at <strong>{activeRules.maxPerMonth} day(s) per month</strong>. You can take more across the year, but not more than this in any single month.
                                    </Typography>
                                </Box>
                            )}

                            {/* Monthly cap violation — selection exceeds the cap in some month */}
                            {monthlyCapCheck && !monthlyCapCheck.ok && (
                                <Box sx={{
                                    mt: 1, p: 1, borderRadius: '6px',
                                    bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                                    display: 'flex', alignItems: 'flex-start', gap: 0.8,
                                }}>
                                    <WarningAmberIcon sx={{ fontSize: 16, color: '#DC2626', mt: 0.2, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#991B1B', mb: 0.2 }}>
                                            Monthly cap exceeded
                                        </Typography>
                                        <Typography sx={{ fontSize: 10, color: '#991B1B', lineHeight: 1.5 }}>
                                            {monthlyCapCheck.offenders.map(o =>
                                                `${o.monthLabel} would have ${o.used} day(s) — limit is ${o.cap}.`
                                            ).join(' ')}
                                            {' '}Reduce the date range or split this into multiple applications.
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 'auto', pt: 1 }}>
                                Holidays are not selectable. Past dates are disabled. Browse up to 12 months ahead.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Action bar */}
                <Box sx={{
                    px: 2, py: 1, mt: 1.5, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
                }}>
                    <Typography sx={{ fontSize: 11, color: '#6B7280' }}>
                        {submitDisabled
                            ? 'Complete all required fields to submit your application.'
                            : 'Ready to submit. Your manager will be notified for approval.'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={onCancel}
                            sx={{
                                textTransform: 'none', fontSize: 13, fontWeight: 600,
                                color: '#374151', borderRadius: '8px',
                                px: 2, height: 36, border: '1px solid #E5E7EB',
                                '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitDisabled}
                            startIcon={isSubmitting
                                ? <CircularProgress size={14} sx={{ color: '#fff' }} />
                                : <SendIcon sx={{ fontSize: 16 }} />
                            }
                            sx={{
                                textTransform: 'none', fontSize: 13, fontWeight: 600,
                                bgcolor: PRIMARY, color: '#fff',
                                px: 2.5, height: 36, borderRadius: '8px',
                                boxShadow: `0 2px 6px ${PRIMARY}33`,
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                                '&:hover': {
                                    bgcolor: PRIMARY_DARK,
                                    boxShadow: `0 4px 12px ${PRIMARY}55`,
                                    transform: 'translateY(-1px)',
                                },
                                '&:active': { transform: 'translateY(0)' },
                                '&.Mui-disabled': {
                                    bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none',
                                },
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* ── My Leave Balance Drawer ────────────────────────────────── */}
            <Drawer
                anchor="right"
                open={balanceOpen}
                onClose={() => setBalanceOpen(false)}
                PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, maxWidth: '100vw' } }}
            >
                {/* Drawer header */}
                <Box sx={{
                    p: 2, bgcolor: PRIMARY_LIGHT, borderBottom: '1px solid #A7F3D0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                        <Box sx={{
                            width: 38, height: 38, borderRadius: '8px',
                            bgcolor: '#fff', border: `1px solid ${PRIMARY}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <EventAvailableIcon sx={{ color: PRIMARY, fontSize: 22 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                                My Leave Balance
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#5B7A6E' }} noWrap>
                                {(user?.name || rollNumber || 'You')} · AY {academicYear} · As of {balanceAsOf}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setBalanceOpen(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* Aggregate summary */}
                <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                    <Typography sx={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                        Across all leave types
                    </Typography>
                    <Grid container spacing={1}>
                        {[
                            { label: 'Allocated', value: balanceTotals.allocated, color: '#374151', bg: '#fff' },
                            { label: 'Used',      value: balanceTotals.used,      color: '#DC2626', bg: '#FEF2F2' },
                            { label: 'Remaining', value: balanceTotals.remaining, color: PRIMARY,   bg: PRIMARY_LIGHT },
                        ].map(s => (
                            <Grid key={s.label} size={{ xs: 4 }}>
                                <Box sx={{
                                    py: 1, px: 0.5, borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    bgcolor: s.bg,
                                    textAlign: 'center',
                                }}>
                                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                                        {s.value}
                                    </Typography>
                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#6B7280', mt: 0.4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                                        {s.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Per-type cards (scrollable) */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    {balanceLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={26} sx={{ color: PRIMARY }} />
                        </Box>
                    ) : balanceTypes.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                No leave balance found
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#9CA3AF', mt: 0.4 }}>
                                Your HR admin has not allocated any leave for {academicYear} yet.
                            </Typography>
                        </Box>
                    ) : balanceTypes.map(t => {
                        const usedPct = t.allocated > 0 ? Math.min(100, Math.round((t.used / t.allocated) * 100)) : 0;
                        const isLow = t.remaining <= 1 && t.allocated > 0;
                        return (
                            <Box key={t.id} sx={{
                                p: 1.5, borderRadius: '10px',
                                border: `1px solid ${t.color}33`,
                                bgcolor: '#fff',
                                transition: 'box-shadow 0.2s',
                                '&:hover': { boxShadow: `0 2px 8px ${t.color}25` },
                            }}>
                                {/* Card header */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Box sx={{
                                        width: 34, height: 34, borderRadius: '8px',
                                        bgcolor: `${t.color}15`, border: `1.5px solid ${t.color}40`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 900, color: t.color }}>
                                            {t.shortCode}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111' }} noWrap>
                                            {t.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: 10, color: '#6B7280' }} noWrap>
                                            Academic Year · {t.academicYear}
                                        </Typography>
                                    </Box>
                                    {isLow && (
                                        <Chip size="small" label="Low"
                                            sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }} />
                                    )}
                                </Box>

                                {/* Stats row */}
                                <Box sx={{ display: 'flex', gap: 1, mb: 1.2 }}>
                                    {[
                                        { label: 'Allocated', value: t.allocated, color: '#374151' },
                                        { label: 'Used',      value: t.used,      color: '#DC2626' },
                                        { label: 'Remaining', value: t.remaining, color: t.color, big: true },
                                    ].map(s => (
                                        <Box key={s.label} sx={{
                                            flex: 1, py: 0.6, px: 0.5, borderRadius: '6px',
                                            bgcolor: s.big ? `${s.color}10` : '#F9FAFB',
                                            border: `1px solid ${s.big ? `${s.color}30` : '#E5E7EB'}`,
                                            textAlign: 'center',
                                        }}>
                                            <Typography sx={{
                                                fontSize: s.big ? 18 : 14,
                                                fontWeight: 800,
                                                color: s.color,
                                                lineHeight: 1,
                                            }}>
                                                {s.value}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 9, fontWeight: 600, color: '#6B7280',
                                                textTransform: 'uppercase', letterSpacing: 0.3, mt: 0.3,
                                            }}>
                                                {s.label}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Progress bar */}
                                <Box sx={{ mb: 0.6 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={usedPct}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: '#F3F4F6',
                                            '& .MuiLinearProgress-bar': { bgcolor: t.color, borderRadius: 3 },
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.4 }}>
                                        <Typography sx={{ fontSize: 10, color: '#6B7280' }}>
                                            {t.used} of {t.allocated} used
                                        </Typography>
                                        <Typography sx={{ fontSize: 10, color: t.color, fontWeight: 700 }}>
                                            {usedPct}%
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Footer breakdown chips */}
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    <Chip size="small" label={`This month: ${t.usedThisMonth}`}
                                        sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: '#F3F4F6', color: '#374151' }} />
                                    <Chip size="small" label={`This quarter: ${t.usedThisQuarter}`}
                                        sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: '#F3F4F6', color: '#374151' }} />
                                    <Chip size="small" label={`Half-year: ${t.usedThisHalfYear}`}
                                        sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: '#F3F4F6', color: '#374151' }} />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                {/* Drawer footer note */}
                <Box sx={{ p: 1.5, borderTop: '1px solid #E5E7EB', bgcolor: '#FAFAFA' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                        <InfoOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF', mt: 0.2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 10, color: '#6B7280', lineHeight: 1.5 }}>
                            Balances reset based on each leave type's policy cycle (monthly, quarterly, half-yearly or yearly) configured in <strong>Leave Policy Master</strong>. Pending leaves are deducted optimistically — they'll move to "Used" once approved.
                        </Typography>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}
