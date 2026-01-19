import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid,  IconButton, InputAdornment, Paper, Switch, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { DeleteAllDraft, DeleteMessage, DeleteNewsApi, GettingGrades, MessageFetch, MessageFetchDraft, NewsFetch } from "../../../../Api/Api";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import NoData from '../../../../Images/Login/No Data.png'
import { selectGrades } from "../../../../Redux/Slices/DropdownController";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


export default function MessagesDraftPage() {
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [messageData, setMessageData] = useState([]);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    const token = '123';
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteId, setDeleteId] = useState('');

    const location = useLocation();
    const value = location.state?.value || 'N';
    const [checked, setChecked] = useState(false);
    const [isMyProject, setIsMyProject] = useState('N');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const [editId, setEditId] = useState('');
    const [classData, setClassData] = useState([]);
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [openDeleteAllAlert, setOpenDeleteAllAlert] = useState(false);

    useEffect(() => {
        if (value === 'Y') {
            setIsMyProject('Y');
            setChecked(true);
        } else {
            setIsMyProject('N');
            setChecked(false);
        }
    }, [value]);

    const filteredMessage = messageData.filter((dateGroup) =>
        dateGroup.messages.some((messageItem) =>
            messageItem.headLine.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );


    const handleEdit = (id) => {
        setEditId(id)
        setOpenEditAlert(true);

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
    const handleDelete = (id) => {
        setDeleteId(id);
        setOpenAlert(true);
    };

    const handleCloseDialog = (deleted) => {

        setOpenAlert(false);

        if (deleted) {
            DeleteMessageApi(deleteId)
            setOpenAlert(false);
        }
    };

    const handleEditCloseDialog = (edited) => {

        setOpenEditAlert(false);

        if (edited) {
            navigate('edit', { state: { id: editId } });
        }
    };

    const [expandedMessageId, setExpandedMessageId] = useState(null);

    const toggleReadMore = (id) => {
        setExpandedMessageId((prevId) => (prevId === id ? null : id));
    };
    const handleBackClick = () => {
        navigate('/dashboardmenu/draft')
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

    const capitalizeFirstLetter = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    const getGradeNames = (gradeSegments) => {
        return gradeSegments
            .map((segment) => {
                const grade = grades.find((g) => g.id === segment.gradeId);
                if (!grade) return null;

                const sectionList = segment.sections?.length
                    ? `(${segment.sections.join(', ')})`
                    : '';

                return `${grade.sign}${sectionList}`;
            })
            .filter(Boolean)
            .join(', ');
    };

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
        fetchMessage()
    }, [checked, formattedDate])

    useEffect(() => {
        fetchClass()
    }, []);

    const fetchClass = async () => {
        try {
            const res = await axios.get(GettingGrades, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setClassData(res.data)
            console.log("class:", res.data);
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    }


    const fetchMessage = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(MessageFetchDraft, {
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
            setMessageData(res.data.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    const DeleteMessageApi = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteMessage, {
                params: {
                    Id: id,
                    RollNumber: rollNumber,
                    UserType: userType,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchMessage();
            setOpen(true);
            setColor(true);
            setStatus(true);

            if (userType === "superadmin") {
                setMessage("Message Deleted Successfully");
            } else {
                setMessage("Requested Successfully");
            }
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete message. Please try again.");
            console.error('Error deleting message:', error);
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
                    Module: "message",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchMessage();
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

                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 9
                        }}>
                        <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                            <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Messages Draft</Typography>
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

                            <Typography sx={{ fontSize: "20px" }}> Do you really want to delete
                                this message?</Typography>
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
                                changes to this message?</Typography>
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
                    {filteredMessage.length > 0 && filteredMessage[0].messages[0]?.status === "schedule" && (
                        <Box sx={{ backgroundColor: "#8338EC", width: "200px", borderRadius: "50px", display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
                            <Typography
                                sx={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    py: 0.5,
                                }}
                            >
                                Upcoming Messages
                            </Typography>
                        </Box>
                    )}
                    {filteredMessage.length > 0 ? (
                        filteredMessage.map((dateGroup, index) => (
                            <Box key={index} sx={{ mb: 4 }}>

                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        color: "rgba(0,0,0,0.7)",
                                        pb: 1,
                                    }}
                                >
                                    Drafted on:
                                    {dateGroup.postedOnDate} | {dateGroup.postedOnDay}
                                </Typography>
                                <Grid container spacing={2} sx={{ height: "100%" }}>
                                    {dateGroup.messages
                                        .filter((messageItem) =>
                                            messageItem.headLine.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((messageItem) => {
                                            const isReadMore = expandedMessageId === messageItem.id;

                                            return (
                                                <Grid
                                                    key={messageItem.id}
                                                    size={{
                                                        xs: 12,
                                                        sm: 12,
                                                        md: 12,
                                                        lg: 6
                                                    }}>
                                                    <Box
                                                        sx={{
                                                            boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.19)",
                                                            borderRadius: "7px",
                                                            backgroundColor: "#fff",
                                                            p: 2,
                                                            position: "relative",
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
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: "600", fontSize: "16px",  }}>
                                                                        {messageItem.headLine}

                                                                    </Typography>
                                                                    <Typography sx={{ fontSize: '12px', color: '#777' }}>
                                                                        Delivered to: {capitalizeFirstLetter(messageItem.recipient)}&nbsp;
                                                                        {messageItem.recipient === "Students" &&
                                                                            <span style={{ fontSize: "10px" }}>
                                                                                ( {getGradeNames(messageItem.gradeSectionMappings)} )
                                                                            </span>
                                                                        }
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                        <hr style={{ border: "0.5px solid #CFCFCF" }} />

                                                        {/* Message Content */}
                                                        <Box
                                                            sx={{
                                                                fontSize: "14px",
                                                                pt: 1,
                                                                minHeight: "100px",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: isReadMore ? "unset" : 4,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: isReadMore ? "visible" : "hidden",
                                                                textOverflow: "ellipsis",
                                                                mb: 4
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: messageItem.message }}
                                                        />
                                                        {messageItem.message.length > 200 && (
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
                                                                    padding: '2px 15px',
                                                                }}
                                                                onClick={() => toggleReadMore(messageItem.id)}
                                                            >
                                                                {isReadMore ? "Read Less" : "Read More"}
                                                            </Button>
                                                        )}

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
                                                                onClick={() => handleEdit(messageItem.id)}
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
                                                                onClick={() => handleDelete(messageItem.id)}
                                                            >
                                                                <DeleteOutlineOutlinedIcon
                                                                    style={{ fontSize: "15px", color: "#000" }}
                                                                />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: "flex", justifyContent: "end" }}>
                                                        <Box
                                                            sx={{
                                                                borderRadius: "7px",
                                                                marginTop: "0px",
                                                                width: "200px",
                                                                backgroundColor: '#F1EAFC',
                                                                p: 0.3,
                                                                marginRight: "15px",
                                                                borderRadius: "0px 0px 5px 5px",
                                                                visibility: messageItem.status === "schedule" ? "visible" : "hidden",
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
                                                                    display: 'inline-block',
                                                                }} ></span>  Scheduled For {dateGroup.postedOnDay}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            );
                                        })}
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
