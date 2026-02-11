import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Tabs,
    Tab,
    Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';

// Import existing page components
import StaffAttendanceOverviewPage from './StaffAttendanceOverviewPage';
import LeaveManagementPage from './LeaveManagementPage';
import ApprovalWorkflowPage from './ApprovalWorkflowPage';
import AttendanceReportsPage from './AttendanceReportsPage';

// Import the attendance dashboard content from LeaveAttendancePage
import LeaveAttendancePage from './LeaveAttendancePage';
import PayrollOverview from './PayrollComps/PayrollOverview';

export default function LeaveAttendanceMainPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [moduleTab, setModuleTab] = useState(location.state?.moduleTab ?? 0); // 0: Leave, 1: Payroll
    const [tabValue, setTabValue] = useState(0);

    const handleModuleTabChange = (event, newValue) => {
        setModuleTab(newValue);
        setTabValue(0); // Reset sub-tab when switching modules
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Render content based on selected module and tab
    const renderTabContent = () => {
        if (moduleTab === 0) {
            // Leave & Attendance Module
            switch (tabValue) {
                case 0:
                    return <LeaveAttendancePage isEmbedded={true} />;
                case 1:
                    return <StaffAttendanceOverviewPage isEmbedded={true} />;
                case 2:
                    return <LeaveManagementPage isEmbedded={true} />;
                case 3:
                    return <ApprovalWorkflowPage isEmbedded={true} />;
                case 4:
                    return <AttendanceReportsPage isEmbedded={true} />;
                default:
                    return <LeaveAttendancePage isEmbedded={true} />;
            }
        } else {
            
            return <PayrollOverview />;
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
            {/* Fixed Header - Always Visible */}
            <Box sx={{ flexShrink: 0 }}>
                {/* Back Button + Module Selector Tabs - Same Line */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            
                  

                    {/* Module Selector Tabs - Leave & Payroll */}
                    <Box sx={{
                        display: 'flex',
                        gap: 1.5,
                        flex: 1,
                        bgcolor: '#F5F5F5',
                        p: 0.8,
                        borderRadius: '10px'
                    }}>
                        {/* Leave & Attendance Tab */}
                        <Box
                            onClick={() => handleModuleTabChange(null, 0)}
                            sx={{
                                flex: 1,
                                p: 1.5,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                bgcolor: moduleTab === 0 ? '#FFF5F2' : 'transparent',
                                border: moduleTab === 0 ? '2px solid #F97316' : '2px solid transparent',
                                '&:hover': {
                                    bgcolor: moduleTab === 0 ? '#FFF5F2' : '#ECECEC',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '6px',
                                    bgcolor: '#FF6B351A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Typography sx={{ fontSize: '18px' }}>📋</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: moduleTab === 0 ? '#F97316' : '#1a1a1a',
                                        mb: 0.2
                                    }}>
                                        Leave & Attendance
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '11px',
                                        color: '#666',
                                        lineHeight: 1.2
                                    }}>
                                        Track attendance and manage leaves
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Payroll Management Tab */}
                        <Box
                            onClick={() => handleModuleTabChange(null, 1)}
                            sx={{
                                flex: 1,
                                p: 1.5,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                bgcolor: moduleTab === 1 ? '#EFF6FF' : 'transparent',
                                border: moduleTab === 1 ? '2px solid #2563EB' : '2px solid transparent',
                                '&:hover': {
                                    bgcolor: moduleTab === 1 ? '#EFF6FF' : '#ECECEC',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '6px',
                                    bgcolor: '#2563EB1A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Typography sx={{ fontSize: '18px' }}>💼</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: moduleTab === 1 ? '#2563EB' : '#1a1a1a',
                                        mb: 0.2
                                    }}>
                                        Payroll Management
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '11px',
                                        color: '#666',
                                        lineHeight: 1.2
                                    }}>
                                        Manage salaries and payroll processing
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* Fixed Tabs Navigation - Only show for Leave & Attendance */}
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
                            <Tab label="Staff Attendance Overview" />
                            <Tab label="Leave Management" />
                            <Tab label="Approval Workflow" />
                            <Tab label="Reports" />
                        </Tabs>
                    </Box>
                )}
            </Box>

            {/* Dynamic Content Area - Only This Changes */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {renderTabContent()}
            </Box>
        </Box>
    );
}
