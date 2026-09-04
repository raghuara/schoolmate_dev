import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, keyframes, Paper, Popover, Slide, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, ThemeProvider, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import { attendanceSpecific, attendanceTable, barchart, piechart, sectionsDropdown } from "../../Api/Api";
import { TableRowsSkeleton } from "../InnerLoader";
import FullWidthBarChartPage from "../Chart/FullWidthBarChart";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StyledPieChart from "../Chart/StyledPieChart";
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from "react-redux";
import { DASH, RADIUS } from "../DashBoardComps/dashboardTheme";
import AttendanceOverviewSkeleton from "./AttendanceComps/AttendanceOverviewSkeleton";
import '../../Css/Page.css'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import * as XLSX from 'xlsx';
import SimpleBarChartPage from "../Chart/SimpleBarChart";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ImageIcon from '@mui/icons-material/Image';
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import DownloadIcon from '@mui/icons-material/Download';
import HomeworkStatusPage from "./AttendanceComps/HomeworkStatusPage";
import DiaryStatusPage from "./AttendanceComps/DiaryStatusPage";
import UniformStatusPage from "./AttendanceComps/UniformStatusPage";
import { selectGrades } from "../../Redux/Slices/DropdownController";

export default function AttendancePage() {
    const today = dayjs().format('DD-MM-YYYY');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [dashBoardData, setDashBoardData] = useState();
    const navigate = useNavigate();
    const token = '123';
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [teachersGraphData, setTeachersGraphData] = useState([]);
    const [pieChartData, setPieChartData] = useState(null);
    const [pieChartData1, setPieChartData1] = useState(null);
    const [totalSchoolStudents, setTotalSchoolStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedDate1, setSelectedDate1] = useState();
    const [formattedDate, setFormattedDate] = useState(today);
    const [formattedDate1, setFormattedDate1] = useState(today);
    const [sections, setSections] = useState([]);
    const [openCal, setOpenCal] = useState(false);
    const [openCal1, setOpenCal1] = useState(false);
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const handleOpen1 = () => setOpenCal1(true);
    const handleClose1 = () => setOpenCal1(false);
    const [pageValue, setPageValue] = useState("");
    const [anchorElSection, setAnchorElSection] = useState(null);
    const [anchorElFilter, setAnchorElFilter] = useState(null);
    const [detailedGraphData, setDetailedGraphData] = useState([]);
    const [sectionDetails, setSectionDetails] = useState([]);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [selectedClassSection, setSelectedClassSection] = useState('A1');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const [value, setValue] = useState(0);
    const [selectedValue, setSelectedValue] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState("overall");
    const [selectedPage, setSelectedPage] = useState("Attendance");
    const tabValues = ["overall", "below75", "above75"];
    const [openDetailedDialog, setOpenDetailedDialog] = useState(false);
    const [attendanceDetails, setAttendanceDetails] = useState([]);
    const [attendanceTableDetails, setAttendanceTableDetails] = useState([]);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setFormattedDate1(formattedDate);
    }, [formattedDate]);

    const handleChangePercentage = (event, newValue) => {
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


    const handleDetailedDialogueClose = () => {
        const today = dayjs();
        const formattedToday = today.format('DD-MM-YYYY');

        setOpenDetailedDialog(false);
        setSelectedClassSection("A1");
        setValue(0);
        setSelectedValue("overall")
        setSelectedFilter("overall");
        setFormattedDate(formattedToday);
        setFormattedDate1(formattedToday);
        setSelectedDate(today);
        setSelectedDate1(today);
    };

    const handleClickSelection = (event, value) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleClick = (event, value) => {
        setSelectedClass(value);
        setAnchorEl(anchorEl ? null : event.currentTarget);
        setOpenDetailedDialog(true);
        fetchSections(value);
        setFormattedDate1(formattedDate)
        fetchDetailedAttendanceData(formattedDate, value, selectedClassSection || "A1");
        fetchDetailedTable(formattedDate)
    };

    const handleOpenPage = (page) => {
        navigate("irregular", { state: { pageValue: page } });
        setPageValue(page)
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'class-dropdown-popover' : undefined;

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

    const slideInFromBottom = keyframes`
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
    `;

    const handleExport = () => {
        const header = [
            'S.No',
            'Roll Number',
            'Student Name',
            'Class',
            'Section',
            'Attendance Status',
            'Attendance %'
        ];

        const data = attendanceTableDetails.map((row, index) => [
            index + 1,
            row.rollNumber,
            row.studentName,
            selectedClass,
            row.section,
            row.attendanceStatus,
            row.attendancePercent
        ]);

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

        const fileName = `Detailed attendance ${selectedClass} - ${selectedClassSection}.xlsx`;

        XLSX.writeFile(wb, fileName);
    };

    useEffect(() => {
        fetchAllClassData()
        fetchAllPieChartData()
    }, [formattedDate, selectedClass]);

    const fetchAllClassData = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(barchart, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    date: formattedDate,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setTeachersGraphData(res.data.totalAttendanceGraph);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        };
    }

    const fetchAllPieChartData = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(piechart, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    date: formattedDate,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setPieChartData(res.data.nurseryAndPrimary);
            setPieChartData1(res.data.secondary);
            setTotalSchoolStudents(res.data.totalSchoolStudents);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        };
    }

    const fetchSections = async (gradeValue) => {
        setIsLoading(true);
        try {
            const res = await axios.get(sectionsDropdown, {
                params: {
                    grade: gradeValue,
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

    const handleClassChangeSection = (event, section) => {
        setSelectedClassSection(section);
        fetchDetailedAttendanceData(formattedDate1, selectedClass, section);
        setAnchorElSection(null)
    };

    const handleChangeFilter = (value) => {
        setSelectedFilter(value);
        setAnchorElFilter(null)
    };

    const fetchDetailedAttendanceData = async (Date, selectedClassValue, selectedClassSectionValue) => {
        setIsLoading(true);
        try {
            const res = await axios.get(attendanceSpecific, {
                params: {
                    date: Date,
                    grade: selectedClassValue,
                    section: selectedClassSectionValue || "A1",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setDetailedGraphData(res.data.detailedAttendance);
            setSectionDetails(res.data.sectionDetails);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetailedTable(formattedDate1)
    }, [formattedDate, selectedClass, selectedClassSection, selectedValue, selectedFilter])

    const fetchDetailedTable = async (Date) => {
        setIsLoading(true);
        try {
            const res = await axios.get(attendanceTable, {
                params: {
                    date: Date,
                    grade: selectedClass || "prekg",
                    section: selectedClassSection || "A1",
                    percentage: selectedValue || "overall",
                    status: selectedFilter || "overall",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAttendanceDetails(res.data);
            setAttendanceTableDetails(res.data.data);
        } catch (error) {
            console.error(error);
            setAttendanceTableDetails([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getColorForCategory = (category) => {
        switch (category) {
            case "Nursery": return "#4A2086";
            case "Primary": return "#8600BB";
            case "Secondary": return "#CE5C00";
            default: return "#999";
        }
    };

    const handleClickSection = (event, value) => {
        setAnchorElSection(anchorElSection ? null : event.currentTarget);
    };

    const handlefilter = (event, value) => {
        setAnchorElFilter(anchorElFilter ? null : event.currentTarget);
    };
    const handleCloseSectionPopover = () => {
        setAnchorElSection(null);
    };
    const handleCloseFilter = () => {
        setAnchorElFilter(null);
    };

    const handleClickSectionButton = (event, value) => {
        setAnchorElSection(anchorElSection ? null : event.currentTarget);
    };

    const openSection = Boolean(anchorElSection);
    const idSection = open ? 'class-dropdown-popover' : undefined;

    const openFilter = Boolean(anchorElFilter);
    const idFilter = open ? 'class-dropdown-popover' : undefined;

    return (
        <Box sx={{ backgroundColor: DASH.canvas, width: "100%" }}>
            <Box sx={{ backgroundColor: DASH.canvas, borderRadius: "10px 10px 10px 0px" }}>
                <Box sx={{ p: 2, }}>
                    <Grid container spacing={2}>
                        <Grid
                            size={{
                                xs: 12,
                                lg: 6
                            }}>
                            <Box>
                                {(!selectedPage || selectedPage === "Attendance") && (
                                    <Box>
                                        <Typography sx={{ fontSize: "20px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                            Students Attendance
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                            Who is present today, class by class
                                        </Typography>
                                    </Box>
                                )}
                                {selectedPage === "Homework" &&
                                    <Box>
                                        <Typography sx={{ fontSize: "20px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                            Homework Completion Status
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                            Which classes have marked homework
                                        </Typography>
                                    </Box>
                                }
                                {selectedPage === "Diary" &&
                                    <Box>
                                        <Typography sx={{ fontSize: "20px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                            Diary Signature Status
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                            Diaries signed by parents
                                        </Typography>
                                    </Box>
                                }
                                {selectedPage === "Dress Code" &&
                                    <Box>
                                        <Typography sx={{ fontSize: "20px", fontWeight: 700, color: DASH.ink, lineHeight: 1.2 }}>
                                            Dress Code Status
                                        </Typography>
                                        <Typography sx={{ fontSize: "11.5px", color: DASH.muted, mt: 0.2 }}>
                                            Uniform checks for today
                                        </Typography>
                                    </Box>
                                }
                                {selectedPage === "Attendance" &&
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
                                                        setSelectedDate1(newValue);
                                                        setFormattedDate1(newFormattedDate);
                                                        handleClose();
                                                    }}
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
                                        <Box
                                            onClick={handleOpen}
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.7,
                                                mt: 0.6,
                                                height: 28,
                                                px: 1.2,
                                                borderRadius: RADIUS,
                                                bgcolor: "#fff",
                                                border: `1px solid ${DASH.line}`,
                                                cursor: "pointer",
                                                transition: "border-color .2s ease, background-color .2s ease",
                                                "&:hover": { bgcolor: DASH.lineSoft, borderColor: DASH.faint },
                                            }}
                                        >
                                            <CalendarMonthIcon sx={{ fontSize: 15, color: DASH.muted }} />
                                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: DASH.ink }}>
                                                {dayjs(selectedDate).format('DD MMMM YYYY')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                            </Box>
                        </Grid>
                        <Grid
                            sx={{ display: "flex", justifyContent: "end" }}
                            size={{
                                xs: 12,
                                lg: 6
                            }}>

                            {(!selectedPage || selectedPage === "Attendance") && (
                                <Box sx={{ display: "flex", }}>
                                    <Link to="addattendance">
                                        <Button
                                            variant="contained"
                                            disableElevation
                                            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                                            sx={{
                                                textTransform: "none",
                                                fontSize: "12.5px",
                                                fontWeight: 700,
                                                height: 34,
                                                px: 2,
                                                borderRadius: RADIUS,
                                                boxShadow: "none",
                                                backgroundColor: websiteSettings.mainColor,
                                                color: websiteSettings.textColor,
                                                "&:hover": { backgroundColor: websiteSettings.mainColor, filter: "brightness(0.95)", boxShadow: "none" },
                                            }}
                                        >
                                            Attendance
                                        </Button>

                                    </Link>
                                    {/* <AddAttendancePage open={isDialog3Open} selectedClass={selectedClassValue} onClose={handleClose3} /> */}
                                    {/* <Link to="export">
                                        <Button
                                            sx={{
                                                marginLeft: "20px",
                                                textTransform: "none",
                                                height: "2rem",
                                                color: "#000",
                                                borderColor: "#000",
                                                mr:2
                                            }}
                                            variant="outlined"
                                        >
                                            <DownloadIcon style={{ marginRight: "8px", fontSize: "20px" }} />
                                            Attendance
                                        </Button>
                                    </Link> */}
                                </Box>
                            )}
                            {/* <Autocomplete
                                disablePortal
                                options={["Attendance", "Homework", "Diary", "Dress Code"]}
                                value={selectedPage}
                                onChange={(event, value) => setSelectedPage(value)}
                                sx={{ width: "160px", mr: 3 }}
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
                                    <li style={{ fontSize: "14px" }}
                                        {...props}
                                        className="classdropdownOptions"
                                    >
                                        {option}
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

                                                fontSize: "14px",
                                            },
                                        }}
                                    />
                                )}
                            /> */}
                        </Grid>
                    </Grid>
                </Box>
                {(!selectedPage || selectedPage === "Attendance") && isLoading && (
                    <AttendanceOverviewSkeleton />
                )}

                {(!selectedPage || selectedPage === "Attendance") && !isLoading && (
                    <Box>
                        <Box sx={{ backgroundColor: "#fff", mx: 2, borderRadius: RADIUS, border: `1px solid ${DASH.line}`, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
                                <Grid container spacing={2} sx={{width:"100%"}}>
                                    <Grid
                                        size={{
                                            xs: 12,
                                            lg: 6
                                        }}>
                                        <Box px={2} pt={2}>
                                            <Typography sx={{ fontWeight: 700, fontSize: "15px", color: DASH.ink }}>
                                                Total Attendance Graph
                                            </Typography>

                                            <Typography sx={{ fontSize: "11.5px", color: DASH.muted }}>
                                                Attendance history for the selected class
                                            </Typography>

                                        </Box>
                                    </Grid>
                                    <Grid
                                        sx={{ display: "flex", justifyContent: "end" }}
                                        size={{
                                            xs: 12,
                                            lg: 6
                                        }}>
                                        <Box sx={{ pt: 2, pr: 2 }}>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    textTransform: "none",
                                                    height: "2rem",
                                                    width: "228px",
                                                    boxShadow: "none",
                                                    backgroundColor: "#fff",
                                                    color: "#000",
                                                    fontWeight: "600",
                                                    border: "1px solid #a9a9a9",
                                                    "&:hover": {
                                                        boxShadow: "none",
                                                        backgroundColor: "#f5f5f5"
                                                    }
                                                }}
                                                onClick={handleClickSelection}
                                            >
                                                Select Class <ArrowDropDownIcon />
                                            </Button>

                                            <Popover
                                                id={id}
                                                open={open}
                                                anchorEl={anchorEl}
                                                onClose={handleClosePopover}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'center',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'center',
                                                }}
                                            >
                                                <Box sx={{ padding: 1.3, backgroundColor: '#000', color: '#fff', borderRadius: '3px' }}>
                                                    {Object.entries(
                                                        grades.reduce((acc, grade) => {
                                                            if (!acc[grade.category]) acc[grade.category] = [];
                                                            acc[grade.category].push(grade);
                                                            return acc;
                                                        }, {})
                                                    ).map(([category, categoryGrades]) => (
                                                        <Box key={category} sx={{ mb: 0.2 }}>
                                                            <Typography variant="subtitle1" sx={{ fontSize: "10px" }}>
                                                                {category}
                                                            </Typography>

                                                            <ToggleButtonGroup
                                                                value={selectedClass}
                                                                exclusive
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    // py: 0.5,
                                                                    width: "200px",
                                                                    gap: "5px",
                                                                }}
                                                            >
                                                                {categoryGrades.map((grade) => (
                                                                    <ToggleButton
                                                                        key={grade.id}
                                                                        className="popoverSelection"
                                                                        value={grade.sign}
                                                                        onClick={(event) => handleClick(event, grade.sign)}
                                                                        sx={{
                                                                            flex: "0 0 auto"
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            sx={{ backgroundColor: getColorForCategory(grade.category) }}
                                                                            className="Popoverdot"
                                                                        />
                                                                        {grade.sign}
                                                                    </ToggleButton>
                                                                ))}
                                                            </ToggleButtonGroup>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Popover>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Box px={2} pb={2} sx={{ height: 260 }}>
                                <FullWidthBarChartPage style={{ width: '100%', height: '100%' }} teachersData={teachersGraphData} />
                            </Box>
                        </Box>

                        <Grid container spacing={2} sx={{ px: 2, mt: 2, mb: 2, alignItems: "stretch" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 12,
                                    lg: 6
                                }}>
                                <Box sx={{ backgroundColor: "#fff", px: 2, pb: 2, borderRadius: RADIUS, border: `1px solid ${DASH.line}`, boxShadow: "0 1px 3px rgba(16,24,40,0.06)", height: "100%", minHeight: 320, boxSizing: "border-box" }}>
                                    <Typography pt={1.5} pb={0.5} sx={{ fontWeight: 700, fontSize: "15px", color: DASH.ink }}>
                                        Irregular attendees{" "}
                                        <Box component="span" sx={{ fontSize: "11.5px", fontWeight: 600, color: DASH.muted }}>Overall</Box>
                                    </Typography>

                                    <Box onClick={() => handleOpenPage(0)} sx={{
                                        backgroundColor: "#F4EBF0", p: 3, position: 'relative', borderRadius: "7px",
                                        cursor: "pointer", mt: 2,
                                        '&:hover': {
                                            '.arrowIcon': {
                                                opacity: 1,
                                            },
                                        }
                                    }}>
                                        <Box
                                            sx={{
                                                width: '5px',
                                                backgroundColor: '#D5004D',
                                                height: '100%',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                borderTopLeftRadius: '5px',
                                                borderBottomLeftRadius: '5px',
                                            }}
                                        />
                                        <Typography sx={{ fontWeight: "600", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Absent Students
                                            <Box sx={{ display: "flex", alignItems: 'center' }}>

                                                <ArrowForwardIcon className="arrowIcon" sx={{ opacity: 0, transition: 'opacity 0.3s ease', color: "#D5004D" }} />
                                            </Box>
                                        </Typography>
                                    </Box>

                                    {/* <IrregularAttendeesPage open={isDialog2Open} onClose={handleClose2} PageValue={pageValue} /> */}

                                    <Box onClick={() => handleOpenPage(1)} sx={{
                                        backgroundColor: "#fcf7fd", p: 3, position: 'relative', borderRadius: "7px",
                                        cursor: "pointer", mt: 2.5,
                                        '&:hover': {
                                            '.arrowIcon': {
                                                opacity: 1,
                                            },
                                        }
                                    }}>
                                        <Box
                                            sx={{
                                                width: '5px',
                                                backgroundColor: '#8A09BD',
                                                height: '100%',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                borderTopLeftRadius: '5px',
                                                borderBottomLeftRadius: '5px',
                                            }}
                                        />
                                        <Typography sx={{ fontWeight: "600", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Leave Students
                                            <Box sx={{ display: "flex", alignItems: 'center' }}>

                                                <ArrowForwardIcon className="arrowIcon" sx={{ opacity: 0, transition: 'opacity 0.3s ease', color: "#5964DB" }} />
                                            </Box>
                                        </Typography>
                                    </Box>

                                    <Box onClick={() => handleOpenPage(2)} sx={{
                                        backgroundColor: "#f9f9fe", p: 3, position: 'relative', borderRadius: "7px",
                                        cursor: "pointer", mt: 2.5,
                                        '&:hover': {
                                            '.arrowIcon': {
                                                opacity: 1,
                                            },
                                        }
                                    }}>
                                        <Box
                                            sx={{
                                                width: '5px',
                                                backgroundColor: '#5964DB',
                                                height: '100%',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                borderTopLeftRadius: '5px',
                                                borderBottomLeftRadius: '5px',
                                            }}
                                        />
                                        <Typography sx={{ fontWeight: "600", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Late Students
                                            <Box sx={{ display: "flex", alignItems: 'center' }}>

                                                <ArrowForwardIcon className="arrowIcon" sx={{ opacity: 0, transition: 'opacity 0.3s ease', color: "#8A09BD" }} />
                                            </Box>
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 12,
                                    lg: 6
                                }}>
                                <Box sx={{ backgroundColor: "#fff", px: 2, pb: 2, borderRadius: RADIUS, border: `1px solid ${DASH.line}`, boxShadow: "0 1px 3px rgba(16,24,40,0.06)", height: "100%", minHeight: 320, boxSizing: "border-box" }}>
                                    <Typography pt={1.5} pb={0.5} sx={{ fontWeight: 700, fontSize: "15px", color: DASH.ink }}>
                                        Students Counts{" "}
                                        <Box component="span" sx={{ fontSize: "11.5px", fontWeight: 600, color: DASH.muted }}>Overall</Box>
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid
                                            size={{
                                                xs: 12,
                                                sm: 12,
                                                md: 6,
                                                lg: 6
                                            }}>
                                            <StyledPieChart pieData={pieChartData} primary={true} />
                                        </Grid>
                                        <Grid
                                            size={{
                                                xs: 12,
                                                sm: 12,
                                                md: 6,
                                                lg: 6
                                            }}>
                                            <StyledPieChart pieData={pieChartData1} primary={false} />
                                        </Grid>
                                        <Grid
                                            sx={{ display: "flex", justifyContent: "center", marginTop: "-20px" }}
                                            size={12}>
                                            <Typography sx={{ fontSize: "14px" }}>
                                                Total Students (Nursery, Primary & Secondary Classes) - {totalSchoolStudents}
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            sx={{ display: "flex", justifyContent: "center", marginTop: "-10px" }}
                                            size={12}>
                                            <Typography sx={{ fontSize: "16px", fontWeight: "600", display: "flex" }}>
                                                <Box sx={{ backgroundColor: "#018535", width: "12px", height: "12px", marginTop: "5px", marginRight: "5px", marginLeft: "20px" }} className="Popoverdot" />
                                                Present
                                            </Typography>
                                            <Typography sx={{ fontSize: "16px", fontWeight: "600", display: "flex" }}>
                                                <Box sx={{ backgroundColor: "#D84600", width: "12px", height: "12px", marginTop: "5px", marginRight: "5px", marginLeft: "20px" }} className="Popoverdot" />
                                                Absent
                                            </Typography>
                                            <Typography sx={{ fontSize: "16px", fontWeight: "600", display: "flex" }}>
                                                <Box sx={{ backgroundColor: "#9E35C7", width: "12px", height: "12px", marginTop: "5px", marginRight: "5px", marginLeft: "20px" }} className="Popoverdot" />
                                                Leave
                                            </Typography>
                                            <Typography sx={{ fontSize: "16px", fontWeight: "600", display: "flex" }}>
                                                <Box sx={{ backgroundColor: "#3D49D6", width: "12px", height: "12px", marginTop: "5px", marginRight: "5px", marginLeft: "20px" }} className="Popoverdot" />
                                                Late
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {selectedPage === "Homework" &&
                    <HomeworkStatusPage />
                }

                {selectedPage === "Diary" &&
                    <DiaryStatusPage />
                }
                {selectedPage === "Dress Code" &&
                    <UniformStatusPage />
                }

            </Box>
            {/* Detailed attendance Popup */}
            <Dialog
                open={openDetailedDialog}
                onClose={handleDetailedDialogueClose}
                fullWidth
                maxWidth="xl"
                sx={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    '& .MuiDialog-paper': {
                        height: isMobile ? 'auto' : isMediumScreen ? '90%' : '110%',
                        paddingBottom: "20px",
                        marginTop: isMobile || isMediumScreen ? '0' : '60px',
                        marginLeft: isMobile ? '8px' : isMediumScreen ? '16px' : 0,
                        marginRight: isMobile ? '8px' : isMediumScreen ? '16px' : 0,
                        marginBottom: isMobile || isMediumScreen ? '0' : 0,
                        borderRadius: isMobile || isMediumScreen ? '16px' : '16px 16px 0px 0px',
                        width: isMobile ? 'calc(100% - 16px)' : isMediumScreen ? 'calc(100% - 32px)' : "100%",
                        overflow: isMobile || isMediumScreen ? 'auto' : 'visible',
                        animation: `${slideInFromBottom} 0.5s ease-out`,
                    },
                }}
            >
                <IconButton
                    edge="top"
                    color="inherit"
                    onClick={handleDetailedDialogueClose}
                    sx={{
                        position: 'absolute',
                        top: '-45px',
                        right: 15,
                        padding: '8px',
                        color: "#fff",
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Box p={3}>
                    {/* {isLoading && <Loader />} */}
                    <Grid container>
                        <Grid
                            sx={{ maxHeight: "85vh", overflowX: "auto" }}
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 3,
                                lg: 3
                            }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                                    Detailed Attendance
                                </Typography>
                                <Box sx={{ display: "flex" }}>
                                    <ThemeProvider theme={darkTheme}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                open={openCal1}
                                                onClose={handleClose1}
                                                value={selectedDate1}
                                                onChange={(newValue) => {
                                                    const newFormattedDate = dayjs(newValue).format('DD-MM-YYYY');
                                                    setSelectedDate(newValue);
                                                    setFormattedDate(newFormattedDate);
                                                    setSelectedDate1(newValue);
                                                    setFormattedDate1(newFormattedDate);
                                                    handleClose();
                                                    fetchDetailedAttendanceData(newFormattedDate, selectedClass, selectedClassSection)
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
                                    <Box onClick={handleOpen1} sx={{ display: "flex", cursor: "pointer", marginLeft: "-12px" }}>
                                        <CalendarMonthIcon sx={{ fontSize: "20px", marginRight: "5px", marginTop: "10px" }} />
                                        <Typography sx={{ fontSize: "12px", color: "#777", borderBottom: "1px solid #000", marginTop: "10px" }}>
                                            {dayjs(selectedDate1).format('DD MMMM YYYY')}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", ml: 4 }}>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                textTransform: "none",
                                                height: "2rem",
                                                width: "180px",
                                                boxShadow: "none",
                                                backgroundColor: "#fff",
                                                color: "#000",
                                                fontWeight: "600",
                                                border: "1px solid #a9a9a9",
                                                "&:hover": {
                                                    boxShadow: "none",
                                                    backgroundColor: "#f5f5f5"
                                                }
                                            }}
                                            onClick={handleClickSection}
                                        >
                                            {selectedClass} - {selectedClassSection} <ArrowDropDownIcon />
                                        </Button>


                                        <Popover
                                            id="section-popover"
                                            open={openSection}
                                            anchorEl={anchorElSection}
                                            onClose={handleCloseSectionPopover}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'center',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'center',
                                            }}
                                        >
                                            <Box sx={{ padding: 1.3, backgroundColor: '#000', color: '#fff', borderRadius: '8px', width: "160px" }}>
                                                <ToggleButtonGroup
                                                    value={selectedClassSection}
                                                    exclusive
                                                    // onChange={handleClassChangeSection}
                                                    sx={{ display: 'flex', flexWrap: 'wrap', py: 0.5 }}
                                                >
                                                    <Grid container spacing={1} sx={{ display: "flex" }}>
                                                        {sections.length > 0 ? (
                                                            sections.map((section) => (
                                                                <Grid
                                                                    key={section.sectionName}
                                                                    size={{
                                                                        xs: 4,
                                                                        sm: 4,
                                                                        md: 4,
                                                                        lg: 4
                                                                    }}>
                                                                    <ToggleButton
                                                                        className={selectedClassSection === section.sectionName ? 'sectionSelected popoverSelection' : 'popoverSelection'}
                                                                        sx={{ width: "100%" }}
                                                                        value={section.sectionName}
                                                                        onClick={() => handleClassChangeSection(null, section.sectionName)}
                                                                    >
                                                                        <Box sx={{ backgroundColor: "#4A2086" }} className="Popoverdot" />
                                                                        {section.sectionName}
                                                                    </ToggleButton>
                                                                </Grid>
                                                            ))
                                                        ) : (
                                                            <Grid sx={{ textAlign: "center", padding: 2 }} size={12}>
                                                                No section
                                                            </Grid>
                                                        )}
                                                    </Grid>

                                                </ToggleButtonGroup>
                                            </Box>
                                        </Popover>
                                    </Box>
                                </Box>
                            </Box>
                            <Box pr={2} pt={3}>
                                <SimpleBarChartPage style={{ width: '100%', height: '100px' }} GraphData={detailedGraphData} />
                                <Typography sx={{ fontSize: "16px", color: "#000", textAlign: "center", fontWeight: "600", marginTop: "-20px" }}>
                                    {selectedClass}
                                </Typography>
                            </Box>
                            <Box px={2} mb={2} mt={3}>
                                <Box sx={{ display: "flex", border: "1px solid #eee", borderRadius: "8px" }}>
                                    <Box sx={{ width: "8px", height: "170px", backgroundColor: "#8600BB", borderRadius: "6px 0px 0px 6px" }}></Box>
                                    <Box pl={1} sx={{ width: "100%", }}>
                                        <Typography sx={{ fontSize: "16px", color: "#000", py: 1 }}>
                                            {selectedClass} - {selectedClassSection}
                                        </Typography>
                                        <Typography sx={{ mr: 2, fontSize: "16px", color: "#000", backgroundColor: "#f1e2f7", textAlign: "center", borderRadius: "6px 6px 0px 0px" }}>
                                            Total Students - {sectionDetails.totalStudents}
                                        </Typography>
                                        <Grid container pr={2}>
                                            <Grid
                                                size={{
                                                    xs: 6,
                                                    sm: 6,
                                                    md: 6,
                                                    lg: 6
                                                }}>
                                                <Typography sx={{ fontSize: "16px", color: "#000", backgroundColor: "#faf5fc", textAlign: "center", borderRadius: "0px 0px 0px 6px" }}>
                                                    Male - {sectionDetails.male}
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                size={{
                                                    xs: 6,
                                                    sm: 6,
                                                    md: 6,
                                                    lg: 6
                                                }}>
                                                <Typography sx={{ fontSize: "16px", color: "#000", backgroundColor: "#faf5fc", textAlign: "center", borderRadius: "0px 0px 6px 0px" }}>
                                                    Female - {sectionDetails.female}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, px: 2, }}>
                                            <Box>
                                                <Box sx={{ display: "flex", }}>
                                                    <Box sx={{ width: "10px", height: "10px", borderRadius: "50px", backgroundColor: "#00963C", marginTop: "13px", mr: 0.5 }} />
                                                    <Typography sx={{ fontSize: "14px", color: "#000", pt: 1 }}>
                                                        Present - {sectionDetails.present}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: "flex", }}>
                                                    <Box sx={{ width: "10px", height: "10px", borderRadius: "50px", backgroundColor: "#DA0000", marginTop: "13px", mr: 0.5 }} />
                                                    <Typography sx={{ fontSize: "14px", color: "#000", pt: 1 }}>
                                                        Absent - {sectionDetails.absent}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box>
                                                <Box sx={{ display: "flex", }}>
                                                    <Box sx={{ width: "10px", height: "10px", borderRadius: "50px", backgroundColor: "#8600BB", marginTop: "13px", mr: 0.5 }} />
                                                    <Typography sx={{ fontSize: "14px", color: "#000", pt: 1 }}>
                                                        Leave - {sectionDetails.leave}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: "flex", }}>
                                                    <Box sx={{ width: "10px", height: "10px", borderRadius: "50px", backgroundColor: "#3D49D6", marginTop: "13px", mr: 0.5 }} />
                                                    <Typography sx={{ fontSize: "14px", color: "#000", pt: 1 }}>
                                                        Late - {sectionDetails.late}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                                                <Box sx={{ width: "50px", height: "50px", borderRadius: "50px", backgroundColor: "#008234", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", fontWeight: "600", marginRight: "10px" }}>
                                                    {Math.max(0, Math.min(100, sectionDetails.presentPercentage))}%
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 12,
                                md: 9,
                                lg: 9
                            }}>

                            <Box sx={{ display: "flex" }}>
                                <Grid container>
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            md: 3.3,
                                            lg: 1.8
                                        }}>
                                    </Grid>
                                    <Grid
                                        sx={{}}
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            md: 6,
                                            lg: 4.2
                                        }}>
                                        <Box sx={{

                                            minHeight: 32, height: 32, display: 'flex',
                                        }}>
                                            <Typography sx={{ fontSize: "12px", color: "#000", pr: 1, marginTop: "5px", pl: 2, whiteSpace: "nowrap", }}>
                                            </Typography>
                                            <Tabs
                                                value={value}
                                                onChange={handleChangePercentage}
                                                aria-label="attendance tabs"
                                                variant="scrollable"
                                                TabIndicatorProps={{
                                                    sx: { display: 'none', }
                                                }}
                                                sx={{
                                                    backgroundColor: DASH.lineSoft,
                                                    border: `1px solid ${DASH.line}`,
                                                    minHeight: 32,
                                                    height: 32,
                                                    borderRadius: RADIUS,
                                                    p: 0.4,
                                                    '& .MuiTab-root': {
                                                        textTransform: 'none',
                                                        fontSize: '12.5px',
                                                        fontWeight: 600,
                                                        color: DASH.muted,
                                                        minWidth: 0,
                                                        minHeight: 24,
                                                        height: 24,
                                                        px: 1.4,
                                                        borderRadius: RADIUS,
                                                    },
                                                    '& .Mui-selected': {
                                                        color: `${DASH.ink} !important`,
                                                        bgcolor: '#fff',
                                                        fontWeight: 700,
                                                        boxShadow: '0 1px 3px rgba(17,24,39,0.12)',
                                                    },
                                                }}
                                            >
                                                <Tab label="Overall" />
                                                <Tab label="Below 75%" />
                                                <Tab label="Above 75%" />
                                            </Tabs>
                                        </Box>
                                    </Grid>



                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            md: 4,
                                            lg: 6
                                        }}>
                                        <Grid container spacing={1}>
                                            <Grid
                                                size={{
                                                    lg: 4
                                                }}>
                                                {/* <Button
                                                    variant="outlined"
                                                    sx={{
                                                        borderColor: "#A9A9A9",
                                                        py: 0.4,
                                                        width: "100%",
                                                        color: "#000",
                                                        textTransform: "none",
                                                        mb: 1,
                                                    }}
                                                    onClick={handlePrint}
                                                >
                                                    <PrintIcon /> &nbsp;Print
                                                </Button> */}
                                            </Grid>
                                            <Grid
                                                size={{
                                                    lg: 4
                                                }}>
                                                <Box sx={{ display: "flex", }}>
                                                    <Button
                                                        variant="contained"
                                                        sx={{
                                                            textTransform: "none",
                                                            height: "2rem",
                                                            width: "100%",
                                                            boxShadow: "none",
                                                            backgroundColor: "#fff",
                                                            color: "#000",
                                                            fontWeight: "600",
                                                            border: "1px solid #a9a9a9",
                                                            "&:hover": {
                                                                boxShadow: "none",
                                                                backgroundColor: "#f5f5f5"
                                                            }
                                                        }}
                                                        onClick={handlefilter}
                                                    >
                                                        {selectedFilter === "overall"
                                                            ? "Over All"
                                                            : selectedFilter === "present"
                                                                ? "Present"
                                                                : selectedFilter === "absent"
                                                                    ? "Absent"
                                                                    : selectedFilter === "leave"
                                                                        ? "Leave"
                                                                        : selectedFilter === "late"
                                                                            ? "Late"
                                                                            : "Select Filter"}
                                                        <ArrowDropDownIcon />
                                                    </Button>


                                                    <Popover
                                                        id="section-popover"
                                                        open={openFilter}
                                                        anchorEl={anchorElFilter}
                                                        onClose={handleCloseFilter}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'center',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'center',
                                                        }}
                                                    >
                                                        <Box sx={{ padding: 1.3, backgroundColor: '#000', color: '#fff', borderRadius: '8px', width: "110px" }}>
                                                            <ToggleButtonGroup
                                                                value={selectedFilter}
                                                                exclusive
                                                                sx={{ py: 0.5 }}
                                                            >
                                                                <Grid container >
                                                                    <Grid
                                                                        sx={{ display: "flex", justifyContent: "start" }}
                                                                        size={{
                                                                            lg: 12
                                                                        }}>
                                                                        <ToggleButton
                                                                            className={selectedFilter === "overall" ? 'sectionSelected popoverSelection' : 'popoverSelection'}
                                                                            sx={{
                                                                                width: "100%",
                                                                                textTransform: "none",
                                                                                marginTop: "3px",
                                                                                fontSize: "12px !important",
                                                                                border: "none !important",
                                                                                display: "flex",
                                                                                justifyContent: "flex-start",
                                                                                gap: 1
                                                                            }}
                                                                            onClick={() => handleChangeFilter("overall")}
                                                                        >
                                                                            <Box sx={{ backgroundColor: "yellow" }} className="Popoverdot" />
                                                                            Overall
                                                                        </ToggleButton>
                                                                    </Grid>
                                                                    <Grid
                                                                        size={{
                                                                            lg: 12
                                                                        }}>
                                                                        <ToggleButton
                                                                            className={selectedFilter === "present" ? 'sectionSelected popoverSelection' : 'popoverSelection'}
                                                                            sx={{
                                                                                width: "100%",
                                                                                textTransform: "none",
                                                                                marginTop: "3px",
                                                                                fontSize: "12px !important",
                                                                                border: "none !important",
                                                                                display: "flex",
                                                                                justifyContent: "flex-start",
                                                                                gap: 1
                                                                            }}
                                                                            onClick={() => handleChangeFilter("present")}
                                                                        >
                                                                            <Box sx={{ backgroundColor: "#28A745" }} className="Popoverdot" />
                                                                            Present
                                                                        </ToggleButton>
                                                                    </Grid>
                                                                    <Grid
                                                                        size={{
                                                                            lg: 12
                                                                        }}>
                                                                        <ToggleButton
                                                                            className={selectedFilter === "absent" ? 'sectionSelected popoverSelection' : 'popoverSelection'}
                                                                            sx={{
                                                                                width: "100%",
                                                                                textTransform: "none",
                                                                                marginTop: "3px",
                                                                                fontSize: "12px !important",
                                                                                border: "none !important",
                                                                                display: "flex",
                                                                                justifyContent: "flex-start",
                                                                                gap: 1
                                                                            }}
                                                                            onClick={() => handleChangeFilter("absent")}
                                                                        >
                                                                            <Box sx={{ backgroundColor: "#DC3545" }} className="Popoverdot" />
                                                                            Absent
                                                                        </ToggleButton>
                                                                    </Grid>
                                                                    <Grid
                                                                        size={{
                                                                            lg: 12
                                                                        }}>
                                                                        <ToggleButton
                                                                            className={selectedFilter === "leave" ? 'sectionSelected popoverSelection' : 'popoverSelection'}
                                                                            sx={{
                                                                                width: "100%",
                                                                                textTransform: "none",
                                                                                marginTop: "3px",
                                                                                fontSize: "12px !important",
                                                                                border: "none !important",
                                                                                display: "flex",
                                                                                justifyContent: "flex-start",
                                                                                gap: 1
                                                                            }}
                                                                            onClick={() => handleChangeFilter("leave")}
                                                                        >
                                                                            <Box sx={{ backgroundColor: "#9E35C7" }} className="Popoverdot" />
                                                                            Leave
                                                                        </ToggleButton>
                                                                    </Grid>
                                                                    <Grid
                                                                        size={{
                                                                            lg: 12
                                                                        }}>
                                                                        <ToggleButton
                                                                            className={selectedFilter === "late" ? 'sectionSelected popoverSelection' : 'popoverSelection'}
                                                                            sx={{
                                                                                width: "100%",
                                                                                textTransform: "none",
                                                                                marginTop: "3px",
                                                                                fontSize: "12px !important",
                                                                                border: "none !important",
                                                                                display: "flex",
                                                                                justifyContent: "flex-start",
                                                                                gap: 1
                                                                            }}
                                                                            onClick={() => handleChangeFilter("late")}
                                                                        >
                                                                            <Box sx={{ backgroundColor: "#3D49D6" }} className="Popoverdot" />
                                                                            Late
                                                                        </ToggleButton>
                                                                    </Grid>
                                                                </Grid>
                                                            </ToggleButtonGroup>
                                                        </Box>
                                                    </Popover>

                                                </Box>
                                            </Grid>


                                            <Grid
                                                size={{
                                                    lg: 4
                                                }}>
                                                <Button
                                                    onClick={handleExport}
                                                    variant="outlined" sx={{ borderColor: "#A9A9A9", py: 0.4, width: "100%", color: "#000", textTransform: "none", mb: 1 }}><ExitToAppIcon /> &nbsp;Export</Button>
                                            </Grid>

                                        </Grid>


                                    </Grid>
                                </Grid>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", width: "fit-content", position: "relative", top: "1px", zIndex: 1 }}>
                                <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#fff", bgcolor: DASH.violet, border: `1px solid ${DASH.violet}`, borderBottom: "none", px: 1.2, py: 0.3, borderRadius: "5px 5px 0 0", whiteSpace: "nowrap" }}>
                                    {selectedClass} - {selectedClassSection}
                                </Typography>
                                <Typography sx={{ fontSize: "11.5px", color: DASH.muted, px: 1.2, whiteSpace: "nowrap" }}>
                                    Class Teacher - {attendanceDetails.classTeacher || "Not assigned"}
                                </Typography>
                            </Box>
                            <TableContainer
                                sx={{
                                    border: `1px solid ${DASH.line}`,
                                    borderRadius: RADIUS,
                                    borderTopLeftRadius: 0,
                                    bgcolor: "#fff",
                                    maxHeight: "80vh",
                                    overflowY: "auto",
                                }}
                            >
                                <Table stickyHeader aria-label="attendance table" sx={{ minWidth: '100%' }}>
                                    <TableHead>
                                        <TableRow>
                                            {[
                                                "S.No",
                                                "Roll Number",
                                                "Student Name",
                                                "Class",
                                                "Section",
                                                "Student Picture",
                                                "Attendance Status",
                                                "Attendance %",
                                                "Student History"
                                            ].map((header, index) => (
                                                <TableCell
                                                    key={index}
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: "#F6F6F6",
                                                        textAlign: "center",
                                                        backgroundColor: DASH.surface,
                                                    }}
                                                >
                                                    {header}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRowsSkeleton rows={8} columns={9} wideColumn={2} />
                                        ) : attendanceTableDetails.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} sx={{ textAlign: "center", py: 5, borderBottom: "none" }}>
                                                    <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: DASH.ink }}>
                                                        No attendance recorded
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "12px", color: DASH.muted, mt: 0.5 }}>
                                                        Nothing was marked for this class on the selected date.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            attendanceTableDetails.map((row, index) => (
                                                <TableRow key={row}>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#F6F6F6",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#F6F6F6",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {row.rollNumber}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#F6F6F6",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {row.studentName}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#F6F6F6",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {selectedClass}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#F6F6F6",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {row.section}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#F6F6F6",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <Button
                                                            sx={{ color: "#000", textTransform: "none" }}
                                                            onClick={() => handleViewClick(row.studentPicture)}
                                                        >
                                                            <ImageIcon
                                                                sx={{
                                                                    color: "#000",
                                                                    marginRight: 1,
                                                                }}
                                                            />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#F6F6F6",
                                                            textAlign: "center",
                                                            px: 4,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                backgroundColor:
                                                                    row.attendanceStatus === "Present"
                                                                        ? "#018535"
                                                                        : row.attendanceStatus === "Absent"
                                                                            ? "#D84600"
                                                                            : row.attendanceStatus === "Leave"
                                                                                ? "#9E35C7"
                                                                                : row.attendanceStatus === "Late"
                                                                                    ? "#3D49D6"
                                                                                    : "#ccc",
                                                                color: "#fff",
                                                                borderRadius: "30px",
                                                                px: 1,
                                                                py: 0.5,
                                                            }}
                                                        >
                                                            {row.attendanceStatus}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#F6F6F6",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {row.attendancePercent}%
                                                    </TableCell>
                                                    <TableCell
                                                        sx={{
                                                            borderRight: 1,
                                                            borderColor: "#F6F6F6",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <Button
                                                            sx={{ color: "#000", textTransform: "none" }}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

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

                        </Grid>
                    </Grid>
                </Box>
            </Dialog>
        </Box>
    );
}
