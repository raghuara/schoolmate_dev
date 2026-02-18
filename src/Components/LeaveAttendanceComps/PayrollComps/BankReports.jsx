import React, { useState } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
    Avatar, Tabs, Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Color theme
const PRIMARY = '#00ACC1';
const PRIMARY_LIGHT = '#E0F7FA';
const PRIMARY_DARK = '#0097A7';
const CARD_RADIUS = '12px';

// Mock employee salary & bank data
const mockEmployeeBankData = [
    {
        id: 1,
        employeeId: 'EMP001',
        name: 'Rajesh Kumar',
        designation: 'Senior Teacher',
        department: 'Mathematics',
        netSalary: 63700,
        bankName: 'State Bank of India',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        branchName: 'MG Road Branch',
        accountType: 'Savings',
        status: 'Verified'
    },
    {
        id: 2,
        employeeId: 'EMP002',
        name: 'Priya Sharma',
        designation: 'Teacher',
        department: 'Science',
        netSalary: 44400,
        bankName: 'HDFC Bank',
        accountNumber: '9876543210',
        ifscCode: 'HDFC0001234',
        branchName: 'Sector 17 Branch',
        accountType: 'Savings',
        status: 'Verified'
    },
    {
        id: 3,
        employeeId: 'EMP003',
        name: 'Amit Patel',
        designation: 'Lab Assistant',
        department: 'Laboratory',
        netSalary: 35100,
        bankName: 'ICICI Bank',
        accountNumber: '5544332211',
        ifscCode: 'ICIC0001234',
        branchName: 'Main Market Branch',
        accountType: 'Savings',
        status: 'Pending'
    },
    {
        id: 4,
        employeeId: 'EMP004',
        name: 'Sneha Gupta',
        designation: 'Teacher',
        department: 'English',
        netSalary: 41900,
        bankName: 'Axis Bank',
        accountNumber: '1122334455',
        ifscCode: 'UTIB0001234',
        branchName: 'City Center Branch',
        accountType: 'Savings',
        status: 'Verified'
    },
];

// Mock data for compliance reports
const mockComplianceReports = [
    {
        id: 1,
        reportType: 'EPF Challan',
        month: 'February 2026',
        dueDate: '2026-03-15',
        amount: 187200,
        status: 'Pending',
    },
    {
        id: 2,
        reportType: 'ESI Challan',
        month: 'February 2026',
        dueDate: '2026-03-21',
        amount: 78000,
        status: 'Pending',
    },
    {
        id: 3,
        reportType: 'Professional Tax',
        month: 'February 2026',
        dueDate: '2026-03-10',
        amount: 31200,
        status: 'Downloaded',
    },
];

export default function BankReports() {
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState('February 2026');
    const [fileFormat, setFileFormat] = useState('NEFT');
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        accountType: 'Savings'
    });

    const totalSalary = mockEmployeeBankData.reduce((sum, emp) => sum + emp.netSalary, 0);
    const verifiedAccounts = mockEmployeeBankData.filter(emp => emp.status === 'Verified').length;
    const pendingReports = mockComplianceReports.filter(r => r.status === 'Pending').length;
    const totalCompliance = mockComplianceReports.reduce((sum, r) => sum + r.amount, 0);

    const filteredData = mockEmployeeBankData.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.bankName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditBankDetails = (employee) => {
        setSelectedEmployee(employee);
        setBankDetails({
            bankName: employee.bankName,
            accountNumber: employee.accountNumber,
            ifscCode: employee.ifscCode,
            branchName: employee.branchName,
            accountType: employee.accountType
        });
        setOpenDialog(true);
    };

    const handleSaveBankDetails = () => {
        toast.success('Bank details updated successfully!');
        setOpenDialog(false);
    };

    const handleGenerateBankFile = () => {
        toast.success(`Generating ${fileFormat} bank transfer file for ${selectedMonth}...`);
    };

    const handleDownloadReport = (reportType) => {
        toast.success(`Downloading ${reportType}...`);
    };

    const handleExportBankData = () => {
        // Prepare data for Excel export based on current tab
        if (tabValue === 0) {
            // Export Employee Bank Details
            const excelData = filteredData.map((emp, index) => ({
                'S.No': index + 1,
                'Employee ID': emp.employeeId,
                'Employee Name': emp.name,
                'Designation': emp.designation,
                'Department': emp.department,
                'Net Salary': emp.netSalary,
                'Bank Name': emp.bankName,
                'Account Number': emp.accountNumber,
                'IFSC Code': emp.ifscCode,
                'Branch Name': emp.branchName,
                'Account Type': emp.accountType,
                'Status': emp.status
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const colWidths = [
                { wch: 6 },  // S.No
                { wch: 12 }, // Employee ID
                { wch: 20 }, // Employee Name
                { wch: 18 }, // Designation
                { wch: 15 }, // Department
                { wch: 12 }, // Net Salary
                { wch: 20 }, // Bank Name
                { wch: 15 }, // Account Number
                { wch: 12 }, // IFSC Code
                { wch: 20 }, // Branch Name
                { wch: 12 }, // Account Type
                { wch: 10 }  // Status
            ];
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Employee Bank Details');

            const fileName = `Employee_Bank_Details_${selectedMonth.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success('Bank details exported successfully!');
        } else if (tabValue === 2) {
            // Export Compliance Reports
            const excelData = mockComplianceReports.map((report, index) => ({
                'S.No': index + 1,
                'Report Type': report.reportType,
                'Month': report.month,
                'Due Date': report.dueDate,
                'Amount': report.amount,
                'Status': report.status
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            const colWidths = [
                { wch: 6 },  // S.No
                { wch: 20 }, // Report Type
                { wch: 15 }, // Month
                { wch: 12 }, // Due Date
                { wch: 12 }, // Amount
                { wch: 12 }  // Status
            ];
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Compliance Reports');

            const fileName = `Compliance_Reports_${selectedMonth.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success('Compliance reports exported successfully!');
        } else {
            toast.error('No data available to export for this tab');
        }
    };

    return (
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
                            Bank Transfer & Reports
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3 }}>
                            Manage employee bank details and generate transfer files
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportBankData}
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
                        Export Data
                    </Button>
                </Box>
            </Box>

            <Divider />

            {/* Tabs */}
            <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E8E8E8' }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={{
                        px: 2,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#64748B',
                            minHeight: '48px'
                        },
                        '& .Mui-selected': {
                            color: `${PRIMARY} !important`
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: PRIMARY,
                            height: '3px'
                        }
                    }}
                >
                    <Tab label="Employee Bank Details" />
                    <Tab label="Generate Bank File" />
                    <Tab label="Compliance Reports" />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
                {/* Statistics Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Card sx={{
                            border: '1px solid #00ACC130',
                            borderRadius: CARD_RADIUS,
                            bgcolor: PRIMARY_LIGHT,
                            boxShadow: 'none'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: PRIMARY, fontWeight: 600, mb: 1 }}>
                                            Total Net Salary
                                        </Typography>
                                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                                            ₹{(totalSalary / 100000).toFixed(2)}L
                                        </Typography>
                                    </Box>
                                    <AccountBalanceIcon sx={{ fontSize: 32, color: PRIMARY, opacity: 0.6 }} />
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
                                            Verified Accounts
                                        </Typography>
                                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {verifiedAccounts}/{mockEmployeeBankData.length}
                                        </Typography>
                                    </Box>
                                    <CheckCircleIcon sx={{ fontSize: 32, color: '#10B981', opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Card sx={{
                            border: '1px solid #F59E0B30',
                            borderRadius: CARD_RADIUS,
                            bgcolor: '#FFFBEB',
                            boxShadow: 'none'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600, mb: 1 }}>
                                            Pending Reports
                                        </Typography>
                                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {pendingReports}
                                        </Typography>
                                    </Box>
                                    <PendingActionsIcon sx={{ fontSize: 32, color: '#F59E0B', opacity: 0.6 }} />
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
                                            Compliance Amount
                                        </Typography>
                                        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>
                                            ₹{(totalCompliance / 100000).toFixed(2)}L
                                        </Typography>
                                    </Box>
                                    <DescriptionIcon sx={{ fontSize: 32, color: '#3B82F6', opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tab Content */}
                {tabValue === 0 && (
                    <>
                        {/* Search Bar */}
                        <Box sx={{ mb: 2.5 }}>
                            <TextField
                                fullWidth
                                placeholder="Search by name, employee ID, or bank name..."
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
                        </Box>

                        {/* Employee Bank Details Table */}
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
                                <AccountBalanceIcon sx={{ fontSize: 20, color: PRIMARY }} />
                                <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                                    Employee Bank Account Details - {selectedMonth}
                                </Typography>
                                <Chip
                                    label={`${filteredData.length} Employees`}
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
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Net Salary</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Bank Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Account Number</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>IFSC Code</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Branch</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredData.map((emp) => (
                                            <TableRow
                                                key={emp.id}
                                                sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{
                                                            width: 36,
                                                            height: 36,
                                                            bgcolor: PRIMARY_LIGHT,
                                                            color: PRIMARY,
                                                            fontSize: '14px'
                                                        }}>
                                                            {emp.name.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                                {emp.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                                                                {emp.employeeId} • {emp.designation}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '14px', fontWeight: 700, color: '#2563EB' }}>
                                                    ₹{emp.netSalary.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                    {emp.bankName}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', fontFamily: 'monospace' }}>
                                                    {emp.accountNumber}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>
                                                    {emp.ifscCode}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                                                    {emp.branchName}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={emp.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: emp.status === 'Verified' ? '#ECFDF5' : '#FFFBEB',
                                                            color: emp.status === 'Verified' ? '#10B981' : '#F59E0B',
                                                            fontWeight: 600,
                                                            fontSize: '11px'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditBankDetails(emp)}
                                                        sx={{ color: PRIMARY }}
                                                    >
                                                        <EditIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Card>
                    </>
                )}

                {tabValue === 1 && (
                    <Grid container spacing={2.5}>
                        {/* Bank File Generation */}
                        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
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
                                    <UploadFileIcon sx={{ fontSize: 20, color: PRIMARY }} />
                                    <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                                        Generate Bank Transfer File
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 4 }}>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                                            <TextField
                                                fullWidth
                                                select
                                                label="Select Month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                            >
                                                <MenuItem value="February 2026">February 2026</MenuItem>
                                                <MenuItem value="January 2026">January 2026</MenuItem>
                                                <MenuItem value="December 2025">December 2025</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                                            <TextField
                                                fullWidth
                                                select
                                                label="File Format"
                                                value={fileFormat}
                                                onChange={(e) => setFileFormat(e.target.value)}
                                            >
                                                <MenuItem value="NEFT">NEFT (National Electronic Funds Transfer)</MenuItem>
                                                <MenuItem value="RTGS">RTGS (Real Time Gross Settlement)</MenuItem>
                                                <MenuItem value="IMPS">IMPS (Immediate Payment Service)</MenuItem>
                                                <MenuItem value="CSV">CSV (Generic Format)</MenuItem>
                                            </TextField>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mt: 4, p: 3, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 2 }}>
                                            Transfer Summary
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                                                <Typography sx={{ fontSize: '12px', color: '#64748B', mb: 0.5 }}>
                                                    Total Employees
                                                </Typography>
                                                <Typography sx={{ fontSize: '20px', fontWeight: 700 }}>
                                                    {mockEmployeeBankData.length}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                                                <Typography sx={{ fontSize: '12px', color: '#64748B', mb: 0.5 }}>
                                                    Total Amount
                                                </Typography>
                                                <Typography sx={{ fontSize: '20px', fontWeight: 700, color: PRIMARY }}>
                                                    ₹{totalSalary.toLocaleString()}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                                                <Typography sx={{ fontSize: '12px', color: '#64748B', mb: 0.5 }}>
                                                    Verified Accounts
                                                </Typography>
                                                <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>
                                                    {verifiedAccounts}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        startIcon={<DownloadIcon />}
                                        onClick={handleGenerateBankFile}
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: PRIMARY,
                                            borderRadius: '10px',
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            py: 1.8,
                                            mt: 3,
                                            '&:hover': { bgcolor: PRIMARY_DARK }
                                        }}
                                    >
                                        Generate & Download {fileFormat} File
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {tabValue === 2 && (
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
                                Statutory Compliance Reports - {selectedMonth}
                            </Typography>
                        </Box>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Report Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Month</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Due Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mockComplianceReports.map((report) => (
                                    <TableRow
                                        key={report.id}
                                        sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}
                                    >
                                        <TableCell>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                {report.reportType}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '13px' }}>
                                            {report.month}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                                            {report.dueDate}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                                            ₹{report.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={report.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: report.status === 'Downloaded' ? '#ECFDF5' : '#FFFBEB',
                                                    color: report.status === 'Downloaded' ? '#10B981' : '#F59E0B',
                                                    fontWeight: 600,
                                                    fontSize: '11px'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => handleDownloadReport(report.reportType)}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderColor: PRIMARY,
                                                    color: PRIMARY,
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    '&:hover': { borderColor: PRIMARY_DARK, bgcolor: PRIMARY_LIGHT }
                                                }}
                                            >
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </Box>

            {/* Edit Bank Details Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>
                        Edit Bank Account Details
                    </Typography>
                    {selectedEmployee && (
                        <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 0.5 }}>
                            {selectedEmployee.name} ({selectedEmployee.employeeId})
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Bank Name"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                            sx={{ mb: 2.5 }}
                        />
                        <TextField
                            fullWidth
                            label="Account Number"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                            sx={{ mb: 2.5 }}
                        />
                        <TextField
                            fullWidth
                            label="IFSC Code"
                            value={bankDetails.ifscCode}
                            onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                            sx={{ mb: 2.5 }}
                        />
                        <TextField
                            fullWidth
                            label="Branch Name"
                            value={bankDetails.branchName}
                            onChange={(e) => setBankDetails({ ...bankDetails, branchName: e.target.value })}
                            sx={{ mb: 2.5 }}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Account Type"
                            value={bankDetails.accountType}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value })}
                        >
                            <MenuItem value="Savings">Savings Account</MenuItem>
                            <MenuItem value="Current">Current Account</MenuItem>
                            <MenuItem value="Salary">Salary Account</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{
                            textTransform: 'none',
                            color: '#64748B',
                            fontWeight: 600
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveBankDetails}
                        sx={{
                            textTransform: 'none',
                            bgcolor: PRIMARY,
                            fontWeight: 700,
                            '&:hover': { bgcolor: PRIMARY_DARK }
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
