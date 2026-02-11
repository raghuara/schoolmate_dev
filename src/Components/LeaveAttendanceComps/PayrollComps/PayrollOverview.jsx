import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton, InputAdornment,
    MenuItem, Select, FormControl, Grid, TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { useNavigate } from 'react-router-dom';

// Mock payroll data for staff
const initialStaffPayroll = [
    {
        id: 'EMP001',
        name: 'Rajesh Kumar',
        designation: 'Senior Teacher',
        department: 'Mathematics',
        salaryType: 'Monthly',
        basicSalary: 35000,
        grossSalary: 52500,
        totalDeductions: 8750,
        netSalary: 43750,
        status: 'Processed'
    },
    {
        id: 'EMP002',
        name: 'Priya Sharma',
        designation: 'Teacher',
        department: 'Science',
        salaryType: 'Monthly',
        basicSalary: 30000,
        grossSalary: 45000,
        totalDeductions: 7200,
        netSalary: 37800,
        status: 'Processed'
    },
    {
        id: 'EMP003',
        name: 'Amit Patel',
        designation: 'Lab Assistant',
        department: 'Science',
        salaryType: 'Monthly',
        basicSalary: 18000,
        grossSalary: 27000,
        totalDeductions: 4350,
        netSalary: 22650,
        status: 'Pending'
    },
    {
        id: 'EMP004',
        name: 'Sunita Verma',
        designation: 'Admin Officer',
        department: 'Administration',
        salaryType: 'Monthly',
        basicSalary: 28000,
        grossSalary: 42000,
        totalDeductions: 6800,
        netSalary: 35200,
        status: 'Processed'
    },
    {
        id: 'EMP005',
        name: 'Mohammed Ali',
        designation: 'Physical Education Teacher',
        department: 'Sports',
        salaryType: 'Monthly',
        basicSalary: 25000,
        grossSalary: 37500,
        totalDeductions: 5900,
        netSalary: 31600,
        status: 'Pending'
    },
    {
        id: 'EMP006',
        name: 'Kavitha Nair',
        designation: 'Librarian',
        department: 'Library',
        salaryType: 'Monthly',
        basicSalary: 22000,
        grossSalary: 33000,
        totalDeductions: 5100,
        netSalary: 27900,
        status: 'Processed'
    },
];

const departments = ['All', 'Mathematics', 'Science', 'English', 'Administration', 'Sports', 'Library', 'Computer Science'];

export default function PayrollOverview() {
    const navigate = useNavigate();
    const [staffPayroll] = useState(initialStaffPayroll);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filter staff based on search and filters
    const filteredStaff = staffPayroll.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.designation.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = departmentFilter === 'All' || staff.department === departmentFilter;
        const matchesStatus = statusFilter === 'All' || staff.status === statusFilter;
        return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Calculate summary stats
    const totalStaff = staffPayroll.length;
    const processedCount = staffPayroll.filter(s => s.status === 'Processed').length;
    const pendingCount = staffPayroll.filter(s => s.status === 'Pending').length;
    const totalPayout = staffPayroll.reduce((sum, s) => sum + s.netSalary, 0);

    const stats = [
        { label: 'Total Staff', value: totalStaff, color: '#60A5FA', bgColor: '#F0F9FF', icon: PeopleOutlineIcon },
        { label: 'Processed', value: processedCount, color: '#34D399', bgColor: '#F0FDF4', icon: CheckCircleOutlineIcon },
        { label: 'Pending', value: pendingCount, color: '#FBBF24', bgColor: '#FFFBEB', icon: PendingActionsIcon },
        { label: 'Total Payout', value: `₹${totalPayout.toLocaleString('en-IN')}`, color: '#A78BFA', bgColor: '#FAF5FF', icon: AccountBalanceWalletOutlinedIcon },
    ];

    // Existing employee IDs to prevent duplicate additions
    const existingEmployeeIds = staffPayroll.map(s => s.id);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
            {/* Stats Cards */}
            <Grid container spacing={2}>
                {stats.map((stat, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <Box sx={{
                            bgcolor: '#fff',
                            border: '1px solid #E8E8E8',
                            borderRadius: '12px',
                            p: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                borderColor: stat.color,
                            }
                        }}>
                            <Box sx={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                bgcolor: stat.bgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${stat.color}20`,
                            }}>
                                <stat.icon sx={{ color: stat.color, fontSize: '24px' }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {stat.label}
                                </Typography>
                                <Typography sx={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', mt: 0.3 }}>
                                    {stat.value}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* Search, Filters & Add Button */}
            <Box sx={{
                bgcolor: '#fff',
                border: '1px solid #E8E8E8',
                borderRadius: '12px',
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search by name, ID, or designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: '20px', color: '#94A3B8' }} />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{
                            minWidth: '280px',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                fontSize: '13px',
                                bgcolor: '#FAFAFA',
                                '&:hover': {
                                    bgcolor: '#fff',
                                },
                                '&.Mui-focused': {
                                    bgcolor: '#fff',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#60A5FA',
                                        borderWidth: '2px',
                                    }
                                }
                            }
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            sx={{
                                borderRadius: '10px',
                                fontSize: '13px',
                                bgcolor: '#FAFAFA',
                                '&:hover': {
                                    bgcolor: '#fff',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#60A5FA',
                                    borderWidth: '2px',
                                }
                            }}
                        >
                            {departments.map(dept => (
                                <MenuItem key={dept} value={dept} sx={{ fontSize: '13px' }}>
                                    {dept === 'All' ? 'All Departments' : dept}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{
                                borderRadius: '10px',
                                fontSize: '13px',
                                bgcolor: '#FAFAFA',
                                '&:hover': {
                                    bgcolor: '#fff',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#60A5FA',
                                    borderWidth: '2px',
                                }
                            }}
                        >
                            <MenuItem value="All" sx={{ fontSize: '13px' }}>All Status</MenuItem>
                            <MenuItem value="Processed" sx={{ fontSize: '13px' }}>Processed</MenuItem>
                            <MenuItem value="Pending" sx={{ fontSize: '13px' }}>Pending</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/dashboardmenu/Leave/payroll-form', {
                        state: { mode: 'add', existingEmployeeIds, moduleTab: 1 }
                    })}
                    sx={{
                        textTransform: 'none',
                        bgcolor: '#60A5FA',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        px: 3,
                        py: 1,
                        boxShadow: '0 2px 8px rgba(96,165,250,0.2)',
                        '&:hover': {
                            bgcolor: '#3B82F6',
                            boxShadow: '0 4px 12px rgba(96,165,250,0.3)',
                            transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Add Staff Payroll
                </Button>
            </Box>

            {/* Staff Payroll Table */}
            <Box sx={{
                bgcolor: '#fff',
                border: '1px solid #E8E8E8',
                borderRadius: '12px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
                <TableContainer sx={{ flex: 1 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {['Employee ID', 'Name & Designation', 'Department', 'Salary Type', 'Basic Salary', 'Gross Salary', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(header => (
                                    <TableCell
                                        key={header}
                                        sx={{
                                            fontWeight: '700',
                                            fontSize: '11px',
                                            color: '#64748B',
                                            bgcolor: '#FAFAFA',
                                            borderBottom: '2px solid #E8E8E8',
                                            whiteSpace: 'nowrap',
                                            py: 2,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 8, borderBottom: 'none' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <PeopleOutlineIcon sx={{ fontSize: '48px', color: '#CBD5E1' }} />
                                            <Typography sx={{ fontSize: '14px', color: '#94A3B8', fontWeight: '500' }}>
                                                No staff payroll records found
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#CBD5E1' }}>
                                                Try adjusting your search or filters
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((staff, index) => (
                                        <TableRow
                                            key={staff.id}
                                            sx={{
                                                borderBottom: '1px solid #F1F5F9',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    bgcolor: '#F8FAFC',
                                                    transform: 'scale(1.001)',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                },
                                                '&:last-child': {
                                                    borderBottom: 'none',
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ fontSize: '13px', fontWeight: '600', color: '#60A5FA', py: 2 }}>
                                                {staff.id}
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                    {staff.name}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#94A3B8', mt: 0.3 }}>
                                                    {staff.designation}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '13px', color: '#475569', fontWeight: '500', py: 2 }}>
                                                {staff.department}
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <Chip
                                                    label={staff.salaryType}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#F0F9FF',
                                                        color: '#60A5FA',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        borderRadius: '6px',
                                                        height: '24px',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '13px', fontWeight: '600', color: '#334155', py: 2 }}>
                                                ₹{staff.basicSalary.toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '13px', fontWeight: '600', color: '#334155', py: 2 }}>
                                                ₹{staff.grossSalary.toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '13px', fontWeight: '600', color: '#DC2626', py: 2 }}>
                                                -₹{staff.totalDeductions.toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '14px', fontWeight: '700', color: '#16A34A', py: 2 }}>
                                                ₹{staff.netSalary.toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <Chip
                                                    label={staff.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: staff.status === 'Processed' ? '#DCFCE7' : '#FEF3C7',
                                                        color: staff.status === 'Processed' ? '#16A34A' : '#D97706',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        borderRadius: '6px',
                                                        height: '24px',
                                                        border: staff.status === 'Processed' ? '1px solid #BBF7D0' : '1px solid #FEF08A',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate('/dashboardmenu/Leave/payroll-form', {
                                                        state: { mode: 'edit', staffData: staff, existingEmployeeIds, moduleTab: 1 }
                                                    })}
                                                    sx={{
                                                        color: '#60A5FA',
                                                        bgcolor: '#F0F9FF',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            bgcolor: '#E0F2FE',
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    <EditOutlinedIcon sx={{ fontSize: '16px' }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredStaff.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                    sx={{
                        borderTop: '2px solid #F1F5F9',
                        bgcolor: '#FAFAFA',
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '12px',
                            color: '#64748B',
                            fontWeight: '500',
                        },
                        '& .MuiSelect-select': {
                            fontSize: '12px',
                            fontWeight: '500',
                        }
                    }}
                />
            </Box>
        </Box>
    );
}
