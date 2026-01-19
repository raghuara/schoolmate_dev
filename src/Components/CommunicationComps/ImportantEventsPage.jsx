import { Autocomplete, Box, Button, Checkbox, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Switch, Tab, Tabs, TextareaAutosize, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import DatePicker, { Calendar } from "react-multi-date-picker";
import '../../Css/OverWrite.css'
import { useDropzone } from "react-dropzone";
import {FetchAllCalenderEvent, FetchAllSchoolCalenderEvents, } from "../../Api/Api";
import SnackBar from "../SnackBar";
import CloseIcon from "@mui/icons-material/Close";
import ReactPlayer from "react-player";
import '../../Css/OverWrite.css'

export default function SchoolCalendarPage() {
    const today = dayjs();
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const token = "123"
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState('');
    const todayDateTime = dayjs().format('DD-MM-YYYY');
    const [yearEvents, setYearEvents] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    const [upCommingEvents, setUpCommingEvents] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [openImage, setOpenImage] = useState(false);
    const [openVideo, setOpenVideo] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [monthChanged, setMonthChanged] = useState("");
    const [completedEvents, setCompletedEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleVideoClick = (url) => {
        setVideoUrl(url);
        setOpenVideo(true);
    };

    const handleViewImageClose = () => {
        setOpenImage(false);
    };

    const handleVideoClose = () => {
        setOpenVideo(false);
    };
    
    const getAvailableSlots = () => {
        const dates = new Set();

        yearEvents.forEach((event) => {
            const { fromDate, toDate } = event;
            const start = dayjs(fromDate, "DD-MM-YYYY");
            const end = dayjs(toDate, "DD-MM-YYYY");

            for (let date = start; date.isBefore(end) || date.isSame(end); date = date.add(1, "day")) {
                dates.add(date.format("YYYY-MM-DD"));
            }
        });

        return [...dates];
    };

    const availableSlots = getAvailableSlots();

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    const handleMonthChange = (calendarInstance) => {
        const currentMonth = calendarInstance.month.index + 1;
        const currentYear = calendarInstance.year;
        const firstDateOfMonth = `01-${currentMonth < 10 ? `0${currentMonth}` : currentMonth}-${currentYear}`;
        console.log("First Date of the Month: ", firstDateOfMonth);
        setMonthChanged(firstDateOfMonth);
    };

    useEffect(() => {
        fetchYearEvents()
    }, [monthChanged])

    const fetchYearEvents = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(FetchAllSchoolCalenderEvents, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: monthChanged || todayDateTime,
                    Event: "Y",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setYearEvents(res.data.allEvents)
            setTodayEvents(res.data.todayEvents)
            setCompletedEvents(res.data.completedEvents)
            setUpCommingEvents(res.data.upCommingEvents)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom:"1px solid #ddd",  }}>
                <Grid container sx={{ py: 1.5 }}>
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            lg: 6
                        }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Important Events</Typography>
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", px: 1, zIndex: 1, }}
                        size={{
                            lg: 6
                        }}>
                        <Box sx={{ display: "flex", justifyContent: "center", }}>
                            <Calendar
                                numberOfMonths={1}
                                highlightToday
                                showOtherDays={false}
                                onMonthChange={handleMonthChange}
                                onChange={handleDateChange}
                                style={{
                                    boxShadow: "none",
                                    backgroundColor: "#F6F6F8",
                                }}
                                className="teal custom-calendar"
                                mapDays={({ date }) => {
                                    let style = {};
                                    const formattedDate = date.format("YYYY-MM-DD");
                                    if (availableSlots.includes(formattedDate)) {
                                        style = {
                                            backgroundColor: "red",
                                            color: "white",
                                            borderRadius: "50%",
                                            fontWeight: "bold",
                                        };
                                    }
                                    return { style };
                                }}
                            />

                            <style>
                                {`
                                    .rmdp-wrapper {
                                        background-color: #f2f2f2 !important;
                                    }
                                    
                                    .rmdp-year-picker, .rmdp-month-picker {
                                        display: none !important;
                                    }
                                    
                                    .custom-calendar .rmdp-day-picker {
                                        display: none !important;
                                    }
                                    
                                    .custom-calendar .rmdp-header-values {
                                        font-size: 20px;
                                        font-weight: 600;
                                        width:150px
                                    }

                                    .rmdp-arrow-container {
                                        display: flex !important;
                                        align-items: center;
                                        justify-content: center;
                                    }

                                    .rmdp-header {
                                        margin-top: 0px;
                                        padding: 0px;
                                    }
                                    .rmdp-left{
                                    width:30px;
                                    height:30px;
                                        }
                                    .rmdp-left i{
                                    width:8px;
                                    height:8px;
                                        }
                                    .rmdp-right{
                                    width:30px;
                                    height:30px;
                                        }
                                    .rmdp-right i{
                                    width:8px;
                                    height:8px;
                                        }
                                `}
                            </style>




                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{
                height: {
                    xs: "100%",
                    lg: "83vh",
                },
                overflowY:"auto"
            }}>

                <Grid
                    container
                    justifyContent="center"
                    sx={{
                        height: "100%",
                    }}
                >
                    <Grid
                        sx={{
                            height: "100%",
                        }}
                        size={{
                            sm: 12,
                            xs: 12,
                            lg: 12
                        }}>
                        <Box p={2}>

                            <Grid
                                container
                                sx={{
                                    height: "100%",
                                }}
                                spacing={2}
                            >
                                 <Grid
                                     size={{
                                         sm: 12,
                                         xs: 12,
                                         lg: 4
                                     }}>
                                    <Typography sx={{ fontWeight: "600", fontSize: "16px", color: "#616161", pl: 2 }}>
                                        Completed Events
                                    </Typography>
                                    <Box sx={{
                                        pl: 2,
                                        height: "76vh",
                                        overflowY: "auto",
                                       
                                    }}>
                                        {completedEvents.length === 0 ? (
                                            <Box
                                                sx={{
                                                    textAlign: "center",
                                                    mt: 2,
                                                    backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                    padding: "10px",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "14px", color: "#616161" }}>
                                                No Completed Events
                                                </Typography>
                                            </Box>
                                        ) : (
                                            completedEvents.map((item) => (
                                                <Box key={item.id}>
                                                    <Box
                                                        sx={{
                                                            position: "relative",
                                                            backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                            display: "flex",
                                                            py: 2,
                                                            width: "90%",
                                                            justifyContent: "flex-start",
                                                            alignItems: "center",
                                                            mt: 2,
                                                            borderRadius: "5px",
                                                            padding: "0 10px",
                                                            minHeight: "100px",
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            <Box
                                                                sx={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                     backgroundColor: item.eventColor,
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    color: "#fff",
                                                                    borderRadius: "50%",
                                                                    marginLeft: "-23px",
                                                                    fontWeight: "600",
                                                                }}
                                                            >
                                                                {item.from}
                                                            </Box>
                                                            {item.from !== item.to && (
                                                                <>
                                                                    <Typography sx={{ px: 0.5 }}>to</Typography>
                                                                    <Box
                                                                        sx={{
                                                                            width: "30px",
                                                                            height: "30px",
                                                                             backgroundColor: item.eventColor,
                                                                            display: "flex",
                                                                            justifyContent: "center",
                                                                            alignItems: "center",
                                                                            color: "#fff",
                                                                            borderRadius: "50%",
                                                                            fontWeight: "600",
                                                                        }}
                                                                    >
                                                                        {item.to}
                                                                    </Box>
                                                                </>
                                                            )}
                                                        </Box>

                                                        <Box p={1} sx={{ flex: 1 }}>
                                                            <Typography sx={{ fontSize: "8px", color: "#616161", textDecoration: "underline" }}>
                                                                {item.headLine}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "12px", color: "#616161", pb:2 }}>
                                                                {item.description}
                                                            </Typography>
                                                        </Box>
                                                        {item.filetype !== "empty" &&
                                                            <Box>
                                                                {item.filetype === "image" &&
                                                                    <Button
                                                                        variant="outlined"
                                                                        sx={{
                                                                            textTransform: 'none',
                                                                            padding: '0px 0',
                                                                            borderRadius: '30px',
                                                                            fontSize: '8px',
                                                                            border: '1px solid black',
                                                                            color: 'white',
                                                                            fontWeight: "600",
                                                                            backgroundColor: "#000",
                                                                            position: "absolute",
                                                                            bottom: "3px",
                                                                            left: "3px",
                                                                        }}
                                                                        onClick={() => handleViewClick(item.filepath)}
                                                                    >
                                                                        View Image
                                                                    </Button>
                                                                }
                                                                {item.filetype === "link" &&
                                                                    <Button
                                                                        variant="outlined"
                                                                        sx={{
                                                                            textTransform: 'none',
                                                                            padding: '0px 0',
                                                                            borderRadius: '30px',
                                                                            fontSize: '8px',
                                                                            border: '1px solid black',
                                                                            color: 'white',
                                                                            fontWeight: "600",
                                                                            backgroundColor: "#000",
                                                                            position: "absolute",
                                                                            bottom: "3px",
                                                                            left: "3px",
                                                                        }}
                                                                        onClick={() => handleVideoClick(item.filepath)}
                                                                    >
                                                                        Play Video
                                                                    </Button>
                                                                }
                                                            </Box>
                                                        }
                                                     
                                                    </Box>
                                                </Box>
                                            )))}
                                    </Box>
                                </Grid>
                                <Grid
                                    size={{
                                        sm: 12,
                                        xs: 12,
                                        lg: 4
                                    }}>
                                    <Typography sx={{ fontWeight: "600", fontSize: "16px", color: "#616161", pl: 2 }}>
                                        Today's Events
                                    </Typography>
                                    <Box sx={{
                                        pl: 2,
                                        height: "76vh",
                                        overflowY: "auto",
                                    }}>
                                        {todayEvents.length === 0 ? (
                                            <Box
                                                sx={{
                                                    textAlign: "center",
                                                    mt: 2,
                                                    backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                    padding: "10px",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "14px", color: "#616161" }}>
                                                    No events today
                                                </Typography>
                                            </Box>
                                        ) : (
                                            todayEvents.map((item) => (
                                                <Box key={item.id}>
                                                    <Box
                                                        sx={{
                                                            position: "relative",
                                                            backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                            display: "flex",
                                                            py: 2,
                                                            width: "90%",
                                                            justifyContent: "flex-start",
                                                            alignItems: "center",
                                                            mt: 2,
                                                            borderRadius: "5px",
                                                            padding: "0 10px",
                                                            minHeight: "100px",
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            <Box
                                                                sx={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                     backgroundColor: item.eventColor,
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    color: "#fff",
                                                                    borderRadius: "50%",
                                                                    marginLeft: "-23px",
                                                                    fontWeight: "600",
                                                                }}
                                                            >
                                                                {item.from}
                                                            </Box>
                                                            {item.from !== item.to && (
                                                                <>
                                                                    <Typography sx={{ px: 0.5 }}>to</Typography>
                                                                    <Box
                                                                        sx={{
                                                                            width: "30px",
                                                                            height: "30px",
                                                                             backgroundColor: item.eventColor,
                                                                            display: "flex",
                                                                            justifyContent: "center",
                                                                            alignItems: "center",
                                                                            color: "#fff",
                                                                            borderRadius: "50%",
                                                                            fontWeight: "600",
                                                                        }}
                                                                    >
                                                                        {item.to}
                                                                    </Box>
                                                                </>
                                                            )}
                                                        </Box>

                                                        <Box p={1} sx={{ flex: 1 }}>
                                                            <Typography sx={{ fontSize: "8px", color: "#616161", textDecoration: "underline" }}>
                                                                {item.headLine}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "12px", color: "#616161", pb:2 }}>
                                                                {item.description}
                                                            </Typography>
                                                        </Box>
                                                        {item.filetype !== "empty" &&
                                                            <Box>
                                                                {item.filetype === "image" &&
                                                                    <Button
                                                                        variant="outlined"
                                                                        sx={{
                                                                            textTransform: 'none',
                                                                            padding: '0px 0',
                                                                            borderRadius: '30px',
                                                                            fontSize: '8px',
                                                                            border: '1px solid black',
                                                                            color: 'white',
                                                                            fontWeight: "600",
                                                                            backgroundColor: "#000",
                                                                            position: "absolute",
                                                                            bottom: "3px",
                                                                            left: "3px",
                                                                        }}
                                                                        onClick={() => handleViewClick(item.filepath)}
                                                                    >
                                                                        View Image
                                                                    </Button>
                                                                }
                                                                {item.filetype === "link" &&
                                                                    <Button
                                                                        variant="outlined"
                                                                        sx={{
                                                                            textTransform: 'none',
                                                                            padding: '0px 0',
                                                                            borderRadius: '30px',
                                                                            fontSize: '8px',
                                                                            border: '1px solid black',
                                                                            color: 'white',
                                                                            fontWeight: "600",
                                                                            backgroundColor: "#000",
                                                                            position: "absolute",
                                                                            bottom: "3px",
                                                                            left: "3px",
                                                                        }}
                                                                        onClick={() => handleVideoClick(item.filepath)}
                                                                    >
                                                                        Play Video
                                                                    </Button>
                                                                }
                                                            </Box>
                                                        }
                                                    </Box>
                                                </Box>
                                            ))
                                        )}
                                    </Box>
                                </Grid>
                               
                                <Grid
                                    size={{
                                        sm: 12,
                                        xs: 12,
                                        lg: 4
                                    }}>
                                    <Typography sx={{ fontWeight: "600", fontSize: "16px", color: "#616161", pl: 2 }}>
                                        Upcoming Events
                                    </Typography>
                                    <Box sx={{
                                        pl: 2,
                                        height: "76vh",
                                        overflowY: "auto",
                                       
                                    }}>
                                        {upCommingEvents.length === 0 ? (
                                            <Box
                                                sx={{
                                                    textAlign: "center",
                                                    mt: 2,
                                                    backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                    padding: "10px",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "14px", color: "#616161" }}>
                                                    No Upcoming Events
                                                </Typography>
                                            </Box>
                                        ) : (
                                            upCommingEvents.map((item) => (
                                                <Box key={item.id}>
                                                    <Box
                                                        sx={{
                                                            position: "relative",
                                                            backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                            display: "flex",
                                                            py: 2,
                                                            width: "90%",
                                                            justifyContent: "flex-start",
                                                            alignItems: "center",
                                                            mt: 2,
                                                            borderRadius: "5px",
                                                            padding: "0 10px",
                                                            minHeight: "100px",
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            <Box
                                                                sx={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                     backgroundColor: item.eventColor,
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    color: "#fff",
                                                                    borderRadius: "50%",
                                                                    marginLeft: "-23px",
                                                                    fontWeight: "600",
                                                                }}
                                                            >
                                                                {item.from}
                                                            </Box>
                                                            {item.from !== item.to && (
                                                                <>
                                                                    <Typography sx={{ px: 0.5 }}>to</Typography>
                                                                    <Box
                                                                        sx={{
                                                                            width: "30px",
                                                                            height: "30px",
                                                                             backgroundColor: item.eventColor,
                                                                            display: "flex",
                                                                            justifyContent: "center",
                                                                            alignItems: "center",
                                                                            color: "#fff",
                                                                            borderRadius: "50%",
                                                                            fontWeight: "600",
                                                                        }}
                                                                    >
                                                                        {item.to}
                                                                    </Box>
                                                                </>
                                                            )}
                                                        </Box>

                                                        <Box p={1} sx={{ flex: 1 }}>
                                                            <Typography sx={{ fontSize: "8px", color: "#616161", textDecoration: "underline" }}>
                                                                {item.headLine}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "12px", color: "#616161", pb:2 }}>
                                                                {item.description}
                                                            </Typography>
                                                        </Box>
                                                        {item.filetype !== "empty" &&
                                                            <Box>
                                                                {item.filetype === "image" &&
                                                                    <Button
                                                                        variant="outlined"
                                                                        sx={{
                                                                            textTransform: 'none',
                                                                            padding: '0px 0',
                                                                            borderRadius: '30px',
                                                                            fontSize: '8px',
                                                                            border: '1px solid black',
                                                                            color: 'white',
                                                                            fontWeight: "600",
                                                                            backgroundColor: "#000",
                                                                            position: "absolute",
                                                                            bottom: "3px",
                                                                            left: "3px",
                                                                        }}
                                                                        onClick={() => handleViewClick(item.filepath)}
                                                                    >
                                                                        View Image
                                                                    </Button>
                                                                }
                                                                {item.filetype === "link" &&
                                                                    <Button
                                                                        variant="outlined"
                                                                        sx={{
                                                                            textTransform: 'none',
                                                                            padding: '0px 0',
                                                                            borderRadius: '30px',
                                                                            fontSize: '8px',
                                                                            border: '1px solid black',
                                                                            color: 'white',
                                                                            fontWeight: "600",
                                                                            backgroundColor: "#000",
                                                                            position: "absolute",
                                                                            bottom: "3px",
                                                                            left: "3px",
                                                                        }}
                                                                        onClick={() => handleVideoClick(item.filepath)}
                                                                    >
                                                                        Play Video
                                                                    </Button>
                                                                }
                                                            </Box>
                                                        }
                                                     
                                                    </Box>
                                                </Box>
                                            )))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    <Dialog
                        open={openImage}
                        onClose={handleViewImageClose}
                        sx={{
                            '& .MuiPaper-root': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                borderRadius: 0,
                                padding: 0,
                                overflow: 'visible',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '80vw',
                                height: '80vh',
                                maxWidth: 'none',
                            },
                        }}
                        BackdropProps={{
                            style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                            }}
                        >
                            <img
                                src={imageUrl}
                                alt="Popup"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                            <IconButton
                                onClick={handleViewImageClose}
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    zIndex: 10,
                                    color: "#fff",
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Dialog>
                    <Dialog
                        open={openVideo}
                        onClose={handleVideoClose}
                        sx={{
                            '& .MuiPaper-root': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                borderRadius: 0,
                                padding: 0,
                                overflow: 'visible',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '80vw',
                                height: '80vh',
                                maxWidth: 'none',
                            },
                        }}
                        BackdropProps={{
                            style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                            }}
                        >
                            <ReactPlayer
                                url={videoUrl}
                                width="100%"
                                height="100%"
                                playing={false}
                            />
                            <IconButton
                                onClick={handleVideoClose}
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    zIndex: 10,
                                    color: "#fff",
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Dialog>

                </Grid>

            </Box>
        </Box>
    );
}
