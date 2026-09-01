import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
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
    Skeleton,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TodayIcon from '@mui/icons-material/Today';
import axios from 'axios';
import { cashCollection } from '../../../../Api/Api';
import {
    DASH, RADIUS, KPI_TONES, Panel, SolidStatCard, EmptyNote,
} from '../../../DashBoardComps/dashboardTheme';

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

const STATUS_TONES = {
    Completed: { bg: DASH.greenLight, color: DASH.green },
    Pending: { bg: DASH.amberLight, color: DASH.amber },
};
const STATUS_FALLBACK = { bg: DASH.redLight, color: DASH.red };

const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

export default function CashCollectionTab({ cashDate, setCashDate, selectedYear }) {
    const [cashData, setCashData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCashCollection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cashDate, selectedYear]);

    const fetchCashCollection = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(cashCollection, {
                params: { year: selectedYear, date: cashDate || today },
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
    const isToday = cashDate === today;
    const studentsPaid = cashData?.studentsPaid ?? 0;

    const cards = [
        {
            label: 'Total Cash Collected',
            value: cashData?.totalCashCollected?.display ?? '₹0',
            note: 'All time cash collected',
            tone: KPI_TONES.green,
        },
        {
            label: isToday ? 'Collected Today' : 'Collected On Date',
            value: cashData?.todayCashCollected?.display ?? '₹0',
            note: `${studentsPaid} receipt${studentsPaid === 1 ? '' : 's'} ${isToday ? 'today' : `on ${formatDate(cashDate)}`}`,
            tone: KPI_TONES.cyan,
        },
        {
            label: 'Students Paid',
            value: studentsPaid,
            note: isToday ? 'Paid in cash today' : `Paid on ${formatDate(cashDate)}`,
            tone: KPI_TONES.violet,
        },
    ];

    return (
        <Box>
            {/* ── Cash at a glance ── */}
            <Grid container spacing={2} sx={{ mb: 2, alignItems: 'stretch' }}>
                {cards.map((card) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={card.label}>
                        <SolidStatCard
                            label={card.label}
                            value={isLoading ? <Skeleton width={110} height={28} /> : card.value}
                            note={isLoading ? '' : card.note}
                            tone={card.tone}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* ── The date both tables below are read against ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 1.5,
                    mb: 2,
                    px: 1.8,
                    py: 1.2,
                    bgcolor: '#fff',
                    border: `1px solid ${DASH.line}`,
                    borderRadius: RADIUS,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                    <Box sx={{ width: 3, height: 26, borderRadius: RADIUS, bgcolor: DASH.cyan, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: DASH.ink, lineHeight: 1.3 }}>
                            Date-wise Breakdown
                        </Typography>
                        <Typography sx={{ fontSize: '11.5px', color: DASH.muted }}>
                            {isToday
                                ? "Denominations and receipts for today"
                                : `Denominations and receipts for ${formatDate(cashDate)}`}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    {isToday ? (
                        <Chip
                            label="Today"
                            size="small"
                            sx={{
                                height: 22, fontSize: '10.5px', fontWeight: 700, borderRadius: RADIUS,
                                bgcolor: DASH.cyanLight, color: DASH.cyan, border: '1px solid #A5F3FC',
                            }}
                        />
                    ) : (
                        <Button
                            onClick={() => setCashDate(today)}
                            startIcon={<TodayIcon sx={{ fontSize: 15 }} />}
                            sx={{
                                textTransform: 'none', fontSize: '12px', fontWeight: 700,
                                color: DASH.cyan, bgcolor: DASH.cyanLight,
                                border: '1px solid #A5F3FC', borderRadius: RADIUS,
                                height: 32, px: 1.4,
                                '&:hover': { bgcolor: DASH.cyanLight, borderColor: DASH.cyan },
                            }}
                        >
                            Back to today
                        </Button>
                    )}
                    <TextField
                        type="date"
                        size="small"
                        value={cashDate}
                        onChange={(e) => setCashDate(e.target.value)}
                        sx={{
                            width: 165,
                            '& .MuiOutlinedInput-root': {
                                height: 32,
                                fontSize: '12.5px',
                                fontWeight: 600,
                                color: DASH.ink,
                                borderRadius: RADIUS,
                                bgcolor: '#fff',
                                '& fieldset': { borderColor: DASH.line },
                                '&:hover fieldset': { borderColor: '#9AA3AF' },
                                '&.Mui-focused fieldset': { borderColor: DASH.cyan, borderWidth: '1px' },
                            },
                        }}
                    />
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                {/* ── What is in the drawer, note by note ── */}
                <Grid size={{ xs: 12, md: 12, lg: 5 }}>
                    <Panel
                        title="Denomination Breakdown"
                        subtitle={isLoading ? 'Counting…' : `${denominationBreakdown.length} denomination${denominationBreakdown.length === 1 ? '' : 's'} recorded`}
                        accent={DASH.green}
                        sx={{ height: '100%' }}
                        bodySx={{ p: 0 }}
                        right={
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: DASH.muted }}>
                                    Grand Total In
                                </Typography>
                                {isLoading ? (
                                    <Skeleton width={80} height={22} />
                                ) : (
                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: DASH.green, lineHeight: 1.2 }}>
                                        {cashData?.grandTotalInwards?.display ?? '₹0'}
                                    </Typography>
                                )}
                            </Box>
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
                                            <TH>Denomination</TH>
                                            <TH>Type</TH>
                                            <TH align="right">In</TH>
                                            <TH align="right">In Amount</TH>
                                            <TH align="right">Out</TH>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {denominationBreakdown.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} sx={{ borderBottom: 'none' }}>
                                                    <EmptyNote text="No denominations were counted for this date." />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            <>
                                                {denominationBreakdown.map((d) => {
                                                    const cfg = denomConfig[d.denomination] ?? { label: `₹${d.denomination}`, color: DASH.muted, bg: DASH.lineSoft };
                                                    const hasIn = d.inwardsCount > 0;
                                                    return (
                                                        <TableRow
                                                            key={d.denomination}
                                                            sx={{ transition: 'background-color 0.15s', '&:hover': { bgcolor: DASH.surface } }}
                                                        >
                                                            <TD>
                                                                <Chip
                                                                    label={cfg.label}
                                                                    size="small"
                                                                    sx={{
                                                                        height: 21,
                                                                        borderRadius: RADIUS,
                                                                        bgcolor: cfg.bg,
                                                                        color: cfg.color,
                                                                        border: `1px solid ${cfg.color}33`,
                                                                        fontWeight: 700,
                                                                        fontSize: '11px',
                                                                    }}
                                                                />
                                                            </TD>
                                                            <TD>
                                                                <Typography sx={{ fontSize: '11.5px', color: DASH.muted }}>{d.type}</Typography>
                                                            </TD>
                                                            <TD align="right">
                                                                <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: hasIn ? DASH.ink : DASH.faint }}>
                                                                    {d.inwardsCount}
                                                                </Typography>
                                                            </TD>
                                                            <TD align="right">
                                                                <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: hasIn ? DASH.ink : DASH.faint, whiteSpace: 'nowrap' }}>
                                                                    {d.inwardsAmount?.display ?? '₹0'}
                                                                </Typography>
                                                            </TD>
                                                            <TD align="right">
                                                                <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: d.outwardsCount > 0 ? DASH.red : DASH.faint }}>
                                                                    {d.outwardsCount}
                                                                </Typography>
                                                            </TD>
                                                        </TableRow>
                                                    );
                                                })}
                                                <TableRow sx={{ bgcolor: DASH.surface }}>
                                                    <TableCell colSpan={3} sx={{ borderBottom: 'none', py: 1.2 }}>
                                                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: DASH.ink }}>
                                                            Grand Total
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ borderBottom: 'none', py: 1.2 }}>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: DASH.green, whiteSpace: 'nowrap' }}>
                                                            {cashData?.grandTotalInwards?.display ?? '₹0'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ borderBottom: 'none', py: 1.2 }}>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: DASH.red, whiteSpace: 'nowrap' }}>
                                                            {cashData?.grandTotalOutwards?.display ?? '₹0'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Panel>
                </Grid>

                {/* ── Receipt by receipt ── */}
                <Grid size={{ xs: 12, md: 12, lg: 7 }}>
                    <Panel
                        title="Cash Transactions"
                        subtitle={
                            isLoading
                                ? 'Loading receipts…'
                                : `${cashTransactions.length} cash receipt${cashTransactions.length === 1 ? '' : 's'} ${isToday ? 'today' : `on ${formatDate(cashDate)}`}`
                        }
                        accent={DASH.cyan}
                        sx={{ height: '100%' }}
                        bodySx={{ p: 0 }}
                    >
                        {isLoading ? (
                            <Box sx={{ p: 2 }}>
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} height={34} sx={{ mb: 0.5 }} />
                                ))}
                            </Box>
                        ) : cashTransactions.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                                <MonetizationOnIcon sx={{ fontSize: 40, color: DASH.line }} />
                                <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: DASH.ink, mt: 1 }}>
                                    No cash receipts for this date
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: DASH.muted, mt: 0.4 }}>
                                    Pick another date above to see earlier collections.
                                </Typography>
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
                                            <TH>Receipt No.</TH>
                                            <TH>Status</TH>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cashTransactions.map((txn, idx) => {
                                            const tone = STATUS_TONES[txn.status] || STATUS_FALLBACK;
                                            return (
                                                <TableRow
                                                    key={idx}
                                                    sx={{ transition: 'background-color 0.15s', '&:hover': { bgcolor: DASH.surface } }}
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
                                                            {txn.rollNumber} · {txn.grade} {txn.section}
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
                                                        <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: DASH.cyan, whiteSpace: 'nowrap' }}>
                                                            {txn.receiptNo}
                                                        </Typography>
                                                    </TD>
                                                    <TD>
                                                        <Chip
                                                            label={txn.status}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                borderRadius: RADIUS,
                                                                bgcolor: tone.bg,
                                                                color: tone.color,
                                                                fontWeight: 700,
                                                                fontSize: '10.5px',
                                                            }}
                                                        />
                                                    </TD>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Panel>
                </Grid>
            </Grid>
        </Box>
    );
}
