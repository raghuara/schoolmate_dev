import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Avatar,
    LinearProgress,
    Divider,
    Chip,
    CircularProgress,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PeopleIcon from '@mui/icons-material/People';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import AdvancedRevenueChart from './AdvancedRevenueChart';
import axios from 'axios';
import { overView } from '../../../../Api/Api';

const token = "123";

// Static card config — colors, icons (API provides the values)
const cardConfig = [
    {
        title: 'Total Revenue',
        icon: AccountBalanceWalletIcon,
        color: '#0891B2',
        bgColor: '#F0F9FA',
    },
    {
        title: 'Collected Today',
        icon: CheckCircleIcon,
        color: '#22C55E',
        bgColor: '#F1F8F4',
    },
    {
        title: 'Pending Fees',
        icon: PendingActionsIcon,
        color: '#F97316',
        bgColor: '#FFF8F0',
    },
    {
        title: 'Total Students',
        icon: PeopleIcon,
        color: '#E91E63',
        bgColor: '#FFF0F5',
    },
];

export default function OverviewTab({ selectedYear }) {
    const [overviewData, setOverviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchOverviewData();
    }, [selectedYear]);

    const fetchOverviewData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(overView, {
                params: { year: selectedYear },
                headers: { Authorization: `Bearer ${token}` },
            });
            setOverviewData(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Map API data to card values
    const cardValues = [
        {
            value: overviewData?.totalRevenue?.display ?? '₹0',
            subtitle: 'This Year',
        },
        {
            value: overviewData?.collectedToday?.display ?? '₹0',
            subtitle: `${overviewData?.collectedTodayTransactions ?? 0} Transactions`,
        },
        {
            value: overviewData?.pendingFees?.display ?? '₹0',
            subtitle: `${overviewData?.pendingStudents ?? 0} Students`,
        },
        {
            value: overviewData?.totalStudents?.toLocaleString() ?? '0',
            subtitle: 'Active Students',
        },
    ];

    const yearlySummary = overviewData?.yearlySummary;
    const collectionByCategory = overviewData?.collectionByCategory ?? [];
    const quickStats = overviewData?.quickStats;
    const defaultersData = overviewData?.quickStats?.feeDefaultersByGrade ?? [];

    return (
        <Box px={2}>
            {/* Statistics Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {cardConfig.map((card, index) => {
                    const IconComponent = card.icon;
                    const vals = cardValues[index];
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    boxShadow: 'none',
                                    border: `1px solid ${card.color}`,
                                    borderRadius: '4px',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    bgcolor: card.bgColor,
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                {card.title}
                                            </Typography>
                                            {isLoading ? (
                                                <CircularProgress size={20} sx={{ my: 1 }} />
                                            ) : (
                                                <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', mb: 0.5 }}>
                                                    {vals.value}
                                                </Typography>
                                            )}
                                            <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                {vals.subtitle}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: card.bgColor, width: 48, height: 48 }}>
                                            <IconComponent sx={{ color: card.color, fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Advanced Revenue Chart + Right Panel */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8 }}>
                    <AdvancedRevenueChart />
                </Grid>

                {/* Financial Highlights */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                    <Grid container rowSpacing={3}>

                        {/* Yearly Summary */}
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                                        Yearly Summary
                                    </Typography>
                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography sx={{ fontSize: '13px', color: '#666' }}>Total Collection</Typography>
                                                <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#7C3AED' }}>
                                                    {yearlySummary?.totalCollection?.display ?? '₹0'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography sx={{ fontSize: '13px', color: '#666' }}>Total Expenses</Typography>
                                                <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#E91E63' }}>
                                                    {yearlySummary?.totalExpenses?.display ?? '₹0'}
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ my: 1.5 }} />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>Net Profit</Typography>
                                                <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#22C55E' }}>
                                                    {yearlySummary?.netProfit?.display ?? '₹0'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Collection by Category */}
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                                        Collection by Category
                                    </Typography>
                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : (
                                        <Box>
                                            {collectionByCategory.map((item, idx) => {
                                                const colors = ['#7C3AED', '#0891B2', '#22C55E', '#F97316'];
                                                const color = colors[idx % colors.length];
                                                return (
                                                    <Box key={item.category} sx={{ mb: idx < collectionByCategory.length - 1 ? 2 : 0 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                                                                <Typography sx={{ fontSize: '12px', color: '#666' }}>{item.category}</Typography>
                                                            </Box>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                                {item.amount?.display ?? '₹0'} ({item.percentage}%)
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={item.percentage}
                                                            sx={{
                                                                height: 6,
                                                                borderRadius: 3,
                                                                bgcolor: '#E8E8E8',
                                                                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                                                            }}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Quick Stats */}
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                                        Quick Stats
                                    </Typography>
                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '12px', color: '#666' }}>Outstanding Dues</Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>
                                                    {quickStats?.outstandingDues?.display ?? '₹0'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '12px', color: '#666' }}>Fee Defaulters</Typography>
                                                <Chip
                                                    label={`${quickStats?.feeDefaulters ?? 0} Students`}
                                                    size="small"
                                                    sx={{ bgcolor: '#FEF3C7', color: '#F59E0B', fontWeight: '600', fontSize: '10px', height: '22px' }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '12px', color: '#666' }}>Total Students</Typography>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                    {overviewData?.totalStudents ?? 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Fee Defaulters by Grade */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{mt:"-90px"}}>
                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                Fee Defaulters by Grade
                            </Typography>
                            {isLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={defaultersData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                                        <XAxis
                                            dataKey="grade"
                                            stroke="#666"
                                            style={{ fontSize: '10px' }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis stroke="#666" style={{ fontSize: '10px' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            }}
                                            formatter={(value) => [`${value} students`, 'Students']}
                                        />
                                        <Bar dataKey="count" fill="#E91E63" name="Students" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
