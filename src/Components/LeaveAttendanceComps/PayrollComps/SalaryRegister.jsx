import React, { useState } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import SnackBar from '../../SnackBar';

// Color theme
const PRIMARY = '#E30053';
const PRIMARY_LIGHT = '#FCF8F9';
const PRIMARY_DARK = '#C1003D';
const CARD_RADIUS = '12px';

// Mock salary register data with detailed breakdown
const mockSalaryRegister = [
    {
        id: 1,
        employeeId: 'EMP001',
        name: 'Rajesh Kumar',
        designation: 'Senior Teacher',
        department: 'Mathematics',
        category: 'Teaching Staff',
        // Attendance Details
        workingDays: 28,
        presentDays: 28,
        absentDays: 0,
        lopDays: 0,
        // Earnings
        basicSalary: 45000,
        hra: 9000,          // 20% of basic
        da: 4500,           // 10% of basic
        specialAllowance: 3000,
        incentives: 2000,
        // Deductions
        pf: 5400,           // 12% of basic
        esi: 750,
        professionalTax: 200,
        tds: 450,
        lopDeduction: 0,
        // Totals
        grossSalary: 63500,
        totalDeductions: 6800,
        netSalary: 56700,
        paymentDate: '2026-02-28',
        month: 'February 2026',
        status: 'Paid',
        paymentMode: 'Bank Transfer'
    },
    {
        id: 2,
        employeeId: 'EMP002',
        name: 'Priya Sharma',
        designation: 'Teacher',
        department: 'Science',
        category: 'Teaching Staff',
        // Attendance Details
        workingDays: 28,
        presentDays: 26,
        absentDays: 2,
        lopDays: 1,
        // Earnings
        basicSalary: 30000,
        hra: 6000,
        da: 3000,
        specialAllowance: 2500,
        incentives: 1500,
        // Deductions
        pf: 3600,
        esi: 450,
        professionalTax: 200,
        tds: 0,
        lopDeduction: 1071,  // 1 day LOP
        // Totals
        grossSalary: 43000,
        totalDeductions: 5321,
        netSalary: 37679,
        paymentDate: '2026-02-28',
        month: 'February 2026',
        status: 'Paid',
        paymentMode: 'Bank Transfer'
    },
    {
        id: 3,
        employeeId: 'EMP003',
        name: 'Amit Patel',
        designation: 'Lab Assistant',
        department: 'Laboratory',
        category: 'Supporting Staff',
        // Attendance Details
        workingDays: 28,
        presentDays: 27,
        absentDays: 1,
        lopDays: 0,
        // Earnings
        basicSalary: 25000,
        hra: 5000,
        da: 2500,
        specialAllowance: 2000,
        incentives: 1000,
        // Deductions
        pf: 3000,
        esi: 350,
        professionalTax: 150,
        tds: 0,
        lopDeduction: 0,
        // Totals
        grossSalary: 35500,
        totalDeductions: 3500,
        netSalary: 32000,
        paymentDate: '2026-02-28',
        month: 'February 2026',
        status: 'Paid',
        paymentMode: 'Bank Transfer'
    },
    {
        id: 4,
        employeeId: 'EMP004',
        name: 'Sneha Gupta',
        designation: 'Teacher',
        department: 'English',
        category: 'Teaching Staff',
        // Attendance Details
        workingDays: 28,
        presentDays: 28,
        absentDays: 0,
        lopDays: 0,
        // Earnings
        basicSalary: 28000,
        hra: 5600,
        da: 2800,
        specialAllowance: 2200,
        incentives: 1200,
        // Deductions
        pf: 3360,
        esi: 420,
        professionalTax: 120,
        tds: 0,
        lopDeduction: 0,
        // Totals
        grossSalary: 39800,
        totalDeductions: 3900,
        netSalary: 35900,
        paymentDate: '2026-02-28',
        month: 'February 2026',
        status: 'Paid',
        paymentMode: 'Bank Transfer'
    },
];

export default function SalaryRegister() {
    const navigate = useNavigate();

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true); setSnackColor(success); setSnackStatus(success);
    };

    const [selectedMonth, setSelectedMonth] = useState('February 2026');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const handlePrintPayslip = () => {
        window.print();
    };

    const totalGross = mockSalaryRegister.reduce((sum, emp) => sum + emp.grossSalary, 0);
    const totalNet = mockSalaryRegister.reduce((sum, emp) => sum + emp.netSalary, 0);
    const totalDeductions = mockSalaryRegister.reduce((sum, emp) => sum + emp.totalDeductions, 0);

    const filteredData = mockSalaryRegister.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDepartment === 'All' || emp.category === selectedDepartment;
        return matchesSearch && matchesDept;
    });

    const handleExportRegister = () => {
        // Prepare data for Excel export - only summary columns
        const excelData = filteredData.map((emp, index) => ({
            'S.No': index + 1,
            'Roll Number': emp.employeeId,
            'Employee': emp.name,
            'Employee Category': emp.designation,
            'Basic Salary': emp.basicSalary,
            'Gross Salary': emp.grossSalary,
            'Deduction': emp.totalDeductions,
            'Net Salary': emp.netSalary,
            'Payment Date': emp.paymentDate,
            'Status': emp.status
        }));

        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Convert data to worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 8 },  // S.No
            { wch: 12 }, // Roll Number
            { wch: 20 }, // Employee
            { wch: 20 }, // Employee Category
            { wch: 15 }, // Basic Salary
            { wch: 15 }, // Gross Salary
            { wch: 15 }, // Deduction
            { wch: 15 }, // Net Salary
            { wch: 15 }, // Payment Date
            { wch: 12 }  // Status
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Salary Register');

        // Generate filename with current date
        const fileName = `Salary_Register_${selectedMonth.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Save the file
        XLSX.writeFile(wb, fileName);

        showSnack('Salary register exported successfully!', true);
    };

    const handlePrintRegister = () => {
        showSnack('Preparing register for printing...', true);
    };

    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setOpenDialog(true);
    };

    return (
        <>
        <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />
            {/* Print-specific styles */}
            <style>
                {`
                    @page {
                        size: A4;
                        margin: 15mm;
                    }

                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #payslip-print-content,
                        #payslip-print-content * {
                            visibility: visible;
                        }
                        #payslip-print-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 10px;
                        }
                        .print-hide {
                            display: none !important;
                        }
                        .MuiDialog-paper {
                            box-shadow: none !important;
                            margin: 0 !important;
                            max-width: 100% !important;
                        }

                        /* Prevent page breaks */
                        .print-no-break {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }

                        /* Compact print layout */
                        .MuiCard-root {
                            margin-bottom: 8px !important;
                            page-break-inside: avoid !important;
                        }

                        .MuiCardContent-root {
                            padding: 12px !important;
                        }

                        .MuiTypography-root {
                            line-height: 1.3 !important;
                        }

                        /* Reduce spacing for print */
                        .MuiBox-root {
                            margin-bottom: 6px !important;
                        }

                        /* Scale content to fit */
                        #payslip-print-content {
                            transform: scale(0.95);
                            transform-origin: top left;
                        }
                    }
                `}
            </style>
            <Box sx={{
                height: '86vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#FAFAFA',
                borderRadius: '20px',
                border: '1px solid #E8E8E8',
                overflow: 'hidden'
            }}>
            {/* Header */}
            <Box sx={{
                bgcolor: '#fff',
                borderBottom: '2px solid #F1F5F9',
                px: 3,
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            width: '40px',
                            height: '40px',
                            bgcolor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            '&:hover': { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY }
                        }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>
                            Audit-ready Salary Register
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3 }}>
                            Comprehensive salary records for audit and compliance
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportRegister}
                        sx={{
                            textTransform: 'none',
                            bgcolor: PRIMARY,
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '700',
                            '&:hover': { bgcolor: PRIMARY_DARK }
                        }}
                    >
                        Export to Excel
                    </Button>
                </Box>
            </Box>

            <Divider />

            <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
                {/* Statistics Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Card sx={{
                            border: '1px solid #E3005330',
                            borderRadius: CARD_RADIUS,
                            bgcolor: PRIMARY_LIGHT,
                            boxShadow: 'none'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: PRIMARY, fontWeight: 600, mb: 1 }}>
                                            Total Gross Salary
                                        </Typography>
                                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                                            ₹{(totalGross / 100000).toFixed(2)}L
                                        </Typography>
                                    </Box>
                                    <AssessmentIcon sx={{ fontSize: 32, color: PRIMARY, opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Card sx={{
                            border: '1px solid #10B98130',
                            borderRadius: CARD_RADIUS,
                            bgcolor: '#ECFDF5',
                            boxShadow: 'none'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#10B981', fontWeight: 600, mb: 1 }}>
                                            Total Net Salary
                                        </Typography>
                                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                                            ₹{(totalNet / 100000).toFixed(2)}L
                                        </Typography>
                                    </Box>
                                    <VerifiedIcon sx={{ fontSize: 32, color: '#10B981', opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Card sx={{
                            border: '1px solid #DC262630',
                            borderRadius: CARD_RADIUS,
                            bgcolor: '#FEF2F2',
                            boxShadow: 'none'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#DC2626', fontWeight: 600, mb: 1 }}>
                                            Total Deductions
                                        </Typography>
                                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                                            ₹{(totalDeductions / 1000).toFixed(1)}K
                                        </Typography>
                                    </Box>
                                    <DescriptionIcon sx={{ fontSize: 32, color: '#DC2626', opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Card sx={{
                            border: '1px solid #3B82F630',
                            borderRadius: CARD_RADIUS,
                            bgcolor: '#EFF6FF',
                            boxShadow: 'none'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600, mb: 1 }}>
                                            Total Employees
                                        </Typography>
                                        <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {filteredData.length}
                                        </Typography>
                                    </Box>
                                    <HistoryIcon sx={{ fontSize: 32, color: '#3B82F6', opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Card sx={{
                    border: '1px solid #E8E8E8',
                    borderRadius: CARD_RADIUS,
                    boxShadow: 'none',
                    mb: 2.5
                }}>
                    <Box sx={{ p: 2.5 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Select Month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="February 2026">February 2026</MenuItem>
                                    <MenuItem value="January 2026">January 2026</MenuItem>
                                    <MenuItem value="December 2025">December 2025</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Staff Category"
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="All">All Category</MenuItem>
                                    <MenuItem value="Teaching Staff">Teaching Staff</MenuItem>
                                    <MenuItem value="Non-Teaching Staff">Non-Teaching Staff</MenuItem>
                                    <MenuItem value="Supporting Staff">Supporting Staff</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by name or employee ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="small"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Card>

                {/* Salary Register Table */}
                <Card sx={{
                    border: '1px solid #E8E8E8',
                    borderRadius: CARD_RADIUS,
                    boxShadow: 'none'
                }}>
                    <Box sx={{
                        p: 2.5,
                        borderBottom: '2px solid #F1F5F9',
                        bgcolor: '#FAFAFA',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                    }}>
                        <DescriptionIcon sx={{ fontSize: 20, color: PRIMARY }} />
                        <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                            Salary Register - {selectedMonth}
                        </Typography>
                        <Chip
                            label={`${filteredData.length} Records`}
                            size="small"
                            sx={{
                                bgcolor: PRIMARY,
                                color: '#fff',
                                fontWeight: 600,
                                ml: 'auto'
                            }}
                        />
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Employee</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Department</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Basic Salary</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Gross Salary</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Deductions</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Net Salary</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Payment Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}
                                    >
                                        <TableCell>
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                    {row.name}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                                                    {row.employeeId} • {row.designation}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '13px' }}>
                                            {row.department}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                                            ₹{row.basicSalary.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>
                                            ₹{row.grossSalary.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>
                                            ₹{row.totalDeductions.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>
                                            ₹{row.netSalary.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                                            {row.paymentDate}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewDetails(row)}
                                                sx={{ color: PRIMARY }}
                                            >
                                                <VisibilityIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Card>
            </Box>

            {/* Detailed Salary Breakdown Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle className="print-hide">
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, color: PRIMARY }}>
                        Detailed Salary Breakdown
                    </Typography>
                    {selectedEmployee && (
                        <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 0.5 }}>
                            {selectedEmployee.name} ({selectedEmployee.employeeId}) • {selectedEmployee.designation}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent id="payslip-print-content">
                    {selectedEmployee && (
                        <Box sx={{ pt: 2 }}>
                            {/* Print-only header */}
                            <Box className="print-no-break" sx={{ display: 'none', '@media print': { display: 'block' }, mb: 3, pb: 2, borderBottom: '3px solid #E30053' }}>
                                <Typography sx={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', color: '#E30053', mb: 1 }}>
                                    SCHOOLMATE
                                </Typography>
                                <Typography sx={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', mb: 2 }}>
                                    SALARY SLIP
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                            {selectedEmployee.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                                            {selectedEmployee.employeeId} • {selectedEmployee.designation}
                                        </Typography>
                                        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                                            {selectedEmployee.department}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                                            Pay Period: {selectedEmployee.month}
                                        </Typography>
                                        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                                            Payment Date: {selectedEmployee.paymentDate}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            {/* Attendance Details */}
                            <Card className="print-no-break" sx={{ mb: 3, bgcolor: '#F8FAFC', boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <CalendarMonthIcon sx={{ fontSize: 20, color: PRIMARY }} />
                                        <Typography sx={{ fontSize: '15px', fontWeight: 700 }}>
                                            Attendance Summary
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6, md: 3, lg: 3 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>
                                                Working Days
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>
                                                {selectedEmployee.workingDays}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3, lg: 3 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>
                                                Present Days
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>
                                                    {selectedEmployee.presentDays}
                                                </Typography>
                                                <TrendingUpIcon sx={{ fontSize: 16, color: '#10B981' }} />
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3, lg: 3 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>
                                                Absent Days
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#EF4444' }}>
                                                {selectedEmployee.absentDays}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3, lg: 3 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>
                                                LOP Days
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: selectedEmployee.lopDays > 0 ? '#F59E0B' : '#10B981' }}>
                                                    {selectedEmployee.lopDays}
                                                </Typography>
                                                {selectedEmployee.lopDays > 0 && <TrendingDownIcon sx={{ fontSize: 16, color: '#F59E0B' }} />}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            <Grid container spacing={3} className="print-no-break">
                                {/* Earnings Breakdown */}
                                <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                                    <Card className="print-no-break" sx={{ bgcolor: '#ECFDF5', boxShadow: 'none', border: '1px solid #10B98130' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#10B981', mb: 2 }}>
                                                Earnings Breakdown
                                            </Typography>
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid #D1FAE5' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        Basic Salary
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.basicSalary.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid #D1FAE5' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        HRA (20%)
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.hra.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid #D1FAE5' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        DA (10%)
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.da.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid #D1FAE5' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        Special Allowance
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.specialAllowance.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid #D1FAE5' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        Incentives
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.incentives.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '2px solid #10B981' }}>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>
                                                        Total Earnings
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#10B981' }}>
                                                        ₹{selectedEmployee.grossSalary.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Deductions Breakdown */}
                                <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                                    <Card className="print-no-break" sx={{ bgcolor: '#FEF2F2', boxShadow: 'none', border: '1px solid #DC262630' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#DC2626', mb: 2 }}>
                                                Deductions Breakdown
                                            </Typography>
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid #FEE2E2' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        PF (12%)
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.pf.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid #FEE2E2' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        ESI
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.esi.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid #FEE2E2' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        Professional Tax
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.professionalTax.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid #FEE2E2' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        TDS
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.tds.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid #FEE2E2' }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        LOP Deduction
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        ₹{selectedEmployee.lopDeduction.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '2px solid #DC2626' }}>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>
                                                        Total Deductions
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#DC2626' }}>
                                                        ₹{selectedEmployee.totalDeductions.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Net Salary */}
                            <Card className="print-no-break" sx={{ mt: 3, bgcolor: PRIMARY_LIGHT, boxShadow: 'none', border: `2px solid ${PRIMARY}` }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '13px', color: '#64748B', mb: 0.5 }}>
                                                Net Salary (Take Home)
                                            </Typography>
                                            <Typography sx={{ fontSize: '24px', fontWeight: 700, color: PRIMARY }}>
                                                ₹{selectedEmployee.netSalary.toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={selectedEmployee.paymentMode}
                                            sx={{
                                                bgcolor: PRIMARY,
                                                color: '#fff',
                                                fontWeight: 600,
                                                fontSize: '12px'
                                            }}
                                        />
                                    </Box>
                                    <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 1 }}>
                                        Payment Date: {selectedEmployee.paymentDate}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions className="print-hide" sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{
                            textTransform: 'none',
                            color: '#64748B',
                            fontWeight: 600
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintPayslip}
                        sx={{
                            textTransform: 'none',
                            borderColor: PRIMARY,
                            color: PRIMARY,
                            fontWeight: 700,
                            '&:hover': { borderColor: PRIMARY_DARK, bgcolor: PRIMARY_LIGHT }
                        }}
                    >
                        Print Payslip
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
        </>
    );
}
