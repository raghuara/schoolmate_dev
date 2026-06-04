import React, { useEffect, useMemo, useState } from 'react';
import {
    Autocomplete, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, MenuItem,
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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
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

// Shared report grid cell — colored left-bar mini card / free-period / empty
const WorkCell = ({ entry, showClass = false }) => {
    if (!entry) {
        return (
            <Box sx={{ minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: 16, height: 3, borderRadius: 2, bgcolor: '#E5E7EB' }} />
            </Box>
        );
    }
    if (entry.isFreePeriod) {
        return (
            <Box sx={{ minHeight: 56, display: 'flex', alignItems: 'center' }}>
                <Chip label="Free Period" size="small" sx={{ height: 22, fontSize: 10, fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }} />
            </Box>
        );
    }
    const sc = colorForSubject(entry.subject);
    return (
        <Box sx={{ minHeight: 56, borderLeft: `3px solid ${sc}`, pl: 1, py: 0.4, borderRadius: '0 6px 6px 0', bgcolor: `${sc}0D` }}>
            {showClass && (entry.grade || entry.section) && (
                <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.3 }}>{entry.grade} {entry.section}</Typography>
            )}
            {entry.subject && <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: sc, lineHeight: 1.2 }}>{entry.subject}</Typography>}
            {entry.topicActivity && <Typography sx={{ fontSize: 11, color: '#374151', lineHeight: 1.3 }}>{entry.topicActivity}</Typography>}
            {entry.pageReference && <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>Pg {entry.pageReference}</Typography>}
            {entry.statusCodes?.length > 0 && <StatusChips codes={entry.statusCodes} />}
        </Box>
    );
};

const PeriodHeadCell = ({ name, startTime, endTime }) => (
    <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: PRIMARY_DARK, lineHeight: 1.1 }}>{name}</Typography>
        {(startTime || endTime) && (
            <Typography sx={{ fontSize: 9.5, fontWeight: 600, color: '#0E749099' }}>{startTime} – {endTime}</Typography>
        )}
    </Box>
);

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
    const [historySearch, setHistorySearch] = useState('');
    const [snack, setSnack] = useState({ open: false, msg: '', ok: true });

    // ── Report tab (Teacher-wise / Class-wise) ────────────────────────────────
    const [reportMode, setReportMode] = useState('teacher');   // 'teacher' | 'class'
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
    const [cwDate, setCwDate] = useState(toIsoDate(today));
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

    const filteredHistory = useMemo(() => {
        const q = historySearch.trim().toLowerCase();
        if (!q) return MOCK_HISTORY;
        return MOCK_HISTORY.filter((h) => h.date.includes(q) || h.grade.toLowerCase().includes(q) || h.section.toLowerCase().includes(q));
    }, [historySearch]);

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
        if (!staffRoll || !fromDate || !toDate) { setTeacherData(null); return; }
        setReportLoading(true);
        try {
            const res = await axios.get(GetWorkdoneTeacherWise, {
                params: { rollNumber: staffRoll, fromDate: toDDMMYYYY(fromDate), toDate: toDDMMYYYY(toDate) },
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
        if (!cwGradeSign || !cwSection || !cwDate) { setClassData(null); return; }
        setReportLoading(true);
        try {
            const res = await axios.get(GetWorkdoneClassWise, {
                params: { date: toDDMMYYYY(cwDate), grade: cwGradeSign, section: cwSection },
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
        if (activeTab !== 1 || reportMode !== 'teacher') return;
        fetchTeacherWise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, reportMode, staffRoll, fromDate, toDate]);

    useEffect(() => {
        if (activeTab !== 1 || reportMode !== 'class') return;
        fetchClassWise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, reportMode, cwGradeSign, cwSection, cwDate]);

    // Teacher-wise: period columns = union of period numbers across all days
    const teacherPeriodCols = useMemo(() => {
        const map = new Map();
        (teacherData?.days || []).forEach((d) =>
            (d.periods || []).forEach((p) => {
                if (!map.has(p.periodNumber)) map.set(p.periodNumber, { name: p.name || `Period ${p.periodNumber}`, startTime: p.startTime, endTime: p.endTime });
            })
        );
        return Array.from(map.entries()).sort((a, b) => a[0] - b[0]).map(([number, info]) => ({ number, ...info }));
    }, [teacherData]);

    // Class-wise: columns = periods; rows = distinct teachers (pivot)
    const classPeriodCols = useMemo(
        () => (classData?.periods || []).map((p) => ({ number: p.periodNumber, name: p.name, startTime: p.startTime, endTime: p.endTime })),
        [classData]
    );
    const classTeacherRows = useMemo(() => {
        const map = new Map();
        (classData?.periods || []).forEach((p) =>
            (p.entries || []).forEach((e) => {
                if (e.rollNumber && !map.has(e.rollNumber)) map.set(e.rollNumber, e.teacherName || e.rollNumber);
            })
        );
        return Array.from(map.entries()).map(([rollNumber, name]) => ({ rollNumber, name }));
    }, [classData]);
    const classCellEntry = (rollNumber, periodNumber) => {
        const p = (classData?.periods || []).find((x) => x.periodNumber === periodNumber);
        return p?.entries?.find((e) => e.rollNumber === rollNumber) || null;
    };

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
                {isTeacher && <Tab value={0} icon={<EventNoteIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Daily Entry" />}
                <Tab value={1} icon={<TableChartOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Report" />
                <Tab value={2} icon={<HistoryIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="History" />
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

                {/* ───────────────── WORK DONE REPORT ───────────────── */}
                {activeTab === 1 && (
                    <>
                        {/* Mode toggle */}
                        <Box sx={{ display: 'flex', gap: 0.6, mb: 1.5, p: 0.4, borderRadius: '10px', bgcolor: '#F3F4F6', border: '1px solid #E5E7EB', width: 'fit-content' }}>
                            {[
                                { key: 'teacher', label: 'Teacher-wise', icon: PersonOutlineIcon },
                                { key: 'class', label: 'Class-wise', icon: ClassOutlinedIcon },
                            ].map((m) => {
                                const Icon = m.icon; const active = reportMode === m.key;
                                return (
                                    <Box key={m.key} onClick={() => setReportMode(m.key)} sx={{ px: 1.6, py: 0.7, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.7, bgcolor: active ? '#fff' : 'transparent', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                                        <Icon sx={{ fontSize: 16, color: active ? PRIMARY_DARK : '#9CA3AF' }} />
                                        <Typography sx={{ fontSize: 12.5, fontWeight: active ? 700 : 600, color: active ? PRIMARY_DARK : '#6B7280' }}>{m.label}</Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* ── TEACHER-WISE ── */}
                        {reportMode === 'teacher' && (
                            <>
                                <Grid container spacing={1.5} sx={{ mb: 1.5 }} alignItems="flex-end">
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Staff</Typography>
                                        <Autocomplete
                                            size="small"
                                            options={staffOptions}
                                            getOptionLabel={(o) => (o ? `${o.name || ''} (${o.rollNumber || ''})` : '')}
                                            isOptionEqualToValue={(o, v) => o.rollNumber === v.rollNumber}
                                            onChange={(_, v) => setStaffRoll(v?.rollNumber || '')}
                                            renderInput={(params) => (
                                                <TextField {...params} placeholder="Search staff by name / roll number" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13, fontWeight: 600 } }} />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Date Range</Typography>
                                        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                                            {[
                                                { key: 'today', label: 'Today' },
                                                { key: '7', label: '7 Days' },
                                                { key: '15', label: '15 Days' },
                                                { key: 'custom', label: 'Custom' },
                                            ].map((opt) => {
                                                const active = datePreset === opt.key;
                                                return (
                                                    <Chip
                                                        key={opt.key}
                                                        label={opt.label}
                                                        onClick={() => applyPreset(opt.key)}
                                                        sx={{ height: 34, fontSize: 12.5, fontWeight: 700, borderRadius: '8px', cursor: 'pointer', bgcolor: active ? PRIMARY : '#fff', color: active ? '#fff' : '#374151', border: '1px solid', borderColor: active ? PRIMARY : '#E5E7EB', '&:hover': { bgcolor: active ? PRIMARY : '#F9FAFB' } }}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    </Grid>
                                </Grid>

                                {datePreset === 'custom' && (
                                    <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>From</Typography>
                                            <TextField type="date" size="small" fullWidth value={fromDate} onChange={(e) => setFromDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 13 } }} />
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>To</Typography>
                                            <TextField type="date" size="small" fullWidth value={toDate} onChange={(e) => setToDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 13 } }} />
                                        </Grid>
                                    </Grid>
                                )}

                                {reportLoading ? (
                                    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} sx={{ color: PRIMARY }} /></Box>
                                ) : !staffRoll ? (
                                    <Box sx={{ py: 6, textAlign: 'center', borderRadius: '10px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                        <PersonOutlineIcon sx={{ fontSize: 40, color: '#D1D5DB', mb: 1 }} />
                                        <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Select a staff member to view their work done.</Typography>
                                    </Box>
                                ) : !teacherData?.days?.length ? (
                                    <Box sx={{ py: 6, textAlign: 'center', borderRadius: '10px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                        <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>No work done records for this staff in the selected range.</Typography>
                                    </Box>
                                ) : (
                                    <>
                                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#111827', mb: 1 }}>
                                            {teacherData.teacherName} · #{teacherData.rollNumber}
                                            <Box component="span" sx={{ fontWeight: 600, color: '#6B7280', ml: 1 }}>{teacherData.fromDate} → {teacherData.toDate}</Box>
                                        </Typography>
                                        <TableContainer sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', maxHeight: 'calc(86vh - 320px)', overflowX: 'auto' }}>
                                            <Table stickyHeader size="small" sx={{ width: 'auto', borderCollapse: 'separate', borderSpacing: 0 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ position: 'sticky', left: 0, top: 0, zIndex: 4, width: 140, minWidth: 140, bgcolor: PRIMARY_LIGHT, borderBottom: `2px solid ${PRIMARY_BORDER}`, borderRight: `1px solid ${PRIMARY_BORDER}` }}>
                                                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: PRIMARY_DARK }}>Date / Day</Typography>
                                                        </TableCell>
                                                        {teacherPeriodCols.map((c) => (
                                                            <TableCell key={c.number} sx={{ width: 190, minWidth: 190, bgcolor: PRIMARY_LIGHT, borderBottom: `2px solid ${PRIMARY_BORDER}`, borderRight: '1px solid #E5E7EB' }}>
                                                                <PeriodHeadCell name={c.name} startTime={c.startTime} endTime={c.endTime} />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {teacherData.days.map((d) => (
                                                        <TableRow key={d.date} sx={{ '&:nth-of-type(even)': { bgcolor: '#FAFBFC' }, '&:hover': { bgcolor: PRIMARY_LIGHT } }}>
                                                            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: '#fff', borderRight: `1px solid ${PRIMARY_BORDER}`, verticalAlign: 'top' }}>
                                                                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#111827' }}>{d.date}</Typography>
                                                                <Typography sx={{ fontSize: 10.5, color: PRIMARY_DARK, fontWeight: 700 }}>{dayNameOf(d.date)}</Typography>
                                                                <Chip label={`${d.filledPeriods}/${d.totalPeriods} filled`} size="small" sx={{ mt: 0.5, height: 18, fontSize: 9.5, fontWeight: 700, bgcolor: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }} />
                                                            </TableCell>
                                                            {teacherPeriodCols.map((c) => (
                                                                <TableCell key={c.number} sx={{ verticalAlign: 'top', borderRight: '1px solid #F3F4F6', p: 0.8 }}>
                                                                    <WorkCell entry={(d.periods || []).find((x) => x.periodNumber === c.number)} showClass />
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </>
                                )}
                            </>
                        )}

                        {/* ── CLASS-WISE ── */}
                        {reportMode === 'class' && (
                            <>
                                <Grid container spacing={1.5} sx={{ mb: 1.5 }} alignItems="flex-end">
                                    <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
                                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Class</Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={cwGradeSign || ''}
                                                onChange={(e) => { const sign = e.target.value; setCwGradeSign(sign); const g = grades.find((x) => x.sign === sign); setCwSection(g?.sections?.[0] || null); }}
                                                sx={{ borderRadius: '8px', height: 36, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}
                                            >
                                                {(grades || []).map((g) => (
                                                    <MenuItem key={g.sign} value={g.sign} sx={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>{g.sign}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
                                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Date</Typography>
                                        <TextField type="date" size="small" fullWidth value={cwDate} onChange={(e) => setCwDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, fontSize: 13 } }} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 7 }}>
                                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.4 }}>Section</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                            {(grades?.find((g) => g.sign === cwGradeSign)?.sections || []).map((s) => {
                                                const active = cwSection === s;
                                                return (
                                                    <Box key={s} onClick={() => setCwSection(s)} sx={{ px: 1.6, height: 36, display: 'flex', alignItems: 'center', borderRadius: '8px', cursor: 'pointer', border: '1.5px solid', borderColor: active ? PRIMARY : '#E5E7EB', bgcolor: active ? PRIMARY_LIGHT : '#fff', color: active ? PRIMARY_DARK : '#374151', fontSize: 13, fontWeight: 700 }}>
                                                        Sec {s}
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </Grid>
                                </Grid>

                                {reportLoading ? (
                                    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} sx={{ color: PRIMARY }} /></Box>
                                ) : !classData?.periods?.length ? (
                                    <Box sx={{ py: 6, textAlign: 'center', borderRadius: '10px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                        <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>No work done records for this class on the selected date.</Typography>
                                    </Box>
                                ) : (
                                    <>
                                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#111827', mb: 1 }}>
                                            {classData.grade} · Section {classData.section}
                                            <Box component="span" sx={{ fontWeight: 600, color: '#6B7280', ml: 1 }}>{classData.date} ({dayNameOf(classData.date)})</Box>
                                        </Typography>
                                        <TableContainer sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', maxHeight: 'calc(86vh - 300px)', overflowX: 'auto' }}>
                                            <Table stickyHeader size="small" sx={{ width: 'auto', borderCollapse: 'separate', borderSpacing: 0 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ position: 'sticky', left: 0, top: 0, zIndex: 4, width: 190, minWidth: 190, bgcolor: PRIMARY_LIGHT, borderBottom: `2px solid ${PRIMARY_BORDER}`, borderRight: `1px solid ${PRIMARY_BORDER}` }}>
                                                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: PRIMARY_DARK }}>Staff</Typography>
                                                        </TableCell>
                                                        {classPeriodCols.map((c) => (
                                                            <TableCell key={c.number} sx={{ width: 190, minWidth: 190, bgcolor: PRIMARY_LIGHT, borderBottom: `2px solid ${PRIMARY_BORDER}`, borderRight: '1px solid #E5E7EB' }}>
                                                                <PeriodHeadCell name={c.name} startTime={c.startTime} endTime={c.endTime} />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {classTeacherRows.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={classPeriodCols.length + 1} sx={{ textAlign: 'center', py: 4, color: '#9CA3AF' }}>No staff entries.</TableCell>
                                                        </TableRow>
                                                    ) : classTeacherRows.map((t) => (
                                                        <TableRow key={t.rollNumber} sx={{ '&:nth-of-type(even)': { bgcolor: '#FAFBFC' }, '&:hover': { bgcolor: PRIMARY_LIGHT } }}>
                                                            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: '#fff', borderRight: `1px solid ${PRIMARY_BORDER}`, verticalAlign: 'top' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, bgcolor: colorForSubject(t.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                                                                        {getInitials(t.name)}
                                                                    </Box>
                                                                    <Box sx={{ minWidth: 0 }}>
                                                                        <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#111827', lineHeight: 1.2 }} noWrap>{t.name}</Typography>
                                                                        <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>#{t.rollNumber}</Typography>
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            {classPeriodCols.map((c) => (
                                                                <TableCell key={c.number} sx={{ verticalAlign: 'top', borderRight: '1px solid #F3F4F6', p: 0.8 }}>
                                                                    <WorkCell entry={classCellEntry(t.rollNumber, c.number)} />
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </>
                                )}
                            </>
                        )}
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
