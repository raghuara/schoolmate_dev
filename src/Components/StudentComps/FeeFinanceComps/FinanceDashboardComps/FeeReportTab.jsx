import React from 'react';
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
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';

export default function FeeReportTab({
    reportFeeType,
    setReportFeeType,
    reportFromDate,
    setReportFromDate,
    reportToDate,
    setReportToDate,
    reportGrade,
    setReportGrade,
    reportSection,
    setReportSection,
    selectedGradeId,
    handleGradeChange,
    selectedSection,
    handleSectionChange,
    sections,
}) {
    const grades = useSelector(selectGrades);

    return (
        <Box>
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
                                            value={reportFeeType}
                                            onChange={(e) => setReportFeeType(e.target.value)}
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
                                        value={reportFromDate}
                                        onChange={(e) => setReportFromDate(e.target.value)}
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
                                        value={reportToDate}
                                        onChange={(e) => setReportToDate(e.target.value)}
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
                                        value={grades.find((item) => item.id === selectedGradeId) || null}
                                        onChange={(event, newValue) => {
                                            handleGradeChange(newValue);
                                        }}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        sx={{ width: "150px" }}
                                        PaperComponent={(props) => (
                                            <Paper
                                                {...props}
                                                style={{
                                                    ...props.style,
                                                    maxHeight: "150px",
                                                    backgroundColor: "#000",
                                                    color: "#fff",
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
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: {
                                                        paddingRight: 0,
                                                        height: "33px",
                                                        fontSize: "13px",
                                                        fontWeight: "600",
                                                    },
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
                                        value={
                                            sections.find((option) => option.sectionName === selectedSection) ||
                                            null
                                        }
                                        onChange={handleSectionChange}
                                        isOptionEqualToValue={(option, value) =>
                                            option.sectionName === value.sectionName
                                        }
                                        sx={{ width: "150px" }}
                                        PaperComponent={(props) => (
                                            <Paper
                                                {...props}
                                                style={{
                                                    ...props.style,
                                                    maxHeight: "150px",
                                                    backgroundColor: "#000",
                                                    color: "#fff",
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
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: {
                                                        paddingRight: 0,
                                                        height: "33px",
                                                        fontSize: "13px",
                                                        fontWeight: "600",
                                                    },
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
                                        startIcon={<DownloadIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: '#0891B2',
                                            height: '40px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            '&:hover': { bgcolor: '#0E7490' }
                                        }}
                                    >
                                        Generate
                                    </Button>
                                </Grid>
                            </Grid>

                            {/* Active filter pills */}
                            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '11px', color: '#999', mr: 0.5 }}>Active:</Typography>
                                <Chip
                                    label={reportFeeType}
                                    size="small"
                                    onDelete={() => setReportFeeType('School Fee')}
                                    sx={{ bgcolor: '#0891B215', color: '#0891B2', fontWeight: '600', fontSize: '11px', border: '1px solid #0891B230' }}
                                />
                                {reportFromDate && (
                                    <Chip
                                        label={`From: ${reportFromDate}`}
                                        size="small"
                                        onDelete={() => setReportFromDate('')}
                                        sx={{ bgcolor: '#6366F115', color: '#6366F1', fontWeight: '600', fontSize: '11px', border: '1px solid #6366F130' }}
                                    />
                                )}
                                {reportToDate && (
                                    <Chip
                                        label={`To: ${reportToDate}`}
                                        size="small"
                                        onDelete={() => setReportToDate('')}
                                        sx={{ bgcolor: '#6366F115', color: '#6366F1', fontWeight: '600', fontSize: '11px', border: '1px solid #6366F130' }}
                                    />
                                )}
                                <Chip
                                    label={reportGrade === 'all' ? 'All Grades' : `Grade ${reportGrade}`}
                                    size="small"
                                    onDelete={() => { setReportGrade('all'); setReportSection('all'); }}
                                    sx={{ bgcolor: '#10B98115', color: '#10B981', fontWeight: '600', fontSize: '11px', border: '1px solid #10B98130' }}
                                />
                                {reportSection !== 'all' && (
                                    <Chip
                                        label={`Section ${reportSection}`}
                                        size="small"
                                        onDelete={() => setReportSection('all')}
                                        sx={{ bgcolor: '#F59E0B15', color: '#F59E0B', fontWeight: '600', fontSize: '11px', border: '1px solid #F59E0B30' }}
                                    />
                                )}
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                {/* Quick Report Stats */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Grid container spacing={2}>
                        {[
                            { title: 'Total Revenue', value: '₹67.85L', subtitle: 'This Month', icon: AccountBalanceWalletIcon, color: '#0891B2', bgColor: '#F0F9FA' },
                            { title: 'Collection Rate', value: '88.5%', subtitle: 'Overall', icon: TrendingUpIcon, color: '#22C55E', bgColor: '#F1F8F4' },
                            { title: 'Pending Fees', value: '₹12.48L', subtitle: '119 Students', icon: PendingActionsIcon, color: '#F97316', bgColor: '#FFF8F0' },
                            { title: 'Concessions', value: '₹13.70L', subtitle: '173 Students', icon: ReceiptIcon, color: '#7C3AED', bgColor: '#F9F0FB' },
                        ].map((stat, index) => {
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
                                    {reportFeeType} Report — {reportGrade === 'all' ? 'All Grades' : `Grade ${reportGrade}${reportSection !== 'all' ? ` · Section ${reportSection}` : ''}`}
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
                                    {[
                                        { sno: 1, roll: 'GR1-001', name: 'Aarav Sharma', grade: 'Grade 1-A', feeType: 'School Fee', feeAmt: 45000, paidAmt: 45000, dueDate: '2026-01-15', status: 'Paid' },
                                        { sno: 2, roll: 'GR1-002', name: 'Priya Mehta', grade: 'Grade 1-A', feeType: 'School Fee', feeAmt: 45000, paidAmt: 22500, dueDate: '2026-01-15', status: 'Partial' },
                                        { sno: 3, roll: 'GR1-003', name: 'Rohan Gupta', grade: 'Grade 1-B', feeType: 'School Fee', feeAmt: 45000, paidAmt: 0, dueDate: '2026-01-15', status: 'Pending' },
                                        { sno: 4, roll: 'GR2-001', name: 'Sneha Reddy', grade: 'Grade 2-A', feeType: 'School Fee', feeAmt: 48000, paidAmt: 48000, dueDate: '2026-01-20', status: 'Paid' },
                                        { sno: 5, roll: 'GR2-002', name: 'Arjun Singh', grade: 'Grade 2-B', feeType: 'School Fee', feeAmt: 48000, paidAmt: 0, dueDate: '2025-12-20', status: 'Overdue' },
                                        { sno: 6, roll: 'GR3-001', name: 'Kavya Nair', grade: 'Grade 3-A', feeType: 'School Fee', feeAmt: 50000, paidAmt: 50000, dueDate: '2026-01-10', status: 'Paid' },
                                        { sno: 7, roll: 'GR3-002', name: 'Ananya Das', grade: 'Grade 3-A', feeType: 'School Fee', feeAmt: 50000, paidAmt: 25000, dueDate: '2026-01-10', status: 'Partial' },
                                        { sno: 8, roll: 'GR4-001', name: 'Rahul Kumar', grade: 'Grade 4-B', feeType: 'School Fee', feeAmt: 52000, paidAmt: 52000, dueDate: '2026-02-01', status: 'Paid' },
                                        { sno: 9, roll: 'GR4-002', name: 'Divya Patel', grade: 'Grade 4-C', feeType: 'School Fee', feeAmt: 52000, paidAmt: 0, dueDate: '2026-01-05', status: 'Overdue' },
                                        { sno: 10, roll: 'GR5-001', name: 'Vikram Joshi', grade: 'Grade 5-A', feeType: 'School Fee', feeAmt: 55000, paidAmt: 55000, dueDate: '2026-02-05', status: 'Paid' },
                                        { sno: 11, roll: 'GR5-002', name: 'Neha Iyer', grade: 'Grade 5-B', feeType: 'School Fee', feeAmt: 55000, paidAmt: 27500, dueDate: '2026-02-05', status: 'Partial' },
                                        { sno: 12, roll: 'GR6-001', name: 'Karan Verma', grade: 'Grade 6-A', feeType: 'School Fee', feeAmt: 58000, paidAmt: 0, dueDate: '2026-01-25', status: 'Pending' },
                                        { sno: 13, roll: 'GR7-001', name: 'Pooja Sharma', grade: 'Grade 7-A', feeType: 'School Fee', feeAmt: 60000, paidAmt: 60000, dueDate: '2026-02-10', status: 'Paid' },
                                        { sno: 14, roll: 'GR8-001', name: 'Aditya Rao', grade: 'Grade 8-B', feeType: 'School Fee', feeAmt: 62000, paidAmt: 0, dueDate: '2025-12-31', status: 'Overdue' },
                                        { sno: 15, roll: 'GR9-001', name: 'Meera Krishnan', grade: 'Grade 9-A', feeType: 'School Fee', feeAmt: 65000, paidAmt: 65000, dueDate: '2026-02-15', status: 'Paid' },
                                    ].map((row) => {
                                        const pending = row.feeAmt - row.paidAmt;
                                        const statusConfig = {
                                            Paid: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
                                            Partial: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
                                            Pending: { bg: '#FFFBEB', color: '#B45309', border: '#FCD34D' },
                                            Overdue: { bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' },
                                        }[row.status];
                                        return (
                                            <TableRow key={row.sno} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                                <TableCell sx={{ fontSize: '12px', color: '#6B7280' }}>{row.sno}</TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#1F2937' }}>{row.roll}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{row.name}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>{row.grade}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={row.feeType} size="small" sx={{
                                                        bgcolor: '#F3F4F6', color: '#374151',
                                                        fontSize: '10px', fontWeight: '600',
                                                        border: '1px solid #E5E7EB', height: '20px'
                                                    }} />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                                                    ₹{row.feeAmt.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '12px', fontWeight: '600', color: '#22C55E' }}>
                                                    ₹{row.paidAmt.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '12px', fontWeight: '600', color: pending > 0 ? '#F97316' : '#22C55E' }}>
                                                    ₹{pending.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '11px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                                                    {row.dueDate}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={row.status} size="small" sx={{
                                                        bgcolor: statusConfig.bg,
                                                        color: statusConfig.color,
                                                        border: `1px solid ${statusConfig.border}`,
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
                        <Box sx={{
                            px: 3, py: 1.5,
                            bgcolor: '#F5F7FA',
                            borderTop: '2px solid #E5E7EB',
                            display: 'flex', gap: 4, flexWrap: 'wrap'
                        }}>
                            {[
                                { label: 'Total Students', value: '15', color: '#374151' },
                                { label: 'Total Fee Amount', value: '₹8,15,000', color: '#111827' },
                                { label: 'Total Paid', value: '₹5,50,000', color: '#22C55E' },
                                { label: 'Total Pending', value: '₹2,65,000', color: '#F97316' },
                            ].map((s, i) => (
                                <Box key={i}>
                                    <Typography sx={{ fontSize: '10px', color: '#888', letterSpacing: '0.3px' }}>{s.label}</Typography>
                                    <Typography sx={{ fontSize: '14px', fontWeight: '700', color: s.color }}>{s.value}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
