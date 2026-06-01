import React, { useMemo, useState } from 'react';
import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, IconButton, Switch, TextField, Tooltip, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';

const PRIMARY = '#0891B2';
const PRIMARY_LIGHT = '#ECFEFF';
const PRIMARY_DARK = '#0E7490';
const PRIMARY_BORDER = '#A5F3FC';

const DEFAULT_PERIODS = [
    { id: 1, name: 'Period 1', startTime: '08:30', endTime: '09:15' },
    { id: 2, name: 'Period 2', startTime: '09:15', endTime: '10:00' },
    { id: 3, name: 'Period 3', startTime: '10:00', endTime: '10:45' },
    { id: 4, name: 'Period 4', startTime: '11:00', endTime: '11:45' },
    { id: 5, name: 'Period 5', startTime: '11:45', endTime: '12:30' },
    { id: 6, name: 'Period 6', startTime: '13:15', endTime: '14:00' },
    { id: 7, name: 'Period 7', startTime: '14:00', endTime: '14:45' },
    { id: 8, name: 'Period 8', startTime: '14:45', endTime: '15:30' },
];

const DEFAULT_FLAGS = {
    allowTeacherAddPeriod: true,
    requireStatusIndicator: true,
    requireSubject: true,
    enableNextDayPlan: true,
    lockPastDays: false,
};

const FLAG_META = [
    { key: 'allowTeacherAddPeriod', label: 'Teachers can add extra periods', desc: 'When off, only admins can add or remove periods.' },
    { key: 'requireSubject', label: 'Subject is mandatory per period', desc: 'Block saving if any filled period is missing a subject.' },
    { key: 'requireStatusIndicator', label: 'At least one status indicator required', desc: 'Force teachers to mark T / R / C.W / W / etc.' },
    { key: 'enableNextDayPlan', label: 'Enable “Next Day Plan” entries', desc: 'Show the red-mode toggle for planning tomorrow’s lessons.' },
    { key: 'lockPastDays', label: 'Lock entries after the day ends', desc: 'Prevent backdating. Coordinators can still override.' },
];

export default function WorkDoneSettings() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const isSuperAdmin = user?.userType === 'superadmin';

    const [periods, setPeriods] = useState(DEFAULT_PERIODS);
    const [flags, setFlags] = useState(DEFAULT_FLAGS);
    const [dialog, setDialog] = useState({ open: false, mode: 'add', period: null });
    const [form, setForm] = useState({ name: '', startTime: '', endTime: '' });
    const [savedSnack, setSavedSnack] = useState(false);

    const totalDuration = useMemo(() => {
        let mins = 0;
        periods.forEach((p) => {
            if (p.startTime && p.endTime) {
                const [sh, sm] = p.startTime.split(':').map(Number);
                const [eh, em] = p.endTime.split(':').map(Number);
                const diff = (eh * 60 + em) - (sh * 60 + sm);
                if (diff > 0) mins += diff;
            }
        });
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    }, [periods]);

    const openAdd = () => {
        setForm({ name: `Period ${periods.length + 1}`, startTime: '', endTime: '' });
        setDialog({ open: true, mode: 'add', period: null });
    };
    const openEdit = (p) => {
        setForm({ name: p.name, startTime: p.startTime || '', endTime: p.endTime || '' });
        setDialog({ open: true, mode: 'edit', period: p });
    };
    const save = () => {
        if (!form.name.trim()) return;
        if (dialog.mode === 'add') {
            const nextId = Math.max(0, ...periods.map((p) => p.id)) + 1;
            setPeriods((prev) => [...prev, { id: nextId, ...form }]);
        } else {
            setPeriods((prev) => prev.map((p) => p.id === dialog.period.id ? { ...p, ...form } : p));
        }
        setDialog({ open: false, mode: 'add', period: null });
    };
    const remove = (id) => setPeriods((prev) => prev.filter((p) => p.id !== id));
    const move = (id, dir) => {
        setPeriods((prev) => {
            const idx = prev.findIndex((p) => p.id === id);
            if (idx === -1) return prev;
            const target = idx + dir;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[idx], next[target]] = [next[target], next[idx]];
            return next;
        });
    };

    const resetDefaults = () => {
        setPeriods(DEFAULT_PERIODS);
        setFlags(DEFAULT_FLAGS);
    };
    const saveAll = () => {
        setSavedSnack(true);
        setTimeout(() => setSavedSnack(false), 2500);
    };

    if (!isSuperAdmin) {
        return (
            <Box sx={{ border: '1px solid #ccc', borderRadius: '20px', p: 4, height: '86vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                <LockOutlinedIcon sx={{ fontSize: 56, color: '#9CA3AF' }} />
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Super-admin only</Typography>
                <Typography sx={{ fontSize: 13, color: '#6B7280', textAlign: 'center', maxWidth: 380 }}>
                    Only the super-admin can configure how many periods exist and the school-wide Work Done rules.
                </Typography>
                <Button onClick={() => navigate(-1)} variant="contained" disableElevation sx={{ mt: 1, textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: PRIMARY_DARK }, borderRadius: '8px' }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: '20px', p: 2, height: '86vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 28, height: 28 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                    </IconButton>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '8px',
                        bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <SettingsIcon sx={{ fontSize: 18, color: PRIMARY }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#111827', lineHeight: 1.1 }}>
                            Work Done · Period Settings
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#6B7280', mt: 0.2 }}>
                            School-wide configuration · Applies to every teacher and grade
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        onClick={resetDefaults}
                        startIcon={<RestoreOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: 'none', fontSize: 12.5, fontWeight: 700,
                            border: '1px solid #E5E7EB', color: '#374151', borderRadius: '8px',
                            px: 1.6, height: 34, '&:hover': { bgcolor: '#F9FAFB' },
                        }}
                    >
                        Reset Defaults
                    </Button>
                    <Button
                        onClick={saveAll}
                        startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                        variant="contained"
                        disableElevation
                        sx={{
                            textTransform: 'none', fontSize: 12.5, fontWeight: 700,
                            bgcolor: PRIMARY, color: '#fff', borderRadius: '8px',
                            px: 2, height: 34, boxShadow: `0 2px 6px ${PRIMARY}33`,
                            '&:hover': { bgcolor: PRIMARY_DARK },
                        }}
                    >
                        Save Settings
                    </Button>
                </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 1.6, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ width: 38, height: 38, borderRadius: '8px', bgcolor: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ScheduleIcon sx={{ fontSize: 20, color: PRIMARY }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Total Periods</Typography>
                                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{periods.length}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 1.6, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ width: 38, height: 38, borderRadius: '8px', bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AccessTimeIcon sx={{ fontSize: 20, color: '#B45309' }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Total Teaching Time</Typography>
                                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{totalDuration}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 1.6, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ width: 38, height: 38, borderRadius: '8px', bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <VerifiedOutlinedIcon sx={{ fontSize: 20, color: '#2E7D32' }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Active Rules</Typography>
                                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{Object.values(flags).filter(Boolean).length}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2, flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>Periods</Typography>
                        <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>Reorder, rename, set time slots, or remove periods.</Typography>
                    </Box>
                    <Button
                        onClick={openAdd}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        variant="contained"
                        disableElevation
                        sx={{
                            textTransform: 'none', fontSize: 12.5, fontWeight: 700,
                            bgcolor: PRIMARY, color: '#fff', borderRadius: '8px', height: 32, px: 1.8,
                            '&:hover': { bgcolor: PRIMARY_DARK },
                        }}
                    >
                        Add Period
                    </Button>
                </Box>

                <Grid container spacing={1}>
                    {periods.map((p, idx) => (
                        <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                            <Box sx={{
                                p: 1.2, borderRadius: '10px',
                                border: '1px solid #E5E7EB', bgcolor: '#fff',
                                display: 'flex', alignItems: 'center', gap: 1,
                                transition: '0.15s',
                                '&:hover': { borderColor: PRIMARY_BORDER },
                            }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <IconButton size="small" disabled={idx === 0} onClick={() => move(p.id, -1)} sx={{ width: 18, height: 18 }}>
                                        <DragIndicatorIcon sx={{ fontSize: 14, color: '#9CA3AF', transform: 'rotate(90deg)' }} />
                                    </IconButton>
                                </Box>
                                <Box sx={{
                                    width: 32, height: 32, borderRadius: '7px',
                                    bgcolor: PRIMARY_LIGHT, color: PRIMARY_DARK,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 800,
                                }}>
                                    {idx + 1}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }} noWrap>{p.name}</Typography>
                                    {(p.startTime || p.endTime) && (
                                        <Chip
                                            size="small"
                                            icon={<AccessTimeIcon sx={{ fontSize: '12px !important' }} />}
                                            label={`${p.startTime || '--:--'} – ${p.endTime || '--:--'}`}
                                            sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: '#F3F4F6', color: '#374151', mt: 0.3, '& .MuiChip-icon': { color: '#6B7280' } }}
                                        />
                                    )}
                                </Box>
                                <Tooltip title="Edit" arrow>
                                    <IconButton size="small" onClick={() => openEdit(p)} sx={{ width: 26, height: 26 }}>
                                        <EditOutlinedIcon sx={{ fontSize: 15, color: '#6B7280' }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" arrow>
                                    <IconButton size="small" onClick={() => remove(p.id)} sx={{ width: 26, height: 26 }}>
                                        <DeleteOutlineIcon sx={{ fontSize: 15, color: '#DC2626' }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#111827', mb: 0.3 }}>School-wide Rules</Typography>
                <Typography sx={{ fontSize: 11.5, color: '#6B7280', mb: 1.5 }}>Toggles apply to every Work Done entry across the school.</Typography>

                <Grid container spacing={1.2}>
                    {FLAG_META.map((f) => (
                        <Grid size={{ xs: 12, md: 6 }} key={f.key}>
                            <Box sx={{
                                p: 1.4, borderRadius: '10px',
                                border: '1px solid', borderColor: flags[f.key] ? PRIMARY_BORDER : '#E5E7EB',
                                bgcolor: flags[f.key] ? PRIMARY_LIGHT : '#fff',
                                display: 'flex', alignItems: 'flex-start', gap: 1,
                            }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{f.label}</Typography>
                                    <Typography sx={{ fontSize: 11, color: '#6B7280', mt: 0.3, lineHeight: 1.45 }}>{f.desc}</Typography>
                                </Box>
                                <Switch
                                    checked={flags[f.key]}
                                    onChange={(e) => setFlags((prev) => ({ ...prev, [f.key]: e.target.checked }))}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: PRIMARY },
                                    }}
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{
                    mt: 2, p: 1.4, borderRadius: '10px',
                    border: '1px solid #FDE68A', bgcolor: '#FFFBEB',
                    display: 'flex', alignItems: 'flex-start', gap: 1,
                }}>
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: '#B45309', mt: 0.2 }} />
                    <Typography sx={{ fontSize: 11.5, color: '#92400E', lineHeight: 1.5 }}>
                        Changes here apply <strong>school-wide</strong>. Teachers will see the new periods on their next Work Done entry. Existing saved entries are not modified.
                    </Typography>
                </Box>
            </Box>

            <Dialog open={dialog.open} onClose={() => setDialog({ open: false, mode: 'add', period: null })} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{dialog.mode === 'add' ? 'Add Period' : 'Edit Period'}</Typography>
                    <IconButton size="small" onClick={() => setDialog({ open: false, mode: 'add', period: null })}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Name</Typography>
                    <TextField size="small" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ mb: 1.2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                    <Grid container spacing={1.2}>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Start</Typography>
                            <TextField size="small" type="time" fullWidth value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>End</Typography>
                            <TextField size="small" type="time" fullWidth value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2 }}>
                    <Button onClick={() => setDialog({ open: false, mode: 'add', period: null })} sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', px: 2, height: 34 }}>Cancel</Button>
                    <Button onClick={save} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: PRIMARY_DARK }, borderRadius: '6px', px: 2, height: 34 }}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={savedSnack} onClose={() => setSavedSnack(false)} maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 280 }}>
                    <VerifiedOutlinedIcon sx={{ fontSize: 28, color: PRIMARY_DARK }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Settings saved.</Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
