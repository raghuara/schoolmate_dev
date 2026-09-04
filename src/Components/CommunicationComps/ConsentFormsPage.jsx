import { Autocomplete, Box, Button, Chip, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fab, Grid, IconButton, InputAdornment, Paper, Switch, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { useDispatch, useSelector } from "react-redux";
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
import { ConsentFetchFetch, DeleteConsentForm, DeleteNewsApi, NewsFetch } from "../../Api/Api";
import Loader from "../Loader";
import { ListSkeleton } from "../InnerLoader";
import SnackBar from "../SnackBar";
import NoData from '../../Images/Login/No Data.png'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { selectGrades } from "../../Redux/Slices/DropdownController";
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

export default function ConsentFormPage() {
    const today = dayjs();
    const handleOpen = () => setOpenCal(true);
    const handleClose = () => setOpenCal(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedDate, setFormattedDate] = useState('');
    const [openCal, setOpenCal] = useState(false);
    const navigate = useNavigate();
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [openAlert, setOpenAlert] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [newsData, setNewsData] = useState([]);
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [isLoading, setIsLoading] = useState(false);
    // Hold the list's shape until the first fetch has genuinely finished, so the
    // empty state does not flash before the data arrives.
    const [hasLoaded, setHasLoaded] = useState(false);
    const token = '123';

    const [searchQuery, setSearchQuery] = useState("");
    const [expandedNews, setExpandedNews] = useState({});
    const [deleteId, setDeleteId] = useState('');

    const location = useLocation();
    const value = location.state?.value || 'N';
    const [checked, setChecked] = useState(false);
    const [isMyProject, setIsMyProject] = useState('N');


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

    const consentDialogGhostSx = {
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

    const filteredNews = newsData.filter((dateGroup) =>
        dateGroup.consentForm.some((newsItem) =>
            newsItem.heading.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    // Cards are filtered again inside the map, so count the same way the list renders.
    const visibleFormCount = filteredNews.reduce(
        (total, dateGroup) => total + dateGroup.consentForm.filter((newsItem) =>
            newsItem.heading.toLowerCase().includes(searchQuery.toLowerCase())
        ).length,
        0,
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
        navigate('edit', { state: { id } });
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

    const handleClearDate = () => {
        setSelectedDate(null);
        setFormattedDate('');
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


    const getGradeNames = (gradeSegments) => {
        return gradeSegments
            .map((segment) => {
                const grade = grades.find((g) => g.id === segment.gradeId);
                if (!grade) return null;

                const sections = segment.sections?.length
                    ? `(${segment.sections.join(', ')})`
                    : '';

                // return `${grade.sign} ${sections}`;
                return `${grade.sign}`;
            })
            .filter(Boolean)
            .join(', ');
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
        try {
            const res = await axios.get(ConsentFetchFetch, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    date: formattedDate || '',
                    isMyProject: isMyProject,
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
            const res = await axios.delete(DeleteConsentForm, {
                params: {
                    id: id
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
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }} >Consent Forms</Typography>
                        <Chip
                            size="small"
                            label={visibleFormCount}
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
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            xs: 6,
                            sm: 6,
                            md: 3,
                            lg: 2
                        }}>
                        {userType !== "teacher" &&
                            (
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                                </Box>
                            )}
                    </Grid>
                    <Grid
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        size={{
                            xs: 12,
                            sm: 12,
                            md: 3,
                            lg: 4
                        }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search forms by heading"
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
                        <Link to='responses' style={{ textDecoration: "none" }}>
                            <Button
                                startIcon={<FactCheckOutlinedIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                    ml: 1.2,
                                    textTransform: "none",
                                    color: "#D84600",
                                    backgroundColor: "rgba(216, 70, 0, 0.1)",
                                    border: "1px solid rgba(216, 70, 0, 0.22)",
                                    borderRadius: "50px",
                                    fontSize: "12.5px",
                                    fontWeight: 600,
                                    px: 2,
                                    py: 0.4,
                                    whiteSpace: "nowrap",
                                    "&:hover": { backgroundColor: "rgba(216, 70, 0, 0.18)" },
                                }}>
                                Responses
                            </Button>
                        </Link>
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
                        {userType !== "teacher" &&
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
                                Forms
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
                            Delete this consent form?
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                            The form and every response already collected will be removed. This cannot be undone.
                        </Typography>
                        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                            <Button variant="outlined" onClick={() => handleCloseDialog(false)} sx={consentDialogGhostSx}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleCloseDialog(true)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "10px",
                                    fontSize: "12.5px",
                                    fontWeight: 700,
                                    px: 2.4,
                                    py: 0.7,
                                    boxShadow: "none",
                                    backgroundColor: websiteSettings.mainColor,
                                    color: websiteSettings.textColor,
                                    "&:hover": { backgroundColor: websiteSettings.mainColor, opacity: 0.9, boxShadow: "none" },
                                }}
                            >
                                Delete
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
                <Box sx={{ p: 2 }}>
                    {!hasLoaded ? (
                        <ListSkeleton
                            groups={1}
                            perGroup={4}
                            spacing={3}
                            columns={{ xs: 12, sm: 12, lg: 6 }}
                            sx={{ p: 0 }}
                        />
                    ) : filteredNews.length > 0 ? (
                        filteredNews.map((dateGroup, index) => (
                            <Box key={index} sx={{ mb: 4, }}>
                                {/* Render date */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: "#6B7280",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Posted on {dateGroup.postedOnDate} | {dateGroup.postedOnDay}
                                    </Typography>
                                    <Divider sx={{ flex: 1 }} />
                                </Box>
                                <Grid container spacing={3} alignItems="stretch">
                                    {/* Render news cards */}
                                    {dateGroup.consentForm
                                        .filter((newsItem) =>
                                            newsItem.heading.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).map((newsItem) => (
                                            <Grid
                                                key={newsItem.id}
                                                size={{
                                                    xs: 12,
                                                    sm: 12,
                                                    lg: 6
                                                }}>
                                                <>
                                                    <Box
                                                        sx={{
                                                            border: "1px solid #E6E8EC",
                                                            boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
                                                            borderRadius: "5px",
                                                            backgroundColor: "#fff",
                                                            p: 2,
                                                            // Clears the absolutely positioned action buttons, and
                                                            // only when there are any to clear.
                                                            pb: newsItem.isAlterAvilable === "Y" ? 5.5 : 2,
                                                            position: "relative",
                                                            height: "100%",
                                                            minHeight: "120px",
                                                            boxSizing: "border-box",
                                                            transition: "box-shadow 0.2s, border-color 0.2s",
                                                            "&:hover": {
                                                                boxShadow: "0px 4px 14px rgba(16,24,40,0.10)",
                                                                borderColor: "#D6DAE1",
                                                            },
                                                        }}
                                                    >
                                                        {dateGroup.tag === "today" && (
                                                            <Chip
                                                                size="small"
                                                                label="Today"
                                                                sx={{
                                                                    height: "20px",
                                                                    fontSize: "10.5px",
                                                                    fontWeight: 600,
                                                                    borderRadius: "6px",
                                                                    mb: 1,
                                                                    backgroundColor: websiteSettings.mainColor,
                                                                    color: websiteSettings.textColor,
                                                                    "& .MuiChip-label": { px: "7px" },
                                                                }}
                                                            />
                                                        )}
                                                        <Grid container>
                                                            <Grid
                                                                sx={{  }}
                                                                size={{
                                                                    xs: 12,
                                                                    sm: 12,
                                                                    lg: 9
                                                                }}>
                                                                <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                                                    {newsItem.heading}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: '12px', color: '#777' }}>
                                                                    Delivered to:
                                                                    {newsItem.consentGradeSegments?.length > 0 && (
                                                                        <span style={{ fontSize: "10px" }}>
                                                                            ({getGradeNames(newsItem.consentGradeSegments)})
                                                                        </span>
                                                                    )}
                                                                </Typography>

                                                            </Grid>
                                                            <Grid
                                                                sx={{ textAlign: "right" }}
                                                                size={{
                                                                    xs: 12,
                                                                    sm: 12,
                                                                    lg: 3
                                                                }}>
                                                                <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                                    Posted by: {newsItem.name}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: "11px", color: "#8a8a8a" }}>
                                                                    Time: {newsItem.time}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        <Divider sx={{ mt: 1.5 }} />
                                                        <Grid container spacing={2}>


                                                            <Grid
                                                                sx={{ minHeight: "56px" }}
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

                                                        {/* Edit and Delete Buttons */}

                                                        {newsItem.isAlterAvilable === "Y" &&
                                                            <Box
                                                                sx={{
                                                                    position: "absolute",
                                                                    bottom: "16px",
                                                                    right: "16px",
                                                                    display: "flex",
                                                                    gap: 1,
                                                                }}
                                                            >

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
                                                                        onClick={() => handleDelete(newsItem.questionId)}
                                                                    >
                                                                        <DeleteOutlineOutlinedIcon
                                                                            sx={{ fontSize: "15px", color: "#f44336" }}
                                                                        />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        }
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
                            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                                {searchQuery
                                    ? "No forms match your search"
                                    : formattedDate
                                        ? "No forms on this date"
                                        : "No consent forms yet"}
                            </Typography>
                            <Typography sx={{ fontSize: "13px", color: "#8A93A0", mt: 0.5, maxWidth: "340px" }}>
                                {searchQuery
                                    ? "Try a different heading, or clear the search to see everything."
                                    : formattedDate
                                        ? "Clear the date filter to see all forms."
                                        : userType !== "teacher"
                                            ? "Create your first consent form and it will show up here."
                                            : "Nothing has been shared yet."}
                            </Typography>
                            {!searchQuery && !formattedDate && userType !== "teacher" && (
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
                                    Create Form
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
