import React, { useState, useMemo } from 'react';
import {
    Box, Card, CardContent, Grid, Typography, IconButton, Button,
    Chip, Divider, Select, MenuItem, TextField, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, LinearProgress,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const STATUS_CONFIG = {
    Present: { bg: '#DCFCE7', color: '#16A34A', dot: '#16A34A', Icon: CheckCircleIcon },
    Late:    { bg: '#FEF3C7', color: '#D97706', dot: '#D97706', Icon: AccessTimeIcon  },
    Absent:  { bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626', Icon: CancelIcon      },
    Leave:   { bg: '#EDE9FE', color: '#7C3AED', dot: '#7C3AED', Icon: EventBusyIcon   },
};

const CATEGORY_CONFIG = {
    'Teaching Staff':     { bg: '#DCFCE7', color: '#16A34A' },
    'Non-Teaching Staff': { bg: '#DBEAFE', color: '#2563EB' },
    'Supporting Staff':   { bg: '#FFF7ED', color: '#EA580C' },
};

const STAFF_LIST = [
    { id: 'ST001', name: 'Sarah Jenkins', department: 'Mathematics',  category: 'Teaching Staff',     avatar: 'SJ', avatarColor: '#1976D2' },
    { id: 'ST002', name: 'David Ross',    department: 'Marketing',    category: 'Non-Teaching Staff', avatar: 'DR', avatarColor: '#7C3AED' },
    { id: 'ST003', name: 'Nivetha Arjun', department: 'Science',      category: 'Teaching Staff',     avatar: 'NA', avatarColor: '#0891B2' },
    { id: 'ST004', name: 'John Doe',      department: 'English',      category: 'Teaching Staff',     avatar: 'JD', avatarColor: '#DC2626' },
    { id: 'ST005', name: 'Priya Sharma',  department: 'Hindi',        category: 'Teaching Staff',     avatar: 'PS', avatarColor: '#EA580C' },
    { id: 'ST006', name: 'Emma Wilson',   department: 'English',      category: 'Teaching Staff',     avatar: 'EW', avatarColor: '#16A34A' },
    { id: 'ST007', name: 'Ravi Kumar',    department: 'Admin Office', category: 'Supporting Staff',   avatar: 'RK', avatarColor: '#D97706' },
    { id: 'ST008', name: 'Meena Patel',   department: 'HR',           category: 'Admin',              avatar: 'MP', avatarColor: '#E91E63' },
];

const ATTENDANCE_RECORDS = [
    { id: 1,  staffId: 'ST001', date: '2026-02-10', status: 'Present', loginTime: '08:50 AM', logoutTime: '05:10 PM' },
    { id: 2,  staffId: 'ST001', date: '2026-02-11', status: 'Late',    loginTime: '09:25 AM', logoutTime: '05:00 PM' },
    { id: 3,  staffId: 'ST001', date: '2026-02-12', status: 'Present', loginTime: '08:45 AM', logoutTime: '05:05 PM' },
    { id: 4,  staffId: 'ST001', date: '2026-02-13', status: 'Present', loginTime: '08:55 AM', logoutTime: '04:58 PM' },
    { id: 5,  staffId: 'ST001', date: '2026-02-16', status: 'Leave',   loginTime: '—', logoutTime: '—', leaveType: 'Casual Leave' },
    { id: 6,  staffId: 'ST001', date: '2026-02-17', status: 'Present', loginTime: '08:50 AM', logoutTime: '05:00 PM' },
    { id: 7,  staffId: 'ST001', date: '2026-02-18', status: 'Present', loginTime: '08:48 AM', logoutTime: '04:55 PM' },
    { id: 8,  staffId: 'ST001', date: '2026-02-19', status: 'Present', loginTime: '08:52 AM', logoutTime: '05:02 PM' },
    { id: 9,  staffId: 'ST002', date: '2026-02-10', status: 'Present', loginTime: '09:00 AM', logoutTime: '05:30 PM' },
    { id: 10, staffId: 'ST002', date: '2026-02-11', status: 'Present', loginTime: '09:05 AM', logoutTime: '05:25 PM' },
    { id: 11, staffId: 'ST002', date: '2026-02-12', status: 'Absent',  loginTime: '—', logoutTime: '—' },
    { id: 12, staffId: 'ST002', date: '2026-02-13', status: 'Late',    loginTime: '09:45 AM', logoutTime: '05:30 PM' },
    { id: 13, staffId: 'ST002', date: '2026-02-16', status: 'Present', loginTime: '09:00 AM', logoutTime: '05:28 PM' },
    { id: 14, staffId: 'ST002', date: '2026-02-17', status: 'Absent',  loginTime: '—', logoutTime: '—' },
    { id: 15, staffId: 'ST002', date: '2026-02-18', status: 'Present', loginTime: '09:02 AM', logoutTime: '05:30 PM' },
    { id: 16, staffId: 'ST002', date: '2026-02-19', status: 'Present', loginTime: '09:00 AM', logoutTime: '05:20 PM' },
    { id: 17, staffId: 'ST003', date: '2026-02-10', status: 'Present', loginTime: '08:40 AM', logoutTime: '04:50 PM' },
    { id: 18, staffId: 'ST003', date: '2026-02-11', status: 'Present', loginTime: '08:45 AM', logoutTime: '05:00 PM' },
    { id: 19, staffId: 'ST003', date: '2026-02-12', status: 'Leave',   loginTime: '—', logoutTime: '—', leaveType: 'Planned Leave' },
    { id: 20, staffId: 'ST003', date: '2026-02-13', status: 'Leave',   loginTime: '—', logoutTime: '—', leaveType: 'Planned Leave' },
    { id: 21, staffId: 'ST003', date: '2026-02-16', status: 'Present', loginTime: '08:42 AM', logoutTime: '05:05 PM' },
    { id: 22, staffId: 'ST003', date: '2026-02-17', status: 'Present', loginTime: '08:50 AM', logoutTime: '05:10 PM' },
    { id: 23, staffId: 'ST003', date: '2026-02-18', status: 'Present', loginTime: '08:38 AM', logoutTime: '05:00 PM' },
    { id: 24, staffId: 'ST003', date: '2026-02-19', status: 'Present', loginTime: '08:44 AM', logoutTime: '04:55 PM' },
    { id: 25, staffId: 'ST004', date: '2026-02-10', status: 'Absent',  loginTime: '—', logoutTime: '—' },
    { id: 26, staffId: 'ST004', date: '2026-02-11', status: 'Present', loginTime: '08:55 AM', logoutTime: '05:05 PM' },
    { id: 27, staffId: 'ST004', date: '2026-02-12', status: 'Present', loginTime: '08:50 AM', logoutTime: '05:00 PM' },
    { id: 28, staffId: 'ST004', date: '2026-02-13', status: 'Present', loginTime: '08:52 AM', logoutTime: '04:58 PM' },
    { id: 29, staffId: 'ST004', date: '2026-02-16', status: 'Late',    loginTime: '09:30 AM', logoutTime: '05:15 PM' },
    { id: 30, staffId: 'ST004', date: '2026-02-17', status: 'Absent',  loginTime: '—', logoutTime: '—' },
    { id: 31, staffId: 'ST004', date: '2026-02-18', status: 'Present', loginTime: '08:58 AM', logoutTime: '05:05 PM' },
    { id: 32, staffId: 'ST004', date: '2026-02-19', status: 'Present', loginTime: '08:53 AM', logoutTime: '05:00 PM' },
    { id: 33, staffId: 'ST005', date: '2026-02-10', status: 'Leave',   loginTime: '—', logoutTime: '—', leaveType: 'Sick Leave' },
    { id: 34, staffId: 'ST005', date: '2026-02-11', status: 'Leave',   loginTime: '—', logoutTime: '—', leaveType: 'Sick Leave' },
    { id: 35, staffId: 'ST005', date: '2026-02-12', status: 'Present', loginTime: '08:50 AM', logoutTime: '05:00 PM' },
    { id: 36, staffId: 'ST005', date: '2026-02-13', status: 'Present', loginTime: '08:48 AM', logoutTime: '04:55 PM' },
    { id: 37, staffId: 'ST005', date: '2026-02-16', status: 'Present', loginTime: '08:52 AM', logoutTime: '05:02 PM' },
    { id: 38, staffId: 'ST005', date: '2026-02-17', status: 'Late',    loginTime: '09:20 AM', logoutTime: '05:00 PM' },
    { id: 39, staffId: 'ST005', date: '2026-02-18', status: 'Present', loginTime: '08:50 AM', logoutTime: '05:05 PM' },
    { id: 40, staffId: 'ST005', date: '2026-02-19', status: 'Present', loginTime: '08:45 AM', logoutTime: '05:00 PM' },
    { id: 41, staffId: 'ST006', date: '2026-02-10', status: 'Present', loginTime: '08:35 AM', logoutTime: '04:45 PM' },
    { id: 42, staffId: 'ST006', date: '2026-02-11', status: 'Present', loginTime: '08:40 AM', logoutTime: '05:00 PM' },
    { id: 43, staffId: 'ST006', date: '2026-02-12', status: 'Late',    loginTime: '09:15 AM', logoutTime: '05:05 PM' },
    { id: 44, staffId: 'ST006', date: '2026-02-13', status: 'Present', loginTime: '08:38 AM', logoutTime: '05:00 PM' },
    { id: 45, staffId: 'ST006', date: '2026-02-16', status: 'Present', loginTime: '08:42 AM', logoutTime: '05:00 PM' },
    { id: 46, staffId: 'ST006', date: '2026-02-17', status: 'Leave',   loginTime: '—', logoutTime: '—', leaveType: 'Sick Leave' },
    { id: 47, staffId: 'ST006', date: '2026-02-18', status: 'Leave',   loginTime: '—', logoutTime: '—', leaveType: 'Sick Leave' },
    { id: 48, staffId: 'ST006', date: '2026-02-19', status: 'Present', loginTime: '08:40 AM', logoutTime: '04:55 PM' },
    { id: 49, staffId: 'ST007', date: '2026-02-10', status: 'Present', loginTime: '08:30 AM', logoutTime: '05:00 PM' },
    { id: 50, staffId: 'ST007', date: '2026-02-11', status: 'Present', loginTime: '08:35 AM', logoutTime: '05:05 PM' },
    { id: 51, staffId: 'ST007', date: '2026-02-12', status: 'Present', loginTime: '08:28 AM', logoutTime: '05:00 PM' },
    { id: 52, staffId: 'ST007', date: '2026-02-13', status: 'Present', loginTime: '08:32 AM', logoutTime: '04:58 PM' },
    { id: 53, staffId: 'ST007', date: '2026-02-16', status: 'Present', loginTime: '08:30 AM', logoutTime: '05:00 PM' },
    { id: 54, staffId: 'ST007', date: '2026-02-17', status: 'Present', loginTime: '08:35 AM', logoutTime: '05:05 PM' },
    { id: 55, staffId: 'ST007', date: '2026-02-18', status: 'Present', loginTime: '08:30 AM', logoutTime: '05:00 PM' },
    { id: 56, staffId: 'ST007', date: '2026-02-19', status: 'Present', loginTime: '08:32 AM', logoutTime: '05:00 PM' },
    { id: 57, staffId: 'ST008', date: '2026-02-10', status: 'Present', loginTime: '09:00 AM', logoutTime: '06:00 PM' },
    { id: 58, staffId: 'ST008', date: '2026-02-11', status: 'Late',    loginTime: '09:35 AM', logoutTime: '06:10 PM' },
    { id: 59, staffId: 'ST008', date: '2026-02-12', status: 'Present', loginTime: '09:00 AM', logoutTime: '06:00 PM' },
    { id: 60, staffId: 'ST008', date: '2026-02-13', status: 'Present', loginTime: '09:05 AM', logoutTime: '06:05 PM' },
    { id: 61, staffId: 'ST008', date: '2026-02-16', status: 'Present', loginTime: '09:00 AM', logoutTime: '06:00 PM' },
    { id: 62, staffId: 'ST008', date: '2026-02-17', status: 'Present', loginTime: '09:02 AM', logoutTime: '06:00 PM' },
    { id: 63, staffId: 'ST008', date: '2026-02-18', status: 'Absent',  loginTime: '—', logoutTime: '—' },
    { id: 64, staffId: 'ST008', date: '2026-02-19', status: 'Present', loginTime: '09:00 AM', logoutTime: '06:00 PM' },
];

const TODAY = '2026-02-19';

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtDay = (d) =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });

const BORDER = '1px solid #F0D0D8';
const HEAD_BG = '#FDE8EC';
const headCell = {
    border: BORDER,
    fontWeight: '700',
    fontSize: '12px',
    color: '#9B2335',
    textAlign: 'center',
    py: 1.5,
    px: 1.5,
    whiteSpace: 'nowrap',
    bgcolor: HEAD_BG,
};
const bodyCell = {
    border: BORDER,
    fontSize: '13px',
    color: '#1a1a1a',
    textAlign: 'center',
    py: 1.4,
    px: 1.5,
};

export default function AttendanceReportsPage({ isEmbedded = false }) {
    const navigate = useNavigate();

    const [todayActive,    setTodayActive]    = useState(false);
    const [fromDate,       setFromDate]       = useState('2026-02-10');
    const [toDate,         setToDate]         = useState('2026-02-19');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter,   setStatusFilter]   = useState('All');
    const [staffSearch,    setStaffSearch]    = useState('');
    const [reportStaff,    setReportStaff]    = useState(null);

    const activateToday = () => {
        setTodayActive(true);
        setFromDate(TODAY);
        setToDate(TODAY);
    };
    const handleFromChange = (val) => { setFromDate(val); setTodayActive(false); };
    const handleToChange   = (val) => { setToDate(val);   setTodayActive(false); };

    const staffSummary = useMemo(() => {
        const grouped = {};
        ATTENDANCE_RECORDS.forEach((rec) => {
            if (fromDate && rec.date < fromDate) return;
            if (toDate   && rec.date > toDate)   return;
            const staff = STAFF_LIST.find(s => s.id === rec.staffId);
            if (!staff) return;
            if (categoryFilter !== 'All' && staff.category !== categoryFilter) return;
            if (staffSearch.trim()) {
                const q = staffSearch.trim().toLowerCase();
                if (!staff.name.toLowerCase().includes(q) && !staff.id.toLowerCase().includes(q)) return;
            }
            if (!grouped[rec.staffId]) grouped[rec.staffId] = { staff, recs: [] };
            grouped[rec.staffId].recs.push(rec);
        });

        return Object.values(grouped)
            .map(({ staff, recs }) => {
                const total   = recs.length;
                const present = recs.filter(r => r.status === 'Present').length;
                const late    = recs.filter(r => r.status === 'Late').length;
                const absent  = recs.filter(r => r.status === 'Absent').length;
                const leave   = recs.filter(r => r.status === 'Leave').length;
                const rate    = total ? Math.round(((present + late) / total) * 100) : 0;
                return { staff, recs, total, present, late, absent, leave, rate };
            })
            .filter(row =>
                statusFilter === 'All'     ? true :
                statusFilter === 'Present' ? row.present > 0 :
                statusFilter === 'Late'    ? row.late    > 0 :
                statusFilter === 'Absent'  ? row.absent  > 0 :
                                             row.leave   > 0
            );
    }, [fromDate, toDate, categoryFilter, staffSearch, statusFilter]);

    const kpis = useMemo(() => ({
        staff:   staffSummary.length,
        present: staffSummary.reduce((s, r) => s + r.present, 0),
        late:    staffSummary.reduce((s, r) => s + r.late,    0),
        absent:  staffSummary.reduce((s, r) => s + r.absent,  0),
        leave:   staffSummary.reduce((s, r) => s + r.leave,   0),
    }), [staffSummary]);

    const dialogRecords = useMemo(() => {
        if (!reportStaff) return [];
        return ATTENDANCE_RECORDS
            .filter(r => {
                if (r.staffId !== reportStaff.id) return false;
                if (fromDate && r.date < fromDate) return false;
                if (toDate   && r.date > toDate)   return false;
                return true;
            })
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [reportStaff, fromDate, toDate]);

    const dialogStats = useMemo(() => {
        const p  = dialogRecords.filter(r => r.status === 'Present').length;
        const l  = dialogRecords.filter(r => r.status === 'Late').length;
        const a  = dialogRecords.filter(r => r.status === 'Absent').length;
        const lv = dialogRecords.filter(r => r.status === 'Leave').length;
        const total = dialogRecords.length;
        return { present: p, late: l, absent: a, leave: lv, rate: total ? Math.round(((p + l) / total) * 100) : 0 };
    }, [dialogRecords]);

    const handleClearFilters = () => {
        setTodayActive(false);
        setFromDate('2026-02-10');
        setToDate('2026-02-19');
        setCategoryFilter('All'); setStatusFilter('All'); setStaffSearch('');
    };

    const handleExportSummary = () => {
        const headers = ['S.No', 'Staff Name', 'Staff ID', 'Category', 'Working Days', 'Present', 'Late', 'Absent', 'Leave', 'Attendance %'];
        const rows = staffSummary.map((row, idx) => [
            idx + 1,
            row.staff.name,
            row.staff.id,
            row.staff.category,
            row.total,
            row.present,
            row.late,
            row.absent,
            row.leave,
            `${row.rate}%`,
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 10 }, { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 14 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Summary');
        const range = `${fmtDate(fromDate)} to ${fmtDate(toDate)}`.replace(/,/g, '');
        XLSX.writeFile(wb, `Staff_Attendance_Summary_${range}.xlsx`);
    };

    const handleExportIndividual = () => {
        if (!reportStaff || dialogRecords.length === 0) return;
        const headers = ['Date', 'Day', 'Status', 'Leave Type', 'Login Time'];
        const rows = dialogRecords.map(rec => [
            fmtDate(rec.date),
            fmtDay(rec.date),
            rec.status,
            rec.leaveType || '—',
            rec.loginTime,
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [{ wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 18 }, { wch: 14 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Daily Log');
        const safeName = reportStaff.name.replace(/\s+/g, '_');
        XLSX.writeFile(wb, `${safeName}_Attendance_Log.xlsx`);
    };

    const categoryChip = (cat) => {
        const cfg = CATEGORY_CONFIG[cat] || { bg: '#F3F4F6', color: '#666' };
        return (
            <Chip label={cat} size="small" sx={{
                bgcolor: cfg.bg, color: cfg.color, fontWeight: '600',
                fontSize: '10px', borderRadius: '5px', height: 20,
            }} />
        );
    };

    const RateCell = ({ rate }) => (
        <Box sx={{ minWidth: 80 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: '700', color: rate >= 90 ? '#16A34A' : rate >= 70 ? '#D97706' : '#DC2626', mb: 0.5 }}>
                {rate}%
            </Typography>
            <LinearProgress
                variant="determinate"
                value={rate}
                sx={{
                    height: 5, borderRadius: 3,
                    bgcolor: '#F0F0F0',
                    '& .MuiLinearProgress-bar': {
                        bgcolor: rate >= 90 ? '#16A34A' : rate >= 70 ? '#D97706' : '#DC2626',
                        borderRadius: 3,
                    },
                }}
            />
        </Box>
    );

    return (
        <Box sx={{
            border: isEmbedded ? 'none' : '1px solid #ccc',
            borderRadius: isEmbedded ? '0' : '20px',
            p: isEmbedded ? 1 : 2,
            bgcolor: '#F8F9FB',
            height: isEmbedded ? 'auto' : '86vh',
            overflow: 'auto',
        }}>
            {!isEmbedded && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 35, height: 35 }}>
                        <ArrowBackIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>Attendance Reports</Typography>
                        <Typography sx={{ fontSize: '13px', color: '#888' }}>Analyse and export staff attendance data</Typography>
                    </Box>
                </Box>
            )}

            <Card sx={{ border: '1px solid #E0E4EA', borderRadius: '6px', boxShadow: 'none', mb: 2.5, bgcolor: '#fff' }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <CalendarTodayIcon sx={{ fontSize: 15, color: '#888' }} />
                            <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#555', whiteSpace: 'nowrap' }}>Date Range:</Typography>
                        </Box>

                        <Chip
                            label="Today"
                            onClick={activateToday}
                            sx={{
                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                bgcolor: todayActive ? '#F97316' : '#F3F4F6',
                                color:  todayActive ? '#fff'    : '#555',
                                border: `1.5px solid ${todayActive ? '#F97316' : 'transparent'}`,
                                '&:hover': { bgcolor: todayActive ? '#EA580C' : '#E8E8E8' },
                                transition: '0.15s',
                            }}
                        />

                        <TextField
                            type="date" size="small" label="From"
                            value={fromDate}
                            onChange={e => handleFromChange(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ width: 155, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '12px' } }}
                        />

                        <TextField
                            type="date" size="small" label="To"
                            value={toDate}
                            onChange={e => handleToChange(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ width: 155, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '12px' } }}
                        />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 0.5 }}>
                            <FilterListIcon sx={{ fontSize: 15, color: '#888' }} />
                            <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#555' }}>Filters:</Typography>
                        </Box>

                        <TextField
                            size="small"
                            placeholder="Search by name or ID..."
                            value={staffSearch}
                            onChange={e => setStaffSearch(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                                            <SearchIcon sx={{ fontSize: 16, color: staffSearch ? '#9B2335' : '#aaa' }} />
                                        </Box>
                                    ),
                                    endAdornment: staffSearch ? (
                                        <IconButton size="small" onClick={() => setStaffSearch('')} sx={{ p: 0.3 }}>
                                            <CloseIcon sx={{ fontSize: 14, color: '#aaa' }} />
                                        </IconButton>
                                    ) : null,
                                }
                            }}
                            sx={{
                                minWidth: 220,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px', fontSize: '13px',
                                    '&.Mui-focused fieldset': { borderColor: '#9B2335' },
                                },
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 175 }}>
                            <InputLabel sx={{ fontSize: '13px' }}>Staff Category</InputLabel>
                            <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} label="Staff Category" sx={{ borderRadius: '8px', fontSize: '13px' }}>
                                <MenuItem value="All">All Categories</MenuItem>
                                {Object.keys(CATEGORY_CONFIG).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 165 }}>
                            <InputLabel sx={{ fontSize: '13px' }}>Attendance Status</InputLabel>
                            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Attendance Status" sx={{ borderRadius: '8px', fontSize: '13px' }}>
                                <MenuItem value="All">All Status</MenuItem>
                                {Object.keys(STATUS_CONFIG).map(s => (
                                    <MenuItem key={s} value={s}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_CONFIG[s].dot }} />{s}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button size="small" onClick={handleClearFilters} sx={{
                            textTransform: 'none', fontSize: '12px', fontWeight: '600',
                            borderRadius: '8px', color: '#888', border: '1px solid #ddd',
                            '&:hover': { borderColor: '#bbb', bgcolor: '#F9FAFB' },
                        }}>
                            Clear Filters
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {[
                    { label: 'Total Staff',   value: kpis.staff,   color: '#1976D2', bg: '#EFF6FF', iconBg: '#DBEAFE', Icon: PersonIcon      },
                    { label: 'Present Days',  value: kpis.present, color: '#16A34A', bg: '#F0FDF4', iconBg: '#DCFCE7', Icon: CheckCircleIcon  },
                    { label: 'Late Arrivals', value: kpis.late,    color: '#D97706', bg: '#FFFBEB', iconBg: '#FEF3C7', Icon: AccessTimeIcon   },
                    { label: 'Absent Days',   value: kpis.absent,  color: '#DC2626', bg: '#FEF2F2', iconBg: '#FEE2E2', Icon: CancelIcon       },
                    { label: 'Leave Days',    value: kpis.leave,   color: '#7C3AED', bg: '#FAF5FF', iconBg: '#EDE9FE', Icon: EventBusyIcon    },
                ].map(c => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={c.label}>
                        <Card sx={{
                            borderLeft: `4px solid ${c.color}`,
                            border: `1px solid ${c.color}35`,
                            borderRadius: '6px',
                            boxShadow: 'none',
                            bgcolor: c.bg,
                        }}>
                            <CardContent sx={{ py: '14px !important', px: '16px !important' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 0.4 }}>{c.label}</Typography>
                                        <Typography sx={{ fontSize: '30px', fontWeight: '800', color: '#1a1a1a', lineHeight: 1.1 }}>{c.value}</Typography>
                                    </Box>
                                    <Box sx={{ width: 42, height: 42, borderRadius: '6px', bgcolor: c.iconBg, border: `1px solid ${c.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <c.Icon sx={{ color: c.color, fontSize: 22 }} />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card sx={{ border: '1px solid #E0E4EA', borderRadius: '6px', boxShadow: 'none', bgcolor: '#fff' }}>
                <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>Staff Attendance Summary</Typography>
                        <Typography sx={{ fontSize: '12px', color: '#888', mt: 0.3 }}>
                            {staffSummary.length} staff &nbsp;·&nbsp;
                            {fromDate ? fmtDate(fromDate) : '—'} — {toDate ? fmtDate(toDate) : '—'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                       
                        <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />}
                            onClick={handleExportSummary}
                            sx={{ textTransform: 'none', fontSize: '12px', fontWeight: '600', borderRadius: '8px', color: '#16A34A', borderColor: '#16A34A40', bgcolor: '#F0FDF4', '&:hover': { borderColor: '#16A34A' } }}>
                            Excel
                        </Button>
                    </Box>
                </Box>

                <Divider />

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...headCell, textAlign: 'center' }}>S.No</TableCell>
                                <TableCell sx={{ ...headCell, textAlign: 'left', minWidth: 200 }}>Staff Member</TableCell>
                                <TableCell sx={headCell}>Staff ID</TableCell>
                                <TableCell sx={headCell}>Category</TableCell>
                                <TableCell sx={headCell}>Working Days</TableCell>
                                <TableCell sx={{ ...headCell, color: '#16A34A' }}>Present</TableCell>
                                <TableCell sx={{ ...headCell, color: '#D97706' }}>Late</TableCell>
                                <TableCell sx={{ ...headCell, color: '#DC2626' }}>Absent</TableCell>
                                <TableCell sx={{ ...headCell, color: '#7C3AED' }}>Leave</TableCell>
                                <TableCell sx={{ ...headCell, minWidth: 110 }}>Attendance %</TableCell>
                                <TableCell sx={headCell}>Full Report</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {staffSummary.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 7, border: BORDER }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: '#FDE8EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AssessmentIcon sx={{ fontSize: 30, color: '#F0A0B0' }} />
                                            </Box>
                                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>No records found</Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#aaa' }}>Adjust the date range or filters to see data</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staffSummary.map((row, idx) => (
                                    <TableRow key={row.staff.id} sx={{
                                        bgcolor: idx % 2 === 0 ? '#fff' : '#FDF5F7',
                                        '&:hover': { bgcolor: '#FDE8EC55' },
                                        transition: '0.12s',
                                    }}>
                                        <TableCell sx={{ ...bodyCell, color: '#aaa', fontWeight: '600' }}>
                                            {idx + 1}
                                        </TableCell>

                                        <TableCell sx={{ ...bodyCell, textAlign: 'left' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                               
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                                                    {row.staff.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ ...bodyCell, color: '#666', fontSize: '12px' }}>
                                            {row.staff.id}
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            {categoryChip(row.staff.category)}
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Typography sx={{ fontSize: '15px', fontWeight: '800', color: '#1a1a1a' }}>
                                                {row.total}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#aaa' }}>days</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '16px', fontWeight: '800', color: '#16A34A', lineHeight: 1.1 }}>
                                                    {row.present}
                                                </Typography>
                                                <Typography sx={{ fontSize: '9px', color: '#aaa', mt: 0.2 }}>days</Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '16px', fontWeight: '800', color: row.late > 0 ? '#D97706' : '#ccc', lineHeight: 1.1 }}>
                                                    {row.late}
                                                </Typography>
                                                <Typography sx={{ fontSize: '9px', color: '#aaa', mt: 0.2 }}>days</Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '16px', fontWeight: '800', color: row.absent > 0 ? '#DC2626' : '#ccc', lineHeight: 1.1 }}>
                                                    {row.absent}
                                                </Typography>
                                                <Typography sx={{ fontSize: '9px', color: '#aaa', mt: 0.2 }}>days</Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '16px', fontWeight: '800', color: row.leave > 0 ? '#7C3AED' : '#ccc', lineHeight: 1.1 }}>
                                                    {row.leave}
                                                </Typography>
                                                <Typography sx={{ fontSize: '9px', color: '#aaa', mt: 0.2 }}>days</Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <RateCell rate={row.rate} />
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<PersonIcon sx={{ fontSize: '13px !important' }} />}
                                                onClick={() => setReportStaff(row.staff)}
                                                sx={{
                                                    textTransform: 'none', fontSize: '11px', fontWeight: '600',
                                                    borderRadius: '6px', color: '#9B2335', borderColor: '#F0D0D8',
                                                    bgcolor: '#FDE8EC', whiteSpace: 'nowrap',
                                                    '&:hover': { borderColor: '#9B2335', bgcolor: '#F9C8D2' },
                                                }}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {staffSummary.length > 0 && (
                    <Box sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, bgcolor: HEAD_BG }}>
                        <Typography sx={{ fontSize: '12px', color: '#9B2335', fontWeight: '600' }}>
                            {staffSummary.length} staff member{staffSummary.length !== 1 ? 's' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2.5 }}>
                            {[
                                { label: 'Present', val: kpis.present, color: '#16A34A' },
                                { label: 'Late',    val: kpis.late,    color: '#D97706' },
                                { label: 'Absent',  val: kpis.absent,  color: '#DC2626' },
                                { label: 'Leave',   val: kpis.leave,   color: '#7C3AED' },
                            ].map(s => (
                                <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                        {s.label}: <strong style={{ color: s.color }}>{s.val}</strong>
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Card>

            <Dialog open={!!reportStaff} onClose={() => setReportStaff(null)} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(155,35,53,0.12)' } }}>
                {reportStaff && (
                    <>
                        <DialogTitle sx={{ p: 0 }}>
                            <Box sx={{ bgcolor: '#fff', borderBottom: BORDER }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{
                                            width: 52, height: 52, bgcolor: reportStaff.avatarColor,
                                            fontSize: '16px', fontWeight: '700',
                                            border: `3px solid ${HEAD_BG}`,
                                            outline: `2px solid #F0D0D8`,
                                        }}>
                                            {reportStaff.avatar}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.2 }}>
                                                {reportStaff.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5, flexWrap: 'wrap' }}>
                                                <Typography sx={{ fontSize: '11px', color: '#888', fontWeight: '500' }}>{reportStaff.id}</Typography>
                                                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#ddd' }} />
                                                <Typography sx={{ fontSize: '11px', color: '#888' }}>{reportStaff.department}</Typography>
                                                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#ddd' }} />
                                                <Chip
                                                    label={reportStaff.category}
                                                    size="small"
                                                    sx={{
                                                        height: 18, fontSize: '10px', fontWeight: '700',
                                                        bgcolor: `${CATEGORY_CONFIG[reportStaff.category]?.color}15`,
                                                        color: CATEGORY_CONFIG[reportStaff.category]?.color,
                                                        border: `1px solid ${CATEGORY_CONFIG[reportStaff.category]?.color}35`,
                                                        borderRadius: '4px',
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ textAlign: 'right', mr: 0.5 }}>
                                            <Typography sx={{ fontSize: '9px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Report Period</Typography>
                                            <Typography sx={{ fontSize: '11px', fontWeight: '600', color: '#555', whiteSpace: 'nowrap' }}>
                                                {fmtDate(fromDate)} — {fmtDate(toDate)}
                                            </Typography>
                                        </Box>
                                        <IconButton onClick={() => setReportStaff(null)} size="small"
                                            sx={{ color: '#999', border: '1px solid #E8E8E8', borderRadius: '6px', '&:hover': { bgcolor: HEAD_BG, color: '#9B2335', borderColor: BORDER } }}>
                                            <CloseIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ px: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#888', whiteSpace: 'nowrap' }}>Attendance Rate</Typography>
                                    <Box sx={{ flex: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={dialogStats.rate}
                                            sx={{
                                                height: 8, borderRadius: 4,
                                                bgcolor: '#F0F0F0',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: dialogStats.rate >= 90 ? '#16A34A' : dialogStats.rate >= 70 ? '#D97706' : '#DC2626',
                                                    borderRadius: 4,
                                                },
                                            }}
                                        />
                                    </Box>
                                    <Typography sx={{
                                        fontSize: '13px', fontWeight: '800', minWidth: 38, textAlign: 'right',
                                        color: dialogStats.rate >= 90 ? '#16A34A' : dialogStats.rate >= 70 ? '#D97706' : '#DC2626',
                                    }}>
                                        {dialogStats.rate}%
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{ p: 0, bgcolor: '#F8F9FB' }}>
                            <Box sx={{
                                display: 'flex', borderBottom: BORDER, bgcolor: '#fff',
                            }}>
                                {[
                                    { label: 'Working Days', value: dialogRecords.length, color: '#1976D2' },
                                    { label: 'Present',      value: dialogStats.present,  color: '#16A34A' },
                                    { label: 'Late',         value: dialogStats.late,     color: '#D97706' },
                                    { label: 'Absent',       value: dialogStats.absent,   color: '#DC2626' },
                                    { label: 'Leave',        value: dialogStats.leave,    color: '#7C3AED' },
                                ].map((s, i, arr) => (
                                    <Box key={s.label} sx={{
                                        flex: 1, textAlign: 'center', py: 1.8,
                                        borderRight: i < arr.length - 1 ? BORDER : 'none',
                                        borderTop: `3px solid ${s.color}`,
                                    }}>
                                        <Typography sx={{ fontSize: '22px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                                        <Typography sx={{ fontSize: '10px', fontWeight: '600', color: '#aaa', mt: 0.4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ p: 2.5 }}>
                                {dialogRecords.length > 0 && (
                                    <Box sx={{ mb: 2.5, bgcolor: '#fff', border: BORDER, borderRadius: '6px', overflow: 'hidden' }}>
                                        <Box sx={{ px: 2, py: 1.2, bgcolor: HEAD_BG, borderBottom: BORDER, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#9B2335' }}>Attendance Calendar</Typography>
                                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                                                    <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: cfg.bg, border: `1px solid ${cfg.color}50` }} />
                                                        <Typography sx={{ fontSize: '10px', color: '#888', fontWeight: '500' }}>{s}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {dialogRecords.map(rec => {
                                                const cfg = STATUS_CONFIG[rec.status] || { bg: '#F3F4F6', color: '#888' };
                                                return (
                                                    <Tooltip key={rec.date}
                                                        title={`${fmtDate(rec.date)} · ${rec.status}${rec.leaveType ? ` (${rec.leaveType})` : ''}`}
                                                        placement="top" arrow
                                                        slotProps={{ tooltip: { sx: { fontSize: '11px', bgcolor: '#333', borderRadius: '4px' } } }}>
                                                        <Box sx={{
                                                            width: 52, height: 52, borderRadius: '6px',
                                                            bgcolor: cfg.bg, border: `1.5px solid ${cfg.color}40`,
                                                            display: 'flex', flexDirection: 'column',
                                                            alignItems: 'center', justifyContent: 'center', cursor: 'default',
                                                        }}>
                                                            <Typography sx={{ fontSize: '15px', fontWeight: '800', color: cfg.color, lineHeight: 1 }}>
                                                                {parseInt(rec.date.split('-')[2])}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '9px', fontWeight: '600', color: cfg.color, opacity: 0.7, mt: 0.3 }}>
                                                                {fmtDay(rec.date)}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                )}

                                <Box sx={{ bgcolor: '#fff', border: BORDER, borderRadius: '6px', overflow: 'hidden' }}>
                                    <Box sx={{ px: 2, py: 1.2, bgcolor: HEAD_BG, borderBottom: BORDER }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#9B2335' }}>Daily Log</Typography>
                                    </Box>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    {['Date', 'Day', 'Status', 'Login Time'].map(h => (
                                                        <TableCell key={h} sx={{ ...headCell, fontSize: '11px' }}>{h}</TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {dialogRecords.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 4, border: BORDER }}>
                                                            <Typography sx={{ fontSize: '13px', color: '#aaa' }}>No records for this period</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : dialogRecords.map((rec, idx) => {
                                                    const cfg = STATUS_CONFIG[rec.status] || { dot: '#ccc', color: '#666' };
                                                    return (
                                                        <TableRow key={rec.id} sx={{
                                                            bgcolor: rec.status === 'Absent' ? '#FFF5F5' : rec.status === 'Leave' ? '#FAF7FF' : idx % 2 === 0 ? '#fff' : '#FDFBFB',
                                                            '&:hover': { bgcolor: '#FDE8EC44' },
                                                        }}>
                                                            <TableCell sx={{ ...bodyCell, fontWeight: '600', whiteSpace: 'nowrap', color: '#333' }}>{fmtDate(rec.date)}</TableCell>
                                                            <TableCell sx={{ ...bodyCell, color: '#888', fontWeight: '500' }}>{fmtDay(rec.date)}</TableCell>
                                                            <TableCell sx={bodyCell}>
                                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.7, bgcolor: `${cfg.dot}15`, border: `1px solid ${cfg.dot}30`, borderRadius: '4px', px: 1, py: 0.3 }}>
                                                                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cfg.dot, flexShrink: 0 }} />
                                                                    <Typography sx={{ fontSize: '11px', fontWeight: '700', color: cfg.color }}>
                                                                        {rec.status}
                                                                    </Typography>
                                                                </Box>
                                                                {rec.leaveType && (
                                                                    <Typography sx={{ fontSize: '9px', color: '#aaa', mt: 0.2, display: 'block' }}>
                                                                        {rec.leaveType}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell sx={{ ...bodyCell, color: rec.status === 'Late' ? '#D97706' : '#555', fontWeight: rec.status === 'Late' ? '700' : '400', whiteSpace: 'nowrap' }}>{rec.loginTime}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 2.5, py: 1.8, borderTop: BORDER, bgcolor: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                            <Button variant="outlined" startIcon={<FileDownloadIcon />}
                                onClick={handleExportIndividual}
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: '600',
                                    borderRadius: '6px', color: '#16A34A', borderColor: '#BBF7D0',
                                    bgcolor: '#F0FDF4',
                                    '&:hover': { borderColor: '#16A34A', bgcolor: '#DCFCE7' },
                                }}>
                                Export Excel
                            </Button>
                            <Button onClick={() => setReportStaff(null)} variant="outlined"
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: '600',
                                    borderRadius: '6px', color: '#9B2335', borderColor: '#F0D0D8',
                                    bgcolor: HEAD_BG,
                                    '&:hover': { borderColor: '#9B2335', bgcolor: '#F9C8D2' },
                                }}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
