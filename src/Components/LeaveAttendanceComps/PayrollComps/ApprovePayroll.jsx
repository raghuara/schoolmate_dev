import React, { useState } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow,
    Avatar, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Color theme
const PRIMARY = '#FF9800';
const PRIMARY_LIGHT = '#FFF4E6';
const PRIMARY_DARK = '#F57C00';
const CARD_RADIUS = '12px';

// Mock payroll data with detailed breakdown
const mockPayrollData = [
    {
        id: 1,
        employeeId: 'EMP001',
        name: 'Rajesh Kumar',
        designation: 'Senior Teacher',
        department: 'Mathematics',
        basicSalary: 45000,
        grossSalary: 70500,
        deductions: 6800,
        netSalary: 63700,
        status: 'Pending',
        month: 'February 2026',
        // Detailed breakdown
        earnings: {
            basic: 45000,
            hra: 18000,
            da: 4500,
            ta: 2000,
            incentive: 1000,
            additionalSalary: 0
        },
        deductionDetails: {
            pf: 5400,
            esi: 500,
            pt: 200,
            tds: 700,
            advance: 0
        },
        attendance: {
            totalDays: 28,
            present: 26,
            absent: 2,
            leaves: 0,
            holidays: 4
        }
    },
    {
        id: 2,
        employeeId: 'EMP002',
        name: 'Priya Sharma',
        designation: 'Teacher',
        department: 'Science',
        basicSalary: 30000,
        grossSalary: 48600,
        deductions: 4200,
        netSalary: 44400,
        status: 'Pending',
        month: 'February 2026',
        // Detailed breakdown
        earnings: {
            basic: 30000,
            hra: 12000,
            da: 3000,
            ta: 1500,
            incentive: 2100,
            additionalSalary: 0
        },
        deductionDetails: {
            pf: 3600,
            esi: 350,
            pt: 150,
            tds: 100,
            advance: 0
        },
        attendance: {
            totalDays: 28,
            present: 28,
            absent: 0,
            leaves: 0,
            holidays: 4
        }
    },
    {
        id: 3,
        employeeId: 'EMP003',
        name: 'Amit Patel',
        designation: 'Lab Assistant',
        department: 'Laboratory',
        basicSalary: 25000,
        grossSalary: 38600,
        deductions: 3500,
        netSalary: 35100,
        status: 'Approved',
        month: 'February 2026',
        // Detailed breakdown
        earnings: {
            basic: 25000,
            hra: 10000,
            da: 2500,
            ta: 1100,
            incentive: 0,
            additionalSalary: 0
        },
        deductionDetails: {
            pf: 3000,
            esi: 300,
            pt: 200,
            tds: 0,
            advance: 0
        },
        attendance: {
            totalDays: 28,
            present: 27,
            absent: 1,
            leaves: 0,
            holidays: 4
        }
    },
];

export default function ApprovePayroll() {
    const navigate = useNavigate();
    const [payrollData, setPayrollData] = useState(mockPayrollData);
    const [selected, setSelected] = useState([]);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const pendingCount = payrollData.filter(p => p.status === 'Pending').length;
    const approvedCount = payrollData.filter(p => p.status === 'Approved').length;
    const totalPayroll = payrollData.reduce((sum, p) => sum + p.netSalary, 0);

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const pendingIds = payrollData.filter(p => p.status === 'Pending').map(p => p.id);
            setSelected(pendingIds);
        } else {
            setSelected([]);
        }
    };

    const handleSelect = (id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const handleApproveSelected = () => {
        setPayrollData(payrollData.map(p =>
            selected.includes(p.id) ? { ...p, status: 'Approved' } : p
        ));
        setSelected([]);
        toast.success(`${selected.length} payroll${selected.length > 1 ? 's' : ''} approved successfully!`);
    };

    const handleGeneratePayslips = () => {
        const approvedPayrolls = payrollData.filter(p => p.status === 'Approved');
        toast.success(`Generating payslips for ${approvedPayrolls.length} employees...`);
    };

    const handleViewPayslip = (employee) => {
        setSelectedEmployee(employee);
        setViewDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setViewDialogOpen(false);
        setSelectedEmployee(null);
    };

    const handlePrintPayslip = () => {
        window.print();
    };

    return (
        <>
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
                        }
                        .print-hide {
                            display: none !important;
                        }
                        .print-no-break {
                            page-break-inside: avoid !important;
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
                            Approve Payroll & Payslips
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3 }}>
                            February 2026 - Review and approve monthly payroll
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {selected.length > 0 && (
                        <Button
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleApproveSelected}
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#10B981',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: '700',
                                '&:hover': { bgcolor: '#059669' }
                            }}
                        >
                            Approve Selected ({selected.length})
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<DescriptionIcon />}
                        onClick={handleGeneratePayslips}
                        sx={{
                            textTransform: 'none',
                            borderColor: PRIMARY,
                            color: PRIMARY,
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '700',
                            '&:hover': { borderColor: PRIMARY_DARK, bgcolor: PRIMARY_LIGHT }
                        }}
                    >
                        Generate Payslips
                    </Button>
                </Box>
            </Box>

            <Divider />

            {/* Statistics Cards */}
            <Box sx={{ p: 2.5 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Card sx={{
                            border: '1px solid #FF980030',
                            borderRadius: CARD_RADIUS,
                            bgcolor: PRIMARY_LIGHT,
                            boxShadow: 'none'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: PRIMARY, fontWeight: 600, mb: 1 }}>
                                            Total Employees
                                        </Typography>
                                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {payrollData.length}
                                        </Typography>
                                    </Box>
                                    <TaskAltIcon sx={{ fontSize: 32, color: PRIMARY, opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Card sx={{
                            border: '1px solid #FBBF2430',
                            borderRadius: CARD_RADIUS,
                            bgcolor: '#FFFBEB',
                            boxShadow: 'none'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600, mb: 1 }}>
                                            Pending Approval
                                        </Typography>
                                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {pendingCount}
                                        </Typography>
                                    </Box>
                                    <PendingActionsIcon sx={{ fontSize: 32, color: '#F59E0B', opacity: 0.6 }} />
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
                                            Approved
                                        </Typography>
                                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {approvedCount}
                                        </Typography>
                                    </Box>
                                    <CheckCircleIcon sx={{ fontSize: 32, color: '#10B981', opacity: 0.6 }} />
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
                                            Total Payroll
                                        </Typography>
                                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                                            ₹{(totalPayroll / 100000).toFixed(2)}L
                                        </Typography>
                                    </Box>
                                    <DownloadIcon sx={{ fontSize: 32, color: '#3B82F6', opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Payroll Table */}
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
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <TaskAltIcon sx={{ fontSize: 20, color: PRIMARY }} />
                            <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                                Monthly Payroll - February 2026
                            </Typography>
                        </Box>
                        {selected.length > 0 && (
                            <Chip
                                label={`${selected.length} selected`}
                                size="small"
                                sx={{
                                    bgcolor: PRIMARY,
                                    color: '#fff',
                                    fontWeight: 600
                                }}
                            />
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
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Employee</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Basic Salary</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Gross Salary</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Deductions</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Net Salary</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payrollData.map((row) => {
                                const isSelected = selected.indexOf(row.id) !== -1;
                                const isPending = row.status === 'Pending';
                                return (
                                    <TableRow
                                        key={row.id}
                                        sx={{
                                            '&:hover': { bgcolor: '#F8FAFC' },
                                            bgcolor: isSelected ? '#FFF4E6' : 'inherit'
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handleSelect(row.id)}
                                                disabled={!isPending}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor: PRIMARY_LIGHT,
                                                    color: PRIMARY
                                                }}>
                                                    {row.name.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                        {row.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                                                        {row.employeeId} • {row.designation}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                                            ₹{row.basicSalary.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>
                                            ₹{row.grossSalary.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>
                                            ₹{row.deductions.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '14px', fontWeight: 700, color: '#2563EB' }}>
                                            ₹{row.netSalary.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: row.status === 'Approved' ? '#ECFDF5' : '#FFFBEB',
                                                    color: row.status === 'Approved' ? '#10B981' : '#F59E0B',
                                                    fontWeight: 600,
                                                    fontSize: '11px'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {/* <IconButton
                                                    size="small"
                                                    onClick={() => handleViewPayslip(row)}
                                                    sx={{ '&:hover': { bgcolor: '#EFF6FF' } }}
                                                >
                                                    <VisibilityIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
                                                </IconButton> */}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewPayslip(row)}
                                                    sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}
                                                >
                                                    <PrintIcon sx={{ fontSize: 18, color: '#64748B' }} />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            </Box>
        </Box>

            {/* Payslip View Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px' }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: '#F8FAFC',
                    borderBottom: '2px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>
                        Payslip Details
                    </Typography>
                    <IconButton onClick={handleCloseDialog} size="small" className="print-hide">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {selectedEmployee && (
                        <Box id="payslip-print-content" sx={{ p: 3 }}>
                            {/* Print-only header */}
                            <Box sx={{
                                display: 'none',
                                '@media print': {
                                    display: 'block',
                                    mb: 3,
                                    pb: 2,
                                    borderBottom: '2px solid #000'
                                }
                            }}>
                                <Typography sx={{
                                    fontSize: '24px',
                                    fontWeight: '800',
                                    textAlign: 'center',
                                    color: '#1a1a1a',
                                    mb: 0.5
                                }}>
                                    SchoolMate Academy
                                </Typography>
                                <Typography sx={{
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    color: '#64748B',
                                    mb: 2
                                }}>
                                    123 Education Street, City - 400001
                                </Typography>
                                <Typography sx={{
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    textAlign: 'center',
                                    color: '#1a1a1a'
                                }}>
                                    SALARY SLIP - {selectedEmployee.month.toUpperCase()}
                                </Typography>
                            </Box>

                            {/* Employee Information */}
                            <Box className="print-no-break" sx={{ mb: 3 }}>
                                <Typography sx={{
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    mb: 2,
                                    color: PRIMARY
                                }}>
                                    Employee Information
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>
                                                Employee Name
                                            </Typography>
                                            <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                                                {selectedEmployee.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>
                                                Designation
                                            </Typography>
                                            <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                                                {selectedEmployee.designation}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>
                                                Employee ID
                                            </Typography>
                                            <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                                                {selectedEmployee.employeeId}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>
                                                Department
                                            </Typography>
                                            <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                                                {selectedEmployee.department}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Attendance Summary */}
                            <Box className="print-no-break" sx={{ mb: 3 }}>
                                <Typography sx={{
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    mb: 2,
                                    color: PRIMARY
                                }}>
                                    Attendance Summary
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                        <Box sx={{
                                            bgcolor: '#F8FAFC',
                                            p: 1.5,
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>
                                                Total Days
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: '700' }}>
                                                {selectedEmployee.attendance.totalDays}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                        <Box sx={{
                                            bgcolor: '#ECFDF5',
                                            p: 1.5,
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <Typography sx={{ fontSize: '11px', color: '#10B981', mb: 0.5 }}>
                                                Present
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: '700', color: '#10B981' }}>
                                                {selectedEmployee.attendance.present}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                        <Box sx={{
                                            bgcolor: '#FEF2F2',
                                            p: 1.5,
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <Typography sx={{ fontSize: '11px', color: '#EF4444', mb: 0.5 }}>
                                                Absent
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: '700', color: '#EF4444' }}>
                                                {selectedEmployee.attendance.absent}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                                        <Box sx={{
                                            bgcolor: '#EFF6FF',
                                            p: 1.5,
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <Typography sx={{ fontSize: '11px', color: '#3B82F6', mb: 0.5 }}>
                                                Holidays
                                            </Typography>
                                            <Typography sx={{ fontSize: '18px', fontWeight: '700', color: '#3B82F6' }}>
                                                {selectedEmployee.attendance.holidays}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Earnings and Deductions */}
                            <Grid container spacing={3} className="print-no-break">
                                {/* Earnings */}
                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Box sx={{
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{
                                            bgcolor: '#ECFDF5',
                                            p: 1.5,
                                            borderBottom: '1px solid #E2E8F0'
                                        }}>
                                            <Typography sx={{
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#10B981'
                                            }}>
                                                Earnings
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 2 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1.5
                                            }}>
                                                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                    Basic Salary
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                    ₹{selectedEmployee.earnings.basic.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1.5
                                            }}>
                                                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                    HRA
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                    ₹{selectedEmployee.earnings.hra.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1.5
                                            }}>
                                                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                    Dearness Allowance
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                    ₹{selectedEmployee.earnings.da.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1.5
                                            }}>
                                                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                    Transport Allowance
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                    ₹{selectedEmployee.earnings.ta.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            {selectedEmployee.earnings.incentive > 0 && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    mb: 1.5
                                                }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        Incentive
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                        ₹{selectedEmployee.earnings.incentive.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {selectedEmployee.earnings.additionalSalary > 0 && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    mb: 1.5
                                                }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        Additional Salary
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                        ₹{selectedEmployee.earnings.additionalSalary.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Divider sx={{ my: 1.5 }} />
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Typography sx={{
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    color: '#10B981'
                                                }}>
                                                    Gross Salary
                                                </Typography>
                                                <Typography sx={{
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    color: '#10B981'
                                                }}>
                                                    ₹{selectedEmployee.grossSalary.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Deductions */}
                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Box sx={{
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{
                                            bgcolor: '#FEF2F2',
                                            p: 1.5,
                                            borderBottom: '1px solid #E2E8F0'
                                        }}>
                                            <Typography sx={{
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#EF4444'
                                            }}>
                                                Deductions
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 2 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1.5
                                            }}>
                                                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                    Provident Fund (PF)
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                    ₹{selectedEmployee.deductionDetails.pf.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1.5
                                            }}>
                                                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                    ESI
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                    ₹{selectedEmployee.deductionDetails.esi.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1.5
                                            }}>
                                                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                    Professional Tax (PT)
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                    ₹{selectedEmployee.deductionDetails.pt.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1.5
                                            }}>
                                                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                    TDS
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                    ₹{selectedEmployee.deductionDetails.tds.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            {selectedEmployee.deductionDetails.advance > 0 && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    mb: 1.5
                                                }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                                                        Advance
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                        ₹{selectedEmployee.deductionDetails.advance.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Divider sx={{ my: 1.5 }} />
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Typography sx={{
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    color: '#EF4444'
                                                }}>
                                                    Total Deductions
                                                </Typography>
                                                <Typography sx={{
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    color: '#EF4444'
                                                }}>
                                                    ₹{selectedEmployee.deductions.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Net Salary */}
                            <Box sx={{
                                mt: 3,
                                p: 2.5,
                                bgcolor: '#EFF6FF',
                                borderRadius: '12px',
                                border: '2px solid #3B82F6',
                                textAlign: 'center'
                            }} className="print-no-break">
                                <Typography sx={{
                                    fontSize: '13px',
                                    color: '#64748B',
                                    mb: 1
                                }}>
                                    NET SALARY (TAKE HOME)
                                </Typography>
                                <Typography sx={{
                                    fontSize: '32px',
                                    fontWeight: '800',
                                    color: '#3B82F6'
                                }}>
                                    ₹{selectedEmployee.netSalary.toLocaleString()}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    mt: 1
                                }}>
                                    ({selectedEmployee.month})
                                </Typography>
                            </Box>

                            {/* Footer note for print */}
                            <Box sx={{
                                display: 'none',
                                '@media print': {
                                    display: 'block',
                                    mt: 4,
                                    pt: 2,
                                    borderTop: '1px solid #E2E8F0'
                                }
                            }}>
                                <Typography sx={{
                                    fontSize: '10px',
                                    color: '#94A3B8',
                                    textAlign: 'center'
                                }}>
                                    This is a computer-generated payslip and does not require a signature.
                                </Typography>
                                <Typography sx={{
                                    fontSize: '10px',
                                    color: '#94A3B8',
                                    textAlign: 'center',
                                    mt: 0.5
                                }}>
                                    Generated on {new Date().toLocaleDateString('en-IN')}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{
                    p: 2.5,
                    borderTop: '2px solid #E2E8F0',
                    bgcolor: '#F8FAFC'
                }} className="print-hide">
                    <Button
                        onClick={handleCloseDialog}
                        sx={{
                            textTransform: 'none',
                            color: '#64748B',
                            fontWeight: '600'
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={handlePrintPayslip}
                        sx={{
                            textTransform: 'none',
                            bgcolor: PRIMARY,
                            fontWeight: '700',
                            '&:hover': { bgcolor: PRIMARY_DARK }
                        }}
                    >
                        Print Payslip
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
