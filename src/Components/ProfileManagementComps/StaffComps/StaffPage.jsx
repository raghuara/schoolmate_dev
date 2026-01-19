import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, ThemeProvider, createTheme, Button, Grid, Tabs, Tab, DialogContent, DialogActions, TextField, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Autocomplete, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMediaQuery, useTheme } from "@mui/system";
import dayjs from "dayjs";
import Loader from "../../Loader";
import axios from "axios";
import { fetchAttendance, GetStaffInformation, GetStudentsInformation, sectionsDropdown } from "../../../Api/Api";
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
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import SnackBar from "../../SnackBar";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import avatarImage from '../../../Images/PagesImage/avatar.png'

export default function StaffPage() {
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
    const [staffDetails, setStaffDetails] = useState([]);
    const [classDetails, setClassDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const selectedGrade = grades.find(grade => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map(section => ({ sectionName: section })) || [];

    const formatText = (value = "") =>
        value
            ? value
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/nonteaching/i, "Non Teaching")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "-";


    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);


    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleViewInfo = (rollNumber) => {
        navigate("view", { state: { rollNumber } });
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleAddStaff = () => {
        navigate("create")
    };


    useEffect(() => {
        fetchAllData()
    }, [selectedSection, selectedGradeId]);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(GetStaffInformation, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", res.data);

            if (res.data && res.data.staffInfo) {
                setStaffDetails(res.data.staffInfo);
                setFilteredData(res.data.staffInfo);
            } else {
                setStaffDetails([]);
                setFilteredData([]);
                console.error("Unexpected API response format:", res.data);
            }
        } catch (error) {
            console.error("Error fetching staff data:", error);
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
            const filtered = staffDetails.filter(
                (item) =>
                    item.rollNumber.toString().toLowerCase().includes(query) ||
                    (item.name && item.name.toLowerCase().includes(query))
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(staffDetails);
        }
    };


    return (
        <Box sx={{ backgroundColor: "#F6F6F8", height: "91.7vh", width: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1.5, borderBottom: "1px solid #ddd", width: "100%" }}>
                <Grid container >
                    <Grid size={{ xs: 12, sm: 12, md: 4, lg: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ width: "27px", height: "27px", marginTop: '2px', }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: "600", fontSize: "19px" }} >  Staffs Information</Typography>
                    </Grid>

                    <Grid
                        size={{
                            lg: 6
                        }}
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", pr: 5 }}
                    >
                        <Button
                            variant="outlined"
                            sx={{
                                borderColor: "#A9A9A9",
                                backgroundColor: "#000",
                                py: 0.3,
                                width: "200px",
                                color: "#fff",
                                textTransform: "none",
                                border: "none",

                            }}
                            onClick={handleAddStaff}
                        >
                            <AddIcon sx={{ fontSize: "20px" }} />
                            &nbsp;Add Staff details
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <Box>
                {/* <Box hidden={value !== 0}> */}
                <Box sx={{ marginTop: "-10px", px: 2 }}>
                    <Box sx={{ display: "flex" }}>
                        <Grid container sx={{ display: "flex", justifyContent: "end", width: "100%" }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 5,
                                    lg: 3
                                }}>
                                <Box sx={{ mt: 2.8, width: "100%", }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search Staff by Name or Roll Number"
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
                                            marginBottom: "0px",
                                            "& .MuiOutlinedInput-root": {
                                                minHeight: "28px",
                                                paddingRight: "3px",
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "primary.main",
                                            },
                                        }}
                                    />
                                </Box>
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
                                        Staff Name
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Class
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Section
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Staff Category
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Staff Picture
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Staff Info
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
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", color: row.name ? "inherit" : "#ccc", }}>
                                            {row.name || "Name not provided"}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.grade || "-"}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.section || "-"}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {formatText(row.subUserType)}
                                        </TableCell>

                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            <Button sx={{ color: "#000", textTransform: "none" }} onClick={() => handleViewClick(row.filePath)}>
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
