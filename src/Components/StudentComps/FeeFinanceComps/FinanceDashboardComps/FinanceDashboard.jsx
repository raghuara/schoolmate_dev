import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Grid,
    Divider,
    Select,
    TextField,
    Tabs,
    Tab,
    Autocomplete,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TodayIcon from '@mui/icons-material/Today';
import WarningIcon from '@mui/icons-material/Warning';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWebsiteSettings } from '../../../../Redux/Slices/websiteSettingsSlice';
import { selectGrades } from '../../../../Redux/Slices/DropdownController';

import OverviewTab from './OverviewTab';
import TodaysCollectionTab from './TodaysCollectionTab';
import CashCollectionTab from './CashCollectionTab';
import ClasswiseCollectionTab from './ClasswiseCollectionTab';
import DefaultersTab from './DefaultersTab';
import ExpensesTab from './ExpensesTab';
import FeeReportTab from './FeeReportTab';

export default function FinanceDashboard() {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('month');
    const [tabValue, setTabValue] = useState(0);
    const [value, setValue] = useState(0);
    const grades = useSelector(selectGrades);

    const today = new Date().toISOString().split('T')[0];
    const [cashDate, setCashDate] = useState(today);
    const [denominations, setDenominations] = useState({
        2000: 5, 500: 12, 200: 8, 100: 15, 50: 6, 20: 4, 10: 3, 5: 2, 2: 0, 1: 0
    });
    const currentYear = new Date().getFullYear();
    const currentAcademicYear = `${currentYear}-${currentYear + 1}`;
    const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
    const websiteSettings = useSelector(selectWebsiteSettings);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const academicYears = [
        `${currentYear - 2}-${currentYear - 1}`,
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
    ];

    const paymentMethodData = [
        { method: 'Online Payment', value: 2800000, percentage: 45, color: '#0891B2' },
        { method: 'Cash', value: 1850000, percentage: 30, color: '#22C55E' },
        { method: 'Cheque', value: 950000, percentage: 15, color: '#F97316' },
        { method: 'Bank Transfer', value: 600000, percentage: 10, color: '#7C3AED' },
    ];

    // Mock data for defaulters by grade

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
        // Today's cash transactions (dummy data for Cash Collection tab)
        { id: 'TXN009', student: 'Arjun Sharma', grade: 'Grade 6-A', amount: 14000, type: 'School Fee', status: 'Completed', date: today, time: '09:05 AM', method: 'Cash' },
        { id: 'TXN010', student: 'Priya Nair', grade: 'Grade 4-B', amount: 6500, type: 'Transport Fee', status: 'Completed', date: today, time: '09:40 AM', method: 'Cash' },
        { id: 'TXN011', student: 'Rohan Verma', grade: 'Grade 8-C', amount: 12000, type: 'School Fee', status: 'Pending', date: today, time: '10:15 AM', method: 'Cash' },
        { id: 'TXN012', student: 'Sneha Pillai', grade: 'Grade 2-A', amount: 4500, type: 'ECA Fee', status: 'Completed', date: today, time: '11:00 AM', method: 'Cash' },
        { id: 'TXN013', student: 'Karan Mehta', grade: 'Grade 7-B', amount: 9000, type: 'School Fee', status: 'Completed', date: today, time: '11:30 AM', method: 'Cash' },
        { id: 'TXN014', student: 'Divya Reddy', grade: 'Grade 1-C', amount: 5500, type: 'Additional Fee', status: 'Pending', date: today, time: '12:10 PM', method: 'Cash' },
        { id: 'TXN015', student: 'Aditya Kumar', grade: 'Grade 9-A', amount: 16000, type: 'School Fee', status: 'Completed', date: today, time: '01:20 PM', method: 'Cash' },
        { id: 'TXN016', student: 'Meera Iyer', grade: 'Grade 3-A', amount: 7000, type: 'Transport Fee', status: 'Completed', date: today, time: '02:00 PM', method: 'Cash' },
    ];

    // Mock data for top performing classes
    const topPerformingClasses = [
        { class: 'Grade 10-A', collectionRate: 98, amount: 485000, students: 45 },
        { class: 'Grade 5-B', collectionRate: 96, amount: 472000, students: 48 },
        { class: 'Grade 8-A', collectionRate: 94, amount: 461000, students: 47 },
        { class: 'Grade 3-C', collectionRate: 93, amount: 448000, students: 46 },
        { class: 'Grade 9-A', collectionRate: 92, amount: 442000, students: 46 },
    ];



    // Calculate collection percentage for grades
    const getCollectionPercentage = (collected, total) => {
        return ((collected / total) * 100).toFixed(1);
    };

    return (
        <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '8px', p: 1, height: '86vh', overflow: 'hidden', bgcolor: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
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
                <Autocomplete
                    size="small"
                    options={academicYears}
                    sx={{ width: "170px" }}
                    value={selectedYear}
                    onChange={(e, newValue) => setSelectedYear(newValue)}
                    renderInput={(params) => (
                        <TextField
                            placeholder="Select Academic Year"
                            {...params}
                            variant="outlined"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "5px",
                                    fontSize: 14,
                                    height: 35,
                                },
                                "& .MuiOutlinedInput-input": {
                                    textAlign: "center",
                                    fontWeight: "600"
                                },
                            }}
                        />
                    )}
                />
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "center", px: 2 }}>
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
                            icon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Expenses"
                        />
                        <Tab
                            icon={<AssessmentIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Fee Report"
                        />
                    </Tabs>
                </Box>
            </Box>

            {/* Scrollable Tab Content */}
            <Box sx={{
                flex: 1, overflowY: 'auto', px: 1, pt: 1,
                '&::-webkit-scrollbar': { width: '5px' },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#D0D0D0', borderRadius: '10px' },
            }}>

                {/* Tab Panel 0: Overview */}
                {value === 0 && (
                    <OverviewTab selectedYear={selectedYear} />
                )}

                {/* Tab Panel 1: Today's Collection */}
                {value === 1 && (
                    <TodaysCollectionTab />
                )}

                {/* Tab Panel 2: Cash Collection */}
                {value === 2 && (
                    <CashCollectionTab
                        cashDate={cashDate}
                        setCashDate={setCashDate}
                        selectedYear={selectedYear}
                    />
                )}

                {/* Tab Panel 3: Classwise Collection */}
                {value === 3 && (
                    <ClasswiseCollectionTab selectedYear={selectedYear} />
                )}

                {/* Tab Panel 4: Defaulters */}
                {value === 4 && (
                    <DefaultersTab selectedYear={selectedYear} />
                )}

                {/* Tab Panel 5: Expenses */}
                {value === 5 && (
                    <ExpensesTab />
                )}

                {/* Tab Panel 6: Fee Report */}
                {value === 6 && (
                    <FeeReportTab />
                )}

            </Box>
        </Box>
    );
}
