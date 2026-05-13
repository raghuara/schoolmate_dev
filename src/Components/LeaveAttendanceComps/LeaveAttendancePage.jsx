import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Box, Card, CardContent, Grid, Typography, IconButton, Button, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, Divider, Tabs, Tab, CircularProgress, Tooltip, Menu, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
    Stack, LinearProgress, Paper, ListItemIcon, ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SyncIcon from '@mui/icons-material/Sync';
import DevicesIcon from '@mui/icons-material/Devices';
import FaceIcon from '@mui/icons-material/Face';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import KeyIcon from '@mui/icons-material/Key';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import TodayIcon from '@mui/icons-material/Today';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import CheckIcon from '@mui/icons-material/Check';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getAttendanceDashboard } from '../../Api/Api';
import SnackBar from '../SnackBar';

import StaffAttendanceOverviewPage from './StaffAttendanceOverviewPage';
import LeaveManagementPage from './LeaveManagementPage';
import AttendanceReportsPage from './AttendanceReportsPage';
import AddStaffAttendancePage from './AddStaffAttendancePage';


const token = "123";

// ─── Theme ──────────────────────────────────────────────────────────────────
const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#ECFDF5';
const PRIMARY_DARK = '#047857';
const PRIMARY_BORDER = '#A7F3D0';

// ─── Config ─────────────────────────────────────────────────────────────────
const SCHOOL_START_HOUR = 9;      // 9:00 AM
const LATE_THRESHOLD_MIN = 15;    // > 9:15 → Late

// ─── Utils ──────────────────────────────────────────────────────────────────
const formatDateForApi = (dateObj) => {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
};

const toHHmm = (isoOrDate) => {
    if (!isoOrDate) return '';
    const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const mapRole = (role = '') => {
    const r = role.toLowerCase();
    if (r === 'teaching') return 'Teaching Staff';
    if (r === 'nonteaching') return 'Non Teaching Staff';
    return 'Supporting Staff';
};

const mapStatus = (status = '', attendance = '') => {
    const s = (status || attendance || '').toLowerCase();
    if (s === 'present') return 'Present';
    if (s === 'late') return 'Late';
    if (s === 'onleave' || s === 'on leave') return 'On Leave';
    if (s === 'absent') return 'Absent';
    return 'Absent';
};

const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const capitalize = (str = '') =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// ─── Time / duration helpers (for personal attendance ticker) ──────────────
const formatDuration = (ms) => {
    if (!Number.isFinite(ms) || ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
        h, m, s,
        hhmmss: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        short: h > 0 ? `${h}h ${m}m` : `${m}m`,
    };
};

const formatTimeOfDay = (date) => {
    if (!date) return '—';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// ─── Biometric data normalizer ──────────────────────────────────────────────
/**
 * Converts raw Hikvision ACS event JSON → unified attendance records
 * (one record per employee, with first punch = check-in, last = check-out)
 */
const normalizeBiometricData = (acsData, markedByRollNumber = '') => {
    const events = acsData?.AcsEvent?.InfoList || [];
    const grouped = {};
    events.forEach(e => {
        const id = e.employeeNoString;
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push(e);
    });

    return Object.values(grouped).map(punches => {
        punches.sort((a, b) => new Date(a.time) - new Date(b.time));
        const first = punches[0];
        const last = punches[punches.length - 1];
        const checkIn = new Date(first.time);

        const isLate =
            checkIn.getHours() > SCHOOL_START_HOUR ||
            (checkIn.getHours() === SCHOOL_START_HOUR && checkIn.getMinutes() > LATE_THRESHOLD_MIN);

        return {
            source: 'biometric',
            rollNumber: first.employeeNoString,
            employeeNoString: first.employeeNoString,
            name: first.name,
            date: formatDateForApi(checkIn),
            status: isLate ? 'late' : 'present',
            loginTime: toHHmm(first.time),
            logoutTime: last !== first ? toHHmm(last.time) : null,
            verifyMode: first.currentVerifyMode,
            deviceDoor: first.doorNo,
            deviceReader: first.cardReaderNo,
            pictureURL: first.pictureURL,
            punchCount: punches.length,
            markedBy: markedByRollNumber,
            allPunches: punches.map(p => ({
                time: p.time, serialNo: p.serialNo, verifyMode: p.currentVerifyMode, pictureURL: p.pictureURL,
            })),
        };
    });
};

// ─── Theme / Config maps ────────────────────────────────────────────────────
const USER_TYPE_CONFIG = {
    'Super Admin': { color: '#7C3AED', bg: '#EDE9FE' },
    'Admin':       { color: '#2563EB', bg: '#DBEAFE' },
    'Staff':       { color: '#0891B2', bg: '#E0F7FA' },
    'Teacher':     { color: '#16A34A', bg: '#DCFCE7' },
};

const ROLE_CONFIG = {
    'Teaching Staff':     { color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
    'Non Teaching Staff': { color: '#0E7490', bg: '#ECFEFF', border: '#A5F3FC' },
    'Supporting Staff':   { color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
};

const STATUS_STYLE = {
    Present:   { color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
    Late:      { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    'On Leave':{ color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    Absent:    { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
};

const AVATAR_PALETTE = ['#0E7490', '#6D28D9', '#C2410C', '#047857', '#1D4ED8', '#BE185D', '#A16207', '#0F766E'];
const avatarColorFor = (name = '') => {
    const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
    return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
};

const VERIFY_MODE_ICON = (mode = '') => {
    const m = mode.toLowerCase();
    if (m.includes('face')) return <FaceIcon sx={{ fontSize: 14 }} />;
    if (m.includes('fp') || m.includes('finger')) return <FingerprintIcon sx={{ fontSize: 14 }} />;
    if (m.includes('card')) return <CreditCardIcon sx={{ fontSize: 14 }} />;
    if (m.includes('pw') || m.includes('pass')) return <KeyIcon sx={{ fontSize: 14 }} />;
    return <FingerprintIcon sx={{ fontSize: 14 }} />;
};

const VERIFY_MODE_LABEL = (mode = '') => {
    const m = mode.toLowerCase();
    if (m === 'faceorfporcardorpw') return 'Multi-Factor';
    if (m.includes('face')) return 'Face';
    if (m.includes('fp') || m.includes('finger')) return 'Fingerprint';
    if (m.includes('card')) return 'Card';
    if (m.includes('pw')) return 'Password';
    return capitalize(mode);
};

export default function LeaveAttendancePage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;
    const userType = user.userType;

    const [tabValue, setTabValue] = useState(0);
    // Sub-view of the Leave Management tab — controlled by quick-nav clicks here
    const [leaveSubView, setLeaveSubView] = useState('applications');

    // Helper for dashboard navigation that jumps into Leave Management at a specific sub-view
    const goToLeaveManagement = (subView = 'applications') => {
        setLeaveSubView(subView);
        setTabValue(4);
    };

    // SnackBar
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true); setSnackColor(success); setSnackStatus(success);
    };

    // Dashboard state
    const [dashboardData, setDashboardData] = useState({
        cards: { totalPresent: 0, totalStaff: 0, totalAbsent: 0, lateArrivals: 0, onLeave: 0 },
        todaysAttendance: [],
        staffMembersCount: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    // Biometric device state
    const [deviceStatus, setDeviceStatus] = useState({
        connected: true,
        deviceName: 'Main Entrance Terminal',
        deviceIp: '192.168.1.200',
        lastSyncAt: null,
        pendingPunches: 0,
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncPreviewOpen, setSyncPreviewOpen] = useState(false);
    const [syncPreview, setSyncPreview] = useState([]);

    // Mark Attendance menu
    const [markMenuAnchor, setMarkMenuAnchor] = useState(null);

    // Today's Attendance tab filters
    const [todayAttSearch, setTodayAttSearch] = useState('');
    const [todayAttRoleFilter, setTodayAttRoleFilter] = useState('all');
    const [todayAttStatusFilter, setTodayAttStatusFilter] = useState('all');
    const [todayRoleMenuAnchor, setTodayRoleMenuAnchor] = useState(null);
    const [todayStatusMenuAnchor, setTodayStatusMenuAnchor] = useState(null);

    const clearTodayFilters = () => {
        setTodayAttSearch('');
        setTodayAttRoleFilter('all');
        setTodayAttStatusFilter('all');
    };

    // ─── Personal attendance (read-only display) ────────────────────────────
    // All punch / break / logout events are captured by the biometric device.
    // This screen ONLY visualises them — no actions are exposed to the user.
    // Dummy values below will be replaced by backend payload when wired.
    const [loginTime] = useState(() => {
        const t = new Date();
        t.setHours(9, 15, 0, 0);
        return t;
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    // Dummy completed breaks — replace with device-synced data.
    const [breaks] = useState(() => {
        const mkTime = (h, m) => {
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
        };
        return [
            { start: mkTime(11, 0),  end: mkTime(11, 15) }, // morning tea
            { start: mkTime(13, 0),  end: mkTime(13, 30) }, // lunch
        ];
    });

    // Live ticker — increments the "logged in for" counter every second.
    useEffect(() => {
        const id = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const loggedInMs = currentTime - loginTime;
    const totalBreakMs = breaks.reduce((sum, b) => sum + (b.end - b.start), 0);
    const netWorkMs = loggedInMs - totalBreakMs;

    const loggedInDur = formatDuration(loggedInMs);
    const breakDur = formatDuration(totalBreakMs);
    const netWorkDur = formatDuration(netWorkMs);

    const fetchDashboard = async (dateStr) => {
        setIsLoading(true);
        try {
            const res = await axios.get(getAttendanceDashboard, {
                params: { RollNumber: rollNumber, Date: dateStr },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data && !res.data.error) {
                setDashboardData({
                    cards:             res.data.cards            || {},
                    todaysAttendance:  res.data.todaysAttendance || [],
                    staffMembersCount: res.data.staffMembersCount || 0,
                });
            }
        } catch (error) {
            console.error('Error fetching attendance dashboard:', error);
            showSnack('Failed to load attendance data', false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard(formatDateForApi(new Date()));
    }, []);

    const handleTabChange = (_e, newValue) => setTabValue(newValue);

    // ─── Biometric Sync ────────────────────────────────────────────────────
    const handleFetchBiometric = async () => {
        setIsSyncing(true);
        try {
            // TODO: replace with real device fetch API
            // const res = await axios.get('/api/biometric/fetch', { params: { deviceIp: deviceStatus.deviceIp, date: formatDateForApi(new Date()) } });
            // const records = normalizeBiometricData(res.data, rollNumber);

            // Demo: use a mock empty shape so the preview dialog opens
            const mockAcsData = { AcsEvent: { InfoList: [] } };
            const records = normalizeBiometricData(mockAcsData, rollNumber);

            setSyncPreview(records);
            setSyncPreviewOpen(true);
            setDeviceStatus(prev => ({ ...prev, pendingPunches: records.length }));
        } catch (error) {
            console.error('Biometric fetch failed', error);
            showSnack('Failed to fetch biometric data', false);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleConfirmSync = async () => {
        try {
            // TODO: POST syncPreview to save endpoint
            // await axios.post('/api/attendance/bulkSync', { records: syncPreview, markedBy: rollNumber });
            setDeviceStatus(prev => ({ ...prev, lastSyncAt: new Date(), pendingPunches: 0 }));
            setSyncPreviewOpen(false);
            showSnack(`Synced ${syncPreview.length} biometric records successfully`, true);
            fetchDashboard(formatDateForApi(new Date()));
        } catch (error) {
            console.error('Sync save failed', error);
            showSnack('Failed to save biometric records', false);
        }
    };

    const openMarkMenu = (e) => setMarkMenuAnchor(e.currentTarget);
    const closeMarkMenu = () => setMarkMenuAnchor(null);

    const handleManualEntry = () => {
        closeMarkMenu();
        setTabValue(1);
    };

    const handleBiometricSync = () => {
        closeMarkMenu();
        handleFetchBiometric();
    };

    // ─── Dashboard render ──────────────────────────────────────────────────
    const renderDashboard = () => {
        const { cards, todaysAttendance, staffMembersCount } = dashboardData;

        const totalStaff = cards.totalStaff ?? staffMembersCount ?? 0;
        const presentCount = cards.totalPresent ?? 0;
        const attendanceRate = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0;

        const kpiCards = [
            { label: 'Present',    value: presentCount,       sub: `/${totalStaff}`, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: CheckCircleIcon },
            { label: 'Absent',     value: cards.totalAbsent  ?? 0,                   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: CancelIcon },
            { label: 'Late',       value: cards.lateArrivals ?? 0,                   color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: AccessTimeIcon },
            { label: 'On Leave',   value: cards.onLeave      ?? 0,                   color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: EventIcon },
        ];

        return (
            <Box>
                {/* ─── My Attendance Today (personal ticker + break tracking) ─── */}
                <Paper elevation={0} sx={{
                    mb: 2,
                    borderRadius: '12px',
                    border: `1px solid ${PRIMARY_BORDER}`,
                    bgcolor: '#fff',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, #fff 55%)`,
                }}>
                    <Box sx={{ p: 1.8 }}>
                        <Grid container spacing={1.5} alignItems="center">
                            {/* Left: avatar + live ticker */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Avatar sx={{
                                            width: 52, height: 52,
                                            bgcolor: '#fff',
                                            color: PRIMARY_DARK,
                                            fontWeight: 800,
                                            fontSize: '16px',
                                            border: `2px solid ${PRIMARY_BORDER}`,
                                        }}>
                                            {getInitials(user.name || 'You')}
                                        </Avatar>
                                        {/* Active status pulse dot */}
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: -2, right: -2,
                                            width: 14, height: 14, borderRadius: '50%',
                                            bgcolor: '#22C55E',
                                            border: '2px solid #fff',
                                            boxShadow: `0 0 0 4px #DCFCE7`,
                                            animation: 'pulse 1.6s infinite',
                                            '@keyframes pulse': {
                                                '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                                                '50%': { transform: 'scale(1.12)', opacity: 0.85 },
                                            },
                                        }} />
                                    </Box>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography sx={{
                                            fontSize: '10px', color: PRIMARY_DARK, fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: 0.6,
                                        }}>
                                            Logged In For
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: '26px', fontWeight: 800, color: PRIMARY_DARK,
                                            fontFamily: 'monospace', lineHeight: 1.05, letterSpacing: 1,
                                        }}>
                                            {loggedInDur.hhmmss}
                                        </Typography>
                                        <Typography sx={{ fontSize: '10.5px', color: '#4B5563', mt: 0.2 }}>
                                            Since <strong>{formatTimeOfDay(loginTime)}</strong> · Punches synced from device
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Right: mini stats (fills the space left by the action buttons) */}
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Grid container spacing={1}>
                                    {[
                                        { label: 'Login',      value: formatTimeOfDay(loginTime),                                                color: '#059669', icon: CheckCircleIcon,    bg: '#ECFDF5', border: '#A7F3D0' },
                                        { label: 'Break Time', value: breakDur.h > 0 ? `${breakDur.h}h ${breakDur.m}m` : `${breakDur.m}m`,        color: '#D97706', icon: LocalCafeIcon,      bg: '#FFFBEB', border: '#FDE68A' },
                                        { label: 'Net Hours',  value: netWorkDur.h > 0 ? `${netWorkDur.h}h ${netWorkDur.m}m` : `${netWorkDur.m}m`, color: '#4338CA', icon: TimerOutlinedIcon,  bg: '#EEF2FF', border: '#C7D2FE' },
                                    ].map((s) => {
                                        const SIcon = s.icon;
                                        return (
                                            <Grid size={4} key={s.label}>
                                                <Box sx={{
                                                    p: 1, borderRadius: '10px',
                                                    bgcolor: s.bg, border: `1px solid ${s.border}`,
                                                    display: 'flex', alignItems: 'center', gap: 0.8,
                                                }}>
                                                    <Box sx={{
                                                        width: 28, height: 28, borderRadius: '8px',
                                                        bgcolor: '#fff', border: `1px solid ${s.border}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}>
                                                        <SIcon sx={{ fontSize: 16, color: s.color }} />
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{
                                                            fontSize: '9.5px', color: s.color, fontWeight: 700,
                                                            textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 1.1,
                                                        }}>
                                                            {s.label}
                                                        </Typography>
                                                        <Typography sx={{
                                                            fontSize: '13px', fontWeight: 700, color: '#111827',
                                                            lineHeight: 1.1, mt: 0.2,
                                                        }} noWrap>
                                                            {s.value}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Grid>

                        </Grid>

                        {/* Today's breaks chips */}
                        {breaks.length > 0 && (
                            <Box sx={{ mt: 1.5, pt: 1.2, borderTop: `1px dashed ${PRIMARY_BORDER}` }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6, flexWrap: 'wrap' }}>
                                    <Typography sx={{
                                        fontSize: '10px', color: '#6B7280', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: 0.5,
                                    }}>
                                        Today's Breaks
                                    </Typography>
                                    <Chip
                                        label={`${breaks.length} · ${breakDur.h > 0 ? `${breakDur.h}h ` : ''}${breakDur.m}m total`}
                                        size="small"
                                        sx={{ height: 18, fontSize: '9.5px', fontWeight: 700, bgcolor: '#F3F4F6', color: '#374151' }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                                    {breaks.map((b, idx) => {
                                        const dur = formatDuration(b.end - b.start);
                                        return (
                                            <Chip
                                                key={idx}
                                                icon={<LocalCafeIcon sx={{ fontSize: '12px !important' }} />}
                                                label={`${formatTimeOfDay(b.start)} → ${formatTimeOfDay(b.end)} · ${dur.h > 0 ? `${dur.h}h ` : ''}${dur.m}m`}
                                                size="small"
                                                sx={{
                                                    height: 22, fontSize: '10.5px', fontWeight: 600,
                                                    bgcolor: '#FFFBEB', color: '#92400E',
                                                    border: '1px solid #FDE68A',
                                                    '& .MuiChip-icon': { color: '#D97706', ml: '6px' },
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Paper>


                <Grid container spacing={2}>
                    {/* Main Column */}
                    <Grid size={{ xs: 12, lg: 9 }}>
                        {/* KPI Cards */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            {kpiCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
                                        <Card sx={{
                                            border: `1px solid ${card.border}`,
                                            borderRadius: '12px',
                                            boxShadow: 'none',
                                            bgcolor: card.bg,
                                            height: '100%',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'transform 0.15s, box-shadow 0.15s',
                                            '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 16px ${card.color}22` },
                                        }}>
                                            <CardContent sx={{ py: 1.8, '&:last-child': { pb: 1.8 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '11px', color: card.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                            {card.label}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.2, mt: 0.5 }}>
                                                            {card.value}
                                                            {card.sub && <Typography component="span" sx={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 600 }}>{card.sub}</Typography>}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        width: 38, height: 38, borderRadius: '10px',
                                                        bgcolor: '#fff', border: `1px solid ${card.border}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Icon sx={{ color: card.color, fontSize: 20 }} />
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        {/* Today's Attendance */}
                        <Card sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: 'none', bgcolor: '#fff' }}>
                            <CardContent sx={{ pb: '12px !important' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                        <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                                            Today's Attendance
                                        </Typography>
                                        <Chip label={`${todaysAttendance.length} records`} size="small"
                                            sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 600, fontSize: '11px', height: 20 }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            size="small"
                                            placeholder="Search..."
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                            sx={{
                                                width: 180,
                                                '& .MuiOutlinedInput-root': {
                                                    height: 32, fontSize: '12px', borderRadius: '50px', bgcolor: '#F9FAFB',
                                                    '& fieldset': { borderColor: '#E5E7EB' },
                                                },
                                            }}
                                        />
                                        <Button size="small" startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                                            sx={{ textTransform: 'none', fontSize: '12px', fontWeight: 600, color: '#374151', borderRadius: '50px', border: '1px solid #E5E7EB', px: 1.5, '&:hover': { bgcolor: '#F9FAFB' } }}>
                                            Export
                                        </Button>
                                    </Box>
                                </Box>

                                {isLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                        <CircularProgress size={28} sx={{ color: PRIMARY }} />
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{
                                                    bgcolor: PRIMARY_LIGHT,
                                                    borderBottom: `1px solid ${PRIMARY_BORDER}`,
                                                }}>
                                                    {['S.No', 'Staff Member', 'Role', 'Source', 'Check-In', 'Check-Out', 'Status'].map(h => (
                                                        <TableCell key={h} sx={{
                                                            fontWeight: 700, fontSize: '10px', color: PRIMARY_DARK,
                                                            textTransform: 'uppercase', whiteSpace: 'nowrap',
                                                            letterSpacing: 0.6, py: 1.3, borderBottom: 'none',
                                                        }}>{h}</TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {todaysAttendance.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} align="center" sx={{ py: 5, color: '#9CA3AF', fontSize: '13px', borderBottom: 'none' }}>
                                                            No attendance records yet today
                                                        </TableCell>
                                                    </TableRow>
                                                ) : todaysAttendance.slice(0, 8).map((emp, idx) => {
                                                    const roleLabel = mapRole(emp.role);
                                                    const statusLabel = mapStatus(emp.status, emp.attendance);
                                                    const roleConf = ROLE_CONFIG[roleLabel] || { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };
                                                    const statConf = STATUS_STYLE[statusLabel] || STATUS_STYLE.Absent;
                                                    const isBiometric = (emp.source || '').toLowerCase() === 'biometric';
                                                    const showTime = statusLabel === 'Present' || statusLabel === 'Late';
                                                    const avColor = avatarColorFor(emp.name || '');

                                                    return (
                                                        <TableRow key={emp.rollNumber || idx} sx={{
                                                            '&:hover': { bgcolor: PRIMARY_LIGHT },
                                                            borderBottom: '1px solid #F3F4F6',
                                                            transition: 'background-color 0.15s',
                                                        }}>
                                                            <TableCell sx={{ width: 40, borderBottom: '1px solid #F3F4F6' }}>
                                                                <Typography sx={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>{idx + 1}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                                    <Avatar sx={{
                                                                        width: 32, height: 32,
                                                                        bgcolor: `${avColor}15`,
                                                                        color: avColor,
                                                                        fontSize: '11px', fontWeight: 700,
                                                                        border: `1px solid ${avColor}33`,
                                                                    }}>
                                                                        {getInitials(emp.name)}
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{emp.name}</Typography>
                                                                        <Typography sx={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500 }}>{emp.rollNumber}</Typography>
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                                <Chip label={roleLabel} size="small"
                                                                    sx={{
                                                                        bgcolor: roleConf.bg, color: roleConf.color,
                                                                        border: `1px solid ${roleConf.border}`,
                                                                        fontWeight: 600, fontSize: '10px', height: 22,
                                                                    }} />
                                                            </TableCell>
                                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                                <Tooltip title={isBiometric ? `Biometric · ${VERIFY_MODE_LABEL(emp.verifyMode || '')}` : 'Manual Entry'} arrow>
                                                                    <Chip
                                                                        size="small"
                                                                        icon={isBiometric ? VERIFY_MODE_ICON(emp.verifyMode || '') : <EditNoteIcon sx={{ fontSize: 14 }} />}
                                                                        label={isBiometric ? 'Biometric' : 'Manual'}
                                                                        sx={{
                                                                            height: 22, fontSize: '10px', fontWeight: 600,
                                                                            bgcolor: isBiometric ? '#EEF2FF' : '#F9FAFB',
                                                                            color: isBiometric ? '#4338CA' : '#4B5563',
                                                                            border: `1px solid ${isBiometric ? '#C7D2FE' : '#E5E7EB'}`,
                                                                            '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            </TableCell>
                                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                                {showTime && emp.loginTime ? (
                                                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{emp.loginTime}</Typography>
                                                                ) : <Typography sx={{ fontSize: '12px', color: '#D1D5DB' }}>—</Typography>}
                                                            </TableCell>
                                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                                {showTime && emp.logoutTime ? (
                                                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{emp.logoutTime}</Typography>
                                                                ) : <Typography sx={{ fontSize: '12px', color: '#D1D5DB' }}>—</Typography>}
                                                            </TableCell>
                                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                                <Chip label={statusLabel} size="small"
                                                                    sx={{
                                                                        bgcolor: statConf.bg, color: statConf.color,
                                                                        fontWeight: 700, fontSize: '10px', height: 22,
                                                                        border: `1px solid ${statConf.border}`,
                                                                    }} />
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}

                                {todaysAttendance.length > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                                        <Button onClick={() => setTabValue(2)}
                                            sx={{ textTransform: 'none', fontSize: '12px', fontWeight: 700, color: PRIMARY_DARK, '&:hover': { bgcolor: PRIMARY_LIGHT } }}>
                                            View All Records →
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Panel */}
                    <Grid size={{ xs: 12, lg: 3 }}>
                        {/* Attendance Rate */}
                      
                        {/* Leave Center quick links */}
                        <Card sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: 'none', bgcolor: '#fff' }}>
                            <CardContent sx={{ pb: '12px !important' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                                    <Box sx={{
                                        width: 28, height: 28, borderRadius: '8px',
                                        bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <EventIcon sx={{ color: PRIMARY, fontSize: 16 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                                        Leave Center
                                    </Typography>
                                </Box>

                                {/* Apply Leave row */}
                                <Box sx={{
                                    p: 1.2, borderRadius: '10px',
                                    bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                                    mb: 1,
                                }}>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: PRIMARY_DARK, mb: 0.2 }}>
                                        Apply for Leave
                                    </Typography>
                                    <Typography sx={{ fontSize: '10.5px', color: '#4B5563', mb: 1 }}>
                                        Submit a new leave request with dates and reason.
                                    </Typography>
                                    <Button fullWidth variant="contained"
                                        onClick={() => goToLeaveManagement('apply')}
                                        sx={{
                                            textTransform: 'none', fontSize: '12px', fontWeight: 700,
                                            bgcolor: PRIMARY, color: '#fff', borderRadius: '8px',
                                            boxShadow: `0 2px 6px ${PRIMARY}33`,
                                            '&:hover': { bgcolor: PRIMARY_DARK, boxShadow: `0 4px 12px ${PRIMARY}55` },
                                        }}>
                                        Go to Apply Leave
                                    </Button>
                                </Box>

                            </CardContent>
                        </Card>

                        {/* ─── Quick Navigation card ─── */}
                        <Card sx={{ mt: 2, border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: 'none', bgcolor: '#fff' }}>
                            <CardContent sx={{ pb: '12px !important' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                                    <Box sx={{
                                        width: 28, height: 28, borderRadius: '8px',
                                        bgcolor: '#EEF2FF', border: '1px solid #C7D2FE',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <SpaceDashboardOutlinedIcon sx={{ color: '#4338CA', fontSize: 16 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                                        Quick Navigation
                                    </Typography>
                                </Box>

                                <Stack spacing={0.8}>
                                    {[
                                        { label: "Today's Attendance", desc: 'Logins of all staff today',  icon: TodayIcon,                  color: '#0891B2', bg: '#E0F7FA', border: '#A5F3FC', target: 2 },
                                        { label: 'Overview',            desc: 'Monthly attendance trends', icon: VisibilityOutlinedIcon,    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', target: 3 },
                                        { label: 'Leave Management',    desc: 'View your leave history',   icon: ListAltOutlinedIcon,       color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', target: 4, subView: 'applications' },
                                        ...(userType === 'superadmin' || userType === 'admin' ? [
                                            { label: 'Leave Approval',  desc: 'Approve pending requests',  icon: FactCheckOutlinedIcon,     color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', target: 4, subView: 'approval' },
                                        ] : []),
                                        { label: 'Reports',             desc: 'Attendance & leave reports',icon: InsertChartOutlinedIcon,   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', target: 5 },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Box
                                                key={item.label}
                                                onClick={() => {
                                                    if (item.subView) setLeaveSubView(item.subView);
                                                    setTabValue(item.target);
                                                }}
                                                sx={{
                                                    p: 1, borderRadius: '10px',
                                                    border: '1px solid #E5E7EB',
                                                    bgcolor: '#fff',
                                                    display: 'flex', alignItems: 'center', gap: 1,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                    '&:hover': {
                                                        bgcolor: item.bg,
                                                        borderColor: item.border,
                                                        transform: 'translateX(2px)',
                                                        '& .arrowIcon': { opacity: 1, transform: 'translateX(2px)' },
                                                    },
                                                }}
                                            >
                                                <Box sx={{
                                                    width: 30, height: 30, borderRadius: '8px',
                                                    bgcolor: item.bg, border: `1px solid ${item.border}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}>
                                                    <Icon sx={{ color: item.color, fontSize: 16 }} />
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
                                                        {item.label}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#6B7280', mt: 0.2 }} noWrap>
                                                        {item.desc}
                                                    </Typography>
                                                </Box>
                                                <ArrowForwardIcon className="arrowIcon" sx={{
                                                    fontSize: 14, color: item.color,
                                                    opacity: 0, transition: 'all 0.2s',
                                                }} />
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // ─── Today's Attendance (full-page view of all staff today) ───────────
    const renderTodaysAttendance = () => {
        const { todaysAttendance } = dashboardData;

        // Helper: compute worked hours from HH:mm strings
        const computeWorkedHours = (loginStr, logoutStr) => {
            if (!loginStr || !logoutStr) return null;
            const [lh, lm] = loginStr.split(':').map(Number);
            const [oh, om] = logoutStr.split(':').map(Number);
            if (Number.isNaN(lh) || Number.isNaN(oh)) return null;
            let mins = (oh * 60 + om) - (lh * 60 + lm);
            if (mins < 0) mins += 24 * 60;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return h > 0 ? `${h}h ${m}m` : `${m}m`;
        };

        // Filter
        const q = todayAttSearch.trim().toLowerCase();
        const filtered = todaysAttendance.filter((emp) => {
            const roleLabel = mapRole(emp.role);
            const statusLabel = mapStatus(emp.status, emp.attendance);
            const matchesSearch = !q
                || (emp.name || '').toLowerCase().includes(q)
                || String(emp.rollNumber || '').toLowerCase().includes(q);
            const matchesRole = todayAttRoleFilter === 'all' || roleLabel === todayAttRoleFilter;
            const matchesStatus = todayAttStatusFilter === 'all' || statusLabel === todayAttStatusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });

        // Stats over filtered set
        const stats = {
            total:   filtered.length,
            present: filtered.filter(e => mapStatus(e.status, e.attendance) === 'Present').length,
            late:    filtered.filter(e => mapStatus(e.status, e.attendance) === 'Late').length,
            onLeave: filtered.filter(e => mapStatus(e.status, e.attendance) === 'On Leave').length,
            absent:  filtered.filter(e => mapStatus(e.status, e.attendance) === 'Absent').length,
        };

        return (
            <Box>
                {/* Header strip */}
                <Paper elevation={0} sx={{
                    p: 1.8, mb: 2, borderRadius: '12px',
                    border: `1px solid ${PRIMARY_BORDER}`,
                    background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, #fff 60%)`,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 42, height: 42, borderRadius: '10px',
                                bgcolor: '#fff', border: `1px solid ${PRIMARY_BORDER}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <TodayIcon sx={{ color: PRIMARY, fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                                    Today's Staff Attendance
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#4B5563', mt: 0.2 }}>
                                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                    {' · '}
                                    Login times for each staff member
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            size="small"
                            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: 'none', fontSize: '12px', fontWeight: 700,
                                color: PRIMARY_DARK, bgcolor: '#fff',
                                border: `1px solid ${PRIMARY_BORDER}`, borderRadius: '8px',
                                px: 1.5, height: 32,
                                '&:hover': { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY },
                            }}
                        >
                            Export
                        </Button>
                    </Box>

                    {/* Summary chips */}
                    <Box sx={{ display: 'flex', gap: 0.8, mt: 1.5, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Total',    value: stats.total,    color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' },
                            { label: 'Present',  value: stats.present,  color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
                            { label: 'Late',     value: stats.late,     color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
                            { label: 'On Leave', value: stats.onLeave,  color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
                            { label: 'Absent',   value: stats.absent,   color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
                        ].map(s => (
                            <Chip
                                key={s.label}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                                        <Typography sx={{ fontSize: '10px', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.label}</Typography>
                                        <Typography sx={{ fontSize: '13px', color: s.color, fontWeight: 800 }}>{s.value}</Typography>
                                    </Box>
                                }
                                sx={{
                                    bgcolor: s.bg, border: `1px solid ${s.border}`,
                                    height: 26, px: 0.6, borderRadius: '8px',
                                    '& .MuiChip-label': { px: 0.6 },
                                }}
                            />
                        ))}
                    </Box>
                </Paper>

                {/* Filters toolbar — search + dropdowns + active filter indicators */}
                {(() => {
                    // Per-role / per-status counts (computed over unfiltered set so dropdowns are honest)
                    const roleCounts = todaysAttendance.reduce((acc, e) => {
                        const r = mapRole(e.role); acc[r] = (acc[r] || 0) + 1; return acc;
                    }, {});
                    const statusCounts = todaysAttendance.reduce((acc, e) => {
                        const s = mapStatus(e.status, e.attendance); acc[s] = (acc[s] || 0) + 1; return acc;
                    }, {});

                    const roleItems = [
                        { key: 'all',                  label: 'All Roles',          color: '#6B7280' },
                        { key: 'Teaching Staff',       label: 'Teaching Staff',     color: '#6D28D9' },
                        { key: 'Non Teaching Staff',   label: 'Non Teaching Staff', color: '#0E7490' },
                        { key: 'Supporting Staff',     label: 'Supporting Staff',   color: '#C2410C' },
                    ];
                    const statusItems = [
                        { key: 'all',       label: 'All Status', color: '#6B7280' },
                        { key: 'Present',   label: 'Present',    color: STATUS_STYLE.Present.color },
                        { key: 'Late',      label: 'Late',       color: STATUS_STYLE.Late.color },
                        { key: 'On Leave',  label: 'On Leave',   color: STATUS_STYLE['On Leave'].color },
                        { key: 'Absent',    label: 'Absent',     color: STATUS_STYLE.Absent.color },
                    ];

                    const roleActive = todayAttRoleFilter !== 'all';
                    const statusActive = todayAttStatusFilter !== 'all';
                    const searchActive = todayAttSearch.trim().length > 0;
                    const anyActive = roleActive || statusActive || searchActive;

                    const activeRoleColor = roleItems.find(r => r.key === todayAttRoleFilter)?.color || '#6B7280';
                    const activeStatusColor = statusItems.find(s => s.key === todayAttStatusFilter)?.color || '#6B7280';

                    const filterButtonSx = (isActive, accent) => ({
                        textTransform: 'none', fontSize: '12.5px', fontWeight: 600,
                        height: 34, borderRadius: '8px', px: 1.5, gap: 0.4,
                        color: isActive ? '#fff' : '#374151',
                        bgcolor: isActive ? accent : '#fff',
                        border: `1px solid ${isActive ? accent : '#E5E7EB'}`,
                        boxShadow: isActive ? `0 1px 3px ${accent}33` : 'none',
                        '&:hover': {
                            bgcolor: isActive ? accent : '#F9FAFB',
                            borderColor: isActive ? accent : '#D1D5DB',
                            filter: isActive ? 'brightness(0.95)' : 'none',
                        },
                    });

                    const renderFilterMenu = (anchor, setAnchor, items, currentKey, onPick, getCount, totalCount) => (
                        <Menu
                            anchorEl={anchor}
                            open={Boolean(anchor)}
                            onClose={() => setAnchor(null)}
                            slotProps={{
                                paper: {
                                    sx: {
                                        mt: 0.6, borderRadius: '10px',
                                        border: '1px solid #E5E7EB',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                        minWidth: 220,
                                    },
                                },
                            }}
                        >
                            {items.map((opt) => {
                                const isActive = currentKey === opt.key;
                                const count = opt.key === 'all' ? totalCount : (getCount[opt.key] || 0);
                                return (
                                    <MenuItem
                                        key={opt.key}
                                        onClick={() => { onPick(opt.key); setAnchor(null); }}
                                        sx={{
                                            py: 0.8, px: 1.2, gap: 1,
                                            bgcolor: isActive ? `${opt.color}10` : 'transparent',
                                            '&:hover': { bgcolor: `${opt.color}15` },
                                        }}
                                    >
                                        <CircleIcon sx={{ fontSize: 9, color: opt.color, flexShrink: 0 }} />
                                        <Typography sx={{
                                            fontSize: '13px', fontWeight: isActive ? 700 : 500,
                                            color: isActive ? opt.color : '#374151', flex: 1,
                                        }}>
                                            {opt.label}
                                        </Typography>
                                        <Box sx={{
                                            px: 0.7, py: 0.1, borderRadius: '6px',
                                            bgcolor: isActive ? '#fff' : '#F3F4F6',
                                            border: `1px solid ${isActive ? `${opt.color}30` : '#E5E7EB'}`,
                                        }}>
                                            <Typography sx={{ fontSize: '10.5px', fontWeight: 700, color: isActive ? opt.color : '#6B7280' }}>
                                                {count}
                                            </Typography>
                                        </Box>
                                        {isActive && <CheckIcon sx={{ fontSize: 15, color: opt.color, ml: 0.4 }} />}
                                    </MenuItem>
                                );
                            })}
                        </Menu>
                    );

                    return (
                        <Card sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: 'none', bgcolor: '#fff', mb: 2 }}>
                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {/* Search */}
                                    <TextField
                                        size="small"
                                        placeholder="Search by name or roll no..."
                                        value={todayAttSearch}
                                        onChange={(e) => setTodayAttSearch(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ fontSize: 16, color: searchActive ? PRIMARY : '#9CA3AF' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: searchActive ? (
                                                    <InputAdornment position="end">
                                                        <IconButton size="small" onClick={() => setTodayAttSearch('')} sx={{ p: 0.3 }}>
                                                            <CloseIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ) : null,
                                            },
                                        }}
                                        sx={{
                                            flex: 1, minWidth: 220, maxWidth: 320,
                                            '& .MuiOutlinedInput-root': {
                                                height: 34, fontSize: '12.5px', borderRadius: '8px',
                                                bgcolor: searchActive ? PRIMARY_LIGHT : '#F9FAFB',
                                                '& fieldset': { borderColor: searchActive ? PRIMARY_BORDER : '#E5E7EB' },
                                                '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                '&.Mui-focused fieldset': { borderColor: PRIMARY },
                                            },
                                        }}
                                    />

                                    {/* Vertical divider */}
                                    <Box sx={{ width: '1px', height: 24, bgcolor: '#E5E7EB' }} />

                                    {/* Role filter button */}
                                    <Button
                                        onClick={(e) => setTodayRoleMenuAnchor(e.currentTarget)}
                                        startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 16 }} />}
                                        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                                        sx={filterButtonSx(roleActive, activeRoleColor)}
                                    >
                                        {roleActive ? todayAttRoleFilter : 'Role'}
                                    </Button>
                                    {renderFilterMenu(
                                        todayRoleMenuAnchor, setTodayRoleMenuAnchor,
                                        roleItems, todayAttRoleFilter, setTodayAttRoleFilter,
                                        roleCounts, todaysAttendance.length,
                                    )}

                                    {/* Status filter button */}
                                    <Button
                                        onClick={(e) => setTodayStatusMenuAnchor(e.currentTarget)}
                                        startIcon={<CircleIcon sx={{ fontSize: 10, color: statusActive ? '#fff' : activeStatusColor }} />}
                                        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                                        sx={filterButtonSx(statusActive, activeStatusColor)}
                                    >
                                        {statusActive ? todayAttStatusFilter : 'Status'}
                                    </Button>
                                    {renderFilterMenu(
                                        todayStatusMenuAnchor, setTodayStatusMenuAnchor,
                                        statusItems, todayAttStatusFilter, setTodayAttStatusFilter,
                                        statusCounts, todaysAttendance.length,
                                    )}

                                    {/* Clear filters — only when something is active */}
                                    {anyActive && (
                                        <Button
                                            size="small"
                                            startIcon={<RestartAltIcon sx={{ fontSize: 15 }} />}
                                            onClick={clearTodayFilters}
                                            sx={{
                                                textTransform: 'none', fontSize: '12px', fontWeight: 600,
                                                height: 34, borderRadius: '8px', px: 1.2,
                                                color: '#DC2626',
                                                '&:hover': { bgcolor: '#FEF2F2' },
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}

                                    {/* Result count — pushed to the right */}
                                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                        <Typography sx={{ fontSize: '11.5px', color: '#6B7280' }}>
                                            Showing
                                        </Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 800, color: anyActive ? PRIMARY_DARK : '#111827' }}>
                                            {filtered.length}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11.5px', color: '#6B7280' }}>
                                            of {todaysAttendance.length} records
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Active filter pills row — only when active */}
                                {anyActive && (
                                    <Box sx={{
                                        mt: 1.2, pt: 1.2, borderTop: '1px dashed #E5E7EB',
                                        display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap',
                                    }}>
                                        <Typography sx={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Active filters:
                                        </Typography>
                                        {searchActive && (
                                            <Chip
                                                size="small"
                                                icon={<SearchIcon sx={{ fontSize: '12px !important' }} />}
                                                label={`"${todayAttSearch}"`}
                                                onDelete={() => setTodayAttSearch('')}
                                                deleteIcon={<CloseIcon sx={{ fontSize: '13px !important' }} />}
                                                sx={{
                                                    height: 22, fontSize: '11px', fontWeight: 600,
                                                    bgcolor: PRIMARY_LIGHT, color: PRIMARY_DARK,
                                                    border: `1px solid ${PRIMARY_BORDER}`,
                                                    '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
                                                    '& .MuiChip-deleteIcon': { color: 'inherit', '&:hover': { color: PRIMARY_DARK } },
                                                }}
                                            />
                                        )}
                                        {roleActive && (
                                            <Chip
                                                size="small"
                                                icon={<PeopleAltOutlinedIcon sx={{ fontSize: '12px !important' }} />}
                                                label={`Role: ${todayAttRoleFilter}`}
                                                onDelete={() => setTodayAttRoleFilter('all')}
                                                deleteIcon={<CloseIcon sx={{ fontSize: '13px !important' }} />}
                                                sx={{
                                                    height: 22, fontSize: '11px', fontWeight: 600,
                                                    bgcolor: `${activeRoleColor}15`, color: activeRoleColor,
                                                    border: `1px solid ${activeRoleColor}40`,
                                                    '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
                                                    '& .MuiChip-deleteIcon': { color: 'inherit' },
                                                }}
                                            />
                                        )}
                                        {statusActive && (
                                            <Chip
                                                size="small"
                                                icon={<CircleIcon sx={{ fontSize: '9px !important' }} />}
                                                label={`Status: ${todayAttStatusFilter}`}
                                                onDelete={() => setTodayAttStatusFilter('all')}
                                                deleteIcon={<CloseIcon sx={{ fontSize: '13px !important' }} />}
                                                sx={{
                                                    height: 22, fontSize: '11px', fontWeight: 600,
                                                    bgcolor: `${activeStatusColor}15`, color: activeStatusColor,
                                                    border: `1px solid ${activeStatusColor}40`,
                                                    '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
                                                    '& .MuiChip-deleteIcon': { color: 'inherit' },
                                                }}
                                            />
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    );
                })()}

                {/* Table */}
                <Card sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: 'none', bgcolor: '#fff' }}>
                    <CardContent sx={{ pb: '12px !important' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress size={32} sx={{ color: PRIMARY }} />
                            </Box>
                        ) : filtered.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600 }}>
                                    No attendance records match your filters.
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#9CA3AF', mt: 0.5 }}>
                                    Try changing or clearing your filters above.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: PRIMARY_LIGHT, borderBottom: `1px solid ${PRIMARY_BORDER}` }}>
                                            {['S.No', 'Staff Member', 'Role', 'Source', 'Login Time', 'Logout Time', 'Hours', 'Status'].map(h => (
                                                <TableCell key={h} sx={{
                                                    fontWeight: 700, fontSize: '10px', color: PRIMARY_DARK,
                                                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                                                    letterSpacing: 0.6, py: 1.3, borderBottom: 'none',
                                                }}>{h}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filtered.map((emp, idx) => {
                                            const roleLabel = mapRole(emp.role);
                                            const statusLabel = mapStatus(emp.status, emp.attendance);
                                            const roleConf = ROLE_CONFIG[roleLabel] || { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };
                                            const statConf = STATUS_STYLE[statusLabel] || STATUS_STYLE.Absent;
                                            const isBiometric = (emp.source || '').toLowerCase() === 'biometric';
                                            const showTime = statusLabel === 'Present' || statusLabel === 'Late';
                                            const worked = showTime ? computeWorkedHours(emp.loginTime, emp.logoutTime) : null;
                                            const avColor = avatarColorFor(emp.name || '');

                                            return (
                                                <TableRow key={emp.rollNumber || idx} sx={{
                                                    '&:hover': { bgcolor: PRIMARY_LIGHT },
                                                    borderBottom: '1px solid #F3F4F6',
                                                    transition: 'background-color 0.15s',
                                                }}>
                                                    <TableCell sx={{ width: 50, borderBottom: '1px solid #F3F4F6' }}>
                                                        <Typography sx={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>{idx + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                            <Avatar sx={{
                                                                width: 34, height: 34,
                                                                bgcolor: `${avColor}15`, color: avColor,
                                                                fontSize: '11px', fontWeight: 700,
                                                                border: `1px solid ${avColor}33`,
                                                            }}>
                                                                {getInitials(emp.name)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{emp.name}</Typography>
                                                                <Typography sx={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, fontFamily: 'monospace' }}>
                                                                    {emp.rollNumber}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                        <Chip label={roleLabel} size="small"
                                                            sx={{
                                                                bgcolor: roleConf.bg, color: roleConf.color,
                                                                border: `1px solid ${roleConf.border}`,
                                                                fontWeight: 600, fontSize: '10px', height: 22,
                                                            }} />
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                        <Tooltip title={isBiometric ? `Biometric · ${VERIFY_MODE_LABEL(emp.verifyMode || '')}` : 'Manual Entry'} arrow>
                                                            <Chip
                                                                size="small"
                                                                icon={isBiometric ? VERIFY_MODE_ICON(emp.verifyMode || '') : <EditNoteIcon sx={{ fontSize: 14 }} />}
                                                                label={isBiometric ? 'Biometric' : 'Manual'}
                                                                sx={{
                                                                    height: 22, fontSize: '10px', fontWeight: 600,
                                                                    bgcolor: isBiometric ? '#EEF2FF' : '#F9FAFB',
                                                                    color: isBiometric ? '#4338CA' : '#4B5563',
                                                                    border: `1px solid ${isBiometric ? '#C7D2FE' : '#E5E7EB'}`,
                                                                    '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                        {showTime && emp.loginTime ? (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                                                <AccessTimeIcon sx={{ fontSize: 13, color: '#059669' }} />
                                                                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>
                                                                    {emp.loginTime}
                                                                </Typography>
                                                            </Box>
                                                        ) : <Typography sx={{ fontSize: '12px', color: '#D1D5DB' }}>—</Typography>}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                        {showTime && emp.logoutTime ? (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                                                <AccessTimeIcon sx={{ fontSize: 13, color: '#DC2626' }} />
                                                                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>
                                                                    {emp.logoutTime}
                                                                </Typography>
                                                            </Box>
                                                        ) : showTime ? (
                                                            <Chip label="Active" size="small"
                                                                sx={{
                                                                    height: 20, fontSize: '10px', fontWeight: 700,
                                                                    bgcolor: '#ECFDF5', color: '#047857',
                                                                    border: '1px solid #A7F3D0',
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography sx={{ fontSize: '12px', color: '#D1D5DB' }}>—</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                        {worked ? (
                                                            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#4338CA', fontFamily: 'monospace' }}>
                                                                {worked}
                                                            </Typography>
                                                        ) : (
                                                            <Typography sx={{ fontSize: '12px', color: '#D1D5DB' }}>—</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                        <Chip label={statusLabel} size="small"
                                                            sx={{
                                                                bgcolor: statConf.bg, color: statConf.color,
                                                                fontWeight: 700, fontSize: '10px', height: 22,
                                                                border: `1px solid ${statConf.border}`,
                                                            }} />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const renderTabContent = () => {
        if (userType === "teacher") {
            // Teachers see Leave Management (with Apply Leave sub-tab inside)
            return <LeaveManagementPage
                isEmbedded={true}
                initialSubView={leaveSubView}
                onSubViewChange={setLeaveSubView}
            />;
        }

        // Staff and admin now share the same tab layout —
        // Apply Leave and Leave Approval are rendered inside Leave Management.
        switch (tabValue) {
            case 0: return renderDashboard();
            case 1: return <AddStaffAttendancePage />;
            case 2: return renderTodaysAttendance();
            case 3: return <StaffAttendanceOverviewPage isEmbedded={true} />;
            case 4: return <LeaveManagementPage
                isEmbedded={true}
                initialSubView={leaveSubView}
                onSubViewChange={setLeaveSubView}
            />;
            case 5: return <AttendanceReportsPage isEmbedded={true} />;
            default: return renderDashboard();
        }
    };

    // ─── Biometric Sync Preview Dialog ─────────────────────────────────────
    const renderSyncPreviewDialog = () => (
        <Dialog open={syncPreviewOpen} onClose={() => setSyncPreviewOpen(false)} maxWidth="md" fullWidth
            slotProps={{ paper: { sx: { borderRadius: '14px' } } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Avatar sx={{ bgcolor: '#EEF2FF', width: 36, height: 36 }}>
                        <FingerprintIcon sx={{ color: '#4F46E5' }} />
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                            Biometric Sync Preview
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                            Review records fetched from {deviceStatus.deviceName} before saving
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={() => setSyncPreviewOpen(false)} size="small">
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 0 }}>
                {syncPreview.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>
                            No punches received from device yet.
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#9CA3AF', mt: 0.5 }}>
                            (Once the device endpoint is wired up, records will appear here.)
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer sx={{ maxHeight: 420 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {['Employee', 'Verify Mode', 'Check-In', 'Check-Out', 'Punches', 'Status'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, bgcolor: '#F9FAFB' }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {syncPreview.map((r) => {
                                    const statusLabel = capitalize(r.status);
                                    const statConf = STATUS_STYLE[statusLabel] || STATUS_STYLE.Present;
                                    return (
                                        <TableRow key={r.rollNumber}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 30, height: 30, bgcolor: '#4F46E5', fontSize: '11px', fontWeight: 700 }}>
                                                        {getInitials(r.name)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{r.name}</Typography>
                                                        <Typography sx={{ fontSize: '10px', color: '#9CA3AF' }}>Emp #{r.employeeNoString}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    icon={VERIFY_MODE_ICON(r.verifyMode)}
                                                    label={VERIFY_MODE_LABEL(r.verifyMode)}
                                                    sx={{ height: 22, fontSize: '10px', fontWeight: 700, bgcolor: '#EEF2FF', color: '#4F46E5', '& .MuiChip-icon': { color: 'inherit' } }}
                                                />
                                            </TableCell>
                                            <TableCell><Typography sx={{ fontSize: '12px', fontWeight: 600 }}>{r.loginTime}</Typography></TableCell>
                                            <TableCell><Typography sx={{ fontSize: '12px', fontWeight: 600 }}>{r.logoutTime || '—'}</Typography></TableCell>
                                            <TableCell><Typography sx={{ fontSize: '12px', color: '#6B7280' }}>{r.punchCount}</Typography></TableCell>
                                            <TableCell>
                                                <Chip label={statusLabel} size="small"
                                                    sx={{ bgcolor: statConf.bg, color: statConf.color, fontWeight: 700, fontSize: '10px', height: 22, border: `1px solid ${statConf.border}` }} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setSyncPreviewOpen(false)}
                    sx={{ textTransform: 'none', fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleConfirmSync} disabled={syncPreview.length === 0}
                    sx={{
                        textTransform: 'none', fontSize: '13px', fontWeight: 700,
                        bgcolor: PRIMARY, borderRadius: '8px', boxShadow: `0 2px 6px ${PRIMARY}33`,
                        '&:hover': { bgcolor: PRIMARY_DARK, boxShadow: `0 4px 12px ${PRIMARY}55` },
                    }}>
                    Save {syncPreview.length} Records
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <>
            <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />
            <Box sx={{
                border: '1px solid #E5E7EB',
                borderRadius: '20px',
                p: 2,
                height: '86vh',
                overflow: 'hidden',
                bgcolor: '#F9FAFB',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <Box sx={{ flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                                <ArrowBackIcon sx={{ fontSize: 18, color: '#000' }} />
                            </IconButton>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '10px',
                                bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <EventIcon sx={{ color: PRIMARY, fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
                                    Leave & Attendance
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
                                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                </Typography>
                            </Box>
                        </Box>
                        {userType !== "teacher" && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    onClick={openMarkMenu}
                                    startIcon={<AddIcon />}
                                    endIcon={<KeyboardArrowDownIcon />}
                                    variant="contained"
                                    sx={{
                                        textTransform: 'none', borderRadius: '50px',
                                        bgcolor: PRIMARY, color: '#fff',
                                        fontSize: '13px', fontWeight: 700, px: 2.5,
                                        boxShadow: `0 2px 6px ${PRIMARY}33`,
                                        '&:hover': { bgcolor: PRIMARY_DARK, boxShadow: `0 4px 12px ${PRIMARY}55` },
                                    }}
                                >
                                    Mark Attendance
                                </Button>
                                <Menu
                                    anchorEl={markMenuAnchor}
                                    open={Boolean(markMenuAnchor)}
                                    onClose={closeMarkMenu}
                                    slotProps={{ paper: { sx: { borderRadius: '10px', border: '1px solid #E5E7EB', minWidth: 220, mt: 0.5, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } } }}
                                >
                                    <MenuItem onClick={handleManualEntry} sx={{ fontSize: '13px', py: 1 }}>
                                        <ListItemIcon><EditNoteIcon sx={{ color: '#374151' }} /></ListItemIcon>
                                        <ListItemText
                                            primary={<Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Manual Entry</Typography>}
                                            secondary={<Typography sx={{ fontSize: '10px', color: '#6B7280' }}>Mark attendance by hand</Typography>}
                                        />
                                    </MenuItem>
                                    <Divider sx={{ my: 0.5 }} />
                                    <MenuItem onClick={handleBiometricSync} sx={{ fontSize: '13px', py: 1 }}>
                                        <ListItemIcon><FingerprintIcon sx={{ color: '#4F46E5' }} /></ListItemIcon>
                                        <ListItemText
                                            primary={<Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Biometric Sync</Typography>}
                                            secondary={<Typography sx={{ fontSize: '10px', color: '#6B7280' }}>Pull punches from device</Typography>}
                                        />
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ mb: 1.2 }} />

                    {userType !== "teacher" && (
                        <Box sx={{ borderBottom: '1px solid #E5E7EB', mb: 1.5 }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    minHeight: 44,
                                    '& .MuiTab-root': {
                                        textTransform: 'none', fontSize: '13px',
                                        fontWeight: 600, color: '#6B7280',
                                        minHeight: 44, px: 2, py: 1,
                                        gap: 0.6,
                                        '& .MuiSvgIcon-root': { fontSize: 18 },
                                    },
                                    '& .Mui-selected': { color: `${PRIMARY_DARK} !important` },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: PRIMARY, height: 2.5,
                                        borderRadius: '2px 2px 0 0',
                                    },
                                }}
                            >
                                <Tab icon={<SpaceDashboardOutlinedIcon />} iconPosition="start" label="Dashboard" />
                                <Tab icon={<HowToRegOutlinedIcon />} iconPosition="start" label="Add Attendance" />
                                <Tab icon={<TodayIcon />} iconPosition="start" label="Today's Attendance" />
                                <Tab icon={<VisibilityOutlinedIcon />} iconPosition="start" label="Overview" />
                                <Tab icon={<ListAltOutlinedIcon />} iconPosition="start" label="Leave Management" />
                                <Tab icon={<InsertChartOutlinedIcon />} iconPosition="start" label="Reports" />
                            </Tabs>
                        </Box>
                    )}
                </Box>

                {/* Scrollable content */}
                <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                    pr: 0.5,
                    '&::-webkit-scrollbar': { width: 5 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#D1D5DB', borderRadius: 10 },
                }}>
                    {renderTabContent()}
                </Box>
            </Box>

            {renderSyncPreviewDialog()}
        </>
    );
}
