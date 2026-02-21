import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    IconButton,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Divider,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
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


const token = "123";

// Format JS Date → "DD-MM-YYYY" for API
const formatDateForApi = (dateObj) => {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
};

// Map API role to display label
const mapRole = (role = '') => {
    const r = role.toLowerCase();
    if (r === 'teaching')    return 'Teaching Staff';
    if (r === 'nonteaching') return 'Non Teaching Staff';
    return 'Supporting Staff';
};

// Map API status/attendance to display label
const mapStatus = (status = '', attendance = '') => {
    const s = (status || attendance || '').toLowerCase();
    if (s === 'present')  return 'Present';
    if (s === 'late')     return 'Late';
    if (s === 'onleave' || s === 'on leave') return 'On Leave';
    if (s === 'absent')   return 'Absent';
    return 'Absent'; // default empty → Absent
};

// Initials from name
const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// Capitalize first letter
const capitalize = (str = '') =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const USER_TYPE_CONFIG = {
    'Super Admin': { color: '#7C3AED', bg: '#EDE9FE' },
    'Admin':       { color: '#2563EB', bg: '#DBEAFE' },
    'Staff':       { color: '#0891B2', bg: '#E0F7FA' },
    'Teacher':     { color: '#16A34A', bg: '#DCFCE7' },
};

const ROLE_CONFIG = {
    'Teaching Staff':     { color: '#7C3AED', bg: '#EDE9FE' },
    'Non Teaching Staff': { color: '#0891B2', bg: '#E0F7FA' },
    'Supporting Staff':   { color: '#EA580C', bg: '#FFF7ED' },
};

export default function LeaveAttendancePage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;

    const [tabValue, setTabValue] = useState(0);

    // SnackBar
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true); setSnackColor(success); setSnackStatus(success);
    };

    // Dashboard API data
    const [dashboardData, setDashboardData] = useState({
        cards: { totalPresent: 0, totalStaff: 0, totalAbsent: 0, lateArrivals: 0, onLeave: 0 },
        todaysAttendance: [],
        staffMembersCount: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

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

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // ─── Dashboard Tab ────────────────────────────────────────────────────────
    const renderDashboard = () => {
        const { cards, todaysAttendance, staffMembersCount } = dashboardData;

        const kpiCards = [
            { label: 'Total Present', value: cards.totalPresent ?? 0, sub: `/${cards.totalStaff ?? staffMembersCount ?? 0}`, border: '#22C55E', bg: '#F0FDF4', icon: CheckCircleIcon },
            { label: 'Total Absent',  value: cards.totalAbsent  ?? 0, border: '#DC2626', bg: '#FEF2F2', icon: CancelIcon },
            { label: 'Late Arrivals', value: cards.lateArrivals ?? 0, border: '#F97316', bg: '#FFF7ED', icon: AccessTimeIcon },
            { label: 'On Leave',      value: cards.onLeave      ?? 0, border: '#3B82F6', bg: '#EFF6FF', icon: EventIcon },
        ];

        return (
            <Grid container spacing={2}>
                {/* Main Content */}
                <Grid size={{ xs: 12, lg: 9 }}>
                    {/* Overview Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {kpiCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.label}>
                                    <Card sx={{ border: `1px solid ${card.border}`, borderRadius: '4px', boxShadow: 'none', bgcolor: card.bg, height: '100%' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>{card.label}</Typography>
                                                    <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                        {card.value}
                                                        {card.sub && <Typography component="span" sx={{ fontSize: '16px', color: '#999' }}>{card.sub}</Typography>}
                                                    </Typography>
                                                </Box>
                                                <Avatar sx={{ bgcolor: card.bg, width: 40, height: 40 }}>
                                                    <Icon sx={{ color: card.border, fontSize: 24 }} />
                                                </Avatar>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Today's Attendance Feed */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>Today's Attendance</Typography>
                                <Chip label={`${todaysAttendance.length} Staff Members`} size="small"
                                    sx={{ bgcolor: '#E8EFFE', color: '#3457D5', fontWeight: '600', fontSize: '11px' }} />
                            </Box>

                            {isLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                    <CircularProgress size={28} sx={{ color: '#F97316' }} />
                                </Box>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                                {['S.No', 'Staff Member', 'User Type', 'Role', 'Attendance', 'Login Time', 'Status'].map(h => (
                                                    <TableCell key={h} sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {todaysAttendance.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#999', fontSize: '13px' }}>
                                                        No attendance records found
                                                    </TableCell>
                                                </TableRow>
                                            ) : todaysAttendance.slice(0, 5).map((emp, idx) => {
                                                const userTypeLabel = capitalize(emp.userType);
                                                const roleLabel     = mapRole(emp.role);
                                                const statusLabel   = mapStatus(emp.status, emp.attendance);

                                                const utConf   = USER_TYPE_CONFIG[userTypeLabel] || { color: '#666', bg: '#F5F5F5' };
                                                const roleConf = ROLE_CONFIG[roleLabel]           || { color: '#666', bg: '#F5F5F5' };

                                                const canShowTime  = statusLabel === 'Present' || statusLabel === 'Late';
                                                const attColor = statusLabel === 'Present'  ? '#22C55E'
                                                              : statusLabel === 'Late'      ? '#F97316'
                                                              : statusLabel === 'On Leave'  ? '#3B82F6'
                                                              : '#DC2626';
                                                const attBg    = statusLabel === 'Present'  ? '#DCFCE7'
                                                              : statusLabel === 'Late'      ? '#FFF7ED'
                                                              : statusLabel === 'On Leave'  ? '#DBEAFE'
                                                              : '#FEE2E2';
                                                const timeColor  = statusLabel === 'Late' ? '#F97316' : '#22C55E';
                                                const timeBg     = statusLabel === 'Late' ? '#FFF7ED' : '#F0FDF4';
                                                const timeBorder = statusLabel === 'Late' ? '#F97316' : '#22C55E';

                                                return (
                                                    <TableRow key={emp.rollNumber} sx={{ '&:hover': { bgcolor: '#F9FAFB' }, borderBottom: '1px solid #E8E8E8' }}>
                                                        <TableCell sx={{ width: 50 }}>
                                                            <Typography sx={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>{idx + 1}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                                <Avatar sx={{ width: 34, height: 34, bgcolor: '#1976d2', fontSize: '12px', fontWeight: '700' }}>
                                                                    {getInitials(emp.name)}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{emp.name}</Typography>
                                                                    <Typography sx={{ fontSize: '10px', color: '#999' }}>{emp.rollNumber}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={userTypeLabel} size="small"
                                                                sx={{ bgcolor: utConf.bg, color: utConf.color, fontWeight: '600', fontSize: '10px', height: '22px' }} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={roleLabel} size="small"
                                                                sx={{ bgcolor: roleConf.bg, color: roleConf.color, fontWeight: '600', fontSize: '10px', height: '22px' }} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={statusLabel} size="small"
                                                                sx={{ bgcolor: attBg, color: attColor, fontWeight: '700', fontSize: '10px', height: '22px' }} />
                                                        </TableCell>
                                                        <TableCell>
                                                            {canShowTime ? (
                                                                <Box sx={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                                    px: 1, py: 0.3, borderRadius: '6px',
                                                                    bgcolor: timeBg, border: `1px solid ${timeBorder}`,
                                                                }}>
                                                                    <AccessTimeIcon sx={{ fontSize: 13, color: timeColor }} />
                                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: timeColor }}>
                                                                        {emp.loginTime || '—'}
                                                                    </Typography>
                                                                </Box>
                                                            ) : (
                                                                <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>—</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={statusLabel} size="small"
                                                                sx={{ bgcolor: attBg, color: attColor, fontWeight: '700', fontSize: '10px', height: '22px' }} />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Button
                                    onClick={() => setTabValue(2)}
                                    endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                                    sx={{ textTransform: 'none', fontSize: '13px', fontWeight: '600', color: '#F97316', '&:hover': { bgcolor: '#FFF7ED' } }}>
                                    View Full Details
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Panel */}
                <Grid size={{ xs: 12, lg: 3 }}>
                    {/* Attendance Summary */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 2 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', mb: 2 }}>
                                Attendance Summary
                            </Typography>
                            {[
                                { label: 'Present',      value: cards.totalPresent ?? 0, color: '#22C55E', bg: '#F0FDF4' },
                                { label: 'Absent',       value: cards.totalAbsent  ?? 0, color: '#DC2626', bg: '#FEF2F2' },
                                { label: 'Late Arrivals',value: cards.lateArrivals ?? 0, color: '#F97316', bg: '#FFF7ED' },
                                { label: 'On Leave',     value: cards.onLeave      ?? 0, color: '#3B82F6', bg: '#EFF6FF' },
                            ].map((item) => (
                                <Box key={item.label} sx={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    mb: 1.2, p: 1, borderRadius: '6px', bgcolor: item.bg,
                                    border: `1px solid ${item.color}30`
                                }}>
                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>{item.label}</Typography>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '700', color: item.color }}>{item.value}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Leave Requests (static placeholder) */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 2 }}>
                        <CardContent sx={{ pb: '12px !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Leave Requests</Typography>
                            </Box>
                            <Typography sx={{ fontSize: '12px', color: '#999', textAlign: 'center', py: 2 }}>
                                View pending leave requests in the Leave Approval tab.
                            </Typography>
                            <Button fullWidth variant="text"
                                onClick={() => setTabValue(4)}
                                endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)', fontSize: '14px !important' }} />}
                                sx={{ textTransform: 'none', fontSize: '12px', fontWeight: '600', color: '#F97316', mt: 0.5, '&:hover': { bgcolor: '#FFF7ED' } }}>
                                View Leave Approval
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const renderTabContent = () => {
        switch (tabValue) {
            case 0: return renderDashboard();
            case 1: return <AddStaffAttendancePage />;
            case 2: return <StaffAttendanceOverviewPage isEmbedded={true} />;
            case 3: return <LeaveManagementPage isEmbedded={true} onGoToApprovalWorkflow={() => setTabValue(4)} />;
            case 4: return <ApprovalWorkflowPage isEmbedded={true} />;
            case 5: return <AttendanceReportsPage isEmbedded={true} />;
            default: return renderDashboard();
        }
    };

    return (
        <>
        <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />
        <Box sx={{
            border: '1px solid #ccc',
            borderRadius: '20px',
            p: 2,
            height: '86vh',
            overflow: 'hidden',
            bgcolor: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <Box sx={{ flexShrink: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: '35px', height: '35px' }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                        </IconButton>
                        <Typography sx={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>
                            Leave & Attendance
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            startIcon={<AddIcon />}
                            variant="outlined"
                            onClick={() => setTabValue(1)}
                            sx={{
                                textTransform: 'none', borderRadius: '50px',
                                border: '1px solid #333', color: '#333',
                                fontSize: '13px', fontWeight: '600', px: 2.5,
                                '&:hover': { border: '1px solid #000', bgcolor: '#F5F5F5' }
                            }}
                        >
                            Mark Attendance
                        </Button>
                        <Button
                            startIcon={<FileDownloadIcon />}
                            variant="contained"
                            sx={{
                                textTransform: 'none', borderRadius: '50px',
                                bgcolor: '#F97316', color: '#fff',
                                fontSize: '13px', fontWeight: '600', px: 2.5,
                                '&:hover': { bgcolor: '#EA580C' }
                            }}
                        >
                            Export Report
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* Tabs */}
                <Box sx={{ borderBottom: '1px solid #E8E8E8', mb: 1.5 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            minHeight: '40px',
                            '& .MuiTab-root': {
                                textTransform: 'none', fontSize: '13px',
                                fontWeight: '600', color: '#666',
                                minHeight: '40px', px: 2.5, py: 1,
                            },
                            '& .Mui-selected': { color: '#F97316 !important' },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#F97316',
                                height: '2px',
                                borderRadius: '2px 2px 0 0',
                            },
                        }}
                    >
                        <Tab label="Attendance Dashboard" />
                        <Tab label="Add Attendance" />
                        <Tab label="Staff Attendance Overview" />
                        <Tab label="Leave Management" />
                        <Tab label="Leave Approval" />
                        <Tab label="Reports" />
                    </Tabs>
                </Box>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '5px' },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#D0D0D0', borderRadius: '10px' },
            }}>
                {renderTabContent()}
            </Box>
        </Box>
        </>
    );
}
