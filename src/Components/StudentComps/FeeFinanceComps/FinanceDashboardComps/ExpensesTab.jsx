import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Avatar,
    Chip,
    Button,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';

export default function ExpensesTab() {
    const navigate = useNavigate();

    return (
        <Box>
            {/* 4 Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    {
                        label: 'APPROVED EXPENSES',
                        value: '₹23,500',
                        subtitle: '2 requests approved',
                        color: '#10B981',
                        bg: '#F0FDF4',
                        icon: <CheckCircleIcon sx={{ fontSize: 26, color: '#10B981' }} />
                    },
                    {
                        label: 'PENDING APPROVAL',
                        value: '₹6,000',
                        subtitle: '2 requests waiting',
                        color: '#F59E0B',
                        bg: '#FFFBEB',
                        icon: <PendingActionsIcon sx={{ fontSize: 26, color: '#F59E0B' }} />
                    },
                    {
                        label: 'REMAINING BALANCE',
                        value: '₹26,500',
                        subtitle: 'Available to Use',
                        color: '#3B82F6',
                        bg: '#EFF6FF',
                        icon: <AccountBalanceWalletIcon sx={{ fontSize: 26, color: '#3B82F6' }} />
                    },
                    {
                        label: 'BUDGET UTILIZATION',
                        value: '47.0%',
                        subtitle: 'Of Allocated',
                        color: '#8B5CF6',
                        bg: '#F5F3FF',
                        icon: <TrendingUpIcon sx={{ fontSize: 26, color: '#8B5CF6' }} />
                    }
                ].map((card, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }} key={i}>
                        <Card sx={{
                            border: `1px solid ${card.color}50`,
                            borderRadius: '12px',
                            boxShadow: 'none',
                            bgcolor: card.bg,
                        }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: '600', mb: 0.5, letterSpacing: '0.3px' }}>
                                            {card.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#111827', mb: 0.3, lineHeight: 1.2 }}>
                                            {card.value}
                                        </Typography>
                                        <Typography sx={{ fontSize: '12px', color: card.color, fontWeight: '500' }}>
                                            {card.subtitle}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        width: 46, height: 46,
                                        borderRadius: '10px',
                                        bgcolor: `${card.color}18`,
                                        border: `1px solid ${card.color}40`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, ml: 1
                                    }}>
                                        {card.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Recent Expense Requests */}
            <Card sx={{ boxShadow: 'none', border: '1px solid #E5E7EB', borderRadius: '12px', bgcolor: '#FFFFFF' }}>
                <Box sx={{
                    px: 2.5, py: 2,
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                        Recent Expense Requests
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => navigate('/dashboardmenu/fee/expense', { state: { tab: 3 } })}
                        sx={{ textTransform: 'none', fontSize: '13px', color: '#667eea' }}
                    >
                        View All →
                    </Button>
                </Box>
                <Box>
                    {[
                        { category: 'Stationery', description: 'Office supplies - pens, papers, notebooks for all departments', amount: 2500, status: 'Pending' },
                        { category: 'Utilities', description: 'Electricity bill payment for January 2026', amount: 15000, status: 'Approved' },
                        { category: 'Maintenance', description: 'AC servicing for all classrooms and staff rooms', amount: 8500, status: 'Approved' },
                        { category: 'Food & Beverages', description: 'Refreshments for upcoming parent-teacher meeting', amount: 3500, status: 'Pending' },
                        { category: 'Transportation', description: 'Fuel for school buses - February week 1', amount: 12000, status: 'Rejected' },
                    ].map((req, i) => (
                        <Box key={i} sx={{
                            px: 2.5, py: 2,
                            borderBottom: '1px solid #F3F4F6',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            '&:last-child': { borderBottom: 'none' },
                            '&:hover': { bgcolor: '#F9FAFB' }
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                <Avatar sx={{
                                    width: 44, height: 44,
                                    bgcolor: req.status === 'Approved' ? '#ECFDF5' : req.status === 'Pending' ? '#FFFBEB' : '#FEF2F2',
                                    color: req.status === 'Approved' ? '#10B981' : req.status === 'Pending' ? '#F59E0B' : '#DC2626',
                                    fontWeight: '700', fontSize: '16px'
                                }}>
                                    {req.category.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#111827', mb: 0.2 }}>
                                        {req.category}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '12px', color: '#6B7280',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 350
                                    }}>
                                        {req.description}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right', ml: 2 }}>
                                <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#111827', mb: 0.3 }}>
                                    ₹{req.amount.toLocaleString()}
                                </Typography>
                                <Chip
                                    label={req.status}
                                    size="small"
                                    sx={{
                                        fontSize: '10px', fontWeight: '600', height: '20px',
                                        bgcolor: req.status === 'Approved' ? '#ECFDF5' : req.status === 'Pending' ? '#FFFBEB' : '#FEF2F2',
                                        color: req.status === 'Approved' ? '#047857' : req.status === 'Pending' ? '#B45309' : '#991B1B',
                                        border: `1px solid ${req.status === 'Approved' ? '#A7F3D0' : req.status === 'Pending' ? '#FCD34D' : '#FCA5A5'}`
                                    }}
                                />
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Card>
        </Box>
    );
}
