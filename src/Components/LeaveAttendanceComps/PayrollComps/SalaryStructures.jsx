import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Grid, IconButton, Divider,
    MenuItem, Select, FormControl, InputLabel, Card, CardContent,
    Table, TableBody, TableCell, TableHead, TableRow, Chip, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';
import SnackBar from '../../SnackBar';

// Color theme
const PRIMARY = '#8600BB';
const PRIMARY_LIGHT = '#f9f4fc';
const PRIMARY_DARK = '#6B0094';
const CARD_RADIUS = '12px';

// Mock data for salary structures
const mockSalaryStructures = [
    {
        id: 1,
        name: 'Teaching Staff - Senior',
        grade: 'Grade A',
        basicSalary: 45000,
        hra: 40,
        da: 10,
        conveyance: 1600,
        specialAllowance: 5000,
        totalEarnings: 70500,
        status: 'Active',
        employeeCount: 12
    },
    {
        id: 2,
        name: 'Teaching Staff - Junior',
        grade: 'Grade B',
        basicSalary: 30000,
        hra: 40,
        da: 10,
        conveyance: 1600,
        specialAllowance: 2000,
        totalEarnings: 48600,
        status: 'Active',
        employeeCount: 25
    },
    {
        id: 3,
        name: 'Administrative Staff',
        grade: 'Grade C',
        basicSalary: 25000,
        hra: 40,
        da: 10,
        conveyance: 1600,
        specialAllowance: 0,
        totalEarnings: 38600,
        status: 'Active',
        employeeCount: 8
    },
];

const gradesList = ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E'];

export default function SalaryStructures() {
    const navigate = useNavigate();
    const [structures, setStructures] = useState(mockSalaryStructures);
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

    const [formData, setFormData] = useState({
        name: '',
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
                grade: structure.grade,
                basicSalary: structure.basicSalary,
                hra: structure.hra,
                da: structure.da,
                conveyance: structure.conveyance,
                specialAllowance: structure.specialAllowance,
            });
        } else {
            setEditMode(false);
            setSelectedStructure(null);
            setFormData({
                name: '',
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
    };

    const handleSave = () => {
        if (!formData.name || !formData.grade || !formData.basicSalary) {
            showSnack('Please fill all required fields', false);
            return;
        }

        const newStructure = {
            id: editMode ? selectedStructure.id : structures.length + 1,
            ...formData,
            basicSalary: Number(formData.basicSalary),
            hra: Number(formData.hra),
            da: Number(formData.da),
            conveyance: Number(formData.conveyance),
            specialAllowance: Number(formData.specialAllowance),
            totalEarnings: calculateTotal(),
            status: 'Active',
            employeeCount: editMode ? selectedStructure.employeeCount : 0
        };

        if (editMode) {
            setStructures(structures.map(s => s.id === selectedStructure.id ? newStructure : s));
            showSnack('Salary structure updated successfully!', true);
        } else {
            setStructures([...structures, newStructure]);
            showSnack('Salary structure created successfully!', true);
        }

        handleCloseDialog();
    };

    const handleDelete = (id) => {
        setStructures(structures.filter(s => s.id !== id));
        showSnack('Salary structure deleted successfully!', true);
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

            {/* Statistics Cards */}
            <Box sx={{ p: 2.5 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                        <Card sx={{
                            border: '1px solid #8600BB30',
                            borderRadius: CARD_RADIUS,
                            bgcolor: PRIMARY_LIGHT,
                            boxShadow: 'none'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '12px', color: PRIMARY, fontWeight: 600, mb: 1 }}>
                                            Total Structures
                                        </Typography>
                                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {structures.length}
                                        </Typography>
                                    </Box>
                                    <AssignmentIcon sx={{ fontSize: 32, color: PRIMARY, opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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
                                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
                                            {structures.reduce((sum, s) => sum + s.employeeCount, 0)}
                                        </Typography>
                                    </Box>
                                    <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#3B82F6', opacity: 0.6 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Structures Table */}
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
                        <AssignmentIcon sx={{ fontSize: 20, color: PRIMARY }} />
                        <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                            All Salary Structures
                        </Typography>
                    </Box>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Structure Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Grade</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Basic Salary</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>HRA</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>DA</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Total Earnings</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Employees</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#64748B' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {structures.map((structure) => (
                                <TableRow key={structure.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: PRIMARY_LIGHT, color: PRIMARY }}>
                                                {structure.name.charAt(0)}
                                            </Avatar>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                {structure.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={structure.grade} size="small" sx={{
                                            bgcolor: `${PRIMARY}20`,
                                            color: PRIMARY,
                                            fontWeight: 600,
                                            fontSize: '11px'
                                        }} />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                                        ₹{structure.basicSalary.toLocaleString()}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '13px' }}>
                                        {structure.hra}%
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '13px' }}>
                                        {structure.da}%
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '14px', fontWeight: 700, color: '#16A34A' }}>
                                        ₹{structure.totalEarnings.toLocaleString()}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                                        {structure.employeeCount}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton size="small" onClick={() => handleOpenDialog(structure)}>
                                                <EditIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(structure.id)}>
                                                <DeleteIcon sx={{ fontSize: 18, color: '#EF4444' }} />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </Box>

            {/* Create/Edit Dialog */}
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
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                label="Structure Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                size="small"
                                fullWidth
                                required
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel shrink={!!formData.grade}>Grade</InputLabel>
                                <Select
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    label="Grade"
                                    notched={!!formData.grade}
                                    sx={fieldSx}
                                >
                                    {gradesList.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                                </Select>
                            </FormControl>
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
                        sx={{
                            textTransform: 'none',
                            bgcolor: PRIMARY,
                            '&:hover': { bgcolor: PRIMARY_DARK }
                        }}
                    >
                        {editMode ? 'Update' : 'Create'} Structure
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
        </>
    );
}
