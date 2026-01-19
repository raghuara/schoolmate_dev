import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputAdornment, Paper, Switch, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { ConsentFetchFetch, ConsentFetchFetchDradt, DeleteAllDraft, DeleteConsentForm, DeleteNewsApi, FeedBackFetchFetchDraft, NewsFetch } from "../../../../Api/Api";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import NoData from '../../../../Images/Login/No Data.png'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function FeedBackDraftPage() {
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
    const [deleteId, setDeleteId] = useState('');
    const [editId, setEditId] = useState('');
    const location = useLocation();
    const value = location.state?.value || 'N';
    const [checked, setChecked] = useState(false);
    const [isMyProject, setIsMyProject] = useState('N');
    const [openDeleteAllAlert, setOpenDeleteAllAlert] = useState(false);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    
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
        dateGroup.feedBack.some((newsItem) =>
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

    const handleDeleteAll = () => {
        setOpenDeleteAllAlert(true);
    };
    const handleDeleteAllClose = (edited) => {
        setOpenDeleteAllAlert(false);
        if (edited) {
            DeleteAll()
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

    const handleEditCloseDialog = (edited) => {

        setOpenEditAlert(false);

        if (edited) {
            navigate('edit', { state: { id: editId } });
        }
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
            const res = await axios.get(FeedBackFetchFetchDraft, {
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
    const DeleteAll = async () => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteAllDraft, {
                params: {
                    RollNumber: rollNumber,
                    Module: "feedback",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchData();
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
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", }}>
                <Grid container>
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 9
                        }}>
                    <Link style={{ textDecoration: "none" }} to="/dashboardmenu/draft">
                    <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                </Link>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Feedback Drafts</Typography>
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", px: 1 }}
                        size={{
                            xs: 8,
                            sm: 8,
                            md: 3,
                            lg: 3
                        }}>
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
                <Dialog open={openEditAlert} onClose={() => setOpenEditAlert(false)}>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>
                        <Box sx={{
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            p: 3,
                            width: "70%",
                        }}>
                            <Typography sx={{ fontSize: "20px" }}>Do you really want to make
                                changes to this feedback?</Typography>
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
                                    {dateGroup.feedBack
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
                                                                sx={{ display: "flex", alignItems: "center" }}
                                                                size={{
                                                                    xs: 12,
                                                                    sm: 12,
                                                                    lg: 12
                                                                }}>
                                                                <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                                                    {newsItem.heading}
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

                                           
                                                            <Box
                                                                sx={{
                                                                    position: "absolute",
                                                                    bottom: "16px",
                                                                    right: "16px",
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
                                                                onClick={() => handleEdit(newsItem.questionId)}
                                                            >
                                                                <EditOutlinedIcon style={{ fontSize: "15px" }} />
                                                                &nbsp;Edit
                                                            </Button>

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
