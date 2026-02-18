import React from 'react';
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
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
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

export default function TodaysCollectionTab({ recentTransactions }) {
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
                                    <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                        ₹45,200
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#22C55E', fontWeight: '600' }}>
                                        ↑ +12.3% from yesterday
                                    </Typography>
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
                                    <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                        23
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                        8 pending verification
                                    </Typography>
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
                                        Online Transaction
                                    </Typography>
                                    <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                        21
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                        UPI, Card, Net Banking, Cheque
                                    </Typography>
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
                                    <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                        ₹18,500
                                    </Typography>
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
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        size="small"
                                        placeholder="Search student..."
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ fontSize: 18 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ width: '200px' }}
                                    />
                                </Box>
                            </Box>
                            <TableContainer sx={{ maxHeight: 500 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Time</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Student</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Fee Type</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Method</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Receipt</TableCell>
                                            <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentTransactions.filter(t => t.date === '2026-01-23').map((transaction) => (
                                            <TableRow key={transaction.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                        {transaction.time}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                        {transaction.student}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                        {transaction.grade}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '11px' }}>
                                                        {transaction.type}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#22C55E' }}>
                                                        ₹{transaction.amount.toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={transaction.method}
                                                        size="small"
                                                        sx={{
                                                            fontSize: '10px',
                                                            height: '20px',
                                                            bgcolor: '#EDE9FE',
                                                            color: '#5B21B6'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontSize: '11px', color: '#0891B2', fontWeight: '600' }}>
                                                        {transaction.id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={transaction.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor:
                                                                transaction.status === 'Completed'
                                                                    ? '#DCFCE7'
                                                                    : transaction.status === 'Pending'
                                                                        ? '#FFF7ED'
                                                                        : '#FEE2E2',
                                                            color:
                                                                transaction.status === 'Completed'
                                                                    ? '#22C55E'
                                                                    : transaction.status === 'Pending'
                                                                        ? '#F97316'
                                                                        : '#DC2626',
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
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Online', value: 18500, color: '#0891B2' },
                                                    { name: 'Cash', value: 15200, color: '#22C55E' },
                                                    { name: 'Cheque', value: 8500, color: '#F97316' },
                                                    { name: 'Bank Transfer', value: 3000, color: '#7C3AED' },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {[
                                                    { name: 'Online', value: 18500, color: '#0891B2' },
                                                    { name: 'Cash', value: 15200, color: '#22C55E' },
                                                    { name: 'Cheque', value: 8500, color: '#F97316' },
                                                    { name: 'Bank Transfer', value: 3000, color: '#7C3AED' },
                                                ].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
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
                                        {[
                                            { name: 'Online Payment', value: 18500, color: '#0891B2', percent: 41 },
                                            { name: 'Cash', value: 15200, color: '#22C55E', percent: 34 },
                                            { name: 'Cheque', value: 8500, color: '#F97316', percent: 19 },
                                            { name: 'Bank Transfer', value: 3000, color: '#7C3AED', percent: 6 },
                                        ].map((method, index) => (
                                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: method.color }} />
                                                    <Typography sx={{ fontSize: '12px' }}>{method.name}</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                        ₹{method.value.toLocaleString()}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                        {method.percent}%
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
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
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart
                                            data={[
                                                { category: 'School Fee', Collected: 22000 },
                                                { category: 'Transport', Collected: 12500 },
                                                { category: 'ECA', Collected: 6200 },
                                                { category: 'Additional', Collected: 4500 },
                                            ]}
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
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
