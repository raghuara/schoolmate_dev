import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Grid, Typography, IconButton, Button, Chip, TextField, Select, MenuItem,
    FormControl, InputLabel, Checkbox, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, Avatar, InputAdornment, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups';    
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LockIcon from '@mui/icons-material/Lock';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import OutboxIcon from '@mui/icons-material/Outbox';
import HistoryIcon from '@mui/icons-material/History';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { selectGrades, selectGradesLoading, fetchGradesData } from '../../Redux/Slices/DropdownController';
import { FetchPromotableStudents, PostStudentExit, FetchExitHistory } from '../../Api/Api';
import SnackBar from '../SnackBar';

const TOKEN = '123';

// ── Mode themes ─────────────────────────────────────────────────────────────
// TC — deep indigo. Conveys formality / official document / permanence.
const TC_THEME = {
    primary: '#4338CA',
    light: '#EEF2FF',
    dark: '#312E81',
    border: '#C7D2FE',
    softText: '#3730A3',
};

// Discontinue — slate-rose. Serious but distinct from TC.
const DC_THEME = {
    primary: '#BE185D',
    light: '#FDF2F8',
    dark: '#9D174D',
    border: '#FBCFE8',
    softText: '#831843',
};

// The "danger" red is reserved exclusively for the irreversibility warning,
// so the type-to-confirm banner stands out independent of the page theme.
const DANGER = {
    primary: '#DC2626',
    light: '#FEF2F2',
    dark: '#991B1B',
    border: '#FECACA',
    text: '#7F1D1D',
};

const CONFIRM_KEYWORD = 'confirm';

const themeFor = (mode) => (mode === 'discontinue' ? DC_THEME : TC_THEME);

const DISCONTINUE_REASONS = [
    { code: 'financial',    label: 'Financial Reasons' },
    { code: 'relocation',   label: 'Family Relocation' },
    { code: 'health',       label: 'Health / Medical Reasons' },
    { code: 'personal',     label: 'Personal / Family Reasons' },
    { code: 'academic',     label: 'Academic Concerns' },
    { code: 'disciplinary', label: 'Disciplinary Action' },
    { code: 'other',        label: 'Other' },
];

// Build academic year options (India: Apr–Mar). Returns newest first.
const buildAcademicYears = () => {
    const today = new Date();
    const startYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const opts = [];
    for (let i = -4; i <= 1; i++) {
        const y = startYear + i;
        opts.push(`${y}-${y + 1}`);
    }
    return opts.reverse();
};

// Last completed academic year (one before the current cycle)
const getLastCompletedAcademicYear = () => {
    const today = new Date();
    const currentStart = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    return `${currentStart - 1}-${currentStart}`;
};

// Current academic year
const getCurrentAcademicYear = () => {
    const today = new Date();
    const start = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    return `${start}-${start + 1}`;
};

const todayISO = () => new Date().toISOString().split('T')[0];

const getInitials = (name = '') =>
    name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

const AVATAR_PALETTE = ['#0891B2', '#7C3AED', '#EA580C', '#DC2626', '#16A34A', '#2563EB', '#DB2777', '#CA8A04'];
const colorFor = (name = '') => AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

const StepHeader = ({ number, title, hint, accent }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
        <Box sx={{
            width: 22, height: 22, borderRadius: '50%',
            bgcolor: accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
            {number}
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#222' }}>{title}</Typography>
        {hint && (
            <Typography sx={{ fontSize: 11, color: '#888', ml: 0.5 }}>— {hint}</Typography>
        )}
    </Box>
);

const ModeCard = ({ active, onClick, icon: Icon, title, subtitle, theme }) => (
    <Box
        onClick={onClick}
        sx={{
            p: 1.5, borderRadius: '10px', cursor: 'pointer',
            border: `2px solid ${active ? theme.primary : '#E5E7EB'}`,
            bgcolor: active ? theme.light : '#fff',
            display: 'flex', alignItems: 'center', gap: 1.2,
            transition: 'all 0.2s',
            '&:hover': { borderColor: theme.primary, bgcolor: theme.light },
        }}
    >
        <Box sx={{
            width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
            bgcolor: active ? theme.primary : '#F3F4F6',
            color: active ? '#fff' : '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: active ? theme.dark : '#111' }}>
                {title}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>
                {subtitle}
            </Typography>
        </Box>
        <Box sx={{
            width: 18, height: 18, borderRadius: '50%',
            border: `2px solid ${active ? theme.primary : '#D1D5DB'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            {active && <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: theme.primary }} />}
        </Box>
    </Box>
);

export default function IssueTcPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const grades = useSelector(selectGrades) || [];
    const isLoadingGrades = useSelector(selectGradesLoading);
    const authUser = useSelector(state => state.auth);
    const actorRollNumber = authUser?.rollNumber || '';

    useEffect(() => {
        if (!grades || grades.length === 0) {
            dispatch(fetchGradesData());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── View mode (Issue / History) ─────────────────────────────────────────
    const [viewMode, setViewMode] = useState('issue'); // 'issue' | 'history'

    // ── Mode (TC vs Discontinue) ────────────────────────────────────────────
    const [mode, setMode] = useState('tc'); // 'tc' | 'discontinue'
    const theme = themeFor(mode);
    const isTC = mode === 'tc';

    // ── Exit History state ──────────────────────────────────────────────────
    const [historyYear, setHistoryYear] = useState(getCurrentAcademicYear());
    const [historyClassId, setHistoryClassId] = useState('');
    const [historySection, setHistorySection] = useState('');
    const [historyActionFilter, setHistoryActionFilter] = useState('all'); // 'all' | 'TC' | 'Discontinue'
    const [historySearch, setHistorySearch] = useState('');
    const [historyData, setHistoryData] = useState(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const historyClass = useMemo(
        () => grades.find(c => c.id === historyClassId) || null,
        [grades, historyClassId]
    );

    // ── Academic Year ───────────────────────────────────────────────────────
    const academicYears = useMemo(() => buildAcademicYears(), []);
    const [academicYear, setAcademicYear] = useState(getLastCompletedAcademicYear());

    // Re-default academic year when switching modes
    useEffect(() => {
        setAcademicYear(isTC ? getLastCompletedAcademicYear() : getCurrentAcademicYear());
    }, [mode, isTC]);

    // ── Class / Section ─────────────────────────────────────────────────────
    const [srcClassId, setSrcClassId] = useState('');
    const [srcSection, setSrcSection] = useState([]);
    const srcClass = useMemo(() => grades.find(c => c.id === srcClassId) || null, [grades, srcClassId]);
    const sourceKey = srcClassId && srcSection.length > 0 ? `${srcClassId}-${srcSection.join(',')}` : '';

    // ── TC-specific fields ──────────────────────────────────────────────────
    const [tcIssueDate, setTcIssueDate] = useState(todayISO);
    const [tcReason, setTcReason] = useState('');

    // ── Discontinue-specific fields ─────────────────────────────────────────
    const [lastAttendanceDate, setLastAttendanceDate] = useState(todayISO);
    const [discontinueReason, setDiscontinueReason] = useState('');
    const [discontinueDetails, setDiscontinueDetails] = useState('');

    // ── Students ────────────────────────────────────────────────────────────
    const [students, setStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [selected, setSelected] = useState({});
    const [search, setSearch] = useState('');

    // ── Snack ───────────────────────────────────────────────────────────────
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true);
        setSnackColor(success); setSnackStatus(success);
    };

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Type-to-confirm gate — required for BOTH TC and Discontinue (both are irreversible)
    const [confirmText, setConfirmText] = useState('');
    const isConfirmTextValid = confirmText.trim().toLowerCase() === CONFIRM_KEYWORD;
    const requiresTypedConfirm = true;
    const canSubmit = !requiresTypedConfirm || isConfirmTextValid;

    // Fetch students whenever class/section changes
    useEffect(() => {
        if (!srcClassId || srcSection.length === 0) {
            setStudents([]);
            setSelected({});
            return;
        }

        let cancelled = false;
        setIsLoadingStudents(true);
        setSelected({});

        const promises = srcSection.map(sec =>
            axios.get(FetchPromotableStudents, {
                params: { gradeId: srcClassId, sectionName: sec },
                headers: { Authorization: `Bearer ${TOKEN}` },
            })
        );

        Promise.all(promises)
            .then(responses => {
                if (cancelled) return;
                const allStudents = [];
                responses.forEach(res => {
                    const data = res?.data || {};
                    if (data.error) {
                        showSnack(data.message || 'Failed to load students.', false);
                        return;
                    }
                    const gradeName = data.gradeName || '';
                    const sectionName = data.sectionName || '';
                    (data.students || []).forEach(s => {
                        allStudents.push({
                            id: s.rollNumber,
                            rollNumber: String(s.rollNumber),
                            name: s.name || '—',
                            grade: gradeName,
                            section: sectionName,
                        });
                    });
                });
                setStudents(allStudents);
            })
            .catch(err => {
                if (cancelled) return;
                console.error('FetchPromotableStudents failed:', err);
                setStudents([]);
                showSnack(err?.response?.data?.message || 'Failed to load students.', false);
            })
            .finally(() => {
                if (!cancelled) setIsLoadingStudents(false);
            });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceKey]);

    const filteredStudents = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return students;
        return students.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.rollNumber.toLowerCase().includes(q)
        );
    }, [students, search]);

    const selectedCount = Object.values(selected).filter(Boolean).length;
    const totalStudents = students.length;
    const allSelected = totalStudents > 0 && students.every(s => selected[s.rollNumber]);

    const handleSelectAllFiltered = (checked) => {
        if (checked) {
            setSelected(filteredStudents.reduce((acc, s) => { acc[s.rollNumber] = true; return acc; }, {}));
        } else {
            setSelected({});
        }
    };

    const handleSelectEntireSection = () => {
        setSelected(students.reduce((acc, s) => { acc[s.rollNumber] = true; return acc; }, {}));
    };

    // ── Validation ──────────────────────────────────────────────────────────
    const validateBeforeSubmit = () => {
        if (!academicYear) { showSnack('Pick the academic year first.', false); return false; }
        if (!sourceKey) { showSnack('Pick the last completed class & section.', false); return false; }
        if (selectedCount === 0) { showSnack('Select at least one student.', false); return false; }

        if (isTC) {
            if (!tcIssueDate) { showSnack('Pick the TC issue date.', false); return false; }
        } else {
            if (!lastAttendanceDate) { showSnack('Pick the last attendance date.', false); return false; }
            if (!discontinueReason) { showSnack('Choose a reason for discontinuation.', false); return false; }
            if (discontinueReason === 'other' && !discontinueDetails.trim()) {
                showSnack('Please describe the reason for discontinuation.', false);
                return false;
            }
        }
        return true;
    };

    const handleConfirmClick = () => {
        if (!validateBeforeSubmit()) return;
        setConfirmText('');           // reset every time the dialog opens
        setConfirmOpen(true);
    };

    const closeConfirm = () => {
        if (isSubmitting) return;
        setConfirmOpen(false);
        setConfirmText('');
    };

    const resetAfterSuccess = () => {
        setStudents([]); setSelected({});
        setSrcClassId(''); setSrcSection([]);
        setTcReason(''); setDiscontinueReason(''); setDiscontinueDetails('');
        setConfirmText('');
        setConfirmOpen(false);
    };

    const handleSubmit = async () => {
        if (!actorRollNumber) {
            showSnack('Could not identify the logged-in user. Please re-login and try again.', false);
            return;
        }
        if (requiresTypedConfirm && !isConfirmTextValid) {
            showSnack(`Please type "${CONFIRM_KEYWORD}" exactly to confirm this irreversible action.`, false);
            return;
        }

        const studentRollNumbers = Object.keys(selected)
            .filter(rn => selected[rn])
            .map(rn => String(rn));

        if (studentRollNumbers.length === 0) {
            showSnack('No students selected.', false);
            return;
        }

        // Build unified payload for PostStudentExit
        const reasonObj = !isTC ? DISCONTINUE_REASONS.find(r => r.code === discontinueReason) : null;
        const dateStr = isTC ? tcIssueDate : lastAttendanceDate;
        const exitDateISO = new Date(`${dateStr}T00:00:00`).toISOString();

        const payload = {
            issuedByRollNumber: String(actorRollNumber),
            action: isTC ? 'TC' : 'Discontinue',
            gradeId: srcClass.id,
            gradeName: srcClass.sign,
            sectionName: srcSection.join(', '),
            academicYear,
            exitDate: exitDateISO,
            reason: isTC
                ? (tcReason.trim() || 'Transfer Certificate Issued')
                : (reasonObj?.label || discontinueReason || 'Discontinued'),
            additionalNotes: isTC
                ? null
                : (discontinueDetails.trim() || null),
            studentRollNumbers,
        };

        setIsSubmitting(true);
        try {
            const res = await axios.post(PostStudentExit, payload, {
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            if (res?.data?.error) {
                throw new Error(res.data.message || 'Server reported an error.');
            }
            const n = studentRollNumbers.length;
            const plural = n !== 1 ? 's' : '';
            showSnack(
                isTC
                    ? `TC issued to ${n} student${plural} successfully.`
                    : `${n} student${plural} marked as discontinued.`,
                true
            );
            resetAfterSuccess();
        } catch (err) {
            console.error('Submit failed:', err);
            showSnack(
                err?.response?.data?.message || err?.message
                || (isTC ? 'Failed to issue TC.' : 'Failed to mark discontinued.'),
                false
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Fetch Exit History ──────────────────────────────────────────────────
    const fetchHistory = async () => {
        if (!historyClassId || !historySection || !historyYear) {
            setHistoryData(null);
            return;
        }
        const selectedClass = grades.find(c => c.id === historyClassId);
        if (!selectedClass) return;

        setIsLoadingHistory(true);
        try {
            const res = await axios.get(FetchExitHistory, {
                params: {
                    GradeId: selectedClass.id,
                    SectionName: historySection,
                    AcademicYear: historyYear,
                },
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            const data = res?.data || {};
            if (data.error) {
                showSnack(data.message || 'Failed to load exit history.', false);
                setHistoryData(null);
            } else {
                setHistoryData(data);
            }
        } catch (err) {
            console.error('FetchExitHistory failed:', err);
            showSnack(err?.response?.data?.message || 'Failed to load exit history.', false);
            setHistoryData(null);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'history') fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, historyClassId, historySection, historyYear]);

    // Rows narrowed to the selected academic year — used by both stats & filtered table
    // (server may not filter by year; we do it client-side using each row's `academicYear`)
    const historyRowsForYear = useMemo(() => {
        const rows = historyData?.history || [];
        return rows.filter(r => r.academicYear === historyYear);
    }, [historyData, historyYear]);

    // Derived: filtered history rows (year + action + search)
    const historyRows = useMemo(() => {
        const q = historySearch.trim().toLowerCase();
        return historyRowsForYear.filter(r => {
            const matchesAction = historyActionFilter === 'all' || r.action === historyActionFilter;
            const matchesSearch = !q
                || (r.name || '').toLowerCase().includes(q)
                || String(r.rollNumber || '').toLowerCase().includes(q)
                || (r.reason || '').toLowerCase().includes(q);
            return matchesAction && matchesSearch;
        });
    }, [historyRowsForYear, historyActionFilter, historySearch]);

    const historyTotals = useMemo(() => ({
        total: historyRowsForYear.length,
        tc:    historyRowsForYear.filter(r => r.action === 'TC').length,
        dc:    historyRowsForYear.filter(r => r.action === 'Discontinue').length,
    }), [historyRowsForYear]);

    const clearHistoryFilters = () => {
        setHistoryActionFilter('all');
        setHistorySearch('');
    };

    const formatDateTime = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
        });
    };

    const formatDateOnly = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // ── UI labels by mode ───────────────────────────────────────────────────
    const pageSubtitle = isTC
        ? "Issue TC to students leaving the school"
        : "Mark students as discontinued before completing their grade";

    const actionLabel = isTC ? 'Issue TC' : 'Mark Discontinued';
    const actionIcon = isTC ? <SchoolIcon sx={{ fontSize: 16 }} /> : <PersonOffIcon sx={{ fontSize: 16 }} />;

    return (
        <>
            <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />

            <Box sx={{ width: '100%' }}>
                {/* Page header */}
                <Box sx={{
                    backgroundColor: '#f2f2f2', p: 1.5, borderRadius: '10px 10px 10px 0px',
                    borderBottom: '1px solid #ddd',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                            <ArrowBackIcon sx={{ fontSize: 18, color: '#000' }} />
                        </IconButton>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: '8px',
                            bgcolor: theme.light, border: `1px solid ${theme.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}>
                            {isTC
                                ? <SchoolIcon sx={{ color: theme.primary, fontSize: 18 }} />
                                : <PersonOffIcon sx={{ color: theme.primary, fontSize: 18 }} />}
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                                Student Exit Management
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#666' }}>
                                {pageSubtitle}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{
                    p: 2,
                    height: '77vh',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#D1D5DB', borderRadius: 10 },
                }}>
                    {/* ─── View switcher: Issue Exit / Exit History ──────── */}
                    <Box sx={{
                        display: 'flex', gap: 0.6, mb: 2,
                        p: 0.4, borderRadius: '10px',
                        bgcolor: '#F3F4F6', border: '1px solid #E5E7EB',
                        width: 'fit-content', flexWrap: 'wrap',
                    }}>
                        {[
                            { key: 'issue',   label: 'Issue Exit',  icon: OutboxIcon,  color: theme.primary },
                            { key: 'history', label: 'Exit History', icon: HistoryIcon, color: '#0891B2' },
                        ].map((v) => {
                            const Icon = v.icon;
                            const active = viewMode === v.key;
                            return (
                                <Box
                                    key={v.key}
                                    onClick={() => setViewMode(v.key)}
                                    sx={{
                                        px: 1.6, py: 0.7, borderRadius: '8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 0.8,
                                        transition: 'all 0.15s',
                                        bgcolor: active ? '#fff' : 'transparent',
                                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
                                        '&:hover': { bgcolor: active ? '#fff' : 'rgba(255,255,255,0.55)' },
                                    }}
                                >
                                    <Icon sx={{ fontSize: 16, color: active ? v.color : '#9CA3AF' }} />
                                    <Typography sx={{
                                        fontSize: 12.5,
                                        fontWeight: active ? 700 : 600,
                                        color: active ? v.color : '#6B7280',
                                    }}>
                                        {v.label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* ─── Exit History view ─────────────────────────────── */}
                    {viewMode === 'history' && (
                        <>
                            {/* Context selector */}
                            <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB', mb: 2 }}>
                                <StepHeader number={1} title="Select Context" hint="academic year, class & section" accent="#0891B2" />
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ fontSize: 13 }}>Academic Year</InputLabel>
                                            <Select
                                                value={historyYear}
                                                label="Academic Year"
                                                onChange={(e) => setHistoryYear(e.target.value)}
                                                sx={{ fontSize: 13 }}
                                            >
                                                {academicYears.map(y => (
                                                    <MenuItem key={y} value={y} sx={{ fontSize: 13 }}>{y}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ fontSize: 13 }}>Class</InputLabel>
                                            <Select
                                                value={historyClassId}
                                                label="Class"
                                                onChange={(e) => { setHistoryClassId(e.target.value); setHistorySection(''); }}
                                                sx={{ fontSize: 13 }}
                                                disabled={isLoadingGrades}
                                            >
                                                {grades.length === 0 && !isLoadingGrades && (
                                                    <MenuItem disabled value=""><em>No classes configured</em></MenuItem>
                                                )}
                                                {grades.map(c => <MenuItem key={c.id} value={c.id}>{c.sign}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FormControl fullWidth size="small" disabled={!historyClass}>
                                            <InputLabel sx={{ fontSize: 13 }}>Section</InputLabel>
                                            <Select
                                                value={historySection}
                                                label="Section"
                                                onChange={(e) => setHistorySection(e.target.value)}
                                                sx={{ fontSize: 13 }}
                                            >
                                                {(historyClass?.sections || []).map(s => <MenuItem key={s} value={s}>Section {s}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Stats + filter toolbar */}
                            <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB', mb: 2 }}>
                                {/* Stats row */}
                                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                                    {[
                                        { label: 'TOTAL EXITS', value: historyTotals.total, color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
                                        { label: 'TC ISSUED',   value: historyTotals.tc,    color: TC_THEME.primary, bg: TC_THEME.light, border: TC_THEME.border },
                                        { label: 'DISCONTINUED', value: historyTotals.dc,   color: DC_THEME.primary, bg: DC_THEME.light, border: DC_THEME.border },
                                    ].map(s => (
                                        <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
                                            <Box sx={{
                                                p: 1.2, borderRadius: '10px',
                                                bgcolor: s.bg, border: `1px solid ${s.border}`,
                                            }}>
                                                <Typography sx={{ fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: 0.5, mb: 0.4 }}>
                                                    {s.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                                                    {s.value}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Filter row */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <FilterAltOutlinedIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                    <TextField
                                        size="small"
                                        placeholder="Search name, roll no, or reason..."
                                        value={historySearch}
                                        onChange={(e) => setHistorySearch(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: historySearch ? (
                                                    <InputAdornment position="end">
                                                        <IconButton size="small" onClick={() => setHistorySearch('')} sx={{ p: 0.3 }}>
                                                            <CloseIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ) : null,
                                            },
                                        }}
                                        sx={{
                                            flex: 1, minWidth: 240, maxWidth: 320,
                                            '& .MuiOutlinedInput-root': {
                                                height: 34, fontSize: 12.5, borderRadius: '8px', bgcolor: '#F9FAFB',
                                                '& fieldset': { borderColor: '#E5E7EB' },
                                            },
                                        }}
                                    />
                                    {/* Action filter chips */}
                                    {[
                                        { key: 'all', label: 'All', color: '#6B7280' },
                                        { key: 'TC', label: 'TC', color: TC_THEME.primary },
                                        { key: 'Discontinue', label: 'Discontinue', color: DC_THEME.primary },
                                    ].map(f => {
                                        const active = historyActionFilter === f.key;
                                        return (
                                            <Chip
                                                key={f.key}
                                                label={f.label}
                                                size="small"
                                                onClick={() => setHistoryActionFilter(f.key)}
                                                sx={{
                                                    height: 26, fontSize: 11.5, fontWeight: 700, borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    bgcolor: active ? f.color : '#fff',
                                                    color: active ? '#fff' : '#374151',
                                                    border: `1px solid ${active ? f.color : '#E5E7EB'}`,
                                                    '&:hover': { bgcolor: active ? f.color : '#F9FAFB', filter: active ? 'brightness(0.95)' : 'none' },
                                                }}
                                            />
                                        );
                                    })}
                                    {(historySearch || historyActionFilter !== 'all') && (
                                        <Button
                                            size="small"
                                            startIcon={<RestartAltIcon sx={{ fontSize: 15 }} />}
                                            onClick={clearHistoryFilters}
                                            sx={{
                                                textTransform: 'none', fontSize: 12, fontWeight: 600,
                                                height: 30, borderRadius: '8px', px: 1.2,
                                                color: '#DC2626',
                                                '&:hover': { bgcolor: '#FEF2F2' },
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                        <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>Showing</Typography>
                                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>
                                            {historyRows.length}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>
                                            of {historyTotals.total}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* History table */}
                            <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB' }}>
                                {!historyClassId || !historySection ? (
                                    <Box sx={{ py: 6, textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>
                                            Pick a class & section to load exit history
                                        </Typography>
                                        <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', mt: 0.5 }}>
                                            Records will appear here for the chosen class, section, and academic year.
                                        </Typography>
                                    </Box>
                                ) : isLoadingHistory ? (
                                    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress size={28} sx={{ color: '#0891B2' }} />
                                    </Box>
                                ) : historyRows.length === 0 ? (
                                    <Box sx={{ py: 6, textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>
                                            No exit records found
                                        </Typography>
                                        <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', mt: 0.5 }}>
                                            {historySearch || historyActionFilter !== 'all'
                                                ? 'Try changing or clearing your filters above.'
                                                : 'No TC or Discontinue records for this context yet.'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ maxHeight: 480, border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                                    {['#', 'Student', 'Action', 'Year', 'Exit Date', 'Reason', 'Issued By', 'Issued On'].map(h => (
                                                        <TableCell key={h} sx={{
                                                            fontWeight: 700, fontSize: 10.5, color: '#6B7280',
                                                            textTransform: 'uppercase', letterSpacing: 0.4,
                                                            bgcolor: '#F9FAFB', py: 1.3, whiteSpace: 'nowrap',
                                                        }}>
                                                            {h}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {historyRows.map((r, idx) => {
                                                    const isTcRow = r.action === 'TC';
                                                    const actionCfg = isTcRow ? TC_THEME : DC_THEME;
                                                    return (
                                                        <TableRow key={`${r.rollNumber}-${r.issuedOn}-${idx}`} sx={{
                                                            '&:hover': { bgcolor: '#FAFAFA' },
                                                            borderBottom: '1px solid #F3F4F6',
                                                        }}>
                                                            <TableCell sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>
                                                                {idx + 1}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Avatar sx={{
                                                                        width: 30, height: 30,
                                                                        bgcolor: colorFor(r.name || ''),
                                                                        fontSize: 11, fontWeight: 700,
                                                                    }}>
                                                                        {getInitials(r.name)}
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                                                                            {r.name || '—'}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: 10.5, color: '#9CA3AF', fontFamily: 'monospace' }}>
                                                                            #{r.rollNumber}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="small"
                                                                    icon={isTcRow
                                                                        ? <SchoolIcon sx={{ fontSize: '12px !important' }} />
                                                                        : <PersonOffIcon sx={{ fontSize: '12px !important' }} />}
                                                                    label={isTcRow ? 'TC' : 'Discontinue'}
                                                                    sx={{
                                                                        height: 22, fontSize: 10.5, fontWeight: 700,
                                                                        bgcolor: actionCfg.light, color: actionCfg.primary,
                                                                        border: `1px solid ${actionCfg.border}`,
                                                                        '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: 11.5, color: '#374151', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                    {r.academicYear}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: 11.5, color: '#374151', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                    {formatDateOnly(r.exitDate)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ maxWidth: 220 }}>
                                                                <Tooltip
                                                                    title={
                                                                        <Box>
                                                                            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{r.reason || '—'}</Typography>
                                                                            {r.additionalNotes && (
                                                                                <Typography sx={{ fontSize: 10.5, opacity: 0.85, mt: 0.3 }}>
                                                                                    {r.additionalNotes}
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    }
                                                                    arrow placement="top"
                                                                >
                                                                    <Typography sx={{
                                                                        fontSize: 11.5, color: '#4B5563',
                                                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap', maxWidth: 220,
                                                                    }}>
                                                                        {r.reason || '—'}
                                                                    </Typography>
                                                                </Tooltip>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: 11.5, color: '#374151', fontFamily: 'monospace', fontWeight: 600 }}>
                                                                    #{r.issuedByRollNumber}
                                                                </Typography>
                                                                {r.issuedByUserType && (
                                                                    <Typography sx={{ fontSize: 10, color: '#9CA3AF', textTransform: 'capitalize' }}>
                                                                        {r.issuedByUserType}
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: 11, color: '#374151', whiteSpace: 'nowrap' }}>
                                                                    {formatDateTime(r.issuedOn)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        </>
                    )}

                    {/* ─── Issue Exit view (existing form) ─────────────── */}
                    {viewMode === 'issue' && (
                    <>
                    {/* ─── Mode toggle ─────────────────────────────────────── */}
                    <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB', mb: 2 }}>
                        <StepHeader number={1} title="Choose Action" hint="select what you want to do" accent={theme.primary} />
                        <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <ModeCard
                                    active={isTC}
                                    onClick={() => setMode('tc')}
                                    icon={SchoolIcon}
                                    title="Issue Transfer Certificate"
                                    subtitle="Student is moving to another institution"
                                    theme={TC_THEME}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <ModeCard
                                    active={!isTC}
                                    onClick={() => setMode('discontinue')}
                                    icon={PersonOffIcon}
                                    title="Discontinue Student"
                                    subtitle="Student is leaving before completing their grade (mid-year exit)"
                                    theme={DC_THEME}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* ─── Academic Context ────────────────────────────────── */}
                    <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB', mb: 2 }}>
                        <StepHeader
                            number={2}
                            title={isTC ? 'Last Completed Academic Context' : 'Current Academic Context'}
                            hint={isTC ? 'class & section the student just finished' : 'class & section the student is currently in'}
                            accent={theme.primary}
                        />
                        <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontSize: 13 }}>Academic Year</InputLabel>
                                    <Select
                                        value={academicYear}
                                        label="Academic Year"
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        sx={{ fontSize: 13 }}
                                        startAdornment={
                                            <InputAdornment position="start" sx={{ ml: 0.5 }}>
                                                <CalendarMonthIcon sx={{ fontSize: 16, color: theme.primary }} />
                                            </InputAdornment>
                                        }
                                    >
                                        {academicYears.map(y => (
                                            <MenuItem key={y} value={y} sx={{ fontSize: 13 }}>{y}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontSize: 13 }}>{isTC ? 'Last Class' : 'Current Class'}</InputLabel>
                                    <Select
                                        value={srcClassId}
                                        label={isTC ? 'Last Class' : 'Current Class'}
                                        onChange={(e) => { setSrcClassId(e.target.value); setSrcSection([]); }}
                                        sx={{ fontSize: 13 }}
                                        disabled={isLoadingGrades}
                                    >
                                        {grades.length === 0 && !isLoadingGrades && (
                                            <MenuItem disabled value=""><em>No classes configured</em></MenuItem>
                                        )}
                                        {grades.map(c => <MenuItem key={c.id} value={c.id}>{c.sign}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth size="small" disabled={!srcClass}>
                                    <InputLabel sx={{ fontSize: 13 }}>{isTC ? 'Last Section(s)' : 'Current Section(s)'}</InputLabel>
                                    <Select
                                        multiple
                                        value={srcSection}
                                        label={isTC ? 'Last Section(s)' : 'Current Section(s)'}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.includes('__all__')) {
                                                const allSections = srcClass?.sections || [];
                                                setSrcSection(srcSection.length === allSections.length ? [] : [...allSections]);
                                            } else {
                                                setSrcSection(typeof value === 'string' ? value.split(',') : value);
                                            }
                                        }}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.length === (srcClass?.sections || []).length ? (
                                                    <Chip label="All Sections" size="small" sx={{ height: 22, fontSize: 11, bgcolor: theme.light, color: theme.primary, fontWeight: 700 }} />
                                                ) : selected.map(s => (
                                                    <Chip key={s} label={`Section ${s}`} size="small" sx={{ height: 22, fontSize: 11 }} />
                                                ))}
                                            </Box>
                                        )}
                                        sx={{ fontSize: 13 }}
                                    >
                                        <MenuItem value="__all__" sx={{ fontSize: 13, borderBottom: '1px solid #E5E7EB' }}>
                                            <Checkbox
                                                size="small"
                                                checked={(srcClass?.sections || []).length > 0 && srcSection.length === (srcClass?.sections || []).length}
                                                indeterminate={srcSection.length > 0 && srcSection.length < (srcClass?.sections || []).length}
                                                sx={{ py: 0 }}
                                            />
                                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Select All</Typography>
                                        </MenuItem>
                                        {(srcClass?.sections || []).map(s => (
                                            <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                                                <Checkbox size="small" checked={srcSection.indexOf(s) > -1} sx={{ py: 0 }} />
                                                Section {s}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Selected context strip */}
                        <Box sx={{
                            mt: 1.5, p: 1.2, borderRadius: '8px',
                            bgcolor: sourceKey ? theme.light : '#FAFAFA',
                            border: `1px solid ${sourceKey ? theme.border : '#E5E7EB'}`,
                            display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap',
                        }}>
                            <GroupsIcon sx={{ fontSize: 18, color: sourceKey ? theme.primary : '#9CA3AF', flexShrink: 0 }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                    Context
                                </Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: sourceKey ? theme.dark : '#9CA3AF' }} noWrap>
                                    {sourceKey
                                        ? `${academicYear} · ${srcClass.sign} · Section${srcSection.length > 1 ? 's' : ''} ${srcSection.join(', ')}`
                                        : 'Choose academic year, class & section to continue'}
                                </Typography>
                            </Box>
                            {totalStudents > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4, flexShrink: 0 }}>
                                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: theme.dark, lineHeight: 1 }}>
                                        {totalStudents}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#666', fontWeight: 600 }}>
                                        students
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* ─── Mode-specific details ──────────────────────────── */}
                    <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB', mb: 2 }}>
                        <StepHeader
                            number={3}
                            title={isTC ? 'TC Details' : 'Discontinuation Details'}
                            hint={isTC ? 'when and why TC is being issued' : 'last working day and reason'}
                            accent={theme.primary}
                        />

                        {isTC ? (
                            <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth size="small" type="date"
                                        label="TC Issue Date"
                                        value={tcIssueDate}
                                        onChange={(e) => setTcIssueDate(e.target.value)}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 8 }}>
                                    <TextField
                                        fullWidth size="small"
                                        label="Reason / Remarks (optional)"
                                        placeholder="e.g. Moving to higher studies, family relocation, etc."
                                        value={tcReason}
                                        onChange={(e) => setTcReason(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth size="small" type="date"
                                        label="Last Attendance Date"
                                        value={lastAttendanceDate}
                                        onChange={(e) => setLastAttendanceDate(e.target.value)}
                                        slotProps={{
                                            inputLabel: { shrink: true },
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EventBusyIcon sx={{ fontSize: 16, color: theme.primary }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel sx={{ fontSize: 13 }}>Reason for Discontinuation</InputLabel>
                                        <Select
                                            value={discontinueReason}
                                            label="Reason for Discontinuation"
                                            onChange={(e) => setDiscontinueReason(e.target.value)}
                                            sx={{ fontSize: 13 }}
                                        >
                                            {DISCONTINUE_REASONS.map(r => (
                                                <MenuItem key={r.code} value={r.code} sx={{ fontSize: 13 }}>
                                                    {r.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth size="small"
                                        label={discontinueReason === 'other' ? 'Describe Reason *' : 'Additional Notes (optional)'}
                                        placeholder="Any extra details"
                                        value={discontinueDetails}
                                        onChange={(e) => setDiscontinueDetails(e.target.value)}
                                        required={discontinueReason === 'other'}
                                        sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {/* Warning / info banner */}
                        <Box sx={{
                            mt: 1.5, p: 1, borderRadius: '8px',
                            bgcolor: theme.light, border: `1px solid ${theme.border}`,
                            display: 'flex', alignItems: 'center', gap: 0.8,
                        }}>
                            <WarningAmberIcon sx={{ fontSize: 14, color: theme.primary, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 11, color: theme.softText, fontWeight: 600 }}>
                                {isTC
                                    ? 'Issuing TC marks the student as transferred and removes them from active enrollment. This action is permanent.'
                                    : 'Discontinuing a student removes them from active enrollment as of the last attendance date. Pending fees and records remain accessible for reference.'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* ─── Student selection ──────────────────────────────── */}
                    <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: '1px solid #E5E7EB' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2, flexWrap: 'wrap', gap: 1 }}>
                            <StepHeader
                                number={4}
                                title="Select Students"
                                hint={isTC
                                    ? 'tick one student, multiple, or the entire section'
                                    : 'tick the student(s) leaving the school'}
                                accent={theme.primary}
                            />
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <TextField
                                    size="small" placeholder="Search name or roll no…"
                                    value={search} onChange={(e) => setSearch(e.target.value)}
                                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment> } }}
                                    sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
                                />
                                {isTC && totalStudents > 0 && !allSelected && (
                                    <Button
                                        size="small"
                                        onClick={handleSelectEntireSection}
                                        startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
                                        sx={{
                                            textTransform: 'none', fontSize: 12, fontWeight: 700,
                                            color: theme.primary, borderRadius: '8px', height: 36,
                                            border: `1px solid ${theme.border}`, px: 1.5,
                                            '&:hover': { bgcolor: theme.light },
                                        }}
                                    >
                                        Select Entire Section
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {sourceKey && (
                            <Box sx={{
                                p: 1, mb: 1, borderRadius: '8px',
                                bgcolor: selectedCount > 0 ? theme.light : '#F9FAFB',
                                border: `1px solid ${selectedCount > 0 ? theme.border : '#E5E7EB'}`,
                                display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
                            }}>
                                <Typography sx={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>
                                    {selectedCount > 0
                                        ? `${selectedCount} of ${filteredStudents.length} selected`
                                        : 'Tick students from the list below'}
                                </Typography>
                                <Box sx={{ ml: 'auto' }}>
                                    <Button
                                        size="small"
                                        onClick={() => setSelected({})}
                                        disabled={selectedCount === 0}
                                        sx={{
                                            textTransform: 'none', fontSize: 12, fontWeight: 600,
                                            color: '#DC2626', borderRadius: '6px', height: 32, px: 1.2,
                                            '&:hover': { bgcolor: '#FEF2F2' },
                                            '&.Mui-disabled': { color: '#9CA3AF' },
                                        }}
                                    >
                                        Clear Selection
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {!sourceKey ? (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>
                                    Pick the class & section above to load students.
                                </Typography>
                            </Box>
                        ) : isLoadingStudents ? (
                            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress size={28} sx={{ color: theme.primary }} />
                            </Box>
                        ) : filteredStudents.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>
                                    {search ? `No students match "${search}".` : 'No students in this class.'}
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer sx={{ maxHeight: 420, border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableCell padding="checkbox" sx={{ bgcolor: '#F9FAFB' }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={filteredStudents.length > 0 && filteredStudents.every(s => selected[s.rollNumber])}
                                                    indeterminate={selectedCount > 0 && filteredStudents.some(s => !selected[s.rollNumber])}
                                                    onChange={(e) => handleSelectAllFiltered(e.target.checked)}
                                                    sx={{ color: theme.primary, '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: theme.primary } }}
                                                />
                                            </TableCell>
                                            {['#', 'Roll No', 'Student', 'Current'].map(h => (
                                                <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, bgcolor: '#F9FAFB' }}>
                                                    {h}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredStudents.map((s, idx) => {
                                            const isSel = !!selected[s.rollNumber];
                                            return (
                                                <TableRow key={s.rollNumber} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            size="small"
                                                            checked={isSel}
                                                            onChange={(e) => setSelected(prev => ({ ...prev, [s.rollNumber]: e.target.checked }))}
                                                            sx={{ color: theme.primary, '&.Mui-checked': { color: theme.primary } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: 12, color: '#9CA3AF' }}>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#374151' }}>
                                                            {s.rollNumber}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar
                                                                sx={{ width: 30, height: 30, bgcolor: colorFor(s.name), fontSize: 11, fontWeight: 700 }}
                                                            >
                                                                {getInitials(s.name)}
                                                            </Avatar>
                                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{s.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        {(s.grade || s.section) ? (
                                                            <Chip
                                                                size="small"
                                                                label={`${s.grade || ''}${s.grade && s.section ? ' · ' : ''}${s.section || ''}`}
                                                                sx={{
                                                                    fontSize: 11, fontWeight: 700, height: 22,
                                                                    bgcolor: '#F3F4F6', color: '#374151',
                                                                    border: '1px solid #E5E7EB',
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>—</Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>

                    {/* Bottom action bar */}
                    <Box sx={{
                        mt: 2, p: 1.5, borderRadius: '10px',
                        bgcolor: '#fff', border: '1px solid #E5E7EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isTC
                                ? <SchoolIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                : <PersonOffIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />}
                            <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                                {selectedCount > 0
                                    ? `${selectedCount} student${selectedCount !== 1 ? 's' : ''} ready · ${isTC ? 'TC will be issued' : 'will be marked as discontinued'}`
                                    : sourceKey
                                        ? 'Tick the students from the list, then click the action button.'
                                        : 'Choose context to begin.'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                onClick={() => navigate(-1)}
                                sx={{
                                    textTransform: 'none', fontSize: 13, fontWeight: 600,
                                    color: '#374151', borderRadius: '8px', px: 2, height: 36,
                                    border: '1px solid #E5E7EB', '&:hover': { bgcolor: '#F9FAFB' },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmClick}
                                disabled={selectedCount === 0 || !sourceKey}
                                startIcon={actionIcon}
                                sx={{
                                    textTransform: 'none', fontSize: 13, fontWeight: 700,
                                    bgcolor: theme.primary, color: '#fff',
                                    borderRadius: '8px', px: 2.5, height: 36,
                                    boxShadow: `0 2px 6px ${theme.primary}33`,
                                    transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
                                    '&:hover': {
                                        bgcolor: theme.dark,
                                        boxShadow: `0 4px 12px ${theme.primary}55`,
                                        transform: 'translateY(-1px)',
                                    },
                                    '&:active': { transform: 'translateY(0)' },
                                    '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
                                }}
                            >
                                {actionLabel}
                            </Button>
                        </Box>
                    </Box>
                    </>
                    )}
                </Box>
            </Box>

            {/* Confirmation dialog */}
            <Dialog open={confirmOpen} onClose={closeConfirm} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: '12px' } }}>
                <DialogTitle sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    pb: 1, bgcolor: theme.light, borderBottom: `1px solid ${theme.border}`,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: '8px',
                            bgcolor: '#fff', border: `1px solid ${theme.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CheckCircleIcon sx={{ color: theme.primary, fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111' }}>
                                {isTC ? 'Confirm TC Issue' : 'Confirm Discontinuation'}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: theme.softText }}>
                                {isTC
                                    ? 'Students will be marked as transferred and removed from active enrollment'
                                    : 'Students will be marked as discontinued from the last attendance date'}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeConfirm} disabled={isSubmitting}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: '12px !important' }}>
                    {/* Context grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                            <Typography sx={{ fontSize: 10, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                Academic Year
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                                {academicYear}
                            </Typography>
                        </Box>
                        <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                            <Typography sx={{ fontSize: 10, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                {isTC ? 'Last Class & Section(s)' : 'Class & Section(s)'}
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                                {srcClass?.sign} · Section{srcSection.length > 1 ? 's' : ''} {srcSection.join(', ')}
                            </Typography>
                        </Box>
                        <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                            <Typography sx={{ fontSize: 10, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                {isTC ? 'Issue Date' : 'Last Attendance'}
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                                {isTC ? tcIssueDate : lastAttendanceDate}
                            </Typography>
                        </Box>
                        <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                            <Typography sx={{ fontSize: 10, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                Reason
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111' }} noWrap>
                                {isTC
                                    ? (tcReason.trim() || '— Not specified —')
                                    : (DISCONTINUE_REASONS.find(r => r.code === discontinueReason)?.label || '—')}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{
                        p: 1.5, borderRadius: '8px',
                        bgcolor: theme.light, border: `1px solid ${theme.border}`,
                        display: 'flex', alignItems: 'center', gap: 1.2,
                    }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '50%',
                            bgcolor: theme.primary, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {isTC ? <SchoolIcon sx={{ fontSize: 20 }} /> : <PersonOffIcon sx={{ fontSize: 20 }} />}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: theme.dark }}>
                                {selectedCount} student{selectedCount !== 1 ? 's' : ''} will be {isTC ? 'issued TC' : 'discontinued'}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#6B7280' }}>
                                {srcClass?.sign} · Section{srcSection.length > 1 ? 's' : ''} {srcSection.join(', ')} · {academicYear}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: 22, fontWeight: 800, color: theme.dark, lineHeight: 1 }}>
                                {selectedCount}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: '#6B7280' }}>
                                students
                            </Typography>
                        </Box>
                    </Box>

                    {/* ─── Irreversibility warning + type-to-confirm (TC only) ─── */}
                    {requiresTypedConfirm && (
                        <Box sx={{
                            mt: 1.5,
                            borderRadius: '10px',
                            bgcolor: DANGER.light,
                            border: `1.5px solid ${DANGER.border}`,
                            overflow: 'hidden',
                        }}>
                            {/* Header strip */}
                            <Box sx={{
                                px: 1.5, py: 1,
                                bgcolor: DANGER.primary,
                                display: 'flex', alignItems: 'center', gap: 1,
                            }}>
                                <GppMaybeIcon sx={{ fontSize: 18, color: '#fff' }} />
                                <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: 0.6 }}>
                                    ACTION CANNOT BE REVERTED
                                </Typography>
                            </Box>

                            <Box sx={{ p: 1.5 }}>
                                <Typography sx={{ fontSize: 11.5, color: DANGER.text, lineHeight: 1.6, mb: 1 }}>
                                    {isTC ? (
                                        <>
                                            Once Transfer Certificates are issued, the action is <strong>permanent</strong>.
                                            The {selectedCount} selected student{selectedCount !== 1 ? 's' : ''} will be marked as
                                            <strong> transferred</strong> and removed from active enrollment. This cannot be undone
                                            from the application — please double-check your selection.
                                        </>
                                    ) : (
                                        <>
                                            Once students are marked as discontinued, the action is <strong>permanent</strong>.
                                            The {selectedCount} selected student{selectedCount !== 1 ? 's' : ''} will be marked as
                                            <strong> discontinued</strong> from <strong>{lastAttendanceDate}</strong> and removed
                                            from active enrollment. This cannot be undone from the application — please double-check
                                            your selection.
                                        </>
                                    )}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.6 }}>
                                    <LockIcon sx={{ fontSize: 13, color: DANGER.primary }} />
                                    <Typography sx={{ fontSize: 11, color: DANGER.text, fontWeight: 700 }}>
                                        To proceed, type
                                        <Box component="span" sx={{
                                            mx: 0.5, px: 0.7, py: 0.1,
                                            bgcolor: '#fff', border: `1px solid ${DANGER.border}`,
                                            borderRadius: '4px', fontFamily: 'monospace', fontWeight: 800,
                                            color: DANGER.primary, letterSpacing: 0.5,
                                        }}>
                                            {CONFIRM_KEYWORD}
                                        </Box>
                                        below
                                    </Typography>
                                </Box>

                                <TextField
                                    fullWidth
                                    size="small"
                                    autoComplete="off"
                                    placeholder={`Type "${CONFIRM_KEYWORD}" to enable ${actionLabel}`}
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    disabled={isSubmitting}
                                    slotProps={{
                                        input: {
                                            endAdornment: isConfirmTextValid ? (
                                                <InputAdornment position="end">
                                                    <CheckCircleIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                                                </InputAdornment>
                                            ) : null,
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: '#fff',
                                            fontSize: 13,
                                            fontFamily: 'monospace',
                                            fontWeight: 700,
                                            borderRadius: '8px',
                                            '& fieldset': {
                                                borderColor: isConfirmTextValid ? '#16A34A' : DANGER.border,
                                                borderWidth: isConfirmTextValid ? '2px' : '1.5px',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: isConfirmTextValid ? '#16A34A' : DANGER.primary,
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: isConfirmTextValid ? '#16A34A' : DANGER.primary,
                                            },
                                        },
                                    }}
                                />

                                {confirmText.length > 0 && !isConfirmTextValid && (
                                    <Typography sx={{ fontSize: 10.5, color: DANGER.primary, mt: 0.5, fontWeight: 600 }}>
                                        Text must match "{CONFIRM_KEYWORD}" exactly (case-insensitive).
                                    </Typography>
                                )}
                                {isConfirmTextValid && (
                                    <Typography sx={{ fontSize: 10.5, color: '#16A34A', mt: 0.5, fontWeight: 700 }}>
                                        ✓ Confirmed — you can now {isTC ? 'issue the TC' : 'mark as discontinued'}.
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
                    <Button
                        onClick={closeConfirm}
                        disabled={isSubmitting}
                        sx={{
                            textTransform: 'none', fontSize: 13, fontWeight: 600,
                            color: '#374151', borderRadius: '8px',
                            border: '1px solid #E5E7EB', px: 2, height: 36,
                            '&:hover': { bgcolor: '#F9FAFB' },
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !canSubmit}
                        startIcon={isSubmitting
                            ? <CircularProgress size={14} sx={{ color: '#fff' }} />
                            : (requiresTypedConfirm && !isConfirmTextValid ? <LockIcon sx={{ fontSize: 16 }} /> : actionIcon)}
                        sx={{
                            textTransform: 'none', fontSize: 13, fontWeight: 700,
                            bgcolor: theme.primary, color: '#fff', borderRadius: '8px',
                            px: 2.5, height: 36,
                            boxShadow: `0 2px 6px ${theme.primary}33`,
                            '&:hover': { bgcolor: theme.dark, boxShadow: `0 4px 12px ${theme.primary}55` },
                            '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
                        }}
                    >
                        {isSubmitting
                            ? (isTC ? 'Issuing TC…' : 'Discontinuing…')
                            : (requiresTypedConfirm && !isConfirmTextValid
                                ? `Type "${CONFIRM_KEYWORD}" to enable`
                                : `${actionLabel} for ${selectedCount} Student${selectedCount !== 1 ? 's' : ''}`)}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
