import React, { useState } from 'react';
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
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';

// Leave type chip config
const LEAVE_TYPE_CONFIG = {
    'Casual Leave':    { bg: '#DBEAFE', color: '#3B82F6' },
    'Sick Leave':      { bg: '#FEE2E2', color: '#DC2626' },
    'Planned Leave':   { bg: '#DCFCE7', color: '#22C55E' },
    'Emergency Leave': { bg: '#FED7AA', color: '#F97316' },
    'Maternity Leave': { bg: '#EDE9FE', color: '#7C3AED' },
    'Annual Leave':    { bg: '#E0F7FA', color: '#0891B2' },
};

// Mock leave applications
const pendingLeaves = [
    {
        id: 1,
        name: 'David Ross',
        staffId: 'ST002',
        department: 'Marketing',
        avatar: 'DR',
        avatarColor: '#1976D2',
        leaveType: 'Casual Leave',
        startDate: 'Feb 15, 2026',
        endDate: 'Feb 16, 2026',
        days: 2,
        reason: 'Personal work — need to handle family matter out of town.',
        appliedOn: 'Feb 6, 2026',
        priority: 'Normal',
    },
    {
        id: 2,
        name: 'Emma Wilson',
        staffId: 'ST006',
        department: 'English',
        avatar: 'EW',
        avatarColor: '#7C3AED',
        leaveType: 'Sick Leave',
        startDate: 'Feb 18, 2026',
        endDate: 'Feb 19, 2026',
        days: 2,
        reason: 'Fever and doctor advised bed rest for two days.',
        appliedOn: 'Feb 7, 2026',
        priority: 'High',
    },
    {
        id: 3,
        name: 'Priya Sharma',
        staffId: 'ST005',
        department: 'Hindi',
        avatar: 'PS',
        avatarColor: '#0891B2',
        leaveType: 'Planned Leave',
        startDate: 'Feb 20, 2026',
        endDate: 'Feb 22, 2026',
        days: 3,
        reason: "Sister's wedding ceremony — prior approval requested.",
        appliedOn: 'Feb 8, 2026',
        priority: 'Normal',
    },
    {
        id: 4,
        name: 'Arjun Mehta',
        staffId: 'ST009',
        department: 'Mathematics',
        avatar: 'AM',
        avatarColor: '#EA580C',
        leaveType: 'Emergency Leave',
        startDate: 'Feb 21, 2026',
        endDate: 'Feb 21, 2026',
        days: 1,
        reason: 'Medical emergency at home, immediate attention required.',
        appliedOn: 'Feb 10, 2026',
        priority: 'High',
    },
    {
        id: 5,
        name: 'Nivetha Arjun',
        staffId: 'ST003',
        department: 'Science',
        avatar: 'NA',
        avatarColor: '#16A34A',
        leaveType: 'Annual Leave',
        startDate: 'Mar 1, 2026',
        endDate: 'Mar 5, 2026',
        days: 5,
        reason: 'Annual vacation planned well in advance, all work delegated.',
        appliedOn: 'Feb 9, 2026',
        priority: 'Normal',
    },
];

export default function ApprovalWorkflowPage({ isEmbedded = false }) {
    const navigate = useNavigate();
    const [approvalTab, setApprovalTab] = useState(0);
    const [decisions, setDecisions] = useState({});
    const [search, setSearch] = useState('');

    const handleDecision = (id, decision) => {
        setDecisions(prev => ({ ...prev, [id]: decision }));
    };

    const pendingCount  = pendingLeaves.filter(l => !decisions[l.id]).length;
    const approvedCount = pendingLeaves.filter(l => decisions[l.id] === 'approved').length;
    const rejectedCount = pendingLeaves.filter(l => decisions[l.id] === 'rejected').length;

    const baseFiltered = {
        0: pendingLeaves.filter(l => !decisions[l.id]),
        1: pendingLeaves.filter(l => decisions[l.id] === 'approved'),
        2: pendingLeaves.filter(l => decisions[l.id] === 'rejected'),
    }[approvalTab] || [];

    const filtered = search.trim()
        ? baseFiltered.filter(l =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.department.toLowerCase().includes(search.toLowerCase()) ||
            l.leaveType.toLowerCase().includes(search.toLowerCase())
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
                            {filtered.length === 0 ? (
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
                                    <TableRow key={req.id} sx={{
                                        borderBottom: idx !== filtered.length - 1 ? '1px solid #F0F3F6' : 'none',
                                        '&:hover': { bgcolor: '#FAFBFC' },
                                        transition: '0.15s',
                                    }}>
                                        {/* Staff Member */}
                                        <TableCell sx={{ py: 1.8 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 38, height: 38,
                                                    bgcolor: req.avatarColor,
                                                    fontSize: '13px', fontWeight: '700',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                                                }}>
                                                    {req.avatar}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                        {req.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#aaa', mt: 0.2 }}>
                                                        {req.staffId} · {req.department}
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
                                                        {req.startDate}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#aaa', whiteSpace: 'nowrap' }}>
                                                        to {req.endDate}
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
                                                    {req.days}
                                                </Typography>
                                                <Typography sx={{ fontSize: '10px', color: '#888', fontWeight: '500' }}>
                                                    day{req.days > 1 ? 's' : ''}
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
                                                {req.appliedOn}
                                            </Typography>
                                        </TableCell>

                                        {/* Action */}
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {approvalTab === 0 ? (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                                                        onClick={() => handleDecision(req.id, 'approved')}
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
                                                        startIcon={<CancelIcon sx={{ fontSize: '14px !important' }} />}
                                                        onClick={() => handleDecision(req.id, 'rejected')}
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
                                                <Chip
                                                    label={approvalTab === 1 ? 'Approved' : 'Rejected'}
                                                    size="small"
                                                    icon={approvalTab === 1
                                                        ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} />
                                                        : <CancelIcon sx={{ fontSize: '14px !important' }} />
                                                    }
                                                    sx={{
                                                        bgcolor: approvalTab === 1 ? '#DCFCE7' : '#FEE2E2',
                                                        color:   approvalTab === 1 ? '#16A34A' : '#DC2626',
                                                        fontWeight: '700',
                                                        fontSize: '11px',
                                                        borderRadius: '6px',
                                                        '& .MuiChip-icon': { fontSize: 13, color: 'inherit' },
                                                    }}
                                                />
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
    );
}
