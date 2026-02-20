import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    IconButton,
    TextField,
    Select,
    MenuItem,
    Avatar,
    Divider,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useNavigate } from 'react-router-dom';

// Matches USER_TYPE_CONFIG in AddAttendancePage
const USER_TYPES = ['All User Types', 'Super Admin', 'Admin', 'Staff', 'Teacher'];

// Matches ROLE_CONFIG in AddAttendancePage
const STAFF_CATEGORIES = ['All Categories', 'Teaching Staff', 'Non Teaching Staff', 'Supporting Staff'];

const staffAttendanceData = [
    {
        id: 1, name: 'John Smith', staffId: 'ST001',
        userType: 'Teacher', category: 'Teaching Staff', avatar: 'JS',
        attendance: {
            '01': { time: '08:45', status: 'present' }, '02': { time: '08:50', status: 'present' },
            '03': { time: '09:15', status: 'late' },    '04': { time: '08:40', status: 'present' },
            '05': { time: '08:35', status: 'present' }, '06': { time: '', status: 'weekend' },
            '07': { time: '', status: 'weekend' },      '08': { time: '08:55', status: 'present' },
            '09': { time: '', status: 'leave' },        '10': { time: '08:30', status: 'present' },
            '11': { time: '09:20', status: 'late' },    '12': { time: '08:42', status: 'present' },
            '13': { time: '', status: 'weekend' },      '14': { time: '', status: 'weekend' },
            '15': { time: '08:38', status: 'present' },
        },
    },
    {
        id: 2, name: 'Sarah Johnson', staffId: 'ST002',
        userType: 'Teacher', category: 'Teaching Staff', avatar: 'SJ',
        attendance: {
            '01': { time: '08:30', status: 'present' }, '02': { time: '08:28', status: 'present' },
            '03': { time: '08:45', status: 'present' }, '04': { time: '', status: 'absent' },
            '05': { time: '08:35', status: 'present' }, '06': { time: '', status: 'weekend' },
            '07': { time: '', status: 'weekend' },      '08': { time: '08:40', status: 'present' },
            '09': { time: '08:32', status: 'present' }, '10': { time: '08:50', status: 'present' },
            '11': { time: '08:25', status: 'present' }, '12': { time: '09:10', status: 'late' },
            '13': { time: '', status: 'weekend' },      '14': { time: '', status: 'weekend' },
            '15': { time: '08:33', status: 'present' },
        },
    },
    {
        id: 3, name: 'Michael Brown', staffId: 'ST003',
        userType: 'Staff', category: 'Non Teaching Staff', avatar: 'MB',
        attendance: {
            '01': { time: '08:25', status: 'present' }, '02': { time: '08:30', status: 'present' },
            '03': { time: '08:28', status: 'present' }, '04': { time: '08:35', status: 'present' },
            '05': { time: '', status: 'leave' },        '06': { time: '', status: 'weekend' },
            '07': { time: '', status: 'weekend' },      '08': { time: '08:45', status: 'present' },
            '09': { time: '08:38', status: 'present' }, '10': { time: '', status: 'absent' },
            '11': { time: '08:40', status: 'present' }, '12': { time: '08:32', status: 'present' },
            '13': { time: '', status: 'weekend' },      '14': { time: '', status: 'weekend' },
            '15': { time: '08:50', status: 'present' },
        },
    },
    {
        id: 4, name: 'Ramesh Kumar', staffId: 'ST004',
        userType: 'Admin', category: 'Non Teaching Staff', avatar: 'RK',
        attendance: {
            '01': { time: '09:00', status: 'present' }, '02': { time: '09:05', status: 'present' },
            '03': { time: '09:10', status: 'late' },    '04': { time: '09:00', status: 'present' },
            '05': { time: '', status: 'absent' },       '06': { time: '', status: 'weekend' },
            '07': { time: '', status: 'weekend' },      '08': { time: '09:00', status: 'present' },
            '09': { time: '', status: 'leave' },        '10': { time: '09:00', status: 'present' },
            '11': { time: '09:00', status: 'present' }, '12': { time: '09:00', status: 'present' },
            '13': { time: '', status: 'weekend' },      '14': { time: '', status: 'weekend' },
            '15': { time: '09:00', status: 'present' },
        },
    },
    {
        id: 5, name: 'Vikram Nair', staffId: 'ST005',
        userType: 'Staff', category: 'Supporting Staff', avatar: 'VN',
        attendance: {
            '01': { time: '08:15', status: 'present' }, '02': { time: '08:20', status: 'present' },
            '03': { time: '08:18', status: 'present' }, '04': { time: '08:22', status: 'present' },
            '05': { time: '08:16', status: 'present' }, '06': { time: '', status: 'weekend' },
            '07': { time: '', status: 'weekend' },      '08': { time: '', status: 'absent' },
            '09': { time: '08:20', status: 'present' }, '10': { time: '08:18', status: 'present' },
            '11': { time: '08:25', status: 'present' }, '12': { time: '', status: 'leave' },
            '13': { time: '', status: 'weekend' },      '14': { time: '', status: 'weekend' },
            '15': { time: '08:20', status: 'present' },
        },
    },
];

const today = new Date().toISOString().split('T')[0];
const VIEW_OPTIONS = [
    { label: '7 Days',   value: 7 },
    { label: '15 Days',  value: 15 },
    { label: 'From - To', value: 0 },
];

const getCellStyle = (status) => {
    const styles = {
        present: { bgcolor: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' },
        late:    { bgcolor: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80' },
        absent:  { bgcolor: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' },
        leave:   { bgcolor: '#E3F2FD', color: '#1565C0', border: '1px solid #90CAF9' },
        weekend: { bgcolor: '#F5F5F5', color: '#9E9E9E', border: '1px solid #E0E0E0' },
    };
    return styles[status] || {};
};

const LEGEND = [
    { label: 'Present', bgcolor: '#E8F5E9', border: '#A5D6A7' },
    { label: 'Late',    bgcolor: '#FFF3E0', border: '#FFCC80' },
    { label: 'Absent',  bgcolor: '#FFEBEE', border: '#EF9A9A' },
    { label: 'Leave',   bgcolor: '#E3F2FD', border: '#90CAF9' },
    { label: 'Weekend', bgcolor: '#F5F5F5', border: '#E0E0E0' },
];

const StaffAttendanceOverviewPage = ({ isEmbedded = false }) => {
    const navigate = useNavigate();

    // Filters
    const [searchQuery, setSearchQuery]       = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('All User Types');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');

    // View range
    const [viewDays, setViewDays]   = useState(7);   // 7 | 15 | 0 (custom)
    const [fromDate, setFromDate]   = useState(today);
    const [toDate, setToDate]       = useState(today);

    const [currentPage, setCurrentPage] = useState(1);
    const [liveTime, setLiveTime]       = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const formatTime = (date) =>
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const getCurrentMonthYear = () =>
        liveTime.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Generate date list for the chosen view
    const getVisibleDates = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const allDates = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            allDates.push({
                day: i.toString().padStart(2, '0'),
                dayOfWeek: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()],
                isWeekend: d.getDay() === 0 || d.getDay() === 6,
            });
        }

        if (viewDays === 0) {
            // Custom from-to
            const from = parseInt(fromDate.split('-')[2], 10);
            const to   = parseInt(toDate.split('-')[2], 10);
            return allDates.filter(d => {
                const day = parseInt(d.day, 10);
                return day >= Math.min(from, to) && day <= Math.max(from, to);
            });
        }
        // Last N days up to today
        const todayNum = now.getDate();
        const startDay = Math.max(1, todayNum - viewDays + 1);
        return allDates.filter(d => parseInt(d.day, 10) >= startDay && parseInt(d.day, 10) <= todayNum);
    };

    const getFilteredStaff = () =>
        staffAttendanceData.filter(s => {
            const matchSearch   = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  s.staffId.toLowerCase().includes(searchQuery.toLowerCase());
            const matchUserType = userTypeFilter === 'All User Types' || s.userType === userTypeFilter;
            const matchCategory = categoryFilter === 'All Categories' || s.category === categoryFilter;
            return matchSearch && matchUserType && matchCategory;
        });

    const calculateStats = () => {
        const filtered = getFilteredStaff();
        const dates    = getVisibleDates();
        let present = 0, late = 0, absent = 0, leave = 0;
        filtered.forEach(s => {
            dates.forEach(d => {
                const a = s.attendance[d.day];
                if (!a || a.status === 'weekend') return;
                if (a.status === 'present') present++;
                else if (a.status === 'late')   late++;
                else if (a.status === 'absent') absent++;
                else if (a.status === 'leave')  leave++;
            });
        });
        return { present, late, absent, leave };
    };

    const stats = calculateStats();
    const visibleDates = getVisibleDates();
    const filteredStaff = getFilteredStaff();

    const STAT_CARDS = [
        { title: 'Total Present', value: stats.present, icon: CheckCircleIcon, color: '#22C55E', border: '#22C55E', bg: '#F0FDF4' },
        { title: 'Total Late',    value: stats.late,    icon: AccessTimeIcon,  color: '#F97316', border: '#F97316', bg: '#FFF7ED' },
        { title: 'Total Leave',   value: stats.leave,   icon: EventBusyIcon,   color: '#3B82F6', border: '#3B82F6', bg: '#EFF6FF' },
        { title: 'Total Absent',  value: stats.absent,  icon: CancelIcon,      color: '#DC2626', border: '#DC2626', bg: '#FEF2F2' },
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{
            border: isEmbedded ? 'none' : '1px solid #E8E8E8',
            borderRadius: isEmbedded ? '0' : '20px',
            p: isEmbedded ? 0 : 2,
            height: isEmbedded ? 'auto' : '86vh',
            overflow: 'auto',
        }}>
            {/* Header — hidden when embedded */}
            {!isEmbedded && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => navigate(-1)}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography sx={{ fontSize: '24px', fontWeight: '700' }}>
                                    Staff Attendance Overview
                                </Typography>
                                <Typography sx={{ fontSize: '13px', color: '#666', mt: 0.5 }}>
                                    {getCurrentMonthYear()} • {formatTime(liveTime)}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}
                                sx={{ textTransform: 'none', borderRadius: '8px', borderColor: '#E8E8E8', color: '#333' }}>
                                Print
                            </Button>
                            <Button variant="contained" startIcon={<FileDownloadIcon />}
                                sx={{ textTransform: 'none', borderRadius: '8px', bgcolor: '#3457D5', '&:hover': { bgcolor: '#2847C4' } }}>
                                Export Report
                            </Button>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                </>
            )}

            {/* ── Filter Bar ──────────────────────────────────────────────── */}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
                px: 2, py: 1.2, bgcolor: '#F8FAFC', border: '1px solid #E8EFF5',
                borderRadius: '8px', flexWrap: 'wrap',
            }}>
                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Search staff name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 17, color: '#aaa' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{ width: '220px', bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />

                {/* User Type */}
                <Select
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150, bgcolor: '#fff', fontSize: '13px', borderRadius: '6px' }}
                >
                    {USER_TYPES.map(t => (
                        <MenuItem key={t} value={t} sx={{ fontSize: '13px' }}>{t}</MenuItem>
                    ))}
                </Select>

                {/* Staff Category */}
                <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 170, bgcolor: '#fff', fontSize: '13px', borderRadius: '6px' }}
                >
                    {STAFF_CATEGORIES.map(c => (
                        <MenuItem key={c} value={c} sx={{ fontSize: '13px' }}>{c}</MenuItem>
                    ))}
                </Select>

                <Typography sx={{ fontSize: '12px', color: '#888', ml: 'auto' }}>
                    {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
                </Typography>
            </Box>

            {/* ── View By bar ─────────────────────────────────────────────── */}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
                px: 2, py: 1.2, bgcolor: '#FAFAFA', border: '1px solid #E8E8E8',
                borderRadius: '8px', flexWrap: 'wrap',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DateRangeIcon sx={{ fontSize: 17, color: '#3457D5' }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }}>
                        View By:
                    </Typography>
                </Box>

                {VIEW_OPTIONS.map(opt => (
                    <Box
                        key={opt.value}
                        onClick={() => setViewDays(opt.value)}
                        sx={{
                            px: 2, py: 0.6, borderRadius: '20px', cursor: 'pointer',
                            fontSize: '13px', fontWeight: '600',
                            bgcolor: viewDays === opt.value ? '#3457D5' : '#fff',
                            color:   viewDays === opt.value ? '#fff' : '#555',
                            border: `1px solid ${viewDays === opt.value ? '#3457D5' : '#E0E0E0'}`,
                            transition: 'all 0.18s',
                            '&:hover': {
                                bgcolor: viewDays === opt.value ? '#2847C4' : '#EEF2FF',
                                borderColor: '#3457D5',
                                color: viewDays === opt.value ? '#fff' : '#3457D5',
                            },
                        }}
                    >
                        {opt.label}
                    </Box>
                ))}

                {/* Date pickers — only for From-To */}
                {viewDays === 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>From:</Typography>
                        <TextField
                            type="date"
                            size="small"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            sx={{
                                width: '140px', bgcolor: '#fff',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px', fontSize: '13px',
                                    '& fieldset': { borderColor: '#3457D5' },
                                },
                            }}
                        />
                        <Typography sx={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>To:</Typography>
                        <TextField
                            type="date"
                            size="small"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            sx={{
                                width: '140px', bgcolor: '#fff',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px', fontSize: '13px',
                                    '& fieldset': { borderColor: '#3457D5' },
                                },
                            }}
                        />
                        {fromDate && toDate && (
                            <Chip
                                label={`${Math.abs(parseInt(toDate.split('-')[2]) - parseInt(fromDate.split('-')[2])) + 1} days`}
                                size="small"
                                sx={{ bgcolor: '#E8EFFE', color: '#3457D5', fontWeight: '600', fontSize: '11px', height: '22px' }}
                            />
                        )}
                    </Box>
                )}
            </Box>

            {/* ── Summary Cards ───────────────────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {STAT_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Grid key={card.title} size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <Card sx={{
                                boxShadow: 'none', border: `1px solid ${card.border}`,
                                borderRadius: '4px', bgcolor: card.bg,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                            }}>
                                <CardContent sx={{ py: '14px !important' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                {card.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.1 }}>
                                                {card.value}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: card.color, fontWeight: '600', mt: 0.5 }}>
                                                {viewDays === 0 ? 'Custom range' : `Last ${viewDays} days`}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            width: 38, height: 38, borderRadius: '10px', bgcolor: card.bg,
                                            border: `1px solid ${card.border}`,
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

            {/* ── Detailed Attendance Log ──────────────────────────────────── */}
            <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '8px', boxShadow: 'none' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600' }}>
                            Detailed Attendance Log
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                icon={<CalendarTodayIcon sx={{ fontSize: '13px !important' }} />}
                                label={`${filteredStaff.length} Staff · ${visibleDates.length} Days`}
                                size="small"
                                sx={{ bgcolor: '#E8EFFE', color: '#3457D5', fontWeight: '600', fontSize: '11px' }}
                            />
                        </Box>
                    </Box>

                    {filteredStaff.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6, color: '#999' }}>
                            <Typography sx={{ fontSize: '15px', fontWeight: '600', mb: 0.5 }}>No Staff Members Found</Typography>
                            <Typography sx={{ fontSize: '12px' }}>Try adjusting your search or filter criteria</Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer sx={{
                                overflowX: 'auto',
                                '&::-webkit-scrollbar': { height: '6px' },
                                '&::-webkit-scrollbar-track': { bgcolor: '#F5F5F5', borderRadius: '4px' },
                                '&::-webkit-scrollbar-thumb': { bgcolor: '#BDBDBD', borderRadius: '4px' },
                            }}>
                                <Table size="small" sx={{ minWidth: 800 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableCell sx={{
                                                position: 'sticky', left: 0, bgcolor: '#F9FAFB', zIndex: 2,
                                                borderRight: '2px solid #E8E8E8', fontWeight: '600',
                                                fontSize: '11px', color: '#666', textTransform: 'uppercase', minWidth: 200,
                                            }}>
                                                Staff Member
                                            </TableCell>
                                            {visibleDates.map(date => (
                                                <TableCell key={date.day} align="center" sx={{
                                                    bgcolor: date.isWeekend ? '#F5F5F5' : '#F9FAFB',
                                                    fontWeight: '600', fontSize: '11px', minWidth: 72,
                                                    borderLeft: '1px solid #E8E8E8', py: 1,
                                                }}>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '700', color: date.isWeekend ? '#bbb' : '#333' }}>
                                                        {date.day}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#aaa' }}>
                                                        {date.dayOfWeek}
                                                    </Typography>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredStaff.map(staff => (
                                            <TableRow key={staff.id} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                                                <TableCell sx={{
                                                    position: 'sticky', left: 0, bgcolor: '#fff', zIndex: 1,
                                                    borderRight: '2px solid #E8E8E8',
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#3457D5', fontSize: '12px', fontWeight: '700' }}>
                                                            {staff.avatar}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                                {staff.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#999' }}>
                                                                {staff.staffId} · {staff.userType}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                {visibleDates.map(date => {
                                                    const a = staff.attendance[date.day];
                                                    return (
                                                        <TableCell key={date.day} align="center" sx={{
                                                            ...getCellStyle(a?.status),
                                                            borderLeft: '1px solid #E8E8E8', p: 0.8,
                                                            cursor: 'pointer', transition: 'opacity 0.2s',
                                                            '&:hover': { opacity: 0.75 },
                                                        }}>
                                                            {a?.status === 'weekend' ? (
                                                                <Typography sx={{ fontSize: '11px', color: '#ccc' }}>–</Typography>
                                                            ) : a?.status === 'absent' ? (
                                                                <Typography sx={{ fontSize: '10px', fontWeight: '700' }}>Abs</Typography>
                                                            ) : a?.status === 'leave' ? (
                                                                <Typography sx={{ fontSize: '10px', fontWeight: '700' }}>Lv</Typography>
                                                            ) : a?.status === 'late' ? (
                                                                <Typography sx={{ fontSize: '10px', fontWeight: '700' }}>{a.time}</Typography>
                                                            ) : (
                                                                <Typography sx={{ fontSize: '10px', fontWeight: '600' }}>{a?.time ?? '–'}</Typography>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Legend */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: '1px solid #F0F0F0', flexWrap: 'wrap' }}>
                                {LEGEND.map(l => (
                                    <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                        <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: l.bgcolor, border: `1px solid ${l.border}` }} />
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>{l.label}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Pagination */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #F0F0F0' }}>
                                <Typography sx={{ fontSize: '12px', color: '#888' }}>
                                    Showing {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
                                </Typography>
                                <Pagination
                                    count={Math.max(1, Math.ceil(filteredStaff.length / 10))}
                                    page={currentPage}
                                    onChange={(e, page) => setCurrentPage(page)}
                                    color="primary"
                                    size="small"
                                    sx={{ '& .MuiPaginationItem-root': { borderRadius: '6px' } }}
                                />
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default StaffAttendanceOverviewPage;
