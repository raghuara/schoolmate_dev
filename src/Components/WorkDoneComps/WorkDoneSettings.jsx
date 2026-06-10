import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, IconButton, Switch, TextField, Tooltip, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SnackBar from '../SnackBar';
import { selectAcademicYear } from '../../Redux/Slices/academicYearSlice';
import { GetWorkdonePeriods, PostWorkdonePeriods, GetCustomWorkdoneSubjects, SaveCustomWorkdoneSubjects } from '../../Api/Api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
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

const DEFAULT_FLAGS = {
    allowTeacherAddPeriod: true,
    requireStatusIndicator: true,
    lockPastDays: false,
};

const FLAG_META = [
    { key: 'requireStatusIndicator', label: 'At least one status indicator required', desc: 'Force teachers to mark T / R / C.W / W / etc.' },
    { key: 'lockPastDays', label: 'Lock entries after the day ends', desc: 'Prevent backdating. Coordinators can still override.' },
];

export default function WorkDoneSettings() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const isSuperAdmin = user?.userType === 'superadmin';
    const token = '123';
    const academicYear = useSelector(selectAcademicYear);
    const rollNumber = user?.rollNumber || '';
    const userType = user?.userType || '';

    const [periods, setPeriods] = useState([]);
    const [flags, setFlags] = useState(DEFAULT_FLAGS);
    const [dialog, setDialog] = useState({ open: false, mode: 'add', period: null });
    const [form, setForm] = useState({ name: '', startTime: '', endTime: '' });
    const [snack, setSnack] = useState({ open: false, ok: true, msg: '' });
    const [loading, setLoading] = useState(false);
    const [savingPeriods, setSavingPeriods] = useState(false);
    const [savingSubjects, setSavingSubjects] = useState(false);

    // Custom period-subjects — loaded from the API (no dummy fallback)
    const [customSubjects, setCustomSubjects] = useState([]);
    const [savedSubjects, setSavedSubjects] = useState([]); // already persisted — shown as read-only (no delete)
    const [newSubject, setNewSubject] = useState('');
    const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

    const addCustomSubject = () => {
        const v = newSubject.trim();
        if (!v) return;
        if (customSubjects.some((s) => s.toLowerCase() === v.toLowerCase())) { setNewSubject(''); return; }
        setCustomSubjects((prev) => [...prev, v]);
        setNewSubject('');
    };
    const removeCustomSubject = (name) => setCustomSubjects((prev) => prev.filter((s) => s !== name));

    // Load periods + custom subjects for the selected academic year
    useEffect(() => {
        if (!academicYear) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [periodsRes, subjectsRes] = await Promise.allSettled([
                    axios.get(GetWorkdonePeriods, { params: { academicYear }, headers }),
                    axios.get(GetCustomWorkdoneSubjects, { params: { academicYear }, headers }),
                ]);
                if (cancelled) return;

                if (periodsRes.status === 'fulfilled' && !periodsRes.value.data?.error) {
                    const apiPeriods = (periodsRes.value.data?.periods || [])
                        .slice()
                        .sort((a, b) => (a.sortOrder ?? a.periodNumber) - (b.sortOrder ?? b.periodNumber))
                        .map((p) => ({ id: p.periodNumber, name: p.name || `Period ${p.periodNumber}`, startTime: p.startTime || '', endTime: p.endTime || '' }));
                    setPeriods(apiPeriods);
                }

                if (subjectsRes.status === 'fulfilled' && !subjectsRes.value.data?.error) {
                    const loadedSubjects = subjectsRes.value.data?.subjects || [];
                    setCustomSubjects(loadedSubjects);
                    setSavedSubjects(loadedSubjects);
                }
            } catch {
                /* keep current state on failure */
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

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

    // ── Time helpers ──────────────────────────────────────────────────────────
    const toMin = (t) => {
        if (!t || !t.includes(':')) return null;
        const [h, m] = t.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        return h * 60 + m;
    };
    const toHHMM = (mins) => {
        const m = ((mins % 1440) + 1440) % 1440;
        return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    };
    // Most common period duration across existing periods (defaults to 45 mins)
    const commonDuration = () => {
        const counts = {};
        periods.forEach((p) => {
            const s = toMin(p.startTime);
            const e = toMin(p.endTime);
            if (s != null && e != null && e > s) counts[e - s] = (counts[e - s] || 0) + 1;
        });
        const entries = Object.entries(counts);
        if (!entries.length) return 45;
        entries.sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0]));
        return Number(entries[0][0]);
    };

    const openAdd = () => {
        // Auto-continue from the last period's end, using the common period duration
        const last = periods[periods.length - 1];
        const dur = commonDuration();
        const start = last?.endTime || '';
        const startMin = toMin(start);
        const end = startMin != null ? toHHMM(startMin + dur) : '';
        setForm({ name: `Period ${periods.length + 1}`, startTime: start, endTime: end });
        setDialog({ open: true, mode: 'add', period: null });
    };
    const openEdit = (p) => {
        setForm({ name: p.name, startTime: p.startTime || '', endTime: p.endTime || '' });
        setDialog({ open: true, mode: 'edit', period: p });
    };
    // Changing start auto-fills end = start + common duration (end stays editable)
    const handleStartChange = (val) => {
        const startMin = toMin(val);
        const dur = commonDuration();
        setForm((f) => ({ ...f, startTime: val, endTime: startMin != null ? toHHMM(startMin + dur) : '' }));
    };
    const save = () => {
        if (!form.name.trim()) return;
        if (!form.startTime || !form.endTime) {
            setSnack({ open: true, ok: false, msg: 'Start and end time are required.' });
            return;
        }
        if (toMin(form.endTime) <= toMin(form.startTime)) {
            setSnack({ open: true, ok: false, msg: 'End time must be after start time.' });
            return;
        }
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

    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const savePeriods = async () => {
        if (!academicYear) {
            setSnack({ open: true, ok: false, msg: 'Academic year not set. Pick it in the dashboard header.' });
            return;
        }
        // Renumber by current order; backend derives the period name from periodNumber
        const periodsBody = periods.map((p, idx) => ({
            periodNumber: idx + 1,
            startTime: p.startTime,
            endTime: p.endTime,
        }));
        setSavingPeriods(true);
        try {
            const res = await axios.post(PostWorkdonePeriods, {
                academicYear, rollNumber: String(rollNumber), userType, periods: periodsBody,
            }, { headers: authHeaders });
            if (res.data?.error) throw new Error(res.data.message || 'Failed to save periods');
            setSnack({ open: true, ok: true, msg: 'Periods saved.' });
        } catch (err) {
            setSnack({ open: true, ok: false, msg: err?.response?.data?.message || err.message || 'Failed to save periods.' });
        } finally {
            setSavingPeriods(false);
        }
    };

    const saveSubjects = async () => {
        if (!academicYear) {
            setSnack({ open: true, ok: false, msg: 'Academic year not set. Pick it in the dashboard header.' });
            return;
        }
        setConfirmSaveOpen(false);
        setSavingSubjects(true);
        try {
            const res = await axios.post(SaveCustomWorkdoneSubjects, {
                academicYear, rollNumber: String(rollNumber), userType, subjects: customSubjects,
            }, { headers: authHeaders });
            if (res.data?.error) throw new Error(res.data.message || 'Failed to save custom period names');
            setSavedSubjects([...customSubjects]);
            setSnack({ open: true, ok: true, msg: 'Custom subjects saved.' });
        } catch (err) {
            setSnack({ open: true, ok: false, msg: err?.response?.data?.message || err.message || 'Failed to save custom period names.' });
        } finally {
            setSavingSubjects(false);
        }
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={openAdd}
                            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: 'none', fontSize: 12.5, fontWeight: 700,
                                border: '1px solid #E5E7EB', color: '#374151', borderRadius: '8px', height: 32, px: 1.8,
                                '&:hover': { bgcolor: '#F9FAFB', borderColor: PRIMARY },
                            }}
                        >
                            Add Period
                        </Button>
                        <Button
                            onClick={savePeriods}
                            disabled={savingPeriods || loading}
                            startIcon={savingPeriods ? <CircularProgress size={13} sx={{ color: '#fff' }} /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                            variant="contained"
                            disableElevation
                            sx={{
                                textTransform: 'none', fontSize: 12.5, fontWeight: 700,
                                bgcolor: PRIMARY, color: '#fff', borderRadius: '8px', height: 32, px: 1.8,
                                '&:hover': { bgcolor: PRIMARY_DARK },
                                '&.Mui-disabled': { bgcolor: '#9CA3AF', color: '#fff' },
                            }}
                        >
                            {savingPeriods ? 'Saving…' : 'Save Periods'}
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={1}>
                    {periods.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ p: 4, textAlign: 'center', borderRadius: '10px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>No periods created yet</Typography>
                                <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.5 }}>Click “Add Period” to create your first period.</Typography>
                            </Box>
                        </Grid>
                    ) : periods.map((p, idx) => (
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
                                {idx >= 8 && (
                                    <Tooltip title="Delete extra period" arrow>
                                        <IconButton size="small" onClick={() => remove(p.id)} sx={{ width: 26, height: 26 }}>
                                            <DeleteOutlineIcon sx={{ fontSize: 15, color: '#DC2626' }} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Custom period-subjects — common to every class (PT, Yoga, ...) */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>Custom Period Names</Typography>
                        <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>
                            Extra subjects common to every class (PT, Yoga, Library…). These appear in the Subject field on the Work Done page <strong>alongside each grade’s own subjects</strong> — the grade subjects are not changed.
                        </Typography>
                    </Box>
                    <Button
                        onClick={() => setConfirmSaveOpen(true)}
                        disabled={savingSubjects || loading}
                        startIcon={savingSubjects ? <CircularProgress size={13} sx={{ color: '#fff' }} /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                        variant="contained"
                        disableElevation
                        sx={{
                            textTransform: 'none', fontSize: 12.5, fontWeight: 700,
                            bgcolor: PRIMARY, color: '#fff', borderRadius: '8px', height: 32, px: 1.8,
                            '&:hover': { bgcolor: PRIMARY_DARK },
                            '&.Mui-disabled': { bgcolor: '#9CA3AF', color: '#fff' },
                        }}
                    >
                        {savingSubjects ? 'Saving…' : 'Save Subjects'}
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.2, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addCustomSubject(); }}
                        placeholder="e.g. PT, Yoga, Library"
                        sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 13 } }}
                    />
                    <Button
                        onClick={addCustomSubject}
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        variant="contained"
                        disableElevation
                        sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: PRIMARY_DARK }, borderRadius: '8px', height: 36, px: 2 }}
                    >
                        Add
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1 }}>
                    {customSubjects.length === 0 ? (
                        <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>No custom periods yet.</Typography>
                    ) : customSubjects.map((s) => {
                        const isSaved = savedSubjects.includes(s);
                        return (
                            <Chip
                                key={s}
                                label={s}
                                // Saved subjects are permanent — no delete. Only newly added (unsaved) ones can be removed.
                                {...(isSaved ? {} : {
                                    onDelete: () => removeCustomSubject(s),
                                    deleteIcon: <DeleteOutlineIcon sx={{ fontSize: '16px !important' }} />,
                                })}
                                sx={{
                                    height: 30, fontSize: 12.5, fontWeight: 700,
                                    bgcolor: PRIMARY_LIGHT, color: PRIMARY_DARK, border: `1px solid ${PRIMARY_BORDER}`,
                                    '& .MuiChip-deleteIcon': { color: `${PRIMARY_DARK}99`, '&:hover': { color: '#DC2626' } },
                                }}
                            />
                        );
                    })}
                </Box>

            </Box>

            {/* Confirm — custom subjects are permanent once saved */}
            <Dialog open={confirmSaveOpen} onClose={() => !savingSubjects && setConfirmSaveOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogTitle sx={{ p: 2, pb: 1, fontSize: 16, fontWeight: 800 }}>Save custom subjects?</DialogTitle>
                <DialogContent sx={{ px: 2, pb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1.2, p: 1.4, borderRadius: '10px', bgcolor: '#FFF7ED', border: '1px solid #FED7AA' }}>
                        <InfoOutlinedIcon sx={{ fontSize: 20, color: '#C2410C', mt: 0.2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 13, color: '#9A3412', fontWeight: 600, lineHeight: 1.45 }}>
                            Once saved, these subjects <strong>cannot be edited or deleted</strong>. Please double-check the list before continuing. Are you sure you want to save?
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmSaveOpen(false)}
                        disabled={savingSubjects}
                        sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', px: 2, height: 34 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={saveSubjects}
                        disabled={savingSubjects}
                        variant="contained"
                        disableElevation
                        startIcon={savingSubjects ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                        sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: PRIMARY_DARK }, borderRadius: '8px', px: 2, height: 34, '&.Mui-disabled': { bgcolor: '#9CA3AF', color: '#fff' } }}
                    >
                        {savingSubjects ? 'Saving…' : 'Yes, Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={dialog.open} onClose={() => setDialog({ open: false, mode: 'add', period: null })} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{dialog.mode === 'add' ? 'Add Period' : 'Edit Period'}</Typography>
                    <IconButton size="small" onClick={() => setDialog({ open: false, mode: 'add', period: null })}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Name</Typography>
                    <TextField
                        size="small"
                        fullWidth
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        disabled={dialog.mode === 'edit'}
                        helperText={dialog.mode === 'edit' ? 'Period name can’t be changed — edit the time only.' : ''}
                        sx={{ mb: 1.2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                    <Grid container spacing={1.2}>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Start <Box component="span" sx={{ color: '#DC2626' }}>*</Box></Typography>
                            <TextField size="small" type="time" fullWidth required value={form.startTime} onChange={(e) => handleStartChange(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>End <Box component="span" sx={{ color: '#DC2626' }}>*</Box></Typography>
                            <TextField size="small" type="time" fullWidth required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2 }}>
                    <Button onClick={() => setDialog({ open: false, mode: 'add', period: null })} sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', px: 2, height: 34 }}>Cancel</Button>
                    <Button onClick={save} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: PRIMARY_DARK }, borderRadius: '6px', px: 2, height: 34 }}>Save</Button>
                </DialogActions>
            </Dialog>

            <SnackBar
                open={snack.open}
                message={snack.msg}
                status={snack.ok}
                color={snack.ok}
                setOpen={(v) => setSnack((s) => ({ ...s, open: v }))}
            />
        </Box>
    );
}
