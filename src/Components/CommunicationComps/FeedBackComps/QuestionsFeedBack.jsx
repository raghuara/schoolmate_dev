import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputAdornment, Paper, Switch, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ReactPlayer from "react-player";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { ConsentFetchFetch, DeleteConsentForm, DeleteFeedBackForm, DeleteNewsApi, FeedBackFetchFetch, NewsFetch, parentsFeedBackFetchAll } from "../../../Api/Api";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import NoData from '../../../Images/Login/No Data.png'
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { selectGrades } from "../../../Redux/Slices/DropdownController";

export default function QuestionsFeedBackPage() {
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
    const [filter, setFilter] = useState('Suggestions');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);

    useEffect(() => {
        if (value === 'Y') {
            setIsMyProject('Y');
            setChecked(true);
        } else {
            setIsMyProject('N');
            setChecked(false);
        }
    }, [value]);

    const handleDelete = (id) => {
        setDeleteId(id);
        setOpenAlert(true);
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


    const getGradeNames = (gradeSegments) => {
        return gradeSegments
            .map((segment) => {
                const grade = grades.find((g) => g.id === segment.gradeId);
                if (!grade) return null;

                const sections = segment.sections?.length
                    ? `(${segment.sections.join(', ')})`
                    : '';

                // return `${grade.sign} ${sections}`;
                return `${grade.sign}`;
            })
            .filter(Boolean)
            .join(', ');
    };

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
            const res = await axios.get(FeedBackFetchFetch, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate || "",
                    IsMyProject: "N",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNewsData(res.data.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    const DeleteNews = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteFeedBackForm, {
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
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom:"1px solid #ddd",  }}>
                <Grid container sx={{ py: 2 }}>
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 6
                        }}>
                        <Link style={{ textDecoration: "none" }} to="/dashboardmenu/feedback">
                            <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                        </Link>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Asked Feedback</Typography>
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", px: 1 }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 6
                        }}>
                        <Link to='/dashboardmenu/feedback/responses'>
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
                                    Posted on: {dateGroup.postedOnDate} | {dateGroup.postedOnDay}
                                </Typography>
                                <Grid container spacing={3}>
                                    {/* Render news cards */}
                                    {dateGroup.feedBack
                                        .filter((newsItem) => newsItem)
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
                                                            backgroundColor: dateGroup.tag === "today" ? websiteSettings.mainColor : "transparent",
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
                                                        minHeight: "180px",
                                                        position: "relative",
                                                    }}
                                                >
                                                    <Grid container>
                                                        <Grid
                                                            size={{
                                                                xs: 12,
                                                                sm: 12,
                                                                lg: 9
                                                            }}>
                                                            <Typography sx={{ fontSize: "10px", color: "#777" }}>
                                                                {newsItem.feedBackType === "ratings" ? "Ratings" : newsItem.feedBackType === "multiplechoice" ? "Multiple Choice Question" : newsItem.feedBackType === "openended" ? "Open-Ended Question" : ""}
                                                            </Typography>
                                                            <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                                                {newsItem.heading}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '12px', color: '#777' }}>
                                                                    Delivered to:
                                                                    {newsItem.feedBackGradeSegments?.length > 0 && (
                                                                        <span style={{ fontSize: "10px" }}>
                                                                            ({getGradeNames(newsItem.feedBackGradeSegments)})
                                                                        </span>
                                                                    )}
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
                                                                Posted by: {newsItem.userType}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                                Time: {newsItem.time}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                    <hr style={{ border: "0.5px solid #CFCFCF" }} />
                                                    <Grid container spacing={2}>
                                                        <Grid size={12}>
                                                            <Typography
                                                                sx={{ fontSize: "14px", pt: 1, fontWeight: "600" }}
                                                                dangerouslySetInnerHTML={{ __html: newsItem.question }}
                                                            />
                                                            {newsItem.option01 !== null && (
                                                                <Typography sx={{ fontSize: "14px", color: "#0000007A", fontWeight: "600" }}>
                                                                    Choose the Answer:
                                                                </Typography>
                                                            )}
                                                            {[newsItem.option01, newsItem.option02, newsItem.option03, newsItem.option04].map((option, index) => (
                                                                option !== null && (
                                                                    <Typography
                                                                        key={index}
                                                                        sx={{ fontSize: "14px", color: "#0000007A" }}
                                                                    >
                                                                        {index + 1}. {option}
                                                                    </Typography>
                                                                )
                                                            ))}

                                                        </Grid>
                                                    </Grid>

                                                    {/* Edit and Delete Buttons */}
                                                    {newsItem.isAlterAvilable === "Y" && (
                                                        <Box
                                                            sx={{
                                                                position: "absolute",
                                                                bottom: "16px",
                                                                right: "16px",
                                                                display: "flex",
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <IconButton
                                                                sx={{
                                                                    border: "1px solid black",
                                                                    width: "25px",
                                                                    height: "25px",
                                                                }}
                                                                onClick={() => handleDelete(newsItem.questionId)}
                                                            >
                                                                <DeleteOutlineOutlinedIcon
                                                                    style={{ fontSize: "15px", color: "#000" }}
                                                                />
                                                            </IconButton>
                                                        </Box>
                                                    )}
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
