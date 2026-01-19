import { Autocomplete, Box, Button, Checkbox, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Switch, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { BulkDeleteMessage, DeleteMessage, DeleteNewsApi, GettingGrades, MessageFetch, NewsFetch } from "../../Api/Api";
import Loader from "../Loader";
import SnackBar from "../SnackBar";
import NoData from '../../Images/Login/No Data.png'
import { selectGrades } from "../../Redux/Slices/DropdownController";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';


export default function MessagesPage() {
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openDeliveredAlert, setOpenDeliveredAlert] = useState(false);
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
    const [selectedMessageIds, setSelectedMessageIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const location = useLocation();
    const value = location.state?.value || 'N';
    const [checked, setChecked] = useState(false);
    const [isMyProject, setIsMyProject] = useState('N');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [openBulkDeleteAlert, setOpenBulkDeleteAlert] = useState(false);
    const [editId, setEditId] = useState('');
    const [messageDetails, setMessageDetails] = useState(null);
    const [classData, setClassData] = useState([]);
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

    const filteredMessage = messageData.filter((dateGroup) =>
        dateGroup.messages.some((messageItem) =>
            messageItem.headLine.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleDeliver = (messageItem) => {
        setMessageDetails(messageItem)
        setOpenDeliveredAlert(true);

    };
    const handleClearDate = () => {
        setSelectedDate(null);
        setFormattedDate('');
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

    const handleDeliveredCloseDialog = () => {
        setOpenDeliveredAlert(false);
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

    const getGradeNames = (gradeSectionMappings) => {
        return gradeSectionMappings
            .map((mapping) => {
                const grade = grades.find((g) => g.id === mapping.gradeId);
                if (grade) {
                    const sections = mapping.sections.join(', ');
                    return `${grade.sign} (${sections})`;
                }
                return null;
            })
            .filter(Boolean)
            .join(', ');
    };


    const handleCloseBulkDeleteDialog = (deleted) => {

        setOpenBulkDeleteAlert(false);

        if (deleted) {
            BulkDelete(selectedMessageIds)
            setOpenBulkDeleteAlert(false);
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
            const res = await axios.get(MessageFetch, {
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
    const handleDeleteSelected = () => {
        setOpenBulkDeleteAlert(true);
    };

    const BulkDelete = async (ids) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(BulkDeleteMessage, {
                data: { ids: ids },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchMessage();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Messages Deleted Successfully");
            setSelectedMessageIds([]);
            setSelectAll(false);
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            console.error('Error deleting messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd" }}>
                <Grid container>
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 3
                        }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Messages</Typography>
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2
                        }}>
                        {userType !== "teacher" &&
                            <>
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
                            </>
                        }
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 4
                        }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search message by heading"
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
                                        slotProps={{
                                            day: {
                                                sx: (theme) => ({
                                                    '&.Mui-selected': {
                                                        backgroundColor: `${websiteSettings.mainColor} !important`,
                                                        color: "#000",
                                                        border: `1px solid ${websiteSettings.mainColor}`,
                                                    },
                                                    '&.MuiPickersDay-today': {
                                                        border: `1px solid ${websiteSettings.mainColor}`,
                                                        color: '#fff',
                                                    },
                                                    '&.Mui-selected.MuiPickersDay-today': {
                                                        backgroundColor: `${websiteSettings.mainColor} !important`,
                                                        border: `1px solid ${websiteSettings.mainColor}`,
                                                        color: '#000',
                                                    }
                                                }),
                                            },
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
                                    width: "110px",
                                    height: "30px",
                                    color: "#fff",
                                    textTransform: "none",
                                    border: "none",

                                }}
                            >
                                <AddIcon sx={{ fontSize: "18px" }} />
                                &nbsp;Message
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
                <Dialog open={openBulkDeleteAlert} onClose={() => setOpenBulkDeleteAlert(false)}>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                        <Box sx={{
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            p: 3,
                            width: "70%",
                        }}>

                            <Typography sx={{ fontSize: "20px" }}> Do you really want to delete the selected Messages?</Typography>
                            <DialogActions sx={{
                                justifyContent: 'center',
                                backgroundColor: '#fff',
                                pt: 2
                            }}>
                                <Button
                                    onClick={() => handleCloseBulkDeleteDialog(false)}
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
                                    onClick={() => handleCloseBulkDeleteDialog(true)}
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
                {userType === "superadmin" &&
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, alignItems: "center" }}>
                        {selectedMessageIds.length > 0 ? (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleDeleteSelected}
                                sx={{ textTransform: "none", fontSize: "14px", height: "30px", }}
                            >
                                Delete Selected ({selectedMessageIds.length})
                            </Button>
                        ) : (
                            <Box width={"20px"} />
                        )}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectAll}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setSelectAll(checked);

                                        if (checked) {
                                            const allIds = filteredMessage
                                                .flatMap((group) => group.messages.map((msg) => msg.id));
                                            setSelectedMessageIds(allIds);
                                        } else {
                                            setSelectedMessageIds([]);
                                        }
                                    }}
                                />
                            }
                            label="Select All"
                        />
                    </Box>
                }
                <Box sx={{ px: 2, pb: 2 }}>
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
                            <Box key={index} sx={{ mb: 3, p: 2 }}>

                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        color: "rgba(0,0,0,0.7)",
                                        pb: 1,
                                    }}
                                >
                                    {dateGroup.messages[0]?.status === "schedule" ? "Scheduled on :" : "Posted on:"}
                                    {dateGroup.postedOnDate} | {dateGroup.postedOnDay}
                                </Typography>
                                <Grid container spacing={4} sx={{ height: "100%" }}>
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
                                                    {/* Updated On and Today Boxes */}
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Box
                                                            sx={{
                                                                width: "190px",
                                                                backgroundColor: messageItem.updatedOn ? websiteSettings.lightColor : "transparent",
                                                                p: 0.5,
                                                                ml: "15px",
                                                                borderRadius: "5px 5px 0px 0px",
                                                                visibility: messageItem.updatedOn ? "visible" : "hidden",
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: "600",
                                                                    fontSize: "10px",
                                                                    color: "#353535",
                                                                    textAlign: "center",
                                                                }}
                                                            >
                                                                Updated on {messageItem.updatedOn}
                                                            </Typography>
                                                        </Box>

                                                        <Box
                                                            sx={{
                                                                borderRadius: "7px",
                                                                width: "80px",
                                                                backgroundColor: dateGroup.tag === "today" ? websiteSettings.mainColor : "transparent",
                                                                p: 0.3,
                                                                mr: "15px",
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
                                                    {/* Message Card */}
                                                    <Box
                                                        sx={{
                                                            boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.19)",
                                                            borderRadius: "7px",
                                                            backgroundColor: "#fff",
                                                            p: 2,
                                                            position: "relative",
                                                        }}
                                                    >
                                                        {userType === "superadmin" &&
                                                            <Checkbox
                                                                checked={selectedMessageIds.includes(messageItem.id)}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setSelectedMessageIds(prev =>
                                                                        checked
                                                                            ? [...prev, messageItem.id]
                                                                            : prev.filter(id => id !== messageItem.id)
                                                                    );
                                                                }}
                                                                sx={{ position: "absolute", top: 6, left: -37 }}
                                                            />
                                                        }
                                                        <Grid container>
                                                            <Grid
                                                                sx={{ display: "flex", alignItems: "center" }}
                                                                size={{
                                                                    xs: 12,
                                                                    sm: 12,
                                                                    lg: 9
                                                                }}>
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: "600", fontSize: "16px", height: "70px" }}>
                                                                        {messageItem.headLine}
                                                                    </Typography>
                                                                    <Box sx={{ display: "flex" }}>
                                                                        <Typography sx={{ fontSize: '12px', color: '#777' }}>
                                                                            Delivered to: {
                                                                                messageItem.everyone === "Y"
                                                                                    ? "Everyone"
                                                                                    : [
                                                                                        messageItem.students === "Y" ? "Students" : null,
                                                                                        messageItem.staffs === "Y" ? "Staffs" : null,
                                                                                        messageItem.specific === "Y" ? "Specific" : null
                                                                                    ].filter(Boolean).join(", ")
                                                                            }
                                                                        </Typography>

                                                                        <Button
                                                                            variant="outlined"
                                                                            sx={{
                                                                                textTransform: "none",
                                                                                width: "50px",
                                                                                height: "20px",
                                                                                borderRadius: "30px",
                                                                                fontSize: "10px",
                                                                                border: "1px solid #777",
                                                                                color: '#777',
                                                                                fontWeight: "600",
                                                                                ml: 2
                                                                            }}
                                                                            onClick={() => handleDeliver(messageItem)}
                                                                        >
                                                                            &nbsp;View
                                                                        </Button>


                                                                    </Box>
                                                                </Box>
                                                            </Grid>
                                                            <Grid
                                                                sx={{ textAlign: "right" }}
                                                                size={{
                                                                    xs: 12,
                                                                    sm: 12,
                                                                    lg: 3
                                                                }}>
                                                                <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                                    Posted by: {messageItem.name}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                                    Time: {messageItem.time}
                                                                </Typography>
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

                                                        {/* Edit and Delete Buttons */}
                                                        {(userType !== "teacher" && userType !== "superadmin") && (
                                                            (messageItem.isAlterAvilable === "Y" || isMyProject === "Y") &&
                                                            <Box
                                                                sx={{
                                                                    position: "absolute",
                                                                    bottom: "10px",
                                                                    right: "10px",
                                                                    display: "flex",
                                                                    gap: 1,
                                                                }}
                                                            >
                                                                <Button
                                                                    variant="outlined"
                                                                    sx={{
                                                                        textTransform: "none",
                                                                        padding: "2px 0",
                                                                        borderRadius: "30px",
                                                                        fontSize: "10px",
                                                                        border: "1px solid black",
                                                                        color: "black",
                                                                        fontWeight: "600",
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
                                                                    }}
                                                                    onClick={() => handleDelete(messageItem.id)}
                                                                >
                                                                    <DeleteOutlineOutlinedIcon
                                                                        style={{ fontSize: "15px", color: "#000" }}
                                                                    />
                                                                </IconButton>
                                                            </Box>
                                                        )}
                                                        {userType === "superadmin" &&
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
                                                        }
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
            <Dialog open={openDeliveredAlert} onClose={() => setOpenDeliveredAlert(false)}>
                <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                    <Box sx={{
                        backgroundColor: '#fff',
                        p: 1,
                    }}>
                        <Typography sx={{fontWeight:"600"}}>Delivered Details</Typography>
                        <hr />
                        <Box sx={{ maxHeight: "400px", overflowY: "auto", minHeight:"100px", minWidth:"400px" }}>
                            {messageDetails?.everyone === "Y" ? (
                                <Typography sx={{fontWeight:"600", fontSize:"14px"}}>For everyone</Typography>
                            ) : (
                                <>
                                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333", mb: 2 }}>
                                        Selected Students:&nbsp;
                                        <Box component="span" sx={{ fontSize: "11.5px", fontWeight: 500, color: "#555" }}>
                                            {messageDetails?.gradeSectionMappings?.length > 0
                                                ? getGradeNames(messageDetails.gradeSectionMappings)
                                                : "No students selected"}
                                        </Box>
                                    </Typography>

                                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333", mb: 2 }}>
                                        Selected Staffs:&nbsp;
                                        <Box component="span" sx={{ fontSize: "12px", fontWeight: 500, color: "#555" }}>
                                            {messageDetails?.staffUserTypes?.length > 0
                                                ? messageDetails.staffUserTypes
                                                    .map((type) => {
                                                        if (type === "teaching") return "Teaching";
                                                        if (type === "nonteaching") return "Non - Teaching";
                                                        if (type === "supporting") return "Supporting";
                                                        return type;
                                                    })
                                                    .join(', ')
                                                : "No staff selected"}
                                        </Box>
                                    </Typography>

                                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333", mb: 2 }}>
                                        Selected Users:&nbsp;
                                        <Box component="span" sx={{ fontSize: "12px", fontWeight: 500, color: "#555" }}>
                                            {messageDetails?.specificUsers?.length > 0
                                                ? messageDetails.specificUsers.join(', ')
                                                : "No users selected"}
                                        </Box>
                                    </Typography>
                                </>
                            )}
                        </Box>


                        <DialogActions sx={{
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                            pt: 2
                        }}>
                            <Button
                                onClick={() => handleDeliveredCloseDialog(false)}
                                sx={{
                                    textTransform: 'none',
                                    width: "70px",
                                    borderRadius: '30px',
                                    fontSize: '12px',
                                    py: 0.2,
                                    border: '1px solid black',
                                    color: 'black',
                                }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </Box>

                </Box>
            </Dialog >
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
        </Box >
    );
}
