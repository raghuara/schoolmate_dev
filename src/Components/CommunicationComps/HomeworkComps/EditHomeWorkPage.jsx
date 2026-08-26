import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, TextField, Typography, Button, Divider, IconButton, Dialog, DialogActions, Autocomplete, Paper, ThemeProvider, createTheme, } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { selectAcademicYear } from "../../../Redux/Slices/academicYearSlice";
import { FindHomeWork, updateHomeWork } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from "@mui/icons-material/Cancel";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Stack } from "react-bootstrap";
import Loader from "../../Loader";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendOutlined";

export default function EditHomeWorkPage() {
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
    const [DTValue, setDTValue] = useState(null);
    const [changesHappended, setChangesHappended] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const location = useLocation();
    const { id } = location.state || {};
    const [formattedDTValue, setFormattedDTValue] = useState(null);
    const selectedGrade = grades.find(grade => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map(section => ({ sectionName: section })) || [];
    const [fileType, setFileType] = useState('');
    const [dateTimeValue, setDateTimeValue] = useState("");
    const [newsStatus, setNewsStatus] = useState("");
    const [heading, setHeading] = useState("");
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
        setSelectedGradeId(newValue?.id || null);
        setSelectedSection(null);
    };

    const handleHeadingChange = (e) => {
        setChangesHappended(true)
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };

    // One blob URL per selected file instead of a fresh one on every render.
    const filePreviewUrl = useMemo(() => {
        const file = uploadedFiles[0];
        if (!file) return "";
        return file instanceof File ? URL.createObjectURL(file) : (file.url || file);
    }, [uploadedFiles]);

    useEffect(() => {
        if (!filePreviewUrl.startsWith("blob:")) return undefined;
        return () => URL.revokeObjectURL(filePreviewUrl);
    }, [filePreviewUrl]);

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

    const handleDateChange = (newDTValue) => {
        setChangesHappended(true)
        if (newDTValue) {
            const formattedDateTime = newDTValue.format('DD-MM-YYYY HH:mm');
            setDTValue(newDTValue);
            setFormattedDTValue(formattedDateTime);
            console.log("setDTValue", formattedDateTime);
        } else {
            setDTValue(null);
        }
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
    };

    useEffect(() => {
        if (id) {
            handleInsertData(id)
        }
    }, []);

    const handleInsertData = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.get(FindHomeWork, {
                params: {
                    id: id,
                    academicYear: academicYear || "",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setHeading(res.data.headLine)
            setSelectedSection(res.data.section)
            setSelectedGradeId(res.data.gradeId)
            setNewsStatus(res.data.status)
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
        } catch (error) {
            console.error('Error deleting news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (status) => {

        if (uploadedFiles.length === 0) {
            setMessage("Please upload a file before updating.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }
        setIsLoading(true);

        try {
            const sendData = new FormData();
            sendData.append("id", id);
            sendData.append("userType", userType);
            sendData.append("rollNumber", rollNumber);
            sendData.append("headLine", heading);
            sendData.append("fileType", fileType);
            sendData.append("file", uploadedFiles[0] || '');
            sendData.append("status", status);
            sendData.append("postedOn", status === 'post' ? todayDateTime : "");
            sendData.append("updatedOn", todayDateTime);
            sendData.append("scheduleOn", formattedDTValue || dateTimeValue || "");

            sendData.append("academicYear", academicYear || "");

            const res = await axios.put(updateHomeWork, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Home work updated successfully");
            setOpen(true);
            setColor(true);
            setStatus(true);

            setTimeout(() => {
                navigate("/dashboardmenu/homework");
            }, 500);
        } catch (error) {
            console.error("Error while updating homework:", error);
            setMessage("An error occurred while updating the homework.");
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
                borderBottom: "1px solid #ddd",
                width: "100%",
                py: 1.5,
                px: 2,
                marginTop: "-2px"
            }}>
                <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit Homework</Typography>
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
                    <Box sx={{ border: "1px solid #E6E8EC", backgroundColor: "#fff", py: 2, borderRadius: "12px", mt: 4.5, maxHeight: "75.6vh", overflow: "hidden auto" }}>
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
                                    disabled
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
                                                    height: "40px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                    backgroundColor: "#fff"
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
                                <Typography sx={fieldLabelSx}>Section <span style={requiredSx}>*</span></Typography>
                                <TextField
                                    sx={{ backgroundColor: "#fff" }}
                                    id="outlined-size-small"
                                    size="small"
                                    fullWidth
                                    required
                                    value={selectedSection}
                                    disabled
                                />
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
                                <Typography sx={{ ...fieldLabelSx, mt: 3 }}>Attachment <span style={{ color: "#8A93A0", fontWeight: 400, fontSize: "12px" }}>(optional)</span></Typography>
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
                            {newsStatus === "schedule" &&
                                <Grid
                                    sx={{ width: "100%" }}
                                    size={{
                                        lg: 12
                                    }}>
                                    <Typography sx={{ ...fieldLabelSx, mt: 2 }}>Scheduled for</Typography>
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
                                </Grid>
                            }
                        </Grid>
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
                                    The edits you made to this homework have not been saved yet and will be lost.
                                </Typography>
                                <DialogActions sx={{ justifyContent: 'center', backgroundColor: '#fff', pt: 2.5, gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleCloseDialog(false)}
                                        sx={{ ...ghostButtonSx, px: 2.4 }}
                                    >
                                        Keep editing
                                    </Button>
                                    <Button onClick={() => handleCloseDialog(true)} sx={primaryButtonSx}>
                                        Discard
                                    </Button>
                                </DialogActions>
                            </Box>
                        </Dialog>
                        <Divider sx={{ mt: 3, mx: 2 }} />
                        <Box sx={{
                            mt: 2,
                            px: 2,
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
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </Button>
                            <Button
                                startIcon={DTValue
                                    ? <ScheduleSendOutlinedIcon sx={{ fontSize: 16 }} />
                                    : <PublishOutlinedIcon sx={{ fontSize: 17 }} />}
                                sx={primaryButtonSx}
                                onClick={() => handleUpdate(DTValue ? 'schedule' : 'post')}
                            >
                                {DTValue ? 'Schedule' : 'Update'}
                            </Button>
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
                                <VisibilityOutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Live Preview</Typography>
                            </Box>
                            <Typography sx={{ fontSize: "11px", color: "#8A93A0" }}>Updates as you type</Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        {!heading && !filePreviewUrl ? (
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
                                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>
                                    Nothing to preview yet
                                </Typography>
                                <Typography sx={{ fontSize: "12px", maxWidth: "260px" }}>
                                    Start typing the heading or pick an attachment and it will show up here straight away.
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {heading && (
                                    <Typography sx={{ fontWeight: "600", fontSize: "16px", wordBreak: "break-word" }}>
                                        {heading}
                                    </Typography>
                                )}

                                {filePreviewUrl && fileType === "image" && (
                                    <Box sx={{ pt: 1.5 }}>
                                        <img
                                            src={filePreviewUrl}
                                            alt="Homework attachment"
                                            style={{
                                                width: "273px",
                                                height: "210px",
                                                objectFit: "cover",
                                                maxWidth: "100%",
                                                borderRadius: "10px",
                                                border: "1px solid #E6E8EC",
                                                display: "block",
                                            }}
                                        />
                                    </Box>
                                )}

                                {filePreviewUrl && fileType === "pdf" && (
                                    <Box sx={{
                                        pt: 1.5,
                                        height: 420,
                                        border: "1px solid #E6E8EC",
                                        borderRadius: "10px",
                                        overflow: "hidden",
                                    }}>
                                        <iframe
                                            src={filePreviewUrl}
                                            title="Homework PDF"
                                            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </Grid>



            </Grid>
        </Box>
    );
}
