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
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import ReactPlayer from "react-player";
import '../../Css/OverWrite.css'

// Lightens an rgba color so it can be used as a card background.
const tintColor = (rgba, alpha = 0.12) => {
    if (!rgba || typeof rgba !== "string") return "#FAFAFA";
    const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) return "#FAFAFA";
    return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
};

// Event card — matches the School Calendar design.
const EventCard = ({ item, onViewImage, onPlayVideo }) => {
    const accent = item.eventColor || "#9CA3AF";
    const dateLabel = item.from === item.to ? item.from : `${item.from} → ${item.to}`;
    return (
        <Box sx={{
            bgcolor: tintColor(item.eventColor, 0.08),
            border: `1px solid ${tintColor(item.eventColor, 0.25)}`,
            borderLeft: `4px solid ${accent}`,
            borderRadius: "10px",
            p: 1.5,
            transition: "box-shadow 0.15s, transform 0.15s, background-color 0.15s",
            "&:hover": {
                bgcolor: tintColor(item.eventColor, 0.12),
                boxShadow: `0 4px 12px ${accent}1F`,
                transform: "translateY(-1px)",
            },
        }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4, flexWrap: "wrap" }}>
                <Box sx={{
                    px: 1, py: 0.3, borderRadius: "6px",
                    bgcolor: "#fff",
                    color: accent,
                    border: `1px solid ${tintColor(item.eventColor, 0.35)}`,
                    fontSize: 11, fontWeight: 800, letterSpacing: 0.3,
                    whiteSpace: "nowrap",
                }}>
                    {dateLabel}
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111", flex: 1, minWidth: 0 }} noWrap>
                    {item.headLine}
                </Typography>
            </Box>
            {item.description && (
                <Typography sx={{ fontSize: 12.5, color: "#4B5563", mb: 1, lineHeight: 1.5 }}>
                    {item.description}
                </Typography>
            )}
            {item.filetype !== "empty" && (
                <Box sx={{ mt: 0.5 }}>
                    {item.filetype === "image" && (
                        <Button
                            size="small" variant="outlined"
                            onClick={() => onViewImage(item.filepath)}
                            sx={{
                                textTransform: "none", fontSize: 11, fontWeight: 700,
                                borderRadius: "20px", px: 1.5, py: 0.2, minWidth: 0,
                                color: "#111", borderColor: "#D1D5DB",
                                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
                            }}
                        >
                            View Image
                        </Button>
                    )}
                    {item.filetype === "link" && (
                        <Button
                            size="small" variant="outlined"
                            onClick={() => onPlayVideo(item.filepath)}
                            sx={{
                                textTransform: "none", fontSize: 11, fontWeight: 700,
                                borderRadius: "20px", px: 1.5, py: 0.2, minWidth: 0,
                                color: "#111", borderColor: "#D1D5DB",
                                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
                            }}
                        >
                            Play Video
                        </Button>
                    )}
                </Box>
            )}
        </Box>
    );
};

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

    const eventColumns = [
        { key: "completed", title: "Completed Events", color: "#7DC353", data: completedEvents, empty: "No completed events" },
        { key: "today", title: "Today's Events", color: "#FF6B35", data: todayEvents, empty: "No events today" },
        { key: "upcoming", title: "Upcoming Events", color: "#3457D5", data: upCommingEvents, empty: "No upcoming events" },
    ];

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
                            <Grid container spacing={2}>
                                {eventColumns.map((col) => (
                                    <Grid key={col.key} size={{ xs: 12, sm: 6, lg: 4 }}>
                                        {/* Column header */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, px: 1.5, py: 1, borderRadius: "10px", bgcolor: `${col.color}14`, border: `1px solid ${col.color}33` }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: col.color }} />
                                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1F2937" }}>{col.title}</Typography>
                                            <Box sx={{ ml: "auto", minWidth: 22, height: 20, px: 0.8, borderRadius: "10px", bgcolor: col.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                                                {col.data.length}
                                            </Box>
                                        </Box>
                                        {/* Column events */}
                                        <Box sx={{ height: "72vh", overflowY: "auto", pr: 0.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                                            {col.data.length === 0 ? (
                                                <Box sx={{ textAlign: "center", mt: 1, py: 4, px: 2, borderRadius: "12px", border: "1px dashed #E5E7EB", bgcolor: "#FAFBFC" }}>
                                                    <EventBusyOutlinedIcon sx={{ fontSize: 30, color: "#CBD5E1", mb: 0.5 }} />
                                                    <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>{col.empty}</Typography>
                                                </Box>
                                            ) : (
                                                col.data.map((item) => (
                                                    <EventCard
                                                        key={item.id}
                                                        item={item}
                                                        onViewImage={handleViewClick}
                                                        onPlayVideo={handleVideoClick}
                                                    />
                                                ))
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
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
