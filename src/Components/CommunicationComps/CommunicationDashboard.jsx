import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Card, Grid, Typography, IconButton, Button, Chip,
    TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, InputAdornment, Tooltip, CircularProgress, Pagination, Menu, MenuItem,
    Stack, LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MessageIcon from '@mui/icons-material/Message';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import InboxIcon from '@mui/icons-material/Inbox';
import HubIcon from '@mui/icons-material/Hub';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RTooltip, BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';
import * as XLSX from 'xlsx';

// ─── Theme ────────────────────────────────────────────────────────────────
const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#ECFDF5';
const PRIMARY_DARK = '#047857';
const BORDER = '#EDEFF2';

// ─── Feature config ───────────────────────────────────────────────────────
const FEATURE_CONFIG = {
    news:           { label: 'News',            icon: NewspaperIcon,        color: '#2563EB', bg: '#EFF6FF' },
    messages:       { label: 'Messages',        icon: MessageIcon,          color: '#059669', bg: '#ECFDF5' },
    circulars:      { label: 'Circulars',       icon: StickyNote2Icon,      color: '#D97706', bg: '#FFFBEB' },
    consentforms:   { label: 'Consent Forms',   icon: MenuBookIcon,         color: '#DC2626', bg: '#FEF2F2' },
    homework:       { label: 'Homework',        icon: AssignmentIcon,       color: '#7C3AED', bg: '#F5F3FF' },
    studymaterials: { label: 'Study Materials', icon: LibraryBooksIcon,     color: '#0891B2', bg: '#ECFEFF' },
    schoolcalendar: { label: 'School Calendar', icon: CalendarMonthIcon,    color: '#0E7490', bg: '#F0F9FF' },
    events:         { label: 'Events',          icon: EventAvailableIcon,   color: '#BE185D', bg: '#FDF2F8' },
    feedback:       { label: 'Feedback',        icon: FeedbackIcon,         color: '#9333EA', bg: '#FAF5FF' },
};

const KPI_KEYS = Object.keys(FEATURE_CONFIG);
const ACTIVITY_TYPES = ['news', 'messages', 'circulars', 'consentforms', 'homework', 'studymaterials', 'feedback'];

// Modules that bypass the approval workflow — only "Total" is meaningful for these.
const NO_APPROVAL_MODULES = new Set(['consentforms', 'studymaterials', 'feedback']);

// ─── Helpers ──────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const isoFromDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const getTodayInput = () => isoFromDate(new Date());

const formatDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
};

const AVATAR_PALETTE = ['#0E7490', '#6D28D9', '#C2410C', '#047857', '#1D4ED8', '#BE185D', '#A16207', '#0F766E'];
const avatarColorFor = (name = '') => {
    const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
    return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
};
const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const compactNumber = (n) => {
    if (n == null) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
};

// ─── Date presets ─────────────────────────────────────────────────────────
const buildPresets = () => {
    const today = new Date();
    const todayIso = isoFromDate(today);
    const back = (n) => { const d = new Date(today); d.setDate(today.getDate() - (n - 1)); return isoFromDate(d); };
    const monthStart = isoFromDate(new Date(today.getFullYear(), today.getMonth(), 1));
    return [
        { key: 'last7',     label: 'Last 7 Days',  from: back(7),     to: todayIso },
        { key: 'last15',    label: 'Last 15 Days', from: back(15),    to: todayIso },
        { key: 'last30',    label: 'Last 30 Days', from: back(30),    to: todayIso },
        { key: 'thisMonth', label: 'This Month',   from: monthStart,  to: todayIso },
        { key: 'all',       label: 'All Time',     from: '',          to: '' },
        { key: 'custom',    label: 'Custom Range', from: null,        to: null,  isCustom: true },
    ];
};

// ─── Circular Ring Gauge ──────────────────────────────────────────────────
// A small SVG donut showing a percentage value, used inside KPI cards.
const RingGauge = ({ value = 0, color = PRIMARY, size = 64, stroke = 7 }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
        <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="#F1F2F4" strokeWidth={stroke}
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>
            <Box sx={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Typography sx={{
                    fontSize: size <= 56 ? 11 : 12, fontWeight: 700,
                    color: color, letterSpacing: -0.2,
                }}>
                    {value}%
                </Typography>
            </Box>
        </Box>
    );
};

// ─── Mock data generator ──────────────────────────────────────────────────
// TODO: Replace with API call. Expected shape:
//   { kpis: { news: { total, approved, pending, rejected }, ... },
//     activity: [ { id, type, title, createdBy, role, createdOn, status }, ... ] }
const NAMES = ['Aarav Sharma', 'Priya Iyer', 'Rohan Kapoor', 'Saanvi Patel', 'Vikram Nair', 'Diya Reddy', 'Aditya Joshi', 'Meera Singh', 'Kabir Mehta', 'Ananya Roy'];
const ROLES = ['Super Admin', 'Admin', 'Staff', 'Teacher'];
const STATUSES = ['Approved', 'Pending', 'Rejected'];

const buildMockData = () => {
    const kpis = {};
    KPI_KEYS.forEach(k => {
        const total = Math.floor(Math.random() * 200) + 50;
        if (NO_APPROVAL_MODULES.has(k)) {
            kpis[k] = { total, approved: 0, pending: 0, rejected: 0 };
        } else {
            const approved = Math.floor(total * (0.6 + Math.random() * 0.25));
            const rejected = Math.floor((total - approved) * (0.2 + Math.random() * 0.2));
            const pending = total - approved - rejected;
            kpis[k] = { total, approved, pending, rejected };
        }
    });

    const activity = [];
    const now = Date.now();
    for (let i = 0; i < 120; i++) {
        const type = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];
        const daysAgo = Math.floor(Math.random() * 90);
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        const ts = new Date(now - daysAgo * 86400000 - hours * 3600000 - minutes * 60000);
        const titles = {
            news:           ['Annual Day Highlights', 'Sports Meet Winners', 'New Library Wing', 'Founders Day Recap', 'Inter-school Quiz'],
            messages:       ['Parent-Teacher Meet', 'Holiday List Update', 'Bus Route Change', 'Fee Reminder', 'Exam Hall Allocation'],
            circulars:      ['Uniform Code', 'Code of Conduct', 'Mid-term Schedule', 'Holiday Notice', 'Independence Day'],
            consentforms:   ['Field Trip — Zoo', 'Science Fair Permission', 'Annual Picnic', 'Photography Consent', 'Medical Form'],
            homework:       ['Math — Algebra Ch. 4', 'Science — Lab Report', 'English — Essay', 'History — Timeline', 'Geography — Map Work'],
            studymaterials: ['NCERT Chapter Notes', 'Practice Worksheets', 'Reference Videos', 'Sample Papers', 'Revision Sheets'],
            feedback:       ['Cafeteria Survey', 'Transport Feedback', 'Library Suggestion', 'Teacher Evaluation', 'Facility Review'],
        };
        const titleList = titles[type] || ['Untitled'];
        activity.push({
            id: i + 1, type,
            title: titleList[Math.floor(Math.random() * titleList.length)],
            createdBy: NAMES[Math.floor(Math.random() * NAMES.length)],
            role: ROLES[Math.floor(Math.random() * ROLES.length)],
            createdOn: ts.toISOString(),
            status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        });
    }
    activity.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
    return { kpis, activity };
};

const ROWS_PER_PAGE = 10;

export default function CommunicationDashboard() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const user = useSelector((state) => state.auth);
    const isTeacher = user?.userType === 'teacher';
    const presets = useMemo(() => buildPresets(), []);

    const [activePreset, setActivePreset] = useState('last30');
    const [fromDate, setFromDate] = useState(presets.find(p => p.key === 'last30').from);
    const [toDate, setToDate]     = useState(presets.find(p => p.key === 'last30').to);
    const [search, setSearch]     = useState('');
    const [activityTypeFilter, setActivityTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [exportAnchor, setExportAnchor] = useState(null);
    const [dateAnchor, setDateAnchor] = useState(null);
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({ kpis: {}, activity: [] });

    useEffect(() => {
        setIsLoading(true);
        const t = setTimeout(() => {
            setData(buildMockData());
            setIsLoading(false);
        }, 350);
        return () => clearTimeout(t);
    }, []);

    const applyPreset = (key) => {
        const p = presets.find(x => x.key === key);
        if (!p) return;
        // For 'custom', keep the existing dates so the pickers open with the current range visible.
        if (!p.isCustom) {
            setFromDate(p.from);
            setToDate(p.to);
        }
        setActivePreset(key);
        setPage(1);
    };
    const handleFromChange = (val) => { setFromDate(val); setActivePreset('custom'); setPage(1); };
    const handleToChange   = (val) => { setToDate(val);   setActivePreset('custom'); setPage(1); };
    const clearFilters = () => {
        applyPreset('last30');
        setSearch('');
        setActivityTypeFilter('all');
    };

    const kpis = data.kpis;

    // ── Hero summary (Total / Approved / Pending / Rejected) ───────────────
    const heroSummary = useMemo(() => {
        const acc = { total: 0, approved: 0, pending: 0, rejected: 0 };
        KPI_KEYS.forEach(k => {
            const x = kpis[k] || { total: 0, approved: 0, pending: 0, rejected: 0 };
            acc.total += x.total;
            acc.approved += x.approved;
            acc.pending += x.pending;
            acc.rejected += x.rejected;
        });
        const approvedPct = acc.total > 0 ? Math.round((acc.approved / acc.total) * 100) : 0;
        const pendingPct  = acc.total > 0 ? Math.round((acc.pending / acc.total) * 100) : 0;
        const rejectedPct = acc.total > 0 ? Math.round((acc.rejected / acc.total) * 100) : 0;
        return { ...acc, approvedPct, pendingPct, rejectedPct };
    }, [kpis]);

    const filteredActivity = useMemo(() => {
        const fromTs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : -Infinity;
        const toTs   = toDate   ? new Date(`${toDate}T23:59:59`).getTime()   :  Infinity;
        const q = search.trim().toLowerCase();
        return data.activity.filter(a => {
            const ts = new Date(a.createdOn).getTime();
            const inRange = ts >= fromTs && ts <= toTs;
            const matchesType = activityTypeFilter === 'all' || a.type === activityTypeFilter;
            const matchesSearch = !q
                || (a.title || '').toLowerCase().includes(q)
                || (a.createdBy || '').toLowerCase().includes(q)
                || (a.role || '').toLowerCase().includes(q);
            return inRange && matchesType && matchesSearch;
        });
    }, [data.activity, fromDate, toDate, activityTypeFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filteredActivity.length / ROWS_PER_PAGE));
    const pageRows = useMemo(
        () => filteredActivity.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
        [filteredActivity, page]
    );

    const anyFilterActive =
        activePreset !== 'last30' || search.trim().length > 0 || activityTypeFilter !== 'all';

    // ── Activity trend (daily counts over current date range) ──────────────
    const trendData = useMemo(() => {
        if (!fromDate || !toDate) {
            // For "All Time" — use a fixed last 14-day window
            const today = new Date();
            const start = new Date(today); start.setDate(today.getDate() - 13);
            const buckets = {};
            for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
                buckets[isoFromDate(d)] = 0;
            }
            data.activity.forEach(a => {
                const key = a.createdOn.slice(0, 10);
                if (key in buckets) buckets[key] += 1;
            });
            return Object.entries(buckets).map(([date, count]) => ({
                date, count,
                label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            }));
        }
        const start = new Date(`${fromDate}T00:00:00`);
        const end   = new Date(`${toDate}T00:00:00`);
        const buckets = {};
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            buckets[isoFromDate(d)] = 0;
        }
        filteredActivity.forEach(a => {
            const key = a.createdOn.slice(0, 10);
            if (key in buckets) buckets[key] += 1;
        });
        return Object.entries(buckets).map(([date, count]) => ({
            date, count,
            label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
    }, [filteredActivity, fromDate, toDate, data.activity]);

    const trendPeakDay = useMemo(() => {
        if (!trendData.length) return null;
        return trendData.reduce((max, d) => (d.count > max.count ? d : max), trendData[0]);
    }, [trendData]);

    // ── Module bar chart data (Approved / Pending / Rejected per module) ──
    const moduleBarData = useMemo(() => (
        ACTIVITY_TYPES.map(k => {
            const x = kpis[k] || { approved: 0, pending: 0, rejected: 0 };
            return {
                name: FEATURE_CONFIG[k].label,
                color: FEATURE_CONFIG[k].color,
                Approved: x.approved,
                Pending:  x.pending,
                Rejected: x.rejected,
            };
        })
    ), [kpis]);

    // ── Pie chart: overall status distribution ────────────────────────────
    const pieData = useMemo(() => [
        { name: 'Approved', value: heroSummary.approved, color: '#16A34A' },
        { name: 'Pending',  value: heroSummary.pending,  color: '#D97706' },
        { name: 'Rejected', value: heroSummary.rejected, color: '#DC2626' },
    ], [heroSummary]);

    const pieTotal = pieData.reduce((s, x) => s + x.value, 0);

    // ── Exports ────────────────────────────────────────────────────────────
    const handleExportExcel = () => {
        setExportAnchor(null);
        const headers = ['S.No', 'Type', 'Title', 'Created By', 'Role', 'Status', 'Date/Time'];
        const rows = filteredActivity.map((r, i) => [
            i + 1, FEATURE_CONFIG[r.type]?.label || r.type,
            r.title, r.createdBy, r.role, r.status, formatDateTime(r.createdOn),
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 22 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Communication Activity');
        const tag = fromDate && toDate ? `${fromDate}_to_${toDate}` : 'all-time';
        XLSX.writeFile(wb, `Communication_Activity_${tag}.xlsx`);
    };

    const handleExportPDF = () => {
        setExportAnchor(null);
        const html = `
            <html><head><title>Communication Activity</title>
            <style>
                body { font-family: -apple-system, Segoe UI, sans-serif; padding: 24px; color: #111; }
                h1 { font-size: 20px; margin: 0 0 4px; }
                .sub { color: #666; font-size: 12px; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { padding: 6px 8px; border: 1px solid #E5E7EB; text-align: left; }
                th { background: #ECFDF5; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; }
                tr:nth-child(even) td { background: #FAFAFA; }
            </style></head><body>
                <h1>Communication Activity Report</h1>
                <div class="sub">Range: ${fromDate || '—'} → ${toDate || '—'} · ${filteredActivity.length} records</div>
                <table>
                    <thead><tr><th>#</th><th>Type</th><th>Title</th><th>Created By</th><th>Role</th><th>Status</th><th>Date/Time</th></tr></thead>
                    <tbody>
                        ${filteredActivity.map((r, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${FEATURE_CONFIG[r.type]?.label || r.type}</td>
                                <td>${r.title}</td>
                                <td>${r.createdBy}</td>
                                <td>${r.role}</td>
                                <td>${r.status}</td>
                                <td>${formatDateTime(r.createdOn)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body></html>
        `;
        const w = window.open('', '_blank', 'noopener,noreferrer');
        if (!w) return;
        w.document.write(html);
        w.document.close();
        setTimeout(() => w.print(), 250);
    };

    const STATUS_STYLE = {
        Approved: { color: '#047857', bg: '#ECFDF5', icon: CheckCircleIcon },
        Pending:  { color: '#B45309', bg: '#FFFBEB', icon: PendingIcon },
        Rejected: { color: '#B91C1C', bg: '#FEF2F2', icon: CancelIcon },
    };

    // ── Hero KPI card data (4 cards) ───────────────────────────────────────
    const heroCards = [
        {
            label: 'Total Communications',
            value: heroSummary.total,
            sub: 'All Modules',
            color: '#0891B2', bg: '#ECFEFF',
            icon: HubIcon,
        },
        {
            label: 'Approved',
            value: heroSummary.approved,
            sub: `${heroSummary.approvedPct}% Approved`,
            color: '#16A34A', bg: '#F0FDF4',
            icon: CheckCircleIcon,
        },
        {
            label: 'Pending Review',
            value: heroSummary.pending,
            sub: `${heroSummary.pendingPct}% Awaiting`,
            color: '#F59E0B', bg: '#FFFBEB',
            icon: PendingIcon,
        },
        {
            label: 'Rejected',
            value: heroSummary.rejected,
            sub: `${heroSummary.rejectedPct}% Rejected`,
            color: '#EC4899', bg: '#FDF2F8',
            icon: CancelIcon,
        },
    ];

    // ── Area chart tooltip ─────────────────────────────────────────────────
    const AreaTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        return (
            <Box sx={{
                bgcolor: '#fff', px: 1.2, py: 0.8, borderRadius: '8px',
                border: `1px solid ${BORDER}`, boxShadow: '0 4px 12px rgba(16,24,40,0.08)',
            }}>
                <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: PRIMARY_DARK, mt: 0.2 }}>
                    {payload[0].value} activities
                </Typography>
            </Box>
        );
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* ═══ HEADER STRIP (NewsPage style) — title + date filters ═══ */}
            <Box sx={{
                position: "fixed",
                top: "60px",
                left: isExpanded ? "479px" : "298px",
                right: 0,
                backgroundColor: "#f2f2f2",
                px: 2,
                py:1,
                borderBottom: "1px solid #ddd",
                borderTop: "1px solid #ddd",
                zIndex: 1200,
                transition: "left 0.3s ease-in-out",
                overflow: 'hidden',
            }}>
                <Grid container alignItems="center" spacing={1}>
                    <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: 30, height: 30, mr: 1 }}>
                            <ArrowBackIcon sx={{ fontSize: 18, color: '#000' }} />
                        </IconButton>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            bgcolor: '#fff', border: '1px solid #ddd',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.2,
                        }}>
                            <HubIcon sx={{ color: websiteSettings.mainColor || PRIMARY, fontSize: 20 }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{
                                fontWeight: 600,
                                fontSize: { xs: '16px', sm: '18px', md: '20px' },
                                lineHeight: 1.1,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                Communication Dashboard
                            </Typography>
                            <Typography sx={{
                                fontSize: 11, color: '#666', mt: 0.2,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                display: { xs: 'none', sm: 'block' },
                            }}>
                                Overview of all communication activity
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7 }} sx={{ display: 'flex', justifyContent: { md: 'flex-end', xs: 'flex-start' }, alignItems: 'center', gap: 0.7, flexWrap: 'wrap' }}>
                        {/* Date range preset — dropdown */}
                        <Box
                            onClick={(e) => setDateAnchor(e.currentTarget)}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 0.7,
                                px: 1.2, height: 30, borderRadius: '7px',
                                bgcolor: '#fff', border: '1px solid #ddd',
                                cursor: 'pointer', userSelect: 'none', minWidth: 160,
                                '&:hover': { bgcolor: '#fafafa' },
                            }}
                        >
                            <CalendarMonthIcon sx={{ fontSize: 15, color: PRIMARY }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', flex: 1 }}>
                                {activePreset
                                    ? presets.find(p => p.key === activePreset)?.label || 'Custom Range'
                                    : 'Custom Range'}
                            </Typography>
                            <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                        </Box>
                        <Menu
                            anchorEl={dateAnchor}
                            open={Boolean(dateAnchor)}
                            onClose={() => setDateAnchor(null)}
                            slotProps={{ paper: { sx: { mt: 0.5, borderRadius: '10px', minWidth: 170 } } }}
                        >
                            {presets.map(p => {
                                const active = activePreset === p.key;
                                return (
                                    <MenuItem
                                        key={p.key}
                                        onClick={() => { applyPreset(p.key); setDateAnchor(null); }}
                                        sx={{
                                            fontSize: 12.5, fontWeight: 600,
                                            color: active ? PRIMARY_DARK : '#374151',
                                            bgcolor: active ? PRIMARY_LIGHT : 'transparent',
                                            '&:hover': { bgcolor: active ? PRIMARY_LIGHT : '#F9FAFB' },
                                        }}
                                    >
                                        {p.label}
                                    </MenuItem>
                                );
                            })}
                        </Menu>
                        {/* From/To inputs — visible only when Custom Range is selected */}
                        {activePreset === 'custom' && (
                            <>
                                <TextField
                                    type="date" size="small"
                                    value={fromDate || ''}
                                    onChange={e => handleFromChange(e.target.value)}
                                    slotProps={{ htmlInput: { max: getTodayInput() } }}
                                    sx={{
                                        width: 140, bgcolor: '#fff', borderRadius: '7px',
                                        '& .MuiOutlinedInput-root': {
                                            height: 28, fontSize: 11.5, borderRadius: '7px',
                                            '& fieldset': { borderColor: '#ddd' },
                                            '&.Mui-focused fieldset': { borderColor: PRIMARY },
                                        },
                                    }}
                                />
                                <Typography sx={{ fontSize: 11, color: '#6B7280' }}>to</Typography>
                                <TextField
                                    type="date" size="small"
                                    value={toDate || ''}
                                    onChange={e => handleToChange(e.target.value)}
                                    slotProps={{ htmlInput: { max: getTodayInput() } }}
                                    sx={{
                                        width: 140, bgcolor: '#fff', borderRadius: '7px',
                                        '& .MuiOutlinedInput-root': {
                                            height: 28, fontSize: 11.5, borderRadius: '7px',
                                            '& fieldset': { borderColor: '#ddd' },
                                            '&.Mui-focused fieldset': { borderColor: PRIMARY },
                                        },
                                    }}
                                />
                            </>
                        )}
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ pt: "75px", pb:2, px:2}}>
                {/* ═══ ACTION BAR: search + result count + export ═══ */}
                <Box sx={{
                }}>
                    <Box sx={{pb:2, display: 'flex', alignItems: 'center',
                        gap: 1, flexWrap: 'wrap',
                    }}>
                        <TextField
                            size="small"
                            placeholder="Search by title, creator, or role..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 17, color: '#9CA3AF' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: search ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.3 }}>
                                                <CloseIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                },
                            }}
                            sx={{
                                width: { xs: '100%', sm: 280, md: 320 },
                                '& .MuiOutlinedInput-root': {
                                    height: 36, fontSize: 12.5,
                                    borderRadius: 999,
                                    bgcolor: '#fff',
                                    '& fieldset': { borderColor: '#D1D5DB' },
                                    '&:hover fieldset': { borderColor: '#9CA3AF' },
                                    '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1 },
                                },
                            }}
                        />

                        {anyFilterActive && (
                            <Button
                                size="small"
                                startIcon={<RestartAltIcon sx={{ fontSize: 15 }} />}
                                onClick={clearFilters}
                                sx={{
                                    textTransform: 'none', fontSize: 12, fontWeight: 600,
                                    height: 36, borderRadius: '8px', px: 1.4,
                                    color: '#DC2626',
                                    '&:hover': { bgcolor: '#FEF2F2' },
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}

                        <Box sx={{ flex: 1 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>Showing</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: PRIMARY_DARK }}>
                                {filteredActivity.length}
                            </Typography>
                            <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>activities</Typography>
                        </Box>

                        {!isTeacher && (
                            <>
                                <Button
                                    size="small" variant="contained"
                                    startIcon={<FileDownloadIcon sx={{ fontSize: 16 }} />}
                                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                                    onClick={(e) => setExportAnchor(e.currentTarget)}
                                    disabled={filteredActivity.length === 0}
                                    sx={{
                                        textTransform: 'none', fontSize: 12.5, fontWeight: 600,
                                        bgcolor: PRIMARY, color: '#fff', boxShadow: 'none',
                                        borderRadius: '8px', px: 1.8, height: 36,
                                        '&:hover': { bgcolor: PRIMARY_DARK, boxShadow: 'none' },
                                        '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                                    }}
                                >
                                    Export
                                </Button>
                                <Menu
                                    anchorEl={exportAnchor}
                                    open={Boolean(exportAnchor)}
                                    onClose={() => setExportAnchor(null)}
                                    slotProps={{ paper: { sx: { mt: 0.5, borderRadius: '10px', minWidth: 180 } } }}
                                >
                                    <MenuItem onClick={handleExportExcel} sx={{ gap: 1.2, py: 1 }}>
                                        <GridOnIcon sx={{ fontSize: 18, color: '#047857' }} />
                                        <Box>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Excel (.xlsx)</Typography>
                                            <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>Spreadsheet format</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem onClick={handleExportPDF} sx={{ gap: 1.2, py: 1 }}>
                                        <PictureAsPdfIcon sx={{ fontSize: 18, color: '#DC2626' }} />
                                        <Box>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>PDF</Typography>
                                            <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>Printable report</Typography>
                                        </Box>
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Box>

                {/* ═══ HERO KPI CARDS (4 cards — bordered, icon top-right) ═══
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {heroCards.map((c) => {
                        const Icon = c.icon;
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={c.label}>
                                <Box sx={{
                                    border: `1.5px solid ${c.color}`,
                                    borderRadius: '12px',
                                    bgcolor: c.bg,
                                    height: '100%',
                                    px: 2, py: 1.8,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        boxShadow: `0 6px 16px ${c.color}25`,
                                        transform: 'translateY(-2px)',
                                    },
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{
                                                fontSize: 13, color: '#374151', fontWeight: 500,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {c.label}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 28, fontWeight: 800,
                                                color: '#101828', lineHeight: 1.1, mt: 0.6,
                                            }}>
                                                {c.value.toLocaleString()}
                                            </Typography>
                                            <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, mt: 0.8 }}>
                                                {c.sub}
                                            </Typography>
                                        </Box>
                                        <Icon sx={{ color: c.color, fontSize: 26, flexShrink: 0, mt: 0.2 }} />
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid> */}

             

                {/* ═══ MODULE STATISTICS (FeeFinancePage-style cards) ═══ */}
                {/* <Box sx={{ my: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box pt={5}>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>
                            Module Statistics
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: '#6B7280', mt: 0.2 }}>
                            Detailed breakdown across {ACTIVITY_TYPES.length} communication modules
                        </Typography>
                    </Box>
                </Box> */}

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {ACTIVITY_TYPES.map((key) => {
                        const cfg = FEATURE_CONFIG[key];
                        const Icon = cfg.icon;
                        const k = kpis[key] || { total: 0, approved: 0, pending: 0, rejected: 0 };
                        const hasApproval = !NO_APPROVAL_MODULES.has(key);
                        const approvedPct = k.total > 0 ? Math.round((k.approved / k.total) * 100) : 0;
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={key}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        backgroundColor: cfg.bg,
                                        border: '1px solid rgba(0, 0, 0, 0.08)',
                                        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                                        boxShadow: '1px 1px 2px 0.5px rgba(0, 0, 0, 0.12)',
                                        borderRadius: '10px',
                                        height: '100%',
                                        overflow: 'hidden',
                                        transition: '0.3s',
                                        '&:hover': {
                                            boxShadow: '2px 4px 10px 0.5px rgba(0, 0, 0, 0.14)',
                                            transform: 'translateY(-2px)',
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0, top: 0,
                                            height: '100%', width: '6px',
                                            background: `linear-gradient(180deg, ${cfg.color} 0%, ${cfg.color}99 100%)`,
                                        },
                                    }}
                                >
                                    <Box sx={{ pl: 2, pr: 1.5, py: 1.6 }}>
                                        {/* Header: icon circle + name + right-side pill */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{
                                                backgroundColor: `${cfg.color}1A`,
                                                borderRadius: '50px',
                                                width: 38, height: 38,
                                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                flexShrink: 0,
                                            }}>
                                                <Icon sx={{ color: cfg.color, fontSize: 21 }} />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography sx={{
                                                    fontWeight: 600, fontSize: '14px', color: '#000',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {cfg.label}
                                                </Typography>
                                                <Typography sx={{
                                                    fontSize: '10.5px', color: '#666', mt: 0.2,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {hasApproval
                                                        ? `${k.total.toLocaleString()} total · ${approvedPct}% approved`
                                                        : `${k.total.toLocaleString()} total · No approval required`}
                                                </Typography>
                                            </Box>
                                            {hasApproval ? (
                                                <Box sx={{
                                                    display: 'inline-flex', alignItems: 'center',
                                                    px: 0.9, py: 0.3, borderRadius: '50px',
                                                    bgcolor: '#fff', border: `1px solid ${cfg.color}33`,
                                                    flexShrink: 0,
                                                }}>
                                                    <Typography sx={{
                                                        fontSize: 10.5, fontWeight: 700, color: cfg.color,
                                                    }}>
                                                        {approvedPct}%
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Box sx={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 0.3,
                                                    px: 0.9, py: 0.3, borderRadius: '50px',
                                                    bgcolor: '#fff', border: `1px solid ${cfg.color}33`,
                                                    flexShrink: 0,
                                                }}>
                                                    <CheckCircleIcon sx={{ fontSize: 11, color: cfg.color }} />
                                                    <Typography sx={{
                                                        fontSize: 9.5, fontWeight: 700, color: cfg.color,
                                                        textTransform: 'uppercase', letterSpacing: 0.3,
                                                    }}>
                                                        Direct
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {hasApproval ? (
                                            // Stats grid: Total / Approved / Pending / Rejected
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                                                gap: 0.6, mt: 1.6,
                                            }}>
                                                {[
                                                    { label: 'Total',    value: k.total,    color: '#374151', dot: cfg.color },
                                                    { label: 'Approved', value: k.approved, color: '#16A34A', dot: '#16A34A' },
                                                    { label: 'Pending',  value: k.pending,  color: '#D97706', dot: '#D97706' },
                                                    { label: 'Rejected', value: k.rejected, color: '#DC2626', dot: '#DC2626' },
                                                ].map((s) => (
                                                    <Box
                                                        key={s.label}
                                                        sx={{
                                                            bgcolor: '#fff',
                                                            border: '1px solid rgba(0,0,0,0.06)',
                                                            borderRadius: '8px',
                                                            py: 0.7, px: 0.4,
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                            minWidth: 0, overflow: 'hidden',
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, minWidth: 0 }}>
                                                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: s.dot, flexShrink: 0 }} />
                                                            <Typography sx={{
                                                                fontSize: 8.5, fontWeight: 700, color: '#6B7280',
                                                                textTransform: 'uppercase', letterSpacing: 0.2,
                                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                            }}>
                                                                {s.label}
                                                            </Typography>
                                                        </Box>
                                                        <Typography sx={{
                                                            fontSize: 14, fontWeight: 800, color: s.color,
                                                            lineHeight: 1.2, mt: 0.2,
                                                        }}>
                                                            {s.value.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            // Single total panel — no approval workflow
                                            <Box sx={{
                                                mt: 1.6,
                                                bgcolor: '#fff',
                                                border: '1px solid rgba(0,0,0,0.06)',
                                                borderRadius: '8px',
                                                p: 1.2,
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                gap: 1,
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, minWidth: 0 }}>
                                                    <Box sx={{
                                                        width: 32, height: 32, borderRadius: '8px',
                                                        bgcolor: `${cfg.color}15`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}>
                                                        <Icon sx={{ fontSize: 17, color: cfg.color }} />
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{
                                                            fontSize: 9.5, fontWeight: 700, color: '#6B7280',
                                                            textTransform: 'uppercase', letterSpacing: 0.3,
                                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        }}>
                                                            Total Records
                                                        </Typography>
                                                        <Typography sx={{
                                                            fontSize: 10, color: '#9CA3AF', fontWeight: 500, mt: 0.1,
                                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        }}>
                                                            Direct publish · no approval
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Typography sx={{
                                                    fontSize: 22, fontWeight: 800, color: cfg.color,
                                                    lineHeight: 1, flexShrink: 0,
                                                }}>
                                                    {k.total.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* ═══ CHARTS ROW: Area chart (8) + Pie chart (4) ═══ */}
                <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
                    {/* Area chart: Activity over time */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card sx={{
                            border: `1px solid ${BORDER}`, borderRadius: '14px',
                            boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                            bgcolor: '#fff', p: 2,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{
                                        width: 32, height: 32, borderRadius: '8px',
                                        bgcolor: PRIMARY_LIGHT,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <ShowChartIcon sx={{ fontSize: 18, color: PRIMARY }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>
                                            Activity Trend
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: '#6B7280', mt: 0.1 }}>
                                            Daily communication activity over selected period
                                        </Typography>
                                    </Box>
                                </Box>
                                {trendPeakDay && (
                                    <Box sx={{
                                        display: 'inline-flex', alignItems: 'center', gap: 0.6,
                                        bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_LIGHT}`,
                                        px: 1.2, py: 0.6, borderRadius: '8px',
                                    }}>
                                        <CalendarMonthIcon sx={{ fontSize: 14, color: PRIMARY_DARK }} />
                                        <Typography sx={{ fontSize: 11, color: PRIMARY_DARK, fontWeight: 600 }}>
                                            Peak: <strong>{trendPeakDay.label}</strong> · {trendPeakDay.count}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ width: '100%', height: 280 }}>
                                {isLoading ? (
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress size={28} sx={{ color: PRIMARY }} />
                                    </Box>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%"   stopColor={PRIMARY} stopOpacity={0.35} />
                                                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fontSize: 10.5, fill: '#9CA3AF' }}
                                                axisLine={false}
                                                tickLine={false}
                                                minTickGap={20}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10.5, fill: '#9CA3AF' }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <RTooltip content={<AreaTooltip />} cursor={{ stroke: PRIMARY, strokeWidth: 1, strokeDasharray: '4 4' }} />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke={PRIMARY}
                                                strokeWidth={2.5}
                                                fill="url(#activityGradient)"
                                                activeDot={{ r: 5, fill: PRIMARY, stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </Box>
                        </Card>
                    </Grid>

                    {/* Pie chart: Status distribution */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card sx={{
                            border: `1px solid ${BORDER}`, borderRadius: '14px',
                            boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                            bgcolor: '#fff', p: 2,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <Box sx={{
                                    width: 32, height: 32, borderRadius: '8px',
                                    bgcolor: PRIMARY_LIGHT,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <PieChartIcon sx={{ fontSize: 18, color: PRIMARY }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>
                                        Status Distribution
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#6B7280', mt: 0.1 }}>
                                        Across all modules
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ position: 'relative', width: '100%', height: 180 }}>
                                {isLoading ? (
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress size={28} sx={{ color: PRIMARY }} />
                                    </Box>
                                ) : (
                                    <>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={48} outerRadius={75}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((entry, idx) => (
                                                        <Cell key={idx} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RTooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: `1px solid ${BORDER}`,
                                                        borderRadius: '8px',
                                                        fontSize: 12,
                                                        boxShadow: '0 4px 12px rgba(16,24,40,0.08)',
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <Box sx={{
                                            position: 'absolute', inset: 0,
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            pointerEvents: 'none',
                                        }}>
                                            <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#101828', lineHeight: 1 }}>
                                                {pieTotal.toLocaleString()}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 10, color: '#6B7280', fontWeight: 600,
                                                mt: 0.3, textTransform: 'uppercase', letterSpacing: 0.4,
                                            }}>
                                                Total
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>

                            <Stack spacing={0.6} sx={{ mt: 1 }}>
                                {pieData.map(p => {
                                    const pct = pieTotal > 0 ? Math.round((p.value / pieTotal) * 100) : 0;
                                    return (
                                        <Box key={p.name} sx={{
                                            display: 'flex', alignItems: 'center', gap: 1,
                                            px: 1, py: 0.5, borderRadius: '8px',
                                            bgcolor: '#FAFBFC', border: `1px solid ${BORDER}`,
                                        }}>
                                            <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: p.color }} />
                                            <Typography sx={{ fontSize: 11.5, color: '#374151', fontWeight: 600, flex: 1 }}>
                                                {p.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11.5, color: '#101828', fontWeight: 700 }}>
                                                {p.value.toLocaleString()}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 11, color: p.color, fontWeight: 700,
                                                minWidth: 34, textAlign: 'right',
                                            }}>
                                                {pct}%
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

                {/* ═══ MODULE COMPARISON BAR CHART (horizontal, full width) ═══ */}
                <Card sx={{
                    border: `1px solid ${BORDER}`, borderRadius: '14px',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                    bgcolor: '#fff', p: 2, mb: 2,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: '8px',
                                bgcolor: PRIMARY_LIGHT,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <BarChartIcon sx={{ fontSize: 18, color: PRIMARY }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>
                                    Module-wise Comparison
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: '#6B7280', mt: 0.1 }}>
                                    Status counts across all modules
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.3, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Approved', color: '#16A34A' },
                                { label: 'Pending',  color: '#D97706' },
                                { label: 'Rejected', color: '#DC2626' },
                            ].map(l => (
                                <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: l.color }} />
                                    <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{l.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%', height: 280 }}>
                        {isLoading ? (
                            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress size={28} sx={{ color: PRIMARY }} />
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={moduleBarData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                    barCategoryGap={10}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 10.5, fill: '#9CA3AF' }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 11.5, fill: '#374151', fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={110}
                                    />
                                    <RTooltip
                                        cursor={{ fill: PRIMARY_LIGHT, opacity: 0.3 }}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: `1px solid ${BORDER}`,
                                            borderRadius: '8px',
                                            fontSize: 12,
                                            boxShadow: '0 4px 12px rgba(16,24,40,0.08)',
                                        }}
                                    />
                                    <Bar dataKey="Approved" stackId="a" fill="#16A34A" barSize={18} />
                                    <Bar dataKey="Pending"  stackId="a" fill="#D97706" barSize={18} />
                                    <Bar dataKey="Rejected" stackId="a" fill="#DC2626" barSize={18} radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Box>
                </Card>

                {/* ═══ RECENT ACTIVITY ═══ */}
                <Card sx={{
                    border: `1px solid ${BORDER}`, borderRadius: '14px',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.04)', bgcolor: '#fff',
                }}>
                    <Box sx={{ p: 2, pb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.3 }}>
                            <Box>
                                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>
                                    Recent Activity
                                </Typography>
                                <Typography sx={{ fontSize: 11.5, color: '#6B7280', mt: 0.2 }}>
                                    Latest communications across selected modules
                                </Typography>
                            </Box>
                            <Chip
                                label={`${filteredActivity.length} record${filteredActivity.length !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    bgcolor: PRIMARY_LIGHT, color: PRIMARY_DARK,
                                    fontWeight: 600, fontSize: 11, height: 26,
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                            {[
                                { key: 'all', label: 'All', color: '#374151' },
                                ...ACTIVITY_TYPES.map(t => ({ key: t, label: FEATURE_CONFIG[t].label, color: FEATURE_CONFIG[t].color })),
                            ].map((t) => {
                                const active = activityTypeFilter === t.key;
                                const IconC = t.key !== 'all' ? FEATURE_CONFIG[t.key]?.icon : null;
                                return (
                                    <Box
                                        key={t.key}
                                        onClick={() => { setActivityTypeFilter(t.key); setPage(1); }}
                                        sx={{
                                            px: 1.2, height: 28, borderRadius: '7px',
                                            display: 'flex', alignItems: 'center', gap: 0.5,
                                            cursor: 'pointer', userSelect: 'none',
                                            bgcolor: active ? `${t.color}15` : '#fff',
                                            border: `1px solid ${active ? t.color : BORDER}`,
                                            transition: 'all 0.15s',
                                            '&:hover': { bgcolor: active ? `${t.color}15` : '#F9FAFB' },
                                        }}
                                    >
                                        {IconC && <IconC sx={{ fontSize: 13, color: active ? t.color : '#9CA3AF' }} />}
                                        <Typography sx={{
                                            fontSize: 11.5, fontWeight: 600,
                                            color: active ? t.color : '#6B7280',
                                        }}>
                                            {t.label}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#FAFBFC' }}>
                                    {['#', 'Type', 'Activity Title', 'Created By', 'Role', 'Status', 'Date / Time'].map(h => (
                                        <TableCell key={h} sx={{
                                            fontWeight: 600, fontSize: 11, color: '#6B7280',
                                            letterSpacing: 0.3, py: 1.4,
                                            borderTop: `1px solid ${BORDER}`,
                                            borderBottom: `1px solid ${BORDER}`,
                                        }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                                            <CircularProgress size={28} sx={{ color: PRIMARY }} />
                                        </TableCell>
                                    </TableRow>
                                ) : pageRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                                            <Stack alignItems="center" spacing={0.8}>
                                                <Box sx={{
                                                    width: 56, height: 56, borderRadius: '50%',
                                                    bgcolor: PRIMARY_LIGHT,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <InboxIcon sx={{ fontSize: 28, color: PRIMARY }} />
                                                </Box>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                                    No activity found
                                                </Typography>
                                                <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
                                                    {anyFilterActive ? 'Try clearing or changing your filters' : 'No communication activity in this period'}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ) : pageRows.map((row, idx) => {
                                    const cfg = FEATURE_CONFIG[row.type] || { label: row.type, color: '#6B7280', bg: '#F3F4F6', icon: NewspaperIcon };
                                    const Icon = cfg.icon;
                                    const statConf = STATUS_STYLE[row.status] || STATUS_STYLE.Pending;
                                    const StatusIcon = statConf.icon;
                                    const avColor = avatarColorFor(row.createdBy);
                                    const serial = (page - 1) * ROWS_PER_PAGE + idx + 1;
                                    return (
                                        <TableRow key={row.id} sx={{
                                            '&:hover': { bgcolor: '#FAFBFC' },
                                            transition: 'background-color 0.15s',
                                        }}>
                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6', width: 40 }}>
                                                <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{serial}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                                                    <Box sx={{
                                                        width: 22, height: 22, borderRadius: '6px',
                                                        bgcolor: cfg.bg,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Icon sx={{ fontSize: 13, color: cfg.color }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: cfg.color }}>
                                                        {cfg.label}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6', maxWidth: 280 }}>
                                                <Tooltip arrow title={row.title}>
                                                    <Typography sx={{
                                                        fontSize: 13, fontWeight: 600, color: '#111827',
                                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap', maxWidth: 280,
                                                    }}>
                                                        {row.title}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{
                                                        width: 26, height: 26,
                                                        bgcolor: `${avColor}15`, color: avColor,
                                                        fontSize: 10, fontWeight: 700,
                                                    }}>
                                                        {getInitials(row.createdBy)}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                                                        {row.createdBy}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                <Typography sx={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500 }}>
                                                    {row.role}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                <Box sx={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                    px: 1, py: 0.4, borderRadius: '6px',
                                                    bgcolor: statConf.bg,
                                                }}>
                                                    <StatusIcon sx={{ fontSize: 13, color: statConf.color }} />
                                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: statConf.color }}>
                                                        {row.status}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                <Typography sx={{ fontSize: 11.5, color: '#374151', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    {formatDateTime(row.createdOn)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filteredActivity.length > 0 && (
                        <Box sx={{
                            px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: 1, borderTop: `1px solid ${BORDER}`,
                        }}>
                            <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>
                                Showing <strong style={{ color: '#374151' }}>
                                    {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filteredActivity.length)}
                                </strong> of <strong style={{ color: '#374151' }}>{filteredActivity.length}</strong> records
                            </Typography>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, v) => setPage(v)}
                                size="small"
                                shape="rounded"
                                sx={{
                                    '& .MuiPaginationItem-root': { fontSize: 12, fontWeight: 600 },
                                    '& .Mui-selected': {
                                        bgcolor: `${PRIMARY} !important`,
                                        color: '#fff !important',
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Card>
            </Box>
        </Box>
    );
}
