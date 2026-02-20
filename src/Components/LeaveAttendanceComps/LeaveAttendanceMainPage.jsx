import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Tabs,
    Tab,
    Divider,
    Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Import existing page components
import StaffAttendanceOverviewPage from './StaffAttendanceOverviewPage';
import LeaveManagementPage from './LeaveManagementPage';
import ApprovalWorkflowPage from './ApprovalWorkflowPage';
import AttendanceReportsPage from './AttendanceReportsPage';

// Import the attendance dashboard content from LeaveAttendancePage
import LeaveAttendancePage from './LeaveAttendancePage';
import AddAttendancePage from './AddAttendancePage';

// Module cards configuration
const moduleCards = [
    {
        color: "#F97316",
        icon: EventNoteIcon,
        text: "Leave & Attendance",
        bgColor: "#FFF5F2",
        iconBgColor: "#FF6B351A",
        moduleIndex: 0,
        disabled: false,
    },
    {
        color: "#2563EB",
        icon: AccountBalanceIcon,
        text: "Payroll Management",
        bgColor: "#EFF6FF",
        iconBgColor: "#2563EB1A",
        moduleIndex: 1,
        disabled: false,
    },
];

export default function LeaveAttendanceMainPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const isLeaveAttendancePath = location.pathname.endsWith('/leave-attendance');
    const [moduleTab, setModuleTab] = useState(isLeaveAttendancePath ? 0 : (location.state?.moduleTab ?? null)); // null: show cards, 0: Leave, 1: Payroll
    const [tabValue, setTabValue] = useState(0);

    const handleModuleCardClick = (moduleIndex) => {
        if (moduleIndex === 1) {
            // Navigate to separate Payroll route
            navigate('payroll');
        } else if (moduleIndex === 0) {
            // Navigate to dedicated Leave & Attendance route so refresh persists
            navigate('leave-attendance');
        } else {
            setModuleTab(moduleIndex);
            setTabValue(0);
        }
    };

    const handleBackToCards = () => {
        if (isLeaveAttendancePath) {
            navigate(-1);
        } else {
            setModuleTab(null);
            setTabValue(0);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Render content based on selected tab (only for Leave & Attendance module)
    const renderTabContent = () => {
        // Leave & Attendance Module tabs
        switch (tabValue) {
            case 0:
                return <LeaveAttendancePage isEmbedded={true} onGoToAddAttendance={() => setTabValue(1)} onGoToApprovalWorkflow={() => setTabValue(4)} />;
            case 1:
                return <AddAttendancePage />;
            case 2:
                return <StaffAttendanceOverviewPage isEmbedded={true} />;
            case 3:
                return <LeaveManagementPage isEmbedded={true} onGoToApprovalWorkflow={() => setTabValue(4)} />;
            case 4:
                return <ApprovalWorkflowPage isEmbedded={true} />;
            case 5:
                return <AttendanceReportsPage isEmbedded={true} />;
            default:
                return <LeaveAttendancePage isEmbedded={true} />;
        }
    };

    return (
        <Box sx={{
            border: '1px solid #ccc',
            borderRadius: '20px',
            p: 2,
            height: '86vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FAFAFA'
        }}>
            {/* Header */}
            <Box sx={{ flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Typography sx={{ fontSize: "20px", fontWeight: "600" }}>
                        Leave & Payroll Management
                    </Typography>
                </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Fixed Tabs Navigation - Only show for Leave & Attendance module */}
                    {moduleTab === 0 && (
                        <Box sx={{ borderBottom: '1px solid #E8E8E8', mb: 1.5 }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    minHeight: '40px',
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#666',
                                        minHeight: '40px',
                                        px: 2.5,
                                        py: 1
                                    },
                                    '& .Mui-selected': {
                                        color: '#F97316 !important'
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#F97316',
                                        height: '2px',
                                        borderRadius: '2px 2px 0 0'
                                    }
                                }}
                            >
                                <Tab label="Attendance Dashboard" />
                                <Tab label="Add Attendance" />
                                <Tab label="Staff Attendance Overview" />
                                <Tab label="Leave Management" />
                                <Tab label="Leave Approval" />
                                <Tab label="Reports" />
                            </Tabs>
                        </Box>
                    )}
            </Box>

            {/* Dynamic Content Area */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {moduleTab === null ? (
                    // Show module cards when no module is selected
                    <Grid container spacing={2}>
                        {moduleCards.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <Grid
                                    sx={{ display: "flex", justifyContent: "center", pb: 6, mb: 1, mt: 3 }}
                                    key={index}
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 3,
                                        lg: 3
                                    }}
                                >
                                    <Box
                                        onClick={() => !item.disabled && handleModuleCardClick(item.moduleIndex)}
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
                                            textDecoration: 'none',
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
                                        <Grid container spacing={1} sx={{ height: '100%', px: 2 }}>
                                            <Grid
                                                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                size={{ md: 0.5 }}
                                            >
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
                                                size={{ md: 2 }}
                                            >
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
                                                    <IconComponent sx={{ color: item.color, fontSize: "23px" }} />
                                                </Box>
                                            </Grid>
                                            <Grid
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                                size={{ md: 7 }}
                                            >
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
                                                size={{ md: 2 }}
                                            >
                                                <ArrowForwardIcon className="arrowIcon" sx={{
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s ease',
                                                    color: item.color,
                                                }} />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    // Show module content when a module is selected
                    renderTabContent()
                )}
            </Box>
        </Box>
    );
}
