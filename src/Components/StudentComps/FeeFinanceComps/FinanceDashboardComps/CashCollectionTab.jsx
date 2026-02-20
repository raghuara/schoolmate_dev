import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';
import axios from 'axios';
import { cashCollection } from '../../../../Api/Api';

const token = "123";
const today = new Date().toISOString().split('T')[0];

const denomConfig = {
    2000: { label: '₹2000', color: '#C2185B', bg: '#FCE4EC' },
    500: { label: '₹500', color: '#6A1B9A', bg: '#F3E5F5' },
    200: { label: '₹200', color: '#E65100', bg: '#FFF3E0' },
    100: { label: '₹100', color: '#1565C0', bg: '#E3F2FD' },
    50: { label: '₹50', color: '#00695C', bg: '#E0F2F1' },
    20: { label: '₹20', color: '#2E7D32', bg: '#E8F5E9' },
    10: { label: '₹10', color: '#4E342E', bg: '#EFEBE9' },
    5: { label: '₹5', color: '#546E7A', bg: '#ECEFF1' },
    2: { label: '₹2', color: '#546E7A', bg: '#ECEFF1' },
    1: { label: '₹1', color: '#546E7A', bg: '#ECEFF1' },
};

const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function CashCollectionTab({ cashDate, setCashDate, selectedYear }) {
    const [cashData, setCashData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCashCollection();
    }, [cashDate, selectedYear]);

    const fetchCashCollection = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(cashCollection, {
                params: { year: selectedYear, Date: cashDate || today },
                headers: { Authorization: `Bearer ${token}` },
            });
            setCashData(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const denominationBreakdown = cashData?.denominationBreakdown ?? [];
    const cashTransactions = cashData?.cashTransactions ?? [];

    return (
        <Box>
            {/* Header Row */}
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                mb: 2.5, pb: 2, borderBottom: '1px solid #F0F0F0'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '10px',
                        bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <MonetizationOnIcon sx={{ color: '#22C55E', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>
                            Cash Collection
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#888' }}>
                            {cashDate === today ? "Showing today's data" : `Showing data for ${cashDate}`}
                        </Typography>
                    </Box>
                </Box>

            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #22C55E', borderRadius: '4px', bgcolor: '#F1F8F4' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Total Cash Collected</Typography>
                                    {isLoading ? (
                                        <CircularProgress size={20} sx={{ my: 1 }} />
                                    ) : (
                                        <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>
                                            {cashData?.totalCashCollected?.display ?? '₹0'}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontSize: '11px', color: '#888' }}>All time cash collected</Typography>
                                </Box>
                                <AccountBalanceWalletIcon sx={{ fontSize: 36, color: '#22C55E' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #0891B2', borderRadius: '4px', bgcolor: '#F0F9FA' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Today Cash Collected</Typography>
                                    {isLoading ? (
                                        <CircularProgress size={20} sx={{ my: 1 }} />
                                    ) : (
                                        <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>
                                            {cashData?.todayCashCollected?.display ?? '₹0'}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                        {cashData?.studentsPaid ?? 0} receipt{cashData?.studentsPaid !== 1 ? 's' : ''} today
                                    </Typography>
                                </Box>
                                <MonetizationOnIcon sx={{ fontSize: 36, color: '#0891B2' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #7C3AED', borderRadius: '4px', bgcolor: '#F9F0FB' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Students Paid</Typography>
                                    {isLoading ? (
                                        <CircularProgress size={20} sx={{ my: 1 }} />
                                    ) : (
                                        <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>
                                            {cashData?.studentsPaid ?? 0}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                        {cashDate === today ? 'Paid in cash today' : `Paid on ${cashDate}`}
                                    </Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 36, color: '#7C3AED' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {/* Date Filter Section */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    px: 2,
                    py: 1.5,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E8EFF5',
                    borderRadius: '8px',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 6, height: 28, borderRadius: '3px', bgcolor: '#0891B2',
                    }} />
                    <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }}>
                            Date-wise Breakdown
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#888' }}>
                            Denomination & transactions filtered by selected date
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '11px', color: '#888', fontWeight: '500' }}>
                        Viewing:
                    </Typography>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.8,
                        bgcolor: '#fff', border: '1.5px solid #0891B2',
                        borderRadius: '8px', px: 1.5, py: 0.6,
                    }}>
                        <TodayIcon sx={{ fontSize: 16, color: '#0891B2' }} />
                        <TextField
                            type="date"
                            size="small"
                            value={cashDate}
                            onChange={(e) => setCashDate(e.target.value)}
                            variant="standard"
                            sx={{ width: '130px' }}
                            slotProps={{
                                input: { disableUnderline: true, style: { fontSize: '13px', fontWeight: '600', color: '#0891B2' } }
                            }}
                        />
                    </Box>
                    {cashDate === today && (
                        <Chip
                            label="Today"
                            size="small"
                            sx={{ bgcolor: '#E0F2FE', color: '#0891B2', fontWeight: '700', fontSize: '10px', height: '22px' }}
                        />
                    )}
                </Box>
            </Box>
            {/* Denomination Breakdown */}
            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF', mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>
                            Denomination Breakdown
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '11px', color: '#888' }}>Grand Total (Inwards)</Typography>
                            {isLoading ? (
                                <CircularProgress size={16} />
                            ) : (
                                <Typography sx={{ fontSize: '18px', fontWeight: '700', color: '#22C55E' }}>
                                    {cashData?.grandTotalInwards?.display ?? '₹0'}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5', width: '25%' }}>Denomination</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5', width: '15%' }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5', width: '20%' }}>Inwards Count</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5', width: '20%' }}>Inwards Amount</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5', width: '20%' }}>Outwards Count</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {denominationBreakdown.map((d) => {
                                        const cfg = denomConfig[d.denomination] ?? { label: `₹${d.denomination}`, color: '#546E7A', bg: '#ECEFF1' };
                                        return (
                                            <TableRow key={d.denomination} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                                                <TableCell>
                                                    <Chip
                                                        label={cfg.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: cfg.bg,
                                                            color: cfg.color,
                                                            fontWeight: '700',
                                                            fontSize: '12px',
                                                            border: `1px solid ${cfg.color}40`,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>{d.type}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: d.inwardsCount > 0 ? '#1a1a1a' : '#bbb' }}>
                                                        {d.inwardsCount}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: d.inwardsCount > 0 ? cfg.color : '#bbb' }}>
                                                        {d.inwardsAmount?.display ?? '₹0'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: d.outwardsCount > 0 ? '#EF4444' : '#bbb' }}>
                                                        {d.outwardsCount}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {/* Grand Total Row */}
                                    <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                                        <TableCell colSpan={3} sx={{ fontWeight: '700', fontSize: '13px' }}>Grand Total</TableCell>
                                        <TableCell sx={{ fontWeight: '700', fontSize: '14px', color: '#22C55E' }}>
                                            {cashData?.grandTotalInwards?.display ?? '₹0'}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: '700', fontSize: '14px', color: '#EF4444' }}>
                                            {cashData?.grandTotalOutwards?.display ?? '₹0'}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Cash Transactions Table */}
            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                <CardContent>
                    <Typography sx={{ fontSize: '15px', fontWeight: '600', mb: 2 }}>
                        Cash Transactions
                    </Typography>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : cashTransactions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <MonetizationOnIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                            <Typography sx={{ fontSize: '14px', color: '#999' }}>
                                No cash transactions found for this date
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Time</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Student</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Grade</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Fee Type</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Receipt No.</TableCell>
                                        <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cashTransactions.map((txn, idx) => (
                                        <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                    {formatTime(txn.paidOn)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>{txn.name}</Typography>
                                                <Typography sx={{ fontSize: '10px', color: '#666' }}>{txn.rollNumber}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                    {txn.grade} {txn.section}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '12px' }}>{txn.feeType}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#22C55E' }}>
                                                    {txn.amount?.display ?? '₹0'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: '11px', color: '#0891B2', fontWeight: '600' }}>
                                                    {txn.receiptNo}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={txn.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: txn.status === 'Completed' ? '#DCFCE7' : txn.status === 'Pending' ? '#FFF7ED' : '#FEE2E2',
                                                        color: txn.status === 'Completed' ? '#22C55E' : txn.status === 'Pending' ? '#F97316' : '#DC2626',
                                                        fontWeight: '600',
                                                        fontSize: '10px',
                                                        height: '20px',
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
