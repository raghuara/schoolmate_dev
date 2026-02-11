import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Avatar,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const StaffAttendanceOverviewPage = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [staffCategory, setStaffCategory] = useState('All Categories');
  const [timeRange, setTimeRange] = useState(1); // 0: Week, 1: Month, 2: Quarter, 3: Custom
  const [currentPage, setCurrentPage] = useState(1);
  const [liveTime, setLiveTime] = useState(new Date());
  const [tabValue, setTabValue] = useState(1);

  // Mock staff attendance data
  const staffAttendanceData = [
    {
      id: 1,
      name: 'John Smith',
      staffId: 'ST001',
      department: 'Mathematics',
      avatar: 'https://i.pravatar.cc/150?img=12',
      attendance: {
        '01': { time: '08:45', status: 'present' },
        '02': { time: '08:50', status: 'present' },
        '03': { time: '09:15', status: 'late' },
        '04': { time: '08:40', status: 'present' },
        '05': { time: '08:35', status: 'present' },
        '06': { time: '', status: 'weekend' },
        '07': { time: '', status: 'weekend' },
        '08': { time: '08:55', status: 'present' },
        '09': { time: '', status: 'leave' },
        '10': { time: '08:30', status: 'present' },
        '11': { time: '09:20', status: 'late' },
        '12': { time: '08:42', status: 'present' },
        '13': { time: '', status: 'weekend' },
        '14': { time: '', status: 'weekend' },
        '15': { time: '08:38', status: 'present' },
      },
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      staffId: 'ST002',
      department: 'Science',
      avatar: 'https://i.pravatar.cc/150?img=5',
      attendance: {
        '01': { time: '08:30', status: 'present' },
        '02': { time: '08:28', status: 'present' },
        '03': { time: '08:45', status: 'present' },
        '04': { time: '', status: 'absent' },
        '05': { time: '08:35', status: 'present' },
        '06': { time: '', status: 'weekend' },
        '07': { time: '', status: 'weekend' },
        '08': { time: '08:40', status: 'present' },
        '09': { time: '08:32', status: 'present' },
        '10': { time: '08:50', status: 'present' },
        '11': { time: '08:25', status: 'present' },
        '12': { time: '09:10', status: 'late' },
        '13': { time: '', status: 'weekend' },
        '14': { time: '', status: 'weekend' },
        '15': { time: '08:33', status: 'present' },
      },
    },
    {
      id: 3,
      name: 'Michael Brown',
      staffId: 'ST003',
      department: 'English',
      avatar: 'https://i.pravatar.cc/150?img=8',
      attendance: {
        '01': { time: '08:25', status: 'present' },
        '02': { time: '08:30', status: 'present' },
        '03': { time: '08:28', status: 'present' },
        '04': { time: '08:35', status: 'present' },
        '05': { time: '', status: 'leave' },
        '06': { time: '', status: 'weekend' },
        '07': { time: '', status: 'weekend' },
        '08': { time: '08:45', status: 'present' },
        '09': { time: '08:38', status: 'present' },
        '10': { time: '', status: 'absent' },
        '11': { time: '08:40', status: 'present' },
        '12': { time: '08:32', status: 'present' },
        '13': { time: '', status: 'weekend' },
        '14': { time: '', status: 'weekend' },
        '15': { time: '08:50', status: 'present' },
      },
    },
  ];

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic summary data based on actual attendance
  const getSummaryData = () => {
    const calculatedStats = calculateStats();
    return [
      {
        title: 'Total Working Days',
        value: `${calculatedStats.workingDays} Days`,
        subtitle: `In selected ${timeRange === 0 ? 'week' : timeRange === 1 ? 'period' : 'quarter'}`,
        icon: CalendarTodayIcon,
        color: '#3457D5',
        bgColor: '#E8EFFE',
      },
      {
        title: 'Avg. Attendance Rate',
        value: `${calculatedStats.attendanceRate}%`,
        subtitle: `${getFilteredStaffData().length} staff member${getFilteredStaffData().length !== 1 ? 's' : ''} tracked`,
        icon: TrendingUpIcon,
        color: '#7DC353',
        bgColor: '#F0F8EC',
      },
      {
        title: 'Avg. Punctuality',
        value: `${calculatedStats.punctualityRate}%`,
        subtitle: 'On-time arrivals',
        icon: CheckCircleIcon,
        color: calculatedStats.punctualityRate >= 90 ? '#7DC353' : calculatedStats.punctualityRate >= 75 ? '#FF9800' : '#f44336',
        bgColor: calculatedStats.punctualityRate >= 90 ? '#F0F8EC' : calculatedStats.punctualityRate >= 75 ? '#FFF8E1' : '#FFEBEE',
      },
      {
        title: 'Total Late/Absent',
        value: `${calculatedStats.totalLate + calculatedStats.totalAbsent}`,
        subtitle: `${calculatedStats.totalLate} late • ${calculatedStats.totalAbsent} absent`,
        icon: AccessTimeIcon,
        color: '#00ACC1',
        bgColor: '#E0F7FA',
      },
    ];
  };

  // Generate dates dynamically based on current month
  const generateDates = () => {
    const dates = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      dates.push({
        day: i.toString().padStart(2, '0'),
        dayOfWeek: dayOfWeek,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    return dates;
  };

  const dates = generateDates();

  // Helper function: Get current month and year
  const getCurrentMonthYear = () => {
    return liveTime.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Helper function: Format time display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Helper function: Get filtered staff data
  const getFilteredStaffData = () => {
    return staffAttendanceData.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.staffId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        departmentFilter === 'All Departments' ||
        staff.department === departmentFilter;

      // Additional filters can be added here for branch and category
      return matchesSearch && matchesDepartment;
    });
  };

  // Helper function: Get visible dates based on time range
  const getVisibleDates = () => {
    const today = new Date().getDate();
    switch(timeRange) {
      case 0: // Week - show last 7 days up to today
        const weekStart = Math.max(1, today - 6);
        return dates.slice(weekStart - 1, today);
      case 1: // Month - show first 15 days for demo
        return dates.slice(0, Math.min(15, today));
      case 2: // Quarter - show all days up to today
        return dates.slice(0, today);
      case 3: // Custom - show all available dates
        return dates.slice(0, today);
      default:
        return dates.slice(0, Math.min(15, today));
    }
  };

  // Helper function: Calculate attendance statistics
  const calculateStats = () => {
    const filteredStaff = getFilteredStaffData();
    const visibleDates = getVisibleDates();
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalWorkDays = 0;

    filteredStaff.forEach(staff => {
      visibleDates.forEach(date => {
        const attendance = staff.attendance[date.day];
        if (attendance && attendance.status !== 'weekend') {
          totalWorkDays++;
          if (attendance.status === 'present') totalPresent++;
          else if (attendance.status === 'late') totalLate++;
          else if (attendance.status === 'absent') totalAbsent++;
          else if (attendance.status === 'leave') totalLeave++;
        }
      });
    });

    const attendanceRate = totalWorkDays > 0
      ? ((totalPresent + totalLate) / totalWorkDays * 100).toFixed(1)
      : 0;

    const punctualityRate = (totalPresent + totalLate) > 0
      ? (totalPresent / (totalPresent + totalLate) * 100).toFixed(0)
      : 0;

    return {
      totalPresent,
      totalLate,
      totalAbsent,
      totalLeave,
      attendanceRate,
      punctualityRate,
      workingDays: visibleDates.filter(d => !d.isWeekend).length,
    };
  };

  const stats = calculateStats();

  // Get cell style based on attendance status
  const getCellStyle = (status) => {
    const styles = {
      present: {
        bgcolor: '#E8F5E9',
        color: '#2E7D32',
        border: '1px solid #A5D6A7',
      },
      late: {
        bgcolor: '#FFF3E0',
        color: '#E65100',
        border: '1px solid #FFCC80',
      },
      absent: {
        bgcolor: '#FFEBEE',
        color: '#C62828',
        border: '1px solid #EF9A9A',
      },
      leave: {
        bgcolor: '#E3F2FD',
        color: '#1565C0',
        border: '1px solid #90CAF9',
      },
      weekend: {
        bgcolor: '#F5F5F5',
        color: '#757575',
        border: '1px solid #E0E0E0',
      },
    };
    return styles[status] || {};
  };

  // Handle tab change for navigation
  const handleTabChange = (event, newValue) => {
    switch(newValue) {
      case 0:
        navigate('/dashboardmenu/Leave'); // Navigate to Attendance Dashboard
        break;
      case 1:
        setTabValue(1); // Stay on current page (Staff Attendance Overview)
        break;
      case 2:
        navigate('/dashboardmenu/Leave/leave-management'); // Navigate to Leave Management
        break;
      case 3:
        navigate('/dashboardmenu/Leave/approval-workflow'); // Navigate to Approval Workflow
        break;
      case 4:
        navigate('/dashboardmenu/Leave/reports'); // Navigate to Reports
        break;
      default:
        setTabValue(1);
        break;
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    console.log('Printing staff attendance overview...');
    window.print();
  };

  // Handle export functionality
  const handleExport = () => {
    console.log('Exporting staff attendance report to Excel...');
    // In production, this would generate and download an Excel file
    alert('Export functionality will be implemented with actual API integration');
  };

  return (
    <Box
      sx={{
        border: isEmbedded ? 'none' : '1px solid #E8E8E8',
        borderRadius: isEmbedded ? '0' : '20px',
        p: isEmbedded ? 0 : 2,
        height: isEmbedded ? 'auto' : '86vh',
        overflow: 'auto',
      }}
    >
      {/* Header Section - Hidden when embedded */}
      {!isEmbedded && (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: '24px', fontWeight: '700' }}>
              Staff Attendance Overview
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#666', mt: 0.5 }}>
              {getCurrentMonthYear()} • Detailed Attendance Log • {formatTime(liveTime)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              borderColor: '#E8E8E8',
              color: '#333',
              '&:hover': {
                borderColor: '#3457D5',
                bgcolor: '#E8EFFE',
              },
            }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              bgcolor: '#3457D5',
              '&:hover': { bgcolor: '#2847C4' },
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>
      )}

      {!isEmbedded && <Divider sx={{ mb: 2 }} />}

      {/* Navigation Tabs - Hidden when embedded */}
      {!isEmbedded && (
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: '48px',
              fontSize: '14px',
              fontWeight: '500',
            },
            '& .MuiTabs-indicator': {
              height: '3px',
              borderRadius: '3px 3px 0 0',
            },
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

      {!isEmbedded && <Divider sx={{ mb: 2 }} />}

      {/* Search and Filters Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
          <TextField
            fullWidth
            placeholder="Search Staff Name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ color: '#999', mr: 1 }} />,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          >
            <MenuItem value="All Branches">All Branches</MenuItem>
            <MenuItem value="Main Campus">Main Campus</MenuItem>
            <MenuItem value="East Campus">East Campus</MenuItem>
            <MenuItem value="West Campus">West Campus</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          >
            <MenuItem value="All Departments">All Departments</MenuItem>
            <MenuItem value="Mathematics">Mathematics</MenuItem>
            <MenuItem value="Science">Science</MenuItem>
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="History">History</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            value={staffCategory}
            onChange={(e) => setStaffCategory(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          >
            <MenuItem value="All Categories">All Categories</MenuItem>
            <MenuItem value="Teaching Staff">Teaching Staff</MenuItem>
            <MenuItem value="Non-Teaching Staff">Non-Teaching Staff</MenuItem>
            <MenuItem value="Administrative">Administrative</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Time Range Filter */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>
          View By:
        </Typography>
        <Tabs
          value={timeRange}
          onChange={(e, newValue) => setTimeRange(newValue)}
          sx={{
            minHeight: '40px',
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: '40px',
              fontSize: '14px',
              px: 3,
            },
            '& .MuiTabs-indicator': {
              height: '3px',
            },
          }}
        >
          <Tab label="Week" />
          <Tab label="Month" />
          <Tab label="Quarter" />
          <Tab label="Custom Range" />
        </Tabs>
      </Box>

      {/* Dynamic Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {getSummaryData().map((item, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
            <Card
              sx={{
                border: '1px solid #E8E8E8',
                borderRadius: '12px',
                boxShadow: 'none',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: item.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <item.icon sx={{ color: item.color, fontSize: '24px' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: '22px', fontWeight: '700', color: item.color }}>
                      {item.value}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#999', mt: 0.5 }}>
                      {item.subtitle}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Attendance Log */}
      <Card
        sx={{
          border: '1px solid #E8E8E8',
          borderRadius: '12px',
          boxShadow: 'none',
          mb: 2,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
              Detailed Attendance Log
            </Typography>
            <Chip
              label={`${getFilteredStaffData().length} Staff • ${getVisibleDates().length} Days`}
              size="small"
              sx={{
                bgcolor: '#E8EFFE',
                color: '#3457D5',
                fontWeight: '600',
                fontSize: '12px',
              }}
            />
          </Box>

          {getFilteredStaffData().length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: '#999',
              }}
            >
              <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 1 }}>
                No Staff Members Found
              </Typography>
              <Typography sx={{ fontSize: '13px' }}>
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer
            sx={{
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: '#F5F5F5',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: '#BDBDBD',
                borderRadius: '4px',
                '&:hover': {
                  bgcolor: '#9E9E9E',
                },
              },
            }}
          >
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      bgcolor: '#FAFAFA',
                      zIndex: 2,
                      borderRight: '2px solid #E8E8E8',
                      fontWeight: '600',
                      fontSize: '13px',
                      minWidth: '200px',
                    }}
                  >
                    Staff Member
                  </TableCell>
                  {getVisibleDates().map((date) => (
                    <TableCell
                      key={date.day}
                      align="center"
                      sx={{
                        bgcolor: date.isWeekend ? '#F9F9F9' : '#FAFAFA',
                        fontWeight: '600',
                        fontSize: '12px',
                        minWidth: '80px',
                        borderLeft: '1px solid #E8E8E8',
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: '600', color: date.isWeekend ? '#999' : '#333' }}>
                          {date.day}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#999' }}>
                          {date.dayOfWeek}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredStaffData().map((staff) => (
                  <TableRow
                    key={staff.id}
                    sx={{
                      '&:hover': {
                        bgcolor: '#FAFAFA',
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        bgcolor: '#FFF',
                        zIndex: 1,
                        borderRight: '2px solid #E8E8E8',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={staff.avatar} sx={{ width: 36, height: 36 }} />
                        <Box>
                          <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                            {staff.name}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#999' }}>
                            {staff.staffId} • {staff.department}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    {getVisibleDates().map((date) => {
                      const attendance = staff.attendance[date.day];
                      return (
                        <TableCell
                          key={date.day}
                          align="center"
                          sx={{
                            ...getCellStyle(attendance?.status),
                            borderLeft: '1px solid #E8E8E8',
                            p: 1,
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8,
                            },
                          }}
                        >
                          {attendance?.status === 'weekend' ? (
                            <Typography sx={{ fontSize: '11px', fontWeight: '600' }}>
                              -
                            </Typography>
                          ) : attendance?.status === 'absent' ? (
                            <Typography sx={{ fontSize: '11px', fontWeight: '600' }}>
                              Absent
                            </Typography>
                          ) : attendance?.status === 'leave' ? (
                            <Typography sx={{ fontSize: '11px', fontWeight: '600' }}>
                              Leave
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                              {attendance?.time}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Legend */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              mt: 3,
              pt: 2,
              borderTop: '1px solid #E8E8E8',
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '4px',
                  bgcolor: '#E8F5E9',
                  border: '1px solid #A5D6A7',
                }}
              />
              <Typography sx={{ fontSize: '12px', color: '#666' }}>Present</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '4px',
                  bgcolor: '#FFF3E0',
                  border: '1px solid #FFCC80',
                }}
              />
              <Typography sx={{ fontSize: '12px', color: '#666' }}>Late</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '4px',
                  bgcolor: '#FFEBEE',
                  border: '1px solid #EF9A9A',
                }}
              />
              <Typography sx={{ fontSize: '12px', color: '#666' }}>Absent</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '4px',
                  bgcolor: '#E3F2FD',
                  border: '1px solid #90CAF9',
                }}
              />
              <Typography sx={{ fontSize: '12px', color: '#666' }}>Leave</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '4px',
                  bgcolor: '#F5F5F5',
                  border: '1px solid #E0E0E0',
                }}
              />
              <Typography sx={{ fontSize: '12px', color: '#666' }}>
                Weekend/Holiday
              </Typography>
            </Box>
          </Box>

          {/* Pagination */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3,
              pt: 2,
              borderTop: '1px solid #E8E8E8',
            }}
          >
            <Typography sx={{ fontSize: '13px', color: '#666' }}>
              Showing {getFilteredStaffData().length > 0 ? `1-${getFilteredStaffData().length}` : '0'} of {getFilteredStaffData().length} staff member{getFilteredStaffData().length !== 1 ? 's' : ''}
            </Typography>
            <Pagination
              count={Math.ceil(getFilteredStaffData().length / 10)}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </Box>
          </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StaffAttendanceOverviewPage;
