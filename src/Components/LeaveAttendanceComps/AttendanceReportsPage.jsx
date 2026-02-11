import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    IconButton,
    Button,
    Chip,
    Divider,
    Select,
    MenuItem,
    Tabs,
    Tab,
    TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';

// Mock data for report types
const reportTypes = [
    {
        id: 1,
        title: "Monthly Attendance Report",
        description: "Comprehensive monthly attendance summary for all staff",
        icon: CalendarMonthIcon,
        color: "#3B82F6",
        bgColor: "#EFF6FF"
    },
    {
        id: 2,
        title: "Individual Staff Report",
        description: "Detailed attendance report for specific staff member",
        icon: PersonIcon,
        color: "#22C55E",
        bgColor: "#F0FDF4"
    },
    {
        id: 3,
        title: "Department-wise Report",
        description: "Attendance analysis by department",
        icon: AssessmentIcon,
        color: "#F97316",
        bgColor: "#FFF7ED"
    },
    {
        id: 4,
        title: "Leave Summary Report",
        description: "Summary of all leave applications and balances",
        icon: EventIcon,
        color: "#8B5CF6",
        bgColor: "#F5F3FF"
    },
    {
        id: 5,
        title: "Latecomer Report",
        description: "List of staff members with late arrivals",
        icon: AccessTimeIcon,
        color: "#DC2626",
        bgColor: "#FEF2F2"
    },
    {
        id: 6,
        title: "Overtime Report",
        description: "Staff overtime hours and analysis",
        icon: TrendingUpIcon,
        color: "#0891B2",
        bgColor: "#CFFAFE"
    }
];

export default function AttendanceReportsPage({ isEmbedded = false }) {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(4); // Reports tab (updated to tab 4)
    const [selectedReport, setSelectedReport] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [filterDept, setFilterDept] = useState("All Dept");
    const [filterStaff, setFilterStaff] = useState("All Staff");

    const handleTabChange = (event, newValue) => {
        switch(newValue) {
            case 0:
                navigate('/dashboardmenu/Leave'); // Attendance Dashboard
                break;
            case 1:
                navigate('/dashboardmenu/Leave/staff-attendance-overview'); // Staff Attendance Overview
                break;
            case 2:
                navigate('/dashboardmenu/Leave/leave-management'); // Leave Management
                break;
            case 3:
                navigate('/dashboardmenu/Leave/approval-workflow'); // Approval Workflow
                break;
            case 4:
                setTabValue(4); // Reports (current page)
                break;
            default:
                setTabValue(4);
                break;
        }
    };

    const handleGenerateReport = () => {
        if (!selectedReport) {
            alert('Please select a report type');
            return;
        }
        console.log('Generating report:', {
            reportType: selectedReport,
            fromDate,
            toDate,
            department: filterDept,
            staff: filterStaff
        });
        alert('Report generation will be implemented with actual API integration');
    };

    const handlePrintReport = () => {
        window.print();
    };

    const handleExportReport = (format) => {
        alert(`Exporting report as ${format.toUpperCase()}`);
    };

    return (
        <Box sx={{
            border: isEmbedded ? 'none' : '1px solid #ccc',
            borderRadius: isEmbedded ? '0' : '20px',
            p: isEmbedded ? 0 : 2,
            height: isEmbedded ? 'auto' : '86vh',
            overflow: 'auto',
            bgcolor: '#FAFAFA'
        }}>
            {/* Header - Hidden when embedded */}
            {!isEmbedded && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ width: '35px', height: '35px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: '#000' }} />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a' }}>
                            Attendance Reports
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: '#666', mt: 0.5 }}>
                            Generate and export attendance reports
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<PrintIcon />}
                        variant="outlined"
                        onClick={handlePrintReport}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '50px',
                            border: '1px solid #333',
                            color: '#333',
                            fontSize: '13px',
                            fontWeight: '600',
                            px: 2.5,
                            '&:hover': {
                                border: '1px solid #000',
                                bgcolor: '#F5F5F5'
                            }
                        }}
                    >
                        Print
                    </Button>
                </Box>
            </Box>
            )}

            {/* Tabs - Hidden when embedded */}
            {!isEmbedded && (
            <Box sx={{ borderBottom: '1px solid #E8E8E8', mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#666',
                            minHeight: '40px',
                            px: 2
                        },
                        '& .Mui-selected': {
                            color: '#F97316 !important'
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#F97316',
                            height: '3px'
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

            <Grid container spacing={2}>
                {/* Main Content */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    {/* Report Selection */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 3 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', mb: 2 }}>
                                Select Report Type
                            </Typography>

                            <Grid container spacing={2}>
                                {reportTypes.map((report) => (
                                    <Grid key={report.id} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                                        <Card
                                            onClick={() => setSelectedReport(report.title)}
                                            sx={{
                                                border: selectedReport === report.title ? `2px solid ${report.color}` : '1px solid #E8E8E8',
                                                borderRadius: '8px',
                                                boxShadow: 'none',
                                                bgcolor: selectedReport === report.title ? report.bgColor : '#fff',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                    borderColor: report.color
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '12px',
                                                        bgcolor: report.bgColor,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mx: 'auto',
                                                        mb: 1.5
                                                    }}
                                                >
                                                    <report.icon sx={{ color: report.color, fontSize: 28 }} />
                                                </Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', mb: 0.5 }}>
                                                    {report.title}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#666' }}>
                                                    {report.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Report Configuration */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none' }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', mb: 2 }}>
                                Report Configuration
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Date Range */}
                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#666', mb: 1 }}>
                                        From Date
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#666', mb: 1 }}>
                                        To Date
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                            },
                                        }}
                                    />
                                </Grid>

                                {/* Filters */}
                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#666', mb: 1 }}>
                                        Department
                                    </Typography>
                                    <Select
                                        fullWidth
                                        value={filterDept}
                                        onChange={(e) => setFilterDept(e.target.value)}
                                        size="small"
                                        sx={{
                                            borderRadius: '8px',
                                        }}
                                    >
                                        <MenuItem value="All Dept">All Departments</MenuItem>
                                        <MenuItem value="Mathematics">Mathematics</MenuItem>
                                        <MenuItem value="Science">Science</MenuItem>
                                        <MenuItem value="English">English</MenuItem>
                                        <MenuItem value="Marketing">Marketing</MenuItem>
                                    </Select>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#666', mb: 1 }}>
                                        Staff Category
                                    </Typography>
                                    <Select
                                        fullWidth
                                        value={filterStaff}
                                        onChange={(e) => setFilterStaff(e.target.value)}
                                        size="small"
                                        sx={{
                                            borderRadius: '8px',
                                        }}
                                    >
                                        <MenuItem value="All Staff">All Staff</MenuItem>
                                        <MenuItem value="Teaching">Teaching Staff</MenuItem>
                                        <MenuItem value="Non-Teaching">Non-Teaching Staff</MenuItem>
                                        <MenuItem value="Administrative">Administrative</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Generate Button */}
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AssessmentIcon />}
                                    onClick={handleGenerateReport}
                                    disabled={!selectedReport}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '50px',
                                        bgcolor: '#F97316',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': {
                                            bgcolor: '#EA580C'
                                        },
                                        '&:disabled': {
                                            bgcolor: '#E8E8E8',
                                            color: '#999'
                                        }
                                    }}
                                >
                                    Generate Report
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Side Panel */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    {/* Export Options */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none', mb: 2 }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', mb: 2 }}>
                                Export Options
                            </Typography>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => handleExportReport('pdf')}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#DC2626',
                                    borderColor: '#DC2626',
                                    borderRadius: '8px',
                                    mb: 1.5,
                                    py: 1.5,
                                    '&:hover': {
                                        borderColor: '#B91C1C',
                                        bgcolor: '#FEF2F2'
                                    }
                                }}
                            >
                                Export as PDF
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => handleExportReport('excel')}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#22C55E',
                                    borderColor: '#22C55E',
                                    borderRadius: '8px',
                                    mb: 1.5,
                                    py: 1.5,
                                    '&:hover': {
                                        borderColor: '#16A34A',
                                        bgcolor: '#F0FDF4'
                                    }
                                }}
                            >
                                Export as Excel
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => handleExportReport('csv')}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#3B82F6',
                                    borderColor: '#3B82F6',
                                    borderRadius: '8px',
                                    py: 1.5,
                                    '&:hover': {
                                        borderColor: '#2563EB',
                                        bgcolor: '#EFF6FF'
                                    }
                                }}
                            >
                                Export as CSV
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recent Reports */}
                    <Card sx={{ border: '1px solid #E8E8E8', borderRadius: '4px', boxShadow: 'none' }}>
                        <CardContent>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', mb: 2 }}>
                                Recent Reports
                            </Typography>

                            <Box sx={{ mb: 2, p: 1.5, borderRadius: '8px', border: '1px solid #E8E8E8', '&:hover': { bgcolor: '#F9FAFB' } }}>
                                <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', mb: 0.5 }}>
                                    Monthly Attendance - January
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                    Generated on Feb 1, 2026
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2, p: 1.5, borderRadius: '8px', border: '1px solid #E8E8E8', '&:hover': { bgcolor: '#F9FAFB' } }}>
                                <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', mb: 0.5 }}>
                                    Leave Summary - Q4 2025
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                    Generated on Jan 15, 2026
                                </Typography>
                            </Box>

                            <Box sx={{ p: 1.5, borderRadius: '8px', border: '1px solid #E8E8E8', '&:hover': { bgcolor: '#F9FAFB' } }}>
                                <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', mb: 0.5 }}>
                                    Department-wise Report
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                    Generated on Jan 10, 2026
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
