import React from 'react';
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
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';

export default function CashCollectionTab({ cashDate, setCashDate, denominations, recentTransactions, today }) {
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
                            {cashDate === today ? 'Showing today\'s data' : `Showing data for ${cashDate}`}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    bgcolor: '#F8F9FA', border: '1px solid #E8E8E8',
                    borderRadius: '10px', px: 1.5, py: 0.8
                }}>
                    <TodayIcon sx={{ fontSize: 18, color: '#0891B2' }} />
                    <TextField
                        type="date"
                        size="small"
                        value={cashDate}
                        onChange={(e) => setCashDate(e.target.value)}
                        variant="standard"
                        sx={{ width: '140px' }}
                        slotProps={{
                            input: { disableUnderline: true, style: { fontSize: '13px', fontWeight: '600' } }
                        }}
                    />
                </Box>
            </Box>

            {/* Summary Cards */}
            {(() => {
                const cashTxns = recentTransactions.filter(t => t.method === 'Cash' && t.date === cashDate);
                const todayTxns = recentTransactions.filter(t => t.method === 'Cash' && t.date === today);
                const totalCash = recentTransactions.filter(t => t.method === 'Cash').reduce((sum, t) => sum + t.amount, 0);
                const todayCash = todayTxns.reduce((sum, t) => sum + t.amount, 0);
                const studentsPaid = cashTxns.length;
                return (
                    <>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
                                <Card sx={{ boxShadow: 'none', border: '1px solid #22C55E', borderRadius: '4px', bgcolor: '#F1F8F4' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Total Cash Collected</Typography>
                                                <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>
                                                    ₹{totalCash.toLocaleString()}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                                    All time cash collected
                                                </Typography>
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
                                                <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>
                                                    ₹{todayCash.toLocaleString()}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#888' }}>
                                                    {todayTxns.length} receipt{todayTxns.length !== 1 ? 's' : ''} today
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
                                                <Typography sx={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a' }}>
                                                    {studentsPaid}
                                                </Typography>
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

                        {/* Denomination Breakdown */}
                        {(() => {
                            const denomList = [
                                { value: 2000, label: '₹2000', type: 'Note', color: '#C2185B', bg: '#FCE4EC' },
                                { value: 500, label: '₹500', type: 'Note', color: '#6A1B9A', bg: '#F3E5F5' },
                                { value: 200, label: '₹200', type: 'Note', color: '#E65100', bg: '#FFF3E0' },
                                { value: 100, label: '₹100', type: 'Note', color: '#1565C0', bg: '#E3F2FD' },
                                { value: 50, label: '₹50', type: 'Note', color: '#00695C', bg: '#E0F2F1' },
                                { value: 20, label: '₹20', type: 'Note', color: '#2E7D32', bg: '#E8F5E9' },
                                { value: 10, label: '₹10', type: 'Note', color: '#4E342E', bg: '#EFEBE9' },
                                { value: 5, label: '₹5', type: 'Coin', color: '#546E7A', bg: '#ECEFF1' },
                                { value: 2, label: '₹2', type: 'Coin', color: '#546E7A', bg: '#ECEFF1' },
                                { value: 1, label: '₹1', type: 'Coin', color: '#546E7A', bg: '#ECEFF1' },
                            ];
                            const grandTotal = denomList.reduce((sum, d) => sum + (denominations[d.value] || 0) * d.value, 0);
                            return (
                                <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF', mb: 3 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography sx={{ fontSize: '15px', fontWeight: '600' }}>
                                                Denomination Breakdown
                                            </Typography>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography sx={{ fontSize: '11px', color: '#888' }}>Grand Total</Typography>
                                                <Typography sx={{ fontSize: '18px', fontWeight: '700', color: '#22C55E' }}>
                                                    ₹{grandTotal.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Grid container spacing={2}>
                                            {/* Notes Section */}
                                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5', width: '30%' }}>Denomination</TableCell>
                                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5', width: '15%' }}>Type</TableCell>
                                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5', width: '25%' }}>Count</TableCell>
                                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5', width: '30%' }}>Amount</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {denomList.map((d) => {
                                                                const count = denominations[d.value] || 0;
                                                                const amount = count * d.value;
                                                                return (
                                                                    <TableRow key={d.value} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                                                                        <TableCell>
                                                                            <Chip
                                                                                label={d.label}
                                                                                size="small"
                                                                                sx={{
                                                                                    bgcolor: d.bg,
                                                                                    color: d.color,
                                                                                    fontWeight: '700',
                                                                                    fontSize: '12px',
                                                                                    border: `1px solid ${d.color}40`
                                                                                }}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Typography sx={{ fontSize: '11px', color: '#666' }}>{d.type}</Typography>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: count > 0 ? '#1a1a1a' : '#bbb' }}>
                                                                                {count}
                                                                            </Typography>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: amount > 0 ? d.color : '#bbb' }}>
                                                                                ₹{amount.toLocaleString()}
                                                                            </Typography>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                            {/* Grand Total Row */}
                                                            <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                                                                <TableCell colSpan={3} sx={{ fontWeight: '700', fontSize: '13px' }}>Grand Total</TableCell>
                                                                <TableCell sx={{ fontWeight: '700', fontSize: '14px', color: '#22C55E' }}>
                                                                    ₹{grandTotal.toLocaleString()}
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Grid>

                                        </Grid>
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        {/* Transactions Table */}
                        <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                            <CardContent>
                                <Typography sx={{ fontSize: '15px', fontWeight: '600', mb: 2 }}>
                                    Cash Transactions
                                </Typography>
                                {cashTxns.length === 0 ? (
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
                                                {cashTxns.map((txn) => (
                                                    <TableRow key={txn.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>{txn.time}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>{txn.student}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', color: '#666' }}>{txn.grade}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px' }}>{txn.type}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '700', color: '#22C55E' }}>
                                                                ₹{txn.amount.toLocaleString()}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '11px', color: '#0891B2', fontWeight: '600' }}>
                                                                {txn.id}
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
                                                                    height: '20px'
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
                    </>
                );
            })()}
        </Box>
    );
}
