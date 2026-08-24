import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Grid, Typography, IconButton, Chip,
    TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, InputAdornment, Tooltip, Pagination, Menu, MenuItem,
    Stack, ButtonBase,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
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
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../Redux/Slices/websiteSettingsSlice';
import { findSubMenuPermissions } from '../../Redux/Slices/AuthSlice';
import { selectAcademicYear } from '../../Redux/Slices/academicYearSlice';
import PostViewTracking from './PostViewTracking';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RTooltip, BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { fetchDashboard } from '../../Api/Api';
import {
    DASH, RADIUS, Panel, EmptyNote,
} from '../DashBoardComps/dashboardTheme';
import {
    TileSkeleton, ModuleTileSkeleton, ChartSkeleton, DonutSkeleton, TableRowsSkeleton,
} from '../InnerLoader';

// ─── Theme ────────────────────────────────────────────────────────────────
const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#ECFDF5';
const PRIMARY_DARK = '#047857';
const BORDER = '#EDEFF2';
const CTRL_H = 32;

const ToolbarSeg = ({ icon: Icon, label, onClick, active, divided, trailing, minWidth }) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            display: 'flex', alignItems: 'center', gap: 0.7,
            height: '100%', px: 1.4, minWidth,
            borderLeft: divided ? `1px solid ${DASH.line}` : 'none',
            bgcolor: active ? PRIMARY_LIGHT : 'transparent',
            transition: 'background-color 0.15s ease',
            '&:hover': { bgcolor: active ? PRIMARY_LIGHT : DASH.surface },
        }}
    >
        <Icon sx={{ fontSize: 16, color: active ? PRIMARY_DARK : PRIMARY, flexShrink: 0 }} />
        <Typography sx={{
            fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
            color: active ? PRIMARY_DARK : DASH.text,
            flex: 1, textAlign: 'left',
        }}>
            {label}
        </Typography>
        {trailing}
    </ButtonBase>
);

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

// Brighter than the shared KPI_TONES - those wash out against this page's
// module tiles, which carry real colour.
const TONES = {
    cyan:  { bg: '#EAF7FB', border: '#B6E0EC', accent: '#0E7490' },
    green: { bg: '#E7F8F0', border: '#ABE6CD', accent: '#047857' },
    amber: { bg: '#FDF4E4', border: '#F7D89F', accent: '#B45309' },
    rose:  { bg: '#FCEBEB', border: '#F4BFBF', accent: '#B91C1C' },
};

const KpiTile = ({ icon: Icon, label, value, note, tone }) => (
    <Box
        sx={{
            position: 'relative',
            height: 104,
            minHeight: 104,
            boxSizing: 'border-box',
            overflow: 'hidden',
            bgcolor: tone.bg,
            border: `1px solid ${tone.border}`,
            borderRadius: RADIUS,
            px: 1.8, py: 1.4,
            transition: 'box-shadow 0.2s ease',
            '&:hover': { boxShadow: `0 5px 16px ${tone.accent}26` },
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Typography sx={{
                fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', color: tone.accent, lineHeight: 1.4,
            }}>
                {label}
            </Typography>
            <Box sx={{
                width: 30, height: 30, borderRadius: '50%',
                bgcolor: tone.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                <Icon sx={{ fontSize: 17, color: '#fff' }} />
            </Box>
        </Box>

        <Typography sx={{
            mt: 0.5, fontSize: '28px', fontWeight: 700, lineHeight: 1,
            color: DASH.ink, letterSpacing: '-0.02em',
        }}>
            {value}
        </Typography>

        <Typography sx={{ mt: 0.7, fontSize: '10.5px', fontWeight: 600, color: tone.accent }}>
            {note}
        </Typography>
    </Box>
);

// Matches the section rule on the main dashboard so the two pages read as one
// product rather than two designs.
const SectionTitle = ({ children, icon: Icon }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2, mt: 1 }}>
        {Icon && <Icon sx={{ fontSize: 16, color: DASH.primary }} />}
        <Typography sx={{
            fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: DASH.muted, flexShrink: 0,
        }}>
            {children}
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: DASH.line }} />
    </Box>
);

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

// ─── API plumbing ─────────────────────────────────────────────────────────
const TOKEN = '123';

// Preset key → API filterType string
const FILTER_TYPE_MAP = {
    last7:     'Last 7 Days',
    last15:    'Last 15 Days',
    last30:    'Last 30 Days',
    thisMonth: 'This Month',
    all:       'All Time',
    custom:    'CustomRange',
};

// API module title → internal KPI_KEY
const TITLE_TO_KEY = {
    'News':            'news',
    'Messages':        'messages',
    'Circulars':       'circulars',
    'Consent Forms':   'consentforms',
    'Homework':        'homework',
    'Study Materials': 'studymaterials',
    'Feedback':        'feedback',
    'School Calendar': 'schoolcalendar',
    'Events':          'events',
};

// Normalize a status string from API ("approved" / "Approved" / "APPROVED") → "Approved"
const normalizeStatus = (s) => {
    if (!s) return 'Pending';
    const v = String(s).toLowerCase();
    if (v.startsWith('approve')) return 'Approved';
    if (v.startsWith('reject'))  return 'Rejected';
    return 'Pending';
};

const STATUS_COLOR = {
    Approved: '#16A34A',
    Pending:  '#D97706',
    Rejected: '#DC2626',
};

// Empty kpis object — used as a baseline so missing modules render as zeros.
const emptyKpis = () => {
    const k = {};
    KPI_KEYS.forEach(key => { k[key] = { total: 0, approved: 0, pending: 0, rejected: 0 }; });
    return k;
};

const ROWS_PER_PAGE = 10;

export default function CommunicationDashboard() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const user = useSelector((state) => state.auth);
    // Export writes out exactly the rows already on screen, so it needs no more
    // access than viewing the dashboard does.
    const dashboardPerms = findSubMenuPermissions(user.permissions, 'communication', 'dashboard') || {};
    const canExport = dashboardPerms.view === 'Y';
    const presets = useMemo(() => buildPresets(), []);

    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'tracking'
    const [activePreset, setActivePreset] = useState('last30');
    const [fromDate, setFromDate] = useState(presets.find(p => p.key === 'last30').from);
    const [toDate, setToDate]     = useState(presets.find(p => p.key === 'last30').to);
    const [search, setSearch]     = useState('');
    const [activityTypeFilter, setActivityTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [exportAnchor, setExportAnchor] = useState(null);
    const [dateAnchor, setDateAnchor] = useState(null);
    const academicYear = useSelector(selectAcademicYear);
    const [isLoading, setIsLoading] = useState(false);

    // Shape mirrors API response sections so we render exactly what the backend computed.
    const [data, setData] = useState({
        kpis: emptyKpis(),
        activity: [],
        trend: { data: [], peak: null },
        pie: [],
        pieTotal: 0,
        moduleBar: [],
    });

    // ─── Fetch dashboard whenever the filter window changes ───────────────
    useEffect(() => {
        let cancelled = false;
        const params = { filterType: FILTER_TYPE_MAP[activePreset] || 'Last 30 Days' };
        // Send dates only when we actually have a defined range
        if (fromDate) params.fromDate = fromDate;
        if (toDate)   params.toDate   = toDate;
        if (academicYear) params.academicYear = academicYear;

        setIsLoading(true);
        axios
            .get(fetchDashboard, {
                params,
                headers: { Authorization: `Bearer ${TOKEN}` },
            })
            .then((res) => {
                if (cancelled) return;
                const payload = res?.data || {};
                if (payload.success === false) {
                    setData({ kpis: emptyKpis(), activity: [], trend: { data: [], peak: null }, pie: [], pieTotal: 0, moduleBar: [] });
                    return;
                }

                // ── Module KPI cards
                const kpis = emptyKpis();
                (payload.data || []).forEach((m) => {
                    const key = TITLE_TO_KEY[m.title];
                    if (key) {
                        kpis[key] = {
                            total: Number(m.total)    || 0,
                            approved: Number(m.approved) || 0,
                            pending:  Number(m.pending)  || 0,
                            rejected: Number(m.rejected) || 0,
                        };
                    }
                });

                // ── Activity trend (area chart)
                const trendApi = payload.activityTrend || {};
                const trend = {
                    data: (trendApi.data || []).map(d => ({
                        date: d.date,
                        label: d.label || (d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''),
                        count: Number(d.count) || 0,
                    })),
                    peak: trendApi.peak
                        ? { ...trendApi.peak, count: Number(trendApi.peak.count) || 0 }
                        : null,
                };

                // ── Status distribution (pie chart)
                const statusApi = payload.statusDistribution || {};
                const pie = (statusApi.data || []).map(s => ({
                    name: s.status,
                    value: Number(s.count) || 0,
                    color: STATUS_COLOR[s.status] || '#6B7280',
                }));
                const pieTotal = Number(statusApi.total) || pie.reduce((sum, p) => sum + p.value, 0);

                // ── Module-wise comparison (bar chart)
                const moduleBar = (payload.moduleWiseComparison?.data || []).map(m => {
                    const key = TITLE_TO_KEY[m.module];
                    const cfg = key ? FEATURE_CONFIG[key] : null;
                    return {
                        name: m.module,
                        color: cfg?.color || '#6B7280',
                        Approved: Number(m.approved) || 0,
                        Pending:  Number(m.pending)  || 0,
                        Rejected: Number(m.rejected) || 0,
                    };
                });

                // ── Recent activity table rows
                const activity = (payload.recentActivity?.data || []).map((r, i) => {
                    const moduleTitle = r.module || r.type || r.title || '';
                    const typeKey = TITLE_TO_KEY[moduleTitle]
                        || String(r.type || '').toLowerCase().replace(/\s+/g, '');
                    return {
                        id: r.id ?? `${r.rollNumber || 'a'}-${i}`,
                        type: typeKey,
                        title: r.activityTitle || r.title || r.headline || '—',
                        createdBy: r.createdBy || r.name || r.creatorName || '—',
                        role: r.role || r.userType || '—',
                        createdOn: r.createdOn || r.createdAt || r.dateTime || r.date || '',
                        status: normalizeStatus(r.status),
                    };
                });

                setData({ kpis, activity, trend, pie, pieTotal, moduleBar });
            })
            .catch(() => {
                if (cancelled) return;
                setData({ kpis: emptyKpis(), activity: [], trend: { data: [], peak: null }, pie: [], pieTotal: 0, moduleBar: [] });
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [activePreset, fromDate, toDate, academicYear]);

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

    // Activity rows already come from the API filtered by date range.
    // Apply client-side type + search filters on top of that response.
    const filteredActivity = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.activity.filter(a => {
            const matchesType = activityTypeFilter === 'all' || a.type === activityTypeFilter;
            const matchesSearch = !q
                || (a.title || '').toLowerCase().includes(q)
                || (a.createdBy || '').toLowerCase().includes(q)
                || (a.role || '').toLowerCase().includes(q);
            return matchesType && matchesSearch;
        });
    }, [data.activity, activityTypeFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filteredActivity.length / ROWS_PER_PAGE));
    const pageRows = useMemo(
        () => filteredActivity.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
        [filteredActivity, page]
    );

    const anyFilterActive =
        activePreset !== 'last30' || search.trim().length > 0 || activityTypeFilter !== 'all';

    // Chart data is provided pre-computed by the API.
    const trendData    = data.trend.data;
    const trendPeakDay = data.trend.peak;
    const moduleBarData = data.moduleBar;
    const pieData      = data.pie;
    const pieTotal     = data.pieTotal;

    // ── Exports ────────────────────────────────────────────────────────────
    // Per-module counts (Total / Approved / Pending / Rejected) for the export summary
    const buildModuleSummary = () => ACTIVITY_TYPES.map((key) => {
        const k = kpis[key] || { total: 0, approved: 0, pending: 0, rejected: 0 };
        const noApproval = NO_APPROVAL_MODULES.has(key);
        return {
            label: FEATURE_CONFIG[key]?.label || key,
            total: k.total,
            approved: noApproval ? '-' : k.approved,
            pending: noApproval ? '-' : k.pending,
            rejected: noApproval ? '-' : k.rejected,
        };
    });

    const handleExportExcel = () => {
        setExportAnchor(null);
        const wb = XLSX.utils.book_new();

        // Sheet 1 — Module Summary (counts per module)
        const summary = buildModuleSummary();
        const sumAoa = [
            ['Module', 'Total', 'Approved', 'Pending', 'Rejected'],
            ...summary.map((m) => [m.label, m.total, m.approved, m.pending, m.rejected]),
            ['TOTAL', heroSummary.total, heroSummary.approved, heroSummary.pending, heroSummary.rejected],
        ];
        const sumWs = XLSX.utils.aoa_to_sheet(sumAoa);
        sumWs['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, sumWs, 'Module Summary');

        // Sheet 2 — Activity rows
        const headers = ['S.No', 'Type', 'Title', 'Created By', 'Role', 'Status', 'Date/Time'];
        const rows = filteredActivity.map((r, i) => [
            i + 1, FEATURE_CONFIG[r.type]?.label || r.type,
            r.title, r.createdBy, r.role, r.status, formatDateTime(r.createdOn),
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Communication Activity');

        const tag = fromDate && toDate ? `${fromDate}_to_${toDate}` : 'all-time';
        XLSX.writeFile(wb, `Communication_Activity_${tag}.xlsx`);
    };

    const handleExportPDF = () => {
        setExportAnchor(null);
        const summary = buildModuleSummary();
        const html = `
            <html><head><title>Communication Activity</title>
            <style>
                body { font-family: -apple-system, Segoe UI, sans-serif; padding: 24px; color: #111; }
                h1 { font-size: 20px; margin: 0 0 4px; }
                h2 { font-size: 14px; margin: 18px 0 6px; color: #111; }
                .sub { color: #666; font-size: 12px; margin-bottom: 8px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
                th, td { padding: 6px 8px; border: 1px solid #E5E7EB; text-align: left; }
                th { background: #ECFDF5; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; }
                tr:nth-child(even) td { background: #FAFAFA; }
                tr.grand td { background: #ECFDF5; font-weight: 700; color: #047857; }
            </style></head><body>
                <h1>Communication Activity Report</h1>
                <div class="sub">Range: ${fromDate || '—'} → ${toDate || '—'} · ${filteredActivity.length} records</div>

                <h2>Module Summary</h2>
                <table>
                    <thead><tr><th>Module</th><th>Total</th><th>Approved</th><th>Pending</th><th>Rejected</th></tr></thead>
                    <tbody>
                        ${summary.map((m) => `
                            <tr>
                                <td>${m.label}</td>
                                <td>${m.total}</td>
                                <td>${m.approved}</td>
                                <td>${m.pending}</td>
                                <td>${m.rejected}</td>
                            </tr>
                        `).join('')}
                        <tr class="grand">
                            <td>TOTAL</td>
                            <td>${heroSummary.total}</td>
                            <td>${heroSummary.approved}</td>
                            <td>${heroSummary.pending}</td>
                            <td>${heroSummary.rejected}</td>
                        </tr>
                    </tbody>
                </table>

                <h2>Recent Activity</h2>
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
        // Print via a hidden iframe — reliable across browsers (avoids popup blockers
        // and the `noopener` window.open() returning null).
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        doc.open();
        doc.write(html);
        doc.close();
        const removeIframe = () => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); };
        setTimeout(() => {
            const win = iframe.contentWindow;
            win.onafterprint = removeIframe;
            win.focus();
            win.print();
            // Fallback cleanup if onafterprint never fires
            setTimeout(removeIframe, 60000);
        }, 300);
    };

    const STATUS_STYLE = {
        Approved: { color: '#047857', bg: '#ECFDF5', icon: CheckCircleIcon },
        Pending:  { color: '#B45309', bg: '#FFFBEB', icon: PendingIcon },
        Rejected: { color: '#B91C1C', bg: '#FEF2F2', icon: CancelIcon },
    };

    // ── Hero KPI card data (4 cards) ───────────────────────────────────────
    const heroCards = [
        { label: 'Total Communications', value: heroSummary.total,    note: 'All modules',                          tone: TONES.cyan,  icon: HubIcon },
        { label: 'Approved',             value: heroSummary.approved, note: `${heroSummary.approvedPct}% approved`, tone: TONES.green, icon: CheckCircleIcon },
        { label: 'Pending Review',       value: heroSummary.pending,  note: `${heroSummary.pendingPct}% awaiting`,  tone: TONES.amber, icon: PendingIcon },
        { label: 'Rejected',             value: heroSummary.rejected, note: `${heroSummary.rejectedPct}% rejected`, tone: TONES.rose,  icon: CancelIcon },
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
            {/* ═══ HEADER BAR — same in-flow bar the other Communication pages use ═══ */}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", mb: 0.13, }}>
                <Grid container alignItems="center" spacing={1}>
                    <Grid size={{ xs: 12, sm: 12, md: 5, lg: 4 }} sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        {/* Negative margin keeps the button's 8px padding from setting the bar height */}
                        <IconButton
                            onClick={() => (viewMode === 'tracking' ? setViewMode('dashboard') : navigate(-1))}
                            sx={{ width: 26, height: 26, my: '-5px', flexShrink: 0 }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 17, color: DASH.ink }} />
                        </IconButton>
                        {viewMode === 'tracking'
                            ? <FactCheckOutlinedIcon sx={{ color: websiteSettings.mainColor || PRIMARY, fontSize: 19, flexShrink: 0 }} />
                            : <HubIcon sx={{ color: websiteSettings.mainColor || PRIMARY, fontSize: 19, flexShrink: 0 }} />}
                        <Typography sx={{ fontWeight: 600, fontSize: '20px', color: DASH.ink, flexShrink: 0 }}>
                            {viewMode === 'tracking' ? 'View Tracking' : 'Communication Dashboard'}
                        </Typography>
                        <Typography sx={{
                            fontSize: 11.5, color: DASH.muted, minWidth: 0,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            display: { xs: 'none', lg: 'block' },
                        }}>
                            {viewMode === 'tracking'
                                ? 'Track who viewed each post — by class & section'
                                : 'Overview of all communication activity'}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 7, lg: 8 }} sx={{ display: 'flex', justifyContent: { md: 'flex-end', xs: 'flex-start' }, alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>

                        {/* Segmented control — view toggle and date preset share one shell */}
                        <Box sx={{
                            display: 'flex', alignItems: 'stretch', height: CTRL_H,
                            bgcolor: '#fff', border: `1px solid ${DASH.line}`,
                            borderRadius: RADIUS, overflow: 'hidden',
                            boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                        }}>
                            <Tooltip
                                arrow
                                title={viewMode === 'tracking'
                                    ? 'Back to the communication dashboard'
                                    : 'See who viewed each post, by class & section'}
                            >
                                <Box sx={{ display: 'flex' }}>
                                    <ToolbarSeg
                                        onClick={() => setViewMode(viewMode === 'tracking' ? 'dashboard' : 'tracking')}
                                        active={viewMode === 'tracking'}
                                        icon={viewMode === 'tracking' ? DashboardOutlinedIcon : FactCheckOutlinedIcon}
                                        label={viewMode === 'tracking' ? 'Dashboard' : 'View Tracking'}
                                    />
                                </Box>
                            </Tooltip>

                            {viewMode === 'dashboard' && (
                                <ToolbarSeg
                                    divided
                                    minWidth={150}
                                    onClick={(e) => setDateAnchor(e.currentTarget)}
                                    active={Boolean(dateAnchor)}
                                    icon={CalendarMonthIcon}
                                    label={activePreset
                                        ? presets.find(p => p.key === activePreset)?.label || 'Custom Range'
                                        : 'Custom Range'}
                                    trailing={
                                        <KeyboardArrowDownIcon sx={{
                                            fontSize: 16, color: DASH.faint, flexShrink: 0,
                                            transform: dateAnchor ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.18s ease',
                                        }} />
                                    }
                                />
                            )}
                        </Box>

                        <Menu
                            anchorEl={dateAnchor}
                            open={Boolean(dateAnchor)}
                            onClose={() => setDateAnchor(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            slotProps={{
                                paper: {
                                    sx: {
                                        mt: 0.6, borderRadius: '10px', minWidth: 180, py: 0.4,
                                        border: `1px solid ${DASH.line}`,
                                        boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
                                    },
                                },
                            }}
                        >
                            {presets.map(p => {
                                const active = activePreset === p.key;
                                return (
                                    <MenuItem
                                        key={p.key}
                                        onClick={() => { applyPreset(p.key); setDateAnchor(null); }}
                                        sx={{
                                            fontSize: 12.5, fontWeight: 600, mx: 0.6, my: 0.15,
                                            borderRadius: RADIUS, minHeight: 34, gap: 1.5,
                                            color: active ? PRIMARY_DARK : DASH.text,
                                            bgcolor: active ? PRIMARY_LIGHT : 'transparent',
                                            '&:hover': { bgcolor: active ? PRIMARY_LIGHT : DASH.surface },
                                        }}
                                    >
                                        {p.label}
                                        {active && <CheckIcon sx={{ fontSize: 15, color: PRIMARY, ml: 'auto' }} />}
                                    </MenuItem>
                                );
                            })}
                        </Menu>

                        {viewMode === 'dashboard' && (<>
                        {/* From/To inputs — visible only when Custom Range is selected */}
                        {activePreset === 'custom' && (
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 0.6,
                                height: CTRL_H, px: 1,
                                bgcolor: '#fff', border: `1px solid ${DASH.line}`,
                                borderRadius: RADIUS, boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                            }}>
                                <TextField
                                    type="date" size="small" variant="standard"
                                    value={fromDate || ''}
                                    onChange={e => handleFromChange(e.target.value)}
                                    slotProps={{ htmlInput: { max: getTodayInput() }, input: { disableUnderline: true } }}
                                    sx={{ width: 116, '& input': { fontSize: 11.5, fontWeight: 600, color: DASH.text, p: 0 } }}
                                />
                                <Typography sx={{ fontSize: 11, color: DASH.faint, fontWeight: 600 }}>to</Typography>
                                <TextField
                                    type="date" size="small" variant="standard"
                                    value={toDate || ''}
                                    onChange={e => handleToChange(e.target.value)}
                                    slotProps={{ htmlInput: { max: getTodayInput() }, input: { disableUnderline: true } }}
                                    sx={{ width: 116, '& input': { fontSize: 11.5, fontWeight: 600, color: DASH.text, p: 0 } }}
                                />
                            </Box>
                        )}

                        {anyFilterActive && (
                            <Tooltip arrow title="Clear all filters">
                                <ButtonBase
                                    onClick={clearFilters}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 0.6,
                                        height: CTRL_H, px: 1.3, borderRadius: RADIUS,
                                        color: DASH.red, bgcolor: '#fff',
                                        border: `1px solid ${DASH.red}38`,
                                        transition: 'background-color 0.15s ease',
                                        '&:hover': { bgcolor: DASH.redLight },
                                    }}
                                >
                                    <RestartAltIcon sx={{ fontSize: 16 }} />
                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'inherit' }}>
                                        Reset
                                    </Typography>
                                </ButtonBase>
                            </Tooltip>
                        )}

                        {canExport && (
                            <>
                                <ButtonBase
                                    onClick={(e) => setExportAnchor(e.currentTarget)}
                                    disabled={filteredActivity.length === 0}
                                    sx={{
                                        display: 'flex', alignItems: 'stretch', height: CTRL_H,
                                        borderRadius: RADIUS, overflow: 'hidden',
                                        bgcolor: PRIMARY, color: '#fff',
                                        boxShadow: '0 1px 2px rgba(5,150,105,0.30)',
                                        transition: 'background-color 0.15s ease',
                                        '&:hover': { bgcolor: PRIMARY_DARK },
                                        '&.Mui-disabled': { bgcolor: '#EDEFF2', color: DASH.faint, boxShadow: 'none' },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, px: 1.5 }}>
                                        <FileDownloadIcon sx={{ fontSize: 16 }} />
                                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'inherit', whiteSpace: 'nowrap' }}>
                                            Export
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', px: 0.5,
                                        borderLeft: `1px solid ${filteredActivity.length === 0 ? DASH.line : 'rgba(255,255,255,0.30)'}`,
                                    }}>
                                        <KeyboardArrowDownIcon sx={{
                                            fontSize: 16,
                                            transform: exportAnchor ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.18s ease',
                                        }} />
                                    </Box>
                                </ButtonBase>
                                <Menu
                                    anchorEl={exportAnchor}
                                    open={Boolean(exportAnchor)}
                                    onClose={() => setExportAnchor(null)}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    slotProps={{
                                        paper: {
                                            sx: {
                                                mt: 0.6, borderRadius: '10px', minWidth: 196, py: 0.4,
                                                border: `1px solid ${DASH.line}`,
                                                boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem onClick={handleExportExcel} sx={{ gap: 1.2, py: 0.9, mx: 0.6, borderRadius: RADIUS, '&:hover': { bgcolor: DASH.surface } }}>
                                        <GridOnIcon sx={{ fontSize: 18, color: '#047857' }} />
                                        <Box>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Excel (.xlsx)</Typography>
                                            <Typography sx={{ fontSize: 10, color: DASH.faint }}>Spreadsheet format</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem onClick={handleExportPDF} sx={{ gap: 1.2, py: 0.9, mx: 0.6, borderRadius: RADIUS, '&:hover': { bgcolor: DASH.surface } }}>
                                        <PictureAsPdfIcon sx={{ fontSize: 18, color: DASH.red }} />
                                        <Box>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>PDF</Typography>
                                            <Typography sx={{ fontSize: 10, color: DASH.faint }}>Printable report</Typography>
                                        </Box>
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                        </>)}
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{
                pt: 2, pb: 4, px: { xs: 1.5, md: 2 },
                bgcolor: DASH.canvas, minHeight: '100%', boxSizing: 'border-box',
            }}>
                {viewMode === 'tracking' ? (
                    <PostViewTracking />
                ) : (<>

                {/* ═══ OVERVIEW — four KPI tiles, same language as the main dashboard ═══ */}
                <SectionTitle icon={HubIcon}>Overview</SectionTitle>
                <Grid container spacing={2}>
                    {isLoading && Array.from({ length: heroCards.length }).map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={`kpi-skel-${i}`}>
                            <TileSkeleton />
                        </Grid>
                    ))}
                    {!isLoading && heroCards.map((c) => (
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={c.label}>
                            <KpiTile
                                icon={c.icon}
                                label={c.label}
                                value={c.value.toLocaleString()}
                                note={c.note}
                                tone={c.tone}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* ═══ MODULES — one tinted tile per communication feature ═══ */}
                <SectionTitle icon={DashboardOutlinedIcon}>Modules</SectionTitle>
                <Grid container spacing={2} alignItems="stretch">
                    {isLoading && ACTIVITY_TYPES.map((key) => (
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={`mod-skel-${key}`}>
                            <ModuleTileSkeleton />
                        </Grid>
                    ))}
                    {!isLoading && ACTIVITY_TYPES.map((key) => {
                        const cfg = FEATURE_CONFIG[key];
                        const Icon = cfg.icon;
                        const k = kpis[key] || { total: 0, approved: 0, pending: 0, rejected: 0 };
                        const hasApproval = !NO_APPROVAL_MODULES.has(key);
                        const approvedPct = k.total > 0 ? Math.round((k.approved / k.total) * 100) : 0;
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={key}>
                                <Box
                                    sx={{
                                        // Flat accent tint and a matching border — the same treatment
                                        // the dashboard KPI and alert tiles use. No leading bar.
                                        bgcolor: `${cfg.color}0F`,
                                        border: `1px solid ${cfg.color}4D`,
                                        borderRadius: RADIUS,
                                        height: '100%',
                                        boxSizing: 'border-box',
                                        p: 1.4,
                                        transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
                                        '&:hover': {
                                            bgcolor: `${cfg.color}17`,
                                            boxShadow: `0 5px 16px ${cfg.color}2E`,
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{
                                            bgcolor: cfg.color,
                                            borderRadius: '50%',
                                            width: 34, height: 34,
                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Icon sx={{ color: '#fff', fontSize: 18 }} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{
                                                fontWeight: 700, fontSize: '13.5px', color: DASH.ink,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {cfg.label}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: '11px', color: DASH.muted, mt: 0.2,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {hasApproval
                                                    ? `${k.total.toLocaleString()} total · ${approvedPct}% approved`
                                                    : `${k.total.toLocaleString()} total · publishes directly`}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            display: 'inline-flex', alignItems: 'center', gap: 0.3,
                                            px: 0.9, py: 0.3, borderRadius: RADIUS,
                                            bgcolor: `${cfg.color}1A`,
                                            border: `1px solid ${cfg.color}4D`,
                                            flexShrink: 0,
                                        }}>
                                            {!hasApproval && <CheckCircleIcon sx={{ fontSize: 11, color: cfg.color }} />}
                                            <Typography sx={{
                                                fontSize: hasApproval ? 10.5 : 9.5, fontWeight: 700, color: cfg.color,
                                                textTransform: hasApproval ? 'none' : 'uppercase',
                                                letterSpacing: hasApproval ? 0 : 0.3,
                                            }}>
                                                {hasApproval ? `${approvedPct}%` : 'Direct'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {hasApproval ? (
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                                            gap: 0.6, mt: 1.3,
                                        }}>
                                            {[
                                                { label: 'Total',    value: k.total,    color: DASH.ink,   dot: cfg.color },
                                                { label: 'Approved', value: k.approved, color: DASH.green, dot: DASH.green },
                                                { label: 'Pending',  value: k.pending,  color: DASH.amber, dot: DASH.amber },
                                                { label: 'Rejected', value: k.rejected, color: DASH.red,   dot: DASH.red },
                                            ].map((s) => (
                                                <Box
                                                    key={s.label}
                                                    sx={{
                                                        bgcolor: '#fff',
                                                        border: `1px solid ${DASH.line}`,
                                                        borderRadius: RADIUS,
                                                        py: 0.6, px: 0.4,
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                        minWidth: 0, overflow: 'hidden',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, minWidth: 0 }}>
                                                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: s.dot, flexShrink: 0 }} />
                                                        <Typography sx={{
                                                            fontSize: 8.5, fontWeight: 700, color: DASH.muted,
                                                            textTransform: 'uppercase', letterSpacing: 0.2,
                                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        }}>
                                                            {s.label}
                                                        </Typography>
                                                    </Box>
                                                    <Typography sx={{
                                                        fontSize: 14, fontWeight: 700, color: s.color,
                                                        lineHeight: 1.2, mt: 0.2,
                                                    }}>
                                                        {s.value.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            mt: 1.3,
                                            bgcolor: '#fff',
                                            border: `1px solid ${DASH.line}`,
                                            borderRadius: RADIUS,
                                            px: 1.2, py: 0.9,
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            gap: 1,
                                        }}>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{
                                                    fontSize: 9.5, fontWeight: 700, color: DASH.muted,
                                                    textTransform: 'uppercase', letterSpacing: 0.3,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    Total Records
                                                </Typography>
                                                <Typography sx={{
                                                    fontSize: 10.5, color: DASH.faint, fontWeight: 500, mt: 0.1,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    No approval step
                                                </Typography>
                                            </Box>
                                            <Typography sx={{
                                                fontSize: 22, fontWeight: 700, color: cfg.color,
                                                lineHeight: 1, flexShrink: 0,
                                            }}>
                                                {k.total.toLocaleString()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* ═══ INSIGHTS — trend, status split, module comparison ═══ */}
                <SectionTitle icon={ShowChartIcon}>Insights</SectionTitle>
                <Grid container spacing={2} alignItems="stretch">
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8 }}>
                        <Panel
                            title="Activity Trend"
                            subtitle="Daily communication activity over the selected period"
                            accent={DASH.green}
                            sx={{ height: '100%' }}
                            right={trendPeakDay ? (
                                <Box sx={{
                                    display: 'inline-flex', alignItems: 'center', gap: 0.6,
                                    bgcolor: DASH.greenLight, border: `1px solid ${DASH.green}38`,
                                    px: 1.1, py: 0.4, borderRadius: RADIUS,
                                }}>
                                    <CalendarMonthIcon sx={{ fontSize: 13, color: DASH.green }} />
                                    <Typography sx={{ fontSize: 11, color: DASH.text, fontWeight: 600 }}>
                                        Peak: <strong>{trendPeakDay.label}</strong> · {trendPeakDay.count}
                                    </Typography>
                                </Box>
                            ) : null}
                        >
                            <Box sx={{ width: '100%', height: 280 }}>
                                {isLoading ? (
                                    <ChartSkeleton height={280} bars={14} />
                                ) : trendData.length === 0 ? (
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <EmptyNote text="No activity recorded in this period." />
                                    </Box>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%"   stopColor={PRIMARY} stopOpacity={0.32} />
                                                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fontSize: 10.5, fill: DASH.faint }}
                                                axisLine={false}
                                                tickLine={false}
                                                minTickGap={20}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10.5, fill: DASH.faint }}
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
                        </Panel>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                        <Panel
                            title="Status Distribution"
                            subtitle="Across all modules"
                            accent={DASH.violet}
                            sx={{ height: '100%' }}
                            right={<PieChartIcon sx={{ fontSize: 17, color: DASH.violet }} />}
                        >
                            {isLoading && <DonutSkeleton size={148} legendRows={3} />}

                            {!isLoading && <Box sx={{ position: 'relative', width: '100%', height: 176 }}>
                                {pieData.length === 0 ? (
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <EmptyNote text="Nothing to break down yet." />
                                    </Box>
                                ) : (
                                    <>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={48} outerRadius={74}
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
                                                        border: `1px solid ${DASH.line}`,
                                                        borderRadius: RADIUS,
                                                        fontSize: 12,
                                                        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
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
                                            <Typography sx={{ fontSize: 21, fontWeight: 700, color: DASH.ink, lineHeight: 1 }}>
                                                {pieTotal.toLocaleString()}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 10, color: DASH.muted, fontWeight: 700,
                                                mt: 0.3, textTransform: 'uppercase', letterSpacing: 0.4,
                                            }}>
                                                Total
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>}

                            {!isLoading && <Stack spacing={0.6} sx={{ mt: 1.2 }}>
                                {pieData.map(p => {
                                    const pct = pieTotal > 0 ? Math.round((p.value / pieTotal) * 100) : 0;
                                    return (
                                        <Box key={p.name} sx={{
                                            display: 'flex', alignItems: 'center', gap: 1,
                                            px: 1, py: 0.55, borderRadius: RADIUS,
                                            bgcolor: `${p.color}0D`, border: `1px solid ${p.color}38`,
                                        }}>
                                            <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: p.color }} />
                                            <Typography sx={{ fontSize: 11.5, color: DASH.text, fontWeight: 600, flex: 1 }}>
                                                {p.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11.5, color: DASH.ink, fontWeight: 700 }}>
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
                            </Stack>}
                        </Panel>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 0 }}>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                        <Panel
                            title="Module-wise Comparison"
                            subtitle="Status counts across all modules"
                            accent={DASH.blue}
                            right={(
                                <Box sx={{ display: 'flex', gap: 1.3, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <BarChartIcon sx={{ fontSize: 17, color: DASH.blue }} />
                                    {[
                                        { label: 'Approved', color: DASH.green },
                                        { label: 'Pending',  color: DASH.amber },
                                        { label: 'Rejected', color: DASH.red },
                                    ].map(l => (
                                        <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: l.color }} />
                                            <Typography sx={{ fontSize: 11, color: DASH.muted, fontWeight: 600 }}>{l.label}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        >
                            <Box sx={{ width: '100%', height: 300 }}>
                                {isLoading ? (
                                    <ChartSkeleton height={300} bars={9} />
                                ) : moduleBarData.length === 0 ? (
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <EmptyNote text="No module activity in this period." />
                                    </Box>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={moduleBarData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                            barCategoryGap={10}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} horizontal={false} />
                                            <XAxis
                                                type="number"
                                                tick={{ fontSize: 10.5, fill: DASH.faint }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                tick={{ fontSize: 11.5, fill: DASH.text, fontWeight: 500 }}
                                                axisLine={false}
                                                tickLine={false}
                                                width={110}
                                            />
                                            <RTooltip
                                                cursor={{ fill: DASH.blueLight, opacity: 0.4 }}
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: `1px solid ${DASH.line}`,
                                                    borderRadius: RADIUS,
                                                    fontSize: 12,
                                                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                                                }}
                                            />
                                            <Bar dataKey="Approved" stackId="a" fill={DASH.green} barSize={18} />
                                            <Bar dataKey="Pending"  stackId="a" fill={DASH.amber} barSize={18} />
                                            <Bar dataKey="Rejected" stackId="a" fill={DASH.red}   barSize={18} radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </Box>
                        </Panel>
                    </Grid>
                </Grid>

                {/* ═══ RECENT ACTIVITY ═══ */}
                <SectionTitle icon={InboxIcon}>Recent Activity</SectionTitle>
                <Panel
                    title="Latest Communications"
                    subtitle="Newest posts across the selected modules"
                    accent={DASH.primary}
                    bodySx={{ p: 0 }}
                    right={(
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <TextField
                                size="small"
                                placeholder="Search title, creator or role..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 16, color: DASH.faint }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: search ? (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.3 }}>
                                                    <CloseIcon sx={{ fontSize: 14, color: DASH.faint }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null,
                                    },
                                }}
                                sx={{
                                    width: { xs: '100%', sm: 240 },
                                    '& .MuiOutlinedInput-root': {
                                        height: 32, fontSize: 12.5,
                                        borderRadius: RADIUS,
                                        bgcolor: '#fff',
                                        '& fieldset': { borderColor: DASH.line },
                                        '&:hover fieldset': { borderColor: DASH.faint },
                                        '&.Mui-focused fieldset': { borderColor: DASH.primary, borderWidth: 1 },
                                    },
                                }}
                            />
                            <Chip
                                label={`${filteredActivity.length} record${filteredActivity.length !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    bgcolor: DASH.primaryLight, color: '#8A6100',
                                    border: `1px solid ${DASH.primaryBorder}`,
                                    borderRadius: RADIUS,
                                    fontWeight: 700, fontSize: 11, height: 24,
                                }}
                            />
                        </Box>
                    )}
                >
                    {/* Type filter — narrows the table to a single module */}
                    <Box sx={{
                        display: 'flex', flexWrap: 'wrap', gap: 0.6,
                        px: 2, pt: 1.6, pb: 1.4,
                    }}>
                        {[
                            { key: 'all', label: 'All', color: DASH.text },
                            ...ACTIVITY_TYPES.map(t => ({ key: t, label: FEATURE_CONFIG[t].label, color: FEATURE_CONFIG[t].color })),
                        ].map((t) => {
                            const active = activityTypeFilter === t.key;
                            const IconC = t.key !== 'all' ? FEATURE_CONFIG[t.key]?.icon : null;
                            return (
                                <Box
                                    key={t.key}
                                    onClick={() => { setActivityTypeFilter(t.key); setPage(1); }}
                                    sx={{
                                        px: 1.2, height: 27, borderRadius: RADIUS,
                                        display: 'flex', alignItems: 'center', gap: 0.5,
                                        cursor: 'pointer', userSelect: 'none',
                                        bgcolor: active ? `${t.color}1A` : '#fff',
                                        border: `1px solid ${active ? `${t.color}59` : DASH.line}`,
                                        transition: 'background-color 0.15s ease, border-color 0.15s ease',
                                        '&:hover': { bgcolor: active ? `${t.color}24` : `${t.color}0D`, borderColor: `${t.color}4D` },
                                    }}
                                >
                                    {IconC && <IconC sx={{ fontSize: 13, color: active ? t.color : DASH.faint }} />}
                                    <Typography sx={{
                                        fontSize: 11.5, fontWeight: 700,
                                        color: active ? t.color : DASH.muted,
                                    }}>
                                        {t.label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: DASH.surface }}>
                                    {['#', 'Type', 'Activity Title', 'Created By', 'Role', 'Status', 'Date / Time'].map(h => (
                                        <TableCell key={h} sx={{
                                            fontWeight: 700, fontSize: 10.5, color: DASH.muted,
                                            letterSpacing: 0.4, textTransform: 'uppercase', py: 1.2,
                                            whiteSpace: 'nowrap',
                                            borderTop: `1px solid ${DASH.line}`,
                                            borderBottom: `1px solid ${DASH.line}`,
                                        }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRowsSkeleton rows={ROWS_PER_PAGE} columns={7} wideColumn={2} />
                                ) : pageRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 5, borderBottom: 'none' }}>
                                            <Stack alignItems="center" spacing={0.6}>
                                                <Box sx={{
                                                    width: 50, height: 50, borderRadius: '50%',
                                                    bgcolor: DASH.primaryLight,
                                                    border: `1px solid ${DASH.primaryBorder}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <InboxIcon sx={{ fontSize: 24, color: DASH.primary }} />
                                                </Box>
                                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.text }}>
                                                    No activity found
                                                </Typography>
                                                <EmptyNote text={anyFilterActive
                                                    ? 'Try clearing or changing your filters.'
                                                    : 'No communication activity in this period.'} />
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ) : pageRows.map((row, idx) => {
                                    const cfg = FEATURE_CONFIG[row.type] || { label: row.type, color: DASH.muted, bg: DASH.lineSoft, icon: NewspaperIcon };
                                    const Icon = cfg.icon;
                                    const statConf = STATUS_STYLE[row.status] || STATUS_STYLE.Pending;
                                    const StatusIcon = statConf.icon;
                                    const avColor = avatarColorFor(row.createdBy);
                                    const serial = (page - 1) * ROWS_PER_PAGE + idx + 1;
                                    return (
                                        <TableRow key={row.id} sx={{
                                            '&:hover': { bgcolor: DASH.surface },
                                            transition: 'background-color 0.15s ease',
                                        }}>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, width: 40 }}>
                                                <Typography sx={{ fontSize: 12, color: DASH.faint, fontWeight: 600 }}>{serial}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                                                    <Box sx={{
                                                        width: 22, height: 22, borderRadius: RADIUS,
                                                        bgcolor: `${cfg.color}14`,
                                                        border: `1px solid ${cfg.color}38`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Icon sx={{ fontSize: 13, color: cfg.color }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: cfg.color, whiteSpace: 'nowrap' }}>
                                                        {cfg.label}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, maxWidth: 280 }}>
                                                <Tooltip arrow title={row.title}>
                                                    <Typography sx={{
                                                        fontSize: 12.5, fontWeight: 600, color: DASH.ink,
                                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap', maxWidth: 280,
                                                    }}>
                                                        {row.title}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{
                                                        width: 25, height: 25,
                                                        bgcolor: `${avColor}15`, color: avColor,
                                                        fontSize: 10, fontWeight: 700,
                                                    }}>
                                                        {getInitials(row.createdBy)}
                                                    </Avatar>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: DASH.ink, whiteSpace: 'nowrap' }}>
                                                        {row.createdBy}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                <Typography sx={{ fontSize: 11.5, color: DASH.muted, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                    {row.role}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                <Box sx={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                    px: 1, py: 0.35, borderRadius: RADIUS,
                                                    bgcolor: statConf.bg,
                                                }}>
                                                    <StatusIcon sx={{ fontSize: 13, color: statConf.color }} />
                                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: statConf.color }}>
                                                        {row.status}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${DASH.lineSoft}` }}>
                                                <Typography sx={{ fontSize: 11.5, color: DASH.text, fontWeight: 600, whiteSpace: 'nowrap' }}>
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
                            px: 2, py: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: 1, borderTop: `1px solid ${DASH.line}`,
                        }}>
                            <Typography sx={{ fontSize: 11.5, color: DASH.muted }}>
                                Showing <strong style={{ color: DASH.text }}>
                                    {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filteredActivity.length)}
                                </strong> of <strong style={{ color: DASH.text }}>{filteredActivity.length}</strong> records
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
                                        bgcolor: `${DASH.primary} !important`,
                                        color: '#fff !important',
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Panel>
                </>)}
            </Box>
        </Box>
    );
}
