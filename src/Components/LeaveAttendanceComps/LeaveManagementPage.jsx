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
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Divider,
    Select,
    MenuItem,
    Tabs,
    Tab,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { postLeaveRequest, getLeaveDashboard } from '../../Api/Api';
import SnackBar from '../SnackBar';
import { useSelector } from 'react-redux';


const token = "123";

// Format "YYYY-MM-DD" → "DD-MM-YYYY" for API
const formatDateForApi = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
};

export default function LeaveManagementPage({ isEmbedded = false, onGoToApprovalWorkflow }) {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(2); // Leave Management tab (updated to tab 2)
    const [leaveTab, setLeaveTab] = useState(0); // All Leaves tab
    const [filterStatus, setFilterStatus] = useState("All Status");
    const [filterType, setFilterType] = useState("All Types");
    const [filterDept, setFilterDept] = useState("All Dept");
    const [isLoading, setIsLoading] = useState(false);

    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const showSnack = (msg, success) => {
        setMessage(msg); setOpen(true); setColor(success); setStatus(success);
    };

    // Dashboard data from API
    const [dashboardData, setDashboardData] = useState({
        cards: { totalLeavesThisMonth: 0, approved: 0, pending: 0, rejected: 0, approvedPercentOfTotal: 0 },
        leaveBalance: [],
        applications: { allLeaves: [], pendingApproval: [], approved: [], rejected: [] },
    });
    const [isFetching, setIsFetching] = useState(false);

    const fetchDashboard = async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(getLeaveDashboard, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data && !res.data.error) {
                setDashboardData({
                    cards: res.data.cards,
                    leaveBalance: res.data.leaveBalance,
                    applications: res.data.applications,
                });
            }
        } catch (error) {
            console.error('Error fetching leave dashboard:', error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // Leave Application Dialog State
    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [leaveFormData, setLeaveFormData] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        contactNumber: '',
        emergencyContact: ''
    });

    const handleTabChange = (event, newValue) => {
        switch(newValue) {
            case 0:
                navigate('/dashboardmenu/Leave'); // Attendance Dashboard
                break;
            case 1:
                navigate('/dashboardmenu/Leave/staff-attendance-overview'); // Staff Attendance Overview
                break;
            case 2:
                setTabValue(2); // Leave Management (current page)
                break;
            case 3:
                navigate('/dashboardmenu/Leave/approval-workflow'); // Approval Workflow
                break;
            case 4:
                navigate('/dashboardmenu/Leave/reports'); // Reports
                break;
            default:
                setTabValue(2);
                break;
        }
    };

    const handleLeaveTabChange = (event, newValue) => {
        setLeaveTab(newValue);
    };

    const handleApplyLeave = () => {
        setOpenLeaveDialog(true);
    };

    const handleCloseLeaveDialog = () => {
        setOpenLeaveDialog(false);
        // Reset form
        setLeaveFormData({
            leaveType: '',
            startDate: '',
            endDate: '',
            reason: '',
            contactNumber: '',
            emergencyContact: ''
        });
    };

    const handleLeaveFormChange = (field, value) => {
        setLeaveFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitLeave = async () => {
        if (!leaveFormData.leaveType || !leaveFormData.startDate || !leaveFormData.endDate || !leaveFormData.reason) {
            showSnack('Please fill all required fields', false);
            return;
        }

        const fromDate = formatDateForApi(leaveFormData.startDate);
        const toDate = formatDateForApi(leaveFormData.endDate);
        const duration = Math.max(
            1,
            Math.ceil((new Date(leaveFormData.endDate) - new Date(leaveFormData.startDate)) / (1000 * 60 * 60 * 24)) + 1
        );

        const sendData = {
            forRollNumber: rollNumber,
            fromDate,
            toDate,
            duration,
            leaveType: leaveFormData.leaveType,
            reason: leaveFormData.reason,
            contact: leaveFormData.contactNumber,
            emergencyContact: leaveFormData.emergencyContact,
            remarks: leaveFormData.reason,
        };

        setIsLoading(true);
        try {
            await axios.post(postLeaveRequest, sendData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showSnack('Leave applied successfully!', true);
            handleCloseLeaveDialog();
            fetchDashboard();
        } catch (error) {
            console.error('Error while submitting leave:', error);
            showSnack('Failed to submit leave application', false);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusChip = (status) => {
        const config = {
            Approved: { bg: '#DCFCE7', color: '#22C55E', icon: CheckCircleIcon },
            Pending:  { bg: '#FEF3C7', color: '#F59E0B', icon: PendingIcon },
            Rejected: { bg: '#FFEBEE', color: '#DC2626', icon: CancelIcon },
        };

        const { bg, color, icon: Icon } = config[status] || config.Pending;

        return (
            <Chip
                label={status}
                size="small"
                icon={<Icon />}
                sx={{
                    bgcolor: bg,
                    color: color,
                    fontWeight: '600',
                    fontSize: '11px',
                    '& .MuiChip-icon': {
                        fontSize: 14,
                        color: 'inherit'
                    }
                }}
            />
        );
    };

    const getLeaveTypeChip = (leaveType) => {
        const colors = {
            "Sick Leave": { bg: '#FEE2E2', color: '#DC2626' },
            "Casual Leave": { bg: '#DBEAFE', color: '#3B82F6' },
            "Planned Leave": { bg: '#DCFCE7', color: '#22C55E' },
            "Emergency Leave": { bg: '#FED7AA', color: '#F97316' }
        };

        const { bg, color } = colors[leaveType] || { bg: '#F3F4F6', color: '#666' };

        return (
            <Chip
                label={leaveType}
                size="small"
                sx={{
                    bgcolor: bg,
                    color: color,
                    fontWeight: '600',
                    fontSize: '11px'
                }}
            />
        );
    };

    // Derive active table data from leaveTab selection
    const TAB_KEYS = ['allLeaves', 'pendingApproval', 'approved', 'rejected'];
    const activeLeaves = dashboardData.applications[TAB_KEYS[leaveTab]] || [];
    const stats = dashboardData.cards;

    // Initials helper for avatar
    const getInitials = (name = '') =>
        name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();


    return (
        <>
        <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
        <Box sx={{
            border: isEmbedded ? 'none' : '1px solid #ccc',
            borderRadius: isEmbedded ? '0' : '20px',
            p: isEmbedded ? 0 : 2,
            height: isEmbedded ? 'auto' : '86vh',
            overflow: 'auto',
            bgcolor: '#FAFAFA'
        }}>
            {/* Header - Hidden when embedded */}
            {!isEmbedded && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: '35px', height: '35px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>
                            Leave Management
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: '#666', mt: 0.5 }}>
                            Manage staff leave applications and approvals
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={handleApplyLeave}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '50px',
                            bgcolor: '#22C55E',
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: '600',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: '#16A34A'
                            }
                        }}
                    >
                        Apply Leave
                    </Button>
                    <Button
                        startIcon={<FileDownloadIcon />}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '50px',
                            border: '1px solid #333',
                            color: '#333',
                            fontSize: '13px',
                            fontWeight: '600',
                            px: 2.5,
                            '&:hover': {
                                border: '1px solid #000',
                                bgcolor: '#F5F5F5'
                            }
                        }}
                    >
                        Export
                    </Button>
                </Box>
            </Box>
            )}

            {/* Tabs - Hidden when embedded */}
            {!isEmbedded && (
            <Box sx={{ borderBottom: '1px solid #E8E8E8', mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#666',
                            minHeight: '40px',
                            px: 2
                        },
                        '& .Mui-selected': {
                            color: '#F97316 !important'
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#F97316',
                            height: '3px'
                        }
                    }}
                >
                    <Tab label="Attendance Dashboard" />
                    <Tab label="Staff Attendance Overview" />
                    <Tab label="Leave Management" />
                    <Tab label="Approval Workflow" />
                    <Tab label="Reports" />
                </Tabs>
            </Box>
            )}

            <Grid container spacing={2}>
                {/* Main Content */}
                <Grid size={{ xs: 12, lg: 9 }}>
                    {/* Statistics Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <Card sx={{
                                border: '1px solid #E8E8E8',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#fff'
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Total Leaves
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                {stats.totalLeavesThisMonth}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#999', mt: 0.5 }}>
                                                This Month
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#EFF6FF', width: 40, height: 40 }}>
                                            <EventIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <Card sx={{
                                border: '1px solid #22C55E',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#F0FDF4'
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Approved
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                {stats.approved}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#22C55E', fontWeight: '600', mt: 0.5 }}>
                                                {stats.approvedPercentOfTotal ?? 0}% of total
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#DCFCE7', width: 40, height: 40 }}>
                                            <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <Card sx={{
                                border: '1px solid #F97316',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#FFF7ED'
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Pending
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                {stats.pending}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#F97316', fontWeight: '600', mt: 0.5 }}>
                                                Needs Review
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#FED7AA', width: 40, height: 40 }}>
                                            <PendingIcon sx={{ color: '#F97316', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <Card sx={{
                                border: '1px solid #DC2626',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#FEF2F2'
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Rejected
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                {stats.rejected}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#DC2626', fontWeight: '600', mt: 0.5 }}>
                                                Declined
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#FEE2E2', width: 40, height: 40 }}>
                                            <CancelIcon sx={{ color: '#DC2626', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Leave Applications Table */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                                    Leave Applications
                                </Typography>
                            </Box>

                            {/* Sub Tabs */}
                            <Tabs
                                value={leaveTab}
                                onChange={handleLeaveTabChange}
                                sx={{
                                    mb: 2,
                                    minHeight: '36px',
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#666',
                                        minHeight: '36px',
                                        px: 2
                                    },
                                    '& .Mui-selected': {
                                        color: '#F97316 !important'
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#F97316',
                                        height: '2px'
                                    }
                                }}
                            >
                                <Tab label="All Leaves" />
                                <Tab label="Pending Approval" />
                                <Tab label="Approved" />
                                <Tab label="Rejected" />
                            </Tabs>


                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Staff Member
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Leave Type
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Duration
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Days
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Reason
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Status
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isFetching ? (
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                                                    <CircularProgress size={28} sx={{ color: '#F97316' }} />
                                                </TableCell>
                                            </TableRow>
                                        ) : activeLeaves.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#999', fontSize: '13px' }}>
                                                    No leave applications found
                                                </TableCell>
                                            </TableRow>
                                        ) : activeLeaves.map((leave) => (
                                            <TableRow
                                                key={leave.leaveApplicationId}
                                                sx={{
                                                    '&:hover': { bgcolor: '#F9FAFB' },
                                                    borderBottom: '1px solid #E8E8E8'
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d2', fontSize: '13px' }}>
                                                            {getInitials(leave.name)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                                {leave.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                                {leave.forRollNumber}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {getLeaveTypeChip(leave.leaveType)}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                        {leave.fromDate}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                        to {leave.toDate}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                        {leave.days} {leave.days > 1 ? 'days' : 'day'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', color: '#666', maxWidth: '200px' }}>
                                                        {leave.reason}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusChip(leave.status)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Side Panel */}
                <Grid size={{ xs: 12, lg: 3 }}>
                    {/* Leave Balance */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 2 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', mb: 2 }}>
                                Leave Balance
                            </Typography>

                            {dashboardData.leaveBalance.length === 0 ? (
                                <Typography sx={{ fontSize: '12px', color: '#999', textAlign: 'center', py: 2 }}>
                                    No balance data
                                </Typography>
                            ) : dashboardData.leaveBalance.map((lb, i) => {
                                const usedPct = lb.totalDays > 0 ? (lb.usedDays / lb.totalDays) * 100 : 0;
                                const isLow = usedPct >= 80;
                                const bgColor = isLow ? '#FFF7ED' : '#F0FDF4';
                                const borderColor = isLow ? '#FED7AA' : '#DCFCE7';
                                const textColor = isLow ? '#F97316' : '#22C55E';
                                return (
                                    <Box
                                        key={i}
                                        sx={{ mb: i < dashboardData.leaveBalance.length - 1 ? 2 : 0, p: 1.5, borderRadius: '8px', bgcolor: bgColor, border: `1px solid ${borderColor}` }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                                {lb.leaveType}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#999' }}>
                                                Used: {lb.usedDays}d
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '20px', fontWeight: '700', color: textColor }}>
                                            {lb.remainingDays}
                                            <Typography component="span" sx={{ fontSize: '13px', color: '#999' }}>
                                                {' '}/ {lb.totalDays} days
                                            </Typography>
                                        </Typography>
                                        {/* Progress bar */}
                                        <Box sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: '#E5E7EB', overflow: 'hidden' }}>
                                            <Box sx={{ height: '100%', width: `${usedPct}%`, bgcolor: textColor, borderRadius: 2, transition: '0.4s' }} />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none' }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', mb: 2 }}>
                                Quick Actions
                            </Typography>

                            <Button
                                fullWidth
                                startIcon={<AddIcon />}
                                variant="contained"
                                onClick={handleApplyLeave}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    bgcolor: '#22C55E',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    mb: 1.5,
                                    '&:hover': {
                                        bgcolor: '#16A34A'
                                    }
                                }}
                            >
                                Apply Leave
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={onGoToApprovalWorkflow || (() => handleTabChange(null, 3))}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#F97316',
                                    borderColor: '#F97316',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        borderColor: '#EA580C',
                                        bgcolor: '#FFF7ED'
                                    }
                                }}
                            >
                                Approve Leaves
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Leave Application Dialog */}
            <Dialog
                open={openLeaveDialog}
                onClose={handleCloseLeaveDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        p: 1
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            bgcolor: '#22C55E1A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AddIcon sx={{ color: '#22C55E', fontSize: '20px' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
                                Apply for Leave
                            </Typography>
                            <Typography sx={{ fontSize: '13px', color: '#666' }}>
                                Fill in the details below to submit your leave application
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2.5}>
                        {/* Leave Type */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Leave Type</InputLabel>
                                <Select
                                    value={leaveFormData.leaveType}
                                    onChange={(e) => handleLeaveFormChange('leaveType', e.target.value)}
                                    label="Leave Type"
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#E8E8E8'
                                        }
                                    }}
                                >
                                    <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                                    <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                                    <MenuItem value="Emergency Leave">Emergency Leave</MenuItem>
                                    <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
                                    <MenuItem value="Paternity Leave">Paternity Leave</MenuItem>
                                    <MenuItem value="Annual Leave">Annual Leave</MenuItem>
                                    <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Duration Display */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{
                                height: '56px',
                                border: '1px solid #E8E8E8',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#F9FAFB'
                            }}>
                                <Typography sx={{ fontSize: '14px', color: '#666' }}>
                                    Duration: <Typography component="span" sx={{ fontWeight: '700', color: '#1a1a1a' }}>
                                        {leaveFormData.startDate && leaveFormData.endDate
                                            ? Math.ceil((new Date(leaveFormData.endDate) - new Date(leaveFormData.startDate)) / (1000 * 60 * 60 * 24)) + 1
                                            : 0} days
                                    </Typography>
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Start Date */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="Start Date"
                                type="date"
                                value={leaveFormData.startDate}
                                onChange={(e) => handleLeaveFormChange('startDate', e.target.value)}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                    htmlInput: {
                                        min: new Date().toISOString().split('T')[0]
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#E8E8E8'
                                    }
                                }}
                            />
                        </Grid>

                        {/* End Date */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="End Date"
                                type="date"
                                value={leaveFormData.endDate}
                                onChange={(e) => handleLeaveFormChange('endDate', e.target.value)}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                    htmlInput: {
                                        min: leaveFormData.startDate || new Date().toISOString().split('T')[0]
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#E8E8E8'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Reason */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                required
                                multiline
                                rows={4}
                                label="Reason for Leave"
                                placeholder="Please provide a detailed reason for your leave request..."
                                value={leaveFormData.reason}
                                onChange={(e) => handleLeaveFormChange('reason', e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#E8E8E8'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Contact Number */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Contact Number"
                                placeholder="Enter your contact number"
                                value={leaveFormData.contactNumber}
                                onChange={(e) => handleLeaveFormChange('contactNumber', e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#E8E8E8'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Emergency Contact */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Emergency Contact"
                                placeholder="Emergency contact number"
                                value={leaveFormData.emergencyContact}
                                onChange={(e) => handleLeaveFormChange('emergencyContact', e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#E8E8E8'
                                    }
                                }}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button
                        onClick={handleCloseLeaveDialog}
                        sx={{
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#666',
                            px: 3,
                            '&:hover': {
                                bgcolor: '#F5F5F5'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitLeave}
                        variant="contained"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            bgcolor: '#22C55E',
                            color: '#fff',
                            px: 4,
                            '&:hover': {
                                bgcolor: '#16A34A'
                            }
                        }}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
        </>
    );
}
