import {
    Box,
    Button,
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
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
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
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { expenceDashboard, getAddedExpence, getAddedFund, postFund, postExpence, expenceApprovalStatusCheck, updateAddexpenceApprovalAction, fundApprovalStatusCheck, updateAddFundApprovalAction, myExpenceRequests, myFundRequests } from '../../../../Api/Api'
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
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Teachers don't have access to Expense Management
    useEffect(() => {
        if (userType === "teacher") {
            navigate(-1);
        }
    }, [userType]);
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
    const [approvalsStatusFilter, setApprovalsStatusFilter] = useState("Requested");
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
    const [myRequestsData, setMyRequestsData] = useState([]);
    const [myFundRequestsData, setMyFundRequestsData] = useState([]);
    const [myRequestsTypeFilter, setMyRequestsTypeFilter] = useState("Expense");
    const [myRequestsStatusFilter, setMyRequestsStatusFilter] = useState("All");

    // Role-based tab configuration
    const getTabs = () => {
        if (userType === "superadmin") {
            return [
                { key: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
                { key: "addExpense", label: "Add Expense", icon: <AddIcon /> },
                { key: "approvals", label: "Approvals", icon: <PendingActionsIcon /> },
                { key: "history", label: "History", icon: <HistoryIcon /> },
            ];
        }
        if (userType === "admin") {
            return [
                { key: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
                { key: "requestExpense", label: "Request Expense", icon: <AddIcon /> },
                { key: "approvals", label: "Approvals", icon: <PendingActionsIcon /> },
                { key: "myRequests", label: "My Requests", icon: <TrackChangesIcon /> },
                { key: "history", label: "History", icon: <HistoryIcon /> },
            ];
        }
        // staff
        return [
            { key: "requestExpense", label: "Request Expense", icon: <AddIcon /> },
            { key: "myRequests", label: "My Requests", icon: <TrackChangesIcon /> },
        ];
    };

    const tabs = getTabs();
    const activeTabKey = tabs[activeTab]?.key || tabs[0]?.key;


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
        requestedBy: userName,
        requestedByEmail: ""
    });

    const [approvalAction, setApprovalAction] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

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

    const formatDateForApi = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}-${m}-${y}`;
    };

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
                requestedBy: userName,
                requestedByEmail: ""
            });
            setMessage(userType === "superadmin" ? "Expense added successfully!" : "Expense request submitted successfully!");
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
        if (activeTabKey === "approvals") {
            if (approvalsTypeFilter === "Expense") {
                fetchPendingExpenseData();
            } else {
                fetchPendingFundData();
            }
        }
    }, [activeTabKey, approvalsTypeFilter, approvalsStatusFilter]);

    useEffect(() => {
        if (activeTabKey === "history") {
            if (historyTypeFilter === "Expense") {
                fetchHistoryAllowData();
            } else {
                fetchHistoryData();
            }
        }
    }, [activeTabKey, statusFilter, historyTypeFilter]);

    useEffect(() => {
        if (activeTabKey === "myRequests") {
            if (myRequestsTypeFilter === "Expense") {
                fetchMyExpenseRequests();
            } else {
                fetchMyFundRequests();
            }
        }
    }, [activeTabKey, myRequestsStatusFilter, myRequestsTypeFilter]);

    const fetchMyExpenseRequests = async () => {
        setIsLoading(true);
        try {
            const statusParam = myRequestsStatusFilter === "All" ? "" : myRequestsStatusFilter;
            const res = await axios.get(myExpenceRequests, {
                params: {
                    RollNumber: rollNumber,
                    Status: statusParam,
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data?.success && Array.isArray(res.data.requests)) {
                setMyRequestsData(res.data.requests);
            } else {
                setMyRequestsData([]);
            }
        } catch (error) {
            console.error("Error fetching my expense requests:", error);
            setMyRequestsData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyFundRequests = async () => {
        setIsLoading(true);
        try {
            const statusParam = myRequestsStatusFilter === "All" ? "" : myRequestsStatusFilter;
            const res = await axios.get(myFundRequests, {
                params: {
                    RollNumber: rollNumber,
                    Status: statusParam,
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data?.success && Array.isArray(res.data.funds)) {
                setMyFundRequestsData(res.data.funds);
            } else {
                setMyFundRequestsData([]);
            }
        } catch (error) {
            console.error("Error fetching my fund requests:", error);
            setMyFundRequestsData([]);
        } finally {
            setIsLoading(false);
        }
    };

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
                mb: 2,
                p: 2,
                borderRadius: "5px",
                border: "1px solid #E8DDEA",
                bgcolor: "#fff"
            }}>
                <Box>
                    <Typography sx={{ fontSize: "13px", color: "#777", fontWeight: 500, mb: 0.5 }}>
                        Current Allocation
                    </Typography>
                    <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#111" }}>
                        ₹{(dashboardData?.currentAllocationMonthly ?? 0).toLocaleString()}
                    </Typography>
                </Box>
                {userType === "superadmin" && (
                    <IconButton
                        onClick={() => setOpenAllocationDialog(true)}
                        sx={{
                            bgcolor: "#667eea",
                            color: "#fff",
                            "&:hover": {
                                bgcolor: "#5568d3"
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
                    mb: 2,
                    p: 2,
                    border: "1px solid #FCA5A5",
                    borderRadius: "5px",
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
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Box sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", p: 2, bgcolor: "#fff" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: "12px", color: "#065F46", fontWeight: 600, mb: 1 }}>
                                    APPROVED EXPENSES
                                </Typography>
                                <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#064E3B", mb: 0.5 }}>
                                    ₹{(dashboardData?.approvedExpensesAmount ?? 0).toLocaleString()}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", color: "#10B981", fontWeight: 500 }}>
                                    {dashboardData?.approvedExpensesCount ?? 0} requests approved
                                </Typography>
                            </Box>
                            <CheckCircleIcon sx={{ color: "#10B981", fontSize: 28 }} />
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Box sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", p: 2, bgcolor: "#fff" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: "12px", color: "#92400E", fontWeight: 600, mb: 1 }}>
                                    PENDING APPROVAL
                                </Typography>
                                <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#78350F", mb: 0.5 }}>
                                    ₹{(dashboardData?.pendingApprovalAmount ?? 0).toLocaleString()}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", color: "#F59E0B", fontWeight: 500 }}>
                                    {dashboardData?.pendingApprovalCount ?? 0} requests waiting
                                </Typography>
                            </Box>
                            <PendingActionsIcon sx={{ color: "#F59E0B", fontSize: 28 }} />
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Box sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", p: 2, bgcolor: "#fff" }}>
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
                                    fontSize: "24px",
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
                            <AccountBalanceWalletIcon sx={{
                                color: (dashboardData?.remainingBalance ?? 0) > 0 ? "#3B82F6" : "#DC2626",
                                fontSize: 28
                            }} />
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                    <Box sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", p: 2, bgcolor: "#fff" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: "12px", color: "#5B21B6", fontWeight: 600, mb: 1 }}>
                                    BUDGET UTILIZATION
                                </Typography>
                                <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#4C1D95", mb: 0.5 }}>
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
                            <TrendingUpIcon sx={{ color: "#8B5CF6", fontSize: 28 }} />
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Recent Expense History Table */}
            <Box sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", overflow: "hidden", bgcolor: "#fff" }}>
                {/* Header */}
                <Box sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid #E8DDEA",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "#faf6fc"
                }}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                        Recent Expense History
                    </Typography>
                    <Button
                        size="small"
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
                            borderRadius: "30px",
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
                            {["Date", "Category", "Requested By", "Description", "Amount", "Status"].map((h) => (
                                <TableCell key={h} sx={{ backgroundColor: "#faf6fc", borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontWeight: 600, fontSize: "13px", py: 1 }}>
                                    {h}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dashboardExpenseData.length > 0 ? (
                            dashboardExpenseData.slice(0, 5).map((item, idx) => {
                                const reqBy = parseUser(item.createdBy);
                                const displayStatus = item.status === "Requested" ? "Pending" : item.status;
                                return (
                                    <TableRow key={item.expenceId} sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "12px", color: "#374151", whiteSpace: "nowrap" }}>
                                            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            <Chip
                                                label={item.category || '-'}
                                                size="small"
                                                sx={{ fontSize: "10px", bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontWeight: 600, height: 20 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                                                {reqBy.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>
                                                {reqBy.roll}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", maxWidth: 220 }}>
                                            <Tooltip title={item.description} arrow>
                                                <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {item.description || '-'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#DC2626", whiteSpace: "nowrap" }}>
                                            ₹{(item.expenceAmount ?? 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Chip
                                                label={displayStatus}
                                                size="small"
                                                sx={{
                                                    fontSize: "10px",
                                                    fontWeight: 600,
                                                    height: 20,
                                                    bgcolor: displayStatus === "Approved" ? "#E8F5E9" :
                                                        displayStatus === "Pending" ? "#FFF3E0" : "#FFEBEE",
                                                    color: displayStatus === "Approved" ? "#2E7D32" :
                                                        displayStatus === "Pending" ? "#E65100" : "#C62828",
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
            </Box>
        </Box>
    );

    // Render Request Tab
    const renderRequest = () => (
        <Box>
            <Box sx={{
                border: "1px solid #E8DDEA",
                borderRadius: "5px",
                maxWidth: 800,
                mx: "auto",
                bgcolor: "#fff"
            }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E8DDEA", bgcolor: "#faf6fc" }}>
                    <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                        {userType === "superadmin" ? "Add New Expense" : "Request New Expense"}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#777", mt: 0.3 }}>
                        {userType === "superadmin"
                            ? "Fill in the details below to add the expense directly"
                            : "Fill in the details below to submit your expense request for approval"}
                    </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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

                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
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

                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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

                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
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

                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Box sx={{
                                p: 2,
                                borderRadius: "5px",
                                bgcolor: "#faf6fc",
                                border: "1px solid #E8DDEA"
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
                                requestedBy: userName,
                                requestedByEmail: ""
                            })}
                            sx={{
                                textTransform: "none",
                                borderRadius: "30px",
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
                                borderRadius: "30px",
                                px: 4,
                                bgcolor: "#667eea",
                                "&:hover": {
                                    bgcolor: "#5568d3"
                                }
                            }}
                        >
                            {userType === "superadmin" ? "Add Expense" : "Submit Request"}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    // ── Render My Requests (Status) Tab ────────────────────────────────────
    const renderMyRequests = () => {
        const isExpense = myRequestsTypeFilter === "Expense";
        const sourceData = isExpense ? myRequestsData : myFundRequestsData;
        const statusTabs = [
            { key: "All", label: "All" },
            { key: "Requested", label: "Pending" },
            { key: "Approved", label: "Approved" },
            { key: "Declined", label: "Rejected" },
        ];

        return (
            <Box>
                {/* Filter Bar */}
                <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", mb: 2 }}>
                    <Grid container sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                            {(userType === "staff" ? ["Expense"] : ["Expense", "Fund (Allocation)"]).map((type) => {
                                const key = type === "Fund (Allocation)" ? "Fund" : "Expense";
                                const isActive = key === myRequestsTypeFilter;
                                const activeColor = key === "Expense" ? "#DC2626" : "#667eea";
                                const hoverColor = key === "Expense" ? "#B91C1C" : "#5568d3";
                                return (
                                    <Button
                                        key={type}
                                        variant={isActive ? "contained" : "outlined"}
                                        size="small"
                                        onClick={() => { setMyRequestsTypeFilter(key); setMyRequestsStatusFilter("All"); }}
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: "999px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            height: 28,
                                            px: 2,
                                            boxShadow: "none",
                                            ...(isActive ? {
                                                bgcolor: activeColor,
                                                borderColor: activeColor,
                                                "&:hover": { bgcolor: hoverColor, boxShadow: "none" }
                                            } : {
                                                borderColor: "#ccc",
                                                color: "#555",
                                                "&:hover": { borderColor: "#667eea", color: "#667eea", bgcolor: "transparent" }
                                            })
                                        }}
                                    >
                                        {type}
                                    </Button>
                                );
                            })}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1, py: 0.5 }}>
                            {statusTabs.map((tab) => (
                                <Button
                                    key={tab.key}
                                    size="small"
                                    variant={myRequestsStatusFilter === tab.key ? "contained" : "outlined"}
                                    onClick={() => setMyRequestsStatusFilter(tab.key)}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "999px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        height: 28,
                                        px: 2,
                                        boxShadow: "none",
                                        ...(myRequestsStatusFilter === tab.key ? {
                                            bgcolor: "#667eea",
                                            borderColor: "#667eea",
                                            "&:hover": { bgcolor: "#5568d3", boxShadow: "none" }
                                        } : {
                                            borderColor: "#ccc",
                                            color: "#555",
                                            bgcolor: "#fff",
                                            "&:hover": { borderColor: "#667eea", color: "#667eea", bgcolor: "transparent" }
                                        })
                                    }}
                                >
                                    {tab.label}
                                </Button>
                            ))}
                            <Typography sx={{ fontSize: "12px", color: "#777", fontWeight: 500, whiteSpace: "nowrap", ml: 0.5 }}>
                                {sourceData.length} records
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Request Tables */}
                {isLoading ? (
                    <Box sx={{ textAlign: "center", py: 8, bgcolor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>
                        <LinearProgress sx={{ mb: 2, mx: "auto", width: "50%", borderRadius: 2, "& .MuiLinearProgress-bar": { bgcolor: "#667eea" } }} />
                        <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>Loading requests...</Typography>
                    </Box>
                ) : sourceData.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8, bgcolor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>
                        <TrackChangesIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
                        <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#6B7280" }}>
                            No requests found
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
                            {myRequestsStatusFilter === "All"
                                ? `You haven't submitted any ${isExpense ? "expense" : "fund"} requests yet.`
                                : `No ${statusTabs.find(t => t.key === myRequestsStatusFilter)?.label?.toLowerCase() || myRequestsStatusFilter.toLowerCase()} ${isExpense ? "expense" : "fund"} requests to display.`}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {sourceData.map((item, index) => {
                            const displayStatus = item.status === "Requested" ? "Pending" : item.status === "Declined" ? "Rejected" : item.status;
                            return (
                                <Box key={index}>
                                    {/* Colored tab */}
                                    <Box sx={{ display: "flex", alignItems: "end" }}>
                                        <Box sx={{
                                            bgcolor: isExpense ? "#DC2626" : "#667eea",
                                            color: "#fff",
                                            fontSize: "13px",
                                            px: 3,
                                            py: 0.2,
                                            ml: "15px",
                                            fontWeight: 600,
                                            borderTopLeftRadius: "7px",
                                            borderTopRightRadius: "7px",
                                            width: "fit-content",
                                            height: "20px",
                                        }}>
                                            {isExpense ? "Expense Request" : "Fund Request"}
                                        </Box>
                                        <Box sx={{ ml: 1.5 }}>{renderStatusChip(item.status)}</Box>
                                    </Box>

                                    {/* Table body */}
                                    <Box sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", bgcolor: "#fff", overflow: "hidden" }}>
                                        {isExpense ? (
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {["Date", "Category", "Description", "Amount", "Payment Method", "Status", ...(displayStatus === "Rejected" && item.rejectionReason ? ["Rejection Reason"] : [])].map((h) => (
                                                            <TableCell key={h} sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc", fontWeight: 600, fontSize: "13px", py: 1 }}>
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", whiteSpace: "nowrap" }}>
                                                            {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px" }}>
                                                            {item.category || "—"}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", maxWidth: 220 }}>
                                                            <Tooltip title={item.description || ''} arrow>
                                                                <Typography sx={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    {item.description || "—"}
                                                                </Typography>
                                                            </Tooltip>
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#DC2626", whiteSpace: "nowrap" }}>
                                                            ₹{(item.expenceAmount || item.amount || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                            <Chip label={item.paymentMethod || "—"} size="small" sx={{ fontSize: "11px", height: "22px", bgcolor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }} />
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: (displayStatus === "Rejected" && item.rejectionReason) ? 1 : 0, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                            <Chip
                                                                label={displayStatus}
                                                                size="small"
                                                                sx={{
                                                                    fontSize: "11px",
                                                                    fontWeight: 600,
                                                                    bgcolor: displayStatus === "Approved" ? "#E8F5E9" : displayStatus === "Pending" ? "#FFF3E0" : "#FFEBEE",
                                                                    color: displayStatus === "Approved" ? "#2E7D32" : displayStatus === "Pending" ? "#E65100" : "#C62828",
                                                                }}
                                                            />
                                                        </TableCell>
                                                        {displayStatus === "Rejected" && item.rejectionReason && (
                                                            <TableCell sx={{ textAlign: "center", fontSize: "12px", color: "#C62828" }}>
                                                                {item.rejectionReason}
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {["Date", "Amount", "Description", "Status", ...(displayStatus === "Rejected" && item.rejectionReason ? ["Rejection Reason"] : [])].map((h) => (
                                                            <TableCell key={h} sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc", fontWeight: 600, fontSize: "13px", py: 1 }}>
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", whiteSpace: "nowrap" }}>
                                                            {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#667eea", whiteSpace: "nowrap" }}>
                                                            ₹{(item.fundAmount || item.amount || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px" }}>
                                                            {item.description || item.notes || "—"}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: (displayStatus === "Rejected" && item.rejectionReason) ? 1 : 0, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                            <Chip
                                                                label={displayStatus}
                                                                size="small"
                                                                sx={{
                                                                    fontSize: "11px",
                                                                    fontWeight: 600,
                                                                    bgcolor: displayStatus === "Approved" ? "#E8F5E9" : displayStatus === "Pending" ? "#FFF3E0" : "#FFEBEE",
                                                                    color: displayStatus === "Approved" ? "#2E7D32" : displayStatus === "Pending" ? "#E65100" : "#C62828",
                                                                }}
                                                            />
                                                        </TableCell>
                                                        {displayStatus === "Rejected" && item.rejectionReason && (
                                                            <TableCell sx={{ textAlign: "center", fontSize: "12px", color: "#C62828" }}>
                                                                {item.rejectionReason}
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>
        );
    };

    // Render Approvals Tab
    const renderApprovals = () => {
        const isExpense = approvalsTypeFilter === "Expense";
        const dataList = isExpense ? pendingExpenseData : pendingFundData;

        return (
            <Box>
                {/* Filter Bar — SchoolMate style grey header */}
                <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd"}}>
                    <Grid container sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", gap: 1, }}>
                            {["Expense", "Fund (Allocation)"].map((type) => (
                                <Button
                                    key={type}
                                    variant={approvalsTypeFilter === type ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => setApprovalsTypeFilter(type)}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "999px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        height: 28,
                                        px: 2,
                                        boxShadow: "none",
                                        ...(approvalsTypeFilter === type ? {
                                            bgcolor: isExpense ? "#DC2626" : "#667eea",
                                            borderColor: isExpense ? "#DC2626" : "#667eea",
                                            "&:hover": { bgcolor: isExpense ? "#B91C1C" : "#5568d3", boxShadow: "none" }
                                        } : {
                                            borderColor: "#ccc",
                                            color: "#555",
                                            "&:hover": { borderColor: "#667eea", color: "#667eea", bgcolor: "transparent" }
                                        })
                                    }}
                                >
                                    {type}
                                </Button>
                            ))}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" }, py: 0.5 }}>
                            <Typography sx={{ fontSize: "12px", color: "#777", fontWeight: 500, whiteSpace: "nowrap" }}>
                                {dataList.filter((d) => parseUser(d.createdBy).roll !== String(rollNumber)).length} pending records
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Content */}
                {isLoading ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                        <Typography sx={{ fontSize: "14px", color: "#9CA3AF" }}>Loading...</Typography>
                    </Box>
                ) : dataList.length === 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
                        <PendingActionsIcon sx={{ fontSize: 56, color: "#D1D5DB", mb: 1.5 }} />
                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#6B7280" }}>
                            No {isExpense ? "Expense" : "Fund"} Records Found
                        </Typography>
                    </Box>
                ) : (
                    <Grid container sx={{ pb: 2 }}>
                        {isExpense ? (
                            pendingExpenseData.filter((item) => parseUser(item.createdBy).roll !== String(rollNumber)).map((item) => {
                                const requestedBy = parseUser(item.createdBy);
                                const canAct = (userType === "superadmin" || userType === "admin") && item.status === "Requested";
                                return (
                                    <Grid key={item.expenceId} size={{ lg: 12, md: 8 }}>
                                        {/* Tab row */}
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                                            <Box sx={{ display: "flex", alignItems: "end" }}>
                                                <Box sx={{
                                                    bgcolor: "#DC2626",
                                                    color: "#fff",
                                                    fontSize: "13px",
                                                    px: 3,
                                                    py: 0.2,
                                                    ml: "15px",
                                                    fontWeight: 600,
                                                    borderTopLeftRadius: "7px",
                                                    borderTopRightRadius: "7px",
                                                    width: "fit-content",
                                                    height: "20px",
                                                }}>
                                                    {item.category || "Expense"}
                                                </Box>
                                                <Box sx={{ ml: 1.5 }}>{renderStatusChip(item.status)}</Box>
                                            </Box>
                                            <Box sx={{ color: "#000", fontSize: "13px", mt: "30px", px: 3, py: 0.2, ml: "15px", fontWeight: 600, borderTopLeftRadius: "7px", borderTopRightRadius: "7px", width: "fit-content" }}>
                                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>
                                                    <span style={{ fontSize: "12px", color: "#777", fontWeight: 500 }}>Requested By : </span>
                                                    {requestedBy.name}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Card body */}
                                        <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>
                                            <Table sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", overflow: "hidden" }}>
                                                <TableHead>
                                                    <TableRow>
                                                        {["Date", "Description", "Amount", "Payment Method", "Remarks"].map((h) => (
                                                            <TableCell key={h} sx={{ borderRight: "1px solid #E8DDEA", textAlign: "center", backgroundColor: "#faf6fc", fontWeight: 600, fontSize: "13px", py: 1 }}>
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ borderRight: "1px solid #E8DDEA", textAlign: "center", fontSize: "13px", whiteSpace: "nowrap" }}>
                                                            {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: "1px solid #E8DDEA", textAlign: "center", fontSize: "13px", maxWidth: 260 }}>
                                                            <Tooltip title={item.description || ''} arrow>
                                                                <Typography sx={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    {item.description || "—"}
                                                                </Typography>
                                                            </Tooltip>
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: "1px solid #E8DDEA", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#DC2626", whiteSpace: "nowrap" }}>
                                                            ₹{(item.expenceAmount ?? 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: "1px solid #E8DDEA", textAlign: "center" }}>
                                                            <Chip label={item.paymentMethod || "—"} size="small" sx={{ fontSize: "11px", height: "22px", bgcolor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }} />
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", fontSize: "13px", color: "#374151" }}>
                                                            {item.remarks || "—"}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>

                                            {canAct && (
                                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2, pt: 2, borderTop: "1px solid #E8DDEA" }}>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => { setSelectedRequest(item); setApprovalAction("decline"); setOpenApprovalDialog(true); }}
                                                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "999px", height: 28, fontSize: "13px", boxShadow: "none" }}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => { setSelectedRequest(item); setApprovalAction("approve"); setOpenApprovalDialog(true); }}
                                                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "999px", height: 28, fontSize: "13px", boxShadow: "none" }}
                                                    >
                                                        Approve
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                );
                            })
                        ) : (
                            pendingFundData.filter((fund) => parseUser(fund.createdBy).roll !== String(rollNumber)).map((fund) => {
                                const addedBy = parseUser(fund.createdBy);
                                const canAct = (userType === "superadmin" || userType === "admin") && fund.status === "Requested";
                                return (
                                    <Grid key={fund.addFundId} size={{ lg: 12, md: 8 }}>
                                        {/* Tab row */}
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                                            <Box sx={{ display: "flex", alignItems: "end" }}>
                                                <Box sx={{
                                                    bgcolor: "#667eea",
                                                    color: "#fff",
                                                    fontSize: "13px",
                                                    px: 3,
                                                    py: 0.2,
                                                    ml: "15px",
                                                    fontWeight: 600,
                                                    borderTopLeftRadius: "7px",
                                                    borderTopRightRadius: "7px",
                                                    width: "fit-content",
                                                    height: "20px",
                                                }}>
                                                    Fund Allocation
                                                </Box>
                                                <Box sx={{ ml: 1.5 }}>{renderStatusChip(fund.status)}</Box>
                                            </Box>
                                            <Box sx={{ color: "#000", fontSize: "13px", mt: "30px", px: 3, py: 0.2, ml: "15px", fontWeight: 600, borderTopLeftRadius: "7px", borderTopRightRadius: "7px", width: "fit-content" }}>
                                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>
                                                    <span style={{ fontSize: "12px", color: "#777", fontWeight: 500 }}>Added By : </span>
                                                    {addedBy.name}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Card body */}
                                        <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E8DDEA", borderRadius: "5px" }}>
                                            <Table sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", overflow: "hidden" }}>
                                                <TableHead>
                                                    <TableRow>
                                                        {["Date", "Description", "Amount"].map((h) => (
                                                            <TableCell key={h} sx={{ borderRight: "1px solid #E8DDEA", textAlign: "center", backgroundColor: "#f5f3ff", fontWeight: 600, fontSize: "13px", py: 1 }}>
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ borderRight: "1px solid #E8DDEA", textAlign: "center", fontSize: "13px", whiteSpace: "nowrap" }}>
                                                            {fund.date ? new Date(fund.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: "1px solid #E8DDEA", textAlign: "center", fontSize: "13px" }}>
                                                            {fund.description || "—"}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#667eea", whiteSpace: "nowrap" }}>
                                                            ₹{(fund.fundAmount ?? 0).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>

                                            {canAct && (
                                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2, pt: 2, borderTop: "1px solid #E8DDEA" }}>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => { setSelectedFund(fund); setFundApprovalAction("decline"); setOpenFundApprovalDialog(true); }}
                                                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "999px", height: 28, fontSize: "13px", boxShadow: "none" }}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => { setSelectedFund(fund); setFundApprovalAction("approve"); setOpenFundApprovalDialog(true); }}
                                                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "999px", height: 28, fontSize: "13px", boxShadow: "none" }}
                                                    >
                                                        Approve
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                );
                            })
                        )}
                    </Grid>
                )}
            </Box>
        );
    };

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
        backgroundColor: "#faf6fc",
        borderRight: 1,
        borderColor: "#E8DDEA",
        textAlign: "center",
        fontWeight: 600,
        fontSize: "13px",
        py: 1,
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
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", mb: 2 }}>
                <Grid container sx={{ alignItems: "center" }}>
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                        {["Expense", "Fund (Allocation)"].map((type) => {
                            const isActive = historyTypeFilter === type;
                            const isExpenseType = type === "Expense";
                            const activeColor = isExpenseType ? "#DC2626" : "#667eea";
                            const hoverColor = isExpenseType ? "#B91C1C" : "#5568d3";
                            return (
                                <Button
                                    key={type}
                                    variant={isActive ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => {
                                        setHistoryTypeFilter(type);
                                        setSearchQuery("");
                                    }}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "999px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        height: 28,
                                        px: 2,
                                        boxShadow: "none",
                                        ...(isActive ? {
                                            bgcolor: activeColor,
                                            borderColor: activeColor,
                                            "&:hover": { bgcolor: hoverColor, boxShadow: "none" }
                                        } : {
                                            borderColor: "#ccc",
                                            color: "#555",
                                            "&:hover": { borderColor: "#667eea", color: "#667eea", bgcolor: "transparent" }
                                        })
                                    }}
                                >
                                    {type}
                                </Button>
                            );
                        })}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1, flexWrap: "wrap", py: 0.5 }}>
                        {[
                            { key: "", label: "All" },
                            { key: "Requested", label: "Pending" },
                            { key: "Approved", label: "Approved" },
                            { key: "Declined", label: "Rejected" },
                        ].map((tab) => (
                            <Button
                                key={tab.key}
                                size="small"
                                variant={statusFilter === tab.key ? "contained" : "outlined"}
                                onClick={() => setStatusFilter(tab.key)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "999px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    height: 28,
                                    px: 2,
                                    boxShadow: "none",
                                    ...(statusFilter === tab.key ? {
                                        bgcolor: "#667eea",
                                        borderColor: "#667eea",
                                        "&:hover": { bgcolor: "#5568d3", boxShadow: "none" }
                                    } : {
                                        borderColor: "#ccc",
                                        color: "#555",
                                        bgcolor: "#fff",
                                        "&:hover": { borderColor: "#667eea", color: "#667eea", bgcolor: "transparent" }
                                    })
                                }}
                            >
                                {tab.label}
                            </Button>
                        ))}
                        <TextField
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#9CA3AF", fontSize: 18 }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            sx={{ width: 170, backgroundColor: "#fff", "& .MuiOutlinedInput-root": { borderRadius: "5px", height: 28 } }}
                            size="small"
                        />
                        <Typography sx={{ fontSize: "12px", color: "#777", fontWeight: 500, whiteSpace: "nowrap" }}>
                            {filteredHistory.length} of {activeHistoryData.length} records
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Colored Tab */}
            <Box sx={{
                bgcolor: historyTypeFilter === "Expense" ? "#DC2626" : "#667eea",
                color: "#fff",
                fontSize: "13px",
                px: 3,
                py: 0.2,
                ml: "15px",
                fontWeight: 600,
                borderTopLeftRadius: "7px",
                borderTopRightRadius: "7px",
                width: "fit-content",
                height: "20px",
            }}>
                {historyTypeFilter === "Expense" ? "Expense History" : "Fund History"}
            </Box>

            {/* Table */}
            <Box sx={{ border: "1px solid #E8DDEA", borderRadius: "5px", overflow: "hidden", bgcolor: "#fff" }}>
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
                                            <TableRow key={item.expenceId} sx={{ bgcolor: idx % 2 === 0 ? "#fff" : "#FAFAFA", "&:hover": { bgcolor: "#f5f0fa" } }}>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", color: "#9CA3AF" }}>
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>
                                                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                    <Chip
                                                        label={item.category || '-'}
                                                        size="small"
                                                        sx={{ fontSize: "11px", bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                                        {requestedBy.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                        Roll: {requestedBy.roll}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", maxWidth: 180 }}>
                                                    <Tooltip title={item.description} arrow>
                                                        <Typography sx={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {item.description || '-'}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>
                                                    {item.paymentMethod || '-'}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", color: "#6B7280" }}>
                                                    {item.remarks || '-'}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#DC2626", whiteSpace: "nowrap" }}>
                                                    ₹{(item.expenceAmount ?? 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                    {renderStatusChip(item.status)}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
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
                                            <TableRow key={item.addFundId} sx={{ bgcolor: idx % 2 === 0 ? "#fff" : "#FAFAFA", "&:hover": { bgcolor: "#f0f0ff" } }}>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", color: "#9CA3AF" }}>
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>
                                                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                                        {addedBy.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                                        Roll: {addedBy.roll}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", maxWidth: 200 }}>
                                                    <Tooltip title={item.description} arrow>
                                                        <Typography sx={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {item.description || '-'}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", color: "#6B7280" }}>
                                                    {item.remarks || '-'}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#667eea", whiteSpace: "nowrap" }}>
                                                    ₹{(item.fundAmount ?? 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                    {renderStatusChip(item.status)}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
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
        </Box>
    );

    return (
        <Box sx={{ border: "1px solid #ccc", borderRadius: "20px", px: 2,py:1, height: "86vh", display: "flex", flexDirection: "column" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontSize: "20px", fontWeight: "600" }}>Expense Management</Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        const expenseTabIndex = tabs.findIndex(t => t.key === "addExpense" || t.key === "requestExpense");
                        if (expenseTabIndex !== -1) setActiveTab(expenseTabIndex);
                    }}
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
                    {userType === "superadmin" ? "Add Expense" : "New Request"}
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
                    {tabs.map((tab) => (
                        <Tab key={tab.key} icon={tab.icon} iconPosition="start" label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
                {activeTabKey === "dashboard" && renderDashboard()}
                {(activeTabKey === "addExpense" || activeTabKey === "requestExpense") && renderRequest()}
                {activeTabKey === "approvals" && renderApprovals()}
                {activeTabKey === "myRequests" && renderMyRequests()}
                {activeTabKey === "history" && renderHistory()}
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
                PaperProps={{
                    sx: {
                        borderRadius: "10px",
                        minWidth: 420,
                        overflow: "hidden",
                        border: "1px solid #E5E7EB",
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 3,
                    py: 1.5,
                    bgcolor: "#f2f2f2",
                    borderBottom: "1px solid #ddd",
                }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>
                        {approvalAction === "approve" ? "Approve Request" : "Reject Request"}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setOpenApprovalDialog(false);
                            setSelectedRequest(null);
                            setApprovalAction("");
                            setRejectionReason("");
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* Body */}
                <Box sx={{ p: 3 }}>
                    {selectedRequest && approvalAction === "decline" && (
                        <>
                            <Typography sx={{ fontSize: "13px", color: "#555", mb: 2 }}>
                                Please provide a reason for rejecting this expense request.
                            </Typography>
                            <TextField
                                fullWidth
                                required
                                multiline
                                rows={4}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                    },
                                }}
                            />
                        </>
                    )}

                    {selectedRequest && approvalAction === "approve" && (
                        <Typography sx={{ fontSize: "14px", color: "#333", textAlign: "center", py: 1 }}>
                            Are you sure you want to approve this expense of <strong>₹{(selectedRequest.expenceAmount ?? 0).toLocaleString()}</strong>?
                        </Typography>
                    )}
                </Box>

                {/* Footer */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderTop: "1px solid #eee", gap: 1 }}>
                    <Button
                        onClick={() => {
                            setOpenApprovalDialog(false);
                            setSelectedRequest(null);
                            setApprovalAction("");
                            setRejectionReason("");
                        }}
                        sx={{
                            border: "1px solid #000",
                            borderRadius: "30px",
                            textTransform: "none",
                            width: "100px",
                            height: "30px",
                            color: "#000",
                            fontSize: "13px",
                            fontWeight: 600,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApprovalAction}
                        disabled={approvalAction === "decline" && !rejectionReason}
                        sx={{
                            bgcolor: approvalAction === "approve" ? "#2E7D32" : "#DC2626",
                            borderRadius: "30px",
                            textTransform: "none",
                            px: 3,
                            height: "30px",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: 600,
                            "&:hover": {
                                bgcolor: approvalAction === "approve" ? "#1B5E20" : "#B91C1C",
                            },
                            "&.Mui-disabled": {
                                bgcolor: "#E0E0E0",
                                color: "#aaa",
                            },
                        }}
                    >
                        {approvalAction === "approve" ? "Approve" : "Reject"}
                    </Button>
                </Box>
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