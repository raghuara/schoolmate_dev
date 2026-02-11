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
    Divider,
    Tabs,
    Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';

// Mock data for pending approvals
const pendingApprovals = [
    {
        id: 1,
        name: "David Ross",
        staffId: "ST002",
        department: "Marketing",
        avatar: "DR",
        requestType: "Leave Application",
        leaveType: "Casual Leave",
        startDate: "Feb 15, 2026",
        endDate: "Feb 16, 2026",
        days: 2,
        reason: "Personal work",
        appliedOn: "Feb 6, 2026",
        priority: "Normal"
    },
    {
        id: 2,
        name: "Michael Smith",
        staffId: "ST005",
        department: "Science",
        avatar: "MS",
        requestType: "Attendance Correction",
        correctionDate: "Feb 5, 2026",
        currentStatus: "Absent",
        requestedStatus: "Present",
        reason: "Forgot to mark attendance",
        appliedOn: "Feb 6, 2026",
        priority: "High"
    },
    {
        id: 3,
        name: "Emma Wilson",
        staffId: "ST006",
        department: "English",
        avatar: "EW",
        requestType: "Leave Application",
        leaveType: "Sick Leave",
        startDate: "Feb 8, 2026",
        endDate: "Feb 9, 2026",
        days: 2,
        reason: "Medical treatment",
        appliedOn: "Feb 7, 2026",
        priority: "High"
    }
];

// Mock data for recent approvals
const recentApprovals = [
    {
        id: 1,
        name: "Sarah Jenkins",
        type: "Leave Application - Sick Leave",
        status: "Approved",
        approvedBy: "Admin",
        date: "Feb 5, 2026"
    },
    {
        id: 2,
        name: "Nivetha Arjun",
        type: "Leave Application - Planned Leave",
        status: "Approved",
        approvedBy: "HR Manager",
        date: "Feb 1, 2026"
    },
    {
        id: 3,
        name: "John Doe",
        type: "Leave Application - Emergency",
        status: "Rejected",
        approvedBy: "Admin",
        date: "Feb 7, 2026"
    }
];

export default function ApprovalWorkflowPage({ isEmbedded = false }) {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(3); // Approval Workflow tab (updated to tab 3)
    const [approvalTab, setApprovalTab] = useState(0); // Pending tab

    const handleTabChange = (event, newValue) => {
        switch(newValue) {
            case 0:
                navigate('/dashboardmenu/Leave'); // Attendance Dashboard
                break;
            case 1:
                navigate('/dashboardmenu/Leave/staff-attendance-overview'); // Staff Attendance Overview
                break;
            case 2:
                navigate('/dashboardmenu/Leave/leave-management'); // Leave Management
                break;
            case 3:
                setTabValue(3); // Approval Workflow (current page)
                break;
            case 4:
                navigate('/dashboardmenu/Leave/reports'); // Reports
                break;
            default:
                setTabValue(3);
                break;
        }
    };

    const handleApprovalTabChange = (event, newValue) => {
        setApprovalTab(newValue);
    };

    const handleApprove = (id) => {
        alert(`Approved request ID: ${id}`);
    };

    const handleReject = (id) => {
        alert(`Rejected request ID: ${id}`);
    };

    const getPriorityChip = (priority) => {
        const colors = {
            "High": { bg: '#FEE2E2', color: '#DC2626' },
            "Normal": { bg: '#DBEAFE', color: '#3B82F6' },
            "Low": { bg: '#F3F4F6', color: '#666' }
        };

        const { bg, color } = colors[priority] || colors.Normal;

        return (
            <Chip
                label={priority}
                size="small"
                sx={{
                    bgcolor: bg,
                    color: color,
                    fontWeight: '600',
                    fontSize: '11px'
                }}
            />
        );
    };

    const getRequestTypeChip = (type) => {
        const colors = {
            "Leave Application": { bg: '#DCFCE7', color: '#22C55E' },
            "Attendance Correction": { bg: '#FED7AA', color: '#F97316' }
        };

        const { bg, color } = colors[type] || { bg: '#F3F4F6', color: '#666' };

        return (
            <Chip
                label={type}
                size="small"
                sx={{
                    bgcolor: bg,
                    color: color,
                    fontWeight: '600',
                    fontSize: '11px'
                }}
            />
        );
    };

    return (
        <Box sx={{
            border: isEmbedded ? 'none' : '1px solid #ccc',
            borderRadius: isEmbedded ? '0' : '20px',
            p: isEmbedded ? 0 : 2,
            height: isEmbedded ? 'auto' : '86vh',
            overflow: 'auto',
            bgcolor: '#FAFAFA'
        }}>
            {/* Header - Hidden when embedded */}
            {!isEmbedded && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: '35px', height: '35px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>
                            Approval Workflow
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: '#666', mt: 0.5 }}>
                            Review and approve pending requests
                        </Typography>
                    </Box>
                </Box>
            </Box>
            )}

            {/* Tabs - Hidden when embedded */}
            {!isEmbedded && (
            <Box sx={{ borderBottom: '1px solid #E8E8E8', mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#666',
                            minHeight: '40px',
                            px: 2
                        },
                        '& .Mui-selected': {
                            color: '#F97316 !important'
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#F97316',
                            height: '3px'
                        }
                    }}
                >
                    <Tab label="Attendance Dashboard" />
                    <Tab label="Staff Attendance Overview" />
                    <Tab label="Leave Management" />
                    <Tab label="Approval Workflow" />
                    <Tab label="Reports" />
                </Tabs>
            </Box>
            )}

            <Grid container spacing={2}>
                {/* Main Content */}
                <Grid size={{ xs: 12, lg: 9 }}>
                    {/* Statistics Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                            <Card sx={{
                                border: '1px solid #F97316',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#FFF7ED'
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Pending Approvals
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                {pendingApprovals.length}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#F97316', fontWeight: '600', mt: 0.5 }}>
                                                Needs Review
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#FED7AA', width: 40, height: 40 }}>
                                            <PendingIcon sx={{ color: '#F97316', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                            <Card sx={{
                                border: '1px solid #22C55E',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#F0FDF4'
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Approved Today
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                5
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#22C55E', fontWeight: '600', mt: 0.5 }}>
                                                Completed
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#DCFCE7', width: 40, height: 40 }}>
                                            <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                            <Card sx={{
                                border: '1px solid #DC2626',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                bgcolor: '#FEF2F2'
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                Rejected Today
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                1
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#DC2626', fontWeight: '600', mt: 0.5 }}>
                                                Declined
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: '#FEE2E2', width: 40, height: 40 }}>
                                            <CancelIcon sx={{ color: '#DC2626', fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Approval Requests Table */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                                    Pending Requests
                                </Typography>
                                <Chip
                                    label={`${pendingApprovals.length} Pending`}
                                    size="small"
                                    sx={{
                                        bgcolor: '#FFF7ED',
                                        color: '#F97316',
                                        fontWeight: '600',
                                        fontSize: '11px'
                                    }}
                                />
                            </Box>

                            {/* Sub Tabs */}
                            <Tabs
                                value={approvalTab}
                                onChange={handleApprovalTabChange}
                                sx={{
                                    mb: 2,
                                    minHeight: '36px',
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#666',
                                        minHeight: '36px',
                                        px: 2
                                    },
                                    '& .Mui-selected': {
                                        color: '#F97316 !important'
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#F97316',
                                        height: '2px'
                                    }
                                }}
                            >
                                <Tab label="Pending" />
                                <Tab label="Approved" />
                                <Tab label="Rejected" />
                            </Tabs>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Staff Member
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Request Type
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Details
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Priority
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Applied On
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pendingApprovals.map((request) => (
                                            <TableRow
                                                key={request.id}
                                                sx={{
                                                    '&:hover': { bgcolor: '#F9FAFB' },
                                                    borderBottom: '1px solid #E8E8E8'
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d2', fontSize: '13px' }}>
                                                            {request.avatar}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                                {request.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                                {request.staffId} • {request.department}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {getRequestTypeChip(request.requestType)}
                                                </TableCell>
                                                <TableCell>
                                                    {request.requestType === "Leave Application" ? (
                                                        <Box>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                                                                {request.leaveType} - {request.days} days
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                                {request.startDate} to {request.endDate}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Box>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                                                                {request.correctionDate}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                                {request.currentStatus} → {request.requestedStatus}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getPriorityChip(request.priority)}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                        {request.appliedOn}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={() => handleApprove(request.id)}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                bgcolor: '#22C55E',
                                                                color: '#fff',
                                                                borderRadius: '4px',
                                                                px: 1.5,
                                                                '&:hover': {
                                                                    bgcolor: '#16A34A'
                                                                }
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => handleReject(request.id)}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                color: '#DC2626',
                                                                borderColor: '#DC2626',
                                                                borderRadius: '4px',
                                                                px: 1.5,
                                                                '&:hover': {
                                                                    borderColor: '#B91C1C',
                                                                    bgcolor: '#FEF2F2'
                                                                }
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Side Panel */}
                <Grid size={{ xs: 12, lg: 3 }}>
                    {/* Recent Activity */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 2 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', mb: 2 }}>
                                Recent Activity
                            </Typography>

                            {recentApprovals.map((approval, idx) => (
                                <Box
                                    key={approval.id}
                                    sx={{
                                        mb: 1.5,
                                        pb: 1.5,
                                        borderBottom: idx !== recentApprovals.length - 1 ? '1px solid #E8E8E8' : 'none'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        {approval.status === 'Approved' ? (
                                            <CheckCircleIcon sx={{ fontSize: 16, color: '#22C55E' }} />
                                        ) : (
                                            <CancelIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                                        )}
                                        <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                                            {approval.name}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                        {approval.type}
                                    </Typography>
                                    <Typography sx={{ fontSize: '10px', color: '#999', mt: 0.5 }}>
                                        {approval.status} by {approval.approvedBy} • {approval.date}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Approval Stats */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none' }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', mb: 2 }}>
                                This Month
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                        Total Requests
                                    </Typography>
                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                                        24
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                        Approved
                                    </Typography>
                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#22C55E' }}>
                                        18
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                        Pending
                                    </Typography>
                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#F97316' }}>
                                        3
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                        Rejected
                                    </Typography>
                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#DC2626' }}>
                                        3
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box>
                                <Typography sx={{ fontSize: '12px', color: '#666', mb: 1 }}>
                                    Avg. Response Time
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon sx={{ fontSize: 20, color: '#3B82F6' }} />
                                    <Typography sx={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>
                                        4.5 hours
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
