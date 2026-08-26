import { Autocomplete, Box, Button, Checkbox, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Switch, Tab, Tabs, TextareaAutosize, TextField, ThemeProvider, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { selectWebsiteSettings } from "../../Redux/Slices/websiteSettingsSlice";
import { selectSubMenuPermissions } from "../../Redux/Slices/AuthSlice";
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
import { CalendarSkeleton, EventCardSkeleton } from "../InnerLoader";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ImportantEventsPage from "./ImportantEventsPage";
import { DASH, RADIUS, PageHeader, SolidStatCard, KPI_TONES } from "../DashBoardComps/dashboardTheme";

// Page theme — soft emerald (matches Leave Policy Master Screen).
const PRIMARY = "#059669";
const PRIMARY_LIGHT = "#ECFDF5";
const PRIMARY_DARK = "#047857";
const PRIMARY_BORDER = "#A7F3D0";

const PANE_HEIGHT = "calc(100vh - 172px)";
// Calendar view carries a KPI strip above the panes, so it gets less room.
const CAL_PANE_HEIGHT = "calc(100vh - 292px)";
const CAL_PANE_MIN = 400;

const EMPTY_BOX = {
    textAlign: "center",
    mt: 2,
    bgcolor: DASH.surface,
    border: `1px dashed ${DASH.line}`,
    borderRadius: RADIUS,
    width: "100%",
    height: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const EMPTY_TEXT = { fontSize: "12.5px", color: DASH.faint };

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

// Form language shared with Create News / Circulars / Messages.
const FIELD_LABEL = { fontSize: "13px", fontWeight: 600, color: DASH.text, mb: 0.7 };
const REQ = { color: "#E30053" };
const OPTIONAL = { color: DASH.faint, fontWeight: 400, fontSize: "12px" };

const GHOST_BTN = {
    textTransform: "none",
    borderRadius: "10px",
    fontSize: "12.5px",
    fontWeight: 600,
    px: 1.8,
    py: 0.6,
    color: DASH.text,
    borderColor: "#D6DAE1",
    backgroundColor: "#fff",
    "&:hover": { borderColor: "#9AA3AF", backgroundColor: "#F7F8FA" },
};

const PRIMARY_BTN = {
    textTransform: "none",
    borderRadius: "10px",
    fontSize: "12.5px",
    fontWeight: 700,
    px: 2.4,
    py: 0.7,
    boxShadow: "none",
    whiteSpace: "nowrap",
    backgroundColor: PRIMARY,
    color: "#fff",
    "&:hover": { backgroundColor: PRIMARY_DARK, boxShadow: "none" },
    "&.Mui-disabled": { backgroundColor: "#E5E7EB", color: DASH.faint },
};

const TEXT_FIELD = {
    backgroundColor: "#fff",
    "& .MuiOutlinedInput-root": {
        borderRadius: "9px",
        fontSize: "13.5px",
        "& fieldset": { borderColor: DASH.line },
        "&:hover fieldset": { borderColor: "#9AA3AF" },
        "&.Mui-focused fieldset": { borderColor: PRIMARY, borderWidth: "1px" },
    },
};

// Titled card used for every block of the create/edit form.
const FormSection = ({ icon: Icon, title, hint, children }) => (
    <Box sx={{
        bgcolor: "#fff",
        border: `1px solid ${DASH.line}`,
        borderRadius: "12px",
        overflow: "hidden",
    }}>
        <Box sx={{
            display: "flex", alignItems: "center", gap: 1.2,
            px: 1.8, py: 1.1,
            bgcolor: DASH.surface,
            borderBottom: `1px solid ${DASH.lineSoft}`,
        }}>
            <Box sx={{
                width: 26, height: 26, borderRadius: "7px",
                bgcolor: "#fff", border: `1px solid ${DASH.line}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
                <Icon sx={{ fontSize: 15, color: PRIMARY }} />
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink, flex: 1, minWidth: 0 }}>
                {title}
            </Typography>
            {hint && (
                <Typography sx={{ fontSize: 11, color: DASH.faint, flexShrink: 0 }}>{hint}</Typography>
            )}
        </Box>
        <Box sx={{ p: 1.8 }}>{children}</Box>
    </Box>
);

// A labelled switch row — used for "Single day event" and "Important event".
const ToggleRow = ({ checked, onChange, label, description }) => (
    <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 1.4, py: 1,
        borderRadius: "10px",
        border: `1px solid ${checked ? PRIMARY_BORDER : DASH.line}`,
        bgcolor: checked ? PRIMARY_LIGHT : "#fff",
        transition: "background-color 0.15s, border-color 0.15s",
    }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: checked ? PRIMARY_DARK : DASH.text }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: 11, color: DASH.muted, mt: 0.1 }}>
                {description}
            </Typography>
        </Box>
        <Switch
            size="small"
            checked={checked}
            onChange={onChange}
            sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: PRIMARY },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: PRIMARY },
            }}
        />
    </Box>
);

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

    const calendarPerms = useSelector(selectSubMenuPermissions("communication", "schoolcalender"));
    const canView = calendarPerms?.view === "Y";
    const canCreate = calendarPerms?.create === "Y";
    const canEdit = calendarPerms?.edit === "Y";
    const canDelete = calendarPerms?.delete === "Y";
    // Important Events used to be its own page; it only ever read this calendar's
    // events, so it now lives here as a second view.
    const eventsPerms = useSelector(selectSubMenuPermissions("communication", "events"));
    // Events rides on the calendar. No calendar view means no events either, even
    // when the events key itself is granted.
    const canViewEvents = canView && eventsPerms?.view === "Y";
    const [activeView, setActiveView] = useState("calendar");
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
    // Separate from isLoading: this one only tracks the events fetch, so the
    // list skeletons never appear while a save or delete overlay is up.
    const [eventsLoading, setEventsLoading] = useState(true);
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
        if (!canEdit) return;
        setEditId(id)
        setOpenEditAlert(true);

    };

    const handleDelete = (id) => {
        if (!canDelete) return;
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
        setEventsLoading(true);
        try {
            const res = await axios.get(FetchAllSchoolCalenderEvents, {
                params: {
                    rollNumber: rollNumber,
                    userType: userType,
                    date: monthChanged || todayDateTime,
                    event: "N",
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
            setEventsLoading(false);
        }
    };

    const fetchDataById = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(FindSchoolCalender, {
                params: {
                    id: editId
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

        if (!canCreate) return;

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

        if (!fromDateFormatted) {
            setMessage("Start date is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!onlyFrom && !toDateFormatted) {
            setMessage("End date is required, or switch on Single day event");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();

            formData.append('userType', userType);
            formData.append('rollNumber', rollNumber);
            formData.append('headLine', heading);
            formData.append('description', description);
            formData.append('fileType', fileType || "empty");
            formData.append('file', uploadedFiles[0] || '');
            formData.append('link', pastedLink);
            formData.append('fromDate', fromDateFormatted);
            formData.append('toDate', onlyFrom ? fromDateFormatted : toDateFormatted);
            formData.append('event', eventsValue || "N");
            formData.append('eventColor', pickedColor || "rgba(0,0,0,1)");

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
            return true;
        } catch (error) {
            console.error("Error while inserting  data:", error);
            setOpen(true);
            setColor(false);
            setStatus(false);
            setMessage("Failed to create the event. Please try again.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const UpdateEvents = async () => {

        if (!canEdit) return;

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

            formData.append('id', editId);
            formData.append('userType', userType);
            formData.append('rollNumber', rollNumber);
            formData.append('headLine', editHeading);
            formData.append('description', editDescription);
            formData.append('fileType', editFileType || "empty");
            formData.append('file', editUploadedFiles[0] || '');
            formData.append('link', editPastedLink);
            formData.append('event', editEventsValue || "N");
            formData.append('eventColor', editPickedColor || "rgba(0, 0, 0, 1)");
            formData.append("updatedOn", todayDateTime || "");


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
        if (!canDelete) return;
        setIsLoading(true);
        try {
            const res = await axios.delete(DeleteSchoolCalender, {
                params: {
                    id: id
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

    // Headline numbers for the KPI strip.
    const markedDays = availableSlots.size;

    // ── Create form: live preview + submit gating ────────────────────────────
    const createEffectiveTo = onlyFrom ? fromDate : toDate;

    const createDurationLabel = useMemo(() => {
        if (!fromDate) return "Pick a start date";
        const start = dayjs(fromDate);
        const end = dayjs(createEffectiveTo || fromDate);
        if (!start.isValid() || !end.isValid()) return "Pick a start date";
        const days = end.diff(start, "day") + 1;
        return days <= 1 ? "Single day event" : `Runs for ${days} days`;
    }, [fromDate, createEffectiveTo]);

    const createIsValid =
        heading.trim().length > 0 &&
        description.trim().length > 0 &&
        Boolean(fromDate) &&
        (onlyFrom || Boolean(toDate));

    // Shaped like the API rows so the real EventCard can render the preview.
    const createPreviewItem = useMemo(() => {
        const fmt = (d) => (d && dayjs(d).isValid() ? dayjs(d).format("DD-MM-YYYY") : "");
        const from = fmt(fromDate);
        const to = fmt(createEffectiveTo) || from;
        return {
            id: "create-preview",
            eventColor: pickedColor,
            from: from || "Date pending",
            to: to || "Date pending",
            headLine: heading.trim() || "Your event title will appear here",
            description: description.trim(),
        };
    }, [fromDate, createEffectiveTo, pickedColor, heading, description]);

    const submitCreate = async () => {
        const ok = await handlePost("post");
        if (ok) closeCreateDialog();
    };

    const nextEventLabel = useMemo(() => {
        if (!upCommingEvents || upCommingEvents.length === 0) return "Nothing scheduled";
        const next = [...upCommingEvents]
            .map((ev) => dayjs(ev.fromDate, "DD-MM-YYYY"))
            .filter((d) => d.isValid())
            .sort((a, b) => a.valueOf() - b.valueOf())[0];
        return next ? `Next on ${next.format("DD MMM")}` : "Nothing scheduled";
    }, [upCommingEvents]);

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
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                pt: { xs: 1.5, md: 2 },
                pb: { xs: 2, md: 3 },
                bgcolor: DASH.canvas,
                height: "100%",
                boxSizing: "border-box",
            }}
        >
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />

            <PageHeader
                title="School Calendar"
                subtitle="Events, holidays and important dates"
                right={
                    <>
                        {canViewEvents && (
                            <Box
                                sx={{
                                    display: "inline-flex",
                                    p: "3px",
                                    borderRadius: RADIUS,
                                    bgcolor: "#fff",
                                    border: `1px solid ${DASH.line}`,
                                }}
                            >
                                {[
                                    { key: "calendar", label: "Calendar", icon: CalendarMonthOutlinedIcon },
                                    { key: "events", label: "Events", icon: EventAvailableOutlinedIcon },
                                ].map((tab) => {
                                    const active = activeView === tab.key;
                                    const TabIcon = tab.icon;
                                    return (
                                        <Box
                                            key={tab.key}
                                            onClick={() => setActiveView(tab.key)}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.6,
                                                cursor: "pointer",
                                                userSelect: "none",
                                                px: 1.6,
                                                py: 0.55,
                                                borderRadius: RADIUS,
                                                fontSize: "12.5px",
                                                fontWeight: 700,
                                                transition: "0.18s",
                                                bgcolor: active ? PRIMARY_LIGHT : "transparent",
                                                color: active ? PRIMARY_DARK : DASH.muted,
                                                border: `1px solid ${active ? PRIMARY_BORDER : "transparent"}`,
                                                "&:hover": active ? {} : { color: DASH.ink, bgcolor: DASH.lineSoft },
                                            }}
                                        >
                                            <TabIcon sx={{ fontSize: 15 }} />
                                            {tab.label}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        {canCreate && activeView === "calendar" && (
                            <Button
                                disableElevation
                                startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                                onClick={() => setCreateOpen(true)}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    height: 34,
                                    px: 1.8,
                                    borderRadius: RADIUS,
                                    bgcolor: PRIMARY,
                                    color: "#fff",
                                    "&:hover": { bgcolor: PRIMARY_DARK },
                                }}
                            >
                                Create Event
                            </Button>
                        )}
                    </>
                }
            />
            {canView && activeView === "events" && (
                <Box
                    sx={{
                        height: { xs: "auto", lg: PANE_HEIGHT },
                        overflowY: "auto",
                        p: 2,
                        bgcolor: "#fff",
                        border: `1px solid ${PRIMARY}38`,
                        borderRadius: RADIUS,
                    }}
                >
                    <ImportantEventsPage embedded />
                </Box>
            )}
            {canView && activeView === "calendar" && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <SolidStatCard
                            label="Events This Year"
                            value={eventsLoading ? "—" : (yearEvents?.length || 0)}
                            note={`${markedDays} day${markedDays === 1 ? "" : "s"} marked`}
                            tone={KPI_TONES.cyan}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <SolidStatCard
                            label="Happening Today"
                            value={eventsLoading ? "—" : (todayEvents?.length || 0)}
                            note={dayjs().format("DD MMM YYYY")}
                            tone={KPI_TONES.green}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <SolidStatCard
                            label="Upcoming"
                            value={eventsLoading ? "—" : (upCommingEvents?.length || 0)}
                            note={nextEventLabel}
                            tone={KPI_TONES.orange}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <SolidStatCard
                            label="Completed"
                            value={eventsLoading ? "—" : (completedEvents?.length || 0)}
                            note="Already passed"
                            tone={KPI_TONES.violet}
                        />
                    </Grid>
                </Grid>
            )}
            {canView && activeView === "calendar" &&
                <Box sx={{
                    height: {
                        xs: "auto",
                        lg: CAL_PANE_HEIGHT,
                    },
                    minHeight: { lg: CAL_PANE_MIN },
                    overflow: "hidden",
                    bgcolor: "#fff",
                    border: `1px solid ${PRIMARY}38`,
                    borderRadius: RADIUS,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    transition: "box-shadow 0.2s ease",
                    "&:hover": { boxShadow: "0 4px 16px rgba(17,24,39,0.10)" },
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
                            {eventsLoading && <CalendarSkeleton />}

                            {!eventsLoading && <Box sx={{
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

                                {/* Legend — explains what the coloured / outlined days mean */}
                                <Box sx={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexWrap: "wrap", gap: 1.6,
                                    mt: 1.4, pt: 1.2,
                                    borderTop: `1px solid ${DASH.lineSoft}`,
                                }}>
                                    {[
                                        { label: "Event day", swatch: { bgcolor: DASH.violet } },
                                        { label: "Today", swatch: { bgcolor: "#fff", border: `1.5px solid ${PRIMARY}` } },
                                        { label: "Selected", swatch: { bgcolor: "#fff", outline: `2px solid ${PRIMARY_DARK}`, outlineOffset: "1px" } },
                                    ].map((l) => (
                                        <Box key={l.label} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, ...l.swatch }} />
                                            <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: DASH.muted }}>
                                                {l.label}
                                            </Typography>
                                        </Box>
                                    ))}
                                    <Typography sx={{ fontSize: 10.5, color: DASH.faint }}>
                                        Click a date to see its events
                                    </Typography>
                                </Box>
                            </Box>}

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
                                                        {(canEdit || canDelete) && (
                                                            <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                                                                {canEdit && (
                                                                    <Tooltip title="Edit">
                                                                        <IconButton size="small" onClick={() => handleEdit(item.id)} sx={{ width: 22, height: 22 }}>
                                                                            <EditOutlinedIcon sx={{ fontSize: 13 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {canDelete && (
                                                                    <Tooltip title="Delete">
                                                                        <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ width: 22, height: 22 }}>
                                                                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 13 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
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
                                    bgcolor: DASH.lineSoft,
                                    border: `1px solid ${DASH.line}`,
                                    borderRadius: '50px',
                                    p: 0.4,
                                    display: 'inline-flex',
                                    width: 'fit-content',
                                    maxWidth: '100%',
                                }}>
                                    <Tabs
                                        value={value}
                                        onChange={handleChange}
                                        aria-label="event filters"
                                        variant="scrollable"
                                        scrollButtons={false}
                                        TabIndicatorProps={{ style: { display: 'none' } }}
                                        sx={{
                                            minHeight: 30,
                                            '& .MuiTabs-flexContainer': { gap: 0.4 },
                                            '& .MuiTab-root': {
                                                textTransform: 'none',
                                                fontSize: 12.5,
                                                fontWeight: 700,
                                                color: DASH.muted,
                                                minHeight: 30,
                                                py: 0,
                                                px: 1.8,
                                                borderRadius: '50px',
                                                transition: 'all 0.18s ease',
                                                '&:hover': {
                                                    color: DASH.ink,
                                                    bgcolor: '#fff',
                                                },
                                            },
                                            '& .Mui-selected': {
                                                color: `${PRIMARY_DARK} !important`,
                                                bgcolor: '#fff',
                                                border: `1px solid ${PRIMARY_BORDER}`,
                                                boxShadow: '0 1px 3px rgba(17,24,39,0.08)',
                                                '&:hover': { bgcolor: '#fff' },
                                            },
                                        }}
                                    >
                                        {[
                                            { label: 'Completed', count: completedEvents.length },
                                            { label: 'Today', count: todayEvents.length },
                                            { label: 'Upcoming', count: upCommingEvents.length },
                                        ].map((t, i) => (
                                            <Tab
                                                key={t.label}
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                                        {t.label}
                                                        <Box sx={{
                                                            minWidth: 18, px: 0.5, height: 17,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            borderRadius: '50px',
                                                            fontSize: 10.5, fontWeight: 800, lineHeight: 1,
                                                            bgcolor: value === i ? PRIMARY_LIGHT : DASH.line,
                                                            color: value === i ? PRIMARY_DARK : DASH.muted,
                                                        }}>
                                                            {eventsLoading ? '–' : t.count}
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        ))}
                                    </Tabs>
                                </Box>
                            </Box>
                            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1, pb: 2 }}>
                                {value === 0 && <Box sx={{ px: 1, pt: 1.5 }}>
                                    <Grid container spacing={2}>
                                        {eventsLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <Grid key={`ev-skeleton-${i}`} size={12}>
                                                    <EventCardSkeleton lines={i === 1 ? 1 : 2} />
                                                </Grid>
                                            ))
                                        ) : completedEvents.length === 0 ? (
                                            <Box sx={EMPTY_BOX}>
                                                <Typography sx={EMPTY_TEXT}>
                                                    No completed events yet
                                                </Typography>
                                            </Box>
                                        ) : (
                                            completedEvents.map((item) => (
                                                <Grid key={item.id} size={12}>
                                                    <EventCard
                                                        item={item}
                                                        onViewImage={handleViewClick}
                                                        onPlayVideo={handleVideoClick}
                                                        onEdit={canEdit ? handleEdit : undefined}
                                                        onDelete={canDelete ? handleDelete : undefined}
                                                    />
                                                </Grid>
                                            ))
                                        )}
                                    </Grid>
                                </Box>}
                                {value === 1 && <Box sx={{ px: 1, pt: 1.5 }}>
                                    <Grid container spacing={2}>
                                        {eventsLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <Grid key={`ev-skeleton-${i}`} size={12}>
                                                    <EventCardSkeleton lines={i === 1 ? 1 : 2} />
                                                </Grid>
                                            ))
                                        ) : todayEvents.length === 0 ? (
                                            <Box sx={EMPTY_BOX}>
                                                <Typography sx={EMPTY_TEXT}>
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
                                                        onEdit={canEdit ? handleEdit : undefined}
                                                        onDelete={canDelete ? handleDelete : undefined}
                                                    />
                                                </Grid>
                                            ))
                                        )}
                                    </Grid>
                                </Box>}
                                {value === 2 && <Box sx={{ px: 1, pt: 1.5 }}>
                                        <Grid container spacing={2}>
                                            {eventsLoading ? (
                                                Array.from({ length: 3 }).map((_, i) => (
                                                    <Grid key={`ev-skeleton-${i}`} size={12}>
                                                        <EventCardSkeleton lines={i === 1 ? 1 : 2} />
                                                    </Grid>
                                                ))
                                            ) : upCommingEvents.length === 0 ? (
                                                <Box sx={EMPTY_BOX}>
                                                    <Typography sx={EMPTY_TEXT}>
                                                        No upcoming events scheduled
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                upCommingEvents.map((item) => (
                                                    <Grid key={item.id} size={12}>
                                                        <EventCard
                                                            item={item}
                                                            onViewImage={handleViewClick}
                                                            onPlayVideo={handleVideoClick}
                                                            onEdit={canEdit ? handleEdit : undefined}
                                                            onDelete={canDelete ? handleDelete : undefined}
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


                    </Grid >

                </Box >
            }

            {/* ─── Create Event Dialog — root-level, same form language as Create News ─── */}
            <Dialog
                open={createOpen && canCreate}
                onClose={() => closeCreateDialog()}
                maxWidth="lg"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "14px", overflow: "hidden" } } }}
            >
                <DialogTitle sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    bgcolor: "#fff", borderBottom: `1px solid ${DASH.line}`, py: 1.4, px: 2.5,
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, minWidth: 0 }}>
                        <Box sx={{
                            width: 34, height: 34, borderRadius: "9px",
                            bgcolor: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <CalendarMonthOutlinedIcon sx={{ color: PRIMARY_DARK, fontSize: 19 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: DASH.ink, lineHeight: 1.25 }}>
                                Create Event
                            </Typography>
                            <Typography sx={{ fontSize: 11.5, color: DASH.muted }}>
                                Schedule a new school calendar entry
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={() => closeCreateDialog()}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: "20px !important", bgcolor: DASH.canvas }}>
                    <Grid container spacing={2}>

                        {/* ── FORM COLUMN ── */}
                        <Grid
                            size={{ xs: 12, sm: 12, md: 7, lg: 7 }}
                            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                        >
                            <FormSection icon={EventNoteOutlinedIcon} title="Event details">
                                <Typography sx={FIELD_LABEL}>
                                    Event title <span style={REQ}>*</span>
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    placeholder="e.g. Annual Sports Day"
                                    value={heading}
                                    onChange={handleHeadingChange}
                                    sx={TEXT_FIELD}
                                />
                                <Typography sx={{
                                    fontSize: "11px", mt: 0.5, textAlign: "right",
                                    color: heading.length >= 100 ? DASH.red : DASH.faint,
                                }}>
                                    {`${heading.length}/100`}
                                </Typography>

                                <Typography sx={{ ...FIELD_LABEL, mt: 1.2 }}>
                                    Description <span style={REQ}>*</span>
                                </Typography>
                                <TextareaAutosize
                                    minRows={4}
                                    maxRows={8}
                                    value={description}
                                    onChange={handleDescription}
                                    placeholder="What is this event about? Who should attend?"
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        backgroundColor: "#fff",
                                        borderRadius: "9px",
                                        fontFamily: "inherit",
                                        border: `1px solid ${DASH.line}`,
                                        fontSize: "13.5px",
                                        color: DASH.ink,
                                        padding: "10px 12px",
                                        resize: "none",
                                        outlineColor: PRIMARY,
                                    }}
                                />
                                <Typography sx={{
                                    fontSize: "11px", mt: 0.3, textAlign: "right",
                                    color: description.length >= 300 ? DASH.red : DASH.faint,
                                }}>
                                    {`${description.length}/300`}
                                </Typography>
                            </FormSection>

                            <FormSection
                                icon={CalendarMonthOutlinedIcon}
                                title="When is it happening?"
                                hint={createDurationLabel}
                            >
                                <ToggleRow
                                    checked={onlyFrom}
                                    onChange={handleCheckboxChange}
                                    label="Single day event"
                                    description="Turn this on when the event starts and ends on the same day"
                                />

                                <Grid container spacing={1.5} sx={{ mt: 0.4 }}>
                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <Typography sx={FIELD_LABEL}>
                                            Start date <span style={REQ}>*</span>
                                        </Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="date"
                                            required
                                            value={fromDate}
                                            onChange={handleFromDateChange}
                                            sx={TEXT_FIELD}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                                        <Typography sx={{ ...FIELD_LABEL, opacity: onlyFrom ? 0.5 : 1 }}>
                                            End date {onlyFrom
                                                ? <span style={OPTIONAL}>(same as start)</span>
                                                : <span style={REQ}>*</span>}
                                        </Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="date"
                                            required={!onlyFrom}
                                            disabled={onlyFrom}
                                            value={onlyFrom ? fromDate : toDate}
                                            onChange={handleToDateChange}
                                            slotProps={{ htmlInput: { min: fromDate || undefined } }}
                                            sx={TEXT_FIELD}
                                        />
                                    </Grid>
                                </Grid>
                            </FormSection>

                            <FormSection
                                icon={PaletteOutlinedIcon}
                                title="Appearance"
                                hint="Shows on the calendar"
                            >
                                <Typography sx={{ ...FIELD_LABEL, display: "flex", alignItems: "center", gap: 0.8 }}>
                                    Event colour
                                    <Tooltip
                                        arrow
                                        placement="right"
                                        title={
                                            <Typography sx={{ fontSize: 12, maxWidth: 200 }}>
                                                Darker colours stay readable against the white calendar grid.
                                            </Typography>
                                        }
                                    >
                                        <InfoOutlinedIcon sx={{ fontSize: 15, color: DASH.faint }} />
                                    </Tooltip>
                                </Typography>
                                <ColorSwatchPicker value={pickedColor} onChange={(c) => setPickedColor(c)} />

                                <Box sx={{ mt: 1.8 }}>
                                    <ToggleRow
                                        checked={eventsValue === "Y"}
                                        onChange={handleEventsChange}
                                        label="Mark as important event"
                                        description="Also lists this under the Events tab for everyone"
                                    />
                                </Box>
                            </FormSection>

                            <FormSection
                                icon={AttachFileOutlinedIcon}
                                title="Attachment"
                                hint="Optional — an image or a link, not both"
                            >
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    sx={{
                                        minHeight: 34,
                                        mb: 0.5,
                                        "& .MuiTab-root": {
                                            textTransform: "none", minHeight: 34, py: 0,
                                            fontSize: "13px", fontWeight: 600, color: DASH.muted,
                                        },
                                        "& .Mui-selected": { color: `${DASH.ink} !important` },
                                        "& .MuiTabs-indicator": { backgroundColor: PRIMARY, height: 3, borderRadius: "3px" },
                                    }}
                                >
                                    <Tab label="Select Image" />
                                    <Tab label="Add Link" />
                                </Tabs>

                                {activeTab === 0 && (
                                    <Box sx={{ mt: 1.5 }}>
                                        <Box
                                            {...getRootProps()}
                                            sx={{
                                                border: `2px dashed ${isDragActive ? PRIMARY : "#C7D6EA"}`,
                                                borderRadius: "10px",
                                                p: 2,
                                                backgroundColor: isDragActive ? PRIMARY_LIGHT : "#F6F9FD",
                                                textAlign: "center",
                                                cursor: "pointer",
                                                transition: "0.2s",
                                                "&:hover": { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT },
                                            }}
                                        >
                                            <input {...getInputProps()} accept=".jpg, .jpeg, .webp, .png" />
                                            <UploadFileIcon sx={{ fontSize: 30, color: PRIMARY }} />
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: DASH.text, mt: 0.5 }}>
                                                Drag and drop a file here, or click to upload
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: DASH.faint, mt: 0.2 }}>
                                                JPG, JPEG, WebP or PNG · max 25MB
                                            </Typography>
                                        </Box>

                                        {uploadedFiles.length > 0 && (
                                            <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <Box sx={{
                                                    position: "relative",
                                                    width: 88, height: 88,
                                                    border: `1px solid ${DASH.line}`,
                                                    borderRadius: "10px",
                                                    overflow: "hidden",
                                                    flexShrink: 0,
                                                }}>
                                                    <img
                                                        src={uploadedFiles[0] instanceof File
                                                            ? URL.createObjectURL(uploadedFiles[0])
                                                            : uploadedFiles[0].url || uploadedFiles[0]}
                                                        alt="Selected"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                </Box>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: DASH.text }} noWrap>
                                                        {uploadedFiles[0]?.name || "Selected image"}
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        onClick={handleImageClose}
                                                        startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                                                        sx={{
                                                            textTransform: "none", fontSize: 11.5, fontWeight: 600,
                                                            color: DASH.red, px: 0.5, mt: 0.3,
                                                            "&:hover": { bgcolor: DASH.redLight },
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {activeTab === 1 && (
                                    <Box sx={{ mt: 1.5 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Paste your link here"
                                            value={pastedLink}
                                            onChange={handleLinkUpload}
                                            sx={TEXT_FIELD}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <InsertLinkIcon sx={{ fontSize: 18, color: DASH.faint }} />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                        <Typography sx={{ fontSize: 11, color: DASH.faint, mt: 0.7 }}>
                                            Paste a YouTube link here.
                                        </Typography>
                                    </Box>
                                )}
                            </FormSection>
                        </Grid>

                        {/* ── PREVIEW COLUMN ── */}
                        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5 }}>
                            <Box sx={{
                                position: { md: "sticky" },
                                top: 0,
                                bgcolor: "#fff",
                                border: `1px solid ${DASH.line}`,
                                borderRadius: "12px",
                                overflow: "hidden",
                            }}>
                                <Box sx={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    gap: 1, px: 1.8, py: 1.1,
                                    bgcolor: DASH.surface,
                                    borderBottom: `1px solid ${DASH.lineSoft}`,
                                }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <VisibilityOutlinedIcon sx={{ fontSize: 16, color: DASH.muted }} />
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DASH.ink }}>
                                            Live Preview
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: 11, color: DASH.faint }}>
                                        Updates as you type
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 1.8 }}>
                                    {/* How the day will look on the calendar grid */}
                                    <Typography sx={{
                                        fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em",
                                        textTransform: "uppercase", color: DASH.muted, mb: 1,
                                    }}>
                                        On the calendar
                                    </Typography>
                                    <Box sx={{
                                        display: "flex", alignItems: "center", gap: 1.4,
                                        p: 1.4, mb: 2,
                                        borderRadius: "10px",
                                        bgcolor: DASH.surface,
                                        border: `1px solid ${DASH.lineSoft}`,
                                    }}>
                                        <Box sx={{
                                            width: 34, height: 34, borderRadius: "50%",
                                            bgcolor: pickedColor,
                                            color: "#fff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 13, fontWeight: 700, flexShrink: 0,
                                        }}>
                                            {fromDate && dayjs(fromDate).isValid() ? dayjs(fromDate).format("DD") : "–"}
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: DASH.text }}>
                                                {fromDate && dayjs(fromDate).isValid()
                                                    ? dayjs(fromDate).format("dddd, DD MMM YYYY")
                                                    : "No date picked yet"}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: DASH.muted }}>
                                                {createDurationLabel}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Exactly the card the event list will render */}
                                    <Typography sx={{
                                        fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em",
                                        textTransform: "uppercase", color: DASH.muted, mb: 1,
                                    }}>
                                        In the events list
                                    </Typography>
                                    <EventCard item={createPreviewItem} />

                                    {eventsValue === "Y" && (
                                        <Box sx={{
                                            display: "flex", alignItems: "center", gap: 0.8,
                                            mt: 1.4, px: 1.2, py: 0.8,
                                            borderRadius: "8px",
                                            bgcolor: DASH.amberLight,
                                            border: "1px solid #FDE68A",
                                        }}>
                                            <EventAvailableOutlinedIcon sx={{ fontSize: 15, color: "#B45309" }} />
                                            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "#B45309" }}>
                                                Also appears under the Events tab
                                            </Typography>
                                        </Box>
                                    )}

                                    {!createIsValid && (
                                        <Box sx={{
                                            display: "flex", alignItems: "flex-start", gap: 0.9,
                                            mt: 1.8, px: 1.2, py: 1,
                                            borderRadius: "8px",
                                            bgcolor: DASH.surface,
                                            border: `1px dashed ${DASH.line}`,
                                        }}>
                                            <InfoOutlinedIcon sx={{ fontSize: 15, color: DASH.faint, mt: "1px" }} />
                                            <Typography sx={{ fontSize: 11.5, color: DASH.muted, lineHeight: 1.5 }}>
                                                Fill in the title, description and dates to enable Create Event.
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{
                    px: 2.5, py: 1.6, gap: 1,
                    bgcolor: "#fff",
                    borderTop: `1px solid ${DASH.line}`,
                }}>
                    <Button
                        variant="outlined"
                        startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                        sx={GHOST_BTN}
                        onClick={() => closeCreateDialog()}
                    >
                        Cancel
                    </Button>
                    <Button
                        startIcon={<AddIcon sx={{ fontSize: 17 }} />}
                        sx={PRIMARY_BTN}
                        disabled={!createIsValid || isLoading}
                        onClick={submitCreate}
                    >
                        Create Event
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete confirmation — root-level so it works from any context */}
            <Dialog open={openAlert && canDelete} onClose={() => setOpenAlert(false)}>
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
            <Dialog open={openEditAlert && canEdit} onClose={() => setOpenEditAlert(false)}>
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
                open={openEdit && canEdit}
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
