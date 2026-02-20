import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Chip,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    LinearProgress,
    Tooltip,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { expenceDashboard, getAddedExpence } from '../../../../Api/Api';

const token = "123";

const parseUser = (str) => {
    if (!str) return { roll: '-', name: '-' };
    const parts = str.split('-');
    if (parts.length >= 3) {
        return { roll: parts[0], name: parts.slice(1, -1).join(' ') };
    }
    return { roll: parts[0] || '-', name: parts[1] || '-' };
};

export default function ExpensesTab() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const rollNumber = user?.rollNumber;

    const [dashboardData, setDashboardData] = useState(null);
    const [expenseHistory, setExpenseHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get(expenceDashboard, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDashboardData(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchExpenseHistory = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getAddedExpence, {
                params: { RollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            });
            setExpenseHistory(res.data.data ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchExpenseHistory();
    }, []);

    const remainingBalance = dashboardData?.remainingBalance ?? 0;
    const balancePositive = remainingBalance > 0;
    const utilizationPercent = dashboardData?.budgetUtilizationPercent ?? 0;

    return (
        <Box>
            {/* Budget Utilization Alert */}
            {utilizationPercent > 90 && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                    p: 2,
                    border: '2px solid #FCA5A5',
                    borderRadius: '12px',
                    bgcolor: '#FEF2F2'
                }}>
                    <WarningAmberIcon sx={{ fontSize: 24, color: '#DC2626' }} />
                    <Box>
                        <Typography sx={{ fontSize: '14px', color: '#991B1B', fontWeight: 600 }}>
                            Budget Alert: {utilizationPercent.toFixed(1)}% Utilized
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#DC2626', mt: 0.3 }}>
                            Only ₹{remainingBalance.toLocaleString()} remaining from allocated amount
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* 4 KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Approved Expenses */}
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        border: '1px solid #10B981',
                        borderRadius: '12px',
                        boxShadow: 'none',
                        bgcolor: '#ECFDF5',
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(16,185,129,0.2)' }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '12px', color: '#065F46', fontWeight: 600, mb: 1 }}>
                                        APPROVED EXPENSES
                                    </Typography>
                                    <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#064E3B', mb: 0.5 }}>
                                        ₹{(dashboardData?.approvedExpensesAmount ?? 0).toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#10B981', fontWeight: 500 }}>
                                        {dashboardData?.approvedExpensesCount ?? 0} requests approved
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 52, height: 52, borderRadius: '12px',
                                    bgcolor: '#10B98130', border: '2px solid #10B981',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <CheckCircleIcon sx={{ color: '#10B981', fontSize: 28 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pending Approval */}
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        border: '1px solid #F59E0B',
                        borderRadius: '12px',
                        boxShadow: 'none',
                        bgcolor: '#FFFBEB',
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(245,158,11,0.2)' }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '12px', color: '#92400E', fontWeight: 600, mb: 1 }}>
                                        PENDING APPROVAL
                                    </Typography>
                                    <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#78350F', mb: 0.5 }}>
                                        ₹{(dashboardData?.pendingApprovalAmount ?? 0).toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>
                                        {dashboardData?.pendingApprovalCount ?? 0} requests waiting
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 52, height: 52, borderRadius: '12px',
                                    bgcolor: '#F59E0B30', border: '2px solid #F59E0B',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <PendingActionsIcon sx={{ color: '#F59E0B', fontSize: 28 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Remaining Balance */}
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        border: `1px solid ${balancePositive ? '#3B82F6' : '#DC2626'}`,
                        borderRadius: '12px',
                        boxShadow: 'none',
                        bgcolor: balancePositive ? '#EFF6FF' : '#FEF2F2',
                        transition: 'all 0.3s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: balancePositive
                                ? '0 8px 20px rgba(59,130,246,0.2)'
                                : '0 8px 20px rgba(220,38,38,0.2)'
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '12px', color: balancePositive ? '#1E40AF' : '#991B1B', fontWeight: 600, mb: 1 }}>
                                        REMAINING BALANCE
                                    </Typography>
                                    <Typography sx={{ fontSize: '26px', fontWeight: 700, color: balancePositive ? '#1E3A8A' : '#7F1D1D', mb: 0.5 }}>
                                        ₹{remainingBalance.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: balancePositive ? '#3B82F6' : '#DC2626', fontWeight: 500 }}>
                                        {balancePositive ? 'Available to use' : 'Budget exceeded'}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 52, height: 52, borderRadius: '12px',
                                    bgcolor: balancePositive ? '#3B82F630' : '#DC262630',
                                    border: `2px solid ${balancePositive ? '#3B82F6' : '#DC2626'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <AccountBalanceWalletIcon sx={{ color: balancePositive ? '#3B82F6' : '#DC2626', fontSize: 28 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Budget Utilization */}
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        border: '1px solid #8B5CF6',
                        borderRadius: '12px',
                        boxShadow: 'none',
                        bgcolor: '#F5F3FF',
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(139,92,246,0.2)' }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '12px', color: '#5B21B6', fontWeight: 600, mb: 1 }}>
                                        BUDGET UTILIZATION
                                    </Typography>
                                    <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#4C1D95', mb: 0.5 }}>
                                        {utilizationPercent.toFixed(1)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(utilizationPercent, 100)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: '#DDD6FE',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: utilizationPercent > 90 ? '#DC2626' : '#8B5CF6',
                                                borderRadius: 4
                                            }
                                        }}
                                    />
                                </Box>
                                <Box sx={{
                                    width: 52, height: 52, borderRadius: '12px',
                                    bgcolor: '#8B5CF630', border: '2px solid #8B5CF6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', ml: 1
                                }}>
                                    <TrendingUpIcon sx={{ color: '#8B5CF6', fontSize: 28 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Expense History Table */}
            <Paper sx={{
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                {/* Header */}
                <Box sx={{
                    px: 2.5, py: 2,
                    borderBottom: '2px solid #E5E7EB',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '8px',
                            bgcolor: '#FEF2F2', border: '1px solid #FCA5A5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ReceiptLongIcon sx={{ fontSize: 20, color: '#DC2626' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                                Recent Expense History
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                                Latest 5 expense transactions
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        size="small"
                        endIcon={<ReceiptLongIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate('/dashboardmenu/fee/expense')}
                        sx={{
                            textTransform: 'none', fontSize: '12px', fontWeight: 600,
                            color: '#667eea', border: '1px solid #667eea', borderRadius: '20px', px: 2,
                            '&:hover': { bgcolor: '#f0f0ff' }
                        }}
                    >
                        View All
                    </Button>
                </Box>

                {/* Table */}
                <Table>
                    <TableHead>
                        <TableRow>
                            {['Date', 'Category', 'Requested By', 'Description', 'Amount', 'Status'].map((col) => (
                                <TableCell key={col} sx={{
                                    backgroundColor: '#F9FAFB', color: '#374151',
                                    fontWeight: 700, fontSize: '11px', textTransform: 'uppercase',
                                    borderBottom: '1px solid #E5E7EB', py: 1.2
                                }}>
                                    {col}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenseHistory.length > 0 ? (
                            expenseHistory.slice(0, 5).map((item, idx) => {
                                const reqBy = parseUser(item.createdBy);
                                const displayStatus = item.status === 'Requested' ? 'Pending' : item.status;
                                return (
                                    <TableRow
                                        key={item.expenceId}
                                        sx={{
                                            backgroundColor: idx % 2 === 0 ? '#fff' : '#FAFAFA',
                                            '&:hover': { backgroundColor: '#F3F4F6' },
                                            '&:last-child td': { borderBottom: 'none' }
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: '12px', color: '#374151', borderBottom: '1px solid #F3F4F6', py: 1.5, whiteSpace: 'nowrap' }}>
                                            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.5 }}>
                                            <Chip
                                                label={item.category || '-'}
                                                size="small"
                                                sx={{ fontSize: '10px', bgcolor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: 600, height: 20 }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.5 }}>
                                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                                                {reqBy.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: '#9CA3AF' }}>
                                                {reqBy.roll}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.5, maxWidth: 220 }}>
                                            <Tooltip title={item.description} arrow>
                                                <Typography sx={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.description || '-'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', borderBottom: '1px solid #F3F4F6', py: 1.5, whiteSpace: 'nowrap' }}>
                                            ₹{(item.expenceAmount ?? 0).toLocaleString()}
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid #F3F4F6', py: 1.5 }}>
                                            <Chip
                                                label={displayStatus}
                                                size="small"
                                                sx={{
                                                    fontSize: '10px', fontWeight: 600, height: 20,
                                                    bgcolor: displayStatus === 'Approved' ? '#ECFDF5' : displayStatus === 'Pending' ? '#FFFBEB' : '#FEF2F2',
                                                    color: displayStatus === 'Approved' ? '#047857' : displayStatus === 'Pending' ? '#B45309' : '#991B1B',
                                                    border: `1px solid ${displayStatus === 'Approved' ? '#A7F3D0' : displayStatus === 'Pending' ? '#FCD34D' : '#FCA5A5'}`
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, borderBottom: 'none' }}>
                                    <ReceiptLongIcon sx={{ fontSize: 36, color: '#D1D5DB', mb: 1, display: 'block', mx: 'auto' }} />
                                    <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>
                                        {isLoading ? 'Loading...' : 'No expense records found'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}
