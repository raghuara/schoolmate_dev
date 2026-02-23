import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Grid, IconButton, Divider,
    Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, InputAdornment, Dialog, DialogTitle,
    DialogContent, DialogActions, Avatar, Autocomplete
} from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import SnackBar from '../../SnackBar';
import {
    getEmployees, postSalaryStructure, salaryStructureDashboard,
    updateSalaryStructureByRollnumber, deleteSalaryStructureByRollnumber,
} from '../../../Api/Api';

const PRIMARY = '#8600BB';
const PRIMARY_LIGHT = '#f9f4fc';
const PRIMARY_DARK = '#6B0094';
const CARD_RADIUS = '12px';

export default function SalaryStructures() {
    const navigate = useNavigate();
    const token = "123"
    const [structures, setStructures] = useState([]);
    const [kpiData, setKpiData] = useState({ totalStructures: 0, totalEmployees: 0 });
    const [openDialog, setOpenDialog] = useState(false);

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true); setSnackColor(success); setSnackStatus(success);
    };
    const [editMode, setEditMode] = useState(false);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [employeesData, setEmployeesData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [structureToDelete, setStructureToDelete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        employeeRollNumber: '',
        grade: '',
        basicSalary: '',
        hra: 40,
        da: 10,
        conveyance: 1600,
        specialAllowance: 0,
    });

    const calculateTotal = () => {
        const basic = Number(formData.basicSalary) || 0;
        const hra = Math.round(basic * (Number(formData.hra) || 0) / 100);
        const da = Math.round(basic * (Number(formData.da) || 0) / 100);
        const conveyance = Number(formData.conveyance) || 0;
        const special = Number(formData.specialAllowance) || 0;
        return basic + hra + da + conveyance + special;
    };

    const handleOpenDialog = (structure = null) => {
        if (structure) {
            setEditMode(true);
            setSelectedStructure(structure);
            setFormData({
                name: structure.name,
                employeeRollNumber: structure.rollNumber || structure.employeeRollNumber || '',
                grade: structure.grade || '',
                basicSalary: structure.basicSalary,
                hra: structure.hraPercent ?? structure.hra ?? 40,
                da: structure.daPercent ?? structure.da ?? 10,
                conveyance: structure.conveyanceAllowance ?? structure.conveyance ?? 1600,
                specialAllowance: structure.specialAllowance ?? 0,
            });
            const rollNo = structure.rollNumber || structure.employeeRollNumber;
            const emp = employeesData.find(e => e.rollNumber === rollNo);
            setSelectedEmp(emp || null);
        } else {
            setEditMode(false);
            setSelectedStructure(null);
            setSelectedEmp(null);
            setFormData({
                name: '',
                employeeRollNumber: '',
                grade: '',
                basicSalary: '',
                hra: 40,
                da: 10,
                conveyance: 1600,
                specialAllowance: 0,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditMode(false);
        setSelectedStructure(null);
        setSelectedEmp(null);
    };

    useEffect(() => {
        fetchEmployeeData();
        fetchDashboard();
    }, []);

    const fetchEmployeeData = async () => {
        try {
            const res = await axios.get(getEmployees, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployeesData(res.data.data);
        } catch {
        }
    };

    const fetchDashboard = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const res = await axios.get(salaryStructureDashboard, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data && !res.data.error) {
                const { totalStructures, totalEmployees, salaryStructures } = res.data.data;
                setKpiData({ totalStructures, totalEmployees });
                setStructures(salaryStructures || []);
            } else {
                showSnack('Failed to load salary structures', false);
            }
        } catch {
            showSnack('Failed to load salary structures', false);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.employeeRollNumber || !formData.basicSalary) {
            showSnack('Please select an employee and enter basic salary', false);
            return;
        }

        const total = calculateTotal();

        if (editMode) {
            const rollNo = selectedStructure.rollNumber || selectedStructure.employeeRollNumber;
            const body = {
                rollNumber:          rollNo,
                basicSalary:         Number(formData.basicSalary),
                hraPercent:          Number(formData.hra),
                daPercent:           Number(formData.da),
                conveyanceAllowance: String(formData.conveyance),
                specialAllowance:    String(formData.specialAllowance),
                totalEarnings:       total,
            };

            setIsSaving(true);
            try {
                const res = await axios.put(updateSalaryStructureByRollnumber, body, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data && !res.data.error) {
                    await fetchDashboard();
                    showSnack('Salary structure updated successfully!', true);
                    handleCloseDialog();
                } else {
                    showSnack(res.data?.message || 'Failed to update salary structure', false);
                }
            } catch {
                showSnack('Failed to update salary structure. Please try again.', false);
            } finally {
                setIsSaving(false);
            }
            return;
        }

        const body = {
            rollNumber:           formData.employeeRollNumber,
            basicSalary:          Number(formData.basicSalary),
            hraPercent:           Number(formData.hra),
            daPercent:            Number(formData.da),
            conveyanceAllowance:  String(formData.conveyance),
            specialAllowance:     String(formData.specialAllowance),
            totalEarnings:        total,
        };

        setIsSaving(true);
        try {
            const res = await axios.post(postSalaryStructure, body, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data && !res.data.error) {
                await fetchDashboard();
                showSnack('Salary structure created successfully!', true);
                handleCloseDialog();
            } else {
                showSnack(res.data?.message || 'Failed to create salary structure', false);
            }
        } catch {
            showSnack('Failed to create salary structure. Please try again.', false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (structure) => {
        const rollNo = structure.rollNumber || structure.employeeRollNumber;
        if (!rollNo) {
            showSnack('Cannot delete: roll number not found', false);
            return;
        }
        try {
            const res = await axios.delete(deleteSalaryStructureByRollnumber, {
                headers: { Authorization: `Bearer ${token}` },
                params: { rollNumber: rollNo },
            });

            if (res.data && !res.data.error) {
                setStructures(prev => prev.filter(s => s.id !== structure.id));
                setKpiData(prev => ({
                    ...prev,
                    totalStructures: Math.max(0, prev.totalStructures - 1),
                }));
                showSnack('Salary structure deleted successfully!', true);
                fetchDashboard(true);
            } else {
                showSnack(res.data?.message || 'Failed to delete salary structure', false);
            }
        } catch {
            showSnack('Failed to delete salary structure. Please try again.', false);
        }
    };

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            fontSize: '13px',
            bgcolor: '#FAFAFA',
            '&:hover': { bgcolor: '#fff' },
            '&.Mui-focused': { bgcolor: '#fff' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY, borderWidth: '2px' },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: PRIMARY },
    };

    return (
        <>
        <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FAFAFA',
            borderRadius: '20px',
            border: '1px solid #E8E8E8',
            overflow: 'hidden'
        }}>
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
                            Salary Structures
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3 }}>
                            Configure salary components and grades
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        textTransform: 'none',
                        bgcolor: PRIMARY,
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '700',
                        px: 3,
                        '&:hover': { bgcolor: PRIMARY_DARK }
                    }}
                >
                    Create New Structure
                </Button>
            </Box>

            <Divider />

            <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <Card sx={{ border: '1px solid #8600BB30', borderRadius: CARD_RADIUS, bgcolor: PRIMARY_LIGHT, boxShadow: 'none' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: PRIMARY, fontWeight: 600, mb: 1 }}>
                                            Total Structures
                                        </Typography>
                                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {kpiData.totalStructures}
                                        </Typography>
                                    </Box>
                                    <AssignmentIcon sx={{ fontSize: 32, color: PRIMARY, opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <Card sx={{ border: '1px solid #3B82F630', borderRadius: CARD_RADIUS, bgcolor: '#EFF6FF', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600, mb: 1 }}>
                                            Total Employees
                                        </Typography>
                                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {kpiData.totalEmployees}
                                        </Typography>
                                    </Box>
                                    <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#3B82F6', opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Card sx={{ border: '1px solid #E8E8E8', borderRadius: CARD_RADIUS, boxShadow: 'none' }}>
                    <Box sx={{
                        px: 2.5, py: 1.8,
                        borderBottom: '2px solid #F1F5F9',
                        bgcolor: '#FAFAFA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <AssignmentIcon sx={{ fontSize: 20, color: PRIMARY }} />
                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
                                All Salary Structures
                            </Typography>
                            <Chip
                                label={structures.length}
                                size="small"
                                sx={{ bgcolor: `${PRIMARY}18`, color: PRIMARY, fontWeight: 700, fontSize: '11px', height: '22px' }}
                            />
                        </Box>
                        <TextField
                            size="small"
                            placeholder="Search by name or roll number..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: filterText ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setFilterText('')}>
                                                <ClearIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                }
                            }}
                            sx={{
                                width: { xs: '100%', sm: '280px' },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    bgcolor: '#fff',
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY },
                                },
                            }}
                        />
                    </Box>

                    <TableContainer sx={{ maxHeight: '47vh' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {[
                                        'Employee', 'Roll No.', 'Basic Salary',
                                        'HRA %', 'DA %', 'Conveyance', 'Special Allow.',
                                        'Gross Salary', 'Actions'
                                    ].map((header) => (
                                        <TableCell
                                            key={header}
                                            sx={{
                                                fontWeight: 700, fontSize: '11px',
                                                color: '#64748B', bgcolor: '#F8FAFC',
                                                whiteSpace: 'nowrap', py: 1.5,
                                                borderBottom: '2px solid #E2E8F0',
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 5, color: '#94A3B8', fontSize: '13px' }}>
                                            Loading salary structures...
                                        </TableCell>
                                    </TableRow>
                                ) : (() => {
                                    const q = filterText.toLowerCase().trim();
                                    const filtered = q
                                        ? structures.filter(s =>
                                            (s.name || '').toLowerCase().includes(q) ||
                                            (s.rollNumber || s.employeeRollNumber || '').toLowerCase().includes(q)
                                        )
                                        : structures;

                                    if (filtered.length === 0) {
                                        return (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center" sx={{ py: 5, color: '#94A3B8', fontSize: '13px' }}>
                                                    {q ? `No results for "${filterText}"` : 'No salary structures found'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    return filtered.map((structure) => {
                                        const basic      = Number(structure.basicSalary) || 0;
                                        const hraP       = structure.hraPercent ?? structure.hra ?? 0;
                                        const daP        = structure.daPercent  ?? structure.da  ?? 0;
                                        const conveyance = Number(structure.conveyanceAllowance ?? structure.conveyance) || 0;
                                        const special    = Number(structure.specialAllowance) || 0;
                                        const hraAmt     = Math.round(basic * hraP / 100);
                                        const daAmt      = Math.round(basic * daP  / 100);
                                        const gross      = structure.totalEarnings
                                            ? Number(structure.totalEarnings)
                                            : basic + hraAmt + daAmt + conveyance + special;

                                        return (
                                            <TableRow key={structure.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                                <TableCell sx={{ py: 1.2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: PRIMARY_LIGHT, color: PRIMARY, fontSize: '12px', fontWeight: 700 }}>
                                                            {(structure.name || '?').charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                                                            {structure.name || '—'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.2 }}>
                                                    <Chip
                                                        label={structure.rollNumber || structure.employeeRollNumber || '—'}
                                                        size="small"
                                                        sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, fontSize: '11px' }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', py: 1.2 }}>
                                                    ₹{basic.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ py: 1.2 }}>
                                                    <Chip
                                                        label={`${hraP}%`}
                                                        size="small"
                                                        sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', fontWeight: 600, fontSize: '11px' }}
                                                    />
                                                    <Typography sx={{ fontSize: '10px', color: '#94A3B8', mt: 0.3 }}>
                                                        ₹{hraAmt.toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.2 }}>
                                                    <Chip
                                                        label={`${daP}%`}
                                                        size="small"
                                                        sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 600, fontSize: '11px' }}
                                                    />
                                                    <Typography sx={{ fontSize: '10px', color: '#94A3B8', mt: 0.3 }}>
                                                        ₹{daAmt.toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', color: '#374151', py: 1.2 }}>
                                                    ₹{conveyance.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '13px', color: '#374151', py: 1.2 }}>
                                                    ₹{special.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ py: 1.2 }}>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#16A34A' }}>
                                                        ₹{gross.toLocaleString()}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '9px', color: '#94A3B8', mt: 0.2 }}>
                                                        Basic+HRA+DA+Conv+Spl
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.2 }}>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <IconButton size="small" onClick={() => handleOpenDialog(structure)}
                                                            sx={{ bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' }, borderRadius: '8px' }}>
                                                            <EditIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => { setStructureToDelete(structure); setDeleteConfirmOpen(true); }}
                                                            sx={{ bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' }, borderRadius: '8px' }}>
                                                            <DeleteIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    });
                                })()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AssignmentIcon sx={{ color: PRIMARY }} />
                        <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>
                            {editMode ? 'Edit Salary Structure' : 'Create New Salary Structure'}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2.5} sx={{ mt: 2}}>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <Autocomplete
                                options={employeesData}
                                getOptionLabel={(option) => `${option.rollNumber} - ${option.name}`}
                                value={selectedEmp}
                                disabled={editMode}
                                onChange={(_, newVal) => {
                                    setSelectedEmp(newVal);
                                    setFormData(prev => ({
                                        ...prev,
                                        name: newVal ? `${newVal.rollNumber} - ${newVal.name}` : '',
                                        employeeRollNumber: newVal ? newVal.rollNumber : '',
                                    }));
                                }}
                                isOptionEqualToValue={(option, value) => option.rollNumber === value.rollNumber}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Employee *"
                                        size="small"
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        sx={fieldSx}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                label="Basic Salary"
                                value={formData.basicSalary}
                                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                                size="small"
                                fullWidth
                                required
                                type="number"
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: {
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                    }
                                }}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                label="HRA %"
                                value={formData.hra}
                                onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                                size="small"
                                fullWidth
                                type="number"
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: {
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                                    }
                                }}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                label="DA %"
                                value={formData.da}
                                onChange={(e) => setFormData({ ...formData, da: e.target.value })}
                                size="small"
                                fullWidth
                                type="number"
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: {
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                                    }
                                }}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                label="Conveyance Allowance"
                                value={formData.conveyance}
                                onChange={(e) => setFormData({ ...formData, conveyance: e.target.value })}
                                size="small"
                                fullWidth
                                type="number"
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: {
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                    }
                                }}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                label="Special Allowance"
                                value={formData.specialAllowance}
                                onChange={(e) => setFormData({ ...formData, specialAllowance: e.target.value })}
                                size="small"
                                fullWidth
                                type="number"
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: {
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                    }
                                }}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{
                                p: 2,
                                bgcolor: '#F0FDF4',
                                borderRadius: '12px',
                                border: '1px solid #BBF7D0'
                            }}>
                                <Typography sx={{ fontSize: '12px', color: '#15803D', fontWeight: 600, mb: 1 }}>
                                    ESTIMATED TOTAL EARNINGS
                                </Typography>
                                <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#16A34A' }}>
                                    ₹{calculateTotal().toLocaleString()}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveOutlinedIcon />}
                        onClick={handleSave}
                        disabled={isSaving}
                        sx={{
                            textTransform: 'none',
                            bgcolor: PRIMARY,
                            '&:hover': { bgcolor: PRIMARY_DARK }
                        }}
                    >
                        {isSaving ? 'Saving...' : `${editMode ? 'Update' : 'Create'} Structure`}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>

        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
            <DialogContent sx={{ pt: 4, pb: 2, textAlign: 'center' }}>
                <Box sx={{
                    width: 64, height: 64, borderRadius: '50%',
                    bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', mx: 'auto', mb: 2
                }}>
                    <WarningAmberIcon sx={{ fontSize: 36, color: '#EF4444' }} />
                </Box>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                    Delete Salary Structure?
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                    Are you sure you want to delete the salary structure for{' '}
                    <strong>{structureToDelete?.name || 'this employee'}</strong>?
                    This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    fullWidth
                    onClick={() => { setDeleteConfirmOpen(false); setStructureToDelete(null); }}
                    sx={{
                        textTransform: 'none', borderRadius: '10px',
                        border: '1px solid #E2E8F0', color: '#475569',
                        '&:hover': { bgcolor: '#F8FAFC' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                        setDeleteConfirmOpen(false);
                        handleDelete(structureToDelete);
                        setStructureToDelete(null);
                    }}
                    sx={{
                        textTransform: 'none', borderRadius: '10px',
                        bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }
                    }}
                >
                    Yes, Delete
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
}
