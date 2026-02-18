import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    LinearProgress,
    Tooltip,
    Avatar,
    Badge
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CategoryIcon from '@mui/icons-material/Category'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import DescriptionIcon from '@mui/icons-material/Description'
import FilterListIcon from '@mui/icons-material/FilterList'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import HistoryIcon from '@mui/icons-material/History'
import DashboardIcon from '@mui/icons-material/Dashboard'
import CancelIcon from '@mui/icons-material/Cancel'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { expenceDashboard, getAddedExpence, getAddedFund, postFund, postExpence, expenceApprovalStatusCheck, updateAddexpenceApprovalAction, fundApprovalStatusCheck, updateAddFundApprovalAction } from '../../../../Api/Api'
import SnackBar from '../../../SnackBar'

// Expense categories
const expenseCategories = [
    "Stationery",
    "Maintenance",
    "Utilities",
    "Salaries",
    "Transportation",
    "Food & Beverages",
    "Equipment",
    "Marketing",
    "Office Supplies",
    "Miscellaneous"
];

// Payment methods
const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "Cheque",
    "Online Payment",
];

// Mock data for expense requests
const mockExpenseRequests = [
    {
        id: 1,
        requestDate: "2026-02-10",
        category: "Stationery",
        description: "Office supplies - pens, papers, notebooks for all departments",
        amount: 2500,
        paymentMethod: "Petty Cash",
        requestedBy: "John Doe",
        requestedByEmail: "john.doe@school.com",
        status: "Pending",
        approvalDate: null,
        approvedBy: null,
        rejectionReason: null
    },
    {
        id: 2,
        requestDate: "2026-02-09",
        category: "Utilities",
        description: "Electricity bill payment for January 2026",
        amount: 15000,
        paymentMethod: "Bank Transfer",
        requestedBy: "Admin User",
        requestedByEmail: "admin@school.com",
        status: "Approved",
        approvalDate: "2026-02-09",
        approvedBy: "Super Admin",
        rejectionReason: null
    },
    {
        id: 3,
        requestDate: "2026-02-08",
        category: "Maintenance",
        description: "AC servicing for all classrooms and staff rooms",
        amount: 8500,
        paymentMethod: "Cash",
        requestedBy: "Maintenance Head",
        requestedByEmail: "maintenance@school.com",
        status: "Approved",
        approvalDate: "2026-02-09",
        approvedBy: "Super Admin",
        rejectionReason: null
    },
    {
        id: 4,
        requestDate: "2026-02-10",
        category: "Food & Beverages",
        description: "Refreshments for upcoming parent-teacher meeting",
        amount: 3500,
        paymentMethod: "Petty Cash",
        requestedBy: "HR Manager",
        requestedByEmail: "hr@school.com",
        status: "Pending",
        approvalDate: null,
        approvedBy: null,
        rejectionReason: null
    },
    {
        id: 5,
        requestDate: "2026-02-07",
        category: "Transportation",
        description: "Fuel for school buses - February week 1",
        amount: 12000,
        paymentMethod: "Cash",
        requestedBy: "Transport Manager",
        requestedByEmail: "transport@school.com",
        status: "Rejected",
        approvalDate: "2026-02-08",
        approvedBy: "Super Admin",
        rejectionReason: "Insufficient budget allocation for this category"
    }
];

export default function ExpensePage() {
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState('');
    const navigate = useNavigate();
    const token = "123"
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("");
    const [expenseRequests, setExpenseRequests] = useState(mockExpenseRequests);
    const [openRequestDialog, setOpenRequestDialog] = useState(false);
    const [openAllocationDialog, setOpenAllocationDialog] = useState(false);
    const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardExpenseData, setDashboardExpenseData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [historyAllocatedData, setHistoryAllocatedData] = useState([]);
    const [historyTypeFilter, setHistoryTypeFilter] = useState("Expense");
    const [approvalsTypeFilter, setApprovalsTypeFilter] = useState("Expense");
    const [approvalsStatusFilter, setApprovalsStatusFilter] = useState("");
    const [pendingExpenseData, setPendingExpenseData] = useState([]);
    const [pendingFundData, setPendingFundData] = useState([]);
    const [openFundApprovalDialog, setOpenFundApprovalDialog] = useState(false);
    const [selectedFund, setSelectedFund] = useState(null);
    const [fundApprovalAction, setFundApprovalAction] = useState("");
    const [fundRejectionReason, setFundRejectionReason] = useState("");


    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');


    // Current user role (mock - replace with actual auth)
    const [currentUser] = useState({
        name: "Current User",
        email: "user@school.com",
        role: "Admin" // Admin, Super Admin, User
    });

    // Petty Cash Allocation
    const [allocation, setAllocation] = useState({
        amount: 5000,
        notes: ""
    });

    const [newAllocation, setNewAllocation] = useState({
        amount: "",
        notes: ""
    });

    // New expense request form
    const [newRequest, setNewRequest] = useState({
        requestDate: new Date().toISOString().split('T')[0],
        category: "",
        description: "",
        amount: "",
        paymentMethod: "",
        remarks: "",
        requestedBy: currentUser.name,
        requestedByEmail: currentUser.email
    });

    // Approval form
    const [approvalAction, setApprovalAction] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

    // Handle navigation from other pages with specific tab
    useEffect(() => {
        if (location.state?.tab !== undefined) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    // Calculate summary statistics
    const calculateSummary = () => {
        const approvedRequests = expenseRequests.filter(req => req.status === "Approved");
        const pendingRequests = expenseRequests.filter(req => req.status === "Pending");
        const rejectedRequests = expenseRequests.filter(req => req.status === "Rejected");

        const totalApproved = approvedRequests.reduce((sum, req) => sum + req.amount, 0);
        const totalPending = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
        const remainingBalance = allocation.amount - totalApproved;
        const utilizationPercentage = (totalApproved / allocation.amount) * 100;

        return {
            allocated: allocation.amount,
            approved: totalApproved,
            pending: totalPending,
            rejected: rejectedRequests.reduce((sum, req) => sum + req.amount, 0),
            remaining: remainingBalance,
            utilization: utilizationPercentage,
            approvedCount: approvedRequests.length,
            pendingCount: pendingRequests.length,
            rejectedCount: rejectedRequests.length,
            totalRequests: expenseRequests.length
        };
    };

    const summary = calculateSummary();

    // Filter expense requests
    const filteredRequests = expenseRequests.filter(request => {
        const matchesSearch = searchQuery === "" ||
            request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === "All" || request.category === categoryFilter;
        const matchesStatus = statusFilter === "All" || request.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Format date from YYYY-MM-DD to DD-MM-YYYY for API
    const formatDateForApi = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}-${m}-${y}`;
    };

    // Handle submit expense request — calls POST API
    const handleSubmitRequest = async () => {
        if (!newRequest.category || !newRequest.description || !newRequest.amount || !newRequest.paymentMethod) {
            setMessage("Please fill all required fields");
            setOpen(true); setColor(false); setStatus(false);
            return;
        }

        if (parseFloat(newRequest.amount) <= 0) {
            setMessage("Amount must be greater than 0");
            setOpen(true); setColor(false); setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const sendData = {
                createdByRollNumber: rollNumber,
                expenceAmount: parseFloat(newRequest.amount),
                date: formatDateForApi(newRequest.requestDate),
                category: newRequest.category,
                description: newRequest.description,
                paymentMethod: newRequest.paymentMethod,
                remarks: newRequest.remarks,
            };

            await axios.post(postExpence, sendData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setNewRequest({
                requestDate: new Date().toISOString().split('T')[0],
                category: "",
                description: "",
                amount: "",
                paymentMethod: "",
                remarks: "",
                requestedBy: currentUser.name,
                requestedByEmail: currentUser.email
            });
            setMessage("Expense request submitted successfully!");
            setOpen(true); setColor(true); setStatus(true);
            fetchDashboardExpenseData();
            setActiveTab(0);
        } catch (error) {
            console.error("Error submitting expense:", error);
            setMessage("Failed to submit expense request. Please try again.");
            setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle approve/reject request — calls POST API
    const handleApprovalAction = async () => {
        if (!approvalAction) {
            setMessage("Please select an action");
            setOpen(true); setColor(false); setStatus(false);
            return;
        }

        if (approvalAction === "decline" && !rejectionReason) {
            setMessage("Please provide a rejection reason");
            setOpen(true); setColor(false); setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            await axios.put(updateAddexpenceApprovalAction, null, {
                params: {
                    expenceId: selectedRequest.expenceId,
                    RollNumber: rollNumber,
                    Action: approvalAction === "approve" ? "accept" : "decline",
                    Reason: approvalAction === "decline" ? rejectionReason : null,
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            setOpenApprovalDialog(false);
            setSelectedRequest(null);
            setApprovalAction("");
            setRejectionReason("");
            setMessage(`Expense request ${approvalAction === "approve" ? "approved" : "rejected"} successfully!`);
            setOpen(true); setColor(true); setStatus(true);
            fetchPendingExpenseData();
        } catch (error) {
            console.error("Error processing approval:", error);
            setMessage("Failed to process request. Please try again.");
            setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle set allocation - calls POST API
    const handleSetAllocation = async () => {
        if (!newAllocation.amount || parseFloat(newAllocation.amount) <= 0) {
            setMessage("Please enter a valid allocation amount");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            const sendData = {
                createdByRollNumber: rollNumber,
                fundAmount: parseFloat(newAllocation.amount),
                description: newAllocation.notes,
            };

            await axios.post(postFund, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAllocation({
                amount: parseFloat(newAllocation.amount),
                notes: newAllocation.notes
            });

            setOpenAllocationDialog(false);
            setNewAllocation({ amount: "", notes: "" });
            setMessage(userType === "superadmin" ? "Allocation added successfully!" : "Allocation requested successfully!");
            setOpen(true); setColor(true); setStatus(true);
            fetchDashboardData();
        } catch (error) {
            console.error("Error while adding allocation:", error);
            setMessage("Failed to add allocation. Please try again.");
            setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchDashboardExpenseData();
    }, []);

    useEffect(() => {
        if (activeTab === 2) {
            if (approvalsTypeFilter === "Expense") {
                fetchPendingExpenseData();
            } else {
                fetchPendingFundData();
            }
        }
    }, [activeTab, approvalsTypeFilter, approvalsStatusFilter]);

    useEffect(() => {
        if (activeTab === 3) {
            if (historyTypeFilter === "Expense") {
                fetchHistoryAllowData();
            } else {
                fetchHistoryData();
            }
        }
    }, [activeTab, statusFilter, historyTypeFilter]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(expenceDashboard, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDashboardData(res.data.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistoryData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getAddedFund, {
                params:{
                    RollNumber: rollNumber,
                    Status:statusFilter,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setHistoryData(res.data.data ?? [])
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetches expense data for dashboard table — always no status filter
    const fetchDashboardExpenseData = async () => {
        try {
            const res = await axios.get(getAddedExpence, {
                params: { RollNumber: rollNumber },
                headers: { Authorization: `Bearer ${token}` },
            });
            setDashboardExpenseData(res.data.data ?? []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchHistoryAllowData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(getAddedExpence, {
                params:{
                    RollNumber: rollNumber,
                    Status:statusFilter,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setHistoryAllocatedData(res.data.data ?? [])
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPendingExpenseData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(expenceApprovalStatusCheck, {
                params: { RollNumber: rollNumber, Status: approvalsStatusFilter },
                headers: { Authorization: `Bearer ${token}` },
            });
            setPendingExpenseData(res.data.expences ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPendingFundData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(fundApprovalStatusCheck, {
                params: { RollNumber: rollNumber, Status: approvalsStatusFilter },
                headers: { Authorization: `Bearer ${token}` },
            });
            setPendingFundData(res.data.funds ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFundApprovalAction = async () => {
        if (!fundApprovalAction) {
            setMessage("Please select an action");
            setOpen(true); setColor(false); setStatus(false);
            return;
        }

        if (fundApprovalAction === "decline" && !fundRejectionReason) {
            setMessage("Please provide a rejection reason");
            setOpen(true); setColor(false); setStatus(false);
            return;
        }

        setIsLoading(true);
        try {
            await axios.put(updateAddFundApprovalAction, null, {
                params: {
                    addFundId: selectedFund.addFundId,
                    RollNumber: rollNumber,
                    Action: fundApprovalAction === "approve" ? "accept" : "decline",
                    Reason: fundApprovalAction === "decline" ? fundRejectionReason : null,
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            setOpenFundApprovalDialog(false);
            setSelectedFund(null);
            setFundApprovalAction("");
            setFundRejectionReason("");
            setMessage(`Fund allocation ${fundApprovalAction === "approve" ? "approved" : "rejected"} successfully!`);
            setOpen(true); setColor(true); setStatus(true);
            fetchPendingFundData();
            if (fundApprovalAction === "approve") fetchDashboardData();
        } catch (error) {
            console.error("Error processing fund approval:", error);
            setMessage("Failed to process request. Please try again.");
            setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Render Dashboard Tab
    const renderDashboard = () => (
        <Box>
            {/* Budget Header */}
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                p: 2,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                border: "1px solid #90caf9",
                color: "#1a1a1a"
            }}>
                <Box>
                    <Typography sx={{ fontSize: "14px", opacity: 0.7, mb: 0.5, fontWeight: 500, color: "#1565c0" }}>
                        Current Allocation
                    </Typography>
                    <Typography sx={{ fontSize: "32px", fontWeight: 700, color: "#0d47a1" }}>
                        ₹{(dashboardData?.currentAllocationMonthly ?? 0).toLocaleString()}
                    </Typography>
                </Box>
                {(currentUser.role === "Admin" || currentUser.role === "Super Admin") && (
                    <IconButton
                        onClick={() => setOpenAllocationDialog(true)}
                        sx={{
                            bgcolor: "#1976d2",
                            color: "#fff",
                            "&:hover": {
                                bgcolor: "#1565c0"
                            }
                        }}
                    >
                        <SettingsIcon />
                    </IconButton>
                )}
            </Box>

            {/* Warning Alert */}
            {(dashboardData?.budgetUtilizationPercent ?? 0) > 90 && (
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 3,
                    p: 2,
                    border: "2px solid #FCA5A5",
                    borderRadius: "12px",
                    bgcolor: "#FEF2F2"
                }}>
                    <WarningAmberIcon sx={{ fontSize: 24, color: "#DC2626" }} />
                    <Box>
                        <Typography sx={{ fontSize: "14px", color: "#991B1B", fontWeight: 600 }}>
                            Budget Alert: {(dashboardData?.budgetUtilizationPercent ?? 0).toFixed(1)}% Utilized
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#DC2626", mt: 0.3 }}>
                            Only ₹{(dashboardData?.remainingBalance ?? 0).toLocaleString()} remaining from allocated amount
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        border: "1px solid #10B981",
                        borderRadius: "12px",
                        boxShadow: "none",
                        bgcolor: "#ECFDF5",
                        transition: "all 0.3s",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 20px rgba(16,185,129,0.2)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "#065F46", fontWeight: 600, mb: 1 }}>
                                        APPROVED EXPENSES
                                    </Typography>
                                    <Typography sx={{ fontSize: "26px", fontWeight: 700, color: "#064E3B", mb: 0.5 }}>
                                        ₹{(dashboardData?.approvedExpensesAmount ?? 0).toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#10B981", fontWeight: 500 }}>
                                        {dashboardData?.approvedExpensesCount ?? 0} requests approved
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "12px",
                                    bgcolor: "#10B98130",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid #10B981"
                                }}>
                                    <CheckCircleIcon sx={{ color: "#10B981", fontSize: 28 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        border: "1px solid #F59E0B",
                        borderRadius: "12px",
                        boxShadow: "none",
                        bgcolor: "#FFFBEB",
                        transition: "all 0.3s",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 20px rgba(245,158,11,0.2)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "#92400E", fontWeight: 600, mb: 1 }}>
                                        PENDING APPROVAL
                                    </Typography>
                                    <Typography sx={{ fontSize: "26px", fontWeight: 700, color: "#78350F", mb: 0.5 }}>
                                        ₹{(dashboardData?.pendingApprovalAmount ?? 0).toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#F59E0B", fontWeight: 500 }}>
                                        {dashboardData?.pendingApprovalCount ?? 0} requests waiting
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "12px",
                                    bgcolor: "#F59E0B30",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid #F59E0B"
                                }}>
                                    <PendingActionsIcon sx={{ color: "#F59E0B", fontSize: 28 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        border: (dashboardData?.remainingBalance ?? 0) > 0 ? "1px solid #3B82F6" : "1px solid #DC2626",
                        borderRadius: "12px",
                        boxShadow: "none",
                        bgcolor: (dashboardData?.remainingBalance ?? 0) > 0 ? "#EFF6FF" : "#FEF2F2",
                        transition: "all 0.3s",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: (dashboardData?.remainingBalance ?? 0) > 0
                                ? "0 8px 20px rgba(59,130,246,0.2)"
                                : "0 8px 20px rgba(220,38,38,0.2)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{
                                        fontSize: "12px",
                                        color: (dashboardData?.remainingBalance ?? 0) > 0 ? "#1E40AF" : "#991B1B",
                                        fontWeight: 600,
                                        mb: 1
                                    }}>
                                        REMAINING BALANCE
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: "26px",
                                        fontWeight: 700,
                                        color: (dashboardData?.remainingBalance ?? 0) > 0 ? "#1E3A8A" : "#7F1D1D",
                                        mb: 0.5
                                    }}>
                                        ₹{(dashboardData?.remainingBalance ?? 0).toLocaleString()}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: "11px",
                                        color: (dashboardData?.remainingBalance ?? 0) > 0 ? "#3B82F6" : "#DC2626",
                                        fontWeight: 500
                                    }}>
                                        {(dashboardData?.remainingBalance ?? 0) > 0 ? "Available to use" : "Budget exceeded"}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "12px",
                                    bgcolor: (dashboardData?.remainingBalance ?? 0) > 0 ? "#3B82F630" : "#DC262630",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: (dashboardData?.remainingBalance ?? 0) > 0 ? "2px solid #3B82F6" : "2px solid #DC2626"
                                }}>
                                    <AccountBalanceWalletIcon sx={{
                                        color: (dashboardData?.remainingBalance ?? 0) > 0 ? "#3B82F6" : "#DC2626",
                                        fontSize: 28
                                    }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        border: "1px solid #8B5CF6",
                        borderRadius: "12px",
                        boxShadow: "none",
                        bgcolor: "#F5F3FF",
                        transition: "all 0.3s",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 20px rgba(139,92,246,0.2)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "#5B21B6", fontWeight: 600, mb: 1 }}>
                                        BUDGET UTILIZATION
                                    </Typography>
                                    <Typography sx={{ fontSize: "26px", fontWeight: 700, color: "#4C1D95", mb: 0.5 }}>
                                        {(dashboardData?.budgetUtilizationPercent ?? 0).toFixed(1)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(dashboardData?.budgetUtilizationPercent ?? 0, 100)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: "#DDD6FE",
                                            "& .MuiLinearProgress-bar": {
                                                bgcolor: (dashboardData?.budgetUtilizationPercent ?? 0) > 90 ? "#DC2626" : "#8B5CF6",
                                                borderRadius: 4
                                            }
                                        }}
                                    />
                                </Box>
                                <Box sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "12px",
                                    bgcolor: "#8B5CF630",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid #8B5CF6"
                                }}>
                                    <TrendingUpIcon sx={{ color: "#8B5CF6", fontSize: 28 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Expense History Table */}
            <Paper sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                {/* Header */}
                <Box sx={{
                    px: 2.5,
                    py: 2,
                    borderBottom: "2px solid #E5E7EB",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "8px",
                            bgcolor: "#FEF2F2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #FCA5A5"
                        }}>
                            <ReceiptLongIcon sx={{ fontSize: 20, color: "#DC2626" }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                                Recent Expense History
                            </Typography>
                            <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                Latest 5 expense transactions
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        size="small"
                        endIcon={<ReceiptLongIcon sx={{ fontSize: 14 }} />}
                        onClick={() => {
                            setHistoryTypeFilter("Expense");
                            setActiveTab(3);
                        }}
                        sx={{
                            textTransform: "none",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#667eea",
                            border: "1px solid #667eea",
                            borderRadius: "20px",
                            px: 2,
                            "&:hover": { bgcolor: "#f0f0ff" }
                        }}
                    >
                        View All
                    </Button>
                </Box>

                {/* Table */}
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#374151", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", borderBottom: "1px solid #E5E7EB", py: 1.2 }}>
                                Date
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#374151", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", borderBottom: "1px solid #E5E7EB", py: 1.2 }}>
                                Category
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#374151", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", borderBottom: "1px solid #E5E7EB", py: 1.2 }}>
                                Requested By
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#374151", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", borderBottom: "1px solid #E5E7EB", py: 1.2 }}>
                                Description
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#374151", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", borderBottom: "1px solid #E5E7EB", py: 1.2 }}>
                                Amount
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#F9FAFB", color: "#374151", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", borderBottom: "1px solid #E5E7EB", py: 1.2 }}>
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dashboardExpenseData.length > 0 ? (
                            dashboardExpenseData.slice(0, 5).map((item, idx) => {
                                const reqBy = parseUser(item.createdBy);
                                const displayStatus = item.status === "Requested" ? "Pending" : item.status;
                                return (
                                    <TableRow
                                        key={item.expenceId}
                                        sx={{
                                            backgroundColor: idx % 2 === 0 ? "#fff" : "#FAFAFA",
                                            '&:hover': { backgroundColor: '#F3F4F6' },
                                            '&:last-child td': { borderBottom: 'none' }
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: "12px", color: "#374151", borderBottom: "1px solid #F3F4F6", py: 1.5, whiteSpace: "nowrap" }}>
                                            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 1.5 }}>
                                            <Chip
                                                label={item.category || '-'}
                                                size="small"
                                                sx={{ fontSize: "10px", bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontWeight: 600, height: 20 }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 1.5 }}>
                                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                                                {reqBy.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>
                                                {reqBy.roll}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 1.5, maxWidth: 220 }}>
                                            <Tooltip title={item.description} arrow>
                                                <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {item.description || '-'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell sx={{ fontSize: "13px", fontWeight: 700, color: "#DC2626", borderBottom: "1px solid #F3F4F6", py: 1.5, whiteSpace: "nowrap" }}>
                                            ₹{(item.expenceAmount ?? 0).toLocaleString()}
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 1.5 }}>
                                            <Chip
                                                label={displayStatus}
                                                size="small"
                                                sx={{
                                                    fontSize: "10px",
                                                    fontWeight: 600,
                                                    height: 20,
                                                    bgcolor: displayStatus === "Approved" ? "#ECFDF5" :
                                                        displayStatus === "Pending" ? "#FFFBEB" : "#FEF2F2",
                                                    color: displayStatus === "Approved" ? "#047857" :
                                                        displayStatus === "Pending" ? "#B45309" : "#991B1B",
                                                    border: `1px solid ${displayStatus === "Approved" ? "#A7F3D0" :
                                                        displayStatus === "Pending" ? "#FCD34D" : "#FCA5A5"}`
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: "center", py: 4, borderBottom: "none" }}>
                                    <ReceiptLongIcon sx={{ fontSize: 36, color: "#D1D5DB", mb: 1, display: "block", mx: "auto" }} />
                                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
                                        {isLoading ? "Loading..." : "No expense records found"}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );

    // Render Request Tab
    const renderRequest = () => (
        <Box>
            <Card sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                maxWidth: 800,
                mx: "auto"
            }}>
                <Box sx={{
                    p: 3,
                    borderBottom: "2px solid #E5E7EB",
                    background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "12px",
                            bgcolor: "#EFF6FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #3B82F6"
                        }}>
                            <AddIcon sx={{ fontSize: 32, color: "#3B82F6" }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>
                                Request New Expense
                            </Typography>
                            <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>
                                Fill in the details below to submit your expense request for approval
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Request Date"
                                type="date"
                                value={newRequest.requestDate}
                                onChange={(e) => setNewRequest({ ...newRequest, requestDate: e.target.value })}
                                slotProps={{
                                    inputLabel: { shrink: true }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={newRequest.category}
                                    onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                                    label="Category"
                                >
                                    {expenseCategories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                required
                                label="Description"
                                multiline
                                rows={4}
                                value={newRequest.description}
                                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                placeholder="Enter detailed description of the expense..."
                                helperText="Please provide clear and detailed information about the expense"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="Amount"
                                value={newRequest.amount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*\.?\d*$/.test(val)) {
                                        setNewRequest({ ...newRequest, amount: val });
                                    }
                                }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Typography sx={{ fontWeight: 600, color: "#111827" }}>₹</Typography>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={newRequest.paymentMethod}
                                    onChange={(e) => setNewRequest({ ...newRequest, paymentMethod: e.target.value })}
                                    label="Payment Method"
                                >
                                    {paymentMethods.map((method) => (
                                        <MenuItem key={method} value={method}>
                                            {method}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Remarks (Optional)"
                                multiline
                                rows={2}
                                value={newRequest.remarks}
                                onChange={(e) => setNewRequest({ ...newRequest, remarks: e.target.value })}
                                placeholder="Enter any additional remarks..."
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{
                                p: 2,
                                borderRadius: "8px",
                                bgcolor: "#F9FAFB",
                                border: "1px solid #E5E7EB"
                            }}>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", mb: 1 }}>
                                    Requestor Information
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                                    RollNumber: {rollNumber}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                                    Name: {userName}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
                        <Button
                            variant="outlined"
                            onClick={() => setNewRequest({
                                requestDate: new Date().toISOString().split('T')[0],
                                category: "",
                                description: "",
                                amount: "",
                                paymentMethod: "",
                                remarks: "",
                                requestedBy: currentUser.name,
                                requestedByEmail: currentUser.email
                            })}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                px: 3,
                                borderColor: "#D1D5DB",
                                color: "#6B7280"
                            }}
                        >
                            Clear Form
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmitRequest}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                px: 4,
                                bgcolor: "#667eea",
                                "&:hover": {
                                    bgcolor: "#5568d3"
                                }
                            }}
                        >
                            Submit Request
                        </Button>
                    </Box>
                </Box>
            </Card>
        </Box>
    );

    // Render Approvals Tab
    const renderApprovals = () => (
        <Box>
            {/* Filter Bar */}
            <Box sx={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "12px", p: 2, mb: 3 }}>
                <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    {/* Type Toggle */}
                    <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            {["Expense", "Fund (Allocation)"].map((type) => (
                                <Button
                                    key={type}
                                    variant={approvalsTypeFilter === type ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => setApprovalsTypeFilter(type)}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        px: 2,
                                        ...(approvalsTypeFilter === type ? {
                                            bgcolor: "#667eea",
                                            borderColor: "#667eea",
                                            "&:hover": { bgcolor: "#5568d3" }
                                        } : {
                                            borderColor: "#D1D5DB",
                                            color: "#6B7280",
                                            "&:hover": { borderColor: "#667eea", color: "#667eea", bgcolor: "transparent" }
                                        })
                                    }}
                                >
                                    {type}
                                </Button>
                            ))}
                        </Box>
                    </Grid>

                    {/* Status Filter */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={approvalsStatusFilter}
                                onChange={(e) => setApprovalsStatusFilter(e.target.value)}
                                label="Status"
                                sx={{ backgroundColor: "#fff", borderRadius: "8px" }}
                            >
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="Requested">Pending</MenuItem>
                                <MenuItem value="Approved">Approved</MenuItem>
                                <MenuItem value="Declined">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Record count */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", textAlign: "right" }}>
                            {approvalsTypeFilter === "Expense" ? pendingExpenseData.length : pendingFundData.length} records
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {approvalsTypeFilter === "Expense" ? (
                /* ── Expense Approvals ── */
                isLoading ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                        <Typography sx={{ fontSize: "14px", color: "#9CA3AF" }}>Loading...</Typography>
                    </Box>
                ) : pendingExpenseData.length === 0 ? (
                    <Card sx={{ border: "1px solid #E5E7EB", borderRadius: "12px", p: 6, textAlign: "center" }}>
                        <PendingActionsIcon sx={{ fontSize: 64, color: "#D1D5DB", mb: 2 }} />
                        <Typography sx={{ fontSize: "18px", fontWeight: 600, color: "#111827", mb: 1 }}>
                            No Expense Records Found
                        </Typography>
                        <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
                            No records match the selected filter
                        </Typography>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {pendingExpenseData.map((item) => {
                            const requestedBy = parseUser(item.createdBy);
                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={item.expenceId}>
                                    <Card sx={{
                                        border: "2px solid #1976d2",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(25,118,210,0.15)",
                                        transition: "all 0.3s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 8px 24px rgba(25,118,210,0.25)"
                                        }
                                    }}>
                                        <Box sx={{
                                            p: 2,
                                            borderBottom: "2px solid #e3f2fd",
                                            bgcolor: "#e3f2fd",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: "#bbdefb", color: "#0d47a1", width: 40, height: 40, fontWeight: 700 }}>
                                                    {(item.category || "E").charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0d47a1" }}>
                                                        {item.category || "—"}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#1565c0" }}>
                                                        {item.date ? new Date(item.date).toLocaleDateString('en-IN') : '—'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {renderStatusChip(item.status)}
                                        </Box>

                                        <CardContent sx={{ p: 2.5 }}>
                                            <Typography sx={{ fontSize: "13px", color: "#374151", mb: 2, lineHeight: 1.6 }}>
                                                {item.description || "—"}
                                            </Typography>

                                            <Divider sx={{ my: 2 }} />

                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                    <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Amount:</Typography>
                                                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                                                        ₹{(item.expenceAmount ?? 0).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                    <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Payment Method:</Typography>
                                                    <Chip label={item.paymentMethod || "—"} size="small" sx={{ fontSize: "11px", height: "22px", bgcolor: "#F3F4F6", color: "#374151" }} />
                                                </Box>
                                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                    <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Requested By:</Typography>
                                                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                                                        {requestedBy.name}
                                                    </Typography>
                                                </Box>
                                                {item.remarks && (
                                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Remarks:</Typography>
                                                        <Typography sx={{ fontSize: "12px", color: "#374151" }}>{item.remarks}</Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            {(currentUser.role === "Admin" || currentUser.role === "Super Admin") && item.status === "Requested" && parseUser(item.createdBy).roll !== String(rollNumber) && (
                                                <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        startIcon={<ThumbDownIcon />}
                                                        onClick={() => {
                                                            setSelectedRequest(item);
                                                            setApprovalAction("decline");
                                                            setOpenApprovalDialog(true);
                                                        }}
                                                        sx={{ textTransform: "none", borderRadius: "8px", borderColor: "#DC2626", color: "#DC2626", "&:hover": { borderColor: "#B91C1C", bgcolor: "#FEF2F2" } }}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        startIcon={<ThumbUpIcon />}
                                                        onClick={() => {
                                                            setSelectedRequest(item);
                                                            setApprovalAction("approve");
                                                            setOpenApprovalDialog(true);
                                                        }}
                                                        sx={{ textTransform: "none", borderRadius: "8px", bgcolor: "#10B981", "&:hover": { bgcolor: "#059669" } }}
                                                    >
                                                        Approve
                                                    </Button>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )
            ) : (
                    /* ── Fund (Allocation) Pending Approvals ── */
                    isLoading ? (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                            <Typography sx={{ fontSize: "14px", color: "#9CA3AF" }}>Loading...</Typography>
                        </Box>
                    ) : pendingFundData.length === 0 ? (
                        <Card sx={{ border: "1px solid #E5E7EB", borderRadius: "12px", p: 6, textAlign: "center" }}>
                            <AccountBalanceWalletIcon sx={{ fontSize: 64, color: "#D1D5DB", mb: 2 }} />
                            <Typography sx={{ fontSize: "18px", fontWeight: 600, color: "#111827", mb: 1 }}>
                                No Pending Fund Allocations
                            </Typography>
                            <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
                                All fund allocation requests have been processed
                            </Typography>
                        </Card>
                    ) : (
                        <Grid container spacing={3}>
                            {pendingFundData.map((fund) => {
                                const addedBy = parseUser(fund.createdBy);
                                return (
                                    <Grid size={{ xs: 12, md: 6 }} key={fund.addFundId}>
                                        <Card sx={{
                                            border: "2px solid #667eea",
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 12px rgba(102,126,234,0.15)",
                                            transition: "all 0.3s",
                                            "&:hover": {
                                                transform: "translateY(-4px)",
                                                boxShadow: "0 8px 24px rgba(102,126,234,0.25)"
                                            }
                                        }}>
                                            <Box sx={{
                                                p: 2,
                                                borderBottom: "2px solid #ede9fe",
                                                bgcolor: "#ede9fe",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                    <Avatar sx={{
                                                        bgcolor: "#c4b5fd",
                                                        color: "#4c1d95",
                                                        width: 40,
                                                        height: 40,
                                                        fontWeight: 700
                                                    }}>
                                                        <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#4c1d95" }}>
                                                            Fund Allocation
                                                        </Typography>
                                                        <Typography sx={{ fontSize: "11px", color: "#6d28d9" }}>
                                                            {fund.date ? new Date(fund.date).toLocaleDateString('en-IN') : '—'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Chip
                                                    label="PENDING"
                                                    size="small"
                                                    sx={{ bgcolor: "#667eea", color: "#fff", fontWeight: 700, fontSize: "10px" }}
                                                />
                                            </Box>

                                            <CardContent sx={{ p: 2.5 }}>
                                                <Typography sx={{ fontSize: "13px", color: "#374151", mb: 2, lineHeight: 1.6 }}>
                                                    {fund.description || "—"}
                                                </Typography>

                                                <Divider sx={{ my: 2 }} />

                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Amount:</Typography>
                                                        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                                                            ₹{(fund.fundAmount ?? 0).toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Added By:</Typography>
                                                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                                                            {addedBy.name}
                                                        </Typography>
                                                    </Box>
                                                    {fund.remarks && (
                                                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Remarks:</Typography>
                                                            <Typography sx={{ fontSize: "12px", color: "#374151" }}>{fund.remarks}</Typography>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {(currentUser.role === "Admin" || currentUser.role === "Super Admin") && fund.status === "Requested" && parseUser(fund.createdBy).roll !== String(rollNumber) && (
                                                    <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            startIcon={<ThumbDownIcon />}
                                                            onClick={() => {
                                                                setSelectedFund(fund);
                                                                setFundApprovalAction("decline");
                                                                setOpenFundApprovalDialog(true);
                                                            }}
                                                            sx={{
                                                                textTransform: "none",
                                                                borderRadius: "8px",
                                                                borderColor: "#DC2626",
                                                                color: "#DC2626",
                                                                "&:hover": { borderColor: "#B91C1C", bgcolor: "#FEF2F2" }
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            startIcon={<ThumbUpIcon />}
                                                            onClick={() => {
                                                                setSelectedFund(fund);
                                                                setFundApprovalAction("approve");
                                                                setOpenFundApprovalDialog(true);
                                                            }}
                                                            sx={{
                                                                textTransform: "none",
                                                                borderRadius: "8px",
                                                                bgcolor: "#10B981",
                                                                "&:hover": { bgcolor: "#059669" }
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )
                )}
            </Box>
    );

    // Render History Tab — Fund Addition History
    const parseUser = (str) => {
        if (!str) return { roll: '-', name: '-' };
        const parts = str.split('-');
        if (parts.length >= 3) {
            return { roll: parts[0], name: parts.slice(1, -1).join(' ') };
        }
        return { roll: parts[0] || '-', name: parts[1] || '-' };
    };

    const activeHistoryData = historyTypeFilter === "Expense" ? historyAllocatedData : historyData;

    const filteredHistory = activeHistoryData.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
            !q ||
            item.description?.toLowerCase().includes(q) ||
            item.remarks?.toLowerCase().includes(q) ||
            item.createdBy?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q)
        );
    });

    const thCell = {
        backgroundColor: "#F9FAFB",
        color: "#374151",
        fontWeight: 700,
        fontSize: "12px",
        textTransform: "uppercase",
        borderBottom: "2px solid #E5E7EB",
        whiteSpace: "nowrap"
    };

    const renderStatusChip = (rawStatus) => {
        const displayStatus = rawStatus === "Requested" ? "Pending" : rawStatus === "Declined" ? "Rejected" : rawStatus;
        return (
            <Chip
                label={displayStatus}
                size="small"
                icon={
                    displayStatus === "Approved" ? <CheckCircleIcon sx={{ fontSize: 14 }} /> :
                        displayStatus === "Pending" ? <PendingActionsIcon sx={{ fontSize: 14 }} /> :
                            <CancelIcon sx={{ fontSize: 14 }} />
                }
                sx={{
                    backgroundColor: displayStatus === "Approved" ? "#ECFDF5" :
                        displayStatus === "Pending" ? "#FFFBEB" : "#FEF2F2",
                    color: displayStatus === "Approved" ? "#047857" :
                        displayStatus === "Pending" ? "#B45309" : "#991B1B",
                    fontSize: "11px",
                    fontWeight: 600,
                    border: displayStatus === "Approved" ? "1px solid #A7F3D0" :
                        displayStatus === "Pending" ? "1px solid #FCD34D" : "1px solid #FCA5A5"
                }}
            />
        );
    };

    const renderHistory = () => (
        <Box>
            {/* Filters */}
            <Box sx={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "12px", p: 2, mb: 3 }}>
                <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    {/* Search */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by description, category, name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#9CA3AF" }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            sx={{ backgroundColor: "#fff", "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                            size="small"
                        />
                    </Grid>

                    {/* Status Filter */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Status"
                                sx={{ backgroundColor: "#fff", borderRadius: "8px" }}
                            >
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="Requested">Pending</MenuItem>
                                <MenuItem value="Approved">Approved</MenuItem>
                                <MenuItem value="Declined">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Type Toggle */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            {["Expense", "Fund (Allocation)"].map((type) => (
                                <Button
                                    key={type}
                                    variant={historyTypeFilter === type ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => {
                                        setHistoryTypeFilter(type);
                                        setSearchQuery("");
                                    }}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        px: 2,
                                        ...(historyTypeFilter === type ? {
                                            bgcolor: "#667eea",
                                            borderColor: "#667eea",
                                            "&:hover": { bgcolor: "#5568d3" }
                                        } : {
                                            borderColor: "#D1D5DB",
                                            color: "#6B7280",
                                            "&:hover": { borderColor: "#667eea", color: "#667eea", bgcolor: "transparent" }
                                        })
                                    }}
                                >
                                    {type}
                                </Button>
                            ))}
                        </Box>
                    </Grid>

                    {/* Record count */}
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", textAlign: "right" }}>
                            {filteredHistory.length} of {activeHistoryData.length} records
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Table */}
            <Paper sx={{ border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                    {historyTypeFilter === "Expense" ? (
                        /* ── Expense Table ── */
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...thCell, width: 48 }}>S.No</TableCell>
                                    <TableCell sx={thCell}>Date</TableCell>
                                    <TableCell sx={thCell}>Category</TableCell>
                                    <TableCell sx={thCell}>Requested By</TableCell>
                                    <TableCell sx={thCell}>Description</TableCell>
                                    <TableCell sx={thCell}>Payment Method</TableCell>
                                    <TableCell sx={thCell}>Remarks</TableCell>
                                    <TableCell sx={thCell}>Amount</TableCell>
                                    <TableCell sx={thCell}>Status</TableCell>
                                    <TableCell sx={thCell}>Approved By</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((item, idx) => {
                                        const requestedBy = parseUser(item.createdBy);
                                        const approvedByUser = parseUser(item.approvedBy);
                                        return (
                                            <TableRow
                                                key={item.expenceId}
                                                hover
                                                sx={{
                                                    backgroundColor: idx % 2 === 0 ? "#fff" : "#F9FAFB",
                                                    '&:hover': { backgroundColor: '#F3F4F6 !important' }
                                                }}
                                            >
                                                <TableCell sx={{ fontSize: "13px", color: "#9CA3AF", borderBottom: "1px solid #E5E7EB" }}>
                                                    {idx + 1}
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "13px", color: "#374151", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>
                                                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                                    <Chip
                                                        label={item.category || '-'}
                                                        size="small"
                                                        sx={{ fontSize: "11px", bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontWeight: 600 }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                                        {requestedBy.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                        Roll: {requestedBy.roll}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "13px", color: "#111827", borderBottom: "1px solid #E5E7EB", maxWidth: 180 }}>
                                                    <Tooltip title={item.description} arrow>
                                                        <Typography sx={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {item.description || '-'}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "13px", color: "#374151", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>
                                                    {item.paymentMethod || '-'}
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "13px", color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
                                                    {item.remarks || '-'}
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "14px", fontWeight: 700, color: "#DC2626", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>
                                                    ₹{(item.expenceAmount ?? 0).toLocaleString()}
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                                    {renderStatusChip(item.status)}
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                                    {item.approvedBy ? (
                                                        <>
                                                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                                                {approvedByUser.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                                {item.approvedOnDate
                                                                    ? new Date(item.approvedOnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                    : '-'}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>—</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} sx={{ textAlign: "center", py: 6, borderBottom: "none" }}>
                                            <ReceiptLongIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2, display: "block", mx: "auto" }} />
                                            <Typography sx={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>
                                                {isLoading ? "Loading..." : "No expense records found"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        /* ── Fund (Allocation) Table ── */
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...thCell, width: 48 }}>S.No</TableCell>
                                    <TableCell sx={thCell}>Date</TableCell>
                                    <TableCell sx={thCell}>Added By</TableCell>
                                    <TableCell sx={thCell}>Description</TableCell>
                                    <TableCell sx={thCell}>Remarks</TableCell>
                                    <TableCell sx={thCell}>Amount</TableCell>
                                    <TableCell sx={thCell}>Status</TableCell>
                                    <TableCell sx={thCell}>Approved By</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((item, idx) => {
                                        const addedBy = parseUser(item.createdBy);
                                        const approvedByUser = parseUser(item.approvedBy);
                                        return (
                                            <TableRow
                                                key={item.addFundId}
                                                hover
                                                sx={{
                                                    backgroundColor: idx % 2 === 0 ? "#fff" : "#F9FAFB",
                                                    '&:hover': { backgroundColor: '#F3F4F6 !important' }
                                                }}
                                            >
                                                <TableCell sx={{ fontSize: "13px", color: "#9CA3AF", borderBottom: "1px solid #E5E7EB" }}>
                                                    {idx + 1}
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "13px", color: "#374151", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>
                                                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                                        {addedBy.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                        Roll: {addedBy.roll}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "13px", color: "#111827", borderBottom: "1px solid #E5E7EB", maxWidth: 200 }}>
                                                    <Tooltip title={item.description} arrow>
                                                        <Typography sx={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {item.description || '-'}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "13px", color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
                                                    {item.remarks || '-'}
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "14px", fontWeight: 700, color: "#10B981", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>
                                                    ₹{(item.fundAmount ?? 0).toLocaleString()}
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                                    {renderStatusChip(item.status)}
                                                </TableCell>

                                                <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                                    {item.approvedBy ? (
                                                        <>
                                                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                                                {approvedByUser.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                                {item.approvedOnDate
                                                                    ? new Date(item.approvedOnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                    : '-'}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>—</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} sx={{ textAlign: "center", py: 6, borderBottom: "none" }}>
                                            <HistoryIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2, display: "block", mx: "auto" }} />
                                            <Typography sx={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>
                                                {isLoading ? "Loading..." : "No fund allocation records found"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </Box>
            </Paper>
        </Box>
    );

    return (
        <Box sx={{ border: "1px solid #ccc", borderRadius: "20px", p: 2, height: "86vh", display: "flex", flexDirection: "column" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontSize: "20px", fontWeight: "600" }}>Expense Management</Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setActiveTab(1)}
                    sx={{
                        backgroundColor: "#667eea",
                        color: "#fff",
                        textTransform: "none",
                        borderRadius: "50px",
                        px: 3,
                        "&:hover": {
                            backgroundColor: "#5568d3"
                        }
                    }}
                >
                    New Request
                </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, flexShrink: 0 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: '44px',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#666',
                            minHeight: '44px',
                            px: 3,
                            py: 1.5
                        },
                        '& .Mui-selected': {
                            color: '#667eea !important'
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#667eea',
                            height: '3px',
                            borderRadius: '3px 3px 0 0'
                        }
                    }}
                >
                    <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
                    <Tab icon={<AddIcon />} iconPosition="start" label="Request Expense" />
                    <Tab icon={<PendingActionsIcon />} iconPosition="start" label="Pending Approvals" />
                    <Tab icon={<HistoryIcon />} iconPosition="start" label="History" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
                {activeTab === 0 && renderDashboard()}
                {activeTab === 1 && renderRequest()}
                {activeTab === 2 && renderApprovals()}
                {activeTab === 3 && renderHistory()}
            </Box>

            {/* Set Allocation Dialog */}
            <Dialog
                open={openAllocationDialog}
                onClose={() => setOpenAllocationDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        border: "1px solid #E5E7EB"
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: "#F9FAFB",
                    borderBottom: "2px solid #E5E7EB",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "8px",
                            bgcolor: "#DBEAFE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <AccountBalanceWalletIcon sx={{ color: "#3B82F6", fontSize: 24 }} />
                        </Box>
                        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                            Add Budget Allocation
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setOpenAllocationDialog(false)} sx={{ color: "#6B7280" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, backgroundColor: "#fff" }}>
                    <Grid container spacing={2.5} sx={{ mt: 2 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Allocation Amount *"
                                type="number"
                                value={newAllocation.amount}
                                onChange={(e) => setNewAllocation({ ...newAllocation, amount: e.target.value })}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Typography sx={{ fontWeight: 600 }}>₹</Typography>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                                placeholder="Enter allocation"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Notes (Optional)"
                                multiline
                                rows={3}
                                value={newAllocation.notes}
                                onChange={(e) => setNewAllocation({ ...newAllocation, notes: e.target.value })}
                                placeholder="Enter any notes about this allocation..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{
                    p: 2.5,
                    borderTop: "2px solid #E5E7EB",
                    backgroundColor: "#F9FAFB"
                }}>
                    <Button
                        onClick={() => setOpenAllocationDialog(false)}
                        variant="outlined"
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            borderColor: "#D1D5DB",
                            color: "#6B7280"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSetAllocation}
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            bgcolor: "#667eea",
                            "&:hover": {
                                bgcolor: "#5568d3"
                            }
                        }}
                    >
                    {userType === "superadmin" ?    "Set Allocation" : "Request Allocation"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approval Dialog */}
            <Dialog
                open={openApprovalDialog}
                onClose={() => {
                    setOpenApprovalDialog(false);
                    setSelectedRequest(null);
                    setApprovalAction("");
                    setRejectionReason("");
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        border: "2px solid " + (approvalAction === "approve" ? "#10B981" : "#DC2626")
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: approvalAction === "approve" ? "#ECFDF5" : "#FEF2F2",
                    borderBottom: "2px solid " + (approvalAction === "approve" ? "#A7F3D0" : "#FCA5A5"),
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "12px",
                            bgcolor: approvalAction === "approve" ? "#D1FAE5" : "#FEE2E2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid " + (approvalAction === "approve" ? "#10B981" : "#DC2626")
                        }}>
                            {approvalAction === "approve" ?
                                <ThumbUpIcon sx={{ color: "#10B981", fontSize: 28 }} /> :
                                <ThumbDownIcon sx={{ color: "#DC2626", fontSize: 28 }} />
                            }
                        </Box>
                        <Typography sx={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: approvalAction === "approve" ? "#047857" : "#991B1B"
                        }}>
                            {approvalAction === "approve" ? "Approve Request" : "Reject Request"}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => {
                            setOpenApprovalDialog(false);
                            setSelectedRequest(null);
                            setApprovalAction("");
                            setRejectionReason("");
                        }}
                        sx={{ color: "#6B7280" }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, backgroundColor: "#fff" }}>
                    {selectedRequest && (
                        <Box>
                            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827", mb: 2 }}>
                                Request Details:
                            </Typography>
                            <Box sx={{
                                p: 2,
                                borderRadius: "8px",
                                bgcolor: "#F9FAFB",
                                border: "1px solid #E5E7EB",
                                mb: 3
                            }}>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Category:</Typography>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                            {selectedRequest.category || "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Amount:</Typography>
                                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                                            ₹{(selectedRequest.expenceAmount ?? 0).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Payment Method:</Typography>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                            {selectedRequest.paymentMethod || "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Date:</Typography>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                            {selectedRequest.date ? new Date(selectedRequest.date).toLocaleDateString('en-IN') : "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Description:</Typography>
                                        <Typography sx={{ fontSize: "13px", color: "#374151", mt: 0.5 }}>
                                            {selectedRequest.description || "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Requested By:</Typography>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                            {parseUser(selectedRequest.createdBy).name}
                                        </Typography>
                                    </Grid>
                                    {selectedRequest.remarks && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Remarks:</Typography>
                                            <Typography sx={{ fontSize: "13px", color: "#374151", mt: 0.5 }}>
                                                {selectedRequest.remarks}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>

                            {approvalAction === "decline" && (
                                <TextField
                                    fullWidth
                                    required
                                    label="Rejection Reason"
                                    multiline
                                    rows={4}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please provide a clear reason for rejecting this request..."
                                    error={!rejectionReason}
                                    helperText={!rejectionReason ? "Rejection reason is required" : ""}
                                />
                            )}

                            {approvalAction === "approve" && (
                                <Box sx={{
                                    p: 2,
                                    borderRadius: "8px",
                                    bgcolor: "#F0FDF4",
                                    border: "1px solid #A7F3D0"
                                }}>
                                    <Typography sx={{ fontSize: "13px", color: "#047857", fontWeight: 500 }}>
                                        ✓ This amount (₹{(selectedRequest.expenceAmount ?? 0).toLocaleString()}) will be deducted from the available fund upon approval.
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", color: "#065F46", mt: 1 }}>
                                        Available fund after approval: ₹{((selectedRequest.currentAvailableFund ?? 0) - (selectedRequest.expenceAmount ?? 0)).toLocaleString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{
                    p: 2.5,
                    borderTop: "2px solid #E5E7EB",
                    backgroundColor: "#F9FAFB"
                }}>
                    <Button
                        onClick={() => {
                            setOpenApprovalDialog(false);
                            setSelectedRequest(null);
                            setApprovalAction("");
                            setRejectionReason("");
                        }}
                        variant="outlined"
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            borderColor: "#D1D5DB",
                            color: "#6B7280"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApprovalAction}
                        variant="contained"
                        disabled={approvalAction === "decline" && !rejectionReason}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            bgcolor: approvalAction === "approve" ? "#10B981" : "#DC2626",
                            "&:hover": {
                                bgcolor: approvalAction === "approve" ? "#059669" : "#B91C1C"
                            },
                            "&:disabled": {
                                bgcolor: "#D1D5DB"
                            }
                        }}
                    >
                        {approvalAction === "approve" ? "Approve Request" : "Reject Request"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Fund Allocation Approval Dialog ── */}
            <Dialog
                open={openFundApprovalDialog}
                onClose={() => {
                    setOpenFundApprovalDialog(false);
                    setSelectedFund(null);
                    setFundApprovalAction("");
                    setFundRejectionReason("");
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        border: "2px solid " + (fundApprovalAction === "approve" ? "#10B981" : "#DC2626")
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: fundApprovalAction === "approve" ? "#ECFDF5" : "#FEF2F2",
                    borderBottom: "2px solid " + (fundApprovalAction === "approve" ? "#A7F3D0" : "#FCA5A5"),
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "12px",
                            bgcolor: fundApprovalAction === "approve" ? "#D1FAE5" : "#FEE2E2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid " + (fundApprovalAction === "approve" ? "#10B981" : "#DC2626")
                        }}>
                            {fundApprovalAction === "approve" ?
                                <ThumbUpIcon sx={{ color: "#10B981", fontSize: 28 }} /> :
                                <ThumbDownIcon sx={{ color: "#DC2626", fontSize: 28 }} />
                            }
                        </Box>
                        <Typography sx={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: fundApprovalAction === "approve" ? "#047857" : "#991B1B"
                        }}>
                            {fundApprovalAction === "approve" ? "Approve Fund Allocation" : "Reject Fund Allocation"}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => {
                            setOpenFundApprovalDialog(false);
                            setSelectedFund(null);
                            setFundApprovalAction("");
                            setFundRejectionReason("");
                        }}
                        sx={{ color: "#6B7280" }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, backgroundColor: "#fff" }}>
                    {selectedFund && (
                        <Box>
                            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827", mb: 2 }}>
                                Fund Allocation Details:
                            </Typography>
                            <Box sx={{
                                p: 2,
                                borderRadius: "8px",
                                bgcolor: "#F9FAFB",
                                border: "1px solid #E5E7EB",
                                mb: 3
                            }}>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Fund Amount:</Typography>
                                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                                            ₹{(selectedFund.fundAmount ?? 0).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Current Fund:</Typography>
                                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                                        ₹{(dashboardData?.currentAllocationMonthly ?? 0).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Date:</Typography>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                            {selectedFund.date ? new Date(selectedFund.date).toLocaleDateString('en-IN') : "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Requested By:</Typography>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                            {parseUser(selectedFund.createdBy).name}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Description:</Typography>
                                        <Typography sx={{ fontSize: "13px", color: "#374151", mt: 0.5 }}>
                                            {selectedFund.description || "—"}
                                        </Typography>
                                    </Grid>
                                    {selectedFund.remarks && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Remarks:</Typography>
                                            <Typography sx={{ fontSize: "13px", color: "#374151", mt: 0.5 }}>
                                                {selectedFund.remarks}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>

                            {fundApprovalAction === "decline" && (
                                <TextField
                                    fullWidth
                                    required
                                    label="Rejection Reason"
                                    multiline
                                    rows={4}
                                    value={fundRejectionReason}
                                    onChange={(e) => setFundRejectionReason(e.target.value)}
                                    placeholder="Please provide a clear reason for rejecting this fund allocation..."
                                    error={!fundRejectionReason}
                                    helperText={!fundRejectionReason ? "Rejection reason is required" : ""}
                                />
                            )}

                            {fundApprovalAction === "approve" && (
                                <Box sx={{
                                    p: 2,
                                    borderRadius: "8px",
                                    bgcolor: "#F0FDF4",
                                    border: "1px solid #A7F3D0"
                                }}>
                                    <Typography sx={{ fontSize: "13px", color: "#047857", fontWeight: 500 }}>
                                        ✓ ₹{(selectedFund.fundAmount ?? 0).toLocaleString()} will be added to the available fund upon approval.
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", color: "#065F46", mt: 1 }}>
                                        Available fund after approval: ₹{((selectedFund.currentFund ?? 0) + (selectedFund.fundAmount ?? 0)).toLocaleString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{
                    p: 2.5,
                    borderTop: "2px solid #E5E7EB",
                    backgroundColor: "#F9FAFB"
                }}>
                    <Button
                        onClick={() => {
                            setOpenFundApprovalDialog(false);
                            setSelectedFund(null);
                            setFundApprovalAction("");
                            setFundRejectionReason("");
                        }}
                        variant="outlined"
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            borderColor: "#D1D5DB",
                            color: "#6B7280"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleFundApprovalAction}
                        variant="contained"
                        disabled={fundApprovalAction === "decline" && !fundRejectionReason}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            bgcolor: fundApprovalAction === "approve" ? "#10B981" : "#DC2626",
                            "&:hover": {
                                bgcolor: fundApprovalAction === "approve" ? "#059669" : "#B91C1C"
                            },
                            "&:disabled": {
                                bgcolor: "#D1D5DB"
                            }
                        }}
                    >
                        {fundApprovalAction === "approve" ? "Approve Allocation" : "Reject Allocation"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
