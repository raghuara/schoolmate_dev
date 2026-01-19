import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, ThemeProvider, createTheme, Button, Grid, Tabs, Tab, DialogContent, DialogActions, TextField, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Autocomplete, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMediaQuery, useTheme } from "@mui/system";
import dayjs from "dayjs";
import Loader from "../Loader";
import axios from "axios";
import { fetchAttendance, GetStudentsInformation, sectionsDropdown } from "../../Api/Api";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import SnackBar from "../SnackBar";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import avatarImage from '../../Images/PagesImage/avatar.png'

export default function StudentInformationPage() {
    const today = dayjs().format("DD-MM-YYYY");
    const [formattedDate, setFormattedDate] = useState(today);
    const navigate = useNavigate()
    const token = '123';
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const theme = useTheme();
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(0);
    const [selectedSection, setSelectedSection] = useState(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [selectedClass, setSelectedClass] = useState("PreKG");
    const [selectedClassSection, setSelectedClassSection] = useState("A1");
    const [selectedFilter, setSelectedFilter] = useState("OverAll");
    const [attendanceData, setAttendanceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [studentDetails, setStudentDetails] = useState([]);
    const [classDetails, setClassDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const selectedGrade = grades.find(grade => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map(section => ({ sectionName: section })) || [];

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedSection(newValue.sections[0]);
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
        }
    };

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleViewInfo = (rollNumber) => {
        navigate("viewinfo", { state: { rollNumber } });
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleUploadClick = () => {
        navigate("create")
    };


    useEffect(() => {
        fetchAllData()
    }, [selectedSection, selectedGradeId]);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(GetStudentsInformation, {
                params: {
                    Grade: selectedGradeId || 131,
                    Section: selectedSection || "A1",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", res.data);

            if (res.data && res.data.studentsInfo) {
                setStudentDetails(res.data.studentsInfo);
                setFilteredData(res.data.studentsInfo);
            } else {
                setStudentDetails([]);
                setFilteredData([]);
                console.error("Unexpected API response format:", res.data);
            }
        } catch (error) {
            console.error("Error fetching student data:", error);
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("No Data");
        } finally {
            setIsLoading(false);
        }
    };


    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (query) {
            const filtered = studentDetails.filter(
                (item) =>
                    item.rollNumber.toString().toLowerCase().includes(query) ||
                    (item.studentNameInEnglish && item.studentNameInEnglish.toLowerCase().includes(query))
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(studentDetails);
        }
    };


    return (
        <Box sx={{ backgroundColor: "#F6F6F8", height: "91.7vh" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box>
                <Grid container sx={{ backgroundColor: "#F2F2F2", pt: 1, px: 2 }} >
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
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
                                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '3px' }}>
                                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                                        </IconButton>
                                    <Typography sx={{ fontWeight: "600", ml: 1, marginTop: "3px", fontSize: "19px" }}>
                                        Students Information
                                    </Typography>
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
                            lg: 6
                        }}>
                        <Grid container spacing={1}>
                            <Grid
                                size={{
                                    lg: 3.5
                                }}>
                                <Autocomplete
                                    disablePortal
                                    options={grades}
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
                                    lg: 3.5
                                }}>
                                <Autocomplete
                                    disablePortal
                                    disabled={!selectedGrade}
                                    options={sections}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={
                                        sections.find((option) => option.sectionName === selectedSection) ||
                                        null
                                    }
                                    onChange={handleSectionChange}
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
                                    lg: 5
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
                                    &nbsp;Create Student Info
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                {/* <Box hidden={value !== 0}> */}
                <Box sx={{ marginTop: "-10px", px: 2 }}>
                    <Box sx={{ display: "flex" }}>
                        <Grid container sx={{ justifyContent: "space-between", width: "100%" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 5,
                                    lg: 3
                                }}>
                                <Box sx={{ display: "flex", mt: 2.8, width: "200px", }}>
                                    <Typography sx={{ fontSize: "12px", color: "#fff", backgroundColor: "#307EB9", padding: "0px 5px 0px 5px", borderRadius: "4px 0px 0px 0px", fontWeight: "600", }}>
                                        {selectedClass} - {selectedClassSection}
                                    </Typography>
                                    {/* <Typography sx={{ fontSize: "12px", color: "#000", px: 1, }}>
                                        Class Teacher - {attendanceData.classTeacher}
                                    </Typography> */}
                                </Box>
                            </Grid>
                            <Grid
                                sx={{ display: "flex", justifyContent: "end" }}
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 7,
                                    lg: 9
                                }}>
                                <Link to="merge-sibling">
                                    <Button
                                        sx={{
                                            borderColor: "#A9A9A9",
                                            backgroundColor: "#000",
                                            py: 0.3,
                                            width: "150px",
                                            color: "#fff",
                                            textTransform: "none",
                                            border: "none",
                                        }}
                                    >
                                        Merge Siblings
                                    </Button>
                                </Link>
                            </Grid>

                        </Grid>
                    </Box>
                    <TableContainer
                        sx={{
                            border: "1px solid #E8DDEA",
                            maxHeight: "77vh",
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
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Student Name
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Class
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Section
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Student Picture
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Student Info
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((row, index) => (
                                    <TableRow key={row.id}>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.rollNumber}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", color: row.studentNameInEnglish ? "inherit" : "red", }}>
                                            {row.studentNameInEnglish || "Name not provided"}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.grade}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.section}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            <Button sx={{ color: "#000", textTransform: "none" }} onClick={() => handleViewClick(row.passportSizePhotofilepath)}>
                                                <ImageIcon sx={{ color: "#000", marginRight: 1 }} />
                                                View
                                            </Button>
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            <Button onClick={() => handleViewInfo(row.rollNumber)} sx={{ color: "#000", textTransform: "none" }}>
                                                View Info
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box sx={{ height: '50px' }}></Box>
                    </TableContainer>
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
                        src={imageUrl || avatarImage}
                        alt="Popup"
                        style={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '80vw',
                            maxHeight: '80vh',
                            display: 'block',
                            margin: 'auto',
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
