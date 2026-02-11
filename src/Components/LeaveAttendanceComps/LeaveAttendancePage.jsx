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
    Select,
    MenuItem,
    Tabs,
    Tab,
    LinearProgress,
    Badge,
    Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

// Mock data for attendance feed
const attendanceFeed = [
    {
        id: 1,
        name: "Sarah Jenkins",
        title: "Staff ID: ST001 • Mathematics",
        avatar: "SJ",
        timeIn: "08:02 AM",
        timeInDetail: "On Time",
        timeOut: "05:30 PM",
        markedBy: "Admin",
        status: "Present",
        statusColor: "success"
    },
    {
        id: 2,
        name: "David Ross",
        title: "Staff ID: ST002 • Marketing",
        avatar: "DR",
        timeIn: "08:45 AM",
        timeInDetail: "Late 15m",
        timeOut: "----",
        markedBy: "Self",
        status: "Late",
        statusColor: "warning"
    },
    {
        id: 3,
        name: "Nivetha Arjun",
        title: "Staff ID: ST003 • Science",
        avatar: "NA",
        timeIn: "07:55 AM",
        timeInDetail: "Early Arrival",
        timeOut: "05:00 PM",
        markedBy: "Admin",
        status: "Present",
        statusColor: "success"
    },
    {
        id: 4,
        name: "John Doe",
        title: "Staff ID: ST004 • English",
        avatar: "JD",
        timeIn: "----",
        timeOut: "----",
        markedBy: "HR",
        status: "On Leave",
        statusColor: "info"
    }
];

// Mock data for exceptions
const exceptions = [
    {
        title: "Frequent Latecomer",
        description: "David Ross has been late 3 times this week.",
        severity: "warning",
        time: "Daily"
    },
    {
        title: "Missed Punch-Out",
        description: "5 Employees did not check out time yesterday.",
        severity: "error",
        time: "Yesterday"
    },
    {
        title: "Device Offline",
        description: "Bio-Metric Device (Gate C) is not syncing.",
        severity: "info",
        time: "15m ago"
    }
];

// Mock data for detailed log
const detailedLog = [
    { name: "Sarah J.", role: "Product Design", time: "09:00 AM", avatar: "SJ", color: "#3B82F6" },
    { name: "David R.", role: "Marketing", time: "09:15 AM", avatar: "DR", color: "#F97316" },
    { name: "Nivetha A.", role: "Engineering", time: "08:55 AM", avatar: "NA", color: "#10B981" }
];

// Mock data for staff weekly attendance
const staffWeeklyData = [
    { name: "Sarah J.", data: [1, 1, 1, 1, 0, 0] }, // 1: present, 2: late, 3: absent/leave, 0: weekend
    { name: "David R.", data: [1, 2, 3, 1, 0, 0] },
    { name: "Nivetha A.", data: [1, 1, 3, 1, 0, 0] }
];

export default function LeaveAttendancePage({ isEmbedded = false }) {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [filterDate, setFilterDate] = useState("Today");
    const [filterBranch, setFilterBranch] = useState("All Branch");
    const [filterStaff, setFilterStaff] = useState("All Staff");
    const [filterDept, setFilterDept] = useState("All Dept");
    const [liveTime, setLiveTime] = useState(new Date());

    // Update live time every second for the live feed indicator
    useEffect(() => {
        const timer = setInterval(() => {
            setLiveTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleTabChange = (event, newValue) => {
        // Navigate to different pages based on tab selection (Staff Management removed)
        switch(newValue) {
            case 0:
                // Attendance Dashboard - already on this page
                setTabValue(0);
                break;
            case 1:
                // Staff Attendance Overview
                navigate('/dashboardmenu/Leave/staff-attendance-overview');
                break;
            case 2:
                // Leave Management
                navigate('/dashboardmenu/Leave/leave-management');
                break;
            case 3:
                // Approval Workflow
                navigate('/dashboardmenu/Leave/approval-workflow');
                break;
            case 4:
                // Reports
                navigate('/dashboardmenu/Leave/reports');
                break;
            default:
                setTabValue(0);
                break;
        }
    };

    const handleExportReport = () => {
        console.log('Exporting attendance report...');
        // TODO: Implement export functionality
        // Can export as PDF, Excel, etc.
    };

    const handleMarkAttendance = () => {
        console.log('Opening mark attendance dialog...');
        alert('Mark Attendance dialog will be implemented');
    };

    const getStatusChip = (status, statusColor) => {
        const config = {
            success: { bg: '#DCFCE7', color: '#22C55E', icon: CheckCircleIcon },
            warning: { bg: '#FEF3C7', color: '#F59E0B', icon: WarningIcon },
            info: { bg: '#DBEAFE', color: '#3B82F6', icon: EventIcon },
            error: { bg: '#FFEBEE', color: '#DC2626', icon: CancelIcon }
        };

        const { bg, color, icon: Icon } = config[statusColor] || config.info;

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

    return (
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>
                            Attendance Dashboard
                        </Typography>
                        <Chip
                            icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: '#22C55E', animation: 'pulse 2s infinite' }} />}
                            label={`Live Feed • ${liveTime.toLocaleTimeString()}`}
                            size="small"
                            sx={{
                                bgcolor: '#DCFCE7',
                                color: '#22C55E',
                                fontWeight: '600',
                                fontSize: '11px',
                                height: '22px',
                                '@keyframes pulse': {
                                    '0%, 100%': { opacity: 1 },
                                    '50%': { opacity: 0.5 }
                                }
                            }}
                        />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<AddIcon />}
                        variant="outlined"
                        onClick={handleMarkAttendance}
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
                        Mark Attendance
                    </Button>
                    <Button
                        startIcon={<FileDownloadIcon />}
                        variant="contained"
                        onClick={handleExportReport}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '50px',
                            bgcolor: '#F97316',
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: '600',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: '#EA580C'
                            }
                        }}
                    >
                        Export Report
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

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    size="small"
                    startAdornment={<EventIcon sx={{ fontSize: 16, color: '#666', mr: 0.5 }} />}
                    sx={{
                        minWidth: 120,
                        bgcolor: '#fff',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        border: '1px solid #E8E8E8'
                    }}
                >
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="Yesterday">Yesterday</MenuItem>
                    <MenuItem value="This Week">This Week</MenuItem>
                    <MenuItem value="This Month">This Month</MenuItem>
                </Select>
                <Select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    size="small"
                    sx={{
                        minWidth: 120,
                        bgcolor: '#fff',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        border: '1px solid #E8E8E8'
                    }}
                >
                    <MenuItem value="All Branch">All Branch</MenuItem>
                    <MenuItem value="Branch 1">Branch 1</MenuItem>
                    <MenuItem value="Branch 2">Branch 2</MenuItem>
                </Select>
                <Select
                    value={filterStaff}
                    onChange={(e) => setFilterStaff(e.target.value)}
                    size="small"
                    sx={{
                        minWidth: 120,
                        bgcolor: '#fff',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        border: '1px solid #E8E8E8'
                    }}
                >
                    <MenuItem value="All Staff">All Staff</MenuItem>
                    <MenuItem value="Teaching">Teaching</MenuItem>
                    <MenuItem value="Non-Teaching">Non-Teaching</MenuItem>
                </Select>
                <Select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    size="small"
                    sx={{
                        minWidth: 120,
                        bgcolor: '#fff',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        border: '1px solid #E8E8E8'
                    }}
                >
                    <MenuItem value="All Dept">All Dept</MenuItem>
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                </Select>
            </Box>

            <Grid container spacing={2}>
                {/* Main Content - Left Side */}
                <Grid size={{ xs: 12, lg: 9 }}>
                    {/* Overview Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* Total Present */}
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                            <Card sx={{
                                border: '1px solid #22C55E',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#F0FDF4',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <CardContent sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Total Present
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                148<Typography component="span" sx={{ fontSize: '16px', color: '#999' }}>/162</Typography>
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.5 }}>
                                                <TrendingUpIcon sx={{ fontSize: 12, color: '#22C55E' }} />
                                                <Typography sx={{ fontSize: '10px', color: '#22C55E', fontWeight: '600' }}>
                                                    +4% vs yesterday
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#F0FDF4', width: 40, height: 40 }}>
                                            <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Total Absent */}
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                            <Card sx={{
                                border: '1px solid #DC2626',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#FEF2F2',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <CardContent sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Total Absent
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                6
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#DC2626', fontWeight: '600', mt: 0.5 }}>
                                                2 Unexcused
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#FEF2F2', width: 40, height: 40 }}>
                                            <CancelIcon sx={{ color: '#DC2626', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Late Arrivals */}
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                            <Card sx={{
                                border: '1px solid #F97316',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#FFF7ED',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <CardContent sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Late Arrivals
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                12
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#F97316', fontWeight: '600', mt: 0.5 }}>
                                                Avg delay: 15m
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#FFF7ED', width: 40, height: 40 }}>
                                            <AccessTimeIcon sx={{ color: '#F97316', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* On Leave */}
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                            <Card sx={{
                                border: '1px solid #3B82F6',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#EFF6FF',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <CardContent sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                On Leave
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                8
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#3B82F6', fontWeight: '600', mt: 0.5 }}>
                                                6 Planned, 2 Sick
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#EFF6FF', width: 40, height: 40 }}>
                                            <EventIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Overtime */}
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                            <Card sx={{
                                border: '1px solid #8B5CF6',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#F5F3FF',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <CardContent sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Overtime (Week)
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                38<Typography component="span" sx={{ fontSize: '16px', color: '#999' }}>h</Typography> 15<Typography component="span" sx={{ fontSize: '16px', color: '#999' }}>m</Typography>
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#8B5CF6', fontWeight: '600', mt: 0.5 }}>
                                                5 Staff contributing
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#F5F3FF', width: 40, height: 40 }}>
                                            <ScheduleIcon sx={{ color: '#8B5CF6', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Real-Time Attendance Feed */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                                    Today's Attendance
                                </Typography>
                                <Chip
                                    label={`${attendanceFeed.length} Staff Members`}
                                    size="small"
                                    sx={{
                                        bgcolor: '#E8EFFE',
                                        color: '#3457D5',
                                        fontWeight: '600',
                                        fontSize: '11px'
                                    }}
                                />
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Staff Member
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Time In
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Time Out
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Marked By
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Status
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {attendanceFeed.map((employee) => (
                                            <TableRow
                                                key={employee.id}
                                                sx={{
                                                    '&:hover': { bgcolor: '#F9FAFB' },
                                                    borderBottom: '1px solid #E8E8E8'
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d2', fontSize: '13px' }}>
                                                            {employee.avatar}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                                {employee.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                                {employee.title}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                        {employee.timeIn}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                        {employee.timeInDetail}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '13px', color: '#999' }}>
                                                        {employee.timeOut}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '500' }}>
                                                        {employee.markedBy}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusChip(employee.status, employee.statusColor)}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton size="small" sx={{ color: '#666' }}>
                                                        <VisibilityIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Button
                                    endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#F97316',
                                        '&:hover': {
                                            bgcolor: '#FFF7ED'
                                        }
                                    }}
                                >
                                    View Live Monitor
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Staff Attendance Overview */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                                    Staff Attendance Overview (This Week)
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#22C55E' }} />
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>Present</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#F97316' }} />
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>Late</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#DC2626' }} />
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>Absent</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Simple Bar Chart Visualization */}
                            <Box sx={{ mt: 3 }}>
                                {staffWeeklyData.map((staff, idx) => (
                                    <Box key={idx} sx={{ mb: 2 }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: '500', color: '#666', mb: 0.5 }}>
                                            {staff.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, height: 32, alignItems: 'stretch' }}>
                                            {staff.data.map((status, dayIdx) => (
                                                <Box
                                                    key={dayIdx}
                                                    sx={{
                                                        flex: 1,
                                                        bgcolor: status === 1 ? '#22C55E' : status === 2 ? '#F97316' : status === 3 ? '#DC2626' : '#E8E8E8',
                                                        borderRadius: '2px',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            opacity: 0.8,
                                                            transform: 'scaleY(1.05)'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                    {['Mon 24', 'Tue 25', 'Wed 26', 'Thu 27', 'Fri 28', 'Sat 29'].map((day) => (
                                        <Typography key={day} sx={{ flex: 1, fontSize: '10px', color: '#999', textAlign: 'center' }}>
                                            {day}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Button
                                    onClick={() => navigate('staff-attendance-overview')}
                                    endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#F97316',
                                        '&:hover': {
                                            bgcolor: '#FFF7ED'
                                        }
                                    }}
                                >
                                    View Staff Attendance Overview
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Side Panel */}
                <Grid size={{ xs: 12, lg: 3 }}>
                    {/* Attendance Exceptions */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                                    Attendance Exceptions
                                </Typography>
                                <Chip
                                    label={`${exceptions.length} Alert${exceptions.length > 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{
                                        bgcolor: '#FEF2F2',
                                        color: '#DC2626',
                                        fontWeight: '600',
                                        fontSize: '10px',
                                        height: '20px'
                                    }}
                                />
                            </Box>

                            {exceptions.map((exception, idx) => (
                                <Alert
                                    key={idx}
                                    severity={exception.severity}
                                    icon={<WarningIcon sx={{ fontSize: 18 }} />}
                                    sx={{
                                        mb: 1.5,
                                        border: '1px solid',
                                        borderColor:
                                            exception.severity === 'warning' ? '#FED7AA' :
                                                exception.severity === 'error' ? '#FCA5A5' :
                                                    '#BFDBFE',
                                        bgcolor:
                                            exception.severity === 'warning' ? '#FFF7ED' :
                                                exception.severity === 'error' ? '#FEF2F2' :
                                                    '#EFF6FF',
                                        '& .MuiAlert-message': {
                                            width: '100%'
                                        }
                                    }}
                                >
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                            <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                                                {exception.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#999' }}>
                                                {exception.time}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                            {exception.description}
                                        </Typography>
                                    </Box>
                                </Alert>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Detailed Log */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                                    Detailed Log
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Chip label="Day" size="small" sx={{ fontSize: '10px', height: '20px', fontWeight: '600' }} />
                                    <Chip label="Week" size="small" variant="outlined" sx={{ fontSize: '10px', height: '20px' }} />
                                    <Chip label="Month" size="small" variant="outlined" sx={{ fontSize: '10px', height: '20px' }} />
                                </Box>
                            </Box>

                            {detailedLog.map((log, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        mb: 1.5,
                                        p: 1,
                                        borderRadius: '4px',
                                        border: '1px solid #E8E8E8',
                                        '&:hover': {
                                            bgcolor: '#F9FAFB'
                                        }
                                    }}
                                >
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: log.color, fontSize: '11px' }}>
                                        {log.avatar}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                                            {log.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: '10px', color: '#999' }}>
                                            {log.role}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>
                                        {log.time}
                                    </Typography>
                                </Box>
                            ))}

                            <Button
                                fullWidth
                                variant="text"
                                endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#F97316',
                                    mt: 1,
                                    '&:hover': {
                                        bgcolor: '#FFF7ED'
                                    }
                                }}
                            >
                                View Full Detailed Log
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Monthly Attendance Report */}
                    <Card sx={{
                        border: '1px solid #F97316',
                        borderRadius: '4px',
                        boxShadow: 'none',
                        bgcolor: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)'
                    }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', mb: 1 }}>
                                Monthly Attendance Report
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 2 }}>
                                Complete staff attendance list for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<FileDownloadIcon />}
                                onClick={handleExportReport}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    bgcolor: '#fff',
                                    color: '#F97316',
                                    border: '1px solid #F97316',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        bgcolor: '#FFF7ED'
                                    }
                                }}
                            >
                                Download PDF
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
