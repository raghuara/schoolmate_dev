import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    TextField, Switch, Autocomplete, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GavelIcon from '@mui/icons-material/Gavel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SnackBar from '../../SnackBar';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';

const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#ECFDF5';

const PAYOUT_FREQUENCIES = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

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
const NumberField = ({ label, value, onChange, suffix, helperText, min = 0 }) => (
    <Box>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>{label}</Typography>
        <TextField
            fullWidth
            size="small"
            type="number"
            value={value}
            onChange={(e) => onChange(Math.max(min, parseInt(e.target.value) || 0))}
            slotProps={{
                input: {
                    endAdornment: suffix ? (
                        <Typography sx={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap' }}>{suffix}</Typography>
                    ) : null,
                    inputProps: { min, step: 1 }
                }
            }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36 } }}
        />
        {helperText && <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.3 }}>{helperText}</Typography>}
    </Box>
);

// ════════════════════════════════════════════════════════════════════════════
export default function LeaveMasterScreen() {
    const navigate = useNavigate();
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const showSnack = (msg, success) => {
        setMessage(msg); setOpen(true); setColor(success); setStatus(success);
    };

    // ── Master state ───────────────────────────────────────────────────────
    const [config, setConfig] = useState({
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

        // Leave Allocation & Encashment
        leaveAllocationPeriod: 'Quarterly',
        daysPerPeriod: 3,
        daysPerMonth: 1,
        advanceUsageAllowed: true,
        unusedLeaveAction: 'encash',
        encashmentTiming: 'End of Period',
        encashmentFormula: 'gross_by_working_days',
        extraLeaveDeducted: true,

        // Default Working Days (0=Sun, 1=Mon ... 6=Sat)
        defaultWorkingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat by default
    });

    const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

    // ── Working Calendar State ─────────────────────────────────────────────
    const [calendarMonth, setCalendarMonth] = useState(dayjs());
    const [dayOverrides, setDayOverrides] = useState({});
    const [savedMonths, setSavedMonths] = useState({}); // { "2026-04": true, "2026-05": true }
    const [isSavingMonth, setIsSavingMonth] = useState(false);

    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const DAY_COLORS = {
        working: { bg: '#F0FDF4', color: '#16A34A', border: '#A7F3D0' },
        holiday: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
        mandatory: { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
    };

    // Allow current month + up to 12 months ahead
    const currentMonth = dayjs().startOf('month');
    const maxMonth = currentMonth.add(11, 'month');
    const canGoPrev = calendarMonth.isAfter(currentMonth, 'month');
    const canGoNext = calendarMonth.isBefore(maxMonth, 'month');
    const calendarMonthKey = calendarMonth.format('YYYY-MM');
    const isMonthSaved = !!savedMonths[calendarMonthKey];
    const isPastMonth = calendarMonth.isBefore(currentMonth, 'month');

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
        if (isPastMonth) return; // Can't edit past months
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
        // Mark month as unsaved when edited
        setSavedMonths(prev => { const n = { ...prev }; delete n[calendarMonthKey]; return n; });
    };

    const handleSaveMonth = () => {
        setIsSavingMonth(true);
        // Collect this month's overrides
        const monthOverrides = {};
        Object.entries(dayOverrides).forEach(([key, val]) => {
            if (key.startsWith(calendarMonthKey)) monthOverrides[key] = val;
        });
        // TODO: POST to API — { month: calendarMonthKey, overrides: monthOverrides, stats: calendarStats }
        console.log('Saving month:', calendarMonthKey, monthOverrides, calendarStats);
        setTimeout(() => {
            setSavedMonths(prev => ({ ...prev, [calendarMonthKey]: true }));
            showSnack(`Working calendar for ${calendarMonth.format('MMMM YYYY')} saved successfully`, true);
            setIsSavingMonth(false);
        }, 500);
    };

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
    };

    const handleSave = () => {
        // TODO: POST to API when ready
        console.log('Leave Master Config:', config);
        console.log('Day Overrides:', dayOverrides);
        showSnack('Leave policy master saved successfully', true);
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
                    <Grid container sx={{ alignItems: 'center' }}>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={() => navigate(-1)} sx={{ width: '27px', height: '27px', mt: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                            </IconButton>
                            <Box sx={{ ml: 1 }}>
                                <Typography sx={{ fontWeight: '600', fontSize: '18px' }}>Leave Policy Master</Typography>
                                <Typography sx={{ fontSize: '11px', color: '#888' }}>Configure attendance bonus, punctuality, deductions & payout rules</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                sx={{
                                    textTransform: 'none',
                                    bgcolor: PRIMARY,
                                    borderRadius: '30px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    px: 3,
                                    height: 32,
                                    '&:hover': { bgcolor: '#047857' },
                                }}
                            >
                                Save Policy
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Content */}
                <Box sx={{ px: 2, pt: '75px', pb: 4 }}>

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
                                        <NumberField
                                            label="Late Arrival Threshold"
                                            value={config.lateArrivalThresholdMinutes}
                                            onChange={(v) => update('lateArrivalThresholdMinutes', v)}
                                            suffix="minutes"
                                            helperText="Arrival after this duration is marked late"
                                        />
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

                    {/* ═══ Section 5: Leave Allocation & Encashment ═══ */}
                    <Section icon={AccountBalanceWalletIcon} title="Leave Allocation & Encashment" color="#059669"
                        subtitle="Configure how leave is allocated, pooled across periods, and what happens to unused leave">

                        {/* Allocation Period */}
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#333', mb: 1.5 }}>
                            How is leave allocated?
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                            {[
                                { key: 'Monthly', label: 'Monthly', desc: 'Resets every month' },
                                { key: 'Quarterly', label: 'Quarterly', desc: 'Pooled for 3 months' },
                                { key: 'Half-Yearly', label: 'Half-Yearly', desc: 'Pooled for 6 months' },
                                { key: 'Yearly', label: 'Yearly', desc: 'Full year upfront' },
                            ].map((opt) => {
                                const isSelected = config.leaveAllocationPeriod === opt.key;
                                return (
                                    <Box
                                        key={opt.key}
                                        onClick={() => {
                                            update('leaveAllocationPeriod', opt.key);
                                            const months = { Monthly: 1, Quarterly: 3, 'Half-Yearly': 6, Yearly: 12 };
                                            update('daysPerPeriod', config.daysPerMonth * months[opt.key]);
                                        }}
                                        sx={{
                                            px: 2,
                                            py: 1,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: `2px solid ${isSelected ? '#059669' : '#E5E7EB'}`,
                                            bgcolor: isSelected ? '#F0FDF4' : '#FAFAFA',
                                            transition: '0.2s',
                                            minWidth: 140,
                                            '&:hover': { borderColor: isSelected ? '#059669' : '#34D399' },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <Box sx={{
                                                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                                                border: `2px solid ${isSelected ? '#059669' : '#D1D5DB'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {isSelected && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#059669' }} />}
                                            </Box>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#047857' : '#333' }}>
                                                {opt.label}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '11px', color: '#777', mt: 0.3, ml: 2.8 }}>{opt.desc}</Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Days Configuration */}
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <NumberField
                                    label="Leave Days Per Month"
                                    value={config.daysPerMonth}
                                    onChange={(v) => {
                                        update('daysPerMonth', v);
                                        const months = { Monthly: 1, Quarterly: 3, 'Half-Yearly': 6, Yearly: 12 };
                                        update('daysPerPeriod', v * months[config.leaveAllocationPeriod]);
                                    }}
                                    suffix="day(s)"
                                    helperText="Base allocation per month"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <AmountField
                                    label={`Total Days Per ${config.leaveAllocationPeriod === 'Monthly' ? 'Month' : config.leaveAllocationPeriod === 'Quarterly' ? 'Quarter' : config.leaveAllocationPeriod === 'Half-Yearly' ? 'Half-Year' : 'Year'}`}
                                    value={config.daysPerPeriod}
                                    onChange={() => {}}
                                    prefix=""
                                    disabled
                                    helperText="Auto-calculated from days per month"
                                />
                            </Grid>
                        </Grid>

                        {/* Advance Usage */}
                        {config.leaveAllocationPeriod !== 'Monthly' && (
                            <Box sx={{ mb: 2.5 }}>
                                <ToggleRow
                                    label="Advance Usage Allowed"
                                    description={`Employee can use all ${config.daysPerPeriod} days from the first month of the ${config.leaveAllocationPeriod.toLowerCase()} period`}
                                    checked={config.advanceUsageAllowed}
                                    onChange={(v) => update('advanceUsageAllowed', v)}
                                />
                                {config.advanceUsageAllowed && (
                                    <Box sx={{
                                        mt: 1, ml: 2, p: 1.5, borderRadius: '6px', borderLeft: '3px solid #059669',
                                        bgcolor: '#F0FDF4',
                                    }}>
                                        <Typography sx={{ fontSize: '11px', color: '#047857', lineHeight: 1.7 }}>
                                            <strong>Example:</strong> If allocation is {config.daysPerPeriod} days per {config.leaveAllocationPeriod.toLowerCase()},
                                            the employee can take all {config.daysPerPeriod} days in the first month itself. Any leave beyond {config.daysPerPeriod} days will be treated as extra leave and salary will be deducted.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Extra Leave */}
                        

                        {/* Unused Leave Action */}
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#333', mb: 1.5 }}>
                            What happens to unused leave at the end of the period?
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                            {[
                                { key: 'encash', label: 'Encash (Credit to Salary)', desc: 'Converted to salary', color: '#059669' },
                                { key: 'carry_forward', label: 'Carry Forward', desc: 'Added to next period', color: '#2563EB' },
                                { key: 'lapse', label: 'Lapse (Expires)', desc: 'Lost at period end', color: '#DC2626' },
                            ].map((opt) => {
                                const isSelected = config.unusedLeaveAction === opt.key;
                                return (
                                    <Box
                                        key={opt.key}
                                        onClick={() => update('unusedLeaveAction', opt.key)}
                                        sx={{
                                            px: 2,
                                            py: 1,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: `2px solid ${isSelected ? opt.color : '#E5E7EB'}`,
                                            bgcolor: isSelected ? `${opt.color}0A` : '#FAFAFA',
                                            transition: '0.2s',
                                            minWidth: 180,
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
                                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: isSelected ? opt.color : '#333' }}>
                                                    {opt.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#777', mt: 0.2 }}>{opt.desc}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Encashment Timing — only if encash selected */}
                        {config.unusedLeaveAction === 'encash' && (
                            <Grid container spacing={2} sx={{ mb: 1 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>
                                        When is encashment credited?
                                    </Typography>
                                    <Autocomplete
                                        size="small"
                                        options={['End of Period', 'End of Quarter', 'End of Half-Year', 'End of Year']}
                                        value={config.encashmentTiming}
                                        onChange={(_, v) => update('encashmentTiming', v || 'End of Period')}
                                        renderInput={(params) => (
                                            <TextField {...params} placeholder="Select"
                                                sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36 } }}
                                            />
                                        )}
                                    />
                                    <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.3 }}>
                                        Unused leave amount is credited to salary at this time
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#555', mb: 0.5 }}>
                                        Encashment Calculation Formula
                                    </Typography>
                                    <Autocomplete
                                        size="small"
                                        options={[
                                            { key: 'gross_by_working_days', label: 'Gross / Working Days' },
                                            { key: 'gross_by_calendar_days', label: 'Gross / Calendar Days' },
                                            { key: 'gross_by_fixed_days', label: 'Gross / Fixed 30' },
                                        ]}
                                        getOptionLabel={(opt) => opt.label || ''}
                                        value={{ key: config.encashmentFormula, label: config.encashmentFormula === 'gross_by_working_days' ? 'Gross / Working Days' : config.encashmentFormula === 'gross_by_calendar_days' ? 'Gross / Calendar Days' : 'Gross / Fixed 30' }}
                                        onChange={(_, v) => update('encashmentFormula', v?.key || 'gross_by_working_days')}
                                        isOptionEqualToValue={(opt, val) => opt.key === val.key}
                                        renderInput={(params) => (
                                            <TextField {...params} placeholder="Select formula"
                                                sx={{ '& .MuiOutlinedInput-root': { fontSize: '13px', borderRadius: '6px', height: 36 } }}
                                            />
                                        )}
                                    />
                                    <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mt: 0.3 }}>
                                        Per-day value used to calculate encashment amount
                                    </Typography>
                                </Grid>
                            </Grid>
                        )}

                        {/* Summary */}
                        <Box sx={{
                            mt: 2.5, p: 2, borderRadius: '8px',
                            bgcolor: '#F0FDF4', border: '1px solid #A7F3D0',
                        }}>
                            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#047857', mb: 1 }}>
                                Policy Summary
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#065F46', lineHeight: 2 }}>
                                • <strong>{config.daysPerMonth} day(s)</strong> allocated per month → <strong>{config.daysPerPeriod} day(s)</strong> per <strong>{config.leaveAllocationPeriod.toLowerCase()}</strong> period
                                {config.leaveAllocationPeriod !== 'Monthly' && config.advanceUsageAllowed && (
                                    <><br />• Employee can use all <strong>{config.daysPerPeriod} days</strong> from the first month of the period</>
                                )}
                                {config.extraLeaveDeducted && (
                                    <><br />• Leave beyond <strong>{config.daysPerPeriod} days</strong> will result in <strong>salary deduction</strong></>
                                )}
                                <br />• Unused leave at period end: <strong style={{ color: config.unusedLeaveAction === 'encash' ? '#059669' : config.unusedLeaveAction === 'carry_forward' ? '#2563EB' : '#DC2626' }}>
                                    {config.unusedLeaveAction === 'encash' ? `Encashed (credited at ${config.encashmentTiming.toLowerCase()})` : config.unusedLeaveAction === 'carry_forward' ? 'Carried forward to next period' : 'Lapses (expires)'}
                                </strong>
                            </Typography>
                        </Box>
                    </Section>

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
                        <Typography sx={{ fontSize: '10px', color: '#9CA3AF', mb: 3 }}>
                            Click a day to toggle. Green = working day, grey = holiday. These defaults apply to all months unless overridden below.
                        </Typography>

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
                                    <Typography sx={{ fontSize: '10px', fontWeight: 600, color: calendarMonth.isSame(currentMonth, 'month') ? '#0891B2' : '#9CA3AF' }}>
                                        {calendarMonth.isSame(currentMonth, 'month') ? 'Current Month' : calendarMonth.isSame(currentMonth.add(1, 'month'), 'month') ? 'Next Month' : 'Upcoming'}
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

                                {/* Save status */}
                                <Typography sx={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: isMonthSaved ? '#16A34A' : '#F59E0B',
                                    bgcolor: isMonthSaved ? '#F0FDF4' : '#FFFBEB',
                                    border: `1px solid ${isMonthSaved ? '#A7F3D0' : '#FDE68A'}`,
                                    borderRadius: '12px',
                                    px: 1.5,
                                    py: 0.3,
                                    ml: 1,
                                }}>
                                    {isMonthSaved ? 'Saved' : 'Unsaved'}
                                </Typography>
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
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={isMonthSaved || isSavingMonth}
                                    onClick={handleSaveMonth}
                                    sx={{
                                        textTransform: 'none',
                                        bgcolor: '#0D9488',
                                        borderRadius: '30px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        px: 2.5,
                                        height: 30,
                                        '&:hover': { bgcolor: '#0F766E' },
                                        '&.Mui-disabled': { bgcolor: '#E0E0E0', color: '#aaa' },
                                    }}
                                >
                                    {isSavingMonth ? 'Saving...' : isMonthSaved ? 'Month Saved' : `Save ${calendarMonth.format('MMM YYYY')}`}
                                </Button>
                            </Box>
                        </Box>

                        {/* Calendar Grid */}
                        <Box sx={{ border: '1px solid #E8DDEA', borderRadius: '8px', overflow: 'hidden' }}>
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
                                                    cursor: isPastMonth ? 'default' : 'pointer',
                                                    bgcolor: dc.bg,
                                                    borderBottom: '1px solid #E8DDEA',
                                                    borderRight: cellIndex < 6 ? '1px solid #E8DDEA' : 'none',
                                                    transition: '0.15s',
                                                    userSelect: 'none',
                                                    '&:hover': isPastMonth ? {} : { filter: 'brightness(0.95)' },
                                                    '&:active': isPastMonth ? {} : { filter: 'brightness(0.88)' },
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
                                    <strong>Click any date</strong> to cycle through: <strong style={{ color: '#16A34A' }}>Working</strong> → <strong style={{ color: '#DC2626' }}>Holiday</strong> → <strong style={{ color: '#EA580C' }}>Mandatory Working Day (MWD)</strong> → Working.
                                    Days without overrides follow the default weekly pattern above. The <strong>Total Working Days ({calendarStats.working + calendarStats.mandatory})</strong> value is used in the salary deduction formula.
                                </Typography>
                            </Box>
                        </Box>
                    </Section>

                </Box>
            </Box>
        </>
    );
}
