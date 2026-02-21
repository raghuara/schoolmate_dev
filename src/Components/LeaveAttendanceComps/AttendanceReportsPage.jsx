import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Grid, Typography, IconButton, Button,
    Chip, Divider, Select, MenuItem, TextField, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, LinearProgress, CircularProgress,
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
import axios from 'axios';
import { reportsLeaveManagement, reportsLeaveManagementFullReport } from '../../Api/Api';
import SnackBar from '../SnackBar';

const token = "123";

const STATUS_CONFIG = {
    Present: { bg: '#DCFCE7', color: '#16A34A', dot: '#16A34A', Icon: CheckCircleIcon },
    Late:    { bg: '#FEF3C7', color: '#D97706', dot: '#D97706', Icon: AccessTimeIcon  },
    Absent:  { bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626', Icon: CancelIcon      },
    Leave:   { bg: '#EDE9FE', color: '#7C3AED', dot: '#7C3AED', Icon: EventBusyIcon   },
};

const CATEGORY_CONFIG = {
    'Teaching Staff':     { bg: '#DCFCE7', color: '#16A34A' },
    'Non Teaching Staff': { bg: '#DBEAFE', color: '#2563EB' },
    'Supporting Staff':   { bg: '#FFF7ED', color: '#EA580C' },
};

// "YYYY-MM-DD" (input value) → "DD-MM-YYYY" (API)
const inputToApi = (str) => {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    return `${d}-${m}-${y}`;
};

// Today as "YYYY-MM-DD" for input
const getTodayInput = () => new Date().toISOString().split('T')[0];

// Map API category value → display label
const mapCategory = (cat = '') => {
    const c = cat.toLowerCase();
    if (c === 'teaching')    return 'Teaching Staff';
    if (c === 'nonteaching') return 'Non Teaching Staff';
    if (c === 'supporting')  return 'Supporting Staff';
    return cat;
};

// Map display label → API category value
const mapCategoryToApi = (display) => {
    if (display === 'Teaching Staff')     return 'teaching';
    if (display === 'Non Teaching Staff') return 'nonteaching';
    if (display === 'Supporting Staff')   return 'supporting';
    return '';
};

// Normalize any status value (case-insensitive) → STATUS_CONFIG key, or '' for not marked
const normalizeStatus = (status = '') => {
    const s = status.toLowerCase().trim();
    if (s === 'present') return 'Present';
    if (s === 'late') return 'Late';
    if (s === 'absent') return 'Absent';
    if (s === 'leave' || s === 'on leave' || s === 'onleave') return 'Leave';
    return ''; // empty / unrecognized → not marked yet
};

const BORDER  = '1px solid #F0D0D8';
const HEAD_BG = '#FDE8EC';

const headCell = {
    border: BORDER, fontWeight: '700', fontSize: '12px', color: '#9B2335',
    textAlign: 'center', py: 1.5, px: 1.5, whiteSpace: 'nowrap', bgcolor: HEAD_BG,
};
const bodyCell = {
    border: BORDER, fontSize: '13px', color: '#1a1a1a',
    textAlign: 'center', py: 1.4, px: 1.5,
};

export default function AttendanceReportsPage({ isEmbedded = false }) {
    const navigate = useNavigate();

    // Filters
    const [todayActive,    setTodayActive]    = useState(false);
    const [fromDate,       setFromDate]       = useState(getTodayInput());
    const [toDate,         setToDate]         = useState(getTodayInput());
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter,   setStatusFilter]   = useState('All');
    const [staffSearch,    setStaffSearch]    = useState('');

    // API data
    const [cards,     setCards]     = useState({ totalStaff: 0, presentDays: 0, lateArrivals: 0, absentDays: 0, leaveDays: 0 });
    const [summary,   setSummary]   = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Full report dialog: { open, data, isLoading }
    const [reportDialog, setReportDialog] = useState({ open: false, data: null, isLoading: false });

    // SnackBar
    const [snackOpen,    setSnackOpen]    = useState(false);
    const [snackStatus,  setSnackStatus]  = useState(false);
    const [snackColor,   setSnackColor]   = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true); setSnackColor(success); setSnackStatus(success);
    };

    // ── Fetch summary ──────────────────────────────────────────────────────────
    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(reportsLeaveManagement, {
                params: {
                    FromDate:         inputToApi(fromDate),
                    ToDate:           inputToApi(toDate),
                    Category:         mapCategoryToApi(categoryFilter),
                    AttendanceStatus: statusFilter !== 'All' ? statusFilter : '',
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data && !res.data.error) {
                setCards(res.data.cards   || {});
                setSummary(res.data.summary || []);
            } else {
                showSnack(res.data?.message || 'Failed to load reports', false);
            }
        } catch (err) {
            console.error('Report fetch error:', err);
            showSnack('Failed to load attendance reports', false);
        } finally {
            setIsLoading(false);
        }
    }, [fromDate, toDate, categoryFilter, statusFilter]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    // ── Fetch full report (on View button click) ───────────────────────────────
    const fetchFullReport = async (staffId) => {
        setReportDialog({ open: true, data: null, isLoading: true });
        try {
            const res = await axios.get(reportsLeaveManagementFullReport, {
                params: {
                    RollNumber: staffId,
                    FromDate:   inputToApi(fromDate),
                    ToDate:     inputToApi(toDate),
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data && !res.data.error) {
                setReportDialog({ open: true, data: res.data, isLoading: false });
            } else {
                showSnack('Failed to load full report', false);
                setReportDialog({ open: false, data: null, isLoading: false });
            }
        } catch (err) {
            console.error('Full report fetch error:', err);
            showSnack('Failed to load full report', false);
            setReportDialog({ open: false, data: null, isLoading: false });
        }
    };

    const closeDialog = () => setReportDialog({ open: false, data: null, isLoading: false });

    // ── Date helpers ───────────────────────────────────────────────────────────
    const activateToday = () => {
        const today = getTodayInput();
        setTodayActive(true);
        setFromDate(today);
        setToDate(today);
    };
    const handleFromChange = (val) => { setFromDate(val); setTodayActive(false); };
    const handleToChange   = (val) => { setToDate(val);   setTodayActive(false); };

    const handleClearFilters = () => {
        const today = getTodayInput();
        setTodayActive(false);
        setFromDate(today);
        setToDate(today);
        setCategoryFilter('All');
        setStatusFilter('All');
        setStaffSearch('');
    };

    // Client-side search on fetched summary
    const filteredSummary = staffSearch.trim()
        ? summary.filter(row =>
            row.staffMember.toLowerCase().includes(staffSearch.toLowerCase()) ||
            row.staffId.toLowerCase().includes(staffSearch.toLowerCase())
          )
        : summary;

    // ── Export helpers ─────────────────────────────────────────────────────────
    const handleExportSummary = () => {
        const headers = ['S.No', 'Staff Name', 'Staff ID', 'Category', 'Working Days', 'Present', 'Late', 'Absent', 'Leave', 'Attendance %'];
        const rows = filteredSummary.map((row, idx) => [
            idx + 1, row.staffMember, row.staffId, mapCategory(row.category),
            row.workingDays, row.present, row.late, row.absent, row.leave, `${row.attendancePercent}%`,
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 10 }, { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 14 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Summary');
        XLSX.writeFile(wb, `Staff_Attendance_Summary_${inputToApi(fromDate)}_to_${inputToApi(toDate)}.xlsx`);
    };

    const handleExportFullReport = () => {
        const { data } = reportDialog;
        if (!data?.dailyLog?.length) return;
        const headers = ['Date', 'Day', 'Status', 'Login Time'];
        const rows = data.dailyLog.map(rec => [rec.date, rec.day, rec.status, rec.loginTime]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [{ wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 14 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Daily Log');
        XLSX.writeFile(wb, `${data.name?.replace(/\s+/g, '_')}_Attendance_Log.xlsx`);
    };

    // ── Sub-components ─────────────────────────────────────────────────────────
    const categoryChip = (cat) => {
        const label = mapCategory(cat);
        const cfg = CATEGORY_CONFIG[label] || { bg: '#F3F4F6', color: '#666' };
        return (
            <Chip label={label} size="small" sx={{
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
            <LinearProgress variant="determinate" value={rate} sx={{
                height: 5, borderRadius: 3, bgcolor: '#F0F0F0',
                '& .MuiLinearProgress-bar': {
                    bgcolor: rate >= 90 ? '#16A34A' : rate >= 70 ? '#D97706' : '#DC2626',
                    borderRadius: 3,
                },
            }} />
        </Box>
    );

    const { data: fullData } = reportDialog;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
        <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />
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

            {/* ── Filters Card ─────────────────────────────────────────────── */}
            <Card sx={{ border: '1px solid #E0E4EA', borderRadius: '6px', boxShadow: 'none', mb: 2.5, bgcolor: '#fff' }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    {/* Date Range */}
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

                    {/* Filter Dropdowns */}
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

            {/* ── KPI Cards ────────────────────────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {[
                    { label: 'Total Staff',   value: cards.totalStaff   ?? 0, color: '#1976D2', bg: '#EFF6FF', iconBg: '#DBEAFE', Icon: PersonIcon      },
                    { label: 'Present Days',  value: cards.presentDays  ?? 0, color: '#16A34A', bg: '#F0FDF4', iconBg: '#DCFCE7', Icon: CheckCircleIcon  },
                    { label: 'Late Arrivals', value: cards.lateArrivals ?? 0, color: '#D97706', bg: '#FFFBEB', iconBg: '#FEF3C7', Icon: AccessTimeIcon   },
                    { label: 'Absent Days',   value: cards.absentDays   ?? 0, color: '#DC2626', bg: '#FEF2F2', iconBg: '#FEE2E2', Icon: CancelIcon       },
                    { label: 'Leave Days',    value: cards.leaveDays    ?? 0, color: '#7C3AED', bg: '#FAF5FF', iconBg: '#EDE9FE', Icon: EventBusyIcon    },
                ].map(c => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={c.label}>
                        <Card sx={{ borderLeft: `4px solid ${c.color}`, border: `1px solid ${c.color}35`, borderRadius: '6px', boxShadow: 'none', bgcolor: c.bg }}>
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

            {/* ── Summary Table ─────────────────────────────────────────────── */}
            <Card sx={{ border: '1px solid #E0E4EA', borderRadius: '6px', boxShadow: 'none', bgcolor: '#fff' }}>
                <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>Staff Attendance Summary</Typography>
                        <Typography sx={{ fontSize: '12px', color: '#888', mt: 0.3 }}>
                            {filteredSummary.length} staff &nbsp;·&nbsp; {inputToApi(fromDate)} — {inputToApi(toDate)}
                        </Typography>
                    </Box>
                    <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />}
                        onClick={handleExportSummary}
                        disabled={filteredSummary.length === 0 || isLoading}
                        sx={{ textTransform: 'none', fontSize: '12px', fontWeight: '600', borderRadius: '8px', color: '#16A34A', borderColor: '#16A34A40', bgcolor: '#F0FDF4', '&:hover': { borderColor: '#16A34A' } }}>
                        Excel
                    </Button>
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 6, border: BORDER }}>
                                        <CircularProgress size={30} sx={{ color: '#9B2335' }} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredSummary.length === 0 ? (
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
                                filteredSummary.map((row, idx) => (
                                    <TableRow key={row.staffId} sx={{
                                        bgcolor: idx % 2 === 0 ? '#fff' : '#FDF5F7',
                                        '&:hover': { bgcolor: '#FDE8EC55' },
                                        transition: '0.12s',
                                    }}>
                                        <TableCell sx={{ ...bodyCell, color: '#aaa', fontWeight: '600' }}>{row.sNo ?? idx + 1}</TableCell>

                                        <TableCell sx={{ ...bodyCell, textAlign: 'left' }}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                                                {row.staffMember}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ ...bodyCell, color: '#666', fontSize: '12px' }}>{row.staffId}</TableCell>

                                        <TableCell sx={bodyCell}>{categoryChip(row.category)}</TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Typography sx={{ fontSize: '15px', fontWeight: '800', color: '#1a1a1a' }}>{row.workingDays}</Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#aaa' }}>days</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Typography sx={{ fontSize: '16px', fontWeight: '800', color: '#16A34A', lineHeight: 1.1 }}>{row.present}</Typography>
                                            <Typography sx={{ fontSize: '9px', color: '#aaa', mt: 0.2 }}>days</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Typography sx={{ fontSize: '16px', fontWeight: '800', color: row.late > 0 ? '#D97706' : '#ccc', lineHeight: 1.1 }}>{row.late}</Typography>
                                            <Typography sx={{ fontSize: '9px', color: '#aaa', mt: 0.2 }}>days</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Typography sx={{ fontSize: '16px', fontWeight: '800', color: row.absent > 0 ? '#DC2626' : '#ccc', lineHeight: 1.1 }}>{row.absent}</Typography>
                                            <Typography sx={{ fontSize: '9px', color: '#aaa', mt: 0.2 }}>days</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Typography sx={{ fontSize: '16px', fontWeight: '800', color: row.leave > 0 ? '#7C3AED' : '#ccc', lineHeight: 1.1 }}>{row.leave}</Typography>
                                            <Typography sx={{ fontSize: '9px', color: '#aaa', mt: 0.2 }}>days</Typography>
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <RateCell rate={row.attendancePercent ?? 0} />
                                        </TableCell>

                                        <TableCell sx={bodyCell}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<PersonIcon sx={{ fontSize: '13px !important' }} />}
                                                onClick={() => fetchFullReport(row.staffId)}
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

                {filteredSummary.length > 0 && !isLoading && (
                    <Box sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, bgcolor: HEAD_BG }}>
                        <Typography sx={{ fontSize: '12px', color: '#9B2335', fontWeight: '600' }}>
                            {filteredSummary.length} staff member{filteredSummary.length !== 1 ? 's' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2.5 }}>
                            {[
                                { label: 'Present', val: cards.presentDays  ?? 0, color: '#16A34A' },
                                { label: 'Late',    val: cards.lateArrivals ?? 0, color: '#D97706' },
                                { label: 'Absent',  val: cards.absentDays   ?? 0, color: '#DC2626' },
                                { label: 'Leave',   val: cards.leaveDays    ?? 0, color: '#7C3AED' },
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

            {/* ── Full Report Dialog ────────────────────────────────────────── */}
            <Dialog open={reportDialog.open} onClose={closeDialog} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(155,35,53,0.12)' } }}>

                {reportDialog.isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <CircularProgress size={36} sx={{ color: '#9B2335' }} />
                    </Box>
                ) : fullData && (
                    <>
                        {/* Dialog Header */}
                        <DialogTitle sx={{ p: 0 }}>
                            <Box sx={{ bgcolor: '#fff', borderBottom: BORDER }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 2 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.2 }}>
                                            {fullData.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5, flexWrap: 'wrap' }}>
                                            <Typography sx={{ fontSize: '11px', color: '#888' }}>{fullData.staffId}</Typography>
                                            {fullData.department && (
                                                <>
                                                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#ddd' }} />
                                                    <Typography sx={{ fontSize: '11px', color: '#888' }}>{fullData.department}</Typography>
                                                </>
                                            )}
                                            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#ddd' }} />
                                            {categoryChip(fullData.category)}
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ textAlign: 'right', mr: 0.5 }}>
                                            <Typography sx={{ fontSize: '9px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Report Period</Typography>
                                            <Typography sx={{ fontSize: '11px', fontWeight: '600', color: '#555', whiteSpace: 'nowrap' }}>
                                                {fullData.reportFromDate} — {fullData.reportToDate}
                                            </Typography>
                                        </Box>
                                        <IconButton onClick={closeDialog} size="small"
                                            sx={{ color: '#999', border: '1px solid #E8E8E8', borderRadius: '6px', '&:hover': { bgcolor: HEAD_BG, color: '#9B2335', borderColor: BORDER } }}>
                                            <CloseIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Box>
                                </Box>

                                {/* Attendance Rate Bar */}
                                <Box sx={{ px: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#888', whiteSpace: 'nowrap' }}>Attendance Rate</Typography>
                                    <Box sx={{ flex: 1 }}>
                                        <LinearProgress variant="determinate" value={fullData.attendancePercent ?? 0} sx={{
                                            height: 8, borderRadius: 4, bgcolor: '#F0F0F0',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: (fullData.attendancePercent ?? 0) >= 90 ? '#16A34A' : (fullData.attendancePercent ?? 0) >= 70 ? '#D97706' : '#DC2626',
                                                borderRadius: 4,
                                            },
                                        }} />
                                    </Box>
                                    <Typography sx={{
                                        fontSize: '13px', fontWeight: '800', minWidth: 38, textAlign: 'right',
                                        color: (fullData.attendancePercent ?? 0) >= 90 ? '#16A34A' : (fullData.attendancePercent ?? 0) >= 70 ? '#D97706' : '#DC2626',
                                    }}>
                                        {fullData.attendancePercent ?? 0}%
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{ p: 0, bgcolor: '#F8F9FB' }}>
                            {/* Stats Strip */}
                            <Box sx={{ display: 'flex', borderBottom: BORDER, bgcolor: '#fff' }}>
                                {[
                                    { label: 'Working Days', value: fullData.workingDays, color: '#1976D2' },
                                    { label: 'Present',      value: fullData.present,     color: '#16A34A' },
                                    { label: 'Late',         value: fullData.late,        color: '#D97706' },
                                    { label: 'Absent',       value: fullData.absent,      color: '#DC2626' },
                                    { label: 'Leave',        value: fullData.leave,       color: '#7C3AED' },
                                ].map((s, i, arr) => (
                                    <Box key={s.label} sx={{
                                        flex: 1, textAlign: 'center', py: 1.8,
                                        borderRight: i < arr.length - 1 ? BORDER : 'none',
                                        borderTop: `3px solid ${s.color}`,
                                    }}>
                                        <Typography sx={{ fontSize: '22px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value ?? 0}</Typography>
                                        <Typography sx={{ fontSize: '10px', fontWeight: '600', color: '#aaa', mt: 0.4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ p: 2.5 }}>
                                {/* Attendance Calendar */}
                                {fullData.calendar?.length > 0 && (
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
                                            {fullData.calendar.map((cal, i) => {
                                                const statusKey = normalizeStatus(cal.status);
                                                const cfg = STATUS_CONFIG[statusKey] || { bg: '#F3F4F6', color: '#bbb' };
                                                return (
                                                    <Tooltip key={i}
                                                        title={`${cal.dayName} ${cal.dayNumber} · ${statusKey || 'Not Marked'}`}
                                                        placement="top" arrow
                                                        slotProps={{ tooltip: { sx: { fontSize: '11px', bgcolor: '#333', borderRadius: '4px' } } }}>
                                                        <Box sx={{
                                                            width: 52, height: 52, borderRadius: '6px',
                                                            bgcolor: cfg.bg, border: `1.5px solid ${cfg.color}40`,
                                                            display: 'flex', flexDirection: 'column',
                                                            alignItems: 'center', justifyContent: 'center', cursor: 'default',
                                                        }}>
                                                            <Typography sx={{ fontSize: '15px', fontWeight: '800', color: cfg.color, lineHeight: 1 }}>
                                                                {cal.dayNumber}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '9px', fontWeight: '600', color: cfg.color, opacity: 0.7, mt: 0.3 }}>
                                                                {cal.dayName}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                )}

                                {/* Daily Log Table */}
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
                                                {(!fullData.dailyLog || fullData.dailyLog.length === 0) ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 4, border: BORDER }}>
                                                            <Typography sx={{ fontSize: '13px', color: '#aaa' }}>No records for this period</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : fullData.dailyLog.map((rec, idx) => {
                                                    const normStatus = normalizeStatus(rec.status);
                                                    const cfg = STATUS_CONFIG[normStatus] || { dot: '#ddd', color: '#bbb' };
                                                    return (
                                                        <TableRow key={idx} sx={{
                                                            bgcolor: normStatus === 'Absent' ? '#FFF5F5' : normStatus === 'Leave' ? '#FAF7FF' : idx % 2 === 0 ? '#fff' : '#FDFBFB',
                                                            '&:hover': { bgcolor: '#FDE8EC44' },
                                                        }}>
                                                            <TableCell sx={{ ...bodyCell, fontWeight: '600', whiteSpace: 'nowrap', color: '#333' }}>{rec.date}</TableCell>
                                                            <TableCell sx={{ ...bodyCell, color: '#888', fontWeight: '500' }}>{rec.day}</TableCell>
                                                            <TableCell sx={bodyCell}>
                                                                {normStatus ? (
                                                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.7, bgcolor: `${cfg.dot}15`, border: `1px solid ${cfg.dot}30`, borderRadius: '4px', px: 1, py: 0.3 }}>
                                                                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cfg.dot, flexShrink: 0 }} />
                                                                        <Typography sx={{ fontSize: '11px', fontWeight: '700', color: cfg.color }}>{normStatus}</Typography>
                                                                    </Box>
                                                                ) : (
                                                                    <Typography sx={{ fontSize: '13px', color: '#bbb', fontWeight: '500' }}>—</Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell sx={{ ...bodyCell, color: normStatus === 'Late' ? '#D97706' : '#555', fontWeight: normStatus === 'Late' ? '700' : '400', whiteSpace: 'nowrap' }}>
                                                                {rec.loginTime || '—'}
                                                            </TableCell>
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
                                onClick={handleExportFullReport}
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: '600',
                                    borderRadius: '6px', color: '#16A34A', borderColor: '#BBF7D0',
                                    bgcolor: '#F0FDF4', '&:hover': { borderColor: '#16A34A', bgcolor: '#DCFCE7' },
                                }}>
                                Export Excel
                            </Button>
                            <Button onClick={closeDialog} variant="outlined"
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: '600',
                                    borderRadius: '6px', color: '#9B2335', borderColor: '#F0D0D8',
                                    bgcolor: HEAD_BG, '&:hover': { borderColor: '#9B2335', bgcolor: '#F9C8D2' },
                                }}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
        </>
    );
}
