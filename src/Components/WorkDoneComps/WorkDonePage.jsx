import React, { useEffect, useMemo, useState } from 'react';
import {
    Autocomplete, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControl, FormControlLabel, Grid, IconButton, MenuItem,
    Select, Switch, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SnackBar from '../SnackBar';
import { selectGrades } from '../../Redux/Slices/DropdownController';
import { selectAcademicYear } from '../../Redux/Slices/academicYearSlice';
import { GetWorkdoneClassWise, GetWorkdoneTeacherWise, getUsersByUserType, PostWorkdoneReport, GetWorkdonePeriods, GetCustomWorkdoneSubjects } from '../../Api/Api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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

const SUBJECT_PALETTE = ['#1565C0', '#C62828', '#2E7D32', '#EF6C00', '#7B1FA2', '#00838F', '#5D4037', '#00897B', '#AD1457', '#455A64'];

// Each period column gets its own colour theme (matches the project palette) — cycles if there are more periods.
const PERIOD_COLORS = [
    { color: '#3457D5', bg: '#EEF1FC', border: '#CBD6F7' }, // blue
    { color: '#7DC353', bg: '#F1F9EB', border: '#D4E9C4' }, // green
    { color: '#FF6B35', bg: '#FFF1EB', border: '#FFD4C4' }, // orange
    { color: '#8600BB', bg: '#F6EBFB', border: '#E4C4F0' }, // purple
    { color: '#00ACC1', bg: '#E5F7FA', border: '#BAE8EE' }, // teal
    { color: '#E30053', bg: '#FDEAF1', border: '#F7C4D7' }, // pink
    { color: '#FF9800', bg: '#FFF6E6', border: '#FFE3B5' }, // amber
    { color: '#5E35B1', bg: '#EFEAF7', border: '#D4C4EC' }, // deep purple
];
const periodColor = (n) => PERIOD_COLORS[((Number(n) || 1) - 1 + PERIOD_COLORS.length * 100) % PERIOD_COLORS.length];

// ── Date-range navigator helpers (YYYY-MM-DD in/out) ──────────────────────────
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const isoParts = (iso) => iso.split('-').map(Number); // [y, m, d]
const shiftIso = (iso, days) => {
    const [y, m, d] = isoParts(iso);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
};
const rangeLength = (from, to) => {
    const [fy, fm, fd] = isoParts(from);
    const [ty, tm, td] = isoParts(to);
    return Math.round((new Date(ty, tm - 1, td) - new Date(fy, fm - 1, fd)) / 86400000) + 1;
};
const formatRange = (from, to) => {
    if (!from || !to) return '';
    const [fy, fm, fd] = isoParts(from);
    const [ty, tm, td] = isoParts(to);
    if (from === to) return `${fd} ${MONTHS_SHORT[fm - 1]} ${fy}`;
    if (fy === ty && fm === tm) return `${fd} – ${td} ${MONTHS_SHORT[tm - 1]} ${ty}`;
    if (fy === ty) return `${fd} ${MONTHS_SHORT[fm - 1]} – ${td} ${MONTHS_SHORT[tm - 1]} ${ty}`;
    return `${fd} ${MONTHS_SHORT[fm - 1]} ${fy} – ${td} ${MONTHS_SHORT[tm - 1]} ${ty}`;
};

// Date-range pill — shows the actual from→to dates with a calendar icon and ‹ › to page the window
const DateRangeNav = ({ from, to, onChange }) => {
    const page = (dir) => {
        const len = rangeLength(from, to) || 1;
        onChange(shiftIso(from, dir * len), shiftIso(to, dir * len));
    };
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, border: '1px solid #E5E7EB', borderRadius: '8px', height: 36, px: 0.4, bgcolor: '#fff' }}>
            <IconButton size="small" onClick={() => page(-1)} sx={{ width: 26, height: 26 }}>
                <ChevronLeftIcon sx={{ fontSize: 18, color: '#6B7280' }} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 13, color: '#6B7280' }} />
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap' }}>{formatRange(from, to)}</Typography>
            </Box>
            <IconButton size="small" onClick={() => page(1)} sx={{ width: 26, height: 26 }}>
                <ChevronRightIcon sx={{ fontSize: 18, color: '#6B7280' }} />
            </IconButton>
        </Box>
    );
};

const colorForSubject = (name) => {
    if (!name) return PRIMARY;
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return SUBJECT_PALETTE[hash % SUBJECT_PALETTE.length];
};

const toIsoDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// API expects DD-MM-YYYY; <input type="date"> gives YYYY-MM-DD
const toDDMMYYYY = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}-${m}-${y}`;
};

const statusMeta = (code) =>
    STATUS_INDICATORS.find((s) => s.code === code) || { code, color: '#374151', bg: '#F3F4F6' };

// Accepts DD-MM-YYYY or YYYY-MM-DD
const dayNameOf = (s) => {
    if (!s) return '';
    const parts = String(s).split('-');
    if (parts.length !== 3) return '';
    const [a, b, c] = parts;
    const iso = a.length === 4 ? `${a}-${b}-${c}` : `${c}-${b}-${a}`;
    try { return DAY_NAMES[new Date(`${iso}T00:00:00`).getDay()]; } catch { return ''; }
};

const getInitials = (name = '') =>
    String(name).split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const StatusChips = ({ codes = [] }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, mt: 0.4 }}>
        {codes.map((sc) => {
            const m = statusMeta(sc);
            return (
                <Box key={sc} sx={{ px: 0.55, py: '1px', borderRadius: '4px', bgcolor: m.bg, border: `1px solid ${m.color}33` }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 800, color: m.color, fontFamily: 'monospace', lineHeight: 1.4 }}>{sc}</Typography>
                </Box>
            );
        })}
    </Box>
);

// Period column header — plain, like the reference scheduler
const ReportPeriodHead = ({ name, startTime, endTime }) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#1F2937', lineHeight: 1.1 }} noWrap>{name}</Typography>
        {(startTime || endTime) && (
            <Typography sx={{ fontSize: 9.5, fontWeight: 600, color: '#9CA3AF' }}>{startTime} – {endTime}</Typography>
        )}
    </Box>
);

// Empty / not-filled period cell — blank like the reference grid
const EmptyCell = () => <Box sx={{ minHeight: 56 }} />;

// A single work-done entry. Normal entries are plain (white) with a coloured left
// accent bar per period; leave / free periods get a soft tint (like the reference).
const EntryCard = ({ entry, color, showTeacher = false, showClass = false }) => {
    if (!entry) return null;
    if (entry.isFreePeriod) {
        return (
            <Box sx={{ minHeight: 56, borderRadius: '8px', bgcolor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.3, p: 1 }}>
                <MeetingRoomOutlinedIcon sx={{ fontSize: 18, color: '#B45309' }} />
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#B45309' }}>Free Period</Typography>
            </Box>
        );
    }
    if (entry.entryType === 'leave') {
        return (
            <Box sx={{ minHeight: 56, borderRadius: '8px', bgcolor: '#FFF7ED', border: '1px solid #FED7AA', p: 1 }}>
                {showTeacher && entry.teacherName && (
                    <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#9A3412', textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.3 }} noWrap>{entry.teacherName}</Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EventBusyIcon sx={{ fontSize: 15, color: '#C2410C' }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#C2410C' }}>Leave</Typography>
                </Box>
                {entry.topicActivity && <Typography sx={{ fontSize: 10.5, color: '#9A3412', mt: 0.2 }}>{entry.topicActivity}</Typography>}
            </Box>
        );
    }
    const c = color;
    return (
        <Box sx={{ minHeight: 56, pl: 1, py: 0.3, borderLeft: `3px solid ${c.color}` }}>
            {showTeacher && entry.teacherName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.4 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, bgcolor: c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8.5, fontWeight: 800 }}>
                        {getInitials(entry.teacherName)}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: 1.15 }} noWrap>{entry.teacherName}</Typography>
                        <Typography sx={{ fontSize: 8.5, color: '#94A3B8', fontFamily: 'monospace' }}>#{entry.rollNumber}</Typography>
                    </Box>
                </Box>
            )}
            {showClass && (entry.grade || entry.section) && (
                <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.3 }}>{entry.grade} {entry.section}</Typography>
            )}
            {entry.subject && <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: c.color, lineHeight: 1.2 }}>{entry.subject}</Typography>}
            {entry.topicActivity && <Typography sx={{ fontSize: 11, color: '#334155', lineHeight: 1.3, mt: 0.2 }}>{entry.topicActivity}</Typography>}
            {entry.pageReference && <Typography sx={{ fontSize: 10, color: '#94A3B8', mt: 0.2 }}>Pg {entry.pageReference}</Typography>}
            {entry.statusCodes?.length > 0 && <StatusChips codes={entry.statusCodes} />}
        </Box>
    );
};

// Each period now carries its OWN class & section (not a common one for the whole day)
const emptyEntry = () => ({ grade: '', section: '', subject: '', topic: '', statuses: [], pageRef: '', isFree: false });

export default function WorkDonePage() {
    const navigate = useNavigate();
    const grades = useSelector(selectGrades);
    const user = useSelector((state) => state.auth);
    const userType = user?.userType;
    const isAdmin = userType === 'superadmin' || userType === 'admin';
    const isTeacher = userType === 'teacher';
    const token = '123';
    const academicYear = useSelector(selectAcademicYear);

    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(toIsoDate(today));

    const [periods, setPeriods] = useState(DEFAULT_PERIODS);
    const [customSubjects, setCustomSubjects] = useState([]);
    const [entries, setEntries] = useState({});
    const [entryType, setEntryType] = useState('normal'); // 'normal' = Today Plan, 'leave' = Leave Plan
    const [saving, setSaving] = useState(false);

    const [activeTab, setActiveTab] = useState(userType === 'teacher' ? 0 : 1);
    const [periodDialog, setPeriodDialog] = useState({ open: false });
    const [periodForm, setPeriodForm] = useState({ name: '', startTime: '', endTime: '' });
    const [snack, setSnack] = useState({ open: false, msg: '', ok: true });

    // ── Report tabs (Teacher-wise / Class-wise) ───────────────────────────────
    const [datePreset, setDatePreset] = useState('today');     // 'today' | '7' | '15' | 'custom'
    const [fromDate, setFromDate] = useState(toIsoDate(today));
    const [toDate, setToDate] = useState(toIsoDate(today));
    const [reportLoading, setReportLoading] = useState(false);
    // teacher-wise
    const [staffOptions, setStaffOptions] = useState([]);
    const [staffRoll, setStaffRoll] = useState('');
    const [teacherData, setTeacherData] = useState(null);
    // class-wise
    const [cwGradeSign, setCwGradeSign] = useState(null);
    const [cwSection, setCwSection] = useState(null);
    const [cwPreset, setCwPreset] = useState('7');             // 'today' | '7' | '15' | 'custom' — defaults to 7 days
    const [cwFromDate, setCwFromDate] = useState(() => { const d = new Date(today); d.setDate(d.getDate() - 6); return toIsoDate(d); });
    const [cwToDate, setCwToDate] = useState(toIsoDate(today));
    const [classData, setClassData] = useState(null);

    // Subjects available for a given grade sign = that grade's subjects + custom period-subjects
    const getSubjectsForGrade = (gradeSign) => {
        const grade = grades?.find((g) => g.sign === gradeSign);
        const exams = grade?.exams || [];
        const all = exams.flatMap((e) => [
            ...(Array.isArray(e?.primarySubjects) ? e.primarySubjects : []),
            ...(Array.isArray(e?.secondarySubjects) ? e.secondarySubjects : []),
        ]);
        const base = Array.from(new Set(all.filter(Boolean).map(String)));
        // Grade subjects first, then the school-wide custom periods (PT, Yoga, ...) from settings
        return [...base, ...customSubjects];
    };

    // Load the configured periods + custom period-subjects for the academic year (set in Period Settings)
    useEffect(() => {
        if (!academicYear) return;
        let cancelled = false;
        (async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [pRes, sRes] = await Promise.allSettled([
                    axios.get(GetWorkdonePeriods, { params: { academicYear }, headers }),
                    axios.get(GetCustomWorkdoneSubjects, { params: { academicYear }, headers }),
                ]);
                if (cancelled) return;
                if (pRes.status === 'fulfilled' && !pRes.value.data?.error) {
                    const apiPeriods = (pRes.value.data?.periods || [])
                        .slice()
                        .sort((a, b) => (a.sortOrder ?? a.periodNumber) - (b.sortOrder ?? b.periodNumber))
                        .map((p) => ({ id: p.periodNumber, name: p.name || `Period ${p.periodNumber}`, startTime: p.startTime || '', endTime: p.endTime || '' }));
                    if (apiPeriods.length) setPeriods(apiPeriods);
                }
                if (sRes.status === 'fulfilled' && !sRes.value.data?.error) {
                    setCustomSubjects(sRes.value.data?.subjects || []);
                }
            } catch {
                /* keep defaults on failure */
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [academicYear]);

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

    const handleSaveAll = async () => {
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

        // Build the periods payload from the filled rows
        const payloadPeriods = periods
            .filter((p) => isRowFilled(dayEntries[p.id]))
            .map((p) => {
                const row = dayEntries[p.id];
                return {
                    periodNumber: p.id,
                    isFreePeriod: !!row.isFree,
                    grade: row.isFree ? null : (row.grade || null),
                    section: row.isFree ? null : (row.section || null),
                    subject: row.isFree ? null : (row.subject || null),
                    pageReference: row.isFree ? null : (row.pageRef || null),
                    topicActivity: row.isFree ? null : (row.topic?.trim() || null),
                    statusCodes: row.isFree ? [] : (row.statuses || []),
                };
            });

        const payload = {
            date: toDDMMYYYY(selectedDate),
            entryType,                                  // 'normal' (Today Plan) | 'leave' (Leave Plan)
            rollNumber: String(user?.rollNumber || ''),
            userType: userType || '',
            periods: payloadPeriods,
        };

        setSaving(true);
        try {
            const res = await axios.post(PostWorkdoneReport, payload, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (res.data?.error) throw new Error(res.data.message || 'Save failed');
            setSnack({
                open: true, ok: true,
                msg: `${entryType === 'leave' ? 'Leave plan' : "Today's work"} saved (${payloadPeriods.length} period${payloadPeriods.length !== 1 ? 's' : ''}).`,
            });
        } catch (err) {
            setSnack({ open: true, ok: false, msg: err?.response?.data?.message || err.message || 'Failed to save work done.' });
        } finally {
            setSaving(false);
        }
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

    // ── Report tab logic ──────────────────────────────────────────────────────
    const applyPreset = (preset) => {
        setDatePreset(preset);
        if (preset === 'custom') return;
        const end = new Date();
        const start = new Date();
        if (preset === '7') start.setDate(end.getDate() - 6);
        if (preset === '15') start.setDate(end.getDate() - 14);
        setFromDate(toIsoDate(start));
        setToDate(toIsoDate(end));
    };

    const applyCwPreset = (preset) => {
        setCwPreset(preset);
        if (preset === 'custom') return;
        const end = new Date();
        const start = new Date();
        if (preset === '7') start.setDate(end.getDate() - 6);
        if (preset === '15') start.setDate(end.getDate() - 14);
        setCwFromDate(toIsoDate(start));
        setCwToDate(toIsoDate(end));
    };

    // Load staff list once (for the teacher-wise picker)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await axios.get(getUsersByUserType, {
                    params: { userType: 'teacher' },
                    headers: { Authorization: `Bearer ${token}` },
                });
                const flat = Array.isArray(res.data?.data)
                    ? res.data.data.flatMap((g) => g.users || [])
                    : (res.data?.users || res.data?.data || []);
                if (!cancelled) setStaffOptions(flat);
            } catch {
                if (!cancelled) setStaffOptions([]);
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTeacherWise = async () => {
        if (!fromDate || !toDate) { setTeacherData(null); return; }
        setReportLoading(true);
        try {
            const res = await axios.get(GetWorkdoneTeacherWise, {
                params: { fromDate: toDDMMYYYY(fromDate), toDate: toDDMMYYYY(toDate) },
                headers: { Authorization: `Bearer ${token}` },
            });
            setTeacherData(res.data?.error ? null : res.data);
        } catch {
            setTeacherData(null);
        } finally {
            setReportLoading(false);
        }
    };

    const fetchClassWise = async () => {
        if (!cwGradeSign || !cwSection || !cwFromDate || !cwToDate) { setClassData(null); return; }
        setReportLoading(true);
        try {
            const res = await axios.get(GetWorkdoneClassWise, {
                params: { fromDate: toDDMMYYYY(cwFromDate), toDate: toDDMMYYYY(cwToDate), grade: cwGradeSign, section: cwSection },
                headers: { Authorization: `Bearer ${token}` },
            });
            setClassData(res.data?.error ? null : res.data);
        } catch {
            setClassData(null);
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 1) return;
        fetchTeacherWise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, fromDate, toDate]);

    useEffect(() => {
        if (activeTab !== 2) return;
        fetchClassWise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, cwGradeSign, cwSection, cwFromDate, cwToDate]);

    // Teacher-wise: always show every configured period (from GetWorkdonePeriods),
    // then merge in any extra periods that appear across all teachers' days.
    const teacherPeriodCols = useMemo(() => {
        const map = new Map();
        periods.forEach((p) => map.set(p.id, { name: p.name || `Period ${p.id}`, startTime: p.startTime, endTime: p.endTime }));
        (teacherData?.teachers || []).forEach((t) =>
            (t.days || []).forEach((d) =>
                (d.periods || []).forEach((p) => {
                    if (!map.has(p.periodNumber)) map.set(p.periodNumber, { name: p.name || `Period ${p.periodNumber}`, startTime: p.startTime, endTime: p.endTime });
                })
            )
        );
        return Array.from(map.entries()).sort((a, b) => a[0] - b[0]).map(([number, info]) => ({ number, ...info }));
    }, [teacherData, periods]);

    // API returns every teacher for the range; the Staff picker is an optional client-side filter.
    const teacherList = useMemo(() => {
        const all = teacherData?.teachers || [];
        return staffRoll ? all.filter((t) => t.rollNumber === staffRoll) : all;
    }, [teacherData, staffRoll]);

    // Flatten to one row per staff per day so the table lists each staff against all periods.
    const teacherRows = useMemo(() => {
        const rows = [];
        teacherList.forEach((t) => {
            const days = t.days || [];
            if (days.length === 0) {
                rows.push({ rollNumber: t.rollNumber, teacherName: t.teacherName, day: null });
            } else {
                days.forEach((d) => rows.push({ rollNumber: t.rollNumber, teacherName: t.teacherName, day: d }));
            }
        });
        return rows;
    }, [teacherList]);

    // Class-wise: columns = every configured period (from GetWorkdonePeriods),
    // merged with any extra periods across all days; rows = one per day.
    const classPeriodCols = useMemo(() => {
        const map = new Map();
        periods.forEach((p) => map.set(p.id, { name: p.name || `Period ${p.id}`, startTime: p.startTime, endTime: p.endTime }));
        (classData?.days || []).forEach((day) =>
            (day.periods || []).forEach((p) => {
                if (!map.has(p.periodNumber)) map.set(p.periodNumber, { name: p.name || `Period ${p.periodNumber}`, startTime: p.startTime, endTime: p.endTime });
            })
        );
        return Array.from(map.entries()).sort((a, b) => a[0] - b[0]).map(([number, info]) => ({ number, ...info }));
    }, [classData, periods]);

    // For a given day + period column, the entries logged in that period.
    const classDayEntries = (day, periodNumber) =>
        (day?.periods || []).find((p) => p.periodNumber === periodNumber)?.entries || [];

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
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                            variant="contained"
                            disableElevation
                            sx={{ textTransform: 'none', fontSize: 12.5, fontWeight: 700, bgcolor: PRIMARY, color: '#fff', borderRadius: '8px', px: 2, height: 34, boxShadow: `0 2px 6px ${PRIMARY}33`, '&:hover': { bgcolor: PRIMARY_DARK }, '&.Mui-disabled': { bgcolor: '#9CA3AF', color: '#fff' } }}
                        >
                            {saving ? 'Saving…' : entryType === 'leave' ? 'Save Leave Plan' : 'Save Work Done'}
                        </Button>
                    )}
                </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, borderBottom: '1px solid #eee' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                        minHeight: 36,
                        '& .MuiTab-root': { textTransform: 'none', fontSize: 12.5, fontWeight: 700, color: '#555', minHeight: 36, px: 2 },
                        '& .Mui-selected': { color: `${PRIMARY_DARK} !important` },
                        '& .MuiTabs-indicator': { backgroundColor: PRIMARY, height: 3, borderRadius: '3px 3px 0 0' },
                    }}
                >
                    {/* {isTeacher && <Tab value={0} icon={<EventNoteIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Daily Entry" />} */}
                    {<Tab value={0} icon={<EventNoteIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Daily Entry" />}
                    <Tab value={1} icon={<PersonOutlineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Teacher-wise" />
                    <Tab value={2} icon={<ClassOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Class-wise" />
                </Tabs>

                {/* Per-tab filters — aligned to the right of the tab bar to keep the table area tall */}
                {activeTab === 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', pb: 0.6 }}>
                        <Autocomplete
                            size="small"
                            options={staffOptions}
                            getOptionLabel={(o) => (o ? `${o.name || ''} (${o.rollNumber || ''})` : '')}
                            isOptionEqualToValue={(o, v) => o.rollNumber === v.rollNumber}
                            onChange={(_, v) => setStaffRoll(v?.rollNumber || '')}
                            sx={{ width: 230 }}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="All staff" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 12.5, fontWeight: 600 } }} />
                            )}
                        />
                        <FormControl size="small" sx={{ width: 140 }}>
                            <Select value={datePreset} onChange={(e) => applyPreset(e.target.value)} sx={{ borderRadius: '8px', height: 36, fontSize: 12.5, fontWeight: 600 }}>
                                <MenuItem value="today" sx={{ fontSize: 13 }}>Today</MenuItem>
                                <MenuItem value="7" sx={{ fontSize: 13 }}>Last 7 Days</MenuItem>
                                <MenuItem value="15" sx={{ fontSize: 13 }}>Last 15 Days</MenuItem>
                                <MenuItem value="custom" sx={{ fontSize: 13 }}>Custom</MenuItem>
                            </Select>
                        </FormControl>
                        <DateRangeNav from={fromDate} to={toDate} onChange={(f, t) => { setFromDate(f); setToDate(t); setDatePreset('custom'); }} />
                        {datePreset === 'custom' && (
                            <>
                                <TextField type="date" size="small" value={fromDate} onChange={(e) => setFromDate(e.target.value)} sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 12.5 } }} />
                                <TextField type="date" size="small" value={toDate} onChange={(e) => setToDate(e.target.value)} sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 12.5 } }} />
                            </>
                        )}
                    </Box>
                )}

                {activeTab === 2 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', pb: 0.6 }}>
                        <FormControl size="small" sx={{ width: 110 }}>
                            <Select
                                value={cwGradeSign || ''}
                                displayEmpty
                                onChange={(e) => { const sign = e.target.value; setCwGradeSign(sign); const g = grades.find((x) => x.sign === sign); setCwSection(g?.sections?.[0] || null); }}
                                renderValue={(v) => (v ? v : 'Class')}
                                sx={{ borderRadius: '8px', height: 36, fontSize: 12.5, fontWeight: 600, textTransform: 'uppercase' }}
                            >
                                {(grades || []).map((g) => (
                                    <MenuItem key={g.sign} value={g.sign} sx={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>{g.sign}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ width: 110 }}>
                            <Select
                                value={cwSection || ''}
                                displayEmpty
                                onChange={(e) => setCwSection(e.target.value)}
                                renderValue={(v) => (v ? `Sec ${v}` : 'Section')}
                                sx={{ borderRadius: '8px', height: 36, fontSize: 12.5, fontWeight: 600 }}
                            >
                                {(grades?.find((g) => g.sign === cwGradeSign)?.sections || []).map((s) => (
                                    <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>Sec {s}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ width: 140 }}>
                            <Select value={cwPreset} onChange={(e) => applyCwPreset(e.target.value)} sx={{ borderRadius: '8px', height: 36, fontSize: 12.5, fontWeight: 600 }}>
                                <MenuItem value="today" sx={{ fontSize: 13 }}>Today</MenuItem>
                                <MenuItem value="7" sx={{ fontSize: 13 }}>Last 7 Days</MenuItem>
                                <MenuItem value="15" sx={{ fontSize: 13 }}>Last 15 Days</MenuItem>
                                <MenuItem value="custom" sx={{ fontSize: 13 }}>Custom</MenuItem>
                            </Select>
                        </FormControl>
                        <DateRangeNav from={cwFromDate} to={cwToDate} onChange={(f, t) => { setCwFromDate(f); setCwToDate(t); setCwPreset('custom'); }} />
                        {cwPreset === 'custom' && (
                            <>
                                <TextField type="date" size="small" value={cwFromDate} onChange={(e) => setCwFromDate(e.target.value)} sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 12.5 } }} />
                                <TextField type="date" size="small" value={cwToDate} onChange={(e) => setCwToDate(e.target.value)} sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 12.5 } }} />
                            </>
                        )}
                    </Box>
                )}
            </Box>

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
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Entry Type</Typography>
                                <Box sx={{ display: 'flex', gap: 0.8 }}>
                                    {[
                                        { key: 'normal', label: 'Today Plan', icon: EventNoteIcon, color: PRIMARY, bg: PRIMARY_LIGHT, border: PRIMARY_BORDER },
                                        { key: 'leave', label: 'Leave Plan', icon: EventBusyIcon, color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
                                    ].map((t) => {
                                        const Icon = t.icon; const active = entryType === t.key;
                                        return (
                                            <Box
                                                key={t.key}
                                                onClick={() => setEntryType(t.key)}
                                                sx={{ flex: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, borderRadius: '8px', cursor: 'pointer', border: '1.5px solid', borderColor: active ? t.color : '#E5E7EB', bgcolor: active ? t.bg : '#fff', color: active ? t.color : '#6B7280', fontSize: 12.5, fontWeight: 700, transition: '0.15s' }}
                                            >
                                                <Icon sx={{ fontSize: 16 }} />
                                                {t.label}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ p: 1.2, borderRadius: '8px', border: '1px solid', borderColor: entryType === 'leave' ? '#FED7AA' : '#E5E7EB', bgcolor: entryType === 'leave' ? '#FFF7ED' : '#FAFAFA', display: 'flex', alignItems: 'center', gap: 0.8, height: 36 }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 15, color: entryType === 'leave' ? '#C2410C' : '#6B7280' }} />
                                    <Typography sx={{ fontSize: 11, color: entryType === 'leave' ? '#9A3412' : '#6B7280', fontWeight: 600, lineHeight: 1.25 }}>
                                        {entryType === 'leave'
                                            ? 'Leave Plan — what a substitute should cover while you’re away.'
                                            : 'Today Plan — record the work done for each period.'}
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

                {/* ───────────────── TEACHER-WISE ───────────────── */}
                {activeTab === 1 && (
                    <>
                        {reportLoading ? (
                            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} sx={{ color: PRIMARY }} /></Box>
                        ) : teacherList.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: 'center', borderRadius: '10px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                <PersonOutlineIcon sx={{ fontSize: 40, color: '#D1D5DB', mb: 1 }} />
                                <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>
                                    {staffRoll ? 'No work done records for this staff in the selected range.' : 'No work done records for the selected date range.'}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#6B7280', mb: 1 }}>
                                    {teacherList.length} staff · {teacherData?.fromDate} → {teacherData?.toDate}
                                </Typography>
                                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', maxHeight: 'calc(86vh - 320px)', overflowX: 'auto' }}>
                                    <Table stickyHeader size="small" sx={{ width: 'auto', borderCollapse: 'separate', borderSpacing: 0 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ position: 'sticky', left: 0, top: 0, zIndex: 4, width: 200, minWidth: 200, bgcolor: '#fff', borderBottom: '1px solid #EAECEF', borderRight: '1px solid #EAECEF' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 }}>Staff</Typography>
                                                </TableCell>
                                                {teacherPeriodCols.map((c) => (
                                                    <TableCell key={c.number} sx={{ width: 190, minWidth: 190, bgcolor: '#fff', borderBottom: '1px solid #EAECEF', borderRight: '1px solid #F1F3F5' }}>
                                                        <ReportPeriodHead name={c.name} startTime={c.startTime} endTime={c.endTime} />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {teacherRows.map((r, idx) => {
                                                const d = r.day;
                                                const dayPeriods = d?.periods || [];
                                                return (
                                                    <TableRow key={`${r.rollNumber}-${d?.date || idx}`} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                                                        <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: '#fff', borderRight: '1px solid #EAECEF', borderBottom: '1px solid #F1F3F5', verticalAlign: 'top' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Box sx={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, bgcolor: colorForSubject(r.teacherName), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                                                                    {getInitials(r.teacherName)}
                                                                </Box>
                                                                <Box sx={{ minWidth: 0 }}>
                                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }} noWrap>{r.teacherName}</Typography>
                                                                    <Typography sx={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>#{r.rollNumber}</Typography>
                                                                </Box>
                                                            </Box>
                                                            {d && (
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.4, mt: 0.6 }}>
                                                                    <Typography sx={{ fontSize: 10.5, color: '#475569', fontWeight: 700 }}>{d.date} · {dayNameOf(d.date)}</Typography>
                                                                    <Chip label={`${dayPeriods.length}/${teacherPeriodCols.length} filled`} size="small" sx={{ height: 18, fontSize: 9.5, fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }} />
                                                                    {d.entryType === 'leave' && (
                                                                        <Chip label="Leave" size="small" sx={{ height: 18, fontSize: 9.5, fontWeight: 800, bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' }} />
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </TableCell>
                                                        {teacherPeriodCols.map((c) => {
                                                            const entry = dayPeriods.find((x) => x.periodNumber === c.number);
                                                            return (
                                                                <TableCell key={c.number} sx={{ verticalAlign: 'top', borderRight: '1px solid #F1F3F5', borderBottom: '1px solid #F1F3F5', p: 0.8 }}>
                                                                    {entry ? <EntryCard entry={entry} color={periodColor(c.number)} showClass /> : <EmptyCell />}
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                            </>
                        )}

                {/* ───────────────── CLASS-WISE ───────────────── */}
                {activeTab === 2 && (
                    <>
                        {reportLoading ? (
                                    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} sx={{ color: PRIMARY }} /></Box>
                                ) : (
                                    <>
                                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#111827', mb: 1 }}>
                                            {classData?.grade || cwGradeSign} · Section {classData?.section || cwSection}
                                            <Box component="span" sx={{ fontWeight: 600, color: '#6B7280', ml: 1 }}>{classData?.fromDate || toDDMMYYYY(cwFromDate)} → {classData?.toDate || toDDMMYYYY(cwToDate)}</Box>
                                        </Typography>
                                        <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', maxHeight: 'calc(86vh - 320px)', overflowX: 'auto' }}>
                                            <Table stickyHeader size="small" sx={{ width: 'auto', borderCollapse: 'separate', borderSpacing: 0 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ position: 'sticky', left: 0, top: 0, zIndex: 4, width: 150, minWidth: 150, bgcolor: '#fff', borderBottom: '1px solid #EAECEF', borderRight: '1px solid #EAECEF' }}>
                                                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 }}>Date / Day</Typography>
                                                        </TableCell>
                                                        {classPeriodCols.map((c) => (
                                                            <TableCell key={c.number} sx={{ width: 200, minWidth: 200, bgcolor: '#fff', borderBottom: '1px solid #EAECEF', borderRight: '1px solid #F1F3F5' }}>
                                                                <ReportPeriodHead name={c.name} startTime={c.startTime} endTime={c.endTime} />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {!classData?.days?.length ? (
                                                        <TableRow>
                                                            <TableCell colSpan={classPeriodCols.length + 1} sx={{ textAlign: 'center', py: 5, color: '#9CA3AF', fontSize: 13, fontWeight: 600 }}>
                                                                No work done records for this class in the selected range.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : classData.days.map((day) => (
                                                        <TableRow key={day.date} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                                                            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: '#fff', borderRight: '1px solid #EAECEF', borderBottom: '1px solid #F1F3F5', verticalAlign: 'top' }}>
                                                                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>{day.date}</Typography>
                                                                <Typography sx={{ fontSize: 10.5, color: '#475569', fontWeight: 700 }}>{dayNameOf(day.date)}</Typography>
                                                            </TableCell>
                                                            {classPeriodCols.map((c) => {
                                                                const entries = classDayEntries(day, c.number);
                                                                const pc = periodColor(c.number);
                                                                return (
                                                                    <TableCell key={c.number} sx={{ verticalAlign: 'top', borderRight: '1px solid #F1F3F5', borderBottom: '1px solid #F1F3F5', p: 0.8 }}>
                                                                        {entries.length ? (
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                                                                                {entries.map((e, i) => (
                                                                                    <EntryCard key={`${e.rollNumber}-${i}`} entry={e} color={pc} showTeacher />
                                                                                ))}
                                                                            </Box>
                                                                        ) : (
                                                                            <EmptyCell />
                                                                        )}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </>
                                )}
                            </>
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

            {/* Snackbar */}
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
