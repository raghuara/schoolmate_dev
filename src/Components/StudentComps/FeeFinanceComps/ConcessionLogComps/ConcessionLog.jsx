import React, { useState, useEffect, useMemo } from 'react';
import { selectAcademicYear } from "../../../../Redux/Slices/academicYearSlice";
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
import { DASH, RADIUS } from "../../../DashBoardComps/dashboardTheme";
import { FeeTableSkeleton } from "../PayStudentFees/BillingSkeletons";
import * as XLSX from 'xlsx';
import { GetConcessionLog } from '../../../../Api/Api';

const token = '123';

const FEE_TYPE_COLORS = {
    'School Fee': { color: '#E30053', bg: '#FDECF2', border: '#F7C9DA' },
    'Transport Fee': { color: DASH.blue, bg: DASH.blueLight, border: '#BFDBFE' },
    'ECA Fee': { color: DASH.violet, bg: DASH.violetLight, border: '#DDD6FE' },
    'Additional Fee': { color: DASH.cyan, bg: DASH.cyanLight, border: '#A5F3FC' },
};

const FEE_TABS = ['All', 'School Fee', 'Transport Fee', 'ECA Fee', 'Additional Fee'];

const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

export default function ConcessionLog() {
    const navigate = useNavigate();
    const grades = useSelector(selectGrades);
    const websiteSettings = useSelector(selectWebsiteSettings);


    // The academic year comes from the header - one picker for the whole site.
    const selectedYear = useSelector(selectAcademicYear);
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
        // The header owns the academic year; asking for logs before it has
        // rehydrated just fetches the wrong year, or nothing.
        if (!selectedYear) return;
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
        backgroundColor: DASH.surface,
        borderRight: 1,
        borderColor: DASH.line,
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '10.5px',
        color: DASH.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        py: 1.2,
        px: 1.5,
        whiteSpace: 'nowrap',
    };

    const tdCell = {
        borderRight: 1,
        borderColor: DASH.line,
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
                backgroundColor: DASH.canvas,
                px: 2,
                py: 1.2,
                borderBottom: `1px solid ${DASH.line}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                flexWrap: 'wrap',
            }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: 28, height: 28 }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
                        </IconButton>
                        <Box sx={{ ml: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '20px', color: DASH.ink, lineHeight: 1.2 }}>Concession Log</Typography>
                            <Typography sx={{ fontSize: '11.5px', color: DASH.muted, whiteSpace: 'nowrap' }}>
                                All special concessions applied across {selectedYear}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end', gap: 1, ml: 'auto', flexWrap: 'wrap' }}>
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
                    </Box>
            </Box>

            {/* Content */}
            <Box sx={{ px: 2, pt: 2, pb: 3 }}>

        
                {/* ═══ Pill Tabs + Search + Export ═══ */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5,
                    mb: 2, p: 1.2, borderRadius: '50px', bgcolor: DASH.lineSoft,
                    border: `1px solid ${DASH.line}`,
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
                                color: DASH.muted,
                                fontWeight: 700,
                                minWidth: 0,
                                minHeight: '30px',
                                height: '30px',
                                px: 1.8,
                                m: 0.6,
                            },
                            '& .Mui-selected': {
                                color: `${'#fff'} !important`,
                                bgcolor: '#E30053',
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
                                            <SearchIcon sx={{ fontSize: 18, color: DASH.muted }} />
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
                                    borderColor: '#E30053',
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
                                bgcolor: '#fff', color: DASH.text,
                                border: `1px solid ${DASH.line}`,
                            }}
                        />

                        {/* Export button */}
                        <Button
                            size="small"
                            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                            onClick={handleExport}
                            sx={{
                                textTransform: 'none', fontSize: '12px', fontWeight: 700,
                                bgcolor: '#E30053', color: '#fff',
                                borderRadius: '50px', height: 30, px: 2, boxShadow: 'none',
                                '&:hover': { bgcolor: '#E30053', opacity: 0.9, boxShadow: 'none' },
                            }}
                        >
                            Export
                        </Button>
                    </Box>
                </Box>

                {/* Active filter summary */}
                {(searchQuery || selectedGrade || feeTypeFilter !== 'All') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '11px', color: DASH.muted, fontWeight: 600 }}>
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
                                sx={{ height: 22, fontSize: '10px', fontWeight: 600, bgcolor: DASH.blueLight, color: DASH.blue, border: `1px solid #BFDBFE` }}
                            />
                        )}
                        {searchQuery && (
                            <Chip
                                label={`Search: "${searchQuery}"`}
                                size="small"
                                onDelete={() => setSearchQuery('')}
                                sx={{ height: 22, fontSize: '10px', fontWeight: 600, bgcolor: DASH.lineSoft, color: DASH.text, border: '1px solid #D1D5DB' }}
                            />
                        )}
                    </Box>
                )}

                {/* Colored Tab Label */}
                <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.8,
                    bgcolor: '#E30053', color: '#fff',
                    fontSize: '12px', px: 2.5, py: 0.5, ml: '15px',
                    fontWeight: 700, letterSpacing: 0.3,
                    borderTopLeftRadius: '7px', borderTopRightRadius: '7px',
                }}>
                    <ReceiptLongIcon sx={{ fontSize: 14 }} />
                    Special Concession Log
                </Box>

                {/* Table */}
                <Paper elevation={0} sx={{
                    border: `1px solid ${DASH.line}`, borderRadius: '5px', overflow: 'auto',
                    bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                    {isLoading ? (
                        <FeeTableSkeleton columns={11} rows={8} />
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
                                        const ftc = FEE_TYPE_COLORS[log.feeType] || { color: DASH.muted, bg: DASH.surface };
                                        const origAmount = log.originalAmount ?? log.originalAmt ?? 0;
                                        const globalIdx = page * rowsPerPage + idx;
                                        return (
                                            <TableRow
                                                key={globalIdx}
                                                sx={{
                                                    bgcolor: idx % 2 === 0 ? '#fff' : DASH.surface,
                                                    '&:hover': { bgcolor: DASH.violetLight },
                                                    transition: 'background-color 0.15s',
                                                }}
                                            >
                                                <TableCell sx={{ ...tdCell, color: DASH.faint, fontWeight: 600 }}>{globalIdx + 1}</TableCell>

                                                {/* Student */}
                                                <TableCell sx={tdCell}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: DASH.ink }}>{log.studentName}</Typography>
                                                    <Typography sx={{ fontSize: '10px', color: DASH.faint, fontWeight: 500 }}>Roll: {log.rollNo}</Typography>
                                                </TableCell>

                                                <TableCell sx={{ ...tdCell, color: DASH.muted }}>{log.gradeSection}</TableCell>

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

                                                <TableCell sx={{ ...tdCell, color: DASH.text }}>{log.feeName}</TableCell>

                                                {/* Amounts */}
                                                <TableCell sx={{ ...tdCell, color: DASH.ink, fontWeight: 600 }}>
                                                    {formatINR(origAmount)}
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, fontWeight: 700, color: DASH.red }}>
                                                    − {formatINR(log.concessionAmt ?? 0)}
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, fontWeight: 700, color: (log.pendingAmount || 0) > 0 ? DASH.amber : DASH.green }}>
                                                    {formatINR(log.pendingAmount ?? 0)}
                                                </TableCell>

                                                {/* Category + Mode chip */}
                                                <TableCell sx={tdCell}>
                                                    {log.concessionCategory ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: DASH.ink }}>
                                                                {log.concessionCategory}
                                                            </Typography>
                                                            {log.isSeparateDetailsPerFee === 'Y' && (
                                                                <Chip label="Per-fee" size="small"
                                                                    sx={{ fontSize: 9, fontWeight: 700, height: 16, bgcolor: DASH.blueLight, color: DASH.blue, border: `1px solid #BFDBFE`, '& .MuiChip-label': { px: 0.6 } }}
                                                                />
                                                            )}
                                                            {log.isSeparateDetailsPerFee === 'N' && (
                                                                <Chip label="Common" size="small"
                                                                    sx={{ fontSize: 9, fontWeight: 700, height: 16, bgcolor: DASH.greenLight, color: DASH.green, border: `1px solid ${DASH.green}4D`, '& .MuiChip-label': { px: 0.6 } }}
                                                                />
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Typography sx={{ fontSize: '12px', color: DASH.faint }}>—</Typography>
                                                    )}
                                                </TableCell>

                                                {/* Recommended By */}
                                                <TableCell sx={tdCell}>
                                                    {log.recommendedBy
                                                        ? <Typography sx={{ fontSize: '12px', color: DASH.text }}>{log.recommendedBy}</Typography>
                                                        : <Typography sx={{ fontSize: '12px', color: DASH.faint }}>—</Typography>}
                                                </TableCell>

                                                {/* Reason */}
                                                <TableCell sx={tdCell}>
                                                    {log.recommendationReason ? (
                                                        <Tooltip title={log.recommendationReason} arrow>
                                                            <Typography sx={{
                                                                fontSize: '12px', color: DASH.text,
                                                                maxWidth: 180, mx: 'auto',
                                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                            }}>
                                                                {log.recommendationReason}
                                                            </Typography>
                                                        </Tooltip>
                                                    ) : (
                                                        <Typography sx={{ fontSize: '12px', color: DASH.faint }}>—</Typography>
                                                    )}
                                                </TableCell>

                                                {/* Concession By */}
                                                <TableCell sx={tdCell}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: DASH.ink }}>{log.concessionByName}</Typography>
                                                    <Typography sx={{ fontSize: '10px', color: DASH.faint }}>{log.concessionByRollNumber}</Typography>
                                                </TableCell>

                                                {/* Date */}
                                                <TableCell sx={{ ...tdCell, borderRight: 0, color: DASH.muted, whiteSpace: 'nowrap' }}>
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
                                            <Avatar sx={{ width: 60, height: 60, bgcolor: DASH.lineSoft, mx: 'auto', mb: 1.5 }}>
                                                <ReceiptLongIcon sx={{ fontSize: 32, color: DASH.faint }} />
                                            </Avatar>
                                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: DASH.text }}>
                                                No concession records found
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: DASH.faint, mt: 0.5 }}>
                                                {searchQuery || selectedGrade || feeTypeFilter !== 'All'
                                                    ? 'Try adjusting your filters or clearing the search.'
                                                    : 'Special concessions applied from the Billing Screen will appear here.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {/* Totals row (all filtered records — not per page) */}
                                {filteredLogs.length > 0 && (
                                    <TableRow sx={{ bgcolor: DASH.surface }}>
                                        <TableCell colSpan={5} sx={{ ...tdCell, textAlign: 'right', fontWeight: 700, color: DASH.text, borderTop: `2px solid ${DASH.line}` }}>
                                            Totals (all {stats.totalRecords} filtered)
                                        </TableCell>
                                        <TableCell sx={{ ...tdCell, fontWeight: 800, color: DASH.ink, borderTop: `2px solid ${DASH.line}` }}>
                                            {formatINR(stats.totalOriginal)}
                                        </TableCell>
                                        <TableCell sx={{ ...tdCell, fontWeight: 800, color: DASH.red, borderTop: `2px solid ${DASH.line}` }}>
                                            − {formatINR(stats.totalConcession)}
                                        </TableCell>
                                        <TableCell sx={{ ...tdCell, fontWeight: 800, color: DASH.amber, borderTop: `2px solid ${DASH.line}` }}>
                                            {formatINR(stats.totalPending)}
                                        </TableCell>
                                        <TableCell colSpan={5} sx={{ ...tdCell, borderRight: 0, borderTop: `2px solid ${DASH.line}` }} />
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
                                borderTop: `1px solid ${DASH.line}`,
                                bgcolor: DASH.surface,
                                '& .MuiTablePagination-toolbar': { minHeight: 44, px: 2 },
                                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: DASH.text,
                                    margin: 0,
                                },
                                '& .MuiTablePagination-select': {
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#E30053',
                                },
                                '& .MuiTablePagination-actions button': {
                                    color: '#E30053',
                                    '&:hover': { bgcolor: `${'#E30053'}15` },
                                    '&.Mui-disabled': { color: DASH.faint },
                                },
                            }}
                        />
                    )}
                </Paper>
            </Box>
        </Box>
    );
}
