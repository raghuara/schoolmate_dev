import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, ThemeProvider, createTheme, Button, Grid, Tabs, Tab, DialogContent, DialogActions, TextField, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Autocomplete, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { display, keyframes, useMediaQuery, useTheme } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Loader from "../../Loader";
import axios from "axios";
import { DashboardStudentsAttendance, fetchAttendance, postAttendance, updateAttendance } from "../../../Api/Api";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import * as XLSX from 'xlsx';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import SnackBar from "../../SnackBar";
import fallbackImage from "../../../Images/PagesImage/dummy-image.jpg";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export default function AddAttendancePage() {
    const today = dayjs().format("DD-MM-YYYY");
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState(today);
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
    const grades = useSelector(selectGrades);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [value, setValue] = useState(0);
    const [selectedClass, setSelectedClass] = useState("PreKG");
    const [selectedClassSection, setSelectedClassSection] = useState("A1");
    const [selectedFilter, setSelectedFilter] = useState("OverAll");
    const [attendanceData, setAttendanceData] = useState({
        present: 0,
        absent: 0,
        leave: 0,
        late: 0
    });

    const [filteredData, setFilteredData] = useState([]);
    const [attendanceTableData, setAttendanceTableData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fileInputRef = useRef(null);
    const [selectedActions, setSelectedActions] = useState({});
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedGradeSign, setSelectedGradeSign] = useState(null);
    const [selectedSection, setSelectedSection] = useState("all");
    const [studentsGraphData, setStudentsGraphData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [attendanceDataLoading, setAttendanceDataLoading] = useState(false);
    const [sortByNameAsc, setSortByNameAsc] = useState(false);

    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];
    const sectionOptions = [{ sectionName: "All" }, ...sections];

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    useEffect(() => {
        if (!filteredData || filteredData.length === 0) return;

        const initialActions = {};
        const counts = {
            present: 0,
            absent: 0,
            leave: 0,
            late: 0
        };

        filteredData.forEach(row => {
            const status = row.attendanceAction?.toLowerCase() === "no data"
                ? "present"
                : row.attendanceAction?.toLowerCase() || "present";

            initialActions[row.rollNumber] = status;
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });

        setSelectedActions(initialActions);
        setAttendanceData(counts);
    }, [filteredData]);

    const handleAttendanceChange = (rollNumber, value) => {
        setSelectedActions((prev) => {
            const prevStatus = prev[rollNumber] || "present";
            const newSelected = { ...prev, [rollNumber]: value };

            setAttendanceData((prevCounts) => {
                const newCounts = { ...prevCounts };

                if (prevStatus && newCounts[prevStatus] > 0) {
                    newCounts[prevStatus] -= 1;
                }

                if (!newCounts[value]) {
                    newCounts[value] = 1;
                } else {
                    newCounts[value] += 1;
                }

                return newCounts;
            });

            return newSelected;
        });
    };

    const prepareAttendanceData = () => {
        return attendanceTableData.map((row) => {
            const rollNumber = row.rollNumber;
            const status = selectedActions[rollNumber] ||
                (row.attendanceAction?.toLowerCase() === "no data" ? "present" : row.attendanceAction?.toLowerCase());

            return {
                rollNumber,
                status: capitalizeFirstLetter(status),
            };
        });
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    const data = { details: prepareAttendanceData() };

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedGradeSign(newValue.sign);
            setSelectedSection(newValue.sections[0]);
        } else {
            setSelectedGradeId(null);
            setSelectedGradeSign(null);
            setSelectedSection(null);
        }
    };

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };


    const handleFilterChange = (event, value) => {
        setSelectedFilter(value || "OverAll");
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };


    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryData = event.target.result;
            const workbook = XLSX.read(binaryData, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                header: ["rollNumber", "status"],
                defval: "",
            });

            const updatedActions = {};
            sheetData.forEach((row) => {
                if (row.rollNumber && row.status) {
                    updatedActions[row.rollNumber] = row.status.toLowerCase();
                }
            });

            setSelectedActions(updatedActions);
        };

        reader.readAsBinaryString(file);
    };

    const handleCancel = () => {
        setSelectedActions({});
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


    const getColor = (value) => {
        switch (value?.toLowerCase()) {
            case "present":
                return "#00963C";
            case "absent":
                return "#D84600";
            case "leave":
                return "#9E35C7";
            case "late":
                return "#3D49D6";
            default:
                return "#777";
        }
    };

    const handleExport = () => {
        const header = [
            'S.No', 'Roll Number', 'Student Name', 'Class', 'Section',
            'Attendance Status', 'Attendance %'
        ];

        const data = filteredData.map((row, index) => [
            index + 1,
            row.rollNumber,
            row.studentName,
            row.grade,
            row.section,
            row.attendanceAction,
            row.attendancePercent
        ]);

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

        XLSX.writeFile(wb, 'attendance_data.xlsx');
    };

    useEffect(() => {
        fetchAttendanceTable()
        fetchStudentsGraphData();
    }, [formattedDate, selectedGradeId, selectedGradeSign, selectedSection, selectedFilter]);

    const fetchAttendanceTable = async () => {
        setAttendanceDataLoading(true);
        try {
            const res = await axios.get(fetchAttendance, {
                params: {
                    Date: formattedDate,
                    Grade: selectedGradeSign || grades?.[0]?.sign || "",
                    Section: selectedSection || "all",
                    Status: selectedFilter || "overall",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAllData(res.data);
            setAttendanceTableData(res.data.details)
            setFilteredData(res.data.details);
        } catch (error) {
            console.error(error);
        } finally {
            setAttendanceDataLoading(false);
            console.log("Loader stops");
        }
    };

    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (query) {
            const filtered = attendanceTableData.filter(
                (item) =>
                    item.rollNumber.toString().toLowerCase().includes(query) ||
                    item.studentName.toLowerCase().includes(query)
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(attendanceTableData);
        }
    };

    const finalData = sortByNameAsc
        ? [...filteredData].sort((a, b) => a.studentName.localeCompare(b.studentName))
        : filteredData;


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

    const handleSaveAttendance = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(
                postAttendance,
                {
                    grade: selectedGradeSign || grades?.[0]?.sign || "",
                    section: selectedSection || grades?.[0]?.sections?.[0] || "",
                    date: today,
                    details: prepareAttendanceData(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Attendance Added Successfully");
            fetchAttendanceTable()
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to add attendance. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateAttendance = async () => {
        setIsLoading(true);
        try {
            const res = await axios.put(
                updateAttendance,
                {
                    grade: selectedGradeSign || grades?.[0]?.sign || "",
                    section: selectedSection || grades?.[0]?.sections?.[0] || "",
                    date: today,
                    details: prepareAttendanceData(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Attendance Updated Successfully");
            fetchAttendanceTable()
        } catch (error) {
            console.error("Error updating attendance:", error);

            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage(
                error.response?.data?.message ||
                "Failed to update attendance. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ backgroundColor: "#F6F6F8", height: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box p={3}>
                <Grid container >
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 4.5
                        }}>
                        <Grid container >
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Box sx={{ display: "flex" }}>
                                    <Link style={{ textDecoration: "none" }} to="/dashboardmenu/attendance">
                                        <IconButton sx={{ width: "27px", height: "27px", marginTop: '3px', '&:hover': { backgroundColor: "rgba(252, 190, 58, 0.2)" } }}>
                                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                                        </IconButton>
                                    </Link>

                                    <Typography sx={{ fontWeight: "600", ml: 1, marginTop: "3px", fontSize: "19px" }}>
                                        Add Attendance
                                    </Typography>
                                </Box>

                                <Box sx={{ display: "flex" }}>
                                    <ThemeProvider theme={darkTheme}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                open={openCal}
                                                onClose={handleClose}
                                                value={selectedDate}
                                                onChange={(newValue) => {
                                                    setSelectedDate(newValue);
                                                    const newFormattedDate = dayjs(newValue).format('DD-MM-YYYY');
                                                    setFormattedDate(newFormattedDate);
                                                    handleClose();
                                                }}
                                                disableFuture
                                                views={['year', 'month', 'day']}
                                                renderInput={() => null}
                                                sx={{
                                                    opacity: 0,
                                                    pointerEvents: 'none',
                                                    width: "10px",
                                                    height: "10px",
                                                    marginTop: "-30px",
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </ThemeProvider>
                                    <Box onClick={handleOpen} sx={{ display: "flex", cursor: "pointer" }}>
                                        <CalendarMonthIcon style={{ marginTop: "0px", fontSize: "20px", marginRight: "5px", textDecoration: "underline" }} />
                                        <Typography style={{ fontSize: "12px", color: "#777", borderBottom: "1px solid #000" }}>
                                            {dayjs(selectedDate).format('DD MMMM YYYY')}
                                        </Typography>
                                    </Box>
                                </Box>

                            </Grid>
                            <Grid
                                sx={{ mt: .8 }}
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search Student by Name or Roll Number"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
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
                                        marginBottom: "16px",
                                        "& .MuiOutlinedInput-root": {
                                            minHeight: "28px",
                                            paddingRight: "3px",
                                        },
                                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "primary.main",
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        sx={{ mt: 0.5, pl: 3 }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 4,
                            lg: 7.5
                        }}>
                        <Grid container spacing={1}>
                            <Grid
                                size={{
                                    lg: 2.4
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={grades}
                                    disabled={attendanceDataLoading}
                                    getOptionLabel={(option) => option.sign}
                                    value={grades.find((item) => item.id === selectedGradeId) || null}
                                    onChange={(event, newValue) => {
                                        handleGradeChange(newValue);
                                    }}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    sx={{ width: "100%" }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                maxHeight: "150px",
                                                backgroundColor: "#000",
                                                color: "#fff",
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} className="classdropdownOptions">
                                            {option.sign}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            placeholder="Select Class"
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "33px",
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
                                    lg: 2.4
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={sectionOptions}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={
                                        sectionOptions.find((option) =>
                                            selectedSection === "all"
                                                ? option.sectionName === "All"
                                                : option.sectionName === selectedSection
                                        ) || null
                                    }

                                    onChange={(event, newValue) => {
                                        if (newValue?.sectionName) {
                                            const sectionValue = newValue.sectionName.toLowerCase() === "all"
                                                ? "all"
                                                : newValue.sectionName;
                                            setSelectedSection(sectionValue);
                                        } else {
                                            setSelectedSection("");
                                        }
                                    }}


                                    isOptionEqualToValue={(option, value) =>
                                        option.sectionName === value.sectionName
                                    }
                                    sx={{ width: "100%" }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                maxHeight: "150px",
                                                backgroundColor: "#000",
                                                color: "#fff",
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} className="classdropdownOptions">
                                            {option.sectionName}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "33px",
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
                                    lg: 2.4
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={["OverAll", 'Absent', 'Leave', 'Late']}
                                    value={selectedFilter}
                                    onChange={handleFilterChange}
                                    sx={{ width: "100%" }}
                                    disabled={attendanceData.isAttendanceAdded !== 'Y'}
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
                                            {option}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            //  label="Status"
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
                                    lg: 2.4
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
                                    <ExitToAppIcon sx={{ fontSize: "20px" }} />
                                    &nbsp;Export
                                </Button>
                            </Grid>
                            <Grid
                                size={{
                                    lg: 2.4
                                }}>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: "#A9A9A9",
                                        backgroundColor: "#000",
                                        py: 0.3,
                                        width: "100%",
                                        color: "#fff",
                                        textTransform: "none",
                                        border: "none",
                                        mb: 1
                                    }}
                                    onClick={handleUploadClick}
                                >
                                    <AddIcon sx={{ fontSize: "20px" }} />
                                    &nbsp;Upload
                                </Button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </Grid>
                        </Grid>

                    </Grid>
                </Grid>

                {/* <Box hidden={value !== 0}> */}
                <Box sx={{}}>
                    <Box sx={{ display: "flex" }}>
                        <Grid container sx={{ width: "100%" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 5,
                                    lg: 3
                                }}>
                                <Box sx={{ display: "flex", mt: 2.8 }}>
                                    <Typography sx={{ fontSize: "12px", color: "#fff", backgroundColor: "#307EB9", padding: "0px 5px 0px 5px", borderRadius: "4px 0px 0px 0px", fontWeight: "600", }}>
                                        {selectedGradeSign || "PREKG"} - {selectedSection}
                                    </Typography>
                                    {/* <Typography sx={{ fontSize: "12px", color: "#000", px: 1, }}>
                                        Class Teacher - {attendanceData.classTeacher}
                                    </Typography> */}
                                </Box>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 5,
                                    lg: 3
                                }}>
                            </Grid>
                            <Grid
                                sx={{ display: "flex", marginTop: "-5px", }}
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 5,
                                    lg: 6
                                }}>
                                <Box sx={{ display: "flex", mt: 2.8, px: 2, width: "100%" }}>
                                    {selectedSection?.toLowerCase() !== "all" && (
                                        <Grid container sx={{ width: "100%" }}>
                                            <Grid sx={{ display: "flex", justifyContent: "end" }} size={{
                                                lg: 3
                                            }}>
                                                <Typography sx={{ fontSize: "14px", color: "#000", fontWeight: "600" }}>
                                                    Present: {attendanceData.present}
                                                </Typography>
                                            </Grid>
                                            <Grid sx={{ display: "flex", justifyContent: "end" }} size={{
                                                lg: 3
                                            }}>
                                                <Typography sx={{ fontSize: "14px", color: "#000", fontWeight: "600" }}>
                                                    Absent: {attendanceData.absent}
                                                </Typography>
                                            </Grid>
                                            <Grid sx={{ display: "flex", justifyContent: "end" }} size={{
                                                lg: 3
                                            }}>
                                                <Typography sx={{ fontSize: "14px", color: "#000", fontWeight: "600" }}>
                                                    Leave: {attendanceData.leave}
                                                </Typography>
                                            </Grid>
                                            <Grid sx={{ display: "flex", justifyContent: "end" }} size={{
                                                lg: 3
                                            }}>
                                                <Typography sx={{ fontSize: "14px", color: "#000", fontWeight: "600" }}>
                                                    Late: {attendanceData.late}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    )}
                                </Box>
                            </Grid>

                        </Grid>
                    </Box>
                    <Box sx={{ width: "100%", overflowX: "auto" }}>
                        {attendanceDataLoading ? (
                            <Box sx={{ height: "70vh" }}>
                                <Typography
                                    sx={{
                                        textAlign: "center",
                                        mt: 5,
                                        mb: 5,
                                        fontSize: "16px",
                                        fontWeight: 500,
                                        color: "#555",
                                    }}
                                >
                                    Fetching attendance records, please wait...
                                </Typography>
                            </Box>

                        ) : (
                            <TableContainer
                                sx={{
                                    border: "1px solid #E8DDEA",
                                    maxHeight: "74vh",
                                    width: "77vw",
                                    overflowY: "auto",

                                }}
                            >
                                <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                S.No
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                Roll Number
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#faf6fc",
                                                    fontWeight: 600,
                                                    fontSize: "14px",
                                                    color: "#000",
                                                }}
                                            >
                                                <Button
                                                    onClick={() => setSortByNameAsc((prev) => !prev)}
                                                    sx={{
                                                        gap: "4px",
                                                        textTransform: "none",
                                                        color: "#000",
                                                        fontWeight: 600,
                                                        fontSize: "14px",
                                                        minWidth: "auto",
                                                        padding: 0,
                                                        "&:hover": {
                                                            backgroundColor: "transparent",
                                                            color: "#3f51b5",
                                                        },
                                                    }}
                                                    endIcon={
                                                        sortByNameAsc ? (
                                                            <ArrowUpwardIcon sx={{
                                                                fontSize: 16, "&:hover": {
                                                                    backgroundColor: "transparent",
                                                                    color: "#3f51b5",
                                                                },
                                                            }} />
                                                        ) : (
                                                            <ArrowDownwardIcon sx={{
                                                                fontSize: 16, "&:hover": {
                                                                    backgroundColor: "transparent",
                                                                    color: "#3f51b5",
                                                                },
                                                            }} />
                                                        )
                                                    }
                                                >
                                                    Student Name
                                                </Button>
                                            </TableCell>

                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                Class
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                Student Picture
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                Attendance Action
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                Current Status
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                Attendance%
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                                Student History
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {finalData.map((row, index) => (
                                            <TableRow key={row.rollNumber}>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                    {row.rollNumber}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                                    {row.studentName}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", }}>{row.grade} - {row.section}</TableCell>
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

                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", pl: 1, py: 0, pr: 0, width: "180px" }}>
                                                    <FormControl>
                                                        <RadioGroup
                                                            value={selectedActions[row.rollNumber] ||
                                                                (row.attendanceAction?.toLowerCase() === "no data" ? "present" : row.attendanceAction?.toLowerCase())}
                                                            onChange={(e) => handleAttendanceChange(row.rollNumber, e.target.value)}
                                                        >
                                                            <Grid container>
                                                                {["present", "absent", "leave", "late"].map((status, index) => (
                                                                    <Grid
                                                                        key={status}
                                                                        size={{
                                                                            lg: 6
                                                                        }}>
                                                                        <FormControlLabel
                                                                            value={status}
                                                                            control={
                                                                                <Radio
                                                                                    sx={{
                                                                                        transform: "scale(0.8)",
                                                                                        marginRight: "-10px",
                                                                                        color: "#777",
                                                                                        "&.Mui-checked": {
                                                                                            color: getColor(status),
                                                                                        },
                                                                                        ...(index === 1 && { marginLeft: "0px" }),
                                                                                    }}
                                                                                />
                                                                            }
                                                                            label={status.charAt(0).toUpperCase() + status.slice(1)}
                                                                            sx={{ marginRight: "0", "& .MuiTypography-root": { fontSize: "14px" } }}
                                                                        />
                                                                    </Grid>
                                                                ))}
                                                            </Grid>
                                                        </RadioGroup>
                                                    </FormControl>
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            backgroundColor: (() => {
                                                                const value =
                                                                    selectedActions[row.rollNumber] ||
                                                                    (row.attendanceAction?.toLowerCase() === "no data" ? "Present" : row.attendanceAction);
                                                                switch (value.toLowerCase()) {
                                                                    case "present":
                                                                        return "#018535";
                                                                    case "absent":
                                                                        return "#D84600";
                                                                    case "leave":
                                                                        return "#9E35C7";
                                                                    case "late":
                                                                        return "#3D49D6";
                                                                    default:
                                                                        return "#ccc";
                                                                }
                                                            })(),
                                                            color: "#fff",
                                                            borderRadius: "30px",
                                                            px: 1,
                                                            py: 0.5,
                                                        }}
                                                    >
                                                        {capitalizeFirstLetter(
                                                            selectedActions[row.rollNumber] ||
                                                            (row.attendanceAction?.toLowerCase() === "no data" ? "Present" : row.attendanceAction)
                                                        )}
                                                    </Box>
                                                </TableCell>

                                                {/* <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            <Box
                                                sx={{
                                                    backgroundColor:
                                                        row.currentStatus === 'no data' ? '#018535' :
                                                            row.currentStatus?.toLowerCase() === 'present' ? '#018535' :
                                                                row.currentStatus?.toLowerCase() === 'absent' ? '#D84600' :
                                                                    row.currentStatus?.toLowerCase() === 'leave' ? '#9E35C7' :
                                                                        row.currentStatus?.toLowerCase() === 'late' ? '#3D49D6' : '#ccc',
                                                    color: "#fff",
                                                    borderRadius: "30px",
                                                    px: 1,
                                                    py: 0.5,
                                                }}
                                            >
                                                {row.currentStatus === "no data"
                                                    ? "Present"
                                                    : capitalizeFirstLetter(row.currentStatus?.toLowerCase())}
                                            </Box>
                                        </TableCell> */}

                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", }}>{row.attendancePercent}%</TableCell>
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
                                {/* <Box sx={{ height: '50px' }}></Box> */}
                            </TableContainer>
                        )}
                    </Box>
                </Box>

                {dayjs().isSame(selectedDate, 'day') && selectedSection?.toLowerCase() !== "all" && (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {allData.isAttendanceAdded === "N" &&
                            <Button
                                onClick={handleSaveAttendance}
                                variant="contained"
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    color: websiteSettings.textColor,
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    paddingTop: '0px',
                                    paddingBottom: '0px',
                                    px: 3,
                                    boxShadow: "none",
                                    mt: 2
                                }}
                            >
                                Save
                            </Button>
                        }

                        {allData.isUpdateAvailable === "Y" &&
                            <Button
                                onClick={handleUpdateAttendance}
                                variant="contained"
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    color: websiteSettings.textColor,
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    paddingTop: '0px',
                                    paddingBottom: '0px',
                                    px: 3,
                                    boxShadow: "none",
                                    mt: 2
                                }}
                            >
                                Update

                            </Button>
                        }
                        {(allData.isAttendanceAdded === "N" || allData.isUpdateAvailable === "Y") &&

                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                sx={{
                                    backgroundColor: '#fff',
                                    textTransform: 'none',
                                    color: '#000',
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    paddingTop: '0px',
                                    paddingBottom: '0px',
                                    borderColor: "black",
                                    px: 3,
                                    boxShadow: "none",
                                    ml: 2,
                                    mt: 2
                                }}
                            >
                                Cancel
                            </Button>
                        }
                    </Box>
                )}

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
                        src={imageUrl || fallbackImage}
                        alt="Popup"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                        }}
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
