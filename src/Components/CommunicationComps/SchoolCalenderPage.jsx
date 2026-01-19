import { Autocomplete, Box, Button, Checkbox, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Switch, Tab, Tabs, TextareaAutosize, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
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
    const [pickedColor, setPickedColor] = useState("rgba(0, 0, 0, 1)");
    const [editPickedColor, setEditPickedColor] = useState("rgba(0, 0, 0, 1)");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

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
            setPickedColor("rgba(0, 0, 0, 1)")
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

    const handleDateChange = (newDate) => {
        console.log("Selected Date: ", newDate?.format("YYYY-MM-DD"));
        setSelectedDate(newDate);
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
                <Grid container sx={{ py: 1.5 }}>
                    <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                            lg: 6
                        }}>
                        <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>School Calendar</Typography>
                    </Grid>

                    <Grid
                        sx={{ display: "flex", justifyContent: "end", alignItems: "center", px: 1 }}
                        size={{
                            lg: 6
                        }}>

                    </Grid>
                </Grid>
            </Box>
            {userType !== "teacher" &&
                <Box sx={{
                    height: {
                        xs: "100%",
                        lg: "83vh",
                    },
                    overflowY: "auto"
                }}>
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
                            }}
                            size={{
                                sm: 12,
                                xs: 12,
                                lg: 6
                            }}>
                            <Box sx={{ display: "flex", justifyContent: "center", zIndex: 1, }}>
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

                                        if (eventColor) {
                                            style = {
                                                backgroundColor: eventColor,
                                                color: "#fff",
                                                borderRadius: "50%",
                                                fontWeight: "bold",
                                            };
                                        }

                                        return { style };
                                    }}
                                    className="teal"
                                />
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', }}>
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
                                                    height: "39vh",
                                                    overflowY: "auto",
                                                    px: 2,
                                                }}
                                            >
                                                {completedEvents.length === 0 ? (
                                                    <Box
                                                        sx={{
                                                            textAlign: "center",
                                                            mt: 2,
                                                            backgroundColor: "rgba(219, 71, 0, 0.1)",
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
                                                                <Box
                                                                    sx={{
                                                                        position: "relative",
                                                                        backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                                        display: "flex",
                                                                        py: 2,
                                                                        width: "95%",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        borderRadius: "5px",
                                                                        padding: "0 10px",
                                                                        minHeight: "100px",
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: "30px",
                                                                                height: "30px",
                                                                                backgroundColor: item.eventColor,
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                                color: "#fff",
                                                                                borderRadius: "50%",
                                                                                marginLeft: "-23px",
                                                                                fontWeight: "600",
                                                                            }}
                                                                        >
                                                                            {item.from}
                                                                        </Box>
                                                                        {item.from !== item.to && (
                                                                            <>
                                                                                <Typography sx={{ px: 0.5 }}>to</Typography>
                                                                                <Box
                                                                                    sx={{
                                                                                        width: "30px",
                                                                                        height: "30px",
                                                                                        backgroundColor: item.eventColor,
                                                                                        display: "flex",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "center",
                                                                                        color: "#fff",
                                                                                        borderRadius: "50%",
                                                                                        fontWeight: "600",
                                                                                    }}
                                                                                >
                                                                                    {item.to}
                                                                                </Box>
                                                                            </>
                                                                        )}
                                                                    </Box>

                                                                    <Box p={1} sx={{ flex: 1 }}>
                                                                        <Typography sx={{ fontSize: "8px", color: "#616161", textDecoration: "underline" }}>
                                                                            {item.headLine}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: "12px", color: "#616161", pb: 2 }}>
                                                                            {item.description}
                                                                        </Typography>
                                                                    </Box>
                                                                    {item.filetype !== "empty" &&
                                                                        <Box>
                                                                            {item.filetype === "image" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleViewClick(item.filepath)}
                                                                                >
                                                                                    View Image
                                                                                </Button>
                                                                            }
                                                                            {item.filetype === "link" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleVideoClick(item.filepath)}
                                                                                >
                                                                                    Play Video
                                                                                </Button>
                                                                            }
                                                                        </Box>
                                                                    }
                                                                    <Box
                                                                        sx={{
                                                                            position: "absolute",
                                                                            bottom: "3px",
                                                                            right: "3px",
                                                                            display: "flex",
                                                                            gap: 1,
                                                                        }}
                                                                    >

                                                                        <Button
                                                                            variant="outlined"
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                padding: '0px 0',
                                                                                borderRadius: '30px',
                                                                                fontSize: '8px',
                                                                                border: '1px solid black',
                                                                                color: 'black',
                                                                                fontWeight: "600",
                                                                                backgroundColor: "#fff"
                                                                            }}
                                                                            onClick={() => handleEdit(item.id)}
                                                                        >
                                                                            <EditOutlinedIcon style={{ fontSize: "13px" }} />
                                                                            &nbsp;Edit
                                                                        </Button>
                                                                        <IconButton
                                                                            sx={{
                                                                                border: "1px solid black",
                                                                                width: "18px",
                                                                                height: "18px",
                                                                                backgroundColor: "#fff",
                                                                            }}
                                                                            onClick={() => handleDelete(item.id)}
                                                                        >
                                                                            <DeleteOutlineOutlinedIcon
                                                                                style={{ fontSize: "12px", color: "#000" }}
                                                                            />
                                                                        </IconButton>
                                                                    </Box>
                                                                </Box>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>

                                </Box>}
                                {value === 1 && <Box px={3}>
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
                                                    height: "36vh",
                                                    overflowY: "auto",
                                                    px: 2,
                                                }}
                                            >
                                                {todayEvents.length === 0 ? (
                                                    <Box
                                                        sx={{
                                                            textAlign: "center",
                                                            mt: 2,
                                                            backgroundColor: "rgba(219, 71, 0, 0.1)",
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
                                                                <Box
                                                                    sx={{
                                                                        position: "relative",
                                                                        backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                                        display: "flex",
                                                                        py: 2,
                                                                        width: "95%",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        borderRadius: "5px",
                                                                        padding: "0 10px",
                                                                        minHeight: "100px",
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: "30px",
                                                                                height: "30px",
                                                                                backgroundColor: item.eventColor,
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                                color: "#fff",
                                                                                borderRadius: "50%",
                                                                                marginLeft: "-23px",
                                                                                fontWeight: "600",
                                                                            }}
                                                                        >
                                                                            {item.from}
                                                                        </Box>
                                                                        {item.from !== item.to && (
                                                                            <>
                                                                                <Typography sx={{ px: 0.5 }}>to</Typography>
                                                                                <Box
                                                                                    sx={{
                                                                                        width: "30px",
                                                                                        height: "30px",
                                                                                        backgroundColor: item.eventColor,
                                                                                        display: "flex",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "center",
                                                                                        color: "#fff",
                                                                                        borderRadius: "50%",
                                                                                        fontWeight: "600",
                                                                                    }}
                                                                                >
                                                                                    {item.to}
                                                                                </Box>
                                                                            </>
                                                                        )}
                                                                    </Box>

                                                                    <Box p={1} sx={{ flex: 1 }}>
                                                                        <Typography sx={{ fontSize: "8px", color: "#616161", textDecoration: "underline" }}>
                                                                            {item.headLine}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: "12px", color: "#616161", pb: 2 }}>
                                                                            {item.description}
                                                                        </Typography>
                                                                    </Box>
                                                                    {item.filetype !== "empty" &&
                                                                        <Box>
                                                                            {item.filetype === "image" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleViewClick(item.filepath)}
                                                                                >
                                                                                    View Image
                                                                                </Button>
                                                                            }
                                                                            {item.filetype === "link" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleVideoClick(item.filepath)}
                                                                                >
                                                                                    Play Video
                                                                                </Button>
                                                                            }
                                                                        </Box>
                                                                    }
                                                                    <Box
                                                                        sx={{
                                                                            position: "absolute",
                                                                            bottom: "3px",
                                                                            right: "3px",
                                                                            display: "flex",
                                                                            gap: 1,
                                                                        }}
                                                                    >

                                                                        <Button
                                                                            variant="outlined"
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                padding: '0px 0',
                                                                                borderRadius: '30px',
                                                                                fontSize: '8px',
                                                                                border: '1px solid black',
                                                                                color: 'black',
                                                                                fontWeight: "600",
                                                                                backgroundColor: "#fff"
                                                                            }}
                                                                            onClick={() => handleEdit(item.id)}
                                                                        >
                                                                            <EditOutlinedIcon style={{ fontSize: "13px" }} />
                                                                            &nbsp;Edit
                                                                        </Button>
                                                                        <IconButton
                                                                            sx={{
                                                                                border: "1px solid black",
                                                                                width: "18px",
                                                                                height: "18px",
                                                                                backgroundColor: "#fff",
                                                                            }}
                                                                            onClick={() => handleDelete(item.id)}
                                                                        >
                                                                            <DeleteOutlineOutlinedIcon
                                                                                style={{ fontSize: "12px", color: "#000" }}
                                                                            />
                                                                        </IconButton>
                                                                    </Box>
                                                                </Box>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>

                                </Box>}
                                {value === 2 && <Box px={3}>
                                    <Grid
                                        container
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            pt: 1
                                        }}
                                    >
                                        <Grid size={12}>
                                            <Box sx={{
                                                px: 2,
                                                height: "36vh",
                                                overflowY: "auto",
                                            }}>

                                                {upCommingEvents.length === 0 ? (
                                                    <Box
                                                        sx={{
                                                            textAlign: "center",
                                                            mt: 2,
                                                            backgroundColor: "rgba(219, 71, 0, 0.1)",
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
                                                                <Box
                                                                    sx={{
                                                                        position: "relative",
                                                                        backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                                        display: "flex",
                                                                        py: 2,
                                                                        width: "95%",
                                                                        justifyContent: "flex-start",
                                                                        alignItems: "center",
                                                                        borderRadius: "5px",
                                                                        padding: "0 10px",
                                                                        minHeight: "100px",
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: "30px",
                                                                                height: "30px",
                                                                                backgroundColor: item.eventColor,
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                                color: "#fff",
                                                                                borderRadius: "50%",
                                                                                marginLeft: "-23px",
                                                                                fontWeight: "600",
                                                                            }}
                                                                        >
                                                                            {item.from}
                                                                        </Box>
                                                                        {item.from !== item.to && (
                                                                            <>
                                                                                <Typography sx={{ px: 0.5 }}>to</Typography>
                                                                                <Box
                                                                                    sx={{
                                                                                        width: "30px",
                                                                                        height: "30px",
                                                                                        backgroundColor: item.eventColor,
                                                                                        display: "flex",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "center",
                                                                                        color: "#fff",
                                                                                        borderRadius: "50%",
                                                                                        fontWeight: "600",
                                                                                    }}
                                                                                >
                                                                                    {item.to}
                                                                                </Box>
                                                                            </>
                                                                        )}
                                                                    </Box>

                                                                    <Box p={1} sx={{ flex: 1 }}>
                                                                        <Typography sx={{ fontSize: "8px", color: "#616161", textDecoration: "underline" }}>
                                                                            {item.headLine}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: "12px", color: "#616161", pb: 2 }}>
                                                                            {item.description}
                                                                        </Typography>
                                                                    </Box>
                                                                    {item.filetype !== "empty" &&
                                                                        <Box>
                                                                            {item.filetype === "image" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleViewClick(item.filepath)}
                                                                                >
                                                                                    View Image
                                                                                </Button>
                                                                            }
                                                                            {item.filetype === "link" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleVideoClick(item.filepath)}
                                                                                >
                                                                                    Play Video
                                                                                </Button>
                                                                            }
                                                                        </Box>
                                                                    }
                                                                    <Box
                                                                        sx={{
                                                                            position: "absolute",
                                                                            bottom: "3px",
                                                                            right: "3px",
                                                                            display: "flex",
                                                                            gap: 1,
                                                                        }}
                                                                    >

                                                                        <Button
                                                                            variant="outlined"
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                padding: '0px 0',
                                                                                borderRadius: '30px',
                                                                                fontSize: '8px',
                                                                                border: '1px solid black',
                                                                                color: 'black',
                                                                                fontWeight: "600",
                                                                                backgroundColor: "#fff"
                                                                            }}
                                                                            onClick={() => handleEdit(item.id)}
                                                                        >
                                                                            <EditOutlinedIcon style={{ fontSize: "13px" }} />
                                                                            &nbsp;Edit
                                                                        </Button>
                                                                        <IconButton
                                                                            sx={{
                                                                                border: "1px solid black",
                                                                                width: "18px",
                                                                                height: "18px",
                                                                                backgroundColor: "#fff",
                                                                            }}
                                                                            onClick={() => handleDelete(item.id)}
                                                                        >
                                                                            <DeleteOutlineOutlinedIcon
                                                                                style={{ fontSize: "12px", color: "#000" }}
                                                                            />
                                                                        </IconButton>
                                                                    </Box>
                                                                </Box>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>}
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
                            sx={{ p: 2, borderLeft: "1px solid #EBEBEB" }}
                            size={{
                                sm: 12,
                                xs: 12,
                                lg: 6
                            }}>
                            <Typography sx={{ color: "#686868", pt: 1 }}>Add Events</Typography>
                            <Box>
                                <hr style={{ color: "#EBEBEB" }} />
                            </Box>
                            <Box sx={{ border: "1px solid #EBEBEB", p: 2, borderRadius: "7px", mt: 2, height: "68vh", overflowY: "auto" }}>

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
                                            <MuiColorInput
                                                value={pickedColor}
                                                onChange={handleColorChange}
                                                inputProps={{
                                                    readOnly: true,
                                                    style: {
                                                        height: '40px',
                                                        padding: '10px 14px',
                                                        boxSizing: 'border-box',
                                                    }
                                                }}
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
                                                onClick={handleCancelClick}>
                                                Cancel
                                            </Button>
                                        </Grid>

                                        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} sx={{
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
                                                            <MuiColorInput
                                                                value={editPickedColor}
                                                                onChange={handleEditColorChange}
                                                                inputProps={{
                                                                    readOnly: true,
                                                                    style: {
                                                                        height: '40px',
                                                                        padding: '10px 14px',
                                                                        boxSizing: 'border-box',
                                                                    }
                                                                }}
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

                                        <Dialog open={openAlert} onClose={() => setOpenAlert(false)}>
                                            <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                                                <Box sx={{
                                                    textAlign: 'center',
                                                    backgroundColor: '#fff',
                                                    p: 3,
                                                    width: "70%",
                                                }}>

                                                    <Typography sx={{ fontSize: "20px" }}> Do you really want to delete this?</Typography>
                                                    <DialogActions sx={{
                                                        justifyContent: 'center',
                                                        backgroundColor: '#fff',
                                                        pt: 2
                                                    }}>
                                                        <Button
                                                            onClick={() => handleCloseDialogDelete(false)}
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
                                                            onClick={() => handleCloseDialogDelete(true)}
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
                                                            Yes
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
                                                        changes to this event?</Typography>
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
                                                onClick={() => handlePost('post')}>
                                                Publish
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>

                            </Box>
                        </Grid>
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

                                        if (eventColor) {
                                            style = {
                                                backgroundColor: eventColor,
                                                color: "#fff",
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
                                                            backgroundColor: "rgba(219, 71, 0, 0.1)",
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
                                                                <Box
                                                                    sx={{
                                                                        position: "relative",
                                                                        backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                                        display: "flex",
                                                                        py: 2,
                                                                        width: "95%",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        borderRadius: "5px",
                                                                        padding: "0 10px",
                                                                        minHeight: "100px",
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: "30px",
                                                                                height: "30px",
                                                                                backgroundColor: item.eventColor,
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                                color: "#fff",
                                                                                borderRadius: "50%",
                                                                                marginLeft: "-23px",
                                                                                fontWeight: "600",
                                                                            }}
                                                                        >
                                                                            {item.from}
                                                                        </Box>
                                                                        {item.from !== item.to && (
                                                                            <>
                                                                                <Typography sx={{ px: 0.5 }}>to</Typography>
                                                                                <Box
                                                                                    sx={{
                                                                                        width: "30px",
                                                                                        height: "30px",
                                                                                        backgroundColor: item.eventColor,
                                                                                        display: "flex",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "center",
                                                                                        color: "#fff",
                                                                                        borderRadius: "50%",
                                                                                        fontWeight: "600",
                                                                                    }}
                                                                                >
                                                                                    {item.to}
                                                                                </Box>
                                                                            </>
                                                                        )}
                                                                    </Box>

                                                                    <Box p={1} sx={{ flex: 1 }}>
                                                                        <Typography sx={{ fontSize: "8px", color: "#616161", textDecoration: "underline" }}>
                                                                            {item.headLine}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: "12px", color: "#616161", pb: 2 }}>
                                                                            {item.description}
                                                                        </Typography>
                                                                    </Box>
                                                                    {item.filetype !== "empty" &&
                                                                        <Box>
                                                                            {item.filetype === "image" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleViewClick(item.filepath)}
                                                                                >
                                                                                    View Image
                                                                                </Button>
                                                                            }
                                                                            {item.filetype === "link" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleVideoClick(item.filepath)}
                                                                                >
                                                                                    Play Video
                                                                                </Button>
                                                                            }
                                                                        </Box>
                                                                    }
                                                                </Box>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>

                                </Box>}
                                {value === 1 && <Box px={3}>
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
                                                            backgroundColor: "rgba(219, 71, 0, 0.1)",
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
                                                                <Box
                                                                    sx={{
                                                                        position: "relative",
                                                                        backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                                        display: "flex",
                                                                        py: 2,
                                                                        width: "95%",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        borderRadius: "5px",
                                                                        padding: "0 10px",
                                                                        minHeight: "100px",
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: "30px",
                                                                                height: "30px",
                                                                                backgroundColor: item.eventColor,
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                                color: "#fff",
                                                                                borderRadius: "50%",
                                                                                marginLeft: "-23px",
                                                                                fontWeight: "600",
                                                                            }}
                                                                        >
                                                                            {item.from}
                                                                        </Box>
                                                                        {item.from !== item.to && (
                                                                            <>
                                                                                <Typography sx={{ px: 0.5 }}>to</Typography>
                                                                                <Box
                                                                                    sx={{
                                                                                        width: "30px",
                                                                                        height: "30px",
                                                                                        backgroundColor: item.eventColor,
                                                                                        display: "flex",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "center",
                                                                                        color: "#fff",
                                                                                        borderRadius: "50%",
                                                                                        fontWeight: "600",
                                                                                    }}
                                                                                >
                                                                                    {item.to}
                                                                                </Box>
                                                                            </>
                                                                        )}
                                                                    </Box>

                                                                    <Box p={1} sx={{ flex: 1 }}>
                                                                        <Typography sx={{ fontSize: "8px", color: "#616161", textDecoration: "underline" }}>
                                                                            {item.headLine}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: "12px", color: "#616161", pb: 2 }}>
                                                                            {item.description}
                                                                        </Typography>
                                                                    </Box>
                                                                    {item.filetype !== "empty" &&
                                                                        <Box>
                                                                            {item.filetype === "image" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleViewClick(item.filepath)}
                                                                                >
                                                                                    View Image
                                                                                </Button>
                                                                            }
                                                                            {item.filetype === "link" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleVideoClick(item.filepath)}
                                                                                >
                                                                                    Play Video
                                                                                </Button>
                                                                            }
                                                                        </Box>
                                                                    }
                                                                </Box>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>

                                </Box>}
                                {value === 2 && <Box px={3}>
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
                                                            backgroundColor: "rgba(219, 71, 0, 0.1)",
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
                                                                <Box
                                                                    sx={{
                                                                        position: "relative",
                                                                        backgroundColor: "rgba(219, 71, 0, 0.1)",
                                                                        display: "flex",
                                                                        py: 2,
                                                                        width: "95%",
                                                                        justifyContent: "flex-start",
                                                                        alignItems: "center",
                                                                        borderRadius: "5px",
                                                                        padding: "0 10px",
                                                                        minHeight: "100px",
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: "30px",
                                                                                height: "30px",
                                                                                backgroundColor: item.eventColor,
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                                color: "#fff",
                                                                                borderRadius: "50%",
                                                                                marginLeft: "-23px",
                                                                                fontWeight: "600",
                                                                            }}
                                                                        >
                                                                            {item.from}
                                                                        </Box>
                                                                        {item.from !== item.to && (
                                                                            <>
                                                                                <Typography sx={{ px: 0.5 }}>to</Typography>
                                                                                <Box
                                                                                    sx={{
                                                                                        width: "30px",
                                                                                        height: "30px",
                                                                                        backgroundColor: item.eventColor,
                                                                                        display: "flex",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "center",
                                                                                        color: "#fff",
                                                                                        borderRadius: "50%",
                                                                                        fontWeight: "600",
                                                                                    }}
                                                                                >
                                                                                    {item.to}
                                                                                </Box>
                                                                            </>
                                                                        )}
                                                                    </Box>

                                                                    <Box p={1} sx={{ flex: 1 }}>
                                                                        <Typography sx={{ fontSize: "8px", color: "#616161", textDecoration: "underline" }}>
                                                                            {item.headLine}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: "12px", color: "#616161", pb: 2 }}>
                                                                            {item.description}
                                                                        </Typography>
                                                                    </Box>
                                                                    {item.filetype !== "empty" &&
                                                                        <Box>
                                                                            {item.filetype === "image" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleViewClick(item.filepath)}
                                                                                >
                                                                                    View Image
                                                                                </Button>
                                                                            }
                                                                            {item.filetype === "link" &&
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        textTransform: 'none',
                                                                                        padding: '0px 0',
                                                                                        borderRadius: '30px',
                                                                                        fontSize: '8px',
                                                                                        border: '1px solid black',
                                                                                        color: 'white',
                                                                                        fontWeight: "600",
                                                                                        backgroundColor: "#000",
                                                                                        position: "absolute",
                                                                                        bottom: "3px",
                                                                                        left: "3px",
                                                                                    }}
                                                                                    onClick={() => handleVideoClick(item.filepath)}
                                                                                >
                                                                                    Play Video
                                                                                </Button>
                                                                            }
                                                                        </Box>
                                                                    }
                                                                </Box>
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
        </Box >
    );
}
