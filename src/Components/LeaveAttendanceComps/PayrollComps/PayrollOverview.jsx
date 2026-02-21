import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, IconButton, Chip } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const payrollModules = [
    {
        color: "#8600BB",
        icon: AssignmentIcon,
        text: "Create Salary Structures",
        description: "Configure salary components, create grades, and define earnings and deduction rules for different employee categories.",
        bgColor: "#f9f4fc",
        iconBgColor: "#8600BB1A",
        path: "salary-structures",
        disabled: false,
    },
    {
        color: "#2563EB",
        icon: AccountBalanceIcon,
        text: "Auto-Deductions & Compliance",
        description: "Manage statutory compliance settings for PF, ESI, Professional Tax (PT), and TDS auto-deductions.",
        bgColor: "#EFF6FF",
        iconBgColor: "#2563EB1A",
        path: "compliance",
        disabled: false,
    },
    {
        color: "#00ACC1",
        icon: ReceiptLongIcon,
        text: "Bank Transfer & Reports",
        description: "Generate bank transfer advice files and download mandatory government reports (EPF, ESI Challans).",
        bgColor: "#E0F7FA",
        iconBgColor: "#00ACC11A",
        path: "bank-reports",
        disabled: false,
    },
    {
        color: "#E30053",
        icon: DescriptionIcon,
        text: "Audit-ready Salary Register",
        description: "Access historical salary records, track changes, and generate comprehensive audit-ready salary registers.",
        bgColor: "#FCF8F9",
        iconBgColor: "#fbebf1",
        path: "salary-register",
        disabled: false,
    },
    {
        color: "#FF9800",
        icon: TaskAltIcon,
        text: "Approve Payroll & Payslips",
        description: "Review final payroll data, approve salaries for disbursement, and generate monthly payslips for all employees.",
        bgColor: "#FFF4E6",
        iconBgColor: "#FF98001A",
        path: "approve-payroll",
        disabled: false,
    },
    // {
    //     color: "#059669",
    //     icon: BeachAccessIcon,
    //     text: "Leave Policy",
    //     description: "Configure leave types (Sick Leave, Casual Leave, Privilege Leave, etc.), annual entitlements, carry-forward rules, and salary impact for all staff categories.",
    //     bgColor: "#ECFDF5",
    //     iconBgColor: "#0596691A",
    //     path: "leave-policy",
    //     disabled: false,
    // },
];

export default function PayrollOverview({ isEmbedded = false, onBack }) {
    const navigate = useNavigate();

    // Mock data for dashboard statistics
    const dashboardStats = [
        {
            title: "Total Employees",
            value: "156",
            change: "+12",
            trend: "up",
            icon: PeopleIcon,
            color: "#8600BB",
            bgColor: "#f9f4fc",
        },
        {
            title: "This Month Payroll",
            value: "₹45,23,000",
            change: "+8.2%",
            trend: "up",
            icon: AccountBalanceWalletIcon,
            color: "#2563EB",
            bgColor: "#EFF6FF",
        },
        {
            title: "Pending Approvals",
            value: "12",
            change: "-5",
            trend: "down",
            icon: TaskAltIcon,
            color: "#FF9800",
            bgColor: "#FFF4E6",
        },
        {
            title: "Compliance Status",
            value: "100%",
            change: "All Clear",
            trend: "neutral",
            icon: CheckCircleIcon,
            color: "#10B981",
            bgColor: "#ECFDF5",
        },
    ];

    const handleBackClick = () => {
        if (isEmbedded && onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    const containerSx = isEmbedded ? {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    } : {
        border: '1px solid #ccc',
        borderRadius: '20px',
        p: 2,
        height: '86vh',
        display: 'flex',
        flexDirection: 'column'
    };

    return (
        <Box sx={containerSx}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={handleBackClick} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '20px', fontWeight: '700' }}>
                        Payroll Management
                    </Typography>
                </Box>
                <Chip
                    icon={<CalendarTodayIcon />}
                    label={`${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`}
                    sx={{ fontWeight: 600 }}
                />
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Box sx={{overflowY:"auto"}}>
                {/* Dashboard Statistics Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {dashboardStats.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }} key={index}>
                                <Card sx={{
                                    border: `1px solid ${stat.color}30`,
                                    borderRadius: '12px',
                                    boxShadow: 'none',
                                    bgcolor: stat.bgColor,
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: `0 8px 20px ${stat.color}20`
                                    }
                                }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: '12px', color: stat.color, fontWeight: 600, mb: 1, opacity: 0.8 }}>
                                                    {stat.title}
                                                </Typography>
                                                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                                                    {stat.value}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {stat.trend === 'up' && <TrendingUpIcon sx={{ fontSize: 14, color: '#10B981' }} />}
                                                    {stat.trend === 'down' && <TrendingDownIcon sx={{ fontSize: 14, color: '#EF4444' }} />}
                                                    <Typography sx={{
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        color: stat.trend === 'up' ? '#10B981' : stat.trend === 'down' ? '#EF4444' : '#6B7280'
                                                    }}>
                                                        {stat.change}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '12px',
                                                bgcolor: `${stat.color}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `2px solid ${stat.color}40`
                                            }}>
                                                <IconComponent sx={{ color: stat.color, fontSize: 24 }} />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                <Typography sx={{ fontSize: '20px', fontWeight: '700', pb: 2 }}>
                    Payroll Management Modules
                </Typography>

                {/* Payroll Module Cards */}
                <Box sx={{ flex: 1 }}>
                    <Grid container spacing={2.5}>
                        {payrollModules.map((module, index) => {
                            const ModuleIcon = module.icon;
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={index}>
                                    <Card
                                        onClick={() => !module.disabled && navigate(module.path)}
                                        sx={{
                                            border: `1px solid ${module.color}20`,
                                            borderRadius: '12px',
                                            boxShadow: 'none',
                                            bgcolor: module.bgColor,
                                            cursor: module.disabled ? 'not-allowed' : 'pointer',
                                            opacity: module.disabled ? 0.6 : 1,
                                            transition: 'all 0.3s',
                                            height: '100%',
                                            '&:hover': {
                                                transform: module.disabled ? 'none' : 'translateY(-6px)',
                                                boxShadow: module.disabled ? 'none' : `0 8px 24px ${module.color}30`,
                                                borderColor: module.disabled ? `${module.color}20` : module.color,
                                                '& .module-arrow': {
                                                    opacity: module.disabled ? 0 : 1,
                                                    transform: module.disabled ? 'translateX(0)' : 'translateX(4px)'
                                                }
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                                <Box sx={{
                                                    width: 52,
                                                    height: 52,
                                                    borderRadius: '12px',
                                                    bgcolor: module.iconBgColor,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: `2px solid ${module.color}`
                                                }}>
                                                    <ModuleIcon sx={{ fontSize: 28, color: module.color }} />
                                                </Box>
                                                <ArrowForwardIcon
                                                    className="module-arrow"
                                                    sx={{
                                                        fontSize: 22,
                                                        color: module.color,
                                                        opacity: 0,
                                                        transition: 'all 0.3s'
                                                    }}
                                                />
                                            </Box>
                                            <Typography sx={{
                                                fontSize: '16px',
                                                fontWeight: 700,
                                                color: '#111827',
                                                mb: 1.5,
                                                lineHeight: 1.3
                                            }}>
                                                {module.text}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: '13px',
                                                color: '#6B7280',
                                                lineHeight: 1.6,
                                                flex: 1
                                            }}>
                                                {module.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}
