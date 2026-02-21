import React, { useState } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow,
    Avatar, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions,
    Select, MenuItem, FormControl,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import SnackBar from '../../SnackBar';

const PRIMARY = '#FF9800';
const PRIMARY_LIGHT = '#FFF4E6';
const PRIMARY_DARK = '#F57C00';
const CARD_RADIUS = '12px';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

const DURATION_OPTIONS = [
    { label: '1 Month', value: 1 },
    { label: '3 Months', value: 3 },
    { label: '6 Months', value: 6 },
    { label: '9 Months', value: 9 },
];

// Mock company info — replace with websiteSettings in production
const companyInfo = {
    name: 'SchoolMate Academy',
    address: '123 Education Street, Knowledge Park, City – 400001',
    contact: '+91 98765 43210',
    email: 'hr@schoolmate.edu.in',
    pfRegNo: 'MH/MUM/12345/678',
    esiRegNo: '31-00-123456-000-0001',
};

// Mock payroll data — replace with API in production
const mockPayrollData = [
    {
        id: 1,
        employeeId: 'EMP001',
        name: 'Rajesh Kumar',
        designation: 'Senior Teacher',
        department: 'Mathematics',
        dateOfJoining: '15 Jun 2018',
        pan: 'ABCPK1234D',
        bankAccount: '****4567',
        bankName: 'State Bank of India',
        uan: '101234567890',
        pfNumber: 'MH/12345/001',
        esiNumber: '1234567890',
        basicSalary: 45000,
        grossSalary: 70500,
        deductions: 6800,
        netSalary: 63700,
        status: 'Pending',
        earnings: { basic: 45000, hra: 18000, da: 4500, ta: 2000, incentive: 1000, additionalSalary: 0 },
        deductionDetails: { pf: 5400, esi: 500, pt: 200, tds: 700, advance: 0 },
        attendance: { workingDays: 26, present: 24, absent: 2, lop: 2, holidays: 4 },
    },
    {
        id: 2,
        employeeId: 'EMP002',
        name: 'Priya Sharma',
        designation: 'Teacher',
        department: 'Science',
        dateOfJoining: '01 Apr 2020',
        pan: 'BCDQR5678E',
        bankAccount: '****8901',
        bankName: 'HDFC Bank',
        uan: '101234567891',
        pfNumber: 'MH/12345/002',
        esiNumber: '1234567891',
        basicSalary: 30000,
        grossSalary: 48600,
        deductions: 4200,
        netSalary: 44400,
        status: 'Pending',
        earnings: { basic: 30000, hra: 12000, da: 3000, ta: 1500, incentive: 2100, additionalSalary: 0 },
        deductionDetails: { pf: 3600, esi: 350, pt: 150, tds: 100, advance: 0 },
        attendance: { workingDays: 26, present: 26, absent: 0, lop: 0, holidays: 4 },
    },
    {
        id: 3,
        employeeId: 'EMP003',
        name: 'Amit Patel',
        designation: 'Lab Assistant',
        department: 'Laboratory',
        dateOfJoining: '10 Jan 2022',
        pan: 'CDERF9012F',
        bankAccount: '****2345',
        bankName: 'ICICI Bank',
        uan: '101234567892',
        pfNumber: 'MH/12345/003',
        esiNumber: '1234567892',
        basicSalary: 25000,
        grossSalary: 38600,
        deductions: 3500,
        netSalary: 35100,
        status: 'Approved',
        earnings: { basic: 25000, hra: 10000, da: 2500, ta: 1100, incentive: 0, additionalSalary: 0 },
        deductionDetails: { pf: 3000, esi: 300, pt: 200, tds: 0, advance: 0 },
        attendance: { workingDays: 26, present: 25, absent: 1, lop: 1, holidays: 4 },
    },
];

// Compute start month/year given end + duration
const getStartDate = (endMonth, endYear, duration) => {
    let m = endMonth - (duration - 1);
    let y = endYear;
    if (m < 0) { m += 12; y--; }
    return { month: m, year: y };
};

// Generate per-month salary data for the selected range
const generateMonthlyData = (employee, endMonth, endYear, duration) => {
    const { month: startM, year: startY } = getStartDate(endMonth, endYear, duration);
    const months = [];
    let m = startM;
    let y = startY;

    for (let i = 0; i < duration; i++) {
        const variation = Math.random() * 0.06 - 0.03; // ±3% realistic variation
        const workingDays = 26;
        const lopBase = i === 0 ? employee.attendance.lop : Math.floor(Math.random() * 3);
        const lop = lopBase;
        const paidDays = workingDays - lop;
        const ratio = paidDays / workingDays;
        const gross = Math.round(employee.grossSalary * ratio * (1 + variation));
        const totalDed = Math.round(employee.deductions * ratio);

        months.push({
            shortLabel: `${SHORT_MONTHS[m]} ${y}`,
            fullLabel: `${MONTHS[m]} ${y}`,
            workingDays,
            paidDays,
            lop,
            absent: lop,
            holidays: 4,
            earnings: {
                basic: Math.round(employee.earnings.basic * ratio),
                hra: Math.round(employee.earnings.hra * ratio),
                da: Math.round(employee.earnings.da * ratio),
                ta: employee.earnings.ta,
                incentive: Math.round(employee.earnings.incentive * (1 + variation)),
                additionalSalary: employee.earnings.additionalSalary,
            },
            deductionDetails: {
                pf: Math.round(employee.deductionDetails.pf * ratio),
                esi: Math.round(employee.deductionDetails.esi * ratio),
                pt: employee.deductionDetails.pt,
                tds: employee.deductionDetails.tds,
                advance: employee.deductionDetails.advance,
            },
            grossSalary: gross,
            totalDeductions: totalDed,
            netSalary: gross - totalDed,
        });

        m++;
        if (m > 11) { m = 0; y++; }
    }
    return months;
};

// Row component for earnings/deductions table
const EarningRow = ({ label, value, bold }) => (
    <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: 2, py: 0.75, borderBottom: '1px solid #F1F5F9',
    }}>
        <Typography sx={{ fontSize: 12, color: bold ? '#1a1a1a' : '#374151', fontWeight: bold ? 700 : 400 }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: bold ? 800 : 600, color: bold ? '#1a1a1a' : '#374151' }}>
            {Number(value).toLocaleString()}
        </Typography>
    </Box>
);

export default function ApprovePayroll() {
    const navigate = useNavigate();

    const [payrollData, setPayrollData] = useState(mockPayrollData);
    const [selected, setSelected] = useState([]);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);

    // Duration + end period controls
    const [duration, setDuration] = useState(1);
    const [endMonth, setEndMonth] = useState(new Date().getMonth());
    const [endYear, setEndYear] = useState(currentYear);

    // SnackBar
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const showSnack = (msg, success) => {
        setMessage(msg); setOpen(true); setColor(success); setStatus(success);
    };

    const pendingCount = payrollData.filter(p => p.status === 'Pending').length;
    const approvedCount = payrollData.filter(p => p.status === 'Approved').length;
    const totalPayroll = payrollData.reduce((sum, p) => sum + p.netSalary, 0);

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelected(payrollData.filter(p => p.status === 'Pending').map(p => p.id));
        else setSelected([]);
    };

    const handleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleApproveSelected = () => {
        setPayrollData(payrollData.map(p => selected.includes(p.id) ? { ...p, status: 'Approved' } : p));
        showSnack(`${selected.length} payroll${selected.length > 1 ? 's' : ''} approved successfully!`, true);
        setSelected([]);
    };

    const handleViewPayslip = (employee) => {
        const data = generateMonthlyData(employee, endMonth, endYear, duration);
        setMonthlyData(data);
        setSelectedEmployee(employee);
        setViewDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setViewDialogOpen(false);
        setSelectedEmployee(null);
        setMonthlyData([]);
    };

    // Computed totals for payslip
    const totalGross = monthlyData.reduce((s, m) => s + m.grossSalary, 0);
    const totalDed = monthlyData.reduce((s, m) => s + m.totalDeductions, 0);
    const totalNet = monthlyData.reduce((s, m) => s + m.netSalary, 0);

    const periodLabel = monthlyData.length > 0
        ? duration === 1
            ? monthlyData[0]?.fullLabel
            : `${monthlyData[0]?.shortLabel} to ${monthlyData[monthlyData.length - 1]?.shortLabel}`
        : '';

    // Header display (before dialog opens)
    const { month: startM, year: startY } = getStartDate(endMonth, endYear, duration);
    const headerPeriod = duration === 1
        ? `${MONTHS[endMonth]} ${endYear}`
        : `${SHORT_MONTHS[startM]} ${startY} – ${SHORT_MONTHS[endMonth]} ${endYear}`;

    return (
        <>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <style>{`
                @page { size: A4; margin: 10mm; }
                @media print {
                    body * { visibility: hidden; }
                    #payslip-print-content, #payslip-print-content * { visibility: visible; }
                    #payslip-print-content { position: absolute; left: 0; top: 0; width: 100%; background: #fff; }
                    .print-hide { display: none !important; }
                }
            `}</style>

            <Box sx={{
                height: '86vh', display: 'flex', flexDirection: 'column',
                bgcolor: '#FAFAFA', borderRadius: '20px', border: '1px solid #E8E8E8', overflow: 'hidden',
            }}>
                {/* ── Header ── */}
                <Box sx={{
                    bgcolor: '#fff', borderBottom: '2px solid #F1F5F9',
                    px: 3, py: 2, display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: 2,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{
                            width: 40, height: 40, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
                            '&:hover': { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY },
                        }}>
                            <ArrowBackIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <Box>
                            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a' }}>
                                Approve Payroll & Payslips
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3 }}>
                                Select duration and end month to generate payslips
                            </Typography>
                        </Box>
                    </Box>

                    {/* Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <CalendarMonthIcon sx={{ fontSize: 17, color: PRIMARY }} />

                        {/* Duration selector chips */}
                        <Box sx={{ display: 'flex', gap: 0.7 }}>
                            {DURATION_OPTIONS.map(opt => (
                                <Button
                                    key={opt.value}
                                    onClick={() => setDuration(opt.value)}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        px: 1.5,
                                        py: 0.5,
                                        minWidth: 0,
                                        borderRadius: '8px',
                                        border: `1.5px solid ${duration === opt.value ? PRIMARY : '#E2E8F0'}`,
                                        bgcolor: duration === opt.value ? PRIMARY_LIGHT : '#fff',
                                        color: duration === opt.value ? PRIMARY_DARK : '#94A3B8',
                                        '&:hover': { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY, color: PRIMARY_DARK },
                                    }}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </Box>

                        {/* End month/year */}
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>End:</Typography>
                        <FormControl size="small" sx={{ minWidth: 108 }}>
                            <Select value={endMonth} onChange={(e) => setEndMonth(e.target.value)} sx={{ fontSize: 13 }}>
                                {MONTHS.map((mo, i) => <MenuItem key={i} value={i} sx={{ fontSize: 13 }}>{mo}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 78 }}>
                            <Select value={endYear} onChange={(e) => setEndYear(e.target.value)} sx={{ fontSize: 13 }}>
                                {YEARS.map(y => <MenuItem key={y} value={y} sx={{ fontSize: 13 }}>{y}</MenuItem>)}
                            </Select>
                        </FormControl>

                        {selected.length > 0 && (
                            <Button
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                onClick={handleApproveSelected}
                                sx={{
                                    textTransform: 'none', bgcolor: '#10B981', borderRadius: '10px',
                                    fontSize: 13, fontWeight: 700, '&:hover': { bgcolor: '#059669' },
                                }}
                            >
                                Approve ({selected.length})
                            </Button>
                        )}
                    </Box>
                </Box>

                <Divider />

                <Box sx={{ p: 2.5, overflowY: 'auto' }}>
                    {/* Stats cards */}
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                        {[
                            { label: 'Total Employees', value: payrollData.length, color: PRIMARY, bg: PRIMARY_LIGHT, icon: <TaskAltIcon sx={{ fontSize: 32, color: PRIMARY, opacity: 0.55 }} /> },
                            { label: 'Pending Approval', value: pendingCount, color: '#F59E0B', bg: '#FFFBEB', icon: <PendingActionsIcon sx={{ fontSize: 32, color: '#F59E0B', opacity: 0.55 }} /> },
                            { label: 'Approved', value: approvedCount, color: '#10B981', bg: '#ECFDF5', icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#10B981', opacity: 0.55 }} /> },
                            { label: 'Total Payroll', value: `₹${(totalPayroll / 100000).toFixed(2)}L`, color: '#3B82F6', bg: '#EFF6FF', icon: <DownloadIcon sx={{ fontSize: 32, color: '#3B82F6', opacity: 0.55 }} /> },
                        ].map((card, i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <Card sx={{ border: `1px solid ${card.color}30`, borderRadius: CARD_RADIUS, bgcolor: card.bg, boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography sx={{ fontSize: 12, color: card.color, fontWeight: 600, mb: 1 }}>{card.label}</Typography>
                                                <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a' }}>{card.value}</Typography>
                                            </Box>
                                            {card.icon}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Payroll table */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: CARD_RADIUS, boxShadow: 'none' }}>
                        <Box sx={{
                            p: 2, borderBottom: '2px solid #F1F5F9', bgcolor: '#FAFAFA',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <TaskAltIcon sx={{ fontSize: 18, color: PRIMARY }} />
                                <Box>
                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Monthly Payroll</Typography>
                                    <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>Period: {headerPeriod}</Typography>
                                </Box>
                            </Box>
                            {selected.length > 0 && (
                                <Chip label={`${selected.length} selected`} size="small" sx={{ bgcolor: PRIMARY, color: '#fff', fontWeight: 700 }} />
                            )}
                        </Box>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={selected.length > 0 && selected.length < pendingCount}
                                            checked={pendingCount > 0 && selected.length === pendingCount}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                    {['Employee', 'Department', 'Basic', 'Gross Salary', 'Deductions', 'Net Salary', 'Status', 'Action'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payrollData.map((row) => {
                                    const isSel = selected.includes(row.id);
                                    return (
                                        <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' }, bgcolor: isSel ? '#FFF4E6' : 'inherit' }}>
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSel} onChange={() => handleSelect(row.id)} disabled={row.status !== 'Pending'} />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: PRIMARY_LIGHT, color: PRIMARY_DARK, fontSize: 14, fontWeight: 700 }}>
                                                        {row.name.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{row.name}</Typography>
                                                        <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>{row.employeeId} · {row.designation}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12, color: '#64748B' }}>{row.department}</TableCell>
                                            <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>₹{row.basicSalary.toLocaleString()}</TableCell>
                                            <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>₹{row.grossSalary.toLocaleString()}</TableCell>
                                            <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>₹{row.deductions.toLocaleString()}</TableCell>
                                            <TableCell sx={{ fontSize: 14, fontWeight: 700, color: '#2563EB' }}>₹{row.netSalary.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: row.status === 'Approved' ? '#ECFDF5' : '#FFFBEB',
                                                        color: row.status === 'Approved' ? '#10B981' : '#F59E0B',
                                                        fontWeight: 700, fontSize: 11,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    startIcon={<PrintIcon sx={{ fontSize: 14 }} />}
                                                    onClick={() => handleViewPayslip(row)}
                                                    sx={{
                                                        textTransform: 'none', fontSize: 12, fontWeight: 600,
                                                        border: '1px solid #E2E8F0', borderRadius: '8px', px: 1.5, py: 0.4,
                                                        color: PRIMARY, '&:hover': { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY },
                                                    }}
                                                >
                                                    Payslip
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                </Box>
            </Box>

            {/* ══════════════════════════════════════════
                PAYSLIP DIALOG
            ══════════════════════════════════════════ */}
            <Dialog
                open={viewDialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', maxHeight: '95vh' } }}
            >
                <DialogTitle sx={{ bgcolor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', py: 1.5, px: 2.5 }} className="print-hide">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
                                {selectedEmployee?.name} — Payslip
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>Period: {periodLabel}</Typography>
                        </Box>
                        <IconButton onClick={handleCloseDialog} size="small"><CloseIcon /></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0, overflow: 'auto', bgcolor: '#fff' }}>
                    {selectedEmployee && monthlyData.length > 0 && (
                        <Box id="payslip-print-content" sx={{ p: 3, bgcolor: '#fff' }}>

                            {/* ── Company Header ── */}
                            <Box sx={{
                                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                                pb: 2.5, mb: 2.5, borderBottom: `3px solid ${PRIMARY}`,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Box sx={{
                                        width: 64, height: 64, borderRadius: '12px', flexShrink: 0,
                                        bgcolor: PRIMARY_LIGHT, border: `2px solid ${PRIMARY}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <BusinessIcon sx={{ fontSize: 32, color: PRIMARY }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: 19, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2 }}>
                                            {companyInfo.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: '#64748B', mt: 0.5 }}>
                                            {companyInfo.address}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: '#64748B', mt: 0.3 }}>
                                            Ph: {companyInfo.contact} &nbsp;|&nbsp; Email: {companyInfo.email}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2.5, mt: 0.5 }}>
                                            <Typography sx={{ fontSize: 10.5, color: '#94A3B8' }}>
                                                PF Reg No:&nbsp;<Box component="span" sx={{ fontWeight: 700, color: '#64748B' }}>{companyInfo.pfRegNo}</Box>
                                            </Typography>
                                            <Typography sx={{ fontSize: 10.5, color: '#94A3B8' }}>
                                                ESI Reg No:&nbsp;<Box component="span" sx={{ fontWeight: 700, color: '#64748B' }}>{companyInfo.esiRegNo}</Box>
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Payslip title badge */}
                                <Box sx={{
                                    flexShrink: 0, textAlign: 'center',
                                    border: `2px solid ${PRIMARY}`, borderRadius: '10px',
                                    px: 2.5, py: 1.5, bgcolor: PRIMARY_LIGHT,
                                }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 900, color: PRIMARY_DARK, letterSpacing: '1px' }}>
                                        SALARY SLIP
                                    </Typography>
                                    <Divider sx={{ my: 0.8, borderColor: `${PRIMARY}50` }} />
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>
                                        {periodLabel}
                                    </Typography>
                                    <Typography sx={{ fontSize: 9.5, color: '#94A3B8', mt: 0.4 }}>
                                        Generated: {new Date().toLocaleDateString('en-IN')}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* ── Employee Information ── */}
                            <Box sx={{ mb: 2.5, border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                <Box sx={{ px: 2, py: 1, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BadgeIcon sx={{ fontSize: 15, color: PRIMARY }} />
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>Employee Information</Typography>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={1.5}>
                                        {[
                                            ['Employee Name', selectedEmployee.name],
                                            ['Employee ID', selectedEmployee.employeeId],
                                            ['Designation', selectedEmployee.designation],
                                            ['Department', selectedEmployee.department],
                                            ['Date of Joining', selectedEmployee.dateOfJoining],
                                            ['PAN Number', selectedEmployee.pan],
                                            ['Bank Account No.', `${selectedEmployee.bankAccount} (${selectedEmployee.bankName})`],
                                            ['UAN Number', selectedEmployee.uan],
                                            ['PF Account No.', selectedEmployee.pfNumber],
                                            ['ESI IP Number', selectedEmployee.esiNumber],
                                        ].map(([label, value], i) => (
                                            <Grid key={i} size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
                                                <Typography sx={{ fontSize: 9.5, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</Typography>
                                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', mt: 0.2 }}>{value}</Typography>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Box>

                            {/* ══ SINGLE MONTH ══ */}
                            {duration === 1 && monthlyData.length === 1 ? (
                                <>
                                    {/* Attendance strip */}
                                    <Box sx={{ mb: 2.5, border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                        <Box sx={{ px: 2, py: 1, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>
                                                Attendance — {monthlyData[0].fullLabel}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex' }}>
                                            {[
                                                { label: 'Working Days', value: monthlyData[0].workingDays, color: '#64748B' },
                                                { label: 'Present Days', value: monthlyData[0].paidDays, color: '#10B981' },
                                                { label: 'Absent Days', value: monthlyData[0].absent, color: '#F59E0B' },
                                                { label: 'LOP Days', value: monthlyData[0].lop, color: '#EF4444' },
                                                { label: 'Paid Holidays', value: monthlyData[0].holidays, color: '#3B82F6' },
                                            ].map((att, i, arr) => (
                                                <Box key={i} sx={{
                                                    flex: 1, py: 1.5, textAlign: 'center',
                                                    borderRight: i < arr.length - 1 ? '1px solid #E2E8F0' : 'none',
                                                }}>
                                                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: att.color }}>{att.value}</Typography>
                                                    <Typography sx={{ fontSize: 10, color: '#94A3B8', mt: 0.3 }}>{att.label}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>

                                    {/* Earnings | Deductions side by side */}
                                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                                        {/* Earnings */}
                                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <Box sx={{ px: 2, py: 1, bgcolor: '#ECFDF5', borderBottom: '1px solid #D1FAE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Earnings</Typography>
                                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#94A3B8' }}>Amount (₹)</Typography>
                                                </Box>
                                                {[
                                                    ['Basic Salary', monthlyData[0].earnings.basic],
                                                    ['House Rent Allowance (HRA)', monthlyData[0].earnings.hra],
                                                    ['Dearness Allowance (DA)', monthlyData[0].earnings.da],
                                                    ['Transport Allowance (TA)', monthlyData[0].earnings.ta],
                                                    ['Incentive / Special Pay', monthlyData[0].earnings.incentive],
                                                    ['Additional Salary', monthlyData[0].earnings.additionalSalary],
                                                ].filter(([, v]) => v > 0).map(([label, value], i) => (
                                                    <EarningRow key={i} label={label} value={value} />
                                                ))}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1, bgcolor: '#ECFDF5', borderTop: '2px solid #10B981' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#059669' }}>Gross Earnings</Typography>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>₹{monthlyData[0].grossSalary.toLocaleString()}</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {/* Deductions */}
                                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <Box sx={{ px: 2, py: 1, bgcolor: '#FEF2F2', borderBottom: '1px solid #FECACA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>Deductions</Typography>
                                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#94A3B8' }}>Amount (₹)</Typography>
                                                </Box>
                                                {[
                                                    ['Provident Fund (PF @ 12%)', monthlyData[0].deductionDetails.pf],
                                                    ['ESI Contribution', monthlyData[0].deductionDetails.esi],
                                                    ['Professional Tax (PT)', monthlyData[0].deductionDetails.pt],
                                                    ['TDS / Income Tax', monthlyData[0].deductionDetails.tds],
                                                    ['Advance Recovery', monthlyData[0].deductionDetails.advance],
                                                ].filter(([, v]) => v > 0).map(([label, value], i) => (
                                                    <EarningRow key={i} label={label} value={value} />
                                                ))}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1, bgcolor: '#FEF2F2', borderTop: '2px solid #EF4444' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#DC2626' }}>Total Deductions</Typography>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>₹{monthlyData[0].totalDeductions.toLocaleString()}</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </>
                            ) : (
                                /* ══ MULTI-MONTH ══ */
                                <>
                                    {/* Monthly summary table */}
                                    <Box sx={{ mb: 2.5, border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                        <Box sx={{ px: 2, py: 1, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>Monthly Attendance & Salary Summary</Typography>
                                        </Box>
                                        <Box sx={{ overflowX: 'auto' }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: '#FFF4E6' }}>
                                                        {['Month', 'Working Days', 'Paid Days', 'LOP', 'Absent', 'Holidays', 'Gross (₹)', 'Deductions (₹)', 'Net Pay (₹)'].map(h => (
                                                            <TableCell key={h} sx={{ fontSize: 11, fontWeight: 700, color: PRIMARY_DARK, py: 1, whiteSpace: 'nowrap' }}>{h}</TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {monthlyData.map((mo, i) => (
                                                        <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                                            <TableCell sx={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{mo.fullLabel}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, textAlign: 'center' }}>{mo.workingDays}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, textAlign: 'center', color: '#16A34A', fontWeight: 600 }}>{mo.paidDays}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, textAlign: 'center', color: mo.lop > 0 ? '#DC2626' : '#64748B', fontWeight: mo.lop > 0 ? 700 : 400 }}>{mo.lop}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, textAlign: 'center', color: mo.absent > 0 ? '#F59E0B' : '#64748B' }}>{mo.absent}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, textAlign: 'center' }}>{mo.holidays}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>{mo.grossSalary.toLocaleString()}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>{mo.totalDeductions.toLocaleString()}</TableCell>
                                                            <TableCell sx={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>{mo.netSalary.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {/* Totals row */}
                                                    <TableRow sx={{ bgcolor: '#FFF4E6', borderTop: `2px solid ${PRIMARY}` }}>
                                                        <TableCell sx={{ fontSize: 12, fontWeight: 800, color: PRIMARY_DARK }}>TOTAL</TableCell>
                                                        <TableCell /><TableCell /><TableCell /><TableCell /><TableCell />
                                                        <TableCell sx={{ fontSize: 13, fontWeight: 800, color: '#16A34A' }}>₹{totalGross.toLocaleString()}</TableCell>
                                                        <TableCell sx={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>₹{totalDed.toLocaleString()}</TableCell>
                                                        <TableCell sx={{ fontSize: 13, fontWeight: 800, color: '#2563EB' }}>₹{totalNet.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    </Box>

                                    {/* Aggregated Earnings & Deductions */}
                                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <Box sx={{ px: 2, py: 1, bgcolor: '#ECFDF5', borderBottom: '1px solid #D1FAE5', display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Earnings (Total)</Typography>
                                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#94A3B8' }}>Amount (₹)</Typography>
                                                </Box>
                                                {[
                                                    ['Basic Salary', monthlyData.reduce((s, m) => s + m.earnings.basic, 0)],
                                                    ['House Rent Allowance (HRA)', monthlyData.reduce((s, m) => s + m.earnings.hra, 0)],
                                                    ['Dearness Allowance (DA)', monthlyData.reduce((s, m) => s + m.earnings.da, 0)],
                                                    ['Transport Allowance (TA)', monthlyData.reduce((s, m) => s + m.earnings.ta, 0)],
                                                    ['Incentive / Special Pay', monthlyData.reduce((s, m) => s + m.earnings.incentive, 0)],
                                                    ['Additional Salary', monthlyData.reduce((s, m) => s + m.earnings.additionalSalary, 0)],
                                                ].filter(([, v]) => v > 0).map(([label, value], i) => (
                                                    <EarningRow key={i} label={label} value={value} />
                                                ))}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, bgcolor: '#ECFDF5', borderTop: '2px solid #10B981' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#059669' }}>Gross Earnings</Typography>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>₹{totalGross.toLocaleString()}</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <Box sx={{ px: 2, py: 1, bgcolor: '#FEF2F2', borderBottom: '1px solid #FECACA', display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>Deductions (Total)</Typography>
                                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#94A3B8' }}>Amount (₹)</Typography>
                                                </Box>
                                                {[
                                                    ['Provident Fund (PF @ 12%)', monthlyData.reduce((s, m) => s + m.deductionDetails.pf, 0)],
                                                    ['ESI Contribution', monthlyData.reduce((s, m) => s + m.deductionDetails.esi, 0)],
                                                    ['Professional Tax (PT)', monthlyData.reduce((s, m) => s + m.deductionDetails.pt, 0)],
                                                    ['TDS / Income Tax', monthlyData.reduce((s, m) => s + m.deductionDetails.tds, 0)],
                                                    ['Advance Recovery', monthlyData.reduce((s, m) => s + m.deductionDetails.advance, 0)],
                                                ].filter(([, v]) => v > 0).map(([label, value], i) => (
                                                    <EarningRow key={i} label={label} value={value} />
                                                ))}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1, bgcolor: '#FEF2F2', borderTop: '2px solid #EF4444' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#DC2626' }}>Total Deductions</Typography>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>₹{totalDed.toLocaleString()}</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </>
                            )}

                            {/* ── Net Salary Box ── */}
                            <Box sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                p: 2, bgcolor: '#EFF6FF', borderRadius: '12px',
                                border: '2px solid #3B82F6', mb: 3,
                            }}>
                                <Box>
                                    <Typography sx={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
                                        Net Salary — Take Home Pay
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.4 }}>
                                        {periodLabel} &nbsp;·&nbsp; {selectedEmployee.name} ({selectedEmployee.employeeId})
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: 30, fontWeight: 900, color: '#2563EB' }}>
                                    ₹{totalNet.toLocaleString()}
                                </Typography>
                            </Box>

                            {/* ── Signature Area ── */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px dashed #CBD5E1' }}>
                                {['Employee Signature', 'Accounts Manager', 'Authorized Signatory'].map((label, i) => (
                                    <Box key={i} sx={{ textAlign: 'center' }}>
                                        <Box sx={{ height: 36 }} />
                                        <Box sx={{ width: 130, borderBottom: '1.5px solid #94A3B8', mx: 'auto', mb: 0.6 }} />
                                        <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>{label}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Footer note */}
                            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: 9.5, color: '#CBD5E1' }}>
                                    This is a system-generated payslip and does not require a physical signature.&nbsp;
                                    Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;|&nbsp; {companyInfo.name}
                                </Typography>
                            </Box>

                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: '2px solid #E2E8F0', bgcolor: '#F8FAFC', gap: 1 }} className="print-hide">
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600, borderRadius: '8px' }}
                    >
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={() => window.print()}
                        sx={{ textTransform: 'none', bgcolor: PRIMARY, fontWeight: 700, borderRadius: '8px', '&:hover': { bgcolor: PRIMARY_DARK } }}
                    >
                        Print / Download PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
