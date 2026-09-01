import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
import { findSubMenuPermissions, hasAnyPermission } from '../../../../Redux/Slices/AuthSlice'
import { expenceDashboard, getAddedExpence, getAddedFund, postFund, postExpence, expenceApprovalStatusCheck, updateAddexpenceApprovalAction, fundApprovalStatusCheck, updateAddFundApprovalAction, myExpenceRequests, myFundRequests } from '../../../../Api/Api'
import SnackBar from '../../../SnackBar'
import { DASH, RADIUS, KPI_TONES, SOFT, PageHeader, Panel, SolidStatCard, SectionTitle, EmptyNote, createBtnSx } from '../../../DashBoardComps/dashboardTheme'

// The Expense module's accent - the same green its card carries on the Fee & Finance hub.
const ACCENT = "#7DC353";
const ACCENT_HOVER = "#6BAF45";
const ACCENT_WASH = "#F2F8EE";

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
    const expensePerms = findSubMenuPermissions(user.permissions, "feeandfinance", "expense") || {};
    // Same guard the sidebar uses: before the permission payload lands, treat
    // nothing as denied, or this screen bounces the user straight back out.
    const rbacReady = (user.permissions?.mainMenus || []).length > 0;
    const granted = (key) => !rbacReady || expensePerms[key] === "Y";
    const canViewDashboard = granted("viewdashboard");
    const canViewHistory = granted("viewhistory");
    const canAddExpense = granted("allowaddexpense");
    const canManageBudget = granted("allowaddbudget");
    // The expense approval flow is not defined yet - it is coming separately.
    // Until then entries post straight in, so the buttons read "Add Expense" /
    // "Set Allocation" rather than "Request ...". This is a placeholder, NOT a
    // permission: holding allowaddbudget says nothing about approving.
    const postsDirectly = true;

    // Likewise a stand-in: no "approve expense" permission exists, so the budget
    // holder is who the Approvals tab is offered to. Replace once the flow lands.
    const isApprover = canManageBudget;
    const canOpenExpense = !rbacReady || hasAnyPermission(user.permissions, "feeandfinance", "expense");
    const rollNumber = user.rollNumber
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Anyone with no expense permission at all has no business on this screen.
    useEffect(() => {
        if (!canOpenExpense) {
            navigate(-1);
        }
    }, [canOpenExpense, navigate]);
    const token = "123"
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("");
    const [expenseRequests, setExpenseRequests] = useState(mockExpenseRequests);
    const [openRequestDialog, setOpenRequestDialog] = useState(false);
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
    const [myRequestsSearch, setMyRequestsSearch] = useState("");
    const [approvalsSearch, setApprovalsSearch] = useState("");

    // Each tab is one granted operation. "My Requests" is always available -
    // it only ever shows what this user submitted themselves.
    //
    // Set Allocation is a tab of its own rather than a button on the Dashboard.
    // It is granted by allowaddbudget, but the Dashboard is granted by
    // viewdashboard, so anyone holding the first without the second could not
    // reach the action at all while it lived inside that tab.
    const getTabs = () => {
        const tabs = [];
        if (canViewDashboard) tabs.push({ key: "dashboard", label: "Dashboard", icon: <DashboardIcon /> });
        if (canAddExpense) {
            tabs.push(postsDirectly
                ? { key: "addExpense", label: "Add Expense", icon: <AddIcon /> }
                : { key: "requestExpense", label: "Request Expense", icon: <AddIcon /> });
        }
        if (canManageBudget) {
            tabs.push({
                key: "setAllocation",
                label: postsDirectly ? "Set Allocation" : "Request Allocation",
                icon: <AccountBalanceWalletIcon />,
            });
        }
        if (isApprover) tabs.push({ key: "approvals", label: "Approvals", icon: <PendingActionsIcon /> });
        if (!postsDirectly) tabs.push({ key: "myRequests", label: "My Requests", icon: <TrackChangesIcon /> });
        if (canViewHistory) tabs.push({ key: "history", label: "History", icon: <HistoryIcon /> });
        return tabs;
    };

    const tabs = getTabs();
    const activeTabKey = tabs[activeTab]?.key || tabs[0]?.key;

    // Tabs are built from permissions, so their positions shift per user - always
    // move by key, never by a hard-coded index.
    const goToTab = (key) => {
        const target = tabs.findIndex((t) => t.key === key);
        if (target !== -1) setActiveTab(target);
    };


    // Petty Cash Allocation
    const [allocation, setAllocation] = useState({
        amount: 5000,
        notes: ""
    });

    const [newAllocation, setNewAllocation] = useState({
        amount: "",
        paymentMethod: "",
        notes: ""
    });

    const ALLOC_DENOMS = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
    const [allocDenominations, setAllocDenominations] = useState(
        ALLOC_DENOMS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {})
    );
    const allocDenomTotal = ALLOC_DENOMS.reduce((sum, d) => sum + d * (allocDenominations[d] || 0), 0);

    const handleAllocDenomChange = (denom, value) => {
        const num = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
        const maxAmount = parseFloat(newAllocation.amount) || 0;
        if (maxAmount > 0) {
            const otherTotal = ALLOC_DENOMS.reduce((sum, d) => d === denom ? sum : sum + d * (allocDenominations[d] || 0), 0);
            const maxQty = Math.floor((maxAmount - otherTotal) / denom);
            setAllocDenominations((prev) => ({ ...prev, [denom]: Math.min(num, Math.max(0, maxQty)) }));
        } else {
            setAllocDenominations((prev) => ({ ...prev, [denom]: num }));
        }
    };

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

    const DENOMINATIONS = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
    const [denominations, setDenominations] = useState(
        DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {})
    );
    const denominationTotal = DENOMINATIONS.reduce((sum, d) => sum + d * (denominations[d] || 0), 0);

    const handleDenominationChange = (denom, value) => {
        const num = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
        const maxAmount = parseFloat(newRequest.amount) || 0;
        if (maxAmount > 0) {
            const otherTotal = DENOMINATIONS.reduce((sum, d) => d === denom ? sum : sum + d * (denominations[d] || 0), 0);
            const maxQty = Math.floor((maxAmount - otherTotal) / denom);
            setDenominations((prev) => ({ ...prev, [denom]: Math.min(num, Math.max(0, maxQty)) }));
        } else {
            setDenominations((prev) => ({ ...prev, [denom]: num }));
        }
    };

    const [approvalAction, setApprovalAction] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        if (location.state?.tabKey) {
            const target = getTabs().findIndex((t) => t.key === location.state.tabKey);
            if (target !== -1) setActiveTab(target);
        } else if (location.state?.tab !== undefined) {
            setActiveTab(location.state.tab);
        }
        // Guarded again here: the caller only offers the shortcut when the
        // permission is held, but the landing screen must not take that on trust.
        if (location.state?.openBudget && canManageBudget) {
            const target = getTabs().findIndex((t) => t.key === "setAllocation");
            if (target !== -1) setActiveTab(target);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

        if (newRequest.paymentMethod === 'Cash') {
            if (denominationTotal === 0) {
                setMessage("Please enter the cash denomination breakdown");
                setOpen(true); setColor(false); setStatus(false);
                return;
            }
            if (denominationTotal !== parseFloat(newRequest.amount)) {
                setMessage(`Denomination total (₹${denominationTotal.toLocaleString('en-IN')}) does not match the expense amount (₹${parseFloat(newRequest.amount).toLocaleString('en-IN')})`);
                setOpen(true); setColor(false); setStatus(false);
                return;
            }
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

            if (newRequest.paymentMethod === 'Cash') {
                sendData.outwardsDinomination = {
                    outWards2000: denominations[2000] || 0,
                    outWards500: denominations[500] || 0,
                    outWards200: denominations[200] || 0,
                    outWards100: denominations[100] || 0,
                    outWards50: denominations[50] || 0,
                    outWards20: denominations[20] || 0,
                    outWards10: denominations[10] || 0,
                    outWards5: denominations[5] || 0,
                    outWards2: denominations[2] || 0,
                    outWards1: denominations[1] || 0,
                };
            }

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
            setDenominations(DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {}));
            setMessage(postsDirectly ? "Expense added successfully!" : "Expense request submitted successfully!");
            setOpen(true); setColor(true); setStatus(true);
            fetchDashboardData();
            fetchDashboardExpenseData();
            if (canViewDashboard) goToTab("dashboard");
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
                    rollNumber: rollNumber,
                    action: approvalAction === "approve" ? "accept" : "decline",
                    reason: approvalAction === "decline" ? rejectionReason : null,
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
            fetchDashboardData();
            fetchDashboardExpenseData();
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

        if (newAllocation.paymentMethod === 'Cash') {
            if (allocDenomTotal === 0) {
                setMessage("Please enter the cash denomination breakdown");
                setOpen(true); setColor(false); setStatus(false);
                return;
            }
            if (allocDenomTotal !== parseFloat(newAllocation.amount)) {
                setMessage(`Denomination total (₹${allocDenomTotal.toLocaleString('en-IN')}) does not match the allocation amount (₹${parseFloat(newAllocation.amount).toLocaleString('en-IN')})`);
                setOpen(true); setColor(false); setStatus(false);
                return;
            }
        }

        setIsLoading(true);
        try {
            const todayDate = new Date();
            const dd = String(todayDate.getDate()).padStart(2, '0');
            const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
            const yyyy = todayDate.getFullYear();

            const sendData = {
                createdByRollNumber: rollNumber,
                fundAmount: parseFloat(newAllocation.amount),
                date: `${dd}-${mm}-${yyyy}`,
                description: newAllocation.notes,
                paymentMethod: newAllocation.paymentMethod || '',
                remarks: newAllocation.notes || '',
            };

            if (newAllocation.paymentMethod === 'Cash') {
                sendData.inwardsDinomination = {
                    inWards2000: allocDenominations[2000] || 0,
                    inWards500: allocDenominations[500] || 0,
                    inWards200: allocDenominations[200] || 0,
                    inWards100: allocDenominations[100] || 0,
                    inWards50: allocDenominations[50] || 0,
                    inWards20: allocDenominations[20] || 0,
                    inWards10: allocDenominations[10] || 0,
                    inWards5: allocDenominations[5] || 0,
                    inWards2: allocDenominations[2] || 0,
                    inWards1: allocDenominations[1] || 0,
                };
                sendData.outwardsDinomination = {
                    outWards2000: 0, outWards500: 0, outWards200: 0, outWards100: 0, outWards50: 0,
                    outWards20: 0, outWards10: 0, outWards5: 0, outWards2: 0, outWards1: 0,
                };
            }

            await axios.post(postFund, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAllocation({
                amount: parseFloat(newAllocation.amount),
                notes: newAllocation.notes
            });

            setNewAllocation({ amount: "", paymentMethod: "", notes: "" });
            setAllocDenominations(ALLOC_DENOMS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {}));
            setMessage(postsDirectly ? "Allocation added successfully!" : "Allocation requested successfully!");
            setOpen(true); setColor(true); setStatus(true);
            fetchDashboardData();
            // Only bounce to the Dashboard when this user is allowed to see it -
            // holding allowaddbudget does not imply viewdashboard.
            if (canViewDashboard) goToTab("dashboard");
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
                    rollNumber: rollNumber,
                    status: statusParam,
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
                    rollNumber: rollNumber,
                    status: statusParam,
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
                    rollNumber: rollNumber,
                    status:statusFilter,
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
                params: { rollNumber: rollNumber },
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
                    rollNumber: rollNumber,
                    status:statusFilter,
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
                params: { rollNumber: rollNumber, status: approvalsStatusFilter },
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
                params: { rollNumber: rollNumber, status: approvalsStatusFilter },
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
                    rollNumber: rollNumber,
                    action: fundApprovalAction === "approve" ? "accept" : "decline",
                    reason: fundApprovalAction === "decline" ? fundRejectionReason : null,
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
            fetchDashboardData();
        } catch (error) {
            console.error("Error processing fund approval:", error);
            setMessage("Failed to process request. Please try again.");
            setOpen(true); setColor(false); setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Render Dashboard Tab
    const renderDashboard = () => {
        const utilization = dashboardData?.budgetUtilizationPercent ?? 0;
        const allocated = dashboardData?.currentAllocationMonthly ?? 0;
        const remaining = dashboardData?.remainingBalance ?? 0;
        const overBudget = remaining <= 0;

        return (
            <Box>
                {/* Allocation banner */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                        mb: 2,
                        p: 2,
                        borderRadius: RADIUS,
                        border: `1px solid ${ACCENT}38`,
                        background: `linear-gradient(135deg, ${ACCENT_WASH} 0%, #ffffff 60%)`,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: RADIUS,
                                bgcolor: "#fff",
                                border: `1px solid ${ACCENT}45`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <AccountBalanceWalletIcon sx={{ fontSize: 22, color: ACCENT }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                sx={{
                                    fontSize: "10.5px",
                                    fontWeight: 700,
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                    color: DASH.muted,
                                }}
                            >
                                Current Allocation
                            </Typography>
                            <Typography sx={{ fontSize: "26px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                ₹{(dashboardData?.currentAllocationMonthly ?? 0).toLocaleString('en-IN')}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Warning Alert */}
                {utilization > 90 && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 2,
                            p: 1.8,
                            border: "1px solid #FECACA",
                            borderLeft: `3px solid ${DASH.red}`,
                            borderRadius: RADIUS,
                            bgcolor: DASH.redLight,
                        }}
                    >
                        <WarningAmberIcon sx={{ fontSize: 22, color: DASH.red }} />
                        <Box>
                            <Typography sx={{ fontSize: "13.5px", color: "#991B1B", fontWeight: 700 }}>
                                Budget Alert: {utilization.toFixed(1)}% Utilized
                            </Typography>
                            <Typography sx={{ fontSize: "11.5px", color: DASH.red, mt: 0.2 }}>
                                Only ₹{remaining.toLocaleString('en-IN')} remaining from the allocated amount
                            </Typography>
                        </Box>
                    </Box>
                )}

                <SectionTitle icon={TrendingUpIcon}>Budget Overview</SectionTitle>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <SolidStatCard
                            icon={CheckCircleIcon}
                            label="Approved Expenses"
                            value={`₹${(dashboardData?.approvedExpensesAmount ?? 0).toLocaleString('en-IN')}`}
                            note={`${dashboardData?.approvedExpensesCount ?? 0} requests approved`}
                            tone={KPI_TONES.green}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <SolidStatCard
                            icon={PendingActionsIcon}
                            label="Pending Approval"
                            value={`₹${(dashboardData?.pendingApprovalAmount ?? 0).toLocaleString('en-IN')}`}
                            note={`${dashboardData?.pendingApprovalCount ?? 0} requests waiting`}
                            tone={KPI_TONES.orange}
                            onClick={isApprover ? () => goToTab("approvals") : undefined}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <SolidStatCard
                            icon={AccountBalanceWalletIcon}
                            label="Remaining Balance"
                            value={`₹${remaining.toLocaleString('en-IN')}`}
                            note={overBudget ? "Budget exceeded" : "Available to use"}
                            tone={overBudget ? KPI_TONES.pink : KPI_TONES.blue}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                        <SolidStatCard
                            icon={TrendingUpIcon}
                            label="Budget Utilization"
                            value={`${utilization.toFixed(1)}%`}
                            note={`₹${(dashboardData?.approvedExpensesAmount ?? 0).toLocaleString('en-IN')} of ₹${allocated.toLocaleString('en-IN')} used`}
                            tone={utilization > 90 ? KPI_TONES.pink : KPI_TONES.violet}
                        />
                    </Grid>
                </Grid>


                {/* Recent Expense History Table */}
                <Panel
                    title="Recent Expense History"
                    subtitle="The last five entries recorded against this budget"
                    accent={ACCENT}
                    bodySx={{ p: 0, overflowX: "auto" }}
                    right={canViewHistory && (
                        <Button
                            size="small"
                            onClick={() => {
                                setHistoryTypeFilter("Expense");
                                goToTab("history");
                            }}
                            sx={{
                                textTransform: "none",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: ACCENT,
                                border: `1px solid ${ACCENT}`,
                                borderRadius: "50px",
                                px: 2,
                                height: 28,
                                "&:hover": { bgcolor: ACCENT_WASH }
                            }}
                        >
                            View All
                        </Button>
                    )}
                >
                <Table>
                    <TableHead>
                        <TableRow>
                            {["Date", "Category", "Requested By", "Description", "Amount", "Status"].map((h) => (
                                <TableCell key={h} sx={{ backgroundColor: "#F9FAFB", borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontWeight: 600, fontSize: "13px", py: 1 }}>
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
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontSize: "12px", color: "#374151", whiteSpace: "nowrap" }}>
                                            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center" }}>
                                            <Chip
                                                label={item.category || '-'}
                                                size="small"
                                                sx={{ fontSize: "10px", bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontWeight: 600, height: 20 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center" }}>
                                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                                                {reqBy.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>
                                                {reqBy.roll}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", maxWidth: 220 }}>
                                            <Tooltip title={item.description} arrow>
                                                <Typography sx={{ fontSize: "12px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {item.description || '-'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#DC2626", whiteSpace: "nowrap" }}>
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
                </Panel>
            </Box>
        );
    };

    // Render Set Allocation Tab
    // Lives in its own tab so allowaddbudget alone is enough to reach it - it used
    // to be a dialog opened from the Dashboard, which viewdashboard gates.
    const renderAllocation = () => {
        const amount = parseFloat(newAllocation.amount) || 0;
        const isCash = newAllocation.paymentMethod === 'Cash';
        const denomMismatch = isCash && allocDenomTotal !== amount;

        return (
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 12, md: 7, lg: 8 }}>
                    <Panel
                        title={postsDirectly ? "Add Budget Allocation" : "Request Budget Allocation"}
                        subtitle={postsDirectly
                            ? "The amount below is added to the budget expenses are drawn from"
                            : "Submitted for approval before it is added to the budget"}
                        accent={ACCENT}
                    >
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Allocation Amount"
                                    type="number"
                                    value={newAllocation.amount}
                                    onChange={(e) => setNewAllocation({ ...newAllocation, amount: e.target.value })}
                                    placeholder="Enter allocation"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontWeight: 700, color: DASH.ink }}>₹</Typography>
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
                                        value={newAllocation.paymentMethod}
                                        onChange={(e) => setNewAllocation({ ...newAllocation, paymentMethod: e.target.value })}
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

                            {isCash && (
                                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                    <Box sx={{ p: 2, borderRadius: RADIUS, bgcolor: DASH.surface, border: `1px solid ${DASH.line}` }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                                            <Box>
                                                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: DASH.ink }}>
                                                    Denomination Breakdown
                                                </Typography>
                                                <Typography sx={{ fontSize: 11, color: DASH.muted }}>
                                                    Enter quantity for each denomination
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                px: 1.5, py: 0.6, borderRadius: RADIUS,
                                                bgcolor: denomMismatch ? DASH.redLight : ACCENT_WASH,
                                                border: `1px solid ${denomMismatch ? "#FECACA" : ACCENT + "45"}`,
                                                textAlign: 'right',
                                            }}>
                                                <Typography sx={{ fontSize: 10.5, color: DASH.muted, fontWeight: 700 }}>Total</Typography>
                                                <Typography sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, color: denomMismatch ? DASH.red : ACCENT }}>
                                                    ₹{allocDenomTotal.toLocaleString('en-IN')}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ border: `1px solid ${DASH.line}`, borderRadius: RADIUS, overflow: 'hidden', bgcolor: '#fff' }}>
                                            {ALLOC_DENOMS.map((d, idx) => (
                                                <Box key={d} sx={{
                                                    display: 'flex', alignItems: 'center', gap: 1.5,
                                                    px: 2, py: 1,
                                                    borderBottom: idx < ALLOC_DENOMS.length - 1 ? `1px solid ${DASH.lineSoft}` : 'none',
                                                    '&:hover': { bgcolor: DASH.surface },
                                                    transition: 'background-color 0.1s',
                                                }}>
                                                    <Box sx={{
                                                        minWidth: 72, px: 1.2, py: 0.4, borderRadius: RADIUS,
                                                        bgcolor: DASH.surface, border: `1px solid ${DASH.line}`, textAlign: 'center',
                                                    }}>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.text }}>
                                                            ₹{d.toLocaleString('en-IN')}
                                                        </Typography>
                                                    </Box>
                                                    <Typography sx={{ fontSize: 14, color: DASH.faint, fontWeight: 600 }}>×</Typography>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={allocDenominations[d] || ''}
                                                        onChange={(e) => handleAllocDenomChange(d, e.target.value)}
                                                        placeholder="0"
                                                        slotProps={{ input: { inputProps: { min: 0, style: { textAlign: 'center' } } } }}
                                                        sx={{
                                                            width: 80,
                                                            '& .MuiOutlinedInput-root': { borderRadius: RADIUS, height: 34, fontSize: 13, fontWeight: 700 },
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: 14, color: DASH.faint, fontWeight: 600 }}>=</Typography>
                                                    <Typography sx={{
                                                        fontSize: 13, fontWeight: 700, ml: 'auto',
                                                        color: (allocDenominations[d] || 0) > 0 ? DASH.ink : "#D1D5DB",
                                                    }}>
                                                        ₹{(d * (allocDenominations[d] || 0)).toLocaleString('en-IN')}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>

                                        {denomMismatch && amount > 0 && (
                                            <Typography sx={{ fontSize: 11.5, color: DASH.red, mt: 1, fontWeight: 600 }}>
                                                Denomination total must match the allocation amount of ₹{amount.toLocaleString('en-IN')}.
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
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

                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 0.5 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setNewAllocation({ amount: "", paymentMethod: "", notes: "" });
                                            setAllocDenominations(ALLOC_DENOMS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {}));
                                        }}
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: "50px",
                                            fontWeight: 700,
                                            fontSize: 12.5,
                                            height: 34,
                                            px: 2.5,
                                            borderColor: DASH.line,
                                            color: DASH.muted,
                                            "&:hover": { borderColor: DASH.faint, bgcolor: DASH.surface },
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleSetAllocation}
                                        disabled={isLoading}
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: "50px",
                                            fontWeight: 700,
                                            fontSize: 12.5,
                                            height: 34,
                                            px: 2.5,
                                            boxShadow: "none",
                                            bgcolor: ACCENT,
                                            "&:hover": { bgcolor: ACCENT_HOVER, boxShadow: "none" },
                                        }}
                                    >
                                        {postsDirectly ? "Set Allocation" : "Request Allocation"}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Panel>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 5, lg: 4 }}>
                    <Panel title="Current Budget" accent={DASH.blue} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.6 }}>
                            {[
                                { label: "Allocated", value: dashboardData?.currentAllocationMonthly ?? 0, color: DASH.ink },
                                { label: "Approved Expenses", value: dashboardData?.approvedExpensesAmount ?? 0, color: DASH.red },
                                { label: "Remaining Balance", value: dashboardData?.remainingBalance ?? 0, color: (dashboardData?.remainingBalance ?? 0) > 0 ? DASH.green : DASH.red },
                            ].map((row) => (
                                <Box key={row.label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted }}>{row.label}</Typography>
                                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: row.color }}>
                                        ₹{row.value.toLocaleString('en-IN')}
                                    </Typography>
                                </Box>
                            ))}

                            {amount > 0 && (
                                <Box sx={{
                                    mt: 0.5, pt: 1.4, borderTop: `1px dashed ${DASH.line}`,
                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                                }}>
                                    <Typography sx={{ fontSize: "12.5px", color: DASH.muted, fontWeight: 700 }}>
                                        Allocated after this
                                    </Typography>
                                    <Typography sx={{ fontSize: "15px", fontWeight: 800, color: ACCENT }}>
                                        ₹{((dashboardData?.currentAllocationMonthly ?? 0) + amount).toLocaleString('en-IN')}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Panel>

                    <Panel title="Before you submit" accent={DASH.amber}>
                        <Box component="ul" sx={{ m: 0, pl: 2.2, display: "flex", flexDirection: "column", gap: 0.9 }}>
                            {[
                                "The amount is added on top of the existing allocation, not replacing it.",
                                "Cash allocations need a denomination breakdown that adds up to the amount.",
                                "Notes appear against the entry in History, so keep them specific.",
                            ].map((tip) => (
                                <Typography key={tip} component="li" sx={{ fontSize: "12px", color: DASH.text, lineHeight: 1.5 }}>
                                    {tip}
                                </Typography>
                            ))}
                        </Box>
                    </Panel>
                </Grid>
            </Grid>
        );
    };

    // Render Request Tab
    const renderRequest = () => (
        <Box sx={{ maxWidth: 860, mx: "auto" }}>
            <Panel
                title={postsDirectly ? "Add New Expense" : "Request New Expense"}
                subtitle={postsDirectly
                    ? "Fill in the details below to add the expense directly"
                    : "Fill in the details below to submit your expense request for approval"}
                accent={ACCENT}
                bodySx={{ p: 3 }}
            >
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

                        {newRequest.paymentMethod === 'Cash' && (
                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                <Box sx={{
                                    p: 2, borderRadius: '10px',
                                    bgcolor: '#F8FAFC', border: '1px solid #E2E8F0',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                                                Denomination Breakdown
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: '#6B7280' }}>
                                                Enter quantity for each denomination
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            px: 1.5, py: 0.6, borderRadius: '8px',
                                            bgcolor: denominationTotal > 0 ? '#EEF2FF' : '#F3F4F6',
                                            border: `1px solid ${denominationTotal > 0 ? '#C7D2FE' : '#E5E7EB'}`,
                                        }}>
                                            <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Total</Typography>
                                            <Typography sx={{ fontSize: 18, fontWeight: 800, color: denominationTotal > 0 ? '#4338CA' : '#9CA3AF', lineHeight: 1.2 }}>
                                                ₹{denominationTotal.toLocaleString('en-IN')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{
                                        border: '1px solid #E5E7EB', borderRadius: '8px',
                                        overflow: 'hidden', bgcolor: '#fff',
                                    }}>
                                        {DENOMINATIONS.map((d, idx) => (
                                            <Box key={d} sx={{
                                                display: 'flex', alignItems: 'center', gap: 1.5,
                                                px: 2, py: 1,
                                                borderBottom: idx < DENOMINATIONS.length - 1 ? '1px solid #F3F4F6' : 'none',
                                                '&:hover': { bgcolor: '#FAFAFA' },
                                                transition: 'background-color 0.1s',
                                            }}>
                                                <Box sx={{
                                                    minWidth: 72, px: 1.2, py: 0.4, borderRadius: '6px',
                                                    bgcolor: '#F9FAFB', border: '1px solid #E5E7EB',
                                                    textAlign: 'center',
                                                }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                                                        ₹{d.toLocaleString('en-IN')}
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: 14, color: '#9CA3AF', fontWeight: 600 }}>×</Typography>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={denominations[d] || ''}
                                                    onChange={(e) => handleDenominationChange(d, e.target.value)}
                                                    placeholder="0"
                                                    slotProps={{ input: { inputProps: { min: 0, style: { textAlign: 'center' } } } }}
                                                    sx={{
                                                        width: 80,
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '6px', height: 34, fontSize: 13, fontWeight: 700,
                                                        },
                                                    }}
                                                />
                                                <Typography sx={{ fontSize: 14, color: '#9CA3AF', fontWeight: 600 }}>=</Typography>
                                                <Typography sx={{
                                                    fontSize: 13, fontWeight: 700, ml: 'auto',
                                                    color: (denominations[d] || 0) > 0 ? '#111827' : '#D1D5DB',
                                                }}>
                                                    ₹{(d * (denominations[d] || 0)).toLocaleString('en-IN')}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Grid>
                        )}

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
                                requestedBy: userName,
                                requestedByEmail: ""
                            })}
                            sx={{
                                textTransform: "none",
                                borderRadius: "50px",
                                fontWeight: 700,
                                fontSize: 12.5,
                                height: 34,
                                px: 2.5,
                                borderColor: DASH.line,
                                color: DASH.muted,
                                "&:hover": { borderColor: DASH.faint, bgcolor: DASH.surface }
                            }}
                        >
                            Clear Form
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmitRequest}
                            disabled={isLoading}
                            sx={{
                                textTransform: "none",
                                borderRadius: "50px",
                                fontWeight: 700,
                                fontSize: 12.5,
                                height: 34,
                                px: 2.5,
                                boxShadow: "none",
                                bgcolor: ACCENT,
                                "&:hover": { bgcolor: ACCENT_HOVER, boxShadow: "none" }
                            }}
                        >
                            {postsDirectly ? "Add Expense" : "Submit Request"}
                        </Button>
                    </Box>
            </Panel>
        </Box>
    );

    // ── Render My Requests (Status) Tab ────────────────────────────────────
    const renderMyRequests = () => {
        const isExpense = myRequestsTypeFilter === "Expense";
        const rawData = isExpense ? myRequestsData : myFundRequestsData;
        const q = myRequestsSearch.toLowerCase();
        const sourceData = q ? rawData.filter(item =>
            (item.category || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.paymentMethod || '').toLowerCase().includes(q) ||
            String(item.amount || item.expenceAmount || item.fundAmount || '').includes(q)
        ) : rawData;
        const statusTabs = [
            { key: "All", label: "All" },
            { key: "Requested", label: "Pending" },
            { key: "Approved", label: "Approved" },
            { key: "Declined", label: "Rejected" },
        ];

        return (
            <Box>
                {/* Filter Bar */}
                <Box sx={{ backgroundColor: "#F9FAFB", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", mb: 2 }}>
                    <Grid container sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                            {(canManageBudget ? ["Expense", "Fund (Allocation)"] : ["Expense"]).map((type) => {
                                const key = type === "Fund (Allocation)" ? "Fund" : "Expense";
                                const isActive = key === myRequestsTypeFilter;
                                const activeColor = key === "Expense" ? "#DC2626" : "#7DC353";
                                const hoverColor = key === "Expense" ? "#B91C1C" : "#6BAF45";
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
                                                "&:hover": { borderColor: "#7DC353", color: "#7DC353", bgcolor: "transparent" }
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
                                            bgcolor: "#7DC353",
                                            borderColor: "#7DC353",
                                            "&:hover": { bgcolor: "#6BAF45", boxShadow: "none" }
                                        } : {
                                            borderColor: "#ccc",
                                            color: "#555",
                                            bgcolor: "#fff",
                                            "&:hover": { borderColor: "#7DC353", color: "#7DC353", bgcolor: "transparent" }
                                        })
                                    }}
                                >
                                    {tab.label}
                                </Button>
                            ))}
                            <TextField
                                placeholder="Search..."
                                value={myRequestsSearch}
                                onChange={(e) => setMyRequestsSearch(e.target.value)}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#9CA3AF", fontSize: 18 }} /></InputAdornment> } }}
                                sx={{ width: 170, backgroundColor: "#fff", "& .MuiOutlinedInput-root": { borderRadius: "5px", height: 28 } }}
                                size="small"
                            />
                            <Typography sx={{ fontSize: "12px", color: "#777", fontWeight: 500, whiteSpace: "nowrap", ml: 0.5 }}>
                                {sourceData.length} records
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Request Tables */}
                {isLoading ? (
                    <Box sx={{ textAlign: "center", py: 8, bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "5px" }}>
                        <LinearProgress sx={{ mb: 2, mx: "auto", width: "50%", borderRadius: 2, "& .MuiLinearProgress-bar": { bgcolor: "#7DC353" } }} />
                        <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>Loading requests...</Typography>
                    </Box>
                ) : sourceData.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8, bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "5px" }}>
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
                                            bgcolor: isExpense ? "#DC2626" : "#7DC353",
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
                                        {displayStatus === "Rejected" && item.rejectReason && (
                                            <Tooltip title={item.rejectReason} arrow placement="top">
                                                <Button
                                                    size="small"
                                                    sx={{
                                                        ml: 1,
                                                        textTransform: "none",
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        color: "#C62828",
                                                        bgcolor: "#FFEBEE",
                                                        border: "1px solid #FFCDD2",
                                                        borderRadius: "20px",
                                                        px: 1.5,
                                                        height: 22,
                                                        minWidth: 0,
                                                        "&:hover": { bgcolor: "#FFCDD2" },
                                                    }}
                                                >
                                                    Reason
                                                </Button>
                                            </Tooltip>
                                        )}
                                    </Box>

                                    {/* Approved/Rejected By strip */}
                                    {item.approvedByName && (displayStatus === "Approved" || displayStatus === "Rejected") && (
                                        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, mt: "2px" }}>
                                            <Typography sx={{ fontSize: "12px", fontWeight: 500, color: "#777" }}>
                                                {displayStatus === "Approved" ? "Approved By : " : "Rejected By : "}
                                                <span style={{ fontWeight: 600, color: "#333" }}>{item.approvedByName}</span>
                                                <span style={{ color: "#999", marginLeft: 4 }}>- {item.approvedByRollNumber}</span>
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Table body */}
                                    <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "5px", bgcolor: "#fff", overflow: "hidden" }}>
                                        {isExpense ? (
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {["Date", "Category", "Description", "Amount", "Payment Method", "Status", ...(displayStatus === "Rejected" && item.rejectionReason ? ["Rejection Reason"] : [])].map((h) => (
                                                            <TableCell key={h} sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", backgroundColor: "#F9FAFB", fontWeight: 600, fontSize: "13px", py: 1 }}>
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontSize: "13px", whiteSpace: "nowrap" }}>
                                                            {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontSize: "13px" }}>
                                                            {item.category || "—"}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontSize: "13px", maxWidth: 220 }}>
                                                            <Tooltip title={item.description || ''} arrow>
                                                                <Typography sx={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    {item.description || "—"}
                                                                </Typography>
                                                            </Tooltip>
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#DC2626", whiteSpace: "nowrap" }}>
                                                            ₹{(item.expenceAmount || item.amount || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center" }}>
                                                            <Chip label={item.paymentMethod || "—"} size="small" sx={{ fontSize: "11px", height: "22px", bgcolor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }} />
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: (displayStatus === "Rejected" && item.rejectionReason) ? 1 : 0, borderColor: "#E5E7EB", textAlign: "center" }}>
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
                                                            <TableCell key={h} sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", backgroundColor: "#F9FAFB", fontWeight: 600, fontSize: "13px", py: 1 }}>
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontSize: "13px", whiteSpace: "nowrap" }}>
                                                            {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#7DC353", whiteSpace: "nowrap" }}>
                                                            ₹{(item.fundAmount || item.amount || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: 1, borderColor: "#E5E7EB", textAlign: "center", fontSize: "13px" }}>
                                                            {item.description || item.notes || "—"}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: (displayStatus === "Rejected" && item.rejectionReason) ? 1 : 0, borderColor: "#E5E7EB", textAlign: "center" }}>
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
                <Box sx={{ backgroundColor: "#F9FAFB", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd"}}>
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
                                            bgcolor: isExpense ? "#DC2626" : "#7DC353",
                                            borderColor: isExpense ? "#DC2626" : "#7DC353",
                                            "&:hover": { bgcolor: isExpense ? "#B91C1C" : "#6BAF45", boxShadow: "none" }
                                        } : {
                                            borderColor: "#ccc",
                                            color: "#555",
                                            "&:hover": { borderColor: "#7DC353", color: "#7DC353", bgcolor: "transparent" }
                                        })
                                    }}
                                >
                                    {type}
                                </Button>
                            ))}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1, py: 0.5 }}>
                            <TextField
                                placeholder="Search..."
                                value={approvalsSearch}
                                onChange={(e) => setApprovalsSearch(e.target.value)}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#9CA3AF", fontSize: 18 }} /></InputAdornment> } }}
                                sx={{ width: 170, backgroundColor: "#fff", "& .MuiOutlinedInput-root": { borderRadius: "5px", height: 28 } }}
                                size="small"
                            />
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
                            pendingExpenseData.filter((item) => {
                                if (parseUser(item.createdBy).roll === String(rollNumber)) return false;
                                if (!approvalsSearch) return true;
                                const s = approvalsSearch.toLowerCase();
                                return (item.category || '').toLowerCase().includes(s) || (item.description || '').toLowerCase().includes(s) || parseUser(item.createdBy).name.toLowerCase().includes(s);
                            }).map((item) => {
                                const requestedBy = parseUser(item.createdBy);
                                const canAct = isApprover && item.status === "Requested";
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
                                        <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "5px" }}>
                                            <Table sx={{ border: "1px solid #E5E7EB", borderRadius: "5px", overflow: "hidden" }}>
                                                <TableHead>
                                                    <TableRow>
                                                        {["Date", "Description", "Amount", "Payment Method", "Remarks"].map((h) => (
                                                            <TableCell key={h} sx={{ borderRight: "1px solid #E5E7EB", textAlign: "center", backgroundColor: "#F9FAFB", fontWeight: 600, fontSize: "13px", py: 1 }}>
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ borderRight: "1px solid #E5E7EB", textAlign: "center", fontSize: "13px", whiteSpace: "nowrap" }}>
                                                            {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: "1px solid #E5E7EB", textAlign: "center", fontSize: "13px", maxWidth: 260 }}>
                                                            <Tooltip title={item.description || ''} arrow>
                                                                <Typography sx={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    {item.description || "—"}
                                                                </Typography>
                                                            </Tooltip>
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: "1px solid #E5E7EB", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#DC2626", whiteSpace: "nowrap" }}>
                                                            ₹{(item.expenceAmount ?? 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: "1px solid #E5E7EB", textAlign: "center" }}>
                                                            <Chip label={item.paymentMethod || "—"} size="small" sx={{ fontSize: "11px", height: "22px", bgcolor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }} />
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", fontSize: "13px", color: "#374151" }}>
                                                            {item.remarks || "—"}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>

                                            {canAct && (
                                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2, pt: 2, borderTop: "1px solid #E5E7EB" }}>
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
                            pendingFundData.filter((fund) => {
                                if (parseUser(fund.createdBy).roll === String(rollNumber)) return false;
                                if (!approvalsSearch) return true;
                                const s = approvalsSearch.toLowerCase();
                                return (fund.description || '').toLowerCase().includes(s) || parseUser(fund.createdBy).name.toLowerCase().includes(s);
                            }).map((fund) => {
                                const addedBy = parseUser(fund.createdBy);
                                const canAct = isApprover && fund.status === "Requested";
                                return (
                                    <Grid key={fund.addFundId} size={{ lg: 12, md: 8 }}>
                                        {/* Tab row */}
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                                            <Box sx={{ display: "flex", alignItems: "end" }}>
                                                <Box sx={{
                                                    bgcolor: "#7DC353",
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
                                        <Box p={2} sx={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "5px" }}>
                                            <Table sx={{ border: "1px solid #E5E7EB", borderRadius: "5px", overflow: "hidden" }}>
                                                <TableHead>
                                                    <TableRow>
                                                        {["Date", "Description", "Amount"].map((h) => (
                                                            <TableCell key={h} sx={{ borderRight: "1px solid #E5E7EB", textAlign: "center", backgroundColor: "#f5f3ff", fontWeight: 600, fontSize: "13px", py: 1 }}>
                                                                {h}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ borderRight: "1px solid #E5E7EB", textAlign: "center", fontSize: "13px", whiteSpace: "nowrap" }}>
                                                            {fund.date ? new Date(fund.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </TableCell>
                                                        <TableCell sx={{ borderRight: "1px solid #E5E7EB", textAlign: "center", fontSize: "13px" }}>
                                                            {fund.description || "—"}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#7DC353", whiteSpace: "nowrap" }}>
                                                            ₹{(fund.fundAmount ?? 0).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>

                                            {canAct && (
                                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2, pt: 2, borderTop: "1px solid #E5E7EB" }}>
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
        backgroundColor: "#F9FAFB",
        borderRight: 1,
        borderColor: "#E5E7EB",
        textAlign: "center",
        fontWeight: 600,
        fontSize: "12px",
        py: 1.2,
        whiteSpace: "nowrap",
        px: 1.5,
    };

    const tdCell = {
        borderRight: 1,
        borderColor: "#E5E7EB",
        textAlign: "center",
        fontSize: "12px",
        py: 1.2,
        px: 1.5,
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
            <Box sx={{ backgroundColor: "#F9FAFB", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", mb: 2 }}>
                <Grid container sx={{ alignItems: "center" }}>
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                        {["Expense", "Fund (Allocation)"].map((type) => {
                            const isActive = historyTypeFilter === type;
                            const isExpenseType = type === "Expense";
                            const activeColor = isExpenseType ? "#DC2626" : "#7DC353";
                            const hoverColor = isExpenseType ? "#B91C1C" : "#6BAF45";
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
                                            "&:hover": { borderColor: "#7DC353", color: "#7DC353", bgcolor: "transparent" }
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
                                        bgcolor: "#7DC353",
                                        borderColor: "#7DC353",
                                        "&:hover": { bgcolor: "#6BAF45", boxShadow: "none" }
                                    } : {
                                        borderColor: "#ccc",
                                        color: "#555",
                                        bgcolor: "#fff",
                                        "&:hover": { borderColor: "#7DC353", color: "#7DC353", bgcolor: "transparent" }
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
                bgcolor: historyTypeFilter === "Expense" ? "#DC2626" : "#7DC353",
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
            <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "5px", overflow: "auto", bgcolor: "#fff" }}>
                    {historyTypeFilter === "Expense" ? (
                        /* ── Expense Table ── */
                        <Table stickyHeader sx={{ minWidth: 900 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...thCell, width: 40 }}>S.No</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 95 }}>Date</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 90 }}>Category</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 120 }}>Requested By</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 150 }}>Description</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 80 }}>Method</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 80 }}>Amount</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 90 }}>Status</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 110, borderRight: 0 }}>Approved By</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((item, idx) => {
                                        const requestedBy = parseUser(item.createdBy);
                                        const approvedByUser = parseUser(item.approvedBy);
                                        const isRejected = item.status === "Declined" || item.status === "Rejected";
                                        return (
                                            <TableRow key={item.expenceId} sx={{ bgcolor: idx % 2 === 0 ? "#fff" : "#FAFAFA", "&:hover": { bgcolor: "#f5f0fa" } }}>
                                                <TableCell sx={{ ...tdCell, color: "#9CA3AF" }}>{idx + 1}</TableCell>
                                                <TableCell sx={{ ...tdCell, whiteSpace: "nowrap", color: "#374151" }}>
                                                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell sx={tdCell}>
                                                    <Chip label={item.category || '-'} size="small" sx={{ fontSize: "10px", bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontWeight: 600, height: 22 }} />
                                                </TableCell>
                                                <TableCell sx={tdCell}>
                                                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{requestedBy.name}</Typography>
                                                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{requestedBy.roll}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, maxWidth: 160 }}>
                                                    <Tooltip title={item.description || ''} arrow>
                                                        <Typography sx={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#555" }}>
                                                            {item.description || '-'}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, whiteSpace: "nowrap", color: "#555" }}>{item.paymentMethod || '-'}</TableCell>
                                                <TableCell sx={{ ...tdCell, fontWeight: 700, color: "#DC2626", whiteSpace: "nowrap" }}>
                                                    ₹{(item.expenceAmount ?? 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={tdCell}>
                                                    {renderStatusChip(item.status)}
                                                    {isRejected && item.rejectReason && (
                                                        <Tooltip title={item.rejectReason} arrow placement="top">
                                                            <Typography sx={{ fontSize: "10px", color: "#C62828", cursor: "pointer", mt: 0.5, textDecoration: "underline" }}>View Reason</Typography>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, borderRight: 0 }}>
                                                    {item.approvedBy ? (
                                                        <>
                                                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{approvedByUser.name}</Typography>
                                                            <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>
                                                                {item.approvedOnDate ? new Date(item.approvedOnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
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
                                        <TableCell colSpan={9} sx={{ textAlign: "center", py: 6, borderBottom: "none" }}>
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
                        <Table stickyHeader sx={{ minWidth: 750 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...thCell, width: 40 }}>S.No</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 95 }}>Date</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 120 }}>Added By</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 150 }}>Description</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 100 }}>Remarks</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 90 }}>Amount</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 90 }}>Status</TableCell>
                                    <TableCell sx={{ ...thCell, minWidth: 110, borderRight: 0 }}>Approved By</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((item, idx) => {
                                        const addedBy = parseUser(item.createdBy);
                                        const approvedByUser = parseUser(item.approvedBy);
                                        const isRejected = item.status === "Declined" || item.status === "Rejected";
                                        return (
                                            <TableRow key={item.addFundId} sx={{ bgcolor: idx % 2 === 0 ? "#fff" : "#FAFAFA", "&:hover": { bgcolor: "#F2F8EE" } }}>
                                                <TableCell sx={{ ...tdCell, color: "#9CA3AF" }}>{idx + 1}</TableCell>
                                                <TableCell sx={{ ...tdCell, whiteSpace: "nowrap", color: "#374151" }}>
                                                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell sx={tdCell}>
                                                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{addedBy.name}</Typography>
                                                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{addedBy.roll}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, maxWidth: 180 }}>
                                                    <Tooltip title={item.description || ''} arrow>
                                                        <Typography sx={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#555" }}>
                                                            {item.description || '-'}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, color: "#6B7280" }}>{item.remarks || '-'}</TableCell>
                                                <TableCell sx={{ ...tdCell, fontWeight: 700, color: "#7DC353", whiteSpace: "nowrap" }}>
                                                    ₹{(item.fundAmount ?? 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={tdCell}>
                                                    {renderStatusChip(item.status)}
                                                    {isRejected && item.rejectReason && (
                                                        <Tooltip title={item.rejectReason} arrow placement="top">
                                                            <Typography sx={{ fontSize: "10px", color: "#C62828", cursor: "pointer", mt: 0.5, textDecoration: "underline" }}>View Reason</Typography>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ ...tdCell, borderRight: 0 }}>
                                                    {item.approvedBy ? (
                                                        <>
                                                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{approvedByUser.name}</Typography>
                                                            <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>
                                                                {item.approvedOnDate ? new Date(item.approvedOnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
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
        <Box
            sx={{
                border: `1px solid ${DASH.line}`,
                borderRadius: RADIUS,
                bgcolor: "#fff",
                px: 2,
                py: 1.5,
                height: "86vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <Box sx={{ flexShrink: 0 }}>
                <PageHeader
                    title="Expense Management"
                    subtitle="Record school spending and track it against the allocated budget"
                    onBack={() => navigate(-1)}
                    right={
                        <>
                            {canManageBudget && (
                                <Button
                                    startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => goToTab("setAllocation")}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 700,
                                        fontSize: 12.5,
                                        height: 34,
                                        px: 2,
                                        borderRadius: "50px",
                                        whiteSpace: "nowrap",
                                        color: SOFT.green.color,
                                        bgcolor: SOFT.green.bg,
                                        border: `1px solid ${SOFT.green.border}`,
                                        "&:hover": { bgcolor: SOFT.green.hover },
                                    }}
                                >
                                    {postsDirectly ? "Set Allocation" : "Request Allocation"}
                                </Button>
                            )}
                            {canAddExpense && (
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={() => goToTab(postsDirectly ? "addExpense" : "requestExpense")}
                                    sx={createBtnSx}
                                >
                                    {postsDirectly ? "Add Expense" : "New Request"}
                                </Button>
                            )}
                        </>
                    }
                />
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: `1px solid ${DASH.line}`, mb: 2, flexShrink: 0 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: '40px',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: DASH.muted,
                            minHeight: '40px',
                            gap: 0.6,
                            px: 2,
                            py: 1,
                        },
                        '& .MuiTab-root .MuiSvgIcon-root': { fontSize: 17 },
                        '& .Mui-selected': { color: `${ACCENT} !important` },
                        '& .MuiTabs-indicator': {
                            backgroundColor: ACCENT,
                            height: '2.5px',
                            borderRadius: '3px 3px 0 0',
                        },
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
                {activeTabKey === "setAllocation" && renderAllocation()}
                {activeTabKey === "approvals" && renderApprovals()}
                {activeTabKey === "myRequests" && renderMyRequests()}
                {activeTabKey === "history" && renderHistory()}
                {tabs.length === 0 && <EmptyNote text="You do not have access to any expense action." />}
            </Box>

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
                    bgcolor: "#F9FAFB",
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