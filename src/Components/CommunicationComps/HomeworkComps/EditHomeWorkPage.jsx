import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Paper, ThemeProvider, createTheme, } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { FindHomeWork, updateHomeWork } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from "@mui/icons-material/Cancel";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Stack } from "react-bootstrap";
import Loader from "../../Loader";

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

    const [previewData, setPreviewData] = useState({
        heading: '',
        uploadedFiles: [],
    });

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

    const handlePreview = () => {
        setPreviewData({
            heading,
            uploadedFiles,
        });
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
                    Id: id
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
            sendData.append("Id", id);
            sendData.append("UserType", userType);
            sendData.append("RollNumber", rollNumber);
            sendData.append("HeadLine", heading);
            sendData.append("FileType", fileType);
            sendData.append("File", uploadedFiles[0] || '');
            sendData.append("Status", status);
            sendData.append("PostedOn", status === 'post' ? todayDateTime : "");
            sendData.append("UpdatedOn", todayDateTime);
            sendData.append("ScheduleOn", formattedDTValue || dateTimeValue || "");

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
                    <Box sx={{ border: "1px solid #E0E0E0", backgroundColor: "#fbfbfb", py: 2, borderRadius: "7px", mt: 4.5, height: "75.6vh", overflowY: "auto", position: "relative" }}>
                        <Grid container spacing={2} sx={{ px: 2 }}>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 12,
                                    md: 6,
                                    lg: 6
                                }}>
                                <Typography sx={{ mb: 0.5 }}>Select class</Typography>
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
                                <Typography sx={{ mb: 0.5, ml: 1 }}>Select Class</Typography>
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
                                <Typography sx={{ mt: 2 }}>Add Heading</Typography>
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
                                <Typography sx={{ mb: 0.5, mt: 3, }}>Select Image</Typography>
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
                                </Box>
                            </Grid>
                            {newsStatus === "schedule" &&
                                <Grid
                                    sx={{ width: "100%" }}
                                    size={{
                                        lg: 12
                                    }}>
                                    <Typography sx={{ mt: 2 }}>Schedule</Typography>
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
                        <Box sx={{ mt: 17, }}>
                            <Grid container spacing={2} sx={{ px: 2 }}>
                                <Grid
                                    size={{
                                        xs: 6,
                                        sm: 6,
                                        md: 6,
                                        lg: 5
                                    }}>
                                </Grid>
                                <Grid
                                    sx={{ display: "flex", justifyContent: "end" }}
                                    size={{
                                        xs: 6,
                                        sm: 6,
                                        md: 6,
                                        lg: 2.3
                                    }}>
                                    <Button
                                        sx={{
                                            textTransform: 'none',
                                            width: "100%",
                                            borderRadius: '30px',
                                            fontSize: '12px',
                                            py: 0.2,
                                            color: 'black',
                                            fontWeight: "600",
                                        }}
                                        onClick={handlePreview}>
                                        Preview
                                    </Button>
                                </Grid>
                                <Grid
                                    sx={{ display: "flex", justifyContent: "end" }}
                                    size={{
                                        xs: 6,
                                        sm: 6,
                                        md: 6,
                                        lg: 2.3
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
                                {!DTValue && (
                                    <Grid
                                        sx={{ display: "flex", justifyContent: "end" }}
                                        size={{
                                            xs: 6,
                                            sm: 6,
                                            md: 6,
                                            lg: 2.4
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
                                            onClick={() => handleUpdate('post')}>
                                            Update
                                        </Button>
                                    </Grid>
                                )}
                                {DTValue && (
                                    <Grid
                                        sx={{ display: "flex", justifyContent: "end" }}
                                        size={{
                                            xs: 6,
                                            sm: 6,
                                            md: 6,
                                            lg: 2.4
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
                                            onClick={() => handleUpdate('schedule')}>
                                            Schedule
                                        </Button>
                                    </Grid>
                                )}

                            </Grid>
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
                    <Box sx={{ border: "1px solid #E0E0E0", backgroundColor: "#fbfbfb", p: 2, borderRadius: "6px", height: "75.6vh", overflowY: "auto" }}>
                        <Typography sx={{ fontSize: "14px", color: "rgba(0,0,0,0.7)" }}>Live Preview</Typography>
                        <hr style={{ border: "0.5px solid #CFCFCF" }} />
                        <Box>
                        {previewData.heading && (
                                <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                    {previewData.heading}
                                </Typography>
                            )}
                            <Grid container spacing={2}>
                                {previewData.uploadedFiles.map((file, index) => (
                                    <Grid
                                        key={index}
                                        sx={{ display: "flex", py: 1 }}
                                        size={{
                                            xs: 12,
                                            sm: 12,
                                            md: 5,
                                            lg: 12
                                        }}>
                                        {fileType === "image" ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                width={'273px'}
                                                height={'210px'}
                                                alt={`Uploaded file ${index + 1}`}
                                            />
                                        ) : fileType === "pdf" ? (
                                            <iframe
                                                src={URL.createObjectURL(file)}
                                                width="400px"
                                                height="400px"
                                                title={`Uploaded PDF ${index + 1}`}
                                            ></iframe>

                                        ) : null}
                                    </Grid>
                                ))}
                            </Grid>

                        </Box>
                    </Box>
                </Grid>



            </Grid>
        </Box>
    );
}
