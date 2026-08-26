import React, { useEffect, useState } from 'react';
import {
    Box,
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
    Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import axios from 'axios';
import { todaysCollection } from '../../../../Api/Api';
import {
    DASH, RADIUS, BRAND, KPI_TONES, Panel, SolidStatCard, EmptyNote,
} from '../../../DashBoardComps/dashboardTheme';

const token = "123";

const PIE_COLORS = [DASH.cyan, DASH.green, DASH.amber, DASH.violet, BRAND.pink.main];

const STATUS_TONES = {
    Completed: { bg: DASH.greenLight, color: DASH.green },
    Pending: { bg: DASH.amberLight, color: DASH.amber },
};
const STATUS_FALLBACK = { bg: DASH.redLight, color: DASH.red };

// The shared ChartTooltip has no currency prefix, so money charts get their own.
const MoneyTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box
            sx={{
                bgcolor: '#fff',
                border: `1px solid ${DASH.line}`,
                borderRadius: RADIUS,
                px: 1.4,
                py: 1,
                boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            }}
        >
            <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: DASH.ink, mb: 0.4 }}>
                {label || payload[0]?.name}
            </Typography>
            {payload.map((p, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: p.color || p.fill }} />
                    <Typography sx={{ fontSize: '11.5px', color: DASH.muted }}>
                        Collected:{' '}
                        <span style={{ color: DASH.ink, fontWeight: 700 }}>
                            ₹{Number(p.value || 0).toLocaleString('en-IN')}
                        </span>
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

const TH = ({ children, align }) => (
    <TableCell
        align={align}
        sx={{
            bgcolor: DASH.surface,
            borderBottom: `1px solid ${DASH.line}`,
            color: DASH.muted,
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            py: 1,
            whiteSpace: 'nowrap',
        }}
    >
        {children}
    </TableCell>
);

const TD = ({ children, align }) => (
    <TableCell align={align} sx={{ borderBottom: `1px solid ${DASH.lineSoft}`, py: 1 }}>
        {children}
    </TableCell>
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

    const cards = [
        {
            label: 'Total Collections',
            value: data?.totalCollections?.display ?? '₹0',
            note: `${data?.transactions ?? 0} payments received`,
            tone: KPI_TONES.cyan,
        },
        {
            label: 'Transactions',
            value: data?.transactions ?? 0,
            note: 'Receipts issued today',
            tone: KPI_TONES.green,
        },
        {
            label: 'Online Transactions',
            value: data?.onlineTransactions ?? 0,
            note: 'UPI, card & net banking',
            tone: KPI_TONES.orange,
        },
        {
            label: 'Cash in Hand',
            value: data?.cashInHand?.display ?? '₹0',
            note: 'To be deposited',
            tone: KPI_TONES.violet,
        },
    ];

    return (
        <Box>
            {/* ── Today at a glance ── */}
            <Grid container spacing={2} sx={{ mb: 2, alignItems: 'stretch' }}>
                {cards.map((card) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }} key={card.label}>
                        <SolidStatCard
                            label={card.label}
                            value={isLoading ? <Skeleton width={110} height={28} /> : card.value}
                            note={isLoading ? '' : card.note}
                            tone={card.tone}
                        />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                {/* ── Transactions ── */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8 }}>
                    <Panel
                        title="Today's Transactions"
                        subtitle={
                            isLoading
                                ? 'Loading payments…'
                                : `${filteredTransactions.length} of ${todaysTransactions.length} payment${todaysTransactions.length === 1 ? '' : 's'}`
                        }
                        accent={DASH.cyan}
                        sx={{ height: '100%' }}
                        bodySx={{ p: 0 }}
                        right={
                            <TextField
                                size="small"
                                placeholder="Search student…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                sx={{
                                    width: 210,
                                    '& .MuiOutlinedInput-root': {
                                        height: 32,
                                        fontSize: '12.5px',
                                        borderRadius: RADIUS,
                                        bgcolor: '#fff',
                                        '& fieldset': { borderColor: DASH.line },
                                        '&:hover fieldset': { borderColor: '#9AA3AF' },
                                        '&.Mui-focused fieldset': { borderColor: DASH.cyan, borderWidth: '1px' },
                                    },
                                }}
                            />
                        }
                    >
                        {isLoading ? (
                            <Box sx={{ p: 2 }}>
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} height={34} sx={{ mb: 0.5 }} />
                                ))}
                            </Box>
                        ) : (
                            <TableContainer sx={{ maxHeight: 470 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TH>Time</TH>
                                            <TH>Student</TH>
                                            <TH>Fee Type</TH>
                                            <TH align="right">Amount</TH>
                                            <TH>Method</TH>
                                            <TH>Status</TH>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ borderBottom: 'none' }}>
                                                    <EmptyNote
                                                        text={
                                                            todaysTransactions.length === 0
                                                                ? 'No payments have been collected today yet.'
                                                                : `No student matches “${search}”.`
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTransactions.map((txn, idx) => {
                                                const tone = STATUS_TONES[txn.status] || STATUS_FALLBACK;
                                                return (
                                                    <TableRow
                                                        key={idx}
                                                        sx={{
                                                            transition: 'background-color 0.15s',
                                                            '&:hover': { bgcolor: DASH.surface },
                                                        }}
                                                    >
                                                        <TD>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: DASH.text, whiteSpace: 'nowrap' }}>
                                                                {formatTime(txn.paidOn)}
                                                            </Typography>
                                                        </TD>
                                                        <TD>
                                                            <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: DASH.ink }}>
                                                                {txn.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10.5px', color: DASH.faint }}>
                                                                {txn.grade} {txn.section}
                                                            </Typography>
                                                        </TD>
                                                        <TD>
                                                            <Typography sx={{ fontSize: '12px', color: DASH.muted }}>
                                                                {txn.feeType}
                                                            </Typography>
                                                        </TD>
                                                        <TD align="right">
                                                            <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: DASH.ink, whiteSpace: 'nowrap' }}>
                                                                {txn.amount?.display ?? '₹0'}
                                                            </Typography>
                                                        </TD>
                                                        <TD>
                                                            <Chip
                                                                label={txn.method}
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize: '10.5px',
                                                                    fontWeight: 600,
                                                                    borderRadius: RADIUS,
                                                                    bgcolor: DASH.lineSoft,
                                                                    color: DASH.text,
                                                                }}
                                                            />
                                                        </TD>
                                                        <TD>
                                                            <Chip
                                                                label={txn.status}
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize: '10.5px',
                                                                    fontWeight: 700,
                                                                    borderRadius: RADIUS,
                                                                    bgcolor: tone.bg,
                                                                    color: tone.color,
                                                                }}
                                                            />
                                                        </TD>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Panel>
                </Grid>

                {/* ── Breakdowns ── */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                    <Grid container spacing={2} sx={{ height: '100%', alignContent: 'stretch' }}>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 12 }}>
                            <Panel
                                title="Payment Methods"
                                subtitle="How today's money came in"
                                accent={DASH.violet}
                                sx={{ height: '100%' }}
                            >
                                {isLoading ? (
                                    <Skeleton variant="rounded" height={200} />
                                ) : paymentMethods.length === 0 ? (
                                    <EmptyNote text="No payments recorded today." />
                                ) : (
                                    <>
                                        <Box sx={{ position: 'relative', height: 186 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={paymentMethods}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={58}
                                                        outerRadius={80}
                                                        paddingAngle={2}
                                                        dataKey="amount.amount"
                                                        nameKey="method"
                                                        stroke="none"
                                                    >
                                                        {paymentMethods.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <ReTooltip content={<MoneyTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>

                                            {/* Total sits in the donut hole */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    pointerEvents: 'none',
                                                }}
                                            >
                                                <Typography sx={{
                                                    fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.06em',
                                                    textTransform: 'uppercase', color: DASH.faint,
                                                }}>
                                                    Today
                                                </Typography>
                                                <Typography sx={{ fontSize: '17px', fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                                    {data?.totalCollections?.display ?? '₹0'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ mt: 1.5 }}>
                                            {paymentMethods.map((method, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        py: 0.7,
                                                        borderTop: index === 0 ? 'none' : `1px solid ${DASH.lineSoft}`,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                                        <Box sx={{
                                                            width: 9, height: 9, borderRadius: '2px', flexShrink: 0,
                                                            bgcolor: PIE_COLORS[index % PIE_COLORS.length],
                                                        }} />
                                                        <Typography sx={{ fontSize: '12.5px', color: DASH.text }} noWrap>
                                                            {method.method}
                                                        </Typography>
                                                    </Box>
                                                    <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: DASH.ink, whiteSpace: 'nowrap' }}>
                                                        {method.amount?.display ?? '₹0'}
                                                        <Box component="span" sx={{ color: DASH.faint, fontWeight: 600, ml: 0.6 }}>
                                                            {method.percentage}%
                                                        </Box>
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </Panel>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 12 }}>
                            <Panel
                                title="Fee Category Breakdown"
                                subtitle="Collected today by category"
                                accent={DASH.primary}
                                sx={{ height: '100%' }}
                            >
                                {isLoading ? (
                                    <Skeleton variant="rounded" height={180} />
                                ) : feeCategoryBreakdown.length === 0 ? (
                                    <EmptyNote text="Nothing collected today yet." />
                                ) : (
                                    <Box sx={{ height: 190 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={feeCategoryBreakdown}
                                                margin={{ top: 4, right: 8, left: -14, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke={DASH.lineSoft} vertical={false} />
                                                <XAxis
                                                    dataKey="category"
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
                                                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                                                />
                                                <ReTooltip content={<MoneyTooltip />} cursor={{ fill: DASH.lineSoft }} />
                                                <Bar dataKey="Collected" fill={DASH.cyan} radius={[5, 5, 0, 0]} maxBarSize={34} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                )}
                            </Panel>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
