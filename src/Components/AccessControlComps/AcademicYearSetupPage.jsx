import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Grid, Typography, IconButton, Button, Chip,
    Select, MenuItem, Divider, FormControl, CircularProgress,
    Dialog, DialogContent, DialogActions, TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SnackBar from '../SnackBar';
import { PostAcademicYearConfig, GetAcademicYearConfig } from '../../Api/Api';

const token = '123';

const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#ECFDF5';
const PRIMARY_DARK = '#047857';
const PRIMARY_BORDER = '#A7F3D0';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const endMonthFor = (startMonth) => (startMonth + 11) % 12;

export default function AcademicYearSetupPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const userType = user?.userType;
    const rollNumber = user?.rollNumber;
    const isAdmin = userType === 'superadmin' || userType === 'admin';

    const currentYear = new Date().getFullYear();
    const currentMonthIdx = new Date().getMonth();

    const [startMonth, setStartMonth] = useState(5);
    const startYear = currentYear;
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [hasLoadedStored, setHasLoadedStored] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [serverConfig, setServerConfig] = useState(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const CONFIRM_PHRASE = 'confirm';
    const isConfirmReady = confirmText === CONFIRM_PHRASE;

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackOk, setSnackOk] = useState(false);
    const [snackMsg, setSnackMsg] = useState('');
    const showSnack = (msg, ok) => { setSnackMsg(msg); setSnackOpen(true); setSnackOk(ok); };
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);

    // GET /academicyear/GetAcademicYearConfig
    // If a config already exists the server returns startMonth + isLocked:true,
    // and we lock the UI (no PUT endpoint exists — IT must change it manually).
    // If no config exists yet the server returns { error: true } and we let the
    // admin pick a start month for the first save.
    const fetchConfig = useCallback(async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(GetAcademicYearConfig, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const body = res?.data;
            if (body && !body.error) {
                if (Number.isInteger(body.startMonth)) setStartMonth(body.startMonth);
                setIsLocked(!!body.isLocked);
                setServerConfig(body);
            }
        } catch (err) {
            console.error('Failed to fetch academic year config', err);
            const msg = err?.response?.data?.message;
            // 404-style "not configured" responses are expected on first run.
            if (err?.response?.status && err.response.status !== 404) {
                showSnack(msg || 'Failed to load academic year configuration', false);
            }
        } finally {
            setIsFetching(false);
            setHasLoadedStored(true);
        }
    }, []);

    useEffect(() => { fetchConfig(); }, [fetchConfig]);

    const endMonth = useMemo(() => endMonthFor(startMonth), [startMonth]);
    // End year is +1 unless the start month is January (Jan→Dec same year).
    const endYear = startMonth === 0 ? startYear : startYear + 1;

    const startMonthLabel = MONTHS[startMonth];
    const endMonthLabel = MONTHS[endMonth];
    const startLabel = `${MONTHS[startMonth]} ${startYear}`;
    const endLabel = `${MONTHS[endMonth]} ${endYear}`;
    const academicYearTag = startMonth === 0
        ? `${startYear}`
        : `${startYear}-${endYear}`;

    const examples = useMemo(() => ([
        {
            label: 'India — most common',
            from: `Jun ${currentYear}`,
            to: `May ${currentYear + 1}`,
            startMonth: 5,
            startYear: currentYear,
            tag: `${currentYear}-${currentYear + 1}`,
        },
        {
            label: 'CBSE / financial year',
            from: `Apr ${currentYear}`,
            to: `Mar ${currentYear + 1}`,
            startMonth: 3,
            startYear: currentYear,
            tag: `${currentYear}-${currentYear + 1}`,
        },
        {
            label: 'Calendar year',
            from: `Jan ${currentYear}`,
            to: `Dec ${currentYear}`,
            startMonth: 0,
            startYear: currentYear,
            tag: `${currentYear}`,
        },
        {
            label: 'Northern hemisphere',
            from: `Sep ${currentYear}`,
            to: `Aug ${currentYear + 1}`,
            startMonth: 8,
            startYear: currentYear,
            tag: `${currentYear}-${currentYear + 1}`,
        },
    ]), [currentYear]);

    const isCurrentlyActive = useMemo(() => {
        const start = new Date(startYear, startMonth, 1);
        const end = new Date(endYear, endMonth + 1, 0, 23, 59, 59);
        const now = new Date();
        return now >= start && now <= end;
    }, [startMonth, startYear, endMonth, endYear]);

    // POST /academicyear/PostAcademicYearConfig
    // One-time only — server has no PUT endpoint, so on success we flip isLocked
    // to true and the UI becomes read-only.
    const handleSave = async () => {
        if (!isAdmin) {
            showSnack('Only admins can save the academic year window.', false);
            return;
        }
        if (isLocked) {
            showSnack('Academic year is already configured. Contact IT to change it.', false);
            return;
        }
        setIsSaving(true);
        try {
            const body = {
                createdByRollNumber: rollNumber || '',
                createdByUserType: userType || '',
                startMonth,
            };
            const res = await axios.post(PostAcademicYearConfig, body, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const payload = res?.data;
            if (payload?.error) {
                showSnack(payload?.message || 'Failed to save academic year', false);
                return;
            }
            showSnack('Academic year saved', true);
            setIsLocked(true);
            setServerConfig(payload);
            setConfirmOpen(false);
            setConfirmText('');
        } catch (err) {
            console.error('Academic year save failed', err);
            showSnack(err?.response?.data?.message || 'Failed to save academic year. Please try again.', false);
        } finally {
            setIsSaving(false);
        }
    };

    const openConfirm = () => {
        if (!isAdmin) {
            showSnack('Only admins can save the academic year window.', false);
            return;
        }
        if (isLocked) {
            showSnack('Academic year is already configured. Contact IT to change it.', false);
            return;
        }
        setConfirmText('');
        setConfirmOpen(true);
    };

    const applyExample = (ex) => {
        if (isLocked) return;
        setStartMonth(ex.startMonth);
    };

    return (
        <>
            <SnackBar open={snackOpen} color={snackOk} setOpen={setSnackOpen} status={snackOk} message={snackMsg} />

            <Box sx={{ width: '100%' }}>
                <Box sx={{
                    position: "fixed",
                    top: "60px",
                    left: isExpanded ? "260px" : "80px",
                    right: 0,
                    backgroundColor: "#f2f2f2",
                    px: 2,
                    py:1,
                    borderBottom: "1px solid #ddd",
                    zIndex: 1200,
                    transition: "left 0.3s ease-in-out",
                    overflow: 'hidden',
                }}>
                    <Grid container alignItems="center">
                        <Grid size={{ xs: 12, sm: 12, md: 12 }} sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={() => navigate(-1)} sx={{ width: 28, height: 28, mt: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                            </IconButton>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: '8px',
                                bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                mx: 1,
                            }}>
                                <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#111827', lineHeight: 1.1 }}>
                                    Academic Year Setup
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#6B7280', mt: 0.3 }}>
                                    Pick the month your academic year starts — the end month is calculated for you
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ px: 2, pb:2, pt:"70px" }}>
                    {isFetching && (
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            p: 1.2, mb: 1.5, borderRadius: '10px',
                            bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                        }}>
                            <CircularProgress size={14} thickness={5} sx={{ color: PRIMARY_DARK }} />
                            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: PRIMARY_DARK }}>
                                Loading academic year configuration…
                            </Typography>
                        </Box>
                    )}
                    {!isFetching && isLocked && (
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap',
                            p: 1.4, mb: 1.5, borderRadius: '10px',
                            bgcolor: '#FFFBEB', border: '1px solid #FDE68A',
                        }}>
                            <Box sx={{
                                width: 30, height: 30, borderRadius: '50%',
                                bgcolor: '#FEF3C7', border: '1px solid #FDE68A',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <LockOutlinedIcon sx={{ fontSize: 16, color: '#B45309' }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#92400E', lineHeight: 1.2 }}>
                                    Academic year is locked
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: '#B45309', mt: 0.2, lineHeight: 1.45 }}>
                                    Already configured by <strong>{serverConfig?.createdByUserType || '—'}</strong>
                                    {serverConfig?.createdByRollNumber ? ` (${serverConfig.createdByRollNumber})` : ''}.
                                    Contact IT to make changes.
                                </Typography>
                            </Box>
                            {serverConfig?.currentAcademicYear && (
                                <Chip
                                    label={`AY ${serverConfig.currentAcademicYear}`}
                                    size="small"
                                    sx={{
                                        height: 22, fontSize: 11, fontWeight: 800, letterSpacing: 0.3,
                                        bgcolor: PRIMARY, color: '#fff',
                                    }}
                                />
                            )}
                        </Box>
                    )}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Card sx={{
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                boxShadow: 'none',
                                bgcolor: '#fff',
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                                        Step 1
                                    </Typography>
                                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                                        Which month does your academic year begin?
                                    </Typography>
                                    <Typography sx={{ fontSize: 11.5, color: '#6B7280', mt: 0.4, mb: 2 }}>
                                        Most Indian schools start in <strong>June</strong>; CBSE / financial-year schools start in <strong>April</strong>.
                                    </Typography>

                                    <Grid container spacing={1.5}>
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    Start Month
                                                </Typography>
                                                <Chip
                                                    label={isLocked ? 'Locked by IT' : `Year auto-set · ${startYear}`}
                                                    size="small"
                                                    icon={<LockOutlinedIcon sx={{
                                                        fontSize: '11px !important',
                                                        color: `${isLocked ? '#B45309' : PRIMARY_DARK} !important`,
                                                    }} />}
                                                    sx={{
                                                        height: 20, fontSize: 9.5, fontWeight: 700,
                                                        bgcolor: isLocked ? '#FFFBEB' : PRIMARY_LIGHT,
                                                        color: isLocked ? '#92400E' : PRIMARY_DARK,
                                                        border: `1px solid ${isLocked ? '#FDE68A' : PRIMARY_BORDER}`,
                                                        '& .MuiChip-icon': { ml: '6px' },
                                                    }}
                                                />
                                            </Box>
                                            <FormControl fullWidth size="small" disabled={isLocked || isFetching}>
                                                <Select
                                                    value={startMonth}
                                                    onChange={(e) => setStartMonth(Number(e.target.value))}
                                                    sx={{
                                                        fontSize: 14, fontWeight: 600,
                                                        height: 42, borderRadius: '8px',
                                                        bgcolor: isLocked ? '#F9FAFB' : PRIMARY_LIGHT,
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: isLocked ? '#E5E7EB' : PRIMARY_BORDER },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isLocked ? '#E5E7EB' : PRIMARY },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY, borderWidth: '1.5px' },
                                                    }}
                                                >
                                                    {MONTHS.map((m, i) => (
                                                        <MenuItem key={m} value={i} sx={{ fontSize: 13, fontWeight: 600 }}>
                                                            {m}
                                                            {i === currentMonthIdx && (
                                                                <Chip
                                                                    label="Today"
                                                                    size="small"
                                                                    sx={{
                                                                        ml: 1, height: 17, fontSize: 9, fontWeight: 700,
                                                                        bgcolor: '#FFFBEB', color: '#B45309',
                                                                        border: '1px solid #FDE68A',
                                                                    }}
                                                                />
                                                            )}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Typography sx={{ fontSize: 11, color: '#6B7280', mt: 0.7, lineHeight: 1.5 }}>
                                                Only the start month is configurable. The year is set automatically from the current year and the end month is calculated as a 12-month window.
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 2.2 }} />

                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.8 }}>
                                        Step 2 · Confirm the pattern
                                    </Typography>
                                    <Box sx={{
                                        p: 2.2, borderRadius: '12px',
                                        border: `1px solid ${PRIMARY_BORDER}`,
                                        background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, #fff 70%)`,
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2, flexWrap: 'wrap' }}>
                                            <EventAvailableIcon sx={{ fontSize: 18, color: PRIMARY_DARK }} />
                                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: PRIMARY_DARK, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                Every academic year will run
                                            </Typography>
                                            <Chip
                                                label="Repeats yearly"
                                                size="small"
                                                sx={{
                                                    height: 20, fontSize: 9.5, fontWeight: 700,
                                                    bgcolor: '#fff', color: PRIMARY_DARK,
                                                    border: `1px solid ${PRIMARY_BORDER}`,
                                                }}
                                            />
                                        </Box>

                                        <Box sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5,
                                            flexWrap: 'wrap',
                                        }}>
                                            <Box sx={{
                                                px: 1.6, py: 0.8, borderRadius: '10px',
                                                bgcolor: '#fff', border: `1px solid ${PRIMARY_BORDER}`,
                                                minWidth: 140,
                                            }}>
                                                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    From
                                                </Typography>
                                                <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#111827', lineHeight: 1.1, mt: 0.3 }}>
                                                    {startMonthLabel}
                                                </Typography>
                                                <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', mt: 0.3 }}>
                                                    of every year
                                                </Typography>
                                            </Box>
                                            <ArrowForwardIcon sx={{ fontSize: 20, color: PRIMARY }} />
                                            <Box sx={{
                                                px: 1.6, py: 0.8, borderRadius: '10px',
                                                bgcolor: '#fff', border: `1px solid ${PRIMARY_BORDER}`,
                                                minWidth: 140,
                                            }}>
                                                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    To
                                                </Typography>
                                                <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#111827', lineHeight: 1.1, mt: 0.3 }}>
                                                    {endMonthLabel}
                                                </Typography>
                                                <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', mt: 0.3 }}>
                                                    {startMonth === 0 ? 'of the same year' : 'of the next year'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{
                                            mt: 1.4, p: 1.2, borderRadius: '8px',
                                            bgcolor: '#fff', border: '1px solid #E5E7EB',
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                                                <InfoOutlinedIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                                                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    Example · current cycle
                                                </Typography>
                                                {isCurrentlyActive && (
                                                    <Chip
                                                        label="Active now"
                                                        size="small"
                                                        icon={<CheckCircleIcon sx={{ fontSize: '11px !important' }} />}
                                                        sx={{
                                                            height: 18, fontSize: 9, fontWeight: 700,
                                                            bgcolor: PRIMARY_LIGHT, color: PRIMARY_DARK,
                                                            border: `1px solid ${PRIMARY_BORDER}`,
                                                            '& .MuiChip-icon': { color: 'inherit', ml: '5px' },
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
                                                    {startLabel} <Box component="span" sx={{ color: '#9CA3AF', mx: 0.4 }}>→</Box> {endLabel}
                                                </Typography>
                                                <Box sx={{
                                                    px: 1, py: 0.2, borderRadius: '50px',
                                                    bgcolor: PRIMARY, color: '#fff',
                                                }}>
                                                    <Typography sx={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.3 }}>
                                                        AY {academicYearTag}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography sx={{ fontSize: 10.5, color: '#9CA3AF', mt: 0.6, lineHeight: 1.5 }}>
                                                The next cycle will run <strong>{startMonthLabel} {startYear + 1} → {endMonthLabel} {endYear + 1}</strong>, and so on for every following year.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button
                                            onClick={openConfirm}
                                            disabled={isSaving || isFetching || !hasLoadedStored || isLocked}
                                            startIcon={isSaving
                                                ? <HistoryToggleOffIcon sx={{ fontSize: 16 }} />
                                                : isLocked
                                                    ? <LockOutlinedIcon sx={{ fontSize: 16 }} />
                                                    : <SaveOutlinedIcon sx={{ fontSize: 18 }} />}
                                            variant="contained"
                                            disableElevation
                                            sx={{
                                                textTransform: 'none', fontSize: 13, fontWeight: 700,
                                                bgcolor: PRIMARY, color: '#fff',
                                                borderRadius: '8px', px: 2.6, height: 38,
                                                boxShadow: `0 2px 6px ${PRIMARY}33`,
                                                '&:hover': { bgcolor: PRIMARY_DARK, boxShadow: `0 4px 12px ${PRIMARY}55` },
                                                '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
                                            }}
                                        >
                                            {isSaving ? 'Saving…' : isLocked ? 'Already Configured' : 'Save Academic Year'}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 5 }}>
                            <Card sx={{
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                boxShadow: 'none',
                                bgcolor: '#fff',
                                height: '100%',
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                                        Common examples
                                    </Typography>
                                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111827', mb: 0.4 }}>
                                        Not sure? Pick one of these
                                    </Typography>
                                    <Typography sx={{ fontSize: 11.5, color: '#6B7280', mb: 2 }}>
                                        {isLocked
                                            ? 'Presets are disabled — the academic year has already been configured.'
                                            : 'Click any preset to load it into the selector on the left.'}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {examples.map((ex) => {
                                            const isActive = ex.startMonth === startMonth && ex.startYear === startYear;
                                            return (
                                                <Box
                                                    key={ex.label}
                                                    onClick={() => applyExample(ex)}
                                                    sx={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        gap: 1, p: 1.3, borderRadius: '10px',
                                                        cursor: isLocked ? 'not-allowed' : 'pointer',
                                                        border: `1px solid ${isActive ? PRIMARY_BORDER : '#E5E7EB'}`,
                                                        bgcolor: isActive ? PRIMARY_LIGHT : '#fff',
                                                        opacity: isLocked && !isActive ? 0.55 : 1,
                                                        transition: 'all 0.15s',
                                                        '&:hover': isLocked ? {} : {
                                                            borderColor: PRIMARY_BORDER,
                                                            bgcolor: PRIMARY_LIGHT,
                                                            transform: 'translateY(-1px)',
                                                            boxShadow: `0 2px 6px ${PRIMARY}22`,
                                                        },
                                                    }}
                                                >
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }} noWrap>
                                                            {ex.label}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.4 }}>
                                                            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: PRIMARY_DARK }}>
                                                                {ex.from}
                                                            </Typography>
                                                            <ArrowForwardIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
                                                            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: PRIMARY_DARK }}>
                                                                {ex.to}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                        <Chip
                                                            label={ex.tag}
                                                            size="small"
                                                            sx={{
                                                                height: 22, fontSize: 10, fontWeight: 700,
                                                                bgcolor: isActive ? PRIMARY : '#F3F4F6',
                                                                color: isActive ? '#fff' : '#374151',
                                                                border: `1px solid ${isActive ? PRIMARY : '#E5E7EB'}`,
                                                            }}
                                                        />
                                                        {isActive && (
                                                            <CheckCircleIcon sx={{ fontSize: 18, color: PRIMARY }} />
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>

                                    <Box sx={{
                                        mt: 2, p: 1.2, borderRadius: '8px',
                                        bgcolor: '#FFFBEB', border: '1px solid #FDE68A',
                                        display: 'flex', alignItems: 'flex-start', gap: 0.8,
                                    }}>
                                        <InfoOutlinedIcon sx={{ fontSize: 15, color: '#B45309', mt: 0.1 }} />
                                        <Typography sx={{ fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
                                            <strong>One-time setup.</strong> You are setting the start → end <strong>month pattern</strong> that will repeat for every upcoming academic year. The year shown is only an example — the same months will be used for {currentYear + 1}, {currentYear + 2}, and so on.
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Card sx={{
                        mt: 2, border: '1px solid #E5E7EB',
                        borderRadius: '12px', boxShadow: 'none', bgcolor: '#fff',
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                                Quick pick · 12-month grid
                            </Typography>
                            <Typography sx={{ fontSize: 11.5, color: '#6B7280', mb: 1.5 }}>
                                Click any month to set it as your academic-year start. The current start month is highlighted.
                            </Typography>
                            <Grid container spacing={1}>
                                {MONTHS_SHORT.map((m, i) => {
                                    const isStart = i === startMonth;
                                    const isEnd = i === endMonth;
                                    const isCurrent = i === currentMonthIdx;
                                    return (
                                        <Grid size={{ xs: 6, sm: 4, md: 2 }} key={m}>
                                            <Box
                                                onClick={() => { if (!isLocked) setStartMonth(i); }}
                                                sx={{
                                                    py: 1, px: 1, borderRadius: '8px',
                                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                                    textAlign: 'center',
                                                    border: `1.5px solid ${isStart ? PRIMARY : isEnd ? PRIMARY_BORDER : '#E5E7EB'}`,
                                                    bgcolor: isStart ? PRIMARY : isEnd ? PRIMARY_LIGHT : '#fff',
                                                    color: isStart ? '#fff' : isEnd ? PRIMARY_DARK : '#374151',
                                                    opacity: isLocked && !isStart && !isEnd ? 0.55 : 1,
                                                    transition: 'all 0.15s',
                                                    '&:hover': isLocked ? {} : {
                                                        borderColor: PRIMARY,
                                                        transform: 'translateY(-1px)',
                                                    },
                                                }}
                                            >
                                                <Typography sx={{ fontSize: 13, fontWeight: 800, lineHeight: 1.1 }}>
                                                    {m}
                                                </Typography>
                                                <Typography sx={{
                                                    fontSize: 9, fontWeight: 700, mt: 0.3,
                                                    color: isStart ? 'rgba(255,255,255,0.85)' : isEnd ? PRIMARY_DARK : '#9CA3AF',
                                                    textTransform: 'uppercase', letterSpacing: 0.4,
                                                }}>
                                                    {isStart ? 'Start' : isEnd ? 'End' : isCurrent ? 'Today' : ' '}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Dialog
                open={confirmOpen}
                onClose={() => !isSaving && setConfirmOpen(false)}
                maxWidth="xs"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '14px',
                            border: '1px solid #FDE68A',
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <Box sx={{
                    px: 2.5, py: 1.8,
                    bgcolor: '#FFFBEB',
                    borderBottom: '1px solid #FDE68A',
                    display: 'flex', alignItems: 'center', gap: 1.2,
                }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '50%',
                        bgcolor: '#FEF3C7', border: '1px solid #FDE68A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <WarningAmberIcon sx={{ fontSize: 20, color: '#B45309' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#92400E', lineHeight: 1.1 }}>
                            Confirm academic year pattern
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#B45309', mt: 0.3 }}>
                            This is a one-time setup and cannot be reverted.
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => !isSaving && setConfirmOpen(false)}
                        disabled={isSaving}
                        sx={{ width: 28, height: 28 }}
                    >
                        <CloseIcon sx={{ fontSize: 18, color: '#92400E' }} />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: 12, color: '#374151', lineHeight: 1.6, mb: 1.5 }}>
                        You are about to set every academic year to run from <strong>{startMonthLabel}</strong> to <strong>{endMonthLabel}</strong>. This pattern will repeat for all upcoming years and <strong>cannot be reverted</strong>. If you need to change it later, please contact the IT team.
                    </Typography>

                    <Box sx={{
                        p: 1.6, borderRadius: '10px',
                        bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                        mb: 1.8,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EventAvailableIcon sx={{ fontSize: 18, color: PRIMARY_DARK }} />
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: PRIMARY_DARK, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Academic year pattern
                            </Typography>
                            <Box sx={{ flex: 1 }} />
                            <Chip
                                label="Every year"
                                size="small"
                                sx={{
                                    height: 18, fontSize: 9, fontWeight: 700,
                                    bgcolor: '#fff', color: PRIMARY_DARK,
                                    border: `1px solid ${PRIMARY_BORDER}`,
                                }}
                            />
                        </Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#111827', mt: 0.6, lineHeight: 1.2 }}>
                            {startMonthLabel} <Box component="span" sx={{ color: PRIMARY, mx: 0.4 }}>→</Box> {endMonthLabel}
                        </Typography>
                        <Box sx={{
                            mt: 1, pt: 1, borderTop: `1px dashed ${PRIMARY_BORDER}`,
                            display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap',
                        }}>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                e.g. current cycle:
                            </Typography>
                            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#374151' }}>
                                {startLabel} → {endLabel}
                            </Typography>
                            <Box sx={{
                                px: 0.9, py: 0.15, borderRadius: '50px',
                                bgcolor: PRIMARY, color: '#fff',
                            }}>
                                <Typography sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.3 }}>
                                    AY {academicYearTag}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Typography sx={{ fontSize: 11.5, color: '#374151', mb: 0.7 }}>
                        Type <Box component="span" sx={{
                            display: 'inline-block', px: 0.7, py: 0.1,
                            borderRadius: '4px', bgcolor: '#F3F4F6',
                            border: '1px solid #E5E7EB',
                            fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: '#111827',
                        }}>{CONFIRM_PHRASE}</Box> below to enable the save button.
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={`Type "${CONFIRM_PHRASE}" to confirm`}
                        disabled={isSaving}
                        slotProps={{
                            input: {
                                sx: {
                                    fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: isConfirmReady ? PRIMARY_BORDER : '#E5E7EB',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: isConfirmReady ? PRIMARY : '#D1D5DB',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: PRIMARY, borderWidth: '1.5px',
                                    },
                                    bgcolor: isConfirmReady ? PRIMARY_LIGHT : '#fff',
                                },
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 2.5, pb: 2.2, pt: 0, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        disabled={isSaving}
                        sx={{
                            textTransform: 'none', fontSize: 13, fontWeight: 700,
                            color: '#374151', borderRadius: '8px',
                            px: 2, height: 36,
                            border: '1px solid #E5E7EB',
                            '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!isConfirmReady || isSaving}
                        variant="contained"
                        disableElevation
                        startIcon={isSaving
                            ? <HistoryToggleOffIcon sx={{ fontSize: 16 }} />
                            : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: 'none', fontSize: 13, fontWeight: 700,
                            bgcolor: PRIMARY, color: '#fff',
                            borderRadius: '8px', px: 2.2, height: 36,
                            boxShadow: `0 2px 6px ${PRIMARY}33`,
                            '&:hover': { bgcolor: PRIMARY_DARK, boxShadow: `0 4px 12px ${PRIMARY}55` },
                            '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
                        }}
                    >
                        {isSaving ? 'Saving…' : 'Confirm & Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
