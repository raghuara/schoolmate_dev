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

// Color palette cycled per grade within a category
const GRADE_COLOR_PALETTE = [
    "#4A2086",
    "#00847D",
    "#D84600",
    "#800080",
    "#FFA500",
    "#4682B4",
    "#228B22",
    "#B83940",
    "#008080",
    "#6A0DAD",
];


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#90caf9' },
        background: { paper: '#121212' },
        text: { primary: '#ffffff' },
    },
});

// Custom plugin: draws grade group labels centered below the section (A/B/C) tick labels
const groupLabelPlugin = {
    id: 'groupLabel',
    afterDraw(chart) {
        const { ctx, scales: { x } } = chart;
        const gc = chart.options.plugins.groupLabel?.groupCenters;
        if (!gc) return;
        ctx.save();
        ctx.font = 'bold 11px Arial, sans-serif';
        ctx.fillStyle = '#444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        Object.entries(gc).forEach(([group, { start, end }]) => {
            if (!group || group === 'null') return;
            const xPos = (x.getPixelForValue(start) + x.getPixelForValue(end)) / 2;
            const yPos = x.bottom - 11;
            ctx.fillText(group.toUpperCase(), xPos, yPos);
        });
        ctx.restore();
    },
};

function GroupBarChartPage({ }) {
    const chartRef = useRef(null);
    const [studentsGraphData, setStudentsGraphData] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState(dayjs().format('DD-MM-YYYY'));
    const [openCal, setOpenCal] = useState(false);
    const rollNumber = localStorage.getItem("rollNumber");
    const userType = localStorage.getItem("userType");
    const token = "123"
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [isLoading, setIsLoading] = useState(false)

    const fetchStudentsGraphData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(DashboardStudentsAttendance, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate,
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = Array.isArray(res.data) ? res.data : [];
            setStudentsGraphData(data);
            if (data.length > 0 && !data.find(c => c.category === selectedGroup)) {
                setSelectedGroup(data[0].category);
            }
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
        const category = studentsGraphData.find(cat => cat.category === selectedGroup);
        if (!category) return [];

        const result = [];
        category.grades.forEach((grade, gradeIndex) => {
            const color = GRADE_COLOR_PALETTE[gradeIndex % GRADE_COLOR_PALETTE.length];
            grade.attendance.forEach(item => {
                result.push({ ...item, color, group: grade.sign });
            }); 
            
            if (gradeIndex < category.grades.length - 1) {
                result.push({ section: "", percentage: null, color: "transparent", group: null });
            }
        });
        return result;
    };

    // Dynamic tab list from API data
    const categories = studentsGraphData ? studentsGraphData.map(cat => cat.category) : [];

    if (!studentsGraphData) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
                <Typography variant="h6">No data to display</Typography>
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
                    size={{ xs: 12, sm: 12, md: 12, lg: 3.7 }}>
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
                    size={{ xs: 12, sm: 12, md: 12, lg: 5 }}>
                    <Box sx={{ borderRadius: "50px", minHeight: '30px', mt: 0.5 }}>
                        <Tabs
                            value={selectedGroup}
                            onChange={(_, newValue) => setSelectedGroup(newValue)}
                            aria-label="attendance tabs"
                            variant="scrollable"
                            slotProps={{ indicator: { sx: { display: 'none' } } }}
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
                            {categories.map(cat => (
                                <Tab key={cat} label={cat} value={cat} />
                            ))}
                        </Tabs>
                    </Box>
                </Grid>

                <Grid
                    sx={{ display: "flex", justifyContent: "end" }}
                    size={{ xs: 12, sm: 12, md: 12, lg: 3.2 }}>
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
                        plugins={[groupLabelPlugin]}
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
                                groupLabel: { groupCenters },
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
                                    afterFit: (scale) => { scale.height += 22; },
                                    ticks: {
                                        autoSkip: false,
                                        callback: function (_value, index) {
                                            return sections[index];
                                        },
                                    },
                                    grid: { display: false },
                                },
                                y: {
                                    beginAtZero: true,
                                    ticks: { stepSize: 5 },
                                    grid: { color: "rgba(200, 200, 200, 0.2)" },
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
