import React, { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Typography, Box, Grid, Tabs, Tab, IconButton, createTheme } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import dayjs from 'dayjs';
import axios from 'axios';
import { ThemeProvider } from '@mui/system';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { DashboardStudentsAttendance } from "../../Api/Api";
import { Link } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const groupColors = {
    Nursery: {
        "Pre-kg": { start: "#8338EC", end: "#4A2086" },
        LKG: { start: "#00ADA4", end: "#00847D" },
        UKG: { start: "#FB5506", end: "#D84600" },
    },
    Primary: {
        "Grade 1": { start: "#FD7AFF", end: "#B900BC" },
        "Grade 2": { start: "#B83940", end: "#5E1217" },
        "Grade 3": { start: "#8338EC", end: "#4A2086" },
    },
    Secondary: {
        "Grade 6": { start: "#00ADA4", end: "#00847D" },
        "Grade 7": { start: "#FB5506", end: "#D84600" },
    },
};

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        background: {
            paper: '#121212',
        },
        text: {
            primary: '#ffffff',
        },
    },
});

function GroupBarChartPage({ }) {
    const chartRef = useRef(null);
    const [studentsGraphData, setStudentsGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("Nursery");
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState(dayjs().format('DD-MM-YYYY'));
    const [gradientColors, setGradientColors] = useState({});
    const [openCal, setOpenCal] = useState(false);
    const rollNumber = localStorage.getItem("rollNumber");
    const userType = localStorage.getItem("userType");
    const userName = localStorage.getItem("userName");
    const token = '123';
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchStudentsGraphData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(DashboardStudentsAttendance, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStudentsGraphData(res.data.studentsAttendance || {});
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsGraphData();
    }, [formattedDate]);

    const getGroupedData = () => {
        if (!studentsGraphData) return [];
        const nursery = [
            ...(studentsGraphData.pre_kg_attendance || []).map((item) => ({ ...item, color: "#4A2086", group: "PRE KG" })),
            { section: "", percentage: null },
            ...(studentsGraphData.lkg_attendance || []).map((item) => ({ ...item, color: "#00847D", group: "LKG" })),
            { section: "", percentage: null, color: "#008080", group: "LKG" },
            ...(studentsGraphData.ukg_attendance || []).map((item) => ({ ...item, color: "#D84600", group: "UKG" })),
        ];

        const primary = [
            ...(studentsGraphData.grade1Attendance || []).map((item) => ({ ...item, color: "#800080", group: "Grade 1" })),
            { section: "", percentage: null },
            ...(studentsGraphData.grade2Attendance || []).map((item) => ({ ...item, color: "#FFA500", group: "Grade 2" })),
            { section: "", percentage: null },
            ...(studentsGraphData.grade3Attendance || []).map((item) => ({ ...item, color: "#008080", group: "Grade 3" })),
            { section: "", percentage: null },
            ...(studentsGraphData.grade4Attendance || []).map((item) => ({ ...item, color: "#228B22", group: "Grade 4" })),
            { section: "", percentage: null },
            ...(studentsGraphData.grade5Attendance || []).map((item) => ({ ...item, color: "#4682B4", group: "Grade 5" })),
        ];

        const secondary = [
            ...(studentsGraphData.grade6Attendance || []).map((item) => ({ ...item, color: "#008080", group: "Grade 6" })),
            { section: "", percentage: null },
            ...(studentsGraphData.grade7Attendance || []).map((item) => ({ ...item, color: "#D84600", group: "Grade 7" })),
            { section: "", percentage: null },
            ...(studentsGraphData.grade8Attendance || []).map((item) => ({ ...item, color: "#800080", group: "Grade 8" })),
            { section: "", percentage: null },
            ...(studentsGraphData.grade9Attendance || []).map((item) => ({ ...item, color: "#FFA500", group: "Grade 9" })),
            { section: "", percentage: null },
            ...(studentsGraphData.grade10Attendance || []).map((item) => ({ ...item, color: "#228B22", group: "Grade 10" })),
        ];

        switch (selectedGroup) {
            case "Nursery":
                return nursery;
            case "Primary":
                return primary;
            case "Secondary":
                return secondary;
            default:
                return [];
        }
    };

    const createGradient = (ctx, colorStart, colorEnd) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    useEffect(() => {
        if (chartRef.current && chartRef.current.chartInstance) {
            const ctx = chartRef.current.chartInstance.ctx;
            const gradients = {};
            const colors = groupColors[selectedGroup] || {};

            Object.keys(colors).forEach((group) => {
                const color = colors[group];
                const gradient = createGradient(ctx, color.start, color.end);
                gradients[group] = gradient;
            });
            setGradientColors(gradients);
        }
    }, [selectedGroup, studentsGraphData]);

    if (!studentsGraphData) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
                <Typography variant="h6">No data to display</Typography>
                {/* <CircularProgress  style={{color:websiteSettings.mainColor}}/> */}
            </div>
        );
    }

    const groupedData = getGroupedData();
    const sections = [];
    const percentages = [];
    const backgroundColors = [];
    const borderColors = [];
    const groupCenters = {};

    let currentGroup = null;
    groupedData.forEach((item, index) => {
        sections.push(item.section || "");
        percentages.push(item.percentage);
        backgroundColors.push(item.color);
        borderColors.push(item.color);

        if (item.group !== currentGroup) {
            currentGroup = item.group;
            groupCenters[currentGroup] = { start: index };
        }
        if (item.group && groupCenters[item.group]) {
            groupCenters[item.group].end = index;
        }
    });

    Object.keys(groupCenters).forEach((group) => {
        const { start, end } = groupCenters[group];
        groupCenters[group].center = Math.floor((start + end) / 2);
    });

    const barWidth = 32;
    const gapWidth = 15;
    const chartPadding = 50;
    const minChartWidth = 570;
    const totalChartWidth = Math.max(
        sections.length * (barWidth + gapWidth) + chartPadding,
        minChartWidth
    );


    return (
        <div style={{ width: "100%", overflowX: "auto" }}>
            <Grid container spacing={2}>
                <Grid
                    sx={{ display: "flex", justifyContent: "center" }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 3.7
                    }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "16px", fontWeight: "600" }}>
                            Student Attendance
                            <Typography style={{ fontSize: "12px", color: "#777" }}>
                                {dayjs(selectedDate).format('DD MMMM YYYY')}
                            </Typography>
                        </Typography>
                    </Box>
                </Grid>

                <Grid
                    sx={{ display: "flex", justifyContent: "center", }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 5
                    }}>
                    <Box sx={{
                        borderRadius: "50px", minHeight: '30px', mt: 0.5
                    }}>
                        <Tabs
                            value={selectedGroup}
                            onChange={(e, newValue) => setSelectedGroup(newValue)}
                            aria-label="attendance tabs"
                            variant="scrollable"
                            TabIndicatorProps={{
                                sx: { display: 'none' },
                            }}
                            sx={{
                                backgroundColor: '#faf6fc',
                                minHeight: "10px",
                                borderRadius: "50px",
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontSize: '12px',
                                    color: '#555',
                                    fontWeight: 'bold',
                                    minWidth: 0,
                                    paddingX: 1,
                                    minHeight: '30px',
                                    height: '30px',
                                    px: 2,
                                },
                                '& .Mui-selected': {
                                    color: '#fff !important',
                                    bgcolor: '#000',
                                    borderRadius: "50px",
                                },
                            }}
                        >
                            <Tab label="Nursery" value="Nursery" />
                            <Tab label="Primary" value="Primary" />
                            <Tab label="Secondary" value="Secondary" />
                        </Tabs>
                    </Box>
                </Grid>

                <Grid
                    sx={{ display: "flex", justifyContent: "end" }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 3.2
                    }}>
                    <Box sx={{ display: "flex", justifyContent: "end" }}>
                        <ThemeProvider theme={darkTheme}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    disableFuture
                                    open={openCal}
                                    onClose={handleClose}
                                    value={selectedDate}
                                    onChange={(newValue) => {
                                        setSelectedDate(newValue);
                                        const newFormattedDate = dayjs(newValue).format('DD-MM-YYYY');
                                        setFormattedDate(newFormattedDate);
                                        handleClose();
                                    }}

                                    views={['year', 'month', 'day']}
                                    renderInput={() => null}
                                    sx={{
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        width: "10px",
                                        marginRight: "80px"
                                    }}
                                />
                                <IconButton sx={{
                                    width: '40px',
                                    height: '40px',
                                    marginLeft: '-100px',
                                    transition: 'color 0.3s, background-color 0.3s',
                                    '&:hover': {
                                        color: '#fff',
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                    },

                                }}
                                    onClick={handleOpen}>
                                    <CalendarMonthIcon style={{ color: "#000" }} />
                                </IconButton>
                            </LocalizationProvider>
                        </ThemeProvider>
                        <Link to="/dashboardmenu/attendance" style={{ textDecoration: "none" }}>
                            <Typography
                                variant="body1"
                                className="seeAllText"
                                sx={{
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    transition: "transform 0.3s ease",
                                    cursor: "pointer",
                                    color: '#000',
                                    marginTop: "10px"
                                }}
                            >
                                View all
                                <ArrowForwardIcon
                                    className="arrowIcon"
                                    sx={{
                                        opacity: 0,
                                        transform: "translateX(5px)",
                                        transition: "opacity 0.3s ease, transform 0.3s ease",
                                        // ml: 0.5,
                                    }}
                                />
                            </Typography>
                        </Link>
                    </Box>
                </Grid>
            </Grid>
            <div style={{ width: "100%", overflowX: "auto" }}>
                <div style={{ width: `${totalChartWidth}px`, height: "320px" }}>
                    <Bar
                        ref={chartRef}
                        data={{
                            labels: sections,
                            datasets: [
                                {
                                    label: "Attendance",
                                    data: groupedData.map((item) => ({
                                        x: item.section,
                                        y: item.percentage,
                                        present: item.present,
                                        absent: item.absent,
                                        leave: item.leave,
                                        late: item.late,
                                        group: item.group,
                                    })),
                                    backgroundColor: backgroundColors,
                                    borderColor: borderColors,
                                    borderWidth: 2,
                                    barThickness: barWidth,
                                    categoryPercentage: 1,
                                    barPercentage: 1,
                                    borderRadius: {
                                        topLeft: 4,
                                        topRight: 4,
                                        bottomLeft: 0,
                                        bottomRight: 0,
                                    },
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        title: (tooltipItems) => {
                                            const item = tooltipItems[0].raw;
                                            return `Class: ${item.group || ''} - ${tooltipItems[0].label}`;
                                        },
                                        label: (tooltipItem) => {
                                            const item = tooltipItem.raw;
                                            return [
                                                `🔵 Present: ${item.present ?? '-'}`,
                                                `🔴 Absent: ${item.absent ?? '-'}`,
                                                `🟡 Leave: ${item.leave ?? '-'}`,
                                                `🟣 Late: ${item.late ?? '-'}`,
                                            ];
                                        },
                                    },
                                    displayColors: false,
                                },
                            },
                            scales: {
                                x: {
                                    ticks: {
                                        autoSkip: false,
                                        callback: function (value, index) {
                                            const groupName = Object.keys(groupCenters).find(
                                                (group) => groupCenters[group].center === index
                                            );
                                            return sections[index];
                                        },
                                    },
                                    grid: {
                                        display: false,
                                    },
                                },
                                y: {
                                    beginAtZero: true,
                                    ticks: { stepSize: 5 },
                                    grid: {
                                        color: "rgba(200, 200, 200, 0.2)",
                                    },
                                },
                            },
                        }}
                    />

                </div>
            </div>
        </div>
    );
}

export default GroupBarChartPage;