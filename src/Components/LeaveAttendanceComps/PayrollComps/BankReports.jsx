import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
    Avatar, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import SnackBar from '../../SnackBar';
import { employeeBankDetailsDashboard, updateEmployeeBankDetailsByRollnumber } from '../../../Api/Api';

const PRIMARY = '#00ACC1';
const PRIMARY_LIGHT = '#E0F7FA';
const PRIMARY_DARK = '#0097A7';
const CARD_RADIUS = '12px';

export default function BankReports() {
    const navigate = useNavigate();
    const token = "123";

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
    });

    const [stats, setStats] = useState({
        totalEmployees: 0,
        verifiedAccounts: 0,
        totalAccounts: 0,
        totalNetSalary: 0,
    });
    const [employeeData, setEmployeeData] = useState([]);

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true); setSnackColor(success); setSnackStatus(success);
    };

    const fetchBankDashboard = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(employeeBankDetailsDashboard, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.data.error) {
                const d = res.data.data;
                setStats({
                    totalEmployees: d.totalEmployees,
                    verifiedAccounts: d.verifiedAccounts,
                    totalAccounts: d.totalAccounts,
                    totalNetSalary: d.totalNetSalary,
                });
                setEmployeeData(d.employees);
            }
        } catch {
            showSnack('Failed to load bank details', false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBankDashboard();
    }, []);

    const filteredData = employeeData.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.bankName && emp.bankName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const hasBankDetails = (emp) =>
        emp.bankName && emp.accountNumber && emp.ifsc && emp.branch;

    const handleOpenBankDialog = (employee) => {
        const addMode = !hasBankDetails(employee);
        setIsAddMode(addMode);
        setSelectedEmployee(employee);
        setBankDetails({
            bankName: employee.bankName || '',
            accountNumber: employee.accountNumber || '',
            ifscCode: employee.ifsc || '',
            branchName: employee.branch || '',
        });
        setOpenDialog(true);
    };

    const handleSaveBankDetails = async () => {
        if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.branchName) {
            showSnack('Please fill all bank details', false);
            return;
        }
        setIsSaving(true);
        try {
            const body = {
                rollNumber: selectedEmployee.rollNumber,
                bankName: bankDetails.bankName,
                accountNumber: bankDetails.accountNumber,
                ifsc: bankDetails.ifscCode,
                branch: bankDetails.branchName,
            };
            const res = await axios.put(updateEmployeeBankDetailsByRollnumber, body, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.data.error) {
                showSnack(isAddMode ? 'Bank details added successfully!' : 'Bank details updated successfully!', true);
                setOpenDialog(false);
                setEmployeeData(employeeData.map(emp =>
                    emp.id === selectedEmployee.id
                        ? { ...emp, bankName: body.bankName, accountNumber: body.accountNumber, ifsc: body.ifsc, branch: body.branch }
                        : emp
                ));
            } else {
                showSnack(res.data.message || 'Failed to save bank details', false);
            }
        } catch {
            showSnack('Failed to save bank details', false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportBankData = () => {
        const excelData = filteredData.map((emp, index) => ({
            'S.No': index + 1,
            'Roll Number': emp.rollNumber,
            'Employee Name': emp.name,
            'Designation': emp.designation,
            'Net Salary': emp.netSalary,
            'Bank Name': emp.bankName || 'N/A',
            'Account Number': emp.accountNumber || 'N/A',
            'IFSC Code': emp.ifsc || 'N/A',
            'Branch Name': emp.branch || 'N/A',
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        ws['!cols'] = [
            { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 18 },
            { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 20 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Bank Details');
        const fileName = `Employee_Bank_Details_${new Date().toISOString().split('T')[0]}.xlsx`;
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
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%' }}>
                        <CircularProgress sx={{ color: PRIMARY }} />
                    </Box>
                ) : (
                    <>
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
                                                    ₹{(stats.totalNetSalary / 100000).toFixed(2)}L
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
                                                    {stats.verifiedAccounts}/{stats.totalAccounts}
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
                                placeholder="Search by name, roll number, or bank name..."
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
                                    Employee Bank Account Details
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
                            <Box sx={{ overflowX: 'auto', maxHeight: '42vh', overflowY: 'auto' }}>
                                <Table stickyHeader>
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
                                                                {emp.rollNumber} • {emp.designation}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '14px', fontWeight: 700, color: '#2563EB' }}>
                                                    ₹{emp.netSalary.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                    {emp.bankName || <Typography sx={{ fontSize: '12px', color: '#CBD5E1' }}>Not added</Typography>}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', fontFamily: 'monospace' }}>
                                                    {emp.accountNumber || <Typography sx={{ fontSize: '12px', color: '#CBD5E1' }}>—</Typography>}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>
                                                    {emp.ifsc || <Typography sx={{ fontSize: '12px', color: '#CBD5E1' }}>—</Typography>}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '12px', color: '#64748B' }}>
                                                    {emp.branch || <Typography sx={{ fontSize: '12px', color: '#CBD5E1' }}>—</Typography>}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenBankDialog(emp)}
                                                        sx={{ color: hasBankDetails(emp) ? PRIMARY : '#10B981' }}
                                                        title={hasBankDetails(emp) ? 'Edit bank details' : 'Add bank details'}
                                                    >
                                                        {hasBankDetails(emp)
                                                            ? <EditIcon sx={{ fontSize: 18 }} />
                                                            : <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
                                                        }
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
                        {isAddMode ? 'Add Bank Account Details' : 'Edit Bank Account Details'}
                    </Typography>
                    {selectedEmployee && (
                        <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 0.5 }}>
                            {selectedEmployee.name} ({selectedEmployee.rollNumber})
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
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        disabled={isSaving}
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
                        disabled={isSaving}
                        sx={{
                            textTransform: 'none',
                            bgcolor: PRIMARY,
                            fontWeight: 700,
                            '&:hover': { bgcolor: PRIMARY_DARK },
                            minWidth: '120px'
                        }}
                    >
                        {isSaving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : isAddMode ? 'Add Details' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
        </>
    );
}
