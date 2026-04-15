import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, TextField, Chip,
    Table, TableBody, TableCell, TableHead, TableRow, Tooltip,
    Autocomplete, InputAdornment, LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
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

export default function ConcessionLog() {
    const navigate = useNavigate();
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);
    const grades = useSelector(selectGrades);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;

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
    const [feeTypeFilter, setFeeTypeFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const selectedGrade = grades.find(g => g.id === selectedGradeId);

    useEffect(() => {
        fetchConcessionLogs();
    }, [selectedYear, selectedGradeId, feeTypeFilter]);

    const fetchConcessionLogs = async () => {
        setIsLoading(true);
        try {
            const params = {
                academicYear: selectedYear,
                feeType: feeTypeFilter,
            };
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

    const filteredLogs = logs.filter(log => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (log.studentName || '').toLowerCase().includes(q) ||
            (log.rollNo || '').toLowerCase().includes(q) ||
            (log.feeName || '').toLowerCase().includes(q) ||
            (log.gradeSection || '').toLowerCase().includes(q) ||
            (log.concessionByName || '').toLowerCase().includes(q)
        );
    });

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
            'Original Amount': log.originalAmt,
            'Concession Amount': log.concessionAmt,
            'Pending Amount': log.pendingAmount,
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
        fontWeight: 600,
        fontSize: '12px',
        py: 1.2,
        px: 1.5,
        whiteSpace: 'nowrap',
    };

    const tdCell = {
        borderRight: 1,
        borderColor: '#E8DDEA',
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
                        <Typography sx={{ fontWeight: '600', fontSize: '19px' }}>Concession Log</Typography>
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
                                        '& .MuiOutlinedInput-input': { textAlign: 'center', fontWeight: '600' },
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
                                        '& .MuiOutlinedInput-input': { textAlign: 'center', fontWeight: '600' },
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Content */}
            <Box sx={{ px: 2, pt: '68px' }}>

                {/* Filter Bar */}
                <Box sx={{ backgroundColor: '#f2f2f2', px: 2, py: 1, borderRadius: '10px 10px 10px 0px', borderBottom: '1px solid #ddd', mb: 2 }}>
                    <Grid container sx={{ alignItems: 'center' }}>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                            {['All', 'School Fee', 'Transport Fee', 'ECA Fee', 'Additional Fee'].map((type) => {
                                const isActive = feeTypeFilter === type;
                                const tc = FEE_TYPE_COLORS[type];
                                return (
                                    <Button
                                        key={type}
                                        size="small"
                                        variant={isActive ? 'contained' : 'outlined'}
                                        onClick={() => setFeeTypeFilter(type)}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: '999px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            height: 28,
                                            px: 1.5,
                                            boxShadow: 'none',
                                            ...(isActive ? {
                                                bgcolor: type === 'All' ? '#00ACC1' : tc?.color,
                                                borderColor: type === 'All' ? '#00ACC1' : tc?.color,
                                                '&:hover': { bgcolor: type === 'All' ? '#0097A7' : tc?.color, boxShadow: 'none' },
                                            } : {
                                                borderColor: '#ccc',
                                                color: '#555',
                                                '&:hover': { borderColor: '#00ACC1', color: '#00ACC1', bgcolor: 'transparent' },
                                            })
                                        }}
                                    >
                                        {type}
                                    </Button>
                                );
                            })}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5, py: 0.5 }}>
                            <TextField
                                placeholder="Search student, roll no, fee..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> } }}
                                sx={{ width: 200, backgroundColor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '5px', height: 28 } }}
                                size="small"
                            />
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                                onClick={handleExport}
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: 600,
                                    borderColor: '#00ACC1', color: '#00ACC1', borderRadius: '30px', height: 28, px: 2,
                                    '&:hover': { bgcolor: '#E0F7FA', borderColor: '#00ACC1' },
                                }}
                            >
                                Export
                            </Button>
                            <Typography sx={{ fontSize: '12px', color: '#777', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {filteredLogs.length} records
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Colored Tab */}
                <Box sx={{
                    bgcolor: '#00ACC1',
                    color: '#fff',
                    fontSize: '13px',
                    px: 3,
                    py: 0.2,
                    ml: '15px',
                    fontWeight: 600,
                    borderTopLeftRadius: '7px',
                    borderTopRightRadius: '7px',
                    width: 'fit-content',
                    height: '20px',
                }}>
                    Special Concession Log
                </Box>

                {/* Table */}
                <Box sx={{ border: '1px solid #E8DDEA', borderRadius: '5px', overflow: 'auto', bgcolor: '#fff' }}>
                    {isLoading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <LinearProgress sx={{ mb: 2, mx: 'auto', width: '50%', borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: '#00ACC1' } }} />
                            <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>Loading concession logs...</Typography>
                        </Box>
                    ) : (
                        <Table sx={{ minWidth: 950 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...thCell, width: 40 }}>S.No</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 120 }}>Student Name</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 80 }}>Roll No</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 100 }}>Grade & Section</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 90 }}>Fee Type</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 110 }}>Fee Name</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 85 }}>Original Amt</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 95 }}>Concession Amt</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 85 }}>Pending Amt</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 110 }}>Concession By</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 90, borderRight: 0 }}>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log, idx) => {
                                        const ftc = FEE_TYPE_COLORS[log.feeType] || { color: '#555', bg: '#F9FAFB' };
                                        return (
                                            <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? '#fff' : '#FAFAFA', '&:hover': { bgcolor: '#f5f0fa' } }}>
                                                <TableCell sx={{ ...tdCell, color: '#9CA3AF' }}>{idx + 1}</TableCell>
                                                <TableCell sx={tdCell}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>{log.studentName}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, color: '#555' }}>{log.rollNo}</TableCell>
                                                <TableCell sx={{ ...tdCell, color: '#555' }}>{log.gradeSection}</TableCell>
                                                <TableCell sx={tdCell}>
                                                    <Chip label={log.feeType} size="small" sx={{ fontSize: 10, fontWeight: 600, height: 20, bgcolor: ftc.bg, color: ftc.color, border: `1px solid ${ftc.color}30` }} />
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, color: '#333' }}>{log.feeName}</TableCell>
                                                <TableCell sx={{ ...tdCell, color: '#555' }}>₹{(log.originalAmt ?? 0).toLocaleString()}</TableCell>
                                                <TableCell sx={{ ...tdCell, fontWeight: 700, color: '#DC2626' }}>- ₹{(log.concessionAmt ?? 0).toLocaleString()}</TableCell>
                                                <TableCell sx={{ ...tdCell, fontWeight: 700, color: log.pendingAmount > 0 ? '#F59E0B' : '#059669' }}>₹{(log.pendingAmount ?? 0).toLocaleString()}</TableCell>
                                                <TableCell sx={tdCell}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>{log.concessionByName}</Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#9CA3AF' }}>{log.concessionByRollNumber}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, borderRight: 0, color: '#555', whiteSpace: 'nowrap' }}>
                                                    {log.concessionDate ? new Date(log.concessionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} sx={{ textAlign: 'center', py: 8, borderBottom: 'none' }}>
                                            <ReceiptLongIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2, display: 'block', mx: 'auto' }} />
                                            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#6B7280' }}>
                                                No concession records found
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#9CA3AF', mt: 0.5 }}>
                                                Special concessions applied from the Billing Screen will appear here.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
