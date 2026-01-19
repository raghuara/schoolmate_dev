import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, Grid, IconButton, InputAdornment, Paper, styled, Switch, Tab, Tabs, TextareaAutosize, TextField, ThemeProvider, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReactPlayer from "react-player";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { ApprovalStatusMessageFetch, ApprovalStatusNewsFetch, DeleteMessage, DeleteNewsApi, NewsFetch, updateMessageApprovalAction, updateNewsApprovalAction } from "../../../Api/Api";
import Loader from "../../Loader";
import SnackBar from "../../SnackBar";
import NoData from '../../../Images/Login/No Data.png'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { selectGrades } from "../../../Redux/Slices/DropdownController";

export default function MessagesApprovalPage() {
    const [formattedDate, setFormattedDate] = useState('');
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [statusData, setStatusData] = useState([]);
    const [scheduleData, setScheduleData] = useState([]);
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
    const [checked, setChecked] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [expandedMessageId, setExpandedMessageId] = useState(null);
    const [comments, setComments] = useState({});
    const [value, setValue] = useState(0);
    const tabValues = ["all", "pending", "declined"];
    const [selectedValue, setSelectedValue] = useState("all");
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [messageDetails, setMessageDetails] = useState(null);
    const [openDeliveredAlert, setOpenDeliveredAlert] = useState(false);

    const toggleReadMore = (id) => {
        setExpandedMessageId((prevId) => (prevId === id ? null : id));
    };

    const filteredStatusData = statusData.filter((item) =>
        item.headLine.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredScheduleData = scheduleData.filter((item) =>
        item.headLine.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };
    const handleViewReason = (id) => {
        setOpenAlert(id)
    };
    const handleDeliver = (messageItem) => {
        setMessageDetails(messageItem)
        setOpenDeliveredAlert(true);

    };

    const handleDeliveredCloseDialog = () => {
        setOpenDeliveredAlert(false);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setOpenDelete(id);
    };

    const handleCloseDialog = (deleted) => {

        setOpenDelete(false);

        if (deleted) {
            DeleteNews(deleteId)
            setOpenDelete(false);
        }
    };

    const handleEdits = (id) => {
        navigate("edit", { state: { id } });
    };

    const handleEdit = (id) => {
        setEditId(id)
        setOpenEditAlert(id);

    };

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
    }, [checked, formattedDate, selectedValue])

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(ApprovalStatusMessageFetch, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate || '',
                    Screen: "approver"
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStatusData(res.data.post)
            setScheduleData(res.data.schedule)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.put(
                `${updateMessageApprovalAction}?Id=${id}&RollNumber=${rollNumber}&UserType=${userType}&Action=accept&Reason=`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchNews()
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Accepted Successfully");
        } catch (error) {
            console.error("Error updating attendance:", error);

            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage(
                error.response?.data?.message ||
                "Failed to update. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecline = async (id) => {
        if (!comments?.[id]) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("No comments provided. Action could not be processed.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.put(
                `${updateMessageApprovalAction}?Id=${id}&RollNumber=${rollNumber}&UserType=${userType}&Action=decline&Reason=${comments[id]}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchNews()
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Declined Successfully");
        } catch (error) {
            console.error("Error updating attendance:", error);

            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage(
                error.response?.data?.message ||
                "Failed to update. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };


    const DeleteNews = async (id) => {
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
            fetchNews();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Message Deleted Successfully");
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete. Please try again.");
            console.error('Error deleting:', error);
        } finally {
            setIsLoading(false);
        }
    };
    if (userType !== "superadmin" && userType !== "admin") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }
    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
                        <Link style={{ textDecoration: "none" }} to="/dashboardmenu/approvals">
                            <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                        </Link>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Messages Approval</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Box ref={boxRef} sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                <Box sx={{ p: 2 }}>
                    {filteredScheduleData.length > 0 &&
                        <Box sx={{ backgroundColor: "#8338EC", width: "200px", borderRadius: "50px", display: "flex", justifyContent: "center", alignItems: "center", }}>
                            <Typography
                                sx={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    py: 0.5,

                                }}
                            >
                                Scheduled Messages
                            </Typography>
                        </Box>
                    }
                    {filteredScheduleData.length > 0 &&
                        filteredScheduleData
                            .filter((statusItem) => rollNumber !== statusItem.createdByRollNumber)
                            .map((statusItem) => {
                                const isReadMore = expandedMessageId === statusItem.id;
                                return (
                                    <>
                                        <Box sx={{ display: "flex", justifyContent: "end" }}>
                                            <Box sx={{ backgroundColor: "#FFF9EC", py: 0.5, width: "200px", textAlign: "center", borderRadius: "5px 5px 0px 0px", mr: 2 }}>
                                                Requested For : <b>{statusItem.requestFor}</b>
                                            </Box>
                                        </Box>
                                        <Box
                                            key={statusItem.id}
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
                                                    size={{ xs: 12, sm: 12, lg: 9.8 }}
                                                >
                                                    <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                                        {statusItem.headLine === null ? "" : statusItem.headLine}
                                                    </Typography>
                                                    <Grid container>
                                                        <Grid size={{ lg: 8 }}>
                                                            <Box sx={{ display: "flex" }}>
                                                                <Typography sx={{ fontSize: '12px', color: '#777' }}>
                                                                    Delivered to: {
                                                                        statusItem.everyone === "Y"
                                                                            ? "Everyone"
                                                                            : [
                                                                                statusItem.students === "Y" ? "Students" : null,
                                                                                statusItem.staffs === "Y" ? "Staffs" : null,
                                                                                statusItem.specific === "Y" ? "Specific" : null
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
                                                                    onClick={() => handleDeliver(statusItem)}
                                                                >
                                                                    &nbsp;View
                                                                </Button>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>


                                                </Grid>
                                                <Grid
                                                    size={{ xs: 12, sm: 12, lg: 2.2 }}
                                                    sx={{ textAlign: "left" }}
                                                >
                                                    <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                        Created on : {statusItem.onDate}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                        Created by : {statusItem.createdByUserType.charAt(0).toUpperCase() + statusItem.createdByUserType.slice(1).toLowerCase()} - {statusItem.createdByName}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                        Time: {statusItem.onTime}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            <hr style={{ border: "0.5px solid #CFCFCF" }} />
                                            <Grid container spacing={2}>
                                                {statusItem.fileType === "image" &&
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
                                                                src={statusItem.filePath}
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
                                                                    onClick={() => handleViewClick(statusItem.filePath)}
                                                                >
                                                                    View Image
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                }
                                                {statusItem.fileType === "link" &&
                                                    <Grid
                                                        size={{ xs: 12, sm: 12, md: 5, lg: 3.3 }}
                                                        sx={{ display: "flex", justifyContent: "center", py: 1 }}
                                                    >
                                                        {isYouTubeLink(statusItem.filePath) ? (
                                                            <Box style={{ display: "flex", justifyContent: "center" }}>
                                                                <ReactPlayer
                                                                    url={statusItem.filePath}
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
                                                {statusItem.fileType === "empty" &&
                                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>

                                                        <Box
                                                            sx={{
                                                                fontSize: "14px",
                                                                pt: 1,
                                                                minHeight: "120px",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: isReadMore ? "unset" : 9,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: isReadMore ? "visible" : "hidden",
                                                                textOverflow: "ellipsis",
                                                                mb: 4
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: statusItem.message }}
                                                        />
                                                        {statusItem.message.length > 900 && (
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
                                                                onClick={() => toggleReadMore(statusItem.id)}
                                                            >
                                                                {isReadMore ? "Read Less" : "Read More"}
                                                            </Button>
                                                        )}
                                                    </Grid>
                                                }
                                                {statusItem.fileType !== "empty" && (
                                                    <Grid size={{ xs: 12, sm: 12, md: 7, lg: 8.7 }} >
                                                        <Box
                                                            sx={{
                                                                fontSize: "14px",
                                                                pt: 1,
                                                                minHeight: "120px",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: isReadMore ? "unset" : 9,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: isReadMore ? "visible" : "hidden",
                                                                textOverflow: "ellipsis",
                                                                pb: isReadMore ? 3 : 0,
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: statusItem.message }}
                                                        />
                                                        {statusItem.message.length > 800 && (
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
                                                                onClick={() => toggleReadMore(statusItem.id)}
                                                            >
                                                                {isReadMore ? "Read Less" : "Read More"}
                                                            </Button>
                                                        )}
                                                    </Grid>
                                                )}
                                            </Grid>
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    bottom: "12px",
                                                    right: "12px",
                                                    display: "flex",
                                                    gap: 1,
                                                }}
                                            >
                                                {statusItem.requestFor === "delete" &&
                                                    <IconButton
                                                        sx={{
                                                            border: "1px solid black",
                                                            width: "25px",
                                                            height: "25px",
                                                            backgroundColor: "#fff",
                                                        }}
                                                        onClick={() => handleDelete(statusItem.id)}
                                                    >
                                                        <DeleteOutlineOutlinedIcon
                                                            style={{ fontSize: "15px", color: "#000" }}
                                                        />
                                                    </IconButton>
                                                }
                                                {statusItem.requestFor !== "delete" &&
                                                    <>
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
                                                            onClick={() => handleEdits(statusItem.id)}
                                                        >
                                                            <EditOutlinedIcon style={{ fontSize: "15px" }} />
                                                            &nbsp;Edit
                                                        </Button>
                                                        <Button
                                                            sx={{
                                                                textTransform: 'none',
                                                                padding: '2px 0',
                                                                fontSize: '10px',
                                                                color: '#FF0000',
                                                                fontWeight: "600",
                                                                backgroundColor: "#fff",
                                                                textDecoration: "underline !important"
                                                            }}
                                                            onClick={() => handleEdit(statusItem.id)}
                                                        >
                                                            Decline
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            sx={{
                                                                textTransform: 'none',
                                                                borderRadius: "50px",
                                                                padding: '2px 0',
                                                                fontSize: '10px',
                                                                border: "1px solid #00963C",
                                                                color: '#00963C',
                                                                fontWeight: "600",
                                                                backgroundColor: "#fff",
                                                            }}
                                                            onClick={() => handleSubmit(statusItem.id)}
                                                        >
                                                            Accept
                                                        </Button>
                                                    </>
                                                }
                                            </Box>
                                            <Dialog open={openEditAlert === statusItem.id} onClose={() => setOpenEditAlert(false)}
                                                maxWidth="sm"
                                                fullWidth>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        minHeight: '200px',
                                                        padding: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            backgroundColor: '#fff',
                                                            pr: 3,
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontSize: "14px",
                                                                fontWeight: 'bold',
                                                                marginBottom: 1,
                                                                pb: 1,
                                                                borderBottom: "1px solid #AFAFAF",
                                                            }}
                                                        >
                                                            Add Reason
                                                        </Typography>
                                                        <TextareaAutosize
                                                            minRows={6}
                                                            placeholder="Write your reason here..."
                                                            value={comments[statusItem.id] || ""}
                                                            onChange={(e) =>
                                                                setComments((prev) => ({
                                                                    ...prev,
                                                                    [statusItem.id]: e.target.value,
                                                                }))
                                                            }
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #ccc',
                                                                fontSize: '14px',
                                                                marginBottom: '20px',
                                                                resize: 'none',
                                                                border: "none",
                                                                outline: 'none',
                                                            }}
                                                        />
                                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                            <Button
                                                                disabled={!comments}
                                                                onClick={() => handleDecline(statusItem.id)}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    backgroundColor: websiteSettings.mainColor,
                                                                    color: websiteSettings.textColor,
                                                                    borderRadius: '30px',
                                                                    fontSize: '16px',
                                                                    padding: '0px 35px',
                                                                    '&:hover': {
                                                                        backgroundColor: websiteSettings.mainColor || '#0056b3',
                                                                    },
                                                                }}
                                                            >
                                                                Confirm
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Dialog>
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "end", }}>
                                            <Box
                                                sx={{
                                                    // width: "200px",
                                                    backgroundColor: '#F1EAFC',
                                                    marginTop: "-15px",
                                                    mb: 2,
                                                    p: 0.3,
                                                    marginRight: "15px",
                                                    borderRadius: "0px 0px 5px 5px",
                                                    visibility: statusItem.status === "schedule" ? "visible" : "hidden",
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: "600",
                                                        fontSize: "12px",
                                                        color: "#8338EC",
                                                        px: 1,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <span style={{
                                                        height: '8px',
                                                        width: '8px',
                                                        backgroundColor: '#8338EC',
                                                        borderRadius: ' 50%',
                                                        display: 'inline-block'
                                                    }} ></span>  Scheduled For {statusItem.onDate} - {statusItem.onDay} at {statusItem.onTime}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </>
                                );
                            })
                    }
                    {filteredStatusData.length > 0 &&
                        <Box sx={{ backgroundColor: "#ED9146", width: "200px", borderRadius: "0px 8px 8px 0px ", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography
                                sx={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    py: 0.5,

                                }}
                            >
                                Messages
                            </Typography>
                        </Box>
                    }
                    {filteredStatusData.length > 0 ? (
                        filteredStatusData
                            .filter((statusItem) => rollNumber !== statusItem.createdByRollNumber)
                            .map((statusItem) => {
                                const isReadMore = expandedMessageId === statusItem.id;
                                return (
                                    <>
                                        <Box sx={{ display: "flex", justifyContent: "end" }}>
                                            <Box sx={{ backgroundColor: "#FFF9EC", py: 0.5, width: "200px", textAlign: "center", borderRadius: "5px 5px 0px 0px", mr: 2 }}>
                                                Requested For : <b>{statusItem.requestFor}</b>
                                            </Box>
                                        </Box>
                                        <Box
                                            key={statusItem.id}
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
                                                    size={{ xs: 12, sm: 12, lg: 9.8 }}

                                                >
                                                    <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                                        {statusItem.headLine === null ? "" : statusItem.headLine}
                                                    </Typography>
                                                    <Grid container>
                                                        <Grid size={{ lg: 8 }}>
                                                        <Box sx={{ display: "flex" }}>
                                                                <Typography sx={{ fontSize: '12px', color: '#777' }}>
                                                                    Delivered to: {
                                                                        statusItem.everyone === "Y"
                                                                            ? "Everyone"
                                                                            : [
                                                                                statusItem.students === "Y" ? "Students" : null,
                                                                                statusItem.staffs === "Y" ? "Staffs" : null,
                                                                                statusItem.specific === "Y" ? "Specific" : null
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
                                                                    onClick={() => handleDeliver(statusItem)}
                                                                >
                                                                    &nbsp;View
                                                                </Button>
                                                            </Box>

                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid
                                                    size={{ xs: 12, sm: 12, lg: 2.2 }}
                                                    sx={{ textAlign: "left" }}
                                                >
                                                    <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                        Created on : {statusItem.onDate}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                        Created by : {statusItem.createdByUserType.charAt(0).toUpperCase() + statusItem.createdByUserType.slice(1).toLowerCase()} - {statusItem.createdByName}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                        Time: {statusItem.onTime}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            <hr style={{ border: "0.5px solid #CFCFCF" }} />
                                            <Grid container spacing={2}>
                                                {statusItem.fileType === "image" &&
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
                                                                src={statusItem.filePath}
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
                                                                    onClick={() => handleViewClick(statusItem.filePath)}
                                                                >
                                                                    View Image
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                }
                                                {statusItem.fileType === "link" &&
                                                    <Grid
                                                        size={{ xs: 12, sm: 12, md: 5, lg: 3.3 }}
                                                        sx={{ display: "flex", justifyContent: "center", py: 1 }}
                                                    >
                                                        {isYouTubeLink(statusItem.filePath) ? (
                                                            <Box style={{ display: "flex", justifyContent: "center" }}>
                                                                <ReactPlayer
                                                                    url={statusItem.filePath}
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
                                                {statusItem.fileType === "empty" &&
                                                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>

                                                        <Box
                                                            sx={{
                                                                fontSize: "14px",
                                                                pt: 1,
                                                                minHeight: "120px",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: isReadMore ? "unset" : 9,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: isReadMore ? "visible" : "hidden",
                                                                textOverflow: "ellipsis",
                                                                mb: 4
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: statusItem.message }}
                                                        />
                                                        {statusItem.message.length > 900 && (
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
                                                                onClick={() => toggleReadMore(statusItem.id)}
                                                            >
                                                                {isReadMore ? "Read Less" : "Read More"}
                                                            </Button>
                                                        )}
                                                    </Grid>
                                                }
                                                {statusItem.fileType !== "empty" && (
                                                    <Grid size={{ xs: 12, sm: 12, md: 7, lg: 8.7 }} >
                                                        <Box
                                                            sx={{
                                                                fontSize: "14px",
                                                                pt: 1,
                                                                minHeight: "120px",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: isReadMore ? "unset" : 9,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: isReadMore ? "visible" : "hidden",
                                                                textOverflow: "ellipsis",
                                                                pb: isReadMore ? 3 : 0,
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: statusItem.message }}
                                                        />
                                                        {statusItem.message.length > 800 && (
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
                                                                onClick={() => toggleReadMore(statusItem.id)}
                                                            >
                                                                {isReadMore ? "Read Less" : "Read More"}
                                                            </Button>
                                                        )}
                                                    </Grid>
                                                )}
                                            </Grid>
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    bottom: "12px",
                                                    right: "12px",
                                                    display: "flex",
                                                    gap: 1,
                                                }}
                                            >
                                                {statusItem.requestFor === "delete" &&
                                                    <IconButton
                                                        sx={{
                                                            border: "1px solid black",
                                                            width: "25px",
                                                            height: "25px",
                                                            backgroundColor: "#fff",
                                                        }}
                                                        onClick={() => handleDelete(statusItem.id)}
                                                    >
                                                        <DeleteOutlineOutlinedIcon
                                                            style={{ fontSize: "15px", color: "#000" }}
                                                        />
                                                    </IconButton>
                                                }
                                                {statusItem.requestFor !== "delete" &&
                                                    <>
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
                                                            onClick={() => handleEdits(statusItem.id)}
                                                        >
                                                            <EditOutlinedIcon style={{ fontSize: "15px" }} />
                                                            &nbsp;Edit
                                                        </Button>
                                                        <Button
                                                            sx={{
                                                                textTransform: 'none',
                                                                padding: '2px 0',
                                                                fontSize: '10px',
                                                                color: '#FF0000',
                                                                fontWeight: "600",
                                                                backgroundColor: "#fff",
                                                                textDecoration: "underline !important"
                                                            }}
                                                            onClick={() => handleEdit(statusItem.id)}
                                                        >
                                                            Decline
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            sx={{
                                                                textTransform: 'none',
                                                                borderRadius: "50px",
                                                                padding: '2px 0',
                                                                fontSize: '10px',
                                                                border: "1px solid #00963C",
                                                                color: '#00963C',
                                                                fontWeight: "600",
                                                                backgroundColor: "#fff",
                                                            }}
                                                            onClick={() => handleSubmit(statusItem.id)}
                                                        >
                                                            Accept
                                                        </Button>
                                                    </>
                                                }
                                            </Box>
                                            <Dialog open={openEditAlert === statusItem.id} onClose={() => setOpenEditAlert(false)}
                                                maxWidth="sm"
                                                fullWidth>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        minHeight: '200px',
                                                        padding: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            backgroundColor: '#fff',
                                                            pr: 3,
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontSize: "14px",
                                                                fontWeight: 'bold',
                                                                marginBottom: 1,
                                                                pb: 1,
                                                                borderBottom: "1px solid #AFAFAF",
                                                            }}
                                                        >
                                                            Add Reason
                                                        </Typography>
                                                        <TextareaAutosize
                                                            minRows={6}
                                                            placeholder="Write your reason here..."
                                                            value={comments[statusItem.id] || ""}
                                                            onChange={(e) =>
                                                                setComments((prev) => ({
                                                                    ...prev,
                                                                    [statusItem.id]: e.target.value,
                                                                }))
                                                            }
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #ccc',
                                                                fontSize: '14px',
                                                                marginBottom: '20px',
                                                                resize: 'none',
                                                                border: "none",
                                                                outline: 'none',
                                                            }}
                                                        />
                                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                            <Button
                                                                disabled={!comments}
                                                                onClick={() => handleDecline(statusItem.id)}
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    backgroundColor: websiteSettings.mainColor,
                                                                    color: websiteSettings.textColor,
                                                                    borderRadius: '30px',
                                                                    fontSize: '16px',
                                                                    padding: '0px 35px',
                                                                    '&:hover': {
                                                                        backgroundColor: websiteSettings.mainColor || '#0056b3',
                                                                    },
                                                                }}
                                                            >
                                                                Confirm
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Dialog>
                                        </Box>
                                    </>

                                );
                            }
                            )) : (
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
                    <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                            <Box sx={{
                                textAlign: 'center',
                                backgroundColor: '#fff',
                                p: 3,
                                width: "70%",
                            }}>

                                <Typography sx={{ fontSize: "20px" }}>
                                    Do you really want to delete
                                    this message? </Typography>

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
                        <Typography sx={{ fontWeight: "600" }}>Delivered Details</Typography>
                        <hr />
                        <Box sx={{ maxHeight: "400px", overflowY: "auto", minHeight: "100px", minWidth: "400px" }}>
                            {messageDetails?.everyone === "Y" ? (
                                <Typography sx={{ fontWeight: "600", fontSize: "14px" }}>For everyone</Typography>
                            ) : (
                                <>
                                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#333", mb: 2 }}>
                                        Selected Students:&nbsp;
                                        <Box component="span" sx={{ fontSize: "11.5px", fontWeight: 500, color: "#555" }}>
                                            {messageDetails?.gradeSegments?.length > 0
                                                ? getGradeNames(messageDetails.gradeSegments)
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
