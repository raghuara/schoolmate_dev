import { Autocomplete, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, Grid, IconButton, InputAdornment, Paper, styled, Switch, Tab, Tabs, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReactPlayer from "react-player";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { ApprovalStatusCircularFetch, ApprovalStatusHomeWorkFetch, ApprovalStatusMessageFetch, ApprovalStatusNewsFetch, DeleteCircular, DeleteHomeWork, DeleteNewsApi, NewsFetch } from "../../../../Api/Api";
import Loader from "../../../Loader";
import SnackBar from "../../../SnackBar";
import NoData from '../../../../Images/Login/No Data.png'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import pdfDemo from '../../../../Images/PDF.png'
import { selectGrades } from "../../../../Redux/Slices/DropdownController";

export default function ApprovalStatusHomeworkPage() {
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [statusData, setStatusData] = useState([]);
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
    const [isMyProject, setIsMyProject] = useState('N');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [expandedMessageId, setExpandedMessageId] = useState(null);
    const [comments, setComments] = useState({});
    const [value, setValue] = useState(0);
    const tabValues = ["all", "pending", "declined"];
    const [selectedValue, setSelectedValue] = useState("all");
    const [openPdf, setOpenPdf] = useState(false);
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);

    const filteredStatusData = statusData.filter((item) =>
        item.headLine.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewClick = (file, url) => {
        if (file === "pdf") {
            setOpenPdf(true);
        } else {
            setOpenImage(true);
        }
        setImageUrl(url);
    };

    const handleImageClose = () => {
        setOpenImage(false);
        setOpenPdf(false);
    };

    const getGradeSign = (gradeId) => {
        const match = grades.find(g => g.id === gradeId);
        return match?.sign || "";
      };      

    const handleViewReason = (id) => {
        setOpenAlert(id)
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


    const handleChange = (event, newValue) => {
        setValue(newValue);
        const selectedValue1 = tabValues[newValue];
        setSelectedValue(selectedValue1)
    };

    const [showButton, setShowButton] = useState(false);
    const boxRef = useRef(null);


    function isYouTubeLink(url) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|(?:watch\?v=|.+\/videoseries\?v=))|youtu\.be\/)[^&?\/\s]+/;
        return youtubeRegex.test(url);
    }

    const handleClearDate = () => {
        setSelectedDate(null);
        setFormattedDate('');
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
        fetchNews()
    }, [checked, formattedDate, selectedValue])

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(ApprovalStatusHomeWorkFetch, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: formattedDate || '',
                    Status: selectedValue || "all",
                    Screen: "maker"
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStatusData(res.data.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const DeleteNews = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteHomeWork, {
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
            setMessage("Homework Deleted Successfully");
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete . Please try again.");
            console.error('Error deleting :', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/dashboard" replace />;
    }

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6.5 }} sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
                        <Link style={{ textDecoration: "none" }} to="/dashboardmenu/status">
                            <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                            </IconButton>
                        </Link>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Homework Approval Status</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 4 }} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search News by Heading"
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

                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 1.5 }} sx={{ display: "flex", justifyContent: "end", alignItems: "center", px: 1 }}>
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
                    </Grid>
                </Grid>
            </Box>
            <Box ref={boxRef} sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "end", mb: 2 }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label="attendance tabs"
                            variant="scrollable"
                            TabIndicatorProps={{
                                sx: { display: 'none' },
                            }}
                            sx={{
                                backgroundColor: '#fff',
                                minHeight: "10px",
                                borderRadius: "50px",
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontSize: '12px',
                                    color: '#555',
                                    fontWeight: 'bold',
                                    minWidth: 0,
                                    paddingX: 1,
                                    minHeight: '30px',
                                    height: '30px',
                                    px: 2,
                                },
                                '& .Mui-selected': {
                                    color: '#fff !important',
                                    bgcolor: '#000',
                                    borderRadius: "50px",
                                },
                            }}
                        >
                            <Tab label="All" />
                            <Tab label="Pending" />
                            <Tab label="Declined" />
                        </Tabs>
                    </Box>
                    {filteredStatusData.length > 0 ? (
                        <Grid container spacing={2}>
                            {filteredStatusData.map((statusItem) => {
                                const isReadMore = expandedMessageId === statusItem.id;
                                return (
                                    <Grid key={statusItem.id} size={{ xs: 12, sm: 12, lg: 4 }}>
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
                                                        size={{ xs: 12, sm: 12, lg: 12 }}
                                                    >
                                                         <Typography sx={{ fontSize: "11px" }}>
                                                                {getGradeSign(statusItem.gradeId)} - {statusItem.section?.join(", ")}
                                                            </Typography>
                                                        <Typography sx={{ fontWeight: "600", fontSize: "16px",}}>
                                                            {statusItem.headLine === null ? "" : statusItem.headLine}
                                                        </Typography>
                                                    </Grid>

                                                </Grid>
                                                <hr style={{ border: "0.5px solid #CFCFCF" }} />
                                                <Grid container spacing={2}>
                                                    {statusItem.fileType === "image" &&
                                                        <Grid
                                                            size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
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
                                                                    width: "100%",
                                                                    height: "271px",
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
                                                                        onClick={() => handleViewClick("image", statusItem.filePath)}
                                                                    >
                                                                        View Image
                                                                    </Button>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    }
                                                    {statusItem.fileType === "pdf" &&
                                                        <Grid
                                                            size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
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
                                                                    src={pdfDemo}
                                                                    width={"100%"}
                                                                    height={"100%"}
                                                                    alt="homework"
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
                                                                        onClick={() => handleViewClick("pdf", statusItem.filePath)}
                                                                    >
                                                                        View PDF
                                                                    </Button>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    }

                                                </Grid>
                                                <Box
                                                    sx={{
                                                        // position: "absolute",
                                                        display: "flex",
                                                        justifyContent:"end",
                                                        pt:0.5
                                                    }}
                                                >
                                                    {
                                                        statusItem.homeWorkStatus === "pending" &&
                                                        <Box sx={{ backgroundColor: "#fbe6cc", color: "#EB8200", width: "90px", height: "25px", display: "flex", justifyContent: "center", alignItems: "center", border: "1px dashed #EB8200", borderRadius: "5px" }}>
                                                            <Box>
                                                                | Pending
                                                            </Box>
                                                        </Box>
                                                    }
                                                    {
                                                        statusItem.homeWorkStatus === "declined" &&
                                                        <>
                                                            <Button onClick={() => handleViewReason(statusItem.id)} sx={{ textTransform: "none", py: 0, textDecoration: "underline !important", color: "#000" }}>View Reason</Button>

                                                            <Dialog
                                                                open={openAlert === statusItem.id}
                                                                onClose={() => setOpenAlert(null)}
                                                                maxWidth="sm"
                                                                fullWidth
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        justifyContent: "center",
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
                                                                            Reason
                                                                        </Typography>
                                                                        <Typography
                                                                            sx={{
                                                                                fontSize: "14px",
                                                                                fontWeight: 'bold',
                                                                                marginBottom: 1,
                                                                                pb: 1,
                                                                                color: statusItem.reason ? "black" : "gray",
                                                                            }}
                                                                        >
                                                                            {statusItem.reason || ""}
                                                                        </Typography>

                                                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                            <Button
                                                                                variant="outlined"
                                                                                onClick={() => setOpenAlert(null)}
                                                                                sx={{
                                                                                    textTransform: 'none',
                                                                                    border: "1px solid black",
                                                                                    color: "black",
                                                                                    borderRadius: '30px',
                                                                                    fontSize: '16px',
                                                                                    padding: '0px 35px',
                                                                                    bottom: "10px",
                                                                                    position: "absolute"
                                                                                }}
                                                                            >
                                                                                Close
                                                                            </Button>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            </Dialog>

                                                            <Box sx={{ backgroundColor: "#fff", color: "#FF0000", width: "100px", height: "23px", display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid #FF0000", borderRadius: "50px", mr:1 }}>
                                                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                                                                    <HighlightOffIcon style={{ fontSize: "20px", }} />
                                                                    <Typography sx={{ ml: 0.5 }}>
                                                                        Declined
                                                                    </Typography>

                                                                </Box>
                                                            </Box>
                                                        </>
                                                    }
                                                    {statusItem.homeWorkStatus !== "pending" &&
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

                                                    <Dialog open={openDelete === statusItem.id} onClose={() => setOpenDelete(false)}>
                                                        <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                                                            <Box sx={{
                                                                textAlign: 'center',
                                                                backgroundColor: '#fff',
                                                                p: 3,
                                                                width: "70%",
                                                            }}>

                                                                <Typography sx={{ fontSize: "20px" }}> Do you really want to delete
                                                                    this circular?</Typography>
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
                                            </Box >
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
                                                        }} ></span>  Scheduled For {statusItem.scheduleOn}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </>
                                    </Grid>
                                );
                            })}
                        </Grid>
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
            <Dialog
                open={openPdf}
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
                <iframe
                    src={imageUrl}
                    title="PDF Preview"
                    style={{
                        width: '80vw',
                        height: '80vh',
                        border: 'none',
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
