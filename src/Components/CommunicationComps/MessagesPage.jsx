import { Autocomplete, Box, Button, Checkbox, Chip, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, Grid, IconButton, InputAdornment, Menu, MenuItem, Paper, Switch, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../Redux/Slices/academicYearSlice";
import { useDispatch, useSelector } from "react-redux";
import { findSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined';
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
import { BulkDeleteMessage, DeleteMessage, DeleteNewsApi, GettingGrades, MessageFetch, NewsFetch } from "../../Api/Api";
import Loader from "../Loader";
import { ListSkeleton } from "../InnerLoader";
import SnackBar from "../SnackBar";
import NoData from '../../Images/Login/No Data.png'
import { selectGrades } from "../../Redux/Slices/DropdownController";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import { selectUserTypeID } from "../../Redux/Slices/AuthSlice";
import { APPROVAL_SUBMENUS, approvalRoleFor, isApproverFor, mustRequestApproval, selectApprovalMatrix, selectApprovalMatrixReady } from "../../Redux/Slices/approvalMatrixSlice";


export default function MessagesPage() {
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
    const [openDeliveredAlert, setOpenDeliveredAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [messageData, setMessageData] = useState([]);
    const user = useSelector((state) => state.auth);
    const messagePerms = findSubMenuPermissions(user.permissions, "communication", "message") || {};
    const canCreate = messagePerms.create === "Y";
    const canEdit = messagePerms.edit === "Y";
    const canDelete = messagePerms.delete === "Y";
    // Level 1 of the Messages approval flow acts straight away; every other level
    // and anyone outside the flow raises a request instead.
    const userTypeID = useSelector(selectUserTypeID);
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const canActDirect = approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.MESSAGE, userTypeID).canPublishDirect;
    /* Bulk delete follows the single delete: the delete permission grants it, and
       the approval flow only decides whether it happens straight away or goes up
       as a request. Requiring canActDirect here hid the whole bulk bar from a role
       that holds delete but sits below Level 1 - a role that can already delete the
       same items one at a time. */
    const canBulkDelete = canDelete;

    /*
       Shortcuts out of Messages, each shown only when it leads somewhere useful.
       "Review Approvals" is for whoever acts on the queue; "Approval Status" is
       the other side of the same flow - people who can create but have to raise
       a request, and so have something to track. Neither is an access gate, so
       both wait for the matrix rather than guessing while it loads.
    */
    const matrixReady = useSelector(selectApprovalMatrixReady);
    const canReviewApprovals = matrixReady
        && isApproverFor(approvalMatrix, APPROVAL_SUBMENUS.MESSAGE, userTypeID);
    const canTrackApprovals = matrixReady && canCreate
        && mustRequestApproval(approvalMatrix, APPROVAL_SUBMENUS.MESSAGE, userTypeID);
    const showApprovalLinks = canReviewApprovals || canTrackApprovals;

    /*
       Bulk delete is off until it is asked for. A checkbox beside every card put
       a destructive control one stray click away while reading. Leaving the mode
       clears the selection, so a stale one can never be acted on later.
    */
    const [bulkMode, setBulkMode] = useState(false);
    const [moreAnchor, setMoreAnchor] = useState(null);
    const exitBulkMode = () => { setBulkMode(false); setSelectedMessageIds([]); };
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    // The empty state must not paint before the first fetch has actually
    // finished, otherwise "no data" flashes on every visit.
    const [hasLoaded, setHasLoaded] = useState(false);
    const token = '123';
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteId, setDeleteId] = useState('');
    const [selectedMessageIds, setSelectedMessageIds] = useState([]);
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

    // Cards are filtered again inside the map, so count the same way the list renders.
    const visibleMessageCount = filteredMessage.reduce(
        (total, dateGroup) => total + dateGroup.messages.filter((messageItem) =>
            messageItem.headLine.toLowerCase().includes(searchQuery.toLowerCase())
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
    }, [checked, formattedDate, academicYear])

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
        // The API rejects the call without an academic year, so wait until the
        // header's selected year is in the store before asking for the list.
        if (!academicYear) return;
        try {
            const res = await axios.get(MessageFetch, {
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
            setMessageData(res.data.data)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setHasLoaded(true);
        }
    };


    const DeleteMessageApi = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteMessage, {
                params: {
                    id: id,
                    rollNumber: rollNumber,
                    userType: userType,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchMessage();
            setOpen(true);
            setColor(true);
            setStatus(true);

            if (canActDirect) {
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
            setMessage(canActDirect ? "Messages Deleted Successfully" : "Requested Successfully");
            setSelectedMessageIds([]);
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
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", mb: 0.13, }}>
                <Grid container alignItems="center">
                    <Grid
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 3
                        }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Messages</Typography>
                        <Chip
                            size="small"
                            label={visibleMessageCount}
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
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2
                        }}>
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
                            placeholder="Search messages by headline"
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

                    <Grid
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", gap: 1, px: 1 }}
                        size={{
                            xs: 8,
                            sm: 8,
                            md: 3,
                            lg: 3
                        }}>
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
                                    py: 0.6,
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                                    "&:hover": {
                                        bgcolor: "#1a1a1a",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
                                    },
                                }}
                            >
                                Message
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
                            {canActDirect ? "Delete this message?" : "Send a delete request?"}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                            {canActDirect
                                ? "This will remove the message for everyone. It cannot be undone."
                                : "An approver has to accept this before the message is removed."}
                        </Typography>
                        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                            <Button variant="outlined" onClick={() => handleCloseDialog(false)} sx={dialogGhostSx}>
                                Cancel
                            </Button>
                            <Button onClick={() => handleCloseDialog(true)} sx={dialogPrimarySx}>
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
                            {canActDirect
                                ? `Delete ${selectedMessageIds.length} selected messages?`
                                : `Send a delete request for ${selectedMessageIds.length} messages?`}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                            {canActDirect
                                ? "This will remove them for everyone. It cannot be undone."
                                : "An approver has to clear the request before they are removed."}
                        </Typography>
                        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                            <Button variant="outlined" onClick={() => handleCloseBulkDeleteDialog(false)} sx={dialogGhostSx}>
                                Cancel
                            </Button>
                            <Button onClick={() => handleCloseBulkDeleteDialog(true)} sx={dialogPrimarySx}>
                                {canActDirect ? "Delete" : "Send Request"}
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
                            Edit this message?
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                            {canActDirect
                                ? "Your changes will go live as soon as you save them."
                                : "Your changes will be sent for approval before they go live."}
                        </Typography>
                        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                            <Button variant="outlined" onClick={() => handleEditCloseDialog(false)} sx={dialogGhostSx}>
                                Cancel
                            </Button>
                            <Button onClick={() => handleEditCloseDialog(true)} sx={dialogPrimarySx}>
                                Edit
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
                {(canBulkDelete || showApprovalLinks) && (() => {
                    const allIds = filteredMessage.flatMap((group) => group.messages.map((m) => m.id));
                    const selectedCount = selectedMessageIds.length;
                    const allSelected = allIds.length > 0 && selectedCount === allIds.length;
                    // Partial selection is derived, not stored - a stored copy drifts
                    // out of sync the moment cards are ticked one at a time.
                    const someSelected = selectedCount > 0 && !allSelected;
                    const toggleAll = () => setSelectedMessageIds(allSelected ? [] : allIds);
                    const clearSelection = () => setSelectedMessageIds([]);

                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pt: 1.2, flexWrap: 'wrap' }}>
                            {canBulkDelete && bulkMode && (
                                <Box
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1,
                                        pl: 0.6, pr: selectedCount > 0 ? 0.6 : 1.4,
                                        height: 34, borderRadius: '5px',
                                        // Red only once something is actually selected.
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
                                                    Pick several messages to remove
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}

                            {canReviewApprovals && (
                                <Link to="/dashboardmenu/approvals/messages" style={{ textDecoration: 'none' }}>
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
                                <Link to="/dashboardmenu/status" state={{ tabIndex: 0 }} style={{ textDecoration: 'none' }}>
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
                    {filteredMessage.length > 0 && filteredMessage[0].messages[0]?.status === "schedule" && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5, mb: 2 }}>
                            <Chip
                                icon={<EventAvailableOutlinedIcon sx={{ fontSize: 16 }} />}
                                label="Upcoming Messages"
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
                        <ListSkeleton
                            groups={1}
                            perGroup={4}
                            spacing={4}
                            columns={{ xs: 12, sm: 12, md: 12, lg: 6 }}
                            sx={{ p: 2, pt: 2 }}
                        />
                    ) : filteredMessage.length > 0 ? (
                        filteredMessage.map((dateGroup, index) => (
                            <Box key={index} sx={{ mb: 3, p: 2 }}>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: "#6B7280",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {dateGroup.messages[0]?.status === "schedule" ? "Scheduled on " : "Posted on "}
                                        {dateGroup.postedOnDate} | {dateGroup.postedOnDay}
                                    </Typography>
                                    <Divider sx={{ flex: 1 }} />
                                </Box>
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
                                                    {/* Message Card */}
                                                    <Box
                                                        sx={{
                                                            border: "1px solid #E6E8EC",
                                                            boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                                            borderRadius: "5px",
                                                            backgroundColor: "#fff",
                                                            p: 2,
                                                            position: "relative",
                                                            transition: "box-shadow 0.2s, border-color 0.2s",
                                                            "&:hover": {
                                                                boxShadow: "0px 4px 14px rgba(16,24,40,0.10)",
                                                                borderColor: "#D6DAE1",
                                                            },
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mb: 1 }}>
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
                                                            {messageItem.status === "schedule" && (
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
                                                            {messageItem.updatedOn && (
                                                                <Chip
                                                                    size="small"
                                                                    icon={<UpdateOutlinedIcon />}
                                                                    label={`Updated on ${messageItem.updatedOn}`}
                                                                    sx={{
                                                                        ...metaChipSx,
                                                                        backgroundColor: websiteSettings.lightColor || "#F3F4F6",
                                                                        color: "#4B5563",
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                        {canBulkDelete && bulkMode &&
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
                                                                    <Typography sx={{
                                                                        fontWeight: "600",
                                                                        fontSize: "16px",
                                                                        lineHeight: 1.35,
                                                                        minHeight: "44px",
                                                                        display: "-webkit-box",
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: "vertical",
                                                                        overflow: "hidden",
                                                                        wordBreak: "break-word",
                                                                    }}>
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
                                                        <Divider sx={{ mt: 1.5 }} />

                                                        {/* Message Content */}
                                                        <Box
                                                            sx={{
                                                                fontSize: "14px",
                                                                pt: 1,
                                                                minHeight: "58px",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: isReadMore ? "unset" : 4,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: isReadMore ? "visible" : "hidden",
                                                                textOverflow: "ellipsis",
                                                                mb: messageItem.message.length > 200 ? 4 : 0.5
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
                                                        {(messageItem.isAlterAvilable === "Y" || isMyProject === "Y") && (canEdit || canDelete) && (
                                                            <Box
                                                                sx={{
                                                                    position: "absolute",
                                                                    bottom: "16px",
                                                                    right: "16px",
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
                                                                        onClick={() => handleEdit(messageItem.id)}
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
                                                                            onClick={() => handleDelete(messageItem.id)}
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
                            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                                {searchQuery
                                    ? "No messages match your search"
                                    : formattedDate
                                        ? "No messages on this date"
                                        : "No messages yet"}
                            </Typography>
                            <Typography sx={{ fontSize: "13px", color: "#8A93A0", mt: 0.5, maxWidth: "340px" }}>
                                {searchQuery
                                    ? "Try a different headline, or clear the search to see everything."
                                    : formattedDate
                                        ? "Clear the date filter to see all messages."
                                        : canCreate
                                            ? "Create your first message and it will show up here."
                                            : "Nothing has been sent yet."}
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
                                    Create Message
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
