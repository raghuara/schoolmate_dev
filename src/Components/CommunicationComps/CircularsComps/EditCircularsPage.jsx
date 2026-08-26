import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Switch, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, createTheme, ThemeProvider, Autocomplete, Paper, FormControl, Select, OutlinedInput, MenuItem, Checkbox, Chip, Divider, Tooltip } from "@mui/material";
import RichTextEditor from "../../TextEditor";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUserTypeID } from "../../../Redux/Slices/AuthSlice";
import {
    APPROVAL_SUBMENUS, approvalRoleFor, selectApprovalMatrix,
} from "../../../Redux/Slices/approvalMatrixSlice";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import ReactPlayer from "react-player";
import { FindCircular, GettingGrades, postCircular, postNews, updateCircular } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import CancelIcon from "@mui/icons-material/Cancel";
import SimpleTextEditor from "../../EditTextEditor";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

export default function EditNewsPage() {
    const navigate = useNavigate()
    const token = "123"
    const [heading, setHeading] = useState("");
    const [newsContentHTML, setNewsContentHTML] = useState("");
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const todayDateTime = dayjs().format('DD-MM-YYYY HH:mm');
    const [activeTab, setActiveTab] = useState(0);
    const [pasteLinkToggle, setPasteLinkToggle] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [pastedLink, setPastedLink] = useState("");
    const [DTValue, setDTValue] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState('');
    const [fileType, setFileType] = useState('');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState("Everyone");
    const [classData, setClassData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [gradeIds, setGradeIds] = useState('');
    const [formattedDTValue, setFormattedDTValue] = useState(null);
    const [selectedCircularData, setSelectedCircularData] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [fetchedImage, setFetchedImage] = useState('');
    const [fetchedFile, setFetchedFile] = useState('');
    const [fetchedFileName, setFetchedFileName] = useState('');
    const [changesHappended, setChangesHappended] = useState(false);
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [newsStatus, setNewsStatus] = useState("");
    const [dateTimeValue, setDateTimeValue] = useState("");
    const [isEveryone, setIsEveryone] = useState("");
    const [isStudents, setIsStudents] = useState("");
    const [isStaffs, setIsStaffs] = useState("");
    const [isSpecific, setIsSpecific] = useState("");
    const [selectedStaffs, setSelectedStaffs] = useState("");
    const [specificUsers, setSpecificUsers] = useState("");

    // What we push INTO the editor. Set once when the circular loads; typing must
    // not change it, or Jodit resets the caret to the top of the box on every key.
    const [editorSeed, setEditorSeed] = useState("");

    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);

    // Whether this user's edit goes out or turns into a request is decided by the
    // approval flow configured in Access Control, not by their user type.
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const userTypeID = useSelector(selectUserTypeID);
    const approval = approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.CIRCULAR, userTypeID);
    const canPublishCircular = approval.canPublishDirect;

    // Names of the approvers this update has to travel through, nearest one first.
    const approverNames = approval.chain.map(
        (lvl) => approval.flow?.["level" + lvl]?.userType || ("Level " + lvl),
    );
    const approvalNote = canPublishCircular
        ? (approval.required
            ? "You are the top level approver for Circulars, so your changes go out straight away."
            : "No approval flow is set for Circulars yet, so your changes go out straight away.")
        : (approverNames.length
            ? "This update will be sent to " + approverNames.join(", then ") + " for approval before it goes out."
            : "This update will be sent for approval before it goes out.");

    // A newly picked file wins over the file already saved against this circular.
    const imagePreviewUrl = useMemo(() => {
        const file = uploadedFiles[0];
        if (file) return file instanceof File ? URL.createObjectURL(file) : (file.url || file);
        return fetchedImage || "";
    }, [uploadedFiles, fetchedImage]);

    useEffect(() => {
        if (!imagePreviewUrl.startsWith("blob:")) return undefined;
        return () => URL.revokeObjectURL(imagePreviewUrl);
    }, [imagePreviewUrl]);

    const isPdfPreview = uploadedFiles[0]
        ? (uploadedFiles[0].type || "").includes("pdf")
        : fetchedFile === "pdf";

    const primaryAction = canPublishCircular
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

    const location = useLocation();
    const { id } = location.state || {};

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

    const handleChange = (event) => {
        setChangesHappended(true)
        const {
            target: { value },
        } = event;

        const updatedSelectedIds = typeof value === 'string' ? value.split(',') : value;

        const gradeIds = updatedSelectedIds.join(',');
        setGradeIds(gradeIds)
        console.log('Grade IDs:', gradeIds,);

        setSelectedIds(updatedSelectedIds);

    };



    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const validFormats = ['image/jpeg', 'image/webp', 'image/png', 'application/pdf'];

            const validFiles = acceptedFiles.filter(file => validFormats.includes(file.type));

            if (validFiles.length > 0) {
                setPastedLink("");
                setChangesHappended(true)
                const file = validFiles[0];
                setUploadedFiles([file]);
                setFileType(file.type.includes('pdf') ? 'pdf' : 'image');
            } else {
                alert("Only JPEG, WebP, PNG or PDF files are allowed.");
            }
        }
    };
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ".jpg, .jpeg, .webp, .png, .pdf"
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

    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/circulars')
        }

    };

    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/circulars')
        }

    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/circulars')
            console.log('Cancel confirmed');
        }
    };


    const handleFetchedCloseImage = () => {
        setFetchedImage('')
        setFileType('')
    };

    const handleImageClose = () => {
        setUploadedFiles([]);
        setFileType('')
    };

    const handleDateChange = (newDTValue) => {
        setChangesHappended(true)
        if (newDTValue) {
            const formattedDateTime = newDTValue.format('DD-MM-YYYY HH:mm');
            setDTValue(newDTValue);
            setFormattedDTValue(formattedDateTime);
            console.log("setDTValue", formattedDateTime)
        } else {
            setDTValue(null);
        }
    };

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
            const res = await axios.get(FindCircular, {
                params: {
                    id: id,
                    academicYear: academicYear || '',
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSelectedCircularData(res.data)
            setHeading(res.data.headLine)
            setNewsStatus(res.data.status)
            setIsEveryone(res.data.everyone)
            setIsStudents(res.data.students)
            setIsStaffs(res.data.staffs)
            setIsSpecific(res.data.specific)
            setSelectedStaffs(res.data.staffUserTypes)
            setSpecificUsers(res.data.specificUsers)
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
            setNewsContentHTML(res.data.circular)
            setEditorSeed(res.data.circular || "")
            setFetchedFileName(res.data.filename)
            if (res.data.filetype === "image") {
                setFetchedImage(res.data.filepath);
                setFetchedFile("image")
                setFileType("existing");
            } else if (res.data.filetype === "pdf") {
                setFetchedImage(res.data.filepath);
                setFetchedFile("pdf")
                setFileType("existing");
            } else {
                setFileType("empty");
            }

            setSelectedGrade(res.data.grade)
            const transformedGradeDetails = res.data.gradeDetails.flatMap(item =>
                item.sections.map(section => `${item.gradeId}-${section}`)
            );
            setSelectedIds(transformedGradeDetails);
        } catch (error) {
            console.error('Error deleting news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getGradeSectionsPayload = () => {
        const gradeMap = new Map();

        selectedIds.forEach(id => {
            const [gradeIdStr, section] = id.split("-");
            const gradeId = parseInt(gradeIdStr);

            if (!gradeMap.has(gradeId)) {
                gradeMap.set(gradeId, []);
            }

            gradeMap.get(gradeId).push(section);
        });

        const gradeSections = Array.from(gradeMap.entries()).map(([gradeId, sections]) => ({
            gradeId,
            sections
        }));

        return { gradeSections };
    };

    const gradeSections = getGradeSectionsPayload();
    console.log(gradeSections);

    const handleUpdate = async (status) => {

        setIsSubmitted(true);

        if (!heading.trim()) {
            setMessage("Headline is required");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!newsContentHTML.trim()) {
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
            sendData.append("userType", userType);
            sendData.append("headLine", heading);
            sendData.append("circular", newsContentHTML);
            sendData.append("file", uploadedFiles[0] || '');
            sendData.append("fileType", fileType);
            sendData.append("scheduleOn", formattedDTValue || dateTimeValue || "");
            sendData.append("updatedOn", todayDateTime || "");
            sendData.append("everyone", isEveryone || "");
            sendData.append("students", isStudents || "");
            sendData.append("staffs", isStaffs || "");
            sendData.append("specific", isSpecific || "");

            const { gradeSections } = getGradeSectionsPayload();
            gradeSections.forEach((item, index) => {
                sendData.append(`CircularGradeSections[${index}].GradeId`, item.gradeId);
                item.sections.forEach((section, sIndex) => {
                    sendData.append(`CircularGradeSections[${index}].Sections[${sIndex}]`, section);
                });
            });

            if (selectedStaffs.length > 0) {
                selectedStaffs.forEach((type, index) => {
                    sendData.append(`StaffUserTypes[${index}]`, type);
                });
            }

            if (specificUsers.length > 0) {
                specificUsers.forEach((userId, index) => {
                    sendData.append(`SpecificUsers[${index}]`, userId);
                });
            }

            sendData.append("academicYear", academicYear || "");

            const res = await axios.put(updateCircular, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);
            setMessage("Circular updated successfully");
            setTimeout(() => {
                navigate('/dashboardmenu/circulars')
            }, 500);
            console.log("Response:", res.data);
        } catch (error) {
            console.error("Error while inserting circular data:", error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box sx={{ width: "100%" }}>
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{
                position: "fixed",
                zIndex: 100,
                backgroundColor: "#f2f2f2",
                borderBottom: "1px solid #ddd",
                px: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                py: 1.5,
                marginTop: "-2px"
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit Circulars</Typography>
                </Box>

                <Tooltip title={approvalNote} placement="bottom-end">
                    <Chip
                        size="small"
                        icon={canPublishCircular
                            ? <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />
                            : <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={canPublishCircular ? "Updates instantly" : "Needs approval"}
                        sx={{
                            mr: 4,
                            display: { xs: "none", sm: "inline-flex" },
                            fontSize: "12px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            border: canPublishCircular ? "1px solid #CBE3B4" : "1px solid #FFD9A0",
                            backgroundColor: canPublishCircular ? "#F1F8E9" : "#FFF7E6",
                            color: canPublishCircular ? "#4E7A2E" : "#B36A00",
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
                    }}>
                        <Box sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.2,
                            p: 1.5,
                            mb: 2.5,
                            borderRadius: "10px",
                            border: canPublishCircular ? "1px solid #DCEDC8" : "1px solid #FFE3B0",
                            backgroundColor: canPublishCircular ? "#F5FAF0" : "#FFFAF0",
                        }}>
                            {canPublishCircular
                                ? <VerifiedOutlinedIcon sx={{ fontSize: 18, color: "#4E7A2E", mt: "1px" }} />
                                : <AccountTreeOutlinedIcon sx={{ fontSize: 18, color: "#B36A00", mt: "1px" }} />}
                            <Box>
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: canPublishCircular ? "#4E7A2E" : "#B36A00" }}>
                                    {canPublishCircular ? "You can update directly" : "Approval needed before this update goes out"}
                                </Typography>
                                <Typography sx={{ fontSize: "12px", color: "#5B6472", mt: 0.2 }}>
                                    {approvalNote}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography sx={fieldLabelSx}>Headline <span style={requiredSx}>*</span></Typography>
                        <TextField
                            sx={{ backgroundColor: "#fff" }}
                            id="outlined-size-small"
                            size="small"
                            fullWidth
                            required
                            placeholder="A short, clear headline"
                            value={heading}
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
                                backgroundColor: "#fdfdfd",
                            }}
                        >
                            <Typography sx={{ pt: 2 }}>Select Image</Typography>

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
                                    <input {...getInputProps()} accept=".jpg, .jpeg, .webp, .png, .pdf" />
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
                                        {fileType === 'image' ? (
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
                                        ) : (<Typography variant="body2" color="textSecondary">
                                            Selected: {uploadedFiles[0].name}
                                        </Typography>)}
                                    </Box>
                                )}
                                {(fetchedImage && fetchedFile === "image") && (
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
                                {(fetchedImage && fetchedFile === "pdf") && (
                                    <Typography sx={{ mt: 2 }} variant="body2" color="textSecondary">
                                        Selected : {fetchedFileName}
                                    </Typography>

                                )}


                            </Box>
                        </Box>
                        {newsStatus === "schedule" &&
                            <Box mt={2}>
                                <Typography>Schedule Post</Typography>
                                <ThemeProvider theme={theme}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Stack spacing={2}>
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
                                        This circular will stay as it was before you started editing.
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
                            {!heading.trim() && !newsContentHTML.trim() && !imagePreviewUrl && (
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
                                    {isPdfPreview ? (
                                        <iframe
                                            src={imagePreviewUrl}
                                            width="100%"
                                            height="400px"
                                            title="Circular PDF"
                                            style={{ border: "1px solid #E6E8EC", borderRadius: "10px" }}
                                        ></iframe>
                                    ) : (
                                        <img
                                            src={imagePreviewUrl}
                                            alt="Circular"
                                            style={{
                                                width: "273px",
                                                height: "210px",
                                                objectFit: "cover",
                                                maxWidth: "100%",
                                                borderRadius: "10px",
                                                border: "1px solid #E6E8EC",
                                            }}
                                        />
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
