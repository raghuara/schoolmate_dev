import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    ButtonGroup,
    LinearProgress,
    Divider,
    Avatar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SportsIcon from '@mui/icons-material/Sports';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    ComposedChart
} from 'recharts';
import AdvancedRevenueChart from './AdvancedRevenueChart';
import CashDenominationTracker from './CashDenominationTracker';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TodayIcon from '@mui/icons-material/Today';
import WarningIcon from '@mui/icons-material/Warning';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function FinanceDashboard() {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('month');
    const [tabValue, setTabValue] = useState(0);
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [value, setValue] = useState(0);
    const websiteSettings = useSelector(selectWebsiteSettings);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };



    const paymentMethodData = [
        { method: 'Online Payment', value: 2800000, percentage: 45, color: '#0891B2' },
        { method: 'Cash', value: 1850000, percentage: 30, color: '#22C55E' },
        { method: 'Cheque', value: 950000, percentage: 15, color: '#F97316' },
        { method: 'Bank Transfer', value: 600000, percentage: 10, color: '#7C3AED' },
    ];

    // Mock data for defaulters by grade
    const defaultersData = [
        { grade: 'Grade 1', count: 15, amount: 150000 },
        { grade: 'Grade 2', count: 22, amount: 220000 },
        { grade: 'Grade 3', count: 8, amount: 80000 },
        { grade: 'Grade 4', count: 12, amount: 120000 },
        { grade: 'Grade 5', count: 5, amount: 50000 },
        { grade: 'Grade 6', count: 18, amount: 175000 },
        { grade: 'Grade 7', count: 11, amount: 107000 },
        { grade: 'Grade 8', count: 9, amount: 90000 },
        { grade: 'Grade 9', count: 13, amount: 132000 },
        { grade: 'Grade 10', count: 6, amount: 55000 },
    ];

    // Mock recent transactions (expanded)
    const recentTransactions = [
        { id: 'TXN001', student: 'John Doe', grade: 'Grade 5-A', amount: 12000, type: 'School Fee', status: 'Completed', date: '2026-01-23', time: '10:30 AM', method: 'Online' },
        { id: 'TXN002', student: 'Jane Smith', grade: 'Grade 3-B', amount: 8500, type: 'Transport Fee', status: 'Completed', date: '2026-01-23', time: '11:15 AM', method: 'Cash' },
        { id: 'TXN003', student: 'Mike Johnson', grade: 'Grade 4-A', amount: 15000, type: 'School Fee', status: 'Pending', date: '2026-01-22', time: '02:45 PM', method: 'Cheque' },
        { id: 'TXN004', student: 'Sarah Williams', grade: 'Grade 2-C', amount: 5000, type: 'ECA Fee', status: 'Completed', date: '2026-01-22', time: '09:20 AM', method: 'Online' },
        { id: 'TXN005', student: 'Tom Brown', grade: 'Grade 1-A', amount: 10000, type: 'School Fee', status: 'Failed', date: '2026-01-21', time: '03:30 PM', method: 'Online' },
        { id: 'TXN006', student: 'Emily Davis', grade: 'Grade 6-B', amount: 7500, type: 'Transport Fee', status: 'Completed', date: '2026-01-21', time: '10:00 AM', method: 'Bank Transfer' },
        { id: 'TXN007', student: 'David Wilson', grade: 'Grade 8-A', amount: 13500, type: 'School Fee', status: 'Completed', date: '2026-01-20', time: '11:45 AM', method: 'Cash' },
        { id: 'TXN008', student: 'Olivia Martinez', grade: 'Grade 7-C', amount: 6000, type: 'Additional Fee', status: 'Pending', date: '2026-01-20', time: '01:20 PM', method: 'Cheque' },
    ];

    // Mock data for top performing classes
    const topPerformingClasses = [
        { class: 'Grade 10-A', collectionRate: 98, amount: 485000, students: 45 },
        { class: 'Grade 5-B', collectionRate: 96, amount: 472000, students: 48 },
        { class: 'Grade 8-A', collectionRate: 94, amount: 461000, students: 47 },
        { class: 'Grade 3-C', collectionRate: 93, amount: 448000, students: 46 },
        { class: 'Grade 9-A', collectionRate: 92, amount: 442000, students: 46 },
    ];

    // Mock data for concession summary
    const concessionData = [
        { type: 'Merit Scholarship', students: 45, amount: 450000 },
        { type: 'Sibling Discount', students: 78, amount: 390000 },
        { type: 'Staff Ward', students: 23, amount: 230000 },
        { type: 'Financial Aid', students: 15, amount: 180000 },
        { type: 'Sports Quota', students: 12, amount: 120000 },
    ];

    // Summary statistics (enhanced)
    const stats = [
        {
            title: 'Total Revenue',
            value: '₹67,85,000',
            change: '+12.5%',
            trend: 'up',
            icon: AccountBalanceWalletIcon,
            color: '#0891B2',
            bgColor: '#F0F9FA',
            subtitle: 'This Month'
        },
        {
            title: 'Collected Today',
            value: '₹45,200',
            change: '+8.2%',
            trend: 'up',
            icon: CheckCircleIcon,
            color: '#22C55E',
            bgColor: '#F1F8F4',
            subtitle: '23 Transactions'
        },
        {
            title: 'Pending Fees',
            value: '₹12,48,000',
            change: '-5.3%',
            trend: 'down',
            icon: PendingActionsIcon,
            color: '#F97316',
            bgColor: '#FFF8F0',
            subtitle: '119 Students'
        },
        {
            title: 'Total Students',
            value: '1,245',
            change: '+2.1%',
            trend: 'up',
            icon: PeopleIcon,
            color: '#E91E63',
            bgColor: '#FFF0F5',
            subtitle: 'Active Students'
        },
        {
            title: 'Collection Rate',
            value: '88.5%',
            change: '+3.2%',
            trend: 'up',
            icon: TrendingUpIcon,
            color: '#7C3AED',
            bgColor: '#F9F0FB',
            subtitle: 'Overall'
        },
        {
            title: 'Overdue Amount',
            value: '₹3,25,000',
            change: '-8.5%',
            trend: 'down',
            icon: CancelIcon,
            color: '#DC2626',
            bgColor: '#FFF5F5',
            subtitle: '38 Students'
        },
        {
            title: 'Concessions Given',
            value: '₹13,70,000',
            change: '+1.2%',
            trend: 'up',
            icon: ReceiptIcon,
            color: '#EA580C',
            bgColor: '#FFF9F5',
            subtitle: '173 Students'
        },
        {
            title: 'Avg Transaction',
            value: '₹9,850',
            change: '+0.8%',
            trend: 'up',
            icon: TrendingFlatIcon,
            color: '#5B21B6',
            bgColor: '#F5F7FF',
            subtitle: 'Per Student'
        },
    ];

    // Calculate collection percentage for grades
    const getCollectionPercentage = (collected, total) => {
        return ((collected / total) * 100).toFixed(1);
    };

    return (
        <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '8px', p: 1, height: '86vh', overflow: 'auto', bgcolor: '#FAFAFA' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: '35px', height: '35px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>
                            Finance Dashboard
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: '#666' }}>
                            Academic Year 2025-26 • Last Updated: Just Now
                        </Typography>
                    </Box>
                </Box>
                {/* <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>

                    <ButtonGroup
                        variant="outlined"
                        size="small"
                        sx={{
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            '& .MuiButton-root': {
                                textTransform: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                px: 2.5,
                                py: 1,
                                border: 'none',
                                borderRight: '1px solid #E8E8E8',
                                bgcolor: '#FFFFFF',
                                color: '#666',
                                transition: 'all 0.3s ease',
                                '&:last-child': {
                                    borderRight: 'none',
                                },
                                '&:hover': {
                                    bgcolor: '#F5F5F5',
                                    color: '#0891B2',
                                },
                            }
                        }}
                    >
                        <Button
                            onClick={() => setTimeRange('week')}
                            sx={{
                                ...(timeRange === 'week' && {
                                    bgcolor: '#0891B2 !important',
                                    color: '#FFFFFF !important',
                                    fontWeight: '600 !important',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                        bgcolor: '#0891B2 !important',
                                        color: '#FFFFFF !important',
                                    }
                                })
                            }}
                        >
                            Week
                        </Button>
                        <Button
                            onClick={() => setTimeRange('month')}
                            sx={{
                                ...(timeRange === 'month' && {
                                    bgcolor: '#0891B2 !important',
                                    color: '#FFFFFF !important',
                                    fontWeight: '600 !important',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                        bgcolor: '#0891B2 !important',
                                        color: '#FFFFFF !important',
                                    }
                                })
                            }}
                        >
                            Month
                        </Button>
                        <Button
                            onClick={() => setTimeRange('year')}
                            sx={{
                                ...(timeRange === 'year' && {
                                    bgcolor: '#0891B2 !important',
                                    color: '#FFFFFF !important',
                                    fontWeight: '600 !important',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                        bgcolor: '#0891B2 !important',
                                        color: '#FFFFFF !important',
                                    }
                                })
                            }}
                        >
                            Year
                        </Button>
                    </ButtonGroup>
                    <Button
                        startIcon={<DownloadIcon sx={{ fontSize: '18px' }} />}
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            px: 3,
                            py: 1.2,
                            bgcolor: '#22C55E',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(34,197,94,0.25)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: '#16A34A',
                                boxShadow: '0 4px 12px rgba(34,197,94,0.35)',
                                transform: 'translateY(-2px)',
                            }
                        }}
                    >
                        Export Report
                    </Button>
                </Box> */}
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Box sx={{display:"flex", justifyContent:"center"}}>
                <Box sx={{ width: "fit-content", mb: 2 }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="attendance tabs"
                        variant="scrollable"
                        slotProps={{
                            indicator: {
                                sx: { display: "none" },
                            },
                        }}
                        sx={{
                            backgroundColor: '#fff',
                            minHeight: "10px",
                            borderRadius: "50px",
                            border: "1px solid rgba(0,0,0,0.1)",
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontSize: '13px',
                                color: '#555',
                                fontWeight: 'bold',
                                minWidth: 0,
                                paddingX: 1,
                                minHeight: '30px',
                                height: '30px',
                                p: 2,
                                m: 0.8
                            },
                            '& .Mui-selected': {
                                color: `${websiteSettings.textColor} !important`,
                                bgcolor: websiteSettings.mainColor,
                                borderRadius: "50px",
                                boxShadow: "1px 1px 2px 0.5px rgba(0, 0, 0, 0.2)",
                                border: "1px solid rgba(0,0,0,0.1)",
                            },
                        }}
                    >
                        <Tab
                            icon={<DashboardIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Overview"
                        />
                        <Tab
                            icon={<TodayIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Today's Collection"
                        />
                        <Tab
                            icon={<MonetizationOnIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Cash Collection"
                        />
                        <Tab
                            icon={<SchoolIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Classwise Collection"
                        />
                        <Tab
                            icon={<WarningIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Defaulters"
                        />
                        <Tab
                            icon={<AssessmentIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Fee Report"
                        />
                    </Tabs>
                </Box>
            </Box>

            {/* Tab Panel 0: Overview */}
            {value === 0 && (
                <Box>
                    {/* Statistics Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {stats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 4,
                                        lg: 3
                                    }}
                                    key={index}
                                >
                                    <Card
                                        sx={{
                                            height: '100%',
                                            boxShadow: 'none',
                                            border: `1px solid ${stat.color}`,
                                            borderRadius: '4px',
                                            transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                            bgcolor: stat.bgColor,
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                borderColor: stat.color,
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                        {stat.title}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', mb: 0.5 }}>
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#999', mb: 1 }}>
                                                        {stat.subtitle}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        {stat.trend === 'up' ? (
                                                            <TrendingUpIcon sx={{ fontSize: 14, color: '#22C55E' }} />
                                                        ) : (
                                                            <TrendingDownIcon sx={{ fontSize: 14, color: '#DC2626' }} />
                                                        )}
                                                        <Typography
                                                            sx={{
                                                                fontSize: '12px',
                                                                color: stat.trend === 'up' ? '#22C55E' : '#DC2626',
                                                                fontWeight: '600',
                                                            }}
                                                        >
                                                            {stat.change}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: stat.bgColor,
                                                        width: 48,
                                                        height: 48,
                                                    }}
                                                >
                                                    <IconComponent sx={{ color: stat.color, fontSize: 24 }} />
                                                </Avatar>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Advanced Revenue Chart - Like Image */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 12,
                                lg: 8
                            }}
                        >
                            <AdvancedRevenueChart />
                        </Grid>

                        {/* Financial Highlights */}
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 12,
                                lg: 4
                            }}
                        >
                            <Grid container spacing={2}>
                                {/* Monthly Summary */}
                                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                                                Monthly Summary
                                            </Typography>
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#666' }}>Total Collection</Typography>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#7C3AED' }}>
                                                        ₹68.5L
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography sx={{ fontSize: '13px', color: '#666' }}>Total Expenses</Typography>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#E91E63' }}>
                                                        ₹33.5L
                                                    </Typography>
                                                </Box>
                                                <Divider sx={{ my: 1.5 }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>Net Profit</Typography>
                                                    <Typography sx={{ fontSize: '15px', fontWeight: '700', color: '#22C55E' }}>
                                                        ₹35.0L
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Fee Categories Breakdown */}
                                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                                                Collection by Category
                                            </Typography>
                                            <Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#7C3AED' }} />
                                                            <Typography sx={{ fontSize: '12px', color: '#666' }}>School Fee</Typography>
                                                        </Box>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹35L (51%)</Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={51}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: '#E8E8E8',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: '#7C3AED',
                                                                borderRadius: 3,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0891B2' }} />
                                                            <Typography sx={{ fontSize: '12px', color: '#666' }}>Transport Fee</Typography>
                                                        </Box>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹12L (18%)</Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={18}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: '#E8E8E8',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: '#0891B2',
                                                                borderRadius: 3,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E' }} />
                                                            <Typography sx={{ fontSize: '12px', color: '#666' }}>ECA Fee</Typography>
                                                        </Box>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹8L (12%)</Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={12}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: '#E8E8E8',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: '#22C55E',
                                                                borderRadius: 3,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                                <Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F97316' }} />
                                                            <Typography sx={{ fontSize: '12px', color: '#666' }}>Additional Fee</Typography>
                                                        </Box>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹5L (7%)</Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={7}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: '#E8E8E8',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: '#F97316',
                                                                borderRadius: 3,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Quick Stats */}
                                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                                                Quick Stats
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Average Fee per Student</Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>₹54,950</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Collection Efficiency</Typography>
                                                    <Chip label="88.5%" size="small" sx={{ bgcolor: '#DCFCE7', color: '#22C55E', fontWeight: '600', fontSize: '11px', height: '22px' }} />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Outstanding Dues</Typography>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>₹12.5L</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Fee Defaulters</Typography>
                                                    <Chip label="119 Students" size="small" sx={{ bgcolor: '#FEF3C7', color: '#F59E0B', fontWeight: '600', fontSize: '10px', height: '22px' }} />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>



                    {/* Charts Row 2 - Grade Collection & Payment Methods */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>


                        {/* Payment Methods & Defaulters */}
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 6,
                                lg: 6
                            }}
                        >
                            <Grid container spacing={2}>
                                {/* Payment Methods */}
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 12,
                                        lg: 12
                                    }}
                                    sx={{ marginTop: "-100px" }}
                                >
                                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                                Payment Methods Distribution
                                            </Typography>
                                            {paymentMethodData.map((method, index) => (
                                                <Box key={index} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                            {method.method}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: '600', color: method.color }}>
                                                            {method.percentage}%
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={method.percentage}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: '#f0f0f0',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: method.color,
                                                                borderRadius: 3,
                                                            },
                                                        }}
                                                    />
                                                    <Typography sx={{ fontSize: '11px', color: '#666', mt: 0.5 }}>
                                                        ₹{method.value.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </Grid>

                            </Grid>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 6,
                                lg: 6
                            }}
                        >
                            <Grid container spacing={2}>
                                {/* Payment Methods */}


                                {/* Defaulters Chart */}
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 12,
                                        lg: 12
                                    }}
                                >
                                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                                Fee Defaulters by Grade
                                            </Typography>
                                            <ResponsiveContainer width="100%" height={180}>
                                                <BarChart data={defaultersData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                                                    <XAxis dataKey="grade" stroke="#666" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={60} />
                                                    <YAxis stroke="#666" style={{ fontSize: '10px' }} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#fff',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                                        }}
                                                        formatter={(value, name) => [
                                                            name === 'count' ? `${value} students` : `₹${value.toLocaleString()}`,
                                                            name === 'count' ? 'Students' : 'Amount'
                                                        ]}
                                                    />
                                                    <Bar dataKey="count" fill="#E91E63" name="Students" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Tables Row - Recent Transactions & Top Performers */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Recent Transactions */}
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 8,
                                lg: 8
                            }}
                        >
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                                            Recent Transactions
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                placeholder="Search..."
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon sx={{ fontSize: 18 }} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                sx={{ width: '200px' }}
                                            />
                                            <Button size="small" sx={{ textTransform: 'none' }}>
                                                View All
                                            </Button>
                                        </Box>
                                    </Box>
                                    <TableContainer sx={{ maxHeight: 400 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Transaction ID</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Student</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Type</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Amount</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Method</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Date & Time</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {recentTransactions.map((transaction) => (
                                                    <TableRow key={transaction.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#5B21B6' }}>
                                                                {transaction.id}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                {transaction.student}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                {transaction.grade}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '11px' }}>
                                                                {transaction.type}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                ₹{transaction.amount.toLocaleString()}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={transaction.method}
                                                                size="small"
                                                                sx={{
                                                                    fontSize: '10px',
                                                                    height: '20px',
                                                                    bgcolor: '#EDE9FE',
                                                                    color: '#5B21B6'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '11px' }}>
                                                                {transaction.date}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                {transaction.time}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={transaction.status}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor:
                                                                        transaction.status === 'Completed'
                                                                            ? '#DCFCE7'
                                                                            : transaction.status === 'Pending'
                                                                                ? '#FFF7ED'
                                                                                : '#FEE2E2',
                                                                    color:
                                                                        transaction.status === 'Completed'
                                                                            ? '#22C55E'
                                                                            : transaction.status === 'Pending'
                                                                                ? '#F97316'
                                                                                : '#DC2626',
                                                                    fontWeight: '600',
                                                                    fontSize: '10px',
                                                                    height: '20px'
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Top Performers & Concessions */}
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 4,
                                lg: 4
                            }}
                        >
                            <Grid container spacing={2}>
                                {/* Top Performing Classes */}
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 12,
                                        md: 12,
                                        lg: 12
                                    }}
                                >
                                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                                Top Performing Classes
                                            </Typography>
                                            {topPerformingClasses.map((item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        p: 1.5,
                                                        mb: 1,
                                                        bgcolor: index === 0 ? '#FFFBF0' : '#FAFAFA',
                                                        borderRadius: '8px',
                                                        border: index === 0 ? '1px solid #FFE082' : '1px solid #F5F5F5'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                bgcolor: index === 0 ? '#FFE082' : '#E8E8E8',
                                                                color: index === 0 ? '#F57F17' : '#999',
                                                                fontSize: '14px',
                                                                fontWeight: '700'
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                                                {item.class}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                                {item.students} students
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Typography sx={{ fontSize: '14px', fontWeight: '700', color: '#22C55E' }}>
                                                            {item.collectionRate}%
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '10px', color: '#999' }}>
                                                            ₹{(item.amount / 1000).toFixed(0)}K
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Tab Panel 1: Today's Collection */}
            {value === 1 && (
                <Box>
                    {/* Today's Stats */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #0891B2', borderRadius: '4px', bgcolor: '#F0F9FA' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                Total Collections
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                ₹45,200
                                            </Typography>
                                            <Typography sx={{ fontSize: '11px', color: '#22C55E', fontWeight: '600' }}>
                                                ↑ +12.3% from yesterday
                                            </Typography>
                                        </Box>
                                        <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#0891B2' }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #22C55E', borderRadius: '4px', bgcolor: '#F1F8F4' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                Transactions
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                23
                                            </Typography>
                                            <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                                8 pending verification
                                            </Typography>
                                        </Box>
                                        <ReceiptIcon sx={{ fontSize: 40, color: '#22C55E' }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #F97316', borderRadius: '4px', bgcolor: '#FFF8F0' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                Avg. Transaction
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                ₹1,965
                                            </Typography>
                                            <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                                Per student today
                                            </Typography>
                                        </Box>
                                        <TrendingUpIcon sx={{ fontSize: 40, color: '#F97316' }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #7C3AED', borderRadius: '4px', bgcolor: '#F9F0FB' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                Cash in Hand
                                            </Typography>
                                            <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                                                ₹18,500
                                            </Typography>
                                            <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                                To be deposited
                                            </Typography>
                                        </Box>
                                        <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#7C3AED' }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Today's Transactions & Payment Methods */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Today's Transactions Table */}
                        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                                            Today's Transactions
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                placeholder="Search student..."
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon sx={{ fontSize: 18 }} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                sx={{ width: '200px' }}
                                            />
                                        </Box>
                                    </Box>
                                    <TableContainer sx={{ maxHeight: 500 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Time</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Student</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Fee Type</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Amount</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Method</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Receipt</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {recentTransactions.filter(t => t.date === '2026-01-23').map((transaction) => (
                                                    <TableRow key={transaction.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                {transaction.time}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                {transaction.student}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                {transaction.grade}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '11px' }}>
                                                                {transaction.type}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#22C55E' }}>
                                                                ₹{transaction.amount.toLocaleString()}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={transaction.method}
                                                                size="small"
                                                                sx={{
                                                                    fontSize: '10px',
                                                                    height: '20px',
                                                                    bgcolor: '#EDE9FE',
                                                                    color: '#5B21B6'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '11px', color: '#0891B2', fontWeight: '600' }}>
                                                                {transaction.id}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={transaction.status}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor:
                                                                        transaction.status === 'Completed'
                                                                            ? '#DCFCE7'
                                                                            : transaction.status === 'Pending'
                                                                                ? '#FFF7ED'
                                                                                : '#FEE2E2',
                                                                    color:
                                                                        transaction.status === 'Completed'
                                                                            ? '#22C55E'
                                                                            : transaction.status === 'Pending'
                                                                                ? '#F97316'
                                                                                : '#DC2626',
                                                                    fontWeight: '600',
                                                                    fontSize: '10px',
                                                                    height: '20px'
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Payment Methods Breakdown */}
                        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                                Today's Payment Methods
                                            </Typography>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Online', value: 18500, color: '#0891B2' },
                                                            { name: 'Cash', value: 15200, color: '#22C55E' },
                                                            { name: 'Cheque', value: 8500, color: '#F97316' },
                                                            { name: 'Bank Transfer', value: 3000, color: '#7C3AED' },
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={2}
                                                        dataKey="value"
                                                    >
                                                        {[
                                                            { name: 'Online', value: 18500, color: '#0891B2' },
                                                            { name: 'Cash', value: 15200, color: '#22C55E' },
                                                            { name: 'Cheque', value: 8500, color: '#F97316' },
                                                            { name: 'Bank Transfer', value: 3000, color: '#7C3AED' },
                                                        ].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value) => `₹${value.toLocaleString()}`}
                                                        contentStyle={{
                                                            backgroundColor: '#fff',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <Box sx={{ mt: 2 }}>
                                                {[
                                                    { name: 'Online Payment', value: 18500, color: '#0891B2', percent: 41 },
                                                    { name: 'Cash', value: 15200, color: '#22C55E', percent: 34 },
                                                    { name: 'Cheque', value: 8500, color: '#F97316', percent: 19 },
                                                    { name: 'Bank Transfer', value: 3000, color: '#7C3AED', percent: 6 },
                                                ].map((method, index) => (
                                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: method.color }} />
                                                            <Typography sx={{ fontSize: '12px' }}>{method.name}</Typography>
                                                        </Box>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                ₹{method.value.toLocaleString()}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                {method.percent}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                    <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                                Hourly Collection
                                            </Typography>
                                            <ResponsiveContainer width="100%" height={180}>
                                                <BarChart
                                                    data={[
                                                        { hour: '8-9', amount: 2500 },
                                                        { hour: '9-10', amount: 5200 },
                                                        { hour: '10-11', amount: 8500 },
                                                        { hour: '11-12', amount: 12000 },
                                                        { hour: '12-1', amount: 7500 },
                                                        { hour: '1-2', amount: 6500 },
                                                        { hour: '2-3', amount: 3000 },
                                                    ]}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                                                    <XAxis dataKey="hour" stroke="#666" style={{ fontSize: '10px' }} />
                                                    <YAxis stroke="#666" style={{ fontSize: '10px' }} />
                                                    <Tooltip
                                                        formatter={(value) => `₹${value.toLocaleString()}`}
                                                        contentStyle={{
                                                            backgroundColor: '#fff',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                        }}
                                                    />
                                                    <Bar dataKey="amount" fill="#0891B2" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Tab Panel 3: Classwise Collection */}
            {value === 3 && (
                <Box>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                                            Grade-wise Fee Collection Status
                                        </Typography>
                                        <FormControl size="small" sx={{ minWidth: 200 }}>
                                            <InputLabel>Select Grade</InputLabel>
                                            <Select
                                                value={selectedGrade}
                                                onChange={(e) => setSelectedGrade(e.target.value)}
                                                label="Select Grade"
                                            >
                                                <MenuItem value="all">All Grades</MenuItem>
                                                <MenuItem value="1">Grade 1</MenuItem>
                                                <MenuItem value="2">Grade 2</MenuItem>
                                                <MenuItem value="3">Grade 3</MenuItem>
                                                <MenuItem value="4">Grade 4</MenuItem>
                                                <MenuItem value="5">Grade 5</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Grid container spacing={2}>
                                        {[
                                            { grade: 'Grade 1', sections: 3, students: 135, collected: 6750000, total: 8100000, pending: 15, color: '#FF6B35' },
                                            { grade: 'Grade 2', sections: 3, students: 142, collected: 7100000, total: 8520000, pending: 22, color: '#004E89' },
                                            { grade: 'Grade 3', sections: 4, students: 156, collected: 7800000, total: 9360000, pending: 8, color: '#7C3AED' },
                                            { grade: 'Grade 4', sections: 4, students: 148, collected: 7400000, total: 8880000, pending: 12, color: '#22C55E' },
                                            { grade: 'Grade 5', sections: 3, students: 128, collected: 6400000, total: 7680000, pending: 5, color: '#F97316' },
                                            { grade: 'Grade 6', sections: 4, students: 152, collected: 7600000, total: 9120000, pending: 18, color: '#0891B2' },
                                            { grade: 'Grade 7', sections: 3, students: 138, collected: 6900000, total: 8280000, pending: 11, color: '#E91E63' },
                                            { grade: 'Grade 8', sections: 3, students: 125, collected: 6250000, total: 7500000, pending: 9, color: '#8B5CF6' },
                                            { grade: 'Grade 9', sections: 2, students: 98, collected: 4900000, total: 5880000, pending: 13, color: '#EA580C' },
                                            { grade: 'Grade 10', sections: 2, students: 85, collected: 4250000, total: 5100000, pending: 6, color: '#14B8A6' },
                                        ].map((item, index) => {
                                            const collectionRate = (item.collected / item.total) * 100;
                                            return (
                                                <Grid key={index} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                                    <Card
                                                        sx={{
                                                            boxShadow: 'none',
                                                            border: `1px solid ${item.color}`,
                                                            borderRadius: '8px',
                                                            bgcolor: `${item.color}08`,
                                                            transition: 'transform 0.2s',
                                                            '&:hover': {
                                                                transform: 'translateY(-4px)',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                            }
                                                        }}
                                                    >
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                                <Box>
                                                                    <Typography sx={{ fontSize: '20px', fontWeight: '700', color: item.color, mb: 0.5 }}>
                                                                        {item.grade}
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                                        {item.sections} Sections • {item.students} Students
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ textAlign: 'right' }}>
                                                                    <Typography sx={{ fontSize: '24px', fontWeight: '700', color: item.color }}>
                                                                        {collectionRate.toFixed(1)}%
                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                        Collection Rate
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={collectionRate}
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 4,
                                                                    bgcolor: '#E8E8E8',
                                                                    mb: 2,
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: item.color,
                                                                        borderRadius: 4,
                                                                    },
                                                                }}
                                                            />

                                                            <Grid container spacing={2}>
                                                                <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                                                    <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: '6px' }}>
                                                                        <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                                            Collected
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#22C55E' }}>
                                                                            ₹{(item.collected / 100000).toFixed(1)}L
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                                <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                                                                    <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: '6px' }}>
                                                                        <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>
                                                                            Pending
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: '16px', fontWeight: '700', color: '#F97316' }}>
                                                                            ₹{((item.total - item.collected) / 100000).toFixed(1)}L
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>

                                                            <Divider sx={{ my: 1.5 }} />

                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <PendingActionsIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                                                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                                                        {item.pending} Defaulters
                                                                    </Typography>
                                                                </Box>
                                                                <Button
                                                                    size="small"
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        fontSize: '11px',
                                                                        color: item.color,
                                                                        fontWeight: '600',
                                                                        '&:hover': {
                                                                            bgcolor: `${item.color}20`,
                                                                        }
                                                                    }}
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Tab Panel 4: Defaulters */}
            {value === 4 && (
                <Box>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                                            Fee Defaulters List
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <TextField
                                                size="small"
                                                placeholder="Search student..."
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon sx={{ fontSize: 18 }} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                sx={{ width: '250px' }}
                                            />
                                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                                <InputLabel>Filter by Grade</InputLabel>
                                                <Select
                                                    value={selectedGrade}
                                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                                    label="Filter by Grade"
                                                >
                                                    <MenuItem value="all">All Grades</MenuItem>
                                                    <MenuItem value="1">Grade 1</MenuItem>
                                                    <MenuItem value="2">Grade 2</MenuItem>
                                                    <MenuItem value="3">Grade 3</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<DownloadIcon />}
                                                sx={{
                                                    textTransform: 'none',
                                                    bgcolor: '#DC2626',
                                                    '&:hover': { bgcolor: '#B91C1C' }
                                                }}
                                            >
                                                Export
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* Summary Cards */}
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }}>
                                            <Box sx={{ p: 2, bgcolor: '#FEE2E2', borderRadius: '8px', border: '1px solid #DC2626' }}>
                                                <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                    Total Defaulters
                                                </Typography>
                                                <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#DC2626' }}>
                                                    119
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                                    9.6% of total students
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }}>
                                            <Box sx={{ p: 2, bgcolor: '#FFF7ED', borderRadius: '8px', border: '1px solid #F97316' }}>
                                                <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                    Total Pending
                                                </Typography>
                                                <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#F97316' }}>
                                                    ₹12.5L
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                                    Avg ₹10,504 per student
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }}>
                                            <Box sx={{ p: 2, bgcolor: '#FFEDD5', borderRadius: '8px', border: '1px solid #EA580C' }}>
                                                <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                    Overdue (&gt;30 days)
                                                </Typography>
                                                <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#EA580C' }}>
                                                    38
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                                    Amount: ₹3.25L
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }}>
                                            <Box sx={{ p: 2, bgcolor: '#FEF3C7', borderRadius: '8px', border: '1px solid #F59E0B' }}>
                                                <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                    Recent (0-30 days)
                                                </Typography>
                                                <Typography sx={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B' }}>
                                                    81
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                                    Amount: ₹9.23L
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <TableContainer sx={{ maxHeight: 500 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Student Details</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Grade</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Pending Amount</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Fee Type</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Due Date</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Days Overdue</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Contact</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {[
                                                    { id: 'ST001', name: 'Rahul Sharma', grade: 'Grade 5-A', amount: 15000, type: 'School Fee', dueDate: '2025-12-15', daysOverdue: 46, contact: '+91 98765 43210', priority: 'High' },
                                                    { id: 'ST002', name: 'Priya Patel', grade: 'Grade 3-B', amount: 8500, type: 'Transport Fee', dueDate: '2026-01-05', daysOverdue: 25, contact: '+91 98765 43211', priority: 'Medium' },
                                                    { id: 'ST003', name: 'Amit Kumar', grade: 'Grade 8-C', amount: 12000, type: 'School Fee', dueDate: '2025-11-30', daysOverdue: 61, contact: '+91 98765 43212', priority: 'High' },
                                                    { id: 'ST004', name: 'Sneha Reddy', grade: 'Grade 2-A', amount: 6500, type: 'ECA Fee', dueDate: '2026-01-10', daysOverdue: 20, contact: '+91 98765 43213', priority: 'Low' },
                                                    { id: 'ST005', name: 'Arjun Singh', grade: 'Grade 10-B', amount: 18000, type: 'School Fee', dueDate: '2025-12-20', daysOverdue: 41, contact: '+91 98765 43214', priority: 'High' },
                                                    { id: 'ST006', name: 'Kavya Nair', grade: 'Grade 6-A', amount: 9500, type: 'Transport Fee', dueDate: '2026-01-01', daysOverdue: 29, contact: '+91 98765 43215', priority: 'Medium' },
                                                    { id: 'ST007', name: 'Rohan Gupta', grade: 'Grade 4-C', amount: 11000, type: 'School Fee', dueDate: '2025-12-10', daysOverdue: 51, contact: '+91 98765 43216', priority: 'High' },
                                                    { id: 'ST008', name: 'Ananya Das', grade: 'Grade 7-B', amount: 7200, type: 'Additional Fee', dueDate: '2026-01-15', daysOverdue: 15, contact: '+91 98765 43217', priority: 'Low' },
                                                ].map((student, index) => (
                                                    <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                {student.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '10px', color: '#666' }}>
                                                                ID: {student.id}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '12px' }}>
                                                                {student.grade}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#DC2626' }}>
                                                                ₹{student.amount.toLocaleString()}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '11px' }}>
                                                                {student.type}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '11px' }}>
                                                                {student.dueDate}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={`${student.daysOverdue} days`}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor:
                                                                        student.daysOverdue > 45 ? '#FEE2E2' :
                                                                            student.daysOverdue > 30 ? '#FED7AA' :
                                                                                '#FEF3C7',
                                                                    color:
                                                                        student.daysOverdue > 45 ? '#DC2626' :
                                                                            student.daysOverdue > 30 ? '#EA580C' :
                                                                                '#F59E0B',
                                                                    fontWeight: '600',
                                                                    fontSize: '10px',
                                                                    height: '20px'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontSize: '11px', color: '#0891B2' }}>
                                                                {student.contact}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontSize: '10px',
                                                                    borderColor: '#0891B2',
                                                                    color: '#0891B2',
                                                                    '&:hover': {
                                                                        bgcolor: '#F0F9FA',
                                                                        borderColor: '#0891B2',
                                                                    }
                                                                }}
                                                            >
                                                                Send Reminder
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Tab Panel 5: Fee Report */}
            {value === 5 && (
                <Box>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Report Filters */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                        Generate Fee Report
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Report Type</InputLabel>
                                                <Select label="Report Type" defaultValue="comprehensive">
                                                    <MenuItem value="comprehensive">Comprehensive Report</MenuItem>
                                                    <MenuItem value="collection">Collection Summary</MenuItem>
                                                    <MenuItem value="defaulters">Defaulters Report</MenuItem>
                                                    <MenuItem value="concession">Concession Report</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Time Period</InputLabel>
                                                <Select label="Time Period" defaultValue="month">
                                                    <MenuItem value="today">Today</MenuItem>
                                                    <MenuItem value="week">This Week</MenuItem>
                                                    <MenuItem value="month">This Month</MenuItem>
                                                    <MenuItem value="quarter">This Quarter</MenuItem>
                                                    <MenuItem value="year">This Year</MenuItem>
                                                    <MenuItem value="custom">Custom Range</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Grade</InputLabel>
                                                <Select label="Grade" defaultValue="all">
                                                    <MenuItem value="all">All Grades</MenuItem>
                                                    <MenuItem value="1">Grade 1</MenuItem>
                                                    <MenuItem value="2">Grade 2</MenuItem>
                                                    <MenuItem value="3">Grade 3</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<DownloadIcon />}
                                                sx={{
                                                    textTransform: 'none',
                                                    bgcolor: '#0891B2',
                                                    height: '40px',
                                                    '&:hover': { bgcolor: '#0E7490' }
                                                }}
                                            >
                                                Generate Report
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Quick Report Stats */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Grid container spacing={2}>
                                {[
                                    { title: 'Total Revenue', value: '₹67.85L', subtitle: 'This Month', icon: AccountBalanceWalletIcon, color: '#0891B2', bgColor: '#F0F9FA' },
                                    { title: 'Collection Rate', value: '88.5%', subtitle: 'Overall', icon: TrendingUpIcon, color: '#22C55E', bgColor: '#F1F8F4' },
                                    { title: 'Pending Fees', value: '₹12.48L', subtitle: '119 Students', icon: PendingActionsIcon, color: '#F97316', bgColor: '#FFF8F0' },
                                    { title: 'Concessions', value: '₹13.70L', subtitle: '173 Students', icon: ReceiptIcon, color: '#7C3AED', bgColor: '#F9F0FB' },
                                ].map((stat, index) => {
                                    const IconComponent = stat.icon;
                                    return (
                                        <Grid key={index} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                            <Card sx={{ boxShadow: 'none', border: `1px solid ${stat.color}`, borderRadius: '4px', bgcolor: stat.bgColor }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box>
                                                            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                                                {stat.title}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', mb: 0.5 }}>
                                                                {stat.value}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                                {stat.subtitle}
                                                            </Typography>
                                                        </Box>
                                                        <IconComponent sx={{ fontSize: 36, color: stat.color }} />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Grid>

                        {/* Detailed Report Table */}
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #E8E8E8', borderRadius: '4px', bgcolor: '#FFFFFF' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '18px', fontWeight: '600', mb: 2 }}>
                                        Comprehensive Fee Report - January 2026
                                    </Typography>
                                    <TableContainer sx={{ maxHeight: 500 }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Grade</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Total Students</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Expected Revenue</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Collected</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Pending</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Concessions</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Defaulters</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', fontSize: '12px', bgcolor: '#f5f5f5' }}>Collection %</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {[
                                                    { grade: 'Grade 1', students: 135, expected: 8100000, collected: 6750000, concessions: 1050000, defaulters: 15 },
                                                    { grade: 'Grade 2', students: 142, expected: 8520000, collected: 7100000, concessions: 1150000, defaulters: 22 },
                                                    { grade: 'Grade 3', students: 156, expected: 9360000, collected: 7800000, concessions: 1200000, defaulters: 8 },
                                                    { grade: 'Grade 4', students: 148, expected: 8880000, collected: 7400000, concessions: 1100000, defaulters: 12 },
                                                    { grade: 'Grade 5', students: 128, expected: 7680000, collected: 6400000, concessions: 950000, defaulters: 5 },
                                                    { grade: 'Grade 6', students: 152, expected: 9120000, collected: 7600000, concessions: 1180000, defaulters: 18 },
                                                    { grade: 'Grade 7', students: 138, expected: 8280000, collected: 6900000, concessions: 1050000, defaulters: 11 },
                                                    { grade: 'Grade 8', students: 125, expected: 7500000, collected: 6250000, concessions: 900000, defaulters: 9 },
                                                    { grade: 'Grade 9', students: 98, expected: 5880000, collected: 4900000, concessions: 750000, defaulters: 13 },
                                                    { grade: 'Grade 10', students: 85, expected: 5100000, collected: 4250000, concessions: 640000, defaulters: 6 },
                                                ].map((row, index) => {
                                                    const pending = row.expected - row.collected - row.concessions;
                                                    const collectionRate = (row.collected / row.expected) * 100;
                                                    return (
                                                        <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                    {row.grade}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: '12px' }}>
                                                                    {row.students}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: '12px' }}>
                                                                    ₹{(row.expected / 100000).toFixed(2)}L
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#22C55E' }}>
                                                                    ₹{(row.collected / 100000).toFixed(2)}L
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#F97316' }}>
                                                                    ₹{(pending / 100000).toFixed(2)}L
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontSize: '12px' }}>
                                                                    ₹{(row.concessions / 100000).toFixed(2)}L
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={row.defaulters}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: row.defaulters > 15 ? '#FEE2E2' : '#FEF3C7',
                                                                        color: row.defaulters > 15 ? '#DC2626' : '#F59E0B',
                                                                        fontWeight: '600',
                                                                        fontSize: '10px',
                                                                        height: '20px'
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={collectionRate}
                                                                        sx={{
                                                                            width: '60px',
                                                                            height: 6,
                                                                            borderRadius: 3,
                                                                            bgcolor: '#E8E8E8',
                                                                            '& .MuiLinearProgress-bar': {
                                                                                bgcolor: collectionRate > 85 ? '#22C55E' : collectionRate > 70 ? '#F97316' : '#DC2626',
                                                                                borderRadius: 3,
                                                                            },
                                                                        }}
                                                                    />
                                                                    <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                                                                        {collectionRate.toFixed(0)}%
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                {/* Total Row */}
                                                <TableRow sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                                                    <TableCell sx={{ fontWeight: '700', fontSize: '12px' }}>TOTAL</TableCell>
                                                    <TableCell sx={{ fontWeight: '700', fontSize: '12px' }}>1,245</TableCell>
                                                    <TableCell sx={{ fontWeight: '700', fontSize: '12px' }}>₹814.20L</TableCell>
                                                    <TableCell sx={{ fontWeight: '700', fontSize: '12px', color: '#22C55E' }}>₹678.50L</TableCell>
                                                    <TableCell sx={{ fontWeight: '700', fontSize: '12px', color: '#F97316' }}>₹124.80L</TableCell>
                                                    <TableCell sx={{ fontWeight: '700', fontSize: '12px' }}>₹137.00L</TableCell>
                                                    <TableCell sx={{ fontWeight: '700', fontSize: '12px' }}>119</TableCell>
                                                    <TableCell sx={{ fontWeight: '700', fontSize: '12px' }}>83.3%</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Tab Panel 2: Cash Collection */}
            {value === 2 && (
                <Box>
                    <CashDenominationTracker />
                </Box>
            )}
        </Box>
    );
}
