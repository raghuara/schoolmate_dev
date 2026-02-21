import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    Autocomplete,
    Paper,
    Chip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';
import { feeReport } from '../../../../Api/Api';
import SnackBar from '../../../SnackBar';

const token = "123";

// Convert yyyy-MM-dd → dd-MM-yyyy
const formatDateForApi = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
};

export default function FeeReportTab() {
    const grades = useSelector(selectGrades);

    const [selectedFeeType, setSelectedFeeType] = useState('School Fee');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const selectedGrade = grades.find((g) => g.id === selectedGradeId) || null;
    const selectedGradeSign = selectedGrade?.sign || null;
    const sections = selectedGrade?.sections.map((s) => ({ sectionName: s })) || [];

    const handleGradeChange = (newValue) => {
        setSelectedGradeId(newValue ? newValue.id : null);
        setSelectedSection(null);
    };

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };

    const fetchReportData = async () => {
        // Mandatory field validation
        if (!fromDate) {
            setMessage('From Date is required'); setOpen(true); setColor(false); setStatus(false);
            return;
        }
        if (!toDate) {
            setMessage('To Date is required'); setOpen(true); setColor(false); setStatus(false);
            return;
        }
        if (!selectedGradeSign) {
            setMessage('Grade is required'); setOpen(true); setColor(false); setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const params = {
                FeeType: selectedFeeType,
                FromDate: formatDateForApi(fromDate),
                ToDate: formatDateForApi(toDate),
                Grade: selectedGradeSign,
            };
            if (selectedSection) params.Section = selectedSection;

            const res = await axios.get(feeReport, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            setReportData(res.data.data);
        } catch (error) {
            const apiMsg = error?.response?.data?.message;
            setMessage(apiMsg || 'Failed to fetch report'); setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    const rows = reportData?.rows || [];

    const summaryStats = [
        {
            title: 'Total Students',
            value: reportData ? String(reportData.totalStudents) : '—',
            subtitle: 'In selected filter',
            icon: PeopleIcon,
            color: '#0891B2',
            bgColor: '#F0F9FA',
        },
        {
            title: 'Total Fee Amount',
            value: reportData ? `₹${reportData.totalFeeAmount.toLocaleString()}` : '—',
            subtitle: 'Gross fee',
            icon: AccountBalanceWalletIcon,
            color: '#7C3AED',
            bgColor: '#F9F0FB',
        },
        {
            title: 'Total Paid',
            value: reportData ? `₹${reportData.totalPaidAmount.toLocaleString()}` : '—',
            subtitle: 'Amount collected',
            icon: TrendingUpIcon,
            color: '#22C55E',
            bgColor: '#F1F8F4',
        },
        {
            title: 'Total Pending',
            value: reportData ? `₹${reportData.totalPendingAmount.toLocaleString()}` : '—',
            subtitle: 'Outstanding amount',
            icon: PendingActionsIcon,
            color: '#F97316',
            bgColor: '#FFF8F0',
        },
    ];

    const statusConfig = {
        Paid:    { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
        Partial: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
        Pending: { bg: '#FFFBEB', color: '#B45309', border: '#FCD34D' },
        Overdue: { bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' },
    };

    const tableTitle = `${selectedFeeType} Report — ${
        selectedGradeSign
            ? `Grade ${selectedGradeSign}${selectedSection ? ` · Section ${selectedSection}` : ''}`
            : 'All Grades'
    }`;

    return (
        <Box>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Report Filters */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '12px', overflow: 'hidden' }}>
                        {/* Card Header */}
                        <Box sx={{
                            px: 3, py: 2,
                            background: 'linear-gradient(135deg, #0891B210 0%, #0891B205 100%)',
                            borderBottom: '1px solid #E8E8E8',
                            display: 'flex', alignItems: 'center', gap: 1.5
                        }}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '8px',
                                bgcolor: '#0891B218', border: '1px solid #0891B230',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <AssessmentIcon sx={{ fontSize: 20, color: '#0891B2' }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                                    Generate Fee Report
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                    Select filters to generate a detailed fee report
                                </Typography>
                            </Box>
                        </Box>

                        {/* Filters Row */}
                        <Box sx={{ px: 3, py: 2.5, bgcolor: '#FAFAFA' }}>
                            <Grid container spacing={2} alignItems="flex-end">

                                {/* Fee Type */}
                                <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#555', mb: 0.8, letterSpacing: '0.4px' }}>
                                        FEE TYPE
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={selectedFeeType}
                                            onChange={(e) => setSelectedFeeType(e.target.value)}
                                            sx={{
                                                bgcolor: '#fff', borderRadius: '8px',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0891B2' },
                                            }}
                                        >
                                            <MenuItem value="School Fee">School Fee</MenuItem>
                                            <MenuItem value="Transport Fee">Transport Fee</MenuItem>
                                            <MenuItem value="ECA Fee">ECA Fee</MenuItem>
                                            <MenuItem value="Additional Fee">Additional Fee</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* From Date */}
                                <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#555', mb: 0.8, letterSpacing: '0.4px' }}>
                                        FROM DATE
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        sx={{
                                            bgcolor: '#fff',
                                            borderRadius: '8px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                '& fieldset': { borderColor: '#E0E0E0' },
                                                '&.Mui-focused fieldset': { borderColor: '#0891B2' },
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* To Date */}
                                <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#555', mb: 0.8, letterSpacing: '0.4px' }}>
                                        TO DATE
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        sx={{
                                            bgcolor: '#fff',
                                            borderRadius: '8px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                '& fieldset': { borderColor: '#E0E0E0' },
                                                '&.Mui-focused fieldset': { borderColor: '#0891B2' },
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Grade */}
                                <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#555', mb: 0.8, letterSpacing: '0.4px' }}>
                                        GRADE
                                    </Typography>
                                    <Autocomplete
                                        disablePortal
                                        options={grades}
                                        getOptionLabel={(option) => option.sign}
                                        value={selectedGrade}
                                        onChange={(event, newValue) => handleGradeChange(newValue)}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        sx={{ width: '100%' }}
                                        PaperComponent={(props) => (
                                            <Paper
                                                {...props}
                                                style={{
                                                    ...props.style,
                                                    maxHeight: '150px',
                                                    backgroundColor: '#000',
                                                    color: '#fff',
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props} className="classdropdownOptions">
                                                {option.sign}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                placeholder="Select Class"
                                                {...params}
                                                fullWidth
                                                size="small"
                                                slotProps={{
                                                    input: {
                                                        ...params.InputProps,
                                                        sx: {
                                                            paddingRight: 0,
                                                            height: '40px',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            bgcolor: '#fff',
                                                            borderRadius: '8px',
                                                        },
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Section */}
                                <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: '700', color: '#555', mb: 0.8, letterSpacing: '0.4px' }}>
                                        SECTION
                                    </Typography>
                                    <Autocomplete
                                        disablePortal
                                        options={sections}
                                        getOptionLabel={(option) => option.sectionName}
                                        value={sections.find((s) => s.sectionName === selectedSection) || null}
                                        onChange={handleSectionChange}
                                        isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
                                        sx={{ width: '100%' }}
                                        PaperComponent={(props) => (
                                            <Paper
                                                {...props}
                                                style={{
                                                    ...props.style,
                                                    maxHeight: '150px',
                                                    backgroundColor: '#000',
                                                    color: '#fff',
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props} className="classdropdownOptions">
                                                {option.sectionName}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                size="small"
                                                slotProps={{
                                                    input: {
                                                        ...params.InputProps,
                                                        sx: {
                                                            paddingRight: 0,
                                                            height: '40px',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            bgcolor: '#fff',
                                                            borderRadius: '8px',
                                                        },
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Generate Button */}
                                <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                                        onClick={fetchReportData}
                                        disabled={isLoading}
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: '#0891B2',
                                            height: '40px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            '&:hover': { bgcolor: '#0E7490' }
                                        }}
                                    >
                                        {isLoading ? 'Loading...' : 'Generate'}
                                    </Button>
                                </Grid>
                            </Grid>

                            {/* Active filter pills */}
                            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '11px', color: '#999', mr: 0.5 }}>Active:</Typography>
                                <Chip
                                    label={selectedFeeType}
                                    size="small"
                                    onDelete={() => setSelectedFeeType('School Fee')}
                                    sx={{ bgcolor: '#0891B215', color: '#0891B2', fontWeight: '600', fontSize: '11px', border: '1px solid #0891B230' }}
                                />
                                {fromDate && (
                                    <Chip
                                        label={`From: ${fromDate}`}
                                        size="small"
                                        onDelete={() => setFromDate('')}
                                        sx={{ bgcolor: '#6366F115', color: '#6366F1', fontWeight: '600', fontSize: '11px', border: '1px solid #6366F130' }}
                                    />
                                )}
                                {toDate && (
                                    <Chip
                                        label={`To: ${toDate}`}
                                        size="small"
                                        onDelete={() => setToDate('')}
                                        sx={{ bgcolor: '#6366F115', color: '#6366F1', fontWeight: '600', fontSize: '11px', border: '1px solid #6366F130' }}
                                    />
                                )}
                                {selectedGradeSign && (
                                    <Chip
                                        label={`Grade ${selectedGradeSign}`}
                                        size="small"
                                        onDelete={() => { handleGradeChange(null); }}
                                        sx={{ bgcolor: '#10B98115', color: '#10B981', fontWeight: '600', fontSize: '11px', border: '1px solid #10B98130' }}
                                    />
                                )}
                                {selectedSection && (
                                    <Chip
                                        label={`Section ${selectedSection}`}
                                        size="small"
                                        onDelete={() => setSelectedSection(null)}
                                        sx={{ bgcolor: '#F59E0B15', color: '#F59E0B', fontWeight: '600', fontSize: '11px', border: '1px solid #F59E0B30' }}
                                    />
                                )}
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                {/* Summary Stats */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Grid container spacing={2}>
                        {summaryStats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <Grid key={index} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                    <Card sx={{ boxShadow: 'none', border: `1px solid ${stat.color}`, borderRadius: '4px', bgcolor: stat.bgColor }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                        {stat.title}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', mb: 0.5 }}>
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                        {stat.subtitle}
                                                    </Typography>
                                                </Box>
                                                <IconComponent sx={{ fontSize: 36, color: stat.color }} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Grid>

                {/* Detailed Report Table */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '12px', overflow: 'hidden' }}>
                        {/* Table Header */}
                        <Box sx={{
                            px: 3, py: 2,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: '1px solid #E8E8E8', bgcolor: '#FAFAFA'
                        }}>
                            <Box>
                                <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                                    {tableTitle}
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#888', mt: 0.2 }}>
                                    Student-wise fee details
                                </Typography>
                            </Box>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                sx={{
                                    textTransform: 'none', fontSize: '12px', fontWeight: '600',
                                    borderColor: '#0891B2', color: '#0891B2', borderRadius: '8px',
                                    '&:hover': { bgcolor: '#F0F9FA', borderColor: '#0891B2' }
                                }}
                            >
                                Export
                            </Button>
                        </Box>

                        <TableContainer sx={{ maxHeight: 480 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {['S.No', 'Roll Number', 'Student Name', 'Grade & Section', 'Fee Type', 'Fee Amount', 'Paid Amount', 'Pending Amount', 'Due Date', 'Status'].map((col) => (
                                            <TableCell key={col} sx={{
                                                fontWeight: '700', fontSize: '11px',
                                                bgcolor: '#F5F7FA', color: '#374151',
                                                letterSpacing: '0.3px', whiteSpace: 'nowrap',
                                                borderBottom: '2px solid #E5E7EB'
                                            }}>
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                                <CircularProgress size={32} sx={{ color: '#0891B2' }} />
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                                <Typography sx={{ fontSize: '13px', color: '#999' }}>
                                                    No data found. Click Generate to load the report.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.map((row) => {
                                        const cfg = statusConfig[row.status] || statusConfig.Pending;
                                        return (
                                            <TableRow key={row.sNo} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                                <TableCell sx={{ fontSize: '12px', color: '#6B7280' }}>{row.sNo}</TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>{row.rollNumber}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{row.studentName}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>{row.grade}{row.section ? ` · ${row.section}` : ''}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={row.feeType} size="small" sx={{
                                                        bgcolor: '#F3F4F6', color: '#374151',
                                                        fontSize: '10px', fontWeight: '600',
                                                        border: '1px solid #E5E7EB', height: '20px'
                                                    }} />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                                                    ₹{row.feeAmount.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '12px', fontWeight: '600', color: '#22C55E' }}>
                                                    ₹{row.paidAmount.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '12px', fontWeight: '600', color: row.pendingAmount > 0 ? '#F97316' : '#22C55E' }}>
                                                    ₹{row.pendingAmount.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '11px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                                                    {row.dueDate || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={row.status} size="small" sx={{
                                                        bgcolor: cfg.bg,
                                                        color: cfg.color,
                                                        border: `1px solid ${cfg.border}`,
                                                        fontSize: '10px', fontWeight: '700', height: '22px'
                                                    }} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Table Footer Summary */}
                        {reportData && (
                            <Box sx={{
                                px: 3, py: 1.5,
                                bgcolor: '#F5F7FA',
                                borderTop: '2px solid #E5E7EB',
                                display: 'flex', gap: 4, flexWrap: 'wrap'
                            }}>
                                {[
                                    { label: 'Total Students', value: String(reportData.totalStudents), color: '#374151' },
                                    { label: 'Total Fee Amount', value: `₹${reportData.totalFeeAmount.toLocaleString()}`, color: '#111827' },
                                    { label: 'Total Paid', value: `₹${reportData.totalPaidAmount.toLocaleString()}`, color: '#22C55E' },
                                    { label: 'Total Pending', value: `₹${reportData.totalPendingAmount.toLocaleString()}`, color: '#F97316' },
                                ].map((s, i) => (
                                    <Box key={i}>
                                        <Typography sx={{ fontSize: '10px', color: '#888', letterSpacing: '0.3px' }}>{s.label}</Typography>
                                        <Typography sx={{ fontSize: '14px', fontWeight: '700', color: s.color }}>{s.value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
