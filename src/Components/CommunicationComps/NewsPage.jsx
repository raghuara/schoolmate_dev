import { Autocomplete, Box, Button, Checkbox, Chip, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, Grid, IconButton, InputAdornment, Menu, MenuItem, Paper, styled, Switch, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../Redux/Slices/academicYearSlice";
import { useSelector } from "react-redux";
import { findSubMenuPermissions, selectUserTypeID } from "../../Redux/Slices/AuthSlice";
import { APPROVAL_SUBMENUS, approvalRoleFor, isApproverFor, mustRequestApproval, selectApprovalMatrix, selectApprovalMatrixReady } from "../../Redux/Slices/approvalMatrixSlice";
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
import { BulkDeleteNews, DeleteNewsApi, NewsFetch } from "../../Api/Api";
import Loader from "../Loader";
import { ListSkeleton } from "../InnerLoader";
import SnackBar from "../SnackBar";
import NoData from '../../Images/Login/No Data.png'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined';

export default function NewsPage() {
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);
    const [openAlert, setOpenAlert] = useState(false);
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [newsData, setNewsData] = useState([]);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const newsPerms = findSubMenuPermissions(user.permissions, "communication", "news") || {};
    const canCreate = newsPerms.create === "Y";
    const canEdit = newsPerms.edit === "Y";
    const canDelete = newsPerms.delete === "Y";
    // Level 1 of the News approval flow acts straight away; every other level
    // and anyone outside the flow raises a request instead.
    const userTypeID = useSelector(selectUserTypeID);
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const canActDirect = approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.NEWS, userTypeID).canPublishDirect;
    const canBulkDelete = canDelete && canActDirect;

    /*
       Shortcuts out of News, each shown only when it would lead somewhere useful.

       "Review Approvals" is for the people who act on the queue - anyone the
       matrix places at a level for News. "Approval Status" is the other side of
       the same flow: users who can create news but have to raise a request, and
       therefore have something waiting to be tracked. Neither is an access gate,
       so both wait for the matrix rather than guessing while it loads.
    */
    const matrixReady = useSelector(selectApprovalMatrixReady);
    const canReviewApprovals = matrixReady
        && isApproverFor(approvalMatrix, APPROVAL_SUBMENUS.NEWS, userTypeID);
    const canTrackApprovals = matrixReady && canCreate
        && mustRequestApproval(approvalMatrix, APPROVAL_SUBMENUS.NEWS, userTypeID);
    const showApprovalLinks = canReviewApprovals || canTrackApprovals;

    /*
       Bulk delete is off until it is asked for. Leaving a checkbox beside every
       card made deleting look like the primary thing you do on this page, and
       put a destructive control one stray click away while reading. It now lives
       behind the overflow menu, and turning it off clears whatever was ticked so
       a stale selection can never be acted on later.
    */
    const [bulkMode, setBulkMode] = useState(false);
    const [moreAnchor, setMoreAnchor] = useState(null);
    const exitBulkMode = () => { setBulkMode(false); setSelectedMessageIds([]); };
    const [isLoading, setIsLoading] = useState(false);
    // The empty state must not paint before the first fetch has actually
    // finished, otherwise "no data" flashes on every visit.
    const [hasLoaded, setHasLoaded] = useState(false);
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
    const [selectedMessageIds, setSelectedMessageIds] = useState([]);
    const [openBulkDeleteAlert, setOpenBulkDeleteAlert] = useState(false);

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

    // Cards are filtered again inside the map, so count the same way the list renders.
    const visibleNewsCount = filteredNews.reduce(
        (total, dateGroup) => total + dateGroup.news.filter((newsItem) =>
            newsItem.headLine.toLowerCase().includes(searchQuery.toLowerCase())
        ).length,
        0,
    );

    const metaChipSx = {
        height: "20px",
        fontSize: "10.5px",
        fontWeight: 600,
        borderRadius: "6px",
        "& .MuiChip-icon": { fontSize: 13, ml: "6px", color: "inherit" },
        "& .MuiChip-label": { px: "7px" },
    };

    const dialogGhostSx = {
        textTransform: "none",
        borderRadius: "10px",
        fontSize: "12.5px",
        fontWeight: 600,
        px: 2.4,
        py: 0.6,
        color: "#374151",
        borderColor: "#D6DAE1",
        backgroundColor: "#fff",
        "&:hover": { borderColor: "#9AA3AF", backgroundColor: "#F7F8FA" },
    };

    const dialogPrimarySx = {
        textTransform: "none",
        borderRadius: "10px",
        fontSize: "12.5px",
        fontWeight: 700,
        px: 2.4,
        py: 0.7,
        boxShadow: "none",
        whiteSpace: "nowrap",
        backgroundColor: websiteSettings.mainColor,
        color: websiteSettings.textColor,
        "&:hover": { backgroundColor: websiteSettings.mainColor, opacity: 0.9, boxShadow: "none" },
    };

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
    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
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

    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleImageClose = () => {
        setOpenImage(false);
    };

    const handleClearDate = () => {
        setSelectedDate(null);
        setFormattedDate('');
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

    const handleCloseBulkDeleteDialog = (deleted) => {

        setOpenBulkDeleteAlert(false);

        if (deleted) {
            BulkDelete(selectedMessageIds)
            setOpenBulkDeleteAlert(false);
        }
    };

    useEffect(() => {
        // The API rejects the call without an academic year, so wait until the
        // header's selected year is in the store before asking for the list.
        if (!academicYear) return;
        fetchNews()
    }, [checked, formattedDate, academicYear])


    const fetchNews = async () => {
        if (!academicYear) return;
        try {
            const res = await axios.get(NewsFetch, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    date: formattedDate || '',
                    isMyProject: isMyProject,
                    academicYear: academicYear || '',
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
            setHasLoaded(true);
        }
    };


    const DeleteNews = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteNewsApi, {
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

            if (canActDirect) {
                setMessage("News Deleted Successfully");
            } else {
                setMessage("Requested Successfully");
            }
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete. Please try again.");
            console.error('Error deleting news:', error);
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
            const res = await axios.delete(BulkDeleteNews, {
                data: { ids: ids },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchNews();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("News Deleted Successfully");
            setSelectedMessageIds([]);
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            console.error('Error deleting News:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd"}}>
                <Grid container sx={{ }} alignItems="center">
                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >News</Typography>
                        <Chip
                            size="small"
                            label={visibleNewsCount}
                            sx={{
                                height: "20px",
                                fontSize: "11px",
                                fontWeight: 700,
                                borderRadius: "6px",
                                backgroundColor: "#fff",
                                border: "1px solid #DDE1E6",
                                color: "#4B5563",
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 2 }} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {canCreate &&
                            <>
                                <Typography sx={{ fontWeight: "600", fontSize: "12px" }} >My Projects</Typography>
                                <Switch
                                    checked={checked}
                                    onChange={handleCheck}
                                    inputProps={{ "aria-label": "controlled" }}
                                    sx={{
                                        // Same switch, just stops its 12px padding from setting the toolbar height.
                                        my: "-6px",
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
                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 4 }} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search news by headline"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 17, color: "#8A93A0" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchQuery ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.2 }}>
                                                <HighlightOffIcon sx={{ fontSize: 15, color: "#8A93A0" }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                    sx: {
                                        padding: "0 10px",
                                        borderRadius: "50px",
                                        height: "28px",
                                        fontSize: "12px",
                                    },
                                },
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    minHeight: "28px",
                                    paddingRight: "3px",
                                    backgroundColor: "#fff",
                                },
                                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#DDE1E6",
                                },
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: websiteSettings.mainColor,
                                },
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }} sx={{ display: "flex", justifyContent: "end", alignItems: "center", gap: 1, px: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
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

                                </LocalizationProvider>
                            </ThemeProvider>

                            {selectedDate ? (
                                <Chip
                                    size="small"
                                    icon={<CalendarMonthIcon sx={{ fontSize: 15 }} />}
                                    label={formattedDate}
                                    onClick={handleOpen}
                                    onDelete={handleClearDate}
                                    deleteIcon={<HighlightOffIcon sx={{ fontSize: 15 }} />}
                                    sx={{
                                        height: "28px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        borderRadius: "50px",
                                        backgroundColor: "#fff",
                                        border: "1px solid #DDE1E6",
                                        color: "#374151",
                                        "& .MuiChip-icon, & .MuiChip-deleteIcon": { color: "#6B7280" },
                                        "& .MuiChip-deleteIcon:hover": { color: "#f44336" },
                                    }}
                                />
                            ) : (
                                <Tooltip title="Filter by date">
                                    <IconButton
                                        onClick={handleOpen}
                                        sx={{
                                            width: '28px',
                                            height: '28px',
                                            border: "1px solid #DDE1E6",
                                            backgroundColor: "#fff",
                                            transition: '0.2s',
                                            '&:hover': { backgroundColor: '#EFEFEF' },
                                        }}>
                                        <CalendarMonthIcon sx={{ fontSize: 17, color: "#374151" }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                        {canCreate &&
                            <Button
                                onClick={handleCreateNews}
                                variant="contained"
                                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                    textTransform: "none",
                                    bgcolor: "#000",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 12.5,
                                    borderRadius: "50px",
                                    px: 2,
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                                    "&:hover": {
                                        bgcolor: "#1a1a1a",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
                                    },
                                }}
                            >
                                News
                            </Button>
                        }
                    </Grid>
                </Grid>
            </Box>

            <Box ref={boxRef} sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                <Dialog
                    open={openAlert}
                    onClose={() => setOpenAlert(false)}
                    slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
                >
                    <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                            {canActDirect ? "Delete this news?" : "Send a delete request?"}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                            {canActDirect
                                ? "This will remove the news for everyone. It cannot be undone."
                                : "An approver has to accept this before the news is removed."}
                        </Typography>
                        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={() => handleCloseDialog(false)}
                                sx={dialogGhostSx}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleCloseDialog(true)}
                                sx={dialogPrimarySx}
                            >
                                {canActDirect ? "Delete" : "Send Request"}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
                <Dialog
                    open={openBulkDeleteAlert}
                    onClose={() => setOpenBulkDeleteAlert(false)}
                    slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
                >
                    <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                            Delete {selectedMessageIds.length} selected news?
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                            This will remove them for everyone. It cannot be undone.
                        </Typography>
                        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={() => handleCloseBulkDeleteDialog(false)}
                                sx={dialogGhostSx}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleCloseBulkDeleteDialog(true)}
                                sx={dialogPrimarySx}
                            >
                                Delete
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
                <Dialog
                    open={openEditAlert}
                    onClose={() => setOpenEditAlert(false)}
                    slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
                >
                    <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                            Edit this news?
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                            {canActDirect
                                ? "Your changes will go live as soon as you save them."
                                : "Your changes will be sent for approval before they go live."}
                        </Typography>
                        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={() => handleEditCloseDialog(false)}
                                sx={dialogGhostSx}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleEditCloseDialog(true)}
                                sx={dialogPrimarySx}
                            >
                                Edit
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
                {(canBulkDelete || showApprovalLinks) && (() => {
                    const allIds = filteredNews.flatMap((group) => group.news.map((n) => n.id));
                    const selectedCount = selectedMessageIds.length;
                    const allSelected = allIds.length > 0 && selectedCount === allIds.length;
                    // Partial selection has to be derived, not stored - ticking cards
                    // one by one used to leave the header checkbox reading "unchecked"
                    // even when every card was selected.
                    const someSelected = selectedCount > 0 && !allSelected;
                    const toggleAll = () => {
                        const next = !allSelected;
                        setSelectedMessageIds(next ? allIds : []);
                    };
                    const clearSelection = () => setSelectedMessageIds([]);

                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pt: 1.2, flexWrap: 'wrap' }}>
                            {canBulkDelete && bulkMode && (
                                <Box
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1,
                                        pl: 0.6, pr: selectedCount > 0 ? 0.6 : 1.4,
                                        height: 34, borderRadius: '5px',
                                        // The strip only turns red once something is actually
                                        // selected, so a destructive colour is never on screen
                                        // while there is nothing to destroy.
                                        border: `1px solid ${selectedCount > 0 ? '#F5C2C2' : '#E6E8EC'}`,
                                        bgcolor: selectedCount > 0 ? '#FEF5F5' : '#fff',
                                        transition: 'background-color 0.2s ease, border-color 0.2s ease',
                                    }}
                                >
                                    <Checkbox
                                        size="small"
                                        checked={allSelected}
                                        indeterminate={someSelected}
                                        onChange={toggleAll}
                                        sx={{ p: 0.5 }}
                                    />
                                    <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: selectedCount > 0 ? '#B91C1C' : '#374151', whiteSpace: 'nowrap' }}>
                                        {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
                                    </Typography>

                                    {selectedCount > 0 && (
                                        <>
                                            <Box sx={{ width: '1px', height: 18, bgcolor: '#F0CFCF' }} />
                                            <Button
                                                onClick={clearSelection}
                                                sx={{
                                                    textTransform: 'none', fontSize: '12px', fontWeight: 600,
                                                    minWidth: 0, height: 26, px: 1, borderRadius: '5px',
                                                    color: '#6B7280',
                                                    '&:hover': { bgcolor: '#F3F4F6' },
                                                }}
                                            >
                                                Clear
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                disableElevation
                                                startIcon={<DeleteSweepOutlinedIcon sx={{ fontSize: 16 }} />}
                                                onClick={handleDeleteSelected}
                                                sx={{
                                                    textTransform: 'none', fontSize: '12px', fontWeight: 700,
                                                    height: 26, px: 1.2, borderRadius: '5px',
                                                    boxShadow: 'none', '&:hover': { boxShadow: 'none' },
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            )}

                            {/* Cancel sits outside the red strip so it is reachable
                                even before anything has been selected. */}
                            {canBulkDelete && bulkMode && (
                                <Button
                                    onClick={exitBulkMode}
                                    sx={{
                                        textTransform: 'none', fontSize: '12.5px', fontWeight: 600,
                                        height: 34, px: 1.4, borderRadius: '5px',
                                        color: '#6B7280', border: '1px solid #E6E8EC', bgcolor: '#fff',
                                        '&:hover': { bgcolor: '#F9FAFB' },
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}

                            <Box sx={{ flex: 1 }} />

                            {canBulkDelete && !bulkMode && (
                                <>
                                    <Tooltip title="More actions" arrow>
                                        <IconButton
                                            onClick={(e) => setMoreAnchor(e.currentTarget)}
                                            sx={{
                                                width: 34, height: 34, borderRadius: '5px',
                                                border: '1px solid #E6E8EC', bgcolor: '#fff',
                                                color: '#4B5563',
                                                '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D6DAE1' },
                                            }}
                                        >
                                            <MoreVertIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={moreAnchor}
                                        open={Boolean(moreAnchor)}
                                        onClose={() => setMoreAnchor(null)}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        slotProps={{ paper: { sx: { mt: 0.6, borderRadius: '5px', minWidth: 210, border: '1px solid #E6E8EC', boxShadow: '0 6px 20px rgba(16,24,40,0.10)' } } }}
                                    >
                                        <MenuItem
                                            onClick={() => { setBulkMode(true); setMoreAnchor(null); }}
                                            sx={{ gap: 1.2, py: 1 }}
                                        >
                                            <ChecklistRtlOutlinedIcon sx={{ fontSize: 18, color: '#B91C1C' }} />
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                                                    Bulk Delete
                                                </Typography>
                                                <Typography sx={{ fontSize: '10.5px', color: '#9CA3AF' }}>
                                                    Pick several news posts to remove
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}

                            {canReviewApprovals && (
                                <Link to="/dashboardmenu/approvals/news" style={{ textDecoration: 'none' }}>
                                    <Button
                                        endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                                        startIcon={<FactCheckOutlinedIcon sx={{ fontSize: 16 }} />}
                                        sx={{
                                            textTransform: 'none', fontSize: '12.5px', fontWeight: 700,
                                            height: 34, px: 1.4, borderRadius: '5px',
                                            color: '#0E7490', bgcolor: '#ECFAFD',
                                            border: '1px solid #B6E0EC',
                                            '&:hover': { bgcolor: '#DCF2F8' },
                                        }}
                                    >
                                        Review Approvals
                                    </Button>
                                </Link>
                            )}

                            {canTrackApprovals && (
                                <Link to="/dashboardmenu/status" style={{ textDecoration: 'none' }}>
                                    <Button
                                        endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                                        startIcon={<PendingActionsOutlinedIcon sx={{ fontSize: 16 }} />}
                                        sx={{
                                            textTransform: 'none', fontSize: '12.5px', fontWeight: 700,
                                            height: 34, px: 1.4, borderRadius: '5px',
                                            color: '#8338EC', bgcolor: '#FBF9FE',
                                            border: '1px solid #DCC7F3',
                                            '&:hover': { bgcolor: '#F3ECFD' },
                                        }}
                                    >
                                        Approval Status
                                    </Button>
                                </Link>
                            )}
                        </Box>
                    );
                })()}
                <Box sx={{ px: 2, pb: 2 }}>
                    {filteredNews.length > 0 && filteredNews[0].news[0]?.status === "schedule" && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5, mb: 2 }}>
                            <Chip
                                icon={<EventAvailableOutlinedIcon sx={{ fontSize: 16 }} />}
                                label="Upcoming News"
                                sx={{
                                    height: "26px",
                                    fontSize: "12.5px",
                                    fontWeight: 700,
                                    borderRadius: "8px",
                                    backgroundColor: "#F1EAFC",
                                    color: "#8338EC",
                                    border: "1px solid #DCC9F5",
                                    "& .MuiChip-icon": { color: "inherit" },
                                }}
                            />
                            <Divider sx={{ flex: 1 }} />
                        </Box>
                    )}

                    {!hasLoaded ? (
                        <ListSkeleton />
                    ) : filteredNews.length > 0 ? (
                        filteredNews.map((dateGroup, index) => (
                            <Box key={index} sx={{ mb: 2, px: 2.2, pb: 2, pt: 0.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: "#6B7280",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {dateGroup.news[0]?.status === "schedule" ? "Scheduled on " : "Posted on "}
                                        {dateGroup.postedOnDate} | {dateGroup.postedOnDay}
                                    </Typography>
                                    <Divider sx={{ flex: 1 }} />
                                </Box>

                                {/* Render news cards */}
                                {dateGroup.news
                                    .filter((newsItem) =>
                                        newsItem.headLine.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map((newsItem) => {
                                        const isReadMore = expandedMessageId === newsItem.id;
                                        return (
                                            <React.Fragment key={newsItem.id}>
                                                <Box
                                                    sx={{
                                                        border: "1px solid #E6E8EC",
                                                        boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                                        borderRadius: "5px",
                                                        backgroundColor: "#fff",
                                                        p: 2,
                                                        mb: 2,
                                                        position: "relative",
                                                        transition: "box-shadow 0.2s, border-color 0.2s",
                                                        "&:hover": {
                                                            boxShadow: "0px 4px 14px rgba(16,24,40,0.10)",
                                                            borderColor: "#D6DAE1",
                                                        },
                                                    }}
                                                >
                                                    {canBulkDelete && bulkMode &&
                                                        <Checkbox
                                                            checked={selectedMessageIds.includes(newsItem.id)}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                setSelectedMessageIds(prev =>
                                                                    checked
                                                                        ? [...prev, newsItem.id]
                                                                        : prev.filter(id => id !== newsItem.id)
                                                                );
                                                            }}
                                                            sx={{ position: "absolute", top: 6, left: -38 }}
                                                        />
                                                    }

                                                    <Grid container>
                                                        <Grid
                                                            size={{ xs: 12, sm: 12, lg: 9 }}
                                                        >
                                                            <Typography sx={{ fontWeight: "600", fontSize: "16px", wordBreak: "break-word" }}>
                                                                {newsItem.headLine === null ? "" : newsItem.headLine}
                                                            </Typography>

                                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mt: 0.8 }}>
                                                                {dateGroup.tag === "today" && (
                                                                    <Chip
                                                                        size="small"
                                                                        label="Today"
                                                                        sx={{
                                                                            ...metaChipSx,
                                                                            backgroundColor: websiteSettings.mainColor,
                                                                            color: websiteSettings.textColor,
                                                                        }}
                                                                    />
                                                                )}
                                                                {newsItem.status === "schedule" && (
                                                                    <Chip
                                                                        size="small"
                                                                        icon={<EventAvailableOutlinedIcon />}
                                                                        label={`Scheduled for ${dateGroup.postedOnDay}`}
                                                                        sx={{
                                                                            ...metaChipSx,
                                                                            backgroundColor: "#F1EAFC",
                                                                            color: "#8338EC",
                                                                            border: "1px solid #DCC9F5",
                                                                        }}
                                                                    />
                                                                )}
                                                                {newsItem.updatedOn && (
                                                                    <Chip
                                                                        size="small"
                                                                        icon={<UpdateOutlinedIcon />}
                                                                        label={`Updated on ${newsItem.updatedOn}`}
                                                                        sx={{
                                                                            ...metaChipSx,
                                                                            backgroundColor: websiteSettings.lightColor || "#F3F4F6",
                                                                            color: "#4B5563",
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Grid>

                                                        <Grid
                                                            size={{ xs: 12, sm: 12, lg: 3 }}
                                                            sx={{ textAlign: "right" }}
                                                        >
                                                            <Typography sx={{ fontSize: "10px", color: "#8a8a8a" }}>
                                                                Posted by: {newsItem.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: "10px", color: "#8a8a8a" }}>
                                                                Time: {newsItem.time}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                    <Divider sx={{ mt: 1.5 }} />
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
                                                    {newsItem.isAlterAvilable === "Y" && (canEdit || canDelete) && (
                                                        <Box
                                                            sx={{
                                                                position: "absolute",
                                                                bottom: "12px",
                                                                right: "12px",
                                                                display: "flex",
                                                                gap: 1,
                                                            }}
                                                        >
                                                            {canEdit && (
                                                                <Button
                                                                    variant="outlined"
                                                                    startIcon={<EditOutlinedIcon sx={{ fontSize: "15px" }} />}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        py: 0.2,
                                                                        px: 1.5,
                                                                        borderRadius: '8px',
                                                                        fontSize: '11px',
                                                                        borderColor: '#D6DAE1',
                                                                        color: '#374151',
                                                                        fontWeight: "600",
                                                                        backgroundColor: "#fff",
                                                                        "&:hover": { borderColor: "#9AA3AF", backgroundColor: "#F7F8FA" },
                                                                    }}
                                                                    onClick={() => handleEdit(newsItem.id)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            )}
                                                            {canDelete && (
                                                                <Tooltip title="Delete">
                                                                    <IconButton
                                                                        sx={{
                                                                            border: "1px solid #D6DAE1",
                                                                            borderRadius: "8px",
                                                                            width: "27px",
                                                                            height: "27px",
                                                                            backgroundColor: "#fff",
                                                                            "&:hover": { borderColor: "#f44336", backgroundColor: "#FFF5F5" },
                                                                        }}
                                                                        onClick={() => handleDelete(newsItem.id)}
                                                                    >
                                                                        <DeleteOutlineOutlinedIcon
                                                                            sx={{ fontSize: "15px", color: "#f44336" }}
                                                                        />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </React.Fragment>

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
                            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                                {searchQuery
                                    ? "No news matches your search"
                                    : formattedDate
                                        ? "No news on this date"
                                        : "No news yet"}
                            </Typography>
                            <Typography sx={{ fontSize: "13px", color: "#8A93A0", mt: 0.5, maxWidth: "340px" }}>
                                {searchQuery
                                    ? "Try a different headline, or clear the search to see everything."
                                    : formattedDate
                                        ? "Clear the date filter to see all news."
                                        : canCreate
                                            ? "Create your first news item and it will show up here."
                                            : "Nothing has been published yet."}
                            </Typography>
                            {!searchQuery && !formattedDate && canCreate && (
                                <Button
                                    onClick={handleCreateNews}
                                    variant="contained"
                                    startIcon={<AddIcon sx={{ fontSize: "18px" }} />}
                                    sx={{
                                        mt: 2,
                                        backgroundColor: "#000",
                                        borderRadius: "50px",
                                        px: 2.5,
                                        py: 0.5,
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        textTransform: "none",
                                        boxShadow: "none",
                                        "&:hover": { backgroundColor: "#1f1f1f", boxShadow: "none" },
                                    }}
                                >
                                    Create News
                                </Button>
                            )}
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