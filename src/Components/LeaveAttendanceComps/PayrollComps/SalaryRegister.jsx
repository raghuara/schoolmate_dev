import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress
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
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import SnackBar from '../../SnackBar';
import { salaryRegisterDashboard } from '../../../Api/Api';

const PRIMARY = '#E30053';
const PRIMARY_LIGHT = '#FCF8F9';
const PRIMARY_DARK = '#C1003D';
const CARD_RADIUS = '12px';

export default function SalaryRegister() {
    const navigate = useNavigate();
    const token = "123";

    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [stats, setStats] = useState({
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalDeductions: 0,
        totalEmployees: 0,
    });
    const [records, setRecords] = useState([]);

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true); setSnackColor(success); setSnackStatus(success);
    };

    const fetchSalaryRegister = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(salaryRegisterDashboard, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.data.error) {
                const d = res.data.data;
                setStats({
                    totalGrossSalary: d.totalGrossSalary,
                    totalNetSalary: d.totalNetSalary,
                    totalDeductions: d.totalDeductions,
                    totalEmployees: d.totalEmployees,
                });
                setRecords(d.records);
            }
        } catch {
            showSnack('Failed to load salary register', false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaryRegister();
    }, []);

    const departments = ['All', ...new Set(records.map(r => r.department).filter(Boolean))];

    const filteredData = records.filter(emp => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDepartment === 'All' || emp.department === selectedDepartment;
        return matchesSearch && matchesDept;
    });

    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setOpenDialog(true);
    };

    const handlePrintPayslip = () => {
        window.print();
    };

    const handleExportRegister = () => {
        const excelData = filteredData.map((emp, index) => ({
            'S.No': index + 1,
            'Roll Number': emp.rollNumber,
            'Employee': emp.name,
            'Designation': emp.designation,
            'Department': emp.department,
            'Basic Salary': emp.basicSalary,
            'Gross Salary': emp.grossSalary,
            'Deductions': emp.deductions,
            'Net Salary': emp.netSalary,
            'Payment Date': emp.paymentDate,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        ws['!cols'] = [
            { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Salary Register');
        const fileName = `Salary_Register_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        showSnack('Salary register exported successfully!', true);
    };

    return (
        <>
        <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />
        <style>
            {`
                @page { size: A4; margin: 15mm; }
                @media print {
                    body * { visibility: hidden; }
                    #payslip-print-content, #payslip-print-content * { visibility: visible; }
                    #payslip-print-content { position: absolute; left: 0; top: 0; width: 100%; padding: 10px; }
                    .print-hide { display: none !important; }
                    .MuiDialog-paper { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
                    .print-no-break { page-break-inside: avoid !important; break-inside: avoid !important; }
                    .MuiCard-root { margin-bottom: 8px !important; page-break-inside: avoid !important; }
                    .MuiCardContent-root { padding: 12px !important; }
                    #payslip-print-content { transform: scale(0.95); transform-origin: top left; }
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
                                                    ₹{(stats.totalGrossSalary / 100000).toFixed(2)}L
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
                                                    ₹{(stats.totalNetSalary / 100000).toFixed(2)}L
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
                                                    ₹{(stats.totalDeductions / 1000).toFixed(1)}K
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
                                                    {stats.totalEmployees}
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
                                            label="Department"
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            size="small"
                                        >
                                            {departments.map(dept => (
                                                <MenuItem key={dept} value={dept}>
                                                    {dept === 'All' ? 'All Departments' : dept}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 9, lg: 9 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search by name or roll number..."
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
                                    Salary Register
                                </Typography>
                                <Chip
                                    label={`${filteredData.length} Records`}
                                    size="small"
                                    sx={{ bgcolor: PRIMARY, color: '#fff', fontWeight: 600, ml: 'auto' }}
                                />
                            </Box>
                            <Box sx={{ overflowX: 'auto', maxHeight: '38vh', overflowY: 'auto' }}>
                                <Table stickyHeader>
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
                                                            {row.rollNumber} • {row.designation}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', textTransform: 'capitalize' }}>
                                                    {row.department}
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
                    </>
                )}
            </Box>

            {/* Payslip Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className="print-hide">
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, color: PRIMARY }}>
                        Salary Breakdown
                    </Typography>
                    {selectedEmployee && (
                        <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 0.5 }}>
                            {selectedEmployee.name} ({selectedEmployee.rollNumber}) • {selectedEmployee.designation}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent id="payslip-print-content">
                    {selectedEmployee && (
                        <Box sx={{ pt: 1 }}>
                            {/* Print-only header */}
                            <Box className="print-no-break" sx={{ display: 'none', '@media print': { display: 'block' }, mb: 3, pb: 2, borderBottom: `3px solid ${PRIMARY}` }}>
                                <Typography sx={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', color: PRIMARY, mb: 1 }}>
                                    SCHOOLMATE
                                </Typography>
                                <Typography sx={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', mb: 2 }}>
                                    SALARY SLIP
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{selectedEmployee.name}</Typography>
                                        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>{selectedEmployee.rollNumber} • {selectedEmployee.designation}</Typography>
                                        <Typography sx={{ fontSize: '12px', color: '#64748B', textTransform: 'capitalize' }}>{selectedEmployee.department}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>Payment Date: {selectedEmployee.paymentDate}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Employee Info */}
                            <Card className="print-no-break" sx={{ mb: 2, bgcolor: '#F8FAFC', boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>Employee Name</Typography>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{selectedEmployee.name}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>Roll Number</Typography>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{selectedEmployee.rollNumber}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>Designation</Typography>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{selectedEmployee.designation}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#64748B', mb: 0.5 }}>Department</Typography>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{selectedEmployee.department}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* Salary Breakdown */}
                            <Card className="print-no-break" sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                                        <Typography sx={{ fontSize: '13px', color: '#64748B' }}>Basic Salary</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>₹{selectedEmployee.basicSalary.toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                                        <Typography sx={{ fontSize: '13px', color: '#64748B' }}>Gross Salary</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>₹{selectedEmployee.grossSalary.toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                                        <Typography sx={{ fontSize: '13px', color: '#64748B' }}>Total Deductions</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>₹{selectedEmployee.deductions.toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                                        <Typography sx={{ fontSize: '13px', color: '#64748B' }}>Payment Date</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{selectedEmployee.paymentDate}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Net Salary */}
                            <Card className="print-no-break" sx={{ bgcolor: PRIMARY_LIGHT, boxShadow: 'none', border: `2px solid ${PRIMARY}` }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '12px', color: '#64748B', mb: 0.5 }}>
                                                Net Salary (Take Home)
                                            </Typography>
                                            <Typography sx={{ fontSize: '24px', fontWeight: 700, color: PRIMARY }}>
                                                ₹{selectedEmployee.netSalary.toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label="Bank Transfer"
                                            sx={{ bgcolor: PRIMARY, color: '#fff', fontWeight: 600, fontSize: '12px' }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions className="print-hide" sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}
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
