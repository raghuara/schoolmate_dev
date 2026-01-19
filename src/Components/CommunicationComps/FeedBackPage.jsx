import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputAdornment, Paper, Switch, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import newsImage from '../../Images/PagesImage/news.png';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ReactPlayer from "react-player";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { ConsentFetchFetch, DeleteConsentForm, DeleteNewsApi, NewsFetch, parentsFeedbackAdminUpdate, parentsFeedBackFetchAll } from "../../Api/Api";
import Loader from "../Loader";
import SnackBar from "../SnackBar";
import NoData from '../../Images/Login/No Data.png'
import { Textarea } from "@mui/joy";
import TextareaAutosize from 'react-textarea-autosize';


export default function FeedBackPage() {
    const today = dayjs();
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);

    const [selectedFilter, setSelectedFilter] = useState("Communication");
    const [openAlert, setOpenAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');


    const [newsData, setNewsData] = useState([]);

    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    const token = '123';

    const [searchQuery, setSearchQuery] = useState("");
    const [expandedNews, setExpandedNews] = useState({});
    const [deleteId, setDeleteId] = useState('');

    const location = useLocation();
    const value = location.state?.value || 'N';
    const [checked, setChecked] = useState(false);
    const [isMyProject, setIsMyProject] = useState('N');


    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const [feedbackId, setFeedbackId] = useState('');
    const [answers, setAnswers] = useState({});

    const [filter, setFilter] = useState('Suggestions');


    useEffect(() => {
        if (value === 'Y') {
            setIsMyProject('Y');
            setChecked(true);
        } else {
            setIsMyProject('N');
            setChecked(false);
        }
    }, [value]);

    const handleCreateNews = () => {
        navigate('create')
    }

    const handleAnswerChange = (id, value) => {
        setAnswers((prev) => ({
            ...prev,
            [id]: value
        }));
    };


    const handleCloseDialog = (deleted) => {

        setOpenAlert(false);

        if (deleted) {
            DeleteNews(deleteId)
            setOpenAlert(false);
        }
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleFilterChange = (value) => {
        setFilter(value);
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

    const [showButton, setShowButton] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (boxRef.current) {
                if (boxRef.current.scrollTop > 100) {
                    setShowButton(true);
                } else {
                    setShowButton(false);
                }
            }
        };

        const boxElement = boxRef.current;
        if (boxElement) {
            boxElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (boxElement) {
                boxElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const scrollToTop = () => {
        if (boxRef.current) {
            boxRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        fetchData()
    }, [checked, formattedDate, filter])

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(parentsFeedBackFetchAll, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Type: filter || '',
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = res.data.data;
            setNewsData(data);
            const allFeedbacks = data.flatMap(group => group.parentsFeedBack);

            const initialAnswers = {};
            allFeedbacks.forEach(item => {
                initialAnswers[item.id] = item.answer || "";
            });

            setAnswers(initialAnswers);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendClick = async (id) => {

        if (!answers[id] || !answers[id].trim()) {
            setMessage("Please enter a response before submitting.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        const answer = answers[id] || "";

        try {
            const sendData = {
                id: id,
                answer: answer,
            };

            const res = await axios.put(parentsFeedbackAdminUpdate, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchData();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Sent Successfully");
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Failed to send data. Please try again.";
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };


    const DeleteNews = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteConsentForm, {
                params: {
                    Id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchData();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Deleted Successfully");
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }
    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px",borderBottom:"1px solid #ddd",  }}>
                <Grid container py={1}>
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 4.3
                        }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Feedback from Parents</Typography>
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: 1 }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2
                        }}>
                        <Link to='questions'>
                            <Button
                                sx={{
                                    marginRight: 1,
                                    textTransform: "none",
                                    color: "#D84600",
                                    backgroundColor: "rgba(216, 70, 0, 0.1)",
                                    borderRadius: "30px",
                                    padding: "2px 20px",
                                    marginLeft: "20px"
                                }}>
                                Questions
                            </Button>
                        </Link>
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: 1 }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 3,
                            lg: 3.5
                        }}>
                        <Autocomplete
                            disablePortal
                            options={['Suggestions', 'Complaints', 'Others']}
                            value={filter}
                            onChange={(event, newValue) => handleFilterChange(newValue)}
                            sx={{ width: "200px" }}
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
                                    {option}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    placeholder="Select Filter"
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
                        <Link to='responses'>
                            <Button
                                sx={{
                                    marginRight: 1,
                                    textTransform: "none",
                                    color: "#D84600",
                                    backgroundColor: "rgba(216, 70, 0, 0.1)",
                                    borderRadius: "30px",
                                    padding: "2px 20px",
                                    marginLeft: "20px"
                                }}>
                                Responses
                            </Button>
                        </Link>
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", px: 1 }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 3,
                            lg: 2.2
                        }}>
                        
                        <Button
                            onClick={handleCreateNews}
                            variant="outlined"
                            sx={{
                                borderColor: "#A9A9A9",
                                backgroundColor: "#000",
                                py: 0.3,
                                width: "300px",
                                height: "30px",
                                color: "#fff",
                                textTransform: "none",
                                border: "none",

                            }}
                        >
                            <AddIcon sx={{ fontSize: "20px" }} />
                            &nbsp; Feedback
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <Box ref={boxRef} sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                <Dialog open={openAlert} onClose={() => setOpenAlert(false)}>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                        <Box sx={{
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            p: 3,
                            width: "70%",
                        }}>

                            <Typography sx={{ fontSize: "20px" }}> Do you really want to delete
                                this feedback?</Typography>
                            <DialogActions sx={{
                                justifyContent: 'center',
                                backgroundColor: '#fff',
                                pt: 2
                            }}>
                                <Button
                                    onClick={() => handleCloseDialog(false)}
                                    sx={{
                                        textTransform: 'none',
                                        width: "80px",
                                        borderRadius: '30px',
                                        fontSize: '16px',
                                        py: 0.2,
                                        border: '1px solid black',
                                        color: 'black',
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleCloseDialog(true)}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: websiteSettings.mainColor,
                                        width: "90px",
                                        borderRadius: '30px',
                                        fontSize: '16px',
                                        py: 0.2,
                                        color: websiteSettings.textColor,
                                    }}
                                >
                                    Delete
                                </Button>
                            </DialogActions>
                        </Box>

                    </Box>
                </Dialog>
                <Box sx={{ p: 2 }}>
                    {newsData.length > 0 ? (
                        newsData.map((dateGroup, index) => (
                            <Box key={index} sx={{ mb: 4 }}>
                                {/* Render date */}
                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        color: "rgba(0,0,0,0.7)",
                                        pb: 1,
                                    }}
                                >
                                    Posted on: {dateGroup.postedOn} | {dateGroup.day}
                                </Typography>
                                <Grid container spacing={3}>
                                    {/* Render news cards */}
                                    {dateGroup.parentsFeedBack
                                        .filter((newsItem) => newsItem) // Ensure we only process valid items
                                        .map((newsItem) => (
                                            <Grid
                                                key={newsItem.id}
                                                size={{
                                                    xs: 12,
                                                    sm: 12,
                                                    lg: 6
                                                }}>
                                                <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                                    {/* Today Box */}
                                                    <Box
                                                        sx={{
                                                            borderRadius: "7px",
                                                            width: "80px",
                                                            backgroundColor: dateGroup.tag === "today" ? "#2196f3" : "transparent",
                                                            p: 0.3,
                                                            marginRight: "15px",
                                                            borderRadius: "5px 5px 0px 0px",
                                                            visibility: dateGroup.tag === "today" ? "visible" : "hidden",
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: "600",
                                                                fontSize: "12px",
                                                                color: websiteSettings.textColor,
                                                                textAlign: "center",
                                                            }}
                                                        >
                                                            Today
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.19)",
                                                        borderRadius: "7px",
                                                        backgroundColor: "#fff",
                                                        p: 2,
                                                        mb: 2,
                                                        position: "relative",
                                                        minHeight: "170px"
                                                    }}
                                                >
                                                    <Grid container>
                                                        <Grid
                                                            sx={{ display: "flex", alignItems: "center" }}
                                                            size={{
                                                                xs: 12,
                                                                sm: 12,
                                                                lg: 9
                                                            }}>
                                                            <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                                                {newsItem.heading}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid
                                                            sx={{ textAlign: "right" }}
                                                            size={{
                                                                xs: 12,
                                                                sm: 12,
                                                                lg: 3
                                                            }}>
                                                            <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                                Posted by: {newsItem.name} - {newsItem.rollNumber}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                                Class: {newsItem.grade} - {newsItem.section}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                                Posted on:{dateGroup.postedOn}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                    <hr style={{ border: "0.5px solid #CFCFCF" }} />
                                                    <Grid container spacing={2}>
                                                        <Grid size={12}>
                                                            <Typography
                                                                sx={{ fontSize: "14px", pt: 1, px: 2 }}
                                                                dangerouslySetInnerHTML={{ __html: newsItem.question }}
                                                            />
                                                        </Grid>
                                                        {(userType === "superadmin" || userType === "admin") &&
                                                            <Grid sx={{ position: "relative" }} size={12}>
                                                                <TextareaAutosize
                                                                    key={newsItem.id}
                                                                    placeholder="Reply Here..."
                                                                    disabled={newsItem.answer !== null}
                                                                    value={answers[newsItem.id] || ""}
                                                                    onChange={(e) => handleAnswerChange(newsItem.id, e.target.value)}
                                                                    minRows={6}
                                                                    maxRows={6}
                                                                    style={{
                                                                        width: "100%",
                                                                        padding: "12px 10px",
                                                                        boxSizing: "border-box",
                                                                        overflowY: "auto",
                                                                        fontSize: "16px",
                                                                        fontFamily: "Arial, sans-serif",
                                                                        color: "#5A5A5A",
                                                                        resize: "none",
                                                                        borderRadius: "7px",
                                                                        border: "none",
                                                                        backgroundColor: newsItem.answer !== null ? "#e0e0e0" : "#F1F1F1"
                                                                    }}
                                                                />

                                                                <Box sx={{ position: "absolute", bottom: "10px", right: "10px" }}>
                                                                    {newsItem.answer === null &&
                                                                        <Button variant="contained" onClick={() => handleSendClick(newsItem.id)} sx={{
                                                                            textTransform: "none",
                                                                            backgroundColor: websiteSettings.mainColor,
                                                                            color: websiteSettings.textColor,
                                                                            width: "80px",
                                                                            height: "25px",
                                                                            borderRadius: "30px",
                                                                        }}>
                                                                            Send
                                                                        </Button>
                                                                    }
                                                                </Box>
                                                            </Grid>
                                                        }

                                                    </Grid>

                                                </Box>
                                            </Grid>
                                        ))}
                                </Grid>
                            </Box>
                        ))
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "77vh",
                                textAlign: "center",
                            }}
                        >
                            <img
                                src={NoData}
                                alt="No data"
                                style={{
                                    width: "30%",
                                    height: "auto",
                                    marginBottom: "16px",
                                }}
                            />
                        </Box>
                    )}
                </Box>



                {showButton && (
                    <Fab
                        color="primary"
                        onClick={scrollToTop}
                        style={{
                            position: 'absolute',
                            width: "35px",
                            height: "35px",
                            bottom: '18px',
                            right: '18px',
                            zIndex: 1000,
                            backgroundColor: "#000"
                        }}
                    >
                        <ArrowUpwardIcon />
                    </Fab>
                )}
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
                    src={imageUrl}
                    alt="Popup"
                    style={{
                        width: '25vw',
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
    );
}
