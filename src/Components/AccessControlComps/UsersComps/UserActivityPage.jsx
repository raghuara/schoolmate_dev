import { Box, Button, Grid, IconButton, InputAdornment, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { useSelector } from "react-redux";
import { LoginList } from "../../../Api/Api";
import axios from "axios";
import * as XLSX from 'xlsx';
import SearchIcon from '@mui/icons-material/Search';

export default function UserActivityPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [loginStudentDetails, setLoginStudentDetails] = useState([]);
    const [loginOthersDetails, setLoginOthersDetails] = useState([]);
    const [notLoggedInStudents, setNotLoggedInStudents] = useState([]);
    const [notLoggedInOthers, setNotLoggedInOthers] = useState([]);
    const [value, setValue] = useState(0);
    const token = "123"
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [searchQueryNotLogged, setSearchQueryNotLogged] = useState("");
    const [filteredDataNotLogged, setFilteredDataNotLogged] = useState([]);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        fetcDetails()
    }, [])

    const fetcDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(LoginList, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLoginStudentDetails(res.data.studentData || []);
            setLoginOthersDetails(res.data.othersDate || []);
            setNotLoggedInStudents(res.data.notLoggedInstudentData || []);
            setNotLoggedInOthers(res.data.notLOggedInothersDate || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setFilteredData([
            ...(loginStudentDetails || []),
            ...(loginOthersDetails || []),
        ]);
        setFilteredDataNotLogged([
            ...(notLoggedInStudents || []),
            ...(notLoggedInOthers || []),
        ]);
    }, [loginStudentDetails, loginOthersDetails, notLoggedInStudents, notLoggedInOthers, value]);


    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        const allData = [...loginStudentDetails, ...loginOthersDetails];

        if (query) {
            const filtered = allData.filter(
                (item) =>
                    item.rollNumber?.toString().toLowerCase().includes(query) ||
                    item.name?.toLowerCase().includes(query) ||
                    item.userType?.toLowerCase().includes(query)
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(allData);
        }
    };

    const handleSearchChangeNotLogged = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQueryNotLogged(query);

        const allData = [...notLoggedInStudents, ...notLoggedInOthers];

        if (query) {
            const filtered = allData.filter(
                (item) =>
                    item.rollNumber?.toString().toLowerCase().includes(query) ||
                    item.name?.toLowerCase().includes(query) ||
                    item.userType?.toLowerCase().includes(query)
            );
            setFilteredDataNotLogged(filtered);
        } else {
            setFilteredDataNotLogged(allData);
        }
    };

    const handleExport = () => {
        const header = [
            'S.No', 'Roll Number', 'Name', 'User Type', 'Class', 'Section'
        ];

        const data = filteredData.map((row, index) => [
            index + 1,
            row.rollNumber || '',
            row.name || '',
            row.userType || '',
            row.grade || '',
            row.section || ''
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        XLSX.writeFile(workbook, 'logged_in_users.xlsx');
    };

    const handleExportNotLoggedIn = () => {
        const header = [
            'S.No', 'Roll Number', 'Name', 'User Type', 'Class', 'Section'
        ];

        const data = filteredDataNotLogged.map((row, index) => [
            index + 1,
            row.rollNumber || '',
            row.name || '',
            row.userType || '',
            row.grade || '',
            row.section || ''
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'NotLoggedInUsers');

        XLSX.writeFile(workbook, 'not_logged_in_users.xlsx');
    };

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
                        <Link style={{ textDecoration: "none" }} to="/dashboardmenu/access/users">
                            <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                        </Link>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} > Member Download Report - See Who's Using SchoolMate</Typography>
                    </Grid>

                </Grid>
            </Box>
            <Box px={2}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="attendance tabs"
                    variant="scrollable"
                    TabIndicatorProps={{
                        sx: {
                            height: '2.5px',
                            backgroundColor: websiteSettings.mainColor,
                            borderRadius: '2px',
                        },
                    }}
                    sx={{
                        minHeight: "10px",
                        borderRadius: "5px",
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '14px',
                            color: '#555',
                            fontWeight: 'bold',
                            minWidth: 0,
                            paddingX: 1,
                            minHeight: '30px',
                            height: '30px',
                            m: 0.8
                        },
                        '& .Mui-selected': {
                            color: '#555',
                        },
                    }}
                >
                    <Tab label="Logged - In Users" />
                    <Tab label="Not Logged - In Users" />
                </Tabs>


                <Box hidden={value !== 0}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", pt:2  }}>
                    <Box sx={{ width: "300px", }}>
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
                            </Box>
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
                                    mb: 0.5,
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
                            maxHeight: "69vh",
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
                                        User Type
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Class
                                    </TableCell>

                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Section
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
                                            {row.userType
                                                ? row.userType.charAt(0).toUpperCase() + row.userType.slice(1)
                                                : ""}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.grade || "N/A"}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.section || "N/A"}
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>
                        <Box sx={{ height: '50px' }}></Box>
                    </TableContainer>
                </Box>
                <Box hidden={value !== 1} >
                    <Box sx={{ display: "flex", justifyContent: "space-between", pt:2 }}>
                        <Box sx={{ width: "300px"}}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search Student by Name or Roll Number"
                                value={searchQueryNotLogged}
                                onChange={handleSearchChangeNotLogged}
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
                        </Box>
                        <Button
                            onClick={handleExportNotLoggedIn}
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
                            maxHeight: "69vh",
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
                                        User Type
                                    </TableCell>
                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Class
                                    </TableCell>

                                    <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center", backgroundColor: "#faf6fc" }}>
                                        Section
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredDataNotLogged.map((row, index) => (
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
                                            {row.userType
                                                ? row.userType.charAt(0).toUpperCase() + row.userType.slice(1)
                                                : ""}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.grade || "N/A"}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: 1, borderColor: "#E8DDEA", textAlign: "center" }}>
                                            {row.section || "N/A"}
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box sx={{ height: '50px' }}></Box>
                    </TableContainer>
                </Box>
            </Box>
        </Box>
    );
}