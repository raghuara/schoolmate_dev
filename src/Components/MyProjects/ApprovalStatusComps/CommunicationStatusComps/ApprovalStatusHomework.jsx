import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputAdornment, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../../../Redux/Slices/websiteSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectAcademicYear } from "../../../../Redux/Slices/academicYearSlice";
import { findSubMenuPermissions, selectUserTypeID } from "../../../../Redux/Slices/AuthSlice";
import { APPROVAL_SUBMENUS, mustRequestApproval, selectApprovalMatrix, selectApprovalMatrixReady } from "../../../../Redux/Slices/approvalMatrixSlice";
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { DASH, RADIUS, PageHeader } from "../../../DashBoardComps/dashboardTheme";
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
    const academicYear = useSelector(selectAcademicYear);
    const rollNumber = user.rollNumber
    // Kept for the API payloads below, which send it as data. It is not a
    // permission check - see canTrackThis.
    const userType = user.userType
    const userTypeID = useSelector(selectUserTypeID);
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const matrixReady = useSelector(selectApprovalMatrixReady);
    const rbacReady = (user?.permissions?.mainMenus || []).length > 0;
    /*
       Same test the Approval Status hub uses to offer this card: you can create
       homework, and your homework actually goes for approval.

       Until both the permission tree and the approval matrix have loaded, "not
       allowed" is indistinguishable from "not loaded yet", so treat that window
       as allowed - redirecting there throws out a user who is entitled to be here.
    */
    const canTrackThis = !rbacReady || !matrixReady
        || (findSubMenuPermissions(user?.permissions, "communication", "homework")?.create === "Y"
            && mustRequestApproval(approvalMatrix, APPROVAL_SUBMENUS.HOMEWORK, userTypeID));
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
                    rollNumber: rollNumber,
                    userType: userType,
                    date: formattedDate || '',
                    status: selectedValue || "all",
                    screen: "maker",
                    academicYear: academicYear || ''
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
                    id: id,
                    rollNumber: rollNumber,
                    userType: userType,
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

    // Back to the hub rather than the dashboard - it is where this page was
    // opened from, and it decides for itself what is left to show.
    if (!canTrackThis) {
        return <Navigate to="/dashboardmenu/status" replace />;
    }

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: { xs: 2, md: 3 },
                bgcolor: DASH.canvas,
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            <PageHeader
                title="Homework Approval Status"
                subtitle="Homework you sent for approval and where each one stands"
                onBack={() => navigate("/dashboardmenu/status")}
            />

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    flexWrap: "wrap",
                    borderBottom: `1px solid ${DASH.line}`,
                    mb: 2,
                }}
            >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 40,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            minHeight: 40,
                            color: DASH.muted,
                            px: 2,
                        },
                        '& .Mui-selected': { color: `${DASH.ink} !important` },
                        '& .MuiTabs-indicator': { backgroundColor: DASH.primary, height: 2.5, borderRadius: '3px 3px 0 0' },
                    }}
                >
                    <Tab label="All" />
                    <Tab label="Pending" />
                    <Tab label="Declined" />
                </Tabs>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        pb: 0.8,
                        flex: { xs: "1 1 100%", sm: "0 0 auto" },
                    }}
                >
                    <TextField
                        placeholder="Search homework by heading"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            width: { xs: "100%", sm: 240 },
                            "& .MuiOutlinedInput-root": {
                                height: 34,
                                borderRadius: RADIUS,
                                bgcolor: "#fff",
                                fontSize: "13px",
                                "& fieldset": { borderColor: DASH.line },
                                "&:hover fieldset": { borderColor: DASH.faint },
                                "&.Mui-focused fieldset": { borderColor: DASH.primary },
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 18, color: DASH.faint }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setSearchQuery("")}
                                            sx={{ width: 22, height: 22 }}
                                        >
                                            <CloseIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            open={openCal}
                            onClose={handleClose}
                            value={selectedDate}
                            onChange={(newValue) => {
                                setSelectedDate(newValue);
                                setFormattedDate(dayjs(newValue).format('DD-MM-YYYY'));
                                handleClose();
                            }}
                            disableFuture
                            views={['year', 'month', 'day']}
                            sx={{ opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                        />

                        <Tooltip title={selectedDate ? formattedDate : "Filter by date"}>
                            <IconButton
                                onClick={handleOpen}
                                sx={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: RADIUS,
                                    border: `1px solid ${selectedDate ? DASH.primary : DASH.line}`,
                                    bgcolor: selectedDate ? DASH.primaryLight : "#fff",
                                    "&:hover": { bgcolor: DASH.lineSoft },
                                }}
                            >
                                <CalendarMonthIcon sx={{ fontSize: 18, color: selectedDate ? DASH.primary : DASH.muted }} />
                            </IconButton>
                        </Tooltip>

                        {selectedDate && (
                            <Tooltip title="Clear date">
                                <IconButton onClick={handleClearDate} sx={{ width: 30, height: 30 }}>
                                    <HighlightOffIcon sx={{ fontSize: 18, color: DASH.red }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </LocalizationProvider>
                </Box>
            </Box>

            <Box ref={boxRef} sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
                <Box sx={{ pb: 2 }}>
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
                                minHeight: "52vh",
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
                            <Typography sx={{ fontSize: "12.5px", color: DASH.faint }}>
                                {searchQuery ? "No homework matches your search." : "Nothing sent for approval yet."}
                            </Typography>
                        </Box>

                    )}
                </Box>

                {showButton && (
                    <Fab
                        onClick={scrollToTop}
                        sx={{
                            position: 'absolute',
                            width: 35,
                            height: 35,
                            minHeight: 35,
                            bottom: 18,
                            right: 18,
                            zIndex: 1000,
                            bgcolor: '#fff',
                            border: `1px solid ${DASH.line}`,
                            boxShadow: '0 4px 16px rgba(17,24,39,0.12)',
                            '&:hover': { bgcolor: DASH.lineSoft },
                        }}
                    >
                        <ArrowUpwardIcon sx={{ fontSize: 18, color: DASH.ink }} />
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
