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
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import { useSelector } from 'react-redux';

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
        <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '8px', p: 3, height: '86vh', overflow: 'auto', bgcolor: '#FAFAFA' }}>
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
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>

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
                </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{width:"fit-content"}}>
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
                    <Tab label="Overview" />
                    <Tab label="Collection" />
                    <Tab label="Details" />
                </Tabs>
            </Box>

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
    );
}
