import React, { useState } from 'react';
import { findSubMenuPermissions } from '../../../../Redux/Slices/AuthSlice';
import { selectAcademicYear } from "../../../../Redux/Slices/academicYearSlice";
import { Box, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TodayIcon from '@mui/icons-material/Today';
import WarningIcon from '@mui/icons-material/Warning';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DASH, RADIUS, PageHeader } from '../../../DashBoardComps/dashboardTheme';

import OverviewTab from './OverviewTab';
import TodaysCollectionTab from './TodaysCollectionTab';
import CashCollectionTab from './CashCollectionTab';
import ClasswiseCollectionTab from './ClasswiseCollectionTab';
import DefaultersTab from './DefaultersTab';
import ExpensesTab from './ExpensesTab';
import FeeReportTab from './FeeReportTab';

export default function FinanceDashboard() {
    const navigate = useNavigate();
    const [value, setValue] = useState(0);

    const today = new Date().toISOString().split('T')[0];
    const [cashDate, setCashDate] = useState(today);
    // The academic year comes from the header - one picker for the whole site.
    const selectedYear = useSelector(selectAcademicYear);

    // Fee Report is a separate grant on top of being able to open the dashboard.
    const user = useSelector((state) => state.auth);
    const dashPerms = findSubMenuPermissions(user.permissions, "feeandfinance", "financedashboard") || {};
    const rbacReady = (user.permissions?.mainMenus || []).length > 0;
    const canReportTab = !rbacReady || dashPerms.allowreporttab === "Y";

    // Every tab in one place: what it is called, what it renders, and whether
    // this role is allowed it. Fee Report is the only conditional one today.
    const TABS = [
        { key: 'overview', label: 'Overview', Icon: DashboardIcon, render: () => <OverviewTab selectedYear={selectedYear} /> },
        { key: 'today', label: "Today's Collection", Icon: TodayIcon, render: () => <TodaysCollectionTab /> },
        { key: 'cash', label: 'Cash Collection', Icon: MonetizationOnIcon, render: () => <CashCollectionTab cashDate={cashDate} setCashDate={setCashDate} selectedYear={selectedYear} /> },
        { key: 'classwise', label: 'Classwise Collection', Icon: SchoolIcon, render: () => <ClasswiseCollectionTab selectedYear={selectedYear} /> },
        { key: 'defaulters', label: 'Defaulters', Icon: WarningIcon, render: () => <DefaultersTab selectedYear={selectedYear} /> },
        { key: 'expenses', label: 'Expenses', Icon: AccountBalanceWalletIcon, render: () => <ExpensesTab /> },
        { key: 'report', label: 'Fee Report', Icon: AssessmentIcon, render: () => <FeeReportTab />, allowed: canReportTab },
    ];
    const visibleTabs = TABS.filter((t) => t.allowed !== false);

    // If the selected tab is no longer in the list, fall back to the first one
    // rather than rendering an empty panel.
    const activeTab = Math.min(value, visibleTabs.length - 1);
    // Note: clamped for rendering only - no state write during render.

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: 4,
                bgcolor: DASH.canvas,
                minHeight: "100%",
                boxSizing: "border-box",
            }}
        >
            <PageHeader
                title="Finance Dashboard"
                subtitle={`Academic year ${selectedYear} - collections, dues and expenses`}
                onBack={() => navigate(-1)}
            />

            {/* Segmented control - the same treatment the chapter and book views
               use, so a tab strip reads the same wherever it appears. */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    p: 0.5,
                    mb: 2,
                    bgcolor: DASH.lineSoft,
                    border: `1px solid ${DASH.line}`,
                    borderRadius: RADIUS,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                {visibleTabs.map((t, index) => {
                    const active = index === activeTab;
                    return (
                        <Box
                            key={t.key}
                            onClick={() => setValue(index)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.7,
                                flexShrink: 0,
                                height: 32,
                                px: 1.4,
                                borderRadius: RADIUS,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                bgcolor: active ? '#fff' : 'transparent',
                                border: `1px solid ${active ? DASH.line : 'transparent'}`,
                                boxShadow: active ? '0 1px 3px rgba(17,24,39,0.12)' : 'none',
                                transition: 'background-color .15s ease, box-shadow .15s ease',
                                '&:hover': { bgcolor: active ? '#fff' : 'rgba(17,24,39,0.04)' },
                            }}
                        >
                            <t.Icon sx={{ fontSize: 16, color: active ? DASH.primary : DASH.faint }} />
                            <Typography
                                sx={{
                                    fontSize: '12.5px',
                                    fontWeight: active ? 700 : 600,
                                    color: active ? DASH.ink : DASH.muted,
                                }}
                            >
                                {t.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {visibleTabs[activeTab]?.render()}
        </Box>
    );
}
