import { Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';
import SnackBar from '../../../SnackBar';
import { paymentApprovalsGet, paymentApprovalUpdate } from '../../../../Api/Api';
import { DASH, RADIUS, BRAND, StatTile } from '../../../DashBoardComps/dashboardTheme';

const PAYMENT_METHOD_COLORS = {
    'UPI': { bg: '#F3E5F5', color: '#7B1FA2' },
    'Net Banking': { bg: '#E3F2FD', color: '#1565C0' },
    'Cheque': { bg: '#FFF3E0', color: '#E65100' },
    'Card': { bg: '#FDECEA', color: '#C62828' },
};

// Payment method filters — order & labels mirror the Billing Screen's payment options
const METHOD_FILTERS = [
    { value: 'all', label: 'All Methods' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Card', label: 'Card' },
];

const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

// API paymentOption → friendly method label (also the key for PAYMENT_METHOD_COLORS & filters)
const methodDisplay = (opt) => {
    switch (opt) {
        case 'UPI': return 'UPI';
        case 'NetBanking': return 'Net Banking';
        case 'Cheque': return 'Cheque';
        case 'Card':
        case 'DebitCard':
        case 'CreditCard': return 'Card';
        default: return opt || '—';
    }
};

const getInitials = (name) =>
    String(name || '').split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

export default function PaymentApprovalsPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth);
    const token = "123";

    const [approvals, setApprovals] = useState([]);
    const [approvalSearch, setApprovalSearch] = useState("");
    const [approvalMethodFilter, setApprovalMethodFilter] = useState("all");
    const [proofDialog, setProofDialog] = useState({ open: false, item: null });
    const [paySummary, setPaySummary] = useState({ pendingCount: 0, pendingAmount: 0, chequesCount: 0, directOnlineCount: 0 });
    const [payLoading, setPayLoading] = useState(false);
    const [payActioning, setPayActioning] = useState(null);

    const [approveItem, setApproveItem] = useState(null);
    const [rejectItem, setRejectItem] = useState(null);
    const [rejectReasonText, setRejectReasonText] = useState("");

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, ok) => { setSnackMessage(msg); setSnackColor(ok); setSnackStatus(ok); setSnackOpen(true); };

    const filteredApprovals = useMemo(() => {
        const q = approvalSearch.trim().toLowerCase();
        return approvals.filter((a) => {
            if (a.status !== 'pending') return false;
            const matchMethod = approvalMethodFilter === 'all' ? true : a.method === approvalMethodFilter;
            const matchSearch = !q || String(a.studentName || '').toLowerCase().includes(q) || String(a.referenceId || '').toLowerCase().includes(q) || String(a.id || '').toLowerCase().includes(q);
            return matchMethod && matchSearch;
        });
    }, [approvals, approvalSearch, approvalMethodFilter]);

    // Summary cards come straight from the API summary.
    const pendingTotal = paySummary.pendingAmount || 0;
    const pendingCount = paySummary.pendingCount || 0;
    const chequeCount = paySummary.chequesCount || 0;
    const directCount = paySummary.directOnlineCount || 0;

    // ── paymentApprovalsGet — pending payments + summary ──
    const fetchPaymentApprovals = async () => {
        setPayLoading(true);
        try {
            const res = await axios.get(paymentApprovalsGet, {
                params: { method: 'all' },
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res?.data || {};
            const mapped = (Array.isArray(data.payments) ? data.payments : []).map((p) => ({
                id: p.billID,
                paymentMethodID: p.paymentMethodID,
                rollNumber: String(p.rollNumber || ''),
                studentName: p.studentName,
                grade: p.grade,
                section: p.section,
                amount: Number(p.totalPaidAmount) || 0,
                method: methodDisplay(p.paymentOption),
                feeType: p.feeType,
                referenceId: p.reference || p.transactionID || '—',
                paymentDate: p.paidDate,
                submittedBy: p.submittedByRollNumber ? `Roll ${p.submittedByRollNumber}` : (p.paidFrom || '—'),
                submittedDate: p.paidDate,
                proofUrl: p.filePathForUPI || null,
                proofType: p.filePathForUPI ? 'screenshot' : 'document',
                status: (p.approvalStatus || '').toLowerCase(),
                note: p.remark,
                source: p.paidFrom ? (p.paidFrom.charAt(0).toUpperCase() + p.paidFrom.slice(1)) : 'System',
            }));
            setApprovals(mapped);
            setPaySummary(data.summary || { pendingCount: 0, pendingAmount: 0, chequesCount: 0, directOnlineCount: 0 });
        } catch (err) {
            console.error('paymentApprovalsGet failed:', err);
            setApprovals([]);
            setPaySummary({ pendingCount: 0, pendingAmount: 0, chequesCount: 0, directOnlineCount: 0 });
        } finally {
            setPayLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentApprovals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── paymentApprovalUpdate — approve / reject ──
    const submitPaymentAction = async (item, status, reason = null) => {
        if (!item) return;
        setPayActioning(item.paymentMethodID);
        try {
            await axios.put(paymentApprovalUpdate, {
                paymentMethodID: item.paymentMethodID,
                rollNumber: user.rollNumber,
                status,            // "Approved" | "Rejected"
                reason: reason || null,
            }, { headers: { Authorization: `Bearer ${token}` } });
            showSnack(`Payment ${status === 'Approved' ? 'approved' : 'rejected'} successfully.`, true);
            await fetchPaymentApprovals();
        } catch (err) {
            console.error('paymentApprovalUpdate failed:', err);
            showSnack('Action failed. Please try again.', false);
        } finally {
            setPayActioning(null);
        }
    };

    const openApprove = (item) => setApproveItem(item);
    const closeApprove = () => setApproveItem(null);
    const confirmApprove = async () => {
        const it = approveItem;
        setApproveItem(null);
        await submitPaymentAction(it, 'Approved', null);
    };

    const openReject = (item) => { setRejectItem(item); setRejectReasonText(""); };
    const closeReject = () => { setRejectItem(null); setRejectReasonText(""); };
    const confirmReject = async () => {
        if (!rejectReasonText.trim()) { showSnack('Please enter a reason for rejection.', false); return; }
        const it = rejectItem;
        const reason = rejectReasonText.trim();
        setRejectItem(null);
        setRejectReasonText("");
        await submitPaymentAction(it, 'Rejected', reason);
    };

    const openProof = (item) => setProofDialog({ open: true, item });
    const closeProof = () => setProofDialog({ open: false, item: null });

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: { xs: 2, md: 3 },
                bgcolor: DASH.canvas,
                boxSizing: "border-box",
            }}
        >
            <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />

            {/* Same header strip the other approval screens use, so this page
                belongs to the Approvals area rather than looking imported. */}
            <Box sx={{ mb: 2 }}>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", mt: "3px", mr: 1 }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: DASH.ink }} />
                        </IconButton>
                        <Box>
                            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>Payment Approval</Typography>
                            <Typography sx={{ fontSize: "12px", color: DASH.muted }}>
                                Verify online and cheque payments collected at the billing counter
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "end" }, gap: 1, py: 1 }}>
                        {pendingCount > 0 && (
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 0.6,
                                px: 1.2, height: 30, borderRadius: RADIUS,
                                bgcolor: '#FFF3E0', border: '1px solid #FFE0B2',
                            }}>
                                <HourglassEmptyIcon sx={{ fontSize: 15, color: '#E65100' }} />
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#E65100' }}>
                                    {pendingCount} awaiting approval
                                </Typography>
                            </Box>
                        )}
                        <Tooltip arrow title="Refresh pending payments">
                            <IconButton
                                onClick={fetchPaymentApprovals}
                                disabled={payLoading}
                                sx={{
                                    width: 30, height: 30, borderRadius: RADIUS,
                                    border: `1px solid ${DASH.line}`, bgcolor: '#fff',
                                    '&:hover': { bgcolor: DASH.lineSoft },
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 17, color: DASH.muted }} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ p: 2, height: "70vh", overflowY: "auto", overflowX: "hidden" }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatTile
                            icon={HourglassEmptyIcon}
                            label="Pending"
                            value={pendingCount}
                            caption="Awaiting approval"
                            accent={DASH.amber}
                            accentBg={DASH.amberLight}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatTile
                            icon={CurrencyRupeeIcon}
                            label="Pending Amount"
                            value={formatCurrency(pendingTotal)}
                            caption="Across pending payments"
                            accent={DASH.green}
                            accentBg={DASH.greenLight}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatTile
                            icon={DescriptionOutlinedIcon}
                            label="Cheques"
                            value={chequeCount}
                            caption="Cheque payments"
                            accent={BRAND.orange.main}
                            accentBg={BRAND.orange.icon}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatTile
                            icon={ImageOutlinedIcon}
                            label="Direct / Online"
                            value={directCount}
                            caption="UPI, net banking & card"
                            accent={BRAND.purple.main}
                            accentBg={BRAND.purple.icon}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            flexWrap: 'wrap',
                            p: 0.4,
                            gap: 0.4,
                            bgcolor: DASH.lineSoft,
                            border: `1px solid ${DASH.line}`,
                            borderRadius: RADIUS,
                        }}
                    >
                        {METHOD_FILTERS.map((m) => {
                            const on = approvalMethodFilter === m.value;
                            const tone = PAYMENT_METHOD_COLORS[m.value]?.color || DASH.ink;
                            return (
                                <Box
                                    key={m.value}
                                    onClick={() => setApprovalMethodFilter(m.value)}
                                    sx={{
                                        px: 1.3,
                                        py: 0.55,
                                        borderRadius: RADIUS,
                                        cursor: 'pointer',
                                        bgcolor: on ? '#fff' : 'transparent',
                                        border: on ? `1px solid ${DASH.line}` : '1px solid transparent',
                                        boxShadow: on ? '0 1px 2px rgba(17,24,39,0.08)' : 'none',
                                        transition: 'background-color 0.15s ease',
                                        '&:hover': { bgcolor: on ? '#fff' : 'rgba(255,255,255,0.6)' },
                                    }}
                                >
                                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: on ? tone : DASH.muted }}>
                                        {m.label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                    <TextField
                        size="small"
                        value={approvalSearch}
                        onChange={(e) => setApprovalSearch(e.target.value)}
                        placeholder="Search by student, transaction or payment ID"
                        sx={{
                            width: { xs: '100%', sm: 320 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: RADIUS,
                                height: 34,
                                fontSize: 12.5,
                                bgcolor: '#fff',
                                '& fieldset': { borderColor: DASH.line },
                                '&:hover fieldset': { borderColor: DASH.faint },
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 17, color: DASH.faint }} />
                                    </InputAdornment>
                                ),
                                endAdornment: approvalSearch ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setApprovalSearch("")} sx={{ width: 22, height: 22 }}>
                                            <CloseIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                    />
                </Box>

                <Grid container spacing={1.5}>
                    {filteredApprovals.length === 0 && (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ p: 5, textAlign: 'center', borderRadius: RADIUS, border: `1px dashed ${DASH.line}`, bgcolor: '#fff' }}>
                                <Box sx={{
                                    width: 48, height: 48, borderRadius: '50%', bgcolor: DASH.lineSoft,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1,
                                }}>
                                    <VerifiedOutlinedIcon sx={{ fontSize: 24, color: DASH.faint }} />
                                </Box>
                                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: DASH.ink }}>
                                    {payLoading ? 'Loading payment approvals…' : 'Nothing waiting for approval'}
                                </Typography>
                                {!payLoading && (
                                    <Typography sx={{ fontSize: 11.5, color: DASH.muted, mt: 0.3 }}>
                                        {approvalSearch || approvalMethodFilter !== 'all'
                                            ? 'No pending payment matches the current filters.'
                                            : 'Online and cheque payments will appear here as the billing counter records them.'}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    )}
                    {filteredApprovals.map((a) => {
                        const methodStyle = PAYMENT_METHOD_COLORS[a.method] || { bg: DASH.lineSoft, color: DASH.text };
                        return (
                            <Grid size={{ xs: 12, md: 6 }} key={a.id}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: RADIUS,
                                    border: `1px solid ${DASH.line}`,
                                    bgcolor: '#fff',
                                    transition: '0.2s',
                                    '&:hover': { boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                                            <Avatar sx={{ width: 38, height: 38, bgcolor: DASH.lineSoft, color: DASH.text, fontSize: 13, fontWeight: 700 }}>
                                                {getInitials(a.studentName)}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: DASH.ink }} noWrap>{a.studentName}</Typography>
                                                <Typography sx={{ fontSize: 11, color: DASH.muted, fontWeight: 600 }}>
                                                    Grade {a.grade} · {a.section} · {a.rollNumber}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography sx={{ fontSize: 15, fontWeight: 800, color: DASH.ink, lineHeight: 1.1 }}>
                                                {formatCurrency(a.amount)}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={a.method}
                                                sx={{ mt: 0.4, height: 18, fontSize: 10, fontWeight: 700, bgcolor: methodStyle.bg, color: methodStyle.color }}
                                            />
                                        </Box>
                                    </Box>

                                    <Box sx={{ p: 1.2, borderRadius: RADIUS, bgcolor: DASH.surface, border: `1px solid ${DASH.lineSoft}`, mb: 1 }}>
                                        <Grid container spacing={1}>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: DASH.faint, textTransform: 'uppercase', letterSpacing: 0.4 }}>Reference</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2 }}>
                                                    <ReceiptOutlinedIcon sx={{ fontSize: 13, color: DASH.muted }} />
                                                    <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: DASH.text, fontFamily: 'monospace' }} noWrap>{a.referenceId}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: DASH.faint, textTransform: 'uppercase', letterSpacing: 0.4 }}>Paid On</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2 }}>
                                                    <CalendarTodayIcon sx={{ fontSize: 12, color: DASH.muted }} />
                                                    <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: DASH.text }}>{a.paymentDate}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: DASH.faint, textTransform: 'uppercase', letterSpacing: 0.4 }}>Submitted By</Typography>
                                                <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: DASH.text, mt: 0.2 }}>
                                                    {a.submittedBy} <Box component="span" sx={{ color: DASH.faint, fontWeight: 500 }}>· {a.submittedDate}</Box>
                                                </Typography>
                                            </Grid>
                                            {a.note && (
                                                <Grid size={{ xs: 12 }}>
                                                    <Typography sx={{ fontSize: 11, color: DASH.muted, fontStyle: 'italic', mt: 0.3 }}>
                                                        “{a.note}”
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            size="small"
                                            icon={a.proofType === 'screenshot' ? <ImageOutlinedIcon sx={{ fontSize: '14px !important' }} /> : <DescriptionOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                            label={a.source}
                                            sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: DASH.lineSoft, color: DASH.text, '& .MuiChip-icon': { color: DASH.muted } }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 0.8 }}>
                                            <Tooltip title="View proof" arrow>
                                                <Button
                                                    onClick={() => openProof(a)}
                                                    size="small"
                                                    startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                                                    sx={{
                                                        textTransform: 'none', fontSize: 11.5, fontWeight: 700,
                                                        color: DASH.text, bgcolor: '#fff', border: `1px solid ${DASH.line}`,
                                                        borderRadius: RADIUS, height: 28, px: 1.2,
                                                        '&:hover': { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                                                    }}
                                                >
                                                    Proof
                                                </Button>
                                            </Tooltip>
                                            <Button
                                                onClick={() => openReject(a)}
                                                size="small"
                                                disabled={payActioning === a.paymentMethodID}
                                                startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                                                sx={{
                                                    textTransform: 'none', fontSize: 11.5, fontWeight: 700,
                                                    color: '#B91C1C', bgcolor: '#FEF2F2', border: '1px solid #FECACA',
                                                    borderRadius: RADIUS, height: 28, px: 1.2,
                                                    '&:hover': { bgcolor: '#FEE2E2', borderColor: '#B91C1C' },
                                                }}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                onClick={() => openApprove(a)}
                                                size="small"
                                                variant="contained"
                                                disableElevation
                                                disabled={payActioning === a.paymentMethodID}
                                                startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                                sx={{
                                                    textTransform: 'none', fontSize: 11.5, fontWeight: 700,
                                                    bgcolor: '#15803D', color: '#fff',
                                                    borderRadius: RADIUS, height: 28, px: 1.2,
                                                    '&:hover': { bgcolor: '#166534' },
                                                    '&.Mui-disabled': { bgcolor: '#A7F3D0', color: '#fff' },
                                                }}
                                            >
                                                Approve
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            <Dialog open={proofDialog.open} onClose={closeProof} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${DASH.lineSoft}` }}>
                    <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: DASH.ink }}>Payment Proof</Typography>
                        <Typography sx={{ fontSize: 11, color: DASH.muted, fontWeight: 600 }}>
                            {proofDialog.item?.id} · {proofDialog.item?.studentName}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={closeProof}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    {proofDialog.item?.proofUrl ? (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS, border: `1px solid ${DASH.line}`, bgcolor: '#0b0b0b', p: 1.5 }}>
                            {/\.pdf($|\?)/i.test(proofDialog.item.proofUrl) ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <DescriptionOutlinedIcon sx={{ fontSize: 56, color: DASH.faint, mb: 1 }} />
                                    <Button onClick={() => window.open(proofDialog.item.proofUrl, '_blank', 'noopener')} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: DASH.text }}>Open PDF</Button>
                                </Box>
                            ) : (
                                <img src={proofDialog.item.proofUrl} alt="Payment proof" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 8 }} />
                            )}
                        </Box>
                    ) : (
                        <Box sx={{
                            width: '100%', minHeight: 280,
                            borderRadius: RADIUS, border: '1px dashed #D1D5DB',
                            bgcolor: DASH.surface,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: 1, py: 4,
                        }}>
                            <DescriptionOutlinedIcon sx={{ fontSize: 56, color: DASH.faint }} />
                            <Typography sx={{ fontSize: 13, color: DASH.muted, fontWeight: 600 }}>
                                No proof document attached for this payment.
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: DASH.faint, fontFamily: 'monospace' }}>
                                Reference: {proofDialog.item?.referenceId}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button
                        onClick={closeProof}
                        sx={{ textTransform: 'none', fontWeight: 700, color: DASH.text, border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 2, height: 34 }}
                    >
                        Close
                    </Button>
                    {proofDialog.item && (
                        <>
                            <Button
                                onClick={() => { openReject(proofDialog.item); closeProof(); }}
                                startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                                sx={{ textTransform: 'none', fontWeight: 700, color: '#B91C1C', bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: RADIUS, px: 2, height: 34, '&:hover': { bgcolor: '#FEE2E2' } }}
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={() => { openApprove(proofDialog.item); closeProof(); }}
                                variant="contained"
                                disableElevation
                                startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#15803D', color: '#fff', borderRadius: RADIUS, px: 2, height: 34, '&:hover': { bgcolor: '#166534' } }}
                            >
                                Approve
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Approve confirmation */}
            <Dialog open={Boolean(approveItem)} onClose={closeApprove} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '9px', bgcolor: '#E8F5E9', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 19 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 800 }}>Approve Payment</Typography>
                            <Typography sx={{ fontSize: 11.5, color: DASH.muted }}>{approveItem?.studentName} · {formatCurrency(approveItem?.amount)}</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeApprove}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ px: 2, pt: 2, pb: 1 }}>
                    <Typography sx={{ fontSize: 13, color: DASH.text }}>
                        Are you sure you want to approve this payment? This will mark it as <strong>approved</strong>.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button onClick={closeApprove} sx={{ textTransform: 'none', fontWeight: 700, color: DASH.text, border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 2, height: 34 }}>Cancel</Button>
                    <Button onClick={confirmApprove} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#15803D', color: '#fff', borderRadius: RADIUS, px: 2, height: 34, '&:hover': { bgcolor: '#166534' } }}>Yes, Approve</Button>
                </DialogActions>
            </Dialog>

            {/* Reject with reason */}
            <Dialog open={Boolean(rejectItem)} onClose={closeReject} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '9px', bgcolor: '#FEF2F2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CancelIcon sx={{ fontSize: 19 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 800 }}>Reject Payment</Typography>
                            <Typography sx={{ fontSize: 11.5, color: DASH.muted }}>{rejectItem?.studentName} · {formatCurrency(rejectItem?.amount)}</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeReject}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ px: 2, pt: 2, pb: 1 }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: DASH.muted, textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.6 }}>Reason for Rejection *</Typography>
                    <TextField
                        fullWidth multiline minRows={3}
                        value={rejectReasonText}
                        onChange={(e) => setRejectReasonText(e.target.value)}
                        placeholder="Enter the reason for rejecting this payment…"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: RADIUS, fontSize: 13 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button onClick={closeReject} sx={{ textTransform: 'none', fontWeight: 700, color: DASH.text, border: `1px solid ${DASH.line}`, borderRadius: RADIUS, px: 2, height: 34 }}>Cancel</Button>
                    <Button onClick={confirmReject} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#B91C1C', color: '#fff', borderRadius: RADIUS, px: 2, height: 34, '&:hover': { bgcolor: '#991B1B' } }}>Reject Payment</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
