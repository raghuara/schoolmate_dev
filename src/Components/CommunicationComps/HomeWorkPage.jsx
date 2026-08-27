import { Autocomplete, Box, Button, Chip, DialogActions, Dialog, Divider, Fab, IconButton, InputAdornment, Paper, Switch, TextField, Typography, ThemeProvider, createTheme, Grid, ToggleButtonGroup, ToggleButton, Tooltip } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../Redux/Slices/academicYearSlice";
import { DeleteHomeWork, DeleteTimeTable, GettingGrades, HomeWorkFetch, HomeWorkFetch01, TimeTableFetch } from "../../Api/Api";
import Loader from "../Loader";
import { PostedCardsSkeleton } from "../InnerLoader";
import SnackBar from "../SnackBar";
import { selectGrades } from "../../Redux/Slices/DropdownController";
import { findSubMenuPermissions, selectUserTypeID } from "../../Redux/Slices/AuthSlice";
import {
    APPROVAL_SUBMENUS, approvalRoleFor, isApproverFor, mustRequestApproval,
    selectApprovalMatrix, selectApprovalMatrixReady,
} from "../../Redux/Slices/approvalMatrixSlice";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import pdfDemo from '../../Images/PDF.png'
import NoData from '../../Images/Login/No Data.png'

export default function HomeWorkPage() {
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);
    const [openAlert, setOpenAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [openPdf, setOpenPdf] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [timeTableData, setTimeTableData] = useState([]);
    const user = useSelector((state) => state.auth);
    const homeworkPerms = findSubMenuPermissions(user.permissions, "communication", "homework") || {};
    const canView = homeworkPerms.view === "Y";
    const canCreate = homeworkPerms.create === "Y";
    const canEdit = homeworkPerms.edit === "Y";
    const canDelete = homeworkPerms.delete === "Y";
    const rollNumber = user.rollNumber
    const userType = user.userType

    /*
       Who can act on homework directly and who has to raise a request is decided
       by the approval matrix, exactly as it is for News, Messages and Circulars.
       Anyone the matrix does not place at a level sends a request instead.
    */
    const userTypeID = useSelector(selectUserTypeID);
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const canActDirect = approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.HOMEWORK, userTypeID).canPublishDirect;

    /*
       "Review Approvals" is for the people who act on the queue - anyone the
       matrix places at a level for Homework. "Approval Status" is the other side
       of the same flow: users who can create homework but have to raise a
       request, and therefore have something waiting to be tracked. Neither is an
       access gate, so both wait for the matrix rather than guessing while it loads.
    */
    const matrixReady = useSelector(selectApprovalMatrixReady);
    const canReviewApprovals = matrixReady
        && isApproverFor(approvalMatrix, APPROVAL_SUBMENUS.HOMEWORK, userTypeID);
    const canTrackApprovals = matrixReady && canCreate
        && mustRequestApproval(approvalMatrix, APPROVAL_SUBMENUS.HOMEWORK, userTypeID);
    const showApprovalLinks = canReviewApprovals || canTrackApprovals;

    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    // Hold the list's shape until the first fetch has genuinely finished, so an
    // empty grid does not paint before the data arrives.
    const [hasLoaded, setHasLoaded] = useState(false);
    const token = '123';
    const [deleteId, setDeleteId] = useState('');
    const location = useLocation();
    const value = location.state?.value || 'N';
    const [checked, setChecked] = useState(false);
    const [isMyProject, setIsMyProject] = useState('N');
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [editId, setEditId] = useState('');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedGradeSign, setSelectedGradeSign] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((section) => ({ sectionName: section })) || [];

    const today = dayjs();
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);

    useEffect(() => {
        if (grades && grades.length > 0) {
            setSelectedGradeId(grades[0].id);
            setSelectedSection(grades[0].sections[0]);
        }
    }, [grades]);

    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
    };

    const [view, setView] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const handleViewChange = (event, nextView) => {
        if (nextView) {
            setView(nextView);
        }
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


    useEffect(() => {
        if (value === 'Y') {
            setIsMyProject('Y');
            setChecked(true);
        } else {
            setIsMyProject('N');
            setChecked(false);
        }
    }, [value]);

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue.id);
            setSelectedGradeSign(newValue.sign);
            setSelectedSection(newValue.sections[0]);
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
        }
    };


    const handleCheck = (event) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        setIsMyProject(isChecked ? "Y" : "N");
    };

    const handleCreateNews = () => {
        navigate('create')
    }

    const handleClearDate = () => {
        setSelectedDate(null);
        setFormattedDate('');
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
            DeleteTimeTableId(deleteId)
            setOpenAlert(false);
        }
    };

    const handleEditCloseDialog = (edited) => {

        setOpenEditAlert(false);

        if (edited) {
            navigate('edit', { state: { id: editId } });
        }
    };



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
        setOpenPdf(false)
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
        fetchTimeTables()
    }, [checked, selectedGradeId, selectedSection, formattedDate, academicYear])


    const fetchTimeTables = async () => {
        // The API rejects the call without an academic year, so wait until the
        // header's selected year is in the store before asking for the list.
        if (!academicYear) return;
        try {
            const res = await axios.get(HomeWorkFetch01, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    grade: selectedGradeId || "131",
                    section: selectedSection || "A1",
                    isMyProject: isMyProject,
                    date: formattedDate || "",
                    academicYear: academicYear || "",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTimeTableData(res.data.data)
        } catch (error) {
            console.error(error);
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("No Data");
        } finally {
            setIsLoading(false);
            setHasLoaded(true);
        }
    };


    const DeleteTimeTableId = async (id) => {
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
            fetchTimeTables();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage(canActDirect ? "Homework Deleted Successfully" : "Requested Successfully");
            console.log('Homework deleted successfully:', res.data);
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete homework. Please try again.");
            console.error('Error deleting homework:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const smallActionSx = {
        width: "26px",
        height: "26px",
        border: "1px solid #DDE1E6",
        backgroundColor: "#fff",
        transition: "0.2s",
        "&:hover": { backgroundColor: "#EFEFEF", borderColor: "#9AA3AF" },
    };

    // Search narrows on headline, then the flat list is grouped by its posted /
    // scheduled date so it reads as one dated band per day - the same shape the
    // other Communication listings use.
    const groupedHomework = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const matches = (timeTableData || []).filter((t) =>
            (t.headLine || "").toLowerCase().includes(query)
        );

        const groups = [];
        const byDate = new Map();
        matches.forEach((item) => {
            const isScheduled = item.status === "schedule";
            const key = `${isScheduled ? "s" : "p"}|${isScheduled ? item.scheduleOn : item.postedOn}`;
            if (!byDate.has(key)) {
                const group = {
                    key,
                    scheduled: isScheduled,
                    date: isScheduled ? item.scheduleOn : item.postedOn,
                    day: item.day,
                    items: [],
                };
                byDate.set(key, group);
                groups.push(group);
            }
            byDate.get(key).items.push(item);
        });
        return groups;
    }, [timeTableData, searchQuery]);

    const visibleCount = groupedHomework.reduce((n, g) => n + g.items.length, 0);

    const RowActions = ({ table }) => (
        <Box sx={{ display: "flex", gap: 0.8, flexShrink: 0 }}>
            {canEdit && (
                <Tooltip title="Reupload">
                    <IconButton onClick={() => handleEdit(table.id)} sx={smallActionSx}>
                        <UploadOutlinedIcon sx={{ fontSize: 14, color: "#374151" }} />
                    </IconButton>
                </Tooltip>
            )}
            {canDelete && (
                <Tooltip title="Delete">
                    <IconButton
                        onClick={() => handleDelete(table.id)}
                        sx={{
                            ...smallActionSx,
                            "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#f44336" },
                        }}
                    >
                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 14, color: "#f44336" }} />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );

    const ViewFileButton = ({ table }) => {
        if (table.fileType !== "image" && table.fileType !== "pdf") return null;
        const isPdf = table.fileType === "pdf";
        return (
            <Button
                variant="outlined"
                onClick={() => handleViewClick(isPdf ? "pdf" : "", table.filePath)}
                sx={{
                    textTransform: "none",
                    px: 2,
                    py: 0.2,
                    borderRadius: "30px",
                    fontSize: "12px",
                    color: "#E60154",
                    fontWeight: "600",
                    backgroundColor: "#fcf6f0",
                    border: "none",
                    flexShrink: 0,
                    "&:hover": { border: "none", backgroundColor: "#fbeee2" },
                }}
            >
                {isPdf ? "View PDF" : "View Image"}
            </Button>
        );
    };

    return (
        <Box sx={{ width: "100%", }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}

            {/* ═══ TOOLBAR — same shape as Circulars / News / Messages ═══ */}
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, py: 1, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", mb: 0.13, }}>
                <Grid container alignItems="center">
                    <Grid
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        size={{ xs: 6, sm: 6, md: 3, lg: 2 }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Home Work</Typography>
                        {hasLoaded && (
                            <Chip
                                size="small"
                                label={visibleCount}
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
                        )}
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{ xs: 6, sm: 6, md: 3, lg: 1.8 }}>
                        {canCreate &&
                            <>
                                <Typography sx={{ fontWeight: "600", fontSize: "12px" }}>My Projects</Typography>
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
                        size={{ xs: 6, sm: 6, md: 3, lg: 2.6 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search homework by title"
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
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", gap: 1, px: 1, flexWrap: "wrap" }}
                        size={{ xs: 12, sm: 12, md: 3, lg: 5.6 }}>
                        {canView && (
                            <Autocomplete
                                disablePortal
                                options={grades}
                                getOptionLabel={(option) => option.sign}
                                value={grades.find((item) => item.id === selectedGradeId) || null}
                                onChange={(event, newValue) => handleGradeChange(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                sx={{ width: 130 }}
                                PaperComponent={(props) => (
                                    <Paper
                                        {...props}
                                        style={{ ...props.style, maxHeight: "150px", backgroundColor: "#000", color: "#fff" }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} className="classdropdownOptions">{option.sign}</li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        placeholder="Class"
                                        {...params}
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "28px",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    borderRadius: "50px",
                                                    backgroundColor: "#fff",
                                                },
                                            },
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": { borderColor: "#DDE1E6" },
                                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: websiteSettings.mainColor },
                                        }}
                                    />
                                )}
                            />
                        )}

                        {canView && (
                            <Autocomplete
                                disablePortal
                                options={sections}
                                getOptionLabel={(option) => option.sectionName}
                                value={sections.find((option) => option.sectionName === selectedSection) || null}
                                onChange={handleSectionChange}
                                isOptionEqualToValue={(option, value) => option.sectionName === value.sectionName}
                                sx={{ width: 130 }}
                                PaperComponent={(props) => (
                                    <Paper
                                        {...props}
                                        style={{ ...props.style, maxHeight: "150px", backgroundColor: "#000", color: "#fff" }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} className="classdropdownOptions">{option.sectionName}</li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        placeholder="Section"
                                        {...params}
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "28px",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    borderRadius: "50px",
                                                    backgroundColor: "#fff",
                                                },
                                            },
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": { borderColor: "#DDE1E6" },
                                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: websiteSettings.mainColor },
                                        }}
                                    />
                                )}
                            />
                        )}

                        {/* Date filter — hidden picker driven by a chip, like Circulars */}
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ThemeProvider theme={darkTheme}>
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
                                        renderInput={() => null}
                                        sx={{ opacity: 0, pointerEvents: 'none', width: "0px" }}
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

                        {canView && (
                            <ToggleButtonGroup
                                value={view}
                                exclusive
                                onChange={handleViewChange}
                                aria-label="View Toggle"
                                sx={{
                                    height: "28px",
                                    "& .MuiToggleButton-root": {
                                        px: 1.4,
                                        border: "1px solid #DDE1E6",
                                        backgroundColor: "#fff",
                                        color: "#374151",
                                        "&:hover": { backgroundColor: "#EFEFEF" },
                                        "&.Mui-selected": {
                                            backgroundColor: websiteSettings.mainColor,
                                            color: websiteSettings.textColor,
                                            "&:hover": { backgroundColor: websiteSettings.mainColor },
                                        },
                                    },
                                    "& .MuiToggleButton-root:first-of-type": { borderRadius: "50px 0 0 50px", pl: 1.7 },
                                    "& .MuiToggleButton-root:last-of-type": { borderRadius: "0 50px 50px 0", pr: 1.7 },
                                }}
                            >
                                <ToggleButton value="grid" aria-label="Grid View">
                                    <GridViewIcon sx={{ fontSize: "16px" }} />
                                </ToggleButton>
                                <ToggleButton value="list" aria-label="List View">
                                    <FormatListBulletedIcon sx={{ fontSize: "16px" }} />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        )}

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
                                    "&:hover": { bgcolor: "#1a1a1a", boxShadow: "0 4px 12px rgba(0,0,0,0.22)" },
                                }}
                            >
                                Home Work
                            </Button>
                        }
                    </Grid>
                </Grid>
            </Box>

            <Box ref={boxRef} sx={{ maxHeight: "83vh", overflowY: "auto" }}>
                {showApprovalLinks && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, px: 2, pt: 1.2, flexWrap: 'wrap' }}>
                        {canReviewApprovals && (
                            <Link to="/dashboardmenu/approvals/homework" style={{ textDecoration: 'none' }}>
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
                )}
                {!hasLoaded ? (
                    <Box sx={{ p: 2 }}>
                        <PostedCardsSkeleton
                            standalone
                            spacing={view === "grid" ? 3 : 1.5}
                            count={view === "grid" ? 6 : 4}
                            columns={view === "grid" ? { xs: 12, sm: 6, md: 4 } : { xs: 12, sm: 12, md: 12, lg: 6 }}
                            rows={view === "grid" ? 3 : 2}
                        />
                    </Box>
                ) : groupedHomework.length > 0 ? (
                    groupedHomework.map((group) => (
                        <Box key={group.key} sx={{ mb: 3, px: 2.2, pb: 2 }}>
                            {/* Dated band header */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 2, pb: 1.5 }}>
                                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", whiteSpace: "nowrap" }}>
                                    {group.scheduled ? "Scheduled on " : "Posted on "}
                                    {group.date}{group.day ? ` | ${group.day}` : ""}
                                </Typography>
                                <Divider sx={{ flex: 1 }} />
                            </Box>

                            {view === "grid" ? (
                                <Grid container spacing={2}>
                                    {group.items.map((table, index) => (
                                        <Grid key={table.id ?? index} size={{ xs: 12, sm: 6, md: 4 }}>
                                            <Box sx={{
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                border: "1px solid #E6E8EC",
                                                boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                                borderRadius: "5px",
                                                backgroundColor: "#fff",
                                                overflow: "hidden",
                                                transition: "box-shadow 0.2s, border-color 0.2s",
                                                "&:hover": {
                                                    boxShadow: "0px 4px 14px rgba(16,24,40,0.10)",
                                                    borderColor: "#D6DAE1",
                                                },
                                            }}>
                                                <Box sx={{ p: 2, pb: 1.2 }}>
                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mb: 1 }}>
                                                        <Chip
                                                            size="small"
                                                            label={table.gradeSection
                                                                || `${selectedGradeSign || grades?.[0]?.sign || ""} - ${selectedSection || grades?.[0]?.sections?.[0] || ""}`}
                                                            sx={{
                                                                ...metaChipSx,
                                                                backgroundColor: websiteSettings.lightColor || "#F3F4F6",
                                                                color: "#4B5563",
                                                            }}
                                                        />
                                                        {table.status === "schedule" && (
                                                            <Chip
                                                                size="small"
                                                                icon={<EventAvailableOutlinedIcon />}
                                                                label={`Scheduled for ${table.scheduleOn}`}
                                                                sx={{
                                                                    ...metaChipSx,
                                                                    backgroundColor: "#F1EAFC",
                                                                    color: "#8338EC",
                                                                    border: "1px solid #DCC9F5",
                                                                }}
                                                            />
                                                        )}
                                                        {table.updatedOn && (
                                                            <Chip
                                                                size="small"
                                                                label={`Updated on ${table.updatedOn}`}
                                                                sx={{
                                                                    ...metaChipSx,
                                                                    backgroundColor: "#F3F4F6",
                                                                    color: "#4B5563",
                                                                }}
                                                            />
                                                        )}
                                                    </Box>

                                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                                        <Typography sx={{ fontWeight: "600", fontSize: "16px", flex: 1, minWidth: 0 }}>
                                                            {table.headLine}
                                                        </Typography>
                                                        {(canEdit || canDelete) && <RowActions table={table} />}
                                                    </Box>
                                                </Box>

                                                {(table.fileType === "image" || table.fileType === "pdf") && (
                                                    <Box
                                                        sx={{
                                                            position: "relative",
                                                            mx: 2,
                                                            mb: 2,
                                                            borderRadius: "5px",
                                                            overflow: "hidden",
                                                            border: "1px solid #EDEFF3",
                                                            backgroundColor: "#F7F8FA",
                                                            "&:hover .overlay": { opacity: 1 },
                                                        }}
                                                    >
                                                        <img
                                                            src={table.fileType === "pdf" ? pdfDemo : table.filePath}
                                                            alt={`Homework: ${table.headLine || ""}`}
                                                            style={{
                                                                width: "100%",
                                                                height: "190px",
                                                                objectFit: table.fileType === "pdf" ? "contain" : "cover",
                                                                display: "block",
                                                            }}
                                                        />
                                                        <Box
                                                            className="overlay"
                                                            sx={{
                                                                position: "absolute",
                                                                inset: 0,
                                                                backgroundColor: "rgba(17,24,39,0.55)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                opacity: 0,
                                                                transition: "opacity 0.25s ease-in-out",
                                                            }}
                                                        >
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                                                                sx={{
                                                                    textTransform: "none",
                                                                    padding: "2px 15px",
                                                                    borderRadius: "30px",
                                                                    fontSize: "12px",
                                                                    border: "2px solid white",
                                                                    color: "white",
                                                                    fontWeight: "600",
                                                                    backgroundColor: "transparent",
                                                                    "&:hover": { border: "2px solid white", backgroundColor: "rgba(255,255,255,0.14)" },
                                                                }}
                                                                onClick={() => handleViewClick(table.fileType === "pdf" ? "pdf" : "", table.filePath)}
                                                            >
                                                                {table.fileType === "pdf" ? "View PDF" : "View Image"}
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                group.items.map((table, index) => (
                                    <Box
                                        key={table.id ?? index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            border: "1px solid #E6E8EC",
                                            boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                            borderRadius: "5px",
                                            backgroundColor: "#fff",
                                            p: 2,
                                            mb: 2,
                                            transition: "box-shadow 0.2s, border-color 0.2s",
                                            "&:hover": {
                                                boxShadow: "0px 4px 14px rgba(16,24,40,0.10)",
                                                borderColor: "#D6DAE1",
                                            },
                                        }}
                                    >
                                        {(table.fileType === "image" || table.fileType === "pdf") && (
                                            <Box
                                                onClick={() => handleViewClick(table.fileType === "pdf" ? "pdf" : "", table.filePath)}
                                                sx={{
                                                    width: 52,
                                                    height: 52,
                                                    flexShrink: 0,
                                                    borderRadius: "5px",
                                                    overflow: "hidden",
                                                    border: "1px solid #EDEFF3",
                                                    backgroundColor: "#F7F8FA",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <img
                                                    src={table.fileType === "pdf" ? pdfDemo : table.filePath}
                                                    alt={`Homework: ${table.headLine || ""}`}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: table.fileType === "pdf" ? "contain" : "cover",
                                                        display: "block",
                                                    }}
                                                />
                                            </Box>
                                        )}

                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontWeight: "600", fontSize: "16px" }} noWrap>
                                                {table.headLine}
                                            </Typography>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mt: 0.5 }}>
                                                <Chip
                                                    size="small"
                                                    label={table.gradeSection || "—"}
                                                    sx={{
                                                        ...metaChipSx,
                                                        backgroundColor: websiteSettings.lightColor || "#F3F4F6",
                                                        color: "#4B5563",
                                                    }}
                                                />
                                                {table.status === "schedule" && (
                                                    <Chip
                                                        size="small"
                                                        icon={<EventAvailableOutlinedIcon />}
                                                        label={`Scheduled for ${table.scheduleOn}`}
                                                        sx={{
                                                            ...metaChipSx,
                                                            backgroundColor: "#F1EAFC",
                                                            color: "#8338EC",
                                                            border: "1px solid #DCC9F5",
                                                        }}
                                                    />
                                                )}
                                                {table.updatedOn && (
                                                    <Chip
                                                        size="small"
                                                        label={`Updated on ${table.updatedOn}`}
                                                        sx={{ ...metaChipSx, backgroundColor: "#F3F4F6", color: "#4B5563" }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: { xs: "none", sm: "block" } }}>
                                            <ViewFileButton table={table} />
                                        </Box>

                                        {(canEdit || canDelete) && <RowActions table={table} />}
                                    </Box>
                                ))
                            )}
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
                            style={{ width: "30%", height: "auto", marginBottom: "16px" }}
                        />
                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                            {searchQuery
                                ? "No homework matches your search"
                                : formattedDate
                                    ? "No homework on this date"
                                    : checked
                                        ? "You have not posted any homework"
                                        : "No homework yet"}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#8A93A0", mt: 0.5, maxWidth: "340px" }}>
                            {searchQuery
                                ? "Try a different title, or clear the search to see everything."
                                : formattedDate
                                    ? "Clear the date filter to see all homework."
                                    : canCreate
                                        ? "Create your first homework and it will show up here."
                                        : "Nothing has been posted yet."}
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
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                                    "&:hover": { backgroundColor: "#1a1a1a" },
                                }}
                            >
                                Create Home Work
                            </Button>
                        )}
                    </Box>
                )}

                {showButton && (
                    <Fab
                        onClick={scrollToTop}
                        aria-label="Back to top"
                        sx={{
                            position: 'absolute',
                            width: 35,
                            height: 35,
                            bottom: 18,
                            right: 18,
                            zIndex: 1000,
                            backgroundColor: "#000",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#1a1a1a" },
                        }}
                    >
                        <ArrowUpwardIcon sx={{ fontSize: 18 }} />
                    </Fab>
                )}
            </Box>

            {/* ═══ Delete confirmation ═══ */}
            <Dialog
                open={openAlert}
                onClose={() => setOpenAlert(false)}
                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
            >
                <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                        {canActDirect ? "Delete this homework?" : "Send a delete request?"}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                        {canActDirect
                            ? "This will remove it for everyone. It cannot be undone."
                            : "An approver has to accept this before the homework is removed."}
                    </Typography>
                    <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                        <Button variant="outlined" onClick={() => handleCloseDialog(false)} sx={dialogGhostSx}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleCloseDialog(true)}
                            sx={{
                                ...dialogPrimarySx,
                                backgroundColor: "#f44336",
                                color: "#fff",
                                "&:hover": { backgroundColor: "#DC2626", boxShadow: "none" },
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* ═══ Edit confirmation ═══ */}
            <Dialog
                open={openEditAlert}
                onClose={() => setOpenEditAlert(false)}
                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
            >
                <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                        Edit this homework?
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                        You will be taken to the edit screen to update it.
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

            {/* ═══ Image lightbox ═══ */}
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
                BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}
            >
                <Box sx={{ position: 'relative' }}>
                    <img
                        src={imageUrl}
                        alt="Homework"
                        style={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '80vw',
                            maxHeight: '80vh',
                            display: 'block',
                            margin: 'auto',
                            borderRadius: '10px',
                        }}
                    />
                    <IconButton
                        onClick={handleImageClose}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: '#fff',
                            backgroundColor: 'rgba(0,0,0,0.45)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.65)' },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
            </Dialog>

            {/* ═══ PDF viewer ═══ */}
            <Dialog
                open={openPdf}
                onClose={handleImageClose}
                maxWidth="lg"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "14px", height: "88vh" } } }}
            >
                <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: 2, py: 1.2, borderBottom: "1px solid #E6E8EC",
                }}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                        Homework PDF
                    </Typography>
                    <IconButton size="small" onClick={handleImageClose}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                    <iframe
                        src={imageUrl}
                        title="Homework PDF"
                        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                    />
                </Box>
            </Dialog>
        </Box>
    );
}