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
    LinearProgress
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
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

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

// Mock data for expenses
const mockExpenses = [
    {
        id: 1,
        date: "2026-02-05",
        category: "Stationery",
        description: "Office supplies - pens, papers, notebooks",
        amount: 2500,
        paymentMethod: "Petty Cash",
        addedBy: "John Doe",
        status: "Approved"
    },
    {
        id: 2,
        date: "2026-02-05",
        category: "Utilities",
        description: "Electricity bill for January",
        amount: 15000,
        paymentMethod: "Bank Transfer",
        addedBy: "Admin",
        status: "Approved"
    },
    {
        id: 3,
        date: "2026-02-04",
        category: "Maintenance",
        description: "AC servicing - all classrooms",
        amount: 8500,
        paymentMethod: "Cash",
        addedBy: "Maintenance Head",
        status: "Approved"
    },
    {
        id: 4,
        date: "2026-02-04",
        category: "Food & Beverages",
        description: "Refreshments for staff meeting",
        amount: 1200,
        paymentMethod: "Petty Cash",
        addedBy: "HR Manager",
        status: "Pending"
    },
    {
        id: 5,
        date: "2026-02-03",
        category: "Transportation",
        description: "Fuel for school buses",
        amount: 12000,
        paymentMethod: "Cash",
        addedBy: "Transport Manager",
        status: "Approved"
    }
];

export default function ExpensePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0); // 0: Daily, 1: Weekly, 2: Monthly
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [expenses, setExpenses] = useState(mockExpenses);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openPettyCashDialog, setOpenPettyCashDialog] = useState(false);

    // Petty Cash Management - Starting allocation
    const [pettyCashAllocation, setPettyCashAllocation] = useState({
        amount: 50000, // Allocated petty cash for the period
        period: "Monthly",
        allocatedDate: "2026-02-01",
        notes: "Monthly petty cash allocation for February 2026"
    });

    const [newPettyCashAllocation, setNewPettyCashAllocation] = useState({
        amount: "",
        period: "Monthly",
        allocatedDate: new Date().toISOString().split('T')[0],
        notes: ""
    });

    // Add expense form state
    const [newExpense, setNewExpense] = useState({
        date: new Date().toISOString().split('T')[0],
        category: "",
        description: "",
        amount: "",
        paymentMethod: "",
        addedBy: "Current User"
    });

    // Calculate summary statistics
    const calculateSummary = () => {
        const today = new Date().toISOString().split('T')[0];
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const dailyExpenses = expenses.filter(exp => exp.date === today);
        const weeklyExpenses = expenses.filter(exp => exp.date >= oneWeekAgo);
        const monthlyExpenses = expenses.filter(exp => exp.date >= oneMonthAgo);

        // Petty cash specific expenses
        const pettyCashExpenses = expenses.filter(exp => exp.paymentMethod === "Petty Cash");
        const pettyCashSpent = pettyCashExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const pettyCashBalance = pettyCashAllocation.amount - pettyCashSpent;
        const pettyCashPercentage = (pettyCashSpent / pettyCashAllocation.amount) * 100;

        return {
            daily: dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0),
            dailyCount: dailyExpenses.length,
            weekly: weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0),
            weeklyCount: weeklyExpenses.length,
            monthly: monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0),
            monthlyCount: monthlyExpenses.length,
            pettyCashSpent: pettyCashSpent,
            pettyCashCount: pettyCashExpenses.length,
            pettyCashBalance: pettyCashBalance,
            pettyCashPercentage: pettyCashPercentage,
            total: expenses.reduce((sum, exp) => sum + exp.amount, 0)
        };
    };

    const summary = calculateSummary();

    // Filter expenses
    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = searchQuery === "" ||
            expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.addedBy.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === "All" || expense.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Handle add expense
    const handleAddExpense = () => {
        if (!newExpense.category || !newExpense.description || !newExpense.amount || !newExpense.paymentMethod) {
            alert("Please fill all required fields");
            return;
        }

        const expense = {
            id: expenses.length + 1,
            ...newExpense,
            amount: parseFloat(newExpense.amount),
            status: "Pending"
        };

        setExpenses([expense, ...expenses]);
        setOpenAddDialog(false);
        setNewExpense({
            date: new Date().toISOString().split('T')[0],
            category: "",
            description: "",
            amount: "",
            paymentMethod: "",
            addedBy: "Current User"
        });
    };

    // Handle set petty cash allocation
    const handleSetPettyCashAllocation = () => {
        if (!newPettyCashAllocation.amount) {
            alert("Please enter allocation amount");
            return;
        }

        setPettyCashAllocation({
            amount: parseFloat(newPettyCashAllocation.amount),
            period: newPettyCashAllocation.period,
            allocatedDate: newPettyCashAllocation.allocatedDate,
            notes: newPettyCashAllocation.notes
        });

        setOpenPettyCashDialog(false);
        setNewPettyCashAllocation({
            amount: "",
            period: "Monthly",
            allocatedDate: new Date().toISOString().split('T')[0],
            notes: ""
        });
    };

    return (
        <Box sx={{ border: "1px solid #ccc", borderRadius: "20px", p: 2, height: "86vh", overflow: "auto" }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontSize: "20px", fontWeight: "600" }}>Expense Management</Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        sx={{
                            border: "1px solid #7DC353",
                            color: "#7DC353",
                            textTransform: "none",
                            borderRadius: "50px",
                            "&:hover": {
                                border: "1px solid #6BB043",
                                backgroundColor: "#7DC3531A"
                            }
                        }}
                    >
                        Export Report
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddDialog(true)}
                        sx={{
                            backgroundColor: "#7DC353",
                            color: "#fff",
                            textTransform: "none",
                            borderRadius: "50px",
                            "&:hover": {
                                backgroundColor: "#6BB043"
                            }
                        }}
                    >
                        Add New Expense
                    </Button>
                </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Petty Cash Fund Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a" }}>
                        Petty Cash Fund - {pettyCashAllocation.period}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#666", mt: 0.3 }}>
                        Allocated on {new Date(pettyCashAllocation.allocatedDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </Typography>
                </Box>
                <IconButton
                    onClick={() => setOpenPettyCashDialog(true)}
                    sx={{
                        border: "1px solid #E5E7EB",
                        '&:hover': {
                            backgroundColor: "#F3F4F6",
                            borderColor: "#7DC353"
                        }
                    }}
                    size="small"
                >
                    <SettingsIcon sx={{ fontSize: 18, color: "#666" }} />
                </IconButton>
            </Box>

            {/* Petty Cash Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        border: "1px solid #10B981",
                        borderRadius: "4px",
                        boxShadow: "none",
                        bgcolor: "#F0FDF4",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}>
                                        Allocated Amount
                                    </Typography>
                                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", mb: 0.5 }}>
                                        ₹{pettyCashAllocation.amount.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#999" }}>
                                        {pettyCashAllocation.period} Budget
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "4px",
                                    backgroundColor: "#F0FDF4",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <AccountBalanceWalletIcon sx={{ color: "#10B981", fontSize: 24 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        border: "1px solid #F97316",
                        borderRadius: "4px",
                        boxShadow: "none",
                        bgcolor: "#FFF7ED",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}>
                                        Total Spent
                                    </Typography>
                                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", mb: 0.5 }}>
                                        ₹{summary.pettyCashSpent.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#999" }}>
                                        {summary.pettyCashCount} transactions
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "4px",
                                    backgroundColor: "#FFF7ED",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <TrendingDownIcon sx={{ color: "#F97316", fontSize: 24 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        border: summary.pettyCashBalance > 0 ? "1px solid #3B82F6" : "1px solid #DC2626",
                        borderRadius: "4px",
                        boxShadow: "none",
                        bgcolor: summary.pettyCashBalance > 0 ? "#EFF6FF" : "#FEF2F2",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}>
                                        Remaining Balance
                                    </Typography>
                                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", mb: 0.5 }}>
                                        ₹{summary.pettyCashBalance.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#999" }}>
                                        Available to Use
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "4px",
                                    backgroundColor: summary.pettyCashBalance > 0 ? "#EFF6FF" : "#FEF2F2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    {summary.pettyCashBalance > 0 ? (
                                        <CheckCircleIcon sx={{ color: "#3B82F6", fontSize: 24 }} />
                                    ) : (
                                        <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 24 }} />
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{
                        border: "1px solid #F59E0B",
                        borderRadius: "4px",
                        boxShadow: "none",
                        bgcolor: "#FFFBEB",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}>
                                        Budget Utilization
                                    </Typography>
                                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", mb: 0.5 }}>
                                        {summary.pettyCashPercentage.toFixed(1)}%
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#999" }}>
                                        Of Allocated
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "4px",
                                    backgroundColor: "#FFFBEB",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <TrendingUpIcon sx={{ color: "#F59E0B", fontSize: 24 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Warning Alert - Only show when utilization is high */}
            {summary.pettyCashPercentage > 90 && (
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 3,
                    p: 1.5,
                    border: "1px solid #FCA5A5",
                    borderRadius: "4px",
                    bgcolor: "#FEF2F2"
                }}>
                    <WarningAmberIcon sx={{ fontSize: 20, color: "#DC2626" }} />
                    <Typography sx={{ fontSize: "12px", color: "#991B1B", fontWeight: 500 }}>
                        Warning: Petty cash is running low! Only ₹{summary.pettyCashBalance.toLocaleString()} remaining.
                    </Typography>
                </Box>
            )}

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        transition: "all 0.3s",
                        "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            transform: "translateY(-2px)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                    <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 600, mb: 1 }}>
                                        TODAY'S EXPENSE
                                    </Typography>
                                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827", mb: 0.5 }}>
                                        ₹{summary.daily.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                        {summary.dailyCount} transactions
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "12px",
                                    backgroundColor: "#FEF3C7",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <CalendarTodayIcon sx={{ color: "#F59E0B", fontSize: 24 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        transition: "all 0.3s",
                        "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            transform: "translateY(-2px)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                    <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 600, mb: 1 }}>
                                        WEEKLY EXPENSE
                                    </Typography>
                                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827", mb: 0.5 }}>
                                        ₹{summary.weekly.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                        {summary.weeklyCount} transactions
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "12px",
                                    backgroundColor: "#DBEAFE",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <TrendingUpIcon sx={{ color: "#3B82F6", fontSize: 24 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        transition: "all 0.3s",
                        "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            transform: "translateY(-2px)"
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                    <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 600, mb: 1 }}>
                                        MONTHLY EXPENSE
                                    </Typography>
                                    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827", mb: 0.5 }}>
                                        ₹{summary.monthly.toLocaleString()}
                                    </Typography>
                                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                                        {summary.monthlyCount} transactions
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "12px",
                                    backgroundColor: "#E0E7FF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <ReceiptLongIcon sx={{ color: "#6366F1", fontSize: 24 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters and Search */}
            <Box sx={{
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                p: 2,
                mb: 3
            }}>
                <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by description, category, or added by..."
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
                            <InputLabel>Category Filter</InputLabel>
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                label="Category Filter"
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
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", textAlign: "right" }}>
                            Showing {filteredExpenses.length} of {expenses.length} expenses
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Expense Table */}
            <Paper sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                <Box sx={{
                    maxHeight: 400,
                    overflowY: "auto",
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#F3F4F6',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#D1D5DB',
                        borderRadius: '10px',
                        '&:hover': {
                            backgroundColor: '#9CA3AF',
                        },
                    },
                }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Date
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Category
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Description
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Amount
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Payment Method
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Added By
                                </TableCell>
                                <TableCell sx={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#374151",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    textTransform: "uppercase",
                                    borderBottom: "2px solid #E5E7EB"
                                }}>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense, idx) => (
                                    <TableRow
                                        key={expense.id}
                                        hover
                                        sx={{
                                            backgroundColor: idx % 2 === 0 ? "#fff" : "#F9FAFB",
                                            '&:hover': {
                                                backgroundColor: '#F3F4F6 !important',
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: "13px", color: "#374151", borderBottom: "1px solid #E5E7EB" }}>
                                            {new Date(expense.date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                            <Chip
                                                label={expense.category}
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
                                            {expense.description}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "14px", fontWeight: 600, color: "#DC2626", borderBottom: "1px solid #E5E7EB" }}>
                                            ₹{expense.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "12px", color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
                                            {expense.paymentMethod}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "12px", color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
                                            {expense.addedBy}
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }}>
                                            <Chip
                                                label={expense.status}
                                                size="small"
                                                sx={{
                                                    backgroundColor: expense.status === "Approved" ? "#ECFDF5" : "#FEF3C7",
                                                    color: expense.status === "Approved" ? "#047857" : "#B45309",
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    border: expense.status === "Approved" ? "1px solid #A7F3D0" : "1px solid #FCD34D"
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 6, borderBottom: "none" }}>
                                        <ReceiptLongIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
                                        <Typography sx={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>
                                            No expenses found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>

            {/* Add Expense Dialog */}
            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "12px",
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
                            backgroundColor: "#D1FAE5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <AddIcon sx={{ color: "#10B981", fontSize: 24 }} />
                        </Box>
                        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                            Add New Expense
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setOpenAddDialog(false)} sx={{ color: "#6B7280" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, backgroundColor: "#fff" }}>
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Category *</InputLabel>
                                <Select
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    label="Category *"
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
                                label="Description *"
                                multiline
                                rows={3}
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                placeholder="Enter detailed description of the expense..."
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Amount *"
                                type="number"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Typography sx={{ fontWeight: 600 }}>₹</Typography>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Payment Method *</InputLabel>
                                <Select
                                    value={newExpense.paymentMethod}
                                    onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                                    label="Payment Method *"
                                >
                                    {paymentMethods.map((method) => (
                                        <MenuItem key={method} value={method}>
                                            {method}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{
                    p: 2.5,
                    borderTop: "2px solid #E5E7EB",
                    backgroundColor: "#F9FAFB"
                }}>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        variant="outlined"
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            borderColor: "#D1D5DB",
                            color: "#6B7280",
                            "&:hover": {
                                borderColor: "#9CA3AF",
                                backgroundColor: "#F3F4F6"
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddExpense}
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            backgroundColor: "#7DC353",
                            "&:hover": {
                                backgroundColor: "#6BB043"
                            }
                        }}
                    >
                        Add Expense
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Set Petty Cash Allocation Dialog */}
            <Dialog
                open={openPettyCashDialog}
                onClose={() => setOpenPettyCashDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "12px",
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
                            backgroundColor: "#D1FAE5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <AccountBalanceWalletIcon sx={{ color: "#10B981", fontSize: 24 }} />
                        </Box>
                        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                            Set Petty Cash Allocation
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setOpenPettyCashDialog(false)} sx={{ color: "#6B7280" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, backgroundColor: "#fff" }}>
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Allocation Amount *"
                                type="number"
                                value={newPettyCashAllocation.amount}
                                onChange={(e) => setNewPettyCashAllocation({ ...newPettyCashAllocation, amount: e.target.value })}
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
                                    value={newPettyCashAllocation.period}
                                    onChange={(e) => setNewPettyCashAllocation({ ...newPettyCashAllocation, period: e.target.value })}
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
                                value={newPettyCashAllocation.allocatedDate}
                                onChange={(e) => setNewPettyCashAllocation({ ...newPettyCashAllocation, allocatedDate: e.target.value })}
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
                                value={newPettyCashAllocation.notes}
                                onChange={(e) => setNewPettyCashAllocation({ ...newPettyCashAllocation, notes: e.target.value })}
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
                        onClick={() => setOpenPettyCashDialog(false)}
                        variant="outlined"
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            borderColor: "#D1D5DB",
                            color: "#6B7280",
                            "&:hover": {
                                borderColor: "#9CA3AF",
                                backgroundColor: "#F3F4F6"
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSetPettyCashAllocation}
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            backgroundColor: "#10B981",
                            "&:hover": {
                                backgroundColor: "#059669"
                            }
                        }}
                    >
                        Set Allocation
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
