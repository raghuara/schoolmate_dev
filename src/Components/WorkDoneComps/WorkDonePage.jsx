import React, { useEffect, useMemo, useState } from 'react';
import {
    Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControl, Grid, IconButton, InputAdornment, MenuItem, Select, Tab, Tabs, TextField, Tooltip, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../Redux/Slices/DropdownController';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const PRIMARY = '#0891B2';
const PRIMARY_LIGHT = '#ECFEFF';
const PRIMARY_DARK = '#0E7490';
const PRIMARY_BORDER = '#A5F3FC';

const STATUS_INDICATORS = [
    { code: 'T', label: 'Teach / Taught', color: '#1565C0', bg: '#E3F2FD' },
    { code: 'R', label: 'Revision / Revised', color: '#7B1FA2', bg: '#F3E5F5' },
    { code: 'C.W', label: 'Class Work', color: '#2E7D32', bg: '#E8F5E9' },
    { code: 'W', label: 'Written / Wrote', color: '#0277BD', bg: '#E1F5FE' },
    { code: 'A', label: 'Assessment', color: '#C62828', bg: '#FFEBEE' },
    { code: 'AC', label: 'Activity', color: '#EF6C00', bg: '#FFF3E0' },
    { code: 'P', label: 'Practice / Practiced', color: '#00838F', bg: '#E0F7FA' },
    { code: 'B.Ex', label: 'Book Exercise', color: '#6A1B9A', bg: '#EDE7F6' },
    { code: 'S.B', label: 'Scrap Book', color: '#AD1457', bg: '#FCE4EC' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

const SUBJECT_PALETTE = ['#1565C0', '#C62828', '#2E7D32', '#EF6C00', '#7B1FA2', '#00838F', '#5D4037', '#00897B', '#AD1457', '#455A64'];

const colorForSubject = (name) => {
    if (!name) return PRIMARY;
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return SUBJECT_PALETTE[hash % SUBJECT_PALETTE.length];
};

const MOCK_HISTORY = [
    { date: '2026-05-29', grade: 'VIII', section: 'A', filled: 8, type: 'today' },
    { date: '2026-05-28', grade: 'VIII', section: 'A', filled: 7, type: 'today' },
    { date: '2026-05-27', grade: 'VIII', section: 'A', filled: 8, type: 'today' },
    { date: '2026-05-26', grade: 'VIII', section: 'A', filled: 8, type: 'today' },
];

const toIsoDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const emptyEntry = () => ({ subject: '', topic: '', statuses: [], pageRef: '', notes: '' });

export default function WorkDonePage() {
    const navigate = useNavigate();
    const grades = useSelector(selectGrades);
    const user = useSelector((state) => state.auth);
    const userType = user?.userType;
    const isAdmin = userType === 'superadmin' || userType === 'admin';

    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(toIsoDate(today));
    const [planMode, setPlanMode] = useState('today');
    const [selectedGradeSign, setSelectedGradeSign] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    const [periods, setPeriods] = useState(DEFAULT_PERIODS);
    const [entries, setEntries] = useState({});

    const [activeTab, setActiveTab] = useState(0);
    const [periodDialog, setPeriodDialog] = useState({ open: false, mode: 'add', period: null });
    const [periodForm, setPeriodForm] = useState({ name: '', startTime: '', endTime: '' });
    const [historySearch, setHistorySearch] = useState('');
    const [snack, setSnack] = useState({ open: false, msg: '', ok: true });

    const selectedGrade = grades?.find((g) => g.sign === selectedGradeSign) || null;
    const sections = selectedGrade?.sections || [];
    const availableSubjects = useMemo(() => {
        const exams = selectedGrade?.exams || [];
        const all = exams.flatMap((e) => [
            ...(Array.isArray(e?.primarySubjects) ? e.primarySubjects : []),
            ...(Array.isArray(e?.secondarySubjects) ? e.secondarySubjects : []),
        ]);
        return Array.from(new Set(all.filter(Boolean).map(String)));
    }, [selectedGrade]);

    useEffect(() => {
        if (grades && grades.length > 0 && !selectedGradeSign) {
            setSelectedGradeSign(grades[0].sign);
            setSelectedSection(grades[0].sections?.[0] || null);
        }
    }, [grades, selectedGradeSign]);

    const entryKey = useMemo(() => `${selectedDate}|${planMode}|${selectedGradeSign}|${selectedSection}`, [selectedDate, planMode, selectedGradeSign, selectedSection]);
    const dayEntries = entries[entryKey] || {};

    const setEntryField = (periodId, field, value) => {
        setEntries((prev) => {
            const existing = prev[entryKey] || {};
            const row = existing[periodId] || emptyEntry();
            return {
                ...prev,
                [entryKey]: {
                    ...existing,
                    [periodId]: { ...row, [field]: value },
                },
            };
        });
    };

    const toggleStatus = (periodId, code) => {
        setEntries((prev) => {
            const existing = prev[entryKey] || {};
            const row = existing[periodId] || emptyEntry();
            const set = new Set(row.statuses);
            if (set.has(code)) set.delete(code); else set.add(code);
            return {
                ...prev,
                [entryKey]: {
                    ...existing,
                    [periodId]: { ...row, statuses: Array.from(set) },
                },
            };
        });
    };

    const filledCount = useMemo(() => {
        return periods.reduce((n, p) => {
            const row = dayEntries[p.id];
            const filled = row && (row.subject || row.topic?.trim() || row.statuses?.length);
            return n + (filled ? 1 : 0);
        }, 0);
    }, [periods, dayEntries]);

    const completion = periods.length ? Math.round((filledCount / periods.length) * 100) : 0;

    const dayName = useMemo(() => {
        try {
            const d = new Date(`${selectedDate}T00:00:00`);
            return DAY_NAMES[d.getDay()];
        } catch { return ''; }
    }, [selectedDate]);

    const handleSaveAll = () => {
        if (!selectedGradeSign || !selectedSection) {
            setSnack({ open: true, ok: false, msg: 'Pick a grade and section first.' });
            return;
        }
        if (filledCount === 0) {
            setSnack({ open: true, ok: false, msg: 'Fill at least one period before saving.' });
            return;
        }
        setSnack({ open: true, ok: true, msg: `${planMode === 'today' ? "Today's work" : 'Next-day plan'} saved (${filledCount}/${periods.length} periods).` });
    };

    const openAddPeriod = () => {
        setPeriodForm({ name: `Period ${periods.length + 1}`, startTime: '', endTime: '' });
        setPeriodDialog({ open: true, mode: 'add', period: null });
    };
    const openEditPeriod = (p) => {
        setPeriodForm({ name: p.name, startTime: p.startTime || '', endTime: p.endTime || '' });
        setPeriodDialog({ open: true, mode: 'edit', period: p });
    };
    const savePeriod = () => {
        if (!periodForm.name.trim()) return;
        if (periodDialog.mode === 'add') {
            const nextId = Math.max(0, ...periods.map((p) => p.id)) + 1;
            setPeriods((prev) => [...prev, { id: nextId, ...periodForm }]);
        } else {
            setPeriods((prev) => prev.map((p) => p.id === periodDialog.period.id ? { ...p, ...periodForm } : p));
        }
        setPeriodDialog({ open: false, mode: 'add', period: null });
    };
    const deletePeriod = (id) => setPeriods((prev) => prev.filter((p) => p.id !== id));

    const filteredHistory = useMemo(() => {
        const q = historySearch.trim().toLowerCase();
        if (!q) return MOCK_HISTORY;
        return MOCK_HISTORY.filter((h) => h.date.includes(q) || h.grade.toLowerCase().includes(q) || h.section.toLowerCase().includes(q));
    }, [historySearch]);

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
                        <AssignmentTurnedInIcon sx={{ fontSize: 18, color: PRIMARY }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#111827', lineHeight: 1.1 }}>
                            Work Done Report
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#6B7280', mt: 0.2 }}>
                            Digital register · Replace paper logs with structured period entries
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isAdmin && (
                        <Button
                            onClick={() => navigate('/dashboardmenu/workdone/settings')}
                            startIcon={<SettingsIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                textTransform: 'none', fontSize: 12.5, fontWeight: 700,
                                border: '1px solid #E5E7EB', color: '#374151', borderRadius: '8px',
                                px: 1.6, height: 34, '&:hover': { bgcolor: '#F9FAFB' },
                            }}
                        >
                            Period Settings
                        </Button>
                    )}
                    <Button
                        onClick={handleSaveAll}
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
                        Save {planMode === 'today' ? 'Today’s Work' : 'Next Day Plan'}
                    </Button>
                </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                    minHeight: 36, borderBottom: '1px solid #eee',
                    '& .MuiTab-root': { textTransform: 'none', fontSize: 12.5, fontWeight: 700, color: '#555', minHeight: 36, px: 2 },
                    '& .Mui-selected': { color: `${PRIMARY_DARK} !important` },
                    '& .MuiTabs-indicator': { backgroundColor: PRIMARY, height: 3, borderRadius: '3px 3px 0 0' },
                }}
            >
                <Tab icon={<EventNoteIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Daily Entry" />
                <Tab icon={<HistoryIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="History" />
            </Tabs>

            <Box sx={{ flex: 1, overflowY: 'auto', mt: 1.5, pr: 0.5 }}>
                {activeTab === 0 && (
                    <>
                        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Date</Typography>
                                <TextField
                                    type="date"
                                    size="small"
                                    fullWidth
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 13, fontWeight: 600 } }}
                                />
                                <Typography sx={{ fontSize: 10.5, color: PRIMARY_DARK, mt: 0.3, fontWeight: 700 }}>{dayName}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Grade</Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={selectedGradeSign || ''}
                                        onChange={(e) => {
                                            const sign = e.target.value;
                                            setSelectedGradeSign(sign);
                                            const g = grades.find((x) => x.sign === sign);
                                            setSelectedSection(g?.sections?.[0] || null);
                                        }}
                                        sx={{ borderRadius: '8px', height: 36, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}
                                    >
                                        {(grades || []).map((g) => (
                                            <MenuItem key={g.sign} value={g.sign} sx={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>{g.sign}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Section</Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={selectedSection || ''}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        sx={{ borderRadius: '8px', height: 36, fontSize: 13, fontWeight: 600 }}
                                    >
                                        {sections.map((s) => (
                                            <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Entry Type</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {[
                                        { key: 'today', label: "Today's Work Done", color: '#1976D2', bg: '#E3F2FD' },
                                        { key: 'next', label: 'Next Day Plan', color: '#C62828', bg: '#FFEBEE' },
                                    ].map((m) => (
                                        <Box
                                            key={m.key}
                                            onClick={() => setPlanMode(m.key)}
                                            sx={{
                                                flex: 1,
                                                py: 0.7, px: 1.2,
                                                borderRadius: '8px',
                                                border: '1.5px solid',
                                                borderColor: planMode === m.key ? m.color : '#E5E7EB',
                                                bgcolor: planMode === m.key ? m.bg : '#fff',
                                                color: planMode === m.key ? m.color : '#6B7280',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                fontSize: 12, fontWeight: 700,
                                                transition: '0.15s',
                                                '&:hover': { borderColor: m.color, color: m.color },
                                            }}
                                        >
                                            {m.label}
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Box sx={{
                                    p: 1.4, borderRadius: '10px',
                                    border: `1px solid ${PRIMARY_BORDER}`,
                                    bgcolor: PRIMARY_LIGHT,
                                    display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: PRIMARY_DARK }} />
                                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: PRIMARY_DARK }}>
                                            {filledCount} / {periods.length} periods filled · {completion}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, height: 6, borderRadius: '4px', bgcolor: '#fff', overflow: 'hidden', minWidth: 120 }}>
                                        <Box sx={{ width: `${completion}%`, height: '100%', bgcolor: PRIMARY, transition: 'width 0.3s' }} />
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Button
                                    onClick={openAddPeriod}
                                    fullWidth
                                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        textTransform: 'none', fontSize: 12.5, fontWeight: 700,
                                        height: 40, border: '1px dashed #9CA3AF', color: '#374151', borderRadius: '8px',
                                        '&:hover': { bgcolor: '#F9FAFB', borderColor: PRIMARY_DARK, color: PRIMARY_DARK },
                                    }}
                                >
                                    Add Extra Period
                                </Button>
                            </Grid>
                        </Grid>

                        <Box sx={{
                            p: 1.2, borderRadius: '8px',
                            border: '1px solid #E5E7EB', bgcolor: '#FAFAFA',
                            mb: 1.5,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
                                <InfoOutlinedIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Status Indicator Legend
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                                {STATUS_INDICATORS.map((s) => (
                                    <Box key={s.code} sx={{
                                        display: 'flex', alignItems: 'center', gap: 0.4,
                                        px: 0.8, py: 0.2, borderRadius: '6px',
                                        bgcolor: s.bg, border: `1px solid ${s.color}33`,
                                    }}>
                                        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.code}</Typography>
                                        <Typography sx={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.label}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {availableSubjects.length === 0 && selectedGrade && (
                            <Box sx={{
                                p: 1.4, mb: 1.5, borderRadius: '10px',
                                border: '1px solid #FDE68A', bgcolor: '#FFFBEB',
                                display: 'flex', alignItems: 'center', gap: 1,
                            }}>
                                <LockOutlinedIcon sx={{ fontSize: 16, color: '#B45309' }} />
                                <Typography sx={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                                    No subjects are configured for {selectedGrade?.sign?.toUpperCase() || 'this grade'}. Ask the academics admin to add subjects from Subject Management.
                                </Typography>
                            </Box>
                        )}

                        <Grid container spacing={1.5}>
                            {periods.map((p) => {
                                const row = dayEntries[p.id] || emptyEntry();
                                const subjectColor = colorForSubject(row.subject);
                                const isFilled = row.subject || row.topic?.trim() || row.statuses?.length;
                                return (
                                    <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                                        <Box sx={{
                                            p: 1.4, borderRadius: '10px',
                                            border: '1px solid', borderColor: isFilled ? PRIMARY_BORDER : '#E5E7EB',
                                            bgcolor: '#fff',
                                            transition: '0.2s',
                                            '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                    <Box sx={{
                                                        width: 30, height: 30, borderRadius: '7px',
                                                        bgcolor: isFilled ? PRIMARY : '#F3F4F6',
                                                        color: isFilled ? '#fff' : '#374151',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 12, fontWeight: 800,
                                                    }}>
                                                        {p.id}
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
                                                            {p.name}
                                                        </Typography>
                                                        {p.startTime && p.endTime && (
                                                            <Typography sx={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>
                                                                {p.startTime} – {p.endTime}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 0.4 }}>
                                                    <Tooltip title="Edit period" arrow>
                                                        <IconButton size="small" onClick={() => openEditPeriod(p)} sx={{ width: 24, height: 24 }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Remove period" arrow>
                                                        <IconButton size="small" onClick={() => deletePeriod(p.id)} sx={{ width: 24, height: 24 }}>
                                                            <DeleteOutlineIcon sx={{ fontSize: 14, color: '#DC2626' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <Grid container spacing={1}>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                            Subject
                                                        </Typography>
                                                        {row.subject && (
                                                            <Box sx={{
                                                                display: 'flex', alignItems: 'center', gap: 0.3,
                                                                px: 0.6, py: 0.05, borderRadius: '4px',
                                                                bgcolor: `${subjectColor}1A`,
                                                            }}>
                                                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: subjectColor }} />
                                                                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: subjectColor }}>{row.subject}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    <Autocomplete
                                                        size="small"
                                                        options={availableSubjects}
                                                        getOptionLabel={(o) => o || ''}
                                                        value={row.subject || null}
                                                        disabled={availableSubjects.length === 0}
                                                        onChange={(_, v) => setEntryField(p.id, 'subject', v || '')}
                                                        renderOption={(props, option) => (
                                                            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colorForSubject(option) }} />
                                                                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{option}</Typography>
                                                            </Box>
                                                        )}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                placeholder={availableSubjects.length === 0 ? 'No subjects for this grade' : 'Pick subject'}
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', height: 34, fontSize: 12.5, fontWeight: 600 } }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>
                                                        Page / Reference
                                                    </Typography>
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        placeholder="e.g. pg 32, L1 (III)"
                                                        value={row.pageRef}
                                                        onChange={(e) => setEntryField(p.id, 'pageRef', e.target.value)}
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', height: 34, fontSize: 12.5 } }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12 }}>
                                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>
                                                        Topic / Activity
                                                    </Typography>
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        multiline
                                                        minRows={1}
                                                        maxRows={3}
                                                        placeholder="e.g. Tenses I & II, Chapter 5 Algebra, Book Fair visit"
                                                        value={row.topic}
                                                        onChange={(e) => setEntryField(p.id, 'topic', e.target.value)}
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: 12.5 } }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12 }}>
                                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>
                                                        Status Indicators
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {STATUS_INDICATORS.map((s) => {
                                                            const active = row.statuses?.includes(s.code);
                                                            return (
                                                                <Chip
                                                                    key={s.code}
                                                                    label={s.code}
                                                                    onClick={() => toggleStatus(p.id, s.code)}
                                                                    size="small"
                                                                    sx={{
                                                                        height: 24, fontSize: 11, fontWeight: 800,
                                                                        fontFamily: 'monospace',
                                                                        cursor: 'pointer',
                                                                        bgcolor: active ? s.color : s.bg,
                                                                        color: active ? '#fff' : s.color,
                                                                        border: '1px solid',
                                                                        borderColor: active ? s.color : `${s.color}33`,
                                                                        '&:hover': { bgcolor: active ? s.color : `${s.color}33` },
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                );
                            })}
                            {periods.length === 0 && (
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ p: 4, textAlign: 'center', borderRadius: '10px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                        <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>No periods configured yet. Add one to begin.</Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </>
                )}

                {activeTab === 1 && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Previous Entries</Typography>
                            <TextField
                                size="small"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                placeholder="Search by date, grade, section"
                                sx={{ width: { xs: '100%', sm: 320 }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 34, fontSize: 12.5 } }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Box>
                        <Grid container spacing={1}>
                            {filteredHistory.map((h, i) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                    <Box sx={{
                                        p: 1.4, borderRadius: '10px',
                                        border: '1px solid #E5E7EB', bgcolor: '#fff',
                                        display: 'flex', alignItems: 'center', gap: 1.2,
                                        cursor: 'pointer', transition: '0.15s',
                                        '&:hover': { borderColor: PRIMARY_BORDER, bgcolor: PRIMARY_LIGHT },
                                    }}>
                                        <Box sx={{
                                            width: 38, height: 38, borderRadius: '8px',
                                            bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <CalendarTodayIcon sx={{ fontSize: 16, color: PRIMARY_DARK }} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>{h.date}</Typography>
                                            <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
                                                Grade {h.grade} · Sec {h.section}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${h.filled}/8`}
                                            size="small"
                                            sx={{ height: 22, fontSize: 10.5, fontWeight: 800, bgcolor: PRIMARY, color: '#fff' }}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                            {filteredHistory.length === 0 && (
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ p: 4, textAlign: 'center', borderRadius: '10px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                        <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>No previous entries.</Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}

            </Box>

            <Dialog open={periodDialog.open} onClose={() => setPeriodDialog({ open: false, mode: 'add', period: null })} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{periodDialog.mode === 'add' ? 'Add Period' : 'Edit Period'}</Typography>
                    <IconButton size="small" onClick={() => setPeriodDialog({ open: false, mode: 'add', period: null })}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Name</Typography>
                    <TextField size="small" fullWidth value={periodForm.name} onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })} sx={{ mb: 1.2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                    <Grid container spacing={1.2}>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Start</Typography>
                            <TextField size="small" type="time" fullWidth value={periodForm.startTime} onChange={(e) => setPeriodForm({ ...periodForm, startTime: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>End</Typography>
                            <TextField size="small" type="time" fullWidth value={periodForm.endTime} onChange={(e) => setPeriodForm({ ...periodForm, endTime: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2 }}>
                    <Button onClick={() => setPeriodDialog({ open: false, mode: 'add', period: null })} sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', px: 2, height: 34 }}>Cancel</Button>
                    <Button onClick={savePeriod} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: PRIMARY_DARK }, borderRadius: '6px', px: 2, height: 34 }}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={snack.open} onClose={() => setSnack({ ...snack, open: false })} maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 280 }}>
                    {snack.ok
                        ? <CheckCircleOutlineIcon sx={{ fontSize: 28, color: PRIMARY_DARK }} />
                        : <InfoOutlinedIcon sx={{ fontSize: 28, color: '#DC2626' }} />}
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{snack.msg}</Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
