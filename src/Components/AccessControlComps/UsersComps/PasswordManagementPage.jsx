import React, { useEffect, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography, ThemeProvider, createTheme, Button, Grid, Tabs, Tab, DialogContent, DialogActions, TextField, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Autocomplete, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMediaQuery, useTheme } from "@mui/system";
import dayjs from "dayjs";
import Loader from "../../Loader";
import axios from "axios";
import {  UsersPassword } from "../../../Api/Api";
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
import * as XLSX from "xlsx";

export default function PasswordManagementPage() {
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
    const [passwords, setPasswords] = useState([]);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const selectedGrade = grades.find(grade => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map(section => ({ sectionName: section })) || [];


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

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleExport = () => {
        if (!filteredData.length) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("No data to export");
            return;
        }

        const header = [
            "S.No",
            "Roll Number",
            "Student Name",
            "User Type",
            "Class",
            "Section",
            "Password"
        ];

        const data = filteredData.map((row, index) => [
            index + 1,
            row.rollNumber || "",
            row.name || "Name not provided",
            row.userType || "",
            row.grade || "",
            row.section || "",
            row.password || ""
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "User Passwords");

        const fileName = `User_Passwords_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };


    useEffect(() => {
        fetchAllData()
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(UsersPassword, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPasswords(res.data);
            setFilteredData(res.data);


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
            const filtered = passwords.filter(
                (item) =>
                    item.rollNumber.toString().toLowerCase().includes(query) ||
                    (item.name && item.name.toLowerCase().includes(query))
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(passwords);
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
                            md: 12,
                            lg: 12
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
                                    <Link style={{ textDecoration: "none" }} to="/dashboardmenu/access/users">
                                        <IconButton sx={{ width: "27px", height: "27px", marginTop: '3px', }}>
                                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                                        </IconButton>
                                    </Link>
                                    <Typography sx={{ fontWeight: "600", ml: 1, marginTop: "3px", fontSize: "19px" }}>
                                        Password Management
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid
                                sx={{ mt: .8 }}
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 3
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

                </Grid>
                <Box sx={{ px: 2, pt: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "end", pb: 1 }}>
                        <Button
                            onClick={handleExport}
                            variant="contained"
                            sx={{
                                backgroundColor: websiteSettings.mainColor,
                                color: websiteSettings.textColor,
                                textTransform: "none",
                                fontWeight: 600,
                                width: "100px",
                                height: "30px",
                                borderRadius: "5px",
                                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                                '&:hover': {
                                    backgroundColor: websiteSettings.mainColor,
                                    opacity: 0.9
                                }
                            }}
                        >
                            Export
                        </Button>
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
                                        User Type
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Section
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Student Picture
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Password
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((row, index) => (
                                    <TableRow key={row.rollNumber || index}>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.rollNumber}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", color: row.name ? "inherit" : "red" }}>
                                            {row.name || "Name not provided"}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.userType}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.grade}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.section}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.filepath ? (
                                                <Button sx={{ color: "#000", textTransform: "none" }} onClick={() => handleViewClick(row.filepath)}>
                                                    <ImageIcon sx={{ color: "#000", marginRight: 1 }} />
                                                    View
                                                </Button>
                                            ) : (
                                                <Typography sx={{ fontSize: "12px", color: "gray" }}>No Image</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.password}
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
