import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputAdornment, Paper, styled, Switch, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { useSelector } from "react-redux";
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
import { DeleteAllDraft, DeleteNewsApi, NewsFetch, NewsFetchDraft } from "../../../../Api/Api";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import NoData from '../../../../Images/Login/No Data.png'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function NewsDraftPage() {
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openDeleteAllAlert, setOpenDeleteAllAlert] = useState(false);
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
    const [deleteId, setDeleteId] = useState('');
    const [editId, setEditId] = useState('');
    const location = useLocation();
    const value = location.state?.value || 'N';
    const [checked, setChecked] = useState(false);
    const [isMyProject, setIsMyProject] = useState('N');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [expandedMessageId, setExpandedMessageId] = useState(null);
    const [overflowStates, setOverflowStates] = useState({});
    const textRefs = useRef({});

    const toggleReadMore = (id) => {
        setExpandedMessageId((prevId) => (prevId === id ? null : id));
    };

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
        dateGroup.news.some((newsItem) =>
            newsItem.headLine.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    useEffect(() => {
        const newOverflowStates = {};

        filteredNews.forEach((dateGroup) => {
            dateGroup.news.forEach((newsItem) => {
                const textElement = textRefs.current[newsItem.id];
                if (textElement) {
                    const { scrollHeight, clientHeight } = textElement;
                    newOverflowStates[newsItem.id] = scrollHeight > clientHeight;
                }
            });
        });

        setOverflowStates(newOverflowStates);
    }, [filteredNews]);


    const handleBackClick = () => {
        navigate('/dashboardmenu/draft')
    };
    const handleDeleteAll = () => {
        setOpenDeleteAllAlert(true);
    };

    const handleEdit = (id) => {
        setEditId(id)
        setOpenEditAlert(true);

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

    const handleEditCloseDialog = (edited) => {

        setOpenEditAlert(false);

        if (edited) {
            navigate('edit', { state: { id: editId } });
        }
    };

    const handleDeleteAllClose = (edited) => {
        setOpenDeleteAllAlert(false);
        if (edited) {
            DeleteAll()
        }
    };

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
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


    function isYouTubeLink(url) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|(?:watch\?v=|.+\/videoseries\?v=))|youtu\.be\/)[^&?\/\s]+/;
        return youtubeRegex.test(url);
    }

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
        fetchNews()
    }, [checked, formattedDate])


    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(NewsFetchDraft, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate || '',
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
            const res = await axios.delete(DeleteNewsApi, {
                params: {
                    Id: id,
                    RollNumber: rollNumber,
                    UserType: userType,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchNews();
            setOpen(true);
            setColor(true);
            setStatus(true);

            if (userType === "superadmin") {
                setMessage("News Deleted Successfully");
            } else {
                setMessage("Requested Successfully");
            }
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete news. Please try again.");
            console.error('Error deleting news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const DeleteAll = async () => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteAllDraft, {
                params: {
                    RollNumber: rollNumber,
                    Module: "news",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchNews();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Deleted successfully");
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete news. Please try again.");
            console.error('Error deleting news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom:"1px solid #ddd",  }}>
                <Grid container>
                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 9 }} sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >News Draft</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }} sx={{ display: "flex", justifyContent: "end", alignItems: "center", px: 1 }}>
                        <Box sx={{ px: 1, }}>
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
                                        width: '45px',
                                        mt: 0.8,
                                        height: '45px',
                                        transition: 'color 0.3s, background-color 0.3s',
                                        '&:hover': {
                                            color: '#fff',
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                        },

                                    }}
                                        onClick={handleOpen}>
                                        <CalendarMonthIcon style={{ color: "#000" }} />
                                    </IconButton>
                                </LocalizationProvider>
                            </ThemeProvider>
                        </Box>
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                width: "100px",
                                height: "27px",
                                borderRadius: '30px',
                                fontSize: '10px',
                                border: '1px solid black',
                                color: 'black',
                                fontWeight: "600",
                                backgroundColor: "#fff",
                            }}
                            onClick={handleDeleteAll}
                        >
                            <DeleteOutlineOutlinedIcon style={{ fontSize: "16px" }} />
                            &nbsp;Delete All
                        </Button>
                    </Grid>
                </Grid>
                <Dialog open={openDeleteAllAlert} onClose={() => setOpenDeleteAllAlert(false)}>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                        <Box sx={{
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            p: 3,
                            width: "70%",
                        }}>

                            <Typography sx={{ fontSize: "20px" }}>Are you sure you want to delete all drafts permanently?</Typography>
                            <DialogActions sx={{
                                justifyContent: 'center',
                                backgroundColor: '#fff',
                                pt: 2
                            }}>
                                <Button
                                    onClick={() => handleDeleteAllClose(false)}
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
                                    No
                                </Button>
                                <Button
                                    onClick={() => handleDeleteAllClose(true)}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: websiteSettings.mainColor,
                                        width: "80px",
                                        borderRadius: '30px',
                                        fontSize: '16px',
                                        py: 0.2,
                                        color: websiteSettings.textColor,
                                    }}
                                >
                                    Yes
                                </Button>
                            </DialogActions>
                        </Box>

                    </Box>
                </Dialog>

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
                            {userType === "superadmin" ? (
                                <Typography sx={{ fontSize: "20px" }}>
                                    Do you really want to delete
                                    this news? </Typography>
                            ) : (
                                <Typography sx={{ fontSize: "20px" }}>
                                    Are you sure want to send
                                    Delete Request ?
                                </Typography>
                            )}
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
                                    {userType === "superadmin" ?
                                        "Delete" : "Send"}
                                </Button>
                            </DialogActions>
                        </Box>

                    </Box>
                </Dialog>

                <Dialog open={openEditAlert} onClose={() => setOpenEditAlert(false)}>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                        <Box sx={{
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            p: 3,
                            width: "70%",
                        }}>

                            <Typography sx={{ fontSize: "20px" }}>Do you really want to make
                                changes to this news?</Typography>
                            <DialogActions sx={{
                                justifyContent: 'center',
                                backgroundColor: '#fff',
                                pt: 2
                            }}>
                                <Button
                                    onClick={() => handleEditCloseDialog(false)}
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
                                    onClick={() => handleEditCloseDialog(true)}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: websiteSettings.mainColor,
                                        width: "80px",
                                        borderRadius: '30px',
                                        fontSize: '16px',
                                        py: 0.2,
                                        color: websiteSettings.textColor,
                                    }}
                                >
                                    Edit
                                </Button>
                            </DialogActions>
                        </Box>

                    </Box>
                </Dialog>

                <Box sx={{ p: 2 }}>
                    {filteredNews.length > 0 ? (
                        filteredNews.map((dateGroup, index) => (
                            <Box key={index} sx={{ mb: 4 }}>
                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        color: "rgba(0,0,0,0.7)",
                                        pb: 1,
                                    }}
                                >
                                    {dateGroup.news[0]?.status === "schedule" ? "Scheduled on :" : "Posted on:"}
                                    {dateGroup.postedOnDate} | {dateGroup.postedOnDay}
                                </Typography>

                                {/* Render news cards */}
                                {dateGroup.news
                                    .filter((newsItem) =>
                                        newsItem.headLine.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map((newsItem) => {
                                        const isReadMore = expandedMessageId === newsItem.id;
                                        return (
                                            <>
                                                <Box
                                                    key={newsItem.id}
                                                    sx={{
                                                        boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.19)",
                                                        borderRadius: "7px",
                                                        backgroundColor: "#fff",
                                                        p: 2,
                                                        mb: 2,
                                                        position: "relative",
                                                    }}
                                                >
                                                    <Grid container>
                                                        <Grid
                                                            size={{ xs: 12, sm: 12, lg: 12 }}
                                                            sx={{ display: "flex", alignItems: "center" }}
                                                        >
                                                            <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                                                {newsItem.headLine === null ? "" : newsItem.headLine}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                    <hr style={{ border: "0.5px solid #CFCFCF" }} />
                                                    <Grid container spacing={2}>

                                                        {newsItem.fileType === "image" &&
                                                            <Grid
                                                                size={{ xs: 12, sm: 12, md: 5, lg: 3.3 }}
                                                                sx={{
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    position: "relative",
                                                                    py: 1,
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        position: "relative",
                                                                        width: "273px",
                                                                        height: "210px",
                                                                        "&:hover .overlay": {
                                                                            opacity: 1,
                                                                        },
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={newsItem.filePath}
                                                                        width={"100%"}
                                                                        height={"100%"}
                                                                        alt="news"
                                                                        style={{
                                                                            display: "block",
                                                                        }}
                                                                    />
                                                                    <Box
                                                                        className="overlay"
                                                                        sx={{
                                                                            position: "absolute",
                                                                            top: 0,
                                                                            left: 0,
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            opacity: 0,
                                                                            transition: "opacity 0.3s ease-in-out",
                                                                        }}
                                                                    >
                                                                        <Button
                                                                            variant="outlined"
                                                                            sx={{
                                                                                textTransform: "none",
                                                                                padding: "2px 15px",
                                                                                borderRadius: "30px",
                                                                                fontSize: "12px",
                                                                                border: "2px solid white",
                                                                                color: "white",
                                                                                fontWeight: "600",
                                                                                backgroundColor: "transparent",
                                                                            }}
                                                                            onClick={() => handleViewClick(newsItem.filePath)}
                                                                        >
                                                                            View Image
                                                                        </Button>
                                                                    </Box>
                                                                </Box>
                                                            </Grid>
                                                        }
                                                        {newsItem.fileType === "link" &&
                                                            <Grid
                                                                size={{ xs: 12, sm: 12, md: 5, lg: 3.3 }}
                                                                sx={{ display: "flex", justifyContent: "center", py: 1 }}
                                                            >
                                                                {isYouTubeLink(newsItem.filePath) ? (
                                                                    <Box style={{ display: "flex", justifyContent: "center" }}>
                                                                        <ReactPlayer
                                                                            url={newsItem.filePath}
                                                                            width="273px"
                                                                            height="210px"
                                                                            playing={false}
                                                                        />
                                                                    </Box>
                                                                ) : (
                                                                    <Box>
                                                                        <Typography color="error">
                                                                            Incorrect Youtube link.
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Grid>
                                                        }

                                                        {newsItem.fileType === "empty" && (
                                                            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                                                                <Box
                                                                    ref={(el) => (textRefs.current[newsItem.id] = el)}
                                                                    sx={{
                                                                        fontSize: "14px",
                                                                        pt: 1,
                                                                        minHeight: "120px",
                                                                        display: "-webkit-box",
                                                                        WebkitLineClamp: isReadMore ? "unset" : 8,
                                                                        WebkitBoxOrient: "vertical",
                                                                        overflow: isReadMore ? "visible" : "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        mb: 3,
                                                                    }}
                                                                    dangerouslySetInnerHTML={{ __html: newsItem.news }}
                                                                />
                                                                {(isReadMore || overflowStates[newsItem.id]) && (
                                                                    <Button
                                                                        sx={{
                                                                            mt: 1,
                                                                            position: "absolute",
                                                                            borderRadius: "50px",
                                                                            backgroundColor: "black",
                                                                            color: "#fff",
                                                                            bottom: "10px",
                                                                            textTransform: "none",
                                                                            fontSize: "12px",
                                                                            padding: "2px 15px",
                                                                        }}
                                                                        onClick={() => toggleReadMore(newsItem.id)}
                                                                    >
                                                                        {isReadMore ? "Read Less" : "Read More"}
                                                                    </Button>
                                                                )}
                                                            </Grid>
                                                        )}
                                                        {newsItem.fileType !== "empty" && (
                                                            <Grid size={{ xs: 12, sm: 12, md: 7, lg: 8.7 }}>
                                                                <Box
                                                                    ref={(el) => (textRefs.current[newsItem.id] = el)}
                                                                    sx={{
                                                                        fontSize: "14px",
                                                                        pt: 1,
                                                                        minHeight: "120px",
                                                                        display: "-webkit-box",
                                                                        WebkitLineClamp: isReadMore ? "unset" : 8,
                                                                        WebkitBoxOrient: "vertical",
                                                                        overflow: isReadMore ? "visible" : "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        mb: 3,
                                                                    }}
                                                                    dangerouslySetInnerHTML={{ __html: newsItem.news }}
                                                                />
                                                                {(isReadMore || overflowStates[newsItem.id]) && (
                                                                    <Button
                                                                        sx={{
                                                                            mt: 1,
                                                                            position: "absolute",
                                                                            borderRadius: "50px",
                                                                            backgroundColor: "black",
                                                                            color: "#fff",
                                                                            bottom: "10px",
                                                                            textTransform: "none",
                                                                            fontSize: "12px",
                                                                            padding: "2px 15px",
                                                                        }}
                                                                        onClick={() => toggleReadMore(newsItem.id)}
                                                                    >
                                                                        {isReadMore ? "Read Less" : "Read More"}
                                                                    </Button>
                                                                )}

                                                            </Grid>

                                                        )}

                                                    </Grid>

                                                    {/* Edit and Delete Buttons */}

                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            bottom: "12px",
                                                            right: "12px",
                                                            display: "flex",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Button
                                                            variant="outlined"
                                                            sx={{
                                                                textTransform: 'none',
                                                                padding: '2px 0',
                                                                borderRadius: '30px',
                                                                fontSize: '10px',
                                                                border: '1px solid black',
                                                                color: 'black',
                                                                fontWeight: "600",
                                                                backgroundColor: "#fff"
                                                            }}
                                                            onClick={() => handleEdit(newsItem.id)}
                                                        >
                                                            <EditOutlinedIcon style={{ fontSize: "15px" }} />
                                                            &nbsp;Edit
                                                        </Button>
                                                        <IconButton
                                                            sx={{
                                                                border: "1px solid black",
                                                                width: "25px",
                                                                height: "25px",
                                                                backgroundColor: "#fff",
                                                            }}
                                                            onClick={() => handleDelete(newsItem.id)}
                                                        >
                                                            <DeleteOutlineOutlinedIcon
                                                                style={{ fontSize: "15px", color: "#000" }}
                                                            />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: "flex", justifyContent: "end", pb: 2 }}>
                                                    <Box
                                                        sx={{
                                                            borderRadius: "7px",
                                                            marginTop: "-15px",
                                                            width: "200px",
                                                            backgroundColor: '#F1EAFC',
                                                            p: 0.3,
                                                            marginRight: "15px",
                                                            borderRadius: "0px 0px 5px 5px",
                                                            visibility: newsItem.status === "schedule" ? "visible" : "hidden",
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: "600",
                                                                fontSize: "12px",
                                                                color: "#8338EC",
                                                                textAlign: "center",
                                                            }}
                                                        >
                                                            <span style={{
                                                                height: '8px',
                                                                width: '8px',
                                                                backgroundColor: '#8338EC',
                                                                borderRadius: ' 50%',
                                                                display: 'inline-block'
                                                            }} ></span>  Scheduled For {dateGroup.postedOnDay}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </>

                                        )
                                    })}
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiPaper-root': {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        borderRadius: 0,
                        padding: 0,
                        overflow: 'visible',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                    },
                }}
                BackdropProps={{
                    style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                }}
            >
                {/* Image */}
                <img
                    src={imageUrl}
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

                {/* Close Button */}
                <DialogActions
                    sx={{
                        position: 'absolute',
                        top: '-40px',
                        right: "-50px",
                        padding: 0,
                    }}
                >
                    <IconButton
                        onClick={handleImageClose}
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            color: '#fff',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogActions>
            </Dialog>
        </Box >
    );
}
