import React, { useEffect, useState } from 'react';
import { Box, Chip, Divider, Grid, LinearProgress, Skeleton, Typography } from '@mui/material';
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
    Tooltip as ReTooltip,
    ResponsiveContainer,
} from 'recharts';
import AdvancedRevenueChart from './AdvancedRevenueChart';
import axios from 'axios';
import { overView } from '../../../../Api/Api';
import { DASH, BRAND, KPI_TONES, Panel, SolidStatCard, ChartTooltip, EmptyNote } from '../../../DashBoardComps/dashboardTheme';

const token = "123";

const CATEGORY_COLORS = [DASH.violet, DASH.blue, DASH.green, DASH.amber];

const cardConfig = [
    { title: 'Total Revenue', icon: AccountBalanceWalletIcon, tone: KPI_TONES.cyan },
    { title: 'Collected Today', icon: CheckCircleIcon, tone: KPI_TONES.green },
    { title: 'Pending Fees', icon: PendingActionsIcon, tone: KPI_TONES.orange },
    { title: 'Total Students', icon: PeopleIcon, tone: KPI_TONES.violet },
];

const SummaryRow = ({ label, value, color, strong }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, py: 0.6 }}>
        <Typography sx={{ fontSize: '12.5px', color: DASH.muted, fontWeight: strong ? 700 : 400 }}>
            {label}
        </Typography>
        <Typography sx={{ fontSize: strong ? '14px' : '13px', fontWeight: strong ? 800 : 700, color: color || DASH.ink }}>
            {value}
        </Typography>
    </Box>
);

export default function OverviewTab({ selectedYear }) {
    const [overviewData, setOverviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchOverviewData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const cardValues = [
        {
            value: overviewData?.totalRevenue?.display ?? '₹0',
            subtitle: 'This year',
        },
        {
            value: overviewData?.collectedToday?.display ?? '₹0',
            subtitle: `${overviewData?.collectedTodayTransactions ?? 0} transactions`,
        },
        {
            value: overviewData?.pendingFees?.display ?? '₹0',
            subtitle: `${overviewData?.pendingStudents ?? 0} students`,
        },
        {
            value: overviewData?.totalStudents?.toLocaleString() ?? '0',
            subtitle: 'Active students',
        },
    ];

    const yearlySummary = overviewData?.yearlySummary;
    const collectionByCategory = overviewData?.collectionByCategory ?? [];
    const quickStats = overviewData?.quickStats;
    const defaultersData = overviewData?.quickStats?.feeDefaultersByGrade ?? [];

    return (
        <Box>
            <Grid container spacing={2} sx={{ mb: 2, alignItems: 'stretch' }}>
                {cardConfig.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }} key={card.title}>
                        <SolidStatCard
                            icon={card.icon}
                            label={card.title}
                            value={isLoading ? <Skeleton width={110} height={28} /> : cardValues[index].value}
                            note={isLoading ? "" : cardValues[index].subtitle}
                            tone={card.tone}
                        />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2, alignItems: 'stretch' }}>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8 }}>
                    <AdvancedRevenueChart selectedYear={selectedYear} />
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                    <Grid container spacing={2} sx={{ height: '100%', alignContent: 'stretch' }}>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 12 }}>
                            <Panel title="Yearly Summary" subtitle={`Academic year ${selectedYear}`} accent={DASH.violet} sx={{ height: '100%' }}>
                                {isLoading ? (
                                    <Box>
                                        <Skeleton height={26} />
                                        <Skeleton height={26} />
                                        <Skeleton height={26} width="70%" />
                                    </Box>
                                ) : (
                                    <Box>
                                        <SummaryRow
                                            label="Total Collection"
                                            value={yearlySummary?.totalCollection?.display ?? '₹0'}
                                            color={DASH.violet}
                                        />
                                        <SummaryRow
                                            label="Total Expenses"
                                            value={yearlySummary?.totalExpenses?.display ?? '₹0'}
                                            color={BRAND.pink.main}
                                        />
                                        <Divider sx={{ my: 1 }} />
                                        <SummaryRow
                                            label="Net Profit"
                                            value={yearlySummary?.netProfit?.display ?? '₹0'}
                                            color={DASH.green}
                                            strong
                                        />
                                    </Box>
                                )}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 12 }}>
                            <Panel title="Quick Stats" accent={DASH.violet} sx={{ height: '100%' }}>
                                {isLoading ? (
                                    <Box>
                                        <Skeleton height={26} />
                                        <Skeleton height={26} />
                                        <Skeleton height={26} width="60%" />
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <SummaryRow
                                            label="Outstanding Dues"
                                            value={quickStats?.outstandingDues?.display ?? '₹0'}
                                            color={DASH.red}
                                        />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6 }}>
                                            <Typography sx={{ fontSize: '12.5px', color: DASH.muted }}>Fee Defaulters</Typography>
                                            <Chip
                                                label={`${quickStats?.feeDefaulters ?? 0} students`}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '10.5px',
                                                    fontWeight: 700,
                                                    bgcolor: DASH.amberLight,
                                                    color: DASH.amber,
                                                }}
                                            />
                                        </Box>
                                        <SummaryRow
                                            label="Total Students"
                                            value={overviewData?.totalStudents ?? 0}
                                        />
                                    </Box>
                                )}
                            </Panel>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Panel
                        title="Collection by Category"
                        subtitle="Share of what has been collected"
                        accent={DASH.primary}
                        sx={{ height: '100%' }}
                    >
                        {isLoading ? (
                            <Box>
                                {[0, 1, 2, 3].map((i) => (
                                    <Box key={i} sx={{ mb: 2 }}>
                                        <Skeleton height={18} width="60%" />
                                        <Skeleton height={8} />
                                    </Box>
                                ))}
                            </Box>
                        ) : collectionByCategory.length === 0 ? (
                            <EmptyNote text="No collection recorded for this year yet." />
                        ) : (
                            <Box>
                                {collectionByCategory.map((item, idx) => {
                                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                                    return (
                                        <Box key={item.category} sx={{ mb: idx < collectionByCategory.length - 1 ? 2 : 0 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                                    <Box sx={{ width: 9, height: 9, borderRadius: '2px', bgcolor: color, flexShrink: 0 }} />
                                                    <Typography sx={{ fontSize: '12.5px', color: DASH.text }} noWrap>
                                                        {item.category}
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: DASH.ink, whiteSpace: 'nowrap' }}>
                                                    {item.amount?.display ?? '₹0'}
                                                    <Box component="span" sx={{ color: DASH.faint, fontWeight: 600, ml: 0.6 }}>
                                                        {item.percentage}%
                                                    </Box>
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={Number(item.percentage) || 0}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: DASH.lineSoft,
                                                    '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                                                }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Panel
                        title="Fee Defaulters by Grade"
                        subtitle={`${quickStats?.feeDefaulters ?? 0} students across all grades`}
                        accent={BRAND.pink.main}
                        sx={{ height: '100%' }}
                    >
                        {isLoading ? (
                            <Skeleton variant="rounded" height={210} />
                        ) : defaultersData.length === 0 ? (
                            <EmptyNote text="No fee defaulters for this year." />
                        ) : (
                            <Box sx={{ height: 230 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={defaultersData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                        <XAxis
                                            dataKey="grade"
                                            tick={{ fontSize: 10.5, fill: DASH.muted }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                            angle={-35}
                                            textAnchor="end"
                                            height={54}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: DASH.muted }}
                                            axisLine={false}
                                            tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <ReTooltip content={<ChartTooltip suffix=" students" />} cursor={{ fill: DASH.lineSoft }} />
                                        <Bar dataKey="count" name="Students" fill={BRAND.pink.main} radius={[5, 5, 0, 0]} maxBarSize={34} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        )}
                    </Panel>
                </Grid>
            </Grid>
        </Box>
    );
}
