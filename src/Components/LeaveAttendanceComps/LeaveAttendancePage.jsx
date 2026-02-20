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
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    TextField,
    InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

import StaffAttendanceOverviewPage from './StaffAttendanceOverviewPage';
import LeaveManagementPage from './LeaveManagementPage';
import ApprovalWorkflowPage from './ApprovalWorkflowPage';
import AttendanceReportsPage from './AttendanceReportsPage';

const today = new Date().toISOString().split('T')[0];

// Mock staff list for Add Attendance
const staffList = [
    { id: 1, staffId: 'ST001', name: 'Sarah Jenkins', department: 'Mathematics', role: 'Teacher', avatar: 'SJ' },
    { id: 2, staffId: 'ST002', name: 'David Ross', department: 'Marketing', role: 'Non-Teaching', avatar: 'DR' },
    { id: 3, staffId: 'ST003', name: 'Nivetha Arjun', department: 'Science', role: 'Teacher', avatar: 'NA' },
    { id: 4, staffId: 'ST004', name: 'John Doe', department: 'English', role: 'Teacher', avatar: 'JD' },
    { id: 5, staffId: 'ST005', name: 'Priya Sharma', department: 'Hindi', role: 'Teacher', avatar: 'PS' },
    { id: 6, staffId: 'ST006', name: 'Ramesh Kumar', department: 'Administration', role: 'Non-Teaching', avatar: 'RK' },
    { id: 7, staffId: 'ST007', name: 'Anjali Mehta', department: 'Computer Science', role: 'Teacher', avatar: 'AM' },
    { id: 8, staffId: 'ST008', name: 'Vikram Nair', department: 'Physical Education', role: 'Teacher', avatar: 'VN' },
];

// Mock data for attendance feed
const attendanceFeed = [
    { id: 1, name: "Sarah Jenkins", staffId: "ST001", avatar: "SJ", userType: "Teacher", role: "Teaching Staff", timeIn: "08:02 AM", status: "Present" },
    { id: 2, name: "David Ross",    staffId: "ST002", avatar: "DR", userType: "Staff",   role: "Non Teaching Staff", timeIn: "08:45 AM", status: "Late" },
    { id: 3, name: "Nivetha Arjun", staffId: "ST003", avatar: "NA", userType: "Teacher", role: "Teaching Staff", timeIn: "07:55 AM", status: "Present" },
    { id: 4, name: "John Doe",      staffId: "ST004", avatar: "JD", userType: "Teacher", role: "Teaching Staff", timeIn: "——",        status: "On Leave" },
    { id: 5, name: "Ramesh Kumar",  staffId: "ST006", avatar: "RK", userType: "Admin",   role: "Supporting Staff", timeIn: "——",      status: "Absent" },
];

// Mock pending leave requests
const leaveRequests = [
    { id: 1, name: 'Priya Sharma',  staffId: 'ST005', avatar: 'PS', type: 'Sick Leave',    dates: 'Feb 20 – 21', typeColor: '#DC2626', typeBg: '#FEE2E2' },
    { id: 2, name: 'Anjali Mehta',  staffId: 'ST007', avatar: 'AM', type: 'Casual Leave',  dates: 'Feb 22',      typeColor: '#3B82F6', typeBg: '#DBEAFE' },
    { id: 3, name: 'Vikram Nair',   staffId: 'ST008', avatar: 'VN', type: 'Emergency',     dates: 'Feb 19',      typeColor: '#F97316', typeBg: '#FFF7ED' },
];

// Exceptions
const exceptions = [
    { title: "Frequent Latecomer", description: "David Ross has been late 5 times this week.", severity: "warning", time: "Daily" },
    { title: "Frequent Latecomer", description: "Doss has been late 3 times this week.", severity: "warning", time: "Daily" },
];

const STATUS_OPTIONS = [
    { value: 'Present', color: '#22C55E' },
    { value: 'Absent', color: '#DC2626' },
    { value: 'Late', color: '#F97316' },
    { value: 'On Leave', color: '#3B82F6' },
];

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
    const [tabValue, setTabValue] = useState(0);
    const [liveTime, setLiveTime] = useState(new Date());

    // Add Attendance state
    const [attendanceDate, setAttendanceDate] = useState(today);
    const [deptFilter, setDeptFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [searchText, setSearchText] = useState('');
    const [attendanceMarks, setAttendanceMarks] = useState(() => {
        const init = {};
        staffList.forEach(s => { init[s.id] = 'Present'; });
        return init;
    });

    useEffect(() => {
        const timer = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleMarkChange = (staffId, value) => {
        setAttendanceMarks(prev => ({ ...prev, [staffId]: value }));
    };

    const handleSaveAttendance = () => {
        console.log('Saving attendance:', attendanceMarks);
        // TODO: API call
    };

    const filteredStaff = staffList.filter(s => {
        const matchDept = deptFilter === 'All' || s.department === deptFilter;
        const matchRole = roleFilter === 'All' || s.role === roleFilter;
        const matchSearch = s.name.toLowerCase().includes(searchText.toLowerCase()) || s.staffId.toLowerCase().includes(searchText.toLowerCase());
        return matchDept && matchRole && matchSearch;
    });

    const counts = {
        present: Object.values(attendanceMarks).filter(v => v === 'Present').length,
        absent: Object.values(attendanceMarks).filter(v => v === 'Absent').length,
        late: Object.values(attendanceMarks).filter(v => v === 'Late').length,
        onLeave: Object.values(attendanceMarks).filter(v => v === 'On Leave').length,
    };

    const departments = ['All', ...Array.from(new Set(staffList.map(s => s.department)))];

    // ─── Add Attendance Tab ───────────────────────────────────────────────────
    const renderAddAttendance = () => (
        <Box>
            {/* Sub-header */}
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                mb: 2.5, pb: 2, borderBottom: '1px solid #F0F0F0'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PeopleIcon sx={{ color: '#22C55E', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>
                            Mark Staff Attendance
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#888' }}>
                            {attendanceDate === today ? "Marking for today" : `Marking for ${attendanceDate}`}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.8,
                        bgcolor: '#fff', border: '1.5px solid #22C55E', borderRadius: '8px', px: 1.5, py: 0.5
                    }}>
                        <EventIcon sx={{ fontSize: 16, color: '#22C55E' }} />
                        <TextField
                            type="date"
                            size="small"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            variant="standard"
                            sx={{ width: '130px' }}
                            slotProps={{
                                input: { disableUnderline: true, style: { fontSize: '13px', fontWeight: '600', color: '#22C55E' } }
                            }}
                        />
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveAttendance}
                        sx={{
                            textTransform: 'none', fontSize: '13px', fontWeight: '600',
                            bgcolor: '#22C55E', borderRadius: '8px', px: 2.5,
                            '&:hover': { bgcolor: '#16A34A' }
                        }}
                    >
                        Save Attendance
                    </Button>
                </Box>
            </Box>

            {/* Summary counters */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {[
                    { label: 'Present', count: counts.present, color: '#22C55E', bg: '#F0FDF4', border: '#22C55E' },
                    { label: 'Absent', count: counts.absent, color: '#DC2626', bg: '#FEF2F2', border: '#DC2626' },
                    { label: 'Late', count: counts.late, color: '#F97316', bg: '#FFF7ED', border: '#F97316' },
                    { label: 'On Leave', count: counts.onLeave, color: '#3B82F6', bg: '#EFF6FF', border: '#3B82F6' },
                ].map((item) => (
                    <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }} key={item.label}>
                        <Card sx={{ boxShadow: 'none', border: `1px solid ${item.border}`, borderRadius: '4px', bgcolor: item.bg }}>
                            <CardContent sx={{ py: '12px !important' }}>
                                <Typography sx={{ fontSize: '11px', color: '#666' }}>{item.label}</Typography>
                                <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>{item.count}</Typography>
                                <Typography sx={{ fontSize: '10px', color: item.color, fontWeight: '600' }}>
                                    {((item.count / staffList.length) * 100).toFixed(0)}% of staff
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Filters */}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
                px: 2, py: 1.2, bgcolor: '#F8FAFC', border: '1px solid #E8EFF5', borderRadius: '8px', flexWrap: 'wrap'
            }}>
                <TextField
                    size="small"
                    placeholder="Search staff name or ID..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#aaa' }} /></InputAdornment>
                        }
                    }}
                    sx={{ width: '230px', bgcolor: '#fff', borderRadius: '6px' }}
                />
                <Select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150, bgcolor: '#fff', fontSize: '13px', borderRadius: '6px' }}
                >
                    {departments.map(d => <MenuItem key={d} value={d} sx={{ fontSize: '13px' }}>{d === 'All' ? 'All Departments' : d}</MenuItem>)}
                </Select>
                <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 140, bgcolor: '#fff', fontSize: '13px', borderRadius: '6px' }}
                >
                    <MenuItem value="All" sx={{ fontSize: '13px' }}>All Roles</MenuItem>
                    <MenuItem value="Teacher" sx={{ fontSize: '13px' }}>Teaching</MenuItem>
                    <MenuItem value="Non-Teaching" sx={{ fontSize: '13px' }}>Non-Teaching</MenuItem>
                </Select>
                <Typography sx={{ fontSize: '12px', color: '#888', ml: 'auto' }}>
                    {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
                </Typography>
            </Box>

            {/* Attendance Table */}
            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase', width: 50 }}>S.No</TableCell>
                                <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Staff Member</TableCell>
                                <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Attendance Action</TableCell>
                                <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Current Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography sx={{ fontSize: '13px', color: '#999', py: 3 }}>No staff found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((staff, idx) => {
                                    const mark = attendanceMarks[staff.id];
                                    const statusColor = mark === 'Present' ? '#22C55E' : mark === 'Absent' ? '#DC2626' : mark === 'Late' ? '#F97316' : '#3B82F6';
                                    const statusBg = mark === 'Present' ? '#DCFCE7' : mark === 'Absent' ? '#FEE2E2' : mark === 'Late' ? '#FFF7ED' : '#DBEAFE';
                                    return (
                                        <TableRow key={staff.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' }, borderBottom: '1px solid #F0F0F0' }}>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>{idx + 1}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                    <Avatar sx={{ width: 34, height: 34, bgcolor: '#1976d2', fontSize: '12px', fontWeight: '700' }}>
                                                        {staff.avatar}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{staff.name}</Typography>
                                                        <Typography sx={{ fontSize: '10px', color: '#999' }}>{staff.staffId}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '12px', color: '#555' }}>{staff.department}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={staff.role}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '10px', height: '20px', fontWeight: '600',
                                                        bgcolor: staff.role === 'Teacher' ? '#EDE9FE' : '#F0F9FA',
                                                        color: staff.role === 'Teacher' ? '#6D28D9' : '#0891B2',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <RadioGroup
                                                    row
                                                    value={mark}
                                                    onChange={(e) => handleMarkChange(staff.id, e.target.value)}
                                                    sx={{ gap: 0.5, flexWrap: 'wrap' }}
                                                >
                                                    {STATUS_OPTIONS.map(opt => (
                                                        <FormControlLabel
                                                            key={opt.value}
                                                            value={opt.value}
                                                            control={
                                                                <Radio
                                                                    size="small"
                                                                    sx={{
                                                                        p: 0.3,
                                                                        color: '#ccc',
                                                                        '&.Mui-checked': { color: opt.color },
                                                                    }}
                                                                />
                                                            }
                                                            label={
                                                                <Typography sx={{ fontSize: '12px', color: mark === opt.value ? opt.color : '#666', fontWeight: mark === opt.value ? '600' : '400' }}>
                                                                    {opt.value}
                                                                </Typography>
                                                            }
                                                            sx={{ mr: 1, ml: 0 }}
                                                        />
                                                    ))}
                                                </RadioGroup>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={mark}
                                                    size="small"
                                                    sx={{ bgcolor: statusBg, color: statusColor, fontWeight: '700', fontSize: '10px', height: '22px' }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderTop: '1px solid #F0F0F0', bgcolor: '#FAFAFA' }}>
                    <Typography sx={{ fontSize: '12px', color: '#888' }}>
                        Total: {filteredStaff.length} staff members
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveAttendance}
                        sx={{
                            textTransform: 'none', fontSize: '13px', fontWeight: '600',
                            bgcolor: '#22C55E', borderRadius: '8px', px: 3,
                            '&:hover': { bgcolor: '#16A34A' }
                        }}
                    >
                        Save Attendance
                    </Button>
                </Box>
            </Card>
        </Box>
    );

    // ─── Dashboard Tab ────────────────────────────────────────────────────────
    const renderDashboard = () => (
        <>
            <Grid container spacing={2}>
                {/* Main Content */}
                <Grid size={{ xs: 12, lg: 9 }}>
                    {/* Overview Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {[
                            { label: 'Total Present', value: '148', sub: '/162', border: '#22C55E', bg: '#F0FDF4', icon: CheckCircleIcon },
                            { label: 'Total Absent',  value: '6',               border: '#DC2626', bg: '#FEF2F2', icon: CancelIcon },
                            { label: 'Late Arrivals', value: '12',              border: '#F97316', bg: '#FFF7ED', icon: AccessTimeIcon },
                            { label: 'On Leave',      value: '8',               border: '#3B82F6', bg: '#EFF6FF', icon: EventIcon },
                        ].map((card) => {
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>Today's Attendance</Typography>
                                <Chip label={`${attendanceFeed.length} Staff Members`} size="small"
                                    sx={{ bgcolor: '#E8EFFE', color: '#3457D5', fontWeight: '600', fontSize: '11px' }} />
                            </Box>
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
                                        {attendanceFeed.map((employee, idx) => {
                                            const utConf  = USER_TYPE_CONFIG[employee.userType] || { color: '#666', bg: '#F5F5F5' };
                                            const roleConf = ROLE_CONFIG[employee.role]          || { color: '#666', bg: '#F5F5F5' };
                                            const canShowTime = employee.status === 'Present' || employee.status === 'Late';
                                            const attColor = employee.status === 'Present' ? '#22C55E'
                                                           : employee.status === 'Late'     ? '#F97316'
                                                           : employee.status === 'On Leave' ? '#3B82F6'
                                                           : '#DC2626';
                                            const attBg    = employee.status === 'Present' ? '#DCFCE7'
                                                           : employee.status === 'Late'     ? '#FFF7ED'
                                                           : employee.status === 'On Leave' ? '#DBEAFE'
                                                           : '#FEE2E2';
                                            const timeColor = employee.status === 'Late' ? '#F97316' : '#22C55E';
                                            const timeBg    = employee.status === 'Late' ? '#FFF7ED' : '#F0FDF4';
                                            const timeBorder = employee.status === 'Late' ? '#F97316' : '#22C55E';
                                            return (
                                                <TableRow key={employee.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' }, borderBottom: '1px solid #E8E8E8' }}>
                                                    <TableCell sx={{ width: 50 }}>
                                                        <Typography sx={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>{idx + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#1976d2', fontSize: '12px', fontWeight: '700' }}>{employee.avatar}</Avatar>
                                                            <Box>
                                                                <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{employee.name}</Typography>
                                                                <Typography sx={{ fontSize: '10px', color: '#999' }}>{employee.staffId}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={employee.userType} size="small"
                                                            sx={{ bgcolor: utConf.bg, color: utConf.color, fontWeight: '600', fontSize: '10px', height: '22px' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={employee.role} size="small"
                                                            sx={{ bgcolor: roleConf.bg, color: roleConf.color, fontWeight: '600', fontSize: '10px', height: '22px' }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={employee.status} size="small"
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
                                                                <Typography sx={{ fontSize: '12px', fontWeight: '600', color: timeColor }}>{employee.timeIn}</Typography>
                                                            </Box>
                                                        ) : (
                                                            <Typography sx={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>—</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={employee.status} size="small"
                                                            sx={{ bgcolor: attBg, color: attColor, fontWeight: '700', fontSize: '10px', height: '22px' }} />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Button
                                    onClick={() => setTabValue(1)}
                                    endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                                    sx={{ textTransform: 'none', fontSize: '13px', fontWeight: '600', color: '#F97316', '&:hover': { bgcolor: '#FFF7ED' } }}>
                                    View Attendance page
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Panel */}
                <Grid size={{ xs: 12, lg: 3 }}>
                    {/* Attendance Exceptions */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Attendance Exceptions</Typography>
                                <Chip label={`${exceptions.length} Alerts`} size="small"
                                    sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: '600', fontSize: '10px', height: '20px' }} />
                            </Box>
                            {exceptions.map((exception, idx) => (
                                <Alert key={idx} severity={exception.severity} icon={<WarningIcon sx={{ fontSize: 18 }} />}
                                    sx={{
                                        mb: 1.5, border: '1px solid',
                                        borderColor: exception.severity === 'warning' ? '#FED7AA' : '#FCA5A5',
                                        bgcolor: exception.severity === 'warning' ? '#FFF7ED' : '#FEF2F2',
                                        '& .MuiAlert-message': { width: '100%' }
                                    }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                            <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>{exception.title}</Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#999' }}>{exception.time}</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>{exception.description}</Typography>
                                    </Box>
                                </Alert>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Pending Leave Requests */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 2 }}>
                        <CardContent sx={{ pb: '12px !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Leave Requests</Typography>
                                <Chip
                                    label={`${leaveRequests.length} Pending`}
                                    size="small"
                                    sx={{ bgcolor: '#FFF7ED', color: '#F97316', fontWeight: '700', fontSize: '10px', height: '20px' }}
                                />
                            </Box>

                            {leaveRequests.map((req) => (
                                <Box key={req.id} sx={{
                                    mb: 1.2, p: 1, borderRadius: '6px',
                                    border: '1px solid #F0F0F0',
                                    '&:hover': { bgcolor: '#F9FAFB' }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#3457D5', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                                            {req.avatar}
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {req.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#aaa' }}>{req.staffId}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                        <Chip
                                            label={req.type}
                                            size="small"
                                            sx={{ bgcolor: req.typeBg, color: req.typeColor, fontWeight: '600', fontSize: '9px', height: '18px' }}
                                        />
                                        <Typography sx={{ fontSize: '10px', color: '#999' }}>{req.dates}</Typography>
                                    </Box>
                                </Box>
                            ))}

                            <Button fullWidth variant="text"
                                onClick={() => setTabValue(4)}
                                endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)', fontSize: '14px !important' }} />}
                                sx={{ textTransform: 'none', fontSize: '12px', fontWeight: '600', color: '#F97316', mt: 0.5, '&:hover': { bgcolor: '#FFF7ED' } }}>
                                View All Requests
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );

    const renderTabContent = () => {
        switch (tabValue) {
            case 0: return renderDashboard();
            case 1: return renderAddAttendance();
            case 2: return <StaffAttendanceOverviewPage isEmbedded={true} />;
            case 3: return <LeaveManagementPage isEmbedded={true} />;
            case 4: return <ApprovalWorkflowPage isEmbedded={true} />;
            case 5: return <AttendanceReportsPage isEmbedded={true} />;
            default: return renderDashboard();
        }
    };

    return (
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
    );
}
