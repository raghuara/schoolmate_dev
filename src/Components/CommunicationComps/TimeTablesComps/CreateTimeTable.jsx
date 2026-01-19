import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Paper, } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { GettingGrades, postMessage, postNews, postTimeTable, sectionsDropdown, TimeTableFetch } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from "@mui/icons-material/Cancel";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import Loader from "../../Loader";

export default function CreateTimeTablesPage() {
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
    const [sectionError, setSectionError] = useState(false);
    const [fileError, setFileError] = useState(false);
    const [gradeError, setGradeError] = useState(false);
    const [changesHappended, setChangesHappended] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);

    const selectedGrade = grades.find(grade => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map(section => ({ sectionName: section })) || [];

    const handleGradeChange = (newValue) => {
        setChangesHappended(true)
        setSelectedGradeId(newValue?.id || null);
        setSelectedSection(null);
        setGradeError(false);
    };

    const handleSectionChange = (event, newValue) => {
        setChangesHappended(true)
        setSelectedSection(newValue?.sectionName || null);
        setSectionError(false);
    };
    const [previewData, setPreviewData] = useState({
        uploadedFiles: [],
    });

    const handlePreview = () => {
        setPreviewData({
            uploadedFiles,
        });
    };

    const handleBackClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/timetables')
        }

    };
    const handleCancelClick = () => {
        if (changesHappended) {
            setOpenAlert(true);
        } else {
            navigate('/dashboardmenu/timetables')
        }

    };

    const handleCloseDialog = (confirmed) => {
        setOpenAlert(false);

        if (confirmed) {
            navigate('/dashboardmenu/timetables')
        }
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const validFormats = ['image/jpeg', 'image/webp', 'image/png'];

            const validFiles = acceptedFiles.filter(file => validFormats.includes(file.type));

            if (validFiles.length > 0) {
                setChangesHappended(true)
                setUploadedFiles([validFiles[0]]);
            } else {
                alert("Only JPEG, WebP, or PNG files are allowed.");
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ".jpg, .jpeg, .webp, .png"
    });

    const handleImageClose = () => {
        setUploadedFiles([]);
        setFileError(false);
    };

    const handleInsertMessageData = async (status) => {

        if (!selectedGradeId) {
            setGradeError(true);
        }
        if (!selectedSection) {
            setSectionError(true);
        }
        if (uploadedFiles.length === 0) {
            setFileError(true);
        }

        if (!selectedGradeId || !selectedSection || uploadedFiles.length === 0) {
            setMessage("Please fill in all the required fields.");
            setOpen(true);
            setColor(false);
            setStatus(false);
            return;
        }

        setIsLoading(true);

        try {

            const sendData = new FormData();
            sendData.append("GradeId", selectedGradeId);
            sendData.append("Section", selectedSection);
            sendData.append("UserType", userType);
            sendData.append("RollNumber", rollNumber);
            sendData.append("FileType", "image");
            sendData.append("File", uploadedFiles[0] || '');
            sendData.append("Status", status);
            sendData.append("PostedOn", todayDateTime);
            sendData.append("DraftedOn", status === 'draft' ? todayDateTime : "");

            const res = await axios.post(postTimeTable, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Time table created successfully");
            setOpen(true);
            setColor(true);
            setStatus(true);
            setSelectedGradeId(null)
            setSelectedSection(null)
            setUploadedFiles([]);
            setPreviewData({
                uploadedFiles: [],
            });
        } catch (error) {
            console.error("Error while inserting news data:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("An error occurred while creating the timetable.");
            }
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff") {
        return <Navigate to="/dashboardmenu/timetables" replace />;
    }

    return (
        <Box sx={{ width: "100%" }}>
            {isLoading && <Loader />}
            <SnackBar open={open} color={color} setOpen={setOpen} status={status} message={message} />
            <Box sx={{
                position: "fixed",
                zIndex: 100,
                backgroundColor: "#f2f2f2",
                display: "flex",
                alignItems: "center",
                width: "100%",
                borderBottom:"1px solid #ddd",
                px:2,
                py: 1.5,
                marginTop: "-2px"
            }}>
                <IconButton onClick={handleBackClick} sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                </IconButton>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Create Time Tables</Typography>
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
                                <Typography sx={{ mb: 0.5 }}>Select Class</Typography>
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
                                                    backgroundColor:"#fff",
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
                                <Typography sx={{ mb: 0.5, ml: 1 }}>Select Section</Typography>
                                <Autocomplete
                                    disablePortal
                                    disabled={!selectedGrade}
                                    options={sections}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={
                                        sections.find((option) => option.sectionName === selectedSection) ||
                                        null
                                    }
                                    onChange={handleSectionChange}
                                    isOptionEqualToValue={(option, value) =>
                                        option.sectionName === value.sectionName
                                    }
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
                                            {option.sectionName}
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
                                                    backgroundColor:"#fff",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid
                                size={{
                                    lg: 12
                                }}>
                                <Typography sx={{ mb: 0.5, mt: 3, }}>Upload Image</Typography>
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
                            </Grid>
                        </Grid>


                        <Box sx={{ mt: 3, width:"100%" }}>
                            <Grid container spacing={2} sx={{ position: "absolute", bottom: "10px", px: 2, width:"100%"  }}>
                                <Grid
                                    size={{
                                        xs: 6,
                                        sm: 6,
                                        md: 6,
                                        lg: 5
                                    }}>

                                </Grid>

                                <Grid
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
                                <Grid
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
                                            width: "100%",
                                            borderRadius: '30px',
                                            fontSize: '12px',
                                            py: 0.2,
                                            color: websiteSettings.textColor,
                                            fontWeight: "600",
                                        }}
                                        onClick={() => handleInsertMessageData('post')}>
                                        Publish
                                    </Button>
                                </Grid>

                            </Grid>
                        </Box>

                    </Box>
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
                <Grid
                    sx={{ py: 2, mt: 6.5 }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 6
                    }}>
                    <Box sx={{ border: "1px solid #E0E0E0", backgroundColor: "#fbfbfb", p: 2, borderRadius: "6px", height: "75.6vh", overflowY: "auto" }}>
                        <Typography sx={{ fontSize: "14px", color: "rgba(0,0,0,0.7)" }}>Preview Screen</Typography>
                        <hr style={{ border: "0.5px solid #CFCFCF" }} />
                        <Box>
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
                                        <img
                                            src={URL.createObjectURL(file)}
                                            width={'273px'}
                                            height={'210px'}
                                            alt={`Uploaded file ${index + 1}`}
                                        />
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
