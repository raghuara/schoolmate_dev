import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    Card, Table, TableBody, TableCell, TableHead, TableRow,
    Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
    Select, MenuItem, FormControl, CircularProgress, Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import BadgeIcon from '@mui/icons-material/Badge';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import SnackBar from '../../SnackBar';
import { approvePayrollPayslipsDashboard, getPayrollPayslipByRollNumber } from '../../../Api/Api';

const PRIMARY = '#FF9800';
const PRIMARY_LIGHT = '#FFF4E6';
const PRIMARY_DARK = '#F57C00';
const CARD_RADIUS = '12px';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

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

const formatMonthParam = (monthIndex, year) =>
    `${String(monthIndex + 1).padStart(2, '0')}-${year}`;

export default function ApprovePayroll() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);

    const [loading, setLoading] = useState(false);
    const [payrollData, setPayrollData] = useState([]);

    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [payslipData, setPayslipData] = useState(null);
    const [payslipLoading, setPayslipLoading] = useState(false);

    const [fromMonth, setFromMonth] = useState(new Date().getMonth());
    const [fromYear, setFromYear] = useState(currentYear);
    const [toMonth, setToMonth] = useState(new Date().getMonth());
    const [toYear, setToYear] = useState(currentYear);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const showSnack = (msg, success) => {
        setMessage(msg); setOpen(true); setColor(success); setStatus(success);
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const token = "123";
            const res = await axios.get(approvePayrollPayslipsDashboard, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data.data;
            const employees = (data.employees || []).map(emp => ({
                id: emp.id,
                rollNumber: emp.rollNumber || '-',
                name: emp.name || '-',
                department: emp.department || '-',
                designation: emp.designation || '-',
                basicSalary: emp.basicSalary || 0,
                grossSalary: emp.grossSalary || 0,
                deductions: emp.deductions || 0,
                netSalary: emp.netSalary || 0,
                status: emp.status || 'Pending',
            }));
            setPayrollData(employees);
        } catch {
            showSnack('Failed to load payroll data', false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewDialogOpen && selectedEmployee) {
            fetchPayslip(selectedEmployee.rollNumber, fromMonth, fromYear, toMonth, toYear);
        }
    }, [viewDialogOpen, fromMonth, fromYear, toMonth, toYear]);

    const fetchPayslip = async (rollNumber, fMonth, fYear, tMonth, tYear) => {
        setPayslipLoading(true);
        setPayslipData(null);
        try {
            const token = "123";
            const res = await axios.get(getPayrollPayslipByRollNumber, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    RollNumber: rollNumber,
                    FromMonth: formatMonthParam(fMonth, fYear),
                    ToMonth: formatMonthParam(tMonth, tYear),
                },
            });
            setPayslipData(res.data.data);
        } catch {
            showSnack('Failed to load payslip', false);
        } finally {
            setPayslipLoading(false);
        }
    };

    const handleViewPayslip = (employee) => {
        setSelectedEmployee(employee);
        setFromMonth(new Date().getMonth());
        setFromYear(currentYear);
        setToMonth(new Date().getMonth());
        setToYear(currentYear);
        setViewDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setViewDialogOpen(false);
        setSelectedEmployee(null);
        setPayslipData(null);
    };

    const periodLabel = payslipData?.periodLabel || (() => {
        const from = `${MONTHS[fromMonth].substring(0, 3)} ${fromYear}`;
        const to = `${MONTHS[toMonth].substring(0, 3)} ${toYear}`;
        return fromMonth === toMonth && fromYear === toYear
            ? `${MONTHS[fromMonth]} ${fromYear}`
            : `${from} – ${to}`;
    })();

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
                <Box sx={{
                    bgcolor: '#fff', borderBottom: '2px solid #F1F5F9',
                    px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2,
                }}>
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
                            View and print employee payslips
                        </Typography>
                    </Box>
                </Box>

                <Divider />

                <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: CARD_RADIUS, boxShadow: 'none' }}>
                        <Box sx={{
                            p: 2, borderBottom: '2px solid #F1F5F9', bgcolor: '#FAFAFA',
                            display: 'flex', alignItems: 'center', gap: 1.5,
                        }}>
                            <TaskAltIcon sx={{ fontSize: 18, color: PRIMARY }} />
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Monthly Payroll</Typography>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                                <CircularProgress sx={{ color: PRIMARY }} />
                            </Box>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                        {['Employee', 'Department', 'Basic', 'Gross Salary', 'Deductions', 'Net Salary', 'Status', 'Action'].map(h => (
                                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {payrollData.map((row) => (
                                        <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: PRIMARY_LIGHT, color: PRIMARY_DARK, fontSize: 14, fontWeight: 700 }}>
                                                        {row.name.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{row.name}</Typography>
                                                        <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>{row.rollNumber} · {row.designation}</Typography>
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
                                    ))}

                                    {payrollData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: '#94A3B8', fontSize: 13 }}>
                                                No payroll records found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                </Box>
            </Box>

            <Dialog
                open={viewDialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '4px', maxHeight: '95vh', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' } }}
            >
                <DialogTitle sx={{ bgcolor: '#fff', borderBottom: '1px solid #E5E7EB', py: 1.5, px: 2.5 }} className="print-hide">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flexShrink: 0 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                                {selectedEmployee?.name} — Payslip
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#6B7280' }}>Period: {periodLabel}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>From:</Typography>
                            <FormControl size="small" sx={{ minWidth: 104 }}>
                                <Select value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} sx={{ fontSize: 12 }}>
                                    {MONTHS.map((mo, i) => (
                                        <MenuItem key={i} value={i} sx={{ fontSize: 12 }}>{mo}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 72 }}>
                                <Select value={fromYear} onChange={(e) => setFromYear(e.target.value)} sx={{ fontSize: 12 }}>
                                    {YEARS.map(y => (
                                        <MenuItem key={y} value={y} sx={{ fontSize: 12 }}>{y}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>To:</Typography>
                            <FormControl size="small" sx={{ minWidth: 104 }}>
                                <Select value={toMonth} onChange={(e) => setToMonth(e.target.value)} sx={{ fontSize: 12 }}>
                                    {MONTHS.map((mo, i) => (
                                        <MenuItem key={i} value={i} sx={{ fontSize: 12 }}>{mo}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 72 }}>
                                <Select value={toYear} onChange={(e) => setToYear(e.target.value)} sx={{ fontSize: 12 }}>
                                    {YEARS.map(y => (
                                        <MenuItem key={y} value={y} sx={{ fontSize: 12 }}>{y}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <IconButton onClick={handleCloseDialog} size="small" sx={{ color: '#6B7280', ml: 0.5 }}>
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0, overflow: 'auto', bgcolor: '#fff' }}>
                    {payslipLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: PRIMARY }} />
                        </Box>
                    )}

                    {!payslipLoading && payslipData && (
                        <Box id="payslip-print-content" sx={{ p: 3.5, bgcolor: '#fff' }}>

                            <Box sx={{
                                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                                pb: 2.5, mb: 2.5, borderBottom: '2px solid #111827',
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Box sx={{
                                        width: 56, height: 56, borderRadius: '4px', flexShrink: 0,
                                        border: '1.5px solid #D1D5DB', overflow: 'hidden', bgcolor: '#F3F4F6',
                                    }}>
                                        <img
                                            src={websiteSettings.logo}
                                            alt="School Logo"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                                            {websiteSettings.title}
                                        </Typography>
                                        {payslipData.company.address && (
                                            <Typography sx={{ fontSize: 10.5, color: '#6B7280', mt: 0.4 }}>
                                                {payslipData.company.address}
                                            </Typography>
                                        )}
                                        {(payslipData.company.phone || payslipData.company.email) && (
                                            <Typography sx={{ fontSize: 10.5, color: '#6B7280', mt: 0.2 }}>
                                                {payslipData.company.phone && `Ph: ${payslipData.company.phone}`}
                                                {payslipData.company.phone && payslipData.company.email && ' \u00a0|\u00a0 '}
                                                {payslipData.company.email && `Email: ${payslipData.company.email}`}
                                            </Typography>
                                        )}
                                        <Box sx={{ display: 'flex', gap: 2.5, mt: 0.3 }}>
                                            {payslipData.company.pfRegNo && (
                                                <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>
                                                    PF Reg No:&nbsp;<Box component="span" sx={{ fontWeight: 700, color: '#6B7280' }}>{payslipData.company.pfRegNo}</Box>
                                                </Typography>
                                            )}
                                            {payslipData.company.esiRegNo && (
                                                <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>
                                                    ESI Reg No:&nbsp;<Box component="span" sx={{ fontWeight: 700, color: '#6B7280' }}>{payslipData.company.esiRegNo}</Box>
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{
                                    flexShrink: 0, textAlign: 'center',
                                    border: '1.5px solid #374151', borderRadius: '4px',
                                    px: 2.5, py: 1.5, bgcolor: '#fff',
                                }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#111827', letterSpacing: '1.5px' }}>
                                        SALARY SLIP
                                    </Typography>
                                    <Divider sx={{ my: 0.8, borderColor: '#D1D5DB' }} />
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>
                                        {periodLabel}
                                    </Typography>
                                    <Typography sx={{ fontSize: 9.5, color: '#9CA3AF', mt: 0.4 }}>
                                        Generated: {payslipData.generatedOn}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2.5, border: '1px solid #D1D5DB', borderRadius: '4px', overflow: 'hidden' }}>
                                <Box sx={{ px: 2, py: 1, bgcolor: '#F3F4F6', borderBottom: '1px solid #D1D5DB', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BadgeIcon sx={{ fontSize: 14, color: '#374151' }} />
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                                        Employee Information
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={1.5}>
                                        {[
                                            ['Employee Name', payslipData.employeeInformation.employeeName],
                                            ['Employee ID', payslipData.employeeInformation.employeeId],
                                            ['Designation', payslipData.employeeInformation.designation],
                                            ['Department', payslipData.employeeInformation.department],
                                            ['Date of Joining', payslipData.employeeInformation.dateOfJoining],
                                            ['PAN Number', payslipData.employeeInformation.panNumber],
                                            ['Bank Account No.', payslipData.employeeInformation.bankAccountNoMasked
                                                ? `${payslipData.employeeInformation.bankAccountNoMasked}${payslipData.employeeInformation.bankName ? ` (${payslipData.employeeInformation.bankName})` : ''}`
                                                : '-'],
                                            ['UAN Number', payslipData.employeeInformation.uanNumber],
                                            ['PF Account No.', payslipData.employeeInformation.pfAccountNo],
                                            ['ESI IP Number', payslipData.employeeInformation.esiIpNumber],
                                        ].map(([label, value], i) => (
                                            <Grid key={i} size={{ xs: 6, sm: 4, md: 4, lg: 4 }}>
                                                <Typography sx={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                                    {label}
                                                </Typography>
                                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#111827', mt: 0.2 }}>
                                                    {value || '-'}
                                                </Typography>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2.5, border: '1px solid #D1D5DB', borderRadius: '4px', overflow: 'hidden' }}>
                                <Box sx={{ px: 2, py: 1, bgcolor: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                                        Attendance — {periodLabel}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex' }}>
                                    {[
                                        { label: 'Working Days',  value: payslipData.attendance.workingDays },
                                        { label: 'Present Days',  value: payslipData.attendance.presentDays  },
                                        { label: 'Absent Days',   value: payslipData.attendance.absentDays   },
                                        { label: 'LOP Days',      value: payslipData.attendance.lopDays      },
                                        { label: 'Paid Holidays', value: payslipData.attendance.paidHolidays },
                                    ].map((att, i, arr) => (
                                        <Box key={i} sx={{
                                            flex: 1, py: 2, textAlign: 'center',
                                            borderRight: i < arr.length - 1 ? '1px solid #E5E7EB' : 'none',
                                        }}>
                                            <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{att.value}</Typography>
                                            <Typography sx={{ fontSize: 10, color: '#6B7280', mt: 0.3, fontWeight: 500 }}>{att.label}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Box sx={{ border: '1px solid #D1D5DB', borderRadius: '4px', overflow: 'hidden', height: '100%' }}>
                                        <Box sx={{ px: 2, py: 1.2, bgcolor: '#F3F4F6', borderBottom: '2px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Earnings</Typography>
                                            <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF' }}>Amount (₹)</Typography>
                                        </Box>
                                        {[
                                            ['Basic Salary', payslipData.earnings.basicSalary],
                                            ['House Rent Allowance (HRA)', payslipData.earnings.hra],
                                            ['Dearness Allowance (DA)', payslipData.earnings.da],
                                            ['Transport Allowance', payslipData.earnings.transportAllowance],
                                            ['Special Allowance', payslipData.earnings.specialAllowance],
                                            ['Incentive / Special Pay', payslipData.earnings.incentive],
                                            ['Additional Salary', payslipData.earnings.additionalSalary],
                                        ].filter(([, v]) => v > 0).map(([label, value], i) => (
                                            <EarningRow key={i} label={label} value={value} />
                                        ))}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.2, bgcolor: '#F3F4F6', borderTop: '2px solid #374151' }}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>Gross Earnings</Typography>
                                            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>₹{payslipData.earnings.grossEarnings.toLocaleString()}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Box sx={{ border: '1px solid #D1D5DB', borderRadius: '4px', overflow: 'hidden', height: '100%' }}>
                                        <Box sx={{ px: 2, py: 1.2, bgcolor: '#F3F4F6', borderBottom: '2px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Deductions</Typography>
                                            <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF' }}>Amount (₹)</Typography>
                                        </Box>
                                        {[
                                            [payslipData.deductions.pfLabel,  payslipData.deductions.pfAmount],
                                            [payslipData.deductions.esiLabel, payslipData.deductions.esiAmount],
                                            [payslipData.deductions.ptLabel,  payslipData.deductions.ptAmount],
                                            [payslipData.deductions.tdsLabel, payslipData.deductions.tdsAmount],
                                        ].filter(([, v]) => v > 0).map(([label, value], i) => (
                                            <EarningRow key={i} label={label} value={value} />
                                        ))}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.2, bgcolor: '#F3F4F6', borderTop: '2px solid #374151' }}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>Total Deductions</Typography>
                                            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>₹{payslipData.deductions.totalDeductions.toLocaleString()}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                px: 3, py: 2.5, bgcolor: '#111827', borderRadius: '4px', mb: 3,
                            }}>
                                <Box>
                                    <Typography sx={{ fontSize: 9.5, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
                                        Net Salary — Take Home Pay
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#D1D5DB', mt: 0.5 }}>
                                        {periodLabel} &nbsp;·&nbsp; {payslipData.employeeInformation.employeeName} ({payslipData.employeeInformation.employeeId})
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                                    ₹{payslipData.totals.netSalary.toLocaleString()}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2.5, borderTop: '1px dashed #D1D5DB' }}>
                                {[
                                    payslipData.signature.employeeSignatureLabel,
                                    payslipData.signature.accountsManagerLabel,
                                    payslipData.signature.authorizedSignatoryLabel,
                                ].map((label, i) => (
                                    <Box key={i} sx={{ textAlign: 'center' }}>
                                        <Box sx={{ height: 36 }} />
                                        <Box sx={{ width: 130, borderBottom: '1.5px solid #9CA3AF', mx: 'auto', mb: 0.6 }} />
                                        <Typography sx={{ fontSize: 10, color: '#6B7280' }}>{label}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: 9, color: '#D1D5DB', letterSpacing: '0.3px' }}>
                                    {payslipData.footer.note} &nbsp;|&nbsp; Generated on {payslipData.generatedOn} &nbsp;|&nbsp; {websiteSettings.title}
                                </Typography>
                            </Box>

                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#F9FAFB', gap: 1 }} className="print-hide">
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ textTransform: 'none', color: '#6B7280', fontWeight: 600, borderRadius: '4px' }}
                    >
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={() => window.print()}
                        disabled={payslipLoading || !payslipData}
                        sx={{ textTransform: 'none', bgcolor: '#111827', fontWeight: 700, borderRadius: '4px', '&:hover': { bgcolor: '#374151' } }}
                    >
                        Print / Download PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
