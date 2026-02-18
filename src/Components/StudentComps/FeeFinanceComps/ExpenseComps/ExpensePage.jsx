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
import toast from 'react-hot-toast'

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
    "Petty Cash"
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
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0); // 0: Dashboard, 1: Request, 2: Approvals, 3: History
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [expenseRequests, setExpenseRequests] = useState(mockExpenseRequests);
    const [openRequestDialog, setOpenRequestDialog] = useState(false);
    const [openAllocationDialog, setOpenAllocationDialog] = useState(false);
    const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Current user role (mock - replace with actual auth)
    const [currentUser] = useState({
        name: "Current User",
        email: "user@school.com",
        role: "Admin" // Admin, Super Admin, User
    });

    // Petty Cash Allocation
    const [allocation, setAllocation] = useState({
        amount: 50000,
        period: "Monthly",
        allocatedDate: "2026-02-01",
        notes: "Monthly petty cash allocation for February 2026"
    });

    const [newAllocation, setNewAllocation] = useState({
        amount: "",
        period: "Monthly",
        allocatedDate: new Date().toISOString().split('T')[0],
        notes: ""
    });

    // New expense request form
    const [newRequest, setNewRequest] = useState({
        requestDate: new Date().toISOString().split('T')[0],
        category: "",
        description: "",
        amount: "",
        paymentMethod: "",
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

    // Handle submit expense request
    const handleSubmitRequest = () => {
        if (!newRequest.category || !newRequest.description || !newRequest.amount || !newRequest.paymentMethod) {
            toast.error("Please fill all required fields");
            return;
        }

        if (parseFloat(newRequest.amount) <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        const request = {
            id: expenseRequests.length + 1,
            ...newRequest,
            amount: parseFloat(newRequest.amount),
            status: "Pending",
            approvalDate: null,
            approvedBy: null,
            rejectionReason: null
        };

        setExpenseRequests([request, ...expenseRequests]);
        setOpenRequestDialog(false);
        setNewRequest({
            requestDate: new Date().toISOString().split('T')[0],
            category: "",
            description: "",
            amount: "",
            paymentMethod: "",
            requestedBy: currentUser.name,
            requestedByEmail: currentUser.email
        });
        toast.success("Expense request submitted successfully!");
        setActiveTab(2); // Switch to approvals tab
    };

    // Handle approve/reject request
    const handleApprovalAction = () => {
        if (!approvalAction) {
            toast.error("Please select an action");
            return;
        }

        if (approvalAction === "reject" && !rejectionReason) {
            toast.error("Please provide a rejection reason");
            return;
        }

        const updatedRequests = expenseRequests.map(req => {
            if (req.id === selectedRequest.id) {
                return {
                    ...req,
                    status: approvalAction === "approve" ? "Approved" : "Rejected",
                    approvalDate: new Date().toISOString().split('T')[0],
                    approvedBy: currentUser.name,
                    rejectionReason: approvalAction === "reject" ? rejectionReason : null
                };
            }
            return req;
        });

        setExpenseRequests(updatedRequests);
        setOpenApprovalDialog(false);
        setSelectedRequest(null);
        setApprovalAction("");
        setRejectionReason("");
        toast.success(`Request ${approvalAction === "approve" ? "approved" : "rejected"} successfully!`);
    };

    // Handle set allocation
    const handleSetAllocation = () => {
        if (!newAllocation.amount || parseFloat(newAllocation.amount) <= 0) {
            toast.error("Please enter a valid allocation amount");
            return;
        }

        setAllocation({
            amount: parseFloat(newAllocation.amount),
            period: newAllocation.period,
            allocatedDate: newAllocation.allocatedDate,
            notes: newAllocation.notes
        });

        setOpenAllocationDialog(false);
        setNewAllocation({
            amount: "",
            period: "Monthly",
            allocatedDate: new Date().toISOString().split('T')[0],
            notes: ""
        });
        toast.success("Allocation updated successfully!");
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
                        Current Allocation - {allocation.period}
                    </Typography>
                    <Typography sx={{ fontSize: "32px", fontWeight: 700, color: "#0d47a1" }}>
                        ₹{allocation.amount.toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", opacity: 0.7, mt: 0.5, color: "#1976d2" }}>
                        Allocated on {new Date(allocation.allocatedDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })}
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
            {summary.utilization > 90 && (
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
                            Budget Alert: {summary.utilization.toFixed(1)}% Utilized
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#DC2626", mt: 0.3 }}>
                            Only ₹{summary.remaining.toLocaleString()} remaining from allocated amount
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
                                        ₹{summary.approved.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#10B981", fontWeight: 500 }}>
                                        {summary.approvedCount} requests approved
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
                                        ₹{summary.pending.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#F59E0B", fontWeight: 500 }}>
                                        {summary.pendingCount} requests waiting
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
                        border: summary.remaining > 0 ? "1px solid #3B82F6" : "1px solid #DC2626",
                        borderRadius: "12px",
                        boxShadow: "none",
                        bgcolor: summary.remaining > 0 ? "#EFF6FF" : "#FEF2F2",
                        transition: "all 0.3s",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: summary.remaining > 0
                                ? "0 8px 20px rgba(59,130,246,0.2)"
                                : "0 8px 20px rgba(220,38,38,0.2)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{
                                        fontSize: "12px",
                                        color: summary.remaining > 0 ? "#1E40AF" : "#991B1B",
                                        fontWeight: 600,
                                        mb: 1
                                    }}>
                                        REMAINING BALANCE
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: "26px",
                                        fontWeight: 700,
                                        color: summary.remaining > 0 ? "#1E3A8A" : "#7F1D1D",
                                        mb: 0.5
                                    }}>
                                        ₹{summary.remaining.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: "11px",
                                        color: summary.remaining > 0 ? "#3B82F6" : "#DC2626",
                                        fontWeight: 500
                                    }}>
                                        {summary.remaining > 0 ? "Available to use" : "Budget exceeded"}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "12px",
                                    bgcolor: summary.remaining > 0 ? "#3B82F630" : "#DC262630",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: summary.remaining > 0 ? "2px solid #3B82F6" : "2px solid #DC2626"
                                }}>
                                    <AccountBalanceWalletIcon sx={{
                                        color: summary.remaining > 0 ? "#3B82F6" : "#DC2626",
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
                                        {summary.utilization.toFixed(1)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(summary.utilization, 100)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: "#DDD6FE",
                                            "& .MuiLinearProgress-bar": {
                                                bgcolor: summary.utilization > 90 ? "#DC2626" : "#8B5CF6",
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

            {/* Recent Requests */}
            <Card sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                <Box sx={{
                    p: 2.5,
                    borderBottom: "2px solid #E5E7EB",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                        Recent Expense Requests
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => setActiveTab(3)}
                        sx={{
                            textTransform: "none",
                            fontSize: "13px",
                            color: "#667eea"
                        }}
                    >
                        View All →
                    </Button>
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                    {expenseRequests.slice(0, 5).map((request) => (
                        <Box
                            key={request.id}
                            sx={{
                                p: 2,
                                borderBottom: "1px solid #F3F4F6",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                "&:hover": {
                                    bgcolor: "#F9FAFB"
                                }
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                                <Avatar sx={{
                                    bgcolor: request.status === "Approved" ? "#ECFDF5" :
                                        request.status === "Pending" ? "#FFFBEB" : "#FEF2F2",
                                    color: request.status === "Approved" ? "#10B981" :
                                        request.status === "Pending" ? "#F59E0B" : "#DC2626",
                                    width: 44,
                                    height: 44
                                }}>
                                    {request.category.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827", mb: 0.3 }}>
                                        {request.category}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: "12px",
                                        color: "#6B7280",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: 300
                                    }}>
                                        {request.description}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827", mb: 0.3 }}>
                                    ₹{request.amount.toLocaleString()}
                                </Typography>
                                <Chip
                                    label={request.status}
                                    size="small"
                                    sx={{
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        height: "20px",
                                        bgcolor: request.status === "Approved" ? "#ECFDF5" :
                                            request.status === "Pending" ? "#FFFBEB" : "#FEF2F2",
                                        color: request.status === "Approved" ? "#047857" :
                                            request.status === "Pending" ? "#B45309" : "#991B1B",
                                        border: `1px solid ${request.status === "Approved" ? "#A7F3D0" :
                                            request.status === "Pending" ? "#FCD34D" : "#FCA5A5"}`
                                    }}
                                />
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Card>
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
                                type="number"
                                value={newRequest.amount}
                                onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
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
                                    Name: {newRequest.requestedBy}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                                    Email: {newRequest.requestedByEmail}
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
    const renderApprovals = () => {
        const pendingRequests = expenseRequests.filter(req => req.status === "Pending");

        return (
            <Box>
                {pendingRequests.length === 0 ? (
                    <Card sx={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                        p: 6,
                        textAlign: "center"
                    }}>
                        <PendingActionsIcon sx={{ fontSize: 64, color: "#D1D5DB", mb: 2 }} />
                        <Typography sx={{ fontSize: "18px", fontWeight: 600, color: "#111827", mb: 1 }}>
                            No Pending Approvals
                        </Typography>
                        <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
                            All expense requests have been processed
                        </Typography>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {pendingRequests.map((request) => (
                            <Grid size={{ xs: 12, md: 6 }} key={request.id}>
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
                                            <Avatar sx={{
                                                bgcolor: "#bbdefb",
                                                color: "#0d47a1",
                                                width: 40,
                                                height: 40,
                                                fontWeight: 700
                                            }}>
                                                {request.category.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0d47a1" }}>
                                                    {request.category}
                                                </Typography>
                                                <Typography sx={{ fontSize: "11px", color: "#1565c0" }}>
                                                    {new Date(request.requestDate).toLocaleDateString('en-IN')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label="PENDING"
                                            size="small"
                                            sx={{
                                                bgcolor: "#1976d2",
                                                color: "#fff",
                                                fontWeight: 700,
                                                fontSize: "10px"
                                            }}
                                        />
                                    </Box>

                                    <CardContent sx={{ p: 2.5 }}>
                                        <Typography sx={{
                                            fontSize: "13px",
                                            color: "#374151",
                                            mb: 2,
                                            lineHeight: 1.6
                                        }}>
                                            {request.description}
                                        </Typography>

                                        <Divider sx={{ my: 2 }} />

                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                                                    Amount:
                                                </Typography>
                                                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                                                    ₹{request.amount.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                                                    Payment Method:
                                                </Typography>
                                                <Chip
                                                    label={request.paymentMethod}
                                                    size="small"
                                                    sx={{
                                                        fontSize: "11px",
                                                        height: "22px",
                                                        bgcolor: "#F3F4F6",
                                                        color: "#374151"
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                                                    Requested By:
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                                                    {request.requestedBy}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {(currentUser.role === "Admin" || currentUser.role === "Super Admin") && (
                                            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    startIcon={<ThumbDownIcon />}
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setApprovalAction("reject");
                                                        setOpenApprovalDialog(true);
                                                    }}
                                                    sx={{
                                                        textTransform: "none",
                                                        borderRadius: "8px",
                                                        borderColor: "#DC2626",
                                                        color: "#DC2626",
                                                        "&:hover": {
                                                            borderColor: "#B91C1C",
                                                            bgcolor: "#FEF2F2"
                                                        }
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    startIcon={<ThumbUpIcon />}
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setApprovalAction("approve");
                                                        setOpenApprovalDialog(true);
                                                    }}
                                                    sx={{
                                                        textTransform: "none",
                                                        borderRadius: "8px",
                                                        bgcolor: "#10B981",
                                                        "&:hover": {
                                                            bgcolor: "#059669"
                                                        }
                                                    }}
                                                >
                                                    Approve
                                                </Button>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        );
    };

    // Render History Tab
    const renderHistory = () => (
        <Box>
            {/* Filters */}
            <Box sx={{
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                p: 2,
                mb: 3
            }}>
                <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by description, category..."
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
                            sx={{
                                backgroundColor: "#fff",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px"
                                }
                            }}
                            size="small"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                label="Category"
                                sx={{
                                    backgroundColor: "#fff",
                                    borderRadius: "8px"
                                }}
                            >
                                <MenuItem value="All">All Categories</MenuItem>
                                {expenseCategories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Status"
                                sx={{
                                    backgroundColor: "#fff",
                                    borderRadius: "8px"
                                }}
                            >
                                <MenuItem value="All">All Status</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Approved">Approved</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", textAlign: "right" }}>
                            {filteredRequests.length} of {expenseRequests.length} requests
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Table */}
            <Paper sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Date
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Category
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Description
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Amount
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Requested By
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request, idx) => (
                                    <TableRow
                                        key={request.id}
                                        hover
                                        sx={{
                                            backgroundColor: idx % 2 === 0 ? "#fff" : "#F9FAFB",
                                            '&:hover': {
                                                backgroundColor: '#F3F4F6 !important',
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: "13px", color: "#374151", borderBottom: "1px solid #E5E7EB" }}>
                                            {new Date(request.requestDate).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                            <Chip
                                                label={request.category}
                                                size="small"
                                                sx={{
                                                    backgroundColor: "#F3F4F6",
                                                    color: "#374151",
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    border: "1px solid #D1D5DB"
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "13px", color: "#111827", borderBottom: "1px solid #E5E7EB", maxWidth: 300 }}>
                                            <Tooltip title={request.description} arrow>
                                                <Typography sx={{
                                                    fontSize: "13px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    {request.description}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", borderBottom: "1px solid #E5E7EB" }}>
                                            ₹{request.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "12px", color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
                                            {request.requestedBy}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                            <Tooltip
                                                title={
                                                    request.status === "Approved"
                                                        ? `Approved by ${request.approvedBy} on ${new Date(request.approvalDate).toLocaleDateString('en-IN')}`
                                                        : request.status === "Rejected"
                                                            ? `Rejected: ${request.rejectionReason}`
                                                            : "Waiting for approval"
                                                }
                                                arrow
                                            >
                                                <Chip
                                                    label={request.status}
                                                    size="small"
                                                    icon={
                                                        request.status === "Approved" ? <CheckCircleIcon sx={{ fontSize: 14 }} /> :
                                                            request.status === "Pending" ? <PendingActionsIcon sx={{ fontSize: 14 }} /> :
                                                                <CancelIcon sx={{ fontSize: 14 }} />
                                                    }
                                                    sx={{
                                                        backgroundColor: request.status === "Approved" ? "#ECFDF5" :
                                                            request.status === "Pending" ? "#FFFBEB" : "#FEF2F2",
                                                        color: request.status === "Approved" ? "#047857" :
                                                            request.status === "Pending" ? "#B45309" : "#991B1B",
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        border: request.status === "Approved" ? "1px solid #A7F3D0" :
                                                            request.status === "Pending" ? "1px solid #FCD34D" : "1px solid #FCA5A5"
                                                    }}
                                                />
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 6, borderBottom: "none" }}>
                                        <HistoryIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
                                        <Typography sx={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>
                                            No requests found matching your filters
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>
        </Box>
    );

    return (
        <Box sx={{ border: "1px solid #ccc", borderRadius: "20px", p: 2, height: "86vh", display: "flex", flexDirection: "column" }}>
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
                    <Tab
                        icon={<Badge badgeContent={summary.pendingCount} color="warning"><PendingActionsIcon /></Badge>}
                        iconPosition="start"
                        label="Pending Approvals"
                    />
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
                            Set Budget Allocation
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
                                placeholder="Enter allocation amount (e.g., 50000)"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Period *</InputLabel>
                                <Select
                                    value={newAllocation.period}
                                    onChange={(e) => setNewAllocation({ ...newAllocation, period: e.target.value })}
                                    label="Period *"
                                >
                                    <MenuItem value="Weekly">Weekly</MenuItem>
                                    <MenuItem value="Monthly">Monthly</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Allocation Date"
                                type="date"
                                value={newAllocation.allocatedDate}
                                onChange={(e) => setNewAllocation({ ...newAllocation, allocatedDate: e.target.value })}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    }
                                }}
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
                        Set Allocation
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
                                            {selectedRequest.category}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Amount:</Typography>
                                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                                            ₹{selectedRequest.amount.toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Description:</Typography>
                                        <Typography sx={{ fontSize: "13px", color: "#374151", mt: 0.5 }}>
                                            {selectedRequest.description}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>Requested By:</Typography>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                                            {selectedRequest.requestedBy} ({selectedRequest.requestedByEmail})
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            {approvalAction === "reject" && (
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
                                        ✓ This amount (₹{selectedRequest.amount.toLocaleString()}) will be deducted from the allocated budget upon approval.
                                    </Typography>
                                    <Typography sx={{ fontSize: "12px", color: "#065F46", mt: 1 }}>
                                        Remaining after approval: ₹{(summary.remaining - selectedRequest.amount).toLocaleString()}
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
                        disabled={approvalAction === "reject" && !rejectionReason}
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
        </Box>
    )
}
