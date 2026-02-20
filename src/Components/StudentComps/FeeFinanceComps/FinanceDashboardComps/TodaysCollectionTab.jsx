import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    InputAdornment,
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
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import axios from 'axios';
import { todaysCollection } from '../../../../Api/Api';

const token = "123";

const PIE_COLORS = ['#0891B2', '#22C55E', '#F97316', '#7C3AED', '#E91E63'];

const NoDataPlaceholder = ({ height = 200 }) => (
    <Box
        sx={{
            height,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            bgcolor: '#FAFAFA',
            borderRadius: '8px',
            border: '1px dashed #E0E0E0',
        }}
    >
        <BarChartIcon sx={{ fontSize: 36, color: '#D0D0D0' }} />
        <Typography sx={{ fontSize: '13px', color: '#BDBDBD', fontWeight: '500' }}>
            No data available
        </Typography>
    </Box>
);

export default function TodaysCollectionTab() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTodaysCollection();
    }, []);

    const fetchTodaysCollection = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(todaysCollection, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setData(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const todaysTransactions = data?.todaysTransactions ?? [];
    const paymentMethods = data?.todaysPaymentMethods ?? [];
    const feeCategoryBreakdown = (data?.feeCategoryBreakdown ?? []).map((item) => ({
        category: item.category,
        Collected: item.amount?.amount ?? 0,
    }));

    const filteredTransactions = todaysTransactions.filter((t) =>
        t.name?.toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <Box>
            {/* Today's Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #0891B2', borderRadius: '4px', bgcolor: '#F0F9FA' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                        Total Collections
                                    </Typography>
                                    {isLoading ? (
                                        <CircularProgress size={20} sx={{ my: 1 }} />
                                    ) : (
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                            {data?.totalCollections?.display ?? '₹0'}
                                        </Typography>
                                    )}
                                </Box>
                                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#0891B2' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #22C55E', borderRadius: '4px', bgcolor: '#F1F8F4' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                        Transactions
                                    </Typography>
                                    {isLoading ? (
                                        <CircularProgress size={20} sx={{ my: 1 }} />
                                    ) : (
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                            {data?.transactions ?? 0}
                                        </Typography>
                                    )}
                                </Box>
                                <ReceiptIcon sx={{ fontSize: 40, color: '#22C55E' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #F97316', borderRadius: '4px', bgcolor: '#FFF8F0' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                        Online Transactions
                                    </Typography>
                                    {isLoading ? (
                                        <CircularProgress size={20} sx={{ my: 1 }} />
                                    ) : (
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                            {data?.onlineTransactions ?? 0}
                                        </Typography>
                                    )}
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 40, color: '#F97316' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #7C3AED', borderRadius: '4px', bgcolor: '#F9F0FB' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                        Cash in Hand
                                    </Typography>
                                    {isLoading ? (
                                        <CircularProgress size={20} sx={{ my: 1 }} />
                                    ) : (
                                        <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                            {data?.cashInHand?.display ?? '₹0'}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                        To be deposited
                                    </Typography>
                                </Box>
                                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#7C3AED' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Today's Transactions & Payment Methods */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Today's Transactions Table */}
                <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8 }}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                                    Today's Transactions
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="Search student..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ fontSize: 18 }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{ width: '200px' }}
                                />
                            </Box>
                            {isLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            ) : (
                                <TableContainer sx={{ maxHeight: 500 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Time</TableCell>
                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Student</TableCell>
                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Fee Type</TableCell>
                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Amount</TableCell>
                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Method</TableCell>
                                                <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredTransactions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        <Typography sx={{ fontSize: '13px', color: '#999', py: 2 }}>
                                                            No transactions found
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredTransactions.map((txn, idx) => (
                                                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                {formatTime(txn.paidOn)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                {txn.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                {txn.grade} {txn.section}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '11px' }}>
                                                                {txn.feeType}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#22C55E' }}>
                                                                {txn.amount?.display ?? '₹0'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={txn.method}
                                                                size="small"
                                                                sx={{ fontSize: '10px', height: '20px', bgcolor: '#EDE9FE', color: '#5B21B6' }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={txn.status}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor:
                                                                        txn.status === 'Completed' ? '#DCFCE7' :
                                                                        txn.status === 'Pending' ? '#FFF7ED' : '#FEE2E2',
                                                                    color:
                                                                        txn.status === 'Completed' ? '#22C55E' :
                                                                        txn.status === 'Pending' ? '#F97316' : '#DC2626',
                                                                    fontWeight: '600',
                                                                    fontSize: '10px',
                                                                    height: '20px',
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payment Methods Breakdown */}
                <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                        Today's Payment Methods
                                    </Typography>
                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : paymentMethods.length === 0 ? (
                                        <NoDataPlaceholder height={200} />
                                    ) : (
                                        <>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <PieChart>
                                                    <Pie
                                                        data={paymentMethods}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={2}
                                                        dataKey="amount.amount"
                                                        nameKey="method"
                                                    >
                                                        {paymentMethods.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value) => `₹${value.toLocaleString()}`}
                                                        contentStyle={{
                                                            backgroundColor: '#fff',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <Box sx={{ mt: 2 }}>
                                                {paymentMethods.map((method, index) => (
                                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                                            <Typography sx={{ fontSize: '12px' }}>{method.method}</Typography>
                                                        </Box>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                {method.amount?.display ?? '₹0'}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                {method.percentage}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                                            Fee Category Breakdown
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                            Today
                                        </Typography>
                                    </Box>
                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : feeCategoryBreakdown.length === 0 ? (
                                        <NoDataPlaceholder height={180} />
                                    ) : (
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart
                                                data={feeCategoryBreakdown}
                                                margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                                <XAxis dataKey="category" stroke="#999" style={{ fontSize: '10px' }} tickLine={false} />
                                                <YAxis stroke="#999" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip
                                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Collected']}
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px' }}
                                                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                                                />
                                                <Bar dataKey="Collected" fill="#0891B2" radius={[4, 4, 0, 0]} barSize={28} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
