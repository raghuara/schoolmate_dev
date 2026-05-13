import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Grid, Typography, IconButton, Button, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, TextField, InputAdornment, CircularProgress, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { leaveApprovalStatusCheck, updateLeaveApprovalAction } from '../../Api/Api';
import SnackBar from '../SnackBar';

const token = "123";

// ─── Theme (matches other Leave & Attendance tabs) ─────────────────────────
const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#ECFDF5';
const PRIMARY_DARK = '#047857';
const PRIMARY_BORDER = '#A7F3D0';

// ─── Style maps ────────────────────────────────────────────────────────────
const LEAVE_TYPE_STYLE = {
    'Casual Leave':    { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    'Sick Leave':      { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
    'Planned Leave':   { color: '#16A34A', bg: '#F0FDF4', border: '#A7F3D0' },
    'Emergency Leave': { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
    'Maternity Leave': { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    'Annual Leave':    { color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
};

const AVATAR_PALETTE = ['#0E7490', '#6D28D9', '#C2410C', '#047857', '#1D4ED8', '#BE185D', '#A16207', '#0F766E'];
const avatarColorFor = (name = '') => {
    const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
    return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
};

const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// ─── Date helpers ──────────────────────────────────────────────────────────
const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getRelativeTime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0) return '';
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
};

const getDaysUntil = (isoStr) => {
    if (!isoStr) return null;
    const d = new Date(isoStr);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((d - today) / (1000 * 60 * 60 * 24));
};

const QUICK_REJECT_REASONS = [
    'Insufficient notice period',
    'Critical work period — please reschedule',
    'Documentation not provided',
    'Already covered by another leave',
    'Conflicting with team schedule',
];

// ─── Sub-tab config ────────────────────────────────────────────────────────
const SUB_TABS = [
    { key: 'pending',  label: 'Pending',  apiStatus: 'Requested', icon: PendingIcon,      color: '#D97706' },
    { key: 'approved', label: 'Approved', apiStatus: 'Approved',  icon: CheckCircleIcon,  color: PRIMARY   },
    { key: 'rejected', label: 'Rejected', apiStatus: 'Declined',  icon: CancelIcon,       color: '#DC2626' },
];

export default function ApprovalWorkflowPage({ isEmbedded = false }) {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;

    // ─── State ──────────────────────────────────────────────────────────────
    const [approvalTab, setApprovalTab] = useState(0);
    const [decisions, setDecisions] = useState({});
    const [search, setSearch] = useState('');
    const [leaves, setLeaves] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    // Reject dialog
    const [rejectDialog, setRejectDialog] = useState({ open: false, leaveApplicationId: null });
    const [rejectReason, setRejectReason] = useState('');
    const [rejectLoading, setRejectLoading] = useState(false);

    // View rejection reason
    const [viewReasonDialog, setViewReasonDialog] = useState({ open: false, reason: '' });

    // SnackBar
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const showSnack = (msg, success) => {
        setMessage(msg); setOpen(true); setColor(success); setStatus(success);
    };

    // ─── Fetch ─────────────────────────────────────────────────────────────
    const fetchLeaves = async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(leaveApprovalStatusCheck, {
                params: { RollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data && res.data.success) {
                setLeaves(res.data.leaves || []);
            }
        } catch (error) {
            console.error('Error fetching leave approval status:', error);
            showSnack('Failed to load leave applications', false);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    // ─── Status helpers ────────────────────────────────────────────────────
    const getEffectiveStatus = (leave) => {
        const local = decisions[leave.leaveApplicationId];
        if (local === 'approved') return 'Approved';
        if (local === 'rejected') return 'Declined';
        return leave.status;
    };

    const pendingCount  = leaves.filter(l => getEffectiveStatus(l) === 'Requested').length;
    const approvedCount = leaves.filter(l => getEffectiveStatus(l) === 'Approved').length;
    const rejectedCount = leaves.filter(l => getEffectiveStatus(l) === 'Declined').length;
    const totalApplications = pendingCount + approvedCount + rejectedCount;
    const subTabCounts = { pending: pendingCount, approved: approvedCount, rejected: rejectedCount };

    const activeApiStatus = SUB_TABS[approvalTab].apiStatus;
    const baseFiltered = leaves.filter(l => getEffectiveStatus(l) === activeApiStatus);

    const q = search.trim().toLowerCase();
    const filtered = q
        ? baseFiltered.filter(l =>
            (l.name || '').toLowerCase().includes(q) ||
            (l.leaveType || '').toLowerCase().includes(q) ||
            (l.reason || '').toLowerCase().includes(q)
          )
        : baseFiltered;

    // ─── Actions ───────────────────────────────────────────────────────────
    const handleDecision = async (leaveApplicationId, decision, reason = '') => {
        const action = decision === 'approved' ? 'accept' : 'decline';
        setActionLoading(prev => ({ ...prev, [leaveApplicationId]: true }));
        try {
            const params = { leaveApplicationId, RollNumber: rollNumber, Action: action };
            if (decision === 'rejected' && reason) params.Reason = reason;
            await axios.put(updateLeaveApprovalAction, null, {
                params, headers: { Authorization: `Bearer ${token}` },
            });
            setDecisions(prev => ({ ...prev, [leaveApplicationId]: decision }));
            showSnack(decision === 'approved' ? 'Leave approved successfully' : 'Leave rejected successfully', true);
        } catch (error) {
            console.error('Error updating leave action:', error);
            showSnack('Failed to update leave status', false);
        } finally {
            setActionLoading(prev => ({ ...prev, [leaveApplicationId]: false }));
        }
    };

    const openRejectDialog = (leaveApplicationId) => {
        setRejectReason('');
        setRejectDialog({ open: true, leaveApplicationId });
    };
    const closeRejectDialog = () => {
        setRejectDialog({ open: false, leaveApplicationId: null });
        setRejectReason('');
    };
    const handleRejectSubmit = async () => {
        setRejectLoading(true);
        await handleDecision(rejectDialog.leaveApplicationId, 'rejected', rejectReason);
        setRejectLoading(false);
        closeRejectDialog();
    };

    // ─── Leave type chip ───────────────────────────────────────────────────
    const renderLeaveTypeChip = (type) => {
        const cfg = LEAVE_TYPE_STYLE[type] || { color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' };
        return (
            <Chip label={type} size="small" sx={{
                bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                fontWeight: 600, fontSize: '10.5px', height: 22,
            }} />
        );
    };

    // ─── KPI cards ─────────────────────────────────────────────────────────
    const kpiCards = [
        { label: 'Pending Review', value: pendingCount,  sub: 'Awaiting your action', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: PendingIcon },
        { label: 'Approved',       value: approvedCount, sub: totalApplications > 0 ? `${Math.round((approvedCount / totalApplications) * 100)}% of total` : '—', color: PRIMARY, bg: PRIMARY_LIGHT, border: PRIMARY_BORDER, icon: CheckCircleIcon },
        { label: 'Rejected',       value: rejectedCount, sub: totalApplications > 0 ? `${Math.round((rejectedCount / totalApplications) * 100)}% of total` : '—', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: CancelIcon },
    ];

    return (
        <>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <Box sx={{
                border: isEmbedded ? 'none' : '1px solid #E5E7EB',
                borderRadius: isEmbedded ? '0' : '20px',
                p: isEmbedded ? 0 : 2,
                bgcolor: isEmbedded ? 'transparent' : '#F9FAFB',
                height: isEmbedded ? 'auto' : '86vh',
                overflow: isEmbedded ? 'visible' : 'auto',
            }}>
                {/* Standalone Header */}
                {!isEmbedded && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: 32, height: 32 }}>
                            <ArrowBackIcon sx={{ fontSize: 18, color: '#000' }} />
                        </IconButton>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FactCheckOutlinedIcon sx={{ color: PRIMARY, fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
                                Leave Approval
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
                                Review and approve pending leave applications
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* ─── KPI Cards (3) ─── */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {kpiCards.map((c) => {
                        const Icon = c.icon;
                        return (
                            <Grid size={{ xs: 12, sm: 4 }} key={c.label}>
                                <Card sx={{
                                    border: `1px solid ${c.border}`,
                                    borderRadius: '12px', boxShadow: 'none',
                                    bgcolor: c.bg, height: '100%',
                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 16px ${c.color}22` },
                                }}>
                                    <CardContent sx={{ py: 1.8, '&:last-child': { pb: 1.8 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography sx={{ fontSize: '11px', color: c.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    {c.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.2, mt: 0.5 }}>
                                                    {c.value}
                                                </Typography>
                                                <Typography sx={{ fontSize: '10px', color: c.color, fontWeight: 600, mt: 0.4 }}>
                                                    {c.sub}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                width: 38, height: 38, borderRadius: '10px',
                                                bgcolor: '#fff', border: `1px solid ${c.border}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <Icon sx={{ color: c.color, fontSize: 20 }} />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* ─── Approval Requests Card ─── */}
                <Card sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: 'none', bgcolor: '#fff' }}>
                    <CardContent sx={{ pb: '12px !important' }}>
                        {/* Title row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                                    Approval Requests
                                </Typography>
                                <Chip
                                    label={`${baseFiltered.length} ${SUB_TABS[approvalTab].label.toLowerCase()}`}
                                    size="small"
                                    sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 600, fontSize: '11px', height: 20 }}
                                />
                            </Box>
                            <Tooltip title="Refresh" arrow>
                                <IconButton
                                    onClick={fetchLeaves}
                                    disabled={isFetching}
                                    sx={{
                                        width: 34, height: 34, borderRadius: '8px',
                                        border: `1px solid ${PRIMARY_BORDER}`, bgcolor: PRIMARY_LIGHT,
                                        '&:hover': { bgcolor: '#DCFCE7', borderColor: PRIMARY },
                                    }}
                                >
                                    {isFetching
                                        ? <CircularProgress size={16} sx={{ color: PRIMARY }} />
                                        : <RefreshIcon sx={{ fontSize: 18, color: PRIMARY_DARK }} />}
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Sub-tabs (segmented pill control) */}
                        <Box sx={{
                            display: 'flex', gap: 0.6, mb: 1.5,
                            p: 0.4, borderRadius: '10px',
                            bgcolor: '#F3F4F6', border: '1px solid #E5E7EB',
                            width: 'fit-content', flexWrap: 'wrap',
                        }}>
                            {SUB_TABS.map((t, idx) => {
                                const Icon = t.icon;
                                const active = approvalTab === idx;
                                const count = subTabCounts[t.key] || 0;
                                return (
                                    <Box
                                        key={t.key}
                                        onClick={() => setApprovalTab(idx)}
                                        sx={{
                                            px: 1.4, py: 0.6, borderRadius: '8px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 0.7,
                                            transition: 'all 0.15s',
                                            bgcolor: active ? '#fff' : 'transparent',
                                            boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
                                            '&:hover': { bgcolor: active ? '#fff' : 'rgba(255,255,255,0.55)' },
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 14, color: active ? t.color : '#9CA3AF' }} />
                                        <Typography sx={{
                                            fontSize: '12px',
                                            fontWeight: active ? 700 : 600,
                                            color: active ? t.color : '#6B7280',
                                        }}>
                                            {t.label}
                                        </Typography>
                                        <Box sx={{
                                            px: 0.7, py: 0.05, borderRadius: '8px', minWidth: 18, textAlign: 'center',
                                            bgcolor: active ? `${t.color}15` : '#fff',
                                            border: `1px solid ${active ? `${t.color}30` : '#E5E7EB'}`,
                                        }}>
                                            <Typography sx={{ fontSize: '10px', fontWeight: 800, color: active ? t.color : '#9CA3AF' }}>
                                                {count}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Filter toolbar */}
                        <Box sx={{
                            p: 1.2, mb: 1.5, borderRadius: '10px',
                            border: '1px solid #E5E7EB', bgcolor: '#FAFAFA',
                            display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center',
                        }}>
                            <TextField
                                size="small"
                                placeholder="Search by name, leave type, reason..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 16, color: search ? PRIMARY : '#9CA3AF' }} />
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
                                    flex: 1, minWidth: 240, maxWidth: 360,
                                    '& .MuiOutlinedInput-root': {
                                        height: 34, fontSize: '12.5px', borderRadius: '8px',
                                        bgcolor: search ? PRIMARY_LIGHT : '#fff',
                                        '& fieldset': { borderColor: search ? PRIMARY_BORDER : '#E5E7EB' },
                                        '&:hover fieldset': { borderColor: '#D1D5DB' },
                                        '&.Mui-focused fieldset': { borderColor: PRIMARY },
                                    },
                                }}
                            />

                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                <Typography sx={{ fontSize: '11.5px', color: '#6B7280' }}>Showing</Typography>
                                <Typography sx={{ fontSize: '13px', fontWeight: 800, color: search ? PRIMARY_DARK : '#111827' }}>
                                    {filtered.length}
                                </Typography>
                                <Typography sx={{ fontSize: '11.5px', color: '#6B7280' }}>
                                    of {baseFiltered.length}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Table */}
                        <TableContainer sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: PRIMARY_LIGHT, borderBottom: `1px solid ${PRIMARY_BORDER}` }}>
                                        {['Staff Member', 'Leave Type', 'Duration', 'Days', 'Reason', 'Applied On', 'Action'].map(h => (
                                            <TableCell key={h} sx={{
                                                fontWeight: 700, fontSize: '10px', color: PRIMARY_DARK,
                                                textTransform: 'uppercase', whiteSpace: 'nowrap',
                                                letterSpacing: 0.6, py: 1.3, borderBottom: 'none',
                                            }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isFetching ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                                                <CircularProgress size={28} sx={{ color: PRIMARY }} />
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8 }}>
                                                    {(() => {
                                                        const t = SUB_TABS[approvalTab];
                                                        const Icon = t.icon;
                                                        return (
                                                            <Box sx={{
                                                                width: 56, height: 56, borderRadius: '50%',
                                                                bgcolor: `${t.color}15`, border: `2px solid ${t.color}40`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}>
                                                                <Icon sx={{ fontSize: 28, color: t.color }} />
                                                            </Box>
                                                        );
                                                    })()}
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>
                                                        {search ? 'No matching applications' : `No ${SUB_TABS[approvalTab].label.toLowerCase()} applications`}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11.5px', color: '#9CA3AF', textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
                                                        {search
                                                            ? 'Try clearing the search or switching to a different tab.'
                                                            : approvalTab === 0
                                                                ? "All caught up — no pending requests waiting for your review."
                                                                : `Nothing has been ${SUB_TABS[approvalTab].label.toLowerCase()} yet for this period.`}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                        {search && (
                                                            <Button
                                                                size="small"
                                                                onClick={() => setSearch('')}
                                                                sx={{
                                                                    textTransform: 'none', fontSize: '11.5px', fontWeight: 600,
                                                                    color: '#374151', borderRadius: '8px',
                                                                    border: '1px solid #E5E7EB', px: 1.6, height: 30,
                                                                    '&:hover': { bgcolor: '#F9FAFB' },
                                                                }}
                                                            >
                                                                Clear Search
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="small"
                                                            startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                                                            onClick={fetchLeaves}
                                                            sx={{
                                                                textTransform: 'none', fontSize: '11.5px', fontWeight: 700,
                                                                color: PRIMARY_DARK, borderRadius: '8px',
                                                                border: `1px solid ${PRIMARY_BORDER}`, px: 1.6, height: 30,
                                                                bgcolor: PRIMARY_LIGHT,
                                                                '&:hover': { bgcolor: '#DCFCE7', borderColor: PRIMARY },
                                                            }}
                                                        >
                                                            Refresh
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map((req, idx) => {
                                        const effectiveStatus = getEffectiveStatus(req);
                                        const daysUntil = getDaysUntil(req.fromDate);
                                        const isPending = effectiveStatus === 'Requested';
                                        const isUrgent = isPending && daysUntil !== null && daysUntil >= 0 && daysUntil <= 3;
                                        const startsTodayOrTomorrow = daysUntil === 0 || daysUntil === 1;
                                        const avColor = avatarColorFor(req.name || '');

                                        return (
                                            <TableRow key={req.leaveApplicationId} sx={{
                                                '&:hover': { bgcolor: PRIMARY_LIGHT },
                                                borderBottom: '1px solid #F3F4F6',
                                                transition: 'background-color 0.15s',
                                            }}>
                                                {/* Staff Member */}
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                        <Avatar sx={{
                                                            width: 34, height: 34,
                                                            bgcolor: `${avColor}15`, color: avColor,
                                                            fontSize: '11px', fontWeight: 700,
                                                            border: `1px solid ${avColor}33`,
                                                        }}>
                                                            {getInitials(req.name)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                                                                {req.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, fontFamily: 'monospace' }}>
                                                                {req.forRollNumber}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Leave Type */}
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    {renderLeaveTypeChip(req.leaveType)}
                                                </TableCell>

                                                {/* Duration + urgency */}
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 13, color: isUrgent ? '#DC2626' : '#9CA3AF', mt: 0.2 }} />
                                                        <Box>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                                                                {formatDate(req.fromDate)}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10.5px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                                                                to {formatDate(req.toDate)}
                                                            </Typography>
                                                            {isUrgent && (
                                                                <Box sx={{
                                                                    mt: 0.5, display: 'inline-flex', alignItems: 'center', gap: 0.3,
                                                                    px: 0.7, py: 0.1, borderRadius: '6px',
                                                                    bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                                                                }}>
                                                                    <PriorityHighIcon sx={{ fontSize: 11, color: '#DC2626' }} />
                                                                    <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#DC2626', letterSpacing: 0.3 }}>
                                                                        {startsTodayOrTomorrow
                                                                            ? (daysUntil === 0 ? 'STARTS TODAY' : 'STARTS TOMORROW')
                                                                            : `IN ${daysUntil} DAYS`}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Days */}
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Box sx={{
                                                        display: 'inline-flex', alignItems: 'baseline', gap: 0.4,
                                                        px: 0.8, py: 0.2, borderRadius: '6px',
                                                        bgcolor: '#EEF2FF', border: '1px solid #C7D2FE',
                                                    }}>
                                                        <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#4338CA', fontFamily: 'monospace' }}>
                                                            {req.duration}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '10px', color: '#4338CA', fontWeight: 600 }}>
                                                            {req.duration > 1 ? 'days' : 'day'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                {/* Reason */}
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6', maxWidth: 200 }}>
                                                    <Tooltip title={req.reason || ''} placement="top" arrow>
                                                        <Typography sx={{
                                                            fontSize: '12px', color: '#4B5563',
                                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap', maxWidth: 200,
                                                        }}>
                                                            {req.reason || '—'}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>

                                                {/* Applied On */}
                                                <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                                                        {formatDate(req.createdOn)}
                                                    </Typography>
                                                    {req.createdOn && (
                                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                                                            <AccessTimeIcon sx={{ fontSize: 10, color: '#9CA3AF' }} />
                                                            <Typography sx={{ fontSize: '10px', color: '#9CA3AF' }}>
                                                                {getRelativeTime(req.createdOn)}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </TableCell>

                                                {/* Action */}
                                                <TableCell sx={{ whiteSpace: 'nowrap', borderBottom: '1px solid #F3F4F6' }}>
                                                    {effectiveStatus === 'Requested' ? (
                                                        <Box sx={{ display: 'flex', gap: 0.8 }}>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                disabled={!!actionLoading[req.leaveApplicationId]}
                                                                startIcon={actionLoading[req.leaveApplicationId]
                                                                    ? <CircularProgress size={12} color="inherit" />
                                                                    : <CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                                                                onClick={() => handleDecision(req.leaveApplicationId, 'approved')}
                                                                sx={{
                                                                    textTransform: 'none', fontSize: '11.5px', fontWeight: 700,
                                                                    bgcolor: PRIMARY, color: '#fff',
                                                                    borderRadius: '8px', px: 1.5, height: 30,
                                                                    boxShadow: `0 2px 6px ${PRIMARY}33`,
                                                                    '&:hover': { bgcolor: PRIMARY_DARK, boxShadow: `0 4px 12px ${PRIMARY}55` },
                                                                    '&.Mui-disabled': { bgcolor: PRIMARY_BORDER, color: '#fff', boxShadow: 'none' },
                                                                }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                disabled={!!actionLoading[req.leaveApplicationId]}
                                                                startIcon={actionLoading[req.leaveApplicationId]
                                                                    ? <CircularProgress size={12} sx={{ color: '#DC2626' }} />
                                                                    : <CancelIcon sx={{ fontSize: '14px !important' }} />}
                                                                onClick={() => openRejectDialog(req.leaveApplicationId)}
                                                                sx={{
                                                                    textTransform: 'none', fontSize: '11.5px', fontWeight: 700,
                                                                    color: '#DC2626', borderColor: '#FECACA',
                                                                    bgcolor: '#FEF2F2', borderRadius: '8px',
                                                                    px: 1.5, height: 30,
                                                                    '&:hover': { borderColor: '#DC2626', bgcolor: '#FEE2E2' },
                                                                }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                                                            <Chip
                                                                label={effectiveStatus === 'Approved' ? 'Approved' : 'Rejected'}
                                                                size="small"
                                                                icon={effectiveStatus === 'Approved'
                                                                    ? <CheckCircleIcon sx={{ fontSize: '12px !important' }} />
                                                                    : <CancelIcon sx={{ fontSize: '12px !important' }} />}
                                                                sx={{
                                                                    bgcolor: effectiveStatus === 'Approved' ? PRIMARY_LIGHT : '#FEF2F2',
                                                                    color:   effectiveStatus === 'Approved' ? PRIMARY_DARK  : '#B91C1C',
                                                                    border: `1px solid ${effectiveStatus === 'Approved' ? PRIMARY_BORDER : '#FECACA'}`,
                                                                    fontWeight: 700, fontSize: '10.5px', height: 22,
                                                                    '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
                                                                }}
                                                            />
                                                            {effectiveStatus === 'Declined' && req.rejectionReason && (
                                                                <Button
                                                                    size="small"
                                                                    onClick={() => setViewReasonDialog({ open: true, reason: req.rejectionReason })}
                                                                    sx={{
                                                                        textTransform: 'none', fontSize: '10.5px', fontWeight: 600,
                                                                        color: '#DC2626', p: 0, minWidth: 0,
                                                                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                                                                    }}
                                                                >
                                                                    View reason
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* ── View Rejection Reason Dialog ── */}
            <Dialog
                open={viewReasonDialog.open}
                onClose={() => setViewReasonDialog({ open: false, reason: '' })}
                maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: '14px' } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CancelIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                                Rejection Reason
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
                                Reason provided for declining this leave
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: '12px !important' }}>
                    <Box sx={{
                        bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                        borderRadius: '10px', p: 1.8,
                    }}>
                        <Typography sx={{ fontSize: '13px', color: '#7F1D1D', lineHeight: 1.7 }}>
                            {viewReasonDialog.reason}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() => setViewReasonDialog({ open: false, reason: '' })}
                        variant="contained"
                        sx={{
                            textTransform: 'none', borderRadius: '8px',
                            bgcolor: '#DC2626', fontWeight: 700, fontSize: '12.5px',
                            px: 2.5, height: 34, boxShadow: 'none',
                            '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Reject Reason Dialog ── */}
            <Dialog
                open={rejectDialog.open}
                onClose={closeRejectDialog}
                maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: '14px' } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CancelIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                                Reject Leave
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
                                Please provide a reason for rejection
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: '12px !important' }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.8 }}>
                        Quick Reasons
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
                        {QUICK_REJECT_REASONS.map(r => {
                            const isSelected = rejectReason.trim() === r;
                            return (
                                <Chip
                                    key={r}
                                    label={r}
                                    size="small"
                                    onClick={() => setRejectReason(r)}
                                    sx={{
                                        fontSize: 11, fontWeight: 600, height: 24,
                                        borderRadius: '8px', cursor: 'pointer',
                                        bgcolor: isSelected ? '#FEE2E2' : '#F3F4F6',
                                        color:   isSelected ? '#991B1B' : '#374151',
                                        border: `1px solid ${isSelected ? '#FCA5A5' : '#E5E7EB'}`,
                                        '&:hover': { bgcolor: isSelected ? '#FEE2E2' : '#FEF2F2', borderColor: '#FCA5A5' },
                                    }}
                                />
                            );
                        })}
                    </Box>

                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.6 }}>
                        Custom Reason
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add details — this will be visible to the staff member"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value.slice(0, 250))}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px', fontSize: '12.5px',
                                '&.Mui-focused fieldset': { borderColor: '#DC2626' },
                            },
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>
                            Required — at least 5 characters
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: rejectReason.length > 230 ? '#DC2626' : '#9CA3AF', fontWeight: 600 }}>
                            {rejectReason.length}/250
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={closeRejectDialog}
                        disabled={rejectLoading}
                        sx={{
                            textTransform: 'none', borderRadius: '8px',
                            color: '#374151', fontWeight: 600, fontSize: '12.5px',
                            border: '1px solid #E5E7EB', px: 2, height: 34,
                            '&:hover': { bgcolor: '#F9FAFB' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRejectSubmit}
                        disabled={rejectReason.trim().length < 5 || rejectLoading}
                        variant="contained"
                        startIcon={rejectLoading
                            ? <CircularProgress size={14} color="inherit" />
                            : <CancelIcon sx={{ fontSize: '15px !important' }} />}
                        sx={{
                            textTransform: 'none', borderRadius: '8px',
                            bgcolor: '#DC2626', fontWeight: 700, fontSize: '12.5px',
                            px: 2.2, height: 34,
                            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                            '&:hover': { bgcolor: '#B91C1C', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)' },
                            '&:disabled': { bgcolor: '#FECACA', color: '#fff', boxShadow: 'none' },
                        }}
                    >
                        {rejectLoading ? 'Rejecting…' : 'Reject Leave'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
