import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, TextField, Chip,
    Table, TableBody, TableCell, TableHead, TableRow, Tooltip,
    Autocomplete, InputAdornment, LinearProgress, Tab, Tabs, Paper,
    Avatar, TablePagination,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaidIcon from '@mui/icons-material/Paid';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import SnackBar from '../../../SnackBar';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { GetConcessionLog } from '../../../../Api/Api';

const token = '123';

const FEE_TYPE_COLORS = {
    'School Fee': { color: '#E30053', bg: '#FEF2F6' },
    'Transport Fee': { color: '#3457D5', bg: '#EEF2FF' },
    'ECA Fee': { color: '#8B5CF6', bg: '#F5F3FF' },
    'Additional Fee': { color: '#FF6B35', bg: '#FFF5F2' },
};

const FEE_TABS = ['All', 'School Fee', 'Transport Fee', 'ECA Fee', 'Additional Fee'];

const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

export default function ConcessionLog() {
    const navigate = useNavigate();
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);
    const grades = useSelector(selectGrades);
    const websiteSettings = useSelector(selectWebsiteSettings);

    const currentYear = new Date().getFullYear();
    const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
    const academicYears = [
        `${currentYear - 2}-${currentYear - 1}`,
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
    ];

    const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [feeTypeTab, setFeeTypeTab] = useState(0); // index into FEE_TABS
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const selectedGrade = grades.find((g) => g.id === selectedGradeId);
    const feeTypeFilter = FEE_TABS[feeTypeTab];

    useEffect(() => {
        fetchConcessionLogs();
    }, [selectedYear, selectedGradeId, feeTypeFilter]);

    const fetchConcessionLogs = async () => {
        setIsLoading(true);
        try {
            const params = { academicYear: selectedYear, feeType: feeTypeFilter };
            if (selectedGrade?.sign) params.gradeSign = selectedGrade.sign;
            const res = await axios.get(GetConcessionLog, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            setLogs(res.data?.data || []);
        } catch {
            setMessage('Failed to load concession logs');
            setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = useMemo(() => {
        if (!searchQuery) return logs;
        const q = searchQuery.toLowerCase();
        return logs.filter((log) =>
            (log.studentName || '').toLowerCase().includes(q) ||
            (log.rollNo || '').toLowerCase().includes(q) ||
            (log.feeName || '').toLowerCase().includes(q) ||
            (log.gradeSection || '').toLowerCase().includes(q) ||
            (log.concessionByName || '').toLowerCase().includes(q) ||
            (log.concessionCategory || '').toLowerCase().includes(q) ||
            (log.recommendedBy || '').toLowerCase().includes(q) ||
            (log.recommendationReason || '').toLowerCase().includes(q)
        );
    }, [logs, searchQuery]);

    const stats = useMemo(() => {
        const data = filteredLogs;
        const totalOriginal = data.reduce((s, r) => s + (Number(r.originalAmount ?? r.originalAmt) || 0), 0);
        const totalConcession = data.reduce((s, r) => s + (Number(r.concessionAmt) || 0), 0);
        const totalPending = data.reduce((s, r) => s + (Number(r.pendingAmount) || 0), 0);
        const uniqueStudents = new Set(data.map((r) => r.rollNo)).size;
        return {
            totalRecords: data.length,
            totalOriginal,
            totalConcession,
            totalPending,
            uniqueStudents,
        };
    }, [filteredLogs]);

    // Reset page to 0 whenever filters/search change so the user doesn't land on an empty page
    useEffect(() => {
        setPage(0);
    }, [searchQuery, feeTypeTab, selectedGradeId, selectedYear]);

    // Rows to show on the current page
    const pagedLogs = useMemo(
        () => filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredLogs, page, rowsPerPage]
    );

    const handleChangePage = (_e, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleExport = () => {
        if (filteredLogs.length === 0) {
            setMessage('No data to export'); setOpen(true); setColor(false); setStatus(false);
            return;
        }
        const exportData = filteredLogs.map((log, i) => ({
            'S.No': i + 1,
            'Student Name': log.studentName,
            'Roll No': log.rollNo,
            'Grade & Section': log.gradeSection,
            'Fee Type': log.feeType,
            'Fee Name': log.feeName,
            'Original Amount': log.originalAmount ?? log.originalAmt ?? 0,
            'Concession Amount': log.concessionAmt,
            'Pending Amount': log.pendingAmount,
            'Category': log.concessionCategory || '-',
            'Recommended By': log.recommendedBy || '-',
            'Reason': log.recommendationReason || '-',
            'Mode': log.isSeparateDetailsPerFee === 'Y' ? 'Per-fee' : log.isSeparateDetailsPerFee === 'N' ? 'Common' : '-',
            'Concession By': `${log.concessionByName} (${log.concessionByRollNumber})`,
            'Date': log.concessionDate ? new Date(log.concessionDate).toLocaleDateString('en-IN') : '',
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Concession Log');
        XLSX.writeFile(wb, `Concession_Log_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const thCell = {
        backgroundColor: '#faf6fc',
        borderRight: 1,
        borderColor: '#E8DDEA',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '11px',
        color: '#4B5563',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        py: 1.3,
        px: 1.5,
        whiteSpace: 'nowrap',
    };

    const tdCell = {
        borderRight: 1,
        borderColor: '#F0E6F0',
        textAlign: 'center',
        fontSize: '12px',
        py: 1.2,
        px: 1.5,
    };

    return (
        <Box sx={{ width: '100%' }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            {/* Fixed Header */}
            <Box sx={{
                position: 'fixed',
                top: '60px',
                left: isExpanded ? '260px' : '80px',
                right: 0,
                backgroundColor: '#f2f2f2',
                px: 2,
                borderTop: '1px solid #ddd',
                borderBottom: '1px solid #ddd',
                zIndex: 1200,
                transition: 'left 0.3s ease-in-out',
                py: 0.7,
            }}>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: '27px', height: '27px', mt: '2px' }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                        </IconButton>
                        <Box sx={{ ml: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.1 }}>Concession Log</Typography>
                            <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                All special concessions applied across {selectedYear}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end', gap: 1.5 }}>
                        <Autocomplete
                            size="small"
                            options={grades}
                            getOptionLabel={(o) => o.sign}
                            value={selectedGrade || null}
                            onChange={(_, v) => setSelectedGradeId(v?.id || null)}
                            sx={{ width: '150px' }}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="All Grades" variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14, height: 35 },
                                        '& .MuiOutlinedInput-input': { textAlign: 'center', fontWeight: 600 },
                                    }}
                                />
                            )}
                        />
                        <Autocomplete
                            size="small"
                            options={academicYears}
                            sx={{ width: '170px' }}
                            value={selectedYear}
                            onChange={(_, v) => setSelectedYear(v)}
                            renderInput={(params) => (
                                <TextField {...params} variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '5px', fontSize: 14, height: 35 },
                                        '& .MuiOutlinedInput-input': { textAlign: 'center', fontWeight: 600 },
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Content */}
            <Box sx={{ px: 2, pt: '68px', pb: 3 }}>

        
                {/* ═══ Pill Tabs + Search + Export ═══ */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5,
                    mb: 2, p: 1.2, borderRadius: '50px', bgcolor: '#f2f2f2',
                    border: '1px solid #E5E7EB',
                }}>
                    {/* Category Pill Tabs */}
                    <Tabs
                        value={feeTypeTab}
                        onChange={(_e, v) => setFeeTypeTab(v)}
                        variant="scrollable"
                        slotProps={{ indicator: { sx: { display: 'none' } } }}
                        sx={{
                            backgroundColor: '#fff',
                            minHeight: '10px',
                            borderRadius: '50px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontSize: '12px',
                                color: '#555',
                                fontWeight: 700,
                                minWidth: 0,
                                minHeight: '30px',
                                height: '30px',
                                px: 1.8,
                                m: 0.6,
                            },
                            '& .Mui-selected': {
                                color: `${websiteSettings.textColor} !important`,
                                bgcolor: websiteSettings.mainColor,
                                borderRadius: '50px',
                                boxShadow: '1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(0,0,0,0.1)',
                            },
                        }}
                    >
                        {FEE_TABS.map((label) => <Tab key={label} label={label} />)}
                    </Tabs>

                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                        {/* Search pill */}
                        <TextField
                            placeholder="Search student, roll, fee, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: '#555' }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        padding: '0 10px',
                                        borderRadius: '50px',
                                        height: '33px',
                                        fontSize: '12px',
                                        backgroundColor: '#fff',
                                    },
                                },
                            }}
                            sx={{
                                width: 260,
                                '& .MuiOutlinedInput-root': {
                                    minHeight: '28px',
                                    paddingRight: '3px',
                                    backgroundColor: '#fff',
                                },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: websiteSettings.mainColor,
                                },
                            }}
                            size="small"
                        />

                        {/* Record count */}
                        <Chip
                            label={`${filteredLogs.length} record${filteredLogs.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                height: 28, fontSize: '11px', fontWeight: 700,
                                bgcolor: '#fff', color: '#374151',
                                border: '1px solid #E5E7EB',
                            }}
                        />

                        {/* Export button */}
                        <Button
                            size="small"
                            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                            onClick={handleExport}
                            sx={{
                                textTransform: 'none', fontSize: '12px', fontWeight: 700,
                                bgcolor: websiteSettings.mainColor, color: websiteSettings.textColor,
                                borderRadius: '50px', height: 30, px: 2, boxShadow: 'none',
                                '&:hover': { bgcolor: websiteSettings.mainColor, opacity: 0.9, boxShadow: 'none' },
                            }}
                        >
                            Export
                        </Button>
                    </Box>
                </Box>

                {/* Active filter summary */}
                {(searchQuery || selectedGrade || feeTypeFilter !== 'All') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>
                            Active filters:
                        </Typography>
                        {feeTypeFilter !== 'All' && (
                            <Chip
                                label={feeTypeFilter}
                                size="small"
                                onDelete={() => setFeeTypeTab(0)}
                                sx={{
                                    height: 22, fontSize: '10px', fontWeight: 600,
                                    bgcolor: FEE_TYPE_COLORS[feeTypeFilter]?.bg,
                                    color: FEE_TYPE_COLORS[feeTypeFilter]?.color,
                                    border: `1px solid ${FEE_TYPE_COLORS[feeTypeFilter]?.color}30`,
                                }}
                            />
                        )}
                        {selectedGrade && (
                            <Chip
                                label={`Grade: ${selectedGrade.sign}`}
                                size="small"
                                onDelete={() => setSelectedGradeId(null)}
                                sx={{ height: 22, fontSize: '10px', fontWeight: 600, bgcolor: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}
                            />
                        )}
                        {searchQuery && (
                            <Chip
                                label={`Search: "${searchQuery}"`}
                                size="small"
                                onDelete={() => setSearchQuery('')}
                                sx={{ height: 22, fontSize: '10px', fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB' }}
                            />
                        )}
                    </Box>
                )}

                {/* Colored Tab Label */}
                <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.8,
                    bgcolor: websiteSettings.mainColor, color: websiteSettings.textColor,
                    fontSize: '12px', px: 2.5, py: 0.5, ml: '15px',
                    fontWeight: 700, letterSpacing: 0.3,
                    borderTopLeftRadius: '7px', borderTopRightRadius: '7px',
                }}>
                    <ReceiptLongIcon sx={{ fontSize: 14 }} />
                    Special Concession Log
                </Box>

                {/* Table */}
                <Paper elevation={0} sx={{
                    border: '1px solid #E8DDEA', borderRadius: '5px', overflow: 'auto',
                    bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                    {isLoading ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <LinearProgress sx={{ mb: 2, mx: 'auto', width: '40%', borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: websiteSettings.mainColor } }} />
                            <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>Loading concession logs...</Typography>
                        </Box>
                    ) : (
                        <Table sx={{ minWidth: 1200 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...thCell, width: 40 }}>S.No</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 140 }}>Student</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 100 }}>Grade & Section</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 100 }}>Fee Type</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 120 }}>Fee Name</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 90 }}>Original</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 95 }}>Concession</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 90 }}>Pending</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 110 }}>Category</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 110 }}>Recommended By</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 160 }}>Reason</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 120 }}>Concession By</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 95, borderRight: 0 }}>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pagedLogs.length > 0 ? (
                                    pagedLogs.map((log, idx) => {
                                        const ftc = FEE_TYPE_COLORS[log.feeType] || { color: '#555', bg: '#F9FAFB' };
                                        const origAmount = log.originalAmount ?? log.originalAmt ?? 0;
                                        const globalIdx = page * rowsPerPage + idx;
                                        return (
                                            <TableRow
                                                key={globalIdx}
                                                sx={{
                                                    bgcolor: idx % 2 === 0 ? '#fff' : '#FAFAFA',
                                                    '&:hover': { bgcolor: '#F5F0FA' },
                                                    transition: 'background-color 0.15s',
                                                }}
                                            >
                                                <TableCell sx={{ ...tdCell, color: '#9CA3AF', fontWeight: 600 }}>{globalIdx + 1}</TableCell>

                                                {/* Student */}
                                                <TableCell sx={tdCell}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>{log.studentName}</Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500 }}>Roll: {log.rollNo}</Typography>
                                                </TableCell>

                                                <TableCell sx={{ ...tdCell, color: '#555' }}>{log.gradeSection}</TableCell>

                                                {/* Fee Type chip */}
                                                <TableCell sx={tdCell}>
                                                    <Chip
                                                        label={log.feeType}
                                                        size="small"
                                                        sx={{
                                                            fontSize: 10, fontWeight: 700, height: 22,
                                                            bgcolor: ftc.bg, color: ftc.color,
                                                            border: `1px solid ${ftc.color}30`,
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ ...tdCell, color: '#333' }}>{log.feeName}</TableCell>

                                                {/* Amounts */}
                                                <TableCell sx={{ ...tdCell, color: '#111', fontWeight: 600 }}>
                                                    {formatINR(origAmount)}
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, fontWeight: 700, color: '#DC2626' }}>
                                                    − {formatINR(log.concessionAmt ?? 0)}
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, fontWeight: 700, color: (log.pendingAmount || 0) > 0 ? '#F59E0B' : '#059669' }}>
                                                    {formatINR(log.pendingAmount ?? 0)}
                                                </TableCell>

                                                {/* Category + Mode chip */}
                                                <TableCell sx={tdCell}>
                                                    {log.concessionCategory ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>
                                                                {log.concessionCategory}
                                                            </Typography>
                                                            {log.isSeparateDetailsPerFee === 'Y' && (
                                                                <Chip label="Per-fee" size="small"
                                                                    sx={{ fontSize: 9, fontWeight: 700, height: 16, bgcolor: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', '& .MuiChip-label': { px: 0.6 } }}
                                                                />
                                                            )}
                                                            {log.isSeparateDetailsPerFee === 'N' && (
                                                                <Chip label="Common" size="small"
                                                                    sx={{ fontSize: 9, fontWeight: 700, height: 16, bgcolor: '#F0FDF4', color: '#059669', border: '1px solid #A7F3D0', '& .MuiChip-label': { px: 0.6 } }}
                                                                />
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Typography sx={{ fontSize: '12px', color: '#D1D5DB' }}>—</Typography>
                                                    )}
                                                </TableCell>

                                                {/* Recommended By */}
                                                <TableCell sx={tdCell}>
                                                    {log.recommendedBy
                                                        ? <Typography sx={{ fontSize: '12px', color: '#333' }}>{log.recommendedBy}</Typography>
                                                        : <Typography sx={{ fontSize: '12px', color: '#D1D5DB' }}>—</Typography>}
                                                </TableCell>

                                                {/* Reason */}
                                                <TableCell sx={tdCell}>
                                                    {log.recommendationReason ? (
                                                        <Tooltip title={log.recommendationReason} arrow>
                                                            <Typography sx={{
                                                                fontSize: '12px', color: '#333',
                                                                maxWidth: 180, mx: 'auto',
                                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                            }}>
                                                                {log.recommendationReason}
                                                            </Typography>
                                                        </Tooltip>
                                                    ) : (
                                                        <Typography sx={{ fontSize: '12px', color: '#D1D5DB' }}>—</Typography>
                                                    )}
                                                </TableCell>

                                                {/* Concession By */}
                                                <TableCell sx={tdCell}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>{log.concessionByName}</Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#9CA3AF' }}>{log.concessionByRollNumber}</Typography>
                                                </TableCell>

                                                {/* Date */}
                                                <TableCell sx={{ ...tdCell, borderRight: 0, color: '#555', whiteSpace: 'nowrap' }}>
                                                    {log.concessionDate
                                                        ? new Date(log.concessionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={13} sx={{ textAlign: 'center', py: 8, borderBottom: 'none' }}>
                                            <Avatar sx={{ width: 60, height: 60, bgcolor: '#F3F4F6', mx: 'auto', mb: 1.5 }}>
                                                <ReceiptLongIcon sx={{ fontSize: 32, color: '#9CA3AF' }} />
                                            </Avatar>
                                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#374151' }}>
                                                No concession records found
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#9CA3AF', mt: 0.5 }}>
                                                {searchQuery || selectedGrade || feeTypeFilter !== 'All'
                                                    ? 'Try adjusting your filters or clearing the search.'
                                                    : 'Special concessions applied from the Billing Screen will appear here.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {/* Totals row (all filtered records — not per page) */}
                                {filteredLogs.length > 0 && (
                                    <TableRow sx={{ bgcolor: '#FAF6FC' }}>
                                        <TableCell colSpan={5} sx={{ ...tdCell, textAlign: 'right', fontWeight: 700, color: '#374151', borderTop: '2px solid #E8DDEA' }}>
                                            Totals (all {stats.totalRecords} filtered)
                                        </TableCell>
                                        <TableCell sx={{ ...tdCell, fontWeight: 800, color: '#111', borderTop: '2px solid #E8DDEA' }}>
                                            {formatINR(stats.totalOriginal)}
                                        </TableCell>
                                        <TableCell sx={{ ...tdCell, fontWeight: 800, color: '#DC2626', borderTop: '2px solid #E8DDEA' }}>
                                            − {formatINR(stats.totalConcession)}
                                        </TableCell>
                                        <TableCell sx={{ ...tdCell, fontWeight: 800, color: '#F59E0B', borderTop: '2px solid #E8DDEA' }}>
                                            {formatINR(stats.totalPending)}
                                        </TableCell>
                                        <TableCell colSpan={5} sx={{ ...tdCell, borderRight: 0, borderTop: '2px solid #E8DDEA' }} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {!isLoading && filteredLogs.length > 0 && (
                        <TablePagination
                            component="div"
                            count={filteredLogs.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            sx={{
                                borderTop: '1px solid #E8DDEA',
                                bgcolor: '#FAFAFA',
                                '& .MuiTablePagination-toolbar': { minHeight: 44, px: 2 },
                                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#374151',
                                    margin: 0,
                                },
                                '& .MuiTablePagination-select': {
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: websiteSettings.mainColor,
                                },
                                '& .MuiTablePagination-actions button': {
                                    color: websiteSettings.mainColor,
                                    '&:hover': { bgcolor: `${websiteSettings.mainColor}15` },
                                    '&.Mui-disabled': { color: '#D1D5DB' },
                                },
                            }}
                        />
                    )}
                </Paper>
            </Box>
        </Box>
    );
}
