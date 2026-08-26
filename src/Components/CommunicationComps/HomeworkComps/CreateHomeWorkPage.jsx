import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Paper, createTheme, ThemeProvider, Stack, Popper, ClickAwayListener, MenuItem, Checkbox, Chip, Divider, Tooltip, } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUserTypeID } from "../../../Redux/Slices/AuthSlice";
import {
    APPROVAL_SUBMENUS, approvalRoleFor, selectApprovalMatrix,
} from "../../../Redux/Slices/approvalMatrixSlice";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { GettingGrades, postHomeWork, postMessage, postNews, postTimeTable, sectionsDropdown, TimeTableFetch } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from "@mui/icons-material/Cancel";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Loader from "../../Loader";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";



export default function CreateHomeWorkPage() {
    const navigate = useNavigate();
    const token = "123";
    const user = useSelector((state) => state.auth);
    const rollNumber = user.rollNumber
    const userType = user.userType
    const userName = user.name
    const todayDateTime = dayjs().format('DD-MM-YYYY HH:mm');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState('');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [color, setColor] = useState(false);
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const grades = useSelector(selectGrades);
    const [selectedGradeId, setSelectedGradeId] = useState(0);
    const [selectedSection, setSelectedSection] = useState(null);
    const websiteSettings = useSelector(selectWebsiteSettings);
    const academicYear = useSelector(selectAcademicYear);
    const [sectionError, setSectionError] = useState(false);
    const [fileError, setFileError] = useState(false);
    const [gradeError, setGradeError] = useState(false);
    const [DTValue, setDTValue] = useState(null);
    const [fileType, setFileType] = useState('');
    const [changesHappended, setChangesHappended] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [formattedDTValue, setFormattedDTValue] = useState(null);
    const [heading, setHeading] = useState("");
    const [selectedSections, setSelectedSections] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const ref = useRef();

    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map((s) => ({ sectionName: s })) || [];

    const isAllSelected =
        sections.length > 0 && selectedSections.length === sections.length;

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

    const handleGradeChange = (newValue) => {
        setChangesHappended(true)
        setSelectedGradeId(newValue?.id || null);
        setSelectedSections([]);
        setGradeError(false);
    };

    const handleHeadingChange = (e) => {
        setChangesHappended(true)
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    const handleToggleDropdown = () => {
        setAnchorEl(anchorEl ? null : ref.current);
    };

    const handleClickAway = () => {
        setAnchorEl(null);
    };

    const handleSectionToggle = (section) => {
        const name = section.sectionName;
        if (selectedSections.some((s) => s.sectionName === name)) {
            setSelectedSections((prev) =>
                prev.filter((s) => s.sectionName !== name)
            );
        } else {
            setSelectedSections((prev) => [...prev, section]);
        }
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedSections([]);
        } else {
            setSelectedSections([...sections]);
        }
    };

    const renderSelected = () => {
        if (selectedSections.length === 0) return "";
        return selectedSections.map((s) => s.sectionName).join(", ");
    };


    const handleSectionChange = (event, newValue) => {
        setChangesHappended(true)
        setSelectedSection(newValue?.sectionName || null);
        setSectionError(false);
    };
    // Whether this user posts straight to live or raises a request is decided by
    // the approval flow configured in Access Control, not by their user type.
    const approvalMatrix = useSelector(selectApprovalMatrix);
    const userTypeID = useSelector(selectUserTypeID);
    const approval = useMemo(
        () => approvalRoleFor(approvalMatrix, APPROVAL_SUBMENUS.HOMEWORK, userTypeID),
        [approvalMatrix, userTypeID],
    );
    const canPublishHomework = approval.canPublishDirect;

    // Names of the approvers this homework has to travel through, nearest one first.
    const approverNames = approval.chain.map(
        (lvl) => approval.flow?.["level" + lvl]?.userType || ("Level " + lvl),
    );
    const approvalNote = canPublishHomework
        ? (approval.required
            ? "You are the top level approver for Homework, so whatever you post goes out straight away."
            : "No approval flow is set for Homework yet, so whatever you post goes out straight away.")
        : (approverNames.length
            ? "This homework will be sent to " + approverNames.join(", then ") + " for approval before it goes out."
            : "This homework will be sent for approval before it goes out.");

    // One blob URL per selected file instead of a fresh one on every keystroke.
    const filePreviewUrl = useMemo(() => {
        const file = uploadedFiles[0];
        if (!file) return "";
        return file instanceof File ? URL.createObjectURL(file) : (file.url || file);
    }, [uploadedFiles]);

    useEffect(() => {
        if (!filePreviewUrl.startsWith("blob:")) return undefined;
        return () => URL.revokeObjectURL(filePreviewUrl);
    }, [filePreviewUrl]);

    const isPdfUpload = (uploadedFiles[0]?.type || "").includes("pdf");

    const primaryAction = canPublishHomework
        ? (DTValue
            ? { label: "Schedule Homework", status: "schedule", icon: <ScheduleSendOutlinedIcon sx={{ fontSize: 17 }} /> }
            : { label: "Publish Now", status: "post", icon: <PublishOutlinedIcon sx={{ fontSize: 17 }} /> })
        : { label: "Send for Approval", status: DTValue ? "schedule" : "post", icon: <SendOutlinedIcon sx={{ fontSize: 17 }} /> };

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
    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/homework')
        }
    };
    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/homework')
        }

    };
    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/homework')
        }

    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const validFormats = ['image/jpeg', 'image/webp', 'image/png', 'application/pdf'];

            const validFiles = acceptedFiles.filter(file => validFormats.includes(file.type));

            if (validFiles.length > 0) {
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

    const handleImageClose = () => {
        setUploadedFiles([]);
        setFileError(false);
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

    const handleSubmit = async (status) => {

        if (!selectedGradeId) {
            setMessage("Please select a grade.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        if (!selectedSections || selectedSections.length === 0) {
            setMessage("Please select at least one section.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        if (uploadedFiles.length === 0) {
            setMessage("Please upload a file ");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {
            const sendData = new FormData();
            sendData.append("gradeId", selectedGradeId);
            sendData.append("userType", userType);
            sendData.append("rollNumber", rollNumber);
            sendData.append("headLine", heading);
            sendData.append("fileType", fileType);
            sendData.append("file", uploadedFiles[0] || '');
            sendData.append("status", status);
            sendData.append("postedOn", status === 'post' ? todayDateTime : "");
            sendData.append("draftedOn", status === 'draft' ? todayDateTime : "");
            sendData.append("scheduleOn", formattedDTValue || "");

            selectedSections.forEach((section, index) => {
                sendData.append(`Section[${index}]`, section.sectionName);
            });

            sendData.append("academicYear", academicYear || "");

            const res = await axios.post(postHomeWork, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOpen(true);
            setColor(true);
            setStatus(true);

            if (canPublishHomework) {
                if (status === "post") {
                    setMessage("Homework created successfully");
                } else if (status === "schedule") {
                    setMessage("Homework scheduled successfully");
                } else {
                    setMessage("saved successfully");
                }
            }

            if (!canPublishHomework) {
                setMessage("Requested successfully");
            }

            setSelectedGradeId(null)
            setSelectedSections([]);
            setUploadedFiles([]);
            setHeading("")
            setDTValue(null)
            setChangesHappended(false)
        } catch (error) {
            setMessage("An error occurred while creating homework.");
            setOpen(true);
            setColor(false);
            setStatus(false);
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
                width: "100%",
                py: 1.5,
                borderBottom: "1px solid #ddd",
                px: 2,
                justifyContent: "space-between",
                marginTop: "-2px"
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Homework</Typography>
                </Box>

                <Tooltip title={approvalNote} placement="bottom-end">
                    <Chip
                        size="small"
                        icon={canPublishHomework
                            ? <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />
                            : <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={canPublishHomework ? "Publishes instantly" : "Needs approval"}
                        sx={{
                            mr: 4,
                            display: { xs: "none", sm: "inline-flex" },
                            fontSize: "12px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            border: canPublishHomework ? "1px solid #CBE3B4" : "1px solid #FFD9A0",
                            backgroundColor: canPublishHomework ? "#F1F8E9" : "#FFF7E6",
                            color: canPublishHomework ? "#4E7A2E" : "#B36A00",
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
                    <Box sx={{ border: "1px solid #E0E0E0", backgroundColor: "#fbfbfb", py: 2, borderRadius: "7px", mt: 4.5, height: "75.6vh", overflowY: "auto", position: "relative" }}>
                        <Grid container spacing={2} sx={{ px: 2 }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Typography sx={fieldLabelSx}>Class <span style={requiredSx}>*</span></Typography>
                                <Autocomplete
                                    disablePortal
                                    options={grades}
                                    getOptionLabel={(option) => option.sign}
                                    value={grades.find((item) => item.id === selectedGradeId) || null}
                                    onChange={(event, newValue) => {
                                        handleGradeChange(newValue);
                                    }}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    sx={{ width: "100%" }}
                                    PaperComponent={(props) => (
                                        <Paper
                                            {...props}
                                            style={{
                                                ...props.style,
                                                maxHeight: "150px",
                                                backgroundColor: "#000",
                                                color: "#fff",
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} className="classdropdownOptions">
                                            {option.sign}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    paddingRight: 0,
                                                    height: "33px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                    backgroundColor: "#fff",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Typography sx={fieldLabelSx}>Sections <span style={requiredSx}>*</span></Typography>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        ref={ref}
                                        onClick={handleToggleDropdown}
                                        sx={{
                                            width: "100%",
                                            justifyContent: "flex-start",
                                            textTransform: "none",
                                            overflow: "hidden",
                                            color: "#000",
                                            border: "1px solid #ccc",
                                            height: "33px",
                                            textAlign: "left",
                                            backgroundColor: "#fff",
                                        }}
                                        disabled={sections.length === 0}
                                    >
                                        <Box
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                width: "100%",
                                            }}
                                        >
                                            {renderSelected()}
                                        </Box>
                                    </Button>

                                    <Popper
                                        open={Boolean(anchorEl)}
                                        anchorEl={ref.current}
                                        placement="bottom-start"
                                        style={{
                                            zIndex: 1300,
                                            width: ref.current?.offsetWidth,
                                        }}
                                    >
                                        <ClickAwayListener onClickAway={handleClickAway}>
                                            <Paper
                                                sx={{
                                                    maxHeight: 300,
                                                    overflowY: "auto",
                                                    bgcolor: "#000",
                                                    color: "#fff",
                                                    p: 1,
                                                }}
                                            >
                                                <MenuItem
                                                    onClick={handleSelectAll}
                                                    sx={{ padding: "0px" }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            backgroundColor: "#111",
                                                            borderRadius: "3px",
                                                            boxShadow: "none",
                                                            width: "100%",
                                                            px: 1
                                                        }}
                                                    >
                                                        <Checkbox
                                                            checked={isAllSelected}
                                                            indeterminate={
                                                                selectedSections.length > 0 &&
                                                                selectedSections.length < sections.length
                                                            }
                                                            sx={{
                                                                color: "#fff",
                                                                "&.Mui-checked": { color: "#fff" },
                                                            }}
                                                        />
                                                        <Typography sx={{ fontSize: "14px" }}>
                                                            Everyone
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>

                                                {sections.map((section) => (
                                                    <MenuItem
                                                        key={section.sectionName}
                                                        sx={{
                                                            padding: "0px 10px 0px 10px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            color: "#fff",
                                                        }}
                                                        onClick={() => handleSectionToggle(section)}
                                                    >
                                                        <Checkbox
                                                            checked={selectedSections.some(
                                                                (s) => s.sectionName === section.sectionName
                                                            )}
                                                            sx={{
                                                                color: "#fff",
                                                                "&.Mui-checked": { color: "#fff" },
                                                            }}
                                                        />
                                                        <Typography>{section.sectionName}</Typography>
                                                    </MenuItem>
                                                ))}
                                            </Paper>
                                        </ClickAwayListener>
                                    </Popper>
                                </Box>

                            </Grid>

                            <Grid
                                size={{
                                    lg: 12
                                }}>

                                <Typography sx={{ ...fieldLabelSx, mt: 2 }}>Heading <span style={requiredSx}>*</span></Typography>
                                <TextField
                                    id="outlined-size-small"
                                    size="small"
                                    fullWidth
                                    value={heading}
                                    sx={{ backgroundColor: "#fff", }}
                                    onChange={handleHeadingChange}
                                />
                            </Grid>
                            <Grid
                                size={{
                                    lg: 12
                                }}>
                                <Typography sx={{ ...fieldLabelSx, mt: 2 }}>Attachment <span style={{ color: "#8A93A0", fontWeight: 400, fontSize: "12px" }}>(optional)</span></Typography>
                                <Box sx={{ mt: 1, textAlign: "center" }}>
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
                                                        src={filePreviewUrl}
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
                                </Box>
                            </Grid>
                            <Grid
                                sx={{ width: "100%" }}
                                size={{
                                    lg: 12
                                }}>
                                <Typography sx={{ ...fieldLabelSx, mt: 2 }}>Schedule for later <span style={{ color: "#8A93A0", fontWeight: 400, fontSize: "12px" }}>(optional)</span></Typography>
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
                            </Grid>

                        </Grid>

                        <Dialog open={openAlert} onClose={() => setOpenAlert(false)}>
                            <Box sx={{ display: "flex", justifyContent: "center", p: 2, backgroundColor: '#fff', }}>

                                <Box sx={{
                                    textAlign: 'center',
                                    backgroundColor: '#fff',
                                    p: 3,
                                    width: "70%",
                                }}>

                                    <Typography sx={{ fontSize: "20px" }}> Do you really want to cancel? Your changes might not be saved.</Typography>
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
                                            No
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
                                            Yes
                                        </Button>
                                    </DialogActions>
                                </Box>

                            </Box>
                        </Dialog>
                        <Divider sx={{ mt: 3 }} />
                        <Box sx={{ mt: 2, px: 2, pb: 1 }}>
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
                                        onClick={() => handleSubmit(primaryAction.status)}>
                                        {primaryAction.label}
                                    </Button>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid
                    sx={{ py: 2, pr: 2, mt: 6.5 }}
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
                            {!heading.trim() && !filePreviewUrl ? (
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
                                        Add a headline or attach the homework and it will show up here straight away.
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    {heading && (
                                        <Typography sx={{ fontWeight: "600", fontSize: "16px", wordBreak: "break-word" }}>
                                            {heading}
                                        </Typography>
                                    )}

                                    {!!filePreviewUrl && (
                                        <Box sx={{ pt: 1.5 }}>
                                            {isPdfUpload ? (
                                                <iframe
                                                    src={filePreviewUrl}
                                                    width="100%"
                                                    height="400px"
                                                    title="Homework PDF"
                                                    style={{ border: "1px solid #E6E8EC", borderRadius: "10px" }}
                                                ></iframe>
                                            ) : (
                                                <img
                                                    src={filePreviewUrl}
                                                    alt="Homework"
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
                            )}
                        </Box>
                    </Box>
                </Grid>



            </Grid>
        </Box>
    );
}
