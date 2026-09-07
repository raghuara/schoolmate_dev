import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Grid, Typography, IconButton, Button, Chip, TextField, Select, MenuItem,
    FormControl, InputLabel, Checkbox, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, Avatar, Divider, InputAdornment, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress,
Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EastIcon from '@mui/icons-material/East';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { findSubMenuPermissions } from '../../Redux/Slices/AuthSlice';
import axios from 'axios';
import { DASH, RADIUS, KPI_TONES, SolidStatCard } from '../DashBoardComps/dashboardTheme';
import { selectGrades, selectGradesLoading, fetchGradesData } from '../../Redux/Slices/DropdownController';
import {
    FetchPromotableStudents,
    FetchPromotedStudents,
    PostPromoteStudents,
    UpdatePromotedStudents,
} from '../../Api/Api';
import SnackBar from '../SnackBar';

const TOKEN = '123';

// Promote = emerald green, Edit = indigo (clearly different).
const PROMOTE_THEME = { main: DASH.green, light: DASH.greenLight, dark: '#15803D', border: `${DASH.green}4D` };
const EDIT_THEME    = { main: '#4F46E5', light: DASH.blueLight, dark: '#3730A3', border: '#BFDBFE' };

const DEFAULT_CAPACITY = 35;

const getInitials = (name = '') =>
    name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

const AVATAR_PALETTE = [DASH.cyan, '#7C3AED', '#EA580C', DASH.red, DASH.green, '#2563EB', '#DB2777', '#CA8A04'];
const colorFor = (name = '') => AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

const GENDER_STYLES = {
    male:   { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE', label: 'Male' },
    female: { bg: '#FCE7F3', color: '#BE185D', border: '#FBCFE8', label: 'Female' },
};
const genderStyle = (g) => {
    const norm = String(g || '').trim().toLowerCase();
    if (norm.startsWith('m')) return GENDER_STYLES.male;
    if (norm.startsWith('f')) return GENDER_STYLES.female;
    return null;
};


const FieldSkeleton = () => (
    <Box>
        <Skeleton variant="rounded" width="42%" height={9} sx={{ bgcolor: DASH.lineSoft }} />
        <Skeleton variant="rounded" height={38} sx={{ bgcolor: DASH.lineSoft, borderRadius: RADIUS, mt: 0.8 }} />
    </Box>
);

const SelectorPanelsSkeleton = () => (
    <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: `1px solid ${DASH.line}` }}>
                <Skeleton variant="rounded" width="55%" height={13} sx={{ bgcolor: DASH.lineSoft, mb: 2 }} />
                <Grid container spacing={2}>
                    {[0, 1].map((i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6 }}>
                            <FieldSkeleton />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: `1px solid ${DASH.line}` }}>
                <Skeleton variant="rounded" width="45%" height={13} sx={{ bgcolor: DASH.lineSoft, mb: 2 }} />
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid size={{ xs: 6, sm: 5 }}><FieldSkeleton /></Grid>
                    <Grid size={{ xs: 6, sm: 4 }}><FieldSkeleton /></Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Skeleton variant="rounded" height={38} sx={{ bgcolor: DASH.lineSoft, borderRadius: RADIUS }} />
                    </Grid>
                </Grid>
            </Box>
        </Grid>
    </Grid>
);

const PromotionStatsSkeleton = () => (
    <Grid container spacing={2} sx={{ mt: 0.5 }} alignItems="stretch">
        {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rounded" height={100} sx={{ bgcolor: DASH.lineSoft, borderRadius: '7px' }} />
            </Grid>
        ))}
    </Grid>
);

const StudentRowsSkeleton = ({ rows = 8, columns = 6 }) => (
    <TableContainer sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, bgcolor: '#fff' }}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    {[...Array(columns)].map((_, i) => (
                        <TableCell key={i} sx={{ bgcolor: DASH.surface, borderBottom: `1px solid ${DASH.line}`, py: 1.1 }}>
                            <Skeleton variant="rounded" height={9} width="62%" sx={{ bgcolor: DASH.lineSoft }} />
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {[...Array(rows)].map((_, r) => (
                    <TableRow key={r}>
                        {[...Array(columns)].map((_, c) => (
                            <TableCell key={c} sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1.2 }}>
                                {c === 0 ? (
                                    <Skeleton variant="rounded" width={18} height={18} sx={{ bgcolor: DASH.lineSoft }} />
                                ) : (
                                    <Skeleton variant="rounded" height={11} width={c === 2 ? '78%' : '52%'} sx={{ bgcolor: DASH.lineSoft }} />
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

export default function StudentPromotionPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const grades = useSelector(selectGrades) || [];
    const isLoadingGrades = useSelector(selectGradesLoading);
    const authUser = useSelector(state => state.auth);
    // Promoting students and re-routing ones already promoted are separate grants.
    const rbacReady = (authUser?.permissions?.mainMenus || []).length > 0;
    const promoPerms = findSubMenuPermissions(authUser?.permissions, "accesscontrol", "studentpromotion") || {};
    const canPromote = !rbacReady || promoPerms.allowstudentpromotion === "Y";
    const canEditPromoted = !rbacReady || promoPerms.alloweditpromotedstudents === "Y";
    const promotedByRollNumber = authUser?.rollNumber || '';

    // 'promote' = move not-yet-promoted students; 'edit' = re-route already-promoted students
    const [mode, setMode] = useState(canPromote ? 'promote' : 'edit');
    const isEditMode = mode === 'edit';
    const T = isEditMode ? EDIT_THEME : PROMOTE_THEME;

    useEffect(() => {
        if (!grades || grades.length === 0) {
            dispatch(fetchGradesData());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [srcClassId, setSrcClassId] = useState('');
    const [srcSection, setSrcSection] = useState('');

    const srcClass = useMemo(() => grades.find(c => c.id === srcClassId) || null, [grades, srcClassId]);
    const sourceKey = srcClassId && srcSection ? `${srcClassId}-${srcSection}` : '';

    const [pickClassId, setPickClassId] = useState('');
    const [pickSection, setPickSection] = useState('');
    const [destinations, setDestinations] = useState([]);

    const pickClass = useMemo(() => grades.find(c => c.id === pickClassId) || null, [grades, pickClassId]);

    // Promote: only the NEXT class (year-end promotion).
    // Edit:    only the SAME class (typical edit = move to a different section within the class).
    const eligibleDestGrades = useMemo(() => {
        if (!srcClass || grades.length === 0) return [];
        const idx = grades.findIndex(g => g.id === srcClass.id);
        if (idx === -1) return [];
        if (isEditMode) {
            return [grades[idx]]; // same class only
        }
        return grades[idx + 1] ? [grades[idx + 1]] : []; // next class only
    }, [srcClass, grades, isEditMode]);

    const eligibleDestIds = useMemo(
        () => new Set(eligibleDestGrades.map(g => g.id)),
        [eligibleDestGrades]
    );

    const eligibilityHint = useMemo(() => {
        if (!srcClass) return '';
        if (isEditMode) {
            return `Edit mode — destination is locked to ${srcClass.sign} (pick a different section).`;
        }
        if (eligibleDestGrades.length === 0) {
            return `${srcClass.sign} has no next class — promotion not possible.`;
        }
        return `${srcClass.sign} students can only be promoted to ${eligibleDestGrades[0].sign} (next class).`;
    }, [srcClass, eligibleDestGrades, isEditMode]);

    useEffect(() => {
        // Auto-pick the single eligible destination class so the dropdown is pre-filled.
        // Edit  → same class. Promote → next class (or nothing if there's no next).
        const target = eligibleDestGrades[0];
        if (target && target.sections && target.sections.length > 0) {
            setPickClassId(target.id);
            setPickSection(target.sections[0]);
        } else {
            setPickClassId('');
            setPickSection('');
        }
    }, [eligibleDestGrades]);

    useEffect(() => {
        setDestinations([]);
        setAssignments({});
        setSelected({});
        setBulkDestKey('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [srcClassId]);

    const handleAddDestination = () => {
        if (!pickClassId || !pickSection) return;
        if (eligibleDestIds.size > 0 && !eligibleDestIds.has(pickClassId)) {
            showSnack(`${grades.find(g => g.id === pickClassId)?.sign || 'That class'} is not a valid destination for ${srcClass?.sign || 'this source'}.`, false);
            return;
        }
        const key = `${pickClassId}-${pickSection}`;
        if (destinations.some(d => d.key === key)) {
            showSnack('This destination is already added.', false);
            return;
        }
        const cls = grades.find(c => c.id === pickClassId);
        setDestinations(prev => [...prev, {
            key,
            classId: pickClassId,
            section: pickSection,
            classLabel: cls?.sign || String(pickClassId),
            capacity: cls?.capacity || DEFAULT_CAPACITY,
        }]);
    };

    const handleRemoveDestination = (key) => {
        setDestinations(prev => prev.filter(d => d.key !== key));
        setAssignments(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(rn => { if (next[rn] === key) delete next[rn]; });
            return next;
        });
    };

    const [students, setStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [assignments, setAssignments] = useState({});  // { rollNumber: destinationKey }
    const [selected, setSelected] = useState({});        // { rollNumber: true }
    const [search, setSearch] = useState('');
    const [bulkDestKey, setBulkDestKey] = useState('');
    const [distributeOpen, setDistributeOpen] = useState(false);
    const [distributeTipOpen, setDistributeTipOpen] = useState(false);

    useEffect(() => {
        if (!srcClassId || !srcSection) {
            setStudents([]);
            setAssignments({});
            setSelected({});
            return;
        }

        let cancelled = false;
        setIsLoadingStudents(true);
        setAssignments({});
        setSelected({});

        const endpoint = isEditMode ? FetchPromotedStudents : FetchPromotableStudents;
        const errorLabel = isEditMode ? 'promoted students' : 'promotable students';

        axios.get(endpoint, {
            params: { gradeId: srcClassId, sectionName: srcSection },
            headers: { Authorization: `Bearer ${TOKEN}` },
        })
            .then(res => {
                if (cancelled) return;
                const data = res?.data || {};
                if (data.error) {
                    setStudents([]);
                    showSnack(data.message || `Failed to load ${errorLabel}.`, false);
                    return;
                }
                const gradeName = data.gradeName || '';
                const sectionName = data.sectionName || '';
                const list = (data.students || []).map(s => ({
                    id: s.rollNumber,
                    rollNumber: String(s.rollNumber),
                    name: s.name || '—',
                    gender: s.gender || '',
                    photoUrl: '',
                    grade: gradeName,
                    section: sectionName,
                }));
                setStudents(list);
            })
            .catch(err => {
                if (cancelled) return;
                console.error(`${isEditMode ? 'FetchPromotedStudents' : 'FetchPromotableStudents'} failed:`, err);
                setStudents([]);
                showSnack(
                    err?.response?.data?.message || `Failed to load ${errorLabel}.`,
                    false
                );
            })
            .finally(() => {
                if (!cancelled) setIsLoadingStudents(false);
            });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [srcClassId, srcSection, isEditMode]);

    const filteredStudents = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return students;
        return students.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.rollNumber.toLowerCase().includes(q)
        );
    }, [students, search]);

    const distributionCounts = useMemo(() => {
        const counts = {};
        destinations.forEach(d => { counts[d.key] = 0; });
        Object.values(assignments).forEach(key => {
            if (counts[key] !== undefined) counts[key]++;
        });
        return counts;
    }, [assignments, destinations]);

    const selectedCount = Object.values(selected).filter(Boolean).length;
    const assignedCount = Object.keys(assignments).length;
    const totalStudents = students.length;

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelected(filteredStudents.reduce((acc, s) => { acc[s.rollNumber] = true; return acc; }, {}));
        } else {
            setSelected({});
        }
    };

    const handleApplyBulkDestination = () => {
        if (!bulkDestKey) return;
        const selectedRolls = Object.keys(selected).filter(rn => selected[rn]);
        if (selectedRolls.length === 0) return;

        const next = { ...assignments };
        selectedRolls.forEach(rn => { next[rn] = bulkDestKey; });
        setAssignments(next);

        // Clear selection so the admin can pick the next batch.
        setSelected({});
        setBulkDestKey('');

        const dest = destinations.find(d => d.key === bulkDestKey);
        if (dest) {
            showSnack(
                `${selectedRolls.length} student${selectedRolls.length !== 1 ? 's' : ''} assigned to ${dest.classLabel} ${dest.section}.`,
                true
            );
        }
    };

    const handleAutoDistribute = (direction = 'sequential') => {
        if (destinations.length === 0) return;

        const selectedStudents = students.filter(s => selected[s.rollNumber]);
        if (selectedStudents.length === 0) return;

        const next = { ...assignments };

        if (direction === 'gender') {
            const genderRank = (g) => {
                const norm = String(g || '').trim().toLowerCase();
                if (norm.startsWith('m')) return 0;
                if (norm.startsWith('f')) return 1;
                return 2;
            };
            const sorted = [...selectedStudents].sort((a, b) => genderRank(a.gender) - genderRank(b.gender));
            const total = sorted.length;
            const k = destinations.length;
            sorted.forEach((s, idx) => {
                const destIdx = Math.min(k - 1, Math.floor((idx * k) / total));
                next[s.rollNumber] = destinations[destIdx].key;
            });
            setAssignments(next);
            setSelected({});
            setBulkDestKey('');
            showSnack(
                `${total} student${total !== 1 ? 's' : ''} grouped by gender across ${k} destination${k !== 1 ? 's' : ''} (boys first, girls last).`,
                true
            );
            return;
        }

        const ordered = direction === 'reverse'
            ? [...destinations].reverse()
            : destinations;

        selectedStudents.forEach((s, idx) => {
            next[s.rollNumber] = ordered[idx % ordered.length].key;
        });
        setAssignments(next);

        setSelected({});
        setBulkDestKey('');

        const directionLabel = direction === 'reverse' ? 'reverse sequential' : 'sequential';
        showSnack(
            `${selectedStudents.length} student${selectedStudents.length !== 1 ? 's' : ''} distributed across ${destinations.length} destination${destinations.length !== 1 ? 's' : ''} (${directionLabel}).`,
            true
        );
    };

    const handleClearAssignments = () => {
        setAssignments({});
    };

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, success) => {
        setSnackMessage(msg); setSnackOpen(true);
        setSnackColor(success); setSnackStatus(success);
    };

    const validateBeforeSubmit = () => {
        if (!sourceKey) { showSnack('Pick a source class first.', false); return false; }
        if (destinations.length === 0) { showSnack('Add at least one destination class.', false); return false; }
        if (assignedCount === 0) { showSnack('Assign at least one student to a destination.', false); return false; }
        return true;
    };

    const handleConfirmPromote = () => {
        if (!validateBeforeSubmit()) return;
        setConfirmOpen(true);
    };

    const handleModeChange = (next) => {
        if (next === mode) return;
        if (next === 'promote' && !canPromote) return;
        if (next === 'edit' && !canEditPromoted) return;
        setMode(next);
        setSrcClassId(''); setSrcSection('');
        setPickClassId(''); setPickSection('');
        setDestinations([]);
        setStudents([]);
        setAssignments({}); setSelected({});
        setBulkDestKey('');
        setSearch('');
    };

    const handleSubmitPromotion = async () => {
        if (!promotedByRollNumber) {
            showSnack('Could not identify the logged-in user. Please re-login and try again.', false);
            return;
        }

        const studentsPayload = Object.entries(assignments).map(([rollNumber, destKey]) => {
            const dest = destinations.find(d => d.key === destKey);
            if (!dest) return null;
            return {
                studentRollNumber: String(rollNumber),
                currentGradeId: srcClass.id,
                currentGradeName: srcClass.sign,
                destinationGradeId: dest.classId,
                destinationGradeName: dest.classLabel,
                destinationSectionName: dest.section,
            };
        }).filter(Boolean);

        if (studentsPayload.length === 0) {
            showSnack(isEditMode ? 'No students assigned to update.' : 'No assigned students to promote.', false);
            return;
        }

        const userKey = isEditMode ? 'updatedByRollNumber' : 'promotedByRollNumber';
        const payload = {
            [userKey]: String(promotedByRollNumber),
            students: studentsPayload,
        };

        setIsSubmitting(true);
        try {
            const res = isEditMode
                ? await axios.put(UpdatePromotedStudents, payload, { headers: { Authorization: `Bearer ${TOKEN}` } })
                : await axios.post(PostPromoteStudents,    payload, { headers: { Authorization: `Bearer ${TOKEN}` } });
            if (res?.data?.error) {
                throw new Error(res.data.message || 'Server reported an error.');
            }
            const count = studentsPayload.length;
            const verb  = isEditMode ? 'updated' : 'promoted';
            showSnack(`${count} student${count !== 1 ? 's' : ''} ${verb} successfully.`, true);
            setStudents([]); setAssignments({}); setSelected({}); setDestinations([]);
            setSrcClassId(''); setSrcSection('');
            setConfirmOpen(false);
        } catch (err) {
            console.error(`${isEditMode ? 'Update' : 'Promotion'} failed:`, err);
            showSnack(
                err?.response?.data?.message || err?.message
                || `Failed to ${isEditMode ? 'update' : 'promote'} students. Please try again.`,
                false
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />

            <Box sx={{ width: '100%' }}>
                <Box sx={{
                    backgroundColor: DASH.canvas, px: 2, py: 1.2,
                    borderBottom: `1px solid ${DASH.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
                        </IconButton>
                        <Box sx={{
                            width: 30, height: 30, borderRadius: RADIUS,
                            bgcolor: T.light, border: `1px solid ${T.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <TrendingUpIcon sx={{ color: T.main, fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 20, fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                {isEditMode ? 'Edit Promoted Students' : 'Student Promotion'}
                            </Typography>
                            <Typography sx={{ fontSize: 11.5, color: DASH.muted }}>
                                {isEditMode
                                    ? 'Re-route already-promoted students to a different class or section'
                                    : 'Move students from one class & section to another — year-end or mid-year'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Mode toggle — segmented control */}
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        bgcolor: '#fff', borderRadius: '50px',
                        border: `1px solid ${T.border}`, p: 0.4,
                        boxShadow: `0 1px 2px ${T.main}1A`,
                    }}>
                        {[
                            { key: 'promote', label: 'Promote New', tone: PROMOTE_THEME, show: canPromote },
                            { key: 'edit',    label: 'Edit Promoted', tone: EDIT_THEME, show: canEditPromoted },
                        ].filter(opt => opt.show).map(opt => {
                            const active = mode === opt.key;
                            return (
                                <Tooltip
                                    key={opt.key}
                                    title={opt.key === 'edit'
                                        ? 'Switch to edit mode — load already-promoted students and update their class/section.'
                                        : 'Switch to promote mode — load not-yet-promoted students and assign new classes.'}
                                    arrow placement="bottom"
                                >
                                    <Box
                                        onClick={() => handleModeChange(opt.key)}
                                        sx={{
                                            px: 1.6, py: 0.5, borderRadius: '50px',
                                            cursor: 'pointer', userSelect: 'none',
                                            bgcolor: active ? opt.tone.main : 'transparent',
                                            color: active ? '#fff' : DASH.text,
                                            fontSize: 12, fontWeight: 700,
                                            transition: 'all 0.18s',
                                            boxShadow: active ? `0 2px 6px ${opt.tone.main}55` : 'none',
                                            '&:hover': active ? {} : { bgcolor: opt.tone.light, color: opt.tone.dark },
                                        }}
                                    >
                                        {opt.label}
                                    </Box>
                                </Tooltip>
                            );
                        })}
                    </Box>
                </Box>

                <Box sx={{
                    p: 2,
                    height: '77vh',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { bgcolor: DASH.faint, borderRadius: 10 },
                }}>
                    {isLoadingGrades ? <SelectorPanelsSkeleton /> : (
                    <Grid container spacing={2} alignItems="flex-start">
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: `1px solid ${DASH.line}` }}>
                                <StepHeader number={1} title="Source Class" theme={T} />
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ fontSize: 13 }}>Class</InputLabel>
                                            <Select
                                                value={srcClassId}
                                                label="Class"
                                                onChange={(e) => { setSrcClassId(e.target.value); setSrcSection(''); }}
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
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small" disabled={!srcClass}>
                                            <InputLabel sx={{ fontSize: 13 }}>Section</InputLabel>
                                            <Select
                                                value={srcSection}
                                                label="Section"
                                                onChange={(e) => setSrcSection(e.target.value)}
                                                sx={{ fontSize: 13 }}
                                            >
                                                {(srcClass?.sections || []).map(s => <MenuItem key={s} value={s}>Section {s}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Box sx={{
                                    mt: 2,
                                    p: 1.2, borderRadius: RADIUS,
                                    bgcolor: srcClassId ? T.light : DASH.surface,
                                    border: `1px solid ${srcClassId ? T.border : DASH.line}`,
                                    display: 'flex', alignItems: 'center', gap: 1,
                                }}>
                                    <GroupsIcon sx={{ fontSize: 18, color: srcClassId ? T.main : DASH.faint, flexShrink: 0 }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 11, color: DASH.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                            Selected source
                                        </Typography>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: srcClassId ? T.dark : DASH.faint }} noWrap>
                                            {srcClassId
                                                ? `${srcClass.sign} ${srcSection || '— no section —'}`
                                                : 'Choose a class & section to load students'}
                                        </Typography>
                                    </Box>
                                    {totalStudents > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4, flexShrink: 0 }}>
                                            <Typography sx={{ fontSize: 18, fontWeight: 800, color: T.dark, lineHeight: 1 }}>
                                                {totalStudents}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11.5, color: DASH.muted, fontWeight: 600 }}>
                                                students
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fff', border: `1px solid ${DASH.line}` }}>
                                <StepHeader number={2} title="Destination Classes" hint="add one or more — students get split across these" theme={T} />

                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 6, sm: 5 }}>
                                        <FormControl fullWidth size="small" disabled={!srcClass || isLoadingGrades}>
                                            <InputLabel sx={{ fontSize: 13 }}>Class</InputLabel>
                                            <Select
                                                value={pickClassId} label="Class"
                                                onChange={(e) => { setPickClassId(e.target.value); setPickSection(''); }}
                                                sx={{ fontSize: 13 }}
                                            >
                                                {!srcClass && (
                                                    <MenuItem disabled value=""><em>Pick source first</em></MenuItem>
                                                )}
                                                {srcClass && eligibleDestGrades.length === 0 && (
                                                    <MenuItem disabled value=""><em>No eligible classes</em></MenuItem>
                                                )}
                                                {srcClass && eligibleDestGrades.map((c) => (
                                                    <MenuItem key={c.id} value={c.id}>
                                                        {c.sign}
                                                        {isEditMode ? ' (same class)' : ' (next class)'}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 4 }}>
                                        <FormControl fullWidth size="small" disabled={!pickClass}>
                                            <InputLabel sx={{ fontSize: 13 }}>Section</InputLabel>
                                            <Select value={pickSection} label="Section" onChange={(e) => setPickSection(e.target.value)} sx={{ fontSize: 13 }}>
                                                {(pickClass?.sections || []).map(s => <MenuItem key={s} value={s}>Section {s}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                            disabled={!pickClassId || !pickSection}
                                            onClick={handleAddDestination}
                                            sx={{
                                                textTransform: 'none', fontSize: 13, fontWeight: 700,
                                                bgcolor: T.main, color: '#fff', borderRadius: RADIUS, height: 40,
                                                boxShadow: `0 2px 6px ${T.main}33`,
                                                '&:hover': { bgcolor: T.dark, boxShadow: `0 4px 12px ${T.main}55` },
                                                '&.Mui-disabled': { bgcolor: DASH.line, color: DASH.faint },
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </Grid>
                                </Grid>

                                {eligibilityHint && (
                                    <Box sx={{
                                        mt: 1, p: 0.8, borderRadius: RADIUS,
                                        bgcolor: '#EFF6FF', border: '1px solid #BFDBFE',
                                        display: 'flex', alignItems: 'center', gap: 0.6,
                                    }}>
                                        <InfoOutlinedIcon sx={{ fontSize: 13, color: '#2563EB', flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: 11, color: '#1E40AF', fontWeight: 600 }}>
                                            {eligibilityHint}
                                        </Typography>
                                    </Box>
                                )}

                                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                    {destinations.length === 0 ? (
                                        <Box sx={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: `1px dashed ${DASH.line}`, borderRadius: RADIUS,
                                            bgcolor: DASH.surface, minHeight: 80, p: 2,
                                        }}>
                                            <Typography sx={{ fontSize: 12, color: DASH.faint, textAlign: 'center' }}>
                                                Pick a class & section above and click <strong>Add</strong> to create a destination.
                                                You can add multiple to split students across them.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        destinations.map((d) => {
                                            const filled = distributionCounts[d.key] || 0;
                                            return (
                                                <Box key={d.key} sx={{
                                                    p: 1.2, borderRadius: RADIUS,
                                                    bgcolor: '#fff',
                                                    border: `1.5px solid ${T.border}`,
                                                    display: 'flex', alignItems: 'center', gap: 1,
                                                }}>
                                                    <Box sx={{
                                                        width: 30, height: 30, borderRadius: RADIUS,
                                                        bgcolor: T.light,
                                                        border: `1px solid ${T.border}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}>
                                                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: T.main }}>
                                                            {d.section}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }} noWrap>
                                                            {d.classLabel} {d.section}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 11, color: DASH.muted }}>
                                                            {filled} student{filled !== 1 ? 's' : ''} assigned
                                                        </Typography>
                                                    </Box>
                                                    <Tooltip title="Remove this destination">
                                                        <IconButton size="small" onClick={() => handleRemoveDestination(d.key)}
                                                            sx={{ width: 26, height: 26, color: DASH.faint, '&:hover': { color: DASH.red, bgcolor: DASH.redLight } }}>
                                                            <CloseIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            );
                                        })
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                    )}

                    {sourceKey && (
                        isLoadingStudents ? <PromotionStatsSkeleton /> : (
                            <Grid container spacing={2} sx={{ mt: 0.5 }} alignItems="stretch">
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <SolidStatCard
                                        icon={GroupsIcon}
                                        label={isEditMode ? 'Promoted' : 'In This Class'}
                                        value={students.length}
                                        note={isEditMode ? 'Already moved, editable' : 'Awaiting promotion'}
                                        tone={KPI_TONES.blue}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <SolidStatCard
                                        icon={PlaylistAddCheckIcon}
                                        label="Selected"
                                        value={selectedCount}
                                        note={selectedCount > 0 ? 'Ready for bulk assign' : 'Tick rows to bulk assign'}
                                        tone={KPI_TONES.violet}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <SolidStatCard
                                        icon={CheckCircleIcon}
                                        label="Assigned"
                                        value={assignedCount}
                                        note={`Across ${destinations.filter(d => distributionCounts[d.key] > 0).length} destination${destinations.filter(d => distributionCounts[d.key] > 0).length === 1 ? '' : 's'}`}
                                        tone={KPI_TONES.green}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <SolidStatCard
                                        icon={WarningAmberIcon}
                                        label="Unassigned"
                                        value={Math.max(0, students.length - assignedCount)}
                                        note={students.length - assignedCount > 0 ? 'Still need a destination' : 'Everyone has a destination'}
                                        tone={KPI_TONES.orange}
                                    />
                                </Grid>
                            </Grid>
                        )
                    )}

                    <Box sx={{ p: 2, mt: 2, borderRadius: '10px', bgcolor: '#fff', border: `1px solid ${DASH.line}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2, flexWrap: 'wrap', gap: 1 }}>
                            <StepHeader number={3} title="Assign Students" hint="select rows + pick destination per student or in bulk" theme={T} />
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <TextField
                                    size="small" placeholder="Search name or roll no…"
                                    value={search} onChange={(e) => setSearch(e.target.value)}
                                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: DASH.faint }} /></InputAdornment> } }}
                                    sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: RADIUS, fontSize: 13 } }}
                                />
                            </Box>
                        </Box>

                        {sourceKey && (
                            <Box sx={{
                                p: 1, mb: 1, borderRadius: RADIUS,
                                bgcolor: selectedCount > 0 ? T.light : DASH.surface,
                                border: `1px solid ${selectedCount > 0 ? T.border : DASH.line}`,
                                display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
                            }}>
                                <Typography sx={{ fontSize: 12, color: DASH.text, fontWeight: 600 }}>
                                    {selectedCount > 0
                                        ? `${selectedCount} of ${filteredStudents.length} selected`
                                        : 'Select students to apply bulk actions'}
                                </Typography>

                                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                    <FormControl size="small" disabled={selectedCount === 0 || destinations.length === 0}>
                                        <Select
                                            value={bulkDestKey} displayEmpty
                                            onChange={(e) => setBulkDestKey(e.target.value)}
                                            sx={{ fontSize: 12, minWidth: 200, height: 32, bgcolor: '#fff' }}
                                        >
                                            <MenuItem value="" disabled><em>Move selected to…</em></MenuItem>
                                            {destinations.map(d => (
                                                <MenuItem key={d.key} value={d.key} sx={{ fontSize: 12 }}>
                                                    {d.classLabel} {d.section}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        size="small" disabled={!bulkDestKey || selectedCount === 0}
                                        onClick={handleApplyBulkDestination}
                                        sx={{
                                            textTransform: 'none', fontSize: 12, fontWeight: 700,
                                            bgcolor: T.main, color: '#fff', borderRadius: RADIUS, height: 32, px: 1.5,
                                            '&:hover': { bgcolor: T.dark },
                                            '&.Mui-disabled': { bgcolor: DASH.line, color: DASH.faint },
                                        }}
                                    >
                                        Apply
                                    </Button>

                                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                                    <Tooltip
                                        title="Spread the selected students evenly across all destinations — pick the order"
                                        placement="top"
                                        arrow
                                        enterDelay={500}
                                        leaveDelay={0}
                                        open={distributeTipOpen && !distributeOpen}
                                        onOpen={() => setDistributeTipOpen(true)}
                                        onClose={() => setDistributeTipOpen(false)}
                                        disableInteractive
                                    >
                                        <span>
                                            <FormControl size="small" disabled={selectedCount === 0 || destinations.length === 0}>
                                                <Select
                                                    value=""
                                                    displayEmpty
                                                    open={distributeOpen}
                                                    onOpen={() => { setDistributeOpen(true); setDistributeTipOpen(false); }}
                                                    onClose={() => setDistributeOpen(false)}
                                                    onChange={(e) => {
                                                        const dir = e.target.value;
                                                        if (dir) handleAutoDistribute(dir);
                                                    }}
                                                    renderValue={() => (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                                            <ShuffleIcon sx={{ fontSize: 14, color: DASH.muted }} />
                                                            <Typography sx={{ fontSize: 12, color: DASH.text, fontWeight: 600 }}>
                                                                Distribute Evenly
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    MenuProps={{
                                                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                                                        transformOrigin: { vertical: 'top', horizontal: 'left' },
                                                        slotProps: { paper: { sx: { mt: 0.5, borderRadius: RADIUS, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' } } },
                                                    }}
                                                    sx={{
                                                        fontSize: 12, minWidth: 180, height: 32, bgcolor: '#fff',
                                                        borderRadius: RADIUS,
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: DASH.line },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: DASH.faint },
                                                    }}
                                                >
                                                    <MenuItem value="sequential" sx={{ fontSize: 12 }}>
                                                        Sequential (A1 → A2 → A3)
                                                    </MenuItem>
                                                    <MenuItem value="reverse" sx={{ fontSize: 12 }}>
                                                        Reverse Sequential (A3 → A2 → A1)
                                                    </MenuItem>
                                                    <MenuItem value="gender" sx={{ fontSize: 12 }}>
                                                        Group by Gender (Boys → Girls)
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </span>
                                    </Tooltip>
                                    <Button
                                        size="small" onClick={handleClearAssignments}
                                        sx={{
                                            textTransform: 'none', fontSize: 12, fontWeight: 600,
                                            color: DASH.red, borderRadius: RADIUS, height: 32, px: 1.2,
                                            '&:hover': { bgcolor: DASH.redLight },
                                        }}
                                    >
                                        Clear All
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {!sourceKey ? (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: 13, color: DASH.faint }}>
                                    Pick the source class above to load students.
                                </Typography>
                            </Box>
                        ) : isLoadingStudents ? (
                            <StudentRowsSkeleton rows={8} columns={6} />
                        ) : filteredStudents.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: DASH.ink }}>
                                    {search ? 'No matching students' : 'No students in this class'}
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: DASH.muted, mt: 0.5 }}>
                                    {search ? `Nothing matches "${search}" — try a roll number or a different name.` : 'Pick another class and section above.'}
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer sx={{ maxHeight: 420, border: `1px solid ${DASH.line}`, borderRadius: RADIUS }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: DASH.surface }}>
                                            <TableCell padding="checkbox" sx={{ bgcolor: DASH.surface }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={filteredStudents.length > 0 && filteredStudents.every(s => selected[s.rollNumber])}
                                                    indeterminate={selectedCount > 0 && filteredStudents.some(s => !selected[s.rollNumber])}
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    sx={{ color: T.main, '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: T.main } }}
                                                />
                                            </TableCell>
                                            {['#', 'Roll No', 'Student', 'Gender', 'Current', 'Move To'].map(h => (
                                                <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: DASH.muted, textTransform: 'uppercase', letterSpacing: 0.4, bgcolor: DASH.surface }}>
                                                    {h}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredStudents.map((s, idx) => {
                                            const isSel = !!selected[s.rollNumber];
                                            const dest = assignments[s.rollNumber] || '';
                                            return (
                                                <TableRow key={s.rollNumber} sx={{ '&:hover': { bgcolor: DASH.surface } }}>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            size="small"
                                                            checked={isSel}
                                                            onChange={(e) => setSelected(prev => ({ ...prev, [s.rollNumber]: e.target.checked }))}
                                                            sx={{ color: T.main, '&.Mui-checked': { color: T.main } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: 12, color: DASH.faint }}>{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: DASH.text }}>
                                                            {s.rollNumber}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar
                                                                src={s.photoUrl || undefined}
                                                                sx={{ width: 30, height: 30, bgcolor: colorFor(s.name), fontSize: 11, fontWeight: 700 }}
                                                            >
                                                                {getInitials(s.name)}
                                                            </Avatar>
                                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: DASH.ink }}>{s.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            const gs = genderStyle(s.gender);
                                                            return gs ? (
                                                                <Chip
                                                                    size="small"
                                                                    label={gs.label}
                                                                    sx={{
                                                                        fontSize: 11, fontWeight: 700, height: 22,
                                                                        bgcolor: gs.bg, color: gs.color,
                                                                        border: `1px solid ${gs.border}`,
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Typography sx={{ fontSize: 12, color: DASH.faint }}>—</Typography>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {(s.grade || s.section) ? (
                                                            <Chip
                                                                size="small"
                                                                label={`${s.grade || ''}${s.grade && s.section ? ' · ' : ''}${s.section || ''}`}
                                                                sx={{
                                                                    fontSize: 11, fontWeight: 700, height: 22,
                                                                    bgcolor: DASH.lineSoft, color: DASH.text,
                                                                    border: `1px solid ${DASH.line}`,
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography sx={{ fontSize: 12, color: DASH.faint }}>—</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormControl size="small" disabled={destinations.length === 0} sx={{ minWidth: 180 }}>
                                                            <Select
                                                                value={dest}
                                                                displayEmpty
                                                                onChange={(e) => {
                                                                    const v = e.target.value;
                                                                    setAssignments(prev => {
                                                                        const next = { ...prev };
                                                                        if (!v) delete next[s.rollNumber];
                                                                        else next[s.rollNumber] = v;
                                                                        return next;
                                                                    });
                                                                    if (v) setSelected(prev => ({ ...prev, [s.rollNumber]: true }));
                                                                }}
                                                                sx={{ fontSize: 12, height: 30, bgcolor: dest ? T.light : '#fff' }}
                                                            >
                                                                <MenuItem value=""><em>— not assigned —</em></MenuItem>
                                                                {destinations.map(d => (
                                                                    <MenuItem key={d.key} value={d.key} sx={{ fontSize: 12 }}>
                                                                        {d.classLabel} {d.section}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>

                    <Box sx={{
                        mt: 2, p: 1.5, borderRadius: '10px',
                        bgcolor: '#fff', border: `1px solid ${DASH.line}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: DASH.faint }} />
                            <Typography sx={{ fontSize: 12, color: DASH.muted }}>
                                {assignedCount > 0
                                    ? `${assignedCount} student${assignedCount !== 1 ? 's' : ''} ready to ${isEditMode ? 'update' : 'promote'} across ${destinations.filter(d => distributionCounts[d.key] > 0).length} destination${destinations.filter(d => distributionCounts[d.key] > 0).length !== 1 ? 's' : ''}`
                                    : sourceKey
                                        ? 'Pick a destination, select students, then assign each to a destination.'
                                        : 'Choose source class to begin.'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                onClick={() => navigate(-1)}
                                sx={{
                                    textTransform: 'none', fontSize: 13, fontWeight: 600,
                                    color: DASH.text, borderRadius: RADIUS, px: 2, height: 36,
                                    border: `1px solid ${DASH.line}`, '&:hover': { bgcolor: DASH.surface },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmPromote}
                                disabled={assignedCount === 0 || destinations.length === 0}
                                startIcon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                    textTransform: 'none', fontSize: 13, fontWeight: 700,
                                    bgcolor: T.main, color: '#fff',
                                    borderRadius: RADIUS, px: 2.5, height: 36,
                                    boxShadow: `0 2px 6px ${T.main}33`,
                                    transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
                                    '&:hover': {
                                        bgcolor: T.dark,
                                        boxShadow: `0 4px 12px ${T.main}55`,
                                        transform: 'translateY(-1px)',
                                    },
                                    '&:active': { transform: 'translateY(0)' },
                                    '&.Mui-disabled': { bgcolor: DASH.line, color: DASH.faint, boxShadow: 'none' },
                                }}
                            >
                                {isEditMode ? 'Update Students' : 'Promote Students'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Dialog open={confirmOpen} onClose={() => !isSubmitting && setConfirmOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: '10px' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, bgcolor: T.light, borderBottom: `1px solid ${T.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{
                            width: 30, height: 30, borderRadius: RADIUS,
                            bgcolor: '#fff', border: `1px solid ${T.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CheckCircleIcon sx={{ color: T.main, fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: DASH.ink }}>
                                {isEditMode ? 'Confirm Update' : 'Confirm Promotion'}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#5B7A6E' }}>
                                Review where each group of students will land
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: '12px !important' }}>
                    <Typography sx={{ fontSize: 12, color: DASH.muted, mb: 1.2 }}>
                        From <strong>{srcClass?.sign} {srcSection}</strong> →
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        {destinations.filter(d => distributionCounts[d.key] > 0).map(d => {
                            const filled = distributionCounts[d.key];
                            return (
                                <Box key={d.key} sx={{
                                    display: 'flex', alignItems: 'center', gap: 1,
                                    p: 1.2, borderRadius: RADIUS,
                                    bgcolor: DASH.surface, border: `1px solid ${DASH.line}`,
                                }}>
                                    <Box sx={{
                                        width: 30, height: 30, borderRadius: RADIUS,
                                        bgcolor: T.light, border: `1px solid ${T.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: T.main }}>
                                            {d.section}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }}>
                                            {d.classLabel} {d.section}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: DASH.muted }}>
                                            {filled} student{filled !== 1 ? 's' : ''} moving here
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: 18, fontWeight: 800, color: T.dark, lineHeight: 1 }}>
                                            {filled}
                                        </Typography>
                                        <Typography sx={{ fontSize: 10, color: DASH.muted }}>
                                            student{filled !== 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        disabled={isSubmitting}
                        sx={{
                            textTransform: 'none', fontSize: 13, fontWeight: 600,
                            color: DASH.text, borderRadius: RADIUS,
                            border: `1px solid ${DASH.line}`, px: 2, height: 36,
                            '&:hover': { bgcolor: DASH.surface },
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleSubmitPromotion} disabled={isSubmitting}
                        startIcon={isSubmitting
                            ? <CircularProgress size={14} sx={{ color: '#fff' }} />
                            : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            textTransform: 'none', fontSize: 13, fontWeight: 700,
                            bgcolor: T.main, color: '#fff', borderRadius: RADIUS,
                            px: 2.5, height: 36,
                            boxShadow: `0 2px 6px ${T.main}33`,
                            '&:hover': { bgcolor: T.dark, boxShadow: `0 4px 12px ${T.main}55` },
                            '&.Mui-disabled': { bgcolor: T.border, color: '#fff', boxShadow: 'none' },
                        }}
                    >
                        {isSubmitting
                            ? (isEditMode ? 'Updating…' : 'Promoting…')
                            : `${isEditMode ? 'Update' : 'Promote'} ${assignedCount} Student${assignedCount !== 1 ? 's' : ''}`}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

const StepHeader = ({ number, title, hint, theme }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
        <Box sx={{
            width: 22, height: 22, borderRadius: '50%',
            bgcolor: theme?.main || DASH.green, color: '#fff',
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
