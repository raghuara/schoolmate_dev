import { Box, createTheme, Grid, IconButton, ThemeProvider, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ProfileImage from '../../Images/PagesImage/dummy-image.jpg'
import TeachingIcon from '../../Images/Icons/human-male-board.png'
import '../../Css/Page.css'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from "axios";
import { DashboardBirthday } from "../../Api/Api";
import Loader from "../Loader";
import { useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";

export default function BirthdayPage() {

    const today = dayjs();
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState(today.format('DD-MM-YYYY'));
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const token = '123';
    const [birthdayDetails, setBirthdayDetails] = useState([]);
    const [studentsBirthday, setStudentsBirthday] = useState([]);

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

    useEffect(() => {
        fetchBirthdayData()
    }, [formattedDate]);

    const fetchBirthdayData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(DashboardBirthday, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const AllData = res.data.staffsbirthday
            setBirthdayDetails(AllData.teaching);
            setStudentsBirthday(res.data.studentsbirthday);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ backgroundColor: "#fff", mt: 2, p: 2, boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)", borderRadius: "6px" }}>
            {/* {isLoading && <Loader />} */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                    Birthday Details
                    <Typography style={{ fontSize: "12px", color: "#777" }}>
                        {dayjs(selectedDate).format('DD MMMM YYYY')}
                    </Typography>
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "end" }}>
                    <ThemeProvider theme={darkTheme}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                open={open}
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
                                width: '45px',
                                height: '45px',
                                marginLeft: '-100px',
                                transition: 'color 0.3s, background-color 0.3s',
                                '&:hover': {
                                    color: '#fff',
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                },

                            }} onClick={handleOpen}>
                                <CalendarMonthIcon style={{ color: "#000" }} />
                            </IconButton>
                        </LocalizationProvider>
                    </ThemeProvider>
                </Box>
            </Box>
            <Box sx={{ backgroundColor: "#FDFBFE", p: 2 }}>
                <Grid container spacing={2} py={1}>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h6" sx={{ fontWeight: "600", pb: 2 }}>
                            Staff Birthdays
                        </Typography>
                        <Box sx={{ maxHeight: "200px", overflowY: "auto"}}>

                            <Grid container spacing={2} py={1} >
                                {birthdayDetails && birthdayDetails.length > 0 ? (
                                    birthdayDetails.map((birthdayDetail, index) => (
                                        <Grid
                                            key={index}
                                            sx={{ borderRight: `1px solid ${websiteSettings.lightColor}`, borderBottom: `1px solid ${websiteSettings.lightColor}` }}
                                            size={{
                                                xs: 12,
                                                sm: 8,
                                                md: 6,
                                                lg: 6
                                            }}>
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 2, }}>
                                                <img
                                                    src={birthdayDetail.filepath || ProfileImage}
                                                    onError={(e) => { e.target.src = ProfileImage; }}
                                                    width={40}
                                                    height={40}
                                                    style={{ marginRight: "10px", borderRadius: "50%" }}
                                                    alt="profile"
                                                />

                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: "600" }}>
                                                        {birthdayDetail.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: "10px", color: "#555" }}>
                                                        {birthdayDetail.userType.charAt(0).toUpperCase() + birthdayDetail.userType.slice(1)} - {birthdayDetail.rollNumber}
                                                    </Typography>

                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))
                                ) : (
                                    <Box sx={{ p: 2 }}>
                                        <Typography>No birthdays found</Typography>
                                    </Box>

                                )}
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 6
                        }}>
                        <Typography variant="h6" sx={{ fontWeight: "600", pb: 2 }}>
                            Student Birthdays
                        </Typography>
                        <Box sx={{ maxHeight: "200px", overflowY: "auto", }}>
                            <Grid container spacing={2} py={1} >
                                {studentsBirthday && studentsBirthday.length > 0 ? (
                                    studentsBirthday.map((birthdayDetail, index) => (
                                        <Grid
                                            key={index}
                                            sx={{ borderRight: `1px solid ${websiteSettings.lightColor}`, borderBottom: `1px solid ${websiteSettings.lightColor}` }}
                                            size={{
                                                xs: 12,
                                                sm: 8,
                                                md: 6,
                                                lg: 6
                                            }}>
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 2, }}>
                                                <img
                                                    src={birthdayDetail.filepath || ProfileImage}
                                                    onError={(e) => { e.target.src = ProfileImage; }}
                                                    width={40}
                                                    height={40}
                                                    style={{ marginRight: "10px", borderRadius: "50%" }}
                                                    alt="profile"
                                                />

                                                <Box>
                                                    <Typography sx={{ fontWeight: "600", fontSize: "14px" }}>
                                                        {birthdayDetail.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: "10px", color: "#555" }}>
                                                        {birthdayDetail.rollNumber} ( {birthdayDetail.grade} - {birthdayDetail.section})
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))
                                ) : (
                                    <Box sx={{ p: 2 }}>
                                        <Typography>No birthdays found</Typography>
                                    </Box>
                                )}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>

            </Box>
        </Box>
    );
}