import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    IconButton,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { leaveApprovalStatusCheck, updateLeaveApprovalAction } from '../../Api/Api';
import SnackBar from '../SnackBar';

// Leave type chip config
const LEAVE_TYPE_CONFIG = {
    'Casual Leave':    { bg: '#DBEAFE', color: '#3B82F6' },
    'Sick Leave':      { bg: '#FEE2E2', color: '#DC2626' },
    'Planned Leave':   { bg: '#DCFCE7', color: '#22C55E' },
    'Emergency Leave': { bg: '#FED7AA', color: '#F97316' },
    'Maternity Leave': { bg: '#EDE9FE', color: '#7C3AED' },
    'Annual Leave':    { bg: '#E0F7FA', color: '#0891B2' },
};

const token = "123";

const AVATAR_COLORS = ['#1976D2', '#7C3AED', '#0891B2', '#EA580C', '#16A34A', '#DC2626', '#F97316', '#059669'];
const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// Format ISO date string → "Feb 17, 2026"
const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ApprovalWorkflowPage({ isEmbedded = false }) {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber;
    const [approvalTab, setApprovalTab] = useState(0);
    const [decisions, setDecisions] = useState({});   // local approve/reject before API call
    const [search, setSearch] = useState('');
    const [leaves, setLeaves] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    // SnackBar
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const showSnack = (msg, success) => {
        setMessage(msg); setOpen(true); setColor(success); setStatus(success);
    };

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

    const [actionLoading, setActionLoading] = useState({});  // { [leaveApplicationId]: true/false }

    // View rejection reason dialog
    const [viewReasonDialog, setViewReasonDialog] = useState({ open: false, reason: '' });

    // Reject reason dialog
    const [rejectDialog, setRejectDialog] = useState({ open: false, leaveApplicationId: null });
    const [rejectReason, setRejectReason] = useState('');
    const [rejectLoading, setRejectLoading] = useState(false);

    const openRejectDialog = (leaveApplicationId) => {
        setRejectReason('');
        setRejectDialog({ open: true, leaveApplicationId });
    };

    const closeRejectDialog = () => {
        setRejectDialog({ open: false, leaveApplicationId: null });
        setRejectReason('');
    };

    const handleDecision = async (leaveApplicationId, decision, reason = '') => {
        // decision: 'approved' | 'rejected'
        const action = decision === 'approved' ? 'accept' : 'decline';
        setActionLoading(prev => ({ ...prev, [leaveApplicationId]: true }));
        try {
            const params = {
                leaveApplicationId,
                RollNumber: rollNumber,
                Action: action,
            };
            if (decision === 'rejected' && reason) {
                params.Reason = reason;
            }
            await axios.put(updateLeaveApprovalAction, null, {
                params,
                headers: { Authorization: `Bearer ${token}` },
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

    const handleRejectSubmit = async () => {
        setRejectLoading(true);
        await handleDecision(rejectDialog.leaveApplicationId, 'rejected', rejectReason);
        setRejectLoading(false);
        closeRejectDialog();
    };

    // Merge API status with local decisions
    // API statuses: "Requested" | "Approved" | "Declined"
    const getEffectiveStatus = (leave) => {
        const local = decisions[leave.leaveApplicationId];
        if (local === 'approved') return 'Approved';
        if (local === 'rejected') return 'Declined';
        return leave.status;
    };

    const pendingCount  = leaves.filter(l => getEffectiveStatus(l) === 'Requested').length;
    const approvedCount = leaves.filter(l => getEffectiveStatus(l) === 'Approved').length;
    const rejectedCount = leaves.filter(l => getEffectiveStatus(l) === 'Declined').length;

    const baseFiltered = {
        0: leaves.filter(l => getEffectiveStatus(l) === 'Requested'),
        1: leaves.filter(l => getEffectiveStatus(l) === 'Approved'),
        2: leaves.filter(l => getEffectiveStatus(l) === 'Declined'),
    }[approvalTab] || [];

    const filtered = search.trim()
        ? baseFiltered.filter(l =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.leaveType.toLowerCase().includes(search.toLowerCase()) ||
            l.reason.toLowerCase().includes(search.toLowerCase())
          )
        : baseFiltered;

    const getLeaveTypeChip = (type) => {
        const cfg = LEAVE_TYPE_CONFIG[type] || { bg: '#F3F4F6', color: '#666' };
        return (
            <Chip label={type} size="small"
                sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: '600', fontSize: '11px', borderRadius: '6px' }} />
        );
    };

    const getPriorityChip = (priority) => {
        const cfg = priority === 'High'
            ? { bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626' }
            : { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A' };
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: cfg.dot }} />
                <Typography sx={{ fontSize: '12px', fontWeight: '600', color: cfg.color }}>{priority}</Typography>
            </Box>
        );
    };

    const summaryCards = [
        { label: 'Pending',  value: pendingCount,  border: '#F97316', bg: '#FFF7ED', iconBg: '#FED7AA40', color: '#F97316', Icon: PendingIcon },
        { label: 'Approved', value: approvedCount, border: '#22C55E', bg: '#F0FDF4', iconBg: '#DCFCE740', color: '#22C55E', Icon: CheckCircleIcon },
        { label: 'Rejected', value: rejectedCount, border: '#DC2626', bg: '#FEF2F2', iconBg: '#FEE2E240', color: '#DC2626', Icon: CancelIcon },
    ];

    const emptyLabel = ['pending', 'approved', 'rejected'][approvalTab];

    return (
        <>
        <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
        <Box sx={{
            border: isEmbedded ? 'none' : '1px solid #ccc',
            borderRadius: isEmbedded ? '0' : '20px',
            p: isEmbedded ? 1 : 2,
            height: isEmbedded ? 'auto' : '86vh',
            overflow: 'auto',
            bgcolor: '#F8F9FB',
        }}>

            {/* Header — standalone only */}
            {!isEmbedded && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: 35, height: 35 }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>
                            Leave Approval
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: '#888' }}>
                            Review and approve pending leave applications
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {summaryCards.map(c => (
                    <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }} key={c.label}>
                        <Card sx={{
                            border: `1.5px solid ${c.border}20`,
                            borderLeft: `4px solid ${c.border}`,
                            borderRadius: '10px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            bgcolor: c.bg,
                        }}>
                            <CardContent sx={{ py: '14px !important', px: '16px !important' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                                            {c.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: '32px', fontWeight: '800', color: '#1a1a1a', lineHeight: 1 }}>
                                            {c.value}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#aaa', mt: 0.5 }}>applications</Typography>
                                    </Box>
                                    <Box sx={{
                                        width: 48, height: 48, borderRadius: '12px',
                                        bgcolor: c.iconBg,
                                        border: `1px solid ${c.border}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <c.Icon sx={{ color: c.color, fontSize: 26 }} />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Main Table Card */}
            <Card sx={{
                border: '1px solid #E8ECF0',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                bgcolor: '#fff',
            }}>
                {/* Card Header */}
                <Box sx={{ px: 2.5, pt: 2, pb: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box>
                            <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                                Leave Applications
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#888', mt: 0.3 }}>
                                {pendingCount} request{pendingCount !== 1 ? 's' : ''} awaiting your review
                            </Typography>
                        </Box>
                        {/* Search */}
                        <TextField
                            size="small"
                            placeholder="Search by name, dept, leave type..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            sx={{
                                width: { xs: '100%', sm: '280px' },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    bgcolor: '#F8F9FB',
                                }
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: '#aaa' }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Box>

                    {/* Sub-tabs */}
                    <Tabs
                        value={approvalTab}
                        onChange={(_, v) => setApprovalTab(v)}
                        sx={{
                            mt: 1.5,
                            '& .MuiTab-root': {
                                textTransform: 'none', fontSize: '13px', fontWeight: '600',
                                color: '#888', minHeight: '40px', px: 2.5, pb: 1,
                            },
                            '& .Mui-selected': { color: '#F97316 !important' },
                            '& .MuiTabs-indicator': { backgroundColor: '#F97316', height: '2.5px', borderRadius: '2px' }
                        }}
                    >
                        <Tab label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                Pending
                                <Box sx={{
                                    minWidth: 20, height: 20, borderRadius: '10px', px: 0.8,
                                    bgcolor: approvalTab === 0 ? '#F97316' : '#F0F0F0',
                                    color: approvalTab === 0 ? '#fff' : '#666',
                                    fontSize: '11px', fontWeight: '700',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {pendingCount}
                                </Box>
                            </Box>
                        } />
                        <Tab label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                Approved
                                <Box sx={{
                                    minWidth: 20, height: 20, borderRadius: '10px', px: 0.8,
                                    bgcolor: approvalTab === 1 ? '#22C55E' : '#F0F0F0',
                                    color: approvalTab === 1 ? '#fff' : '#666',
                                    fontSize: '11px', fontWeight: '700',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {approvedCount}
                                </Box>
                            </Box>
                        } />
                        <Tab label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                Rejected
                                <Box sx={{
                                    minWidth: 20, height: 20, borderRadius: '10px', px: 0.8,
                                    bgcolor: approvalTab === 2 ? '#DC2626' : '#F0F0F0',
                                    color: approvalTab === 2 ? '#fff' : '#666',
                                    fontSize: '11px', fontWeight: '700',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {rejectedCount}
                                </Box>
                            </Box>
                        } />
                    </Tabs>
                </Box>

                <Divider />

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F8F9FB' }}>
                                {['Staff Member', 'Leave Type', 'Duration', 'Days', 'Reason', 'Applied On', 'Action'].map(h => (
                                    <TableCell key={h} sx={{
                                        fontWeight: '700', fontSize: '11px', color: '#888',
                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                        whiteSpace: 'nowrap', py: 1.5, borderBottom: '1px solid #E8ECF0',
                                    }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isFetching ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={28} sx={{ color: '#F97316' }} />
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{
                                                width: 56, height: 56, borderRadius: '50%', bgcolor: '#F3F4F6',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1
                                            }}>
                                                <CalendarTodayIcon sx={{ fontSize: 28, color: '#ccc' }} />
                                            </Box>
                                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>
                                                No {emptyLabel} applications
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#aaa' }}>
                                                {approvalTab === 0
                                                    ? 'All leave requests have been reviewed.'
                                                    : `No applications have been ${emptyLabel} yet.`}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((req, idx) => (
                                    <TableRow key={req.leaveApplicationId} sx={{
                                        borderBottom: idx !== filtered.length - 1 ? '1px solid #F0F3F6' : 'none',
                                        '&:hover': { bgcolor: '#FAFBFC' },
                                        transition: '0.15s',
                                    }}>
                                        {/* Staff Member */}
                                        <TableCell sx={{ py: 1.8 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 38, height: 38,
                                                    bgcolor: getAvatarColor(req.leaveApplicationId),
                                                    fontSize: '13px', fontWeight: '700',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                                                }}>
                                                    {getInitials(req.name)}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                        {req.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#aaa', mt: 0.2 }}>
                                                        {req.forRollNumber}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {/* Leave Type */}
                                        <TableCell>{getLeaveTypeChip(req.leaveType)}</TableCell>

                                        {/* Duration */}
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 13, color: '#aaa' }} />
                                                <Box>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                                                        {formatDate(req.fromDate)}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#aaa', whiteSpace: 'nowrap' }}>
                                                        to {formatDate(req.toDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {/* Days */}
                                        <TableCell>
                                            <Box sx={{
                                                display: 'inline-flex', alignItems: 'baseline', gap: 0.4,
                                                bgcolor: '#F3F4F6', borderRadius: '6px', px: 1, py: 0.4,
                                            }}>
                                                <Typography sx={{ fontSize: '14px', fontWeight: '800', color: '#1a1a1a' }}>
                                                    {req.duration}
                                                </Typography>
                                                <Typography sx={{ fontSize: '10px', color: '#888', fontWeight: '500' }}>
                                                    day{req.duration > 1 ? 's' : ''}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        {/* Reason */}
                                        <TableCell>
                                            <Tooltip
                                                title={req.reason}
                                                placement="top"
                                                arrow
                                                slotProps={{
                                                    tooltip: {
                                                        sx: {
                                                            fontSize: '12px',
                                                            maxWidth: '280px',
                                                            bgcolor: '#1a1a1a',
                                                            lineHeight: 1.7,
                                                            p: 1.2,
                                                        }
                                                    }
                                                }}
                                            >
                                                <Typography sx={{
                                                    fontSize: '12px',
                                                    color: '#555',
                                                    maxWidth: '200px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'default',
                                                    '&:hover': { color: '#1976D2' },
                                                    transition: '0.15s',
                                                }}>
                                                    {req.reason}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>

                                        {/* Applied On */}
                                        <TableCell>
                                            <Typography sx={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>
                                                {formatDate(req.createdOn)}
                                            </Typography>
                                        </TableCell>

                                        {/* Action */}
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {getEffectiveStatus(req) === 'Requested' ? (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        disabled={!!actionLoading[req.leaveApplicationId]}
                                                        startIcon={actionLoading[req.leaveApplicationId]
                                                            ? <CircularProgress size={12} color="inherit" />
                                                            : <CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                                                        onClick={() => handleDecision(req.leaveApplicationId, 'approved')}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            bgcolor: '#22C55E',
                                                            borderRadius: '7px',
                                                            px: 1.5,
                                                            boxShadow: 'none',
                                                            '&:hover': { bgcolor: '#16A34A', boxShadow: 'none' },
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
                                                            textTransform: 'none',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: '#DC2626',
                                                            borderColor: '#DC262640',
                                                            borderRadius: '7px',
                                                            px: 1.5,
                                                            bgcolor: '#FEF2F2',
                                                            '&:hover': { borderColor: '#DC2626', bgcolor: '#FEE2E2' },
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: 'flex-start' }}>
                                                    <Chip
                                                        label={getEffectiveStatus(req) === 'Approved' ? 'Approved' : 'Rejected'}
                                                        size="small"
                                                        icon={getEffectiveStatus(req) === 'Approved'
                                                            ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} />
                                                            : <CancelIcon sx={{ fontSize: '14px !important' }} />
                                                        }
                                                        sx={{
                                                            bgcolor: getEffectiveStatus(req) === 'Approved' ? '#DCFCE7' : '#FEE2E2',
                                                            color:   getEffectiveStatus(req) === 'Approved' ? '#16A34A' : '#DC2626',
                                                            fontWeight: '700',
                                                            fontSize: '11px',
                                                            borderRadius: '6px',
                                                            '& .MuiChip-icon': { fontSize: 13, color: 'inherit' },
                                                        }}
                                                    />
                                                    {getEffectiveStatus(req) === 'Declined' && req.rejectionReason && (
                                                        <Button
                                                            size="small"
                                                            onClick={() => setViewReasonDialog({ open: true, reason: req.rejectionReason })}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                color: '#DC2626',
                                                                p: 0,
                                                                minWidth: 0,
                                                                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                                                            }}
                                                        >
                                                            View Reason
                                                        </Button>
                                                    )}
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer */}
                {filtered.length > 0 && (
                    <Box sx={{
                        px: 2.5, py: 1.5,
                        borderTop: '1px solid #F0F3F6',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <Typography sx={{ fontSize: '12px', color: '#aaa' }}>
                            Showing {filtered.length} of {baseFiltered.length} application{baseFiltered.length !== 1 ? 's' : ''}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#aaa' }}>
                            {pendingCount} pending review
                        </Typography>
                    </Box>
                )}
            </Card>
        </Box>

        {/* View Rejection Reason Dialog */}
        <Dialog
            open={viewReasonDialog.open}
            onClose={() => setViewReasonDialog({ open: false, reason: '' })}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: '12px' } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '8px',
                        bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CancelIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                            Rejection Reason
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#888', fontWeight: '400' }}>
                            Reason provided for declining this leave
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: '12px !important' }}>
                <Box sx={{
                    bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                    borderRadius: '8px', p: 2,
                }}>
                    <Typography sx={{ fontSize: '13px', color: '#333', lineHeight: 1.7 }}>
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
                        bgcolor: '#DC2626', fontWeight: '600', fontSize: '13px',
                        px: 3, boxShadow: 'none',
                        '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>

        {/* Reject Reason Dialog */}
        <Dialog
            open={rejectDialog.open}
            onClose={closeRejectDialog}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: '12px' } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '8px',
                        bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CancelIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                            Reject Leave
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#888', fontWeight: '400' }}>
                            Please provide a reason for rejection
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: '12px !important' }}>
                <TextField
                    autoFocus
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            fontSize: '13px',
                            '&.Mui-focused fieldset': { borderColor: '#DC2626' },
                        },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button
                    onClick={closeRejectDialog}
                    disabled={rejectLoading}
                    sx={{
                        textTransform: 'none', borderRadius: '8px',
                        color: '#555', fontWeight: '600', fontSize: '13px',
                        border: '1px solid #E0E0E0', px: 2.5,
                        '&:hover': { bgcolor: '#F5F5F5' },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleRejectSubmit}
                    disabled={!rejectReason.trim() || rejectLoading}
                    variant="contained"
                    startIcon={rejectLoading
                        ? <CircularProgress size={14} color="inherit" />
                        : <CancelIcon sx={{ fontSize: '16px !important' }} />}
                    sx={{
                        textTransform: 'none', borderRadius: '8px',
                        bgcolor: '#DC2626', fontWeight: '600', fontSize: '13px',
                        px: 2.5, boxShadow: 'none',
                        '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
                        '&:disabled': { bgcolor: '#FECACA', color: '#fff' },
                    }}
                >
                    {rejectLoading ? 'Rejecting...' : 'Reject Leave'}
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
}
