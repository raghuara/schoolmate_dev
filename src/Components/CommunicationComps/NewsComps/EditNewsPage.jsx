import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Stack, IconButton, Dialog, DialogActions, createTheme, ThemeProvider, Chip, Divider, Tooltip, InputAdornment } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserTypeID } from "../../../Redux/Slices/AuthSlice";
import {
    APPROVAL_SUBMENUS, approvalRoleFor, selectApprovalMatrix,
} from "../../../Redux/Slices/approvalMatrixSlice";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import ReactPlayer from "react-player";
import { FindNews, updateNews } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SimpleTextEditor from "../../EditTextEditor";
import Loader from "../../Loader";

export default function EditNewsPage() {
    const navigate = useNavigate()
    const token = "123"
    const [heading, setHeading] = useState("");
    const [newsStatus, setNewsStatus] = useState("");
    const [newsContentHTML, setNewsContentHTML] = useState("");
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    // Whether this user's edit goes live or turns into a request is decided by
    // the approval flow configured in Access Control, not by their user type.
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const userTypeID = useSelector(selectUserTypeID);
    const approval = approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.NEWS, userTypeID);
    const canPublishNews = approval.canPublishDirect;

    const todayDateTime = dayjs().format('DD-MM-YYYY HH:mm');

    const [activeTab, setActiveTab] = useState(0);
    const [forActiveTab, setForActiveTab] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [pastedLink, setPastedLink] = useState("");
    const [DTValue, setDTValue] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [isLoading, setIsLoading] = useState('');
    const [fileType, setFileType] = useState('');

    const [fetchedImage, setFetchedImage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');

    const [changesHappended, setChangesHappended] = useState(false);
    const [formattedDTValue, setFormattedDTValue] = useState(null);

    const location = useLocation();
    const { id } = location.state || {};

    const [selectedNewsData, setSelectedNewsData] = useState([]);
    const [dateTimeValue, setDateTimeValue] = useState("");
    const [notValidLink, setNotValidLink] = useState(false);
    const [error, setError] = useState("");

    // What we push INTO the editor. Set once when the news loads; typing must not
    // change it, or Jodit resets the caret to the top of the box on every key.
    const [editorSeed, setEditorSeed] = useState("");

    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);

    // A newly picked file wins over the image already saved against this news.
    const imagePreviewUrl = useMemo(() => {
        const file = uploadedFiles[0];
        if (file) return file instanceof File ? URL.createObjectURL(file) : (file.url || file);
        return fetchedImage || "";
    }, [uploadedFiles, fetchedImage]);

    useEffect(() => {
        if (!imagePreviewUrl.startsWith("blob:")) return undefined;
        return () => URL.revokeObjectURL(imagePreviewUrl);
    }, [imagePreviewUrl]);

    const showLinkPreview = !uploadedFiles.length && !!pastedLink && isYouTubeLink(pastedLink);
    const hasPreview = !!heading.trim() || !!newsContentHTML.trim() || !!imagePreviewUrl || showLinkPreview;

    // Names of the approvers this update has to travel through, nearest one first.
    const levelUserType = (lvl) => approval.flow?.["level" + lvl]?.userType || ("Level " + lvl);
    const approverNames = approval.chain.map(levelUserType);
    const approvalNote = canPublishNews
        ? (approval.required
            ? "You are the top level approver for News, so your changes go live straight away."
            : "No approval flow is set for News yet, so your changes go live straight away.")
        : (approverNames.length
            ? "This update will be sent to " + approverNames.join(", then ") + " for approval before it goes live."
            : "This update will be sent for approval before it goes live.");

    const primaryAction = canPublishNews
        ? (DTValue
            ? { label: "Update & Schedule", status: "schedule", icon: <ScheduleSendOutlinedIcon sx={{ fontSize: 17 }} /> }
            : { label: "Update Now", status: "post", icon: <SaveOutlinedIcon sx={{ fontSize: 17 }} /> })
        : { label: "Send Update for Approval", status: DTValue ? "schedule" : "post", icon: <SendOutlinedIcon sx={{ fontSize: 17 }} /> };

    const fieldLabelSx = { fontSize: "13px", fontWeight: 600, color: "#374151", mb: 0.7 };
    const requiredSx = { color: "#E30053" };

    const ghostButtonSx = {
        textTransform: "none",
        borderRadius: "10px",
        fontSize: "12.5px",
        fontWeight: 600,
        px: 1.8,
        py: 0.6,
        color: "#374151",
        borderColor: "#D6DAE1",
        backgroundColor: "#fff",
        "&:hover": { borderColor: "#9AA3AF", backgroundColor: "#F7F8FA" },
    };

    const primaryButtonSx = {
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

    const theme = createTheme({
        palette: {
            mode: 'dark',
            background: {
                default: '#000',
            },
        },
        components: {
            MuiPickersPopper: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#333333',
                        color: '#FFFFFF',
                    },
                },
            },
            MuiInputBase: {
                styleOverrides: {
                    input: {
                        color: '#000',
                    },
                    root: {
                        '&.MuiOutlinedInput-root': {
                            borderRadius: '4px',
                            '& fieldset': {
                                borderColor: '#737373',
                            },
                            '&:hover fieldset': {
                                borderColor: '#737373',
                            },
                            '&.Mui-error fieldset': {
                                borderColor: '#737373 !important',
                            },
                        },
                    },
                },
            },
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        color: '#737373',
                    },
                },
            },
            MuiPickersDay: {
                styleOverrides: {
                    root: {
                        color: '#FFFFFF',
                        '&.Mui-selected': {
                            backgroundColor: websiteSettings.mainColor + ' !important',
                            color: '#000 !important',
                        },
                        '&.Mui-selected:hover': {
                            backgroundColor: websiteSettings.mainColor + ' !important',
                        },
                        '&.Mui-focused': {
                            backgroundColor: websiteSettings.mainColor + ' !important',
                            color: '#000',
                        },
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        '&.Mui-selected': {
                            backgroundColor: websiteSettings.mainColor + ' !important',
                            color: websiteSettings.textColor + ' !important',
                        },
                    },
                },
            },
        },
    });


    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const validFormats = ['image/jpeg', 'image/webp', 'image/png'];

            const validFiles = acceptedFiles.filter(file => validFormats.includes(file.type));

            if (validFiles.length > 0) {
                setChangesHappended(true)
                setPastedLink("");
                setUploadedFiles([validFiles[0]]);
                setFetchedImage("")
                setFileType("image");
            } else {
                alert("Only JPEG, WebP, or PNG files are allowed.");
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ".jpg, .jpeg, .webp, .png"
    });


    const handleHeadingChange = (e) => {
        setChangesHappended(true)
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    // Stable identity so the memoised editor is not re-rendered on every keystroke.
    const handleRichTextChange = useCallback((htmlContent) => {
        setChangesHappended(true)
        setNewsContentHTML(htmlContent);
    }, []);

    function isYouTubeLink(url) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|(?:watch\?v=|.+\/videoseries\?v=))|youtu\.be\/)[^&?\/\s]+/;
        return youtubeRegex.test(url);
    }

    const handleLinkUpload = (e) => {
        setChangesHappended(true);
        const link = e.target.value;
        setPastedLink(link);

        const youtubeRegex =
            /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S+)?$/;

        if (!youtubeRegex.test(link)) {
            setError("Invalid YouTube link. Please enter a valid YouTube video URL.");
            setNotValidLink(true)
            setFileType("");
        } else {
            setError("");
            setUploadedFiles([]);
            setFileType("link");
        }
    };

    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/news')
        }

    };
    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/news')
        }

    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/news')
            console.log('Cancel confirmed');
        }
    };

    const handleDateChange = (newDTValue) => {
        if (newDTValue) {
            setChangesHappended(true)
            setDTValue(newDTValue);
            const formattedDateTime = newDTValue.format('DD-MM-YYYY HH:mm');
            setFormattedDTValue(formattedDateTime)

        } else {
            setDTValue(null);
        }
    };

    const handleFetchedCloseImage = () => {
        setFetchedImage('')
        setFileType('')
    };


    useEffect(() => {
        if (!uploadedFiles && !pastedLink.trim()) {
            setFileType("");
        }
    }, [uploadedFiles, pastedLink]);


    useEffect(() => {
        if (id) {
            handleInsertNewsData(id)
        }
    }, []);


    const handleInsertNewsData = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.get(FindNews, {
                params: {
                    id: id,
                    academicYear: academicYear || '',
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSelectedNewsData(res.data)
            setHeading(res.data.headLine)
            setNewsStatus(res.data.status)
            setNewsContentHTML(res.data.news)
            setEditorSeed(res.data.news || "")
            if (res.data.scheduleOn) {
                console.log("scheduleOn", "true")
                const parsedDate = dayjs(res.data.scheduleOn, "DD-MM-YYYY hh:mm A");
                if (parsedDate.isValid()) {
                    setDTValue(parsedDate);
                    const formattedDate = parsedDate.format("DD-MM-YYYY HH:mm");
                    setDateTimeValue(formattedDate);
                } else {
                    setDTValue(null);
                    setDateTimeValue(null);
                }
            } else {
                setDTValue(null);
                setDateTimeValue(null);
            }
            if (res.data.filetype === "image") {
                setFetchedImage(res.data.filepath);
                setFileType("existing");
            } else if (res.data.filetype === "link") {
                setForActiveTab(res.data.filetype)
                setPastedLink(res.data.filepath);
                console.log("link printed", res.data.filepath);
                setFileType("link");
            } else {
                setFileType("empty");
            }
        } catch (error) {
            console.error('Error deleting news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (forActiveTab === "link") {
            console.log("Tab changed to link");
            setActiveTab(1);
        } else {
            setActiveTab(0);
        }
    }, [forActiveTab]);


    const handleUpdate = async (status) => {
        setIsSubmitted(true);

        if (!heading.trim()) {
            setMessage("Headline is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!newsContentHTML || !newsContentHTML.trim()) {
            setMessage("Description is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {
            const sendData = new FormData();
            sendData.append("id", id);
            sendData.append("rollNumber", rollNumber);
            sendData.append("headLine", heading);
            sendData.append("news", newsContentHTML);
            sendData.append("file", uploadedFiles[0] || '');
            sendData.append("fileType", fileType || "empty");
            sendData.append("userType", userType);
            sendData.append("link", pastedLink || '');
            sendData.append("scheduleOn", formattedDTValue || dateTimeValue || "");
            sendData.append("updatedOn", todayDateTime || "");
            sendData.append("academicYear", academicYear || "");

            const res = await axios.put(updateNews, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            if (canPublishNews) {
                if (status === "post") {
                    setMessage("News updated successfully");
                } else if (status === "schedule") {
                    setMessage("News scheduled successfully");
                } else {
                    setMessage("Draft saved successfully");
                }
            }

            if (!canPublishNews) {
                if (status === "draft") {
                    setMessage("Draft saved successfully");
                } else {
                    setMessage("Update requested successfully");
                }
            }
            setTimeout(() => {
                navigate('/dashboardmenu/news')
            }, 1000);
            console.log("Response:", res.data);
        } catch (error) {
            console.error("Error while inserting news data:", error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            {isLoading && <Loader />}
            <Box sx={{
                position: "fixed",
                zIndex: 100,
                backgroundColor: "#f2f2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #ddd",
                width: "100%",
                py: 1.5,
                px: 2,
                marginTop: "-2px"
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit News</Typography>
                </Box>

                <Tooltip title={approvalNote} placement="bottom-end">
                    <Chip
                        size="small"
                        icon={canPublishNews
                            ? <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />
                            : <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={canPublishNews ? "Updates instantly" : "Needs approval"}
                        sx={{
                            mr: 4,
                            display: { xs: "none", sm: "inline-flex" },
                            fontSize: "12px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            border: canPublishNews ? "1px solid #CBE3B4" : "1px solid #FFD9A0",
                            backgroundColor: canPublishNews ? "#F1F8E9" : "#FFF7E6",
                            color: canPublishNews ? "#4E7A2E" : "#B36A00",
                            "& .MuiChip-icon": { color: "inherit" },
                        }}
                    />
                </Tooltip>
            </Box>
            <Grid container >
                <Grid
                    mt={2}
                    p={2}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 6
                    }}>
                    <Box sx={{
                        border: "1px solid #E6E8EC",
                        backgroundColor: "#fff",
                        p: 2,
                        borderRadius: "12px",
                        mt: 4.5,
                        maxHeight: "75.6vh",
                        overflow: "hidden auto",
                        "& *": { maxWidth: "100%" },
                    }}>
                        <Box sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.2,
                            p: 1.5,
                            mb: 2.5,
                            borderRadius: "10px",
                            border: canPublishNews ? "1px solid #DCEDC8" : "1px solid #FFE3B0",
                            backgroundColor: canPublishNews ? "#F5FAF0" : "#FFFAF0",
                        }}>
                            {canPublishNews
                                ? <VerifiedOutlinedIcon sx={{ fontSize: 18, color: "#4E7A2E", mt: "1px" }} />
                                : <AccountTreeOutlinedIcon sx={{ fontSize: 18, color: "#B36A00", mt: "1px" }} />}
                            <Box>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: canPublishNews ? "#4E7A2E" : "#B36A00" }}>
                                    {canPublishNews ? "You can update directly" : "Approval needed before this update goes live"}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#5B6472", mt: 0.2 }}>
                                    {approvalNote}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography sx={fieldLabelSx}>Headline <span style={requiredSx}>*</span></Typography>
                        <TextField
                            id="outlined-size-small"
                            size="small"
                            fullWidth
                            value={heading}
                            placeholder="A short, clear headline"
                            sx={{ backgroundColor: "#fff" }}
                            onChange={handleHeadingChange}
                        />
                        {isSubmitted && !heading.trim() && (
                            <Typography sx={{ color: "#f44336", fontSize: "12px", mt: 0.5 }}>
                                This field is required
                            </Typography>
                        )}
                        <Typography sx={{ fontSize: "11px", mt: 0.5, textAlign: "right", color: heading.length >= 100 ? "#f44336" : "#8A93A0" }}>
                            {`${heading.length}/100`}
                        </Typography>


                        <Typography sx={{ ...fieldLabelSx, pt: 2 }}>Description <span style={requiredSx}>*</span></Typography>
                        <SimpleTextEditor
                            value={editorSeed}
                            onContentChange={handleRichTextChange}
                            onLiveChange={handleRichTextChange}
                        />
                        {isSubmitted && !newsContentHTML.trim() && (
                            <Typography sx={{ color: "#f44336", fontSize: "12px", mt: 0.5 }}>
                                This field is required
                            </Typography>
                        )}
                        <Box
                            sx={{
                                width: "100%",
                                backgroundColor: "#FAFBFC",
                                border: "1px solid #EDEFF3",
                                borderRadius: "10px",
                                p: 1.5,
                                mt: 3
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    sx={{
                                        minHeight: "34px",
                                        "& .MuiTab-root": { textTransform: "none", minHeight: "34px", py: 0, fontSize: "13px", fontWeight: 600, color: "#6B7280" },
                                        "& .Mui-selected": { color: "#111827 !important" },
                                        "& .MuiTabs-indicator": { backgroundColor: websiteSettings.mainColor, height: "3px", borderRadius: "3px" },
                                    }}
                                >
                                    <Tab label="Select Image" />
                                    <Tab label="Add Link" />
                                </Tabs>
                                <Typography sx={{ fontSize: "12px", color: "#8A93A0" }}>
                                    Add either an image or a link — not both.
                                </Typography>
                            </Box>

                            {activeTab === 0 && (
                                <Box sx={{ mt: 2, textAlign: "center" }}>
                                    <Box
                                        {...getRootProps()}
                                        sx={{
                                            border: isDragActive ? "2px dashed #1976d2" : "2px dashed #C7D6EA",
                                            borderRadius: "10px",
                                            p: 1.5,
                                            backgroundColor: isDragActive ? "#E3F2FD" : "#F6F9FD",
                                            textAlign: "center",
                                            cursor: "pointer",
                                            transition: "0.2s",
                                            "&:hover": { borderColor: "#1976d2", backgroundColor: "#EDF4FC" },
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
                                                    src={uploadedFiles[0] instanceof File
                                                        ? URL.createObjectURL(uploadedFiles[0])
                                                        : uploadedFiles
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

                                                        top: -15,
                                                        right: -15,
                                                    }}
                                                    onClick={() => setUploadedFiles([])}
                                                >
                                                    <CancelIcon style={{ backgroundColor: "#777", color: "#fff", borderRadius: "30px" }} />
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

                            {activeTab === 1 && (
                                <Box sx={{ mt: 2 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Paste your link here"
                                        sx={{ backgroundColor: "#fff" }}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <InsertLinkIcon sx={{ color: "text.secondary" }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        value={pastedLink}
                                        onChange={handleLinkUpload}
                                        error={!!error}
                                        helperText={error}
                                    />
                                    <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                                        Paste a YouTube link here.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        {newsStatus === "schedule" &&
                            <Box mt={3}>
                                <Typography sx={fieldLabelSx}>Scheduled for</Typography>
                                <ThemeProvider theme={theme}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Stack spacing={2} >
                                        <DateTimePicker
                                                value={DTValue ? dayjs(DTValue) : null}
                                                onChange={handleDateChange}
                                                disablePast
                                                enableAccessibleFieldDOMStructure={false}
                                                slots={{ textField: TextField }}
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        sx: {
                                                            backgroundColor: "#fff",
                                                            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                                                                borderColor: "#000",
                                                            },
                                                            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                                            {
                                                                borderColor: "#000",
                                                            },
                                                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                                            {
                                                                borderColor: "#000",
                                                            },
                                                            "& .MuiInputBase-input": { color: "#000" },
                                                            "& .MuiInputLabel-root": { color: "#000" },
                                                        },
                                                    },
                                                }}
                                            />
                                        </Stack>
                                    </LocalizationProvider>
                                </ThemeProvider>
                            </Box>
                        }

                        <Divider sx={{ mt: 3 }} />
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                            }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<CloseOutlinedIcon sx={{ fontSize: 16 }} />}
                                    sx={ghostButtonSx}
                                    onClick={handleCancelClick}>
                                    Cancel
                                </Button>

                                <Tooltip title={approvalNote} placement="top">
                                    <Button
                                        startIcon={primaryAction.icon}
                                        sx={primaryButtonSx}
                                        onClick={() => handleUpdate(primaryAction.status)}>
                                        {primaryAction.label}
                                    </Button>
                                </Tooltip>
                            </Box>

                            <Dialog
                                open={openAlert}
                                onClose={() => setOpenAlert(false)}
                                slotProps={{ paper: { sx: { borderRadius: "14px", maxWidth: "420px" } } }}
                            >
                                <Box sx={{ p: 3, backgroundColor: '#fff', textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                                        Discard your changes?
                                    </Typography>
                                    <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.8 }}>
                                        This news will stay as it was before you started editing.
                                    </Typography>
                                    <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleCloseDialog(false)}
                                            sx={{ ...ghostButtonSx, px: 2.4 }}
                                        >
                                            Keep editing
                                        </Button>
                                        <Button
                                            onClick={() => handleCloseDialog(true)}
                                            sx={primaryButtonSx}
                                        >
                                            Discard
                                        </Button>
                                    </DialogActions>
                                </Box>
                            </Dialog>
                        </Box>

                    </Box>
                </Grid>


                <Grid
                    sx={{ py: 2, mt: 6.5, pr: 2 }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 6
                    }}>
                    <Box sx={{ border: "1px solid #E6E8EC", backgroundColor: "#fff", p: 2, borderRadius: "12px", height: "75.6vh", overflow: "hidden auto" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <ArticleOutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Live Preview</Typography>
                            </Box>
                            <Typography sx={{ fontSize: "11px", color: "#8A93A0" }}>Updates as you type</Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Box>
                            {!hasPreview && (
                                <Box sx={{
                                    height: "60vh",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                    textAlign: "center",
                                    color: "#9AA3AF",
                                }}>
                                    <VisibilityOutlinedIcon sx={{ fontSize: 34, color: "#C9CFD8" }} />
                                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>Nothing to preview yet</Typography>
                                    <Typography sx={{ fontSize: "12px", maxWidth: "260px" }}>
                                        Your edits show up here straight away as you make them.
                                    </Typography>
                                </Box>
                            )}

                            {heading && (
                                <Typography sx={{ fontWeight: "600", fontSize: "16px", wordBreak: "break-word" }}>
                                    {heading}
                                </Typography>
                            )}

                            {newsContentHTML && (
                                <Typography
                                    component="div"
                                    sx={{
                                        fontSize: "14px",
                                        pt: 1,
                                        wordBreak: "break-word",
                                        "& img": { maxWidth: "100%", height: "auto" },
                                        "& table": { maxWidth: "100%" },
                                    }}
                                    dangerouslySetInnerHTML={{ __html: newsContentHTML }}
                                />
                            )}

                            {!!imagePreviewUrl && (
                                <Box sx={{ pt: 1.5 }}>
                                    <img
                                        src={imagePreviewUrl}
                                        alt="News"
                                        style={{
                                            width: "273px",
                                            height: "210px",
                                            objectFit: "cover",
                                            maxWidth: "100%",
                                            borderRadius: "10px",
                                            border: "1px solid #E6E8EC",
                                        }}
                                    />
                                </Box>
                            )}

                            {!uploadedFiles.length && !!pastedLink && (
                                <Box sx={{ pt: 1.5 }}>
                                    {showLinkPreview ? (
                                        <Box sx={{ borderRadius: "10px", overflow: "hidden", width: "273px", maxWidth: "100%" }}>
                                            <ReactPlayer
                                                url={pastedLink}
                                                width='100%'
                                                height='210px'
                                                playing={false}
                                            />
                                        </Box>
                                    ) : (
                                        <Typography color="error" sx={{ fontSize: "13px" }}>
                                            Please provide a valid YouTube link.
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Grid>



            </Grid>
        </Box>
    );
}
