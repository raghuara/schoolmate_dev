import React, { useState } from 'react';
import {
    Box, Typography, Button, Grid, IconButton, Divider,
    Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Switch, FormControlLabel, FormControl,
    InputLabel, Select, Checkbox, ListItemText, OutlinedInput,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { useNavigate } from 'react-router-dom';
import SnackBar from '../../SnackBar';

const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#ECFDF5';
const PRIMARY_DARK = '#047857';
const CARD_RADIUS = '12px';

const STAFF_CATEGORIES = ['All Staff', 'Teaching Staff', 'Non-Teaching Staff', 'Supporting Staff', 'Admin Staff'];
const RESET_PERIODS = ['Monthly', 'Quarterly', 'Yearly'];

const LEAVE_COLORS = [
    '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4',
    '#10B981', '#F59E0B', '#6B7280', '#FF6B35', '#059669',
];

// Default leave policies — replace with API data in production
const defaultPolicies = [
    {
        id: 1,
        name: 'Casual Leave',
        shortCode: 'CL',
        daysPerYear: 12,
        isPaid: true,
        carryForward: false,
        carryForwardLimit: 0,
        applicableTo: ['All Staff'],
        affectsLOP: true,
        resetPeriod: 'Yearly',
        color: '#3B82F6',
        description: 'For personal work and casual / urgent purposes',
    },
    {
        id: 2,
        name: 'Sick Leave',
        shortCode: 'SL',
        daysPerYear: 12,
        isPaid: true,
        carryForward: false,
        carryForwardLimit: 0,
        applicableTo: ['All Staff'],
        affectsLOP: false,
        resetPeriod: 'Yearly',
        color: '#EF4444',
        description: 'For medical reasons and health-related absences',
    },
    {
        id: 3,
        name: 'Privilege Leave',
        shortCode: 'PL',
        daysPerYear: 15,
        isPaid: true,
        carryForward: true,
        carryForwardLimit: 30,
        applicableTo: ['Teaching Staff', 'Admin Staff'],
        affectsLOP: true,
        resetPeriod: 'Yearly',
        color: '#8B5CF6',
        description: 'Earned leave accrued based on length of service',
    },
    {
        id: 4,
        name: 'Maternity Leave',
        shortCode: 'ML',
        daysPerYear: 182,
        isPaid: true,
        carryForward: false,
        carryForwardLimit: 0,
        applicableTo: ['Teaching Staff', 'Non-Teaching Staff', 'Supporting Staff', 'Admin Staff'],
        affectsLOP: false,
        resetPeriod: 'Yearly',
        color: '#EC4899',
        description: 'For female employees during the period of maternity',
    },
    {
        id: 5,
        name: 'Paternity Leave',
        shortCode: 'PtL',
        daysPerYear: 15,
        isPaid: true,
        carryForward: false,
        carryForwardLimit: 0,
        applicableTo: ['All Staff'],
        affectsLOP: false,
        resetPeriod: 'Yearly',
        color: '#06B6D4',
        description: 'For male employees on the birth / adoption of a child',
    },
    {
        id: 6,
        name: 'Leave Without Pay',
        shortCode: 'LWP',
        daysPerYear: 0,
        isPaid: false,
        carryForward: false,
        carryForwardLimit: 0,
        applicableTo: ['All Staff'],
        affectsLOP: true,
        resetPeriod: 'Yearly',
        color: '#6B7280',
        description: 'Unpaid leave sanctioned when all paid leaves are exhausted',
    },
];

const emptyForm = {
    name: '',
    shortCode: '',
    daysPerYear: 12,
    isPaid: true,
    carryForward: false,
    carryForwardLimit: 0,
    applicableTo: ['All Staff'],
    affectsLOP: true,
    resetPeriod: 'Yearly',
    color: '#3B82F6',
    description: '',
};

export default function LeavePolicy() {
    const navigate = useNavigate();
    const [policies, setPolicies] = useState(defaultPolicies);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // SnackBar state
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const showSnack = (msg, success) => {
        setMessage(msg); setOpen(true); setColor(success); setStatus(success);
    };

    // KPI derivations
    const paidCount = policies.filter(p => p.isPaid).length;
    const unpaidCount = policies.filter(p => !p.isPaid).length;
    const carryForwardCount = policies.filter(p => p.carryForward).length;
    const totalPaidDays = policies
        .filter(p => p.isPaid && p.daysPerYear > 0)
        .reduce((s, p) => s + p.daysPerYear, 0);

    const handleAdd = () => {
        setEditingPolicy(null);
        setForm({ ...emptyForm });
        setDialogOpen(true);
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setForm({ ...policy });
        setDialogOpen(true);
    };

    const handleDeleteClick = (policy) => {
        setDeleteTarget(policy);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        setPolicies(prev => prev.filter(p => p.id !== deleteTarget.id));
        showSnack(`"${deleteTarget.name}" deleted successfully.`, true);
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
    };

    const handleSave = () => {
        if (!form.name.trim() || !form.shortCode.trim()) {
            showSnack('Leave type name and short code are required.', false);
            return;
        }
        if (form.applicableTo.length === 0) {
            showSnack('Please select at least one applicable staff category.', false);
            return;
        }
        if (editingPolicy) {
            setPolicies(prev => prev.map(p => p.id === editingPolicy.id ? { ...form, id: p.id } : p));
            showSnack('Leave type updated successfully!', true);
        } else {
            const newId = Math.max(...policies.map(p => p.id), 0) + 1;
            setPolicies(prev => [...prev, { ...form, id: newId }]);
            showSnack('Leave type added successfully!', true);
        }
        setDialogOpen(false);
    };

    const ff = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    return (
        <>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <Box sx={{
                height: '86vh', display: 'flex', flexDirection: 'column',
                bgcolor: '#FAFAFA', borderRadius: '20px', border: '1px solid #E8E8E8', overflow: 'hidden',
            }}>
                {/* ── Header ── */}
                <Box sx={{
                    bgcolor: '#fff', borderBottom: '2px solid #F1F5F9',
                    px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{
                            width: 40, height: 40, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
                            '&:hover': { bgcolor: PRIMARY_LIGHT, borderColor: PRIMARY },
                        }}>
                            <ArrowBackIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <Box>
                            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a' }}>
                                Leave Policy Management
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3 }}>
                                Configure leave types, entitlements and salary-impact rules for all staff
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        sx={{
                            textTransform: 'none', bgcolor: PRIMARY, borderRadius: '10px',
                            fontSize: '13px', fontWeight: 700, '&:hover': { bgcolor: PRIMARY_DARK },
                        }}
                    >
                        Add Leave Type
                    </Button>
                </Box>

                <Divider />

                <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

                    {/* ── KPI Cards ── */}
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                        {[
                            { label: 'Total Leave Types', value: policies.length, color: PRIMARY, bg: PRIMARY_LIGHT },
                            { label: 'Total Paid Leave Days', value: `${totalPaidDays}d`, color: '#2563EB', bg: '#EFF6FF' },
                            { label: 'Carry-forward Types', value: carryForwardCount, color: '#F59E0B', bg: '#FFFBEB' },
                            { label: 'Unpaid Leave Types', value: unpaidCount, color: '#6B7280', bg: '#F9FAFB' },
                        ].map((card, i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <Card sx={{
                                    border: `1px solid ${card.color}30`,
                                    borderRadius: CARD_RADIUS, bgcolor: card.bg, boxShadow: 'none',
                                }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Typography sx={{ fontSize: 12, color: card.color, fontWeight: 600, mb: 0.8 }}>
                                            {card.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a' }}>
                                            {card.value}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* ── Salary Impact Info Banner ── */}
                    <Box sx={{
                        mb: 2.5, p: 2, borderRadius: '10px',
                        bgcolor: '#FFFBEB', border: '1px solid #FDE68A',
                        display: 'flex', alignItems: 'flex-start', gap: 1.5,
                    }}>
                        <InfoOutlinedIcon sx={{ fontSize: 18, color: '#F59E0B', mt: 0.2, flexShrink: 0 }} />
                        <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#92400E', mb: 0.4 }}>
                                How leave types affect salary calculation
                            </Typography>
                            <Typography sx={{ fontSize: 11.5, color: '#78350F', lineHeight: 1.6 }}>
                                <strong>Paid leave (within quota)</strong> — No salary deduction.&nbsp;
                                <strong>Excess paid leave with "Excess = LOP"</strong> — Deducted as Loss of Pay.&nbsp;
                                <strong>Unpaid leave (LWP)</strong> — Always deducted as LOP.&nbsp;
                                LOP deduction formula: <em>(LOP days ÷ Working days) × Gross Salary</em>.
                            </Typography>
                        </Box>
                    </Box>

                    {/* ── Leave Policy Cards ── */}
                    <Grid container spacing={2}>
                        {policies.map(policy => (
                            <Grid key={policy.id} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                <Card sx={{
                                    border: `1.5px solid ${policy.color}30`,
                                    borderRadius: CARD_RADIUS, boxShadow: 'none',
                                    transition: '0.25s',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: `0 6px 20px ${policy.color}20`,
                                    },
                                }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        {/* Card Header */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{
                                                    width: 46, height: 46, borderRadius: '10px',
                                                    bgcolor: policy.color + '1A',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 900, color: policy.color }}>
                                                        {policy.shortCode}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>
                                                        {policy.name}
                                                    </Typography>
                                                    <Chip
                                                        label={policy.isPaid ? 'Paid' : 'Unpaid'}
                                                        size="small"
                                                        sx={{
                                                            fontSize: 10, fontWeight: 700, height: 18, mt: 0.4,
                                                            bgcolor: policy.isPaid ? '#ECFDF5' : '#F9FAFB',
                                                            color: policy.isPaid ? '#059669' : '#6B7280',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 0.3, flexShrink: 0 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(policy)}
                                                    sx={{ '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                                                >
                                                    <EditIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteClick(policy)}
                                                    sx={{ '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        {policy.description && (
                                            <Typography sx={{ fontSize: 11, color: '#64748B', mb: 1.5, lineHeight: 1.5 }}>
                                                {policy.description}
                                            </Typography>
                                        )}

                                        <Divider sx={{ my: 1.5 }} />

                                        {/* Stats Grid */}
                                        <Grid container spacing={1}>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                                                    Days / Year
                                                </Typography>
                                                <Typography sx={{ fontSize: 18, fontWeight: 800, color: policy.color }}>
                                                    {policy.daysPerYear === 0 ? '∞' : policy.daysPerYear}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                                                    Reset Period
                                                </Typography>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                                    {policy.resetPeriod}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                                                    Carry Forward
                                                </Typography>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: policy.carryForward ? '#059669' : '#DC2626' }}>
                                                    {policy.carryForward ? `Yes (max ${policy.carryForwardLimit}d)` : 'No'}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                                                    Excess = LOP
                                                </Typography>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: policy.affectsLOP ? '#F59E0B' : '#94A3B8' }}>
                                                    {policy.affectsLOP ? 'Yes' : 'No'}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 1.5 }} />

                                        {/* Applicable to chips */}
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {policy.applicableTo.map(cat => (
                                                <Chip
                                                    key={cat}
                                                    label={cat}
                                                    size="small"
                                                    sx={{ fontSize: 10, height: 20, bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>

            {/* ══════════════════════════════════════
                ADD / EDIT DIALOG
            ══════════════════════════════════════ */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px' } }}
            >
                <DialogTitle sx={{ bgcolor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', py: 1.5, px: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BeachAccessIcon sx={{ fontSize: 20, color: PRIMARY }} />
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
                                {editingPolicy ? 'Edit Leave Type' : 'Add Leave Type'}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.2 }}>
                                Set entitlement, pay rules, and carry-forward policy
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ px: 2.5, pt: '20px !important', pb: 1 }}>
                    <Grid container spacing={2}>
                        {/* Name + Short Code */}
                        <Grid size={{ xs: 12, sm: 8, md: 8, lg: 8 }}>
                            <TextField
                                fullWidth
                                label="Leave Type Name *"
                                value={form.name}
                                onChange={e => ff('name', e.target.value)}
                                size="small"
                                placeholder="e.g., Sick Leave"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                            <TextField
                                fullWidth
                                label="Short Code *"
                                value={form.shortCode}
                                onChange={e => ff('shortCode', e.target.value.toUpperCase().slice(0, 5))}
                                size="small"
                                placeholder="e.g., SL"
                            />
                        </Grid>

                        {/* Days + Reset */}
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                fullWidth
                                label="Days Per Year *"
                                type="number"
                                value={form.daysPerYear}
                                onChange={e => ff('daysPerYear', Math.max(0, parseInt(e.target.value) || 0))}
                                size="small"
                                helperText="Set 0 for unlimited / on-demand"
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Reset Period"
                                value={form.resetPeriod}
                                onChange={e => ff('resetPeriod', e.target.value)}
                                size="small"
                            >
                                {RESET_PERIODS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                            </TextField>
                        </Grid>

                        {/* Applicable to — multi-select */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Applicable To</InputLabel>
                                <Select
                                    multiple
                                    value={form.applicableTo}
                                    onChange={e => ff('applicableTo', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                    input={<OutlinedInput label="Applicable To" />}
                                    renderValue={selected => selected.join(', ')}
                                >
                                    {STAFF_CATEGORIES.map(cat => (
                                        <MenuItem key={cat} value={cat}>
                                            <Checkbox checked={form.applicableTo.includes(cat)} size="small" />
                                            <ListItemText primary={cat} primaryTypographyProps={{ fontSize: 13 }} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Color picker */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 1 }}>
                                Color Tag
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {LEAVE_COLORS.map(c => (
                                    <Box
                                        key={c}
                                        onClick={() => ff('color', c)}
                                        sx={{
                                            width: 26, height: 26, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                                            border: form.color === c ? '3px solid #1a1a1a' : '3px solid transparent',
                                            transition: '0.15s',
                                            '&:hover': { transform: 'scale(1.2)' },
                                        }}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        {/* Description */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <TextField
                                fullWidth
                                label="Description"
                                value={form.description}
                                onChange={e => ff('description', e.target.value)}
                                size="small"
                                multiline
                                rows={2}
                                placeholder="Brief description of when this leave applies"
                            />
                        </Grid>

                        {/* Toggle row */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Box sx={{
                                display: 'flex', gap: 2, flexWrap: 'wrap',
                                p: 1.5, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0',
                            }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={form.isPaid}
                                            onChange={e => ff('isPaid', e.target.checked)}
                                            color="success"
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                            Paid Leave
                                        </Typography>
                                    }
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={form.carryForward}
                                            onChange={e => ff('carryForward', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                            Carry Forward
                                        </Typography>
                                    }
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={form.affectsLOP}
                                            onChange={e => ff('affectsLOP', e.target.checked)}
                                            color="warning"
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                            Excess = LOP
                                        </Typography>
                                    }
                                />
                            </Box>
                        </Grid>

                        {/* Carry-forward limit — only shown when carryForward is on */}
                        {form.carryForward && (
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Max Carry-forward Days"
                                    type="number"
                                    value={form.carryForwardLimit}
                                    onChange={e => ff('carryForwardLimit', Math.max(0, parseInt(e.target.value) || 0))}
                                    size="small"
                                    inputProps={{ min: 0 }}
                                    helperText="Maximum days that can be carried to next period"
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: '2px solid #E2E8F0', bgcolor: '#F8FAFC', gap: 1 }}>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600, borderRadius: '8px' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            textTransform: 'none', bgcolor: PRIMARY, fontWeight: 700,
                            borderRadius: '8px', '&:hover': { bgcolor: PRIMARY_DARK },
                        }}
                    >
                        {editingPolicy ? 'Update Leave Type' : 'Add Leave Type'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ══════════════════════════════════════
                DELETE CONFIRM DIALOG
            ══════════════════════════════════════ */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px' } }}
            >
                <DialogTitle sx={{ pb: 0.5 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Delete Leave Type</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: 13, color: '#64748B', mt: 1 }}>
                        Are you sure you want to delete&nbsp;
                        <Box component="span" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                            "{deleteTarget?.name}"
                        </Box>
                        ? This will remove the leave type from all salary calculations.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600, borderRadius: '8px' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmDelete}
                        sx={{
                            textTransform: 'none', bgcolor: '#DC2626', fontWeight: 700,
                            borderRadius: '8px', '&:hover': { bgcolor: '#B91C1C' },
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
