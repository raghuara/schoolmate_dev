import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, TextField, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Paper, createTheme, ThemeProvider, Stack, } from "@mui/material";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectWebsiteSettings } from "../../../Redux/Slices/websiteSettingsSlice";
import { FindStudyMaterial, GettingGrades, postHomeWork, postMessage, postNews, poststudyMaterial, postTimeTable, sectionsDropdown, TimeTableFetch, updateStudyMaterial } from "../../../Api/Api";
import SnackBar from "../../SnackBar";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from "@mui/icons-material/Cancel";
import { selectGrades } from "../../../Redux/Slices/DropdownController";
import { head } from "lodash";
import Loader from "../../Loader";



export default function EditStudyMaterialsPage() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
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
    const [folderName, setFolderName] = useState("");
    const websiteSettings = useSelector(selectWebsiteSettings);
    const [sectionError, setSectionError] = useState(false);
    const [fileError, setFileError] = useState(false);
    const [gradeError, setGradeError] = useState(false);
    const [DTValue, setDTValue] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [fileType, setFileType] = useState("");
    const [subjectOptions, setSubjectOptions] = useState(grades[0].subjects || []);
    const [heading, setHeading] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const location = useLocation();
    const { id } = location.state || {};

    const selectedGrade = grades.find(grade => grade.id === selectedGradeId);
    const sections = selectedGrade?.sections.map(section => ({ sectionName: section })) || [];

    const handleGradeChange = (newValue) => {
        if (newValue) {
            setSelectedGradeId(newValue?.id || null);
            setSelectedSection(null);
            setSubjectOptions(newValue.subjects);
            setGradeError(false);
        } else {
            setSelectedGradeId(null);
            setSelectedSection(null);
            setSubjectOptions([]);
            setSelectedSubject(null)
        }
    };
    const handleSectionChange = (event, newValue) => {
        setSelectedSection(newValue?.sectionName || null);
        setSectionError(false);
    };

    const handleSubjectChange = (event, newValue) => {
        setSelectedSubject(newValue?.sectionName || null);
    };
    const [previewData, setPreviewData] = useState({
        uploadedFiles: [],
        heading,
    });
    const handleHeadingChange = (e) => {
        const newValue = e.target.value;
        if (newValue.length <= 100) {
            setHeading(newValue);
        }
    };
    const handlePreview = () => {
        setPreviewData({
            uploadedFiles,
            heading
        });
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const validFormats = ['image/jpeg', 'image/webp', 'image/png', 'application/pdf'];

            const validFiles = acceptedFiles.filter(file => validFormats.includes(file.type));

            if (validFiles.length > 0) {
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

    useEffect(() => {
        if (id) {
            handleFetchData(id)
        }
    }, []);

    const handleFetchData = async (id) => {
        setIsLoading(true);
        try {
            const res = await axios.get(FindStudyMaterial, {
                params: {
                    Id: id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setHeading(res.data.heading)
            setSelectedSubject(res.data.subject)
            setSelectedGradeId(res.data.gradeId)
            setSelectedSection(res.data.section)
            setFolderName(res.data.folder)
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!heading || !selectedGradeId || !selectedSection || !selectedSubject || uploadedFiles.length === 0) {
            setMessage("Please fill in all the required fields.");
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
            sendData.append("Subject", selectedSubject);
            sendData.append("Heading", heading);
            sendData.append("FileType", fileType || "");
            sendData.append("File", uploadedFiles[0] || '');
            sendData.append("UpdatedOn", todayDateTime);
            sendData.append("Folder", folderName);

            const res = await axios.put(updateStudyMaterial, sendData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Updated successfully");
            setOpen(true);
            setColor(true);
            setStatus(true);

            setTimeout(() => {
                navigate("/dashboardmenu/studymaterials/main");
            }, 500);

        } catch (error) {
            setMessage("Fail to update.");
            setOpen(true);
            setColor(false);
            setStatus(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (userType !== "superadmin" && userType !== "admin" && userType !== "staff" && userType !== "teacher") {
        return <Navigate to="/dashboardmenu/studymaterials" replace />;
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
                borderBottom:"1px solid #ddd",
                width: "100%",
                px:2,
                py: 1.5,
                marginTop: "-2px"
            }}>
                <Link style={{ textDecoration: "none" }} to="/dashboardmenu/studymaterials">
                    <IconButton sx={{ width: "27px", height: "27px", marginTop: '2px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20, color: "#000" }} />
                    </IconButton>
                </Link>
                <Typography sx={{ fontWeight: "600", fontSize: "20px" }}>Edit Study Materials</Typography>
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
                    <Box sx={{border:"1px solid #E0E0E0",  backgroundColor: "#fbfbfb", py: 2, borderRadius: "7px", mt: 4.5, height: "75.6vh", overflowY: "auto", position: "relative" }}>
                        <Grid container spacing={2} sx={{ px: 2 }}>
                            {/* <Grid item xs={12} sm={12} md={6} lg={6}>
                                <Typography sx={{ mb: 0.5 }}>Select Class</Typography>
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
                                                    height: "33px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={6} lg={6}>
                                <Typography sx={{ mb: 0.5, ml: 1 }}>Select Section</Typography>
                                <Autocomplete
                                    disablePortal
                                    disabled
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
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6}>
                                <Typography sx={{ mb: 0.5, ml: 1 }}>Select Section<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                                <Autocomplete
                                    disablePortal
                                    options={subjectOptions.map((subject) => ({ sectionName: subject }))}
                                    getOptionLabel={(option) => option.sectionName}
                                    value={
                                        selectedSubject
                                            ? { sectionName: selectedSubject } 
                                            : null
                                    }
                                    onChange={handleSubjectChange}
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
                                                    height: "33px",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid> */}

                            <Grid
                                sx={{width:"100%"}}
                                size={{
                                    lg: 12
                                }}>
                                <Typography>Add Heading <span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
                                <TextField
                                sx={{backgroundColor:"#fff"}}
                                    id="outlined-size-small"
                                    size="small"
                                    fullWidth
                                    required
                                    value={heading}
                                    onChange={handleHeadingChange}
                                />
                                {isSubmitted && !heading.trim() && (
                                    <span style={{ color: "red", fontSize: "12px" }}>
                                        This field is required
                                    </span>
                                )}
                                <Typography sx={{ fontSize: "12px" }} color="textSecondary">
                                    {`${heading.length}/100`}
                                </Typography>

                            </Grid>
                            <Grid
                                size={{
                                    lg: 12
                                }}>
                                <Typography sx={{ mb: 0.5, }}>Select File<span style={{ color: "#777", fontSize: "13px" }}> (Required)</span></Typography>
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
                                             <Typography component="span" color="primary">Choose file</Typography>
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Supported Format: JPG, JPEG, WebP, PNG, PDF
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                                            Maximum Size: 25MB
                                        </Typography>
                                    </Box>
                                    {uploadedFiles.length > 0 ? (
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
                                    ):(
                                        <Box sx={{height:"110px"}}></Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 9, }}>
                            <Grid container spacing={2} sx={{pt:9, px: 2 }}>
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
                                    sx={{display:"flex", justifyContent:"end"}}
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
                                        onClick={() => handleSubmit()}>
                                        Update
                                    </Button>
                                </Grid>

                            </Grid>
                        </Box>

                    </Box>
                </Grid>

                <Grid
                    sx={{ py: 2, mt: 6.5, pr:2 }}
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 6,
                        lg: 6
                    }}>
                    <Box sx={{border:"1px solid #E0E0E0", backgroundColor: "#fbfbfb", p: 2, borderRadius: "6px", height: "75.6vh", overflowY: "auto" }}>
                        <Typography sx={{ fontSize: "14px", color: "rgba(0,0,0,0.7)" }}>Live Preview</Typography>
                        <hr style={{ border: "0.5px solid #CFCFCF" }} />
                        <Box>
                            {previewData.heading && (
                                <Typography sx={{ fontWeight: "600", fontSize: "16px" }}>
                                    {previewData.heading}
                                </Typography>
                            )}
                            <Grid container spacing={2} mt={2}>
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
