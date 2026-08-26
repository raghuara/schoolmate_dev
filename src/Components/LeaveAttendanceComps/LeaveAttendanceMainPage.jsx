import React, { useState } from 'react';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PolicyIcon from '@mui/icons-material/Policy';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { findSubMenuPermissions } from '../../Redux/Slices/AuthSlice';
import { DASH, RADIUS, EmptyNote, ModuleCard, PageHeader, SectionTitle } from '../DashBoardComps/dashboardTheme';

import StaffAttendanceOverviewPage from './StaffAttendanceOverviewPage';
import LeaveManagementPage from './LeaveManagementPage';
import ApprovalWorkflowPage from './ApprovalWorkflowPage';
import AttendanceReportsPage from './AttendanceReportsPage';
import LeaveAttendancePage from './LeaveAttendancePage';
import AddStaffAttendancePage from './AddStaffAttendancePage';

const MAIN_MENU = 'leaveandpayroll';
const ATTENDANCE_ACCESS = 'leaveandattendanceattendanceaccess';
const LEAVE_MANAGEMENT = 'leaveandattendanceleavemanagement';
const PAYROLL = 'payrollmanagement';
const TAB_ACCENT = '#F97316';

const moduleCards = [
    {
        accent: '#059669',
        icon: PolicyIcon,
        text: 'Leave Policy Master',
        description: 'Configure leave types, attendance bonus and deduction rules.',
        path: 'payroll/leave-policy/leave-master',
        access: [
            { subMenu: 'leavepolicymasterpolicysetup', needs: ['view', 'create', 'edit'] },
            { subMenu: 'leavepolicymasterleavetypes', needs: ['view', 'create', 'edit'] },
            { subMenu: 'leavepolicymasterworkingcalendar', needs: ['view', 'create', 'edit'] },
        ],
        links: [
            {
                label: 'Policy Setup',
                path: 'payroll/leave-policy/leave-master',
                state: { value: 'Y', activeTab: 0 },
                subMenu: 'leavepolicymasterpolicysetup',
                needs: ['view', 'create', 'edit'],
            },
            {
                label: 'Leave Types',
                path: 'payroll/leave-policy/leave-master',
                state: { value: 'Y', activeTab: 1 },
                subMenu: 'leavepolicymasterleavetypes',
                needs: ['view', 'create', 'edit'],
            },
            {
                label: 'Working Calendar',
                path: 'payroll/leave-policy/leave-master',
                state: { value: 'Y', activeTab: 2 },
                subMenu: 'leavepolicymasterworkingcalendar',
                needs: ['view', 'create', 'edit'],
            },
        ],
    },
    {
        accent: TAB_ACCENT,
        icon: EventNoteIcon,
        text: 'Leave & Attendance',
        description: 'Daily attendance, leave requests, approvals and reports.',
        path: 'leave-attendance',
        access: [
            { subMenu: ATTENDANCE_ACCESS, needs: ['allowdashboardview', 'allowaddattendance', 'allowoverview', 'allowreports'] },
            { subMenu: LEAVE_MANAGEMENT, needs: ['allowleavedetails'] },
        ],
        links: [
            {
                label: 'Add Attendance',
                path: 'leave-attendance',
                state: { value: 'Y', tabValue: 1 },
                subMenu: ATTENDANCE_ACCESS,
                needs: ['allowaddattendance'],
            },
            {
                label: 'Leave Management',
                path: 'leave-attendance',
                state: { value: 'Y', tabValue: 4 },
                subMenu: LEAVE_MANAGEMENT,
                needs: ['allowleavedetails'],
            },
            {
                label: 'Reports',
                path: 'leave-attendance',
                state: { value: 'Y', tabValue: 5 },
                subMenu: ATTENDANCE_ACCESS,
                needs: ['allowreports'],
            },
        ],
    },
    {
        accent: '#2563EB',
        icon: AccountBalanceIcon,
        text: 'Payroll Management',
        description: 'Salary structures, statutory compliance and payroll runs.',
        path: 'payroll',
        access: [{ subMenu: PAYROLL, needs: ['view', 'create', 'edit', 'delete'] }],
        links: [
            {
                label: 'Salary Structures',
                path: 'payroll/salary-structures',
                subMenu: PAYROLL,
                needs: ['view', 'create', 'edit'],
            },
            {
                label: 'Run Payroll',
                path: 'payroll/approve-payroll',
                subMenu: PAYROLL,
                needs: ['create', 'edit'],
            },
            {
                label: 'Salary Register',
                path: 'payroll/salary-register',
                subMenu: PAYROLL,
                needs: ['view'],
            },
        ],
    },
];

const attendanceTabs = [
    { value: 0, label: 'Attendance Dashboard', subMenu: ATTENDANCE_ACCESS, needs: ['allowdashboardview'] },
    { value: 1, label: 'Add Attendance', subMenu: ATTENDANCE_ACCESS, needs: ['allowaddattendance'] },
    { value: 2, label: 'Staff Attendance Overview', subMenu: ATTENDANCE_ACCESS, needs: ['allowoverview'] },
    { value: 3, label: 'Leave Management', subMenu: LEAVE_MANAGEMENT, needs: ['allowleavedetails'] },
    { value: 4, label: 'Leave Approval', subMenu: LEAVE_MANAGEMENT, needs: ['allowleavedetails'] },
    { value: 5, label: 'Reports', subMenu: ATTENDANCE_ACCESS, needs: ['allowreports'] },
];

export default function LeaveAttendanceMainPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state.auth);
    const isLeaveAttendancePath = location.pathname.endsWith('/leave-attendance');
    const [moduleTab, setModuleTab] = useState(
        isLeaveAttendancePath || location.state?.moduleTab === 0 ? 0 : null
    );
    const [tabValue, setTabValue] = useState(location.state?.tabValue ?? 0);

    const perms = user.permissions;
    const rbacReady = (perms?.mainMenus || []).length > 0;

    const granted = (subMenu, needs) => {
        if (!rbacReady) return true;
        const p = findSubMenuPermissions(perms, MAIN_MENU, subMenu);
        if (!p) return true;
        return needs.some((k) => p[k] === 'Y');
    };

    const visibleCards = moduleCards
        .filter((card) => card.access.some((a) => granted(a.subMenu, a.needs)))
        .map((card) => ({ ...card, links: card.links.filter((l) => granted(l.subMenu, l.needs)) }));

    const visibleTabs = attendanceTabs.filter((t) => granted(t.subMenu, t.needs));
    const activeTab = visibleTabs.some((t) => t.value === tabValue)
        ? tabValue
        : visibleTabs[0]?.value ?? 0;

    const handleBack = () => {
        if (moduleTab === null || isLeaveAttendancePath) {
            navigate(-1);
            return;
        }
        setModuleTab(null);
        setTabValue(0);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 1:
                return <AddStaffAttendancePage />;
            case 2:
                return <StaffAttendanceOverviewPage isEmbedded={true} />;
            case 3:
                return <LeaveManagementPage isEmbedded={true} onGoToApprovalWorkflow={() => setTabValue(4)} />;
            case 4:
                return <ApprovalWorkflowPage isEmbedded={true} />;
            case 5:
                return <AttendanceReportsPage isEmbedded={true} />;
            default:
                return (
                    <LeaveAttendancePage
                        isEmbedded={true}
                        onGoToAddAttendance={() => setTabValue(1)}
                        onGoToApprovalWorkflow={() => setTabValue(4)}
                    />
                );
        }
    };

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
                minHeight: '100%', boxSizing: 'border-box',
            }}
        >
            <PageHeader
                title="Leave & Payroll Management"
                subtitle={
                    moduleTab === 0
                        ? 'Daily attendance, leave requests and approvals'
                        : 'Attendance, leave policy and payroll records'
                }
                onBack={handleBack}
            />

            {moduleTab === 0 ? (
                <Box
                    sx={{
                        bgcolor: '#fff',
                        border: `1px solid ${DASH.line}`,
                        borderRadius: RADIUS,
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ borderBottom: `1px solid ${DASH.line}`, px: { xs: 0.5, md: 1 } }}>
                        <Tabs
                            value={activeTab}
                            onChange={(event, newValue) => setTabValue(newValue)}
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
                                    px: 2,
                                },
                                '& .Mui-selected': { color: `${TAB_ACCENT} !important` },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: TAB_ACCENT,
                                    height: '2px',
                                    borderRadius: '2px 2px 0 0',
                                },
                            }}
                        >
                            {visibleTabs.map((t) => (
                                <Tab key={t.value} value={t.value} label={t.label} />
                            ))}
                        </Tabs>
                    </Box>

                    <Box sx={{ p: { xs: 1.2, md: 1.8 } }}>
                        {visibleTabs.length === 0 ? (
                            <EmptyNote text="You do not have access to any attendance screen." />
                        ) : (
                            renderTabContent()
                        )}
                    </Box>
                </Box>
            ) : (
                <>
                    <SectionTitle icon={AppsIcon}>Modules</SectionTitle>

                    {visibleCards.length === 0 && (
                        <Box sx={{ bgcolor: '#fff', border: `1px solid ${DASH.line}`, borderRadius: RADIUS, p: 3 }}>
                            <EmptyNote text="You do not have access to leave or payroll records." />
                        </Box>
                    )}

                    <Grid container spacing={2} alignItems="stretch" sx={{ pb: 1 }}>
                        {visibleCards.map((item) => (
                            <Grid
                                key={item.text}
                                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                sx={{ display: 'flex' }}
                            >
                                <ModuleCard
                                    accent={item.accent}
                                    icon={item.icon}
                                    title={item.text}
                                    desc={item.description}
                                    to={item.path}
                                    links={item.links}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Box>
    );
}
