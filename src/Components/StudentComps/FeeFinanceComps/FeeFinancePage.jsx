import { Autocomplete, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, List, ListItemButton, ListItemText, Paper, Popover, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import { selectWebsiteSettings } from '../../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import { selectGrades } from '../../../Redux/Slices/DropdownController';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SnackBar from '../../SnackBar';
import { teamManagementGet, moveToAccounts, moveToBilling, paymentApprovalsGet, paymentApprovalUpdate } from '../../../Api/Api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import AppsIcon from '@mui/icons-material/Apps';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

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

const items = [

    {
        color: "#8600BB",
        icon: DashboardIcon,
        text: "Finance Dashboard",
        bgColor: "#f9f4fc",
        iconBgColor: "#8600BB1A",
        path: "dashboard",
        disabled: false,
    },
    {
        color: "#E30053",
        icon: PaymentIcon,
        text: "Billing Screen",
        bgColor: "#FCF8F9",
        iconBgColor: "#fbebf1",
        path: "pay-fees",
        disabled: false,
    },

    {
        color: "#3457D5",
        icon: SportsSoccerIcon,
        text: "ECA Management",
        bgColor: "#eaeefa5A",
        iconBgColor: "#3457D51A",
        path: "eca-manage",
        disabled: false,
    },
    {
        color: "#FF6B35",
        icon: AddBoxIcon,
        text: "Additional Fee Management",
        bgColor: "#FFF5F2",
        iconBgColor: "#FF6B351A",
        path: "additional-manage",
        disabled: false,
    },
    {
        color: "#7DC353",
        icon: AccountBalanceWalletIcon,
        text: "Expense",
        bgColor: "#CFE8BB1A",
        iconBgColor: "#7DC3531A",
        path: "expense",
        disabled: false,
    },
    {
        color: "#00ACC1",
        icon: ReceiptLongIcon,
        text: "Concession Log",
        bgColor: "#EEF6F8",
        iconBgColor: "#00ACC11A",
        path: "concession-log",
        disabled: false,
    },
];

export default function FeeFinancePage() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("");
    const websiteSettings = useSelector(selectWebsiteSettings);
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const user = useSelector((state) => state.auth);
    const userType = user.userType;

    const token = "123";
    const [activeTab, setActiveTab] = useState(0);

    const [staff, setStaff] = useState([]);
    const [staffSearch, setStaffSearch] = useState("");
    const [staffRoleFilter, setStaffRoleFilter] = useState("all");
    const [teamCounts, setTeamCounts] = useState({ billing: 0, accounts: 0, total: 0 });
    const [teamLoading, setTeamLoading] = useState(false);
    const [movingRoll, setMovingRoll] = useState(null);

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackStatus, setSnackStatus] = useState(false);
    const [snackColor, setSnackColor] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const showSnack = (msg, ok) => { setSnackMessage(msg); setSnackColor(ok); setSnackStatus(ok); setSnackOpen(true); };

    const [approvals, setApprovals] = useState([]);
    const [approvalSearch, setApprovalSearch] = useState("");
    const [approvalMethodFilter, setApprovalMethodFilter] = useState("all");
    const [proofDialog, setProofDialog] = useState({ open: false, item: null });
    const [paySummary, setPaySummary] = useState({ pendingCount: 0, pendingAmount: 0, chequesCount: 0, directOnlineCount: 0 });
    const [payLoading, setPayLoading] = useState(false);
    const [payActioning, setPayActioning] = useState(null);

    const billingCount = teamCounts.billing;
    const accountsCount = teamCounts.accounts;

    const filteredStaff = useMemo(() => {
        const q = staffSearch.trim().toLowerCase();
        if (!q) return staff;
        return staff.filter((s) => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
    }, [staff, staffSearch]);

    // ── Team Management — fetch users by Filter (all | billing | accounts) ──
    const fetchTeam = async (filter) => {
        setTeamLoading(true);
        try {
            const res = await axios.get(teamManagementGet, {
                params: { filter: filter },
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res?.data || {};
            const users = Array.isArray(data.users) ? data.users : [];
            setStaff(users.map((u) => ({
                id: u.id,
                name: u.name || '—',
                rollNumber: String(u.rollNumber || ''),
                role: u.financeUserType === 'accounts' ? 'accounts' : 'billing',
                designation: u.userType === 'admin' ? 'Admin' : 'Staff',
                initials: u.initials || getInitials(u.name),
            })));
            setTeamCounts({
                billing: Number(data.billingTeamCount) || 0,
                accounts: Number(data.accountsTeamCount) || 0,
                total: Number(data.totalAdminStaff) || 0,
            });
        } catch (err) {
            setStaff([]);
            showSnack('Failed to load team members.', false);
        } finally {
            setTeamLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 1) fetchTeam(staffRoleFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, staffRoleFilter]);

    // Move a staff member between Billing and Accounts, then refresh the list
    const handleMoveStaff = async (rollNumber, toAccounts) => {
        setMovingRoll(rollNumber);
        try {
            await axios.put(toAccounts ? moveToAccounts : moveToBilling, null, {
                params: { rollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            });
            showSnack(toAccounts ? 'Moved to Accounts team.' : 'Moved to Billing team.', true);
            await fetchTeam(staffRoleFilter);
        } catch (err) {
            showSnack('Failed to move staff member.', false);
        } finally {
            setMovingRoll(null);
        }
    };

    const filteredApprovals = useMemo(() => {
        const q = approvalSearch.trim().toLowerCase();
        return approvals.filter((a) => {
            if (a.status !== 'pending') return false;
            const matchMethod = approvalMethodFilter === 'all' ? true : a.method === approvalMethodFilter;
            const matchSearch = !q || String(a.studentName || '').toLowerCase().includes(q) || String(a.referenceId || '').toLowerCase().includes(q) || String(a.id || '').toLowerCase().includes(q);
            return matchMethod && matchSearch;
        });
    }, [approvals, approvalSearch, approvalMethodFilter]);

    // Summary cards + tab badge come straight from the API summary.
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

    // Load on mount so the tab badge count is correct even before the tab is opened.
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

    // Approve confirmation + Reject-with-reason dialogs
    const [approveItem, setApproveItem] = useState(null);
    const [rejectItem, setRejectItem] = useState(null);
    const [rejectReasonText, setRejectReasonText] = useState("");

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


    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const id = open ? "fee-structure-popover" : undefined;

    const feeTypes = [
        "School Fee",
        "Transport Fee",
        "Extra curricular Activities Fees",
        "Additional Fee",
    ];

    const handleFeeSelect = (fee) => {
        handleClose();

        switch (fee) {
            case "School Fee":
                navigate("school");
                break;
            case "Transport Fee":
                navigate("transport");
                break;
            case "Extra curricular Activities Fees":
                navigate("extra-curricular");
                break;
            case "Additional Fee":
                navigate("extra");
                break;
            default:
                break;
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ border: "1px solid #ccc", borderRadius: "20px", p: 2, height: "86vh" }}>
            <SnackBar open={snackOpen} color={snackColor} setOpen={setSnackOpen} status={snackStatus} message={snackMessage} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid
                        size={{
                            lg: 6,
                            xs: 12,
                        }}>
                        <Box sx={{ display: "flex" }}>
                            <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                            <Typography sx={{ fontSize: "20px", fontWeight: "600" }}> Fee & Finance </Typography>
                        </Box>
                    </Grid>
                    <Grid
                        size={{
                            lg: 6,
                            xs: 12,
                        }}>
                        <Grid container spacing={2} sx={{ display: 'flex', justifyContent: { lg: "end", xs: "center" } }}>
                            {/* <Grid
                                size={{
                                    lg: 5.3,
                                    md: 5.3,
                                    sm: 6,
                                    xs: 10,
                                }}
                            >
                                <Link to="concession">
                                    <Button sx={{ border: "1px solid #000", textTransform: "none", borderRadius: "50px", color: '#000', width: "100%" }}>
                                        <PersonAddAlt1Icon style={{ paddingRight: "10px", paddingLeft: "5px", }} />  Manage /Create Concession
                                    </Button>
                                </Link>
                            </Grid> */}

                            {(userType === "superadmin" || userType === "admin") &&
                                <Grid
                                    size={{
                                        lg: 5.3,
                                        md: 5.3,
                                        sm: 6,
                                        xs: 10,
                                    }}>
                                    <Button aria-describedby={id} onClick={handleClick} sx={{ border: "1px solid #000", textTransform: "none", borderRadius: "50px", color: '#000', width: "100%" }}>
                                        <PostAddIcon style={{ paddingRight: "10px", paddingLeft: "5px", }} />  Create Fee Structure
                                    </Button>
                                    <Popover
                                        id={id}
                                        open={open}
                                        anchorEl={anchorEl}
                                        onClose={handleClose}
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "center",
                                        }}
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "center",
                                        }}
                                        PaperProps={{
                                            sx: {
                                                bgcolor: "#000",
                                                color: "#fff",
                                                borderRadius: "5px",
                                                mt: 1,
                                                width: "190px",
                                                padding: "10px"
                                            },
                                        }}
                                    >
                                        <List disablePadding>
                                            {feeTypes.map((fee) => (
                                                <ListItemButton
                                                    key={fee}
                                                    onClick={() => handleFeeSelect(fee)}
                                                    sx={{
                                                        color: "#fff",
                                                        "&:hover": { bgcolor: "#333" },
                                                        fontSize: "12px",
                                                        p: "5px",
                                                        borderRadius: "3px"
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: "12px !important" }}>
                                                        {fee}
                                                    </Typography>
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Popover>
                                </Grid>
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ pt: 2 }} />

            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                    mt: 1,
                    minHeight: 40,
                    borderBottom: '1px solid #eee',
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        minHeight: 40,
                        color: '#555',
                        px: 2,
                    },
                    '& .Mui-selected': { color: '#000 !important' },
                    '& .MuiTabs-indicator': { backgroundColor: '#000', height: 3, borderRadius: '3px 3px 0 0' },
                }}
            >
                <Tab icon={<AppsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Modules" />
                <Tab
                    icon={<GroupsIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            Team Management
                        </Box>
                    }
                />
                <Tab
                    icon={<VerifiedOutlinedIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            Payment Approvals
                            {pendingCount > 0 && (
                                <Chip label={pendingCount} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: '#FFF3E0', color: '#E65100' }} />
                            )}
                        </Box>
                    }
                />
            </Tabs>

            <Box sx={{ height: 'calc(86vh - 130px)', overflowY: 'auto', overflowX: 'hidden', mt: 1, pr: 0.5 }}>

            {activeTab === 0 && (
            <Grid container spacing={2} >
                {items
                    .filter(item => userType !== "teacher" || item.text === "Expense")
                    .filter(item => item.text !== "Concession Log" || userType === "superadmin")
                    .map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <Grid
                            sx={{ display: "flex", justifyContent: "center", pb: 1.5, mb: 1, mt: 3 }}
                            key={index}
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                                lg: 3
                            }}>
                            <Link
                                to={item.disabled ? "#" : item.path}
                                state={{ value: 'Y' }}
                                style={{
                                    textDecoration: 'none',
                                    height: "60px",
                                    width: "100%",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "relative",
                                        backgroundColor: item.bgColor,
                                        boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                                        width: "100%",
                                        height: "100px",
                                        borderRadius: "5px",
                                        cursor: item.disabled ? "not-allowed" : "pointer",
                                        opacity: item.disabled ? 0.6 : 1,
                                        transition: "0.3s",
                                        "&:hover": {
                                            ".arrowIcon": {
                                                opacity: item.disabled ? 0 : 1,
                                            },
                                        },
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                            height: "100%",
                                            width: "5px",
                                            borderTopLeftRadius: "10px",
                                            borderBottomLeftRadius: "10px",
                                            background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}99 100%)`,
                                        },
                                    }}
                                >
                                    <Grid container spacing={1} sx={{ height: '100%', px: 2, }}>
                                        <Grid
                                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                            size={{
                                                md: 0.5
                                            }}>
                                            <Box
                                                sx={{
                                                    width: '7px',
                                                    backgroundColor: item.color,
                                                    height: '100%',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    borderTopLeftRadius: '5px',
                                                    borderBottomLeftRadius: '5px',
                                                }}
                                            />
                                        </Grid>
                                        <Grid
                                            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                            size={{
                                                md: 2
                                            }}>
                                            <Box sx={{
                                                backgroundColor: item.iconBgColor,
                                                borderRadius: "50px",
                                                width: "25px",
                                                height: "25px",
                                                p: 1.3,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}>
                                                {/* <img src={item.icon} width={25} height={25} /> */}
                                                <IconComponent sx={{ color: item.color, fontSize: "23px" }} />
                                            </Box>
                                        </Grid>
                                        <Grid
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            size={{
                                                md: 7
                                            }}>
                                            <Typography sx={{ fontWeight: "600", color: "#000" }}>
                                                {item.text}
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            sx={{
                                                display: 'flex',
                                                justifyContent: "center",
                                                alignItems: 'center',
                                                height: '100%'
                                            }}
                                            size={{
                                                md: 2
                                            }}>
                                            <ArrowForwardIcon className="arrowIcon" sx={{
                                                opacity: 0,
                                                transition: 'opacity 0.3s ease',
                                                color: item.color,
                                            }} />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Link>
                        </Grid>
                    )
                })}
            </Grid>
            )}

            {activeTab === 1 && (
                <Box sx={{ pt: 2 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#FCE4EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <PaymentIcon sx={{ fontSize: 22, color: '#E30053' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Billing Team</Typography>
                                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{billingCount}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#E0F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AccountBalanceIcon sx={{ fontSize: 22, color: '#00838F' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Accounts Team</Typography>
                                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{accountsCount}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <GroupsIcon sx={{ fontSize: 22, color: '#374151' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Total Admin Staff</Typography>
                                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{teamCounts.total}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {[
                                { key: 'all', label: `All (${teamCounts.total})` },
                                { key: 'billing', label: `Billing (${billingCount})` },
                                { key: 'accounts', label: `Accounts (${accountsCount})` },
                            ].map((f) => (
                                <Chip
                                    key={f.key}
                                    label={f.label}
                                    onClick={() => setStaffRoleFilter(f.key)}
                                    sx={{
                                        height: 30,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        bgcolor: staffRoleFilter === f.key ? '#000' : '#fff',
                                        color: staffRoleFilter === f.key ? '#fff' : '#374151',
                                        border: '1px solid',
                                        borderColor: staffRoleFilter === f.key ? '#000' : '#E5E7EB',
                                        '&:hover': { bgcolor: staffRoleFilter === f.key ? '#000' : '#F9FAFB' },
                                    }}
                                />
                            ))}
                        </Box>
                        <TextField
                            size="small"
                            value={staffSearch}
                            onChange={(e) => setStaffSearch(e.target.value)}
                            placeholder="Search staff by name, roll number, email"
                            sx={{ width: { xs: '100%', sm: 320 }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 35, fontSize: 13 } }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>

                    <Grid container spacing={1.5}>
                        {filteredStaff.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ p: 4, textAlign: 'center', borderRadius: '10px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                    <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>
                                        {teamLoading ? 'Loading team members…' : 'No staff match your filters.'}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                        {filteredStaff.map((s) => {
                            const isAccounts = s.role === 'accounts';
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={s.id}>
                                    <Box sx={{
                                        p: 1.8,
                                        borderRadius: '10px',
                                        border: '1px solid #E5E7EB',
                                        bgcolor: '#fff',
                                        display: 'flex',
                                        gap: 1.4,
                                        alignItems: 'flex-start',
                                        transition: '0.2s',
                                        '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                                    }}>
                                        <Avatar sx={{
                                            width: 42, height: 42,
                                            bgcolor: isAccounts ? '#00838F' : '#E30053',
                                            color: '#fff', fontSize: 14, fontWeight: 700,
                                        }}>
                                            {s.initials || getInitials(s.name)}
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }} noWrap>{s.name}</Typography>
                                                <Chip
                                                    size="small"
                                                    label={isAccounts ? 'Accounts' : 'Billing'}
                                                    sx={{
                                                        height: 20, fontSize: 10, fontWeight: 700,
                                                        bgcolor: isAccounts ? '#E0F7FA' : '#FCE4EC',
                                                        color: isAccounts ? '#00838F' : '#E30053',
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.4 }}>
                                                <BadgeOutlinedIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                                                <Typography sx={{ fontSize: 11.5, color: '#6B7280', fontWeight: 600 }}>{s.rollNumber}</Typography>
                                                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#D1D5DB', mx: 0.4 }} />
                                                <WorkOutlineIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                                                <Typography sx={{ fontSize: 11.5, color: '#6B7280', fontWeight: 600 }} noWrap>{s.designation}</Typography>
                                            </Box>
                                            <Button
                                                onClick={() => handleMoveStaff(s.rollNumber, !isAccounts)}
                                                size="small"
                                                disabled={movingRoll === s.rollNumber}
                                                startIcon={<SwapHorizIcon sx={{ fontSize: 14 }} />}
                                                sx={{
                                                    mt: 1,
                                                    textTransform: 'none',
                                                    fontSize: 11.5,
                                                    fontWeight: 700,
                                                    color: isAccounts ? '#E30053' : '#00838F',
                                                    borderRadius: '6px',
                                                    px: 1.2,
                                                    height: 26,
                                                    border: '1px solid',
                                                    borderColor: isAccounts ? '#FCE4EC' : '#E0F7FA',
                                                    bgcolor: isAccounts ? '#FFF5F8' : '#F0FBFC',
                                                    '&:hover': {
                                                        bgcolor: isAccounts ? '#FCE4EC' : '#E0F7FA',
                                                        borderColor: isAccounts ? '#E30053' : '#00838F',
                                                    },
                                                }}
                                            >
                                                {movingRoll === s.rollNumber ? 'Moving…' : `Move to ${isAccounts ? 'Billing' : 'Accounts'}`}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            )}

            {activeTab === 2 && (
                <Box sx={{ pt: 2 }}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HourglassEmptyIcon sx={{ fontSize: 22, color: '#E65100' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Pending</Typography>
                                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{pendingCount}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CurrencyRupeeIcon sx={{ fontSize: 22, color: '#2E7D32' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Pending Amount</Typography>
                                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{formatCurrency(pendingTotal)}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <DescriptionOutlinedIcon sx={{ fontSize: 22, color: '#E65100' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Cheques</Typography>
                                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{chequeCount}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ p: 2, borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ImageOutlinedIcon sx={{ fontSize: 22, color: '#7B1FA2' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>Direct / Online</Typography>
                                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>{directCount}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {METHOD_FILTERS.map((m) => (
                                <Chip
                                    key={m.value}
                                    label={m.label}
                                    onClick={() => setApprovalMethodFilter(m.value)}
                                    sx={{
                                        height: 30,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        bgcolor: approvalMethodFilter === m.value ? '#000' : '#fff',
                                        color: approvalMethodFilter === m.value ? '#fff' : '#374151',
                                        border: '1px solid',
                                        borderColor: approvalMethodFilter === m.value ? '#000' : '#E5E7EB',
                                        '&:hover': { bgcolor: approvalMethodFilter === m.value ? '#000' : '#F9FAFB' },
                                    }}
                                />
                            ))}
                        </Box>
                        <TextField
                            size="small"
                            value={approvalSearch}
                            onChange={(e) => setApprovalSearch(e.target.value)}
                            placeholder="Search by student, transaction or payment ID"
                            sx={{ width: { xs: '100%', sm: 340 }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 35, fontSize: 13 } }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>

                    <Grid container spacing={1.5}>
                        {filteredApprovals.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ p: 4, textAlign: 'center', borderRadius: '10px', border: '1px dashed #E5E7EB', bgcolor: '#FAFAFA' }}>
                                    <VerifiedOutlinedIcon sx={{ fontSize: 32, color: '#9CA3AF', mb: 0.6 }} />
                                    <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>{payLoading ? 'Loading payment approvals…' : 'No pending payments waiting for approval.'}</Typography>
                                </Box>
                            </Grid>
                        )}
                        {filteredApprovals.map((a) => {
                            const methodStyle = PAYMENT_METHOD_COLORS[a.method] || { bg: '#F3F4F6', color: '#374151' };
                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={a.id}>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: '12px',
                                        border: '1px solid #E5E7EB',
                                        bgcolor: '#fff',
                                        transition: '0.2s',
                                        '&:hover': { boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                                                <Avatar sx={{ width: 38, height: 38, bgcolor: '#F3F4F6', color: '#374151', fontSize: 13, fontWeight: 700 }}>
                                                    {getInitials(a.studentName)}
                                                </Avatar>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }} noWrap>{a.studentName}</Typography>
                                                    <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
                                                        Grade {a.grade} · {a.section} · {a.rollNumber}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                                                    {formatCurrency(a.amount)}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={a.method}
                                                    sx={{ mt: 0.4, height: 18, fontSize: 10, fontWeight: 700, bgcolor: methodStyle.bg, color: methodStyle.color }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#FAFAFA', border: '1px solid #F3F4F6', mb: 1 }}>
                                            <Grid container spacing={1}>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4 }}>Reference</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2 }}>
                                                        <ReceiptOutlinedIcon sx={{ fontSize: 13, color: '#6B7280' }} />
                                                        <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }} noWrap>{a.referenceId}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4 }}>Paid On</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2 }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 12, color: '#6B7280' }} />
                                                        <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#374151' }}>{a.paymentDate}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid size={{ xs: 12 }}>
                                                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4 }}>Submitted By</Typography>
                                                    <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#374151', mt: 0.2 }}>
                                                        {a.submittedBy} <Box component="span" sx={{ color: '#9CA3AF', fontWeight: 500 }}>· {a.submittedDate}</Box>
                                                    </Typography>
                                                </Grid>
                                                {a.note && (
                                                    <Grid size={{ xs: 12 }}>
                                                        <Typography sx={{ fontSize: 11, color: '#6B7280', fontStyle: 'italic', mt: 0.3 }}>
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
                                                sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: '#F3F4F6', color: '#374151', '& .MuiChip-icon': { color: '#6B7280' } }}
                                            />
                                            <Box sx={{ display: 'flex', gap: 0.8 }}>
                                                <Tooltip title="View proof" arrow>
                                                    <Button
                                                        onClick={() => openProof(a)}
                                                        size="small"
                                                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                                                        sx={{
                                                            textTransform: 'none', fontSize: 11.5, fontWeight: 700,
                                                            color: '#374151', bgcolor: '#fff', border: '1px solid #E5E7EB',
                                                            borderRadius: '6px', height: 28, px: 1.2,
                                                            '&:hover': { bgcolor: '#F9FAFB', borderColor: '#9CA3AF' },
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
                                                        borderRadius: '6px', height: 28, px: 1.2,
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
                                                        borderRadius: '6px', height: 28, px: 1.2,
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
            )}
            </Box>

            <Dialog open={proofDialog.open} onClose={closeProof} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '12px' } } }}>
                <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6' }}>
                    <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>Payment Proof</Typography>
                        <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
                            {proofDialog.item?.id} · {proofDialog.item?.studentName}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={closeProof}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    {proofDialog.item?.proofUrl ? (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#0b0b0b', p: 1.5 }}>
                            {/\.pdf($|\?)/i.test(proofDialog.item.proofUrl) ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <DescriptionOutlinedIcon sx={{ fontSize: 56, color: '#9CA3AF', mb: 1 }} />
                                    <Button onClick={() => window.open(proofDialog.item.proofUrl, '_blank', 'noopener')} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#374151' }}>Open PDF</Button>
                                </Box>
                            ) : (
                                <img src={proofDialog.item.proofUrl} alt="Payment proof" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 8 }} />
                            )}
                        </Box>
                    ) : (
                        <Box sx={{
                            width: '100%', minHeight: 280,
                            borderRadius: '10px', border: '1px dashed #D1D5DB',
                            bgcolor: '#FAFAFA',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: 1, py: 4,
                        }}>
                            <DescriptionOutlinedIcon sx={{ fontSize: 56, color: '#9CA3AF' }} />
                            <Typography sx={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>
                                No proof document attached for this payment.
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>
                                Reference: {proofDialog.item?.referenceId}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button
                        onClick={closeProof}
                        sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', px: 2, height: 34 }}
                    >
                        Close
                    </Button>
                    {proofDialog.item && (
                        <>
                            <Button
                                onClick={() => { openReject(proofDialog.item); closeProof(); }}
                                startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                                sx={{ textTransform: 'none', fontWeight: 700, color: '#B91C1C', bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', px: 2, height: 34, '&:hover': { bgcolor: '#FEE2E2' } }}
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={() => { openApprove(proofDialog.item); closeProof(); }}
                                variant="contained"
                                disableElevation
                                startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#15803D', color: '#fff', borderRadius: '6px', px: 2, height: 34, '&:hover': { bgcolor: '#166534' } }}
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
                            <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>{approveItem?.studentName} · {formatCurrency(approveItem?.amount)}</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeApprove}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ px: 2, pt: 2, pb: 1 }}>
                    <Typography sx={{ fontSize: 13, color: '#374151' }}>
                        Are you sure you want to approve this payment? This will mark it as <strong>approved</strong>.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button onClick={closeApprove} sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', px: 2, height: 34 }}>Cancel</Button>
                    <Button onClick={confirmApprove} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#15803D', color: '#fff', borderRadius: '6px', px: 2, height: 34, '&:hover': { bgcolor: '#166534' } }}>Yes, Approve</Button>
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
                            <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>{rejectItem?.studentName} · {formatCurrency(rejectItem?.amount)}</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeReject}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ px: 2, pt: 2, pb: 1 }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.6 }}>Reason for Rejection *</Typography>
                    <TextField
                        fullWidth multiline minRows={3}
                        value={rejectReasonText}
                        onChange={(e) => setRejectReasonText(e.target.value)}
                        placeholder="Enter the reason for rejecting this payment…"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
                    <Button onClick={closeReject} sx={{ textTransform: 'none', fontWeight: 700, color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', px: 2, height: 34 }}>Cancel</Button>
                    <Button onClick={confirmReject} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#B91C1C', color: '#fff', borderRadius: '6px', px: 2, height: 34, '&:hover': { bgcolor: '#991B1B' } }}>Reject Payment</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}