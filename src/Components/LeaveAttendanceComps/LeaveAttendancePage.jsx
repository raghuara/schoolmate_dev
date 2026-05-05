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
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getAttendanceDashboard } from '../../Api/Api';
import SnackBar from '../SnackBar';

import StaffAttendanceOverviewPage from './StaffAttendanceOverviewPage';
import LeaveManagementPage from './LeaveManagementPage';
import ApprovalWorkflowPage from './ApprovalWorkflowPage';
import AttendanceReportsPage from './AttendanceReportsPage';
import AddStaffAttendancePage from './AddStaffAttendancePage';
import ApplyLeavePage from './ApplyLeavePage';


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
                {/* Biometric Device Status Banner */}
                {(() => {
                    const DEVICE_BG = deviceStatus.connected ? '#EEF2FF' : '#FEF2F2';
                    const DEVICE_BORDER = deviceStatus.connected ? '#C7D2FE' : '#FECACA';
                    const DEVICE_ACCENT = deviceStatus.connected ? '#4338CA' : '#DC2626';
                    const DEVICE_ACCENT_DARK = deviceStatus.connected ? '#3730A3' : '#B91C1C';
                    const DEVICE_ACCENT_SOFT = deviceStatus.connected ? '#6366F1' : '#DC2626';
                    return (
                <Paper elevation={0} sx={{
                    mb: 2, p: 1.5,
                    border: `1px solid ${DEVICE_BORDER}`,
                    borderRadius: '12px',
                    bgcolor: DEVICE_BG,
                }}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: 42, height: 42, borderRadius: '10px',
                                    bgcolor: '#fff',
                                    border: `1px solid ${DEVICE_BORDER}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <DevicesIcon sx={{ color: DEVICE_ACCENT, fontSize: 22 }} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#111827' }} noWrap>
                                            {deviceStatus.deviceName}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            icon={<WifiTetheringIcon sx={{ fontSize: '12px !important' }} />}
                                            label={deviceStatus.connected ? 'Online' : 'Offline'}
                                            sx={{
                                                height: 20, fontSize: '10px', fontWeight: 700,
                                                bgcolor: '#fff',
                                                color: DEVICE_ACCENT_DARK,
                                                border: `1px solid ${DEVICE_BORDER}`,
                                                '& .MuiChip-icon': { color: 'inherit' },
                                            }}
                                        />
                                    </Box>
                                    <Typography sx={{ fontSize: '11px', color: '#4B5563', mt: 0.2 }}>
                                        IP {deviceStatus.deviceIp} · Last sync {deviceStatus.lastSyncAt ? toHHmm(deviceStatus.lastSyncAt) : '—'}
                                        {deviceStatus.pendingPunches > 0 && ` · ${deviceStatus.pendingPunches} pending punches`}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditNoteIcon sx={{ color: DEVICE_ACCENT }} />}
                                onClick={handleManualEntry}
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: 700, borderRadius: '8px',
                                    border: `1px solid ${DEVICE_BORDER}`,
                                    bgcolor: '#fff',
                                    color: DEVICE_ACCENT_DARK,
                                    px: 1.5,
                                    boxShadow: `0 1px 2px ${DEVICE_ACCENT_SOFT}1A`,
                                    '&:hover': {
                                        border: `1px solid ${DEVICE_ACCENT_SOFT}`,
                                        bgcolor: DEVICE_BG,
                                        boxShadow: `0 2px 6px ${DEVICE_ACCENT_SOFT}33`,
                                    },
                                }}
                            >
                                Manual Entry
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={isSyncing ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SyncIcon />}
                                onClick={handleFetchBiometric}
                                disabled={isSyncing}
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: 700, borderRadius: '8px',
                                    bgcolor: DEVICE_ACCENT_SOFT, boxShadow: `0 2px 6px ${DEVICE_ACCENT_SOFT}33`,
                                    '&:hover': { bgcolor: DEVICE_ACCENT_DARK, boxShadow: `0 4px 12px ${DEVICE_ACCENT_SOFT}55` },
                                }}
                            >
                                {isSyncing ? 'Syncing...' : 'Sync Biometric'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
                    );
                })()}

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
                        <Card sx={{
                            border: `1px solid ${PRIMARY_BORDER}`,
                            borderRadius: '12px', boxShadow: 'none', mb: 2,
                            bgcolor: PRIMARY_LIGHT,
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <Box sx={{
                                        width: 28, height: 28, borderRadius: '8px',
                                        bgcolor: '#fff', border: `1px solid ${PRIMARY_BORDER}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <CheckCircleIcon sx={{ color: PRIMARY, fontSize: 16 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                                        Attendance Rate
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                                    <Typography sx={{ fontSize: '34px', fontWeight: 800, color: PRIMARY_DARK, lineHeight: 1 }}>
                                        {attendanceRate}%
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>today</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={attendanceRate}
                                    sx={{
                                        height: 6, borderRadius: 3, bgcolor: '#fff',
                                        '& .MuiLinearProgress-bar': { bgcolor: PRIMARY, borderRadius: 3 },
                                    }}
                                />

                                <Divider sx={{ my: 1.8, borderColor: PRIMARY_BORDER }} />

                                <Stack spacing={1}>
                                    {[
                                        { label: 'Present',  value: presentCount,            color: '#059669' },
                                        { label: 'Absent',   value: cards.totalAbsent  ?? 0, color: '#DC2626' },
                                        { label: 'Late',     value: cards.lateArrivals ?? 0, color: '#D97706' },
                                        { label: 'On Leave', value: cards.onLeave      ?? 0, color: '#2563EB' },
                                    ].map(item => (
                                        <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, bgcolor: item.color, borderRadius: '50%' }} />
                                                <Typography sx={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{item.label}</Typography>
                                            </Box>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{item.value}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>

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
                                        onClick={() => setTabValue(4)}
                                        sx={{
                                            textTransform: 'none', fontSize: '12px', fontWeight: 700,
                                            bgcolor: PRIMARY, color: '#fff', borderRadius: '8px',
                                            boxShadow: `0 2px 6px ${PRIMARY}33`,
                                            '&:hover': { bgcolor: PRIMARY_DARK, boxShadow: `0 4px 12px ${PRIMARY}55` },
                                        }}>
                                        Go to Apply Leave
                                    </Button>
                                </Box>

                                {/* Approval row — admin only */}
                                {(userType === "superadmin" || userType === "admin") && (
                                    <Box sx={{
                                        p: 1.2, borderRadius: '10px',
                                        bgcolor: '#EFF6FF', border: '1px solid #BFDBFE',
                                    }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8', mb: 0.2 }}>
                                            Leave Requests
                                        </Typography>
                                        <Typography sx={{ fontSize: '10.5px', color: '#4B5563', mb: 1 }}>
                                            View and approve pending leave requests.
                                        </Typography>
                                        <Button fullWidth variant="outlined"
                                            onClick={() => setTabValue(5)}
                                            sx={{
                                                textTransform: 'none', fontSize: '12px', fontWeight: 700,
                                                borderColor: '#BFDBFE', color: '#1D4ED8', borderRadius: '8px',
                                                bgcolor: '#fff',
                                                '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF' },
                                            }}>
                                            Go to Leave Approval
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const renderTabContent = () => {
        if (userType === "teacher") {
            // Teachers see only Leave Management + Apply Leave (single embedded view)
            return <LeaveManagementPage
                isEmbedded={true}
                onGoToApplyLeave={() => setTabValue(4)}
            />;
        }

        if (userType === "staff") {
            switch (tabValue) {
                case 0: return renderDashboard();
                case 1: return <AddStaffAttendancePage />;
                case 2: return <StaffAttendanceOverviewPage isEmbedded={true} />;
                case 3: return <LeaveManagementPage
                    isEmbedded={true}
                    onGoToApplyLeave={() => setTabValue(4)}
                />;
                case 4: return <ApplyLeavePage
                    onSuccess={() => setTabValue(3)}
                    onCancel={() => setTabValue(3)}
                />;
                case 5: return <AttendanceReportsPage isEmbedded={true} />;
                default: return renderDashboard();
            }
        }

        switch (tabValue) {
            case 0: return renderDashboard();
            case 1: return <AddStaffAttendancePage />;
            case 2: return <StaffAttendanceOverviewPage isEmbedded={true} />;
            case 3: return <LeaveManagementPage
                isEmbedded={true}
                onGoToApprovalWorkflow={() => setTabValue(5)}
                onGoToApplyLeave={() => setTabValue(4)}
            />;
            case 4: return <ApplyLeavePage
                onSuccess={() => setTabValue(3)}
                onCancel={() => setTabValue(3)}
            />;
            case 5: return <ApprovalWorkflowPage isEmbedded={true} />;
            case 6: return <AttendanceReportsPage isEmbedded={true} />;
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
                                <Tab icon={<VisibilityOutlinedIcon />} iconPosition="start" label="Overview" />
                                <Tab icon={<ListAltOutlinedIcon />} iconPosition="start" label="Leave Management" />
                                <Tab icon={<EventNoteOutlinedIcon />} iconPosition="start" label="Apply Leave" />
                                {userType !== "staff" && <Tab icon={<FactCheckOutlinedIcon />} iconPosition="start" label="Leave Approval" />}
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
