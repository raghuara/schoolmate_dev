import React, { useEffect, useState } from "react";
import { Dialog, IconButton, Box, Typography, ThemeProvider, createTheme, Button, Grid, Tabs, Tab, DialogContent, DialogActions, TextField, InputAdornment, Popover, ToggleButtonGroup, ToggleButton, Autocomplete } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { display, fontSize, keyframes, useMediaQuery, useTheme } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SimpleBarChartPage from "../../Chart/SimpleBarChart";
import Loader from "../../Loader";
import axios from "axios";
import { attendanceSpecific, attendanceTable, DashboardTeachersAttendance, irregularAttendees, postAttendanceMessage, sectionsDropdown } from "../../../Api/Api";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PrintIcon from '@mui/icons-material/Print';
import ImageStudent from '../../../Images/PagesImage/studentimg.png'
import * as XLSX from 'xlsx';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useLocation } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import ImageIcon from '@mui/icons-material/Image';
import '../../../Css/Page.css'
import SnackBar from "../../SnackBar";
import NoData from '../../../Images/Login/No Data.png'

const SectionTables = ({ data, status, searchQuery, setFilteredData }) => {
    const handleViewClick = (studentPicture) => {
        alert(`Student picture: ${studentPicture}`);
    };

    const filterData = (sectionData) => {
        if (!searchQuery || !sectionData) return sectionData;
        return sectionData.filter(
            (row) =>
                row.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                row.rollNumber?.toString().toLowerCase().includes(searchQuery)
        );
    };

    useEffect(() => {
        let filteredData = [];
        Object.keys(data).forEach((key) => {
            Object.keys(data[key] || {}).forEach((sectionKey) => {
                const sectionData = data[key][sectionKey];
                filteredData = [...filteredData, ...filterData(sectionData)];
            });
        });

        setFilteredData(filteredData);
    }, [data, searchQuery, setFilteredData]);

    const isEmpty = Object.keys(data).length === 0 || Object.values(data).every(section => Object.keys(section).length === 0);

    return (
        <Box p={2}>
            {isEmpty ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "70vh",
                        textAlign: "center",
                    }}
                >
                    <img
                        src={NoData}
                        alt="No data"
                        style={{
                            width: "30%",
                            height: "auto",
                            marginBottom: "16px",
                        }}
                    />
                </Box>
            ) : (
                Object.keys(data).map((key) =>
                    Object.keys(data[key] || {}).map((sectionKey) => {
                        const sectionData = data[key][sectionKey];
                        const filteredData = filterData(sectionData);

                        if (!filteredData || filteredData.length === 0) return null;

                        return (
                            <div key={`${key}-${sectionKey}`} style={{ marginBottom: "20px" }}>
                                {/* Header Section */}
                                <Box sx={{ display: "flex" }}>
                                    <Grid container justifyContent="space-between">
                                        <Grid
                                            size={{
                                                xs: 12,
                                                sm: 12,
                                                md: 6,
                                                lg: 4
                                            }}>
                                            <Box sx={{ display: "flex", }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: "12px",
                                                        color: "#fff",
                                                        backgroundColor:
                                                            status === "Absent"
                                                                ? "#D84600"
                                                                : status === "Leave"
                                                                    ? "#9E35C7"
                                                                    : status === "Late"
                                                                        ? "#3D49D6"
                                                                        : "#fff",
                                                        padding: "0px 5px",
                                                        borderRadius: "4px 0px 0px 0px",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {status}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: "11px",
                                                        padding: "0px 5px",
                                                        fontWeight: "600",
                                                        borderRight: "1px solid #eee",
                                                        textTransform: "none",
                                                    }}
                                                >
                                                    {`${filteredData[0]?.grade || "N/A"} - ${filteredData[0]?.section || "N/A"
                                                        }`}
                                                </Typography>
                                                {/* <Typography sx={{ fontSize: "12px", color: "#000", px: 1 }}>
                                                    Class Teacher - {filteredData[0]?.classTeacher || "Not Assigned"}
                                                </Typography> */}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                                {/* Table Section */}
                                <TableContainer
                                    sx={{
                                        border: "1px solid #E8DDEA",
                                    }}
                                >
                                    <Table stickyHeader aria-label={`${sectionKey} attendance table`} sx={{ minWidth: "100%" }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#faf6fc",
                                                    }}
                                                >
                                                    S.No
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#faf6fc",
                                                    }}
                                                >
                                                    Roll Number
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#faf6fc",
                                                    }}
                                                >
                                                    Student Name
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#faf6fc",
                                                    }}
                                                >
                                                    Grade
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#faf6fc",
                                                    }}
                                                >
                                                    Sec
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#faf6fc",
                                                    }}
                                                >
                                                    Student Picture
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#faf6fc",
                                                    }}
                                                >
                                                    Current Status
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                        backgroundColor: "#faf6fc",
                                                    }}
                                                >
                                                    Student History
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredData.map((row, index) => (
                                                <TableRow key={row.rollNumber}>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#E8DDEA",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#E8DDEA",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {row.rollNumber}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#E8DDEA",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {row.studentName}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#E8DDEA",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {row.grade}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#E8DDEA",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {row.section}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#E8DDEA",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <Button
                                                            sx={{ color: "#000", textTransform: "none" }}
                                                            onClick={() => handleViewClick(row.studentPicture)}
                                                        >
                                                            <ImageIcon sx={{ color: "#000", marginRight: 1 }} />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#E8DDEA",
                                                            textAlign: "center",
                                                            px: 4,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                backgroundColor:
                                                                    row.currentStatus === "Present"
                                                                        ? "#018535"
                                                                        : row.currentStatus === "Absent"
                                                                            ? "#D84600"
                                                                            : row.currentStatus === "Leave"
                                                                                ? "#9E35C7"
                                                                                : row.currentStatus === "Late"
                                                                                    ? "#3D49D6"
                                                                                    : "#ccc",
                                                                color: "#fff",
                                                                borderRadius: "30px",
                                                                px: 1,
                                                                py: 0.5,
                                                            }}
                                                        >
                                                            {row.currentStatus}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#E8DDEA",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <Button sx={{ color: "#000", textTransform: "none" }}>
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        );
                    })
                ))}
        </Box>
    );
};



const gradeOptions = [
    { label: "PreKG", value: "PreKG" },
    { label: "LKG", value: "LKG" },
    { label: "UKG", value: "UKG" },
    { label: "I", value: "I" },
    { label: "II", value: "II" },
    { label: "III", value: "III" },
    { label: "IV", value: "IV" },
    { label: "V", value: "V" },
    { label: "VI", value: "VI" },
    { label: "VII", value: "VII" },
    { label: "VIII", value: "VIII" },
    { label: "IX", value: "IX" },
    { label: "X", value: "X" },
];

const optionsWithOverall = [
    { label: "Over All", value: "overall" },
    ...gradeOptions,
];

export default function IrregularAttendeesPage({ onClose }) {
    const location = useLocation();
    const PageValue = location.state?.pageValue;
    const today = dayjs();
    const formattedDate = today.format('DD-MM-YYYY');

    const [openCal, setOpenCal] = useState(false);
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);

    const token = '123';
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [teachersGraphData, setTeachersGraphData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const [value, setValue] = React.useState(PageValue);

    const websiteSettings = useSelector(selectWebsiteSettings);

    const [selectedClass, setSelectedClass] = useState("overall");
    const [selectedClassSection, setSelectedClassSection] = useState({ sectionName: "OverAll" });
    const [sections, setSections] = useState([]);
    const [sectionDetails, setSectionDetails] = useState([]);

    const [selectedValue, setSelectedValue] = useState(0);
    const tabValues = ["absent", "leave", "late"];

    const [absentData, setAbsentData] = useState([]);
    const [leaveData, setLeaveData] = useState([]);
    const [lateData, setLateData] = useState([]);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        setValue(PageValue);
    }, [PageValue]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        const selectedValue1 = tabValues[newValue];
        setSelectedValue(selectedValue1)
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSectionChange = (event, value) => {
        setSelectedClassSection(value || { sectionName: "OverAll" });
    };

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
        }
    }, [selectedClass]);

    const fetchSections = async (selectedClass) => {
        setIsLoading(true);
        try {
            const res = await axios.get(sectionsDropdown, {
                params: {
                    Grade: selectedClass,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSections(res.data.sections);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClass) {
            fetchAbsentTable(selectedClass, selectedClassSection.sectionName);
            fetchLeaveTable(selectedClass, selectedClassSection.sectionName);
            fetchLateTable(selectedClass, selectedClassSection.sectionName);
        }
    }, [selectedClass, selectedClassSection]);

    const fetchAbsentTable = async (selectedClass, selectedClassSection) => {
        setIsLoading(true);
        try {
            const res = await axios.get(irregularAttendees, {
                params: {
                    Date: formattedDate,
                    Grade: selectedClass || "overall",
                    Section: selectedClassSection || "overall",
                    Status: "absent",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAbsentData(res.data);
            setOpen(true)
            setMessage("Absent Data Fetched Successfully");
            setColor(true)
            setStatus(true)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLeaveTable = async (selectedClass, selectedClassSection) => {
        setIsLoading(true);
        try {
            const res = await axios.get(irregularAttendees, {
                params: {
                    Date: formattedDate,
                    Grade: selectedClass || "overall",
                    Section: selectedClassSection || "overall",
                    Status: "leave",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLeaveData(res.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLateTable = async (selectedClass, selectedClassSection) => {
        setIsLoading(true);
        try {
            const res = await axios.get(irregularAttendees, {
                params: {
                    Date: formattedDate,
                    Grade: selectedClass || "overall",
                    Section: selectedClassSection || "overall",
                    Status: "late",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLateData(res.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotifyClick = async (status, data) => {
        setIsLoading(true);
        try {
            const rollNumbers = [];

            Object.keys(data).forEach((key) => {
                Object.keys(data[key] || {}).forEach((sectionKey) => {
                    const sectionData = data[key][sectionKey];

                    if (Array.isArray(sectionData)) {
                        sectionData.forEach(item => {
                            if (item.rollNumber) {
                                rollNumbers.push(item.rollNumber);
                            }
                        });
                    }
                });
            });
            const sendData = {
                date: formattedDate,
                status: status,
                rollNumber: rollNumbers,
            };

            const res = await axios.post(postAttendanceMessage, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (status === "absent") {
                setMessage("Absentees Notified");
            } else if (status === "leave") {
                setMessage("Leaves Notified");
            } else if (status === "late") {
                setMessage("Latecomers Notified");
            } else {
                setMessage("Notified");
            }

            setOpen(true);
            setColor(true);
            setStatus(true);
        } catch (error) {
            setMessage("An error occurred while sending notification.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };


    const handleExport = () => {
        if (!filteredData || filteredData.length === 0) {
            alert('No data to export');
            return;
        }

        const header = [
            'S.No', 'Roll Number', 'Student Name', 'Grade', 'Section',
            'Current Status'
        ];

        const data = filteredData.map((row, index) => [
            index + 1,
            row.rollNumber,
            row.studentName,
            row.grade,
            row.section,
            row.currentStatus,
        ]);

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

        XLSX.writeFile(wb, 'filtered_attendance_data.xlsx');
    };

    const notifyAbsentees = () => {
        setOpen(true)
        setMessage("Absentees Notified");
        setColor(true)
        setStatus(true)
    }
    const notifyLeaves = () => {
        setOpen(true)
        setMessage("Leaves Notified");
        setColor(false)
        setStatus(false)
    }
    const notifyLateComers = () => {
        setOpen(true)
        setMessage("Latecomers Notified");
        setColor(true)
        setStatus(false)
    }

    return (
        <Box sx={{ backgroundColor: "#F6F6F8" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box >
                {isLoading && <Loader />}
                <Grid container py={1} px={2} sx={{ backgroundColor: "#F2F2F2" }}>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 4.5
                        }}>
                        <Grid container >
                            <Grid
                                sx={{ display: "flex" }}
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6.5
                                }}>
                                <Link style={{ textDecoration: "none" }} to="/dashboardmenu/attendance">
                                    <IconButton sx={{ width: "27px", height: "27px", marginTop: '-3px', '&:hover': { backgroundColor: "rgba(252, 190, 58, 0.2)" } }}>
                                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                                    </IconButton>
                                </Link>
                                <Typography sx={{ fontWeight: "600", fontSize: "17px" }}>
                                    Irregular Attendance <br />  <Box sx={{ display: "flex" }}>
                                        <CalendarMonthIcon style={{ marginTop: "0px", fontSize: "20px", marginRight: "5px", textDecoration: "underline" }} />
                                        <Typography style={{ fontSize: "12px", color: "#777", borderBottom: "1px solid #000" }}>
                                            {formattedDate}
                                        </Typography>
                                    </Box>
                                </Typography>

                            </Grid>
                            <Grid
                                sx={{ display: "flex" }}
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 5.5
                                }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search Student by Name or Roll Number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            padding: "0 10px",
                                            borderRadius: "50px",
                                            height: "28px",
                                            fontSize: "12px",
                                        },
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            minHeight: "28px",
                                            paddingRight: "3px",
                                        },
                                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "primary.main",
                                        },
                                        marginBottom: "16px",
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        sx={{ mt: 0.5 }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 8,
                            lg: 3.3
                        }}>
                        <Grid container >
                            <Grid
                                sx={{ display: "flex", justifyContent: "center" }}
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 12,
                                    lg: 12
                                }}>
                                <Box sx={{

                                    borderRadius: "50px", minHeight: '30px',
                                    height: '30px', display: 'flex', marginTop: "0px",
                                }}>
                                    <Typography sx={{ fontSize: "12px", color: "#000", pr: 1, marginTop: "5px", pl: 2, whiteSpace: "nowrap", }}>
                                        Notify All &nbsp;&nbsp;|
                                    </Typography>
                                    <Tabs
                                        value={value}
                                        onChange={handleChange}
                                        aria-label="attendance tabs"
                                        variant="scrollable"
                                        TabIndicatorProps={{
                                            sx: { display: 'none' },
                                        }}
                                        sx={{
                                            backgroundColor: '#fff',
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
                                        <Tab label="Absent" />
                                        <Tab label="Leave" />
                                        <Tab label="Late" />
                                    </Tabs>
                                </Box>
                            </Grid>
                        </Grid>

                    </Grid>

                    <Grid
                        sx={{ mt: 0.5 }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 4.2
                        }}>
                        <Grid container spacing={1}>
                            <Grid
                                size={{
                                    lg: 4.4
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={optionsWithOverall}
                                    getOptionLabel={(option) => option.label}
                                    value={optionsWithOverall.find((option) => option.value === selectedClass) || null}
                                    onChange={(event, value) => {
                                        if (value) setSelectedClass(value.value);
                                    }}
                                    sx={{ width: "100%" }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                height: '150px',
                                                backgroundColor: '#000',
                                                color: '#fff',
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li
                                            {...props}
                                            className="classdropdownOptions"
                                            style={{ color: option.color }}
                                        >
                                            {option.label}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: params.InputProps.endAdornment,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: '33px',
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid
                                size={{
                                    lg: 4.4
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={[{ sectionName: "OverAll" }, ...sections]}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={selectedClassSection}
                                    onChange={handleSectionChange}
                                    isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
                                    sx={{ width: "100%" }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                height: '150px',
                                                backgroundColor: '#000',
                                                color: '#fff',
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li
                                            {...props}
                                            className="classdropdownOptions"

                                        >
                                            {option.sectionName}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: params.InputProps.endAdornment,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: '33px',
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid
                                size={{
                                    lg: 3.2
                                }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleExport}
                                    sx={{
                                        borderColor: "#A9A9A9",
                                        backgroundColor: "#fff",
                                        py: 0.3,
                                        width: "100%",
                                        color: "#000",
                                        textTransform: "none",
                                        mb: 1
                                    }}>
                                    <ExitToAppIcon />
                                    &nbsp;Export
                                </Button>
                            </Grid>
                        </Grid>

                    </Grid>
                </Grid>

                <Box hidden={value !== 0} >
                    <Box sx={{ height: "77vh", overflowY: "auto", }}>
                        <SectionTables
                            status={'Absent'}
                            data={absentData}
                            searchQuery={searchQuery}
                            setFilteredData={setFilteredData}
                        />
                    </Box>

                    {userType !== "teacher" &&
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Button
                                variant="contained"
                                onClick={() => handleNotifyClick("absent", absentData)}
                                sx={{
                                    bottom: '12px',
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    color: websiteSettings.textColor,
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    paddingTop: '0px',
                                    paddingBottom: '0px',
                                    px: 3,
                                    mt:3,
                                    boxShadow: "none",
                                }}
                            >
                                Notify Absentees
                            </Button>
                        </Box>
                    }
                </Box>

                <Box hidden={value !== 1}>
                    <Box sx={{ height: "77vh", overflowY: "auto", }}>
                        <SectionTables
                            status={'Leave'}
                            data={leaveData}
                            searchQuery={searchQuery}
                            setFilteredData={setFilteredData}
                        />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {userType !== "teacher" &&
                            <Button
                                variant="contained"
                                onClick={() => handleNotifyClick("leave", leaveData)}
                                sx={{
                                    bottom: '12px',
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    color: websiteSettings.textColor,
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    paddingTop: '0px',
                                    paddingBottom: '0px',
                                    px: 3,
                                    mt:3,
                                    boxShadow: "none",
                                }}
                            >
                                Notify Leaves
                            </Button>
                        }
                    </Box>
                </Box>

                <Box hidden={value !== 2} >
                    <Box sx={{ height: "77vh", overflowY: "auto", }}>
                        <SectionTables
                            status={'Late'}
                            data={lateData}
                            searchQuery={searchQuery}
                            setFilteredData={setFilteredData}
                        />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {userType !== "teacher" &&
                            <Button
                                variant="contained"
                                onClick={() => handleNotifyClick("late", lateData)}
                                sx={{
                                    bottom: '12px',
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    color: websiteSettings.textColor,
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    paddingTop: '0px',
                                    paddingBottom: '0px',
                                    px: 3,
                                    mt:3,
                                    boxShadow: "none",
                                }}
                            >
                                Notify Latecomers
                            </Button>
                        }
                    </Box>
                </Box>


                <Dialog
                    open={openImage}
                    onClose={handleImageClose}
                    sx={{
                        '& .MuiPaper-root': {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            borderRadius: 0,
                            padding: 0,
                            overflow: 'visible',
                        },
                    }}
                    BackdropProps={{
                        style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    }}
                >
                    <img
                        src={imageUrl}
                        alt="Popup"
                        style={{
                            maxWidth: '300px',
                            maxHeight: '80vh',
                        }}
                    />
                    <DialogActions sx={{ padding: 0 }}>
                        <IconButton onClick={handleImageClose} sx={{ position: 'absolute', top: -10, right: -40 }}>
                            <CloseIcon style={{ color: "#fff" }} />
                        </IconButton>
                    </DialogActions>
                </Dialog>

            </Box>
        </Box>
    );
}
