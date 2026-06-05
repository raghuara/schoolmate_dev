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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MessageIcon from '@mui/icons-material/Message';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GradingIcon from '@mui/icons-material/Grading';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { selectGrades } from '../../Redux/Slices/DropdownController';
import { getUsersByUserType } from '../../Api/Api';

const TOKEN = '123';
const PRIMARY = '#059669';
const BORDER = '#EDEFF2';

// Tabs — each module whose "viewed / not viewed" we want to track per student.
const TRACK_TABS = [
    { key: 'news', label: 'News', icon: NewspaperIcon, color: '#2563EB' },
    { key: 'messages', label: 'Messages', icon: MessageIcon, color: '#059669' },
    { key: 'circulars', label: 'Circulars', icon: StickyNote2Icon, color: '#D97706' },
    { key: 'studymaterials', label: 'Study Materials', icon: LibraryBooksIcon, color: '#0891B2' },
    { key: 'marks', label: 'Marks', icon: GradingIcon, color: '#7C3AED' },
];

// NOTE: Placeholder post lists per tab. Swap these for the real list APIs
// (e.g. NewsFetch / MessageFetch / CircularFetch ...) when available — keep the
// same shape: { id, title, createdOn, audience }.
const MOCK_POSTS = {
    news: [
        { id: 'n1', title: 'Annual Sports Day Announcement', createdOn: '12 Aug 2024', audience: 'All Students' },
        { id: 'n2', title: 'Holiday Notice – Independence Day', createdOn: '10 Aug 2024', audience: 'All Students' },
        { id: 'n3', title: 'Parent-Teacher Meeting Schedule', createdOn: '05 Aug 2024', audience: 'All Students' },
    ],
    messages: [
        { id: 'm1', title: 'Fee Reminder for August', createdOn: '11 Aug 2024', audience: 'All Students' },
        { id: 'm2', title: 'Bus Route Change Notice', createdOn: '08 Aug 2024', audience: 'All Students' },
    ],
    circulars: [
        { id: 'c1', title: 'Uniform Policy Update', createdOn: '09 Aug 2024', audience: 'All Students' },
        { id: 'c2', title: 'Exam Guidelines Circular', createdOn: '03 Aug 2024', audience: 'All Students' },
    ],
    studymaterials: [
        { id: 's1', title: 'Maths – Chapter 5 Notes', createdOn: '10 Aug 2024', audience: 'All Students' },
        { id: 's2', title: 'Science Lab Manual', createdOn: '06 Aug 2024', audience: 'All Students' },
    ],
    marks: [
        { id: 'k1', title: 'Unit Test 1 Results', createdOn: '12 Aug 2024', audience: 'All Students' },
        { id: 'k2', title: 'Mid-Term Marks Published', createdOn: '02 Aug 2024', audience: 'All Students' },
    ],
};

const AVATAR_PALETTE = ['#0E7490', '#6D28D9', '#C2410C', '#047857', '#1D4ED8', '#BE185D', '#A16207', '#0F766E'];
const avatarColorFor = (name = '') => AVATAR_PALETTE[((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % AVATAR_PALETTE.length];
const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function PostViewTracking() {
    const grades = useSelector(selectGrades) || [];

    const [activeTab, setActiveTab] = useState('news');
    const [selectedPost, setSelectedPost] = useState(null); // null → list view; object → tracking detail
    const [postSearch, setPostSearch] = useState('');

    // Detail-view filters
    const [classSign, setClassSign] = useState('');
    const [sections, setSections] = useState([]); // multi-select
    const [search, setSearch] = useState('');

    // Master student list (getUsersByUserType?userType=student) — grouped by grade, fetched once
    const [studentGroups, setStudentGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // NOTE: the "viewed" data API is not wired yet. Once it returns the roll numbers
    // who viewed the selected post, drop them in here ({ rollNumber: ISOdateTime }).
    const [viewedMap] = useState({});

    const tab = TRACK_TABS.find(t => t.key === activeTab) || TRACK_TABS[0];

    // Reset to the list whenever the tab changes
    const handleTabChange = (_, v) => {
        setActiveTab(v);
        setSelectedPost(null);
        setPostSearch('');
    };

    const sectionOptions = useMemo(() => {
        const g = grades.find(gr => gr.sign === classSign);
        return g?.sections || [];
    }, [grades, classSign]);

    const allSectionsSelected = sectionOptions.length > 0 && sections.length === sectionOptions.length;
    const handleSectionChange = (e) => {
        const value = e.target.value;
        if (value.includes('__all__')) {
            setSections(allSectionsSelected ? [] : [...sectionOptions]);
            return;
        }
        setSections(value);
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await axios.get(getUsersByUserType, {
                    params: { userType: 'student' },
                    headers: { Authorization: `Bearer ${TOKEN}` },
                });
                if (cancelled) return;
                const data = res?.data || {};
                setStudentGroups(Array.isArray(data.data) ? data.data : []);
            } catch (err) {
                if (!cancelled) setStudentGroups([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // ── Post list (filtered by title search) ─────────────────────────────────
    const postList = useMemo(() => {
        const list = MOCK_POSTS[activeTab] || [];
        const q = postSearch.trim().toLowerCase();
        return q ? list.filter(p => p.title.toLowerCase().includes(q)) : list;
    }, [activeTab, postSearch]);

    // ── Student rows for the selected post ───────────────────────────────────
    const rows = useMemo(() => {
        if (!classSign) return [];
        const group = studentGroups.find(g => String(g.grade || '').toLowerCase() === String(classSign).toLowerCase());
        const secSet = new Set(sections.map(String));
        const q = search.trim().toLowerCase();
        return (group?.users || [])
            .filter(u => sections.length === 0 || secSet.has(String(u.section)))
            .filter(u => !q || (u.name || '').toLowerCase().includes(q) || String(u.rollNumber || '').toLowerCase().includes(q))
            .map(u => {
                const viewedAt = viewedMap[u.rollNumber] || null;
                return {
                    rollNumber: String(u.rollNumber),
                    name: u.name || '—',
                    grade: u.grade || classSign,
                    section: u.section || '',
                    viewed: Boolean(viewedAt),
                    viewedAt,
                };
            });
    }, [studentGroups, classSign, sections, search, viewedMap]);

    const viewedCount = rows.filter(r => r.viewed).length;

    const openPost = (post) => {
        setSelectedPost(post);
        setSearch('');
    };
    const backToList = () => setSelectedPost(null);

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

            {/* ════════════ POST LIST VIEW ════════════ */}
            {!selectedPost && (
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
                                    {['#', `${tab.label} Title`, 'Audience', 'Published', 'View Status'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 10.5, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, bgcolor: '#fff', py: 1.3, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {postList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 7, borderBottom: 'none' }}>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>No {tab.label.toLowerCase()} found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : postList.map((p, idx) => (
                                    <TableRow key={p.id} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6', width: 44 }}>
                                            <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{idx + 1}</Typography>
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
                                            <Chip size="small" label={p.audience} sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151' }} />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <Typography sx={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{p.createdOn}</Typography>
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
            {selectedPost && (
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
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>{selectedPost.title}</Typography>
                    </Box>

                    {/* Class + Section(s) filters */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.2, flexWrap: 'wrap', mb: 2 }}>
                        <Box>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.4 }}>Class</Typography>
                            <FormControl size="small" sx={{ width: 130 }}>
                                <Select
                                    value={classSign}
                                    displayEmpty
                                    onChange={(e) => { setClassSign(e.target.value); setSections([]); }}
                                    renderValue={(v) => (v ? v : 'Select class')}
                                    sx={{ borderRadius: '8px', height: 38, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}
                                >
                                    {grades.map(g => (
                                        <MenuItem key={g.sign} value={g.sign} sx={{ fontSize: 13, textTransform: 'uppercase', fontWeight: 600 }}>{g.sign}</MenuItem>
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
                                    disabled={!classSign}
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
                                        {rows.length > 0 ? `${viewedCount} of ${rows.length} students viewed` : 'Pick a class to load students'}
                                    </Typography>
                                </Box>
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

                        <TableContainer sx={{ maxHeight: '48vh' }}>
                            <Table size="small" stickyHeader>
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
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}><CircularProgress size={28} sx={{ color: PRIMARY }} /></TableCell>
                                        </TableRow>
                                    ) : !classSign ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 7, borderBottom: 'none' }}>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>Select a class to view students</Typography>
                                                <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', mt: 0.5 }}>Optionally narrow down by one or more sections.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 7, borderBottom: 'none' }}>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>No students found</Typography>
                                                <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', mt: 0.5 }}>Try a different class, section, or search.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.map((r, idx) => {
                                        const avColor = avatarColorFor(r.name);
                                        return (
                                            <TableRow key={r.rollNumber} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6', width: 44 }}>
                                                    <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{idx + 1}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Typography sx={{ fontSize: 12.5, color: '#111827', fontWeight: 600, fontFamily: 'monospace' }}>{r.rollNumber}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 30, height: 30, bgcolor: `${avColor}15`, color: avColor, fontSize: 11, fontWeight: 700 }}>{getInitials(r.name)}</Avatar>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Chip size="small" label={`${r.grade} · ${r.section}`} sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151' }} />
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Box sx={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                        px: 1, py: 0.4, borderRadius: '999px',
                                                        bgcolor: r.viewed ? '#ECFDF5' : '#FFF7ED',
                                                        border: `1px solid ${r.viewed ? '#A7F3D0' : '#FED7AA'}`,
                                                    }}>
                                                        {r.viewed
                                                            ? <VisibilityOutlinedIcon sx={{ fontSize: 14, color: '#047857' }} />
                                                            : <VisibilityOffOutlinedIcon sx={{ fontSize: 14, color: '#C2410C' }} />}
                                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: r.viewed ? '#047857' : '#C2410C' }}>
                                                            {r.viewed ? 'Viewed' : 'Not Viewed'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Typography sx={{ fontSize: 12, color: '#6B7280' }}>{r.viewedAt || '--'}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 2, py: 1.2, bgcolor: '#FFFBEB', borderTop: `1px solid ${BORDER}` }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#D97706' }} />
                            <Typography sx={{ fontSize: 11.5, color: '#92400E', fontWeight: 600 }}>
                                View tracking will appear here once the student mobile app records "post viewed" events.
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
