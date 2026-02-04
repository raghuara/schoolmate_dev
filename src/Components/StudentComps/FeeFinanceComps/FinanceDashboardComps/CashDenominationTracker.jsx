import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Divider,
    TextField,
    InputAdornment
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HistoryIcon from '@mui/icons-material/History';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';

export default function CashDenominationTracker() {
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showAllDays, setShowAllDays] = useState(false);

    // Denominations data
    const denominations = [2000, 500, 200, 100, 50, 20, 10];

    // Mock data for today's cash collection
    const todayCashCollection = {
        date: '2026-01-31',
        totalAmount: 125400,
        totalNotes: 342,
        breakdown: [
            { denomination: 2000, count: 15, amount: 30000 },
            { denomination: 500, count: 45, amount: 22500 },
            { denomination: 200, count: 82, amount: 16400 },
            { denomination: 100, count: 156, amount: 15600 },
            { denomination: 50, count: 28, amount: 1400 },
            { denomination: 20, count: 12, amount: 240 },
            { denomination: 10, count: 4, amount: 40 },
        ]
    };

    // Mock data for historical cash collection (extended for date picker demo)
    const allHistoricalCashData = [
        { date: '2026-01-30', totalAmount: 98500, totalNotes: 289, breakdown: [
            { denomination: 2000, count: 12, amount: 24000 },
            { denomination: 500, count: 38, amount: 19000 },
            { denomination: 200, count: 65, amount: 13000 },
            { denomination: 100, count: 142, amount: 14200 },
            { denomination: 50, count: 24, amount: 1200 },
            { denomination: 20, count: 6, amount: 120 },
            { denomination: 10, count: 2, amount: 20 },
        ]},
        { date: '2026-01-29', totalAmount: 112300, totalNotes: 315, breakdown: [
            { denomination: 2000, count: 18, amount: 36000 },
            { denomination: 500, count: 42, amount: 21000 },
            { denomination: 200, count: 71, amount: 14200 },
            { denomination: 100, count: 148, amount: 14800 },
            { denomination: 50, count: 26, amount: 1300 },
            { denomination: 20, count: 8, amount: 160 },
            { denomination: 10, count: 2, amount: 20 },
        ]},
        { date: '2026-01-28', totalAmount: 87600, totalNotes: 256, breakdown: [
            { denomination: 2000, count: 10, amount: 20000 },
            { denomination: 500, count: 32, amount: 16000 },
            { denomination: 200, count: 58, amount: 11600 },
            { denomination: 100, count: 135, amount: 13500 },
            { denomination: 50, count: 18, amount: 900 },
            { denomination: 20, count: 5, amount: 100 },
            { denomination: 10, count: 8, amount: 80 },
        ]},
        { date: '2026-01-27', totalAmount: 105800, totalNotes: 298, breakdown: [
            { denomination: 2000, count: 16, amount: 32000 },
            { denomination: 500, count: 40, amount: 20000 },
            { denomination: 200, count: 68, amount: 13600 },
            { denomination: 100, count: 140, amount: 14000 },
            { denomination: 50, count: 22, amount: 1100 },
            { denomination: 20, count: 10, amount: 200 },
            { denomination: 10, count: 2, amount: 20 },
        ]},
        { date: '2026-01-26', totalAmount: 93200, totalNotes: 275, breakdown: [
            { denomination: 2000, count: 14, amount: 28000 },
            { denomination: 500, count: 35, amount: 17500 },
            { denomination: 200, count: 62, amount: 12400 },
            { denomination: 100, count: 138, amount: 13800 },
            { denomination: 50, count: 20, amount: 1000 },
            { denomination: 20, count: 5, amount: 100 },
            { denomination: 10, count: 1, amount: 10 },
        ]},
        { date: '2026-01-25', totalAmount: 118600, totalNotes: 328, breakdown: [
            { denomination: 2000, count: 20, amount: 40000 },
            { denomination: 500, count: 45, amount: 22500 },
            { denomination: 200, count: 75, amount: 15000 },
            { denomination: 100, count: 150, amount: 15000 },
            { denomination: 50, count: 28, amount: 1400 },
            { denomination: 20, count: 9, amount: 180 },
            { denomination: 10, count: 1, amount: 10 },
        ]},
        { date: '2026-01-24', totalAmount: 82400, totalNotes: 242, breakdown: [
            { denomination: 2000, count: 8, amount: 16000 },
            { denomination: 500, count: 30, amount: 15000 },
            { denomination: 200, count: 55, amount: 11000 },
            { denomination: 100, count: 130, amount: 13000 },
            { denomination: 50, count: 16, amount: 800 },
            { denomination: 20, count: 3, amount: 60 },
            { denomination: 10, count: 0, amount: 0 },
        ]},
    ];

    // Filter historical data based on toggle and date
    const historicalCashData = showAllDays
        ? allHistoricalCashData.filter(data => data.date <= selectedDate)
        : allHistoricalCashData.slice(0, 3);

    // Mock detailed transactions
    const detailedTransactions = [
        { id: 'CSH001', student: 'Rahul Kumar', grade: 'Grade 10-A', amount: 12000, feeType: 'School Fee', paymentMethod: 'Cash', date: '2026-01-31', time: '09:30 AM', receivedBy: 'Admin Office', denomination: { 500: 24 } },
        { id: 'CSH002', student: 'Priya Singh', grade: 'Grade 8-B', amount: 8500, feeType: 'Transport Fee', paymentMethod: 'Cash', date: '2026-01-31', time: '10:15 AM', receivedBy: 'Accounts Dept', denomination: { 2000: 4, 500: 1 } },
        { id: 'CSH003', student: 'Amit Sharma', grade: 'Grade 5-A', amount: 15000, feeType: 'School Fee', paymentMethod: 'Cash', date: '2026-01-31', time: '11:00 AM', receivedBy: 'Admin Office', denomination: { 2000: 7, 500: 2 } },
        { id: 'CSH004', student: 'Sneha Patel', grade: 'Grade 3-C', amount: 5200, feeType: 'ECA Fee', paymentMethod: 'Cash', date: '2026-01-31', time: '11:45 AM', receivedBy: 'Accounts Dept', denomination: { 2000: 2, 500: 2, 200: 1 } },
        { id: 'CSH005', student: 'Vikram Reddy', grade: 'Grade 7-A', amount: 10800, feeType: 'School Fee', paymentMethod: 'Cash', date: '2026-01-31', time: '02:30 PM', receivedBy: 'Admin Office', denomination: { 2000: 5, 500: 1, 200: 1, 100: 1 } },
        { id: 'CSH006', student: 'Anjali Verma', grade: 'Grade 6-B', amount: 7500, feeType: 'Transport Fee', paymentMethod: 'Cash', date: '2026-01-30', time: '10:00 AM', receivedBy: 'Accounts Dept', denomination: { 2000: 3, 500: 3 } },
        { id: 'CSH007', student: 'Karan Mehta', grade: 'Grade 9-A', amount: 13200, feeType: 'School Fee', paymentMethod: 'Cash', date: '2026-01-30', time: '11:20 AM', receivedBy: 'Admin Office', denomination: { 2000: 6, 500: 2, 200: 1 } },
        { id: 'CSH008', student: 'Divya Joshi', grade: 'Grade 4-C', amount: 6400, feeType: 'Additional Fee', paymentMethod: 'Cash', date: '2026-01-30', time: '03:15 PM', receivedBy: 'Accounts Dept', denomination: { 2000: 3, 200: 2 } },
    ];

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', pr: 1 }}>
            {/* Today's Summary KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        boxShadow: 'none',
                        border: '1px solid #0891B2',
                        borderRadius: '4px',
                        bgcolor: '#F0F9FA'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                                        Today's Cash Collection
                                    </Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0891B2' }}>
                                        {formatCurrency(todayCashCollection.totalAmount)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <TrendingUpIcon sx={{ fontSize: 14, color: '#10B981', mr: 0.5 }} />
                                        <Typography sx={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                                            {todayCashCollection.totalNotes} notes
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    bgcolor: '#0891B21A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CurrencyRupeeIcon sx={{ fontSize: 26, color: '#0891B2' }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        boxShadow: 'none',
                        border: '1px solid #10B981',
                        borderRadius: '4px',
                        bgcolor: '#F0FDF4'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                                        High Value Notes
                                    </Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>
                                        {formatCurrency(
                                            todayCashCollection.breakdown
                                                .filter(item => item.denomination >= 500)
                                                .reduce((sum, item) => sum + item.amount, 0)
                                        )}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 1, fontWeight: 600 }}>
                                        ₹500 and above
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    bgcolor: '#10B9811A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <MonetizationOnIcon sx={{ fontSize: 26, color: '#10B981' }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        boxShadow: 'none',
                        border: '1px solid #8B5CF6',
                        borderRadius: '4px',
                        bgcolor: '#F5F3FF'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                                        Total Transactions
                                    </Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#8B5CF6' }}>
                                        {detailedTransactions.filter(t => t.date === todayCashCollection.date).length}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 1, fontWeight: 600 }}>
                                        Cash payments today
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    bgcolor: '#8B5CF61A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ReceiptLongIcon sx={{ fontSize: 26, color: '#8B5CF6' }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Card sx={{
                        boxShadow: 'none',
                        border: '1px solid #F59E0B',
                        borderRadius: '4px',
                        bgcolor: '#FFFBEB'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                                        Average Transaction
                                    </Typography>
                                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#F59E0B' }}>
                                        {formatCurrency(
                                            Math.round(todayCashCollection.totalAmount /
                                            detailedTransactions.filter(t => t.date === todayCashCollection.date).length)
                                        )}
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 1, fontWeight: 600 }}>
                                        Per transaction
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    bgcolor: '#F59E0B1A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CalendarTodayIcon sx={{ fontSize: 26, color: '#F59E0B' }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Today's Denomination Breakdown */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card sx={{
                        boxShadow: 'none',
                        border: '1px solid #E8E8E8',
                        borderRadius: '4px',
                        bgcolor: '#FFFFFF'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                                    Today's Cash Denomination Breakdown
                                </Typography>
                                <Chip
                                    label={formatDate(todayCashCollection.date)}
                                    size="small"
                                    sx={{
                                        bgcolor: '#0891B21A',
                                        color: '#0891B2',
                                        fontWeight: 600,
                                        fontSize: '11px'
                                    }}
                                />
                            </Box>

                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#475569', py: 1.5 }}>
                                                Denomination
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                                                Number of Notes
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                                                Total Amount
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                                                % of Total
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {todayCashCollection.breakdown.map((item) => {
                                            const percentage = ((item.amount / todayCashCollection.totalAmount) * 100).toFixed(1);
                                            return (
                                                <TableRow
                                                    key={item.denomination}
                                                    sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}
                                                >
                                                    <TableCell sx={{ py: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{
                                                                bgcolor: item.denomination >= 500 ? '#FEE2E2' : '#DBEAFE',
                                                                px: 1.2,
                                                                py: 0.4,
                                                                borderRadius: '4px',
                                                                minWidth: 65,
                                                                textAlign: 'center'
                                                            }}>
                                                                <Typography sx={{
                                                                    fontSize: '13px',
                                                                    fontWeight: 700,
                                                                    color: item.denomination >= 500 ? '#DC2626' : '#2563EB'
                                                                }}>
                                                                    ₹{item.denomination}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ py: 1 }}>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                                                            {item.count}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ py: 1 }}>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>
                                                            {formatCurrency(item.amount)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ py: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                            <Box sx={{
                                                                width: '55px',
                                                                height: '6px',
                                                                bgcolor: '#E5E7EB',
                                                                borderRadius: '3px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <Box sx={{
                                                                    width: `${percentage}%`,
                                                                    height: '100%',
                                                                    bgcolor: '#10B981',
                                                                    transition: 'width 0.3s'
                                                                }} />
                                                            </Box>
                                                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#64748B', minWidth: 40 }}>
                                                                {percentage}%
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '13px', color: '#1E293B', py: 1.5 }}>
                                                TOTAL
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>
                                                {todayCashCollection.totalNotes}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '14px', color: '#10B981' }}>
                                                {formatCurrency(todayCashCollection.totalAmount)}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '13px', color: '#1E293B' }}>
                                                100%
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Historical Cash Collection */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card sx={{
                        boxShadow: 'none',
                        border: '1px solid #E8E8E8',
                        borderRadius: '4px',
                        bgcolor: '#FFFFFF'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                                    Past Days Cash Collection
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <TextField
                                        type="date"
                                        size="small"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarTodayIcon sx={{ fontSize: 16, color: '#64748B' }} />
                                                    </InputAdornment>
                                                ),
                                            }
                                        }}
                                        sx={{
                                            width: 200,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                bgcolor: '#fff'
                                            }
                                        }}
                                    />
                                    <Button
                                        variant={showAllDays ? 'contained' : 'outlined'}
                                        size="small"
                                        onClick={() => setShowAllDays(!showAllDays)}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            px: 2,
                                            py: 0.75,
                                            borderColor: '#CBD5E1',
                                            color: showAllDays ? '#fff' : '#475569',
                                            bgcolor: showAllDays ? '#0891B2' : 'transparent',
                                            '&:hover': {
                                                borderColor: '#94A3B8',
                                                bgcolor: showAllDays ? '#0e7490' : '#F8FAFC'
                                            }
                                        }}
                                    >
                                        {showAllDays ? 'Show Last 3 Days' : 'Show All Days'}
                                    </Button>
                                </Box>
                            </Box>

                            {historicalCashData.map((dayData, index) => (
                                <Box key={dayData.date} sx={{ mb: index !== historicalCashData.length - 1 ? 2.5 : 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Chip
                                                label={formatDate(dayData.date)}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#DBEAFE',
                                                    color: '#2563EB',
                                                    fontWeight: 600,
                                                    fontSize: '11px',
                                                    height: '24px'
                                                }}
                                            />
                                            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>
                                                {formatCurrency(dayData.totalAmount)}
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                                                ({dayData.totalNotes} notes)
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#FAFBFC' }}>
                                                    {dayData.breakdown.map((item) => (
                                                        <TableCell key={item.denomination} align="center" sx={{ py: 1, px: 1 }}>
                                                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                                                                ₹{item.denomination}
                                                            </Typography>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    {dayData.breakdown.map((item) => (
                                                        <TableCell key={item.denomination} align="center" sx={{ py: 0.8, px: 1 }}>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                                                                {item.count}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#10B981' }}>
                                                                {formatCurrency(item.amount)}
                                                            </Typography>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {index !== historicalCashData.length - 1 && <Divider sx={{ mt: 2.5 }} />}
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Cash Transactions */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card sx={{
                        boxShadow: 'none',
                        border: '1px solid #E8E8E8',
                        borderRadius: '4px',
                        bgcolor: '#FFFFFF'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                                    Recent Cash Transactions
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '4px',
                                        borderColor: '#CBD5E1',
                                        color: '#475569',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        py: 0.5,
                                        px: 1.5,
                                        '&:hover': {
                                            borderColor: '#94A3B8',
                                            bgcolor: '#F8FAFC'
                                        }
                                    }}
                                >
                                    Export
                                </Button>
                            </Box>

                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', bgcolor: '#F8FAFC', color: '#475569', py: 1.5 }}>
                                                Transaction ID
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', bgcolor: '#F8FAFC', color: '#475569' }}>
                                                Student Details
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', bgcolor: '#F8FAFC', color: '#475569' }}>
                                                Fee Type
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '12px', bgcolor: '#F8FAFC', color: '#475569' }}>
                                                Amount
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', bgcolor: '#F8FAFC', color: '#475569' }}>
                                                Denomination
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', bgcolor: '#F8FAFC', color: '#475569' }}>
                                                Date & Time
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', bgcolor: '#F8FAFC', color: '#475569' }}>
                                                Received By
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {detailedTransactions.map((txn) => (
                                            <TableRow key={txn.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED' }}>
                                                        {txn.id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1E293B' }}>
                                                        {txn.student}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#64748B' }}>
                                                        {txn.grade}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Chip
                                                        label={txn.feeType}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#F0FDF4',
                                                            color: '#16A34A',
                                                            fontSize: '10px',
                                                            fontWeight: 600,
                                                            height: '20px'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ py: 1 }}>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
                                                        {formatCurrency(txn.amount)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                                                        {Object.entries(txn.denomination).map(([denom, count]) => (
                                                            <Chip
                                                                key={denom}
                                                                label={`₹${denom} × ${count}`}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: '#DBEAFE',
                                                                    color: '#2563EB',
                                                                    fontSize: '9px',
                                                                    fontWeight: 600,
                                                                    height: '18px'
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#1E293B' }}>
                                                        {formatDate(txn.date)}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '10px', color: '#64748B' }}>
                                                        {txn.time}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ py: 1 }}>
                                                    <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                                                        {txn.receivedBy}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
