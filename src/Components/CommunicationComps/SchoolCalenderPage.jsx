import { Autocomplete, Box, Button, Checkbox, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Switch, Tab, Tabs, TextareaAutosize, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import DatePicker, { Calendar } from "react-multi-date-picker";
import '../../Css/OverWrite.css'
import { useDropzone } from "react-dropzone";
import CancelIcon from "@mui/icons-material/Cancel";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { DeleteSchoolCalender, FetchAllSchoolCalenderEvents, FindSchoolCalender, postNews, postSchoolCalender, updateSchoolCalender } from "../../Api/Api";
import SnackBar from "../SnackBar";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from "@mui/icons-material/Close";
import ReactPlayer from "react-player";
import { TabList, TabPanel } from "@mui/joy";
import { MuiColorInput } from "mui-color-input";
import Loader from "../Loader";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

// Page theme — soft emerald (matches Leave Policy Master Screen).
const PRIMARY = "#059669";
const PRIMARY_LIGHT = "#ECFDF5";
const PRIMARY_DARK = "#047857";
const PRIMARY_BORDER = "#A7F3D0";

// 10 preset event colors — bright, vivid (rgba matches the backend EventColor format).
const EVENT_COLORS = [
    "rgba(59, 130, 246, 1)",   // bright blue
    "rgba(239, 68, 68, 1)",    // bright red
    "rgba(168, 85, 247, 1)",   // vivid purple
    "rgba(236, 72, 153, 1)",   // hot pink
    "rgba(20, 184, 166, 1)",   // bright teal
    "rgba(34, 197, 94, 1)",    // vivid green
    "rgba(249, 115, 22, 1)",   // bright orange
    "rgba(234, 179, 8, 1)",    // vivid yellow
    "rgba(99, 102, 241, 1)",   // vivid indigo
    "rgba(220, 38, 38, 1)",    // deep red
];

// Lightens an rgba color so it can be used as a card background (alpha 0.10–0.15 looks great).
const tintColor = (rgba, alpha = 0.12) => {
    if (!rgba || typeof rgba !== "string") return "#FAFAFA";
    const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) return "#FAFAFA";
    return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
};

const EventCard = ({ item, onViewImage, onPlayVideo, onEdit, onDelete }) => {
    const accent = item.eventColor || "#9CA3AF";
    const dateLabel = item.from === item.to ? item.from : `${item.from} → ${item.to}`;
    return (
        <Box sx={{
            bgcolor: tintColor(item.eventColor, 0.08),
            border: `1px solid ${tintColor(item.eventColor, 0.25)}`,
            borderLeft: `4px solid ${accent}`,
            borderRadius: "10px",
            p: 1.5,
            transition: "box-shadow 0.15s, transform 0.15s, background-color 0.15s",
            "&:hover": {
                bgcolor: tintColor(item.eventColor, 0.12),
                boxShadow: `0 4px 12px ${accent}1F`,
                transform: "translateY(-1px)",
            },
        }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4, flexWrap: "wrap" }}>
                <Box sx={{
                    px: 1, py: 0.3, borderRadius: "6px",
                    bgcolor: "#fff",
                    color: accent,
                    border: `1px solid ${tintColor(item.eventColor, 0.35)}`,
                    fontSize: 11, fontWeight: 800, letterSpacing: 0.3,
                    whiteSpace: "nowrap",
                }}>
                    {dateLabel}
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111", flex: 1, minWidth: 0 }} noWrap>
                    {item.headLine}
                </Typography>
            </Box>
            {item.description && (
                <Typography sx={{ fontSize: 12.5, color: "#4B5563", mb: 1, lineHeight: 1.5 }}>
                    {item.description}
                </Typography>
            )}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 0.5 }}>
                <Box>
                    {item.filetype === "image" && (
                        <Button
                            size="small" variant="outlined"
                            onClick={() => onViewImage(item.filepath)}
                            sx={{
                                textTransform: "none", fontSize: 11, fontWeight: 700,
                                borderRadius: "20px", px: 1.5, py: 0.2, minWidth: 0,
                                color: "#111", borderColor: "#D1D5DB",
                                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
                            }}
                        >
                            View Image
                        </Button>
                    )}
                    {item.filetype === "link" && (
                        <Button
                            size="small" variant="outlined"
                            onClick={() => onPlayVideo(item.filepath)}
                            sx={{
                                textTransform: "none", fontSize: 11, fontWeight: 700,
                                borderRadius: "20px", px: 1.5, py: 0.2, minWidth: 0,
                                color: "#111", borderColor: "#D1D5DB",
                                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
                            }}
                        >
                            Play Video
                        </Button>
                    )}
                </Box>
                {(onEdit || onDelete) && (
                    <Box sx={{ display: "flex", gap: 0.6 }}>
                        {onEdit && (
                            <Tooltip title="Edit">
                                <IconButton
                                    size="small"
                                    onClick={() => onEdit(item.id)}
                                    sx={{
                                        width: 28, height: 28,
                                        bgcolor: accent,
                                        color: "#fff",
                                        border: `1px solid ${accent}`,
                                        boxShadow: `0 1px 3px ${accent}55`,
                                        "&:hover": {
                                            bgcolor: accent,
                                            filter: "brightness(0.9)",
                                            boxShadow: `0 2px 6px ${accent}88`,
                                        },
                                    }}
                                >
                                    <EditOutlinedIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onDelete && (
                            <Tooltip title="Delete">
                                <IconButton
                                    size="small"
                                    onClick={() => onDelete(item.id)}
                                    sx={{
                                        width: 28, height: 28,
                                        bgcolor: "#fff",
                                        color: "#DC2626",
                                        border: "1px solid #FCA5A5",
                                        boxShadow: "0 1px 3px rgba(220,38,38,0.15)",
                                        "&:hover": {
                                            bgcolor: "#FEF2F2",
                                            borderColor: "#DC2626",
                                            boxShadow: "0 2px 6px rgba(220,38,38,0.25)",
                                        },
                                    }}
                                >
                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

const ColorSwatchPicker = ({ value, onChange }) => (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 0.5 }}>
        {EVENT_COLORS.map((c) => {
            const selected = value === c;
            return (
                <Box
                    key={c}
                    role="button"
                    aria-label={`Select color ${c}`}
                    onClick={() => onChange(c)}
                    sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        bgcolor: c,
                        cursor: "pointer",
                        position: "relative",
                        transition: "transform 0.15s",
                        boxShadow: selected
                            ? `0 0 0 2px #fff, 0 0 0 4px #111`
                            : "0 1px 2px rgba(0,0,0,0.15)",
                        "&:hover": { transform: "scale(1.12)" },
                    }}
                />
            );
        })}
    </Box>
);

export default function SchoolCalendarPage() {
    const websiteSettings = useSelector(selectWebsiteSettings);
    const token = "123"
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const [heading, setHeading] = useState("");
    const [editHeading, setEditHeading] = useState("");
    const [description, setDescription] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editEventValue, setEditEventValue] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [editActiveTab, setEditActiveTab] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [editUploadedFiles, setEditUploadedFiles] = useState([]);

    const [editPastedLink, setEditPastedLink] = useState("");
    const [editFileType, setEditFileType] = useState('');
    const [pastedLink, setPastedLink] = useState("");
    const [fileType, setFileType] = useState('');
    const [isLoading, setIsLoading] = useState('');
    const todayDateTime = dayjs().format('DD-MM-YYYY');
    const [openAlert, setOpenAlert] = useState(false);
    const [onlyFrom, setOnlyFrom] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [fromDateFormatted, setFromDateFormatted] = useState("");
    const [toDateFormatted, setToDateFormatted] = useState("");
    const [toDate, setToDate] = useState("");
    const [yearEvents, setYearEvents] = useState([]);
    const [todayEvents, setTodayEvents] = useState([]);
    const [completedEvents, setCompletedEvents] = useState([]);
    const [upCommingEvents, setUpCommingEvents] = useState([]);
    const [deleteId, setDeleteId] = useState('');
    const [editId, setEditId] = useState('');
    const [openEditAlert, setOpenEditAlert] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [openImage, setOpenImage] = useState(false);
    const [openVideo, setOpenVideo] = useState(false);
    const [forActiveTab, setForActiveTab] = useState(0);
    const [fetchedImage, setFetchedImage] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [monthChanged, setMonthChanged] = useState("");
    const [value, setValue] = useState(0);
    const [pickedColor, setPickedColor] = useState(EVENT_COLORS[0]);
    const [editPickedColor, setEditPickedColor] = useState(EVENT_COLORS[0]);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [createOpen, setCreateOpen] = useState(false);

    const closeCreateDialog = () => {
        setCreateOpen(false);
        setHeading("");
        setDescription("");
        setUploadedFiles([]);
        setPastedLink("");
        setFromDate("");
        setFromDateFormatted("");
        setToDate("");
        setToDateFormatted("");
        setOnlyFrom(false);
        setEventsValue("N");
        setPickedColor(EVENT_COLORS[0]);
        setFileType("");
    };

    const [eventsValue, setEventsValue] = useState('N');
    const [editEventsValue, setEditEventsValue] = useState('N');

    const handleEventsChange = (event) => {
        setEventsValue(event.target.checked ? "Y" : "N");
    };
    const handleEditEventsChange = (event) => {
        setEditEventsValue(event.target.checked ? "Y" : "N");
    };

    const handleFromDateChange = (event) => {
        const rawDate = event.target.value;
        const formattedDate = dayjs(rawDate, 'YYYY-MM-DD').format('DD-MM-YYYY');

        setFromDate(rawDate);
        setFromDateFormatted(formattedDate);

        if (toDate && dayjs(toDate, 'YYYY-MM-DD').isBefore(rawDate)) {
            setToDate("");
            setToDateFormatted("");
            setMessage("To Date has been cleared because it cannot be earlier than From Date.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        }
    };

    const handleToDateChange = (event) => {
        const rawDate = event.target.value;
        const formattedDate = dayjs(rawDate, 'YYYY-MM-DD').format('DD-MM-YYYY');

        if (dayjs(rawDate, 'YYYY-MM-DD').isBefore(fromDate)) {
            setMessage("To Date cannot be earlier than From Date.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setToDate(rawDate);
        setToDateFormatted(formattedDate);
    };

    const handleHeadingChange = (e) => {
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    const handleEditHeadingChange = (e) => {
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setEditHeading(newValue);
        }
    };

    const handleDescription = (e) => {
        const newValue = e.target.value;
        if (newValue.length <= 300) {
            setDescription(newValue);
        }
    };
    const handleEditDescription = (e) => {
        const newValue = e.target.value;
        if (newValue.length <= 300) {
            setEditDescription(newValue);
        }
    };

    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
    };
    const handleEditTabChange = (_, newValue) => {
        setEditActiveTab(newValue);
    };
    const ensureRGBA = (color) => {
        if (color.startsWith("rgb(")) {
            return color.replace("rgb(", "rgba(").replace(")", ", 1)");
        }
        return color;
    };

    const handleColorChange = (newColor) => {
        const rgbaColor = ensureRGBA(newColor);
        setPickedColor(rgbaColor);
        console.log("Converted color:", rgbaColor);
    };
    const handleEditColorChange = (newColor) => {
        const rgbaColor = ensureRGBA(newColor);
        setEditPickedColor(rgbaColor);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const validFormats = ['image/jpeg', 'image/webp', 'image/png'];

            const validFiles = acceptedFiles.filter(file => validFormats.includes(file.type));

            if (validFiles.length > 0) {
                setPastedLink("");
                setUploadedFiles([validFiles[0]]);
                setFileType("image");
            } else {
                alert("Only JPEG, WebP, or PNG files are allowed.");
            }
        }
    };

    const onDrop1 = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const validFormats = ['image/jpeg', 'image/webp', 'image/png'];

            const validFiles = acceptedFiles.filter(file => validFormats.includes(file.type));

            if (validFiles.length > 0) {
                setEditPastedLink("");
                setEditUploadedFiles([validFiles[0]]);
                setEditFileType("image");
                setFetchedImage('')
            } else {
                alert("Only JPEG, WebP, or PNG files are allowed.");
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ".jpg, .jpeg, .webp, .png"
    });

    const { getRootProps: getRootPropsAnother, getInputProps: getInputPropsAnother, isDragActive: isDragActive2 } = useDropzone({
        onDrop: onDrop1,
        accept: ".jpg, .jpeg, .webp, .png",
    });

    const handleImageClose = () => {
        setUploadedFiles([]);
        setFileType('')
    };

    const handleFetchedCloseImage = () => {
        setFetchedImage('')
        setEditFileType('')
    };

    const handleImageEditClose = () => {
        setEditUploadedFiles([]);
        setEditFileType('')
    };

    const handleLinkUpload = (e) => {

        const link = e.target.value;
        if (link) {
            setUploadedFiles([]);
            setPastedLink(link);
            setFileType("link");
            setFetchedImage('')
        }
    };
    const handleEditLinkUpload = (e) => {
        const link = e.target.value;
        if (link) {
            setEditUploadedFiles([]);
            setEditPastedLink(link);
            setEditFileType("link");
        }
    };

    const handleCancelClick = () => {
        setOpenAlert(true);
    };


    const handleCloseDialog = (deleted) => {
        setOpenAlert(false);

        if (deleted) {
            setHeading("")
            setDescription("")
            setUploadedFiles([])
            setPastedLink("")
            setFromDate("")
            setToDate("")
        }
    };


    const handleCloseEdit = (value) => {
        if (value) {
            UpdateEvents()
        } else {
            setOpenEdit(false);
        }
    };

    const handleCheckboxChange = (event) => {
        setOnlyFrom(event.target.checked);
        if (event.target.checked) {
            setToDate("");
        }
    };

    const handleEdit = (id) => {
        setEditId(id)
        setOpenEditAlert(true);

    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setOpenAlert(true);
    };

    const handleCloseDialogDelete = (deleted) => {
        setOpenAlert(false);

        if (deleted) {
            DeleteApi(deleteId)
        }
    };


    const handleEditCloseDialog = (edited) => {

        setOpenEditAlert(false);

        if (edited) {
            setOpenEditAlert(false);
            setOpenEdit(true)
            fetchDataById()
        }
    };


    const handleViewClick = (url) => {
        setImageUrl(url);
        setOpenImage(true);
    };

    const handleVideoClick = (url) => {
        setVideoUrl(url);
        setOpenVideo(true);
    };

    const handleViewImageClose = () => {
        setOpenImage(false);
    };

    const handleVideoClose = () => {
        setOpenVideo(false);
    };

    useEffect(() => {
        if (forActiveTab === "link") {
            setEditActiveTab(1);
        } else {
            setEditActiveTab(0);
        }
    }, [forActiveTab]);

    useEffect(() => {
        fetchYearEvents()
    }, [monthChanged])

    const fetchYearEvents = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(FetchAllSchoolCalenderEvents, {
                params: {
                    RollNumber: rollNumber,
                    UserType: userType,
                    Date: monthChanged || todayDateTime,
                    Event: "N",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setYearEvents(res.data.allEvents)
            setTodayEvents(res.data.todayEvents)
            setCompletedEvents(res.data.completedEvents)
            setUpCommingEvents(res.data.upCommingEvents)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDataById = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(FindSchoolCalender, {
                params: {
                    Id: editId
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEditHeading(res.data.headLine)
            setEditDescription(res.data.description)
            setEditEventsValue(res.data.event)
            setEditPickedColor(res.data.eventColor)
            if (res.data.filetype === "image") {
                setFetchedImage(res.data.filepath);
                setEditFileType("existing");
                setEditPastedLink('')
            } else if (res.data.filetype === "link") {
                setForActiveTab(res.data.filetype)
                setEditPastedLink(res.data.filepath);
                setFetchedImage("");
                console.log("link printed", res.data.filepath);
                setEditFileType("link");
            } else {
                setEditFileType("empty");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    const handlePost = async (status) => {

        setIsSubmitted(true);

        if (!heading.trim()) {
            setMessage("Headline is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!description.trim()) {
            setMessage("Description is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();

            formData.append('UserType', userType);
            formData.append('RollNumber', rollNumber);
            formData.append('HeadLine', heading);
            formData.append('Description', description);
            formData.append('FileType', fileType || "empty");
            formData.append('File', uploadedFiles[0] || '');
            formData.append('Link', pastedLink);
            formData.append('FromDate', fromDateFormatted);
            formData.append('ToDate', onlyFrom ? fromDateFormatted : toDateFormatted);
            formData.append('Event', eventsValue || "N");
            formData.append('EventColor', pickedColor || "rgba(0,0,0,1)");

            const res = await axios.post(postSchoolCalender, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Created successfully");
            fetchYearEvents()

            setFromDate("")
            setToDate("")
            setHeading('')
            setDescription('')
            setUploadedFiles([])
            setPastedLink('')
            setEventsValue("N")
            setPickedColor(EVENT_COLORS[0])
        } catch (error) {
            console.error("Error while inserting  data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const UpdateEvents = async () => {

        if (!editHeading.trim()) {
            setMessage("Headline is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!editDescription.trim()) {
            setMessage("Description is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();

            formData.append('Id', editId);
            formData.append('UserType', userType);
            formData.append('RollNumber', rollNumber);
            formData.append('HeadLine', editHeading);
            formData.append('Description', editDescription);
            formData.append('FileType', editFileType || "empty");
            formData.append('File', editUploadedFiles[0] || '');
            formData.append('Link', editPastedLink);
            formData.append('event', editEventsValue || "N");
            formData.append('EventColor', editPickedColor || "rgba(0, 0, 0, 1)");
            formData.append("UpdatedOn", todayDateTime || "");


            const res = await axios.put(updateSchoolCalender, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Updated successfully");
            fetchYearEvents()
            setOpenEdit(false);
            setEditHeading('')
            setEditDescription('')
            setEditUploadedFiles([])
            setEditPastedLink('')
        } catch (error) {
            console.error("Error while updating  data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const DeleteApi = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteSchoolCalender, {
                params: {
                    Id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchYearEvents();
            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Deleted Successfully");
        } catch (error) {
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to delete. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getAvailableSlots = () => {
        const dateColorMap = new Map();

        yearEvents.forEach((event) => {
            const { fromDate, toDate, eventColor } = event;
            const start = dayjs(fromDate, "DD-MM-YYYY");
            const end = dayjs(toDate, "DD-MM-YYYY");

            for (let date = start; date.isBefore(end) || date.isSame(end); date = date.add(1, "day")) {
                const formattedDate = date.format("YYYY-MM-DD");
                dateColorMap.set(formattedDate, eventColor);
            }
        });

        return dateColorMap;
    };


    const availableSlots = getAvailableSlots();

    // Events that include the selected calendar date in their date range.
    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) return [];
        const target = dayjs(selectedDate.format("YYYY-MM-DD"), "YYYY-MM-DD");
        return (yearEvents || []).filter((ev) => {
            const start = dayjs(ev.fromDate, "DD-MM-YYYY");
            const end = dayjs(ev.toDate, "DD-MM-YYYY");
            return (
                (target.isSame(start, "day") || target.isAfter(start, "day")) &&
                (target.isSame(end, "day") || target.isBefore(end, "day"))
            );
        });
    }, [selectedDate, yearEvents]);

    const selectedDateKey = selectedDate ? selectedDate.format("YYYY-MM-DD") : "";

    const handleDateChange = (newDate) => {
        // Toggle: clicking the same date again clears the selection.
        if (newDate && selectedDate && newDate.format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD")) {
            setSelectedDate(null);
        } else {
            setSelectedDate(newDate);
        }
    };

    const handleMonthChange = (calendarInstance) => {
        const currentMonth = calendarInstance.month.index + 1;
        const currentYear = calendarInstance.year;
        const firstDateOfMonth = `01-${currentMonth < 10 ? `0${currentMonth}` : currentMonth}-${currentYear}`;
        console.log("First Date of the Month: ", firstDateOfMonth);
        setMonthChanged(firstDateOfMonth);
    };

    return (
        <Box sx={{ width: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{ backgroundColor: "#f2f2f2", px: 2, borderRadius: "10px 10px 10px 0px", borderBottom: "1px solid #ddd", }}>
                <Grid container sx={{ py: 1 }} alignItems="center">
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{ xs: 6, lg: 6 }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>School Calendar</Typography>
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, px: 1 }}
                        size={{ xs: 6, lg: 6 }}>
                        {userType !== "teacher" && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                onClick={() => setCreateOpen(true)}
                                sx={{
                                    textTransform: "none",
                                    bgcolor: "#000",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 12.5,
                                    borderRadius: "50px",
                                    px: 2,
                                    py: 0.6,
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                                    "&:hover": {
                                        bgcolor: "#1a1a1a",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
                                    },
                                }}
                            >
                                Create Event
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Box>
            {userType !== "teacher" &&
                <Box sx={{
                    height: {
                        xs: "auto",
                        lg: "83vh",
                    },
                    overflow: "hidden",
                    bgcolor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                }}>
                    <Grid
                        container
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            margin: 0,
                            width: "100%",
                            overflow: "hidden",
                            flexWrap: { xs: "wrap", lg: "nowrap" },
                        }}
                    >
                        <Grid
                            sx={{
                                height: { xs: "auto", lg: "100%" },
                                maxHeight: { lg: "100%" },
                                px: { xs: 2, lg: 3 },
                                py: { xs: 2, lg: 2.5 },
                                overflowY: "auto",
                                minHeight: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                            }}
                            size={{
                                sm: 12,
                                xs: 12,
                                lg: 6
                            }}>
                            <Box sx={{
                                width: "100%",
                                maxWidth: 520,
                                bgcolor: "#fff",
                                border: "1px solid #E5E7EB",
                                borderRadius: "12px",
                                p: 1.8,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                // react-multi-date-picker overrides — compact, emerald theme.
                                "& .rmdp-wrapper, & .rmdp-shadow": {
                                    boxShadow: "none !important",
                                    backgroundColor: "transparent !important",
                                    width: "100%",
                                },
                                "& .rmdp-calendar": { width: "100%", padding: 0 },
                                "& .rmdp-day-picker": { width: "100%", padding: 0 },
                                "& .rmdp-day-picker > div": { width: "100%" },
                                "& .rmdp-header": { padding: "2px 0 12px", marginBottom: 0 },
                                "& .rmdp-header-values": { fontSize: 14, fontWeight: 700, color: "#111" },
                                "& .rmdp-arrow-container": {
                                    width: 26, height: 26, borderRadius: "50%",
                                    "&:hover": { backgroundColor: PRIMARY_LIGHT },
                                    "&:hover .rmdp-arrow": { borderColor: `${PRIMARY_DARK} !important` },
                                },
                                "& .rmdp-arrow": { borderColor: "#6B7280" },
                                "& .rmdp-week": { padding: "1px 0" },
                                "& .rmdp-week-day": {
                                    color: "#9CA3AF", fontWeight: 700, fontSize: 10.5,
                                    textTransform: "uppercase", letterSpacing: 0.5,
                                    width: "calc(100% / 7)", height: 26,
                                },
                                "& .rmdp-day": {
                                    width: "calc(100% / 7) !important",
                                    height: 38,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "#1F2937",
                                },
                                "& .rmdp-day span": {
                                    width: 30, height: 30,
                                    top: "4px", left: "50%",
                                    transform: "translateX(-50%)",
                                    borderRadius: "50%",
                                    fontSize: 12.5, fontWeight: 500,
                                },
                                "& .rmdp-day:not(.rmdp-disabled):hover span": {
                                    backgroundColor: `${PRIMARY_LIGHT} !important`,
                                    color: `${PRIMARY_DARK} !important`,
                                },
                                "& .rmdp-today span": {
                                    backgroundColor: "transparent !important",
                                    color: `${PRIMARY_DARK} !important`,
                                    border: `1.5px solid ${PRIMARY}`,
                                    fontWeight: 700,
                                },
                            }}>
                                <Calendar
                                    numberOfMonths={1}
                                    highlightToday
                                    showOtherDays={false}
                                    onMonthChange={handleMonthChange}
                                    onChange={handleDateChange}
                                    style={{ boxShadow: "none", backgroundColor: "transparent", width: "100%" }}
                                    mapDays={({ date }) => {
                                        let style = {};
                                        const formattedDate = date.format("YYYY-MM-DD");
                                        const eventColor = availableSlots.get(formattedDate);
                                        const isSelected = selectedDateKey === formattedDate;

                                        if (eventColor) {
                                            style = {
                                                backgroundColor: eventColor,
                                                color: "#fff",
                                                borderRadius: "50%",
                                                fontWeight: "bold",
                                            };
                                        }

                                        if (isSelected) {
                                            style = {
                                                ...style,
                                                outline: `2px solid ${PRIMARY_DARK}`,
                                                outlineOffset: "1px",
                                                borderRadius: "50%",
                                                fontWeight: "bold",
                                            };
                                        }

                                        return { style };
                                    }}
                                    className="teal"
                                />
                            </Box>

                            {/* Selected-day events panel — appears when user clicks a date on the calendar */}
                            {selectedDate && (
                                <Box sx={{ width: "100%", maxWidth: 520 }}>
                                    <Box sx={{
                                        border: `1px solid ${PRIMARY_BORDER}`,
                                        borderRadius: "10px",
                                        bgcolor: "#fff",
                                        overflow: "hidden",
                                    }}>
                                        <Box sx={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            px: 1.5, py: 0.8,
                                            bgcolor: PRIMARY_LIGHT,
                                            borderBottom: `1px solid ${PRIMARY_BORDER}`,
                                        }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <EventNoteOutlinedIcon sx={{ fontSize: 16, color: PRIMARY_DARK }} />
                                                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: PRIMARY_DARK }}>
                                                    {selectedDate.format("DD MMM YYYY")}
                                                </Typography>
                                                <Typography sx={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>
                                                    {selectedDayEvents.length === 0
                                                        ? "no events"
                                                        : `${selectedDayEvents.length} event${selectedDayEvents.length !== 1 ? "s" : ""}`}
                                                </Typography>
                                            </Box>
                                            <Tooltip title="Clear selection">
                                                <IconButton size="small" onClick={() => setSelectedDate(null)}>
                                                    <CloseIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <Box sx={{ p: 1.2, maxHeight: "22vh", overflowY: "auto" }}>
                                            {selectedDayEvents.length === 0 ? (
                                                <Typography sx={{ fontSize: 12, color: "#888", textAlign: "center", py: 1.5 }}>
                                                    No events scheduled for this date.
                                                </Typography>
                                            ) : (
                                                selectedDayEvents.map((item) => (
                                                    <Box
                                                        key={item.id}
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "flex-start",
                                                            gap: 1,
                                                            p: 1,
                                                            mb: 0.6,
                                                            bgcolor: "#FAFAFA",
                                                            borderRadius: "6px",
                                                            borderLeft: `3px solid ${item.eventColor || "#999"}`,
                                                        }}
                                                    >
                                                        <Box sx={{
                                                            width: 8, height: 8, borderRadius: "50%",
                                                            bgcolor: item.eventColor || "#999",
                                                            mt: "5px", flexShrink: 0,
                                                        }} />
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#222" }}>
                                                                {item.headLine}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: 11, color: "#666" }}>
                                                                {item.fromDate}{item.fromDate !== item.toDate ? ` → ${item.toDate}` : ""}
                                                            </Typography>
                                                            {item.description && (
                                                                <Typography sx={{ fontSize: 11, color: "#555", mt: 0.3 }}>
                                                                    {item.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        {(userType === "superadmin" || userType === "admin") && (
                                                            <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                                                                <Tooltip title="Edit">
                                                                    <IconButton size="small" onClick={() => handleEdit(item.id)} sx={{ width: 22, height: 22 }}>
                                                                        <EditOutlinedIcon sx={{ fontSize: 13 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete">
                                                                    <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ width: 22, height: 22 }}>
                                                                        <DeleteOutlineOutlinedIcon sx={{ fontSize: 13 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ))
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Grid>

                        {/* RIGHT column — Events tabs (vertical divider, scrolls naturally) */}
                        <Grid
                            sx={{
                                height: { xs: "auto", lg: "100%" },
                                maxHeight: { lg: "100%" },
                                borderLeft: { lg: `1px solid ${PRIMARY_BORDER}` },
                                bgcolor: "#FCFEFD",
                                display: "flex",
                                flexDirection: "column",
                                minHeight: 0,
                                overflow: "hidden",
                            }}
                            size={{
                                sm: 12,
                                xs: 12,
                                lg: 6
                            }}>
                            <Box sx={{
                                width: '100%', flexShrink: 0,
                                px: 2, pt: 2,
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                                <Box sx={{
                                    bgcolor: '#fff',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '50px',
                                    p: 0.4,
                                    display: 'inline-flex',
                                    width: 'fit-content',
                                    maxWidth: '100%',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                }}>
                                    <Tabs
                                        value={value}
                                        onChange={handleChange}
                                        aria-label="event filters"
                                        TabIndicatorProps={{ style: { display: 'none' } }}
                                        sx={{
                                            minHeight: 30,
                                            '& .MuiTabs-flexContainer': { gap: 0.4 },
                                            '& .MuiTab-root': {
                                                textTransform: 'none',
                                                fontSize: 12.5,
                                                fontWeight: 700,
                                                color: '#6B7280',
                                                minHeight: 30,
                                                py: 0,
                                                px: 2,
                                                borderRadius: '50px',
                                                transition: 'all 0.18s ease',
                                                '&:hover': {
                                                    color: '#111',
                                                    bgcolor: '#F9FAFB',
                                                },
                                            },
                                            '& .Mui-selected': {
                                                color: `${websiteSettings.textColor || '#111'} !important`,
                                                bgcolor: websiteSettings.mainColor || '#FBBF24',
                                                boxShadow: `0 2px 6px ${(websiteSettings.mainColor || '#FBBF24')}55`,
                                                '&:hover': {
                                                    bgcolor: websiteSettings.mainColor || '#FBBF24',
                                                },
                                            },
                                        }}
                                    >
                                        <Tab label="Completed" />
                                        <Tab label="Today" />
                                        <Tab label="Upcoming" />
                                    </Tabs>
                                </Box>
                            </Box>
                            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1, pb: 2 }}>
                                {value === 0 && <Box sx={{ px: 1, pt: 1.5 }}>
                                    <Grid container spacing={2}>
                                        {completedEvents.length === 0 ? (
                                            <Box
                                                sx={{
                                                    textAlign: "center",
                                                    mt: 2,
                                                    backgroundColor: "#F9FAFB",
                                                    border: "1px dashed #E5E7EB",
                                                    borderRadius: "5px",
                                                    width: "100%",
                                                    height: "100px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "14px", color: "#616161" }}>
                                                    No events today
                                                </Typography>
                                            </Box>
                                        ) : (
                                            completedEvents.map((item) => (
                                                <Grid key={item.id} size={12}>
                                                    <EventCard
                                                        item={item}
                                                        onViewImage={handleViewClick}
                                                        onPlayVideo={handleVideoClick}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                    />
                                                </Grid>
                                            ))
                                        )}
                                    </Grid>
                                </Box>}
                                {value === 1 && <Box sx={{ px: 1, pt: 1.5 }}>
                                    <Grid container spacing={2}>
                                        {todayEvents.length === 0 ? (
                                            <Box
                                                sx={{
                                                    textAlign: "center",
                                                    mt: 2,
                                                    backgroundColor: "#F9FAFB",
                                                    border: "1px dashed #E5E7EB",
                                                    borderRadius: "5px",
                                                    width: "100%",
                                                    height: "100px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "14px", color: "#616161" }}>
                                                    No events today
                                                </Typography>
                                            </Box>
                                        ) : (
                                            todayEvents.map((item) => (
                                                <Grid key={item.id} size={12}>
                                                    <EventCard
                                                        item={item}
                                                        onViewImage={handleViewClick}
                                                        onPlayVideo={handleVideoClick}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                    />
                                                </Grid>
                                            ))
                                        )}
                                    </Grid>
                                </Box>}
                                {value === 2 && <Box sx={{ px: 1, pt: 1.5 }}>
                                        <Grid container spacing={2}>
                                            {upCommingEvents.length === 0 ? (
                                                <Box
                                                    sx={{
                                                        textAlign: "center",
                                                        mt: 2,
                                                        backgroundColor: "#F9FAFB",
                                                        border: "1px dashed #E5E7EB",
                                                        borderRadius: "5px",
                                                        width: "100%",
                                                        height: "100px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: "14px", color: "#616161" }}>
                                                        No events today
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                upCommingEvents.map((item) => (
                                                    <Grid key={item.id} size={12}>
                                                        <EventCard
                                                            item={item}
                                                            onViewImage={handleViewClick}
                                                            onPlayVideo={handleVideoClick}
                                                            onEdit={handleEdit}
                                                            onDelete={handleDelete}
                                                        />
                                                    </Grid>
                                                ))
                                            )}
                                        </Grid>
                                    
                                </Box>}
                            </Box>
                        </Grid>
                        <Dialog
                            open={openImage}
                            onClose={handleViewImageClose}
                            sx={{
                                '& .MuiPaper-root': {
                                    backgroundColor: 'transparent',
                                    boxShadow: 'none',
                                    borderRadius: 0,
                                    padding: 0,
                                    overflow: 'visible',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '80vw',
                                    height: '80vh',
                                    maxWidth: 'none',
                                },
                            }}
                            BackdropProps={{
                                style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                }}
                            >
                                <img
                                    src={imageUrl}
                                    alt="Popup"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                                <IconButton
                                    onClick={handleViewImageClose}
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        zIndex: 10,
                                        color: "#fff",
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Dialog>
                        <Dialog
                            open={openVideo}
                            onClose={handleVideoClose}
                            sx={{
                                '& .MuiPaper-root': {
                                    backgroundColor: 'transparent',
                                    boxShadow: 'none',
                                    borderRadius: 0,
                                    padding: 0,
                                    overflow: 'visible',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '80vw',
                                    height: '80vh',
                                    maxWidth: 'none',
                                },
                            }}
                            BackdropProps={{
                                style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                }}
                            >
                                <ReactPlayer
                                    url={videoUrl}
                                    width="100%"
                                    height="100%"
                                    playing={false}
                                />
                                <IconButton
                                    onClick={handleVideoClose}
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        zIndex: 10,
                                        color: "#fff",
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Dialog>


                        <Dialog
                            open={createOpen}
                            onClose={() => closeCreateDialog()}
                            maxWidth="md"
                            fullWidth
                            slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
                        >
                            <DialogTitle sx={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                bgcolor: "#FAFAFA", borderBottom: "1px solid #E5E7EB", py: 1.2,
                            }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                    <Box sx={{
                                        width: 32, height: 32, borderRadius: "8px",
                                        bgcolor: "#fff", border: "1px solid #E5E7EB",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <CalendarMonthOutlinedIcon sx={{ color: websiteSettings.mainColor || "#3457D5", fontSize: 18 }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Create Event</Typography>
                                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Schedule a new school calendar entry</Typography>
                                    </Box>
                                </Box>
                                <IconButton size="small" onClick={() => closeCreateDialog()}>
                                    <CloseIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent sx={{ pt: "16px !important" }}>
                                <Box sx={{}}>

                                    <Box>
                                        <Grid container spacing={2}>
                                            <Grid
                                                size={{
                                                    sm: 12,
                                                    xs: 12,
                                                    lg: 6
                                                }}>
                                                <Typography
                                                    sx={{ fontWeight: 500, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                                                >
                                                    Choose Event Color
                                                    <Tooltip
                                                        title={
                                                            <Typography sx={{ fontSize: 12, maxWidth: 200 }}>
                                                                Choose darker colors for better visibility on the calendar.
                                                            </Typography>
                                                        }
                                                        placement="right"
                                                        arrow
                                                    >
                                                        <IconButton size="small" sx={{ p: 0, color: "text.secondary" }}>
                                                            <InfoOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Typography>
                                                <ColorSwatchPicker
                                                    value={pickedColor}
                                                    onChange={(c) => setPickedColor(c)}
                                                />

                                            </Grid>
                                            <Grid
                                                sx={{ display: "flex", alignItems: "center" }}
                                                size={{
                                                    sm: 12,
                                                    xs: 12,
                                                    lg: 6
                                                }}>
                                                <Box >
                                                    <FormControlLabel
                                                        sx={{ pt: 3.5 }}
                                                        control={
                                                            <Checkbox
                                                                checked={eventsValue === "Y"}
                                                                onChange={handleEventsChange}

                                                            />
                                                        }
                                                        label="Add as Important Event"
                                                    />
                                                </Box>
                                            </Grid>
                                            <Grid
                                                size={{
                                                    sm: 12,
                                                    xs: 12,
                                                    lg: 6
                                                }}>
                                                <Typography>
                                                    Start Date <span style={{ color: "#777", fontSize: "13px" }}> (Required)</span>
                                                </Typography>
                                                <TextField
                                                    id="to-date"
                                                    size="small"
                                                    fullWidth
                                                    type="date"
                                                    required
                                                    value={fromDate}
                                                    onChange={handleFromDateChange}
                                                />
                                            </Grid>

                                            {!onlyFrom && (
                                                <Grid
                                                    size={{
                                                        sm: 12,
                                                        xs: 12,
                                                        lg: 6
                                                    }}>
                                                    <Typography>
                                                        Due Date <span style={{ color: "#777", fontSize: "13px" }}> (Required)</span>
                                                    </Typography>
                                                    <TextField
                                                        id="to-date"
                                                        size="small"
                                                        fullWidth
                                                        type="date"
                                                        required
                                                        value={toDate}
                                                        onChange={handleToDateChange}
                                                    />
                                                </Grid>
                                            )}
                                        </Grid>

                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={onlyFrom}
                                                    onChange={handleCheckboxChange}
                                                    color="primary"
                                                    sx={{
                                                        transform: "scale(0.8)",
                                                    }}
                                                />
                                            }
                                            label={
                                                <Typography sx={{ fontSize: "12px" }}>Single Date</Typography>
                                            }
                                            sx={{
                                                mt: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                fontSize: "12px",
                                                width: "120px"
                                            }}
                                        />
                                    </Box>
                                    <Typography sx={{ pt: 1 }}>Event Title <span style={{ color: "#777", fontSize: "13px", }}> (Required)</span></Typography>
                                    <TextField
                                        id="outlined-size-small"
                                        size="small"
                                        fullWidth
                                        required
                                        value={heading}
                                        onChange={handleHeadingChange}
                                    />
                                    <Typography sx={{ fontSize: "12px" }} color="textSecondary">
                                        {`${heading.length}/100`}
                                    </Typography>

                                    <Typography sx={{ pt: 3 }}>Add Description<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                                    <Box sx={{ pr: 1 }}>
                                        <TextareaAutosize
                                            minRows={5}
                                            value={description}
                                            onChange={handleDescription}
                                            style={{
                                                width: '100%',
                                                backgroundColor: "#F6F6F8",
                                                borderRadius: '3px',
                                                fontFamily: "sans-serif",
                                                border: '1px solid #ccc',
                                                fontSize: '16px',
                                                resize: 'none',
                                            }}
                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            width: "100%",
                                            borderRadius: "7px",
                                        }}
                                    >
                                        <Tabs value={activeTab} onChange={handleTabChange}  >
                                            <Tab sx={{ textTransform: "none" }} label="Select Image" />
                                            <Tab sx={{ textTransform: "none" }} label="Add Link" />
                                            <Box sx={{ display: "flex0", justifyContent: "center", width: "100%" }}>
                                                <Typography color="textSecondary" sx={{ mt: 2, textAlign: "right", fontSize: "12px" }}>
                                                    (*Upload either an image or a link)
                                                </Typography>
                                            </Box>

                                        </Tabs>

                                        {activeTab === 0 && (
                                            <Box sx={{ mt: 2, textAlign: "center" }}>
                                                <Box
                                                    {...getRootProps()}
                                                    sx={{
                                                        border: "2px dashed #1976d2",
                                                        borderRadius: "8px",
                                                        p: 1,
                                                        backgroundColor: isDragActive ? "#e3f2fd" : "#e3f2fd",
                                                        textAlign: "center",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <input {...getInputProps()} accept=".jpg, .jpeg, .webp, .png" />
                                                    <UploadFileIcon sx={{ fontSize: 40, color: "#000" }} />
                                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                                        Drag and drop files here, or click to upload.
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Supported formats: JPG, JPEG, WebP, PNG
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                                                        Max file size: 25MB
                                                    </Typography>
                                                </Box>
                                                {uploadedFiles.length > 0 && (
                                                    <Box
                                                        sx={{
                                                            mt: 1,
                                                            display: "flex",
                                                            justifyContent: "flex-start",
                                                            alignItems: "center",
                                                            gap: 2,
                                                        }}
                                                    >
                                                        {/* Selected Image Preview */}
                                                        <Box
                                                            sx={{
                                                                position: "relative",
                                                                width: "100px",
                                                                height: "100px",
                                                                border: "1px solid #ddd",
                                                                borderRadius: "8px",
                                                            }}
                                                        >
                                                            <img
                                                                src={uploadedFiles[0] instanceof File ? URL.createObjectURL(uploadedFiles[0]) : uploadedFiles[0].url || uploadedFiles[0]}
                                                                alt="Selected"
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover",
                                                                }}
                                                            />
                                                            {/* Remove Icon */}
                                                            <IconButton
                                                                sx={{
                                                                    position: "absolute",

                                                                    top: -15,
                                                                    right: -15,
                                                                }}
                                                                onClick={handleImageClose}
                                                            >
                                                                <CancelIcon style={{ backgroundColor: "#777", color: "#fff", borderRadius: "30px" }} />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                )}

                                            </Box>
                                        )}

                                        {activeTab === 1 && (
                                            <Box sx={{ mt: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Paste your link here"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InsertLinkIcon sx={{ mr: 1, color: "text.secondary" }} />
                                                        ),
                                                    }}
                                                    value={pastedLink}
                                                    onChange={handleLinkUpload}
                                                />
                                                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                                                    Paste a YouTube link here.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>


                                    <Box sx={{ mt: 3 }}>
                                        <Grid container spacing={2}>
                                            <Grid
                                                sx={{ display: "flex", justifyContent: "end" }}
                                                size={{
                                                    xs: 6,
                                                    sm: 6,
                                                    md: 6,
                                                    lg: 6
                                                }}>
                                                <Button
                                                    sx={{
                                                        textTransform: 'none',
                                                        width: "80px",
                                                        borderRadius: '30px',
                                                        fontSize: '12px',
                                                        py: 0.2,
                                                        border: '1px solid black',
                                                        color: 'black',
                                                        fontWeight: "600",
                                                    }}
                                                    onClick={() => closeCreateDialog()}>
                                                    Cancel
                                                </Button>
                                            </Grid>

                                            <Dialog open={false} sx={{
                                                '& .MuiPaper-root': {
                                                    width: '60vw',
                                                    minWidth: '300px',
                                                    backgroundColor: '#fff',
                                                    borderRadius: 1,
                                                },
                                            }} >
                                                <Box sx={{ p: 3, backgroundColor: '#fff', }}>

                                                    <Box sx={{
                                                        backgroundColor: '#fff',
                                                        width: "100%",
                                                    }}>
                                                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit School Calendar</Typography>
                                                        <Grid container>
                                                            <Grid
                                                                size={{
                                                                    sm: 12,
                                                                    xs: 12,
                                                                    lg: 6
                                                                }}>
                                                                <Typography
                                                                    sx={{ fontWeight: 500, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                                                                >
                                                                    Pick an event color
                                                                    <Tooltip
                                                                        title={
                                                                            <Typography sx={{ fontSize: 12, maxWidth: 200 }}>
                                                                                Choose darker colors for better visibility on the calendar.
                                                                            </Typography>
                                                                        }
                                                                        placement="right"
                                                                        arrow
                                                                    >
                                                                        <IconButton size="small" sx={{ p: 0, color: "text.secondary" }}>
                                                                            <InfoOutlinedIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Typography>
                                                                <ColorSwatchPicker
                                                                    value={editPickedColor}
                                                                    onChange={(c) => setEditPickedColor(c)}
                                                                />

                                                            </Grid>
                                                            <Grid
                                                                sx={{ display: "flex", alignItems: "center" }}
                                                                size={{
                                                                    sm: 12,
                                                                    xs: 12,
                                                                    lg: 6
                                                                }}>
                                                                <Box >
                                                                    <FormControlLabel
                                                                        sx={{ pt: 3.5 }}
                                                                        control={
                                                                            <Checkbox
                                                                                checked={editEventsValue === "Y"}
                                                                                onChange={handleEditEventsChange}

                                                                            />
                                                                        }
                                                                        label="Important Event"
                                                                    />
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                        <Typography sx={{ pt: 2 }}>Add Heading <span style={{ color: "#777", fontSize: "13px", }}> (Required)</span></Typography>
                                                        <TextField
                                                            id="outlined-size-small"
                                                            size="small"
                                                            fullWidth
                                                            required
                                                            value={editHeading}
                                                            onChange={handleEditHeadingChange}
                                                        />
                                                        <Typography sx={{ fontSize: "12px" }} color="textSecondary">
                                                            {`${heading.length}/100`}
                                                        </Typography>

                                                        <Typography sx={{ pt: 3 }}>Add Description<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                                                        <Box sx={{ pr: 1 }}>
                                                            <TextareaAutosize
                                                                minRows={5}
                                                                value={editDescription}
                                                                onChange={handleEditDescription}
                                                                style={{
                                                                    width: '100%',
                                                                    backgroundColor: "#F6F6F8",
                                                                    fontFamily: "sans-serif",
                                                                    borderRadius: '3px',
                                                                    border: '1px solid #ccc',
                                                                    fontSize: '16px',
                                                                    resize: 'none',
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                width: "100%",
                                                                borderRadius: "7px",
                                                            }}
                                                        >
                                                            <Tabs value={editActiveTab} onChange={handleEditTabChange}  >
                                                                <Tab sx={{ textTransform: "none" }} label="Select Image" />
                                                                <Tab sx={{ textTransform: "none" }} label="Add Link" />
                                                                <Box sx={{ display: "flex0", justifyContent: "center", width: "100%" }}>
                                                                    <Typography color="textSecondary" sx={{ mt: 2, textAlign: "right", fontSize: "12px" }}>
                                                                        (*Upload either an image or a link)
                                                                    </Typography>
                                                                </Box>

                                                            </Tabs>

                                                            {editActiveTab === 0 && (
                                                                <Box sx={{ mt: 2, textAlign: "center" }}>
                                                                    <Box
                                                                        {...getRootPropsAnother()}
                                                                        sx={{
                                                                            border: "2px dashed #4caf50",
                                                                            borderRadius: "8px",
                                                                            p: 1,
                                                                            backgroundColor: isDragActive2 ? "#e8f5e9" : "#f5f5f5",
                                                                            textAlign: "center",
                                                                            cursor: "pointer",
                                                                            mt: 2, // Add spacing between the two dropzones
                                                                        }}
                                                                    >
                                                                        <input {...getInputPropsAnother()} accept=".jpg, .jpeg, .webp, .png" />
                                                                        <UploadFileIcon sx={{ fontSize: 40, color: "#000" }} />
                                                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                                                            Drag and drop files here, or click to upload.
                                                                        </Typography>
                                                                        <Typography variant="caption" color="textSecondary">
                                                                            Supported formats: JPG, JPEG, WebP, PNG
                                                                        </Typography>
                                                                        <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                                                                            Max file size: 25MB
                                                                        </Typography>
                                                                    </Box>
                                                                    {editUploadedFiles.length > 0 && (
                                                                        <Box
                                                                            sx={{
                                                                                mt: 1,
                                                                                display: "flex",
                                                                                justifyContent: "flex-start",
                                                                                alignItems: "center",
                                                                                gap: 2,
                                                                            }}
                                                                        >
                                                                            <Box
                                                                                sx={{
                                                                                    position: "relative",
                                                                                    width: "100px",
                                                                                    height: "100px",
                                                                                    border: "1px solid #ddd",
                                                                                    borderRadius: "8px",
                                                                                    overflow: "hidden",
                                                                                    backgroundColor: "#f5f5f5",
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        editUploadedFiles[0] instanceof File
                                                                                            ? URL.createObjectURL(editUploadedFiles[0])
                                                                                            : editUploadedFiles[0]?.url || editUploadedFiles[0]
                                                                                    }
                                                                                    alt="Selected"
                                                                                    style={{
                                                                                        width: "100%",
                                                                                        height: "100%",
                                                                                        objectFit: "cover",
                                                                                    }}
                                                                                />

                                                                                <IconButton
                                                                                    sx={{
                                                                                        position: "absolute",
                                                                                        top: 5,
                                                                                        right: 5,
                                                                                        zIndex: 10,
                                                                                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                                                                                        color: "#fff",
                                                                                        borderRadius: "50%",
                                                                                        width: "24px",
                                                                                        height: "24px",
                                                                                        display: "flex",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "center",
                                                                                    }}
                                                                                    onClick={handleImageEditClose}
                                                                                >
                                                                                    <CancelIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Box>
                                                                        </Box>
                                                                    )}

                                                                    {fetchedImage && (
                                                                        <Box
                                                                            sx={{
                                                                                mt: 1,
                                                                                display: "flex",
                                                                                justifyContent: "flex-start",
                                                                                alignItems: "center",
                                                                                gap: 2,
                                                                            }}
                                                                        >
                                                                            <Box
                                                                                sx={{
                                                                                    position: "relative",
                                                                                    width: "100px",
                                                                                    height: "100px",
                                                                                    border: "1px solid #ddd",
                                                                                    borderRadius: "8px",
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    src={fetchedImage}
                                                                                    alt="Selected"
                                                                                    style={{
                                                                                        width: "100%",
                                                                                        height: "100%",
                                                                                        objectFit: "cover",
                                                                                    }}
                                                                                />
                                                                                <IconButton
                                                                                    sx={{
                                                                                        position: "absolute",

                                                                                        top: -15,
                                                                                        right: -15,
                                                                                    }}
                                                                                    onClick={handleFetchedCloseImage}
                                                                                >
                                                                                    <CancelIcon style={{ backgroundColor: "#777", color: "#fff", borderRadius: "30px" }} />
                                                                                </IconButton>
                                                                            </Box>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            )}

                                                            {editActiveTab === 1 && (
                                                                <Box sx={{ mt: 2 }}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        placeholder="Paste your link here"
                                                                        InputProps={{
                                                                            startAdornment: (
                                                                                <InsertLinkIcon sx={{ mr: 1, color: "text.secondary" }} />
                                                                            ),
                                                                        }}
                                                                        value={editPastedLink}
                                                                        onChange={handleEditLinkUpload}
                                                                    />
                                                                    <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                                                                        Paste a YouTube link here.
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                        <DialogActions sx={{
                                                            justifyContent: 'center',
                                                            backgroundColor: '#fff',
                                                            pt: 2
                                                        }}>
                                                            <Button
                                                                onClick={() => handleCloseEdit(false)}
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
                                                                onClick={() => handleCloseEdit(true)}
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
                                                                Update
                                                            </Button>
                                                        </DialogActions>
                                                    </Box>
                                                </Box>
                                            </Dialog>


                                            <Grid
                                                size={{
                                                    xs: 6,
                                                    sm: 6,
                                                    md: 6,
                                                    lg: 6
                                                }}>
                                                <Button
                                                    sx={{
                                                        textTransform: 'none',
                                                        backgroundColor: websiteSettings.mainColor,
                                                        width: "80px",
                                                        borderRadius: '30px',
                                                        fontSize: '12px',
                                                        py: 0.2,
                                                        color: websiteSettings.textColor,
                                                        fontWeight: "600",
                                                    }}
                                                    onClick={() => { handlePost('post'); setCreateOpen(false); }}>
                                                    Publish
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                </Box>
                            </DialogContent>
                        </Dialog>
                    </Grid >

                </Box >
            }
            {
                userType === "teacher" &&
                <Box sx={{ height: "83vh", overflowY: "auto" }}>
                    <Grid
                        container
                        justifyContent="center"
                        sx={{
                            height: "100%",
                        }}
                    >
                        <Grid
                            sx={{
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            size={{
                                sm: 12,
                                xs: 12,
                                lg: 6
                            }}>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <Calendar
                                    numberOfMonths={1}
                                    highlightToday
                                    showOtherDays={false}
                                    onMonthChange={handleMonthChange}
                                    onChange={handleDateChange}
                                    style={{ boxShadow: "none", backgroundColor: "#F6F6F8" }}
                                    mapDays={({ date }) => {
                                        let style = {};
                                        const formattedDate = date.format("YYYY-MM-DD");
                                        const eventColor = availableSlots.get(formattedDate);
                                        const isSelected = selectedDateKey === formattedDate;

                                        if (eventColor) {
                                            style = {
                                                backgroundColor: eventColor,
                                                color: "#fff",
                                                borderRadius: "50%",
                                                fontWeight: "bold",
                                            };
                                        }

                                        if (isSelected) {
                                            style = {
                                                ...style,
                                                outline: `2px solid ${PRIMARY_DARK}`,
                                                outlineOffset: "1px",
                                                borderRadius: "50%",
                                                fontWeight: "bold",
                                            };
                                        }

                                        return { style };
                                    }}
                                    className="teal"
                                />
                            </Box>
                            <Box p={2}>

                            </Box>
                        </Grid>
                        <Dialog
                            open={openImage}
                            onClose={handleViewImageClose}
                            sx={{
                                '& .MuiPaper-root': {
                                    backgroundColor: 'transparent',
                                    boxShadow: 'none',
                                    borderRadius: 0,
                                    padding: 0,
                                    overflow: 'visible',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '80vw',
                                    height: '80vh',
                                    maxWidth: 'none',
                                },
                            }}
                            BackdropProps={{
                                style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                }}
                            >
                                <img
                                    src={imageUrl}
                                    alt="Popup"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                                <IconButton
                                    onClick={handleViewImageClose}
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        zIndex: 10,
                                        color: "#fff",
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Dialog>
                        <Dialog
                            open={openVideo}
                            onClose={handleVideoClose}
                            sx={{
                                '& .MuiPaper-root': {
                                    backgroundColor: 'transparent',
                                    boxShadow: 'none',
                                    borderRadius: 0,
                                    padding: 0,
                                    overflow: 'visible',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '80vw',
                                    height: '80vh',
                                    maxWidth: 'none',
                                },
                            }}
                            BackdropProps={{
                                style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                }}
                            >
                                <ReactPlayer
                                    url={videoUrl}
                                    width="100%"
                                    height="100%"
                                    playing={false}
                                />
                                <IconButton
                                    onClick={handleVideoClose}
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        zIndex: 10,
                                        color: "#fff",
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Dialog>


                        <Grid
                            sx={{ borderLeft: 1, borderColor: "divider", pt: 3 }}
                            size={{
                                sm: 12,
                                xs: 12,
                                lg: 6
                            }}>

                            <Box sx={{ width: '100%', pb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', }}>
                                    <Tabs textColor={websiteSettings.mainColor}
                                        indicatorColor={websiteSettings.mainColor}
                                        sx={{
                                            "& .MuiTabs-indicator": { backgroundColor: websiteSettings.mainColor },
                                            "& .MuiTab-root": { color: "#777" },
                                            "& .Mui-selected": { color: "#000" }
                                        }}
                                        value={value} onChange={handleChange} aria-label="basic tabs example">
                                        <Tab sx={{ textTransform: "none", fontWeight: "600" }} label="Completed Events" />
                                        <Tab sx={{ textTransform: "none", fontWeight: "600" }} label="Today's Events" />
                                        <Tab sx={{ textTransform: "none", fontWeight: "600" }} label="Upcoming Events" />
                                    </Tabs>
                                </Box>
                                {value === 0 && <Box px={3}>
                                    <Grid
                                        container
                                        spacing={2}
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            pt: 1
                                        }}
                                    >
                                        <Grid size={12}>
                                            <Box
                                                sx={{
                                                    height: "72vh",
                                                    overflowY: "auto",
                                                    px: 2,
                                                }}
                                            >
                                                {completedEvents.length === 0 ? (
                                                    <Box
                                                        sx={{
                                                            textAlign: "center",
                                                            mt: 2,
                                                            backgroundColor: "#F9FAFB",
                                                            border: "1px dashed #E5E7EB",
                                                            borderRadius: "5px",
                                                            width: "100%",
                                                            height: "100px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Typography sx={{ fontSize: "14px", color: "#616161" }}>
                                                            No events today
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Grid container spacing={2}>
                                                        {completedEvents.map((item) => (
                                                            <Grid key={item.id} size={12}>
                                                                <EventCard
                                                                    item={item}
                                                                    onViewImage={handleViewClick}
                                                                    onPlayVideo={handleVideoClick}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>

                                </Box>}
                                {value === 1 && <Box sx={{ px: 1, pt: 1.5 }}>
                                    <Grid
                                        container
                                        spacing={2}
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            pt: 1
                                        }}
                                    >
                                        <Grid size={12}>
                                            <Box
                                                sx={{
                                                    height: "72vh",
                                                    overflowY: "auto",
                                                    px: 2,
                                                }}
                                            >
                                                {todayEvents.length === 0 ? (
                                                    <Box
                                                        sx={{
                                                            textAlign: "center",
                                                            mt: 2,
                                                            backgroundColor: "#F9FAFB",
                                                            border: "1px dashed #E5E7EB",
                                                            borderRadius: "5px",
                                                            width: "100%",
                                                            height: "100px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Typography sx={{ fontSize: "14px", color: "#616161" }}>
                                                            No events today
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Grid container spacing={2}>
                                                        {todayEvents.map((item) => (
                                                            <Grid key={item.id} size={12}>
                                                                <EventCard
                                                                    item={item}
                                                                    onViewImage={handleViewClick}
                                                                    onPlayVideo={handleVideoClick}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>

                                </Box>}
                                {value === 2 && <Box sx={{ px: 1, pt: 1.5 }}>
                                    <Grid
                                        container
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            pt: 1
                                        }}
                                        spacing={2}
                                    >
                                        <Grid size={12}>
                                            <Box sx={{
                                                px: 2,
                                                height: "72vh",
                                                overflowY: "auto",
                                            }}>

                                                {upCommingEvents.length === 0 ? (
                                                    <Box
                                                        sx={{
                                                            textAlign: "center",
                                                            mt: 2,
                                                            backgroundColor: "#F9FAFB",
                                                            border: "1px dashed #E5E7EB",
                                                            borderRadius: "5px",
                                                            width: "100%",
                                                            height: "100px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Typography sx={{ fontSize: "14px", color: "#616161" }}>
                                                            No events today
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Grid container spacing={2}>
                                                        {upCommingEvents.map((item) => (
                                                            <Grid key={item.id} size={12}>
                                                                <EventCard
                                                                    item={item}
                                                                    onViewImage={handleViewClick}
                                                                    onPlayVideo={handleVideoClick}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>}
                            </Box>
                        </Grid>
                    </Grid>

                </Box>
            }

            {/* Delete confirmation — root-level so it works from any context */}
            <Dialog open={openAlert} onClose={() => setOpenAlert(false)}>
                <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>
                    <Box sx={{ textAlign: 'center', backgroundColor: '#fff', p: 3, width: "70%" }}>
                        <Typography sx={{ fontSize: "20px" }}>Do you really want to delete this?</Typography>
                        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2 }}>
                            <Button
                                onClick={() => handleCloseDialogDelete(false)}
                                sx={{
                                    textTransform: 'none', width: "80px", borderRadius: '30px',
                                    fontSize: '16px', py: 0.2,
                                    border: '1px solid black', color: 'black',
                                }}
                            >
                                No
                            </Button>
                            <Button
                                onClick={() => handleCloseDialogDelete(true)}
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    width: "90px", borderRadius: '30px',
                                    fontSize: '16px', py: 0.2,
                                    color: websiteSettings.textColor,
                                }}
                            >
                                Yes
                            </Button>
                        </DialogActions>
                    </Box>
                </Box>
            </Dialog>

            {/* Edit confirmation — root-level so it works from any context */}
            <Dialog open={openEditAlert} onClose={() => setOpenEditAlert(false)}>
                <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>
                    <Box sx={{ textAlign: 'center', backgroundColor: '#fff', p: 3, width: "70%" }}>
                        <Typography sx={{ fontSize: "20px" }}>Do you really want to make changes to this event?</Typography>
                        <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2 }}>
                            <Button
                                onClick={() => handleEditCloseDialog(false)}
                                sx={{
                                    textTransform: 'none', width: "80px", borderRadius: '30px',
                                    fontSize: '16px', py: 0.2,
                                    border: '1px solid black', color: 'black',
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleEditCloseDialog(true)}
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: websiteSettings.mainColor,
                                    width: "80px", borderRadius: '30px',
                                    fontSize: '16px', py: 0.2,
                                    color: websiteSettings.textColor,
                                }}
                            >
                                Edit
                            </Button>
                        </DialogActions>
                    </Box>
                </Box>
            </Dialog>

            {/* ─── Edit Event Dialog — root-level (full create-style form for editing) ─── */}
            <Dialog
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                maxWidth="md"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
            >
                <DialogTitle sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    bgcolor: "#FAFAFA", borderBottom: "1px solid #E5E7EB", py: 1.2,
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: "8px",
                            bgcolor: "#fff", border: "1px solid #E5E7EB",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <CalendarMonthOutlinedIcon sx={{ color: websiteSettings.mainColor || "#3457D5", fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Edit Event</Typography>
                            <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Update the event details and save changes</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setOpenEdit(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: "16px !important" }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, lg: 6 }}>
                            <Typography sx={{ fontWeight: 500, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                Choose Event Color
                                <Tooltip
                                    title={<Typography sx={{ fontSize: 12, maxWidth: 200 }}>Choose darker colors for better visibility on the calendar.</Typography>}
                                    placement="right" arrow
                                >
                                    <IconButton size="small" sx={{ p: 0, color: "text.secondary" }}>
                                        <InfoOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Typography>
                            <ColorSwatchPicker
                                value={editPickedColor}
                                onChange={(c) => setEditPickedColor(c)}
                            />
                        </Grid>
                        <Grid sx={{ display: "flex", alignItems: "center" }} size={{ xs: 12, lg: 6 }}>
                            <FormControlLabel
                                sx={{ pt: 3.5 }}
                                control={
                                    <Checkbox
                                        checked={editEventsValue === "Y"}
                                        onChange={handleEditEventsChange}
                                    />
                                }
                                label="Mark as Important Event"
                            />
                        </Grid>
                    </Grid>

                    <Typography sx={{ pt: 2 }}>Heading <span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                    <TextField
                        size="small" fullWidth required
                        value={editHeading}
                        onChange={handleEditHeadingChange}
                    />
                    <Typography sx={{ fontSize: "12px" }} color="textSecondary">{`${editHeading.length}/100`}</Typography>

                    <Typography sx={{ pt: 2 }}>Description<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                    <Box sx={{ pr: 1 }}>
                        <TextareaAutosize
                            minRows={5}
                            value={editDescription}
                            onChange={handleEditDescription}
                            style={{
                                width: "100%",
                                backgroundColor: "#F6F6F8",
                                fontFamily: "sans-serif",
                                borderRadius: "3px",
                                border: "1px solid #ccc",
                                fontSize: "16px",
                                resize: "none",
                                padding: "8px",
                            }}
                        />
                    </Box>

                    <Box sx={{ width: "100%", borderRadius: "7px", mt: 1 }}>
                        <Tabs value={editActiveTab} onChange={handleEditTabChange}>
                            <Tab sx={{ textTransform: "none" }} label="Select Image" />
                            <Tab sx={{ textTransform: "none" }} label="Add Link" />
                        </Tabs>

                        {editActiveTab === 0 && (
                            <Box sx={{ mt: 2, textAlign: "center" }}>
                                <Box
                                    {...getRootPropsAnother()}
                                    sx={{
                                        border: "2px dashed #4caf50",
                                        borderRadius: "8px",
                                        p: 1,
                                        backgroundColor: isDragActive2 ? "#e8f5e9" : "#f5f5f5",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        mt: 1,
                                    }}
                                >
                                    <input {...getInputPropsAnother()} accept=".jpg, .jpeg, .webp, .png" />
                                    <UploadFileIcon sx={{ fontSize: 40, color: "#000" }} />
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Drag and drop files here, or click to upload.
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Supported formats: JPG, JPEG, WebP, PNG
                                    </Typography>
                                </Box>
                                {editUploadedFiles.length > 0 && (
                                    <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 2 }}>
                                        <Box sx={{
                                            position: "relative", width: "100px", height: "100px",
                                            border: "1px solid #ddd", borderRadius: "8px",
                                            overflow: "hidden", backgroundColor: "#f5f5f5",
                                        }}>
                                            <img
                                                src={
                                                    editUploadedFiles[0] instanceof File
                                                        ? URL.createObjectURL(editUploadedFiles[0])
                                                        : editUploadedFiles[0]?.url || editUploadedFiles[0]
                                                }
                                                alt="Selected"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                            <IconButton
                                                sx={{
                                                    position: "absolute", top: 5, right: 5, zIndex: 10,
                                                    backgroundColor: "rgba(0,0,0,0.6)", color: "#fff",
                                                    borderRadius: "50%", width: "24px", height: "24px",
                                                }}
                                                onClick={handleImageEditClose}
                                            >
                                                <CancelIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                )}
                                {fetchedImage && (
                                    <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 2 }}>
                                        <Box sx={{
                                            position: "relative", width: "100px", height: "100px",
                                            border: "1px solid #ddd", borderRadius: "8px",
                                        }}>
                                            <img
                                                src={fetchedImage}
                                                alt="Selected"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                            <IconButton
                                                sx={{ position: "absolute", top: -15, right: -15 }}
                                                onClick={handleFetchedCloseImage}
                                            >
                                                <CancelIcon style={{ backgroundColor: "#777", color: "#fff", borderRadius: "30px" }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {editActiveTab === 1 && (
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth size="small"
                                    placeholder="Paste your link here"
                                    InputProps={{
                                        startAdornment: <InsertLinkIcon sx={{ mr: 1, color: "text.secondary" }} />,
                                    }}
                                    value={editPastedLink}
                                    onChange={handleEditLinkUpload}
                                />
                                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                                    Paste a YouTube link here.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 1.5, gap: 1, borderTop: "1px solid #E5E7EB" }}>
                    <Button
                        onClick={() => handleCloseEdit(false)}
                        sx={{
                            textTransform: "none", width: "90px", borderRadius: "30px",
                            fontSize: "14px", py: 0.4,
                            border: "1px solid #ccc", color: "#111", fontWeight: 600,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleCloseEdit(true)}
                        sx={{
                            textTransform: "none",
                            backgroundColor: "#000",
                            width: "100px", borderRadius: "30px",
                            fontSize: "14px", py: 0.4,
                            color: "#fff", fontWeight: 700,
                            "&:hover": { backgroundColor: "#1a1a1a" },
                        }}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}
