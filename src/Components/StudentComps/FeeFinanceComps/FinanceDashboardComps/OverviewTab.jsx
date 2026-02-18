import React from 'react';
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
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
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

export default function OverviewTab({ stats, defaultersData }) {
    return (
        <Box px={2}>
            {/* Statistics Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 4,
                                lg: 3
                            }}
                            key={index}
                        >
                            <Card
                                sx={{
                                    height: '100%',
                                    boxShadow: 'none',
                                    border: `1px solid ${stat.color}`,
                                    borderRadius: '4px',
                                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                    bgcolor: stat.bgColor,
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        borderColor: stat.color,
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                {stat.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', mb: 0.5 }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography sx={{ fontSize: '11px', color: '#999', mb: 1 }}>
                                                {stat.subtitle}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                {stat.trend === 'up' ? (
                                                    <TrendingUpIcon sx={{ fontSize: 14, color: '#22C55E' }} />
                                                ) : (
                                                    <TrendingDownIcon sx={{ fontSize: 14, color: '#DC2626' }} />
                                                )}
                                                <Typography
                                                    sx={{
                                                        fontSize: '12px',
                                                        color: stat.trend === 'up' ? '#22C55E' : '#DC2626',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {stat.change}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Avatar
                                            sx={{
                                                bgcolor: stat.bgColor,
                                                width: 48,
                                                height: 48,
                                            }}
                                        >
                                            <IconComponent sx={{ color: stat.color, fontSize: 24 }} />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Advanced Revenue Chart - Like Image */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 8
                    }}
                >
                    <AdvancedRevenueChart />
                </Grid>

                {/* Financial Highlights */}
                <Grid
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 4
                    }}
                >
                    <Grid container spacing={2}>
                        {/* Monthly Summary */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                                        Monthly Summary
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography sx={{ fontSize: '13px', color: '#666' }}>Total Collection</Typography>
                                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#7C3AED' }}>
                                                ₹68.5L
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography sx={{ fontSize: '13px', color: '#666' }}>Total Expenses</Typography>
                                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#E91E63' }}>
                                                ₹33.5L
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>Net Profit</Typography>
                                            <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#22C55E' }}>
                                                ₹35.0L
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Fee Categories Breakdown */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                                        Collection by Category
                                    </Typography>
                                    <Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#7C3AED' }} />
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>School Fee</Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹35L (51%)</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={51}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: '#E8E8E8',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: '#7C3AED',
                                                        borderRadius: 3,
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0891B2' }} />
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Transport Fee</Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹12L (18%)</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={18}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: '#E8E8E8',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: '#0891B2',
                                                        borderRadius: 3,
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E' }} />
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>ECA Fee</Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹8L (12%)</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={12}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: '#E8E8E8',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: '#22C55E',
                                                        borderRadius: 3,
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F97316' }} />
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Additional Fee</Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹5L (7%)</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={7}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: '#E8E8E8',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: '#F97316',
                                                        borderRadius: 3,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Quick Stats */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                                        Quick Stats
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: '12px', color: '#666' }}>Average Fee per Student</Typography>
                                            <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹54,950</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: '12px', color: '#666' }}>Outstanding Dues</Typography>
                                            <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>₹12.5L</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: '12px', color: '#666' }}>Fee Defaulters</Typography>
                                            <Chip label="119 Students" size="small" sx={{ bgcolor: '#FEF3C7', color: '#F59E0B', fontWeight: '600', fontSize: '10px', height: '22px' }} />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>



            {/* Charts Row 2 - Grade Collection & Payment Methods */}
            <Grid container spacing={3} sx={{ mb: 3 }}>


                <Grid
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 6
                    }}
                >
                    <Grid container spacing={2}>


                        {/* Defaulters Chart */}
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 12,
                                lg: 12
                            }}
                            sx={{ mt: "-90px" }}
                        >
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                        Fee Defaulters by Grade
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={defaultersData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                                            <XAxis dataKey="grade" stroke="#666" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={60} />
                                            <YAxis stroke="#666" style={{ fontSize: '10px' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                                }}
                                                formatter={(value, name) => [
                                                    name === 'count' ? `${value} students` : `₹${value.toLocaleString()}`,
                                                    name === 'count' ? 'Students' : 'Amount'
                                                ]}
                                            />
                                            <Bar dataKey="count" fill="#E91E63" name="Students" radius={[4, 4, 0, 0]} />
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
