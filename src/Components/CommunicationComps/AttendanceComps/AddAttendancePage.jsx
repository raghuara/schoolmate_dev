import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, ThemeProvider, createTheme, Button, Grid, Tabs, Tab, DialogContent, DialogActions, TextField, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Autocomplete, Snackbar, CircularProgress, Avatar, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { display, keyframes, useMediaQuery, useTheme } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Loader from "../../Loader";
import axios from "axios";
import { DashboardStudentsAttendance, fetchAttendance, postAttendance, updateAttendance, StudentsOnLeaveToday } from "../../../Api/Api";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
import { findSubMenuPermissions } from "../../../Redux/Slices/AuthSlice";
import AddIcon from '@mui/icons-material/Add';
import SnackBar from "../../SnackBar";
import fallbackImage from "../../../Images/PagesImage/dummy-image.jpg";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

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
    const attendancePerms = findSubMenuPermissions(user.permissions, "communication", "attendance") || {};
    const canCreate = attendancePerms.create === "Y";
    const canEdit = attendancePerms.edit === "Y";
    const [value, setValue] = useState(0);
    const [selectedClass, setSelectedClass] = useState("PreKG");
    const [selectedClassSection, setSelectedClassSection] = useState("A1");
    const [selectedFilter, setSelectedFilter] = useState("OverAll");
    const [attendanceData, setAttendanceData] = useState({
        present: 0,
        absent: 0,
        leave: 0,
        late: 0,
        halfday: 0
    });

    const [filteredData, setFilteredData] = useState([]);
    const [attendanceTableData, setAttendanceTableData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fileInputRef = useRef(null);
    const dateAnchorRef = useRef(null);
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
    const canMarkNew = allData.isAttendanceAdded === "N" && canCreate;
    const canMarkUpdate = allData.isUpdateAvailable === "Y" && canEdit;
    const canModifyAttendance = canMarkNew || canMarkUpdate;
    const [attendanceDataLoading, setAttendanceDataLoading] = useState(false);
    const [sortByNameAsc, setSortByNameAsc] = useState(false);
    const isExpanded = useSelector((state) => state.sidebar.isExpanded);
    // Students with an approved leave for the selected date (StudentsOnLeaveToday API)
    const [leaveStudents, setLeaveStudents] = useState([]);
    const leaveRollSet = useMemo(
        () => new Set(leaveStudents.map((s) => String(s.rollNumber))),
        [leaveStudents]
    );

    // Half-day config per student → { half: 'first' | 'second' }
    const [halfDayConfig, setHalfDayConfig] = useState({});
    const updateHalfDay = (roll, field, val) => {
        setHalfDayConfig((prev) => ({
            ...prev,
            [roll]: { half: "first", ...prev[roll], [field]: val },
        }));
    };
    const getHalfConfig = (roll) => halfDayConfig[roll] || { half: "first" };
    const halfDayLabel = (cfg) => (cfg.half === "first" ? "1st Half" : "2nd Half");

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
            late: 0,
            halfday: 0
        };

        filteredData.forEach(row => {
            const action = row.attendanceAction?.toLowerCase();
            const onLeave = leaveRollSet.has(String(row.rollNumber));
            // No attendance marked yet → default to "leave" when an approved leave exists, else "present".
            // If attendance already marked, respect the saved value (teacher can still change it).
            let status;
            if (!action || action === "no data") {
                status = onLeave ? "leave" : "present";
            } else {
                status = action;
            }

            initialActions[row.rollNumber] = status;
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });

        setSelectedActions(initialActions);
        setAttendanceData(counts);
    }, [filteredData, leaveRollSet]);

    const handleAttendanceChange = (rollNumber, value) => {
        if (!canModifyAttendance) return;
        if (value === "halfday") {
            setHalfDayConfig((prev) =>
                prev[rollNumber] ? prev : { ...prev, [rollNumber]: { half: "first" } }
            );
        }
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

            if (status === "halfday") {
                const cfg = getHalfConfig(rollNumber);
                return {
                    rollNumber,
                    status: "HalfDay",
                    half: cfg.half === "first" ? "FirstHalf" : "SecondHalf",
                };
            }

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
        if (!canModifyAttendance) return;
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (!canModifyAttendance) return;
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
            case "halfday":
                return "#D97706";
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

    // Approved leaves for the selected date — used to pre-select "Leave".
    useEffect(() => {
        const fetchStudentsOnLeave = async () => {
            try {
                const res = await axios.get(StudentsOnLeaveToday, {
                    params: { fromDate: formattedDate, toDate: formattedDate },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLeaveStudents(Array.isArray(res.data?.data) ? res.data.data : []);
            } catch (error) {
                console.error("StudentsOnLeaveToday failed:", error);
                setLeaveStudents([]);
            }
        };
        fetchStudentsOnLeave();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formattedDate]);

    const fetchAttendanceTable = async () => {
        setAttendanceDataLoading(true);
        try {
            const res = await axios.get(fetchAttendance, {
                params: {
                    date: formattedDate,
                    grade: selectedGradeSign || grades?.[0]?.sign || "",
                    section: selectedSection || "all",
                    status: selectedFilter || "overall",
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
                    rollNumber: rollNumber,
                    userType: userType,
                    date: formattedDate,
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
        if (!canCreate) return;
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
        if (!canEdit) return;
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
        <Box sx={{ backgroundColor: "#F6F6F8", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{
                position: "fixed",
                top: "60px",
                left: isExpanded ? "479px" : "298px",
                right: 0,
                backgroundColor: "#f2f2f2",
                px: 2,
                pb: 0.5,
                pt:0.5,
                borderBottom: "1px solid #ddd",
                borderTop: "1px solid #ddd",
                zIndex: 1200,
                transition: "left 0.3s ease-in-out",
            }}>
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

                                <Box sx={{ display: "inline-flex", ml: "34px", mt: "1px" }}>
                                    <Box
                                        ref={dateAnchorRef}
                                        onClick={handleOpen}
                                        sx={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}
                                    >
                                        <CalendarMonthIcon sx={{ fontSize: "18px", mr: "5px", color: "#555" }} />
                                        <Typography sx={{ fontSize: "12px", color: "#777", borderBottom: "1px solid #000", lineHeight: 1.2 }}>
                                            {dayjs(selectedDate).format('DD MMMM YYYY')}
                                        </Typography>
                                    </Box>

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
                                                slotProps={{
                                                    textField: { sx: { display: "none" } },
                                                    popper: {
                                                        anchorEl: () => dateAnchorRef.current,
                                                        placement: "bottom-start",
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </ThemeProvider>
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
                                                backgroundColor: "#000",
                                                color: "#fff",
                                            }}
                                        />
                                    )}
                                    ListboxProps={{
                                        sx: {
                                            maxHeight: 200,
                                            overflowY: "auto",
                                            "&::-webkit-scrollbar": { width: "6px" },
                                            "&::-webkit-scrollbar-thumb": {
                                                backgroundColor: "rgba(255,255,255,0.3)",
                                                borderRadius: "6px",
                                            },
                                            "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
                                        },
                                    }}
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
                                                backgroundColor: "#000",
                                                color: "#fff",
                                            }}
                                        />
                                    )}
                                    ListboxProps={{
                                        sx: {
                                            maxHeight: 200,
                                            overflowY: "auto",
                                            "&::-webkit-scrollbar": { width: "6px" },
                                            "&::-webkit-scrollbar-thumb": {
                                                backgroundColor: "rgba(255,255,255,0.3)",
                                                borderRadius: "6px",
                                            },
                                            "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
                                        },
                                    }}
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
                                                backgroundColor: '#000',
                                                color: '#fff',
                                            }}
                                        />
                                    )}
                                    ListboxProps={{
                                        sx: {
                                            maxHeight: 200,
                                            overflowY: "auto",
                                            "&::-webkit-scrollbar": { width: "6px" },
                                            "&::-webkit-scrollbar-thumb": {
                                                backgroundColor: "rgba(255,255,255,0.3)",
                                                borderRadius: "6px",
                                            },
                                            "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
                                        },
                                    }}
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
                                    onClick={handleExport}
                                    startIcon={<ExitToAppIcon sx={{ fontSize: "18px" }} />}
                                    sx={{
                                        width: "100%",
                                        py: 0.6,
                                        borderRadius: "50px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "13px",
                                        color: "#E25C2A",
                                        backgroundColor: "#FDEDE6",
                                        border: "1px solid #F6C9B5",
                                        boxShadow: "none",
                                        mb: 1,
                                        "&:hover": {
                                            backgroundColor: "#FBE0D3",
                                            border: "1px solid #F0B79C",
                                            boxShadow: "none",
                                        },
                                    }}>
                                    Export
                                </Button>
                            </Grid>
                            <Grid
                                size={{
                                    lg: 2.4
                                }}>
                                {canModifyAttendance && (
                                    <>
                                        <Button
                                            onClick={handleUploadClick}
                                            startIcon={<AddIcon sx={{ fontSize: "18px" }} />}
                                            sx={{
                                                width: "100%",
                                                py: 0.6,
                                                borderRadius: "50px",
                                                textTransform: "none",
                                                fontWeight: 600,
                                                fontSize: "13px",
                                                color: "#fff",
                                                backgroundColor: "#15233E",
                                                boxShadow: "none",
                                                mb: 1,
                                                "&:hover": {
                                                    backgroundColor: "#0F1A2E",
                                                    boxShadow: "none",
                                                },
                                            }}
                                        >
                                            Upload
                                        </Button>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            style={{ display: "none" }}
                                        />
                                    </>
                                )}
                            </Grid>
                        </Grid>

                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ pt: "78px", pb: 2, px: 2, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                {/* <Box hidden={value !== 0}> */}
                <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 1.5,
                            mb: 1.5,
                        }}
                    >
                        {selectedSection?.toLowerCase() !== "all" && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {[
                                    { label: "Present", value: attendanceData.present, color: "#018535", bg: "#E7F6EE" },
                                    { label: "Absent", value: attendanceData.absent, color: "#D84600", bg: "#FBEAE1" },
                                    { label: "Leave", value: attendanceData.leave, color: "#9E35C7", bg: "#F5E9FB" },
                                    { label: "Late", value: attendanceData.late, color: "#3D49D6", bg: "#E8EAFB" },
                                    { label: "Half Day", value: attendanceData.halfday, color: "#D97706", bg: "#FEF3E2" },
                                ].map((s) => (
                                    <Box
                                        key={s.label}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.7,
                                            backgroundColor: s.bg,
                                            border: `1px solid ${s.color}22`,
                                            borderRadius: "10px",
                                            px: 1.2,
                                            py: 0.5,
                                        }}
                                    >
                                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: s.color }} />
                                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                                            {s.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: "13px", fontWeight: 800, color: s.color }}>
                                            {s.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex" }}>
                        {attendanceDataLoading ? (
                            <Box
                                sx={{
                                    flex: 1,
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 2,
                                }}
                            >
                                <CircularProgress size={38} sx={{ color: "#307EB9" }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#64748B" }}>
                                    Fetching attendance records, please wait...
                                </Typography>
                            </Box>

                        ) : finalData.length === 0 ? (
                            <Box
                                sx={{
                                    flex: 1,
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                }}
                            >
                                <EventAvailableIcon sx={{ fontSize: 46, color: "#CBD5E1" }} />
                                <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#475569" }}>
                                    No students found
                                </Typography>
                                <Typography sx={{ fontSize: "12.5px", color: "#94A3B8" }}>
                                    Try a different class, section or search term.
                                </Typography>
                            </Box>

                        ) : (
                            <TableContainer
                                sx={{
                                    border: "1px solid #E8DDEA",
                                    borderRadius: "14px",
                                    flex: 1,
                                    minHeight: 0,
                                    width: "100%",
                                    overflow: "auto",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                                }}
                            >
                                <Table
                                    stickyHeader
                                    size="small"
                                    aria-label="attendance table"
                                    sx={{
                                        minWidth: '100%',
                                        "& .MuiTableCell-body": { py: 1 },
                                        "& .MuiTableCell-head": { py: 1.2 },
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#F8F4FB", fontWeight: 700, fontSize: "12.5px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                                S.No
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#F8F4FB", fontWeight: 700, fontSize: "12.5px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                                Roll Number
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderRight: 1,
                                                    borderColor: "#E8DDEA",
                                                    textAlign: "center",
                                                    backgroundColor: "#F8F4FB",
                                                    fontWeight: 700,
                                                    fontSize: "12.5px",
                                                    color: "#475569",
                                                }}
                                            >
                                                <Button
                                                    onClick={() => setSortByNameAsc((prev) => !prev)}
                                                    sx={{
                                                        gap: "4px",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.3px",
                                                        color: "#475569",
                                                        fontWeight: 700,
                                                        fontSize: "12.5px",
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

                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#F8F4FB", fontWeight: 700, fontSize: "12.5px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                                Class
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#F8F4FB", fontWeight: 700, fontSize: "12.5px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                                Profile
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#F8F4FB", fontWeight: 700, fontSize: "12.5px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                                Attendance Action
                                            </TableCell>
                                            <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#F8F4FB", fontWeight: 700, fontSize: "12.5px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                                Current Status
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "center", backgroundColor: "#F8F4FB", fontWeight: 700, fontSize: "12.5px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                                Attendance%
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {finalData.map((row, index) => (
                                            <TableRow
                                                key={row.rollNumber}
                                                sx={{
                                                    backgroundColor: index % 2 === 0 ? "#fff" : "#FBFAFC",
                                                    transition: "background-color 0.15s",
                                                    "&:hover": { backgroundColor: "#F3F0FA" },
                                                }}
                                            >
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", color: "#64748B" }}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                                                    {row.rollNumber}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13.5px", fontWeight: 600, color: "#1E293B" }}>
                                                    {row.studentName}
                                                </TableCell>
                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", fontSize: "13px", color: "#475569" }}>{row.grade} - {row.section}</TableCell>
                                                <TableCell
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#E8DDEA",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <Tooltip title="View picture" arrow>
                                                        <Avatar
                                                            src={row.studentPicture}
                                                            onClick={() => handleViewClick(row.studentPicture)}
                                                            sx={{
                                                                width: 38,
                                                                height: 38,
                                                                margin: "0 auto",
                                                                cursor: "pointer",
                                                                border: "2px solid #E2E8F0",
                                                                transition: "0.2s",
                                                                "&:hover": { borderColor: "#307EB9", transform: "scale(1.05)" },
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </TableCell>

                                                <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", pl: 1, py: 0.5, pr: 0.5, width: "210px" }}>
                                                    <FormControl sx={{ width: "100%" }}>
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
                                                                                    size="small"
                                                                                    disabled={!canModifyAttendance}
                                                                                    sx={{
                                                                                        p: "3px",
                                                                                        ml: "4px",
                                                                                        color: "#777",
                                                                                        "&.Mui-checked": {
                                                                                            color: getColor(status),
                                                                                        },
                                                                                    }}
                                                                                />
                                                                            }
                                                                            label={status.charAt(0).toUpperCase() + status.slice(1)}
                                                                            sx={{ marginRight: "0", my: 0, "& .MuiTypography-root": { fontSize: "13px" } }}
                                                                        />
                                                                    </Grid>
                                                                ))}
                                                                <Grid size={{ lg: 12 }}>
                                                                    <FormControlLabel
                                                                        value="halfday"
                                                                        control={
                                                                            <Radio
                                                                                size="small"
                                                                                disabled={!canModifyAttendance}
                                                                                sx={{
                                                                                    p: "3px",
                                                                                    ml: "4px",
                                                                                    color: "#777",
                                                                                    "&.Mui-checked": { color: getColor("halfday") },
                                                                                }}
                                                                            />
                                                                        }
                                                                        label="Half Day"
                                                                        sx={{ marginRight: "0", my: 0, "& .MuiTypography-root": { fontSize: "13px" } }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </RadioGroup>

                                                        {selectedActions[row.rollNumber] === "halfday" && (() => {
                                                            const cfg = getHalfConfig(row.rollNumber);
                                                            return (
                                                                <Box
                                                                    sx={{
                                                                        mt: 0.5,
                                                                        p: 0.8,
                                                                        borderRadius: "8px",
                                                                        backgroundColor: "#FFF7ED",
                                                                        border: "1px solid #FED7AA",
                                                                    }}
                                                                >
                                                                    <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9A3412", mb: 0.4 }}>
                                                                        Which Half
                                                                    </Typography>
                                                                    <Box sx={{ display: "flex", gap: 0.5, mb: 0.7 }}>
                                                                        {[
                                                                            { key: "first", label: "1st Half" },
                                                                            { key: "second", label: "2nd Half" },
                                                                        ].map((h) => (
                                                                            <Box
                                                                                key={h.key}
                                                                                onClick={() => updateHalfDay(row.rollNumber, "half", h.key)}
                                                                                sx={{
                                                                                    flex: 1,
                                                                                    textAlign: "center",
                                                                                    cursor: "pointer",
                                                                                    fontSize: "10.5px",
                                                                                    fontWeight: 700,
                                                                                    py: 0.4,
                                                                                    borderRadius: "20px",
                                                                                    border: "1px solid",
                                                                                    borderColor: cfg.half === h.key ? "#D97706" : "#E5E7EB",
                                                                                    backgroundColor: cfg.half === h.key ? "#D97706" : "#fff",
                                                                                    color: cfg.half === h.key ? "#fff" : "#6B7280",
                                                                                    transition: "0.2s",
                                                                                }}
                                                                            >
                                                                                {h.label}
                                                                            </Box>
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })()}
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
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            minWidth: "78px",
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
                                                                    case "halfday":
                                                                        return "#D97706";
                                                                    default:
                                                                        return "#ccc";
                                                                }
                                                            })(),
                                                            color: "#fff",
                                                            fontSize: "12px",
                                                            fontWeight: 700,
                                                            borderRadius: "30px",
                                                            px: 1.5,
                                                            py: 0.5,
                                                        }}
                                                    >
                                                        {(selectedActions[row.rollNumber] ||
                                                            (row.attendanceAction?.toLowerCase() === "no data" ? "present" : row.attendanceAction))?.toLowerCase() === "halfday"
                                                            ? "Half Day"
                                                            : capitalizeFirstLetter(
                                                                selectedActions[row.rollNumber] ||
                                                                (row.attendanceAction?.toLowerCase() === "no data" ? "Present" : row.attendanceAction)
                                                            )}
                                                    </Box>
                                                    {selectedActions[row.rollNumber] === "halfday" && (
                                                        <Typography sx={{ fontSize: "10.5px", color: "#9A3412", fontWeight: 600, mt: 0.4 }}>
                                                            {halfDayLabel(getHalfConfig(row.rollNumber))}
                                                        </Typography>
                                                    )}
                                                    {leaveRollSet.has(String(row.rollNumber)) && (
                                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.3, mt: 0.5 }}>
                                                            <CheckCircleIcon sx={{ fontSize: 13, color: "#16A34A" }} />
                                                            <Typography sx={{ fontSize: 10.5, color: "#16A34A", fontWeight: 600 }}>Leave Applied</Typography>
                                                        </Box>
                                                    )}
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

                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            fontSize: "13px",
                                                            fontWeight: 700,
                                                            color:
                                                                Number(row.attendancePercent) >= 75 ? "#018535" :
                                                                    Number(row.attendancePercent) >= 50 ? "#D97706" :
                                                                        "#D84600",
                                                        }}
                                                    >
                                                        {row.attendancePercent}%
                                                    </Typography>
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
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 2.5 }}>
                        {canMarkNew &&
                            <Button
                                onClick={handleSaveAttendance}
                                variant="contained"
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    color: websiteSettings.textColor,
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    py: 0.7,
                                    px: 4,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                                }}
                            >
                                Save Attendance
                            </Button>
                        }

                        {canMarkUpdate &&
                            <Button
                                onClick={handleUpdateAttendance}
                                variant="contained"
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    color: websiteSettings.textColor,
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    py: 0.7,
                                    px: 4,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                                }}
                            >
                                Update Attendance
                            </Button>
                        }
                        {canModifyAttendance &&

                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                sx={{
                                    backgroundColor: '#fff',
                                    textTransform: 'none',
                                    color: '#334155',
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    py: 0.7,
                                    px: 4,
                                    borderColor: "#CBD5E1",
                                    boxShadow: "none",
                                    "&:hover": { borderColor: "#94A3B8", backgroundColor: "#F8FAFC" },
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
