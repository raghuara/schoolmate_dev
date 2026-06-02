import React, { useEffect, useMemo, useState } from 'react';
import {
    Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, MenuItem,
    Select, Switch, Tab, Tabs, TextField, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../Redux/Slices/DropdownController';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';

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

// The logged-in staff's own periods (their timetable). Comes from backend later.
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

// Custom period-subjects created in Period Settings — common to every class (PT, Yoga, ...).
// These are appended to the grade's own subjects in the Subject field. Backend later.
const CUSTOM_PERIOD_SUBJECTS = ['PT', 'Yoga', 'Library', 'Moral Science'];

const SUBJECT_PALETTE = ['#1565C0', '#C62828', '#2E7D32', '#EF6C00', '#7B1FA2', '#00838F', '#5D4037', '#00897B', '#AD1457', '#455A64'];

const colorForSubject = (name) => {
    if (!name) return PRIMARY;
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return SUBJECT_PALETTE[hash % SUBJECT_PALETTE.length];
};

const MOCK_HISTORY = [
    { date: '2026-05-29', grade: 'VIII', section: 'A', filled: 8 },
    { date: '2026-05-28', grade: 'VIII', section: 'A', filled: 7 },
    { date: '2026-05-27', grade: 'VIII', section: 'A', filled: 8 },
    { date: '2026-05-26', grade: 'VIII', section: 'A', filled: 8 },
];

const toIsoDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Each period now carries its OWN class & section (not a common one for the whole day)
const emptyEntry = () => ({ grade: '', section: '', subject: '', topic: '', statuses: [], pageRef: '', isFree: false });

export default function WorkDonePage() {
    const navigate = useNavigate();
    const grades = useSelector(selectGrades);
    const user = useSelector((state) => state.auth);
    const userType = user?.userType;
    const isAdmin = userType === 'superadmin' || userType === 'admin';

    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(toIsoDate(today));

    const [periods, setPeriods] = useState(DEFAULT_PERIODS);
    const [entries, setEntries] = useState({});

    const [activeTab, setActiveTab] = useState(0);
    const [periodDialog, setPeriodDialog] = useState({ open: false });
    const [periodForm, setPeriodForm] = useState({ name: '', startTime: '', endTime: '' });
    const [historySearch, setHistorySearch] = useState('');
    const [snack, setSnack] = useState({ open: false, msg: '', ok: true });

    // Class Wise tab selection
    const [cwGradeSign, setCwGradeSign] = useState(null);
    const [cwSection, setCwSection] = useState(null);

    // Subjects available for a given grade sign = that grade's subjects + custom period-subjects
    const getSubjectsForGrade = (gradeSign) => {
        const grade = grades?.find((g) => g.sign === gradeSign);
        const exams = grade?.exams || [];
        const all = exams.flatMap((e) => [
            ...(Array.isArray(e?.primarySubjects) ? e.primarySubjects : []),
            ...(Array.isArray(e?.secondarySubjects) ? e.secondarySubjects : []),
        ]);
        const base = Array.from(new Set(all.filter(Boolean).map(String)));
        // Grade subjects first, then the school-wide custom periods (PT, Yoga, ...)
        return [...base, ...CUSTOM_PERIOD_SUBJECTS];
    };

    // Default the Class Wise selection once grades load
    useEffect(() => {
        if (grades && grades.length > 0 && !cwGradeSign) {
            setCwGradeSign(grades[0].sign);
            setCwSection(grades[0].sections?.[0] || null);
        }
    }, [grades, cwGradeSign]);

    const entryKey = selectedDate; // one register per staff per day
    const dayEntries = entries[entryKey] || {};

    const setEntryField = (periodId, field, value) => {
        setEntries((prev) => {
            const existing = prev[entryKey] || {};
            const row = existing[periodId] || emptyEntry();
            return { ...prev, [entryKey]: { ...existing, [periodId]: { ...row, [field]: value } } };
        });
    };

    // Changing a period's class resets its section + subject (they depend on the class)
    const setPeriodClass = (periodId, gradeSign) => {
        setEntries((prev) => {
            const existing = prev[entryKey] || {};
            const row = existing[periodId] || emptyEntry();
            return { ...prev, [entryKey]: { ...existing, [periodId]: { ...row, grade: gradeSign, section: '', subject: '' } } };
        });
    };

    const toggleFree = (periodId) => {
        setEntries((prev) => {
            const existing = prev[entryKey] || {};
            const row = existing[periodId] || emptyEntry();
            return { ...prev, [entryKey]: { ...existing, [periodId]: { ...row, isFree: !row.isFree } } };
        });
    };

    const toggleStatus = (periodId, code) => {
        setEntries((prev) => {
            const existing = prev[entryKey] || {};
            const row = existing[periodId] || emptyEntry();
            const set = new Set(row.statuses);
            if (set.has(code)) set.delete(code); else set.add(code);
            return { ...prev, [entryKey]: { ...existing, [periodId]: { ...row, statuses: Array.from(set) } } };
        });
    };

    const isRowFilled = (row) => !!(row && (row.isFree || row.subject || row.topic?.trim() || row.statuses?.length));

    const filledCount = useMemo(
        () => periods.reduce((n, p) => n + (isRowFilled(dayEntries[p.id]) ? 1 : 0), 0),
        [periods, dayEntries]
    );
    const completion = periods.length ? Math.round((filledCount / periods.length) * 100) : 0;

    const dayName = useMemo(() => {
        try {
            const d = new Date(`${selectedDate}T00:00:00`);
            return DAY_NAMES[d.getDay()];
        } catch { return ''; }
    }, [selectedDate]);

    const handleSaveAll = () => {
        if (filledCount === 0) {
            setSnack({ open: true, ok: false, msg: 'Fill at least one period before saving.' });
            return;
        }
        // Validate each filled (non-free) period has class, section & subject
        const bad = periods.find((p) => {
            const row = dayEntries[p.id];
            if (!row || row.isFree) return false;
            if (!isRowFilled(row)) return false;
            return !row.grade || !row.section || !row.subject;
        });
        if (bad) {
            setSnack({ open: true, ok: false, msg: `Pick class, section & subject for ${bad.name}.` });
            return;
        }
        setSnack({ open: true, ok: true, msg: `Work done saved (${filledCount}/${periods.length} periods).` });
    };

    const openAddPeriod = () => {
        setPeriodForm({ name: `Period ${periods.length + 1}`, startTime: '', endTime: '' });
        setPeriodDialog({ open: true });
    };
    const savePeriod = () => {
        if (!periodForm.name.trim()) return;
        const nextId = Math.max(0, ...periods.map((p) => p.id)) + 1;
        setPeriods((prev) => [...prev, { id: nextId, ...periodForm }]);
        setPeriodDialog({ open: false });
    };

    const filteredHistory = useMemo(() => {
        const q = historySearch.trim().toLowerCase();
        if (!q) return MOCK_HISTORY;
        return MOCK_HISTORY.filter((h) => h.date.includes(q) || h.grade.toLowerCase().includes(q) || h.section.toLowerCase().includes(q));
    }, [historySearch]);

    // ── Class Wise mock data ──────────────────────────────────────────────────
    // For the chosen class+section, show each period's work done + staff leave status.
    // Leave / done / pending come from the backend (Work Done + Leave Management) later.
    const classWisePeriods = useMemo(() => {
        const subjects = ['English', 'Mathematics', 'Science', 'Social', 'Hindi', 'Computer', 'PT', 'Yoga'];
        return periods.map((p, idx) => {
            const onLeave = p.id === 4;                 // demo: this period's teacher is on leave
            const pending = !onLeave && idx % 5 === 4;  // demo: some periods not yet filled
            return {
                ...p,
                subject: subjects[idx % subjects.length],
                topic: onLeave || pending ? '' : 'Chapter work & exercises',
                teacher: onLeave ? 'Mrs. Anita R.' : 'Class teacher',
                status: onLeave ? 'leave' : pending ? 'pending' : 'done',
            };
        });
    }, [periods]);

    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: '20px', p: 2, height: '86vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 28, height: 28 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                    </IconButton>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AssignmentTurnedInIcon sx={{ fontSize: 18, color: PRIMARY }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#111827', lineHeight: 1.1 }}>
                            Work Done Report
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#6B7280', mt: 0.2 }}>
                            Digital register · Each period logs its own class & subject
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isAdmin && (
                        <Button
                            onClick={() => navigate('/dashboardmenu/workdone/settings')}
                            startIcon={<SettingsIcon sx={{ fontSize: 16 }} />}
                            sx={{ textTransform: 'none', fontSize: 12.5, fontWeight: 700, border: '1px solid #E5E7EB', color: '#374151', borderRadius: '8px', px: 1.6, height: 34, '&:hover': { bgcolor: '#F9FAFB' } }}
                        >
                            Period Settings
                        </Button>
                    )}
                    {activeTab === 0 && (
                        <Button
                            onClick={handleSaveAll}
                            startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                            variant="contained"
                            disableElevation
                            sx={{ textTransform: 'none', fontSize: 12.5, fontWeight: 700, bgcolor: PRIMARY, color: '#fff', borderRadius: '8px', px: 2, height: 34, boxShadow: `0 2px 6px ${PRIMARY}33`, '&:hover': { bgcolor: PRIMARY_DARK } }}
                        >
                            Save Work Done
                        </Button>
                    )}
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
                <Tab icon={<ClassOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Class Wise" />
                <Tab icon={<HistoryIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="History" />
            </Tabs>

            <Box sx={{ flex: 1, overflowY: 'auto', mt: 1.5, pr: 0.5 }}>
                {/* ───────────────── DAILY ENTRY ───────────────── */}
                {activeTab === 0 && (
                    <>
                        <Grid container spacing={1.5} sx={{ mb: 1.5 }} alignItems="flex-end">
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
                                <Typography sx={{ fontSize: 10.5, color: PRIMARY_DARK, mt: 0.3, fontWeight: 700 }}>
                                    {dayName}{selectedDate > toIsoDate(today) ? ' · Future (plan ahead)' : ''}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 9 }}>
                                <Box sx={{ p: 1.2, borderRadius: '8px', border: '1px solid #E5E7EB', bgcolor: '#FAFAFA', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 15, color: '#6B7280' }} />
                                    <Typography sx={{ fontSize: 11.5, color: '#6B7280', fontWeight: 600 }}>
                                        These are your assigned periods. Pick the class &amp; section for each period — pick a future date above to plan ahead.
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Progress + add period */}
                        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Box sx={{ p: 1.4, borderRadius: '10px', border: `1px solid ${PRIMARY_BORDER}`, bgcolor: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
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
                                    sx={{ textTransform: 'none', fontSize: 12.5, fontWeight: 700, height: 40, border: '1px dashed #9CA3AF', color: '#374151', borderRadius: '8px', '&:hover': { bgcolor: '#F9FAFB', borderColor: PRIMARY_DARK, color: PRIMARY_DARK } }}
                                >
                                    Add Extra Period
                                </Button>
                            </Grid>
                        </Grid>

                        {/* Status legend */}
                        <Box sx={{ p: 1.2, borderRadius: '8px', border: '1px solid #E5E7EB', bgcolor: '#FAFAFA', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
                                <InfoOutlinedIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status Indicator Legend</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                                {STATUS_INDICATORS.map((s) => (
                                    <Box key={s.code} sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 0.8, py: 0.2, borderRadius: '6px', bgcolor: s.bg, border: `1px solid ${s.color}33` }}>
                                        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.code}</Typography>
                                        <Typography sx={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.label}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Period cards */}
                        <Grid container spacing={1.5}>
                            {periods.map((p) => {
                                const row = dayEntries[p.id] || emptyEntry();
                                const subjectColor = colorForSubject(row.subject);
                                const filled = isRowFilled(row);
                                const rowGrade = grades?.find((g) => g.sign === row.grade) || null;
                                const rowSections = rowGrade?.sections || [];
                                const rowSubjects = row.grade ? getSubjectsForGrade(row.grade) : [];
                                return (
                                    <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                                        <Box sx={{
                                            p: 1.4, borderRadius: '10px',
                                            border: '1px solid', borderColor: row.isFree ? '#FDE68A' : filled ? PRIMARY_BORDER : '#E5E7EB',
                                            bgcolor: row.isFree ? '#FFFBEB' : '#fff',
                                            transition: '0.2s', '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                                        }}>
                                            {/* Card header — period info + Free Period toggle (no edit/delete here) */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                    <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: row.isFree ? '#F59E0B' : filled ? PRIMARY : '#F3F4F6', color: row.isFree || filled ? '#fff' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                                                        {p.id}
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{p.name}</Typography>
                                                        {p.startTime && p.endTime && (
                                                            <Typography sx={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>{p.startTime} – {p.endTime}</Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            size="small"
                                                            checked={!!row.isFree}
                                                            onChange={() => toggleFree(p.id)}
                                                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#F59E0B' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#F59E0B' } }}
                                                        />
                                                    }
                                                    label={<Typography sx={{ fontSize: 11, fontWeight: 700, color: row.isFree ? '#B45309' : '#6B7280' }}>Free Period</Typography>}
                                                    sx={{ m: 0 }}
                                                />
                                            </Box>

                                            {row.isFree ? (
                                                <Box sx={{ py: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6, borderRadius: '8px', border: '1px dashed #FCD34D', bgcolor: '#FFF7ED' }}>
                                                    <MeetingRoomOutlinedIcon sx={{ fontSize: 26, color: '#B45309' }} />
                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#B45309' }}>Marked as Free Period</Typography>
                                                    <Typography sx={{ fontSize: 11, color: '#92400E' }}>No class / subject recorded for this period.</Typography>
                                                </Box>
                                            ) : (
                                                <Grid container spacing={1}>
                                                    {/* Class + Section — per period */}
                                                    <Grid size={{ xs: 6, sm: 3 }}>
                                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Class</Typography>
                                                        <FormControl fullWidth size="small">
                                                            <Select
                                                                value={row.grade || ''}
                                                                displayEmpty
                                                                onChange={(e) => setPeriodClass(p.id, e.target.value)}
                                                                sx={{ borderRadius: '6px', height: 34, fontSize: 12.5, fontWeight: 600, textTransform: 'uppercase' }}
                                                            >
                                                                <MenuItem value="" sx={{ fontSize: 12.5, color: '#9CA3AF' }}>Class</MenuItem>
                                                                {(grades || []).map((g) => (
                                                                    <MenuItem key={g.sign} value={g.sign} sx={{ fontSize: 12.5, textTransform: 'uppercase', fontWeight: 600 }}>{g.sign}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid size={{ xs: 6, sm: 3 }}>
                                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Section</Typography>
                                                        <FormControl fullWidth size="small" disabled={!row.grade}>
                                                            <Select
                                                                value={row.section || ''}
                                                                displayEmpty
                                                                onChange={(e) => setEntryField(p.id, 'section', e.target.value)}
                                                                sx={{ borderRadius: '6px', height: 34, fontSize: 12.5, fontWeight: 600 }}
                                                            >
                                                                <MenuItem value="" sx={{ fontSize: 12.5, color: '#9CA3AF' }}>Sec</MenuItem>
                                                                {rowSections.map((s) => (
                                                                    <MenuItem key={s} value={s} sx={{ fontSize: 12.5 }}>{s}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    {/* Subject — grade subjects + custom periods (PT/Yoga) */}
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                                                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Subject</Typography>
                                                            {row.subject && (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, px: 0.6, py: 0.05, borderRadius: '4px', bgcolor: `${subjectColor}1A` }}>
                                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: subjectColor }} />
                                                                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: subjectColor }}>{row.subject}</Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                        <Autocomplete
                                                            size="small"
                                                            options={rowSubjects}
                                                            getOptionLabel={(o) => o || ''}
                                                            value={row.subject || null}
                                                            disabled={!row.grade}
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
                                                                    placeholder={row.grade ? 'Pick subject' : 'Pick class first'}
                                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', height: 34, fontSize: 12.5, fontWeight: 600 } }}
                                                                />
                                                            )}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Page / Reference</Typography>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            placeholder="e.g. pg 32, L1 (III)"
                                                            value={row.pageRef}
                                                            onChange={(e) => setEntryField(p.id, 'pageRef', e.target.value)}
                                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', height: 34, fontSize: 12.5 } }}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>Topic / Activity</Typography>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            multiline
                                                            minRows={1}
                                                            maxRows={3}
                                                            placeholder="e.g. Tenses I & II, Chapter 5 Algebra"
                                                            value={row.topic}
                                                            onChange={(e) => setEntryField(p.id, 'topic', e.target.value)}
                                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: 12.5 } }}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12 }}>
                                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Status Indicators</Typography>
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
                                                                            height: 24, fontSize: 11, fontWeight: 800, fontFamily: 'monospace', cursor: 'pointer',
                                                                            bgcolor: active ? s.color : s.bg, color: active ? '#fff' : s.color,
                                                                            border: '1px solid', borderColor: active ? s.color : `${s.color}33`,
                                                                            '&:hover': { bgcolor: active ? s.color : `${s.color}33` },
                                                                        }}
                                                                    />
                                                                );
                                                            })}
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            )}
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

                {/* ───────────────── CLASS WISE ───────────────── */}
                {activeTab === 1 && (
                    <>
                        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Class</Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={cwGradeSign || ''}
                                        onChange={(e) => {
                                            const sign = e.target.value;
                                            setCwGradeSign(sign);
                                            const g = grades.find((x) => x.sign === sign);
                                            setCwSection(g?.sections?.[0] || null);
                                        }}
                                        sx={{ borderRadius: '8px', height: 36, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}
                                    >
                                        {(grades || []).map((g) => (
                                            <MenuItem key={g.sign} value={g.sign} sx={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>{g.sign}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 8, md: 9 }}>
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Section</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                    {(grades?.find((g) => g.sign === cwGradeSign)?.sections || []).map((s) => {
                                        const active = cwSection === s;
                                        return (
                                            <Box
                                                key={s}
                                                onClick={() => setCwSection(s)}
                                                sx={{
                                                    px: 1.6, height: 36, display: 'flex', alignItems: 'center', borderRadius: '8px', cursor: 'pointer',
                                                    border: '1.5px solid', borderColor: active ? PRIMARY : '#E5E7EB',
                                                    bgcolor: active ? PRIMARY_LIGHT : '#fff', color: active ? PRIMARY_DARK : '#374151',
                                                    fontSize: 13, fontWeight: 700, transition: '0.15s',
                                                }}
                                            >
                                                Sec {s}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ p: 1.2, borderRadius: '8px', border: '1px solid #FECACA', bgcolor: '#FEF2F2', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <EventBusyIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                            <Typography sx={{ fontSize: 11.5, color: '#991B1B', fontWeight: 600 }}>
                                Periods marked <strong>Teacher on Leave</strong> can be covered by any free staff. (Leave data comes from Leave Management.)
                            </Typography>
                        </Box>

                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#111827', mb: 1 }}>
                            {cwGradeSign?.toUpperCase()} · Section {cwSection} — Period Work Done
                        </Typography>

                        <Grid container spacing={1.5}>
                            {classWisePeriods.map((cp) => {
                                const isLeave = cp.status === 'leave';
                                const isPending = cp.status === 'pending';
                                const accent = isLeave ? '#DC2626' : isPending ? '#F59E0B' : PRIMARY;
                                const accentBg = isLeave ? '#FEF2F2' : isPending ? '#FFFBEB' : '#fff';
                                const subjectColor = colorForSubject(cp.subject);
                                return (
                                    <Grid size={{ xs: 12, md: 6 }} key={cp.id}>
                                        <Box sx={{ p: 1.4, borderRadius: '10px', border: '1px solid', borderColor: isLeave ? '#FECACA' : isPending ? '#FDE68A' : '#E5E7EB', bgcolor: accentBg }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                    <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                                                        {cp.id}
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{cp.name}</Typography>
                                                        {cp.startTime && cp.endTime && (
                                                            <Typography sx={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>{cp.startTime} – {cp.endTime}</Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {isLeave ? (
                                                    <Chip icon={<EventBusyIcon sx={{ fontSize: '13px !important' }} />} label="Teacher on Leave" size="small" sx={{ height: 22, fontSize: 10.5, fontWeight: 800, bgcolor: '#FEE2E2', color: '#B91C1C', '& .MuiChip-icon': { color: '#B91C1C' } }} />
                                                ) : isPending ? (
                                                    <Chip label="Pending" size="small" sx={{ height: 22, fontSize: 10.5, fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309' }} />
                                                ) : (
                                                    <Chip icon={<CheckCircleOutlineIcon sx={{ fontSize: '13px !important' }} />} label="Done" size="small" sx={{ height: 22, fontSize: 10.5, fontWeight: 800, bgcolor: '#E8F5E9', color: '#2E7D32', '& .MuiChip-icon': { color: '#2E7D32' } }} />
                                                )}
                                            </Box>

                                            <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 0.8, py: 0.2, borderRadius: '6px', bgcolor: `${subjectColor}1A` }}>
                                                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: subjectColor }} />
                                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: subjectColor }}>{cp.subject}</Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: 11.5, color: '#6B7280', fontWeight: 600 }}>{cp.teacher}</Typography>
                                            </Box>

                                            <Typography sx={{ fontSize: 12, color: isLeave || isPending ? '#9CA3AF' : '#374151', mt: 0.8, fontStyle: isLeave || isPending ? 'italic' : 'normal' }}>
                                                {isLeave ? 'No work recorded — teacher on leave. Free staff can cover this period.' : isPending ? 'Work not entered yet.' : cp.topic}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </>
                )}

                {/* ───────────────── HISTORY ───────────────── */}
                {activeTab === 2 && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Previous Entries</Typography>
                            <TextField
                                size="small"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                placeholder="Search by date, grade, section"
                                sx={{ width: { xs: '100%', sm: 320 }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 34, fontSize: 12.5 } }}
                                slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment>) } }}
                            />
                        </Box>
                        <Grid container spacing={1}>
                            {filteredHistory.map((h, i) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                    <Box sx={{ p: 1.4, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer', transition: '0.15s', '&:hover': { borderColor: PRIMARY_BORDER, bgcolor: PRIMARY_LIGHT } }}>
                                        <Box sx={{ width: 38, height: 38, borderRadius: '8px', bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CalendarTodayIcon sx={{ fontSize: 16, color: PRIMARY_DARK }} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>{h.date}</Typography>
                                            <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Grade {h.grade} · Sec {h.section}</Typography>
                                        </Box>
                                        <Chip label={`${h.filled}/8`} size="small" sx={{ height: 22, fontSize: 10.5, fontWeight: 800, bgcolor: PRIMARY, color: '#fff' }} />
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

            {/* Add Extra Period dialog */}
            <Dialog open={periodDialog.open} onClose={() => setPeriodDialog({ open: false })} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800 }}>Add Extra Period</Typography>
                    <IconButton size="small" onClick={() => setPeriodDialog({ open: false })}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
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
                    <Button onClick={() => setPeriodDialog({ open: false })} sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', px: 2, height: 34 }}>Cancel</Button>
                    <Button onClick={savePeriod} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: PRIMARY_DARK }, borderRadius: '6px', px: 2, height: 34 }}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Snack dialog */}
            <Dialog open={snack.open} onClose={() => setSnack({ ...snack, open: false })} maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 280 }}>
                    {snack.ok ? <CheckCircleOutlineIcon sx={{ fontSize: 28, color: PRIMARY_DARK }} /> : <InfoOutlinedIcon sx={{ fontSize: 28, color: '#DC2626' }} />}
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{snack.msg}</Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
