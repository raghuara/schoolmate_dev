import React, { useState } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
    Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import SnackBar from '../../SnackBar';

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

export default function BankReports() {
    const navigate = useNavigate();
    const [selectedMonth] = useState('February 2026');
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        accountType: 'Savings'
    });

    // SnackBar
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true); setSnackColor(success); setSnackStatus(success);
    };

    const totalSalary = mockEmployeeBankData.reduce((sum, emp) => sum + emp.netSalary, 0);
    const verifiedAccounts = mockEmployeeBankData.filter(emp => emp.status === 'Verified').length;

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
        showSnack('Bank details updated successfully!', true);
        setOpenDialog(false);
    };

    const handleExportBankData = () => {
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
        ws['!cols'] = [
            { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 15 },
            { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 20 },
            { wch: 12 }, { wch: 10 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Bank Details');
        const fileName = `Employee_Bank_Details_${selectedMonth.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        showSnack('Bank details exported successfully!', true);
    };

    return (
        <>
        <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />
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
                            Employee Bank Details
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3 }}>
                            Manage employee bank account information
                        </Typography>
                    </Box>
                </Box>
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

            <Divider />

            <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
                {/* Statistics Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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
                </Grid>

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
        </>
    );
}
