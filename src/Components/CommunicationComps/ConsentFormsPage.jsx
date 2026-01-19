import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputAdornment, Paper, Switch, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
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
import { ConsentFetchFetch, DeleteConsentForm, DeleteNewsApi, NewsFetch } from "../../Api/Api";
import Loader from "../Loader";
import SnackBar from "../SnackBar";
import NoData from '../../Images/Login/No Data.png'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { selectGrades } from "../../Redux/Slices/DropdownController";

export default function ConsentFormPage() {
    const today = dayjs();
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
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

    useEffect(() => {
        if (value === 'Y') {
            setIsMyProject('Y');
            setChecked(true);
        } else {
            setIsMyProject('N');
            setChecked(false);
        }
    }, [value]);

    const filteredNews = newsData.filter((dateGroup) =>
        dateGroup.consentForm.some((newsItem) =>
            newsItem.heading.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const handleCheck = (event) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        setIsMyProject(isChecked ? "Y" : "N");
    };

    const handleCreateNews = () => {
        navigate('create')
    }
    const handleEdit = (id) => {
        navigate('edit', { state: { id } });
    };

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

    const handleClearDate = () => {
        setSelectedDate(null);
        setFormattedDate('');
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
    }, [checked, formattedDate])


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(ConsentFetchFetch, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate || '',
                    IsMyProject: isMyProject,
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

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 3
                        }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Consent Forms</Typography>
                    </Grid>

                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2
                        }}>
                        {userType !== "teacher" &&
                            (
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Typography sx={{ fontWeight: "600", fontSize: "12px" }} >My Projects</Typography>
                                    <Switch
                                        checked={checked}
                                        onChange={handleCheck}
                                        inputProps={{ "aria-label": "controlled" }}
                                        sx={{
                                            "& .MuiSwitch-thumb": {
                                                backgroundColor: checked ? websiteSettings.mainColor : "default",
                                            },
                                            "& .MuiSwitch-track": {
                                                borderWidth: checked ? "0" : "1px",
                                                borderStyle: "solid",
                                                backgroundColor: checked ? `${websiteSettings.mainColor} !important` : "#fff",
                                                // borderColor: checked ? websiteSettings.mainColor : "#bdbdbd",
                                            },
                                            "&.MuiSwitch-root.Mui-focusVisible .MuiSwitch-thumb": {
                                                backgroundColor: checked ? websiteSettings.mainColor : "default",
                                            },
                                            "&.MuiSwitch-root.Mui-focusVisible .MuiSwitch-track": {
                                                backgroundColor: checked ? websiteSettings.mainColor : "#bdbdbd",
                                            },
                                            "& .MuiSwitch-focusVisible": {
                                                outline: "none !important",
                                            },
                                        }}
                                    />
                                </Box>
                            )}
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 3,
                            lg: 4
                        }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search forms by heading"
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
                                "& .MuiOutlinedInput-root": {
                                    minHeight: "28px",
                                    paddingRight: "3px",
                                    backgroundColor: "#fff",
                                },
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: websiteSettings.mainColor,
                                },
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                                    marginLeft: "10px"
                                }}>
                                Responses
                            </Button>
                        </Link>
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", px: 1 }}
                        size={{
                            xs: 8,
                            sm: 8,
                            md: 3,
                            lg: 3
                        }}>
                        <Box sx={{ width: "100px" }}>
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
                                            handleClose();
                                        }}
                                        disableFuture
                                        views={['year', 'month', 'day']}
                                        renderInput={() => null}
                                        sx={{
                                            opacity: 0,
                                            pointerEvents: 'none',
                                            width: "0px",
                                        }}

                                    />

                                    <IconButton sx={{
                                        width: '40px',
                                        mt: 0.8,
                                        height: '40px',
                                        transition: 'color 0.3s, background-color 0.3s',
                                        '&:hover': {
                                            color: '#fff',
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                        },

                                    }}
                                        onClick={handleOpen}>
                                        <CalendarMonthIcon style={{ color: "#000" }} />
                                    </IconButton>
                                    {selectedDate ? (
                                        <Tooltip title="Clear Date">
                                            <IconButton sx={{
                                                marginTop: '10px',
                                                width: '40px',
                                                mt: 0.8,
                                                height: '40px',
                                                transition: 'color 0.3s, background-color 0.3s',
                                                '&:hover': {
                                                    color: '#fff',
                                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                                },
                                            }} onClick={handleClearDate}>
                                                <HighlightOffIcon style={{ color: "#000" }} />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Box sx={{ width: "80px" }}>
                                        </Box>
                                    )}
                                </LocalizationProvider>
                            </ThemeProvider>
                        </Box>
                        {userType !== "teacher" &&
                            <Button
                                onClick={handleCreateNews}
                                variant="outlined"
                                sx={{
                                    borderColor: "#A9A9A9",
                                    backgroundColor: "#000",
                                    py: 0.3,
                                    width: "120px",
                                    height: "30px",
                                    color: "#fff",
                                    textTransform: "none",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center"

                                }}
                            >
                                <AddIcon sx={{ fontSize: "18px" }} />
                                &nbsp; Forms
                            </Button>
                        }
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
                                this?</Typography>
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
                    {filteredNews.length > 0 ? (
                        filteredNews.map((dateGroup, index) => (
                            <Box key={index} sx={{ mb: 4, }}>
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
                                    {dateGroup.consentForm
                                        .filter((newsItem) =>
                                            newsItem.heading.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).map((newsItem) => (
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 12,
                                                    lg: 6
                                                }}>
                                                <>
                                                    <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                                        {/* Updated On Box */}


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
                                                        key={newsItem.id}
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
                                                                sx={{  }}
                                                                size={{
                                                                    xs: 12,
                                                                    sm: 12,
                                                                    lg: 9
                                                                }}>
                                                                <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                                                    {newsItem.heading}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: '12px', color: '#777' }}>
                                                                    Delivered to:
                                                                    {newsItem.consentGradeSegments?.length > 0 && (
                                                                        <span style={{ fontSize: "10px" }}>
                                                                            ({getGradeNames(newsItem.consentGradeSegments)})
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
                                                                    Posted by: {newsItem.name}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                                    Time: {newsItem.time}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        <hr style={{ border: "0.5px solid #CFCFCF" }} />
                                                        <Grid container spacing={2}>


                                                            <Grid
                                                                sx={{ height: "200px" }}
                                                                size={{
                                                                    xs: 12,
                                                                    sm: 12,
                                                                    md: 12,
                                                                    lg: 12
                                                                }}>
                                                                <Typography
                                                                    sx={{ fontSize: "14px", pt: 1, px: 2 }}
                                                                    dangerouslySetInnerHTML={{ __html: newsItem.question }}
                                                                />
                                                            </Grid>

                                                        </Grid>

                                                        {/* Edit and Delete Buttons */}

                                                        {newsItem.isAlterAvilable === "Y" &&
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
                                                        }
                                                    </Box>
                                                </>
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
