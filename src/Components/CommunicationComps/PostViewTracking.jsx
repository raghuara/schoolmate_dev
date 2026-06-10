import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Typography, Tabs, Tab, Avatar, Chip, TextField, InputAdornment, IconButton, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    FormControl, Select, MenuItem, Checkbox, ListItemText, CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MessageIcon from '@mui/icons-material/Message';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GradingIcon from '@mui/icons-material/Grading';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { selectAcademicYear } from '../../Redux/Slices/academicYearSlice';
import { viewTracking, viewTrackingStatus } from '../../Api/Api';

const TOKEN = '123';
const PRIMARY = '#059669';
const BORDER = '#EDEFF2';
const authHeaders = { Authorization: `Bearer ${TOKEN}` };

// Tabs — `module` is the value sent to the API's Module param.
const TRACK_TABS = [
    { key: 'news', label: 'News', module: 'News', icon: NewspaperIcon, color: '#2563EB' },
    { key: 'messages', label: 'Messages', module: 'Messages', icon: MessageIcon, color: '#059669' },
    { key: 'circulars', label: 'Circulars', module: 'Circulars', icon: StickyNote2Icon, color: '#D97706' },
    { key: 'homework', label: 'Homework', module: 'Homework', icon: AssignmentIcon, color: '#DB2777' },
    { key: 'studymaterials', label: 'Study Materials', module: 'StudyMaterials', icon: LibraryBooksIcon, color: '#0891B2' },
    { key: 'marks', label: 'Marks', module: 'Marks', icon: GradingIcon, color: '#7C3AED' },
];

const AVATAR_PALETTE = ['#0E7490', '#6D28D9', '#C2410C', '#047857', '#1D4ED8', '#BE185D', '#A16207', '#0F766E'];
const avatarColorFor = (name = '') => AVATAR_PALETTE[((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % AVATAR_PALETTE.length];
const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function PostViewTracking() {
    const academicYear = useSelector(selectAcademicYear);

    const [activeTab, setActiveTab] = useState('news');
    const tab = TRACK_TABS.find(t => t.key === activeTab) || TRACK_TABS[0];

    // ── List view (viewTracking) ─────────────────────────────────────────────
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postSearch, setPostSearch] = useState('');

    // ── Detail view (viewTrackingStatus) ─────────────────────────────────────
    const [selectedPost, setSelectedPost] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [grade, setGrade] = useState('');          // '' = all classes
    const [sections, setSections] = useState([]);     // multi-select (only when a grade is chosen)
    const [status, setStatus] = useState('All');      // 'All' | 'Viewed' | 'NotViewed'
    const [search, setSearch] = useState('');

    const handleTabChange = (_, v) => {
        setActiveTab(v);
        setSelectedPost(null);
        setDetail(null);
        setPostSearch('');
    };

    // ── Fetch the post list whenever the module/academic year changes ─────────
    useEffect(() => {
        if (!academicYear) { setPosts([]); return undefined; }
        let cancelled = false;
        setPostsLoading(true);
        axios.get(viewTracking, { params: { Module: tab.module, AcademicYear: academicYear }, headers: authHeaders })
            .then((res) => {
                if (cancelled) return;
                const d = res?.data || {};
                setPosts(!d.error && Array.isArray(d.data) ? d.data : []);
            })
            .catch(() => { if (!cancelled) setPosts([]); })
            .finally(() => { if (!cancelled) setPostsLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, academicYear]);

    // ── Fetch the per-student status whenever the detail filters change ───────
    useEffect(() => {
        if (!selectedPost || !academicYear) return undefined;
        let cancelled = false;
        setDetailLoading(true);
        const params = {
            Module: tab.module,
            ViewStatusId: selectedPost.viewStatusId,
            AcademicYear: academicYear,
            status: 'All', // fetch everyone once; Viewed / Not Viewed is filtered on the UI
        };
        if (grade) params.grade = grade;
        if (grade && sections.length) params.sections = sections.join(',');
        axios.get(viewTrackingStatus, { params, headers: authHeaders })
            .then((res) => {
                if (cancelled) return;
                setDetail(res?.data?.error ? null : (res?.data || null));
            })
            .catch(() => { if (!cancelled) setDetail(null); })
            .finally(() => { if (!cancelled) setDetailLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPost, grade, sections, academicYear]);

    const openPost = (post) => {
        setSelectedPost(post);
        setDetail(null);
        // Default to the first class this post was sent to, with all its sections selected
        const firstGrade = post.audience?.[0];
        setGrade(firstGrade?.grade || '');
        setSections(firstGrade?.sections || []);
        setStatus('All');
        setSearch('');
    };
    const backToList = () => { setSelectedPost(null); setDetail(null); };

    // Grade / section options come from the post's audience (or the detail response)
    const audienceList = useMemo(
        () => detail?.availableAudience || selectedPost?.audience || [],
        [detail, selectedPost],
    );
    const gradeOptions = audienceList.map(a => a.grade);
    const sectionOptions = useMemo(() => {
        const a = audienceList.find(x => x.grade === grade);
        return a?.sections || [];
    }, [audienceList, grade]);

    const allSectionsSelected = sectionOptions.length > 0 && sections.length === sectionOptions.length;
    const handleSectionChange = (e) => {
        const value = e.target.value;
        if (value.includes('__all__')) {
            setSections(allSectionsSelected ? [] : [...sectionOptions]);
            return;
        }
        setSections(value);
    };

    const postList = useMemo(() => {
        const q = postSearch.trim().toLowerCase();
        return q ? posts.filter(p => (p.title || '').toLowerCase().includes(q)) : posts;
    }, [posts, postSearch]);

    // Counts come from the full fetched list so the chip totals stay stable across filters
    const fSent = detail?.data?.length ?? 0;
    const fViewed = useMemo(() => (detail?.data || []).filter(r => r.isViewed).length, [detail]);
    const fNotViewed = fSent - fViewed;

    const rows = useMemo(() => {
        const list = detail?.data || [];
        const byStatus = status === 'All'
            ? list
            : status === 'Viewed'
                ? list.filter(r => r.isViewed)
                : list.filter(r => !r.isViewed);
        const q = search.trim().toLowerCase();
        return q
            ? byStatus.filter(r => (r.studentName || '').toLowerCase().includes(q) || String(r.rollNumber || '').toLowerCase().includes(q))
            : byStatus;
    }, [detail, status, search]);

    return (
        <Box>
            {/* Tabs — which module to track */}
            <Box sx={{ borderBottom: `1px solid ${BORDER}`, mb: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 40,
                        '& .MuiTab-root': { textTransform: 'none', fontSize: 13, fontWeight: 700, color: '#6B7280', minHeight: 40, px: 2 },
                        '& .Mui-selected': { color: `${tab.color} !important` },
                        '& .MuiTabs-indicator': { backgroundColor: tab.color, height: 3, borderRadius: '3px 3px 0 0' },
                    }}
                >
                    {TRACK_TABS.map(t => (
                        <Tab key={t.key} value={t.key} icon={<t.icon sx={{ fontSize: 17 }} />} iconPosition="start" label={t.label} />
                    ))}
                </Tabs>
            </Box>

            {!academicYear && (
                <Box sx={{ p: 4, textAlign: 'center', borderRadius: '12px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Select an academic year in the dashboard header to view tracking.</Typography>
                </Box>
            )}

            {/* ════════════ POST LIST VIEW ════════════ */}
            {academicYear && !selectedPost && (
                <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: '14px', bgcolor: '#fff', overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', px: 2, py: 1.6, bgcolor: '#FAFBFC', borderBottom: `1px solid ${BORDER}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${tab.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <tab.icon sx={{ fontSize: 18, color: tab.color }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>All {tab.label}</Typography>
                                <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>Pick a {tab.label.toLowerCase()} to see who viewed it</Typography>
                            </Box>
                        </Box>
                        <TextField
                            size="small"
                            placeholder={`Search ${tab.label.toLowerCase()}...`}
                            value={postSearch}
                            onChange={(e) => setPostSearch(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment>),
                                    endAdornment: postSearch ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setPostSearch('')} sx={{ p: 0.3 }}><CloseIcon sx={{ fontSize: 14, color: '#9CA3AF' }} /></IconButton>
                                        </InputAdornment>
                                    ) : null,
                                },
                            }}
                            sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { height: 34, fontSize: 12.5, borderRadius: 999, bgcolor: '#fff', '& fieldset': { borderColor: '#D1D5DB' } } }}
                        />
                    </Box>

                    <TableContainer sx={{ maxHeight: '56vh' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {['#', `${tab.label} Title`, 'Audience', 'Sent To', 'Viewed', 'Not Viewed', 'Published', 'View Status'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 10.5, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, bgcolor: '#fff', py: 1.3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {postsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 7, borderBottom: 'none' }}><CircularProgress size={26} sx={{ color: PRIMARY }} /></TableCell>
                                    </TableRow>
                                ) : postList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 7, borderBottom: 'none' }}>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>No {tab.label.toLowerCase()} found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : postList.map((p, idx) => (
                                    <TableRow key={p.viewStatusId ?? idx} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6', width: 44 }}>
                                            <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{p.serialNo ?? idx + 1}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: `${tab.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <tab.icon sx={{ fontSize: 14, color: tab.color }} />
                                                </Box>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.title}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <Chip size="small" label={p.audienceLabel || '—'} sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151' }} />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                                <PeopleAltOutlinedIcon sx={{ fontSize: 15, color: '#6B7280' }} />
                                                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#374151' }}>{p.sentTo ?? 0}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <Chip size="small" icon={<VisibilityOutlinedIcon sx={{ fontSize: '14px !important' }} />} label={p.viewed ?? 0} sx={{ height: 22, fontSize: 11.5, fontWeight: 700, bgcolor: '#ECFDF5', color: '#047857', '& .MuiChip-icon': { color: '#047857' } }} />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <Chip size="small" icon={<VisibilityOffOutlinedIcon sx={{ fontSize: '14px !important' }} />} label={p.notViewed ?? Math.max(0, (p.sentTo ?? 0) - (p.viewed ?? 0))} sx={{ height: 22, fontSize: 11.5, fontWeight: 700, bgcolor: '#FFF7ED', color: '#C2410C', '& .MuiChip-icon': { color: '#C2410C' } }} />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <Typography sx={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{p.published || '—'}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                                                onClick={() => openPost(p)}
                                                sx={{
                                                    textTransform: 'none', fontSize: 12, fontWeight: 700,
                                                    borderRadius: '8px', height: 30, px: 1.4,
                                                    color: tab.color, borderColor: `${tab.color}55`,
                                                    '&:hover': { borderColor: tab.color, bgcolor: `${tab.color}10` },
                                                }}
                                            >
                                                View Status
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* ════════════ TRACKING DETAIL VIEW ════════════ */}
            {academicYear && selectedPost && (
                <Box>
                    {/* Back + post title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.6, flexWrap: 'wrap' }}>
                        <Button
                            size="small"
                            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                            onClick={backToList}
                            sx={{ textTransform: 'none', fontSize: 12.5, fontWeight: 700, color: '#374151', borderRadius: '8px', '&:hover': { bgcolor: '#F3F4F6' } }}
                        >
                            {tab.label}
                        </Button>
                        <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>/</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>{detail?.title || selectedPost.title}</Typography>
                    </Box>

                    {/* Class + Section(s) filters */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.2, flexWrap: 'wrap', mb: 2 }}>
                        <Box>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.4 }}>Class</Typography>
                            <FormControl size="small" sx={{ width: 150 }}>
                                <Select
                                    value={grade}
                                    displayEmpty
                                    onChange={(e) => { const v = e.target.value; setGrade(v); const a = audienceList.find(x => x.grade === v); setSections(a?.sections || []); }}
                                    renderValue={(v) => (v || 'Select class')}
                                    sx={{ borderRadius: '8px', height: 38, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}
                                >
                                    {gradeOptions.map(g => (
                                        <MenuItem key={g} value={g} sx={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>{g}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.4 }}>Section(s)</Typography>
                            <FormControl size="small" sx={{ width: 240 }}>
                                <Select
                                    multiple
                                    displayEmpty
                                    value={sections}
                                    onChange={handleSectionChange}
                                    disabled={!grade}
                                    renderValue={(selected) => (
                                        selected.length === 0
                                            ? <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>All sections</Typography>
                                            : selected.map(s => `Sec ${s}`).join(', ')
                                    )}
                                    sx={{ borderRadius: '8px', height: 38, fontSize: 13, fontWeight: 600 }}
                                    MenuProps={{ slotProps: { paper: { sx: { maxHeight: 280, borderRadius: '10px' } } } }}
                                >
                                    <MenuItem value="__all__" sx={{ py: 0.3 }}>
                                        <Checkbox
                                            size="small"
                                            checked={allSectionsSelected}
                                            indeterminate={sections.length > 0 && !allSectionsSelected}
                                            sx={{ '&.Mui-checked': { color: PRIMARY }, '&.MuiCheckbox-indeterminate': { color: PRIMARY } }}
                                        />
                                        <ListItemText primary="Select All" primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }} />
                                    </MenuItem>
                                    {sectionOptions.map(s => (
                                        <MenuItem key={s} value={s} sx={{ py: 0.3 }}>
                                            <Checkbox size="small" checked={sections.includes(s)} sx={{ '&.Mui-checked': { color: PRIMARY } }} />
                                            <ListItemText primary={`Section ${s}`} primaryTypographyProps={{ fontSize: 13 }} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* Tracking table */}
                    <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: '14px', bgcolor: '#fff', overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', px: 2, py: 1.6, bgcolor: '#FAFBFC', borderBottom: `1px solid ${BORDER}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${tab.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <tab.icon sx={{ fontSize: 18, color: tab.color }} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {tab.label} View Tracking
                                    </Typography>
                                    <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>
                                        {fViewed} of {fSent} students viewed
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                {/* Status filter — All / Viewed / Not Viewed (maps to API status param) */}
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {[
                                        { key: 'All', label: `All (${fSent})`, color: '#374151' },
                                        { key: 'Viewed', label: `Viewed (${fViewed})`, color: '#047857' },
                                        { key: 'NotViewed', label: `Not Viewed (${fNotViewed})`, color: '#C2410C' },
                                    ].map((f) => {
                                        const active = status === f.key;
                                        return (
                                            <Chip
                                                key={f.key}
                                                label={f.label}
                                                size="small"
                                                onClick={() => setStatus(f.key)}
                                                sx={{
                                                    height: 28, fontSize: 11.5, fontWeight: 700, borderRadius: '8px', cursor: 'pointer',
                                                    bgcolor: active ? f.color : '#fff',
                                                    color: active ? '#fff' : '#6B7280',
                                                    border: `1px solid ${active ? f.color : '#E5E7EB'}`,
                                                    '&:hover': { bgcolor: active ? f.color : '#F9FAFB' },
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                                <TextField
                                    size="small"
                                    placeholder="Search name or roll no..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment>),
                                            endAdornment: search ? (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.3 }}><CloseIcon sx={{ fontSize: 14, color: '#9CA3AF' }} /></IconButton>
                                                </InputAdornment>
                                            ) : null,
                                        },
                                    }}
                                    sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { height: 34, fontSize: 12.5, borderRadius: 999, bgcolor: '#fff', '& fieldset': { borderColor: '#D1D5DB' } } }}
                                />
                            </Box>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {['#', 'ROLL NO', 'STUDENT', 'CLASS', 'ACKNOWLEDGEMENT', 'VIEWED TIME'].map(h => (
                                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: 10.5, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, bgcolor: '#fff', py: 1.3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {detailLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}><CircularProgress size={28} sx={{ color: PRIMARY }} /></TableCell>
                                        </TableRow>
                                    ) : rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 7, borderBottom: 'none' }}>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>No students found</Typography>
                                                <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', mt: 0.5 }}>Try a different class, section, status, or search.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.map((r, idx) => {
                                        const avColor = avatarColorFor(r.studentName);
                                        return (
                                            <TableRow key={r.rollNumber ?? idx} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6', width: 44 }}>
                                                    <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{r.serialNo ?? idx + 1}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Typography sx={{ fontSize: 12.5, color: '#111827', fontWeight: 600, fontFamily: 'monospace' }}>{r.rollNumber}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 30, height: 30, bgcolor: `${avColor}15`, color: avColor, fontSize: 11, fontWeight: 700 }}>{r.initials || getInitials(r.studentName)}</Avatar>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.studentName}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Chip size="small" label={r.classSection || `${r.grade} - ${r.section}`} sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151' }} />
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Box sx={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                        px: 1, py: 0.4, borderRadius: '999px',
                                                        bgcolor: r.isViewed ? '#ECFDF5' : '#FFF7ED',
                                                        border: `1px solid ${r.isViewed ? '#A7F3D0' : '#FED7AA'}`,
                                                    }}>
                                                        {r.isViewed
                                                            ? <VisibilityOutlinedIcon sx={{ fontSize: 14, color: '#047857' }} />
                                                            : <VisibilityOffOutlinedIcon sx={{ fontSize: 14, color: '#C2410C' }} />}
                                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: r.isViewed ? '#047857' : '#C2410C' }}>
                                                            {r.acknowledgement || (r.isViewed ? 'Viewed' : 'Not Viewed')}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Typography sx={{ fontSize: 12, color: '#6B7280' }}>{r.viewedTimeText || '-'}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
